import { useRef, useState } from 'react'
import NameInput from './NameInput'

export default function SlotMachine() {
  const [names, setNames] = useState([])
  const [reels, setReels] = useState([0, 0, 0])
  const [spinning, setSpinning] = useState(false)
  const [stoppedReels, setStoppedReels] = useState([false, false, false])
  const [winner, setWinner] = useState(null)
  const intervalsRef = useRef([])

  const spin = () => {
    if (names.length < 2) {
      alert('참가자를 2명 이상 추가해주세요.')
      return
    }
    setWinner(null)
    setSpinning(true)
    setStoppedReels([false, false, false])
    const winnerIndex = Math.floor(Math.random() * names.length)
    const stopDelays = [2000, 3400, 5000]

    stopDelays.forEach((delay, reelIdx) => {
      const interval = setInterval(() => {
        setReels((r) => {
          const next = [...r]
          next[reelIdx] = Math.floor(Math.random() * names.length)
          return next
        })
      }, 80)
      intervalsRef.current[reelIdx] = interval

      setTimeout(() => {
        clearInterval(intervalsRef.current[reelIdx])
        setReels((r) => {
          const next = [...r]
          next[reelIdx] = winnerIndex
          return next
        })
        setStoppedReels((s) => {
          const next = [...s]
          next[reelIdx] = true
          return next
        })
        if (reelIdx === stopDelays.length - 1) {
          setSpinning(false)
          setWinner(names[winnerIndex])
        }
      }, delay)
    })
  }

  return (
    <div>
      <NameInput names={names} setNames={setNames} placeholder="참가자 이름 입력 후 추가" />
      <button className="btn-primary" onClick={spin} disabled={spinning} style={{ marginBottom: 16 }}>
        {spinning ? '돌아가는 중...' : '슬롯 당기기'}
      </button>

      {names.length > 0 && (
        <div className="slot-reels">
          {reels.map((idx, i) => (
            <div
              className={'slot-reel' + (spinning && !stoppedReels[i] ? ' spinning' : '') + (stoppedReels[i] ? ' stopped' : '')}
              key={i}
            >
              {names[idx] ?? ''}
            </div>
          ))}
        </div>
      )}

      {winner && <div className="result-banner">🎰 {winner}</div>}
    </div>
  )
}
