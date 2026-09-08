import { useState } from 'react'
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../../context/AuthContext'
import { POSITIONS, emptyMember } from './constants'
import Modal from '../../components/Modal'

// 전부 text 다. 실제 명부에는 '0000.05.23'(연도 앞자리가 가려진 값)이나
// '202515539/202011478(구)' 처럼 형식이 정해지지 않은 값이 들어 있다.
// type="date" 로 두면 그런 값이 빈칸으로 보이고, 그 상태로 저장하면 지워진다.
// type="email" 도 마찬가지로 '(구)' 가 붙은 주소를 거부한다.
const FIELDS = [
  ['name', '이름', '홍길동'],
  ['birthDate', '생년월일', '2000.01.31'],
  ['studentId', '학번', '202012345'],
  ['researcherId', '연구자번호', '12345678'],
  ['email', '이메일', 'name@kangwon.ac.kr'],
]

export default function MemberModal({ member, onClose }) {
  const { user, isAdmin } = useAuth()
  const isCreate = !member
  const [draft, setDraft] = useState(isCreate ? emptyMember : { ...emptyMember, ...member })
  const [saving, setSaving] = useState(false)

  const canDelete = !isCreate && (isAdmin || member.createdBy === user.uid)
  const setField = (key, value) => setDraft((d) => ({ ...d, [key]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!draft.name.trim()) return
    setSaving(true)
    const payload = {
      name: draft.name.trim(),
      birthDate: draft.birthDate,
      studentId: draft.studentId.trim(),
      researcherId: draft.researcherId.trim(),
      email: draft.email.trim(),
      position: draft.position,
    }
    if (isCreate) {
      // createdBy 는 삭제 권한 판정에만 쓴다 — 명부의 이름과는 무관하다
      await addDoc(collection(db, 'members'), {
        ...payload,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      })
    } else {
      await updateDoc(doc(db, 'members', member.id), payload)
    }
    setSaving(false)
    onClose()
  }

  const handleDelete = async () => {
    if (!confirm(`${member.name} 님을 명부에서 삭제할까요?`)) return
    await deleteDoc(doc(db, 'members', member.id))
    onClose()
  }

  return (
    <Modal onClose={onClose}>
      <form className="modal-form" onSubmit={handleSubmit}>
        <h1>{isCreate ? '인원 추가' : '인원 정보 수정'}</h1>

        {FIELDS.map(([key, label, placeholder]) => (
          <div key={key}>
            <label>{label}</label>
            <input
              value={draft[key]}
              placeholder={placeholder}
              onChange={(e) => setField(key, e.target.value)}
              required={key === 'name'}
              autoFocus={isCreate && key === 'name'}
            />
          </div>
        ))}

        <label>직책</label>
        <select value={draft.position} onChange={(e) => setField('position', e.target.value)}>
          <option value="">(미지정)</option>
          {POSITIONS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

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
