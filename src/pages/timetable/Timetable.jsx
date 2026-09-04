import { useEffect, useState, useSyncExternalStore } from 'react'
import { addDoc, collection, deleteDoc, doc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../../context/AuthContext'
import { DAYS, TIME_SLOTS, colorForName } from './constants'
import { layoutWeek } from './layout'
import AddClassModal from './AddClassModal'
import EntryModal from './EntryModal'
import './timetable.css'

function slotKey(day, slot) {
  return `${day}__${slot}`
}

// AppShell과 같은 브레이크포인트. 모바일에서는 요일 탭으로 하루씩만 보여준다.
const MQ = window.matchMedia('(max-width: 768px)')
const subscribeMQ = (cb) => {
  MQ.addEventListener('change', cb)
  return () => MQ.removeEventListener('change', cb)
}

// 오늘이 주말이면 월요일부터
const todayDay = DAYS[new Date().getDay() - 1] ?? DAYS[0]

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
  const [clickedId, setClickedId] = useState(null)
  const narrow = useSyncExternalStore(subscribeMQ, () => MQ.matches)
  const [mobileDay, setMobileDay] = useState(todayDay)

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
  // id만 들고 있다가 매 렌더마다 다시 찾는다 — 클릭 시점 스냅샷을 들고 있으면
  // 실시간 반영이 끊긴다(9b52c6f와 같은 함정).
  const clickedEntry = clickedId ? entries.find((e) => e.id === clickedId) : null
  // 폭은 보이는 날들 기준으로 통일한다(한 명뿐인 날도 좁게 왼쪽 정렬).
  // 모바일은 하루만 보이니 그날 기준 -> 블록이 칸을 넓게 쓴다.
  const shownDays = narrow ? [mobileDay] : DAYS
  const { byDay, numLanes } = layoutWeek(visibleEntries, shownDays)

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
            <button className="new-btn" onClick={() => setAddTarget({ day: shownDays[0], slot: TIME_SLOTS[0] })}>
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

      {narrow && (
        <div className="tt-day-tabs">
          {DAYS.map((d) => (
            <button
              key={d}
              type="button"
              className={'tt-day-tab' + (d === mobileDay ? ' active' : '')}
              onClick={() => setMobileDay(d)}
            >
              {d}
            </button>
          ))}
        </div>
      )}

      <div className="tt-table-wrap">
        <div
          className="tt-grid"
          style={{
            gridTemplateColumns: `${narrow ? 44 : 56}px repeat(${shownDays.length}, minmax(${narrow ? 0 : 130}px, 1fr))`,
            gridTemplateRows: `40px repeat(${TIME_SLOTS.length}, ${narrow ? 48 : 56}px)`,
          }}
        >
          <div className="tt-grid-corner" style={{ gridColumn: 1, gridRow: 1 }} />
          {shownDays.map((d, di) => (
            <div key={d} className="tt-grid-day-label" style={{ gridColumn: di + 2, gridRow: 1 }}>
              {d}
            </div>
          ))}
          {TIME_SLOTS.map((slot, si) => (
            <div key={slot} className="tt-grid-time-label" style={{ gridColumn: 1, gridRow: si + 2 }}>
              {slot.split('-')[0]}
            </div>
          ))}

          {shownDays.map((day, di) =>
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

          {shownDays.map((day, di) =>
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
                onClick={() => setClickedId(e.id)}
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

      {clickedEntry && (
        <EntryModal
          entry={clickedEntry}
          onDelete={handleDeleteEntry}
          onClose={() => setClickedId(null)}
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
