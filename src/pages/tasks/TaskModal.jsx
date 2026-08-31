import { useState } from 'react'
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../../context/AuthContext'
import NameInput from '../game/NameInput'
import Modal from '../../components/Modal'
import './tasks.css'

export default function TaskModal({ task, onClose }) {
  const { user, profile, isAdmin } = useAuth()
  const isCreate = !task
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [assignees, setAssignees] = useState([])
  const [saving, setSaving] = useState(false)

  const canDelete = !isCreate && (task.createdBy === user.uid || isAdmin)

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!title.trim() || assignees.length === 0) return
    setSaving(true)
    await addDoc(collection(db, 'tasks'), {
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDate || null,
      assignees,
      completions: {},
      createdBy: user.uid,
      createdByName: profile?.displayName ?? '익명',
      createdAt: serverTimestamp(),
    })
    setSaving(false)
    onClose()
  }

  const toggle = (name, checked) => {
    updateDoc(doc(db, 'tasks', task.id), { [`completions.${name}`]: checked })
  }

  const handleDelete = async () => {
    if (!confirm('이 미션을 삭제할까요?')) return
    await deleteDoc(doc(db, 'tasks', task.id))
    onClose()
  }

  if (isCreate) {
    return (
      <Modal onClose={onClose}>
        <form className="modal-form" onSubmit={handleCreate}>
          <label>미션명</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
          <label>설명 (선택)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            style={{ resize: 'vertical' }}
          />
          <label>마감일 (선택)</label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />

          <label>배정 인원 (이름을 직접 입력해서 추가, 가입 여부 무관)</label>
          <NameInput names={assignees} setNames={setAssignees} placeholder="이름 입력 후 추가" />

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={saving || !title.trim() || assignees.length === 0}>
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
  const doneCount = task.assignees.filter((a) => completions[a]).length

  return (
    <Modal onClose={onClose}>
      <div className="detail-header">
        <div>
          <h2 className="detail-title">{task.title}</h2>
          <div className="detail-meta">
            {doneCount}/{task.assignees.length}명 완료
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
        {task.assignees.map((a) => {
          const done = !!completions[a]
          return (
            <label className={'checklist-row' + (done ? ' done' : '')} key={a}>
              <input type="checkbox" checked={done} onChange={(e) => toggle(a, e.target.checked)} />
              {a}
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
