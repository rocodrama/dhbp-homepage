import { useEffect, useMemo, useState } from 'react'
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../../context/AuthContext'
import { WEEKDAYS, getMonthMatrix, todayStr, datesInRange } from './dateUtils'
import DayModal from './DayModal'
import './calendar.css'

// 기본 캘린더. 문서 없이 항상 존재하고, calendar 필드가 없는 옛 일정도 여기로 본다.
const OFFICIAL = '공식'
const ADD_SENTINEL = '__add'

export default function CalendarPage() {
  const { user } = useAuth()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth()) // 0-indexed
  const [events, setEvents] = useState([])
  const [calendars, setCalendars] = useState([])
  const [cal, setCal] = useState(OFFICIAL)
  const [openDate, setOpenDate] = useState(null)

  useEffect(() => {
    const q = query(collection(db, 'events'), orderBy('startDate'))
    const unsub = onSnapshot(q, (snap) => {
      setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [])

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'calendars'), (snap) => {
      setCalendars(snap.docs.map((d) => d.data().name))
    })
    return unsub
  }, [])

  // calendars 문서가 지워졌어도 일정이 남아 있으면 드롭박스에 남긴다
  const calNames = [...new Set([...calendars, ...events.map((ev) => ev.calendar).filter(Boolean)])]
    .filter((n) => n !== OFFICIAL)
    .sort()

  const shown = useMemo(() => events.filter((ev) => (ev.calendar || OFFICIAL) === cal), [events, cal])

  const handleCalChange = async (e) => {
    const value = e.target.value
    // 상태가 안 바뀌면 리렌더가 없어서 '+ 인원 추가'가 선택된 채 남는다 —
    // 먼저 현재 값으로 되돌려두고, 성공하면 setCal이 다시 맞춰준다.
    e.target.value = cal
    if (value !== ADD_SENTINEL) {
      setCal(value)
      return
    }
    const name = prompt('추가할 인원 이름')?.trim()
    if (!name) return
    // 이미 있는 이름이면 만들지 않고 그 캘린더로 이동만 한다
    if (name !== OFFICIAL && !calNames.includes(name)) {
      await addDoc(collection(db, 'calendars'), {
        name,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      })
    }
    setCal(name)
  }

  const eventsByDate = useMemo(() => {
    const map = {}
    shown.forEach((ev) => {
      datesInRange(ev.startDate, ev.endDate).forEach((d) => {
        ;(map[d] ??= []).push(ev)
      })
    })
    return map
  }, [shown])

  const upcoming = useMemo(() => {
    const today = todayStr()
    return shown.filter((ev) => (ev.endDate || ev.startDate) >= today).slice(0, 8)
  }, [shown])

  const weeks = getMonthMatrix(year, month)
  const goPrev = () => (month === 0 ? (setYear(year - 1), setMonth(11)) : setMonth(month - 1))
  const goNext = () => (month === 11 ? (setYear(year + 1), setMonth(0)) : setMonth(month + 1))
  const today = todayStr()

  return (
    <div>
      <div className="cal-controls">
        <select value={cal} onChange={handleCalChange}>
          <option value={OFFICIAL}>{OFFICIAL}</option>
          {calNames.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
          <option value={ADD_SENTINEL}>+ 인원 추가</option>
        </select>
      </div>

      <div className="cal-header">
        <button onClick={goPrev}>‹</button>
        <h2>
          {year}년 {month + 1}월
        </h2>
        <button onClick={goNext}>›</button>
      </div>

      <div className="cal-grid">
        <div className="cal-row">
          {WEEKDAYS.map((w) => (
            <div className="cal-weekday" key={w}>
              {w}
            </div>
          ))}
        </div>
        {weeks.map((week, i) => (
          <div className="cal-row" key={i}>
            {week.map((dateStr, j) => {
              if (!dateStr) return <div key={j} />
              const dayEvents = eventsByDate[dateStr] || []
              return (
                <button
                  key={j}
                  className={
                    'cal-cell' +
                    (dayEvents.length ? ' has-events' : '') +
                    (dateStr === today ? ' today' : '')
                  }
                  onClick={() => setOpenDate(dateStr)}
                >
                  <span>{Number(dateStr.slice(-2))}</span>
                  {dayEvents.length > 0 && <span className="cal-dot" />}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      <h3 className="section-title">다가오는 일정</h3>
      {upcoming.length === 0 ? (
        <p style={{ color: 'var(--color-text-gray)', fontSize: 13 }}>다가오는 일정이 없어요.</p>
      ) : (
        <div className="item-list">
          {upcoming.map((ev) => (
            <div
              className="item-row"
              key={ev.id}
              onClick={() => setOpenDate(ev.startDate)}
              style={{ cursor: 'pointer' }}
            >
              <span className="item-row-title">
                {ev.startDate}
                {ev.endDate && ev.endDate !== ev.startDate ? ` ~ ${ev.endDate}` : ''}
                {ev.time && ` · ${ev.time}`} — {ev.title}
              </span>
              <span className="item-row-meta">{ev.authorName}</span>
            </div>
          ))}
        </div>
      )}

      {openDate && (
        <DayModal
          dateStr={openDate}
          events={eventsByDate[openDate] || []}
          calendar={cal}
          onClose={() => setOpenDate(null)}
        />
      )}
    </div>
  )
}
