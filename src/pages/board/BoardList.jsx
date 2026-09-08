import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../../firebase'
import { EmptyState, Loading } from '../../components/Feedback'

export default function BoardList() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [])

  const filtered = useMemo(() => {
    const list = posts.filter(
      (p) => !search || p.title?.toLowerCase().includes(search.toLowerCase())
    )
    // 공지(pinned)가 항상 위로, 그 안에서는 최신순 유지
    return [...list].sort((a, b) => (a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1))
  }, [posts, search])

  return (
    <div>
      <h1 className="page-title">공지사항/게시판</h1>

      <div className="toolbar">
        <input
          className="search-input"
          placeholder="게시글 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Link to="/board/new" className="new-btn">
          + 글쓰기
        </Link>
      </div>

      {loading ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <EmptyState>아직 등록된 글이 없어요. 첫 글을 남겨보세요!</EmptyState>
      ) : (
        <div className="item-list">
          {filtered.map((p) => (
            <Link to={`/board/${p.id}`} key={p.id} className="item-row">
              <span className="item-row-title">
                {p.pinned && <span className="pin-badge">공지</span>}
                {p.title}
              </span>
              <span className="item-row-meta">{p.authorName}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
