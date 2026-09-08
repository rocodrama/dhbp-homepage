// 직책은 목록의 정렬 순서이기도 하다 — 배열 순서가 곧 위계다.
export const POSITIONS = ['교수', '박사과정', '석사과정', '학사과정']

// 이름은 자유 입력이다(가입 여부 무관). timetableEntries·tasks 의 이름 입력과 같은
// 방식이고, 계정 uid 와 연결하지 않는다 — 아직 가입하지 않은 인원도 명부에 있다.
export const emptyMember = {
  name: '',
  birthDate: '',
  studentId: '',
  researcherId: '',
  email: '',
  position: '',
}

export function sortMembers(list) {
  return [...list].sort((a, b) => {
    const pa = POSITIONS.indexOf(a.position)
    const pb = POSITIONS.indexOf(b.position)
    // 목록에 없는 직책은 맨 뒤로
    const ra = pa === -1 ? POSITIONS.length : pa
    const rb = pb === -1 ? POSITIONS.length : pb
    if (ra !== rb) return ra - rb
    return (a.name ?? '').localeCompare(b.name ?? '', 'ko')
  })
}
