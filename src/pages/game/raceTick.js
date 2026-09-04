// 경주 한 틱. React state 밖에서 돌리는 순수 시뮬레이션 —
// setState 업데이터 안에서 Math.random을 쓰면 StrictMode 이중 호출로
// 도착 순서가 어긋난다.

// occasional burst / stumble keeps the lead uncertain until the end.
// 100을 넘겨도 자르지 않는다 — 같은 틱에 둘이 들어오면 초과분으로 순서를 가린다.
export function advance(racers, rnd = Math.random) {
  for (const r of racers) {
    if (r.progress < 100) r.progress += rnd() * 5.5 + (rnd() < 0.12 ? 4 : 0)
  }
  return racers
}

// 이번 틱에 새로 도착한 사람을 도착 순서대로 order에 쌓는다.
// 1등이 나와도 멈추지 않고 전원이 들어올 때까지 계속 부른다.
export function collectFinished(racers, order) {
  racers
    .filter((r) => r.progress >= 100 && !order.includes(r.name))
    .sort((a, b) => b.progress - a.progress)
    .forEach((r) => order.push(r.name))
  return order
}
