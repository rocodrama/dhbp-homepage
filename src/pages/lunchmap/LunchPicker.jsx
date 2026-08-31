import { useEffect, useRef, useState } from 'react'
import Modal from '../../components/Modal'

const SPIN_MS = 1800

export default function LunchPicker({ restaurants, mapUrlFor, onClose }) {
  const [reelIndex, setReelIndex] = useState(0)
  const [spinning, setSpinning] = useState(true)
  const [winner, setWinner] = useState(null)
  const intervalRef = useRef(null)

  const spin = () => {
    setWinner(null)
    setSpinning(true)
    const winnerIndex = Math.floor(Math.random() * restaurants.length)
    intervalRef.current = setInterval(() => {
      setReelIndex(Math.floor(Math.random() * restaurants.length))
    }, 80)
    setTimeout(() => {
      clearInterval(intervalRef.current)
      setReelIndex(winnerIndex)
      setSpinning(false)
      setWinner(restaurants[winnerIndex])
    }, SPIN_MS)
  }

  useEffect(() => {
    spin()
    return () => clearInterval(intervalRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Modal onClose={onClose}>
      <h3 style={{ marginTop: 0 }}>🎰 오늘 점심 뭐 먹지?</h3>
      <div className="slot-reels">
        <div className={'slot-reel' + (spinning ? ' spinning' : ' stopped')}>
          {restaurants[reelIndex]?.name ?? ''}
        </div>
      </div>

      {winner && (
        <>
          <div className="result-banner">🎉 {winner.name}</div>
          <div className="form-actions">
            <a
              className="btn-secondary map-link-btn"
              href={mapUrlFor(winner)}
              target="_blank"
              rel="noreferrer"
            >
              네이버지도에서 보기 ↗
            </a>
          </div>
        </>
      )}

      <div className="form-actions" style={{ marginTop: 16 }}>
        <button type="button" className="btn-primary" onClick={spin} disabled={spinning}>
          {spinning ? '돌아가는 중...' : '다시 뽑기'}
        </button>
        <button type="button" className="btn-secondary" onClick={onClose}>
          닫기
        </button>
      </div>
    </Modal>
  )
}
