import { useEffect, useState } from 'react'
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../../context/AuthContext'
import { STATUSES, STATUS_COLOR } from './constants'
import './complaints.css'

export default function ComplaintsPage() {
  const { user, profile, isAdmin } = useAuth()
  const [content, setContent] = useState('')
  const [anonymous, setAnonymous] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [complaints, setComplaints] = useState([])

  useEffect(() => {
    const q = query(collection(db, 'complaints'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setComplaints(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) return
    setSubmitting(true)
    await addDoc(collection(db, 'complaints'), {
      content: content.trim(),
      isAnonymous: anonymous,
      status: '접수',
      authorId: user.uid,
      authorName: profile?.displayName ?? '익명',
      createdAt: serverTimestamp(),
    })
    setContent('')
    setSubmitting(false)
  }

  const changeStatus = async (c, status) => {
    await updateDoc(doc(db, 'complaints', c.id), { status })
  }

  return (
    <div>
      <form className="complaint-form" onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="랩실 생활 중 불편한 점, 건의사항을 자유롭게 적어주세요"
          required
        />
        <div className="complaint-form-footer">
          <label className="anon-check">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
            />
            익명으로 제출
          </label>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? '제출 중...' : '제출하기'}
          </button>
        </div>
      </form>

      {complaints.length === 0 ? (
        <div className="empty-state">
          <img src="/images/mascot.png" alt="" />
          <p>접수된 민원이 없어요.</p>
        </div>
      ) : (
        <div className="item-list">
          {complaints.map((c) => (
            <div className="complaint-row" key={c.id}>
              <div>
                <div className="complaint-content">{c.content}</div>
                <div className="complaint-meta">
                  {c.isAnonymous ? '익명' : c.authorName}
                </div>
              </div>
              {isAdmin ? (
                <select
                  className="status-select"
                  value={c.status}
                  onChange={(e) => changeStatus(c, e.target.value)}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              ) : (
                <span
                  className="status-badge"
                  style={{
                    background: STATUS_COLOR[c.status] + '22',
                    color: STATUS_COLOR[c.status],
                  }}
                >
                  {c.status}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
