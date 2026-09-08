import { useEffect, useMemo, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../../firebase'
import { EmptyState, Loading } from '../../components/Feedback'
import { POSITIONS, sortMembers } from './constants'
import MemberModal from './MemberModal'
import './members.css'

export default function MemberList() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  // undefined = 닫힘, null = 새로 추가, 객체 = 수정
  const [selected, setSelected] = useState(undefined)

  useEffect(() => {
    // orderBy 를 쓰지 않는다 — 직책 순서는 문자열 정렬이 아니라 POSITIONS 배열 순서다
    const unsub = onSnapshot(collection(db, 'members'), (snap) => {
      setMembers(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [])

  const groups = useMemo(() => {
    const sorted = sortMembers(members)
    const known = POSITIONS.map((p) => [p, sorted.filter((m) => m.position === p)])
    const other = sorted.filter((m) => !POSITIONS.includes(m.position))
    return [...known, ...(other.length ? [['직책 미지정', other]] : [])].filter(([, list]) => list.length)
  }, [members])

  return (
    <div>
      <h1 className="page-title">인원정보</h1>

      <div className="toolbar">
        <button className="new-btn" onClick={() => setSelected(null)}>
          + 인원 추가
        </button>
      </div>

      {loading ? (
        <Loading />
      ) : members.length === 0 ? (
        <EmptyState>등록된 인원이 없어요.</EmptyState>
      ) : (
        groups.map(([position, list]) => (
          <section key={position}>
            <h2 className="section-title">
              {position} <span className="member-count">{list.length}</span>
            </h2>
            <div className="item-list">
              {list.map((m) => (
                <div className="item-row member-row" key={m.id} onClick={() => setSelected(m)}>
                  <div className="member-main">
                    <span className="item-row-title">{m.name}</span>
                    {m.email && <span className="member-email">{m.email}</span>}
                  </div>
                  <div className="member-meta">
                    {m.studentId && <span>학번 {m.studentId}</span>}
                    {m.birthDate && <span>생년월일 {m.birthDate}</span>}
                    {m.researcherId && <span>연구자번호 {m.researcherId}</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))
      )}

      {selected !== undefined && (
        <MemberModal member={selected} onClose={() => setSelected(undefined)} />
      )}
    </div>
  )
}
