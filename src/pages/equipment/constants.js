export const EQUIPMENT_TYPES = ['공용장비', '개인 PC']
export const EQUIPMENT_STATUSES = ['사용가능', '사용중', '고장']

// 배지 색은 CSS 가 소유한다. hex 를 내보내면 style={{}} 로 새고, 알 수 없는 상태값이
// 오면 STATUS_COLOR[x] + '22' 가 문자열 "undefined22" 가 됐다.
// 여기서 매칭이 안 되면 data-tone 이 없는 채로 렌더되고, .status-badge 의 맨 규칙이
// 중립 외형을 준다.
export const STATUS_TONE = {
  사용가능: 'ok',
  사용중: 'busy',
  고장: 'broken',
}
