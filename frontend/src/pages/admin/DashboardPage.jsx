import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DollarSign, ShoppingBag, Armchair, TrendingUp,
  Users, Shield, Puzzle, Leaf, Bell,
  ChevronRight, RefreshCw, Clock, AlertTriangle,
  BarChart3, LayoutGrid, Calendar, Store, UtensilsCrossed,
  Layers, CheckCircle2, Radio
} from 'lucide-react'
import { adminApi } from '../../api/adminApi'
import { posApi } from '../../api/posApi'
import AdminLayout from '../../components/layout/AdminLayout'
import { useWebSocket } from '../../hooks/useWebSocket'
import toast from 'react-hot-toast'

/* ─── helpers ───────────────────────────────────── */
const toArr = (r) => {
  const raw = r?.data?.data !== undefined ? r.data.data : (r?.data !== undefined ? r.data : r)
  if (Array.isArray(raw)) return raw
  if (Array.isArray(raw?.items)) return raw.items
  if (Array.isArray(raw?.data)) return raw.data
  return []
}

const fmt = (n) => Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const STATUS_DOT = {
  completed: '#10B981', cooking: '#F59E0B', paid: '#3B82F6',
  cancelled: '#EF4444', pending: '#F59E0B', preparing: '#F59E0B', ready: '#10B981',
}

/* ─── Dynamic Period Bar Chart ──────────────────── */
function RevenueTrendChart({ orders, period }) {
  const chartData = useMemo(() => {
    const now = new Date()

    if (period === '24 hours') {
      const hours = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22]
      return hours.map((hr) => {
        const matching = orders.filter((o) => {
          const d = new Date(o.created_at || o.CreatedAt)
          return d.toDateString() === now.toDateString() && d.getHours() >= hr && d.getHours() < hr + 2
        })
        const income = matching.reduce((s, o) => s + (parseFloat(o.total_amount || o.subtotal) || 0), 0)
        return { label: `${hr}:00`, income, count: matching.length, isCurrent: now.getHours() >= hr && now.getHours() < hr + 2 }
      })
    }

    if (period === '7 days') {
      return Array.from({ length: 7 }).map((_, idx) => {
        const d = new Date()
        d.setDate(now.getDate() - (6 - idx))
        const dateStr = d.toDateString()
        const matching = orders.filter((o) => new Date(o.created_at || o.CreatedAt).toDateString() === dateStr)
        const income = matching.reduce((s, o) => s + (parseFloat(o.total_amount || o.subtotal) || 0), 0)
        return { label: DAYS_OF_WEEK[d.getDay()], income, count: matching.length, isCurrent: idx === 6 }
      })
    }

    if (period === '30 days') {
      return ['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((lbl, idx) => {
        const matching = orders.filter((o) => {
          const d = new Date(o.created_at || o.CreatedAt)
          const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24))
          return diffDays >= (3 - idx) * 7 && diffDays < (4 - idx) * 7
        })
        const income = matching.reduce((s, o) => s + (parseFloat(o.total_amount || o.subtotal) || 0), 0)
        return { label: lbl, income, count: matching.length, isCurrent: idx === 3 }
      })
    }

    // Default: 12 Months
    return MONTHS.map((m, i) => {
      const matching = orders.filter((o) => {
        const d = new Date(o.created_at || o.CreatedAt)
        return d.getFullYear() === now.getFullYear() && d.getMonth() === i
      })
      const income = matching.reduce((s, o) => s + (parseFloat(o.total_amount || o.subtotal) || 0), 0)
      return { label: m, income, count: matching.length, isCurrent: i === now.getMonth() }
    })
  }, [orders, period])

  const maxVal = Math.max(...chartData.map((d) => d.income), 10)
  const peakItem = useMemo(() => {
    return chartData.reduce((prev, curr) => (curr.income > prev.income ? curr : prev), chartData[0])
  }, [chartData])

  // Bar max width depending on number of items
  const barMaxW = period === '24 hours' ? 'max-w-[18px]' : period === '7 days' ? 'max-w-[44px]' : 'max-w-[32px]'

  // Reference grid markers
  const gridLevels = [1, 0.75, 0.5, 0.25, 0]

  return (
    <div className="flex-1 flex flex-col justify-between mt-4">
      {/* Chart container with horizontal gridlines */}
      <div className="relative w-full" style={{ height: 200 }}>
        {/* Background Grid Lines & Y-axis labels */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
          {gridLevels.map((lvl, idx) => (
            <div key={idx} className="flex items-center gap-2 w-full">
              <span className="text-[9px] font-mono font-medium w-9 text-right shrink-0" style={{ color: 'var(--color-muted)', opacity: 0.7 }}>
                ${(maxVal * lvl).toFixed(0)}
              </span>
              <div className="flex-1 border-b border-dashed" style={{ borderColor: 'var(--color-border)', opacity: 0.6 }} />
            </div>
          ))}
        </div>

        {/* Bars Container */}
        <div className="absolute inset-0 pl-11 flex items-end gap-2 pb-6">
          {chartData.map((bar, idx) => {
            const pct = maxVal > 0 ? (bar.income / maxVal) * 100 : 0
            const h = Math.max(pct, 0)
            const hasIncome = bar.income > 0

            return (
              <div key={bar.label + idx} className="flex-1 h-full flex flex-col items-center justify-end group relative">
                {/* Modern Hover Tooltip */}
                <div
                  className="absolute -top-11 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none px-2.5 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap shadow-2xl z-30 flex flex-col items-center gap-0.5"
                  style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                  }}
                >
                  <span className="text-[11px] font-extrabold" style={{ color: bar.isCurrent ? '#BF4040' : '#4F46E5' }}>
                    ${bar.income.toFixed(2)}
                  </span>
                  <span className="text-[9px] font-medium" style={{ color: 'var(--color-muted)' }}>
                    {bar.count} {bar.count === 1 ? 'order' : 'orders'} • {bar.label}
                  </span>
                </div>

                {/* Track and Bar */}
                <div className="w-full flex items-end justify-center h-full">
                  <div
                    className={`w-full ${barMaxW} h-full rounded-t-md flex items-end justify-center transition-all duration-300 relative`}
                    style={{
                      background: 'var(--color-border)',
                      opacity: 0.25,
                    }}
                  />
                  {/* Active Filled Bar */}
                  <div
                    className={`w-full ${barMaxW} rounded-t-md transition-all duration-700 ease-out absolute bottom-0 cursor-pointer group-hover:brightness-110`}
                    style={{
                      height: `${h}%`,
                      minHeight: hasIncome ? 6 : 2,
                      background: bar.isCurrent
                        ? 'linear-gradient(180deg, #BF4040 0%, #8A2E2E 100%)'
                        : hasIncome
                          ? 'linear-gradient(180deg, #6366F1 0%, #4338CA 100%)'
                          : 'var(--color-border)',
                      opacity: bar.isCurrent ? 1 : hasIncome ? 0.9 : 0.4,
                      boxShadow: hasIncome
                        ? bar.isCurrent
                          ? '0 4px 14px rgba(191,64,64,0.35)'
                          : '0 4px 12px rgba(99,102,241,0.25)'
                        : 'none',
                    }}
                  >
                    {/* Subtle Top Highlight Pill on Bar */}
                    {hasIncome && (
                      <div className="w-full h-1 rounded-t-md opacity-40 bg-white" />
                    )}
                  </div>
                </div>

                {/* X-axis label */}
                <span
                  className="absolute -bottom-5 text-[10px] font-semibold tracking-tight truncate w-full text-center transition-colors"
                  style={{
                    color: bar.isCurrent ? 'var(--color-text)' : 'var(--color-muted)',
                    fontWeight: bar.isCurrent ? 800 : 500,
                  }}
                >
                  {bar.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer Summary / Legend */}
      <div className="flex flex-wrap items-center justify-between border-t pt-3 mt-4 px-1 text-xs gap-3" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: 'var(--color-text)' }}>
            <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600 shadow-sm" /> Gross Sales
          </span>
          <span className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: 'var(--color-muted)' }}>
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-600 shadow-sm" /> Current Period ({period})
          </span>
        </div>

        <div className="flex items-center gap-3">
          {peakItem && peakItem.income > 0 && (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-md"
              style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
              ⚡ Peak: <strong className="text-emerald-500 font-extrabold">{peakItem.label}</strong> (${peakItem.income.toFixed(2)})
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── CategoryDonut ──────────────────────────────── */
function CategoryDonut({ orders, categories }) {
  const data = useMemo(() => {
    const catMap = {}
    let total = 0
    orders.forEach(o => (o.items || o.order_items || []).forEach(it => {
      const name = it.product?.category?.name || it.category_name || 'General'
      const amt = (it.unit_price || it.price || 0) * (it.quantity || 1)
      catMap[name] = (catMap[name] || 0) + amt
      total += amt
    }))

    if (total === 0 && categories.length > 0) {
      return { total: 1, segments: [{ name: 'All Menu', amount: 1, pct: 100, color: '#BF4040' }] }
    }

    const palette = ['#BF4040', '#10b981', '#f59e0b', '#6366f1', '#ec4899', '#06b6d4', '#8b5cf6']
    const segments = Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, amount], i) => ({
        name, amount,
        pct: total > 0 ? (amount / total) * 100 : 0,
        color: palette[i % palette.length]
      }))

    if (segments.length === 0) segments.push({ name: 'All Menu', amount: 1, pct: 100, color: '#BF4040' })
    return { total: total || 1, segments }
  }, [orders, categories])

  const r = 36, cx = 46, cy = 46, circ = 2 * Math.PI * r
  let acc = 0

  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0">
        <svg width="92" height="92" viewBox="0 0 92 92" className="transform -rotate-90">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--color-border)" strokeWidth="10" />
          {data.segments.map((seg, i) => {
            const dash = (seg.pct / 100) * circ
            const offset = circ - acc
            acc += dash
            return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={seg.color} strokeWidth="10"
              strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={offset}
              className="transition-all duration-700 hover:opacity-80" />
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[8px] font-semibold" style={{ color: 'var(--color-muted)' }}>SALES</span>
          <span className="text-[11px] font-extrabold" style={{ color: 'var(--color-text)' }}>${fmt(data.total)}</span>
        </div>
      </div>
      <div className="space-y-1.5 flex-1 min-w-0">
        {data.segments.map(seg => (
          <div key={seg.name} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: seg.color }} />
            <span className="text-[11px] font-medium truncate flex-1" style={{ color: 'var(--color-text)' }}>{seg.name}</span>
            <span className="text-[11px] font-bold" style={{ color: 'var(--color-muted)' }}>{seg.pct.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════ */
export default function DashboardPage() {
  const navigate = useNavigate()
  const [orders, setOrders]         = useState([])
  const [tables, setTables]         = useState([])
  const [users, setUsers]           = useState([])
  const [categories, setCategories] = useState([])
  const [ingredients, setIngredients] = useState([])
  const [summary, setSummary]       = useState(null)
  const [loading, setLoading]       = useState(true)
  const [chartPeriod, setChartPeriod] = useState('12 Months')

  const { isConnected, subscribe } = useWebSocket('admin')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [ordRes, tblRes, usrRes, catRes, ingRes, sumRes] = await Promise.allSettled([
        adminApi.getOrders({ limit: 250 }),
        adminApi.getTables(),
        adminApi.getUsers(1, 100),
        adminApi.getCategories(),
        adminApi.getIngredients ? adminApi.getIngredients() : Promise.resolve({ data: [] }),
        adminApi.getSalesSummary(
          new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().slice(0, 10),
          new Date().toISOString().slice(0, 10)
        ),
      ])

      if (ordRes.status === 'fulfilled') setOrders(toArr(ordRes.value))
      if (tblRes.status === 'fulfilled') setTables(toArr(tblRes.value))
      if (usrRes.status === 'fulfilled') setUsers(toArr(usrRes.value))
      if (catRes.status === 'fulfilled') setCategories(toArr(catRes.value))
      if (ingRes.status === 'fulfilled') setIngredients(toArr(ingRes.value))
      if (sumRes.status === 'fulfilled') setSummary(sumRes.value?.data?.data || sumRes.value?.data || null)
    } catch {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  // Live WebSocket subscription for instant sync
  useEffect(() => {
    const unsubNew = subscribe('new_order', () => {
      loadData()
      toast('New order received!', { icon: '🛎️' })
    })
    const unsubUpdate = subscribe('order_updated', () => {
      loadData()
    })
    const unsubTable = subscribe('table_updated', () => {
      adminApi.getTables().then(r => setTables(toArr(r))).catch(() => {})
    })

    return () => {
      if (unsubNew) unsubNew()
      if (unsubUpdate) unsubUpdate()
      if (unsubTable) unsubTable()
    }
  }, [subscribe, loadData])

  /* ── derived stats ──────────────────────────────── */
  const totalSales = summary?.total_revenue !== undefined
    ? Number(summary.total_revenue)
    : orders.reduce((s, o) => s + (parseFloat(o.total_amount || o.subtotal) || 0), 0)

  const completedOrders = orders.filter(o => ['completed', 'paid'].includes(String(o.status).toLowerCase()))
  const activeOrders    = orders.filter(o => !['completed', 'cancelled', 'paid'].includes(String(o.status).toLowerCase()))
  const occupied        = tables.filter(t => ['occupied', 'calling_waiter', 'bill_requested'].includes(t.status))
  const lowStock        = ingredients.filter(i => (i.current_stock ?? 0) <= (i.min_stock_level ?? i.min_threshold ?? 10))

  const avgTicket = completedOrders.length > 0
    ? completedOrders.reduce((s, o) => s + (parseFloat(o.total_amount || o.subtotal) || 0), 0) / completedOrders.length
    : 0

  /* top items */
  const itemCounts = {}
  orders.forEach(o => (o.items || o.order_items || []).forEach(it => {
    const k = it.title || it.name || 'Unknown'
    itemCounts[k] = (itemCounts[k] || 0) + (it.quantity || 1)
  }))
  const topItems     = Object.entries(itemCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const maxItemCount = topItems.length > 0 ? topItems[0][1] : 1
  const recentOrders = orders.slice(0, 6)

  /* role breakdown */
  const roleBreakdown = useMemo(() => {
    const map = {}
    users.forEach(u => {
      const r = u.role?.name || (typeof u.role === 'string' ? u.role : 'Staff')
      map[r] = (map[r] || 0) + 1
    })
    return Object.entries(map)
  }, [users])

  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  /* ═══════════════════ RENDER ══════════════════ */
  return (
    <AdminLayout>
      <div className="space-y-5">

        {/* ── Header ────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--color-text)' }}>
                Dashboard
              </h1>
              
            </div>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
               Restaurant operations, sales overview & floor status • {date}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* <button onClick={() => navigate('/pos')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all shadow-sm"
              style={{ background: 'linear-gradient(135deg, #BF4040 0%, #8A2E2E 100%)' }}>
              <UtensilsCrossed size={13} />
              Open POS
            </button> */}
            {/* <button onClick={loadData}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border"
              style={{ color: 'var(--color-muted)', borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#BF4040'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}>
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button> */}
          </div>
        </div>

        {/* ── KPI Cards ──────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'GROSS REVENUE',     value: `$${fmt(totalSales)}`,          icon: DollarSign,  color: '#BF4040', bg: '#FEF2F2', path: '/analytics' },
            { label: 'COMPLETED ORDERS',  value: `${completedOrders.length}`,    icon: ShoppingBag, color: '#10B981', bg: '#ECFDF5', sub: `${activeOrders.length} in progress`, path: '/orders' },
            { label: 'TABLES SEATED',     value: `${occupied.length} / ${tables.length}`, icon: Armchair, color: '#6366F1', bg: '#EEF2FF', sub: `${tables.length - occupied.length} tables free`, path: '/tables' },
            { label: 'AVERAGE TICKET',    value: `$${fmt(avgTicket)}`,           icon: TrendingUp,  color: '#F59E0B', bg: '#FFFBEB', sub: 'Per transaction', path: '/analytics' },
          ].map((kpi, i) => {
            const Icon = kpi.icon
            return (
              <div key={i} onClick={() => navigate(kpi.path)}
                className="rounded-xl p-4 flex items-center gap-3 cursor-pointer transition-all border"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: kpi.bg }}>
                  <Icon size={18} style={{ color: kpi.color }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-bold tracking-widest uppercase" style={{ color: 'var(--color-muted)' }}>{kpi.label}</p>
                  <p className="text-lg font-extrabold leading-tight" style={{ color: 'var(--color-text)' }}>{kpi.value}</p>
                  {kpi.sub && <p className="text-[10px] font-medium" style={{ color: 'var(--color-muted)' }}>{kpi.sub}</p>}
                </div>
                <ChevronRight size={14} className="shrink-0" style={{ color: 'var(--color-muted)' }} />
              </div>
            )
          })}
        </div>

        {/* ── Charts Row ─────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Sales Revenue Trend */}
          <div className="lg:col-span-2 rounded-xl p-5 border flex flex-col justify-between"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-start justify-between mb-1">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 size={14} style={{ color: 'var(--color-muted)' }} />
                  <span className="text-xs font-bold" style={{ color: 'var(--color-muted)' }}>Sales Revenue Trend</span>
                </div>
                <p className="text-2xl font-extrabold mt-1" style={{ color: 'var(--color-text)' }}>
                  ${fmt(totalSales)}
                </p>
              </div>

              {/* Period Selector Tabs */}
              <div className="flex items-center gap-1 rounded-lg p-1" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
                {['24 hours', '7 days', '30 days', '12 Months'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setChartPeriod(p)}
                    className="px-2.5 py-1 rounded-md text-[11px] font-bold transition-all"
                    style={
                      chartPeriod === p
                        ? { background: '#BF4040', color: '#fff', boxShadow: '0 2px 6px rgba(191,64,64,0.3)' }
                        : { color: 'var(--color-muted)', background: 'transparent' }
                    }
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <RevenueTrendChart orders={orders} period={chartPeriod} />
          </div>

          {/* Right Column: Category Breakdown + Dining Zone */}
          <div className="space-y-4">
            {/* Category Donut */}
            <div className="rounded-xl p-4 border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>
                  CATEGORY BREAKDOWN
                </p>
                <button onClick={() => navigate('/categories')}
                  className="text-[10px] font-bold" style={{ color: '#BF4040', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Manage →
                </button>
              </div>
              <CategoryDonut orders={orders} categories={categories} />
            </div>

            {/* Live Floor Map */}
            <div className="rounded-xl p-4 border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <LayoutGrid size={12} style={{ color: 'var(--color-muted)' }} />
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>
                    LIVE DINING ZONE
                  </span>
                </div>
                <button onClick={() => navigate('/sessions')}
                  className="text-[10px] font-bold" style={{ color: '#BF4040', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Full Floor →
                </button>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {(tables.length > 0 ? tables : Array(10).fill(null)).slice(0, 10).map((t, i) => {
                  const status = t?.status || 'available'
                  const isOcc  = status === 'occupied'
                  const isCall = status === 'calling_waiter' || status === 'bill_requested'
                  return (
                    <div key={i} onClick={() => navigate('/sessions')}
                      className="aspect-square rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all"
                      style={{
                        background: isCall ? '#BF4040' : isOcc ? '#FFFBEB' : 'var(--color-card)',
                        color: isCall ? '#fff' : isOcc ? '#D97706' : 'var(--color-muted)',
                        border: `1px solid ${isCall ? '#8A2E2E' : isOcc ? '#FDE68A' : 'var(--color-border)'}`,
                      }}>
                      <span className="text-[10px] font-extrabold">{t?.table_number || i + 1}</span>
                      <span className="text-[7px] font-semibold uppercase" style={{ opacity: 0.7 }}>
                        {isCall ? 'CALL' : isOcc ? 'Busy' : 'Free'}
                      </span>
                    </div>
                  )
                })}
              </div>
              <div className="flex items-center gap-4 mt-2.5">
                {[
                  { bg: 'var(--color-card)', border: 'var(--color-border)', label: 'Free' },
                  { bg: '#FFFBEB', border: '#FDE68A', label: 'Busy' },
                  { bg: '#BF4040', border: '#8A2E2E', label: 'Calling' },
                ].map(l => (
                  <span key={l.label} className="flex items-center gap-1 text-[9px] font-semibold" style={{ color: 'var(--color-muted)' }}>
                    <span className="w-2 h-2 rounded-sm" style={{ background: l.bg, border: `1px solid ${l.border}` }} />{l.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom: Top Items + Recent Orders ─────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Top Selling Items */}
          <div className="rounded-xl overflow-hidden border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex items-center gap-2">
                <TrendingUp size={14} style={{ color: 'var(--color-muted)' }} />
                <span className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>Top Selling Items</span>
              </div>
              <button onClick={() => navigate('/products')}
                className="text-[10px] font-bold px-2.5 py-1 rounded-md border transition-all"
                style={{ color: 'var(--color-muted)', borderColor: 'var(--color-border)', background: 'none' }}>
                View Menu →
              </button>
            </div>
            <div>
              {topItems.length === 0 ? (
                <p className="py-10 text-center text-xs" style={{ color: 'var(--color-muted)' }}>
                  {loading ? 'Loading...' : 'No order data yet'}
                </p>
              ) : topItems.map(([name, cnt], i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5 border-b last:border-b-0 transition-all cursor-default"
                  style={{ borderColor: 'var(--color-border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-card-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <span className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-extrabold shrink-0"
                    style={{
                      background: i === 0 ? '#FEF3C7' : 'var(--color-card)',
                      color: i === 0 ? '#92400E' : 'var(--color-muted)',
                      border: `1px solid ${i === 0 ? '#FDE68A' : 'var(--color-border)'}`,
                    }}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: 'var(--color-text)' }}>{name}</p>
                    <div className="mt-1 h-[3px] rounded-full" style={{ background: 'var(--color-border)' }}>
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${(cnt / maxItemCount) * 100}%`, background: '#BF4040' }} />
                    </div>
                  </div>
                  <span className="text-xs font-extrabold shrink-0" style={{ color: 'var(--color-text)' }}>{cnt} sold</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="rounded-xl overflow-hidden border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex items-center gap-2">
                <Clock size={14} style={{ color: 'var(--color-muted)' }} />
                <span className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>Recent Orders</span>
              </div>
              <button onClick={() => navigate('/orders')}
                className="text-[10px] font-bold px-2.5 py-1 rounded-md border transition-all"
                style={{ color: 'var(--color-muted)', borderColor: 'var(--color-border)', background: 'none' }}>
                All Orders →
              </button>
            </div>
            <div>
              {recentOrders.length === 0 ? (
                <p className="py-10 text-center text-xs" style={{ color: 'var(--color-muted)' }}>
                  {loading ? 'Loading...' : 'No orders yet'}
                </p>
              ) : recentOrders.map((order, i) => {
                const s = String(order.status || 'pending').toLowerCase()
                const dotColor = STATUS_DOT[s] || '#F59E0B'
                return (
                  <div key={i} className="flex items-center gap-3 px-4 py-2.5 border-b last:border-b-0"
                    style={{ borderColor: 'var(--color-border)' }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-extrabold shrink-0"
                      style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
                      #{order.id}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>
                        {order.order_number || `ORD-${order.id}`}
                      </p>
                      <p className="text-[10px]" style={{ color: 'var(--color-muted)' }}>
                        {(order.items || order.order_items || []).length} items
                        {order.created_at && ` • ${new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-extrabold" style={{ color: 'var(--color-text)' }}>
                        ${(parseFloat(order.total_amount || order.subtotal) || 0).toFixed(2)}
                      </span>
                      <span className="w-2 h-2 rounded-full" style={{ background: dotColor }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Quick Nav Shortcuts ───────────────────── */}
        <div className="rounded-xl p-4 border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>Quick Operations & Management</p>
            {lowStock.length > 0 && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md cursor-pointer"
                onClick={() => navigate('/inventory')}
                style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>
                <AlertTriangle size={10} /> {lowStock.length} Low Stock Ingredients
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {[
              { label: 'Staff Accounts', sub: `${users.length} Users`,       icon: Users,    path: '/users',       color: '#8B5CF6' },
              { label: 'Roles Matrix',   sub: 'Access Matrix',               icon: Shield,   path: '/roles',       color: '#3B82F6' },
              { label: 'Add-on Groups',  sub: 'Menu Modifiers',              icon: Puzzle,   path: '/options',     color: '#EC4899' },
              { label: 'Raw Inventory',  sub: `${ingredients.length} Items`,icon: Leaf,     path: '/inventory',   color: '#10B981' },
              { label: 'Floor Sessions', sub: `${occupied.length} Active`,   icon: Bell,     path: '/sessions',    color: '#F59E0B' },
              { label: 'Detailed Reports',sub: 'Financial & ROI',            icon: BarChart3,path: '/analytics',   color: '#BF4040' },
            ].map(nav => {
              const Icon = nav.icon
              return (
                <button key={nav.label} onClick={() => navigate(nav.path)}
                  className="p-3 rounded-lg text-left border transition-all"
                  style={{ borderColor: 'var(--color-border)', background: 'var(--color-card)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = nav.color; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 4px 12px ${nav.color}18` }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-2"
                    style={{ background: `${nav.color}15` }}>
                    <Icon size={14} style={{ color: nav.color }} />
                  </div>
                  <p className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>{nav.label}</p>
                  <p className="text-[9px] mt-0.5" style={{ color: 'var(--color-muted)' }}>{nav.sub}</p>
                </button>
              )
            })}
          </div>
        </div>

      </div>
    </AdminLayout>
  )
}
