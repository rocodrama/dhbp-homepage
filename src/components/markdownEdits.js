// MarkdownEditor의 순수 문자열 로직. DOM을 건드리지 않아 node로 검증할 수 있다
// (scripts/check-markdown.mjs).

// 커서가 놓인 줄의 시작 위치
export function lineStartOf(value, pos) {
  return value.lastIndexOf('\n', pos - 1) + 1
}

// 목록/인용/체크박스 줄이면 다음 줄에 이어붙일 마커를 계산한다.
// 마커만 있고 내용이 비어 있으면 isEmpty — 그 경우 마커를 지우고 목록을 끝낸다.
export function listContinuation(line) {
  const m = line.match(/^(\s*)(>\s?|[-*+]\s+\[[ xX]\]\s+|[-*+]\s+|\d+\.\s+)/)
  if (!m) return null
  const [full, indent, marker] = m
  const numbered = marker.match(/^(\d+)\.(\s+)$/)
  const next = numbered
    ? `${Number(numbered[1]) + 1}.${numbered[2]}`
    : marker.replace(/\[[xX]\]/, '[ ]')
  return {
    markerLength: full.length,
    isEmpty: line.slice(full.length).trim() === '',
    next: indent + next,
  }
}
