import { useEffect, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../../context/AuthContext'
import { TIME_SLOTS, colorForName } from './constants'
import AddClassModal from './AddClassModal'
import './timetable.css'

const DAYS = ['월', '화', '수', '목', '금']

export default function Timetable() {
  const { user } = useAuth()
  const [filterName, setFilterName] = useState('all')
  const [entries, setEntries] = useState([])
  const [addTarget, setAddTarget] = useState(null) // { day, slot } | null

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'timetableEntries'), (snap) => {
      setEntries(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [])

  const names = [...new Set(entries.map((e) => e.name))].sort()

  const occupantsFor = (day, slot) =>
    entries.filter(
      (e) => e.day === day && e.slots?.includes(slot) && (filterName === 'all' || e.name === filterName)
    )

  const handleAddClass = async (name, day, slots) => {
    await addDoc(collection(db, 'timetableEntries'), {
      name,
      day,
      slots,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
    })
  }

  const handleDeleteEntry = async (entry) => {
    if (!confirm(`"${entry.name}"의 ${entry.day}요일 일정을 삭제할까요?`)) return
    await deleteDoc(doc(db, 'timetableEntries', entry.id))
  }

  return (
    <div>
      <div className="tt-controls">
        <select value={filterName} onChange={(e) => setFilterName(e.target.value)}>
          <option value="all">전체 보기</option>
          {names.map((n) => (
            <option key={n} value={n}>
              {n}
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
                        {occupants.map((e) => (
                          <span
                            key={e.id}
                            className="tt-chip"
                            style={{ background: colorForName(e.name) }}
                            title={e.name}
                          >
                            {e.name}
                            <button
                              type="button"
                              className="tt-chip-remove"
                              onClick={(ev) => {
                                ev.stopPropagation()
                                handleDeleteEntry(e)
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
          onSave={handleAddClass}
          onClose={() => setAddTarget(null)}
        />
      )}
    </div>
  )
}
