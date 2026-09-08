export const STATUSES = ['접수', '처리중', '완료']

// 접수는 아직 아무 일도 일어나지 않은 상태다 — 중립이 맞다.
export const STATUS_TONE = {
  접수: 'neutral',
  처리중: 'busy',
  완료: 'ok',
}
