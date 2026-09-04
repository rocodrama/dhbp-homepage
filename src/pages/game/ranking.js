// 등수 기반 게임(경주·주사위·생존게임)이 공유하는 순위 계산.

// 참가자 수보다 큰 등수가 설정돼 있으면 꼴등으로 당겨준다.
// (등수를 5등으로 잡아두고 참가자를 3명으로 줄이는 경우)
export function clampRank(rank, count) {
  return Math.min(Math.max(rank, 1), Math.max(count, 1))
}

// 이미 정렬된 배열에 공동 등수를 매긴다 — 동점이면 1, 2, 2, 4 식.
// sameAs(a, b)가 true면 앞사람과 같은 등수.
export function withRanks(sorted, sameAs) {
  let rank = 0
  return sorted.map((row, i) => {
    if (i === 0 || !sameAs(sorted[i - 1], row)) rank = i + 1
    return { ...row, rank }
  })
}
