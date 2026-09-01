import { Component } from 'react'

// 렌더 중 예외가 나도 앱 전체가 흰 화면이 되지 않게 하는 안전망.
export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="empty-state">
        <img src="/images/mascot.png" alt="" />
        <h2 style={{ color: 'var(--color-text-dark)', marginBottom: 8 }}>
          화면을 그리는 중 문제가 생겼어요
        </h2>
        <p style={{ fontSize: 13 }}>{this.state.error.message}</p>
        <button className="btn-primary" onClick={() => location.reload()}>
          새로고침
        </button>
      </div>
    )
  }
}
