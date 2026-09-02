import { useState, useRef, useEffect } from 'react'
import { useOutletStore } from '../../store/useOutletStore'
import { ChevronDown, Check, ChevronSelectorVertical } from '@untitledui/icons'

export default function OutletSwitcher({ collapsed = false, align = 'right' }) {
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
    <div className={`relative ${collapsed ? 'w-auto' : 'w-auto inline-block'}`} ref={dropdownRef}>
      {/* ── Switcher Trigger Button ── */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center justify-between transition-all duration-200 cursor-pointer select-none rounded-xl border ${
          isOpen
            ? 'ring-2 ring-[#126973]/25 dark:ring-[#F1D8C2]/30 border-[#126973] dark:border-[#F1D8C2] bg-[#126973]/10 dark:bg-[#126973]/25 shadow-xs'
            : 'bg-white/90 dark:bg-[#072328]/80 hover:bg-[#126973]/8 dark:hover:bg-[#126973]/20 border-[#126973]/20 dark:border-[#F1D8C2]/20 hover:border-[#126973]/40 dark:hover:border-[#F1D8C2]/40 shadow-2xs'
        } ${collapsed ? 'w-10 h-10 p-0 mx-auto justify-center' : 'px-2.5 py-1.5 gap-2.5 min-w-[160px] sm:min-w-[180px]'}`}
        title={currentOutlet?.name || 'Switch Outlet'}
      >
        <div className={`flex items-center gap-2 min-w-0 ${collapsed ? 'justify-center' : ''}`}>
         
         

          {!collapsed && (
            <div className="flex flex-col text-left min-w-0 pr-0.5">
              <span className="text-[12px] sm:text-[12.5px] font-bold text-[#072328] dark:text-[#F8F7F4] truncate leading-tight">
                {currentOutlet?.name || '--'}
              </span>
              <span className="text-[9.5px] uppercase font-bold tracking-wider text-[#126973] dark:text-[#F1D8C2] mt-0.5 leading-none">
                {getOutletBadge(currentOutlet?.type)}
              </span>
            </div>
          )}
        </div>

        {!collapsed && (
          <ChevronSelectorVertical
            size={14}
            className={`shrink-0 ml-auto transition-transform duration-200 text-slate-400 dark:text-slate-500 ${
              isOpen ? 'rotate-180 text-[#126973] dark:text-[#F1D8C2]' : ''
            }`}
          />
        )}
      </button>

      {/* ── Dropdown Menu ── */}
      {isOpen && (
        <div
          className={`absolute z-50 mt-2 w-72 sm:w-80 rounded-2xl bg-[#FAF8F5] dark:bg-[#06181b] border border-[#126973]/25 dark:border-[#F1D8C2]/30 shadow-2xl p-2 backdrop-blur-md animate-in fade-in-50 zoom-in-95 duration-150 ${
            collapsed ? 'left-12 top-0' : align === 'right' ? 'right-0' : 'left-0'
          }`}
          style={{
            boxShadow: '0 20px 40px -15px rgba(7, 35, 40, 0.45)',
          }}
        >
          {/* Header Banner */}
          <div className="px-3 py-2 mb-1.5 rounded-xl border border-[#126973]/15 dark:border-[#126973]/30 bg-gradient-to-r from-[#126973]/10 via-[#126973]/5 to-[#F1D8C2]/10 dark:from-[#126973]/25 dark:to-[#072328] flex items-center justify-between">
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-[#126973] dark:text-[#F1D8C2]">
              Select Venue
            </span>
            <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-md bg-[#126973]/15 dark:bg-[#126973]/30 text-[#126973] dark:text-[#F1D8C2] border border-[#126973]/20 dark:border-[#F1D8C2]/20">
              {outlets.length} Venue
            </span>
          </div>

          {/* Outlet List */}
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
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-[#126973]/12 dark:bg-[#126973]/30 border-[#126973]/30 dark:border-[#F1D8C2]/30 shadow-2xs'
                      : 'border-transparent text-slate-700 dark:text-slate-300 hover:bg-[#126973]/8 dark:hover:bg-[#126973]/20 hover:border-[#126973]/15'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    

                    <div className="flex flex-col min-w-0 pr-1">
                      <span
                        className={`text-[12.5px] truncate font-bold leading-tight ${
                          isSelected
                            ? 'text-[#126973] dark:text-[#F1D8C2]'
                            : 'text-[#072328] dark:text-[#F8F7F4]'
                        }`}
                      >
                        {outlet.name}
                      </span>
                      <span className="text-[10.5px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {outlet.description || `${getOutletBadge(outlet.type)} · ${outlet.has_tables ? 'Table Service' : 'Quick Order'}`}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-[#126973] dark:bg-[#F1D8C2] flex items-center justify-center shrink-0 shadow-2xs ml-1">
                      <Check size={12} className="text-white dark:text-[#072328] stroke-[3]" />
                    </div>
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
