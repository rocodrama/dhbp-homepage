// 빈 상태와 로딩. 컴포넌트로 뽑을 값이 있는 건 이 둘뿐이다.
//
// EmptyState: 7곳이 같은 마크업을 복제하고 있었고, 그중 진짜 문제는 mascot 경로가
// 7번 반복된 것이다 — 이미지를 바꾸려면 7곳을 고쳐야 했다.
// Loading: 같은 한국어 문자열이 8개 파일에 흩어져 있었다. 나중에 번역하거나
// 스켈레톤으로 바꿀 때 찾아야 할 자리가 하나여야 한다.
//
// ErrorBoundary 는 여기 쓰지 않는다 — 제목 + 에러 메시지라 모양이 다르고,
// 라우터 밖에 마운트되어 있어서 의존성을 늘리지 않는 게 낫다.

export function EmptyState({ children }) {
  return (
    <div className="empty-state">
      <img src="/images/mascot.png" alt="" />
      <p>{children}</p>
    </div>
  )
}

export function Loading() {
  return <p className="loading-text">불러오는 중...</p>
}
