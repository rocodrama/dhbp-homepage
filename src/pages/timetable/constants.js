export const TIME_SLOTS = ['09-10', '10-11', '11-12', '13-14', '14-15', '15-16', '16-17', '17-18']

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
