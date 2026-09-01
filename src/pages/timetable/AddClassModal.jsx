import { useState } from 'react'
import Modal from '../../components/Modal'
import { DAYS, TIME_SLOTS } from './constants'
import './timetable.css'

export default function AddClassModal({ initialDay, initialSlot, onSave, onClose }) {
  const [name, setName] = useState('')
  const [label, setLabel] = useState('')
  const [day, setDay] = useState(initialDay)
  const [startSlot, setStartSlot] = useState(initialSlot)
  const [endSlot, setEndSlot] = useState(initialSlot)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    const startIdx = TIME_SLOTS.indexOf(startSlot)
    const endIdx = TIME_SLOTS.indexOf(endSlot)
    const [from, to] = startIdx <= endIdx ? [startIdx, endIdx] : [endIdx, startIdx]
    const slots = TIME_SLOTS.slice(from, to + 1)
    onSave(name.trim(), day, slots, label.trim())
    onClose()
  }

  return (
    <Modal onClose={onClose}>
      <form className="modal-form" onSubmit={handleSubmit}>
        <label>이름</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required autoFocus />

        <label>수업명 또는 메모 (선택)</label>
        <input value={label} onChange={(e) => setLabel(e.target.value)} />

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
