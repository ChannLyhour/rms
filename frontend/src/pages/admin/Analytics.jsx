import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import { adminApi } from '../../api/adminApi'
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Armchair,
  Users,
  ShieldCheck,
  Package,
  Layers,
  UtensilsCrossed,
  RotateCcw,
  Calendar,
  ArrowUpRight,
  Clock,
  Sparkles,
  AlertTriangle,
  ChevronRight,
  CheckCircle2,
  Receipt
} from 'lucide-react'
import toast from 'react-hot-toast'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/* ── Pure CSS Bar Chart for Sales Trend ── */
function RevenueBarChart({ orders, period }) {
  const chartData = useMemo(() => {
    const now = new Date()

    if (period === '24 hours') {
      // 24-hour hourly slots (every 2 hours)
      const hours = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22]
      return hours.map((hr) => {
        const matching = orders.filter((o) => {
          const d = new Date(o.created_at || o.CreatedAt)
          return d.toDateString() === now.toDateString() && d.getHours() >= hr && d.getHours() < hr + 2
        })
        const income = matching.reduce((s, o) => s + (parseFloat(o.total_amount || o.subtotal) || 0), 0)
        const expense = income * 0.45
        return { label: `${hr}:00`, income, expense, count: matching.length }
      })
    }

    if (period === '7 days') {
      // Last 7 days
      return Array.from({ length: 7 }).map((_, idx) => {
        const d = new Date()
        d.setDate(now.getDate() - (6 - idx))
        const dateStr = d.toDateString()
        const matching = orders.filter((o) => new Date(o.created_at || o.CreatedAt).toDateString() === dateStr)
        const income = matching.reduce((s, o) => s + (parseFloat(o.total_amount || o.subtotal) || 0), 0)
        const expense = income * 0.5
        return { label: DAYS_OF_WEEK[d.getDay()], income, expense, count: matching.length }
      })
    }

    if (period === '30 days') {
      // 4 Weekly buckets
      return ['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((lbl, idx) => {
        const matching = orders.filter((o) => {
          const d = new Date(o.created_at || o.CreatedAt)
          const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24))
          return diffDays >= (3 - idx) * 7 && diffDays < (4 - idx) * 7
        })
        const income = matching.reduce((s, o) => s + (parseFloat(o.total_amount || o.subtotal) || 0), 0)
        const expense = income * 0.48
        return { label: lbl, income, expense, count: matching.length }
      })
    }

    // Default: 12 Months
    return MONTHS.map((m, i) => {
      const matching = orders.filter((o) => {
        const d = new Date(o.created_at || o.CreatedAt)
        return d.getFullYear() === now.getFullYear() && d.getMonth() === i
      })
      const income = matching.reduce((s, o) => s + (parseFloat(o.total_amount || o.subtotal) || 0), 0)
      const expense = income * 0.52
      return { label: m, income, expense, isCurrent: i === now.getMonth(), count: matching.length }
    })
  }, [orders, period])

  const maxVal = Math.max(...chartData.map((d) => d.income), 10)
  const peakItem = useMemo(() => {
    return chartData.reduce((prev, curr) => (curr.income > prev.income ? curr : prev), chartData[0])
  }, [chartData])

  const barMaxW = period === '24 hours' ? 'max-w-[18px]' : period === '7 days' ? 'max-w-[44px]' : 'max-w-[32px]'
  const gridLevels = [1, 0.75, 0.5, 0.25, 0]

  return (
    <div className="flex-1 flex flex-col justify-between mt-3">
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
          {chartData.map((bar, i) => {
            const pct = maxVal > 0 ? (bar.income / maxVal) * 100 : 0
            const h = Math.max(pct, 0)
            const hasIncome = bar.income > 0

            return (
              <div key={bar.label + i} className="flex-1 h-full flex flex-col items-center justify-end group relative">
                {/* Tooltip on hover */}
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
                        ? 'linear-gradient(180deg, var(--color-500, #BF4040) 0%, var(--color-700, #8A2E2E) 100%)'
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
                    {hasIncome && (
                      <div className="w-full h-1 rounded-t-md opacity-40 bg-white" />
                    )}
                  </div>
                </div>

                {/* X-axis Label */}
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

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between border-t pt-3 mt-4 px-1 text-xs gap-3" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium text-[11px]" style={{ color: 'var(--color-text)' }}>
            <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600 shadow-sm" /> Gross Sales
          </span>
          <span className="flex items-center gap-1.5 font-medium text-[11px]" style={{ color: 'var(--color-muted)' }}>
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-600 shadow-sm" /> Current Period ({period})
          </span>
        </div>
        {peakItem && peakItem.income > 0 && (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-md"
            style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
            ⚡ Peak: <strong className="text-emerald-500 font-extrabold">{peakItem.label}</strong> (${peakItem.income.toFixed(2)})
          </span>
        )}
      </div>
    </div>
  )
}

/* ── SVG Donut Chart for Category Breakdown ── */
function CategoryDonutChart({ orders, categories }) {
  const data = useMemo(() => {
    const catMap = {}
    categories.forEach((c) => { catMap[c.id] = { name: c.name, amount: 0 } })

    let total = 0
    orders.forEach((o) => {
      ;(o.items || o.order_items || []).forEach((it) => {
        const catId = it.product?.category_id || it.category_id || 'other'
        const amt = (it.unit_price || it.price || 0) * (it.quantity || 1)
        if (!catMap[catId]) {
          catMap[catId] = { name: it.product?.category?.name || 'General', amount: 0 }
        }
        catMap[catId].amount += amt
        total += amt
      })
    })

    const list = Object.values(catMap).filter((c) => c.amount > 0)
    if (list.length === 0) {
      return { total: 1, segments: [{ name: 'All Menu', amount: 1, pct: 100, color: '#BF4040' }] }
    }

    const palette = ['#BF4040', '#10b981', '#f59e0b', '#6366f1', '#ec4899', '#06b6d4', '#8b5cf6']
    const segments = list.map((item, idx) => ({
      ...item,
      pct: total > 0 ? (item.amount / total) * 100 : 0,
      color: palette[idx % palette.length]
    }))

    return { total, segments }
  }, [orders, categories])

  const r = 40, cx = 50, cy = 50
  const circ = 2 * Math.PI * r
  let accumulatedDash = 0

  return (
    <div className="flex flex-col sm:flex-row items-center gap-5">
      {/* SVG Donut */}
      <div className="relative shrink-0">
        <svg width="120" height="120" viewBox="0 0 100 100" className="transform -rotate-90">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--color-border)" strokeWidth="12" />
          {data.segments.map((seg, i) => {
            const strokeDash = (seg.pct / 100) * circ
            const offset = circ - accumulatedDash
            accumulatedDash += strokeDash
            return (
              <circle
                key={seg.name + i}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth="12"
                strokeDasharray={`${strokeDash} ${circ - strokeDash}`}
                strokeDashoffset={offset}
                className="transition-all duration-700 hover:opacity-80"
              />
            )
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">Sales</span>
          <span className="text-xs font-mono font-bold" style={{ color: 'var(--color-text)' }}>
            ${data.total > 1 ? data.total.toFixed(0) : '0'}
          </span>
        </div>
      </div>

      {/* Breakdown Legend */}
      <div className="flex-1 space-y-1.5 w-full min-w-0">
        {data.segments.slice(0, 5).map((seg) => (
          <div key={seg.name} className="flex items-center justify-between text-xs py-0.5">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: seg.color }} />
              <span className="truncate font-medium" style={{ color: 'var(--color-text)' }}>{seg.name}</span>
            </div>
            <span className="font-mono font-semibold shrink-0 ml-2" style={{ color: 'var(--color-muted)' }}>
              {seg.pct.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Analytics() {
  const navigate = useNavigate()
  const [summary, setSummary]       = useState(null)
  const [orders, setOrders]         = useState([])
  const [tables, setTables]         = useState([])
  const [products, setProducts]     = useState([])
  const [categories, setCategories] = useState([])
  const [ingredients, setIngredients] = useState([])
  const [users, setUsers]           = useState([])
  const [loading, setLoading]       = useState(true)

  const [from, setFrom] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return d.toISOString().slice(0, 10)
  })
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10))
  const [chartPeriod, setChartPeriod] = useState('12 Months')

  /* ── Load all data from real backend APIs ── */
  const loadDashboardData = useCallback(async () => {
    setLoading(true)
    try {
      const [sumRes, ordRes, tblRes, prodRes, catRes, ingRes, usrRes] = await Promise.allSettled([
        adminApi.getSalesSummary(from, to),
        adminApi.getOrders({ limit: 250 }),
        adminApi.getTables(),
        adminApi.getProducts(),
        adminApi.getCategories(),
        adminApi.getIngredients ? adminApi.getIngredients() : Promise.resolve({ data: [] }),
        adminApi.getUsers ? adminApi.getUsers(1, 100) : Promise.resolve({ data: [] }),
      ])

      if (sumRes.status === 'fulfilled') setSummary(sumRes.value.data?.data || sumRes.value.data || null)
      if (ordRes.status === 'fulfilled') setOrders(ordRes.value.data?.data || ordRes.value.data || [])
      if (tblRes.status === 'fulfilled') setTables(tblRes.value.data?.data || tblRes.value.data || [])
      if (prodRes.status === 'fulfilled') setProducts(prodRes.value.data?.data || prodRes.value.data || [])
      if (catRes.status === 'fulfilled') setCategories(catRes.value.data?.data || catRes.value.data || [])
      if (ingRes.status === 'fulfilled') setIngredients(ingRes.value.data?.data || ingRes.value.data || [])
      if (usrRes.status === 'fulfilled') setUsers(usrRes.value.data?.data || usrRes.value.data || [])
    } catch {
      toast.error('Failed to refresh dashboard analytics')
    } finally {
      setLoading(false)
    }
  }, [from, to])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  /* ── Derived metrics ── */
  const totalGrossSales = useMemo(() => {
    if (summary?.total_revenue !== undefined) return Number(summary.total_revenue)
    return orders.reduce((sum, o) => sum + (parseFloat(o.total_amount || o.subtotal) || 0), 0)
  }, [summary, orders])

  const completedOrdersCount = useMemo(() => {
    if (summary?.order_count !== undefined) return summary.order_count
    return orders.filter((o) => ['completed', 'paid'].includes(String(o.status).toLowerCase())).length
  }, [summary, orders])

  const activeOrders = useMemo(() => {
    return orders.filter((o) => !['completed', 'cancelled', 'paid'].includes(String(o.status).toLowerCase()))
  }, [orders])

  const seatedTables = useMemo(() => {
    return tables.filter((t) => ['occupied', 'calling_waiter', 'bill_requested'].includes(t.status))
  }, [tables])

  const lowStockIngredients = useMemo(() => {
    return ingredients.filter((i) => (i.current_stock ?? 0) <= (i.min_stock_level ?? i.min_threshold ?? 10))
  }, [ingredients])

  // Cashier & Staff Sales Performance calculation
  const staffPerformance = useMemo(() => {
    const staffMap = {}

    // Initialize registered staff members
    users.forEach((u) => {
      staffMap[String(u.id)] = {
        id: u.id,
        username: u.username,
        name: u.full_name || u.username,
        role: u.role?.name || (typeof u.role === 'string' ? u.role : 'Staff'),
        totalOrders: 0,
        totalSales: 0,
        cashSales: 0,
        qrSales: 0,
        cardSales: 0,
        isCustomer: false,
      }
    })

    // QR Customer self-orders bucket
    const qrCustomerBucket = {
      id: 'qr_customer',
      username: 'QR Customer Self-Order',
      name: 'QR Self-Orders (Table Guests)',
      role: 'Customer QR',
      totalOrders: 0,
      totalSales: 0,
      cashSales: 0,
      qrSales: 0,
      cardSales: 0,
      isCustomer: true,
    }

    orders.forEach((ord) => {
      const isPaidOrCompleted = ['completed', 'paid'].includes(String(ord.status).toLowerCase())
      const amount = parseFloat(ord.total_amount || ord.subtotal) || 0
      const method = String(ord.payment_method || '').toLowerCase()
      const creatorId = ord.created_by || ord.CreatedBy

      let target = creatorId && staffMap[String(creatorId)] ? staffMap[String(creatorId)] : null

      if (!target) {
        if (!creatorId) {
          target = qrCustomerBucket
        } else {
          staffMap[String(creatorId)] = {
            id: creatorId,
            username: `Staff #${creatorId}`,
            name: `Staff #${creatorId}`,
            role: 'Cashier',
            totalOrders: 0,
            totalSales: 0,
            cashSales: 0,
            qrSales: 0,
            cardSales: 0,
            isCustomer: false,
          }
          target = staffMap[String(creatorId)]
        }
      }

      target.totalOrders += 1
      if (isPaidOrCompleted) {
        target.totalSales += amount
        if (method === 'cash') target.cashSales += amount
        else if (['qr_code', 'bakong', 'aba', 'khqr'].includes(method)) target.qrSales += amount
        else if (['card', 'credit_card', 'visa', 'mastercard'].includes(method)) target.cardSales += amount
      }
    })

    const list = [...Object.values(staffMap), qrCustomerBucket]
    return list.sort((a, b) => b.totalSales - a.totalSales)
  }, [users, orders])

  // Top Selling Products ranked from live order line items
  const topProducts = useMemo(() => {
    const countMap = {}
    orders.forEach((o) => {
      ;(o.items || o.order_items || []).forEach((it) => {
        const name = it.product?.name || it.name || it.title || 'Item'
        const qty = it.quantity || 1
        const price = it.unit_price || it.price || 0
        if (!countMap[name]) {
          countMap[name] = { name, count: 0, revenue: 0, img: it.product?.image_url || it.image_url }
        }
        countMap[name].count += qty
        countMap[name].revenue += price * qty
      })
    })

    const list = Object.values(countMap).sort((a, b) => b.count - a.count)
    if (list.length > 0) return list.slice(0, 5)

    // Fallback to active catalog products if no completed transactions yet
    return products.slice(0, 5).map((p) => ({
      name: p.name,
      count: 0,
      revenue: parseFloat(p.price || 0),
      img: p.image_url,
      isCatalogOnly: true
    }))
  }, [orders, products])

  const avgTicket = completedOrdersCount > 0 ? totalGrossSales / completedOrdersCount : 0

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-10 select-none">

        {/* ── 1. Top Header Row ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5" style={{ borderColor: 'var(--color-border)' }}>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--color-text)' }}>
                Analytics & Revenue Reports
              </h1>
              
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
              Real-time POS revenue streams, sales distribution, and table performance analytics.
            </p>
          </div>

          
        </div>

        {/* ── 2. Date Range Filter Toolbar ── */}
        <div
          className="p-3.5 rounded-[5px] border flex flex-wrap items-center justify-between gap-3 shadow-2xs"
          style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
        >
          {/* Quick Presets */}
          <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-[5px]">
            {['24 hours', '7 days', '30 days', '12 Months'].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setChartPeriod(p)}
                className={`px-3 py-1 rounded-[5px] text-xs font-bold transition-all cursor-pointer ${
                  chartPeriod === p
                    ? 'bg-white dark:bg-zinc-800 text-[var(--color-text)] shadow-xs'
                    : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Date Picker Range Inputs */}
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-[var(--color-muted)] font-semibold mr-1">
              <Calendar size={14} className="text-amber-500" />
              <span>Range:</span>
            </div>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="px-2.5 py-1.5 rounded-[5px] text-xs border outline-none font-medium"
              style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            />
            <span style={{ color: 'var(--color-muted)' }}>—</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="px-2.5 py-1.5 rounded-[5px] text-xs border outline-none font-medium"
              style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            />
            <button
              type="button"
              onClick={loadDashboardData}
              disabled={loading}
              className="px-3 py-1.5 rounded-[5px] font-bold text-white text-xs shadow-xs transition-all hover:opacity-90 active:scale-95 cursor-pointer disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, var(--color-500, #BF4040), var(--color-600, #9D3434))' }}
            >
              Apply
            </button>
          </div>
        </div>

        {/* ── 3. Top 4 Metric Stat Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Gross Sales */}
          <div
            className="rounded-[5px] p-4 border flex items-center gap-3.5 shadow-2xs hover:shadow-xs transition-all"
            style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
          >
            <div className="w-11 h-11 rounded-[5px] flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
              <DollarSign size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)]">Gross Revenue</p>
              <p className="text-xl font-extrabold font-mono tracking-tight" style={{ color: 'var(--color-text)' }}>
                ${totalGrossSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Card 2: Completed Orders */}
          <div
            className="rounded-[5px] p-4 border flex items-center gap-3.5 shadow-2xs hover:shadow-xs transition-all"
            style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
          >
            <div className="w-11 h-11 rounded-[5px] flex items-center justify-center shrink-0 text-red-500 bg-red-500/10 border border-red-500/20">
              <ShoppingBag size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)]">Completed Orders</p>
              <p className="text-xl font-extrabold font-mono tracking-tight" style={{ color: 'var(--color-text)' }}>
                {completedOrdersCount} <span className="text-xs font-normal text-[var(--color-muted)]">({activeOrders.length} active)</span>
              </p>
            </div>
          </div>

          {/* Card 3: Tables Seated */}
          <div
            className="rounded-[5px] p-4 border flex items-center gap-3.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
            onClick={() => navigate('/tables')}
            style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
          >
            <div className="w-11 h-11 rounded-[5px] flex items-center justify-center shrink-0 text-amber-500 bg-amber-500/10 border border-amber-500/20">
              <Armchair size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)]">Tables Seated</p>
                <ArrowUpRight size={13} className="text-[var(--color-muted)] group-hover:text-amber-500 transition-colors" />
              </div>
              <p className="text-xl font-extrabold font-mono tracking-tight" style={{ color: 'var(--color-text)' }}>
                {seatedTables.length} / {tables.length || 0}
              </p>
            </div>
          </div>

          {/* Card 4: Average Ticket Value */}
          <div
            className="rounded-[5px] p-4 border flex items-center gap-3.5 shadow-2xs hover:shadow-xs transition-all"
            style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
          >
            <div className="w-11 h-11 rounded-[5px] flex items-center justify-center shrink-0 text-indigo-500 bg-indigo-500/10 border border-indigo-500/20">
              <TrendingUp size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)]">Average Ticket</p>
              <p className="text-xl font-extrabold font-mono tracking-tight" style={{ color: 'var(--color-text)' }}>
                ${avgTicket.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* ── 4. Main Section: Revenue Chart (Left) + Top Selling / Mini Maps (Right) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Left 2-Cols: Revenue Bar Chart & Overview */}
          <div
            className="lg:col-span-2 rounded-[5px] p-5 border shadow-2xs space-y-4"
            style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
                  Sales Revenue Trend
                </h2>
                <p className="text-[11px] text-[var(--color-muted)]">
                  Periodic gross revenue compared with estimated food costs ({chartPeriod})
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)] block">Total in view</span>
                <span className="text-base font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                  ${totalGrossSales.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Render Bar Chart */}
            <RevenueBarChart orders={orders} period={chartPeriod} />
          </div>

          {/* Right 1-Col: Category Donut & Live Floor Mini-Map */}
          <div className="space-y-4">
            {/* Sales Distribution Donut */}
            <div
              className="rounded-[5px] p-4 border shadow-2xs space-y-3"
              style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
            >
              <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'var(--color-border-subtle)' }}>
                <h3 className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--color-text)' }}>
                  Category Breakdown
                </h3>
                <span className="text-[10px] font-mono text-[var(--color-muted)]">{categories.length} categories</span>
              </div>

              <CategoryDonutChart orders={orders} categories={categories} />
            </div>

            {/* Floor Map Mini-Card */}
            <div
              className="rounded-[5px] p-4 border shadow-2xs space-y-3"
              style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
            >
              <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'var(--color-border-subtle)' }}>
                <h3 className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--color-text)' }}>
                  Live Dining Zone
                </h3>
                <button
                  type="button"
                  onClick={() => navigate('/tables')}
                  className="text-[11px] font-semibold text-red-500 hover:underline cursor-pointer flex items-center gap-0.5"
                >
                  Full Floor <ChevronRight size={12} />
                </button>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5">
                {(tables.length > 0 ? tables : Array(10).fill(null)).slice(0, 10).map((t, idx) => {
                  const status = t?.status || 'available'
                  const isBusy = status === 'occupied'
                  const isCall = status === 'calling_waiter' || status === 'bill_requested'

                  return (
                    <div
                      key={t?.id || idx}
                      onClick={() => navigate('/tables')}
                      className="aspect-square rounded-[5px] border flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:scale-105"
                      style={{
                        background: isCall
                          ? 'rgba(239, 68, 68, 0.15)'
                          : isBusy
                          ? 'rgba(245, 158, 11, 0.15)'
                          : 'var(--color-bg)',
                        borderColor: isCall ? '#ef4444' : isBusy ? '#f59e0b' : 'var(--color-border)',
                        color: isCall ? '#ef4444' : isBusy ? '#f59e0b' : 'var(--color-muted)'
                      }}
                      title={`Table ${t?.table_number || idx + 1}: ${status}`}
                    >
                      <span className="text-[10px] font-black">{t?.table_number || `T${idx + 1}`}</span>
                      <span className="text-[8px] font-bold uppercase">{isCall ? 'CALL' : isBusy ? 'BUSY' : 'FREE'}</span>
                    </div>
                  )
                })}
              </div>

              <div className="flex items-center justify-between text-[10px] text-[var(--color-muted)] pt-1 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700" /> Free</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Busy</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Calling</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 5. Cashier & User Role Daily Sales Performance ── */}
        <div
          className="rounded-[5px] border overflow-hidden shadow-2xs space-y-4 p-5"
          style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3" style={{ borderColor: 'var(--color-border-subtle)' }}>
            <div>
              <div className="flex items-center gap-2">
                <Users size={16} className="text-indigo-500" />
                <h2 className="text-sm font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
                  Cashier &amp; Staff Shift Sales Performance
                </h2>
              
              </div>
              <p className="text-[11px] text-[var(--color-muted)] mt-0.5">
                Daily sales collected, ticket volumes, and payment channel breakdown by operator
              </p>
            </div>

            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
              Total Recorded: ${totalGrossSales.toFixed(2)}
            </span>
          </div>

          {/* Full Staff Breakdown Table */}
          <div className="overflow-x-auto border rounded-[5px]" style={{ borderColor: 'var(--color-border)' }}>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b text-[11px] font-semibold" style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}>
                  <th className="py-2.5 px-4 font-bold">Staff Member / Operator</th>
                  <th className="py-2.5 px-4 font-bold text-center">User Role</th>
                  <th className="py-2.5 px-4 font-bold text-center">Orders Handled</th>
                  <th className="py-2.5 px-4 font-bold text-right">Cash Drawer</th>
                  <th className="py-2.5 px-4 font-bold text-right">KHQR / Digital</th>
                  <th className="py-2.5 px-4 font-bold text-right">Card Terminal</th>
                  <th className="py-2.5 px-4 font-bold text-right">Total Gross Sales</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--color-border-subtle)' }}>
                {staffPerformance.map((st) => (
                  <tr key={st.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-[4px] flex items-center justify-center font-bold text-xs text-white shrink-0"
                          style={{
                            background: st.isCustomer ? '#6366f1' : 'linear-gradient(135deg, var(--color-500, #BF4040), var(--color-700, #8A2E2E))'
                          }}
                        >
                          {st.username.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold" style={{ color: 'var(--color-text)' }}>{st.name}</p>
                          <span className="text-[10px] text-[var(--color-muted)]">@{st.username}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase ${
                        st.role.toLowerCase() === 'admin'
                          ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                          : st.role.toLowerCase() === 'cashier'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20'
                      }`}>
                        {st.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono font-bold" style={{ color: 'var(--color-text)' }}>
                      {st.totalOrders} tickets
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-[var(--color-text)]">
                      ${st.cashSales.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-red-500 font-medium">
                      ${st.qrSales.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-indigo-500 font-medium">
                      ${st.cardSales.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                      ${st.totalSales.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 6. Bottom Section: Top Selling Items Table + Quick Navigation Shortcuts ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Top Selling Products Table (2-Cols) */}
          <div
            className="lg:col-span-2 rounded-[5px] border overflow-hidden shadow-2xs"
            style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
          >
            <div className="px-4 py-3 border-b flex items-center justify-between" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-amber-500" />
                <h3 className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>Top Performing Menu Items</h3>
              </div>
              <button
                type="button"
                onClick={() => navigate('/products')}
                className="text-xs font-semibold text-red-500 hover:underline cursor-pointer flex items-center gap-1"
              >
                View Catalog <ArrowUpRight size={12} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b text-[11px] font-semibold" style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}>
                    <th className="py-2.5 px-4 font-bold">Item Name</th>
                    <th className="py-2.5 px-4 font-bold text-center">Volume Sold</th>
                    <th className="py-2.5 px-4 font-bold text-right">Revenue</th>
                    <th className="py-2.5 px-4 font-bold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--color-border-subtle)' }}>
                  {topProducts.map((p, idx) => (
                    <tr key={p.name + idx} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {p.img ? (
                            <img src={p.img} alt={p.name} className="w-8 h-8 rounded-[5px] object-cover border shrink-0" style={{ borderColor: 'var(--color-border)' }} />
                          ) : (
                            <div className="w-8 h-8 rounded-[5px] flex items-center justify-center shrink-0 font-bold text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              <UtensilsCrossed size={14} />
                            </div>
                          )}
                          <div>
                            <p className="font-bold" style={{ color: 'var(--color-text)' }}>{p.name}</p>
                            <span className="text-[10px] text-[var(--color-muted)]">Rank #{idx + 1} Best-seller</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold" style={{ color: 'var(--color-text)' }}>
                        {p.count} units
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                        ${p.revenue.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-[5px] text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Management Shortcuts (1-Col) */}
          <div className="space-y-4">
            {/* Low stock notice */}
            {lowStockIngredients.length > 0 && (
              <div
                className="p-3.5 rounded-[5px] border flex items-center justify-between cursor-pointer bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-200"
                onClick={() => navigate('/inventory')}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <AlertTriangle size={16} className="text-amber-500 shrink-0" />
                  <span className="text-xs font-bold truncate">{lowStockIngredients.length} Ingredients Low on Stock</span>
                </div>
                <ChevronRight size={14} />
              </div>
            )}

            {/* Quick module launch grid */}
            <div
              className="rounded-[5px] p-4 border shadow-2xs space-y-3"
              style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
            >
              <h3 className="text-xs font-bold uppercase tracking-wide border-b pb-2" style={{ color: 'var(--color-text)', borderColor: 'var(--color-border-subtle)' }}>
                System Quick Access
              </h3>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'POS Terminal', path: '/pos', icon: UtensilsCrossed, color: '#10b981' },
                  { label: 'Orders & Sales', path: '/orders', icon: Receipt, color: '#BF4040' },
                  { label: 'Dining Tables', path: '/tables', icon: Armchair, color: '#f59e0b' },
                  { label: 'Menu Catalog', path: '/products', icon: Layers, color: '#6366f1' },
                  { label: 'Staff Accounts', path: '/users', icon: Users, color: '#8b5cf6' },
                  { label: 'Role Permissions', path: '/roles', icon: ShieldCheck, color: '#ec4899' },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => navigate(item.path)}
                      className="p-2.5 rounded-[5px] border flex items-center gap-2 text-left transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 cursor-pointer shadow-2xs"
                      style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
                    >
                      <div className="w-6 h-6 rounded-[4px] flex items-center justify-center shrink-0 text-white" style={{ background: item.color }}>
                        <Icon size={12} />
                      </div>
                      <span className="text-xs font-bold truncate" style={{ color: 'var(--color-text)' }}>
                        {item.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

        </div>

      </div>
    </AdminLayout>
  )
}

