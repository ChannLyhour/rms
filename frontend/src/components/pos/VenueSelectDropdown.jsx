import { useState, useRef, useEffect, useMemo } from 'react'
import {
  Building2,
  ChevronDown,
  Search,
  Check,
  Store,
  Coffee,
  Wine,
  Utensils,
  ShoppingCart,
  X,
  Sparkles
} from 'lucide-react'

// Helper for type icons
const getVenueIcon = (type) => {
  switch (String(type || '').toLowerCase()) {
    case 'cafe':
      return <Coffee size={16} className="text-amber-500 shrink-0" />
    case 'bar':
      return <Wine size={16} className="text-purple-500 shrink-0" />
    case 'retail':
      return <ShoppingCart size={16} className="text-emerald-500 shrink-0" />
    case 'dine_in':
    default:
      return <Utensils size={16} className="text-cyan-600 dark:text-cyan-400 shrink-0" />
  }
}

const getVenueEmoji = (type) => {
  switch (String(type || '').toLowerCase()) {
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

const getVenueTypeLabel = (type) => {
  switch (String(type || '').toLowerCase()) {
    case 'cafe':
      return 'Cafe & Bakery'
    case 'bar':
      return 'SkyBar & Lounge'
    case 'retail':
      return 'Mart & Retail'
    case 'dine_in':
    default:
      return 'Grand Restaurant'
  }
}

export default function VenueSelectDropdown({
  outlets = [],
  selectedOutlet = 'all',
  onSelectOutlet = () => {},
  productCounts = {},
  loading = false,
  disabled = false,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef(null)
  const searchInputRef = useRef(null)

  // Find currently selected outlet object
  const currentOutlet = useMemo(() => {
    if (selectedOutlet === 'all' || !selectedOutlet) return null
    return outlets.find((o) => String(o.id) === String(selectedOutlet)) || null
  }, [outlets, selectedOutlet])

  // Filter outlets by search input
  const filteredOutlets = useMemo(() => {
    if (!searchQuery.trim()) return outlets
    const q = searchQuery.toLowerCase()
    return outlets.filter(
      (o) =>
        o.name?.toLowerCase().includes(q) ||
        o.code?.toLowerCase().includes(q) ||
        o.type?.toLowerCase().includes(q) ||
        o.description?.toLowerCase().includes(q)
    )
  }, [outlets, searchQuery])

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false)
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
      // Auto focus search input when opening
      setTimeout(() => searchInputRef.current?.focus(), 50)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleSelect = (outletId, outlet) => {
    if (disabled) return
    onSelectOutlet(outletId, outlet)
    setIsOpen(false)
    setSearchQuery('')
  }

  const allCount = productCounts['all'] ?? productCounts.all

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* ── Dropdown Trigger Button ── */}
      <button
        type="button"
        onClick={() => {
          if (disabled || loading) return
          setIsOpen((prev) => !prev)
        }}
        disabled={disabled || loading}
        className={`flex items-center gap-2.5 px-3 py-2 rounded-[6px] border text-xs font-semibold shadow-xs transition-all select-none outline-none ${
          disabled
            ? 'cursor-default opacity-90'
            : isOpen
            ? 'ring-2 ring-[#126973]/30 dark:ring-[#F1D8C2]/30 border-[#126973] dark:border-[#F1D8C2] cursor-pointer'
            : 'hover:border-slate-400 dark:hover:border-slate-500 cursor-pointer'
        }`}
        style={{
          background: 'var(--color-bg)',
          borderColor: isOpen ? 'var(--color-500, #126973)' : 'var(--color-border)',
          color: 'var(--color-text)'
        }}
        title={disabled ? `Assigned Venue: ${currentOutlet?.name || 'All Venues'}` : 'Filter products by Venue / Outlet'}
      >
        {/* Leading Venue Icon */}
        <div className="w-5 h-5 rounded-[4px] bg-[#126973]/10 dark:bg-[#126973]/25 flex items-center justify-center shrink-0">
          {currentOutlet ? (
            <span className="text-xs leading-none">{getVenueEmoji(currentOutlet.type)}</span>
          ) : (
            <Building2 size={13} className="text-[#126973] dark:text-[#F1D8C2]" />
          )}
        </div>

        {/* Selected Venue Label */}
        <div className="flex items-center gap-1.5 min-w-0 max-w-[140px] sm:max-w-[170px] truncate text-left">
          <span className="truncate font-bold">
            {currentOutlet ? currentOutlet.name : 'All Venues'}
          </span>
          {currentOutlet && (
            <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[9.5px] uppercase font-mono tracking-wider bg-[#126973]/10 text-[#126973] dark:text-[#F1D8C2] border border-[#126973]/20">
              {currentOutlet.code || getVenueTypeLabel(currentOutlet.type)}
            </span>
          )}
        </div>

        {/* Chevron Indicator (hidden if disabled) */}
        {!disabled && (
          <ChevronDown
            size={14}
            className={`shrink-0 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-[#126973] dark:text-[#F1D8C2]' : 'text-slate-400'
            }`}
          />
        )}
      </button>

      {/* ── Dropdown Popover ── */}
      {isOpen && (
        <div
          className="absolute left-0 sm:left-auto sm:right-0 mt-1.5 w-72 sm:w-80 rounded-[8px] border shadow-2xl z-50 overflow-hidden backdrop-blur-md animate-in fade-in zoom-in-95 duration-150"
          style={{
            background: 'var(--color-surface, #ffffff)',
            borderColor: 'var(--color-border, #e2e8f0)',
            boxShadow: '0 20px 35px -10px rgba(0, 0, 0, 0.3)'
          }}
        >
          {/* Header & Search Field */}
          <div
            className="p-2.5 border-b space-y-2"
            style={{
              borderColor: 'var(--color-border)',
              background: 'var(--color-bg)'
            }}
          >
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Store size={12} className="text-[#126973] dark:text-[#F1D8C2]" />
               by Venue
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-slate-500 dark:text-slate-400">
                {outlets.length} Venues
              </span>
            </div>

            <div
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-[5px] border text-xs"
              style={{
                background: 'var(--color-surface)',
                borderColor: 'var(--color-border)'
              }}
            >
              <Search size={14} className="text-slate-400 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search venue name or code..."
                className="bg-transparent border-none outline-none w-full text-xs placeholder:text-slate-400"
                style={{ color: 'var(--color-text)' }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* List Options */}
          <div className="p-1.5 max-h-64 overflow-y-auto space-y-1 scrollbar-thin">
            {/* 'All Venues' Option (when no search or matches search) */}
            {(!searchQuery || 'all venues'.includes(searchQuery.toLowerCase())) && (
              <button
                type="button"
                onClick={() => handleSelect('all', null)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-[6px] text-left text-xs transition-all cursor-pointer ${
                  selectedOutlet === 'all' || !selectedOutlet
                    ? 'bg-[#126973]/12 dark:bg-[#126973]/30 font-bold border border-[#126973]/30 dark:border-[#F1D8C2]/30 shadow-2xs'
                    : 'hover:bg-black/5 dark:hover:bg-white/5'
                }`}
                style={{
                  color:
                    selectedOutlet === 'all' || !selectedOutlet
                      ? 'var(--color-500, #126973)'
                      : 'var(--color-text)'
                }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-[6px] flex items-center justify-center shrink-0 border ${
                      selectedOutlet === 'all' || !selectedOutlet
                        ? 'bg-[#126973] text-white border-transparent'
                        : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-slate-500'
                    }`}
                  >
                    <Building2 size={14} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="truncate font-semibold">All Venues</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                      Display catalog from all outlets
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {allCount !== undefined && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-black/5 dark:bg-white/10 text-slate-500">
                      {allCount}
                    </span>
                  )}
                  {(selectedOutlet === 'all' || !selectedOutlet) && (
                    <Check size={14} className="text-[#126973] dark:text-[#F1D8C2] stroke-[2.5]" />
                  )}
                </div>
              </button>
            )}

            {/* Individual Venues */}
            {filteredOutlets.map((outlet) => {
              const isSelected = String(selectedOutlet) === String(outlet.id)
              const count = productCounts[String(outlet.id)] ?? productCounts[outlet.id]

              return (
                <button
                  key={outlet.id}
                  type="button"
                  onClick={() => handleSelect(String(outlet.id), outlet)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-[6px] text-left text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#126973]/12 dark:bg-[#126973]/30 font-bold border border-[#126973]/30 dark:border-[#F1D8C2]/30 shadow-2xs'
                      : 'hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                  style={{
                    color: isSelected ? 'var(--color-500, #126973)' : 'var(--color-text)'
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-[6px] flex items-center justify-center shrink-0 border text-sm ${
                        isSelected
                          ? 'bg-[#126973]/20 border-[#126973]/40'
                          : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10'
                      }`}
                    >
                      {getVenueEmoji(outlet.type)}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate font-semibold">{outlet.name}</span>
                        {outlet.code && (
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-black/5 dark:bg-white/10 text-slate-500 uppercase">
                            {outlet.code}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate font-normal">
                        {outlet.description || getVenueTypeLabel(outlet.type)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {count !== undefined && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-black/5 dark:bg-white/10 text-slate-500">
                        {count}
                      </span>
                    )}
                    {isSelected && (
                      <Check size={14} className="text-[#126973] dark:text-[#F1D8C2] stroke-[2.5]" />
                    )}
                  </div>
                </button>
              )
            })}

            {filteredOutlets.length === 0 && searchQuery && (
              <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500 space-y-1">
                <Store size={22} className="mx-auto text-slate-300 dark:text-slate-600 opacity-60" />
                <p>No venues matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
