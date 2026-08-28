import { useRef, useState } from 'react'
import NameInput from './NameInput'

function generateRungs(n, rows) {
  const rungs = []
  for (let r = 0; r < rows; r++) {
    const rowSet = new Set()
    let i = 0
    while (i < n - 1) {
      if (Math.random() < 0.35) {
        rowSet.add(i)
        i += 2
      } else {
        i += 1
      }
    }
    rungs.push(rowSet)
  }
  return rungs
}

function stepColumn(col, rowSet) {
  if (rowSet.has(col)) return col + 1
  if (rowSet.has(col - 1)) return col - 1
  return col
}

function traceFinalColumn(startCol, rungs) {
  let col = startCol
  for (const rowSet of rungs) col = stepColumn(col, rowSet)
  return col
}

const WIDTH_PER_LANE = 70
const ROW_HEIGHT = 24
const ROWS = 14
const STEP_MS = 220

const TOKEN_COLORS = ['#1b4b9c', '#f26522', '#2d9955', '#a855f7', '#e11d48', '#0891b2', '#ca8a04', '#db2777']

export default function Ladder() {
  const [names, setNames] = useState([])
  const [results, setResults] = useState([])
  const [rungs, setRungs] = useState(null)
  const [finalCols, setFinalCols] = useState(null)
  const [cols, setCols] = useState([])
  const [row, setRow] = useState(0)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef(null)

  const n = names.length
  const bottomLabels =
    results.length === n && n > 0 ? results : ['🎉 당첨', ...Array(Math.max(n - 1, 0)).fill('꽝')]

  const start = () => {
    if (n < 2) {
      alert('참가자를 2명 이상 추가해주세요.')
      return
    }
    const r = generateRungs(n, ROWS)
    setRungs(r)
    setFinalCols(null)
    setCols(names.map((_, i) => i))
    setRow(0)
    setRunning(true)

    let currentRow = 0
    let currentCols = names.map((_, i) => i)
    intervalRef.current = setInterval(() => {
      currentCols = currentCols.map((c) => stepColumn(c, r[currentRow]))
      currentRow += 1
      setCols([...currentCols])
      setRow(currentRow)
      if (currentRow >= ROWS) {
        clearInterval(intervalRef.current)
        setRunning(false)
        setFinalCols(currentCols)
      }
    }, STEP_MS)
  }

  const width = n * WIDTH_PER_LANE
  const height = ROWS * ROW_HEIGHT

  return (
    <div>
      <NameInput names={names} setNames={setNames} placeholder="참가자 이름 입력 후 추가" />
      <NameInput
        names={results}
        setNames={setResults}
        placeholder="결과 항목 입력 (선택, 비우면 당첨/꽝)"
      />

      <button className="btn-primary" onClick={start} disabled={running} style={{ marginBottom: 16 }}>
        {running ? '내려가는 중...' : '사다리 타기 시작'}
      </button>

      {n >= 2 && (
        <div className="ladder-scroll">
          <div className="ladder-names" style={{ width }}>
            {names.map((n2, i) => (
              <span key={i} style={{ width: WIDTH_PER_LANE, color: TOKEN_COLORS[i % TOKEN_COLORS.length] }}>
                {n2}
              </span>
            ))}
          </div>
          <div className="ladder-svg-wrap" style={{ width, height }}>
            <svg className="ladder-svg" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
              {Array.from({ length: n }, (_, i) => (
                <line
                  key={'v' + i}
                  x1={i * WIDTH_PER_LANE + WIDTH_PER_LANE / 2}
                  y1={0}
                  x2={i * WIDTH_PER_LANE + WIDTH_PER_LANE / 2}
                  y2={height}
                  stroke="#e5e7eb"
                  strokeWidth={2}
                />
              ))}
              {rungs &&
                rungs.flatMap((rowSet, r) =>
                  [...rowSet].map((i) => (
                    <line
                      key={`h${r}-${i}`}
                      x1={i * WIDTH_PER_LANE + WIDTH_PER_LANE / 2}
                      y1={(r + 0.5) * ROW_HEIGHT}
                      x2={(i + 1) * WIDTH_PER_LANE + WIDTH_PER_LANE / 2}
                      y2={(r + 0.5) * ROW_HEIGHT}
                      stroke={r < row ? '#f26522' : '#fbc9a8'}
                      strokeWidth={3}
                    />
                  ))
                )}
            </svg>
            {rungs &&
              cols.map((c, i) => (
                <span
                  key={i}
                  className="ladder-token"
                  style={{
                    left: c * WIDTH_PER_LANE + WIDTH_PER_LANE / 2 - 8,
                    top: row * ROW_HEIGHT - 8,
                    background: TOKEN_COLORS[i % TOKEN_COLORS.length],
                  }}
                />
              ))}
          </div>
          <div className="ladder-results" style={{ width }}>
            {bottomLabels.map((r, i) => (
              <span key={i} style={{ width: WIDTH_PER_LANE }}>
                {r}
              </span>
            ))}
          </div>
        </div>
      )}

      {finalCols && (
        <div className="item-list result-table">
          {names.map((n2, i) => (
            <div className="item-row" key={i}>
              <span className="item-row-title">
                <span
                  className="ladder-token-dot"
                  style={{ background: TOKEN_COLORS[i % TOKEN_COLORS.length] }}
                />
                {n2}
              </span>
              <span className="item-row-meta">{bottomLabels[finalCols[i]]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
