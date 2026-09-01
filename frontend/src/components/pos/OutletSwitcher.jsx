import { useState, useRef, useEffect } from 'react'
import { useOutletStore } from '../../store/useOutletStore'
import { ChevronDown, Check } from '@untitledui/icons'

export default function OutletSwitcher({ collapsed = false }) {
  const { outlets, currentOutlet, setCurrentOutlet, fetchOutlets } = useOutletStore()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    fetchOutlets()
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getOutletIcon = (type) => {
    switch (type) {
      case 'cafe':
        return '☕'
      case 'bar':
        return '🍸'
      case 'retail':
        return '🛒'
      case 'dine_in':
      default:
        return '🍽️'
    }
  }

  const getOutletBadge = (type) => {
    switch (type) {
      case 'cafe':
        return 'Cafe'
      case 'bar':
        return 'Bar'
      case 'retail':
        return 'Mart'
      case 'dine_in':
      default:
        return 'Dining'
    }
  }

  if (!currentOutlet && outlets.length === 0) return null

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* ── Switcher Trigger Button ── */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between transition-all duration-200 cursor-pointer rounded-xl border ${
          isOpen
            ? 'bg-[#126973]/15 dark:bg-[#126973]/30 border-[#126973] dark:border-[#F1D8C2] shadow-sm'
            : 'bg-white/80 dark:bg-[#072328]/60 hover:bg-[#126973]/10 dark:hover:bg-[#126973]/20 border-[#126973]/20 dark:border-[#F1D8C2]/20'
        } ${collapsed ? 'p-2 justify-center' : 'px-3 py-2'}`}
        title={currentOutlet?.name || 'Switch Outlet'}
      >
        <div className={`flex items-center gap-2.5 min-w-0 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-7 h-7 rounded-lg bg-[#126973]/10 dark:bg-[#126973]/30 border border-[#126973]/20 dark:border-[#F1D8C2]/30 flex items-center justify-center text-sm shrink-0 shadow-2xs">
            {getOutletIcon(currentOutlet?.type)}
          </div>

          {!collapsed && (
            <div className="flex flex-col text-left min-w-0">
              <span className="text-[12.5px] font-bold text-[#126973] dark:text-[#F1D8C2] truncate leading-tight">
                {currentOutlet?.name || 'SKYPARK Outlet'}
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400 mt-0.5">
                {getOutletBadge(currentOutlet?.type)} · {currentOutlet?.has_tables ? 'Tables Active' : 'Direct Checkout'}
              </span>
            </div>
          )}
        </div>

        {!collapsed && (
          <ChevronDown
            size={16}
            className={`shrink-0 ml-1 text-slate-400 dark:text-slate-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-[#126973] dark:text-[#F1D8C2]' : ''
            }`}
          />
        )}
      </button>

      {/* ── Dropdown Menu ── */}
      {isOpen && (
        <div
          className={`absolute z-50 mt-1.5 w-64 rounded-xl bg-white dark:bg-[#06181b] border border-[#126973]/25 dark:border-[#F1D8C2]/30 shadow-2xl p-1.5 backdrop-blur-md animate-in fade-in-50 zoom-in-95 duration-150 ${
            collapsed ? 'left-12 top-0' : 'left-0 right-0 w-full'
          }`}
        >
          <div className="px-2.5 py-1.5 mb-1 border-b border-[#126973]/15 dark:border-[#126973]/30 flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
              Select SKYPARK Venue
            </span>
            <span className="text-[10px] font-medium text-[#126973] dark:text-[#F1D8C2]">
              {outlets.length} Venues
            </span>
          </div>

          <div className="space-y-1">
            {outlets.map((outlet) => {
              const isSelected = currentOutlet?.id === outlet.id
              return (
                <button
                  key={outlet.id}
                  type="button"
                  onClick={() => {
                    setCurrentOutlet(outlet)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#126973]/15 dark:bg-[#126973]/35 text-[#126973] dark:text-[#F1D8C2] font-semibold border border-[#126973]/30 dark:border-[#F1D8C2]/30 shadow-2xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-[#126973]/8 dark:hover:bg-[#126973]/20 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base shrink-0">{getOutletIcon(outlet.type)}</span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[12.5px] truncate font-semibold leading-tight">
                        {outlet.name}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {outlet.description || `${getOutletBadge(outlet.type)} Service`}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <Check size={16} className="shrink-0 text-[#126973] dark:text-[#F1D8C2]" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
