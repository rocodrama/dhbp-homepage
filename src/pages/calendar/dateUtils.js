export const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

export function pad(n) {
  return String(n).padStart(2, '0')
}

export function toDateStr(year, month, day) {
  return `${year}-${pad(month + 1)}-${pad(day)}`
}

export function todayStr() {
  const d = new Date()
  return toDateStr(d.getFullYear(), d.getMonth(), d.getDate())
}

// returns array of dateStr from start to end (inclusive), for multi-day events
export function datesInRange(start, end) {
  const dates = []
  let cur = new Date(start + 'T00:00:00')
  const last = new Date((end || start) + 'T00:00:00')
  while (cur <= last) {
    dates.push(toDateStr(cur.getFullYear(), cur.getMonth(), cur.getDate()))
    cur.setDate(cur.getDate() + 1)
  }
  return dates
}

// returns array of weeks; each week is an array of 7 entries: dateStr or null
export function getMonthMatrix(year, month) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(toDateStr(year, month, d))
  while (cells.length % 7 !== 0) cells.push(null)

  const weeks = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}
