import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../../firebase'
import { MANUAL_CATEGORIES } from './constants'
import '../../pages/manual/manual.css'

export default function ManualList() {
  const [manuals, setManuals] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(null)

  useEffect(() => {
    const q = query(collection(db, 'manuals'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setManuals(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [])

  const filtered = useMemo(() => {
    return manuals.filter((m) => {
      if (category && m.category !== category) return false
      if (search && !m.title?.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [manuals, search, category])

  return (
    <div>
      <div className="toolbar">
        <input
          className="search-input"
          placeholder="🔍  매뉴얼 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Link to="/manual/new" className="new-btn">
          + 새 매뉴얼
        </Link>
      </div>

      <div className="category-chips">
        <button
          className={'chip' + (category === null ? ' active' : '')}
          onClick={() => setCategory(null)}
        >
          전체
        </button>
        {MANUAL_CATEGORIES.map((c) => (
          <button
            key={c}
            className={'chip' + (category === c ? ' active' : '')}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <p>불러오는 중...</p>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <img src="/images/mascot.png" alt="" />
          <p>아직 등록된 매뉴얼이 없어요. 첫 매뉴얼을 작성해보세요!</p>
        </div>
      ) : (
        <div className="item-list">
          {filtered.map((m) => (
            <Link to={`/manual/${m.id}`} key={m.id} className="item-row">
              <span className="item-row-title">{m.title}</span>
              <span className="item-row-meta">
                {m.category} · {m.authorName}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
