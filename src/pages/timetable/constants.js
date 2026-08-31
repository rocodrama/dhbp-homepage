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

export const PERSON_COLORS = [
  '#1B4B9C', '#F26522', '#2E9E64', '#8E44AD',
  '#D94F70', '#3AAFA9', '#C08A2E', '#5C6AC4',
  '#E4572E', '#0F9B8E', '#3D5A80', '#9C6644',
  '#588157', '#B5179E',
]
