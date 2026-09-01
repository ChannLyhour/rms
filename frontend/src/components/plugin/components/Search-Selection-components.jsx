import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { Search, ChevronDown, X, Check, Globe, Tag, Sparkles, Plus } from 'lucide-react'

// Comprehensive country data list from Semantic UI specifications
export const COUNTRIES = [
  { value: 'af', label: 'Afghanistan' },
  { value: 'ax', label: 'Aland Islands' },
  { value: 'al', label: 'Albania' },
  { value: 'dz', label: 'Algeria' },
  { value: 'as', label: 'American Samoa' },
  { value: 'ad', label: 'Andorra' },
  { value: 'ao', label: 'Angola' },
  { value: 'ai', label: 'Anguilla' },
  { value: 'ag', label: 'Antigua' },
  { value: 'ar', label: 'Argentina' },
  { value: 'am', label: 'Armenia' },
  { value: 'aw', label: 'Aruba' },
  { value: 'au', label: 'Australia' },
  { value: 'at', label: 'Austria' },
  { value: 'az', label: 'Azerbaijan' },
  { value: 'bs', label: 'Bahamas' },
  { value: 'bh', label: 'Bahrain' },
  { value: 'bd', label: 'Bangladesh' },
  { value: 'bb', label: 'Barbados' },
  { value: 'by', label: 'Belarus' },
  { value: 'be', label: 'Belgium' },
  { value: 'bz', label: 'Belize' },
  { value: 'bj', label: 'Benin' },
  { value: 'bm', label: 'Bermuda' },
  { value: 'bt', label: 'Bhutan' },
  { value: 'bo', label: 'Bolivia' },
  { value: 'ba', label: 'Bosnia' },
  { value: 'bw', label: 'Botswana' },
  { value: 'bv', label: 'Bouvet Island' },
  { value: 'br', label: 'Brazil' },
  { value: 'vg', label: 'British Virgin Islands' },
  { value: 'bn', label: 'Brunei' },
  { value: 'bg', label: 'Bulgaria' },
  { value: 'bf', label: 'Burkina Faso' },
  { value: 'mm', label: 'Burma' },
  { value: 'bi', label: 'Burundi' },
  { value: 'tc', label: 'Caicos Islands' },
  { value: 'kh', label: 'Cambodia' },
  { value: 'cm', label: 'Cameroon' },
  { value: 'ca', label: 'Canada' },
  { value: 'cv', label: 'Cape Verde' },
  { value: 'ky', label: 'Cayman Islands' },
  { value: 'cf', label: 'Central African Republic' },
  { value: 'td', label: 'Chad' },
  { value: 'cl', label: 'Chile' },
  { value: 'cn', label: 'China' },
  { value: 'cx', label: 'Christmas Island' },
  { value: 'cc', label: 'Cocos Islands' },
  { value: 'co', label: 'Colombia' },
  { value: 'km', label: 'Comoros' },
  { value: 'cg', label: 'Congo Brazzaville' },
  { value: 'cd', label: 'Congo' },
  { value: 'ck', label: 'Cook Islands' },
  { value: 'cr', label: 'Costa Rica' },
  { value: 'ci', label: 'Cote Divoire' },
  { value: 'hr', label: 'Croatia' },
  { value: 'cu', label: 'Cuba' },
  { value: 'cy', label: 'Cyprus' },
  { value: 'cz', label: 'Czech Republic' },
  { value: 'dk', label: 'Denmark' },
  { value: 'dj', label: 'Djibouti' },
  { value: 'dm', label: 'Dominica' },
  { value: 'do', label: 'Dominican Republic' },
  { value: 'ec', label: 'Ecuador' },
  { value: 'eg', label: 'Egypt' },
  { value: 'sv', label: 'El Salvador' },
  { value: 'gb', label: 'England' },
  { value: 'gq', label: 'Equatorial Guinea' },
  { value: 'er', label: 'Eritrea' },
  { value: 'ee', label: 'Estonia' },
  { value: 'et', label: 'Ethiopia' },
  { value: 'eu', label: 'European Union' },
  { value: 'fk', label: 'Falkland Islands' },
  { value: 'fo', label: 'Faroe Islands' },
  { value: 'fj', label: 'Fiji' },
  { value: 'fi', label: 'Finland' },
  { value: 'fr', label: 'France' },
  { value: 'gf', label: 'French Guiana' },
  { value: 'pf', label: 'French Polynesia' },
  { value: 'tf', label: 'French Territories' },
  { value: 'ga', label: 'Gabon' },
  { value: 'gm', label: 'Gambia' },
  { value: 'ge', label: 'Georgia' },
  { value: 'de', label: 'Germany' },
  { value: 'gh', label: 'Ghana' },
  { value: 'gi', label: 'Gibraltar' },
  { value: 'gr', label: 'Greece' },
  { value: 'gl', label: 'Greenland' },
  { value: 'gd', label: 'Grenada' },
  { value: 'gp', label: 'Guadeloupe' },
  { value: 'gu', label: 'Guam' },
  { value: 'gt', label: 'Guatemala' },
  { value: 'gw', label: 'Guinea-Bissau' },
  { value: 'gn', label: 'Guinea' },
  { value: 'gy', label: 'Guyana' },
  { value: 'ht', label: 'Haiti' },
  { value: 'hm', label: 'Heard Island' },
  { value: 'hn', label: 'Honduras' },
  { value: 'hk', label: 'Hong Kong' },
  { value: 'hu', label: 'Hungary' },
  { value: 'is', label: 'Iceland' },
  { value: 'in', label: 'India' },
  { value: 'io', label: 'Indian Ocean Territory' },
  { value: 'id', label: 'Indonesia' },
  { value: 'ir', label: 'Iran' },
  { value: 'iq', label: 'Iraq' },
  { value: 'ie', label: 'Ireland' },
  { value: 'il', label: 'Israel' },
  { value: 'it', label: 'Italy' },
  { value: 'jm', label: 'Jamaica' },
  { value: 'jp', label: 'Japan' },
  { value: 'jo', label: 'Jordan' },
  { value: 'kz', label: 'Kazakhstan' },
  { value: 'ke', label: 'Kenya' },
  { value: 'ki', label: 'Kiribati' },
  { value: 'kw', label: 'Kuwait' },
  { value: 'kg', label: 'Kyrgyzstan' },
  { value: 'la', label: 'Laos' },
  { value: 'lv', label: 'Latvia' },
  { value: 'lb', label: 'Lebanon' },
  { value: 'ls', label: 'Lesotho' },
  { value: 'lr', label: 'Liberia' },
  { value: 'ly', label: 'Libya' },
  { value: 'li', label: 'Liechtenstein' },
  { value: 'lt', label: 'Lithuania' },
  { value: 'lu', label: 'Luxembourg' },
  { value: 'mo', label: 'Macau' },
  { value: 'mk', label: 'Macedonia' },
  { value: 'mg', label: 'Madagascar' },
  { value: 'mw', label: 'Malawi' },
  { value: 'my', label: 'Malaysia' },
  { value: 'mv', label: 'Maldives' },
  { value: 'ml', label: 'Mali' },
  { value: 'mt', label: 'Malta' },
  { value: 'mh', label: 'Marshall Islands' },
  { value: 'mq', label: 'Martinique' },
  { value: 'mr', label: 'Mauritania' },
  { value: 'mu', label: 'Mauritius' },
  { value: 'yt', label: 'Mayotte' },
  { value: 'mx', label: 'Mexico' },
  { value: 'fm', label: 'Micronesia' },
  { value: 'md', label: 'Moldova' },
  { value: 'mc', label: 'Monaco' },
  { value: 'mn', label: 'Mongolia' },
  { value: 'me', label: 'Montenegro' },
  { value: 'ms', label: 'Montserrat' },
  { value: 'ma', label: 'Morocco' },
  { value: 'mz', label: 'Mozambique' },
  { value: 'na', label: 'Namibia' },
  { value: 'nr', label: 'Nauru' },
  { value: 'np', label: 'Nepal' },
  { value: 'an', label: 'Netherlands Antilles' },
  { value: 'nl', label: 'Netherlands' },
  { value: 'nc', label: 'New Caledonia' },
  { value: 'pg', label: 'New Guinea' },
  { value: 'nz', label: 'New Zealand' },
  { value: 'ni', label: 'Nicaragua' },
  { value: 'ne', label: 'Niger' },
  { value: 'ng', label: 'Nigeria' },
  { value: 'nu', label: 'Niue' },
  { value: 'nf', label: 'Norfolk Island' },
  { value: 'kp', label: 'North Korea' },
  { value: 'mp', label: 'Northern Mariana Islands' },
  { value: 'no', label: 'Norway' },
  { value: 'om', label: 'Oman' },
  { value: 'pk', label: 'Pakistan' },
  { value: 'pw', label: 'Palau' },
  { value: 'ps', label: 'Palestine' },
  { value: 'pa', label: 'Panama' },
  { value: 'py', label: 'Paraguay' },
  { value: 'pe', label: 'Peru' },
  { value: 'ph', label: 'Philippines' },
  { value: 'pn', label: 'Pitcairn Islands' },
  { value: 'pl', label: 'Poland' },
  { value: 'pt', label: 'Portugal' },
  { value: 'pr', label: 'Puerto Rico' },
  { value: 'qa', label: 'Qatar' },
  { value: 're', label: 'Reunion' },
  { value: 'ro', label: 'Romania' },
  { value: 'ru', label: 'Russia' },
  { value: 'rw', label: 'Rwanda' },
  { value: 'sh', label: 'Saint Helena' },
  { value: 'kn', label: 'Saint Kitts and Nevis' },
  { value: 'lc', label: 'Saint Lucia' },
  { value: 'pm', label: 'Saint Pierre' },
  { value: 'vc', label: 'Saint Vincent' },
  { value: 'ws', label: 'Samoa' },
  { value: 'sm', label: 'San Marino' },
  { value: 'gs', label: 'Sandwich Islands' },
  { value: 'st', label: 'Sao Tome' },
  { value: 'sa', label: 'Saudi Arabia' },
  { value: 'sn', label: 'Senegal' },
  { value: 'cs', label: 'Serbia' },
  { value: 'rs', label: 'Serbia' },
  { value: 'sc', label: 'Seychelles' },
  { value: 'sl', label: 'Sierra Leone' },
  { value: 'sg', label: 'Singapore' },
  { value: 'sk', label: 'Slovakia' },
  { value: 'si', label: 'Slovenia' },
  { value: 'sb', label: 'Solomon Islands' },
  { value: 'so', label: 'Somalia' },
  { value: 'za', label: 'South Africa' },
  { value: 'kr', label: 'South Korea' },
  { value: 'es', label: 'Spain' },
  { value: 'lk', label: 'Sri Lanka' },
  { value: 'sd', label: 'Sudan' },
  { value: 'sr', label: 'Suriname' },
  { value: 'sj', label: 'Svalbard' },
  { value: 'sz', label: 'Swaziland' },
  { value: 'se', label: 'Sweden' },
  { value: 'ch', label: 'Switzerland' },
  { value: 'sy', label: 'Syria' },
  { value: 'tw', label: 'Taiwan' },
  { value: 'tj', label: 'Tajikistan' },
  { value: 'tz', label: 'Tanzania' },
  { value: 'th', label: 'Thailand' },
  { value: 'tl', label: 'Timorleste' },
  { value: 'tg', label: 'Togo' },
  { value: 'tk', label: 'Tokelau' },
  { value: 'to', label: 'Tonga' },
  { value: 'tt', label: 'Trinidad' },
  { value: 'tn', label: 'Tunisia' },
  { value: 'tr', label: 'Turkey' },
  { value: 'tm', label: 'Turkmenistan' },
  { value: 'tv', label: 'Tuvalu' },
  { value: 'ug', label: 'Uganda' },
  { value: 'ua', label: 'Ukraine' },
  { value: 'ae', label: 'United Arab Emirates' },
  { value: 'us', label: 'United States' },
  { value: 'uy', label: 'Uruguay' },
  { value: 'um', label: 'Us Minor Islands' },
  { value: 'vi', label: 'Us Virgin Islands' },
  { value: 'uz', label: 'Uzbekistan' },
  { value: 'vu', label: 'Vanuatu' },
  { value: 'va', label: 'Vatican City' },
  { value: 've', label: 'Venezuela' },
  { value: 'vn', label: 'Vietnam' },
  { value: 'wf', label: 'Wallis and Futuna' },
  { value: 'eh', label: 'Western Sahara' },
  { value: 'ye', label: 'Yemen' },
  { value: 'zm', label: 'Zambia' },
  { value: 'zw', label: 'Zimbabwe' },
]

/**
 * Returns flag emoji for a 2-letter ISO country code.
 */
export function getFlagEmoji(countryCode) {
  if (!countryCode || typeof countryCode !== 'string' || countryCode.length !== 2) return null
  if (countryCode.toLowerCase() === 'eu') return '🇪🇺'
  if (countryCode.toLowerCase() === 'an') return '🇳🇱'
  try {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map((char) => 127397 + char.charCodeAt(0))
    return String.fromCodePoint(...codePoints)
  } catch {
    return null
  }
}

/**
 * Universal Option Normalizer:
 * Converts strings, numbers, or objects into consistent option objects:
 * { value, label, raw, icon, image, flag, description, subtitle, badge, disabled, ... }
 */
export function normalizeOptions(options = [], valueKey = 'value', labelKey = 'label') {
  if (!Array.isArray(options)) return []

  return options.map((opt) => {
    if (opt === null || opt === undefined) {
      return { value: '', label: '', raw: opt }
    }

    if (typeof opt === 'string' || typeof opt === 'number') {
      return {
        value: String(opt),
        label: String(opt),
        raw: opt,
      }
    }

    const val = opt[valueKey] !== undefined ? opt[valueKey] : opt.value ?? opt.id ?? opt.name ?? ''
    const lbl = opt[labelKey] !== undefined ? opt[labelKey] : opt.label ?? opt.name ?? opt.title ?? String(val)
    const img = opt.image_url || opt.image || opt.thumbnail || opt.img || opt.photo || null

    return {
      ...opt,
      value: String(val),
      label: String(lbl),
      image: img,
      raw: opt,
    }
  })
}

/**
 * Universal Search & Selection Dropdown Component
 *
 * Supports:
 * - Single select or Multiple select (`multiple={true}`)
 * - Any dataset (Countries, Categories, Products, Users, Tables, Stations, String arrays)
 * - Custom keys (`valueKey`, `labelKey`)
 * - Icons (Lucide icon components), Images/Avatars, Badges, Descriptions
 * - Full search filtering with custom filter options
 * - Creatable option creation (`allowCreate={true}`)
 * - Keyboard navigation (Arrows, Enter, Escape, Backspace)
 * - Accessible, responsive, dark-mode ready, rounded-[5px] design system
 */
export function SearchSelection({
  name = 'select',
  options = [],
  value,
  defaultValue = '',
  onChange,
  onSelect,
  onCreate,
  placeholder = 'Select option...',
  searchPlaceholder = 'Search...',
  className = '',
  triggerClassName = '',
  menuClassName = '',
  disabled = false,
  required = false,
  multiple = false,
  isSearchable = true,
  isClearable = true,
  allowCreate = false,
  autoSelect = false,
  valueKey = 'value',
  labelKey = 'label',
  size = 'md', // 'sm' | 'md' | 'lg'
  filterOption,
  renderOption,
  renderValue,
  emptyMessage = 'No options found',
  maxMenuHeight = 'max-h-60',
}) {
  // Normalize dataset
  const normalizedOptions = useMemo(() => {
    return normalizeOptions(options, valueKey, labelKey)
  }, [options, valueKey, labelKey])

  // Internal state
  const isControlled = value !== undefined
  const [internalValue, setInternalValue] = useState(() => {
    if (isControlled) return value
    if (defaultValue !== undefined && defaultValue !== '') return defaultValue
    if (autoSelect && normalizedOptions.length > 0) {
      return multiple ? [normalizedOptions[0].value] : normalizedOptions[0].value
    }
    return multiple ? [] : ''
  })

  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(0)

  const containerRef = useRef(null)
  const searchInputRef = useRef(null)
  const listRef = useRef(null)

  // Current active value (array if multiple, string if single)
  const currentValue = isControlled ? value : internalValue

  // Helper map for fast lookup
  const optionsMap = useMemo(() => {
    const map = new Map()
    normalizedOptions.forEach((opt) => map.set(opt.value, opt))
    return map
  }, [normalizedOptions])

  // Get selected objects
  const selectedOptions = useMemo(() => {
    if (multiple) {
      const arr = Array.isArray(currentValue) ? currentValue : []
      return arr.map((v) => optionsMap.get(String(v)) || { value: String(v), label: String(v) })
    } else {
      if (currentValue === null || currentValue === undefined || currentValue === '') return null
      return optionsMap.get(String(currentValue)) || { value: String(currentValue), label: String(currentValue) }
    }
  }, [multiple, currentValue, optionsMap])

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return normalizedOptions

    const q = searchQuery.toLowerCase().trim()

    return normalizedOptions.filter((opt) => {
      if (filterOption) {
        return filterOption(opt, q)
      }

      const matchLabel = opt.label?.toLowerCase().includes(q)
      const matchValue = opt.value?.toLowerCase().includes(q)
      const matchDesc = opt.description?.toLowerCase().includes(q)
      const matchSub = opt.subtitle?.toLowerCase().includes(q)
      const matchCat = opt.category?.toLowerCase().includes(q)

      return matchLabel || matchValue || matchDesc || matchSub || matchCat
    })
  }, [normalizedOptions, searchQuery, filterOption])

  // Check if query exists exactly for creatable
  const exactMatchExists = useMemo(() => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase().trim()
    return normalizedOptions.some((opt) => opt.label.toLowerCase() === q || opt.value.toLowerCase() === q)
  }, [normalizedOptions, searchQuery])

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
        setSearchQuery('')
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  // Auto focus input when opened
  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(0)
      if (isSearchable) {
        setTimeout(() => searchInputRef.current?.focus(), 40)
      }
    } else {
      setSearchQuery('')
      setHighlightedIndex(0)
    }
  }, [isOpen, isSearchable])

  // Auto scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const activeEl = listRef.current.children[highlightedIndex]
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [highlightedIndex])

  // Update value handler
  const emitChange = useCallback(
    (newVal, selectedItemOrItems) => {
      if (!isControlled) {
        setInternalValue(newVal)
      }
      if (onChange) {
        onChange(newVal, selectedItemOrItems)
      }
      if (onSelect && selectedItemOrItems) {
        onSelect(selectedItemOrItems)
      }
    },
    [isControlled, onChange, onSelect]
  )

  const handleSelectOption = (opt) => {
    if (opt.disabled) return

    if (multiple) {
      const currentArr = Array.isArray(currentValue) ? currentValue : []
      const exists = currentArr.some((v) => String(v) === opt.value)
      const nextArr = exists
        ? currentArr.filter((v) => String(v) !== opt.value)
        : [...currentArr, opt.value]

      const nextSelectedItems = nextArr.map((v) => optionsMap.get(String(v)) || { value: String(v), label: String(v) })
      emitChange(nextArr, nextSelectedItems)
      setSearchQuery('')
    } else {
      emitChange(opt.value, opt)
      setIsOpen(false)
      setSearchQuery('')
    }
  }

  const handleRemoveChip = (e, valToRemove) => {
    e.stopPropagation()
    if (disabled) return
    const currentArr = Array.isArray(currentValue) ? currentValue : []
    const nextArr = currentArr.filter((v) => String(v) !== String(valToRemove))
    const nextSelectedItems = nextArr.map((v) => optionsMap.get(String(v)) || { value: String(v), label: String(v) })
    emitChange(nextArr, nextSelectedItems)
  }

  const handleClearAll = (e) => {
    e.stopPropagation()
    if (disabled) return
    const emptyVal = multiple ? [] : ''
    emitChange(emptyVal, multiple ? [] : null)
    setSearchQuery('')
  }

  const handleCreateNew = () => {
    if (!searchQuery.trim()) return
    const query = searchQuery.trim()
    if (onCreate) {
      onCreate(query)
    } else {
      const newOption = { value: query.toLowerCase().replace(/\s+/g, '-'), label: query }
      handleSelectOption(newOption)
    }
    setSearchQuery('')
    if (!multiple) setIsOpen(false)
  }

  // Keyboard Navigation
  const handleKeyDown = (e) => {
    if (disabled) return

    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault()
        setIsOpen(true)
      }
      return
    }

    const totalItems = filteredOptions.length + (allowCreate && !exactMatchExists && searchQuery.trim() ? 1 : 0)

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightedIndex < filteredOptions.length) {
        const opt = filteredOptions[highlightedIndex]
        if (opt) handleSelectOption(opt)
      } else if (allowCreate && !exactMatchExists && searchQuery.trim()) {
        handleCreateNew()
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setIsOpen(false)
    } else if (e.key === 'Backspace' && !searchQuery && multiple) {
      const currentArr = Array.isArray(currentValue) ? currentValue : []
      if (currentArr.length > 0) {
        const nextArr = currentArr.slice(0, -1)
        emitChange(nextArr, nextArr.map((v) => optionsMap.get(String(v))))
      }
    }
  }

  // Size styling tokens
  const sizeClasses = {
    sm: 'min-h-[34px] px-2.5 py-1 text-xs',
    md: 'min-h-[40px] px-3.5 py-1.5 text-xs',
    lg: 'min-h-[46px] px-4 py-2 text-sm',
  }[size] || 'min-h-[40px] px-3.5 py-1.5 text-xs'

  const hasSelection = multiple
    ? Array.isArray(currentValue) && currentValue.length > 0
    : currentValue !== null && currentValue !== undefined && currentValue !== ''

  // Helper renderer for option icon/flag/image
  const renderOptionVisual = (opt) => {
    if (opt.image) {
      return (
        <img
          src={opt.image}
          alt={opt.label || ''}
          className="w-5 h-5 rounded-[5px] object-cover shrink-0 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-2xs"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
      )
    }
    if (opt.icon) {
      const IconComponent = opt.icon
      return <IconComponent size={15} className="shrink-0 text-slate-500 dark:text-slate-400" />
    }
    const flag = opt.flag || getFlagEmoji(opt.value)
    if (flag) {
      return <span className="text-base leading-none shrink-0" role="img" aria-label={opt.label}>{flag}</span>
    }
    return null
  }

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      className={`relative w-full select-none font-medium ${className}`}
    >
      {/* Hidden inputs for HTML form submission */}
      {multiple ? (
        (Array.isArray(currentValue) ? currentValue : []).map((val, idx) => (
          <input key={idx} type="hidden" name={`${name}[]`} value={val} />
        ))
      ) : (
        <input type="hidden" name={name} value={currentValue || ''} required={required} />
      )}

      {/* Main Dropdown Trigger */}
      <div
        onClick={() => {
          if (!disabled) setIsOpen((prev) => !prev)
        }}
        className={`w-full ${sizeClasses} rounded-[5px] border flex items-center justify-between gap-2 transition-all cursor-pointer shadow-2xs ${
          disabled
            ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
            : isOpen
            ? 'border-slate-900 dark:border-slate-100 ring-1 ring-slate-900/10 dark:ring-slate-100/10'
            : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700'
        } ${triggerClassName}`}
        style={{
          background: 'var(--color-bg, #ffffff)',
          color: 'var(--color-text, inherit)',
        }}
      >
        <div className="flex items-center flex-wrap gap-1.5 min-w-0 flex-1 py-0.5">
          {multiple ? (
            // Multiple Selection (Chips / Tags)
            Array.isArray(selectedOptions) && selectedOptions.length > 0 ? (
              renderValue ? (
                renderValue(selectedOptions)
              ) : (
                selectedOptions.map((opt) => (
                  <span
                    key={opt.value}
                    className="inline-flex items-center gap-1.5 pl-2 pr-1 py-0.5 rounded-[5px] text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-200 max-w-[200px] truncate"
                  >
                    {renderOptionVisual(opt)}
                    <span className="truncate">{opt.label}</span>
                    <button
                      type="button"
                      onClick={(e) => handleRemoveChip(e, opt.value)}
                      className="p-0.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-[5px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))
              )
            ) : (
              <span className="text-slate-400 dark:text-slate-500 font-normal">
                {placeholder}
              </span>
            )
          ) : (
            // Single Selection
            selectedOptions ? (
              renderValue ? (
                renderValue(selectedOptions)
              ) : (
                <div className="flex items-center gap-2 min-w-0">
                  {renderOptionVisual(selectedOptions)}
                  <span className="truncate font-semibold text-slate-900 dark:text-slate-100">
                    {selectedOptions.label}
                  </span>
                  {selectedOptions.subtitle && (
                    <span className="text-slate-400 text-[10px] truncate">
                      ({selectedOptions.subtitle})
                    </span>
                  )}
                  {selectedOptions.badge && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-[5px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                      {selectedOptions.badge}
                    </span>
                  )}
                </div>
              )
            ) : (
              <span className="text-slate-400 dark:text-slate-500 font-normal">
                {placeholder}
              </span>
            )
          )}
        </div>

        {/* Right action controls */}
        <div className="flex items-center gap-1.5 shrink-0 text-slate-400">
          {hasSelection && isClearable && !disabled && (
            <button
              type="button"
              onClick={handleClearAll}
              className="p-1 rounded-[5px] hover:bg-black/5 dark:hover:bg-white/10 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              title="Clear selection"
            >
              <X size={13} />
            </button>
          )}
          <ChevronDown
            size={15}
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-slate-900 dark:text-slate-100' : ''}`}
          />
        </div>
      </div>

      {/* Options Menu Popover */}
      {isOpen && (
        <div
          className={`absolute left-0 right-0 top-full mt-1.5 z-50 rounded-[5px] border shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100 ${menuClassName}`}
          style={{
            background: 'var(--color-card, #ffffff)',
            borderColor: 'var(--color-border, #e2e8f0)',
          }}
        >
          {/* Search Header */}
          {isSearchable && (
            <div
              className="p-2 border-b flex items-center gap-2"
              style={{
                borderColor: 'var(--color-border, #e2e8f0)',
                background: 'var(--color-surface, #f8fafc)',
              }}
            >
              <Search size={14} className="text-slate-400 shrink-0 ml-1" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setHighlightedIndex(0)
                }}
                placeholder={searchPlaceholder}
                className="w-full bg-transparent text-xs outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          )}

          {/* Options List */}
          <div
            ref={listRef}
            className={`${maxMenuHeight} overflow-y-auto p-1.5 space-y-0.5 scrollbar-thin`}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, idx) => {
                const isSelected = multiple
                  ? Array.isArray(currentValue) && currentValue.some((v) => String(v) === opt.value)
                  : String(currentValue) === opt.value

                const isHighlighted = idx === highlightedIndex

                return (
                  <div
                    key={opt.value}
                    onClick={() => handleSelectOption(opt)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`flex items-center justify-between px-3 py-2 rounded-[5px] cursor-pointer transition-colors text-xs ${
                      opt.disabled
                        ? 'opacity-40 cursor-not-allowed'
                        : isSelected
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
                        : isHighlighted
                        ? 'bg-black/5 dark:bg-white/10 text-slate-900 dark:text-slate-100'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    {renderOption ? (
                      renderOption(opt, { isSelected, isHighlighted })
                    ) : (
                      <>
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          {renderOptionVisual(opt)}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="truncate">{opt.label}</span>
                              {opt.badge && (
                                <span
                                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-[5px] ${
                                    isSelected
                                      ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900'
                                      : 'bg-slate-200/60 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                  }`}
                                >
                                  {opt.badge}
                                </span>
                              )}
                            </div>
                            {/* {opt.description && (
                              <p
                                className={`text-[11px] truncate mt-0.5 ${
                                  isSelected ? 'text-white/80 dark:text-slate-900/80' : 'text-slate-400'
                                }`}
                              >
                                {opt.description}
                              </p>
                            )} */}
                          </div>
                        </div>

                        {isSelected && (
                          <Check
                            size={14}
                            strokeWidth={3}
                            className={`shrink-0 ml-2 ${isSelected ? 'text-white dark:text-slate-900' : 'text-slate-900 dark:text-slate-100'}`}
                          />
                        )}
                      </>
                    )}
                  </div>
                )
              })
            ) : null}

            {/* Creatable item when no exact match */}
            {allowCreate && !exactMatchExists && searchQuery.trim() && (
              <div
                onClick={handleCreateNew}
                onMouseEnter={() => setHighlightedIndex(filteredOptions.length)}
                className={`flex items-center gap-2 px-3 py-2 rounded-[5px] cursor-pointer text-xs font-semibold text-blue-600 dark:text-blue-400 transition-colors ${
                  highlightedIndex === filteredOptions.length ? 'bg-blue-500/10' : 'hover:bg-blue-500/5'
                }`}
              >
                <Plus size={13} strokeWidth={3} />
                <span>Create &ldquo;{searchQuery.trim()}&rdquo;</span>
              </div>
            )}

            {filteredOptions.length === 0 && (!allowCreate || exactMatchExists || !searchQuery.trim()) && (
              <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
                {emptyMessage}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Alias export for Semantic UI naming convention compatibility
export const SearchSelectionDropdown = SearchSelection

/**
 * Interactive Pattern Showcase
 * Demonstrates:
 * 1) Simple String / Category Selector
 * 2) Country Selector with Flags (Semantic UI list)
 * 3) Multi-Select Tag Selector
 * 4) Rich Objects Selector (with images, prices, descriptions)
 */
export function Pattern() {
  const [selectedCat, setSelectedCat] = useState('cat-special')
  const [country, setCountry] = useState('us')
  const [dietaryTags, setDietaryTags] = useState(['vegan', 'gluten-free'])
  const [selectedProduct, setSelectedProduct] = useState('pasta-01')

  const CATEGORIES = [
    { value: 'cat-special', label: 'Special', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=120&q=80', badge: 'Chef Special' },
    { value: 'cat-chicken', label: 'Chicken Top1', image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=120&q=80', badge: 'Popular' },
    { value: 'cat-soups', label: 'Soups', image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=120&q=80', badge: 'Warm' },
    { value: 'cat-main', label: 'Main Course', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=120&q=80', badge: 'Dinner' },
    { value: 'cat-pasta', label: 'Pasta & Pizza', image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=120&q=80', badge: 'Italian' },
    { value: 'cat-desserts', label: 'Desserts', image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=120&q=80', badge: 'Sweet' },
    { value: 'cat-drinks', label: 'Drinks', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=120&q=80', badge: 'Beverage' },
  ]

  const TAGS = [
    { value: 'vegan', label: 'Vegan', icon: Sparkles },
    { value: 'vegetarian', label: 'Vegetarian', icon: Tag },
    { value: 'gluten-free', label: 'Gluten-Free', icon: Tag },
    { value: 'nut-free', label: 'Nut-Free', icon: Tag },
    { value: 'spicy', label: 'Spicy Level 🔥', icon: Tag },
    { value: 'chef-special', label: "Chef's Special ⭐", icon: Sparkles },
  ]

  const PRODUCTS = [
    {
      value: 'pasta-01',
      label: 'Truffle Mushroom Pasta',
      description: 'Handmade fettuccine with wild mushroom & black truffle cream',
      badge: '$18.50',
    },
    {
      value: 'burger-02',
      label: 'Wagyu Smash Burger',
      description: 'Double wagyu patty with aged cheddar and caramelized onion',
      badge: '$16.00',
    },
    {
      value: 'coffee-03',
      label: 'Artisan Iced Latte',
      description: 'Single origin espresso with fresh organic whole milk',
      badge: '$5.50',
    },
  ]

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-8 select-none">
      <div className="space-y-1">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Globe size={20} className="text-[#BF4040]" />
          Universal Search Selection System
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Versatile search dropdown supporting single select, multi-select tags, country flags, custom icons, live search filtering, and creatable options.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-6 rounded-[5px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xs">
        {/* 1. Category Select with Images */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            1. Category Selection (with Images)
          </label>
          <SearchSelection
            name="category_id"
            options={CATEGORIES}
            value={selectedCat}
            onChange={(val) => setSelectedCat(val)}
            placeholder="Select Category..."
            searchPlaceholder="Search category..."
          />
        </div>

        {/* 2. Country Flag Select */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            2. Country Dropdown (Flags)
          </label>
          <SearchSelection
            name="country"
            options={COUNTRIES}
            value={country}
            onChange={(val) => setCountry(val)}
            placeholder="Select Country..."
          />
        </div>

        {/* 3. Multi-Select Tags */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            3. Multi-Select Tag Modifiers (Creatable)
          </label>
          <SearchSelection
            name="dietary_tags"
            multiple={true}
            allowCreate={true}
            options={TAGS}
            value={dietaryTags}
            onChange={(vals) => setDietaryTags(vals)}
            placeholder="Select or type custom tag..."
          />
        </div>

        {/* 4. Product Select with Badges & Descriptions */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            4. Rich Product Selection
          </label>
          <SearchSelection
            name="product_id"
            options={PRODUCTS}
            value={selectedProduct}
            onChange={(val) => setSelectedProduct(val)}
            placeholder="Choose Menu Item..."
          />
        </div>

        {/* Live debug output preview */}
        <div className="md:col-span-2 p-4 rounded-[5px] bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-mono space-y-1.5 text-slate-600 dark:text-slate-400">
          <div className="font-bold text-slate-900 dark:text-slate-200 border-b pb-1 mb-1 border-slate-200 dark:border-slate-800">
            Current State Output:
          </div>
          <div><span className="font-bold text-slate-800 dark:text-slate-300">Category:</span> {JSON.stringify(selectedCat)}</div>
          <div><span className="font-bold text-slate-800 dark:text-slate-300">Country:</span> {JSON.stringify(country)}</div>
          <div><span className="font-bold text-slate-800 dark:text-slate-300">Tags:</span> {JSON.stringify(dietaryTags)}</div>
          <div><span className="font-bold text-slate-800 dark:text-slate-300">Product:</span> {JSON.stringify(selectedProduct)}</div>
        </div>
      </div>
    </div>
  )
}

export default SearchSelection
