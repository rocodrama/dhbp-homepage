import { useEffect, useState } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../../context/AuthContext'
import { useApprovedUsers } from '../equipment/useApprovedUsers'
import { TIME_SLOTS } from './constants'
import AddClassModal from './AddClassModal'
import './timetable.css'

const DAYS = ['월', '화', '수', '목', '금']

export default function Timetable() {
  const { user, profile } = useAuth()
  const approvedUsers = useApprovedUsers()
  const [viewUid, setViewUid] = useState(user.uid)
  const [cells, setCells] = useState({})
  const [addTarget, setAddTarget] = useState(null) // { day, slot } | null

  const isMine = viewUid === user.uid

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'timetables', viewUid), (snap) => {
      setCells(snap.exists() ? snap.data().cells || {} : {})
    })
    return unsub
  }, [viewUid])

  const saveCells = async (next) => {
    setCells(next)
    await setDoc(doc(db, 'timetables', user.uid), {
      displayName: profile?.displayName ?? '익명',
      cells: next,
    })
  }

  const handleCellClick = (day, slot) => {
    if (!isMine) return
    const key = `${day}_${slot}`
    if (cells[key]) {
      if (!confirm(`${day}요일 ${slot} "${cells[key]}" 삭제할까요?`)) return
      const next = { ...cells }
      delete next[key]
      saveCells(next)
    } else {
      setAddTarget({ day, slot })
    }
  }

  const handleAddClass = (day, slots, name) => {
    const next = { ...cells }
    slots.forEach((slot) => (next[`${day}_${slot}`] = name))
    saveCells(next)
  }

  return (
    <div>
      <div className="tt-controls">
        <select value={viewUid} onChange={(e) => setViewUid(e.target.value)}>
          <option value={user.uid}>내 시간표</option>
          {approvedUsers
            .filter((u) => u.id !== user.uid)
            .map((u) => (
              <option key={u.id} value={u.id}>
                {u.displayName}
              </option>
            ))}
        </select>
        {isMine && (
          <button className="new-btn" onClick={() => setAddTarget({ day: DAYS[0], slot: TIME_SLOTS[0] })}>
            + 수업 추가
          </button>
        )}
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
                  const key = `${day}_${slot}`
                  const value = cells[key]
                  return (
                    <td
                      key={day}
                      className={'tt-cell' + (isMine ? ' editable' : '') + (value ? ' filled' : '')}
                      onClick={() => handleCellClick(day, slot)}
                    >
                      {value || ''}
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
          onSave={handleAddClass}
          onClose={() => setAddTarget(null)}
        />
      )}
    </div>
  )
}
