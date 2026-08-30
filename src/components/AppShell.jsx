import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { visibleNavItems } from './navItems'
import './AppShell.css'

export default function AppShell() {
  const { profile, isAdmin, signOutUser } = useAuth()
  const location = useLocation()
  const items = visibleNavItems(isAdmin)
  const mobileTabItems = items.slice(0, 4)
  const current = items.find((item) => item.path === location.pathname)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!menuOpen) return
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [menuOpen])

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar-logo">DHBP</div>
        <nav className="sidebar-nav">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                'nav-item' + (isActive ? ' active' : '')
              }
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="main-col">
        <header className="topbar">
          <h1 className="page-title">{current?.label ?? ''}</h1>
          <div className="profile-menu" ref={menuRef}>
            <button className="avatar-btn" onClick={() => setMenuOpen((v) => !v)} title="프로필">
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt="" className="avatar-img" />
              ) : (
                <span className="avatar-fallback">
                  {profile?.displayName?.[0] ?? '?'}
                </span>
              )}
            </button>
            {menuOpen && (
              <div className="profile-dropdown">
                <div className="profile-dropdown-info">
                  <div className="profile-dropdown-name">{profile?.displayName ?? '이름 없음'}</div>
                  <div className="profile-dropdown-email">{profile?.email}</div>
                </div>
                <button className="profile-dropdown-logout" onClick={signOutUser}>
                  로그아웃
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="content-area">
          <Outlet />
        </main>

        <nav className="mobile-tabbar">
          {mobileTabItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                'tab-item' + (isActive ? ' active' : '')
              }
            >
              <span>{item.icon}</span>
              <span className="tab-label">{item.label.split('/')[0]}</span>
            </NavLink>
          ))}
          <NavLink
            to="/more"
            className={({ isActive }) => 'tab-item' + (isActive ? ' active' : '')}
          >
            <span>⋯</span>
            <span className="tab-label">더보기</span>
          </NavLink>
        </nav>
      </div>
    </div>
  )
}
