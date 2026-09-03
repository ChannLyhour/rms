import { useState, useMemo } from 'react'
import {
  TableCard,
  Table,
  BadgeWithIcon,
  PaginationPageMinimalCenter,
} from '../../../../components/TablesComponents'
import {
  SearchLg,
  Plus,
  Edit01,
  Trash01,
  Check,
  AlertTriangle,
} from '@untitledui/icons'
import {
  Package,
  ShoppingBag,
  ArrowDownUp,
  X,
  Camera,
  Eye,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { adminApi } from '../../../../api/adminApi'
import StockAdjustModal from '../views/StockAdjustModal'
import ViewPopupdetails from './utils/ViewPopupdetails'

// ── Iconly 3D Icons (from https://web.iconly.pro/3d) ────────────────────────
// 1. Iconly 3D Box / Archive
const Iconly3DBox = ({ size = 32, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 48 48" className={`shrink-0 ${className}`}>
    <defs>
      <radialGradient id="ic3d-box-top" cx="40%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#5EEAD4" />
        <stop offset="60%" stopColor="#14B8A6" />
        <stop offset="100%" stopColor="#0D9488" />
      </radialGradient>
      <linearGradient id="ic3d-box-left" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#0F766E" />
        <stop offset="100%" stopColor="#115E59" />
      </linearGradient>
      <linearGradient id="ic3d-box-right" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#134E4A" />
        <stop offset="100%" stopColor="#042F2E" />
      </linearGradient>
      <linearGradient id="ic3d-box-tape" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FEF08A" />
        <stop offset="50%" stopColor="#FBBF24" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
      <filter id="ic3d-box-shadow" x="-20%" y="-10%" width="140%" height="140%">
        <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#0F766E" floodOpacity="0.35" />
      </filter>
    </defs>
    <g filter="url(#ic3d-box-shadow)">
      {/* 3D Left Face */}
      <path d="M7 16.5C7 15.5 7.6 14.6 8.5 14.2L23 7.8C23.6 7.5 24.4 7.5 25 7.8L39.5 14.2C40.4 14.6 41 15.5 41 16.5V31.5C41 32.8 40.2 34 39 34.5L25 40.5C24.4 40.8 23.6 40.8 23 40.5L9 34.5C7.8 34 7 32.8 7 31.5V16.5Z" fill="#042F2E" />
      <path d="M7 16.5L24 24.5V40.5L9 34.5C7.8 34 7 32.8 7 31.5V16.5Z" fill="url(#ic3d-box-left)" />
      {/* 3D Right Face */}
      <path d="M24 24.5L41 16.5V31.5C41 32.8 40.2 34 39 34.5L24 40.5V24.5Z" fill="url(#ic3d-box-right)" />
      {/* 3D Top Face (Curved Pillow Lid) */}
      <path d="M24 8.5L39.5 15.5C40.3 15.9 40.3 17 39.5 17.4L24 24.5L8.5 17.4C7.7 17 7.7 15.9 8.5 15.5L24 8.5Z" fill="url(#ic3d-box-top)" />
      {/* Rounded 3D Tape Strip */}
      <path d="M20 9.8L34 16.2L31 17.8L17 11.2L20 9.8Z" fill="url(#ic3d-box-tape)" />
      <path d="M17 11.2L20 9.8V23L17 21.5V11.2Z" fill="#D97706" opacity="0.9" />
      {/* Specular Gloss Highlight */}
      <path d="M11 16L24 10L36 15.5" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.65" fill="none" />
    </g>
  </svg>
)

// 2. Iconly 3D Danger / Warning
const Iconly3DDanger = ({ size = 32, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 48 48" className={`shrink-0 ${className}`}>
    <defs>
      <radialGradient id="ic3d-warn-body" cx="45%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#FDE68A" />
        <stop offset="40%" stopColor="#FBBF24" />
        <stop offset="85%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#D97706" />
      </radialGradient>
      <linearGradient id="ic3d-warn-shadow" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#B45309" />
        <stop offset="100%" stopColor="#78350F" />
      </linearGradient>
      <linearGradient id="ic3d-warn-mark" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#FEF3C7" />
      </linearGradient>
      <filter id="ic3d-warn-filter" x="-20%" y="-10%" width="140%" height="140%">
        <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#B45309" floodOpacity="0.4" />
      </filter>
    </defs>
    <g filter="url(#ic3d-warn-filter)">
      {/* 3D Extrusion Depth (Base/Side) */}
      <path d="M21.2 5.8C22.4 3.7 25.6 3.7 26.8 5.8L43.8 35.8C45 37.9 43.5 40.5 41 40.5H7C4.5 40.5 3 37.9 4.2 35.8L21.2 5.8Z" fill="url(#ic3d-warn-shadow)" transform="translate(0, 2.5)" />
      {/* 3D Front Pillowy Face */}
      <path d="M21.2 5.8C22.4 3.7 25.6 3.7 26.8 5.8L43.8 35.8C45 37.9 43.5 40.5 41 40.5H7C4.5 40.5 3 37.9 4.2 35.8L21.2 5.8Z" fill="url(#ic3d-warn-body)" />
      {/* Beveled Inner Inset Glow */}
      <path d="M22.5 9.2C23.2 8 24.8 8 25.5 9.2L39.8 34.5C40.5 35.7 39.6 37.2 38.2 37.2H9.8C8.4 37.2 7.5 35.7 8.2 34.5L22.5 9.2Z" fill="#F59E0B" opacity="0.3" />
      {/* Specular Highlight along Left Shoulder */}
      <path d="M22.5 7.5L7.5 35" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.75" fill="none" />
      {/* 3D Floating Exclamation Mark */}
      <rect x="22" y="16" width="4" height="11" rx="2" fill="#78350F" opacity="0.25" transform="translate(0, 1)" />
      <rect x="22" y="16" width="4" height="11" rx="2" fill="url(#ic3d-warn-mark)" />
      {/* 3D Floating Exclamation Dot */}
      <circle cx="24" cy="32" r="2.3" fill="#78350F" opacity="0.25" transform="translate(0, 1)" />
      <circle cx="24" cy="32" r="2.3" fill="url(#ic3d-warn-mark)" />
      <circle cx="23.3" cy="31.3" r="0.7" fill="#FFFFFF" />
    </g>
  </svg>
)

// 3. Iconly 3D Wallet / Money
const Iconly3DWallet = ({ size = 32, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 48 48" className={`shrink-0 ${className}`}>
    <defs>
      <radialGradient id="ic3d-wal-body" cx="40%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#6EE7B7" />
        <stop offset="45%" stopColor="#10B981" />
        <stop offset="100%" stopColor="#047857" />
      </radialGradient>
      <linearGradient id="ic3d-wal-shadow" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#047857" />
        <stop offset="100%" stopColor="#064E3B" />
      </linearGradient>
      <radialGradient id="ic3d-coin-face" cx="35%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#FEF08A" />
        <stop offset="55%" stopColor="#FBBF24" />
        <stop offset="100%" stopColor="#D97706" />
      </radialGradient>
      <linearGradient id="ic3d-clasp" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FEF08A" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
      <filter id="ic3d-wal-filter" x="-20%" y="-10%" width="140%" height="140%">
        <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#065F46" floodOpacity="0.4" />
      </filter>
    </defs>
    <g filter="url(#ic3d-wal-filter)">
      {/* 3D Shiny Gold Coin peeking from behind wallet */}
      <g transform="translate(24, 4)">
        <circle cx="9" cy="9" r="9" fill="#B45309" transform="translate(0, 1.5)" />
        <circle cx="9" cy="9" r="9" fill="url(#ic3d-coin-face)" />
        <circle cx="9" cy="9" r="7" fill="none" stroke="#FDE68A" strokeWidth="0.9" strokeOpacity="0.7" />
        <text x="9" y="11.8" textAnchor="middle" fontSize="7.5" fontWeight="900" fill="#92400E" fontFamily="system-ui, sans-serif">$</text>
        <path d="M5.5 5.5A7 7 0 0 1 12 3" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" fill="none" strokeOpacity="0.8" />
      </g>
      {/* 3D Wallet Depth Base */}
      <rect x="5" y="15" width="38" height="26" rx="8" fill="url(#ic3d-wal-shadow)" transform="translate(0, 2)" />
      {/* 3D Wallet Front Clay Body */}
      <rect x="5" y="15" width="38" height="26" rx="8" fill="url(#ic3d-wal-body)" />
      {/* Top Flap Fold Crease */}
      <path d="M5 22C12 24 24 24 43 22" stroke="#047857" strokeWidth="1.2" strokeOpacity="0.4" fill="none" />
      {/* Specular Gloss Line along Top Rim */}
      <path d="M11 18H37" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeOpacity="0.65" />
      {/* 3D Clasp / Latch Tongue */}
      <rect x="29" y="23" width="14" height="10" rx="5" fill="#065F46" opacity="0.3" transform="translate(0, 1.2)" />
      <rect x="29" y="23" width="14" height="10" rx="5" fill="url(#ic3d-wal-body)" />
      {/* Golden Clasp Button */}
      <circle cx="38" cy="28" r="2.5" fill="url(#ic3d-clasp)" />
      <circle cx="37.5" cy="27.5" r="0.8" fill="#FFFFFF" />
    </g>
  </svg>
)

export default function IngredientsPage({
  ingredients = [],
  loading = false,
  onRefresh,
  onOpenCreate,
  onOpenEdit,
}) {
  const [search, setSearch] = useState('')
  const [unitFilter, setUnitFilter] = useState('all')
  const [showLowStockOnly, setShowLowStockOnly] = useState(false)
  const [page, setPage] = useState(1)
  const pageSize = 10

  const [sortDescriptor, setSortDescriptor] = useState({
    column: 'created_at',
    direction: 'descending',
  })

  // Quick Adjustment Modal state
  const [adjustTarget, setAdjustTarget] = useState(null)
  // Full Detail Modal state
  const [detailItem, setDetailItem] = useState(null)

  // Inline Table Add Row state
  const [isAddingRow, setIsAddingRow] = useState(false)
  const [savingNew, setSavingNew] = useState(false)
  const [uploadingNewImg, setUploadingNewImg] = useState(false)
  const [uploadingId, setUploadingId] = useState(null)
  const [newRow, setNewRow] = useState({
    name: '',
    unit: 'kg',
    stock_quantity: '',
    low_stock_threshold: '5',
    cost_per_unit: '',
    image_url: '',
  })

  // Upload image for existing row
  const handleTableImageUpload = async (item, file) => {
    if (!file) return
    const formData = new FormData()
    formData.append('image', file)

    setUploadingId(item.id)
    try {
      const res = await adminApi.uploadImage(formData, 'ingredients')
      const uploadedUrl = res.data?.url || res.data?.path || res.data?.full_url
      if (!uploadedUrl) throw new Error('No image URL returned')

      await adminApi.updateIngredient(item.id, {
        ...item,
        image_url: uploadedUrl,
      })

      toast.success(`Updated image for ${item.name}`)
      if (onRefresh) onRefresh()
    } catch (err) {
      console.error('Failed to upload image:', err)
      toast.error(err.response?.data?.error || 'Failed to upload image')
    } finally {
      setUploadingId(null)
    }
  }

  // Upload image for inline new row
  const handleNewRowImageUpload = async (file) => {
    if (!file) return
    const formData = new FormData()
    formData.append('image', file)

    setUploadingNewImg(true)
    try {
      const res = await adminApi.uploadImage(formData, 'ingredients')
      const uploadedUrl = res.data?.url || res.data?.path || res.data?.full_url
      if (!uploadedUrl) throw new Error('No image URL returned')

      setNewRow((prev) => ({ ...prev, image_url: uploadedUrl }))
      toast.success('Image uploaded for new ingredient')
    } catch (err) {
      console.error('Failed to upload image:', err)
      toast.error(err.response?.data?.error || 'Failed to upload image')
    } finally {
      setUploadingNewImg(false)
    }
  }

  const handleSaveInlineRow = async () => {
    if (!newRow.name || !newRow.name.trim()) {
      toast.error('Please enter ingredient name')
      return
    }

    setSavingNew(true)
    try {
      await adminApi.createIngredient({
        name: newRow.name.trim(),
        unit: newRow.unit || 'kg',
        stock_quantity: parseFloat(newRow.stock_quantity) || 0,
        low_stock_threshold: parseFloat(newRow.low_stock_threshold) || 5,
        cost_per_unit: parseFloat(newRow.cost_per_unit) || 0,
        image_url: newRow.image_url || null,
        is_active: true,
      })

      toast.success(`Added ${newRow.name.trim()} successfully`)
      setNewRow({
        name: '',
        unit: 'kg',
        stock_quantity: '',
        low_stock_threshold: '5',
        cost_per_unit: '',
        image_url: '',
      })
      setIsAddingRow(false)
      setPage(1)
      if (onRefresh) onRefresh()
    } catch (err) {
      console.error('Failed to create ingredient:', err)
      toast.error(err.response?.data?.error || 'Failed to add ingredient')
    } finally {
      setSavingNew(false)
    }
  }

  const handleCancelInlineRow = () => {
    setIsAddingRow(false)
    setNewRow({
      name: '',
      unit: 'kg',
      stock_quantity: '',
      low_stock_threshold: '5',
      cost_per_unit: '',
      image_url: '',
    })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSaveInlineRow()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancelInlineRow()
    }
  }

  // Metrics
  const metrics = useMemo(() => {
    const totalItems = ingredients.length
    const lowStockCount = ingredients.filter(i => Number(i.stock_quantity) <= Number(i.low_stock_threshold)).length
    const totalValue = ingredients.reduce((sum, i) => sum + (Number(i.stock_quantity) * Number(i.cost_per_unit) || 0), 0)
    return { totalItems, lowStockCount, totalValue }
  }, [ingredients])

  // Filtered & Sorted List
  const filteredList = useMemo(() => {
    return ingredients.filter((item) => {
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.unit.toLowerCase().includes(search.toLowerCase())
      const matchUnit = unitFilter === 'all' || item.unit === unitFilter
      const isLow = Number(item.stock_quantity) <= Number(item.low_stock_threshold)
      const matchLowStock = !showLowStockOnly || isLow

      return matchSearch && matchUnit && matchLowStock
    })
  }, [ingredients, search, unitFilter, showLowStockOnly])

  const sortedList = useMemo(() => {
    return [...filteredList].sort((a, b) => {
      let first = a[sortDescriptor.column]
      let second = b[sortDescriptor.column]

      // Handle created_at or updated_at date sorting
      if (sortDescriptor.column === 'created_at' || sortDescriptor.column === 'updated_at') {
        const timeA = new Date(first || a.created_at || a.updated_at || 0).getTime()
        const timeB = new Date(second || b.created_at || b.updated_at || 0).getTime()
        return sortDescriptor.direction === 'descending' ? timeB - timeA : timeA - timeB
      }

      if (sortDescriptor.column === 'stock_quantity' || sortDescriptor.column === 'cost_per_unit') {
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

      // Default fallback: newest created first
      const timeA = new Date(a.created_at || 0).getTime()
      const timeB = new Date(b.created_at || 0).getTime()
      return timeB - timeA
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

  const handleDeleteIngredient = async (id) => {
    if (!confirm('Are you sure you want to delete this ingredient?')) return
    try {
      await adminApi.deleteIngredient(id)
      toast.success('Ingredient deleted')
      onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete ingredient')
    }
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* ── Metrics Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total Tracked Items */}
        <div
          className="p-4 rounded-xl border flex items-center justify-between shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group border-b-[3px] border-b-[#126973]"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-muted)]">Total Tracked Items</p>
            <p className="text-2xl font-extrabold text-[var(--color-text)] mt-1 tracking-tight">{metrics.totalItems}</p>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-[#126973]/10 dark:bg-[#126973]/20 border border-[#126973]/20 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-110 transition-transform duration-200">
            <Iconly3DBox size={34} />
          </div>
        </div>

        {/* Card 2: Low Stock Warnings */}
        <div
          className="p-4 rounded-xl border flex items-center justify-between shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group border-b-[3px] border-b-amber-500"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-muted)]">Low Stock Warnings</p>
            <p className="text-2xl font-extrabold text-[var(--color-text)] mt-1 tracking-tight">
              {metrics.lowStockCount} <span className="text-xs font-semibold text-[var(--color-muted)]">Items</span>
            </p>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-amber-500/15 dark:bg-amber-500/25 border border-amber-500/25 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-110 transition-transform duration-200">
            <Iconly3DDanger size={34} />
          </div>
        </div>

        {/* Card 3: Estimated Stock Valuation */}
        <div
          className="p-4 rounded-xl border flex items-center justify-between shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group border-b-[3px] border-b-emerald-500"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-muted)]">Estimated Stock Valuation</p>
            <p className="text-2xl font-extrabold text-emerald-500 mt-1 tracking-tight">${metrics.totalValue.toFixed(2)}</p>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-emerald-500/15 dark:bg-emerald-500/25 border border-emerald-500/25 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-110 transition-transform duration-200">
            <Iconly3DWallet size={34} />
          </div>
        </div>
      </div>

      {/* ── Filters & Search Row ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div
            className="flex items-center gap-3 px-3.5 py-2 rounded-[5px] border text-xs max-w-md shadow-xs"
            style={{
              background: 'var(--color-card)',
              borderColor: 'var(--color-border)',
            }}
          >
            <SearchLg size={16} className="text-[var(--color-muted)] shrink-0 stroke-[2px]" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Search ingredients by name, unit..."
              className="bg-transparent border-none outline-none w-full text-xs placeholder:text-[var(--color-muted)] text-[var(--color-text)]"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="text-[11px] font-medium text-slate-400 hover:text-rose-500 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className={`px-3 py-2 rounded-[5px] text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
              showLowStockOnly
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-500 shadow-xs'
                : 'border-[var(--color-border)] text-[var(--color-muted)] hover:bg-[#126973]/5'
            }`}
          >
            <AlertTriangle size={13} />
            <span>Low Stock ({metrics.lowStockCount})</span>
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsAddingRow(true)}
            className="px-3.5 py-1.5 rounded-[5px] text-xs font-bold text-white bg-[#126973] hover:bg-[#126973]/90 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1.5 shadow-xs shrink-0"
            title="Add new ingredient row directly on table"
          >
            <Plus size={14} className="stroke-[2.5px]" />
            {/* <span>Add</span> */}
          </button>

         
        
      </div>
    </div>

      {/* ── Table Card ── */}
      <TableCard.Root>
        <Table aria-label="Ingredients Stock Table" sortDescriptor={sortDescriptor}>
          <Table.Header>
            <Table.Head
              id="name"
              label="Ingredient Name"
              isRowHeader
              allowsSorting
              sortDescriptor={sortDescriptor}
              onSort={handleSort}
            />
            <Table.Head
              id="stock_quantity"
              label="Current Stock"
              allowsSorting
              sortDescriptor={sortDescriptor}
              onSort={handleSort}
            />
            <Table.Head id="threshold" label="Threshold" />
            <Table.Head
              id="cost_per_unit"
              label="Unit Cost"
              allowsSorting
              sortDescriptor={sortDescriptor}
              onSort={handleSort}
            />
            <Table.Head id="total_val" label="Total Value" />
            <Table.Head id="status" label="Status" />
            <Table.Head id="actions" className="text-right">
              Actions
            </Table.Head>
          </Table.Header>

          <Table.Body>
            {/* ── Inline Add New Ingredient Row on Table.Cell ── */}
            {isAddingRow && (
              <Table.Row className="bg-[#126973]/8 dark:bg-[#126973]/15 border-b-2 border-[#126973]/50 animate-in fade-in duration-150">
                {/* 1. Ingredient Name, Image & Unit */}
                <Table.Cell>
                  <div className="flex items-center gap-2 py-0.5">
                    {/* Image Upload Box */}
                    <div className="relative group/newimg w-8 h-8 rounded-[5px] border border-dashed border-[#126973]/50 hover:border-[#126973] bg-[#126973]/10 overflow-hidden shrink-0 flex items-center justify-center cursor-pointer transition-all">
                      {uploadingNewImg ? (
                        <span className="w-3.5 h-3.5 border-2 border-[#126973] border-t-transparent rounded-full animate-spin" />
                      ) : newRow.image_url ? (
                        <>
                          <img
                            src={newRow.image_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setNewRow((prev) => ({ ...prev, image_url: '' }))
                            }}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover/newimg:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                            title="Remove image"
                          >
                            <X size={13} />
                          </button>
                        </>
                      ) : (
                        <label
                          htmlFor="inline-new-ingredient-img"
                          className="w-full h-full flex items-center justify-center text-[#126973] dark:text-[#F1D8C2] cursor-pointer"
                          title="Upload ingredient image"
                        >
                          <Camera size={14} />
                        </label>
                      )}
                      <input
                        id="inline-new-ingredient-img"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingNewImg}
                        onChange={(e) => handleNewRowImageUpload(e.target.files?.[0])}
                        onClick={(e) => { e.target.value = '' }}
                      />
                    </div>
                    <div className="flex-1 flex items-center gap-1.5 min-w-[170px]">
                      <input
                        type="text"
                        autoFocus
                        placeholder="Ingredient name (e.g. Tomato)..."
                        value={newRow.name}
                        onChange={(e) => setNewRow({ ...newRow, name: e.target.value })}
                        onKeyDown={handleKeyDown}
                        className="w-full px-2.5 py-1.5 rounded-[5px] text-xs font-semibold border outline-none bg-[var(--color-surface)] text-[var(--color-text)] border-[#126973]/40 focus:border-[#126973] focus:ring-1 focus:ring-[#126973]"
                      />
                      <select
                        value={newRow.unit}
                        onChange={(e) => setNewRow({ ...newRow, unit: e.target.value })}
                        className="px-2 py-1.5 rounded-[5px] text-xs font-semibold border outline-none bg-[var(--color-surface)] text-[var(--color-text)] border-[#126973]/40 cursor-pointer shrink-0"
                      >
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                        <option value="L">L</option>
                        <option value="ml">ml</option>
                        <option value="pcs">pcs</option>
                        <option value="pack">pack</option>
                        <option value="bottle">bottle</option>
                        <option value="can">can</option>
                        <option value="box">box</option>
                      </select>
                    </div>
                  </div>
                </Table.Cell>

                {/* 2. Current Stock */}
                <Table.Cell>
                  <div className="flex items-center gap-1 min-w-[100px]">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={newRow.stock_quantity}
                      onChange={(e) => setNewRow({ ...newRow, stock_quantity: e.target.value })}
                      onKeyDown={handleKeyDown}
                      className="w-20 px-2 py-1.5 rounded-[5px] text-xs font-mono font-bold border outline-none bg-[var(--color-surface)] text-[var(--color-text)] border-[#126973]/40 focus:border-[#126973]"
                    />
                    <span className="text-xs text-[var(--color-muted)] font-mono">{newRow.unit}</span>
                  </div>
                </Table.Cell>

                {/* 3. Threshold */}
                <Table.Cell>
                  <div className="flex items-center gap-1 min-w-[95px]">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="5.00"
                      value={newRow.low_stock_threshold}
                      onChange={(e) => setNewRow({ ...newRow, low_stock_threshold: e.target.value })}
                      onKeyDown={handleKeyDown}
                      className="w-20 px-2 py-1.5 rounded-[5px] text-xs font-mono border outline-none bg-[var(--color-surface)] text-[var(--color-text)] border-[#126973]/40 focus:border-[#126973]"
                    />
                    <span className="text-xs text-[var(--color-muted)] font-mono">{newRow.unit}</span>
                  </div>
                </Table.Cell>

                {/* 4. Cost Per Unit */}
                <Table.Cell>
                  <div className="flex items-center gap-1 min-w-[85px]">
                    <span className="text-xs font-bold text-[var(--color-muted)]">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={newRow.cost_per_unit}
                      onChange={(e) => setNewRow({ ...newRow, cost_per_unit: e.target.value })}
                      onKeyDown={handleKeyDown}
                      className="w-18 px-2 py-1.5 rounded-[5px] text-xs font-mono border outline-none bg-[var(--color-surface)] text-[var(--color-text)] border-[#126973]/40 focus:border-[#126973]"
                    />
                  </div>
                </Table.Cell>

                {/* 5. Total Value Preview */}
                <Table.Cell>
                  <span className="font-mono text-xs font-bold text-[var(--color-text)]">
                    ${((Number(newRow.stock_quantity) || 0) * (Number(newRow.cost_per_unit) || 0)).toFixed(2)}
                  </span>
                </Table.Cell>

                {/* 6. Status Preview */}
                <Table.Cell>
                  {(Number(newRow.stock_quantity) || 0) <= 0 ? (
                    <span className="inline-flex items-center text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-500 border border-rose-500/30">
                      Out of Stock
                    </span>
                  ) : (Number(newRow.stock_quantity) || 0) <= (Number(newRow.low_stock_threshold) || 0) ? (
                    <span className="inline-flex items-center text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30">
                      Low Stock
                    </span>
                  ) : (
                    <BadgeWithIcon color="success" className="font-semibold capitalize">
                      Good
                    </BadgeWithIcon>
                  )}
                </Table.Cell>

                {/* 7. Actions */}
                <Table.Cell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      disabled={savingNew}
                      onClick={handleSaveInlineRow}
                      className="px-2.5 py-1.5 rounded-[5px] text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                      title="Save (or press Enter)"
                    >
                      {savingNew ? (
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Check size={13} strokeWidth={2.5} />
                      )}
                      <span>Save</span>
                    </button>
                    <button
                      type="button"
                      disabled={savingNew}
                      onClick={handleCancelInlineRow}
                      className="p-1.5 rounded-[5px] text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
                      title="Cancel (or press Esc)"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </Table.Cell>
              </Table.Row>
            )}

            {/* ── Existing Data Rows ── */}
            {paginatedList.map((item) => {
              const isLowStock = Number(item.stock_quantity) <= Number(item.low_stock_threshold)
              const totalCost = (Number(item.stock_quantity) * Number(item.cost_per_unit)) || 0

              return (
                <Table.Row key={item.id} id={item.id}>
                  {/* Name & Image */}
                  <Table.Cell>
                    <div className="flex items-center gap-2.5">
                      {/* Interactive Image Upload / Avatar */}
                      <div className="relative group/img w-8 h-8 rounded-[5px] overflow-hidden shrink-0 border border-[var(--color-border)] bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = 'none' }}
                          />
                        ) : (
                          <div className="w-full h-full bg-[#126973]/15 border border-[#126973]/30 flex items-center justify-center font-bold text-xs text-[#126973] dark:text-[#F1D8C2]">
                            {item.name.charAt(0).toUpperCase()}
                          </div>
                        )}

                        {/* Hover Overlay to Upload / Change Image */}
                        <label
                          htmlFor={`upload-ingredient-${item.id}`}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                          title="Click to upload or change image"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {uploadingId === item.id ? (
                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Camera size={13} className="text-white drop-shadow" />
                          )}
                        </label>
                        <input
                          id={`upload-ingredient-${item.id}`}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingId === item.id}
                          onChange={(e) => handleTableImageUpload(item, e.target.files?.[0])}
                          onClick={(e) => { e.stopPropagation(); e.target.value = '' }}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => setDetailItem(item)}
                        className="font-bold text-xs text-[var(--color-text)] hover:text-[#126973] dark:hover:text-[#F1D8C2] hover:underline cursor-pointer text-left truncate"
                        title="Click to view full details"
                      >
                        {item.name}
                      </button>
                    </div>
                  </Table.Cell>

                  {/* Current Stock */}
                  <Table.Cell>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`font-mono text-xs font-bold ${
                          isLowStock
                            ? 'text-amber-500 font-extrabold flex items-center gap-1'
                            : 'text-emerald-500'
                        }`}
                      >
                        {Number(item.stock_quantity).toFixed(2)} {item.unit}
                        {isLowStock && <AlertTriangle size={12} className="text-amber-500" />}
                      </span>
                    </div>
                  </Table.Cell>

                  {/* Threshold */}
                  <Table.Cell>
                    <span className="text-xs font-mono" style={{ color: 'var(--color-muted)' }}>
                      {Number(item.low_stock_threshold).toFixed(2)} {item.unit}
                    </span>
                  </Table.Cell>

                  {/* Cost Per Unit */}
                  <Table.Cell>
                    <span className="font-mono text-xs text-[var(--color-text)]">
                      ${Number(item.cost_per_unit).toFixed(2)}
                    </span>
                  </Table.Cell>

                  {/* Total Value */}
                  <Table.Cell>
                    <span className="font-mono text-xs font-bold text-[var(--color-text)]">
                      ${totalCost.toFixed(2)}
                    </span>
                  </Table.Cell>

                  {/* Status */}
                  <Table.Cell>
                    {isLowStock ? (
                      <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30">
                        Low Stock
                      </span>
                    ) : (
                      <BadgeWithIcon color="success" className="font-semibold capitalize">
                        Good
                      </BadgeWithIcon>
                    )}
                  </Table.Cell>

                  {/* Actions */}
                  <Table.Cell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setDetailItem(item)}
                        className="p-1.5 rounded-[5px] text-slate-400 hover:text-[#126973] hover:bg-[#126973]/10 dark:hover:text-[#F1D8C2] transition-all cursor-pointer"
                        title="View Full Details"
                      >
                        <Eye size={15} />
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => onOpenEdit(item)}
                        className="p-1.5 rounded-[5px] text-slate-400 hover:text-[#126973] hover:bg-[#126973]/10 dark:hover:text-[#F1D8C2] transition-all cursor-pointer"
                        title="Edit Ingredient"
                      >
                        <Edit01 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteIngredient(item.id)}
                        className="p-1.5 rounded-[5px] text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
                        title="Delete Ingredient"
                      >
                        <Trash01 size={15} />
                      </button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              )
            })}

            {/* ── Empty State ── */}
            {paginatedList.length === 0 && !isAddingRow && (
              <Table.Row>
                <Table.Cell colSpan={7} className="py-12 text-center text-[var(--color-muted)]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Package size={30} className="text-slate-300 dark:text-slate-600" />
                    <p className="text-xs font-semibold">No ingredients found</p>
                    <button
                      type="button"
                      onClick={() => setIsAddingRow(true)}
                      className="mt-1 px-3 py-1.5 rounded-[5px] text-xs font-bold text-white bg-[#126973] hover:bg-[#126973]/90 transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                    >
                      <Plus size={13} strokeWidth={2.5} />
                      <span>Add First Ingredient Directly</span>
                    </button>
                  </div>
                </Table.Cell>
              </Table.Row>
            )}

            {/* ── Bottom Quick Add Trigger Row ── */}
            {!isAddingRow && paginatedList.length > 0 && (
              <Table.Row
                onClick={() => setIsAddingRow(true)}
                className="hover:bg-[#126973]/5 dark:hover:bg-[#126973]/10 cursor-pointer border-t border-dashed border-[var(--color-border)] group transition-colors"
              >
                <Table.Cell colSpan={7} className="py-2.5 px-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#126973] dark:text-[#F1D8C2] group-hover:underline">
                    <Plus size={14} className="stroke-[2.5px]" />
                    <span>+ Add new ingredient row directly on table...</span>
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
      </TableCard.Root>

      

      {/* Full Detail View Modal */}
      {detailItem && (
        <ViewPopupdetails
          item={detailItem}
          type="ingredient"
          onClose={() => setDetailItem(null)}
          onEdit={(it) => {
            setDetailItem(null)
            onOpenEdit(it)
          }}
          onAdjust={(it) => {
            setDetailItem(null)
            setAdjustTarget(it)
          }}
        />
      )}
    </div>
  )
}
