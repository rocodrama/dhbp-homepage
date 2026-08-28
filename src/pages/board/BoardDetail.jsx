import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../../context/AuthContext'
import { useMarkdownHtml } from '../manual/useMarkdown'
import MarkdownEditor from '../../components/MarkdownEditor'
import './board.css'

function formatDate(ts) {
  if (!ts?.toDate) return ''
  return ts.toDate().toLocaleDateString('ko-KR')
}

export default function BoardDetail() {
  const { id } = useParams()
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(null)
  const html = useMarkdownHtml(post?.content)

  useEffect(() => {
    const ref = doc(db, 'posts', id)
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) setPost({ id: snap.id, ...snap.data() })
    })
    return unsub
  }, [id])

  if (!post) return <p>불러오는 중...</p>

  const canEdit = user?.uid === post.authorId || isAdmin

  const startEdit = () => {
    setDraft({ title: post.title, content: post.content, pinned: post.pinned })
    setEditing(true)
  }

  const saveEdit = async (e) => {
    e.preventDefault()
    await updateDoc(doc(db, 'posts', id), draft)
    setEditing(false)
  }

  const togglePin = async () => {
    await updateDoc(doc(db, 'posts', id), { pinned: !post.pinned })
  }

  const handleDelete = async () => {
    if (!confirm('이 글을 삭제할까요?')) return
    await deleteDoc(doc(db, 'posts', id))
    navigate('/board')
  }

  if (editing) {
    return (
      <form className="form-card" onSubmit={saveEdit}>
        <label>제목</label>
        <input
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          required
        />
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
    <div className="detail-card">
      <div className="detail-header">
        <div>
          <h2 className="detail-title">
            {post.pinned && <span className="pin-badge">공지</span>} {post.title}
          </h2>
          <div className="detail-meta">
            {post.authorName} · {formatDate(post.createdAt)}
          </div>
        </div>
        <div className="form-actions">
          {isAdmin && (
            <button className="btn-secondary" onClick={togglePin}>
              {post.pinned ? '고정 해제' : '공지로 고정'}
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
