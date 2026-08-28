import { useState } from 'react'
import NameInput from './NameInput'

const COLORS = ['#1b4b9c', '#f26522', '#8fcbeb', '#2d9955', '#6b7280', '#a855f7']

export default function Roulette() {
  const [names, setNames] = useState([])
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [winner, setWinner] = useState(null)

  const sectorAngle = names.length ? 360 / names.length : 0

  const gradient = names.length
    ? `conic-gradient(${names
        .map((_, i) => `${COLORS[i % COLORS.length]} ${i * sectorAngle}deg ${(i + 1) * sectorAngle}deg`)
        .join(', ')})`
    : 'var(--color-border)'

  const handleSpin = () => {
    if (names.length < 2) {
      alert('참가자를 2명 이상 추가해주세요.')
      return
    }
    setWinner(null)
    setSpinning(true)
    const winnerIndex = Math.floor(Math.random() * names.length)
    const centerAngle = winnerIndex * sectorAngle + sectorAngle / 2
    const jitter = (Math.random() - 0.5) * (sectorAngle * 0.6)
    const currentBase = Math.floor(rotation / 360) * 360
    const finalMod = (360 - centerAngle - jitter + 360) % 360
    let target = currentBase + 8 * 360 + finalMod
    if (target <= rotation) target += 360

    setRotation(target)
    setTimeout(() => {
      setSpinning(false)
      setWinner(names[winnerIndex])
    }, 6000)
  }

  return (
    <div>
      <NameInput names={names} setNames={setNames} placeholder="참가자 이름 입력 후 추가" />

      <div className="wheel-wrap">
        <div className="wheel-pointer" />
        <div
          className="wheel"
          style={{ background: gradient, transform: `rotate(${rotation}deg)` }}
        >
          {names.map((n, i) => {
            const angle = i * sectorAngle + sectorAngle / 2
            return (
              <span
                key={i}
                className="wheel-label"
                style={{ transform: `rotate(${angle}deg) translate(0, -100px)` }}
              >
                {n}
              </span>
            )
          })}
        </div>
        <button className="btn-primary" onClick={handleSpin} disabled={spinning}>
          {spinning ? '돌아가는 중...' : '돌리기'}
        </button>
        {winner && <div className="result-banner">🎉 {winner}</div>}
      </div>
    </div>
  )
}
