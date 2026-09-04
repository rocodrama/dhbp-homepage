import { useRef, useState } from 'react'
import NameInput from './NameInput'
import RankPicker from './RankPicker'
import RankResults from './RankResults'
import { assignCharacters } from './characters'
import { clampRank } from './ranking'
import { advance, collectFinished } from './raceTick'

export default function Race() {
  const [names, setNames] = useState([])
  const [racers, setRacers] = useState(null) // [{name, emoji, progress}]
  const [running, setRunning] = useState(false)
  const [ranking, setRanking] = useState(null)
  const [rank, setRank] = useState(1)
  const intervalRef = useRef(null)

  const start = () => {
    if (names.length < 2) {
      alert('참가자를 2명 이상 추가해주세요.')
      return
    }
    setRanking(null)
    setRunning(true)
    // 시뮬레이션은 setState 업데이터 밖에서 돌린다 — StrictMode가 업데이터를
    // 두 번 호출하면 Math.random 결과가 갈라져서 도착 순서가 어긋난다.
    const state = assignCharacters(names).map((r) => ({ ...r, progress: 0 }))
    setRacers(state.map((r) => ({ ...r })))

    // 도착 순서. 1등이 나와도 멈추지 않고 전원이 들어올 때까지 계속 굴린다.
    const order = []
    intervalRef.current = setInterval(() => {
      advance(state)
      collectFinished(state, order)
      setRacers(state.map((r) => ({ ...r })))

      if (order.length === state.length) {
        clearInterval(intervalRef.current)
        setRunning(false)
        const emojiOf = Object.fromEntries(state.map((r) => [r.name, r.emoji]))
        setRanking(order.map((name, i) => ({ name, rank: i + 1, detail: emojiOf[name] })))
      }
    }, 180)
  }

  const arrived = racers ? racers.filter((r) => r.progress >= 100).length : 0

  return (
    <div>
      <NameInput names={names} setNames={setNames} placeholder="참가자 이름 입력 후 추가" />
      <div className="game-controls">
        <RankPicker count={names.length} rank={rank} setRank={setRank} />
        <button className="btn-primary" onClick={start} disabled={running}>
          {running ? `경주 중... (${arrived}/${names.length} 도착)` : '경주 시작'}
        </button>
      </div>

      {racers && (
        <div className="race-track">
          {racers.map((r) => {
            const isLeading =
              running && r.progress === Math.max(...racers.map((x) => x.progress)) && r.progress > 0
            return (
              <div className="race-lane" key={r.name}>
                <span className="race-label">{r.name}</span>
                <div className="race-lane-bar">
                  <span className="race-finish">🏁</span>
                  <span
                    className={'race-runner' + (isLeading ? ' leading' : '')}
                    style={{ left: `calc(${Math.min(100, r.progress)}% - 16px)` }}
                  >
                    {r.emoji}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {ranking && <RankResults rows={ranking} targetRank={clampRank(rank, names.length)} />}
    </div>
  )
}
