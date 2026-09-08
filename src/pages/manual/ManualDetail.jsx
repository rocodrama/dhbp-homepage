import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../../context/AuthContext'
import { MANUAL_CATEGORIES } from './constants'
import { useMarkdownHtml } from './useMarkdown'
import MarkdownEditor from '../../components/MarkdownEditor'
import { Loading } from '../../components/Feedback'
import { formatDate } from '../calendar/dateUtils'
import './manual.css'

export default function ManualDetail() {
  const { id } = useParams()
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [manual, setManual] = useState(null)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(null)
  const html = useMarkdownHtml(manual?.content)

  useEffect(() => {
    const ref = doc(db, 'manuals', id)
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) setManual({ id: snap.id, ...snap.data() })
    })
    return unsub
  }, [id])

  if (!manual) return <Loading />

  const canEdit = user?.uid === manual.authorId || isAdmin

  const startEdit = () => {
    setDraft({ title: manual.title, category: manual.category, content: manual.content })
    setEditing(true)
  }

  const saveEdit = async (e) => {
    e.preventDefault()
    await updateDoc(doc(db, 'manuals', id), draft)
    setEditing(false)
  }

  const togglePin = async () => {
    await updateDoc(doc(db, 'manuals', id), { pinned: !manual.pinned })
  }

  const handleDelete = async () => {
    if (!confirm('이 매뉴얼을 삭제할까요?')) return
    await deleteDoc(doc(db, 'manuals', id))
    navigate('/manual')
  }

  if (editing) {
    return (
      <form className="form-card" onSubmit={saveEdit}>
        <h1>매뉴얼 수정</h1>

        <label>제목</label>
        <input
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          required
        />
        <label>카테고리</label>
        <select
          value={draft.category}
          onChange={(e) => setDraft({ ...draft, category: e.target.value })}
        >
          {MANUAL_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <label>내용</label>
        <MarkdownEditor
          value={draft.content}
          onChange={(v) => setDraft({ ...draft, content: v })}
        />
        <div className="form-actions">
          <button type="submit" className="btn-primary">
            저장
          </button>
          <button type="button" className="btn-secondary" onClick={() => setEditing(false)}>
            취소
          </button>
        </div>
      </form>
    )
  }

  return (
    <div>
      <Link to="/manual" className="back-link">
        ← 매뉴얼
      </Link>

      <div className="detail-header">
        <div>
          <h1 className="detail-title">
            {manual.pinned && <span className="pin-badge">고정</span>} {manual.title}
          </h1>
          <div className="detail-meta">
            {manual.category} · {manual.authorName} · {formatDate(manual.createdAt)}
          </div>
        </div>
        <div className="form-actions">
          {isAdmin && (
            <button className="btn-secondary" onClick={togglePin}>
              {manual.pinned ? '고정 해제' : '위로 고정'}
            </button>
          )}
          {canEdit && (
            <>
              <button className="btn-secondary" onClick={startEdit}>
                수정
              </button>
              <button className="btn-danger" onClick={handleDelete}>
                삭제
              </button>
            </>
          )}
        </div>
      </div>
      <div className="detail-body" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}
