import { useRef, useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import Modal from '../../components/Modal'
import { DAYS, TIME_SLOTS, colorForName } from './constants'
import './timetable.css'

const slotStart = (slot) => slot.split('-')[0]
const slotEnd = (slot) => slot.split('-')[1]

export default function PersonModal({ name, entries, focusId, onDelete, onClose }) {
  const focusRef = useRef(null)
  // entries는 부모가 매 렌더마다 다시 필터해서 넘긴다(실시간 반영).
  const [labels, setLabels] = useState(() =>
    Object.fromEntries(entries.map((e) => [e.id, e.label ?? '']))
  )
  const [saving, setSaving] = useState(false)

  // 클릭해서 들어온 블록의 입력칸에 자동 포커스 + 스크롤. 같은 이름이라도
  // id별로 시간대가 나뉘어 있어(예: 9-12시/12-16시/16-18시), 어떤 항목을
  // 눌러 들어왔는지 바로 알 수 있어야 한다.
  const focusInput = (el) => {
    if (el && focusId && !focusRef.current) {
      focusRef.current = el
      el.focus()
      el.scrollIntoView({ block: 'nearest' })
    }
  }

  const sorted = [...entries].sort(
    (a, b) =>
      DAYS.indexOf(a.day) - DAYS.indexOf(b.day) ||
      TIME_SLOTS.indexOf(a.slots[0]) - TIME_SLOTS.indexOf(b.slots[0])
  )
  const totalHours = entries.reduce((sum, e) => sum + e.slots.length, 0) / 2

  const handleSave = async () => {
    setSaving(true)
    // 바뀐 문서만 쓴다
    const changed = entries.filter((e) => (labels[e.id] ?? '') !== (e.label ?? ''))
    await Promise.all(
      changed.map((e) => updateDoc(doc(db, 'timetableEntries', e.id), { label: labels[e.id] }))
    )
    setSaving(false)
    onClose()
  }

  return (
    <Modal onClose={onClose}>
      <div className="detail-header">
        <h3 className="detail-title">
          <span className="tt-person-dot" style={{ background: colorForName(name) }} />
          {name}
        </h3>
      </div>
      <p className="detail-meta">
        주 {totalHours}시간 · 일정 {entries.length}개
      </p>

      {sorted.map((e) => (
        <div key={e.id} className={'tt-person-row' + (e.id === focusId ? ' focused' : '')}>
          <div className="tt-person-when">
            <b>{e.day}</b> {slotStart(e.slots[0])}-{slotEnd(e.slots[e.slots.length - 1])}
          </div>
          <input
            ref={e.id === focusId ? focusInput : undefined}
            value={labels[e.id] ?? ''}
            placeholder="수업명 또는 메모"
            onChange={(ev) => setLabels((prev) => ({ ...prev, [e.id]: ev.target.value }))}
          />
          <button type="button" className="tt-person-del" onClick={() => onDelete(e)}>
            ✕
          </button>
        </div>
      ))}

      <div className="form-actions">
        <button type="button" className="btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? '저장 중...' : '저장'}
        </button>
        <button type="button" className="btn-secondary" onClick={onClose}>
          닫기
        </button>
      </div>
    </Modal>
  )
}
