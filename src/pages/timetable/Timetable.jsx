import { useEffect, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../../context/AuthContext'
import { DAYS, TIME_SLOTS, colorForName } from './constants'
import { layoutWeek } from './layout'
import AddClassModal from './AddClassModal'
import PersonModal from './PersonModal'
import './timetable.css'

function slotKey(day, slot) {
  return `${day}__${slot}`
}

// Splits a set of selected (day, slot) keys into contiguous per-day runs,
// so one multi-select action can create several non-contiguous blocks at once.
function groupSelection(selectedKeys) {
  const byDay = {}
  for (const key of selectedKeys) {
    const [day, slot] = key.split('__')
    const idx = TIME_SLOTS.indexOf(slot)
    ;(byDay[day] ??= []).push(idx)
  }
  const runs = []
  for (const [day, idxs] of Object.entries(byDay)) {
    idxs.sort((a, b) => a - b)
    let runStart = idxs[0]
    let prev = idxs[0]
    for (let i = 1; i <= idxs.length; i++) {
      const cur = idxs[i]
      if (cur === prev + 1) {
        prev = cur
        continue
      }
      runs.push({ day, slots: TIME_SLOTS.slice(runStart, prev + 1) })
      if (cur !== undefined) {
        runStart = cur
        prev = cur
      }
    }
  }
  return runs
}

export default function Timetable() {
  const { user } = useAuth()
  const [filterName, setFilterName] = useState('all')
  const [entries, setEntries] = useState([])
  const [addTarget, setAddTarget] = useState(null) // { day, slot } | null
  const [selectMode, setSelectMode] = useState(false)
  const [selected, setSelected] = useState(new Set())
  const [multiName, setMultiName] = useState('')
  const [clicked, setClicked] = useState(null) // { name, id } | null

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'timetableEntries'), (snap) => {
      setEntries(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [])

  const names = [...new Set(entries.map((e) => e.name))].sort()
  const visibleEntries = entries.filter((e) => filterName === 'all' || e.name === filterName)
  // 클릭 시점 스냅샷을 들고 있으면 실시간 반영이 끊긴다(9b52c6f와 같은 함정).
  // 이름만 저장하고 매 렌더마다 다시 필터한다.
  const selectedName = clicked?.name ?? null
  const selectedEntries = selectedName ? entries.filter((e) => e.name === selectedName) : []
  // 폭은 주 전체 기준으로 통일한다(한 명뿐인 날도 좁게 왼쪽 정렬)
  const { byDay, numLanes } = layoutWeek(visibleEntries, DAYS)

  const handleAddClass = async (name, day, slots, label = '') => {
    await addDoc(collection(db, 'timetableEntries'), {
      name,
      day,
      slots,
      label,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
    })
  }

  const handleDeleteEntry = async (entry) => {
    if (!confirm(`"${entry.name}"의 ${entry.day}요일 일정을 삭제할까요?`)) return
    await deleteDoc(doc(db, 'timetableEntries', entry.id))
  }

  const toggleSelect = (day, slot) => {
    const key = slotKey(day, slot)
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const handleCellClick = (day, slot) => {
    if (selectMode) toggleSelect(day, slot)
    else setAddTarget({ day, slot })
  }

  const cancelSelectMode = () => {
    setSelectMode(false)
    setSelected(new Set())
    setMultiName('')
  }

  const handleMultiSubmit = async (e) => {
    e.preventDefault()
    if (!multiName.trim() || selected.size === 0) return
    const runs = groupSelection(selected)
    await Promise.all(
      runs.map((r) =>
        addDoc(collection(db, 'timetableEntries'), {
          name: multiName.trim(),
          day: r.day,
          slots: r.slots,
          label: '',
          createdBy: user.uid,
          createdAt: serverTimestamp(),
        })
      )
    )
    cancelSelectMode()
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

        {!selectMode ? (
          <>
            <button className="new-btn" onClick={() => setAddTarget({ day: DAYS[0], slot: TIME_SLOTS[0] })}>
              시간표 추가
            </button>
            <button className="btn-secondary" onClick={() => setSelectMode(true)}>
              여러 칸 한번에 추가
            </button>
          </>
        ) : (
          <form className="tt-multi-bar" onSubmit={handleMultiSubmit}>
            <span className="tt-multi-count">선택 {selected.size}칸</span>
            <input value={multiName} onChange={(e) => setMultiName(e.target.value)} placeholder="이름" autoFocus />
            <button type="submit" className="btn-primary" disabled={selected.size === 0}>
              추가
            </button>
            <button type="button" className="btn-secondary" onClick={cancelSelectMode}>
              취소
            </button>
          </form>
        )}
      </div>

      {selectMode && <p className="tt-multi-hint">추가할 칸들을 클릭해서 선택한 다음, 이름을 입력하고 추가를 눌러줘.</p>}

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
              {slot.split('-')[0]}
            </div>
          ))}

          {DAYS.map((day, di) =>
            TIME_SLOTS.map((slot, si) => {
              const isSelected = selected.has(slotKey(day, slot))
              return (
                <div
                  key={day + slot}
                  className={'tt-grid-bg-cell' + (isSelected ? ' selected' : '')}
                  style={{ gridColumn: di + 2, gridRow: si + 2 }}
                  onClick={() => handleCellClick(day, slot)}
                />
              )
            })
          )}

          {DAYS.map((day, di) =>
            byDay[day].map((e) => (
              <div
                key={e.id}
                className="tt-grid-entry"
                style={{
                  gridColumn: di + 2,
                  gridRow: `${e.start + 2} / span ${e.end - e.start + 1}`,
                  width: `calc(${100 / numLanes}% - 3px)`,
                  marginLeft: `calc(${100 / numLanes}% * ${e.lane})`,
                  background: colorForName(e.name),
                  pointerEvents: selectMode ? 'none' : 'auto',
                }}
                title={e.label ? `${e.name} · ${e.label}` : e.name}
                onClick={() => setClicked({ name: e.name, id: e.id })}
              >
                <span className="tt-grid-entry-name">{e.name}</span>
                {e.label && <span className="tt-grid-entry-badge" />}
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

      {selectedName && selectedEntries.length > 0 && (
        <PersonModal
          name={selectedName}
          entries={selectedEntries}
          focusId={clicked.id}
          onDelete={handleDeleteEntry}
          onClose={() => setClicked(null)}
        />
      )}

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
