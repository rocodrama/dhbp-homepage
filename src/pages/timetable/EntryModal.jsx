import { useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import Modal from '../../components/Modal'
import { colorForName } from './constants'
import './timetable.css'

const slotStart = (slot) => slot.split('-')[0]
const slotEnd = (slot) => slot.split('-')[1]

// 클릭한 그 칸(id) 하나만 다룬다. 같은 이름이라도 시간대별로 문서 id가
// 다르므로(예: 정상엽 9-12시=id1, 12-16시=id2), 그 사람의 다른 일정까지
// 묶어 보여주면 지금 뭘 고치는지 헷갈린다.
export default function EntryModal({ entry, onDelete, onClose }) {
  const [label, setLabel] = useState(entry.label ?? '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (label === (entry.label ?? '')) return onClose()
    setSaving(true)
    await updateDoc(doc(db, 'timetableEntries', entry.id), { label })
    setSaving(false)
    onClose()
  }

  return (
    <Modal onClose={onClose}>
      <div className="detail-header">
        <h3 className="detail-title">
          <span className="tt-person-dot" style={{ background: colorForName(entry.name) }} />
          {entry.name}
        </h3>
      </div>
      <p className="detail-meta">
        {entry.day} {slotStart(entry.slots[0])}-{slotEnd(entry.slots[entry.slots.length - 1])}
      </p>

      <div className="modal-form">
        <label>수업명 또는 메모</label>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="수업명 또는 메모"
          autoFocus
        />
      </div>

      <div className="form-actions">
        <button type="button" className="btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? '저장 중...' : '저장'}
        </button>
        <button type="button" className="btn-secondary" onClick={onClose}>
          취소
        </button>
        <button type="button" className="btn-danger" onClick={() => onDelete(entry)}>
          삭제
        </button>
      </div>
    </Modal>
  )
}
