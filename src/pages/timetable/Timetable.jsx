import { useEffect, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../../context/AuthContext'
import { TIME_SLOTS, colorForName } from './constants'
import AddClassModal from './AddClassModal'
import './timetable.css'

const DAYS = ['월', '화', '수', '목', '금']

// Assigns each entry a lane (side-by-side column) so overlapping entries render
// next to each other instead of splitting into per-row chips.
function layoutDayEntries(dayEntries) {
  const withIdx = dayEntries
    .map((e) => ({
      ...e,
      start: TIME_SLOTS.indexOf(e.slots[0]),
      end: TIME_SLOTS.indexOf(e.slots[e.slots.length - 1]),
    }))
    .sort((a, b) => a.start - b.start)

  const positioned = []
  let cluster = []
  let clusterMaxEnd = -1

  const flush = () => {
    if (cluster.length === 0) return
    const laneEnds = []
    for (const e of cluster) {
      let lane = laneEnds.findIndex((end) => end < e.start)
      if (lane === -1) {
        lane = laneEnds.length
        laneEnds.push(e.end)
      } else {
        laneEnds[lane] = e.end
      }
      e.lane = lane
    }
    const numLanes = laneEnds.length
    cluster.forEach((e) => positioned.push({ ...e, numLanes }))
    cluster = []
  }

  for (const e of withIdx) {
    if (cluster.length > 0 && e.start > clusterMaxEnd) flush()
    cluster.push(e)
    clusterMaxEnd = Math.max(clusterMaxEnd, e.end)
  }
  flush()

  return positioned
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
        <div className="tt-grid" style={{ gridTemplateRows: `40px repeat(${TIME_SLOTS.length}, 56px)` }}>
          <div className="tt-grid-corner" style={{ gridColumn: 1, gridRow: 1 }} />
          {DAYS.map((d, di) => (
            <div key={d} className="tt-grid-day-label" style={{ gridColumn: di + 2, gridRow: 1 }}>
              {d}
            </div>
          ))}
          {TIME_SLOTS.map((slot, si) => (
            <div key={slot} className="tt-grid-time-label" style={{ gridColumn: 1, gridRow: si + 2 }}>
              {slot}
            </div>
          ))}

          {DAYS.map((day) =>
            TIME_SLOTS.map((slot, si) => (
              <div
                key={day + slot}
                className="tt-grid-bg-cell"
                style={{ gridColumn: DAYS.indexOf(day) + 2, gridRow: si + 2 }}
                onClick={() => setAddTarget({ day, slot })}
              />
            ))
          )}

          {DAYS.map((day, di) =>
            layoutDayEntries(visibleEntries.filter((e) => e.day === day)).map((e) => (
              <div
                key={e.id}
                className="tt-grid-entry"
                style={{
                  gridColumn: di + 2,
                  gridRow: `${e.start + 2} / span ${e.end - e.start + 1}`,
                  width: `calc(${100 / e.numLanes}% - 3px)`,
                  marginLeft: `calc(${100 / e.numLanes}% * ${e.lane})`,
                  background: colorForName(e.name),
                }}
                title={e.name}
              >
                <span className="tt-grid-entry-name">{e.name}</span>
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
              </div>
            ))
          )}
        </div>
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
