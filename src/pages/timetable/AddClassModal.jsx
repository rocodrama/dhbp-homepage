import { useState } from 'react'
import Modal from '../../components/Modal'
import { TIME_SLOTS } from './constants'
import './timetable.css'

const DAYS = ['월', '화', '수', '목', '금']

export default function AddClassModal({ initialDay, initialSlot, approvedUsers, defaultUid, onSave, onClose }) {
  const [targetUid, setTargetUid] = useState(defaultUid)
  const [day, setDay] = useState(initialDay)
  const [startSlot, setStartSlot] = useState(initialSlot)
  const [endSlot, setEndSlot] = useState(initialSlot)
  const [courseName, setCourseName] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!courseName.trim()) return
    const startIdx = TIME_SLOTS.indexOf(startSlot)
    const endIdx = TIME_SLOTS.indexOf(endSlot)
    const [from, to] = startIdx <= endIdx ? [startIdx, endIdx] : [endIdx, startIdx]
    const slots = TIME_SLOTS.slice(from, to + 1)
    onSave(targetUid, day, slots, courseName.trim())
    onClose()
  }

  return (
    <Modal onClose={onClose}>
      <form className="modal-form" onSubmit={handleSubmit}>
        <label>이름</label>
        <select value={targetUid} onChange={(e) => setTargetUid(e.target.value)}>
          {approvedUsers.map((u) => (
            <option key={u.id} value={u.id}>
              {u.displayName}
            </option>
          ))}
        </select>

        <label>요일</label>
        <select value={day} onChange={(e) => setDay(e.target.value)}>
          {DAYS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <label>시작 시간</label>
        <select value={startSlot} onChange={(e) => setStartSlot(e.target.value)}>
          {TIME_SLOTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <label>종료 시간</label>
        <select value={endSlot} onChange={(e) => setEndSlot(e.target.value)}>
          {TIME_SLOTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <label>수업명</label>
        <input value={courseName} onChange={(e) => setCourseName(e.target.value)} required autoFocus />

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            저장
          </button>
          <button type="button" className="btn-secondary" onClick={onClose}>
            취소
          </button>
        </div>
      </form>
    </Modal>
  )
}
