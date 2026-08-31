import { useState } from 'react'
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../../context/AuthContext'
import { EQUIPMENT_TYPES, EQUIPMENT_STATUSES, STATUS_COLOR } from './constants'
import Modal from '../../components/Modal'
import './equipment.css'

const emptyDraft = {
  name: '',
  type: EQUIPMENT_TYPES[0],
  ownerId: '',
  status: '사용가능',
  note: '',
  specs: {
    cpu: '',
    ram: '',
    ramSlots: '',
    ramType: '',
    gpu: '',
    storage: '',
    purchaseDate: '',
    maintenanceLog: '',
  },
}

export default function EquipmentModal({ equipment, approvedUsers, onClose }) {
  const { user, isAdmin } = useAuth()
  const isCreate = !equipment
  const canEdit = isCreate || isAdmin || equipment.ownerId === user.uid

  const [editing, setEditing] = useState(isCreate)
  const [draft, setDraft] = useState(
    isCreate ? emptyDraft : { ...emptyDraft, ...equipment, specs: { ...emptyDraft.specs, ...equipment.specs } }
  )
  const [saving, setSaving] = useState(false)

  const setField = (key, value) => setDraft((d) => ({ ...d, [key]: value }))
  const setSpec = (key, value) => setDraft((d) => ({ ...d, specs: { ...d.specs, [key]: value } }))

  const ownerName = draft.ownerId
    ? approvedUsers.find((u) => u.id === draft.ownerId)?.displayName ?? '알 수 없음'
    : '공용'

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!draft.name.trim()) return
    setSaving(true)
    const payload = {
      name: draft.name.trim(),
      type: draft.type,
      ownerId: draft.ownerId || null,
      ownerName,
      status: draft.status,
      note: draft.note,
      specs: draft.specs,
    }
    if (isCreate) {
      await addDoc(collection(db, 'equipment'), { ...payload, createdAt: serverTimestamp() })
    } else {
      await updateDoc(doc(db, 'equipment', equipment.id), payload)
    }
    setSaving(false)
    onClose()
  }

  const handleDelete = async () => {
    if (!confirm('이 장비를 목록에서 삭제할까요?')) return
    await deleteDoc(doc(db, 'equipment', equipment.id))
    onClose()
  }

  const specFields =
    draft.type === '개인 PC'
      ? [
          ['cpu', 'CPU'],
          ['ram', 'RAM 용량'],
          ['ramSlots', '램 슬롯 (사용/전체)'],
          ['ramType', '메모리 타입 (DDR4/DDR5)'],
          ['gpu', 'GPU'],
          ['storage', '저장장치'],
          ['purchaseDate', '구매일'],
        ]
      : [
          ['purchaseDate', '구매일'],
          ['maintenanceLog', '점검 이력'],
        ]

  if (editing) {
    return (
      <Modal onClose={onClose}>
        <form className="modal-form" onSubmit={handleSubmit}>
          <label>장비명</label>
          <input value={draft.name} onChange={(e) => setField('name', e.target.value)} required />

          <label>유형</label>
          <select value={draft.type} onChange={(e) => setField('type', e.target.value)}>
            {EQUIPMENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <label>담당자</label>
          <select value={draft.ownerId} onChange={(e) => setField('ownerId', e.target.value)}>
            <option value="">공용</option>
            {approvedUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.displayName}
              </option>
            ))}
          </select>

          <label>상태</label>
          <select value={draft.status} onChange={(e) => setField('status', e.target.value)}>
            {EQUIPMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {specFields.map(([key, label]) => (
            <div key={key}>
              <label>{label}</label>
              <input value={draft.specs[key]} onChange={(e) => setSpec(key, e.target.value)} />
            </div>
          ))}

          <label>비고</label>
          <input value={draft.note} onChange={(e) => setField('note', e.target.value)} />

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? '저장 중...' : '저장'}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => (isCreate ? onClose() : setEditing(false))}
            >
              취소
            </button>
          </div>
        </form>
      </Modal>
    )
  }

  return (
    <Modal onClose={onClose}>
      <div className="detail-header">
        <div>
          <h2 className="detail-title">{equipment.name}</h2>
          <div className="detail-meta">{equipment.type}</div>
        </div>
        <span
          className="status-badge"
          style={{
            background: STATUS_COLOR[equipment.status] + '22',
            color: STATUS_COLOR[equipment.status],
          }}
        >
          {equipment.status}
        </span>
      </div>

      <div className="spec-row">
        <span className="spec-row-key">담당자</span>
        <span className="spec-row-value">{equipment.ownerName}</span>
      </div>
      {specFields.map(([key, label]) =>
        equipment.specs?.[key] ? (
          <div className="spec-row" key={key}>
            <span className="spec-row-key">{label}</span>
            <span className="spec-row-value">{equipment.specs[key]}</span>
          </div>
        ) : null
      )}
      {equipment.note && (
        <div className="spec-row">
          <span className="spec-row-key">비고</span>
          <span className="spec-row-value">{equipment.note}</span>
        </div>
      )}

      <div className="form-actions" style={{ marginTop: 20 }}>
        {canEdit && (
          <button className="btn-secondary" onClick={() => setEditing(true)}>
            수정
          </button>
        )}
        {isAdmin && (
          <button className="btn-danger" onClick={handleDelete}>
            삭제
          </button>
        )}
        <button className="btn-secondary" onClick={onClose}>
          닫기
        </button>
      </div>
    </Modal>
  )
}
