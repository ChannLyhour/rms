import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import {
  ChevronSelectorVertical,
  User01,
  Settings01,
  Moon01,
  HelpCircle,
  LogOut01,
  ChevronRight
} from '@untitledui/icons'
import toast from 'react-hot-toast'
import { LoadingPopup } from '../loading-page'

export default function DropdownAccountCardMD({ collapsed, placement = 'top', compact = false }) {
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const [isOpen, setIsOpen] = useState(false)
  const [showSupportSubmenu, setShowSupportSubmenu] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const dropdownRef = useRef(null)

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
        setShowSupportSubmenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    setIsOpen(false)
    setIsLoggingOut(true)
  }

  const handleCompleteLogout = async () => {
    await logout()
    navigate('/login')
  }

  const userDisplayName = user?.name || 'Admin User'
  const userDisplayEmail = user?.email || (user?.role?.name ? `${user.role.name.toLowerCase()}@pos.com` : 'admin@pos.com')
  const userRoleName = user?.role?.name || 'Admin'
  const userRoleLower = userRoleName.toLowerCase()
  const isAdmin = userRoleLower === 'admin' || userRoleLower.includes('admin') || user?.is_admin

  return (
    <div className={`relative ${compact ? 'w-auto inline-block' : 'w-full'}`} ref={dropdownRef}>
      {/* ── 1. Account Card Trigger ── */}
      {compact ? (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full border transition-all cursor-pointer select-none ${
            isOpen
              ? 'ring-2 ring-red-500/25 border-red-500/50 shadow-sm'
              : 'hover:bg-black/5 dark:hover:bg-white/5 hover:border-red-500/30'
          }`}
          style={{
            background: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          {/* Avatar with Status Dot */}
          <div className="relative shrink-0 flex items-center justify-center">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11.5px] text-white shadow-xs overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, var(--color-500, #BF4040), var(--color-700, #8A2E2E))',
              }}
            >
              {userDisplayName.charAt(0).toUpperCase()}
            </div>
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-[var(--color-surface)]" />
          </div>

          <div className="text-left hidden sm:flex flex-col min-w-0 pr-0.5">
            <span className="text-[12.5px] font-bold leading-tight truncate max-w-[120px]" style={{ color: 'var(--color-text)' }}>
              {userDisplayName}
            </span>
            <span className="text-[10px] font-semibold leading-tight text-emerald-500 mt-0.5 uppercase tracking-wide">
              {userRoleName}
            </span>
          </div>

          <ChevronSelectorVertical
            size={13}
            style={{ color: 'var(--color-muted)' }}
            className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-red-500' : ''}`}
          />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`transition-all group cursor-pointer ${
            collapsed
              ? 'w-10 h-10 p-0 mx-auto rounded-xl flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5'
              : 'w-full flex items-center justify-between gap-3 p-2 rounded-xl border text-left hover:bg-black/5 dark:hover:bg-white/5'
          } ${
            isOpen && !collapsed
              ? 'ring-2 ring-red-500/20 border-red-500/50 shadow-sm'
              : ''
          }`}
          style={
            collapsed
              ? undefined
              : {
                  background: 'var(--color-card)',
                  borderColor: 'var(--color-border)',
                }
          }
        >
          {/* Avatar with Status Dot */}
          <div className="relative shrink-0 flex items-center justify-center">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs text-white shadow-sm overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, var(--color-500, #BF4040), var(--color-700, #8A2E2E))',
              }}
            >
              {userDisplayName.charAt(0).toUpperCase()}
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[var(--color-card)]" />
          </div>

          {/* User Info & Chevron (Expanded only) */}
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0 pr-1">
                <p
                  className="text-xs font-bold truncate leading-tight"
                  style={{ color: 'var(--color-text)' }}
                >
                  {userDisplayName}
                </p>
                <p
                  className="text-[11px] truncate leading-tight mt-0.5"
                  style={{ color: 'var(--color-muted)' }}
                >
                  {userDisplayEmail}
                </p>
              </div>

              <div
                className="w-6 h-6 rounded-[5px] flex items-center justify-center shrink-0"
                style={{ color: 'var(--color-muted)' }}
              >
                <ChevronSelectorVertical size={16} />
              </div>
            </>
          )}
        </button>
      )}

      {/* ── 2. Modern Floating Popover Menu ── */}
      {isOpen && (
        <div
          className={`absolute ${
            placement === 'bottom'
              ? 'top-full right-0 mt-2.5 slide-in-from-top-2'
              : 'bottom-full left-0 mb-2.5 slide-in-from-bottom-2'
          } w-68 rounded-2xl border shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md`}
          style={{
            background: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.45)',
          }}
        >
          {/* User Info Header Card */}
          <div
            className="p-3.5 border-b flex items-center gap-3"
            style={{
              borderColor: 'var(--color-border)',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.02), rgba(191,64,64,0.04))',
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-md shrink-0"
              style={{
                background: 'linear-gradient(135deg, var(--color-500, #BF4040), var(--color-700, #8A2E2E))',
              }}
            >
              {userDisplayName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-bold truncate leading-tight" style={{ color: 'var(--color-text)' }}>
                  {userDisplayName}
                </span>
                <span className="text-[9.5px] font-extrabold uppercase px-1.5 py-0.2 rounded-md bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 shrink-0">
                  {userRoleName}
                </span>
              </div>
              <p className="text-[11px] truncate leading-tight mt-0.5" style={{ color: 'var(--color-muted)' }}>
                {userDisplayEmail}
              </p>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-1.5 space-y-0.5">
            {/* View Profile */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false)
                toast.success(`Logged in as ${userDisplayName}`)
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
              style={{ color: 'var(--color-text)' }}
            >
              <div className="flex items-center gap-2.5">
                <User01 size={16} style={{ color: 'var(--color-muted)' }} />
                <span>View profile</span>
              </div>
              <kbd
                className="px-1.5 py-0.5 text-[10px] font-mono rounded-md border"
                style={{
                  background: 'var(--color-bg)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-muted)',
                }}
              >
                ⌘K→P
              </kbd>
            </button>

            {/* Settings (Admin only) */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  navigate('/settings')
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                style={{ color: 'var(--color-text)' }}
              >
                <div className="flex items-center gap-2.5">
                  <Settings01 size={16} style={{ color: 'var(--color-muted)' }} />
                  <span>Settings</span>
                </div>
                <kbd
                  className="px-1.5 py-0.5 text-[10px] font-mono rounded-md border"
                  style={{
                    background: 'var(--color-bg)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-muted)',
                  }}
                >
                  ⌘S
                </kbd>
              </button>
            )}

            {/* Dark Mode Toggle Switch */}
            <div
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer select-none"
              onClick={toggleTheme}
              style={{ color: 'var(--color-text)' }}
            >
              <div className="flex items-center gap-2.5">
                <Moon01 size={16} style={{ color: 'var(--color-muted)' }} />
                <span>Dark mode</span>
              </div>
              {/* Toggle Switch Component */}
              <div
                className={`w-8 h-4.5 rounded-full transition-colors relative p-0.5 ${
                  isDark ? 'bg-red-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full bg-white shadow-xs transition-transform ${
                    isDark ? 'translate-x-3.5' : 'translate-x-0'
                  }`}
                />
              </div>
            </div>

            {/* Support Submenu Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSupportSubmenu(!showSupportSubmenu)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                style={{ color: 'var(--color-text)' }}
              >
                <div className="flex items-center gap-2.5">
                  <HelpCircle size={16} style={{ color: 'var(--color-muted)' }} />
                  <span>Support</span>
                </div>
                <ChevronRight
                  size={14}
                  style={{ color: 'var(--color-muted)' }}
                  className={`transition-transform duration-200 ${showSupportSubmenu ? 'rotate-90' : ''}`}
                />
              </button>

              {showSupportSubmenu && (
                <div
                  className="pl-7 pr-2 py-1 space-y-0.5 border-l-2 ml-4 my-1 animate-in fade-in duration-100"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <button
                    onClick={() => { setIsOpen(false); toast.success('Opening Help Center...') }}
                    className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Help Center
                  </button>
                  <button
                    onClick={() => { setIsOpen(false); toast.success('Contacting Support...') }}
                    className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Contact Support
                  </button>
                  <button
                    onClick={() => { setIsOpen(false); toast.success('Feedback dialog opened') }}
                    className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Send Feedback
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Separator */}
          <div className="border-t my-1" style={{ borderColor: 'var(--color-border)' }} />

          {/* Sign out */}
          <div className="p-1.5">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <LogOut01 size={16} />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}

      <LoadingPopup
        isOpen={isLoggingOut}
        user={user}
        title="SKYPARK"
        subMessage="INITIALIZING SYSTEM"
        duration={1500}
        onComplete={handleCompleteLogout}
      />
    </div>
  )
}
