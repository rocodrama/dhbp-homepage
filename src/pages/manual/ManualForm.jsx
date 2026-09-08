import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../../context/AuthContext'
import { MANUAL_CATEGORIES } from './constants'
import MarkdownEditor from '../../components/MarkdownEditor'
import './manual.css'

export default function ManualForm() {
  const { user, profile, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(MANUAL_CATEGORIES[0])
  const [content, setContent] = useState('')
  const [pinned, setPinned] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    setSaving(true)
    const docRef = await addDoc(collection(db, 'manuals'), {
      title: title.trim(),
      category,
      content,
      pinned: isAdmin ? pinned : false,
      authorId: user.uid,
      authorName: profile?.displayName ?? '익명',
      createdAt: serverTimestamp(),
    })
    navigate(`/manual/${docRef.id}`)
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <h1>새 매뉴얼</h1>

      <label>제목</label>
      <input value={title} onChange={(e) => setTitle(e.target.value)} required />

      <label>카테고리</label>
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        {MANUAL_CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <label>내용</label>
      <MarkdownEditor value={content} onChange={setContent} />

      {isAdmin && (
        <label className="check-label">
          <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} />
          목록 위로 고정
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
