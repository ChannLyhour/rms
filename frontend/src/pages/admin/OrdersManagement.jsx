import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import { adminApi } from '../../api/adminApi'
import { posApi } from '../../api/posApi'
import client from '../../api/axiosClient'
import {
  TableCard,
  Table,
  BadgeWithIcon,
  Button as TableButton,
  PaginationPageMinimalCenter,
  Avatar
} from '../../components/TablesComponents'
import {
  Receipt,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  DollarSign,
  Printer,
  X,
  ShoppingBag,
  UtensilsCrossed,
  QrCode,
  RefreshCw,
  Calendar,
  Check,
  ChefHat,
  XCircle,
  RotateCcw,
  UserCheck,
  LayoutGrid,
  BellRing,
  Building2
} from 'lucide-react'
import {
  AllOrdersStatusIcon,
  PendingStatusIcon,
  PreparingStatusIcon,
  ReadyStatusIcon,
  CompletedStatusIcon,
  CancelledStatusIcon,
  PaidStatusIcon,
  UnpaidStatusIcon,
} from '../../components/pos/sidebar-svg'
import toast from 'react-hot-toast'
import { useWebSocket } from '../../hooks/useWebSocket'
import { DualOrdersStatusTabs, OrderStatusTabs, PaymentStatusTabs } from './tabs/orders-status-tabs'

export default function OrdersManagement() {
  const { subscribe } = useWebSocket('cashier')
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [orders, setOrders] = useState([])
  const [outlets, setOutlets] = useState([])
  const [outletFilter, setOutletFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState(() => searchParams.get('status') || 'all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [page, setPage] = useState(1)
  const pageSize = 10

  useEffect(() => {
    client.get('/outlets').then((res) => setOutlets(res.data?.data || [])).catch(() => {})
  }, [])

  useEffect(() => {
    const q = searchParams.get('status') || 'all'
    setStatusFilter(q)
    setPage(1)
  }, [searchParams])

  const [sortDescriptor, setSortDescriptor] = useState({
    column: 'created_at',
    direction: 'descending',
  })

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await adminApi.getOrders()
      const raw = res.data?.data || res.data || []
      const list = Array.isArray(raw) ? raw : (raw.items || raw.data || [])
      setOrders(Array.isArray(list) ? list : [])
    } catch {
      try {
        const cRes = await client.get('/cashier/orders/all')
        const raw = cRes.data?.data || cRes.data || []
        const list = Array.isArray(raw) ? raw : (raw.items || raw.data || [])
        setOrders(Array.isArray(list) ? list : [])
      } catch (e) {}
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId)
    try {
      try {
        await adminApi.updateOrderStatus(orderId, newStatus)
      } catch {
        await posApi.updateOrderStatus(orderId, newStatus)
      }
      toast.success(`Order #${orderId} marked as ${newStatus}! 🎉`)
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      )
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }))
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update order status')
    } finally {
      setUpdatingId(null)
    }
  }

  useEffect(() => {
    fetchOrders()
    const unsubNew = subscribe('new_order', () => {
      fetchOrders()
      toast('New order received!', { icon: '🛎️' })
    })
    const unsubUpdate = subscribe('order_updated', () => {
      fetchOrders()
    })
    const unsubCall = subscribe('call_cashier', (data) => {
      toast(`Table ${data.table_number || ''} is ready to pay! 💳`, {
        duration: 8000,
        icon: '🛎️',
        style: {
          borderRadius: '10px',
          background: '#1e293b',
          color: '#fff',
          fontWeight: 700,
          fontSize: '14px'
        }
      })
    })

    return () => {
      if (unsubNew) unsubNew()
      if (unsubUpdate) unsubUpdate()
      if (unsubCall) unsubCall()
    }
  }, [subscribe])

  // Live counts for tabs
  const orderCounts = useMemo(() => {
    const counts = {
      all: orders.length,
      pending: 0,
      preparing: 0,
      ready: 0,
      completed: 0,
      paid: 0,
      unpaid: 0,
      cancelled: 0,
    }
    orders.forEach((o) => {
      const s = String(o.status || '').toLowerCase()
      const ps = String(o.payment_status || (s === 'completed' || s === 'paid' ? 'paid' : 'unpaid')).toLowerCase()

      if (s === 'pending' || s === 'confirmed') counts.pending++
      else if (s === 'preparing' || s === 'cooking') counts.preparing++
      else if (s === 'ready') counts.ready++
      else if (s === 'completed' || s === 'paid') counts.completed++
      else if (s === 'cancelled') counts.cancelled++

      if (ps === 'paid') counts.paid++
      else counts.unpaid++
    })
    return counts
  }, [orders])

  const paymentCounts = useMemo(() => {
    const counts = { all: orders.length, paid: 0, unpaid: 0, refunded: 0 }
    orders.forEach((o) => {
      const s = String(o.status || '').toLowerCase()
      const ps = String(o.payment_status || (s === 'completed' || s === 'paid' ? 'paid' : 'unpaid')).toLowerCase()
      if (ps === 'paid') counts.paid++
      else if (ps === 'refunded') counts.refunded++
      else counts.unpaid++
    })
    return counts
  }, [orders])

  // Filtered list
  const filteredOrders = useMemo(() => {
    const q = search.toLowerCase().trim()
    return orders.filter((o) => {
      const matchSearch = q
        ? String(o.id).includes(q) ||
          (o.order_number && o.order_number.toLowerCase().includes(q)) ||
          (o.table_session?.table?.table_number && String(o.table_session.table.table_number).includes(q)) ||
          (o.items || []).some((i) => (i.product?.name || i.title || '').toLowerCase().includes(q))
        : true

      const s = String(o.status || '').toLowerCase()
      const ps = String(o.payment_status || (s === 'completed' || s === 'paid' ? 'paid' : 'unpaid')).toLowerCase()

      const matchStatus = statusFilter === 'all'
        ? true
        : statusFilter === 'pending'
          ? s === 'pending' || s === 'confirmed'
          : statusFilter === 'preparing'
            ? s === 'preparing' || s === 'cooking'
            : statusFilter === 'completed'
              ? s === 'completed' || s === 'paid'
              : statusFilter === 'paid'
                ? ps === 'paid'
                : statusFilter === 'unpaid'
                  ? ps === 'unpaid'
                  : s === statusFilter

      const matchPayment = paymentFilter === 'all'
        ? true
        : ps === paymentFilter

      const matchType = typeFilter === 'all' ? true : o.order_type === typeFilter
      const matchOutlet = outletFilter === 'all' ? true : String(o.outlet_id) === String(outletFilter)
      return matchSearch && matchStatus && matchPayment && matchType && matchOutlet
    })
  }, [orders, search, statusFilter, paymentFilter, typeFilter, outletFilter])

  // Sorted list
  const sortedOrders = useMemo(() => {
    const list = [...filteredOrders]
    return list.sort((a, b) => {
      let first = a[sortDescriptor.column]
      let second = b[sortDescriptor.column]

      if (sortDescriptor.column === 'total_amount') {
        first = Number(a.total_amount || 0)
        second = Number(b.total_amount || 0)
      }

      if (sortDescriptor.column === 'created_at') {
        first = new Date(a.created_at || 0).getTime()
        second = new Date(b.created_at || 0).getTime()
      }

      if (typeof first === 'number' && typeof second === 'number') {
        return sortDescriptor.direction === 'descending' ? second - first : first - second
      }

      const strA = String(first || '')
      const strB = String(second || '')
      const cmp = strA.localeCompare(strB)
      return sortDescriptor.direction === 'descending' ? -cmp : cmp
    })
  }, [filteredOrders, sortDescriptor])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedOrders.length / pageSize))
  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * pageSize
    return sortedOrders.slice(start, start + pageSize)
  }, [sortedOrders, page, pageSize])

  const handleSort = (columnId) => {
    setSortDescriptor((prev) => ({
      column: columnId,
      direction:
        prev.column === columnId && prev.direction === 'ascending'
          ? 'descending'
          : 'ascending',
    }))
  }

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return { color: 'success', label: 'Completed' }
      case 'paid':
        return { color: 'success', label: 'Paid' }
      case 'ready':
        return { color: 'primary', label: 'Ready' }
      case 'preparing':
      case 'cooking':
        return { color: 'warning', label: 'Preparing' }
      case 'pending':
      case 'confirmed':
        return { color: 'gray', label: 'Pending' }
      case 'unpaid':
        return { color: 'error', label: 'Unpaid' }
      case 'partially_paid':
      case 'partial':
        return { color: 'warning', label: 'Partially Paid' }
      case 'cancelled':
        return { color: 'error', label: 'Cancelled' }
      case 'refunded':
      case 'void':
        return { color: 'error', label: 'Refunded' }
      default:
        return { color: 'gray', label: status || 'Pending' }
    }
  }

  const getPaymentStatusBadge = (paymentStatus) => {
    switch (paymentStatus?.toLowerCase()) {
      case 'paid':
      case 'completed':
        return { color: 'success', label: 'Paid' }
      case 'unpaid':
        return { color: 'error', label: 'Unpaid' }
      case 'pending':
        return { color: 'warning', label: 'Pending' }
      case 'partially_paid':
      case 'partial':
        return { color: 'warning', label: 'Partially Paid' }
      case 'refunded':
        return { color: 'error', label: 'Refunded' }
      default:
        return { color: 'gray', label: paymentStatus || 'Unpaid' }
    }
  }

  const hasActiveFilters = statusFilter !== 'all' || paymentFilter !== 'all' || typeFilter !== 'all' || search !== ''

  const handleResetFilters = () => {
    setStatusFilter('all')
    setPaymentFilter('all')
    setTypeFilter('all')
    setSearch('')
    setPage(1)
  }

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-7xl mx-auto font-sans">
        {/* ── Title & Actions ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-semibold tracking-tight" style={{ color: 'var(--color-text)' }}>
              Orders &amp; Transactions
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
              Live order tracking, kitchen tickets &amp; payment receipts
            </p>
          </div>
        </div>

        {/* ── Multi-Venue Filter Tabs ── */}
        <div className="relative">
          {/* Fade effect on mobile */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[var(--color-bg)] to-transparent pointer-events-none z-10 sm:hidden" />

          <div
            className="flex items-center gap-1 overflow-x-auto no-scrollbar rounded-xl p-1 border"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderColor: 'var(--color-border)',
            }}
          >
            <button
              type="button"
              onClick={() => setOutletFilter('all')}
              className={`inline-flex items-center gap-2.5 h-10 px-3.5 rounded-xl text-sm transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                outletFilter === 'all'
                  ? 'shadow-xs font-semibold'
                  : 'hover:bg-black/5 dark:hover:bg-white/5'
              }`}
              style={
                outletFilter === 'all'
                  ? {
                      background: 'var(--color-surface, #1e2230)',
                      color: 'var(--color-text, #ffffff)',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      border: '1px solid var(--color-border)',
                    }
                  : {
                      color: 'var(--color-muted, #94a3b8)',
                    }
              }
            >
              <Building2 size={18} className="shrink-0 text-[#126973] dark:text-[#F1D8C2]" />
              <span>All Venues</span>
              <span
                className="inline-flex items-center justify-center rounded-lg px-2 h-5 text-[11px] font-semibold"
                style={{
                  background: outletFilter === 'all'
                    ? 'rgba(18, 105, 115, 0.18)'
                    : 'rgba(255, 255, 255, 0.06)',
                  color: outletFilter === 'all' ? 'var(--color-500, #126973)' : 'var(--color-muted, #94a3b8)',
                }}
              >
                {orders.length}
              </span>
            </button>

            {outlets.map((o) => {
              const count = orders.filter((ord) => String(ord.outlet_id) === String(o.id)).length
              const isSelected = String(outletFilter) === String(o.id)
              const icon = o.type === 'cafe' ? '☕' : o.type === 'bar' ? '🍸' : o.type === 'retail' ? '🛒' : '🍽️'
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setOutletFilter(String(o.id))}
                  className={`inline-flex items-center gap-2.5 h-10 px-3.5 rounded-xl text-sm transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    isSelected
                      ? 'shadow-xs font-semibold'
                      : 'hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                  style={
                    isSelected
                      ? {
                          background: 'var(--color-surface, #1e2230)',
                          color: 'var(--color-text, #ffffff)',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                          border: '1px solid var(--color-border)',
                        }
                      : {
                          color: 'var(--color-muted, #94a3b8)',
                        }
                  }
                >
                  <span className="text-base shrink-0">{icon}</span>
                  <span>{o.name}</span>
                  <span
                    className="inline-flex items-center justify-center rounded-lg px-2 h-5 text-[11px] font-semibold"
                    style={{
                      background: isSelected
                        ? 'rgba(18, 105, 115, 0.18)'
                        : 'rgba(255, 255, 255, 0.06)',
                      color: isSelected ? 'var(--color-500, #126973)' : 'var(--color-muted, #94a3b8)',
                    }}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Status Tabs ── */}
        <div className="relative">
          {/* Fade effect on mobile */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[var(--color-bg)] to-transparent pointer-events-none z-10 sm:hidden"></div>

          <div
            className="flex items-center gap-1 overflow-x-auto no-scrollbar rounded-xl p-1 border"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              // borderColor: 'var(--color-border)',
            }}
          >
            {[
              { id: 'all', label: 'All Orders', icon: AllOrdersStatusIcon, count: orderCounts.all ?? filteredOrders.length },
              { id: 'pending', label: 'Pending', icon: PendingStatusIcon, count: orderCounts.pending ?? 0 },
              { id: 'preparing', label: 'Preparing', icon: PreparingStatusIcon, count: orderCounts.preparing ?? 0 },
              { id: 'ready', label: 'Ready', icon: ReadyStatusIcon, count: orderCounts.ready ?? 0 },
              { id: 'completed', label: 'Completed', icon: CompletedStatusIcon, count: orderCounts.completed ?? 0 },
              { id: 'paid', label: 'Paid', icon: PaidStatusIcon, count: orderCounts.paid ?? 0 },
              { id: 'unpaid', label: 'Unpaid', icon: UnpaidStatusIcon, count: orderCounts.unpaid ?? 0 },
              { id: 'cancelled', label: 'Cancelled', icon: CancelledStatusIcon, count: orderCounts.cancelled ?? 0 },
            ].map((tab) => {
              const Icon = tab.icon
              const isActive = statusFilter === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setStatusFilter(tab.id)
                    setPage(1)
                    if (tab.id === 'all') {
                      setSearchParams((prev) => {
                        const next = new URLSearchParams(prev)
                        next.delete('status')
                        return next
                      })
                    } else {
                      setSearchParams((prev) => {
                        const next = new URLSearchParams(prev)
                        next.set('status', tab.id)
                        return next
                      })
                    }
                  }}
                  className={`inline-flex items-center gap-2.5 h-10 px-3.5 rounded-xl text-sm transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'shadow-xs font-semibold'
                      : 'hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                  style={
                    isActive
                      ? {
                          background: 'var(--color-surface, #1e2230)',
                          color: 'var(--color-text, #ffffff)',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                          border: '1px solid var(--color-border)',
                        }
                      : {
                          color: 'var(--color-muted, #94a3b8)',
                        }
                  }
                >
                  <Icon size={18} className="shrink-0" />
                  <span>{tab.label}</span>
                  <span
                    className="inline-flex items-center justify-center rounded-lg px-2 h-5 text-[11px] font-semibold"
                    style={{
                      background: isActive
                        ? 'rgba(239, 68, 68, 0.15)'
                        : 'rgba(255, 255, 255, 0.06)',
                      color: isActive ? 'var(--color-500, #BF4040)' : 'var(--color-muted, #94a3b8)',
                    }}
                  >
                    {tab.count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── TableCard Component Integration ── */}
        <TableCard.Root>
          <Table aria-label="Orders Management Table" sortDescriptor={sortDescriptor}>
            <Table.Header>
              <Table.Head
                id="order_number"
                label="Order Number"
                isRowHeader
                allowsSorting
                sortDescriptor={sortDescriptor}
                onSort={handleSort}
              />
              <Table.Head
                id="order_type"
                label="Type / Destination"
                allowsSorting
                sortDescriptor={sortDescriptor}
                onSort={handleSort}
              />
              <Table.Head
                id="status"
                label="Status"
                allowsSorting
                sortDescriptor={sortDescriptor}
                onSort={handleSort}
              />
              <Table.Head id="items" label="Order Items" />
              <Table.Head
                id="total_amount"
                label="Grand Total ($)"
                allowsSorting
                sortDescriptor={sortDescriptor}
                onSort={handleSort}
              />
              <Table.Head
                id="created_at"
                label="Created At"
                allowsSorting
                sortDescriptor={sortDescriptor}
                onSort={handleSort}
              />
              <Table.Head id="actions" label="Actions" />
            </Table.Header>

            <Table.Body items={paginatedOrders}>
              {(ord) => {
                const totalItems = (ord.items || []).reduce((acc, i) => acc + (i.quantity || 1), 0)
                const badge = getStatusBadge(ord.status)
                const tableNum = ord.table_session?.table?.table_number || ord.table_session?.table_id
                const outlet = outlets.find((o) => String(o.id) === String(ord.outlet_id))

                return (
                  <Table.Row key={ord.id} id={ord.id}>
                    {/* Order Number */}
                    <Table.Cell>
                      <div className="flex items-center gap-2.5">
                        <Avatar initials={`#${ord.id}`} size="sm" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-black text-xs block leading-tight text-[var(--color-500,#BF4040)]">
                              {ord.order_number || `ORD-${String(ord.id).padStart(5, '0')}`}
                            </span>
                            
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            {ord.accepted_role ? (
                              <span
                                className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-[5px] capitalize"
                                style={{
                                  color: '#16a34a',
                                }}
                              >
                                <UserCheck size={10} className="shrink-0" strokeWidth={3} />
                                <span>Accepted by {ord.accepted_role}</span>
                              </span>
                            ) : ord.order_type === 'qr_scan' ? (
                              <span
                                className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-[5px]"
                                style={{
                                  background: 'rgba(59, 130, 246, 0.1)',
                                  color: '#2563eb',
                                  border: '1px solid rgba(59, 130, 246, 0.2)',
                                }}
                              >
                                <QrCode size={10} className="shrink-0" strokeWidth={3} />
                                <span>Customer QR</span>
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </Table.Cell>

                    {/* Order Type / Table */}
                    <Table.Cell>
                      <div className="flex items-center gap-1.5 font-semibold text-xs">
                        {ord.order_type === 'takeaway' ? (
                          <span className="px-2 py-1 rounded-[5px] bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 text-[11px] font-medium tracking-wide">
                            Takeaway
                          </span>
                        ) : ord.order_type === 'qr_scan' ? (
                          <span className="px-2 py-1 rounded-[5px] bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 text-[11px] font-medium tracking-wide">
                            QR Table {tableNum || '--'}
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-[5px] bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 text-[11px] font-medium tracking-wide">
                            Table {tableNum || '--'}
                          </span>
                        )}
                      </div>
                    </Table.Cell>

                    {/* Status Badge */}
                    <Table.Cell>
                      <BadgeWithIcon size="sm" color={badge.color}>
                        {badge.label}
                      </BadgeWithIcon>
                    </Table.Cell>

                    {/* Items */}
                    <Table.Cell>
                      <div>
                        <span className="font-extrabold text-xs block" style={{ color: 'var(--color-text)' }}>
                          {totalItems} items
                        </span>
                        <span className="text-[11px] text-[var(--color-muted)] truncate max-w-[160px] block mt-0.5">
                          {(ord.items || []).map((i) => i.product?.name).filter(Boolean).slice(0, 2).join(', ')}
                          {(ord.items || []).length > 2 ? '...' : ''}
                        </span>
                      </div>
                    </Table.Cell>

                    {/* Amount & Payment Status */}
                    <Table.Cell>
                      <span className="font-mono font-bold text-xs block" style={{ color: 'var(--color-text)' }}>
                        ${Number(ord.total_amount || 0).toFixed(2)}
                      </span>
                      <span
                        className={`text-[11px] font-semibold block mt-0.5 ${
                          ord.payment_status === 'paid' ? 'text-paid' : 'text-unpaid'
                        }`}
                      >
                        {ord.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
                      </span>
                    </Table.Cell>

                    {/* Created At */}
                    <Table.Cell>
                      <span className="text-xs font-mono text-[var(--color-muted)]">
                        {ord.created_at ? new Date(ord.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                      </span>
                    </Table.Cell>

                    {/* Actions */}
                    <Table.Cell>
                      <div className="flex items-center gap-4 justify-end font-semibold">
                        {ord.status === 'pending' && (
                          <TableButton
                            size="sm"
                            color="link-color"
                            disabled={updatingId === ord.id}
                            onClick={() => handleUpdateStatus(ord.id, 'confirmed')}
                            className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-500 dark:hover:text-emerald-400 disabled:opacity-50"
                          >
                            {updatingId === ord.id ? 'Loading...' : 'Approve'}
                          </TableButton>
                        )}

                        {ord.status === 'confirmed' && (
                          <TableButton
                            size="sm"
                            color="link-color"
                            disabled={updatingId === ord.id}
                            onClick={() => handleUpdateStatus(ord.id, 'preparing')}
                            className="text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400 disabled:opacity-50"
                          >
                            Prepare
                          </TableButton>
                        )}

                        {ord.status === 'preparing' && (
                          <TableButton
                            size="sm"
                            color="link-color"
                            disabled={updatingId === ord.id}
                            onClick={() => handleUpdateStatus(ord.id, 'ready')}
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400 disabled:opacity-50"
                          >
                            Ready
                          </TableButton>
                        )}

                        {ord.status === 'ready' && (
                          <TableButton
                            size="sm"
                            color="link-color"
                            disabled={updatingId === ord.id}
                            onClick={() => handleUpdateStatus(ord.id, 'completed')}
                            className="text-[var(--color-text)] hover:opacity-70 disabled:opacity-50"
                          >
                            Complete
                          </TableButton>
                        )}

                        <TableButton
                          size="sm"
                          color="link-gray"
                          onClick={() => navigate(`/orders/${ord.id}`)}
                          className="hover:text-[var(--color-text)]"
                        >
                          View
                        </TableButton>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                )
              }}
            </Table.Body>
          </Table>

          {/* Empty State */}
          {filteredOrders.length === 0 && (
            <div className="py-16 text-center">
              <Receipt size={36} className="mx-auto mb-2 opacity-40 text-[var(--color-muted)]" />
              <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>No orders match filter</p>
              <p className="text-xs mt-1 text-[var(--color-muted)]">Live and completed dining orders will appear here automatically.</p>
            </div>
          )}

          {/* Pagination Footer */}
          {filteredOrders.length > 0 && (
            <div className="p-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <PaginationPageMinimalCenter
                page={page}
                total={totalPages}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          )}
        </TableCard.Root>
      </div>
    </AdminLayout>
  )
}
