import { useRef, useState } from 'react'
import NameInput from './NameInput'
import { assignCharacters } from './characters'

export default function Race() {
  const [names, setNames] = useState([])
  const [racers, setRacers] = useState(null) // [{name, emoji, progress}]
  const [running, setRunning] = useState(false)
  const [winner, setWinner] = useState(null)
  const intervalRef = useRef(null)

  const start = () => {
    if (names.length < 2) {
      alert('참가자를 2명 이상 추가해주세요.')
      return
    }
    setWinner(null)
    setRunning(true)
    const initial = assignCharacters(names).map((r) => ({ ...r, progress: 0 }))
    setRacers(initial)

    intervalRef.current = setInterval(() => {
      setRacers((prev) => {
        const next = prev.map((r) => ({
          ...r,
          // occasional burst / stumble keeps the lead uncertain until the end
          progress: Math.min(100, r.progress + Math.random() * 5.5 + (Math.random() < 0.12 ? 4 : 0)),
        }))
        const finished = next.find((r) => r.progress >= 100)
        if (finished) {
          clearInterval(intervalRef.current)
          setRunning(false)
          setWinner(finished.name)
        }
        return next
      })
    }, 180)
  }

  return (
    <div>
      <NameInput names={names} setNames={setNames} placeholder="참가자 이름 입력 후 추가" />
      <button className="btn-primary" onClick={start} disabled={running} style={{ marginBottom: 16 }}>
        {running ? '경주 중...' : '경주 시작'}
      </button>

      {racers && (
        <div className="race-track">
          {racers.map((r) => {
            const isLeading = running && r.progress === Math.max(...racers.map((x) => x.progress)) && r.progress > 0
            return (
              <div className="race-lane" key={r.name}>
                <span className="race-label">{r.name}</span>
                <div className="race-lane-bar">
                  <span className="race-finish">🏁</span>
                  <span
                    className={'race-runner' + (isLeading ? ' leading' : '')}
                    style={{ left: `calc(${r.progress}% - 16px)` }}
                  >
                    {r.emoji}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {winner && <div className="result-banner">🏁 {winner}</div>}
    </div>
  )
}
