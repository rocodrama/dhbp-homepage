import { useRef, useState } from 'react'
import NameInput from './NameInput'
import RankPicker from './RankPicker'
import RankResults from './RankResults'
import { assignCharacters } from './characters'
import { clampRank, withRanks } from './ranking'

const ROUND_DELAY = 1600

export default function Survival() {
  const [names, setNames] = useState([])
  const [players, setPlayers] = useState(null) // [{name, emoji}]
  const [eliminated, setEliminated] = useState(new Set())
  const [running, setRunning] = useState(false)
  const [ranking, setRanking] = useState(null)
  const [round, setRound] = useState(0)
  const [rank, setRank] = useState(1)
  const timeoutRef = useRef(null)

  // outLog: [{ name, out }] — out은 탈락한 라운드. 늦게 탈락할수록 높은 등수.
  // 한 라운드에 여러 명이 같이 떨어지므로 그 사람들은 공동 등수가 된다.
  const runRound = (alive, eliminatedSoFar, roundNo, outLog) => {
    if (alive.length <= 1) {
      const rows = [...alive.map((p) => ({ name: p.name, out: Infinity })), ...outLog].sort(
        (a, b) => b.out - a.out
      )
      setRanking(
        withRanks(rows, (a, b) => a.out === b.out).map((r) => ({
          name: r.name,
          rank: r.rank,
          detail: r.out === Infinity ? '최후의 1인' : `${r.out}라운드 탈락`,
        }))
      )
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
    setRound(roundNo)

    const nextLog = [...outLog, ...out.map((p) => ({ name: p.name, out: roundNo }))]
    timeoutRef.current = setTimeout(
      () => runRound(survivors, nextEliminated, roundNo + 1, nextLog),
      ROUND_DELAY
    )
  }

  const start = () => {
    if (names.length < 2) {
      alert('참가자를 2명 이상 추가해주세요.')
      return
    }
    const initial = assignCharacters(names)
    setPlayers(initial)
    setEliminated(new Set())
    setRanking(null)
    setRound(0)
    setRunning(true)
    timeoutRef.current = setTimeout(() => runRound(initial, new Set(), 1, []), ROUND_DELAY)
  }

  return (
    <div>
      <NameInput names={names} setNames={setNames} placeholder="참가자 이름 입력 후 추가" />
      <div className="game-controls">
        <RankPicker count={names.length} rank={rank} setRank={setRank} />
        <button className="btn-primary" onClick={start} disabled={running}>
          {running ? `진행 중... (${round}라운드)` : '생존게임 시작'}
        </button>
      </div>

      {players && (
        <div className="survival-grid">
          {players.map((p) => {
            const isOut = eliminated.has(p.name)
            return (
              <div
                className={'survival-player' + (isOut ? ' out' : ranking ? ' alive winner' : ' alive')}
                key={p.name}
              >
                <span className="survival-emoji">{p.emoji}</span>
                <span>{p.name}</span>
              </div>
            )
          })}
        </div>
      )}

      {ranking && <RankResults rows={ranking} targetRank={clampRank(rank, names.length)} />}
    </div>
  )
}
