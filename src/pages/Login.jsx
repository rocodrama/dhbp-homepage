import { useAuth } from '../context/AuthContext'
import './Login.css'

export default function Login() {
  const { signInWithGoogle } = useAuth()

  return (
    <div className="login-page">
      <div className="login-card">
        <img src="/images/mascot.png" alt="곰두리" className="login-mascot" />
        <h1>랩실 홈페이지</h1>
        <p className="login-sub">랩실 구성원만 이용할 수 있는 비공개 사이트입니다</p>
        <button className="google-btn" onClick={() => signInWithGoogle()}>
          G&nbsp;&nbsp;구글 계정으로 로그인
        </button>
        <div className="login-note">가입 신청 후 랩실 관리자 승인이 필요합니다</div>
      </div>
    </div>
  )
}
