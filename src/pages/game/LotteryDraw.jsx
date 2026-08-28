import { useState } from 'react'
import NameInput from './NameInput'

export default function LotteryDraw() {
  const [names, setNames] = useState([])
  const [cards, setCards] = useState(null) // shuffled [{name, isWinner}]
  const [revealed, setRevealed] = useState({})

  const start = () => {
    if (names.length < 2) {
      alert('참가자를 2명 이상 추가해주세요.')
      return
    }
    const winnerIdx = Math.floor(Math.random() * names.length)
    const shuffled = [...names]
      .map((n, i) => ({ name: n, isWinner: i === winnerIdx }))
      .sort(() => Math.random() - 0.5)
    setCards(shuffled)
    setRevealed({})
  }

  const flip = (i) => setRevealed((r) => ({ ...r, [i]: true }))

  return (
    <div>
      <NameInput names={names} setNames={setNames} placeholder="참가자 이름 입력 후 추가" />
      <button className="btn-primary" onClick={start} style={{ marginBottom: 16 }}>
        카드 섞기
      </button>

      {cards && (
        <div className="card-grid">
          {cards.map((c, i) => (
            <button
              key={i}
              className={'draw-card-flip' + (revealed[i] ? ' flipped' : '')}
              onClick={() => flip(i)}
            >
              <span className="draw-card-face draw-card-front">?</span>
              <span className="draw-card-face draw-card-back">{c.isWinner ? '🎉 당첨' : '꽝'}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
