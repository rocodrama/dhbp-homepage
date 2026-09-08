// 프레임워크 없는 자체 검증: node scripts/check-contrast.mjs
//
// 대비는 접근성 기본선이라 게을리 할 자리가 아니다. 특히 timetable/constants.js 의
// PERSON_COLORS 는 "대비 7:1 이상"이라는 주석을 달고 있는데, ink 색이 바뀌었으니
// 믿지 말고 검증한다.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { PERSON_COLORS } from '../src/pages/timetable/constants.js'

const lin = (c) => {
  c /= 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}
const lum = (hex) => {
  const n = parseInt(hex.slice(1), 16)
  return 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
}
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)]
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

// 토큰 값은 index.css 에서 읽는다 — 여기 하드코딩하면 두 곳이 드리프트한다
const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')
const tok = (name) => {
  const m = css.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`))
  assert.ok(m, `index.css 에 --${name} 이 없다`)
  return m[1]
}

const AA = 4.5
const failures = []
const check = (label, fg, bg, min = AA) => {
  const r = ratio(fg, bg)
  if (r < min) failures.push(`${label}: ${r.toFixed(2)}:1 < ${min}`)
  return r
}

const page = tok('surface-page')
const well = tok('surface-well')

// 텍스트 · 액센트 · 주목
check('text-default on page', tok('text-default'), page)
check('text-muted on page', tok('text-muted'), page)
check('text-muted on well', tok('text-muted'), well)
check('navigate-accent on page', tok('navigate-accent'), page)
check('text-on-accent on accent', tok('text-on-accent'), tok('navigate-accent'))
check('text-default on accent-weak', tok('text-default'), tok('navigate-accent-weak'))
check('attention on page', tok('attention-marker'), page)
check('attention on attention-weak', tok('attention-marker'), tok('attention-marker-weak'))

// 상태 — 각 fg 는 흰 배경 위에서도, 자기 배지 배경 위에서도 통과해야 한다
for (const s of ['ok', 'busy', 'broken', 'neutral']) {
  check(`status-${s} on page`, tok(`status-${s}-fg`), page)
  check(`status-${s} on its bg`, tok(`status-${s}-fg`), tok(`status-${s}-bg`))
}

// PERSON_COLORS — 정보를 담은 범주형 색. 파스텔 위 진한 글씨가 성립해야 한다
const ink = tok('text-default')
let worst = Infinity
for (const p of PERSON_COLORS) {
  const r = ratio(ink, p)
  worst = Math.min(worst, r)
  if (r < AA) failures.push(`PERSON_COLORS ${p} vs text-default: ${r.toFixed(2)}:1 < ${AA}`)
}

assert.deepEqual(failures, [], `대비 미달:\n  ${failures.join('\n  ')}`)
console.log(
  `대비 검증 통과 — 토큰 조합 16종 AA 통과, PERSON_COLORS ${PERSON_COLORS.length}개 최저 ${worst.toFixed(2)}:1`
)
