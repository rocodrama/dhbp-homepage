import { useEffect, useState } from 'react'
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../../context/AuthContext'
import { useApprovedUsers } from '../equipment/useApprovedUsers'
import { TIME_SLOTS, colorForName } from './constants'
import AddClassModal from './AddClassModal'
import './timetable.css'

const DAYS = ['월', '화', '수', '목', '금']

export default function Timetable() {
  const { user } = useAuth()
  const approvedUsers = useApprovedUsers()
  const [filterUid, setFilterUid] = useState('all')
  const [allTimetables, setAllTimetables] = useState({}) // uid -> { displayName, cells }
  const [addTarget, setAddTarget] = useState(null) // { day, slot } | null

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'timetables'), (snap) => {
      const next = {}
      snap.docs.forEach((d) => (next[d.id] = d.data()))
      setAllTimetables(next)
    })
    return unsub
  }, [])

  const occupantsFor = (day, slot) => {
    const key = `${day}_${slot}`
    return Object.entries(allTimetables)
      .filter(([uid, tt]) => tt.cells?.[key] && (filterUid === 'all' || uid === filterUid))
      .map(([uid, tt]) => ({ uid, displayName: tt.displayName ?? '이름없음', courseName: tt.cells[key] }))
  }

  const handleAddClass = async (targetUid, day, slots, courseName) => {
    const targetDoc = allTimetables[targetUid] || {}
    const next = { ...(targetDoc.cells || {}) }
    slots.forEach((slot) => (next[`${day}_${slot}`] = courseName))
    const targetUser = approvedUsers.find((u) => u.id === targetUid)
    await setDoc(doc(db, 'timetables', targetUid), {
      displayName: targetDoc.displayName || targetUser?.displayName || '익명',
      cells: next,
    })
  }

  const handleDeleteOccupant = async (occupant, day, slot) => {
    if (!confirm(`${occupant.displayName}님의 ${day}요일 ${slot} "${occupant.courseName}"을(를) 삭제할까요?`)) return
    const targetDoc = allTimetables[occupant.uid] || {}
    const next = { ...(targetDoc.cells || {}) }
    delete next[`${day}_${slot}`]
    await setDoc(doc(db, 'timetables', occupant.uid), {
      displayName: targetDoc.displayName || occupant.displayName,
      cells: next,
    })
  }

  return (
    <div>
      <div className="tt-controls">
        <select value={filterUid} onChange={(e) => setFilterUid(e.target.value)}>
          <option value="all">전체 보기</option>
          {approvedUsers.map((u) => (
            <option key={u.id} value={u.id}>
              {u.displayName}
            </option>
          ))}
        </select>
        <button className="new-btn" onClick={() => setAddTarget({ day: DAYS[0], slot: TIME_SLOTS[0] })}>
          시간표 추가
        </button>
      </div>

      <div className="tt-table-wrap">
        <table className="tt-table">
          <thead>
            <tr>
              <th></th>
              {DAYS.map((d) => (
                <th key={d}>{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map((slot) => (
              <tr key={slot}>
                <th>{slot}</th>
                {DAYS.map((day) => {
                  const occupants = occupantsFor(day, slot)
                  return (
                    <td
                      key={day}
                      className="tt-cell editable"
                      onClick={() => setAddTarget({ day, slot })}
                    >
                      <div className="tt-occupants">
                        {occupants.map((o) => (
                          <span
                            key={o.uid}
                            className="tt-chip"
                            style={{ background: colorForName(o.displayName) }}
                            title={`${o.displayName} · ${o.courseName}`}
                          >
                            {o.displayName}
                            <button
                              type="button"
                              className="tt-chip-remove"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteOccupant(o, day, slot)
                              }}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {addTarget && (
        <AddClassModal
          initialDay={addTarget.day}
          initialSlot={addTarget.slot}
          approvedUsers={approvedUsers}
          defaultUid={user.uid}
          onSave={handleAddClass}
          onClose={() => setAddTarget(null)}
        />
      )}
    </div>
  )
}
