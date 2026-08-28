import { useEffect, useState } from 'react'
import { arrayRemove, arrayUnion, collection, onSnapshot, orderBy, query, doc, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../../context/AuthContext'
import RestaurantModal from './RestaurantModal'
import './lunchmap.css'

function mapUrlFor(r) {
  if (r.naverMapUrl && /^https?:\/\//i.test(r.naverMapUrl)) return r.naverMapUrl
  return `https://map.naver.com/v5/search/${encodeURIComponent(r.name)}`
}

export default function LunchMap() {
  const { user } = useAuth()
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(undefined) // undefined = closed, null = create, obj = edit

  useEffect(() => {
    const q = query(collection(db, 'restaurants'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setRestaurants(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [])

  const toggleFavorite = async (r) => {
    const isFav = r.favoritedBy?.includes(user.uid)
    await updateDoc(doc(db, 'restaurants', r.id), {
      favoritedBy: isFav ? arrayRemove(user.uid) : arrayUnion(user.uid),
    })
  }

  const toggleReaction = async (r, type) => {
    const liked = r.likedBy?.includes(user.uid)
    const disliked = r.dislikedBy?.includes(user.uid)
    const updates = {}
    if (type === 'like') {
      updates.likedBy = liked ? arrayRemove(user.uid) : arrayUnion(user.uid)
      if (disliked) updates.dislikedBy = arrayRemove(user.uid)
    } else {
      updates.dislikedBy = disliked ? arrayRemove(user.uid) : arrayUnion(user.uid)
      if (liked) updates.likedBy = arrayRemove(user.uid)
    }
    await updateDoc(doc(db, 'restaurants', r.id), updates)
  }

  return (
    <div>
      <div className="toolbar">
        <div style={{ flex: 1 }} />
        <button className="new-btn" onClick={() => setSelected(null)}>
          + 맛집 추가
        </button>
      </div>

      {loading ? (
        <p>불러오는 중...</p>
      ) : restaurants.length === 0 ? (
        <div className="empty-state">
          <img src="/images/mascot.png" alt="" />
          <p>아직 등록된 맛집이 없어요. 첫 맛집을 추천해보세요!</p>
        </div>
      ) : (
        <div className="restaurant-grid">
          {restaurants.map((r) => {
            const isFav = r.favoritedBy?.includes(user.uid)
            const liked = r.likedBy?.includes(user.uid)
            const disliked = r.dislikedBy?.includes(user.uid)
            return (
              <div className="restaurant-card" key={r.id}>
                <div className="restaurant-card-top">
                  <div>
                    <h3 className="restaurant-name">{r.name}</h3>
                    {r.category && <div className="restaurant-category">{r.category}</div>}
                  </div>
                  <button className="fav-btn" onClick={() => toggleFavorite(r)}>
                    {isFav ? '★' : '☆'}
                  </button>
                </div>
                <div className="rating">{'★'.repeat(r.rating || 0)}</div>
                <div className="reaction-row">
                  <button
                    className={'reaction-btn' + (liked ? ' active-like' : '')}
                    onClick={() => toggleReaction(r, 'like')}
                  >
                    👍 {r.likedBy?.length || 0}
                  </button>
                  <button
                    className={'reaction-btn' + (disliked ? ' active-dislike' : '')}
                    onClick={() => toggleReaction(r, 'dislike')}
                  >
                    👎 {r.dislikedBy?.length || 0}
                  </button>
                </div>
                <a
                  className="btn-secondary map-link-btn"
                  href={mapUrlFor(r)}
                  target="_blank"
                  rel="noreferrer"
                >
                  네이버지도에서 보기 ↗
                </a>
                <div className="restaurant-added-by" onClick={() => setSelected(r)} style={{ cursor: 'pointer' }}>
                  {r.addedByName} 추천 · 수정
                </div>
              </div>
            )
          })}
        </div>
      )}

      {selected !== undefined && (
        <RestaurantModal restaurant={selected} onClose={() => setSelected(undefined)} />
      )}
    </div>
  )
}
