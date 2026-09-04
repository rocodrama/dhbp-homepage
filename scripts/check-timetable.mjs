// 프레임워크 없는 자체 검증: node scripts/check-timetable.mjs
import assert from 'node:assert/strict'
import { TIME_SLOTS } from '../src/pages/timetable/constants.js'
import { layoutDayEntries } from '../src/pages/timetable/layout.js'

const slot = (from, to) => TIME_SLOTS.slice(TIME_SLOTS.indexOf(from), TIME_SLOTS.indexOf(to) + 1)
const laneOf = (out, name) => out.find((e) => e.name === name).lane

// 사용자가 지적한 목요일: 9~12시 3명 + 10~11시 1명.
// 짧은 일정이 긴 3명 사이에 끼면 안 되고 맨 오른쪽으로 밀려야 한다.
const long = slot('09:00-09:30', '11:30-12:00')
const short = slot('10:00-10:30', '10:30-11:00')
const out = layoutDayEntries([
  { id: 1, name: '가영', slots: long },
  { id: 2, name: '나윤', slots: short },
  { id: 3, name: '다은', slots: long },
  { id: 4, name: '라희', slots: long },
])

assert.equal(out[0].numLanes, 4)
assert.equal(laneOf(out, '나윤'), 3, '짧은 일정이 맨 오른쪽 레인이어야 한다')
assert.deepEqual(
  ['가영', '다은', '라희'].map((n) => laneOf(out, n)),
  [0, 1, 2],
  '긴 일정 3개가 끊기지 않고 왼쪽부터 이어져야 한다'
)

// 같은 이름은 하루 동안 같은 레인을 유지한다
const same = layoutDayEntries([
  { id: 1, name: '가영', slots: slot('09:00-09:30', '10:00-10:30') },
  { id: 2, name: '가영', slots: slot('14:00-14:30', '15:00-15:30') },
  { id: 3, name: '나윤', slots: slot('09:00-09:30', '10:00-10:30') },
])
assert.equal(laneOf(same, '가영'), same.filter((e) => e.name === '가영')[1].lane)
assert.notEqual(laneOf(same, '가영'), laneOf(same, '나윤'))

// 겹치지 않으면 같은 레인을 공유한다
const seq = layoutDayEntries([
  { id: 1, name: '가영', slots: slot('09:00-09:30', '09:30-10:00') },
  { id: 2, name: '나윤', slots: slot('10:00-10:30', '10:30-11:00') },
])
assert.equal(seq[0].numLanes, 1)

console.log('시간표 레이아웃 검증 통과')

// ---- 주 전체 기준 폭 (혼자인 날은 좁게 왼쪽 정렬) ----
import { layoutWeek } from '../src/pages/timetable/layout.js'

const week = layoutWeek(
  [
    // 화요일: 3명이 겹침 -> numLanes 3
    { id: 1, name: '가영', day: '화', slots: slot('09:00-09:30', '10:00-10:30') },
    { id: 2, name: '나윤', day: '화', slots: slot('09:00-09:30', '10:00-10:30') },
    { id: 3, name: '다은', day: '화', slots: slot('09:00-09:30', '10:00-10:30') },
    // 월요일: 혼자
    { id: 4, name: '가영', day: '월', slots: slot('09:00-09:30', '10:00-10:30') },
  ],
  ['월', '화', '수', '목', '금']
)
assert.equal(week.numLanes, 3, '주 전체에서 가장 붐비는 날 기준으로 폭이 통일돼야 한다')
// 렌더에는 week.numLanes(주 전체 값)를 쓴다 — 혼자인 날도 같은 폭이라 왼쪽으로 좁게 붙는다
assert.equal(week.numLanes, 3)
assert.equal(week.byDay['월'][0].lane, 0)

console.log('시간표 주 단위 레이아웃 검증 통과')

// ---- 모바일 요일 탭: 하루만 넘기면 그날 기준으로 폭이 잡힌다 ----
const oneDay = layoutWeek(
  [
    { id: 1, name: '가영', day: '월', slots: slot('09:00-09:30', '10:00-10:30') },
    // 다른 날이 붐벼도 월요일 폭에 영향을 주면 안 된다
    { id: 2, name: '나윤', day: '화', slots: slot('09:00-09:30', '10:00-10:30') },
    { id: 3, name: '다은', day: '화', slots: slot('09:00-09:30', '10:00-10:30') },
  ],
  ['월']
)
assert.equal(oneDay.numLanes, 1, '하루만 볼 때는 그날 레인 수만 반영해야 한다')
assert.deepEqual(Object.keys(oneDay.byDay), ['월'])

console.log('시간표 단일 요일 레이아웃 검증 통과')
