import { DAYS, TIME_SLOTS } from './constants.js'

// 이름마다 레인(좌우로 나란한 칸)을 배정한다. 같은 사람의 블록은 하루 종일
// 같은 폭·같은 위치에 놓이고, 시간이 실제로 겹치는 이름끼리만 다른 레인으로 밀린다.
//
// 레인 순서는 (점유 시간 내림차순, 첫 시작 시각, 이름). 예전엔 이름순이라
// 목요일 9~12시 3명 사이에 10~11시 1명이 끼어들어 긴 블록들을 갈라놓았다.
// 긴 일정이 왼쪽을 차지하고 짧은 일정이 오른쪽으로 밀리도록 바꿨다.
export function layoutDayEntries(dayEntries) {
  const withIdx = dayEntries.map((e) => ({
    ...e,
    start: TIME_SLOTS.indexOf(e.slots[0]),
    end: TIME_SLOTS.indexOf(e.slots[e.slots.length - 1]),
  }))

  const slotsByName = {}
  withIdx.forEach((e) => {
    const set = (slotsByName[e.name] ??= new Set())
    for (let i = e.start; i <= e.end; i++) set.add(i)
  })

  const conflicts = (a, b) => {
    for (const i of slotsByName[a]) if (slotsByName[b].has(i)) return true
    return false
  }

  const firstSlot = (name) => Math.min(...slotsByName[name])
  const ordered = Object.keys(slotsByName).sort(
    (a, b) =>
      slotsByName[b].size - slotsByName[a].size ||
      firstSlot(a) - firstSlot(b) ||
      a.localeCompare(b)
  )

  const laneOfName = {}
  const laneOccupants = [] // laneOccupants[lane] = 그 레인에 이미 배정된 이름들
  for (const name of ordered) {
    let lane = laneOccupants.findIndex((names) => !names.some((other) => conflicts(name, other)))
    if (lane === -1) {
      lane = laneOccupants.length
      laneOccupants.push([])
    }
    laneOccupants[lane].push(name)
    laneOfName[name] = lane
  }

  const numLanes = laneOccupants.length || 1
  return withIdx.map((e) => ({ ...e, lane: laneOfName[e.name], numLanes }))
}

// 주 전체에서 가장 레인이 많은 날을 기준으로 폭을 통일한다.
// 하루 단위로 폭을 잡으면 한 명뿐인 날은 블록이 칸을 꽉 채워버린다 —
// 좁은 폭으로 왼쪽에 붙이고 오른쪽은 비워두는 편이 보기 좋다.
export function layoutWeek(entries, days = DAYS) {
  const byDay = {}
  let numLanes = 1
  for (const day of days) {
    const laid = layoutDayEntries(entries.filter((e) => e.day === day))
    byDay[day] = laid
    if (laid.length) numLanes = Math.max(numLanes, laid[0].numLanes)
  }
  return { byDay, numLanes }
}
