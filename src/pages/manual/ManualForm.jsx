import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../../context/AuthContext'
import { MANUAL_CATEGORIES } from './constants'
import MarkdownEditor from '../../components/MarkdownEditor'
import './manual.css'

export default function ManualForm() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(MANUAL_CATEGORIES[0])
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    setSaving(true)
    const docRef = await addDoc(collection(db, 'manuals'), {
      title: title.trim(),
      category,
      content,
      authorId: user.uid,
      authorName: profile?.displayName ?? '익명',
      createdAt: serverTimestamp(),
    })
    navigate(`/manual/${docRef.id}`)
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
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
