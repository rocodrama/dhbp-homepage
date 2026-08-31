import { useEffect, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../../context/AuthContext'
import { TIME_SLOTS, colorForName } from './constants'
import AddClassModal from './AddClassModal'
import './timetable.css'

const DAYS = ['월', '화', '수', '목', '금']

function isSafe(entry, dayEntries) {
  return !dayEntries.some((o) => o.id !== entry.id && o.slots.some((s) => entry.slots.includes(s)))
}

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
  const visibleEntries = entries.filter((e) => filterName === 'all' || e.name === filterName)

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

  const renderChip = (entry) => (
    <span key={entry.id} className="tt-chip" style={{ background: colorForName(entry.name) }} title={entry.name}>
      {entry.name}
      <button
        type="button"
        className="tt-chip-remove"
        onClick={(e) => {
          e.stopPropagation()
          handleDeleteEntry(entry)
        }}
      >
        ×
      </button>
    </span>
  )

  const rowSpanLeft = {} // day -> remaining rows already covered by an earlier rowSpan

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
                  if (rowSpanLeft[day] > 0) {
                    rowSpanLeft[day] -= 1
                    return null
                  }

                  const dayEntries = visibleEntries.filter((e) => e.day === day)
                  const starting = dayEntries.find((e) => e.slots[0] === slot && isSafe(e, dayEntries))

                  if (starting) {
                    rowSpanLeft[day] = starting.slots.length - 1
                    return (
                      <td
                        key={day}
                        className="tt-cell editable tt-cell-span"
                        rowSpan={starting.slots.length}
                        onClick={() => setAddTarget({ day, slot })}
                      >
                        <div className="tt-occupants">{renderChip(starting)}</div>
                      </td>
                    )
                  }

                  const here = dayEntries.filter((e) => !isSafe(e, dayEntries) && e.slots.includes(slot))
                  return (
                    <td key={day} className="tt-cell editable" onClick={() => setAddTarget({ day, slot })}>
                      <div className="tt-occupants">{here.map(renderChip)}</div>
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
