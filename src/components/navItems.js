export const NAV_ITEMS = [
  { path: '/', label: '홈', icon: '🏠' },
  { path: '/manual', label: '매뉴얼', icon: '📖' },
  { path: '/board', label: '공지사항/게시판', icon: '📋' },
  { path: '/equipment', label: '장비 현황', icon: '🖥️' },
  { path: '/calendar', label: '일정/캘린더', icon: '📅' },
  { path: '/timetable', label: '학기 시간표', icon: '🗂️' },
  { path: '/checklist', label: '미션 체크', icon: '✅' },
  { path: '/lunch-map', label: '점심메뉴 지도', icon: '🍜' },
  { path: '/game', label: '내기 게임', icon: '🎲' },
  { path: '/complaints', label: '민원처리함', icon: '💬' },
  { path: '/admin/users', label: '회원 관리', icon: '🛡️', adminOnly: true },
]

export function visibleNavItems(isAdmin) {
  return NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin)
}
