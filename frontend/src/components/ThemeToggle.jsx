import { useTheme } from '../context/ThemeContext'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle({ className = '', collapsed = false }) {
  const { toggleTheme, isDark } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`flex items-center gap-2 p-2 rounded-xl transition-all border shadow-sm hover:opacity-90 active:scale-95 ${
        collapsed ? 'justify-center w-9 h-9' : 'px-3 py-2 text-xs font-semibold w-full'
      } ${className}`}
      style={{
        background: 'var(--color-card)',
        borderColor: 'var(--color-border)',
        color: 'var(--color-text)'
      }}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
    >
      {isDark ? (
        <Sun size={16} className="text-amber-400 shrink-0 transition-transform hover:rotate-45" />
      ) : (
        <Moon size={16} className="text-indigo-500 shrink-0 transition-transform hover:-rotate-12" />
      )}
      {!collapsed && (
        <span className="truncate">
          {isDark ? 'Switch to Light' : 'Switch to Dark'}
        </span>
      )}
    </button>
  )
}
