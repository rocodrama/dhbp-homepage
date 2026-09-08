import { useEffect, useMemo, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../../firebase'
import { EmptyState, Loading } from '../../components/Feedback'
import { sortMembers } from './constants'
import MemberModal from './MemberModal'
import './members.css'

const COLUMNS = [
  ['name', '이름'],
  ['position', '직책'],
  ['birthDate', '생년월일'],
  ['studentId', '학번'],
  ['researcherId', '연구자번호'],
  ['email', '이메일'],
]

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

  const sorted = useMemo(() => sortMembers(members), [members])

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
        <div className="data-table-wrap">
          <table className="data-table member-table">
            <thead>
              <tr>
                {COLUMNS.map(([key, label]) => (
                  <th key={key}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((m) => (
                <tr key={m.id} onClick={() => setSelected(m)}>
                  {COLUMNS.map(([key]) => (
                    <td key={key} data-col={key}>
                      {m[key] || '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected !== undefined && (
        <MemberModal member={selected} onClose={() => setSelected(undefined)} />
      )}
    </div>
  )
}
