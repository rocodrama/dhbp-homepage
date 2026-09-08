// 프레임워크 없는 자체 검증: node scripts/check-tokens.mjs
//
// npm run build 는 CSS 커스텀 프로퍼티를 검증하지 않는다. var(--hairlne) 오타는
// 빌드를 통과하고 아무것도 렌더하지 않는다 — 토큰 교체에서 가장 나올 법한 회귀이고
// 이걸 잡는 유일한 장치다.
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const SRC = new URL('../src/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')

function walk(dir, exts, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, exts, out)
    else if (exts.some((e) => name.endsWith(e))) out.push(p)
  }
  return out
}
const rel = (p) => relative(SRC, p).replace(/\\/g, '/')
const cssFiles = walk(SRC, ['.css'])
const jsFiles = walk(SRC, ['.js', '.jsx'])
const indexCss = readFileSync(join(SRC, 'index.css'), 'utf8')

// ── 1. 모든 var(--x) 가 index.css 에 정의되어 있는가 ──────────────────────
const defined = new Set([...indexCss.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gm)].map((m) => m[1]))
const undefinedRefs = []
for (const f of cssFiles) {
  const css = readFileSync(f, 'utf8')
  for (const m of css.matchAll(/var\(\s*(--[a-z0-9-]+)/g)) {
    if (!defined.has(m[1])) undefinedRefs.push(`${rel(f)}: var(${m[1]})`)
  }
}
assert.deepEqual(undefinedRefs, [], `index.css 에 정의되지 않은 토큰 참조:\n  ${undefinedRefs.join('\n  ')}`)

// ── 2. 브레이크포인트 리터럴이 --bp-narrow 와 일치하는가 ──────────────────
// @media 는 var() 를 못 읽고 matchMedia 는 커스텀 프로퍼티를 못 읽는다. 의존성 없이
// 하나로 만들 방법이 없으므로, 리터럴 두 개를 인정하되 여기서 짝을 강제한다.
const bp = indexCss.match(/--bp-narrow:\s*(\d+)px/)
assert.ok(bp, 'index.css 에 --bp-narrow 가 없다')
const bpValue = bp[1]

const mismatched = []
for (const f of cssFiles) {
  for (const m of readFileSync(f, 'utf8').matchAll(/@media[^{]*max-width:\s*(\d+)px/g)) {
    if (m[1] !== bpValue) mismatched.push(`${rel(f)}: @media max-width ${m[1]}px ≠ --bp-narrow ${bpValue}px`)
  }
}
for (const f of jsFiles) {
  for (const m of readFileSync(f, 'utf8').matchAll(/matchMedia\(\s*['"`]\(max-width:\s*(\d+)px/g)) {
    if (m[1] !== bpValue) mismatched.push(`${rel(f)}: matchMedia max-width ${m[1]}px ≠ --bp-narrow ${bpValue}px`)
  }
}
assert.deepEqual(mismatched, [], `브레이크포인트 desync:\n  ${mismatched.join('\n  ')}`)

// ── 3. 스케일 밖 px 값 — 래칫 ────────────────────────────────────────────
// 지금 코드에는 4px 그리드도 타입 스케일도 없다(padding 39종, font-size 13종).
// 한 번에 다 고칠 수 없으므로 하드 실패 대신 "늘어나면 실패"로 잠근다.
// 페이지별 리스타일이 끝날 때마다 BASELINE 을 내린다. 0이 되면 이 블록을 조건 없는
// 단언으로 바꾼다.
const SPACE_OK = new Set([0, 1, 2, 4, 8, 12, 16, 24, 32, 48])
const FONT_OK = new Set([12, 13, 15, 19, 24])
const RADIUS_OK = new Set([0, 8, 12, 999])
// 기하가 계산의 일부인 곳 — 값을 스케일에 맞출 수 없다
const GEOMETRY_ALLOWLIST = [/game\.css/, /timetable\.css/, /calendar\.css/]

const offenders = []
for (const f of cssFiles) {
  if (GEOMETRY_ALLOWLIST.some((re) => re.test(f))) continue
  const css = readFileSync(f, 'utf8')
  for (const m of css.matchAll(/(padding|margin|gap)(?:-[a-z]+)?:\s*([^;]+);/g)) {
    for (const v of m[2].matchAll(/(-?\d+(?:\.\d+)?)px/g)) {
      if (!SPACE_OK.has(Math.abs(Number(v[1])))) offenders.push(`${rel(f)}: ${m[1]} ${v[1]}px`)
    }
  }
  for (const m of css.matchAll(/font-size:\s*(\d+)px/g)) {
    if (!FONT_OK.has(Number(m[1]))) offenders.push(`${rel(f)}: font-size ${m[1]}px`)
  }
  for (const m of css.matchAll(/border-radius:\s*([^;]+);/g)) {
    for (const v of m[1].matchAll(/(\d+)px/g)) {
      if (!RADIUS_OK.has(Number(v[1]))) offenders.push(`${rel(f)}: border-radius ${v[1]}px`)
    }
  }
}

const BASELINE = 32 // 착수 시점 실측값. 페이지별 리스타일마다 내린다
if (offenders.length > BASELINE) {
  console.error(offenders.map((o) => '  ' + o).join('\n'))
  assert.fail(`스케일 밖 px 값이 ${offenders.length}개 — BASELINE ${BASELINE} 보다 늘었다`)
}

console.log(
  `토큰 검증 통과 — 정의 ${defined.size}개, 미정의 참조 0, 브레이크포인트 ${bpValue}px 일치, ` +
    `스케일 밖 px ${offenders.length}/${BASELINE}`
)
