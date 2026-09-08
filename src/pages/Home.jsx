import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Home.css'

const CARDS = [
  { path: '/manual', title: '매뉴얼', desc: '실험 장비, 서버, 논문 양식 등 랩실 노하우 모음' },
  { path: '/board', title: '공지사항/게시판', desc: '랩실 공지와 자유게시판을 확인하세요' },
  { path: '/lunch-map', title: '점심메뉴 지도', desc: '오늘 점심은 어디로 갈까요?' },
]

// 앱 밖으로 나가는 링크. 카드가 아니라 칩인 이유는 항목이 동질적이라서다 —
// 카드는 설명이 서로 다른 것들을 구분할 때 쓴다.
const LINKS = [
  { href: 'https://www.kangwon.ac.kr/ko/index.do', label: '강원대학교' },
  { href: 'https://graduate.kangwon.ac.kr/graduate/index.do', label: '강원대학교 대학원' },
  { href: 'https://sites.google.com/view/digitalhealth-biophotonics', label: 'DHBP' },
  { href: 'https://knu-icf.kangwon.ac.kr/main_0001_08.act', label: '연구통합관리시스템' },
  { href: 'https://knu-icf.kangwon.ac.kr/issue_main2.act', label: '연구원사이트' },
]

export default function Home() {
  const { profile } = useAuth()

  return (
    <div>
      <h1 className="welcome">
        환영합니다, {profile?.displayName ?? '회원'}님! 오늘도 화이팅 :)
      </h1>
      <div className="summary-cards">
        {CARDS.map((c) => (
          <Link key={c.path} to={c.path} className="card">
            <h3>{c.title}</h3>
            <p>{c.desc}</p>
          </Link>
        ))}
      </div>

      <h2 className="section-title">바로가기</h2>
      <div className="link-row">
        {LINKS.map((l) => (
          // rel: target="_blank" 만 두면 열린 페이지가 window.opener 로 이 탭을
          // 조작할 수 있다. noopener 가 그걸 끊고 noreferrer 가 리퍼러를 막는다.
          <a
            key={l.href}
            href={l.href}
            className="ext-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            {l.label}
            <span aria-hidden="true">↗</span>
          </a>
        ))}
      </div>
    </div>
  )
}
