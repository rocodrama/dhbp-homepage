import { useAuth } from '../context/AuthContext'
import './Login.css'

export default function Pending() {
  const { profile, signOutUser } = useAuth()

  return (
    <div className="login-page">
      <div className="login-card">
        <img src="/images/mascot.png" alt="곰두리" className="login-mascot" />
        <h1>승인 대기 중</h1>
        <p className="login-sub">
          {profile?.displayName ?? '회원'}님의 가입 신청이 접수됐어요.
          <br />
          랩실 관리자가 승인하면 바로 이용하실 수 있어요.
        </p>
        <button className="google-btn" onClick={() => signOutUser()}>
          로그아웃
        </button>
      </div>
    </div>
  )
}
