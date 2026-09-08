import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { visibleNavItems } from './navItems'
import './AppShell.css'

function NavIcon({ paths }) {
  return (
    <svg
      className="nav-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  )
}

export default function AppShell() {
  const { profile, isAdmin, signOutUser } = useAuth()
  const items = visibleNavItems(isAdmin)
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const navRef = useRef(null)

  useEffect(() => {
    if (!menuOpen) return
    const onPointerDown = (e) => {
      if (!menuRef.current?.contains(e.target)) setMenuOpen(false)
    }
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  // 이동한 항목을 가로 스크롤 내비 안에서 가운데로 끌어온다.
  // block:'nearest' 가 빠지면 매 이동마다 문서가 세로로도 스크롤된다.
  // scroll-behavior: smooth 는 쓰지 않는다. 사용자가 시작하지 않은 스크롤을 300ms 슬라이드로
  // 보여줄 이유가 없고, 실측에서 애니메이션이 중간에 취소돼 스크롤이 0으로 되돌아왔다.
  // scroll-snap 도 뺐다 — 항목마다 center 정렬을 걸면 스냅 엔진이 프로그램 스크롤을 되돌린다.
  useEffect(() => {
    navRef.current
      ?.querySelector('[aria-current="page"]')
      ?.scrollIntoView({ inline: 'center', block: 'nearest' })
  }, [pathname])

  return (
    <>
      <header className="topbar">
        <div className="topbar-row bar-inner">
          <Link to="/" className="brand">
            {/* 팔레트의 계보가 여기다 — accent 네이비와 attention 오렌지는 이 마크에서 왔다.
                alt="" : 바로 옆 워드마크가 링크의 접근성 이름을 이미 제공한다 */}
            <img src="/images/logo.png" alt="" className="brand-mark" />
            DHBP
          </Link>
          <div className="profile-menu" ref={menuRef}>
            <button
              className="avatar-btn"
              onClick={() => setMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="프로필"
            >
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt="" className="avatar-img" />
              ) : (
                <span className="avatar-fallback">{profile?.displayName?.[0] ?? '?'}</span>
              )}
            </button>
            {menuOpen && (
              <div className="profile-dropdown" role="menu">
                <div className="profile-dropdown-info">
                  <div className="profile-dropdown-name">{profile?.displayName ?? '이름 없음'}</div>
                  <div className="profile-dropdown-email">{profile?.email}</div>
                </div>
                <button className="profile-dropdown-logout" role="menuitem" onClick={signOutUser}>
                  로그아웃
                </button>
              </div>
            )}
          </div>
        </div>

        <nav className="topnav" aria-label="주요 메뉴">
          {/* bar-inner 가 스크롤 컨테이너다. 데스크톱에서는 1200px 컬럼이라 넘치지 않고,
              좁은 화면에서는 뷰포트 폭이라 그대로 가로 스크롤이 된다. 브랜드·내비·본문이
              같은 좌측 선에 맞는 것도 이 공용 클래스 덕이다. */}
          <div className="bar-inner topnav-scroller" ref={navRef}>
            {items.map((item) => (
              // end: 이게 없으면 "/" 가 모든 라우트에 매칭돼 홈이 영구히 활성이 된다.
              // NavLink 가 붙이는 aria-current="page" 하나가 접근성 훅이자 CSS 셀렉터이자
              // 위 useEffect 의 쿼리다.
              <NavLink key={item.path} to={item.path} end={item.path === '/'}>
                <NavIcon paths={item.paths} />
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      </header>

      <main className="content">
        <div className="bar-inner">
          <Outlet />
        </div>
      </main>
    </>
  )
}
