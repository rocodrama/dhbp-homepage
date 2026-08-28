import { useEffect, useState } from 'react'
import { collection, doc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../../context/AuthContext'
import './admin.css'

export default function UserManagement() {
  const { user, isAdmin } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [])

  if (!isAdmin) return <p>관리자만 접근할 수 있어요.</p>
  if (loading) return <p>불러오는 중...</p>

  const pending = users.filter((u) => u.status === 'pending')
  const approved = users.filter((u) => u.status === 'approved')

  const approve = (uid) => updateDoc(doc(db, 'users', uid), { status: 'approved' })
  const reject = (uid) => {
    if (!confirm('가입 신청을 거절할까요?')) return
    updateDoc(doc(db, 'users', uid), { status: 'rejected' })
  }
  const toggleRole = (u) => {
    const nextRole = u.role === 'admin' ? 'member' : 'admin'
    if (!confirm(`${u.displayName}님을 ${nextRole === 'admin' ? '관리자로 지정' : '일반회원으로 변경'}할까요?`)) return
    updateDoc(doc(db, 'users', u.id), { role: nextRole })
  }

  return (
    <div>
      <h3 className="admin-section-title">가입 승인 대기 ({pending.length})</h3>
      {pending.length === 0 ? (
        <p style={{ color: 'var(--color-text-gray)', fontSize: 13 }}>대기 중인 신청이 없어요.</p>
      ) : (
        <div className="item-list">
          {pending.map((u) => (
            <div className="user-row" key={u.id}>
              <div className="user-row-info">
                <img className="user-row-avatar" src={u.photoURL} alt="" />
                <div>
                  <div className="user-row-name">{u.displayName}</div>
                  <div className="user-row-email">{u.email}</div>
                </div>
              </div>
              <div className="form-actions">
                <button className="btn-primary" onClick={() => approve(u.id)}>
                  승인
                </button>
                <button className="btn-secondary" onClick={() => reject(u.id)}>
                  거절
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h3 className="admin-section-title">전체 회원 ({approved.length})</h3>
      <div className="item-list">
        {approved.map((u) => (
          <div className="user-row" key={u.id}>
            <div className="user-row-info">
              <img className="user-row-avatar" src={u.photoURL} alt="" />
              <div>
                <div className="user-row-name">
                  {u.displayName} <span className={'role-badge' + (u.role === 'admin' ? ' admin' : '')}>{u.role === 'admin' ? '관리자' : '일반회원'}</span>
                </div>
                <div className="user-row-email">{u.email}</div>
              </div>
            </div>
            <button className="btn-secondary" onClick={() => toggleRole(u)} disabled={u.id === user.uid}>
              {u.role === 'admin' ? '일반회원으로' : '관리자로 지정'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
