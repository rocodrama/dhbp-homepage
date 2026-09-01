import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Home.css'

const CARDS = [
  { path: '/manual', title: '매뉴얼', desc: '실험 장비, 서버, 논문 양식 등 랩실 노하우 모음' },
  { path: '/board', title: '공지사항/게시판', desc: '랩실 공지와 자유게시판을 확인하세요' },
  { path: '/lunch-map', title: '점심메뉴 지도', desc: '오늘 점심은 어디로 갈까요?' },
]

export default function Home() {
  const { profile } = useAuth()

  return (
    <div>
      <h2 className="welcome">
        환영합니다, {profile?.displayName ?? '회원'}님! 오늘도 화이팅 :)
      </h2>
      <div className="summary-cards">
        {CARDS.map((c) => (
          <Link key={c.path} to={c.path} className="card">
            <h3>{c.title}</h3>
            <p>{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
