import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import CashierLayout from '../../components/layout/CashierLayout'
import { useAuth } from '../../context/AuthContext'
import { posApi } from '../../api/posApi'
import { adminApi } from '../../api/adminApi'
import { useWebSocket } from '../../hooks/useWebSocket'
import {
  DollarSign,
  ShoppingBag,
  Store,
  ChefHat,
  Receipt,
  UtensilsCrossed,
  Clock,
  ArrowUpRight,
  RotateCcw,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  CreditCard,
  QrCode,
  Banknote,
  Plus,
  Users,
  Bell,
  ArrowRight,
  TrendingUp,
  Flame,
  Calendar,
  UserCheck,
  Filter,
  ShieldAlert,
  Check
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function DashboardCashier() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { subscribe } = useWebSocket('cashier')

  const [loading, setLoading] = useState(true)
  const [tables, setTables] = useState([])
  const [sessions, setSessions] = useState([])
  const [orders, setOrders] = useState([])
  const [staffList, setStaffList] = useState([])
  const [currentTime, setCurrentTime] = useState(new Date())

  // Data Scope Filter: 'my' (created_by current user) | 'all' (all creators) | specific userId
  const [creatorFilter, setCreatorFilter] = useState('my')
  const [filterTab, setFilterTab] = useState('all') // 'all' | 'calling' | 'bill'

  const [liveServiceCalls, setLiveServiceCalls] = useState([])

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Fetch all cashier operations data & staff accounts
  const loadData = useCallback(async (showToast = false) => {
    setLoading(true)
    try {
      const todayStr = new Date().toISOString().slice(0, 10)
      const isAdmin = user?.role?.name === 'admin' || user?.role === 'admin'

      const fetchOrdersPromise = posApi.getAllOrders
        ? posApi.getAllOrders({ limit: 150, from: todayStr }).catch(() => adminApi.getOrders({ limit: 150, from: todayStr }))
        : adminApi.getOrders({ limit: 150, from: todayStr })

      const fetchUsersPromise = isAdmin && adminApi.getUsers
        ? adminApi.getUsers(1, 50).catch(() => ({ data: [] }))
        : Promise.resolve({ data: [] })

      const [tblRes, sessRes, ordRes, usrRes] = await Promise.allSettled([
        posApi.getTables(),
        posApi.getActiveSessions ? posApi.getActiveSessions() : adminApi.getSessions(),
        fetchOrdersPromise,
        fetchUsersPromise
      ])

      if (tblRes.status === 'fulfilled') {
        setTables(tblRes.value.data?.data || tblRes.value.data || [])
      }
      if (sessRes.status === 'fulfilled') {
        const sessList = sessRes.value.data?.data || sessRes.value.data || []
        setSessions(Array.isArray(sessList) ? sessList : [])
      }
      if (ordRes.status === 'fulfilled') {
        const ordList = ordRes.value.data?.data || ordRes.value.data || []
        setOrders(Array.isArray(ordList) ? ordList : [])
      }
      if (usrRes.status === 'fulfilled') {
        const uList = usrRes.value.data?.data || usrRes.value.data || []
        setStaffList(Array.isArray(uList) ? uList : [])
      }

      if (showToast) toast.success('Cashier dashboard updated')
    } catch {
      toast.error('Failed to load live cashier data')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadData()
  }, [loadData])

  const dismissCall = (id) => {
    setLiveServiceCalls((prev) => prev.filter((c) => c.id !== id))
  }

  const handleApproveOrder = async (orderId) => {
    try {
      await posApi.updateOrderStatus(orderId, 'confirmed')
      toast.success('Order approved & sent to Kitchen! 👨‍🍳')
      loadData(false)
    } catch {
      toast.error('Failed to approve order')
    }
  }

  // WebSocket Real-time subscriptions
  useEffect(() => {
    const unsubNewOrder = subscribe('new_order', () => {
      loadData(false)
      toast('🔔 New Order received at counter!', { icon: '🍽️' })
    })
    const unsubOrderUpdated = subscribe('order_updated', () => loadData(false))
    const unsubSessionClosed = subscribe('session_closed', () => loadData(false))
    const unsubCallCashier = subscribe('call_cashier', (data) => {
      loadData(false)
      const newCall = {
        id: Date.now() + Math.random(),
        table_number: data?.table_number || 'Guest',
        table_id: data?.table_id,
        title: data?.title || 'Service Requested',
        service_type: data?.service_type || 'waiter',
        time: data?.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setLiveServiceCalls((prev) => [newCall, ...prev.slice(0, 9)])
      toast.custom(
        (t) => (
          <div className={`${t.visible ? 'animate-bounce' : ''} bg-amber-500 text-white font-bold p-3.5 rounded-xl shadow-2xl flex items-center gap-2.5 border border-amber-400`}>
            <Bell size={20} className="animate-pulse" />
            <div>
              <p className="text-xs font-black">Table {data?.table_number || 'Guest'} Service Call!</p>
              <p className="text-[11px] opacity-90">{data?.title || 'Customer needs assistance'}</p>
            </div>
          </div>
        ),
        { duration: 6000 }
      )
    })

    return () => {
      unsubNewOrder?.()
      unsubOrderUpdated?.()
      unsubSessionClosed?.()
      unsubCallCashier?.()
    }
  }, [subscribe, loadData])

  // Helper to map created_by ID to staff name
  const getStaffName = useCallback((createdById) => {
    if (!createdById) return 'QR Self-Order'
    if (user && String(createdById) === String(user.id)) return `${user.username} (You)`
    const found = staffList.find((s) => String(s.id) === String(createdById))
    return found ? found.username : `Staff #${createdById}`
  }, [user, staffList])

  // Filter orders by created_by or accepted_by
  const filteredOrders = useMemo(() => {
    if (creatorFilter === 'all') return orders
    if (creatorFilter === 'my') {
      if (!user?.id) return orders
      return orders.filter((o) => 
        String(o.created_by || o.CreatedBy) === String(user.id) ||
        String(o.accepted_by || o.AcceptedBy) === String(user.id)
      )
    }
    return orders.filter((o) => 
      String(o.created_by || o.CreatedBy) === String(creatorFilter) ||
      String(o.accepted_by || o.AcceptedBy) === String(creatorFilter)
    )
  }, [orders, creatorFilter, user])

  // Filter sessions by created_by
  const filteredSessions = useMemo(() => {
    const activeOnly = sessions.filter((s) => s.status === 'active' || s.status === 'open')
    if (creatorFilter === 'all') return activeOnly
    if (creatorFilter === 'my') {
      if (!user?.id) return activeOnly
      return activeOnly.filter((s) => String(s.created_by || s.CreatedBy) === String(user.id))
    }
    return activeOnly.filter((s) => String(s.created_by || s.CreatedBy) === String(creatorFilter))
  }, [sessions, creatorFilter, user])

  // Active Sessions & Table Calculations
  const activeSessionsList = filteredSessions

  const totalUnbilledAmount = useMemo(() => {
    return activeSessionsList.reduce((acc, sess) => {
      const sessOrders = sess.orders || (orders.filter(o => o.table_session_id === sess.id)) || []
      const sum = sessOrders.reduce((oSum, o) => oSum + (parseFloat(o.total_amount || o.subtotal) || 0), 0)
      return acc + sum
    }, 0)
  }, [activeSessionsList, orders])

  const todayCompletedOrders = useMemo(() => {
    return filteredOrders.filter((o) => ['completed', 'paid'].includes(String(o.status).toLowerCase()))
  }, [filteredOrders])

  const todayGrossSales = useMemo(() => {
    return todayCompletedOrders.reduce((sum, o) => sum + (parseFloat(o.total_amount || o.subtotal) || 0), 0)
  }, [todayCompletedOrders])

  const pendingKitchenOrders = useMemo(() => {
    return filteredOrders.filter((o) => ['pending', 'cooking', 'ready'].includes(String(o.status).toLowerCase()))
  }, [filteredOrders])

  // Filtered Tables
  const filteredActiveSessions = useMemo(() => {
    if (filterTab === 'calling') {
      return activeSessionsList.filter((s) => s.table?.status === 'calling_waiter')
    }
    if (filterTab === 'bill') {
      return activeSessionsList.filter((s) => s.table?.status === 'bill_requested')
    }
    return activeSessionsList
  }, [activeSessionsList, filterTab])

  // Payment Breakdown Summary
  const paymentBreakdown = useMemo(() => {
    let cash = 0
    let qr = 0
    let card = 0

    todayCompletedOrders.forEach((o) => {
      const amt = parseFloat(o.total_amount || o.subtotal) || 0
      const method = String(o.payment_method || o.payment_type || '').toLowerCase()

      if (['qr_code', 'bakong', 'aba', 'khqr', 'qr', 'promptpay'].includes(method)) {
        qr += amt
      } else if (['card', 'credit_card', 'visa', 'mastercard', 'stripe'].includes(method)) {
        card += amt
      } else {
        // Default to cash drawer for in-person settled orders
        cash += amt
      }
    })

    return { cash, qr, card }
  }, [todayCompletedOrders])

  return (
    <CashierLayout>
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 max-w-7xl mx-auto w-full select-none">

        {/* ── 1. Cashier Hero Header with created_by Filter Toggle ── */}
        <div
          className="rounded-[5px] p-5 border shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4"
          style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center gap-3.5">
            <div
              className="w-12 h-12 rounded-[5px] flex items-center justify-center font-extrabold text-lg text-white shadow-sm shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--color-500, #BF4040), var(--color-700, #8A2E2E))' }}
            >
              {user?.username?.charAt(0)?.toUpperCase() || 'C'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight" style={{ color: 'var(--color-text)' }}>
                  Cashier 
                </h1>
                
              </div>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                Operator: <span className="font-bold text-[var(--color-text)]">{user?.username || 'Cashier'}</span> (ID: #{user?.id || '—'})
              </p>
            </div>
          </div>

          {/* Quick Toolbar & Live Clock */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div
              className="px-3.5 py-1.5 rounded-[5px] border flex items-center gap-2 text-xs font-mono font-bold"
              style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            >
              <Clock size={14} className="text-amber-500" />
              <span>{currentTime.toLocaleTimeString()}</span>
            </div>

            <button
              type="button"
              onClick={() => loadData(true)}
              disabled={loading}
              className="p-2 rounded-[5px] border text-xs font-semibold transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 cursor-pointer shadow-2xs"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              title="Refresh Data"
            >
              <RotateCcw size={15} className={loading ? 'animate-spin text-amber-500' : ''} />
            </button>

            <button
              type="button"
              onClick={() => navigate('/pos')}
              className="px-3.5 py-2 rounded-[5px] text-xs font-bold text-white shadow-xs transition-all hover:opacity-90 active:scale-95 cursor-pointer flex items-center gap-1.5"
              style={{ background: 'linear-gradient(135deg, var(--color-500, #BF4040), var(--color-600, #9D3434))' }}
            >
              <UtensilsCrossed size={14} />
              <span>Open POS Order</span>
            </button>
          </div>
        </div>

        {/* ── 2. Data Scope Filter Bar (created_by Filter) ── */}
        <div
          className="p-3 rounded-[5px] border flex flex-wrap items-center justify-between gap-3 shadow-2xs"
          style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)]">
              Data Scope (Created By):
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Scope Quick Buttons */}
            <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-[5px] text-xs">
              <button
                type="button"
                onClick={() => setCreatorFilter('my')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-[4px] font-bold transition-all cursor-pointer ${
                  creatorFilter === 'my'
                    ? 'bg-white dark:bg-zinc-800 text-[var(--color-text)] shadow-xs'
                    : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                <UserCheck size={13} />
                <span>My Shift ({user?.username || 'Me'})</span>
              </button>

              <button
                type="button"
                onClick={() => setCreatorFilter('all')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-[4px] font-bold transition-all cursor-pointer ${
                  creatorFilter === 'all'
                    ? 'bg-white dark:bg-zinc-800 text-[var(--color-text)] shadow-xs'
                    : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                <Users size={13} />
                <span>All Station Activity</span>
              </button>
            </div>

            {/* Specific Staff Select (Optional for managers/admins) */}
            {staffList.length > 0 && (
              <select
                value={creatorFilter}
                onChange={(e) => setCreatorFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-[5px] text-xs border outline-none font-medium cursor-pointer"
                style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              >
                <option value="my">Filter: My Account ({user?.username})</option>
                <option value="all">Filter: All Users &amp; QR Orders</option>
                {staffList.map((s) => (
                  <option key={s.id} value={String(s.id)}>
                    Staff: {s.username} (#{s.id})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* ── 3. Top 4 Live KPI Cards (Filtered by created_by) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Today's Gross Sales */}
          <div
            className="rounded-[5px] p-4 border shadow-2xs flex items-center gap-3.5 transition-all"
            style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
          >
            <div className="w-11 h-11 rounded-[5px] flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
              <DollarSign size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)]">
                {creatorFilter === 'my' ? 'My Collected Sales' : 'Today Collected'}
              </p>
              <p className="text-xl font-extrabold font-mono tracking-tight" style={{ color: 'var(--color-text)' }}>
                ${todayGrossSales.toFixed(2)}
              </p>
              <span className="text-[10px] text-[var(--color-muted)] font-medium">
                {todayCompletedOrders.length} Paid tickets ({creatorFilter === 'my' ? 'My Shift' : 'All'})
              </span>
            </div>
          </div>

          {/* Card 2: Active Dining Sessions */}
          <div
            className="rounded-[5px] p-4 border shadow-2xs flex items-center gap-3.5 transition-all cursor-pointer group"
            onClick={() => navigate('/sessions')}
            style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
          >
            <div className="w-11 h-11 rounded-[5px] flex items-center justify-center shrink-0 text-amber-500 bg-amber-500/10 border border-amber-500/20">
              <Store size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)]">
                  {creatorFilter === 'my' ? 'My Open Sessions' : 'Live Sessions'}
                </p>
                <ArrowUpRight size={13} className="text-[var(--color-muted)] group-hover:text-amber-500 transition-colors" />
              </div>
              <p className="text-xl font-extrabold font-mono tracking-tight" style={{ color: 'var(--color-text)' }}>
                {activeSessionsList.length} <span className="text-xs font-normal text-[var(--color-muted)]">Tables</span>
              </p>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                ${totalUnbilledAmount.toFixed(2)} running tab
              </span>
            </div>
          </div>

          {/* Card 3: Kitchen Orders in Progress */}
          <div
            className="rounded-[5px] p-4 border shadow-2xs flex items-center gap-3.5 transition-all cursor-pointer group"
            onClick={() => navigate('/kds')}
            style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
          >
            <div className="w-11 h-11 rounded-[5px] flex items-center justify-center shrink-0 text-indigo-500 bg-indigo-500/10 border border-indigo-500/20">
              <ChefHat size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)]">Kitchen In-Flight</p>
                <ArrowUpRight size={13} className="text-[var(--color-muted)] group-hover:text-indigo-500 transition-colors" />
              </div>
              <p className="text-xl font-extrabold font-mono tracking-tight" style={{ color: 'var(--color-text)' }}>
                {pendingKitchenOrders.length} <span className="text-xs font-normal text-[var(--color-muted)]">Orders</span>
              </p>
              <span className="text-[10px] text-indigo-500 font-medium">Cooking &amp; Prep</span>
            </div>
          </div>

          {/* Card 4: Quick Table Navigation */}
          <div
            className="rounded-[5px] p-4 border shadow-2xs flex items-center gap-3.5 transition-all cursor-pointer group"
            onClick={() => navigate('/tables')}
            style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
          >
            <div className="w-11 h-11 rounded-[5px] flex items-center justify-center shrink-0 text-rose-500 bg-rose-500/10 border border-rose-500/20">
              <Users size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)]">Total Tables</p>
                <ArrowUpRight size={13} className="text-[var(--color-muted)] group-hover:text-rose-500 transition-colors" />
              </div>
              <p className="text-xl font-extrabold font-mono tracking-tight" style={{ color: 'var(--color-text)' }}>
                {tables.length} <span className="text-xs font-normal text-[var(--color-muted)]">Capacity</span>
              </p>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                {tables.filter(t => t.status === 'available').length} Free tables
              </span>
            </div>
          </div>
        </div>

        {/* ── Real-Time Table Assistance / Bill Request Calls ── */}
        {liveServiceCalls.length > 0 && (
          <div
            className="rounded-[5px] p-3.5 border shadow-xs bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-100 space-y-2.5 animate-in fade-in"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-amber-500 animate-bounce" />
                <h3 className="text-xs font-black uppercase tracking-wide">
                  Live Table Service Alerts ({liveServiceCalls.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setLiveServiceCalls([])}
                className="text-[11px] font-bold text-amber-700 dark:text-amber-300 hover:underline cursor-pointer"
              >
                Clear All
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {liveServiceCalls.map((call) => (
                <div
                  key={call.id}
                  className="p-2.5 rounded-[4px] bg-white dark:bg-zinc-800 border border-amber-500/20 shadow-2xs flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-xs text-amber-600 dark:text-amber-400">
                        Table {call.table_number}
                      </span>
                      <span className="text-[10px] text-[var(--color-muted)] font-mono">{call.time}</span>
                    </div>
                    <p className="text-[11px] font-medium truncate text-[var(--color-text)]">
                      {call.title}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        dismissCall(call.id)
                        navigate('/sessions')
                      }}
                      className="px-2 py-1 rounded-[3px] text-[10px] font-bold bg-amber-500 text-white hover:bg-amber-600 transition-all cursor-pointer"
                    >
                      Attend
                    </button>
                    <button
                      type="button"
                      onClick={() => dismissCall(call.id)}
                      className="px-1.5 py-1 rounded-[3px] text-[10px] text-[var(--color-muted)] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                      title="Dismiss"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 4. Main Content Grid: Live Active Tables (Left) + Payment Breakdown & Orders (Right) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Left Column (2-Cols): Active Table Sessions with Direct Checkout Actions */}
          <div
            className="lg:col-span-2 rounded-[5px] border shadow-2xs flex flex-col overflow-hidden"
            style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
          >
            {/* Header & Filter Tabs */}
            <div
              className="px-4 py-3 border-b flex flex-wrap items-center justify-between gap-3"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <div className="flex items-center gap-2">
                <Store size={16} className="text-amber-500" />
                <h2 className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--color-text)' }}>
                  Active Dining Sessions ({activeSessionsList.length})
                </h2>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-[5px] text-xs">
                <button
                  type="button"
                  onClick={() => setFilterTab('all')}
                  className={`px-2.5 py-1 rounded-[4px] font-bold transition-all cursor-pointer ${
                    filterTab === 'all'
                      ? 'bg-white dark:bg-zinc-800 text-[var(--color-text)] shadow-xs'
                      : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
                  }`}
                >
                  All ({activeSessionsList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('calling')}
                  className={`px-2.5 py-1 rounded-[4px] font-bold transition-all cursor-pointer ${
                    filterTab === 'calling'
                      ? 'bg-red-500 text-white shadow-xs'
                      : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
                  }`}
                >
                  Calling Staff
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('bill')}
                  className={`px-2.5 py-1 rounded-[4px] font-bold transition-all cursor-pointer ${
                    filterTab === 'bill'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
                  }`}
                >
                  Bill Requested
                </button>
              </div>
            </div>

            {/* Table Cards Grid */}
            <div className="p-4 flex-1">
              {filteredActiveSessions.length === 0 ? (
                <div className="h-56 flex flex-col items-center justify-center text-center p-6 space-y-2">
                  <div className="w-12 h-12 rounded-[5px] bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-[var(--color-muted)]">
                    <Store size={24} />
                  </div>
                  <p className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>No Active Dining Sessions</p>
                  <p className="text-[11px] text-[var(--color-muted)] max-w-xs">
                    {creatorFilter === 'my'
                      ? 'No active sessions opened by your account. Switch scope to "All Station Activity" to see other tables.'
                      : 'All tables are currently free. Open a new session from the Table Floor or POS screen.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/sessions')}
                    className="mt-2 px-3 py-1.5 rounded-[5px] text-xs font-bold text-white shadow-xs bg-amber-500 hover:bg-amber-600 transition-all cursor-pointer"
                  >
                    Go to Table Floor →
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredActiveSessions.map((sess) => {
                    const sessOrders = sess.orders || (orders.filter(o => o.table_session_id === sess.id)) || []
                    const subtotal = sessOrders.reduce((sum, o) => sum + (parseFloat(o.total_amount || o.subtotal) || 0), 0)
                    const isCalling = sess.table?.status === 'calling_waiter'
                    const isBill = sess.table?.status === 'bill_requested'
                    const creatorName = getStaffName(sess.created_by || sess.CreatedBy)

                    return (
                      <div
                        key={sess.id}
                        className="rounded-[5px] p-3.5 border shadow-2xs flex flex-col justify-between gap-3 transition-all hover:border-amber-500/40"
                        style={{
                          background: isCalling ? 'rgba(239, 68, 68, 0.04)' : isBill ? 'rgba(245, 158, 11, 0.04)' : 'var(--color-bg)',
                          borderColor: isCalling ? '#ef4444' : isBill ? '#f59e0b' : 'var(--color-border)'
                        }}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-1 rounded-[4px] text-xs font-black bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                                {sess.table?.table_number || `Table #${sess.table_id}`}
                              </span>
                              {isCalling && (
                                <span className="px-1.5 py-0.5 rounded-[3px] text-[10px] font-bold bg-red-500 text-white animate-pulse">
                                  CALLING
                                </span>
                              )}
                              {isBill && (
                                <span className="px-1.5 py-0.5 rounded-[3px] text-[10px] font-bold bg-amber-500 text-white">
                                  BILL REQ
                                </span>
                              )}
                            </div>
                            <span className="text-sm font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                              ${subtotal.toFixed(2)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-[var(--color-muted)] mt-2">
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <Users size={12} /> {sess.guest_count || 2} Guests
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Receipt size={12} /> {sessOrders.length} tickets
                              </span>
                            </div>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5 truncate max-w-[110px]" title={`Opened by: ${creatorName}`}>
                              👤 {creatorName}
                            </span>
                          </div>
                        </div>

                        {/* Direct Action Buttons */}
                        <div className="flex items-center gap-2 pt-2 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
                          <button
                            type="button"
                            onClick={() => {
                              navigate('/pos', {
                                state: {
                                  resumeSession: sess.id,
                                  tableId: sess.table_id
                                }
                              })
                            }}
                            className="flex-1 py-1.5 rounded-[4px] border text-xs font-bold text-center transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 cursor-pointer"
                            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                          >
                            + Add Item
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              navigate('/pos', {
                                state: {
                                  resumeSession: sess.id,
                                  tableId: sess.table_id,
                                  openCheckout: true
                                }
                              })
                            }}
                            className="flex-1 py-1.5 rounded-[4px] text-xs font-bold text-white text-center shadow-xs transition-all hover:opacity-90 active:scale-95 cursor-pointer bg-emerald-600 hover:bg-emerald-700"
                          >
                            Pay Bill 💳
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column (1-Col): Payment Breakdown & Recent Orders Stream */}
          <div className="space-y-4">

            {/* Shift Payment Methods Breakdown Card */}
            <div
              className="rounded-[5px] p-4 border shadow-2xs space-y-3"
              style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
            >
              <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'var(--color-border-subtle)' }}>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--color-text)' }}>
                    {creatorFilter === 'my' ? 'My Collected Breakdown' : 'Payment Breakdown'}
                  </h3>
                  <span className="text-[10px] text-[var(--color-muted)]">
                    {creatorFilter === 'my' ? `User: ${user?.username || 'Me'}` : 'All Operators'}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  ${todayGrossSales.toFixed(2)}
                </span>
              </div>

              <div className="space-y-2">
                {/* Cash */}
                <div className="flex items-center justify-between text-xs p-2 rounded-[4px] bg-black/5 dark:bg-white/5">
                  <div className="flex items-center gap-2">
                    <Banknote size={15} className="text-emerald-500" />
                    <span className="font-semibold" style={{ color: 'var(--color-text)' }}>Cash Drawer</span>
                  </div>
                  <span className="font-mono font-extrabold text-[var(--color-text)]">
                    ${paymentBreakdown.cash.toFixed(2)}
                  </span>
                </div>

                {/* Digital / KHQR */}
                <div className="flex items-center justify-between text-xs p-2 rounded-[4px] bg-black/5 dark:bg-white/5">
                  <div className="flex items-center gap-2">
                    <QrCode size={15} className="text-red-500" />
                    <span className="font-semibold" style={{ color: 'var(--color-text)' }}>KHQR / ABA Bakong</span>
                  </div>
                  <span className="font-mono font-extrabold text-[var(--color-text)]">
                    ${paymentBreakdown.qr.toFixed(2)}
                  </span>
                </div>

                {/* Credit Card */}
                <div className="flex items-center justify-between text-xs p-2 rounded-[4px] bg-black/5 dark:bg-white/5">
                  <div className="flex items-center gap-2">
                    <CreditCard size={15} className="text-indigo-500" />
                    <span className="font-semibold" style={{ color: 'var(--color-text)' }}>Credit / Debit Card</span>
                  </div>
                  <span className="font-mono font-extrabold text-[var(--color-text)]">
                    ${paymentBreakdown.card.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Orders Live Stream with created_by badges */}
            <div
              className="rounded-[5px] p-4 border shadow-2xs space-y-3"
              style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
            >
              <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'var(--color-border-subtle)' }}>
                <h3 className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--color-text)' }}>
                  Recent Tickets ({filteredOrders.length})
                </h3>
                <button
                  type="button"
                  onClick={() => navigate('/orders')}
                  className="text-[11px] font-bold text-red-500 hover:underline cursor-pointer flex items-center gap-0.5"
                >
                  All Orders <ArrowRight size={11} />
                </button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {filteredOrders.slice(0, 6).map((ord) => {
                  const creatorName = getStaffName(ord.created_by || ord.CreatedBy)

                  return (
                    <div
                      key={ord.id}
                      className="p-2.5 rounded-[4px] border flex items-center justify-between text-xs transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                      style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold font-mono" style={{ color: 'var(--color-text)' }}>#{ord.id}</span>
                          <span className="text-[10px] text-[var(--color-muted)]">
                            {ord.table?.table_number ? `T-${ord.table.table_number}` : 'Counter'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-[var(--color-muted)]">
                            {(ord.items || ord.order_items || []).length} items
                          </span>
                          <span className="text-[9px] px-1 py-0.2 rounded bg-black/5 dark:bg-white/5 text-[var(--color-muted)] font-medium">
                            By: {creatorName}
                          </span>
                        </div>
                      </div>

                      <div className="text-right flex flex-col items-end gap-1">
                        <p className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                          ${(parseFloat(ord.total_amount || ord.subtotal) || 0).toFixed(2)}
                        </p>
                        {ord.status === 'pending' || ord.status === 'unconfirmed' ? (
                          <button
                            type="button"
                            onClick={() => handleApproveOrder(ord.id)}
                            className="px-2 py-0.5 rounded-[3px] text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-2xs cursor-pointer transition-all active:scale-95 flex items-center gap-1"
                          >
                            <Check size={10} /> Approve
                          </button>
                        ) : (
                          <span
                            className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-[3px] ${
                              ord.status === 'paid' || ord.status === 'completed'
                                ? 'bg-emerald-500/10 text-emerald-600'
                                : 'bg-amber-500/10 text-amber-600'
                            }`}
                          >
                            {ord.status || 'Pending'}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

          </div>

        </div>

      </div>
    </CashierLayout>
  )
}

