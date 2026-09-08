import { useEffect } from 'react'
import './Modal.css'

export default function Modal({ onClose, children }) {
  // 모바일 모달 불만 1위: 모달 뒤 문서가 계속 스크롤된다. 7곳 전부 해당이었다.
  // deps 를 [] 로 두는 게 중요하다 — onClose 를 넣으면 인라인 화살표를 넘기는
  // 소비자에서 매 렌더마다 효과가 다시 돌고, 두 번째 실행이 prev 를 'hidden' 으로
  // 잡아버려 모달을 닫아도 스크롤이 영구히 잠긴다.
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  // 포커스 트랩은 넣지 않는다 — 40줄이거나 의존성이고, 여러 소비자가 이미 첫 입력에
  // autoFocus 를 걸어 흔한 경우를 덮는다. 랩실 밖 사용자를 맞게 되면 그때.
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
