import { useState } from 'react'
import Roulette from './Roulette'
import Ladder from './Ladder'
import LotteryDraw from './LotteryDraw'
import DiceRoll from './DiceRoll'
import TeamSplit from './TeamSplit'
import SlotMachine from './SlotMachine'
import Race from './Race'
import Survival from './Survival'
import './game.css'

const GAMES = [
  { key: 'roulette', icon: '🎡', title: '룰렛 돌리기', desc: '커피내기 · 청소당번 뽑기', Comp: Roulette },
  { key: 'ladder', icon: '🪜', title: '사다리타기', desc: '랜덤 당첨자 뽑기', Comp: Ladder },
  { key: 'lottery', icon: '🎴', title: '제비뽑기', desc: '카드 뒤집어서 당첨 확인', Comp: LotteryDraw },
  { key: 'dice', icon: '🎲', title: '주사위 굴리기', desc: '각자 굴려서 순위 결정', Comp: DiceRoll },
  { key: 'team', icon: '🧑‍🤝‍🧑', title: '팀 나누기', desc: '랜덤으로 N팀 셔플', Comp: TeamSplit },
  { key: 'slot', icon: '🎰', title: '슬롯머신', desc: '릴 돌려서 당첨자 공개', Comp: SlotMachine },
  { key: 'race', icon: '🏇', title: '경주', desc: '캐릭터 레이스로 1등 결정', Comp: Race },
  { key: 'survival', icon: '🏆', title: '생존게임', desc: '매 라운드 반씩 탈락, 최후의 1인', Comp: Survival },
]

export default function Game() {
  const [mode, setMode] = useState(null)

  if (mode) {
    const game = GAMES.find((g) => g.key === mode)
    const Comp = game.Comp
    return (
      <div>
        <button className="btn-secondary" onClick={() => setMode(null)} style={{ marginBottom: 16 }}>
          ← 목록으로
        </button>
        <Comp />
      </div>
    )
  }

  return (
    <div className="game-picker">
      {GAMES.map((g) => (
        <div className="game-card" key={g.key}>
          <h3>
            {g.icon} {g.title}
          </h3>
          <p>{g.desc}</p>
          <button className="btn-primary" onClick={() => setMode(g.key)}>
            시작하기
          </button>
        </div>
      ))}
    </div>
  )
}
