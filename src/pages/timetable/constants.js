import { pad } from '../calendar/dateUtils.js'

export const DAYS = ['월', '화', '수', '목', '금']

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

// 파스텔 톤. 배경이 밝으므로 글씨는 --color-text-dark 로 얹는다(대비 7:1 이상).
export const PERSON_COLORS = [
  '#A8C7F0', '#FFC9A8', '#A8DEC0', '#D4BBEE',
  '#F5B8CB', '#A8DEDA', '#EBD5A0', '#BFC4EE',
  '#FFBBA8', '#A8D8D0', '#B7C7DE', '#DCC1AB',
  '#C7DBAE', '#EEB8E4',
]

// 이름 문자열로 색을 고정한다. 예전엔 정렬된 전체 이름 배열의 인덱스를 써서
// 이름이 하나 추가되면 그 뒤 모든 사람의 색이 바뀌었다.
export function colorForName(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  return PERSON_COLORS[hash % PERSON_COLORS.length]
}
