import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../../context/AuthContext'
import MarkdownEditor from '../../components/MarkdownEditor'
import './board.css'

export default function BoardForm() {
  const { user, profile, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [pinned, setPinned] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    setSaving(true)
    const docRef = await addDoc(collection(db, 'posts'), {
      title: title.trim(),
      content,
      pinned: isAdmin ? pinned : false,
      authorId: user.uid,
      authorName: profile?.displayName ?? '익명',
      createdAt: serverTimestamp(),
    })
    navigate(`/board/${docRef.id}`)
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <label>제목</label>
      <input value={title} onChange={(e) => setTitle(e.target.value)} required />

      <label>내용</label>
      <MarkdownEditor value={content} onChange={setContent} />

      {isAdmin && (
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            checked={pinned}
            onChange={(e) => setPinned(e.target.checked)}
            style={{ width: 'auto' }}
          />
          공지로 상단 고정
        </label>
      )}

      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? '저장 중...' : '등록하기'}
        </button>
        <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
          취소
        </button>
      </div>
    </form>
  )
}
