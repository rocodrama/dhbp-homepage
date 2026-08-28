import { useState } from 'react'
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../../context/AuthContext'
import Modal from '../../components/Modal'
import './lunchmap.css'

const emptyDraft = { name: '', category: '', naverMapUrl: '', rating: 5 }

export default function RestaurantModal({ restaurant, onClose }) {
  const { user, profile, isAdmin } = useAuth()
  const isCreate = !restaurant
  const [draft, setDraft] = useState(restaurant ? { ...emptyDraft, ...restaurant } : emptyDraft)
  const [saving, setSaving] = useState(false)

  const setField = (key, value) => setDraft((d) => ({ ...d, [key]: value }))

  const canDelete = !isCreate && (restaurant.addedBy === user.uid || isAdmin)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!draft.name.trim()) return
    setSaving(true)
    const payload = {
      name: draft.name.trim(),
      category: draft.category.trim(),
      naverMapUrl: draft.naverMapUrl.trim(),
      rating: Number(draft.rating),
    }
    if (isCreate) {
      await addDoc(collection(db, 'restaurants'), {
        ...payload,
        favoritedBy: [],
        likedBy: [],
        dislikedBy: [],
        addedBy: user.uid,
        addedByName: profile?.displayName ?? '익명',
        createdAt: serverTimestamp(),
      })
    } else {
      await updateDoc(doc(db, 'restaurants', restaurant.id), payload)
    }
    setSaving(false)
    onClose()
  }

  const handleDelete = async () => {
    if (!confirm('이 맛집을 목록에서 삭제할까요?')) return
    await deleteDoc(doc(db, 'restaurants', restaurant.id))
    onClose()
  }

  return (
    <Modal onClose={onClose}>
      <form className="modal-form" onSubmit={handleSubmit}>
        <label>가게 이름</label>
        <input value={draft.name} onChange={(e) => setField('name', e.target.value)} required />

        <label>카테고리 (분식, 한식, 중식 등)</label>
        <input value={draft.category} onChange={(e) => setField('category', e.target.value)} />

        <label>평점 (1~5)</label>
        <select value={draft.rating} onChange={(e) => setField('rating', e.target.value)}>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {'★'.repeat(n)}
            </option>
          ))}
        </select>

        <label>네이버지도 링크 (선택 — 비워두면 가게 이름으로 자동 검색 링크 생성)</label>
        <input
          type="url"
          value={draft.naverMapUrl}
          onChange={(e) => setField('naverMapUrl', e.target.value)}
          placeholder="https://map.naver.com/..."
        />

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? '저장 중...' : '저장'}
          </button>
          <button type="button" className="btn-secondary" onClick={onClose}>
            취소
          </button>
          {canDelete && (
            <button type="button" className="btn-danger" onClick={handleDelete}>
              삭제
            </button>
          )}
        </div>
      </form>
    </Modal>
  )
}
