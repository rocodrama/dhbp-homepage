import { useState } from 'react'
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../../context/AuthContext'
import NameInput from '../game/NameInput'
import Modal from '../../components/Modal'
import './tasks.css'

function ItemBuilder({ onAdd }) {
  const [label, setLabel] = useState('')
  const [assignees, setAssignees] = useState([])

  const add = (e) => {
    e.preventDefault()
    if (!label.trim() || assignees.length === 0) return
    onAdd({ id: crypto.randomUUID(), label: label.trim(), assignees, completions: {} })
    setLabel('')
    setAssignees([])
  }

  return (
    <form className="item-builder" onSubmit={add}>
      <label>항목 이름</label>
      <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="예: 발표자료 준비" />
      <label>담당자 (이름을 직접 입력해서 추가, 가입 여부 무관)</label>
      <NameInput names={assignees} setNames={setAssignees} placeholder="이름 입력 후 추가" />
      <button type="submit" className="btn-secondary" disabled={!label.trim() || assignees.length === 0}>
        + 항목 추가
      </button>
    </form>
  )
}

export default function TaskModal({ task, onClose }) {
  const { user, profile, isAdmin } = useAuth()
  const isCreate = !task
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [draftItems, setDraftItems] = useState([])
  const [saving, setSaving] = useState(false)

  const canDelete = !isCreate && (task.createdBy === user.uid || isAdmin)

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!title.trim() || draftItems.length === 0) return
    setSaving(true)
    await addDoc(collection(db, 'tasks'), {
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDate || null,
      items: draftItems,
      createdBy: user.uid,
      createdByName: profile?.displayName ?? '익명',
      createdAt: serverTimestamp(),
    })
    setSaving(false)
    onClose()
  }

  const saveItems = (nextItems) => updateDoc(doc(db, 'tasks', task.id), { items: nextItems })

  const toggle = (itemId, assignee, checked) => {
    const nextItems = (task.items || []).map((it) =>
      it.id === itemId ? { ...it, completions: { ...it.completions, [assignee]: checked } } : it
    )
    saveItems(nextItems)
  }

  const addItemToExisting = (item) => saveItems([...(task.items || []), item])

  const removeItem = (itemId) => {
    if (!confirm('이 항목을 삭제할까요?')) return
    saveItems((task.items || []).filter((it) => it.id !== itemId))
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

          <label>항목</label>
          <ItemBuilder onAdd={(item) => setDraftItems((prev) => [...prev, item])} />
          {draftItems.length > 0 && (
            <div className="item-draft-list">
              {draftItems.map((it) => (
                <div className="item-draft-row" key={it.id}>
                  <span>
                    <strong>{it.label}</strong> — {it.assignees.join(', ')}
                  </span>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setDraftItems((prev) => prev.filter((p) => p.id !== it.id))}
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={saving || draftItems.length === 0}>
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

  return (
    <Modal onClose={onClose}>
      <div className="detail-header">
        <div>
          <h2 className="detail-title">{task.title}</h2>
          <div className="detail-meta">
            {task.dueDate && `마감 ${task.dueDate} · `}
            {task.createdByName}
          </div>
        </div>
        {canDelete && (
          <button className="btn-danger" onClick={handleDelete}>
            삭제
          </button>
        )}
      </div>
      {task.description && <p className="task-desc">{task.description}</p>}

      {(task.items || []).map((item) => {
        const doneCount = item.assignees.filter((a) => item.completions?.[a]).length
        return (
          <div className="task-item" key={item.id}>
            <div className="task-item-header">
              <strong>{item.label}</strong>
              <span className="task-progress">
                {doneCount}/{item.assignees.length}명 완료
              </span>
              {canDelete && (
                <button type="button" className="task-item-remove" onClick={() => removeItem(item.id)}>
                  ×
                </button>
              )}
            </div>
            {item.assignees.map((a) => {
              const done = !!item.completions?.[a]
              return (
                <label className={'checklist-row' + (done ? ' done' : '')} key={a}>
                  <input
                    type="checkbox"
                    checked={done}
                    onChange={(e) => toggle(item.id, a, e.target.checked)}
                  />
                  {a}
                </label>
              )
            })}
          </div>
        )
      })}

      <div className="task-add-item">
        <ItemBuilder onAdd={addItemToExisting} />
      </div>

      <div className="form-actions">
        <button className="btn-secondary" onClick={onClose}>
          닫기
        </button>
      </div>
    </Modal>
  )
}
