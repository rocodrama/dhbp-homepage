import { useState } from 'react'
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../../context/AuthContext'
import { useApprovedUsers } from '../equipment/useApprovedUsers'
import Modal from '../../components/Modal'
import './tasks.css'

export default function TaskModal({ task, onClose }) {
  const { user, profile, isAdmin } = useAuth()
  const approvedUsers = useApprovedUsers()
  const isCreate = !task
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [saving, setSaving] = useState(false)

  const canDelete = !isCreate && (task.createdBy === user.uid || isAdmin)

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    await addDoc(collection(db, 'tasks'), {
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDate || null,
      completions: {},
      createdBy: user.uid,
      createdByName: profile?.displayName ?? '익명',
      createdAt: serverTimestamp(),
    })
    setSaving(false)
    onClose()
  }

  const toggle = async (uid, checked) => {
    await updateDoc(doc(db, 'tasks', task.id), { [`completions.${uid}`]: checked })
  }

  const handleDelete = async () => {
    if (!confirm('이 체크리스트를 삭제할까요?')) return
    await deleteDoc(doc(db, 'tasks', task.id))
    onClose()
  }

  if (isCreate) {
    return (
      <Modal onClose={onClose}>
        <form className="modal-form" onSubmit={handleCreate}>
          <label>제목</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          <label>설명 (선택)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            style={{ resize: 'vertical' }}
          />
          <label>마감일 (선택)</label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? '저장 중...' : '만들기'}
            </button>
            <button type="button" className="btn-secondary" onClick={onClose}>
              취소
            </button>
          </div>
        </form>
      </Modal>
    )
  }

  const completions = task.completions || {}
  const doneCount = approvedUsers.filter((u) => completions[u.id]).length

  return (
    <Modal onClose={onClose}>
      <div className="detail-header">
        <div>
          <h2 className="detail-title">{task.title}</h2>
          <div className="detail-meta">
            {doneCount}/{approvedUsers.length}명 완료
            {task.dueDate && ` · 마감 ${task.dueDate}`} · {task.createdByName}
          </div>
        </div>
        {canDelete && (
          <button className="btn-danger" onClick={handleDelete}>
            삭제
          </button>
        )}
      </div>
      {task.description && <p className="task-desc">{task.description}</p>}

      <div>
        {approvedUsers.map((u) => {
          const done = !!completions[u.id]
          const canCheck = isAdmin || u.id === user.uid
          return (
            <label className={'checklist-row' + (done ? ' done' : '')} key={u.id}>
              <input
                type="checkbox"
                checked={done}
                disabled={!canCheck}
                onChange={(e) => toggle(u.id, e.target.checked)}
              />
              {u.displayName}
            </label>
          )
        })}
      </div>

      <div className="form-actions">
        <button className="btn-secondary" onClick={onClose}>
          닫기
        </button>
      </div>
    </Modal>
  )
}
