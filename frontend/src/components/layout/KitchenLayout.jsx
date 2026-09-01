import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ChefHat, Clock, LogOut } from 'lucide-react'

const links = [
  { to: '/kds',         icon: ChefHat, label: 'Live Orders' },
  { to: '/kds/history', icon: Clock,   label: 'Order History' },
]

export default function KitchenLayout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      <aside className="w-56 flex flex-col shrink-0 border-r" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-2 px-5 py-5 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <ChefHat size={20} style={{ color: 'var(--color-warning)' }} />
          <span className="font-bold text-sm">Kitchen KDS</span>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? 'text-white' : 'hover:bg-white/5'}`
              }
              style={({ isActive }) => isActive ? { background: 'var(--color-warning)', color: '#fff' } : { color: 'var(--color-muted)' }}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <p className="text-xs mb-3" style={{ color: 'var(--color-muted)' }}>{user?.name}</p>
          <button
            onClick={async () => { await logout(); navigate('/login') }}
            className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg hover:bg-white/5 w-full"
            style={{ color: 'var(--color-muted)' }}
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-6">
        {children}
      </main>
    </div>
  )
}
