import { useRef, useState } from 'react'
import NameInput from './NameInput'

const FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']
const SETTLE_STEP = 500 // ms between each participant locking in, back to front

export default function DiceRoll() {
  const [names, setNames] = useState([])
  const [faces, setFaces] = useState([])
  const [settled, setSettled] = useState([])
  const [rolling, setRolling] = useState(false)
  const [results, setResults] = useState(null)
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
    setFaces(names.map(() => 0))

    const finalValues = names.map((n) => ({ name: n, value: Math.floor(Math.random() * 6) + 1 }))
    const settledRef = { current: names.map(() => false) }

    spinRef.current = setInterval(() => {
      setFaces((f) => f.map((_, i) => (settledRef.current[i] ? f[i] : Math.floor(Math.random() * 6))))
    }, 90)

    names.forEach((_, i) => {
      const delay = 1200 + i * SETTLE_STEP
      const t = setTimeout(() => {
        settledRef.current[i] = true
        setFaces((f) => {
          const next = [...f]
          next[i] = finalValues[i].value - 1
          return next
        })
        setSettled((s) => {
          const next = [...s]
          next[i] = true
          return next
        })
        if (i === names.length - 1) {
          clearInterval(spinRef.current)
          setRolling(false)
          const sorted = [...finalValues].sort((a, b) => b.value - a.value)
          setResults(sorted)
        }
      }, delay)
      timeoutsRef.current.push(t)
    })
  }

  return (
    <div>
      <NameInput names={names} setNames={setNames} placeholder="참가자 이름 입력 후 추가" />
      <button className="btn-primary" onClick={roll} disabled={rolling} style={{ marginBottom: 16 }}>
        {rolling ? '굴리는 중...' : '주사위 굴리기'}
      </button>

      {names.length > 0 && (
        <div className="dice-row">
          {names.map((n, i) => (
            <div className={'dice-cell' + (settled[i] ? ' settled' : '')} key={n}>
              <span className="dice-face">{FACES[faces[i] ?? 0]}</span>
              <span className="dice-name">{n}</span>
            </div>
          ))}
        </div>
      )}

      {results && (
        <div className="item-list">
          {results.map((r, i) => (
            <div className="item-row" key={r.name}>
              <span className="item-row-title">
                {i === 0 && '👑 '}
                {r.name}
              </span>
              <span className="item-row-meta" style={{ fontSize: 20 }}>
                {FACES[r.value - 1]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
