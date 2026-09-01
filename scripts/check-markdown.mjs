// 프레임워크 없는 자체 검증: node scripts/check-markdown.mjs
// 회귀 방지 대상 — 예전엔 'plaintext'가 등록돼 있지 않아 아래 입력들이 전부
// throw 했고, 에러 바운더리가 없어 앱 전체가 흰 화면이 됐다.
import assert from 'node:assert/strict'
import { markdownToUnsafeHtml as render } from '../src/pages/manual/useMarkdown.js'

const CRASHERS = {
  '언어 없는 코드펜스': '```\nhello\n```',
  '4칸 들여쓴 코드블록 (빈 줄에서 Tab)': '    code line',
  '미등록 언어 go': '```go\nfunc main() {}\n```',
  '미등록 언어 rust': '```rust\nfn main() {}\n```',
  'Notion식 들여쓴 목록이 깨진 상태': '문단\n\n    - 중첩 항목\n    - 다른 항목',
}

for (const [label, md] of Object.entries(CRASHERS)) {
  const html = render(md)
  assert.ok(html.includes('<pre>') || html.includes('<code'), `${label}: 코드블록으로 렌더돼야 한다`)
}

// 등록된 언어는 여전히 하이라이트된다
assert.match(render('```python\nx = 1\n```'), /language-python/)
assert.match(render('```python\nx = 1\n```'), /hljs-/)

// 미등록 언어는 plaintext로 떨어지되 원문이 보존된다
assert.match(render('```go\nfunc main() {}\n```'), /language-plaintext/)
assert.ok(render('```go\nfunc main() {}\n```').includes('func main()'))

// 일반 마크다운 회귀 확인
assert.match(render('# 제목'), /<h1/)
assert.match(render('- 하나\n- 둘'), /<li>/)
assert.equal(render(null), '')

console.log('마크다운 렌더 검증 통과 (' + Object.keys(CRASHERS).length + '개 크래시 케이스 포함)')

// ---- 에디터: 목록 자동 이어쓰기 ----
const { listContinuation, lineStartOf } = await import('../src/components/markdownEdits.js')

assert.equal(listContinuation('일반 문단'), null)
assert.equal(listContinuation('- 하나').next, '- ')
assert.equal(listContinuation('* 하나').next, '* ')
assert.equal(listContinuation('1. 하나').next, '2. ')
assert.equal(listContinuation('9. 아홉').next, '10. ')
assert.equal(listContinuation('> 인용').next, '> ')
assert.equal(listContinuation('  - 들여쓴 항목').next, '  - ')
// 체크된 항목을 이어써도 다음 항목은 빈 체크박스
assert.equal(listContinuation('- [x] 완료').next, '- [ ] ')
assert.equal(listContinuation('- [ ] 할 일').next, '- [ ] ')
// 마커만 있는 빈 항목 → 목록 끝내기
assert.equal(listContinuation('- ').isEmpty, true)
assert.equal(listContinuation('- 내용').isEmpty, false)
assert.equal(listContinuation('- ').markerLength, 2)

assert.equal(lineStartOf('abc', 2), 0)
assert.equal(lineStartOf('abc\ndef', 5), 4)
assert.equal(lineStartOf('abc\ndef', 4), 4)

console.log('에디터 목록 이어쓰기 검증 통과')
