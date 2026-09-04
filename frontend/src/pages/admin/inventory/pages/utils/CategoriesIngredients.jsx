import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  TableCard,
  Table,
  BadgeWithIcon,
  PaginationPageMinimalCenter,
  FilterSearchInput,
  FilterSelect,
} from '../../../../../components/TablesComponents'
import {
  Plus,
  Edit01,
  Trash01,
  Check,
  AlertTriangle,
} from '@untitledui/icons'
import {
  Layers,
  Tag,
  Copy,
  X,
  Sparkles,
  FolderTree,
  ArrowDownUp,
  Folder,
  ShieldCheck,
  LayoutGrid,
  Table as TableIcon,
  ChevronRight,
  Eye,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { adminApi } from '../../../../../api/adminApi'

// ── Iconly 3D Icons (Styled matching IngredientsPage.jsx) ──────────────────

// 1. Iconly 3D Category Tag
export const Iconly3DTag = ({ size = 32, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 48 48" className={`shrink-0 ${className}`}>
    <defs>
      <radialGradient id="ic3d-tag-body" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#5EEAD4" />
        <stop offset="55%" stopColor="#14B8A6" />
        <stop offset="100%" stopColor="#0D9488" />
      </radialGradient>
      <linearGradient id="ic3d-tag-depth" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#0F766E" />
        <stop offset="100%" stopColor="#042F2E" />
      </linearGradient>
      <filter id="ic3d-tag-shadow" x="-20%" y="-10%" width="140%" height="140%">
        <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#0F766E" floodOpacity="0.35" />
      </filter>
    </defs>
    <g filter="url(#ic3d-tag-shadow)">
      {/* 3D Depth Layer */}
      <path
        d="M21 7H11C8.8 7 7 8.8 7 11V21C7 22.1 7.4 23.1 8.2 23.9L24.2 39.9C25.8 41.5 28.4 41.5 30 39.9L39.9 30C41.5 28.4 41.5 25.8 39.9 24.2L23.9 8.2C23.1 7.4 22.1 7 21 7Z"
        fill="url(#ic3d-tag-depth)"
        transform="translate(0, 2)"
      />
      {/* Front Clay Body */}
      <path
        d="M21 7H11C8.8 7 7 8.8 7 11V21C7 22.1 7.4 23.1 8.2 23.9L24.2 39.9C25.8 41.5 28.4 41.5 30 39.9L39.9 30C41.5 28.4 41.5 25.8 39.9 24.2L23.9 8.2C23.1 7.4 22.1 7 21 7Z"
        fill="url(#ic3d-tag-body)"
      />
      {/* Specular Highlight */}
      <path
        d="M10 13C10 10.5 11.5 9 14 9H20"
        stroke="#FFFFFF"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeOpacity="0.75"
        fill="none"
      />
      {/* Eyelet Hole */}
      <circle cx="14" cy="14" r="3.2" fill="#042F2E" opacity="0.85" />
      <circle cx="14" cy="14" r="2" fill="#FEF08A" />
    </g>
  </svg>
)

// 2. Iconly 3D Check / Active Shield
const Iconly3DShield = ({ size = 32, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 48 48" className={`shrink-0 ${className}`}>
    <defs>
      <radialGradient id="ic3d-shield-body" cx="40%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#A7F3D0" />
        <stop offset="50%" stopColor="#10B981" />
        <stop offset="100%" stopColor="#047857" />
      </radialGradient>
      <linearGradient id="ic3d-shield-depth" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#065F46" />
        <stop offset="100%" stopColor="#064E3B" />
      </linearGradient>
      <filter id="ic3d-shield-shadow" x="-20%" y="-10%" width="140%" height="140%">
        <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#065F46" floodOpacity="0.35" />
      </filter>
    </defs>
    <g filter="url(#ic3d-shield-shadow)">
      {/* Depth */}
      <path
        d="M24 6L9 12V23.5C9 33 15.5 41.5 24 44C32.5 41.5 39 33 39 23.5V12L24 6Z"
        fill="url(#ic3d-shield-depth)"
        transform="translate(0, 2)"
      />
      {/* Front */}
      <path
        d="M24 6L9 12V23.5C9 33 15.5 41.5 24 44C32.5 41.5 39 33 39 23.5V12L24 6Z"
        fill="url(#ic3d-shield-body)"
      />
      {/* Specular */}
      <path
        d="M13 15L24 10L35 15"
        stroke="#FFFFFF"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeOpacity="0.7"
        fill="none"
      />
      {/* Check Mark */}
      <path
        d="M17 24L22 29L31 19"
        stroke="#FFFFFF"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </g>
  </svg>
)

// 3. Iconly 3D Stack / Layers
const Iconly3DLayers = ({ size = 32, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 48 48" className={`shrink-0 ${className}`}>
    <defs>
      <radialGradient id="ic3d-lay-top" cx="40%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#C4B5FD" />
        <stop offset="60%" stopColor="#8B5CF6" />
        <stop offset="100%" stopColor="#6D28D9" />
      </radialGradient>
      <linearGradient id="ic3d-lay-depth" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#5B21B6" />
        <stop offset="100%" stopColor="#4C1D95" />
      </linearGradient>
      <filter id="ic3d-lay-shadow" x="-20%" y="-10%" width="140%" height="140%">
        <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#5B21B6" floodOpacity="0.35" />
      </filter>
    </defs>
    <g filter="url(#ic3d-lay-shadow)">
      {/* Bottom layer */}
      <path d="M6 29L24 38L42 29L24 20L6 29Z" fill="url(#ic3d-lay-depth)" transform="translate(0, 4)" />
      <path d="M6 29L24 38L42 29L24 20L6 29Z" fill="#7C3AED" opacity="0.6" transform="translate(0, 2)" />
      {/* Top Diamond Layer */}
      <path d="M24 8L42 17L24 26L6 17L24 8Z" fill="url(#ic3d-lay-top)" />
      {/* Highlight Edge */}
      <path d="M10 16L24 10L38 16" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeOpacity="0.75" fill="none" />
    </g>
  </svg>
)

// Visual styling and emoji helper for ingredient categories
export const getCategoryVisual = (code, name) => {
  const c = String(code || '').toUpperCase()
  const n = String(name || '').toLowerCase()
  if (c === 'MEAT' || n.includes('meat') || n.includes('poultry') || n.includes('beef') || n.includes('chicken') || n.includes('pork')) {
    return {
      emoji: '🥩',
      gradient: 'from-rose-500/10 to-transparent',
      accent: 'border-b-rose-500',
      tagBadge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      glow: 'hover:border-rose-400 dark:hover:border-rose-600 hover:shadow-[0_10px_25px_-5px_rgba(244,63,94,0.18)]',
    }
  }
  if (c === 'SEAFOOD' || n.includes('seafood') || n.includes('fish') || n.includes('shrimp') || n.includes('salmon')) {
    return {
      emoji: '🐟',
      gradient: 'from-cyan-500/10 to-transparent',
      accent: 'border-b-cyan-500',
      tagBadge: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
      glow: 'hover:border-cyan-400 dark:hover:border-cyan-600 hover:shadow-[0_10px_25px_-5px_rgba(6,182,212,0.18)]',
    }
  }
  if (c === 'PRODUCE' || n.includes('produce') || n.includes('vegetable') || n.includes('fruit') || n.includes('salad')) {
    return {
      emoji: '🥬',
      gradient: 'from-emerald-500/10 to-transparent',
      accent: 'border-b-emerald-500',
      tagBadge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      glow: 'hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-[0_10px_25px_-5px_rgba(16,185,129,0.18)]',
    }
  }
  if (c === 'DAIRY' || n.includes('dairy') || n.includes('milk') || n.includes('egg') || n.includes('cheese') || n.includes('butter')) {
    return {
      emoji: '🧀',
      gradient: 'from-amber-500/10 to-transparent',
      accent: 'border-b-amber-500',
      tagBadge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      glow: 'hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-[0_10px_25px_-5px_rgba(245,158,11,0.18)]',
    }
  }
  if (c === 'DRY_GOODS' || n.includes('dry') || n.includes('grain') || n.includes('flour') || n.includes('rice') || n.includes('noodle')) {
    return {
      emoji: '🌾',
      gradient: 'from-yellow-500/10 to-transparent',
      accent: 'border-b-yellow-500',
      tagBadge: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
      glow: 'hover:border-yellow-400 dark:hover:border-yellow-600 hover:shadow-[0_10px_25px_-5px_rgba(234,179,8,0.18)]',
    }
  }
  if (c === 'SAUCES' || n.includes('sauce') || n.includes('seasoning') || n.includes('spice') || n.includes('oil') || n.includes('vinegar')) {
    return {
      emoji: '🧂',
      gradient: 'from-orange-500/10 to-transparent',
      accent: 'border-b-orange-500',
      tagBadge: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
      glow: 'hover:border-orange-400 dark:hover:border-orange-600 hover:shadow-[0_10px_25px_-5px_rgba(249,115,22,0.18)]',
    }
  }
  if (c === 'BAR_BASE' || n.includes('bar') || n.includes('beverage') || n.includes('drink') || n.includes('syrup') || n.includes('tea') || n.includes('coffee')) {
    return {
      emoji: '🍹',
      gradient: 'from-purple-500/10 to-transparent',
      accent: 'border-b-purple-500',
      tagBadge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      glow: 'hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-[0_10px_25px_-5px_rgba(168,85,247,0.18)]',
    }
  }
  if (c === 'PACKAGING' || n.includes('packaging') || n.includes('disposable') || n.includes('box') || n.includes('cup') || n.includes('container')) {
    return {
      emoji: '📦',
      gradient: 'from-slate-500/10 to-transparent',
      accent: 'border-b-slate-500',
      tagBadge: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
      glow: 'hover:border-slate-400 dark:hover:border-slate-600 hover:shadow-[0_10px_25px_-5px_rgba(100,116,139,0.18)]',
    }
  }
  return {
    emoji: '🏷️',
    gradient: 'from-teal-500/10 to-transparent',
    accent: 'border-b-[#126973]',
    tagBadge: 'bg-[#126973]/10 text-[#126973] dark:text-[#F1D8C2] border-[#126973]/20',
    glow: 'hover:border-teal-400 dark:hover:border-teal-600 hover:shadow-[0_10px_25px_-5px_rgba(18,105,115,0.18)]',
  }
}

/**
 * CategoriesIngredients Component
 * Displays interactive Category Cards or Master Table.
 *
 * @param {Array} [categories] - Optional categories list passed from parent
 * @param {Array} [ingredients] - Raw materials ingredients list
 * @param {boolean} [loading=false] - Loading indicator
 * @param {Function} [onRefresh] - Callback when data changes
 * @param {boolean} [isModal=false] - Set true if used inside a modal dialog
 * @param {Function} [onClose] - Close modal callback (when isModal=true)
 * @param {Function} [onSelectCategory] - Triggered when a Category Card is clicked
 * @param {'cards'|'table'} [defaultLayout='cards'] - Default presentation mode
 */
export default function CategoriesIngredients({
  categories: initialCategories,
  ingredients = [],
  loading: externalLoading = false,
  onRefresh,
  isModal = false,
  onClose,
  onSelectCategory,
  defaultLayout = 'cards',
}) {
  const [internalCategories, setInternalCategories] = useState([])
  const [fetching, setFetching] = useState(false)
  const [viewLayout, setViewLayout] = useState(defaultLayout)

  // Map category counts from ingredients
  const categoryCounts = useMemo(() => {
    const map = {}
    ingredients.forEach((item) => {
      const cid = item.category_id || item.category?.id
      if (cid) {
        if (!map[cid]) map[cid] = { total: 0, lowStock: 0 }
        map[cid].total += 1
        if (Number(item.stock_quantity) <= Number(item.low_stock_threshold)) {
          map[cid].lowStock += 1
        }
      }
    })
    return map
  }, [ingredients])

  // Use passed categories or fetch if not provided
  const categories = initialCategories !== undefined ? initialCategories : internalCategories
  const loading = externalLoading || fetching

  const loadCategories = useCallback(async () => {
    setFetching(true)
    try {
      const res = await adminApi.getIngredientCategories()
      setInternalCategories(res.data?.data || [])
    } catch (err) {
      console.error('Failed to load ingredient categories:', err)
      toast.error('Failed to load ingredient categories')
    } finally {
      setFetching(false)
    }
  }, [])

  useEffect(() => {
    if (initialCategories === undefined) {
      loadCategories()
    }
  }, [initialCategories, loadCategories])

  // Filters & Pagination State
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const pageSize = 8

  const [sortDescriptor, setSortDescriptor] = useState({
    column: 'sort_order',
    direction: 'ascending',
  })

  // Copy Name Helper
  const [copiedId, setCopiedId] = useState(null)
  const handleCopyName = (text, id, e) => {
    e?.stopPropagation()
    if (!text) return
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).catch(() => {
          const el = document.createElement('textarea')
          el.value = text
          el.style.position = 'fixed'
          el.style.opacity = '0'
          document.body.appendChild(el)
          el.focus()
          el.select()
          document.execCommand('copy')
          document.body.removeChild(el)
        })
      } else {
        const el = document.createElement('textarea')
        el.value = text
        el.style.position = 'fixed'
        el.style.opacity = '0'
        document.body.appendChild(el)
        el.focus()
        el.select()
        document.execCommand('copy')
        document.body.removeChild(el)
      }
      setCopiedId(id)
      toast.success(`Copied "${text}"`)
      setTimeout(() => setCopiedId(null), 1500)
    } catch {
      toast.error('Failed to copy')
    }
  }

  // Inline Add Category Row State
  const [isAddingRow, setIsAddingRow] = useState(false)
  const [savingNew, setSavingNew] = useState(false)
  const [newRow, setNewRow] = useState({
    name: '',
    code: '',
    description: '',
    sort_order: '0',
    is_active: true,
  })

  // Inline Editing Category Row State
  const [editingId, setEditingId] = useState(null)
  const [editRow, setEditRow] = useState(null)
  const [savingEdit, setSavingEdit] = useState(false)

  const handleStartEdit = (cat) => {
    setEditingId(cat.id)
    setEditRow({
      name: cat.name || '',
      code: cat.code || '',
      description: cat.description || '',
      sort_order: String(cat.sort_order ?? 0),
      is_active: cat.is_active !== undefined ? Boolean(cat.is_active) : true,
    })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditRow(null)
  }

  const handleSaveEdit = async (id) => {
    if (!editRow.name || !editRow.name.trim()) {
      toast.error('Please enter category name')
      return
    }

    setSavingEdit(true)
    try {
      await adminApi.updateIngredientCategory(id, {
        name: editRow.name.trim(),
        code: editRow.code ? editRow.code.trim().toUpperCase() : null,
        description: editRow.description?.trim() || null,
        sort_order: parseInt(editRow.sort_order, 10) || 0,
        is_active: Boolean(editRow.is_active),
      })
      toast.success(`Updated "${editRow.name.trim()}"`)
      setEditingId(null)
      setEditRow(null)
      if (onRefresh) onRefresh()
      else loadCategories()
    } catch (err) {
      console.error('Failed to update category:', err)
      toast.error(err.response?.data?.error || 'Failed to update category')
    } finally {
      setSavingEdit(false)
    }
  }

  const handleSaveInlineRow = async () => {
    if (!newRow.name || !newRow.name.trim()) {
      toast.error('Please enter category name')
      return
    }

    setSavingNew(true)
    try {
      await adminApi.createIngredientCategory({
        name: newRow.name.trim(),
        code: newRow.code ? newRow.code.trim().toUpperCase() : null,
        description: newRow.description?.trim() || null,
        sort_order: parseInt(newRow.sort_order, 10) || 0,
        is_active: Boolean(newRow.is_active),
      })

      toast.success(`Added "${newRow.name.trim()}" successfully`)
      setNewRow({
        name: '',
        code: '',
        description: '',
        sort_order: '0',
        is_active: true,
      })
      setIsAddingRow(false)
      setPage(1)
      if (onRefresh) onRefresh()
      else loadCategories()
    } catch (err) {
      console.error('Failed to create category:', err)
      toast.error(err.response?.data?.error || 'Failed to add category')
    } finally {
      setSavingNew(false)
    }
  }

  const handleCancelInlineRow = () => {
    setIsAddingRow(false)
    setNewRow({
      name: '',
      code: '',
      description: '',
      sort_order: '0',
      is_active: true,
    })
  }

  const handleKeyDown = (e, isEditing = false, id = null) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (isEditing && id) handleSaveEdit(id)
      else handleSaveInlineRow()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      if (isEditing) handleCancelEdit()
      else handleCancelInlineRow()
    }
  }

  const handleDeleteCategory = async (id, name) => {
    if (!confirm(`Are you sure you want to delete category "${name}"? Ingredients in this category will become uncategorized.`)) {
      return
    }
    try {
      await adminApi.deleteIngredientCategory(id)
      toast.success('Category deleted')
      if (onRefresh) onRefresh()
      else loadCategories()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete category')
    }
  }

  // Metrics
  const metrics = useMemo(() => {
    const total = categories.length
    const active = categories.filter((c) => c.is_active !== false).length
    const coded = categories.filter((c) => Boolean(c.code)).length
    return { total, active, coded }
  }, [categories])

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active Only' },
    { value: 'inactive', label: 'Inactive Only' },
  ]

  // Filtered & Sorted List
  const filteredList = useMemo(() => {
    return categories.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.code && item.code.toLowerCase().includes(search.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(search.toLowerCase()))

      const isActive = item.is_active !== false
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && isActive) ||
        (statusFilter === 'inactive' && !isActive)

      return matchSearch && matchStatus
    })
  }, [categories, search, statusFilter])

  const sortedList = useMemo(() => {
    return [...filteredList].sort((a, b) => {
      let first = a[sortDescriptor.column]
      let second = b[sortDescriptor.column]

      if (sortDescriptor.column === 'sort_order') {
        first = Number(first) || 0
        second = Number(second) || 0
      }

      if (typeof first === 'number' && typeof second === 'number') {
        return sortDescriptor.direction === 'descending' ? second - first : first - second
      }
      if (typeof first === 'string' && typeof second === 'string') {
        const cmp = first.localeCompare(second)
        return sortDescriptor.direction === 'descending' ? -cmp : cmp
      }

      return (a.sort_order || 0) - (b.sort_order || 0)
    })
  }, [filteredList, sortDescriptor])

  const totalPages = Math.ceil(sortedList.length / pageSize) || 1
  const paginatedList = sortedList.slice((page - 1) * pageSize, page * pageSize)

  const handleSort = (columnId) => {
    setSortDescriptor((prev) => ({
      column: columnId,
      direction:
        prev.column === columnId && prev.direction === 'ascending'
          ? 'descending'
          : 'ascending',
    }))
  }

  // Component Content
  const content = (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* ── Metrics Cards (Only displayed in Master Table view) ── */}
      {viewLayout === 'table' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in duration-150">
          {/* Card 1: Total Categories */}
          <div
            className="p-4 rounded-xl border flex items-center justify-between shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group border-b-[3px] border-b-[#126973]"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-muted)]">Total Categories</p>
              <p className="text-2xl font-extrabold text-[var(--color-text)] mt-1 tracking-tight">{metrics.total}</p>
            </div>
            <div className="w-13 h-13 rounded-2xl bg-[#126973]/10 dark:bg-[#126973]/20 border border-[#126973]/20 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-110 transition-transform duration-200">
              <Iconly3DTag size={34} />
            </div>
          </div>

          {/* Card 2: Active Categories */}
          <div
            className="p-4 rounded-xl border flex items-center justify-between shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group border-b-[3px] border-b-emerald-500"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-muted)]">Active Categories</p>
              <p className="text-2xl font-extrabold text-emerald-500 mt-1 tracking-tight">
                {metrics.active} <span className="text-xs font-semibold text-[var(--color-muted)]">Live</span>
              </p>
            </div>
            <div className="w-13 h-13 rounded-2xl bg-emerald-500/15 dark:bg-emerald-500/25 border border-emerald-500/25 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-110 transition-transform duration-200">
              <Iconly3DShield size={34} />
            </div>
          </div>

          {/* Card 3: Standard Master Codes */}
          <div
            className="p-4 rounded-xl border flex items-center justify-between shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group border-b-[3px] border-b-violet-500"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-muted)]">Master System Codes</p>
              <p className="text-2xl font-extrabold text-violet-500 mt-1 tracking-tight">
                {metrics.coded} <span className="text-xs font-semibold text-[var(--color-muted)]">Standardized</span>
              </p>
            </div>
            <div className="w-13 h-13 rounded-2xl bg-violet-500/15 dark:bg-violet-500/25 border border-violet-500/25 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-110 transition-transform duration-200">
              <Iconly3DLayers size={34} />
            </div>
          </div>
        </div>
      )}

      {/* ── Table Card ── */}
      <TableCard.Root>
        <TableCard.FilterBar
          hasCreate
          onCreate={() => {
            setIsAddingRow(true)
            setEditingId(null)
          }}
          createLabel="Category"
          createButtonProps={{ variant: 'teal' }}
        >
          <div className="flex items-center gap-2.5 flex-1 max-w-md">
            <FilterSearchInput
              value={search}
              onChange={(val) => {
                setSearch(val)
                setPage(1)
              }}
              placeholder="Search category name or code..."
              className="w-full"
            />

            <FilterSelect
              label="Status"
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val)
                setPage(1)
              }}
              options={statusOptions}
              placeholder="All Statuses"
            />
            {/* View Layout Toggle (Cards Grid vs Table) */}
            <div className="inline-flex items-center p-0.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shrink-0 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewLayout('cards')}
                className={`px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewLayout === 'cards'
                    ? 'bg-[#126973] text-white shadow-2xs'
                    : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
                }`}
                title="Category Cards Grid"
              >
                <LayoutGrid size={13} />
                <span className="hidden sm:inline">Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewLayout('table')}
                className={`px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewLayout === 'table'
                    ? 'bg-[#126973] text-white shadow-2xs'
                    : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
                }`}
                title="Category Master Table"
              >
                <TableIcon size={13} />
                <span className="hidden sm:inline">Table</span>
              </button>
            </div>
          </div>
        </TableCard.FilterBar>

        {viewLayout === 'cards' ? (
          <div className="p-5 space-y-5">
            {sortedList.length === 0 ? (
              <div className="py-12 text-center text-[var(--color-muted)]">
                <Tag size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-xs font-semibold">No categories found matching filters</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearch('')
                    setStatusFilter('all')
                  }}
                  className="mt-2 text-xs font-bold text-[#126973] dark:text-[#F1D8C2] hover:underline cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4.5">
                {/* Quick Card: All Raw Materials */}
                <div
                  onClick={() => onSelectCategory && onSelectCategory({ id: 'all', name: 'All Raw Materials' })}
                  className="group relative rounded-2xl border p-5 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between hover:-translate-y-1 bg-gradient-to-b from-teal-500/10 via-emerald-500/5 to-transparent border-b-[3px] border-b-[#126973] border-[var(--color-border)] shadow-xs hover:shadow-lg hover:border-teal-400 dark:hover:border-teal-600 hover:shadow-[0_10px_25px_-5px_rgba(18,105,115,0.18)]"
                  style={{ background: 'var(--color-surface)' }}
                  title="View all raw materials across all categories"
                >
                  <div>
                    {/* Top row: Visual & Badge */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#126973]/10 dark:bg-[#126973]/20 border border-[#126973]/20 flex items-center justify-center text-2xl shadow-2xs group-hover:scale-110 transition-transform duration-200">
                        <span>📦</span>
                      </div>
                      <span className="font-mono text-[10.5px] font-bold px-2 py-0.5 rounded-md border border-[#126973]/20 bg-[#126973]/10 text-[#126973] dark:text-[#F1D8C2]">
                        ALL ITEMS
                      </span>
                    </div>

                    {/* Card Title */}
                    <h3 className="text-base font-bold text-[var(--color-text)] group-hover:text-[#126973] dark:group-hover:text-[#F1D8C2] transition-colors line-clamp-1">
                      All Raw Materials
                    </h3>
                    <p className="text-xs text-[var(--color-muted)] mt-1.5 line-clamp-2 leading-relaxed">
                      View complete inventory across all categories
                    </p>
                  </div>

                  {/* Bottom: Item Count & Action */}
                  <div className="mt-5 pt-3.5 border-t border-[var(--color-border)] flex items-center justify-between text-xs">
                    <span className="font-bold text-[var(--color-text)] text-xs">
                      {ingredients.length} <span className="font-normal text-[var(--color-muted)] text-[11px]">total items</span>
                    </span>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-[#126973] dark:text-[#F1D8C2] group-hover:translate-x-0.5 transition-transform">
                      <span>View All</span>
                      <ChevronRight size={13} strokeWidth={2.5} />
                    </div>
                  </div>
                </div>

                {sortedList.map((cat) => {
                  const visual = getCategoryVisual(cat.code, cat.name)
                  const counts = categoryCounts[cat.id] || { total: 0, lowStock: 0 }
                  return (
                    <div
                      key={cat.id}
                      onClick={() => onSelectCategory && onSelectCategory(cat)}
                      className={`group relative rounded-2xl border p-5 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between hover:-translate-y-1 bg-gradient-to-b ${visual.gradient} ${visual.accent} border-b-[3px] border-[var(--color-border)] shadow-xs hover:shadow-lg ${visual.glow}`}
                      style={{ background: 'var(--color-surface)' }}
                    >
                      <div>
                        {/* Top row: Emoji / Visual & Code Badge */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/10 border border-[var(--color-border)] flex items-center justify-center text-2xl shadow-2xs group-hover:scale-110 transition-transform duration-200">
                            <span>{visual.emoji}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {cat.code && (
                              <span className="font-mono text-[10.5px] font-bold px-2 py-0.5 rounded-md border border-[var(--color-border)] bg-black/5 dark:bg-white/5 text-[var(--color-muted)]">
                                {cat.code}
                              </span>
                            )}
                            <span
                              className={`w-2 h-2 rounded-full ${
                                cat.is_active !== false ? 'bg-emerald-500 ring-2 ring-emerald-500/20' : 'bg-slate-400'
                              }`}
                              title={cat.is_active !== false ? 'Active' : 'Inactive'}
                            />
                          </div>
                        </div>

                        {/* Category Name & Actions */}
                        <div className="flex items-center justify-between gap-1">
                          <h3 className="text-base font-bold text-[var(--color-text)] group-hover:text-[#126973] dark:group-hover:text-[#F1D8C2] transition-colors line-clamp-1">
                            {cat.name}
                          </h3>
                          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={(e) => handleCopyName(cat.name, cat.id, e)}
                              className="p-1 rounded-md text-[var(--color-muted)] hover:text-[#126973] transition-all cursor-pointer"
                              title="Copy category name"
                            >
                              {copiedId === cat.id ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setViewLayout('table')
                                handleStartEdit(cat)
                              }}
                              className="p-1 rounded-md text-[var(--color-muted)] hover:text-[#126973] transition-all cursor-pointer"
                              title="Edit Category"
                            >
                              <Edit01 size={13} />
                            </button>
                          </div>
                        </div>

                        {cat.description ? (
                          <p className="text-xs text-[var(--color-muted)] mt-1.5 line-clamp-2 leading-relaxed">
                            {cat.description}
                          </p>
                        ) : (
                          <p className="text-xs text-[var(--color-muted)]/60 italic mt-1.5">
                            Standard raw material classification
                          </p>
                        )}
                      </div>

                      {/* Bottom: Item Count & Open action */}
                      <div className="mt-5 pt-3.5 border-t border-[var(--color-border)] flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[var(--color-text)] text-xs">
                            {counts.total} <span className="font-normal text-[var(--color-muted)] text-[11px]">{counts.total === 1 ? 'item' : 'items'}</span>
                          </span>
                          {counts.lowStock > 0 && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
                              <AlertTriangle size={10} />
                              {counts.lowStock} low
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 text-[11px] font-bold text-[#126973] dark:text-[#F1D8C2] group-hover:translate-x-0.5 transition-transform">
                          <span>View Items</span>
                          <ChevronRight size={13} strokeWidth={2.5} />
                        </div>
                      </div>
                    </div>
                  )
                })}

                {/* Quick Add Category Card */}
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingRow(true)
                    setViewLayout('table')
                  }}
                  className="rounded-2xl border-2 border-dashed border-[var(--color-border)] hover:border-[#126973] dark:hover:border-[#F1D8C2] p-5 flex flex-col items-center justify-center gap-2.5 text-center cursor-pointer transition-all hover:bg-[#126973]/5 group min-h-[180px]"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#126973]/10 dark:bg-[#126973]/20 border border-[#126973]/20 flex items-center justify-center text-[#126973] dark:text-[#F1D8C2] group-hover:scale-110 transition-transform">
                    <Plus size={22} className="stroke-[2.5px]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--color-text)] group-hover:text-[#126973] dark:group-hover:text-[#F1D8C2]">
                      Add New Category
                    </p>
                    <p className="text-[11px] text-[var(--color-muted)] mt-0.5">
                      Register raw material classification
                    </p>
                  </div>
                </button>
                </div>
              )}
            </div>
          ) : (
          /* Table View */
          <>
            <Table aria-label="Ingredient Categories Table" sortDescriptor={sortDescriptor}>
              <Table.Header>
                <Table.Head
                  id="name"
                  label="Category Name"
                  isRowHeader
                  allowsSorting
                  sortDescriptor={sortDescriptor}
                  onSort={handleSort}
                />
                <Table.Head
                  id="code"
                  label="Code / Key"
                  allowsSorting
                  sortDescriptor={sortDescriptor}
                  onSort={handleSort}
                />
                <Table.Head id="description" label="Description" />
                <Table.Head
                  id="sort_order"
                  label="Sort Order"
                  allowsSorting
                  sortDescriptor={sortDescriptor}
                  onSort={handleSort}
                />
                <Table.Head id="status" label="Status" />
                <Table.Head id="actions" className="text-right">
                  Actions
                </Table.Head>
              </Table.Header>

              <Table.Body>
                {/* ── Inline Add New Category Row ── */}
                {isAddingRow && (
                  <Table.Row className="bg-[#126973]/8 dark:bg-[#126973]/15 border-b-2 border-[#126973]/50 animate-in fade-in duration-150">
                    {/* 1. Name */}
                    <Table.Cell>
                      <div className="flex items-center gap-2 py-0.5">
                        <div className="w-8 h-8 rounded-[5px] border border-dashed border-[#126973]/50 bg-[#126973]/10 flex items-center justify-center text-[#126973] dark:text-[#F1D8C2] shrink-0">
                          <Tag size={15} />
                        </div>
                        <input
                          type="text"
                          autoFocus
                          placeholder="Category name (e.g. Meat & Poultry)..."
                          value={newRow.name}
                          onChange={(e) => setNewRow({ ...newRow, name: e.target.value })}
                          onKeyDown={(e) => handleKeyDown(e, false)}
                          className="w-full min-w-[160px] px-2.5 py-1.5 rounded-[5px] text-xs font-semibold border outline-none bg-[var(--color-surface)] text-[var(--color-text)] border-[#126973]/40 focus:border-[#126973] focus:ring-1 focus:ring-[#126973]"
                        />
                      </div>
                    </Table.Cell>

                    {/* 2. Code */}
                    <Table.Cell>
                      <input
                        type="text"
                        placeholder="MEAT"
                        value={newRow.code}
                        onChange={(e) => setNewRow({ ...newRow, code: e.target.value.toUpperCase() })}
                        onKeyDown={(e) => handleKeyDown(e, false)}
                        className="w-24 px-2 py-1.5 rounded-[5px] text-xs font-mono font-bold border outline-none bg-[var(--color-surface)] text-[var(--color-text)] border-[#126973]/40 focus:border-[#126973]"
                      />
                    </Table.Cell>

                    {/* 3. Description */}
                    <Table.Cell>
                      <input
                        type="text"
                        placeholder="Short description..."
                        value={newRow.description}
                        onChange={(e) => setNewRow({ ...newRow, description: e.target.value })}
                        onKeyDown={(e) => handleKeyDown(e, false)}
                        className="w-full min-w-[150px] px-2.5 py-1.5 rounded-[5px] text-xs border outline-none bg-[var(--color-surface)] text-[var(--color-text)] border-[#126973]/40 focus:border-[#126973]"
                      />
                    </Table.Cell>

                    {/* 4. Sort Order */}
                    <Table.Cell>
                      <input
                        type="number"
                        value={newRow.sort_order}
                        onChange={(e) => setNewRow({ ...newRow, sort_order: e.target.value })}
                        onKeyDown={(e) => handleKeyDown(e, false)}
                        className="w-16 px-2 py-1.5 rounded-[5px] text-xs text-center border outline-none bg-[var(--color-surface)] text-[var(--color-text)] border-[#126973]/40 focus:border-[#126973]"
                      />
                    </Table.Cell>

                    {/* 5. Status Toggle */}
                    <Table.Cell>
                      <button
                        type="button"
                        onClick={() => setNewRow({ ...newRow, is_active: !newRow.is_active })}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
                          newRow.is_active
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-500/15 text-slate-500 border border-slate-500/30'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${newRow.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        <span>{newRow.is_active ? 'Active' : 'Inactive'}</span>
                      </button>
                    </Table.Cell>

                    {/* 6. Actions */}
                    <Table.Cell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={handleSaveInlineRow}
                          disabled={savingNew}
                          className="px-2.5 py-1 rounded-[5px] bg-[#126973] hover:bg-[#126973]/90 text-white text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1"
                        >
                          {savingNew ? (
                            <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <Check size={13} strokeWidth={2.5} />
                          )}
                          <span>Save</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelInlineRow}
                          disabled={savingNew}
                          className="p-1 rounded-[5px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
                          title="Cancel"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                )}

                {/* ── Data Rows ── */}
                {paginatedList.map((cat) => {
                  const isEditing = editingId === cat.id
                  const isCopied = copiedId === cat.id

                  if (isEditing && editRow) {
                    return (
                      <Table.Row key={cat.id} className="bg-amber-500/8 dark:bg-amber-500/15 border-b-2 border-amber-500/50">
                        {/* Edit Name */}
                        <Table.Cell>
                          <div className="flex items-center gap-2 py-0.5">
                            <div className="w-8 h-8 rounded-[5px] border border-amber-500/50 bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                              <Tag size={15} />
                            </div>
                            <input
                              type="text"
                              autoFocus
                              value={editRow.name}
                              onChange={(e) => setEditRow({ ...editRow, name: e.target.value })}
                              onKeyDown={(e) => handleKeyDown(e, true, cat.id)}
                              className="w-full min-w-[160px] px-2.5 py-1.5 rounded-[5px] text-xs font-semibold border outline-none bg-[var(--color-surface)] text-[var(--color-text)] border-amber-500/40 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                            />
                          </div>
                        </Table.Cell>

                        {/* Edit Code */}
                        <Table.Cell>
                          <input
                            type="text"
                            value={editRow.code}
                            onChange={(e) => setEditRow({ ...editRow, code: e.target.value.toUpperCase() })}
                            onKeyDown={(e) => handleKeyDown(e, true, cat.id)}
                            className="w-24 px-2 py-1.5 rounded-[5px] text-xs font-mono font-bold border outline-none bg-[var(--color-surface)] text-[var(--color-text)] border-amber-500/40 focus:border-amber-500"
                          />
                        </Table.Cell>

                        {/* Edit Description */}
                        <Table.Cell>
                          <input
                            type="text"
                            value={editRow.description}
                            onChange={(e) => setEditRow({ ...editRow, description: e.target.value })}
                            onKeyDown={(e) => handleKeyDown(e, true, cat.id)}
                            className="w-full min-w-[150px] px-2.5 py-1.5 rounded-[5px] text-xs border outline-none bg-[var(--color-surface)] text-[var(--color-text)] border-amber-500/40 focus:border-amber-500"
                          />
                        </Table.Cell>

                        {/* Edit Sort Order */}
                        <Table.Cell>
                          <input
                            type="number"
                            value={editRow.sort_order}
                            onChange={(e) => setEditRow({ ...editRow, sort_order: e.target.value })}
                            onKeyDown={(e) => handleKeyDown(e, true, cat.id)}
                            className="w-16 px-2 py-1.5 rounded-[5px] text-xs text-center border outline-none bg-[var(--color-surface)] text-[var(--color-text)] border-amber-500/40 focus:border-amber-500"
                          />
                        </Table.Cell>

                        {/* Edit Status */}
                        <Table.Cell>
                          <button
                            type="button"
                            onClick={() => setEditRow({ ...editRow, is_active: !editRow.is_active })}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
                              editRow.is_active
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                : 'bg-slate-500/15 text-slate-500 border border-slate-500/30'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${editRow.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                            <span>{editRow.is_active ? 'Active' : 'Inactive'}</span>
                          </button>
                        </Table.Cell>

                        {/* Edit Actions */}
                        <Table.Cell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(cat.id)}
                              disabled={savingEdit}
                              className="px-2.5 py-1 rounded-[5px] bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1"
                            >
                              {savingEdit ? (
                                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              ) : (
                                <Check size={13} strokeWidth={2.5} />
                              )}
                              <span>Save</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              disabled={savingEdit}
                              className="p-1 rounded-[5px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
                              title="Cancel"
                            >
                              <X size={15} />
                            </button>
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    )
                  }

                  // Normal Table Display Row
                  return (
                    <Table.Row key={cat.id} className="hover:bg-black/3 dark:hover:bg-white/3 transition-colors">
                      {/* Name */}
                      <Table.Cell>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-[5px] border border-[var(--color-border)] bg-[#126973]/10 dark:bg-[#126973]/20 flex items-center justify-center text-[#126973] dark:text-[#F1D8C2] shrink-0 font-bold text-xs">
                            <Tag size={15} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-[var(--color-text)] truncate">
                                {cat.name}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => handleCopyName(cat.name, cat.id, e)}
                                className="p-1 rounded-md text-[var(--color-muted)] hover:text-[#126973] dark:hover:text-[#F1D8C2] hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
                                title="Copy category name"
                              >
                                {isCopied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </Table.Cell>

                      {/* Code */}
                      <Table.Cell>
                        {cat.code ? (
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md border border-[var(--color-border)] bg-black/5 dark:bg-white/5 text-[var(--color-muted)]">
                            {cat.code}
                          </span>
                        ) : (
                          <span className="text-xs text-[var(--color-muted)] italic">-</span>
                        )}
                      </Table.Cell>

                      {/* Description */}
                      <Table.Cell>
                        <p className="text-xs text-[var(--color-muted)] max-w-xs truncate" title={cat.description}>
                          {cat.description || <span className="italic text-[var(--color-muted)]/60">No description</span>}
                        </p>
                      </Table.Cell>

                      {/* Sort Order */}
                      <Table.Cell className="text-center font-mono text-xs text-[var(--color-muted)]">
                        {cat.sort_order ?? 0}
                      </Table.Cell>

                      {/* Status */}
                      <Table.Cell>
                        {cat.is_active !== false ? (
                          <BadgeWithIcon color="success" className="font-semibold capitalize">
                            Active
                          </BadgeWithIcon>
                        ) : (
                          <BadgeWithIcon color="secondary" className="font-semibold capitalize">
                            Inactive
                          </BadgeWithIcon>
                        )}
                      </Table.Cell>

                      {/* Actions */}
                      <Table.Cell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {onSelectCategory && (
                            <button
                              type="button"
                              onClick={() => onSelectCategory(cat)}
                              className="p-1.5 rounded-[5px] text-slate-400 hover:text-[#126973] hover:bg-[#126973]/10 dark:hover:text-[#F1D8C2] transition-all cursor-pointer"
                              title="View Category Stock"
                            >
                              <Eye size={15} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleStartEdit(cat)}
                            className="p-1.5 rounded-[5px] text-slate-400 hover:text-[#126973] hover:bg-[#126973]/10 dark:hover:text-[#F1D8C2] transition-all cursor-pointer"
                            title="Edit Category"
                          >
                            <Edit01 size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat.id, cat.name)}
                            className="p-1.5 rounded-[5px] text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
                            title="Delete Category"
                          >
                            <Trash01 size={15} />
                          </button>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  )
                })}

                {/* Empty State */}
                {paginatedList.length === 0 && !isAddingRow && (
                  <Table.Row>
                    <Table.Cell colSpan={6} className="py-12 text-center text-[var(--color-muted)]">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Tag size={30} className="text-slate-300 dark:text-slate-600" />
                        <p className="text-xs font-semibold">No categories found</p>
                        <button
                          type="button"
                          onClick={() => setIsAddingRow(true)}
                          className="mt-1 px-3 py-1.5 rounded-[5px] text-xs font-bold text-white bg-[#126973] hover:bg-[#126973]/90 transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                        >
                          <Plus size={13} strokeWidth={2.5} />
                          <span>Add Category Directly</span>
                        </button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                )}

                {/* Bottom Quick Add Row */}
                {!isAddingRow && paginatedList.length > 0 && (
                  <Table.Row
                    onClick={() => setIsAddingRow(true)}
                    className="hover:bg-[#126973]/5 dark:hover:bg-[#126973]/10 cursor-pointer border-t border-dashed border-[var(--color-border)] group transition-colors"
                  >
                    <Table.Cell colSpan={6} className="py-2.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#126973] dark:text-[#F1D8C2] group-hover:underline">
                        <Plus size={16} className="stroke-[2.5px]" />
                        <span>Quick Add Category</span>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table>

            {totalPages > 1 && (
              <div className="p-3 border-t border-[var(--color-border)]">
                <PaginationPageMinimalCenter
                  page={page}
                  totalPages={totalPages}
                  onPageChange={(p) => setPage(p)}
                />
              </div>
            )}
          </>
        )}
      </TableCard.Root>
    </div>
  )

  // If rendered as a Modal Dialog
  if (isModal) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose?.()
        }}
      >
        <div
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl p-6 space-y-5 bg-[var(--color-surface)] border-[var(--color-border)]"
          style={{ background: 'var(--color-surface)' }}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#126973]/10 dark:bg-[#126973]/20 border border-[#126973]/20 flex items-center justify-center">
                <Tag size={20} className="text-[#126973] dark:text-[#F1D8C2]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--color-text)]">
                  Raw Material Categories
                </h3>
                <p className="text-xs text-[var(--color-muted)]">
                  Master data classification for ingredients, kitchen stock, and supplies
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-[var(--color-text)] hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
              title="Close modal"
            >
              <X size={18} />
            </button>
          </div>

          {/* Modal Content */}
          {content}
        </div>
      </div>
    )
  }

  // Standalone / Tab Embedded view
  return content
}
