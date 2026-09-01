import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ChefHat,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  LayoutGrid,
  Columns3,
  Search,
  Flame,
  Bell,
  ArrowLeft,
  UtensilsCrossed,
  ShoppingBag,
  QrCode,
  Printer,
  Check,
  RotateCcw,
  Sparkles,
  Timer
} from 'lucide-react'
import toast from 'react-hot-toast'
import { kitchenApi } from '../../api/posApi'
import { useAuth } from '../../context/AuthContext'
import ThemeToggle from '../../components/ThemeToggle'
import { useWebSocket } from '../../hooks/useWebSocket'

// Sound synthesizer for incoming orders (Web Audio API)
const playChime = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const now = ctx.currentTime

    // First tone
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(587.33, now) // D5
    gain1.gain.setValueAtTime(0.15, now)
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.35)

    // Second tone
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(880, now + 0.12) // A5
    gain2.gain.setValueAtTime(0.2, now + 0.12)
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(now + 0.12)
    osc2.stop(now + 0.55)
  } catch (e) {
    console.warn('Audio chime warning:', e)
  }
}

function ElapsedTimer({ createdAt }) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const updateTime = () => {
      const created = new Date(createdAt).getTime()
      const now = Date.now()
      const diffSecs = Math.max(0, Math.floor((now - created) / 1000))
      setElapsed(diffSecs)
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [createdAt])

  const mins = Math.floor(elapsed / 60)
  const secs = elapsed % 60
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`

  // Color severity: High contrast pill inside colored card header
  let badgeStyle = 'bg-black/30 text-white border-white/20'
  if (mins >= 10) {
    badgeStyle = 'bg-red-950/80 text-white border-red-400/50 animate-pulse font-black'
  } else if (mins >= 5) {
    badgeStyle = 'bg-black/40 text-amber-200 border-amber-300/40 font-bold'
  }

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-[5px] border text-xs font-mono tracking-tight font-black shadow-xs ${badgeStyle}`}>
      <Timer size={13} className={mins >= 10 ? 'text-red-400 animate-spin shrink-0' : 'text-white/80 shrink-0'} />
      <span className="text-white drop-shadow-xs">{timeStr}</span>
    </div>
  )
}

export default function KitchenKDS() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { subscribe } = useWebSocket('kitchen')

  // ── States ──
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('active') // 'all' | 'active' | 'pending' | 'preparing' | 'ready'
  const [typeFilter, setTypeFilter] = useState('all') // 'all' | 'dine_in' | 'takeaway' | 'qr_scan'
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'kanban'
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [completedItems, setCompletedItems] = useState({}) // { [itemId]: boolean }
  const [currentTime, setCurrentTime] = useState(new Date())

  const previousOrderCountRef = useRef(0)

  // Clock ticker
  useEffect(() => {
    const clockTimer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(clockTimer)
  }, [])

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }
    document.addEventListener('fullscreenchange', handleFsChange)
    return () => document.removeEventListener('fullscreenchange', handleFsChange)
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }

  // ── Fetch Kitchen Orders ──
  const fetchOrders = useCallback(async (isManual = false) => {
    if (isManual) setLoading(true)
    try {
      const { data } = await kitchenApi.getOrders()
      const incoming = data.data || []
      setOrders(incoming)

      // Check if new orders arrived to trigger chime
      if (soundEnabled && incoming.length > previousOrderCountRef.current && previousOrderCountRef.current !== 0) {
        playChime()
        toast('New order arrived in kitchen!', {
          icon: '🔔',
          style: {
            borderRadius: '5px',
            background: '#1e293b',
            color: '#fff',
            fontWeight: 700,
            fontSize: '13px'
          }
        })
      }
      previousOrderCountRef.current = incoming.length
    } catch (e) {
      if (isManual) toast.error('Failed to sync kitchen orders')
    } finally {
      if (isManual) setLoading(false)
    }
  }, [soundEnabled])

  // Real-time Updates via WebSockets
  useEffect(() => {
    fetchOrders(false)
    const unsubNew = subscribe('new_order', () => fetchOrders(false))
    const unsubUpdate = subscribe('order_updated', () => fetchOrders(false))
    return () => {
      if (unsubNew) unsubNew()
      if (unsubUpdate) unsubUpdate()
    }
  }, [fetchOrders, subscribe])

  // ── Order State Transitions ──
  const handleUpdateStatus = async (orderId, nextStatus) => {
    try {
      await kitchenApi.updateStatus(orderId, nextStatus)
      toast.success(`Order status updated to ${nextStatus.toUpperCase()}`)
      fetchOrders(false)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update status')
    }
  }

  const handleToggleItemDone = (itemId) => {
    setCompletedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId]
    }))
  }

  // Print Kitchen Ticket Chit
  const handlePrintChit = (order) => {
    window.print()
  }

  // ── Filtered Orders ──
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Status filter
      if (statusFilter === 'active') {
        if (!['pending', 'confirmed', 'preparing', 'cooking', 'ready'].includes(order.status)) return false
      } else if (statusFilter !== 'all') {
        if (order.status !== statusFilter) return false
      }

      // Order type filter
      if (typeFilter !== 'all') {
        if (order.order_type !== typeFilter) return false
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const orderNum = String(order.order_number || '').toLowerCase()
        const tableNum = String(order.table_session?.table?.table_number || order.table_session?.table_id || '').toLowerCase()
        const hasItem = (order.items || []).some((i) => (i.item_product_name || i.product?.name || '').toLowerCase().includes(q))
        return orderNum.includes(q) || tableNum.includes(q) || hasItem
      }

      return true
    })
  }, [orders, statusFilter, typeFilter, searchQuery])

  // Count summaries
  const pendingCount = orders.filter((o) => ['pending', 'confirmed'].includes(o.status)).length
  const preparingCount = orders.filter((o) => ['preparing', 'cooking'].includes(o.status)).length
  const readyCount = orders.filter((o) => o.status === 'ready').length

  return (
    <div
      className="w-full h-screen flex flex-col select-none overflow-hidden font-sans"
      style={{
        background: 'var(--color-bg)',
        color: 'var(--color-text)'
      }}
    >
      {/* ══════════════════════════════════════════════════════════════
          TOP HEADER & CONTROL BAR
      ══════════════════════════════════════════════════════════════ */}
      <header
        className="px-4 py-3 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 z-30 shadow-xs"
        style={{
          background: 'var(--color-card)',
          borderColor: 'var(--color-border)'
        }}
      >
        {/* Brand & Left Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] border text-xs font-bold transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 cursor-pointer shadow-2xs"
            style={{
              background: 'var(--color-bg)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)'
            }}
            title="Go Back"
          >
            <ArrowLeft size={15} />
            <span>Back</span>
          </button>
        </div>

        {/* Center: Live Digital Clock */}
        <div
          className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-[5px] border font-mono text-xs font-black tracking-wider shadow-2xs"
          style={{
            background: 'var(--color-bg)',
            borderColor: 'var(--color-border)'
          }}
        >
          <Clock size={14} className="text-amber-500 shrink-0" />
          <span>
            {currentTime.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: true
            })}
          </span>
          <span className="text-[10px] text-[var(--color-muted)] font-normal border-l pl-2 ml-1" style={{ borderColor: 'var(--color-border)' }}>
            {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>

        {/* Right: Quick Controls (Search, Audio, Fullscreen, Mode, Theme) */}
        <div className="flex items-center gap-2">
          {/* Quick Search */}
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search table / order #..."
              className="pl-8 pr-3 py-1.5 rounded-[5px] text-xs border outline-none font-medium w-40 sm:w-48 transition-all focus:w-56"
              style={{
                background: 'var(--color-bg)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)'
              }}
            />
          </div>

          {/* View Mode (Grid vs Kanban) */}
          <div
            className="flex items-center p-0.5 rounded-[5px] border"
            style={{
              background: 'var(--color-bg)',
              borderColor: 'var(--color-border)'
            }}
          >
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              title="Grid View"
              className={`p-1.5 rounded-[5px] text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              title="Kanban Board View"
              className={`p-1.5 rounded-[5px] text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              <Columns3 size={15} />
            </button>
          </div>

          {/* Sound Alert Toggle */}
          <button
            type="button"
            onClick={() => {
              setSoundEnabled(!soundEnabled)
              if (!soundEnabled) playChime()
            }}
            title={soundEnabled ? 'Mute Sound Alerts' : 'Enable Sound Alerts'}
            className={`p-2 rounded-[5px] border transition-all cursor-pointer active:scale-95 ${
              soundEnabled
                ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                : 'text-[var(--color-muted)] border-[var(--color-border)] hover:bg-black/5 dark:hover:bg-white/5'
            }`}
            style={{ background: soundEnabled ? undefined : 'var(--color-bg)' }}
          >
            {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>

          
          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            className="p-2 rounded-[5px] border text-[var(--color-text)] transition-all cursor-pointer active:scale-95 hover:bg-black/5 dark:hover:bg-white/5"
            style={{
              background: 'var(--color-bg)',
              borderColor: 'var(--color-border)'
            }}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>

          {/* Theme Switcher */}
          <ThemeToggle className="!rounded-[5px]" />
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════
          STATUS BAR & FILTER TABS
      ══════════════════════════════════════════════════════════════ */}
      <div
        className="px-4 py-2.5 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs font-semibold"
        style={{
          background: 'var(--color-surface)',
          borderColor: 'var(--color-border)'
        }}
      >
        {/* Status Filter Chips (Pills layout matching USA KDS) */}
        <div className="flex items-center gap-2 overflow-x-auto py-0.5">
          <button
            type="button"
            onClick={() => setStatusFilter('active')}
            className={`px-4 py-2 rounded-[5px] border transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'active'
                ? 'bg-[#f97316] text-white font-black border-[#ea580c] shadow-sm'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--color-text)]'
            }`}
          >
            <Flame size={14} className={statusFilter === 'active' ? 'text-white' : 'text-orange-500'} />
            <span>Active Tickets</span>
            <span className={`ml-1 px-2 py-0.2 rounded-[5px] text-[10px] font-mono font-bold ${
              statusFilter === 'active' ? 'bg-black/20 text-white' : 'bg-orange-500 text-white'
            }`}>
              {orders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('pending')}
            className={`px-4 py-2 rounded-[5px] border transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'pending'
                ? 'bg-blue-600 text-white font-black border-blue-700 shadow-sm'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--color-text)]'
            }`}
          >
            <Clock size={13} className={statusFilter === 'pending' ? 'text-white' : 'text-blue-500'} />
            <span>New / Pending</span>
            {pendingCount > 0 && (
              <span className={`ml-1 px-2 py-0.2 rounded-[5px] text-[10px] font-mono font-bold ${
                statusFilter === 'pending' ? 'bg-black/20 text-white' : 'bg-blue-500 text-white'
              }`}>
                {pendingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('preparing')}
            className={`px-4 py-2 rounded-[5px] border transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'preparing'
                ? 'bg-[#ea580c] text-white font-black border-orange-700 shadow-sm'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--color-text)]'
            }`}
          >
            <ChefHat size={13} className={statusFilter === 'preparing' ? 'text-white' : 'text-orange-500'} />
            <span>In Preparation</span>
            {preparingCount > 0 && (
              <span className={`ml-1 px-2 py-0.2 rounded-[5px] text-[10px] font-mono font-bold ${
                statusFilter === 'preparing' ? 'bg-black/20 text-white' : 'bg-orange-500 text-white'
              }`}>
                {preparingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('ready')}
            className={`px-4 py-2 rounded-[5px] border transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'ready'
                ? 'bg-emerald-600 text-white font-black border-emerald-700 shadow-sm'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--color-text)]'
            }`}
          >
            <CheckCircle2 size={13} className={statusFilter === 'ready' ? 'text-white' : 'text-emerald-500'} />
            <span>Ready for Service</span>
            {readyCount > 0 && (
              <span className={`ml-1 px-2 py-0.2 rounded-[5px] text-[10px] font-mono font-bold ${
                statusFilter === 'ready' ? 'bg-black/20 text-white' : 'bg-emerald-500 text-white'
              }`}>
                {readyCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-[5px] border transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900 font-bold'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--color-text)]'
            }`}
          >
            <span>All History</span>
          </button>
        </div>

        {/* Order Type Filter Pills */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-[var(--color-muted)] mr-1 hidden sm:inline">Type:</span>
          {[
            { id: 'all', label: 'All' },
            { id: 'dine_in', label: '🍽️ Dine-In' },
            { id: 'takeaway', label: '🥡 Takeaway' },
            { id: 'qr_scan', label: '📱 Mobile QR' }
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTypeFilter(t.id)}
              className={`px-3 py-1.5 rounded-[5px] text-[11px] font-bold transition-all cursor-pointer ${
                typeFilter === t.id
                  ? 'bg-[#BF4040] text-white shadow-2xs'
                  : 'text-[var(--color-muted)] hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          MAIN TICKETS DISPLAY VIEW
      ══════════════════════════════════════════════════════════════ */}
      <main className="flex-1 min-h-0 overflow-y-auto p-4">
        {filteredOrders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3 animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-[5px] flex items-center justify-center bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <CheckCircle2 size={36} />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight" style={{ color: 'var(--color-text)' }}>
                Kitchen Order Queue is Clear!
              </h3>
              <p className="text-xs text-[var(--color-muted)] mt-1 max-w-sm">
                No orders waiting in this section. New tickets sent from POS or Mobile QR will pop up automatically.
              </p>
            </div>
          </div>
        ) : viewMode === 'kanban' ? (
          /* ── KANBAN BOARD VIEW ── */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
            {/* Column 1: New / Pending */}
            <div className="flex flex-col rounded-[5px] border p-3 min-h-0" style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
              <div className="flex items-center justify-between pb-2 mb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="font-extrabold text-xs">NEW ORDERS</span>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-[5px] bg-blue-500/10 text-blue-500">
                  {filteredOrders.filter((o) => ['pending', 'confirmed'].includes(o.status)).length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {filteredOrders
                  .filter((o) => ['pending', 'confirmed'].includes(o.status))
                  .map((order) => (
                    <KDSTicketCard
                      key={order.id}
                      order={order}
                      completedItems={completedItems}
                      onToggleItem={handleToggleItemDone}
                      onUpdateStatus={handleUpdateStatus}
                      onPrint={handlePrintChit}
                    />
                  ))}
              </div>
            </div>

            {/* Column 2: Preparing */}
            <div className="flex flex-col rounded-[5px] border p-3 min-h-0" style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
              <div className="flex items-center justify-between pb-2 mb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                  <span className="font-extrabold text-xs">COOKING / PREPARING</span>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-[5px] bg-amber-500/10 text-amber-500">
                  {filteredOrders.filter((o) => ['preparing', 'cooking'].includes(o.status)).length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {filteredOrders
                  .filter((o) => ['preparing', 'cooking'].includes(o.status))
                  .map((order) => (
                    <KDSTicketCard
                      key={order.id}
                      order={order}
                      completedItems={completedItems}
                      onToggleItem={handleToggleItemDone}
                      onUpdateStatus={handleUpdateStatus}
                      onPrint={handlePrintChit}
                    />
                  ))}
              </div>
            </div>

            {/* Column 3: Ready */}
            <div className="flex flex-col rounded-[5px] border p-3 min-h-0" style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
              <div className="flex items-center justify-between pb-2 mb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="font-extrabold text-xs">READY FOR SERVICE</span>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-[5px] bg-emerald-500/10 text-emerald-500">
                  {filteredOrders.filter((o) => o.status === 'ready').length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {filteredOrders
                  .filter((o) => o.status === 'ready')
                  .map((order) => (
                    <KDSTicketCard
                      key={order.id}
                      order={order}
                      completedItems={completedItems}
                      onToggleItem={handleToggleItemDone}
                      onUpdateStatus={handleUpdateStatus}
                      onPrint={handlePrintChit}
                    />
                  ))}
              </div>
            </div>
          </div>
        ) : (
          /* ── GRID CARD VIEW ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {filteredOrders.map((order) => (
              <KDSTicketCard
                key={order.id}
                order={order}
                completedItems={completedItems}
                onToggleItem={handleToggleItemDone}
                onUpdateStatus={handleUpdateStatus}
                onPrint={handlePrintChit}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// KDS TICKET CARD COMPONENT
// ══════════════════════════════════════════════════════════════
function KDSTicketCard({ order, completedItems, onToggleItem, onUpdateStatus, onPrint }) {
  const isPending = ['pending', 'confirmed'].includes(order.status)
  const isPreparing = ['preparing', 'cooking'].includes(order.status)
  const isReady = order.status === 'ready'

  // Header Theme based on status
  let headerBg = 'bg-blue-600 text-white'
  let headerBorder = 'border-blue-500'
  let statusBadge = { label: 'NEW TICKET', icon: Clock, bg: 'bg-white/20' }

  if (isPreparing) {
    headerBg = 'bg-[#f97316] text-white'
    headerBorder = 'border-orange-500'
    statusBadge = { label: 'COOKING', icon: Flame, bg: 'bg-black/25' }
  } else if (isReady) {
    headerBg = 'bg-[#059669] text-white'
    headerBorder = 'border-emerald-500'
    statusBadge = { label: 'READY TO SERVE', icon: CheckCircle2, bg: 'bg-black/25' }
  }

  const tableNumber = order.table_session?.table?.table_number || order.table_session?.table_id
  const orderType = order.order_type || 'dine_in'

  const totalItemsCount = (order.items || []).length
  const cookedCount = (order.items || []).filter((item, idx) => {
    const itemKey = item.id ? String(item.id) : `${order.id}-${idx}`
    return Boolean(completedItems[itemKey] || completedItems[item.id])
  }).length
  const allCooked = totalItemsCount > 0 && cookedCount === totalItemsCount

  return (
    <div
      className="flex flex-col rounded-[5px] border overflow-hidden shadow-md transition-all hover:shadow-xl duration-200"
      style={{
        background: 'var(--color-surface)',
        borderColor: 'var(--color-border)'
      }}
    >
      {/* ── Ticket Header ── */}
      <div className={`p-3.5 border-b flex items-center justify-between gap-2 ${headerBg} ${headerBorder}`}>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-black text-sm tracking-tight">
              {order.order_number || `ORD-${String(order.id).padStart(5, '0')}`}
            </span>
            <span className={`px-2 py-0.5 rounded-[5px] text-[10px] font-black uppercase tracking-wider ${statusBadge.bg}`}>
              {statusBadge.label}
            </span>
          </div>

          {/* Table / Order Type info */}
          <div className="flex items-center gap-2 mt-1 text-[11px] font-medium text-white/90">
            {orderType === 'dine_in' ? (
              <span className="font-bold">🍽️ Table {tableNumber || '1'}</span>
            ) : orderType === 'takeaway' ? (
              <span className="font-bold">🥡 Takeaway</span>
            ) : (
              <span className="font-bold">📱 Table {tableNumber || '1'} (QR)</span>
            )}
            <span>•</span>
            <span>
              {new Date(order.created_at).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </div>

        {/* Live Elapsed Stopwatch */}
        <ElapsedTimer createdAt={order.created_at} />
      </div>

      {/* ── Order Items List (Interactive Tap-to-Check) ── */}
      <div className="p-3 flex-1 overflow-y-auto space-y-2.5 min-h-[140px] max-h-[290px]">
        {(order.items || []).map((item, idx) => {
          const itemKey = item.id ? String(item.id) : `${order.id}-${idx}`
          const isItemDone = Boolean(completedItems[itemKey] || completedItems[item.id])
          const productImg = item.product?.image_url || item.image_url

          return (
            <div
              key={itemKey}
              onClick={() => onToggleItem(itemKey)}
              className={`p-2.5 rounded-[5px] border transition-all cursor-pointer flex items-start gap-2.5 select-none active:scale-[0.99] ${
                isItemDone
                  ? 'bg-emerald-500/10 dark:bg-emerald-950/30 border-emerald-500/30 opacity-70'
                  : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/80 hover:border-amber-500/50 shadow-2xs'
              }`}
            >
              {/* Checkbox Icon (Square-rounded Checkbox) */}
              <div
                className={`w-5 h-5 rounded-[5px] border-2 flex items-center justify-center shrink-0 mt-2.5 transition-all ${
                  isItemDone
                    ? 'bg-emerald-500 border-emerald-600 text-white shadow-xs'
                    : 'border-slate-300 dark:border-slate-500 bg-white dark:bg-slate-900 hover:border-amber-500'
                }`}
              >
                {isItemDone && <Check size={11} strokeWidth={3.5} />}
              </div>

              {/* Product Thumbnail Image */}
              <div className="relative shrink-0">
                {productImg ? (
                  <img
                    src={productImg}
                    alt={item.product?.name || 'Food'}
                    className="w-10 h-10 rounded-[5px] object-cover border shrink-0 shadow-2xs"
                    style={{ borderColor: 'var(--color-border)' }}
                    onError={(e) => {
                      e.target.style.display = 'none'
                      if (e.target.nextSibling) {
                        e.target.nextSibling.style.display = 'flex'
                      }
                    }}
                  />
                ) : null}
                <div
                  className="w-10 h-10 rounded-[5px] items-center justify-center font-bold text-xs border shrink-0 bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-2xs"
                  style={{
                    borderColor: 'var(--color-border)',
                    display: productImg ? 'none' : 'flex'
                  }}
                >
                  <UtensilsCrossed size={16} className="opacity-70" />
                </div>
              </div>

              {/* Item Details */}
              <div className="flex-1 min-w-0">
                <div
                  className={`flex items-center gap-1.5 font-bold text-xs transition-all ${
                    isItemDone ? 'line-through text-slate-400' : ''
                  }`}
                  style={{ color: isItemDone ? undefined : 'var(--color-text)' }}
                >
                  <span className="px-1.5 py-0.5 rounded-[5px] bg-amber-500/15 text-orange-600 dark:text-orange-400 font-mono font-black text-[11px] shrink-0">
                    {item.quantity}x
                  </span>
                  <span className="truncate text-slate-900 dark:text-slate-100">{item.item_product_name || item.product?.name || 'Food Item'}</span>
                </div>

                {/* Option Groups & Modifiers (Pill Badges) */}
                {item.options && item.options.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {item.options.map((opt) => (
                      <span
                        key={opt.id || opt.option_value_id}
                        className="text-[10px] font-medium px-2.5 py-0.5 rounded-[5px] bg-slate-200/80 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300/40 dark:border-slate-600/50"
                      >
                        {opt.option_value?.name || opt.name || 'Modifier'}
                      </span>
                    ))}
                  </div>
                )}

                {/* Special Instructions / Chef Notes */}
                {item.special_instructions && (
                  <div className="mt-1.5 px-2.5 py-1 rounded-[5px] text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-start gap-1">
                    <AlertCircle size={12} className="shrink-0 mt-0.5 text-amber-500" />
                    <span className="italic">"{item.special_instructions}"</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Progressive Action Footer ── */}
      <div
        className="p-3 border-t flex flex-col gap-2 shrink-0"
        style={{
          background: 'var(--color-card)',
          borderColor: 'var(--color-border)'
        }}
      >
        {allCooked && isPreparing && (
          <div className="px-2 py-1 rounded-[5px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold text-center flex items-center justify-center gap-1 animate-pulse">
            <CheckCircle2 size={13} />
            <span>All {totalItemsCount} dishes cooked! Ready to serve.</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          {isPending && (
            <button
              type="button"
              onClick={() => onUpdateStatus(order.id, 'preparing')}
              className="flex-1 py-3 px-3 rounded-[5px] text-xs font-black text-white transition-all flex items-center justify-center gap-1.5 shadow-xs hover:opacity-90 active:scale-95 cursor-pointer uppercase tracking-wider"
              style={{
                background: 'linear-gradient(135deg, #d97706, #b45309)'
              }}
            >
              <Flame size={14} />
              <span>START COOKING</span>
            </button>
          )}

          {isPreparing && (
            <button
              type="button"
              onClick={() => onUpdateStatus(order.id, 'ready')}
              className="flex-1 py-3 px-3 rounded-[5px] text-xs font-black text-white transition-all flex items-center justify-center gap-1.5 shadow-sm hover:opacity-90 active:scale-95 cursor-pointer bg-[#16a34a] hover:bg-[#15803d] uppercase tracking-wider"
            >
              <CheckCircle2 size={14} />
              <span>MARK AS READY</span>
            </button>
          )}

          {isReady && (
            <button
              type="button"
              onClick={() => onUpdateStatus(order.id, 'completed')}
              className="flex-1 py-3 px-3 rounded-[5px] text-xs font-black text-white transition-all flex items-center justify-center gap-1.5 shadow-sm hover:opacity-90 active:scale-95 cursor-pointer bg-[#2563eb] hover:bg-[#1d4ed8] uppercase tracking-wider"
            >
              <Check size={14} strokeWidth={3} />
              <span>SERVED / COMPLETE</span>
            </button>
          )}

        {/* Recall / Revert Button */}
        {!isPending && (
          <button
            type="button"
            onClick={() => onUpdateStatus(order.id, isReady ? 'preparing' : 'pending')}
            title="Revert back to previous status"
            className="p-3 rounded-[5px] border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-all cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95"
          >
            <RotateCcw size={14} />
          </button>
        )}

        
        </div>
      </div>
    </div>
  )
}
