import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { visibleNavItems } from '../components/navItems'

export default function More() {
  const { isAdmin } = useAuth()
  const moreItems = visibleNavItems(isAdmin).slice(4)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {moreItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          style={{
            background: 'var(--color-white)',
            borderRadius: 10,
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 14,
          }}
        >
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </Link>
      ))}
    </div>
  )
}
