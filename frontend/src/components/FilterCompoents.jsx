import React, { useState, useRef, useEffect } from 'react'
import {
  SearchLg,
  X,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowDown,
  ArrowUp,
  Plus
} from '@untitledui/icons'
import {
  Filter as FilterIcon,
  SlidersHorizontal,
  ArrowUpDown,
  LayoutGrid,
  List as ListIcon,
  RotateCcw,
  Calendar
} from 'lucide-react'

// ── Hook: Click Outside Handler ─────────────────────────────────────────────
function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return
      handler(event)
    }
    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)
    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, handler])
}

// ── 1. FilterSearchInput (Untitled UI Standard Search) ──────────────────────
export const FilterSearchInput = ({
  value = '',
  onChange,
  placeholder = 'Search...',
  shortcut,
  size = 'md',
  className = '',
  autoFocus = false,
  ...props
}) => {
  const inputRef = useRef(null)

  const sizeClasses = {
    sm: 'h-9 text-xs px-3 pl-8.5',
    md: 'h-10 text-xs px-3.5 pl-9',
    lg: 'h-11 text-sm px-4 pl-10'
  }[size] || 'h-10 text-xs px-3.5 pl-9'

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 18
  }[size] || 16

  return (
    <div className={`relative flex items-center group ${className}`}>
      {/* Leading Search Icon */}
      <SearchLg
        size={iconSizes}
        className="absolute left-3 text-[var(--color-muted,#94a3b8)] pointer-events-none group-focus-within:text-[#126973] transition-colors shrink-0 stroke-[2px]"
      />

      {/* Input Element */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value, e)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={`w-full rounded-lg border bg-[var(--color-card,#ffffff)] text-[var(--color-text,#0f172a)] placeholder:text-[var(--color-muted,#94a3b8)] outline-none border-[var(--color-border,#e2e8f0)] transition-all shadow-2xs focus:border-[#126973] focus:ring-3 focus:ring-[#126973]/15 font-medium pr-14 ${sizeClasses}`}
        {...props}
      />

      {/* Trailing Controls: Clear & Shortcut */}
      <div className="absolute right-2.5 flex items-center gap-1.5 pointer-events-auto">
        {value ? (
          <button
            type="button"
            onClick={() => {
              onChange?.('', null)
              inputRef.current?.focus()
            }}
            aria-label="Clear search"
            className="p-1 rounded-md text-[var(--color-muted,#94a3b8)] hover:text-[var(--color-text,#0f172a)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X size={13} className="stroke-[2.5px]" />
          </button>
        ) : shortcut ? (
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold text-[var(--color-muted,#94a3b8)] bg-black/5 dark:bg-white/5 border border-[var(--color-border,#e2e8f0)] rounded shadow-2xs">
            {shortcut}
          </kbd>
        ) : null}
      </div>
    </div>
  )
}

// ── 2. CreateButton (Untitled UI Primary Action Button with Plus Icon) ────────
export const CreateButton = ({
  label = 'Create',
  onClick,
  icon: CustomIcon,
  size = 'md',
  variant = 'primary', // 'primary' | 'teal' | 'secondary' | 'outline'
  show = true,
  disabled = false,
  className = '',
  ...props
}) => {
  if (!show) return null

  const Icon = CustomIcon || Plus

  const sizeClasses = {
    sm: 'h-9 px-3 text-xs gap-1.5',
    md: 'h-10 px-3.5 text-xs gap-2',
    lg: 'h-11 px-4 text-sm gap-2.5',
  }[size] || 'h-10 px-3.5 text-xs gap-2'

  const variantClasses = {
    primary:
      'bg-[#7F56D9] hover:bg-[#6941C6] text-white shadow-xs focus-visible:ring-[#7F56D9]/20',
    teal:
      'bg-[#126973] hover:bg-[#0e545c] text-white shadow-xs focus-visible:ring-[#126973]/20',
    secondary:
      'bg-black/5 dark:bg-white/10 text-[var(--color-text)] hover:bg-black/10 dark:hover:bg-white/15 focus-visible:ring-black/10',
    outline:
      'border border-[var(--color-border,#e2e8f0)] bg-[var(--color-card,#ffffff)] text-[var(--color-text,#0f172a)] hover:bg-black/5 dark:hover:bg-white/5 shadow-2xs focus-visible:ring-[#7F56D9]/20'
  }[variant] || 'bg-[#7F56D9] hover:bg-[#6941C6] text-white shadow-xs focus-visible:ring-[#7F56D9]/20'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center font-semibold rounded-lg transition-all cursor-pointer select-none outline-none focus-visible:ring-3 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shrink-0 ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      <Icon size={16} className="shrink-0 stroke-[2.5px]" />
      <span>{label}</span>
    </button>
  )
}

export const AddButton = CreateButton
export const NewButton = CreateButton

// ── 3. FilterButton (Untitled UI Filter Trigger) ─────────────────────────────
export const FilterButton = ({
  count = 0,
  label = 'Filters',
  icon: CustomIcon,
  isOpen = false,
  onClick,
  size = 'md',
  className = '',
  ...props
}) => {
  const Icon = CustomIcon || SlidersHorizontal

  const sizeClasses = {
    sm: 'h-9 px-3 text-xs gap-2',
    md: 'h-10 px-3.5 text-xs gap-2',
    lg: 'h-11 px-4 text-sm gap-2.5'
  }[size] || 'h-10 px-3.5 text-xs gap-2'

  const isActive = count > 0 || isOpen

  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={isOpen}
      className={`inline-flex items-center justify-center font-semibold rounded-lg border transition-all cursor-pointer select-none shadow-2xs outline-none focus-visible:ring-3 focus-visible:ring-[#126973]/20 ${
        isActive
          ? 'bg-[#126973]/10 border-[#126973]/30 text-[#126973] dark:text-[#F1D8C2]'
          : 'bg-[var(--color-card,#ffffff)] border-[var(--color-border,#e2e8f0)] text-[var(--color-text,#0f172a)] hover:bg-black/5 dark:hover:bg-white/5'
      } ${sizeClasses} ${className}`}
      {...props}
    >
      <Icon size={15} className="shrink-0 stroke-[2px]" />
      <span>{label}</span>
      {count > 0 && (
        <span className="ml-0.5 inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-[#126973] text-white">
          {count}
        </span>
      )}
    </button>
  )
}

// ── 3. FilterSelect (Untitled UI Filter Dropdown) ────────────────────────────
export const FilterSelect = ({
  label = 'Filter',
  value,
  onChange,
  options = [],
  placeholder = 'All',
  icon: Icon,
  size = 'md',
  align = 'left',
  multiple = false,
  className = ''
}) => {
  const [open, setOpen] = useState(false)
  const [searchFilter, setSearchFilter] = useState('')
  const dropdownRef = useRef(null)

  useClickOutside(dropdownRef, () => setOpen(false))

  // Determine active display label
  let displayValue = placeholder
  if (multiple && Array.isArray(value) && value.length > 0) {
    displayValue = `${label} (${value.length})`
  } else if (!multiple && value && value !== 'all') {
    const selectedOption = options.find((opt) => opt.value === value)
    displayValue = selectedOption ? selectedOption.label : value
  }

  const isSelected = multiple
    ? Array.isArray(value) && value.length > 0
    : Boolean(value && value !== 'all')

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchFilter.toLowerCase())
  )

  const handleSelect = (optValue) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : []
      if (currentValues.includes(optValue)) {
        onChange?.(currentValues.filter((v) => v !== optValue))
      } else {
        onChange?.([...currentValues, optValue])
      }
    } else {
      onChange?.(optValue)
      setOpen(false)
    }
  }

  const sizeClasses = {
    sm: 'h-9 px-3 text-xs gap-2',
    md: 'h-10 px-3.5 text-xs gap-2',
    lg: 'h-11 px-4 text-sm gap-2.5'
  }[size] || 'h-10 px-3.5 text-xs gap-2'

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center justify-between font-semibold rounded-lg border transition-all cursor-pointer select-none shadow-2xs outline-none focus-visible:ring-3 focus-visible:ring-[#126973]/20 ${
          isSelected || open
            ? 'bg-[#126973]/8 border-[#126973]/30 text-[#126973] dark:text-[#F1D8C2]'
            : 'bg-[var(--color-card,#ffffff)] border-[var(--color-border,#e2e8f0)] text-[var(--color-text,#0f172a)] hover:bg-black/5 dark:hover:bg-white/5'
        } ${sizeClasses}`}
      >
        <span className="flex items-center gap-1.5 truncate">
          {Icon && <Icon size={14} className="shrink-0 stroke-[2px] opacity-80" />}
          <span className="text-[var(--color-muted,#94a3b8)] font-normal">{label}:</span>
          <span className="truncate">{displayValue}</span>
        </span>
        <ChevronDown
          size={14}
          className={`ml-1 shrink-0 opacity-70 transition-transform duration-150 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Popover Dropdown Panel */}
      {open && (
        <div
          className={`absolute z-50 mt-1.5 min-w-[210px] max-w-xs rounded-xl border border-[var(--color-border,#e2e8f0)] bg-[var(--color-card,#ffffff)] p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-100 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {/* Optional Search inside long lists */}
          {options.length > 7 && (
            <div className="p-1.5 mb-1 border-b border-[var(--color-border,#e2e8f0)]">
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search..."
                className="w-full px-2 py-1 text-xs rounded border border-[var(--color-border,#e2e8f0)] bg-transparent text-[var(--color-text)] outline-none"
              />
            </div>
          )}

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto space-y-0.5">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-xs text-[var(--color-muted)] text-center">
                No matches found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const active = multiple
                  ? Array.isArray(value) && value.includes(opt.value)
                  : value === opt.value

                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors text-left cursor-pointer ${
                      active
                        ? 'bg-[#126973]/12 text-[#126973] dark:text-[#F1D8C2] font-semibold'
                        : 'text-[var(--color-text)] hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      {opt.icon && <opt.icon size={13} className="shrink-0 opacity-80" />}
                      <span className="truncate">{opt.label}</span>
                    </span>

                    <span className="flex items-center gap-1.5 shrink-0 ml-2">
                      {opt.count !== undefined && (
                        <span className="text-[10px] text-[var(--color-muted)] font-normal">
                          {opt.count}
                        </span>
                      )}
                      {active && (
                        <Check size={13} className="text-[#126973] dark:text-[#F1D8C2] stroke-[3px]" />
                      )}
                    </span>
                  </button>
                )
              })
            )}
          </div>

          {/* Footer Reset button if multiple */}
          {multiple && Array.isArray(value) && value.length > 0 && (
            <div className="pt-1.5 mt-1 border-t border-[var(--color-border,#e2e8f0)] flex justify-between items-center px-1">
              <button
                type="button"
                onClick={() => onChange?.([])}
                className="text-[11px] font-semibold text-[var(--color-muted)] hover:text-rose-500 cursor-pointer"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-2.5 py-1 text-xs font-bold rounded bg-[#126973] text-white hover:bg-[#126973]/90 cursor-pointer shadow-2xs"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── 4. FilterTabs (Untitled UI Segmented Control / Tabs) ─────────────────────
export const FilterTabs = ({
  tabs = [],
  activeTab,
  onChange,
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'p-0.5 text-xs',
    md: 'p-1 text-xs',
    lg: 'p-1.5 text-sm'
  }[size] || 'p-1 text-xs'

  return (
    <div
      className={`inline-flex items-center rounded-lg border border-[var(--color-border,#e2e8f0)] bg-[var(--color-card,#ffffff)] shadow-2xs ${sizeClasses} ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange?.(tab.id)}
            className={`relative flex items-center gap-2 px-3 py-1.5 font-semibold rounded-md transition-all cursor-pointer select-none ${
              isActive
                ? 'text-white shadow-2xs'
                : 'text-[var(--color-muted,#94a3b8)] hover:text-[var(--color-text,#0f172a)] hover:bg-black/5 dark:hover:bg-white/5'
            }`}
            style={
              isActive
                ? { background: 'linear-gradient(135deg, var(--color-500, #BF4040), var(--color-600, #9D3434))' }
                : {}
            }
          >
            {tab.icon && <tab.icon size={13} className="shrink-0 stroke-[2.2px]" />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full transition-colors ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-black/5 dark:bg-white/10 text-[var(--color-muted)]'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ── 5. SortDropdown (Untitled UI Sort Control) ───────────────────────────────
export const SortDropdown = ({
  options = [],
  value,
  direction = 'desc',
  onChange,
  label = 'Sort by',
  size = 'md',
  className = ''
}) => {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)

  useClickOutside(dropdownRef, () => setOpen(false))

  const selectedOption = options.find((opt) => opt.value === value) || options[0]

  const toggleDirection = (e) => {
    e.stopPropagation()
    const nextDir = direction === 'asc' ? 'desc' : 'asc'
    onChange?.(value, nextDir)
  }

  const handleSelect = (optValue) => {
    onChange?.(optValue, direction)
    setOpen(false)
  }

  const sizeClasses = {
    sm: 'h-9 px-3 text-xs gap-1.5',
    md: 'h-10 px-3.5 text-xs gap-2',
    lg: 'h-11 px-4 text-sm gap-2.5'
  }[size] || 'h-10 px-3.5 text-xs gap-2'

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      <div
        className={`inline-flex items-center rounded-lg border border-[var(--color-border,#e2e8f0)] bg-[var(--color-card,#ffffff)] text-[var(--color-text)] shadow-2xs font-semibold select-none ${sizeClasses}`}
      >
        {/* Toggle sort order direction button */}
        <button
          type="button"
          onClick={toggleDirection}
          title={`Order: ${direction === 'asc' ? 'Ascending' : 'Descending'}`}
          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors shrink-0"
        >
          {direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
        </button>

        {/* Dropdown toggle button */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 cursor-pointer outline-none pl-1"
        >
          <span className="text-[var(--color-muted)] font-normal">{label}:</span>
          <span className="truncate">{selectedOption?.label || value}</span>
          <ChevronDown
            size={13}
            className={`opacity-60 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Sort Options Popover */}
      {open && (
        <div className="absolute right-0 z-50 mt-1.5 min-w-[190px] rounded-xl border border-[var(--color-border,#e2e8f0)] bg-[var(--color-card,#ffffff)] p-1 shadow-xl animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)] border-b border-[var(--color-border,#e2e8f0)] mb-1">
            Sort Options
          </div>
          {options.map((opt) => {
            const isSelected = opt.value === value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors text-left cursor-pointer ${
                  isSelected
                    ? 'bg-[#126973]/10 text-[#126973] dark:text-[#F1D8C2] font-semibold'
                    : 'text-[var(--color-text)] hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && (
                  <Check size={13} className="text-[#126973] dark:text-[#F1D8C2] stroke-[3px]" />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── 6. ViewToggle (Untitled UI Grid / List Toggle) ───────────────────────────
export const ViewToggle = ({
  view = 'list',
  onChange,
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'p-0.5 gap-0.5',
    md: 'p-1 gap-0.5',
    lg: 'p-1 gap-1'
  }[size] || 'p-1 gap-0.5'

  const iconSizes = {
    sm: 13,
    md: 15,
    lg: 17
  }[size] || 15

  return (
    <div
      className={`inline-flex items-center rounded-lg border border-[var(--color-border,#e2e8f0)] bg-[var(--color-card,#ffffff)] shadow-2xs ${sizeClasses} ${className}`}
    >
      <button
        type="button"
        onClick={() => onChange?.('list')}
        title="List view"
        className={`p-1.5 rounded-md transition-all cursor-pointer ${
          view === 'list'
            ? 'text-white shadow-2xs'
            : 'text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-black/5 dark:hover:bg-white/5'
        }`}
        style={
          view === 'list'
            ? { background: 'linear-gradient(135deg, var(--color-500, #BF4040), var(--color-600, #9D3434))' }
            : {}
        }
      >
        <ListIcon size={iconSizes} className="stroke-[2.2px]" />
      </button>
      <button
        type="button"
        onClick={() => onChange?.('grid')}
        title="Grid view"
        className={`p-1.5 rounded-md transition-all cursor-pointer ${
          view === 'grid'
            ? 'text-white shadow-2xs'
            : 'text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-black/5 dark:hover:bg-white/5'
        }`}
        style={
          view === 'grid'
            ? { background: 'linear-gradient(135deg, var(--color-500, #BF4040), var(--color-600, #9D3434))' }
            : {}
        }
      >
        <LayoutGrid size={iconSizes} className="stroke-[2.2px]" />
      </button>
    </div>
  )
}

// ── 7. ActiveFilterPills (Removable Filter Tags / Chips) ─────────────────────
export const ActiveFilterPills = ({
  filters = [],
  onRemove,
  onClearAll,
  className = ''
}) => {
  if (!filters || filters.length === 0) return null

  return (
    <div className={`flex items-center gap-2 flex-wrap text-xs ${className}`}>
      <span className="text-[11px] font-semibold text-[var(--color-muted)] uppercase tracking-wider">
        Active Filters:
      </span>

      {filters.map((filter) => (
        <span
          key={filter.id || filter.key}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#126973]/10 border border-[#126973]/25 text-[#126973] dark:text-[#F1D8C2]"
        >
          {filter.label && (
            <span className="opacity-75 font-normal">{filter.label}:</span>
          )}
          <span className="font-semibold">{filter.value}</span>
          <button
            type="button"
            onClick={() => onRemove?.(filter.id || filter.key)}
            className="p-0.5 rounded-full hover:bg-[#126973]/20 cursor-pointer transition-colors"
            title="Remove filter"
          >
            <X size={12} className="stroke-[2.5px]" />
          </button>
        </span>
      ))}

      {filters.length > 1 && (
        <button
          type="button"
          onClick={onClearAll}
          className="text-xs font-semibold text-[var(--color-muted)] hover:text-rose-500 cursor-pointer underline underline-offset-2 transition-colors ml-1"
        >
          Clear all
        </button>
      )}
    </div>
  )
}

// ── 8. FilterBar (Master Layout Container) ───────────────────────────────────
export const FilterBar = ({
  children,
  activeFilters = [],
  onRemoveFilter,
  onClearAllFilters,
  hasCreate = false,
  onCreate,
  createLabel = 'Create',
  createIcon,
  createButtonProps = {},
  className = ''
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Top Filter Controls Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5 flex-wrap flex-1">
          {children}
        </div>
        {hasCreate && (
          <CreateButton
            label={createLabel}
            onClick={onCreate}
            icon={createIcon}
            {...createButtonProps}
          />
        )}
      </div>

      {/* Optional Active Filter Chips Row */}
      {activeFilters.length > 0 && (
        <ActiveFilterPills
          filters={activeFilters}
          onRemove={onRemoveFilter}
          onClearAll={onClearAllFilters}
        />
      )}
    </div>
  )
}

// ── 9. FilterLinesIcon (Untitled UI Filter Lines Icon) ──────────────────────
export const FilterLinesIcon = ({ size = 18, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    <path
      d="M5 10H15M2.5 5H17.5M7.5 15H12.5"
      stroke="currentColor"
      strokeWidth="1.67"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

// ── Date Range Helper Functions ─────────────────────────────────────────────
const formatMMDDYYYY = (date) => {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${mm} / ${dd} / ${yyyy}`
}

const isSameDate = (d1, d2) => {
  if (!d1 || !d2) return false
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}

const isDateInRange = (d, start, end) => {
  if (!d || !start || !end) return false
  const t = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime()
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime()
  return t > s && t < e
}

const getMonthDays = (year, month) => {
  const firstDay = new Date(year, month, 1).getDay() // 0 = Sun
  const totalDays = new Date(year, month + 1, 0).getDate()
  return { firstDay, totalDays }
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

// ── 10. DateRangePicker (Untitled UI Dual Calendar Date Range Popover) ───────
export const DateRangePicker = ({
  startDate: initialStart,
  endDate: initialEnd,
  value,
  onChange,
  onApply,
  align = 'right',
  size = 'md',
  className = '',
  buttonLabel = 'Select dates',
  label,
  themeColor = '#7F56D9',
}) => {
  const [open, setOpen] = useState(false)
  const [startDate, setStartDate] = useState(initialStart ? new Date(initialStart) : null)
  const [endDate, setEndDate] = useState(initialEnd ? new Date(initialEnd) : null)
  const [hoveredDate, setHoveredDate] = useState(null)
  const [activePreset, setActivePreset] = useState(null)

  // Current view month (Month 1 = left, Month 2 = Month 1 + 1)
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = initialStart ? new Date(initialStart) : new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })

  const pickerRef = useRef(null)
  useClickOutside(pickerRef, () => setOpen(false))

  const today = new Date()
  const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const handleDayClick = (date) => {
    setActivePreset(null)
    if (!startDate || (startDate && endDate)) {
      setStartDate(date)
      setEndDate(null)
    } else if (startDate && !endDate) {
      if (date < startDate) {
        setEndDate(startDate)
        setStartDate(date)
      } else {
        setEndDate(date)
      }
    }
  }

  const presets = [
    {
      id: 'today',
      label: 'Today',
      getDates: () => {
        const d = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        return { start: d, end: d }
      }
    },
    {
      id: 'yesterday',
      label: 'Yesterday',
      getDates: () => {
        const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)
        return { start: d, end: d }
      }
    },
    {
      id: 'this_week',
      label: 'This week',
      getDates: () => {
        const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay())
        const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6)
        return { start, end }
      }
    },
    {
      id: 'last_week',
      label: 'Last week',
      getDates: () => {
        const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() - 7)
        const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6)
        return { start, end }
      }
    },
    {
      id: 'this_month',
      label: 'This month',
      getDates: () => {
        const start = new Date(today.getFullYear(), today.getMonth(), 1)
        const end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        return { start, end }
      }
    },
    {
      id: 'last_month',
      label: 'Last month',
      getDates: () => {
        const start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        const end = new Date(today.getFullYear(), today.getMonth(), 0)
        return { start, end }
      }
    },
    {
      id: 'this_year',
      label: 'This year',
      getDates: () => {
        const start = new Date(today.getFullYear(), 0, 1)
        const end = new Date(today.getFullYear(), 11, 31)
        return { start, end }
      }
    },
    {
      id: 'last_year',
      label: 'Last year',
      getDates: () => {
        const start = new Date(today.getFullYear() - 1, 0, 1)
        const end = new Date(today.getFullYear() - 1, 11, 31)
        return { start, end }
      }
    },
    {
      id: 'all_time',
      label: 'All time',
      getDates: () => ({ start: null, end: null })
    }
  ]

  const handleSelectPreset = (preset) => {
    setActivePreset(preset.id)
    const { start, end } = preset.getDates()
    setStartDate(start)
    setEndDate(end)
    if (start) {
      setCurrentMonth(new Date(start.getFullYear(), start.getMonth(), 1))
    }
  }

  const handleApply = () => {
    const formattedLabel = activePreset
      ? presets.find((p) => p.id === activePreset)?.label
      : startDate && endDate
      ? `${formatMMDDYYYY(startDate)} - ${formatMMDDYYYY(endDate)}`
      : startDate
      ? formatMMDDYYYY(startDate)
      : (label || buttonLabel)

    onApply?.({ startDate, endDate, label: formattedLabel, preset: activePreset })
    onChange?.({ startDate, endDate, label: formattedLabel, preset: activePreset })
    setOpen(false)
  }

  const handleCancel = () => {
    setStartDate(initialStart ? new Date(initialStart) : null)
    setEndDate(initialEnd ? new Date(initialEnd) : null)
    setOpen(false)
  }

  // Determine trigger button display text
  const defaultLabel = label || buttonLabel
  let triggerText = value || defaultLabel
  if (!value) {
    if (activePreset && activePreset !== 'all_time') {
      triggerText = presets.find((p) => p.id === activePreset)?.label || defaultLabel
    } else if (startDate && endDate) {
      if (isSameDate(startDate, endDate)) {
        triggerText = isSameDate(startDate, today) ? 'Today' : formatMMDDYYYY(startDate)
      } else {
        triggerText = `${formatMMDDYYYY(startDate)} - ${formatMMDDYYYY(endDate)}`
      }
    } else if (startDate) {
      triggerText = formatMMDDYYYY(startDate)
    }
  }

  const renderMonthGrid = (year, month, isLeft) => {
    const { firstDay, totalDays } = getMonthDays(year, month)
    const days = []

    // Empty lead cells
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8" />)
    }

    // Days in month
    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(year, month, d)
      const isStart = startDate && isSameDate(date, startDate)
      const isEnd = endDate && isSameDate(date, endDate)
      const isSingle = isStart && isEnd
      const isToday = isSameDate(date, today)

      const activeEnd = endDate || (startDate && hoveredDate && hoveredDate > startDate ? hoveredDate : null)
      const inRange = startDate && activeEnd && isDateInRange(date, startDate, activeEnd)

      days.push(
        <div
          key={`day-${d}`}
          className={`h-8 flex items-center justify-center relative ${
            inRange ? 'bg-[#7F56D9]/15' : ''
          } ${isStart && !isSingle ? 'rounded-l-full bg-[#7F56D9]/15' : ''} ${
            isEnd && !isSingle ? 'rounded-r-full bg-[#7F56D9]/15' : ''
          }`}
          onMouseEnter={() => startDate && !endDate && setHoveredDate(date)}
        >
          <button
            type="button"
            onClick={() => handleDayClick(date)}
            className={`w-8 h-8 flex flex-col items-center justify-center text-xs font-medium rounded-full transition-all cursor-pointer select-none ${
              isStart || isEnd
                ? 'bg-[#7F56D9] text-white font-bold shadow-xs'
                : inRange
                ? 'text-[#7F56D9] font-semibold'
                : isToday
                ? 'border border-[#7F56D9] text-[#7F56D9] font-bold'
                : 'text-[var(--color-text,#0f172a)] hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <span>{d}</span>
            {isToday && !(isStart || isEnd) && (
              <span className="w-1 h-1 rounded-full bg-[#7F56D9] -mt-0.5" />
            )}
          </button>
        </div>
      )
    }

    return (
      <div className="p-3 w-64">
        {/* Month Header */}
        <div className="flex items-center justify-between mb-3 px-1">
          {isLeft ? (
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-md text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
          ) : (
            <div className="w-6" />
          )}

          <span className="text-xs font-bold text-[var(--color-text,#0f172a)]">
            {MONTH_NAMES[month]} {year}
          </span>

          {!isLeft ? (
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-md text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          ) : (
            <div className="w-6" />
          )}
        </div>

        {/* Weekday Labels */}
        <div className="grid grid-cols-7 gap-y-1 mb-1 text-center">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
            <span key={day} className="text-[11px] font-semibold text-[var(--color-muted,#94a3b8)]">
              {day}
            </span>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-y-1 text-center">{days}</div>
      </div>
    )
  }

  const sizeClasses = {
    sm: 'h-9 px-3 text-xs gap-2',
    md: 'h-10 px-3.5 text-xs gap-2',
    lg: 'h-11 px-4 text-sm gap-2.5'
  }[size] || 'h-10 px-3.5 text-xs gap-2'

  return (
    <div ref={pickerRef} className={`relative inline-block ${className}`}>
      {/* Trigger Button: [ 📅 Select dates ] */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className={`inline-flex items-center justify-center font-semibold rounded-lg border transition-all cursor-pointer select-none shadow-2xs outline-none focus-visible:ring-3 focus-visible:ring-[#7F56D9]/20 ${
          open || (startDate && activePreset !== 'all_time')
            ? 'bg-black/5 dark:bg-white/10 border-[#7F56D9] text-[var(--color-text,#0f172a)]'
            : 'bg-[var(--color-card,#ffffff)] border-[var(--color-border,#e2e8f0)] text-[var(--color-text,#0f172a)] hover:bg-black/5 dark:hover:bg-white/5'
        } ${sizeClasses}`}
      >
        <Calendar size={15} className="text-[var(--color-muted,#94a3b8)] shrink-0 stroke-[2px]" />
        <span className="truncate max-w-[200px]">{triggerText}</span>
      </button>

      {/* Popover Dropdown Card */}
      {open && (
        <div
          className={`absolute z-50 mt-2 rounded-2xl border border-[var(--color-border,#e2e8f0)] bg-[var(--color-card,#ffffff)] shadow-2xl animate-in fade-in zoom-in-95 duration-150 overflow-hidden ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {/* Main Content: Sidebar Presets + Dual Months */}
          <div className="flex flex-col sm:flex-row">
            {/* Left Sidebar Presets */}
            <div className="w-full sm:w-36 border-b sm:border-b-0 sm:border-r border-[var(--color-border,#e2e8f0)] p-2.5 space-y-0.5 shrink-0">
              {presets.map((p) => {
                const isSelected = activePreset === p.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#7F56D9]/10 text-[#7F56D9] font-semibold'
                        : 'text-[var(--color-text,#0f172a)] hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    {p.label}
                  </button>
                )
              })}
            </div>

            {/* Dual Calendars */}
            <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-[var(--color-border,#e2e8f0)]">
              {renderMonthGrid(currentMonth.getFullYear(), currentMonth.getMonth(), true)}
              {renderMonthGrid(nextMonth.getFullYear(), nextMonth.getMonth(), false)}
            </div>
          </div>

          {/* Bottom Footer: Date Inputs & Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 border-t border-[var(--color-border,#e2e8f0)] bg-black/[0.01] dark:bg-white/[0.01]">
            {/* Date range inputs: [MM / DD / YYYY] - [MM / DD / YYYY] */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={formatMMDDYYYY(startDate)}
                placeholder="MM / DD / YYYY"
                className="h-9 w-32 px-3 text-xs text-center font-medium rounded-lg border border-[var(--color-border,#e2e8f0)] bg-[var(--color-card,#ffffff)] text-[var(--color-text,#0f172a)] placeholder:text-[var(--color-muted,#94a3b8)] outline-none shadow-2xs"
              />
              <span className="text-[var(--color-muted,#94a3b8)] font-semibold">–</span>
              <input
                type="text"
                readOnly
                value={formatMMDDYYYY(endDate)}
                placeholder="MM / DD / YYYY"
                className="h-9 w-32 px-3 text-xs text-center font-medium rounded-lg border border-[var(--color-border,#e2e8f0)] bg-[var(--color-card,#ffffff)] text-[var(--color-text,#0f172a)] placeholder:text-[var(--color-muted,#94a3b8)] outline-none shadow-2xs"
              />
            </div>

            {/* Actions: Cancel & Apply */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleCancel}
                className="h-9 px-3.5 text-xs font-semibold rounded-lg border border-[var(--color-border,#e2e8f0)] bg-[var(--color-card,#ffffff)] text-[var(--color-text,#0f172a)] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer shadow-2xs transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleApply}
                className="h-9 px-4 text-xs font-bold rounded-lg text-white bg-[#7F56D9] hover:bg-[#6941C6] shadow-sm cursor-pointer transition-all active:scale-[0.98]"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// SelectDatesButton alias pointing to DateRangePicker
export const SelectDatesButton = DateRangePicker
export const DateRangePopover = DateRangePicker

// ── 11. FiltersPopover (Untitled UI Advanced Filter Builder) ────────────────
export const FiltersPopover = ({
  fields = [
    { value: 'status', label: 'Status', options: ['Completed', 'Pending', 'Preparing', 'Cancelled'] },
    { value: 'type', label: 'Order Type', options: ['Dine In', 'Takeaway', 'Delivery', 'Customer QR'] },
    { value: 'payment', label: 'Payment', options: ['Paid', 'Unpaid', 'Partially Paid'] },
    { value: 'total', label: 'Total Amount' },
    { value: 'customer', label: 'Customer' },
  ],
  operators = [
    { value: 'equals', label: 'Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'not_equals', label: 'Does not equal' },
    { value: 'greater_than', label: 'Greater than' },
    { value: 'less_than', label: 'Less than' },
  ],
  onApply,
  onClear,
  initialFilters = [],
  buttonLabel = 'Filters',
  themeColor = '#7F56D9',
  size = 'md',
  align = 'right',
  className = ''
}) => {
  const [open, setOpen] = useState(false)
  const [conditions, setConditions] = useState(() =>
    initialFilters.length > 0
      ? initialFilters
      : [{ id: 'filter-1', field: '', operator: 'equals', value: '' }]
  )
  const popoverRef = useRef(null)

  useClickOutside(popoverRef, () => setOpen(false))

  const addCondition = () => {
    setConditions((prev) => [
      ...prev,
      { id: `filter-${Date.now()}`, field: '', operator: 'equals', value: '' }
    ])
  }

  const removeCondition = (index) => {
    setConditions((prev) => {
      const next = prev.filter((_, i) => i !== index)
      return next.length === 0
        ? [{ id: `filter-${Date.now()}`, field: '', operator: 'equals', value: '' }]
        : next
    })
  }

  const updateCondition = (index, key, val) => {
    setConditions((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [key]: val }
      return next
    })
  }

  const handleClearAll = () => {
    setConditions([{ id: `filter-${Date.now()}`, field: '', operator: 'equals', value: '' }])
    onClear?.()
  }

  const handleApply = () => {
    const validFilters = conditions.filter((c) => c.field && c.value)
    onApply?.(validFilters)
    setOpen(false)
  }

  const activeCount = conditions.filter((c) => c.field && c.value).length

  const sizeClasses = {
    sm: 'h-9 px-3 text-xs gap-2',
    md: 'h-10 px-3.5 text-xs gap-2',
    lg: 'h-11 px-4 text-sm gap-2.5'
  }[size] || 'h-10 px-3.5 text-xs gap-2'

  return (
    <div ref={popoverRef} className={`relative inline-block ${className}`}>
      {/* ── Trigger Button: [ 🟰 Filters ⌵ ] ── */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className={`inline-flex items-center justify-between font-semibold rounded-lg border transition-all cursor-pointer select-none shadow-2xs outline-none focus-visible:ring-3 focus-visible:ring-[#7F56D9]/20 ${
          open || activeCount > 0
            ? 'bg-black/5 dark:bg-white/10 border-[#7F56D9] text-[var(--color-text,#0f172a)]'
            : 'bg-[var(--color-card,#ffffff)] border-[var(--color-border,#e2e8f0)] text-[var(--color-text,#0f172a)] hover:bg-black/5 dark:hover:bg-white/5'
        } ${sizeClasses}`}
      >
        <span className="flex items-center gap-2">
          <FilterLinesIcon size={16} />
          <span>{buttonLabel}</span>
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-[#7F56D9] text-white">
              {activeCount}
            </span>
          )}
        </span>
        <ChevronDown
          size={14}
          className={`ml-1 shrink-0 opacity-70 transition-transform duration-150 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* ── Filter Builder Popover ── */}
      {open && (
        <div
          className={`absolute z-50 mt-2 min-w-[500px] sm:min-w-[540px] max-w-2xl rounded-xl border border-[var(--color-border,#e2e8f0)] bg-[var(--color-card,#ffffff)] p-3.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {/* List of Condition Rows */}
          <div className="space-y-2.5">
            {conditions.map((cond, index) => {
              const selectedFieldDef = fields.find((f) => f.value === cond.field)

              return (
                <div key={cond.id} className="flex items-center gap-2">
                  {/* Field Selector */}
                  <div className="relative w-44 shrink-0">
                    <select
                      value={cond.field}
                      onChange={(e) => updateCondition(index, 'field', e.target.value)}
                      className="w-full h-9 px-3 pr-8 text-xs font-semibold rounded-lg border border-[#7F56D9] focus:ring-2 focus:ring-[#7F56D9]/25 outline-none bg-[var(--color-card,#ffffff)] text-[var(--color-text,#0f172a)] cursor-pointer appearance-none shadow-2xs"
                    >
                      <option value="">Select filter</option>
                      {fields.map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-muted)]"
                    />
                  </div>

                  {/* Operator Selector */}
                  <div className="relative w-36 shrink-0">
                    <select
                      value={cond.operator}
                      onChange={(e) => updateCondition(index, 'operator', e.target.value)}
                      className="w-full h-9 px-3 pr-8 text-xs font-medium rounded-lg border border-[var(--color-border,#e2e8f0)] focus:border-[#7F56D9] focus:ring-2 focus:ring-[#7F56D9]/25 outline-none bg-[var(--color-card,#ffffff)] text-[var(--color-text,#0f172a)] cursor-pointer appearance-none shadow-2xs"
                    >
                      {operators.map((op) => (
                        <option key={op.value} value={op.value}>
                          {op.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-muted)]"
                    />
                  </div>

                  {/* Value Input or Options Dropdown */}
                  <div className="relative flex-1">
                    {selectedFieldDef?.options ? (
                      <>
                        <select
                          value={cond.value}
                          onChange={(e) => updateCondition(index, 'value', e.target.value)}
                          className="w-full h-9 px-3 pr-8 text-xs font-medium rounded-lg border border-[var(--color-border,#e2e8f0)] focus:border-[#7F56D9] focus:ring-2 focus:ring-[#7F56D9]/25 outline-none bg-[var(--color-card,#ffffff)] text-[var(--color-text,#0f172a)] cursor-pointer appearance-none shadow-2xs"
                        >
                          <option value="">Select value</option>
                          {selectedFieldDef.options.map((opt) => {
                            const val = typeof opt === 'object' ? opt.value : opt
                            const lbl = typeof opt === 'object' ? opt.label : opt
                            return (
                              <option key={val} value={val}>
                                {lbl}
                              </option>
                            )
                          })}
                        </select>
                        <ChevronDown
                          size={14}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-muted)]"
                        />
                      </>
                    ) : (
                      <>
                        <input
                          type="text"
                          value={cond.value}
                          onChange={(e) => updateCondition(index, 'value', e.target.value)}
                          placeholder="Enter a value"
                          className="w-full h-9 px-3 pr-7 text-xs font-medium rounded-lg border border-[var(--color-border,#e2e8f0)] focus:border-[#7F56D9] focus:ring-2 focus:ring-[#7F56D9]/25 outline-none bg-[var(--color-card,#ffffff)] text-[var(--color-text,#0f172a)] placeholder:text-[var(--color-muted,#94a3b8)] shadow-2xs"
                        />
                        {cond.value && (
                          <button
                            type="button"
                            onClick={() => updateCondition(index, 'value', '')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--color-text)] cursor-pointer p-0.5"
                          >
                            <X size={13} />
                          </button>
                        )}
                      </>
                    )}
                  </div>

                  {/* Remove Condition Row Button */}
                  <button
                    type="button"
                    onClick={() => removeCondition(index)}
                    className="p-1.5 rounded-lg text-[var(--color-muted)] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer shrink-0"
                    title="Remove filter"
                  >
                    <X size={15} />
                  </button>
                </div>
              )
            })}
          </div>

          {/* ── Footer Controls: [+ Add filter]  [Clear all] [Apply filter] ── */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-[var(--color-border,#e2e8f0)]">
            <button
              type="button"
              onClick={addCondition}
              className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-semibold rounded-lg border border-[var(--color-border,#e2e8f0)] bg-[var(--color-card,#ffffff)] text-[var(--color-text,#0f172a)] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer shadow-2xs transition-all"
            >
              <Plus size={13} className="stroke-[2.5px]" />
              <span>Add filter</span>
            </button>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleClearAll}
                className="h-8 px-3 text-xs font-semibold rounded-lg border border-[var(--color-border,#e2e8f0)] bg-[var(--color-card,#ffffff)] text-[var(--color-text,#0f172a)] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer shadow-2xs transition-colors"
              >
                Clear all
              </button>

              <button
                type="button"
                onClick={handleApply}
                className="h-8 px-3.5 text-xs font-bold rounded-lg text-white bg-[#7F56D9] hover:bg-[#6941C6] shadow-sm cursor-pointer transition-all active:scale-[0.98]"
              >
                Apply filter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Alias for convenience
export const Filters = FiltersPopover

// ── 12. DateAndFiltersBar (Side-by-side Select Dates + Filters buttons) ─────
export const DateAndFiltersBar = ({
  datesValue,
  onDatesClick,
  filterProps = {},
  className = ''
}) => (
  <div className={`flex items-center gap-2.5 ${className}`}>
    <SelectDatesButton value={datesValue} onClick={onDatesClick} />
    <FiltersPopover {...filterProps} />
  </div>
)

// Export a default compound object for convenient consumption
export default {
  FilterBar,
  FilterSearchInput,
  CreateButton,
  AddButton,
  NewButton,
  FilterButton,
  FilterSelect,
  FilterTabs,
  SortDropdown,
  ViewToggle,
  ActiveFilterPills,
  FilterLinesIcon,
  DateRangePicker,
  DateRangePopover,
  SelectDatesButton,
  FiltersPopover,
  Filters: FiltersPopover,
  DateAndFiltersBar
}
