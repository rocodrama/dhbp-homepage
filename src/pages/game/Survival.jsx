import { useRef, useState } from 'react'
import NameInput from './NameInput'
import { assignCharacters } from './characters'

const ROUND_DELAY = 1600

export default function Survival() {
  const [names, setNames] = useState([])
  const [players, setPlayers] = useState(null) // [{name, emoji}]
  const [eliminated, setEliminated] = useState(new Set())
  const [running, setRunning] = useState(false)
  const [winner, setWinner] = useState(null)
  const [round, setRound] = useState(0)
  const timeoutRef = useRef(null)

  const runRound = (alive, eliminatedSoFar) => {
    if (alive.length <= 1) {
      setWinner(alive[0]?.name ?? null)
      setRunning(false)
      return
    }
    const shuffled = [...alive].sort(() => Math.random() - 0.5)
    const half = Math.ceil(shuffled.length / 2)
    const groupA = shuffled.slice(0, half)
    const groupB = shuffled.slice(half)
    const eliminateA = Math.random() < 0.5
    const out = eliminateA ? groupA : groupB
    const survivors = eliminateA ? groupB : groupA

    const nextEliminated = new Set(eliminatedSoFar)
    out.forEach((p) => nextEliminated.add(p.name))
    setEliminated(nextEliminated)
    setRound((r) => r + 1)

    timeoutRef.current = setTimeout(() => runRound(survivors, nextEliminated), ROUND_DELAY)
  }

  const start = () => {
    if (names.length < 2) {
      alert('참가자를 2명 이상 추가해주세요.')
      return
    }
    const initial = assignCharacters(names)
    setPlayers(initial)
    setEliminated(new Set())
    setWinner(null)
    setRound(0)
    setRunning(true)
    timeoutRef.current = setTimeout(() => runRound(initial, new Set()), ROUND_DELAY)
  }

  return (
    <div>
      <NameInput names={names} setNames={setNames} placeholder="참가자 이름 입력 후 추가" />
      <button className="btn-primary" onClick={start} disabled={running} style={{ marginBottom: 16 }}>
        {running ? `진행 중... (${round}라운드)` : '생존게임 시작'}
      </button>

      {players && (
        <div className="survival-grid">
          {players.map((p) => {
            const isOut = eliminated.has(p.name)
            return (
              <div
                className={'survival-player' + (isOut ? ' out' : winner ? ' alive winner' : ' alive')}
                key={p.name}
              >
                <span className="survival-emoji">{p.emoji}</span>
                <span>{p.name}</span>
              </div>
            )
          })}
        </div>
      )}

      {winner && <div className="result-banner">👑 {winner}</div>}
    </div>
  )
}
