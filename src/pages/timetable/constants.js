function pad(n) {
  return String(n).padStart(2, '0')
}

function generateSlots(startHour, endHour, stepMinutes) {
  const slots = []
  for (let m = startHour * 60; m < endHour * 60; m += stepMinutes) {
    const from = `${pad(Math.floor(m / 60))}:${pad(m % 60)}`
    const to = `${pad(Math.floor((m + stepMinutes) / 60))}:${pad((m + stepMinutes) % 60)}`
    slots.push(`${from}-${to}`)
  }
  return slots
}

export const TIME_SLOTS = generateSlots(9, 19, 30)

const PERSON_COLORS = [
  '#1B4B9C', '#F26522', '#2E9E64', '#8E44AD',
  '#D94F70', '#3AAFA9', '#C08A2E', '#5C6AC4',
  '#E4572E', '#0F9B8E',
]

export function colorForName(name) {
  let hash = 0
  for (let i = 0; i < (name || '').length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  }
  return PERSON_COLORS[hash % PERSON_COLORS.length]
}
