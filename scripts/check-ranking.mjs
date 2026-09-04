// 프레임워크 없는 자체 검증: node scripts/check-ranking.mjs
import assert from 'node:assert/strict'
import { clampRank, withRanks } from '../src/pages/game/ranking.js'

// 참가자 수가 줄면 설정해둔 등수는 꼴등으로 당겨진다
assert.equal(clampRank(5, 3), 3)
assert.equal(clampRank(2, 3), 2)
assert.equal(clampRank(1, 0), 1, '참가자가 없어도 1등은 유효해야 한다')

// 동점은 공동 등수 — 1, 2, 2, 4 (3등은 비어 있다)
const sorted = [{ t: 12 }, { t: 9 }, { t: 9 }, { t: 4 }]
const ranked = withRanks(sorted, (a, b) => a.t === b.t)
assert.deepEqual(
  ranked.map((r) => r.rank),
  [1, 2, 2, 4]
)

// 전원 동점이면 모두 1등
const flat = withRanks([{ t: 7 }, { t: 7 }, { t: 7 }], (a, b) => a.t === b.t)
assert.deepEqual(
  flat.map((r) => r.rank),
  [1, 1, 1]
)

// 동점이 없으면 그냥 1..n
const strict = withRanks([{ t: 3 }, { t: 2 }, { t: 1 }], (a, b) => a.t === b.t)
assert.deepEqual(
  strict.map((r) => r.rank),
  [1, 2, 3]
)

// 생존게임: 늦게 탈락할수록 높은 등수, 같은 라운드 탈락자는 공동 등수
const survival = withRanks(
  [
    { name: '가', out: Infinity },
    { name: '나', out: 3 },
    { name: '다', out: 2 },
    { name: '라', out: 2 },
  ],
  (a, b) => a.out === b.out
)
assert.deepEqual(
  survival.map((r) => r.rank),
  [1, 2, 3, 3]
)

console.log('내기 게임 순위 계산 검증 통과')

// ---- 경주: 1등이 나와도 멈추지 않고 전원이 도착해야 한다 ----
import { advance, collectFinished } from '../src/pages/game/raceTick.js'

const names = ['가영', '나윤', '다은', '라희', '마루']
const state = names.map((name) => ({ name, progress: 0 }))
const order = []
let ticks = 0
while (order.length < state.length) {
  advance(state)
  collectFinished(state, order)
  ticks += 1
  assert.ok(ticks < 1000, '경주가 끝나지 않는다')
}
assert.deepEqual([...order].sort(), [...names].sort(), '전원이 정확히 한 번씩 도착해야 한다')
assert.equal(new Set(order).size, names.length, '같은 사람이 두 번 기록되면 안 된다')

// 같은 틱에 둘이 100을 넘으면 초과분이 큰 쪽이 앞선다
const tie = [
  { name: '앞', progress: 105 },
  { name: '뒤', progress: 101 },
]
assert.deepEqual(collectFinished(tie, []), ['앞', '뒤'])

// 100을 넘긴 사람은 더 전진하지 않는다(도착 순서 고정)
const done = [{ name: '끝', progress: 103 }]
advance(done, () => 0.5)
assert.equal(done[0].progress, 103)

console.log('경주 도착 순서 검증 통과')
