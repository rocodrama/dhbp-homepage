import { useAuth } from '../context/AuthContext'
import './Home.css'

export default function Home() {
  const { profile } = useAuth()

  return (
    <div>
      <h2 className="welcome">
        환영합니다, {profile?.displayName ?? '회원'}님! 오늘도 화이팅 :)
      </h2>
      <div className="summary-cards">
        <div className="card">
          <h3>매뉴얼</h3>
          <p>실험 장비, 서버, 논문 양식 등 랩실 노하우 모음</p>
        </div>
        <div className="card">
          <h3>공지사항/게시판</h3>
          <p>랩실 공지와 자유게시판을 확인하세요</p>
        </div>
        <div className="card">
          <h3>점심메뉴 지도</h3>
          <p>오늘 점심은 어디로 갈까요?</p>
        </div>
      </div>
    </div>
  )
}
