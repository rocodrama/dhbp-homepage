import { useRef, useState } from 'react'
import NameInput from './NameInput'
import RankPicker from './RankPicker'
import RankResults from './RankResults'
import { clampRank, withRanks } from './ranking'

const FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']
const SETTLE_STEP = 500 // ms between each participant locking in, back to front
const TIMES = [1, 2, 3, 4, 5]

const rollDie = () => Math.floor(Math.random() * 6)
// faces는 0-based 인덱스라 눈금은 +1
const sumFaces = (arr) => arr.reduce((s, f) => s + f + 1, 0)

export default function DiceRoll() {
  const [names, setNames] = useState([])
  const [times, setTimes] = useState(1)
  const [faces, setFaces] = useState([]) // [참가자][던진 순서]
  const [settled, setSettled] = useState([])
  const [rolling, setRolling] = useState(false)
  const [results, setResults] = useState(null)
  const [rank, setRank] = useState(1)
  const spinRef = useRef(null)
  const timeoutsRef = useRef([])

  const roll = () => {
    if (names.length < 2) {
      alert('참가자를 2명 이상 추가해주세요.')
      return
    }
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
    setResults(null)
    setRolling(true)
    setSettled(names.map(() => false))
    setFaces(names.map(() => Array.from({ length: times }, rollDie)))

    const finalFaces = names.map(() => Array.from({ length: times }, rollDie))
    const settledRef = { current: names.map(() => false) }

    spinRef.current = setInterval(() => {
      // 난수는 업데이터 밖에서 뽑는다 (StrictMode 이중 호출 대비)
      const spun = names.map(() => Array.from({ length: times }, rollDie))
      setFaces((f) => f.map((row, i) => (settledRef.current[i] ? row : spun[i])))
    }, 90)

    names.forEach((_, i) => {
      const delay = 1200 + i * SETTLE_STEP
      const t = setTimeout(() => {
        settledRef.current[i] = true
        setFaces((f) => f.map((row, k) => (k === i ? finalFaces[i] : row)))
        setSettled((s) => {
          const next = [...s]
          next[i] = true
          return next
        })
        if (i === names.length - 1) {
          clearInterval(spinRef.current)
          setRolling(false)
          const sorted = names
            .map((name, k) => ({ name, total: sumFaces(finalFaces[k]), values: finalFaces[k] }))
            .sort((a, b) => b.total - a.total)
          setResults(
            withRanks(sorted, (a, b) => a.total === b.total).map((r) => ({
              name: r.name,
              rank: r.rank,
              detail: `${r.values.map((f) => FACES[f]).join('')} = ${r.total}`,
            }))
          )
        }
      }, delay)
      timeoutsRef.current.push(t)
    })
  }

  return (
    <div>
      <NameInput names={names} setNames={setNames} placeholder="참가자 이름 입력 후 추가" />
      <div className="game-controls">
        <label className="rank-picker">
          🎲 던질 횟수
          <select value={times} onChange={(e) => setTimes(Number(e.target.value))} disabled={rolling}>
            {TIMES.map((t) => (
              <option key={t} value={t}>
                {t}번
              </option>
            ))}
          </select>
        </label>
        <RankPicker count={names.length} rank={rank} setRank={setRank} />
        <button className="btn-primary" onClick={roll} disabled={rolling}>
          {rolling ? '굴리는 중...' : '주사위 굴리기'}
        </button>
      </div>

      {names.length > 0 && faces.length === names.length && (
        <div className="dice-row">
          {names.map((n, i) => (
            <div className={'dice-cell' + (settled[i] ? ' settled' : '')} key={n}>
              <span className="dice-faces">
                {faces[i].map((f, k) => (
                  <span className="dice-face" key={k}>
                    {FACES[f]}
                  </span>
                ))}
              </span>
              <span className="dice-total">
                {settled[i] ? `합계 ${sumFaces(faces[i])}` : '...'}
              </span>
              <span className="dice-name">{n}</span>
            </div>
          ))}
        </div>
      )}

      {results && <RankResults rows={results} targetRank={clampRank(rank, names.length)} />}
    </div>
  )
}
