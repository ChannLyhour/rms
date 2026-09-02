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
          className={`flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full border transition-all cursor-pointer select-none bg-[#FAF8F5] dark:bg-[#072328] ${
            isOpen
              ? 'ring-2 ring-[#126973]/25 dark:ring-[#F1D8C2]/30 border-[#126973] dark:border-[#F1D8C2] shadow-xs'
              : 'border-[#126973]/20 dark:border-[#F1D8C2]/20 hover:bg-[#126973]/8 dark:hover:bg-[#126973]/25 hover:border-[#126973]/40 dark:hover:border-[#F1D8C2]/40'
          }`}
        >
          {/* Avatar with Status Dot */}
          <div className="relative shrink-0 flex items-center justify-center">
            <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11.5px] text-[#F1D8C2] shadow-xs overflow-hidden border border-[#F1D8C2]/30 bg-gradient-to-br from-[#126973] to-[#072328]">
              {userDisplayName.charAt(0).toUpperCase()}
            </div>
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-[#FAF8F5] dark:ring-[#072328]" />
          </div>

          <div className="text-left hidden sm:flex flex-col min-w-0 pr-0.5">
            <span className="text-[12.5px] font-bold leading-tight truncate max-w-[120px] text-[#072328] dark:text-[#F8F7F4]">
              {userDisplayName}
            </span>
            <span className="text-[10px] font-semibold leading-tight text-[#126973] dark:text-[#F1D8C2] mt-0.5 uppercase tracking-wide">
              {userRoleName}
            </span>
          </div>

          <ChevronSelectorVertical
            size={13}
            className={`shrink-0 transition-transform duration-200 text-slate-400 dark:text-slate-500 ${
              isOpen ? 'rotate-180 text-[#126973] dark:text-[#F1D8C2]' : ''
            }`}
          />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`transition-all group cursor-pointer ${
            collapsed
              ? 'w-10 h-10 p-0 mx-auto rounded-xl flex items-center justify-center hover:bg-[#126973]/10 dark:hover:bg-[#126973]/25'
              : 'w-full flex items-center justify-between gap-2.5 p-2 rounded-xl border text-left bg-white/80 dark:bg-[#072328]/60 hover:bg-[#126973]/8 dark:hover:bg-[#126973]/20'
          } ${
            isOpen && !collapsed
              ? 'ring-2 ring-[#126973]/25 dark:ring-[#F1D8C2]/30 border-[#126973] dark:border-[#F1D8C2] shadow-xs'
              : 'border-[#126973]/15 dark:border-[#F1D8C2]/20'
          }`}
        >
          {/* Avatar with Status Dot */}
          <div className="relative shrink-0 flex items-center justify-center">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs text-[#F1D8C2] shadow-xs overflow-hidden border border-[#F1D8C2]/30 bg-gradient-to-br from-[#126973] to-[#072328]">
              {userDisplayName.charAt(0).toUpperCase()}
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#072328]" />
          </div>

          {/* User Info & Chevron (Expanded only) */}
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0 pr-1">
                <p className="text-xs font-bold truncate leading-tight text-[#072328] dark:text-[#F8F7F4]">
                  {userDisplayName}
                </p>
                <p className="text-[11px] truncate leading-tight mt-0.5 text-slate-500 dark:text-slate-400">
                  {userDisplayEmail}
                </p>
              </div>

              <div className="w-6 h-6 rounded-[5px] flex items-center justify-center shrink-0 text-slate-400 dark:text-slate-500 group-hover:text-[#126973] dark:group-hover:text-[#F1D8C2] transition-colors">
                <ChevronSelectorVertical size={16} className={isOpen ? 'rotate-180 text-[#126973] dark:text-[#F1D8C2]' : ''} />
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
              ? 'top-full left-0 mt-2 slide-in-from-top-2'
              : 'bottom-full left-0 mb-2 slide-in-from-bottom-2'
          } w-68 rounded-2xl bg-[#FAF8F5] dark:bg-[#06181b] border border-[#126973]/25 dark:border-[#F1D8C2]/30 shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md`}
          style={{
            boxShadow: '0 20px 40px -15px rgba(7, 35, 40, 0.45)',
          }}
        >
          {/* User Info Header Card */}
          <div className="p-3.5 border-b border-[#126973]/15 dark:border-[#126973]/30 flex items-center gap-3 bg-gradient-to-br from-[#126973]/10 to-[#F1D8C2]/10 dark:from-[#126973]/25 dark:to-[#072328]">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-[#F1D8C2] shadow-sm shrink-0 border border-[#F1D8C2]/30 bg-gradient-to-br from-[#126973] to-[#072328]">
              {userDisplayName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-bold truncate leading-tight text-[#072328] dark:text-[#F8F7F4]">
                  {userDisplayName}
                </span>
                <span className="text-[9.5px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-[#126973]/15 dark:bg-[#126973]/30 text-[#126973] dark:text-[#F1D8C2] border border-[#126973]/30 dark:border-[#F1D8C2]/30 shrink-0">
                  {userRoleName}
                </span>
              </div>
              <p className="text-[11px] truncate leading-tight mt-0.5 text-slate-500 dark:text-slate-400">
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
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-[#126973]/10 dark:hover:bg-[#126973]/20 hover:text-[#126973] dark:hover:text-[#F1D8C2] text-slate-700 dark:text-slate-200 cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <User01 size={16} className="text-slate-400 dark:text-slate-500 group-hover:text-[#126973] dark:group-hover:text-[#F1D8C2] transition-colors" />
                <span>View profile</span>
              </div>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono rounded-md border bg-[#eff9fa] dark:bg-[#072328] border-[#126973]/20 dark:border-[#126973]/40 text-[#126973] dark:text-[#F1D8C2]">
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
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-[#126973]/10 dark:hover:bg-[#126973]/20 hover:text-[#126973] dark:hover:text-[#F1D8C2] text-slate-700 dark:text-slate-200 cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <Settings01 size={16} className="text-slate-400 dark:text-slate-500 group-hover:text-[#126973] dark:group-hover:text-[#F1D8C2] transition-colors" />
                  <span>Settings</span>
                </div>
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono rounded-md border bg-[#eff9fa] dark:bg-[#072328] border-[#126973]/20 dark:border-[#126973]/40 text-[#126973] dark:text-[#F1D8C2]">
                  ⌘S
                </kbd>
              </button>
            )}

            {/* Dark Mode Toggle Switch */}
            <div
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-[#126973]/10 dark:hover:bg-[#126973]/20 hover:text-[#126973] dark:hover:text-[#F1D8C2] text-slate-700 dark:text-slate-200 cursor-pointer select-none group"
              onClick={toggleTheme}
            >
              <div className="flex items-center gap-2.5">
                <Moon01 size={16} className="text-slate-400 dark:text-slate-500 group-hover:text-[#126973] dark:group-hover:text-[#F1D8C2] transition-colors" />
                <span>Dark mode</span>
              </div>
              {/* Toggle Switch Component */}
              <div
                className={`w-8 h-4.5 rounded-full transition-colors relative p-0.5 ${
                  isDark ? 'bg-[#126973]' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full bg-white dark:bg-[#F1D8C2] shadow-xs transition-transform ${
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
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-[#126973]/10 dark:hover:bg-[#126973]/20 hover:text-[#126973] dark:hover:text-[#F1D8C2] text-slate-700 dark:text-slate-200 cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <HelpCircle size={16} className="text-slate-400 dark:text-slate-500 group-hover:text-[#126973] dark:group-hover:text-[#F1D8C2] transition-colors" />
                  <span>Support</span>
                </div>
                <ChevronRight
                  size={14}
                  className={`transition-transform duration-200 text-slate-400 dark:text-slate-500 group-hover:text-[#126973] dark:group-hover:text-[#F1D8C2] ${
                    showSupportSubmenu ? 'rotate-90' : ''
                  }`}
                />
              </button>

              {showSupportSubmenu && (
                <div className="pl-7 pr-2 py-1 space-y-0.5 border-l-2 ml-4 my-1 animate-in fade-in duration-100 border-[#126973]/30 dark:border-[#F1D8C2]/30">
                  <button
                    onClick={() => { setIsOpen(false); toast.success('Opening Help Center...') }}
                    className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-[#126973]/10 dark:hover:bg-[#126973]/20 hover:text-[#126973] dark:hover:text-[#F1D8C2] cursor-pointer"
                  >
                    Help Center
                  </button>
                  <button
                    onClick={() => { setIsOpen(false); toast.success('Contacting Support...') }}
                    className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-[#126973]/10 dark:hover:bg-[#126973]/20 hover:text-[#126973] dark:hover:text-[#F1D8C2] cursor-pointer"
                  >
                    Contact Support
                  </button>
                  <button
                    onClick={() => { setIsOpen(false); toast.success('Feedback dialog opened') }}
                    className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-[#126973]/10 dark:hover:bg-[#126973]/20 hover:text-[#126973] dark:hover:text-[#F1D8C2] cursor-pointer"
                  >
                    Send Feedback
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Separator */}
          <div className="border-t my-1 border-[#126973]/15 dark:border-[#126973]/30" />

          {/* Sign out */}
          <div className="p-1.5">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 dark:hover:bg-rose-500/20 transition-colors cursor-pointer"
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
