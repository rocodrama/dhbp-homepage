import { useState } from 'react'
import { addDoc, collection, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../../context/AuthContext'
import Modal from '../../components/Modal'
import './calendar.css'

export default function DayModal({ dateStr, events, onClose }) {
  const { user, profile, isAdmin } = useAuth()
  const [title, setTitle] = useState('')
  const [time, setTime] = useState('')
  const [endDate, setEndDate] = useState(dateStr)
  const [saving, setSaving] = useState(false)

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    const finalEndDate = endDate && endDate >= dateStr ? endDate : dateStr
    setSaving(true)
    await addDoc(collection(db, 'events'), {
      title: title.trim(),
      startDate: dateStr,
      endDate: finalEndDate,
      time: time || null,
      authorId: user.uid,
      authorName: profile?.displayName ?? '익명',
      createdAt: serverTimestamp(),
    })
    setTitle('')
    setTime('')
    setEndDate(dateStr)
    setSaving(false)
  }

  const handleDelete = async (ev) => {
    if (!confirm(`"${ev.title}" 일정을 삭제할까요?`)) return
    await deleteDoc(doc(db, 'events', ev.id))
  }

  return (
    <Modal onClose={onClose}>
      <h2 className="section-title">{dateStr}</h2>

      {events.length === 0 ? (
        <p style={{ color: 'var(--color-text-gray)', fontSize: 13 }}>등록된 일정이 없어요.</p>
      ) : (
        <div>
          {events.map((ev) => (
            <div className="event-row" key={ev.id}>
              <span>
                {ev.time && <strong>{ev.time} · </strong>}
                {ev.title}
                {ev.endDate && ev.endDate !== ev.startDate && (
                  <span style={{ color: 'var(--color-text-gray)' }}> ({ev.startDate} ~ {ev.endDate})</span>
                )}{' '}
                <span style={{ color: 'var(--color-text-gray)' }}>({ev.authorName})</span>
              </span>
              {(ev.authorId === user.uid || isAdmin) && (
                <button className="btn-secondary" onClick={() => handleDelete(ev)}>
                  삭제
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <form className="modal-form" onSubmit={handleAdd}>
        <label>새 일정 제목</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        <label>종료일 (하루짜리면 그대로 두기)</label>
        <input
          type="date"
          value={endDate}
          min={dateStr}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <label>시간 (선택)</label>
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? '추가 중...' : '일정 추가'}
          </button>
          <button type="button" className="btn-secondary" onClick={onClose}>
            닫기
          </button>
        </div>
      </form>
    </Modal>
  )
}
