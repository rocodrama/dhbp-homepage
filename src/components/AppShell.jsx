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
          <button className="avatar-btn" onClick={signOutUser} title="로그아웃">
            {profile?.photoURL ? (
              <img src={profile.photoURL} alt="" className="avatar-img" />
            ) : (
              <span className="avatar-fallback">
                {profile?.displayName?.[0] ?? '?'}
              </span>
            )}
          </button>
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
