import { useEffect, useMemo, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../../firebase'
import { WEEKDAYS, getMonthMatrix, todayStr, datesInRange } from './dateUtils'
import DayModal from './DayModal'
import './calendar.css'

export default function CalendarPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth()) // 0-indexed
  const [events, setEvents] = useState([])
  const [openDate, setOpenDate] = useState(null)

  useEffect(() => {
    const q = query(collection(db, 'events'), orderBy('startDate'))
    const unsub = onSnapshot(q, (snap) => {
      setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [])

  const eventsByDate = useMemo(() => {
    const map = {}
    events.forEach((ev) => {
      datesInRange(ev.startDate, ev.endDate).forEach((d) => {
        ;(map[d] ??= []).push(ev)
      })
    })
    return map
  }, [events])

  const upcoming = useMemo(() => {
    const today = todayStr()
    return events.filter((ev) => (ev.endDate || ev.startDate) >= today).slice(0, 8)
  }, [events])

  const weeks = getMonthMatrix(year, month)
  const goPrev = () => (month === 0 ? (setYear(year - 1), setMonth(11)) : setMonth(month - 1))
  const goNext = () => (month === 11 ? (setYear(year + 1), setMonth(0)) : setMonth(month + 1))
  const today = todayStr()

  return (
    <div>
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
          onClose={() => setOpenDate(null)}
        />
      )}
    </div>
  )
}
