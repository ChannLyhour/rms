import { useEffect, useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import CashierLayout from '../../components/layout/CashierLayout'
import { useTableStore } from '../../store/useTableStore'
import { posApi, kitchenApi } from '../../api/posApi'
import { useWebSocket } from '../../hooks/useWebSocket'
import {
  Search,
  Plus,
  QrCode,
  Users,
  Phone,
  Layers,
  MapPin,
  List,
  Trash2,
  X,
  Sparkles,
  Check,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Eye,
  Edit2,
  ArrowLeft,
  CreditCard,
  Receipt,
  UtensilsCrossed,
  Printer,
  ArrowLeftRight,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  Bell,
  BellRing,
  CheckCheck
} from 'lucide-react'
import toast from 'react-hot-toast'

// ── Theme Configurations for Table Status ──────────────────────────
const THEME = {
  reserved: {
    tableBg: '#BCE7DF',
    textColor: '#135E54',
    chairColor: '#127568',
    label: 'Reserved',
    dot: '#149B89',
  },
  occupied: {
    tableBg: '#FDDCD4',
    textColor: '#8C311E',
    chairColor: '#E85D3F',
    label: 'On Dine',
    dot: '#E85D3F',
  },
  available: {
    tableBg: '#E9EFFF',
    textColor: '#3A4E80',
    chairColor: '#CBD5E1',
    label: 'Available',
    dot: '#94A3B8',
  },
  cleaning: {
    tableBg: '#FEF3C7',
    textColor: '#92400E',
    chairColor: '#F59E0B',
    label: 'Cleaning',
    dot: '#F59E0B',
  },
  emptyChair: '#CBD5E1',
}

const getStatusType = (status) => {
  const s = String(status || '').toLowerCase()
  if (['occupied', 'active', 'cooking', 'calling_waiter', 'bill_requested'].includes(s)) return 'occupied'
  if (['reserved'].includes(s)) return 'reserved'
  if (['cleaning', 'maintenance'].includes(s)) return 'cleaning'
  return 'available'
}

const stripPrefix = (n) => String(n || '').replace(/^[Tt]-?/, '')

// ═══════════════════════════════════════════════════════════════════
// WINDSOR / SPINDLE-BACK RESTAURANT CHAIR SVGS
// ═══════════════════════════════════════════════════════════════════

function ChairTop({ color = '#CBD5E1', size = 19 }) {
  return (
    <svg width={size} height={size + 2} viewBox="0 0 24 26" fill="none" style={{ display: 'block', flexShrink: 0 }}>
      <path d="M4 11C4 4 20 4 20 11" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
      <line x1="8" y1="6" x2="8" y2="12" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <line x1="12" y1="5" x2="12" y2="12" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <line x1="16" y1="6" x2="16" y2="12" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <rect x="2.5" y="12" width="19" height="5.5" rx="2.5" fill={color} />
      <line x1="5.5" y1="17.5" x2="4.5" y2="23.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="18.5" y1="17.5" x2="19.5" y2="23.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function ChairBottom({ color = '#CBD5E1', size = 19 }) {
  return (
    <svg width={size} height={size + 2} viewBox="0 0 24 26" fill="none" style={{ display: 'block', flexShrink: 0 }}>
      <line x1="5.5" y1="8.5" x2="4.5" y2="2.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="18.5" y1="8.5" x2="19.5" y2="2.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <rect x="2.5" y="8.5" width="19" height="5.5" rx="2.5" fill={color} />
      <path d="M4 15C4 22 20 22 20 15" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
      <line x1="8" y1="14" x2="8" y2="20" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <line x1="12" y1="14" x2="12" y2="21" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <line x1="16" y1="14" x2="16" y2="20" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function ChairLeft({ color = '#CBD5E1', size = 19 }) {
  return (
    <svg width={size + 2} height={size} viewBox="0 0 26 24" fill="none" style={{ display: 'block', flexShrink: 0 }}>
      <path d="M11 4C4 4 4 20 11 20" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
      <line x1="6" y1="8" x2="12" y2="8" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <line x1="5" y1="12" x2="12" y2="12" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <line x1="6" y1="16" x2="12" y2="16" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <rect x="12" y="2.5" width="5.5" height="19" rx="2.5" fill={color} />
      <line x1="17.5" y1="5.5" x2="23.5" y2="4.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="17.5" y1="18.5" x2="23.5" y2="19.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function ChairRight({ color = '#CBD5E1', size = 19 }) {
  return (
    <svg width={size + 2} height={size} viewBox="0 0 26 24" fill="none" style={{ display: 'block', flexShrink: 0 }}>
      <line x1="8.5" y1="5.5" x2="2.5" y2="4.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="8.5" y1="18.5" x2="2.5" y2="19.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <rect x="8.5" y="2.5" width="5.5" height="19" rx="2.5" fill={color} />
      <path d="M15 4C22 4 22 20 15 20" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
      <line x1="14" y1="8" x2="20" y2="8" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <line x1="14" y1="12" x2="21" y2="12" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <line x1="14" y1="16" x2="20" y2="16" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

// ═══════════════════════════════════════════════════════════════════
// 2D TABLE CELL COMPONENT
// ═══════════════════════════════════════════════════════════════════

function TableCell({ table, session, onOpen, onClose, onQR, onSelect, onInspect, isHighlighted }) {
  const isOccupied = table.status === 'occupied' || session?.status === 'active'
  const statusType = getStatusType(isOccupied ? 'occupied' : table.status)
  const theme = THEME[statusType]
  const totalChairs = parseInt(table.capacity || 4)
  const guests = parseInt(session?.guest_count || (isOccupied ? Math.min(totalChairs, 2) : 0))
  const isLarge = totalChairs > 4

  const topCount = Math.ceil(totalChairs / 4)
  const botCount = Math.floor(totalChairs / 4)
  const leftCount = Math.ceil((totalChairs - topCount - botCount) / 2)
  const rightCount = totalChairs - topCount - botCount - leftCount

  let assignedChairs = 0
  const getChairColor = () => {
    if (statusType === 'available') return THEME.emptyChair
    if (assignedChairs < guests) {
      assignedChairs++
      return theme.chairColor
    }
    return THEME.emptyChair
  }

  const topColors = Array.from({ length: topCount }, () => getChairColor())
  const botColors = Array.from({ length: botCount }, () => getChairColor())
  const leftColors = Array.from({ length: leftCount }, () => getChairColor())
  const rightColors = Array.from({ length: rightCount }, () => getChairColor())

  const num = stripPrefix(table.table_number)
  const cardWidth = isLarge ? 155 : 105
  const cardHeight = 76

  return (
    <div className="inline-flex flex-col items-center select-none m-auto p-2">
      {/* Top Chairs */}
      <div className={`flex justify-center mb-1 ${isLarge ? 'gap-3' : 'gap-2'}`}>
        {topColors.map((col, i) => (
          <ChairTop key={i} color={col} size={19} />
        ))}
      </div>

      {/* Middle Row */}
      <div className="flex items-center gap-1">
        <div className="flex flex-col gap-1.5">
          {leftColors.map((col, i) => (
            <ChairLeft key={i} color={col} size={19} />
          ))}
        </div>

        {/* Table Card */}
        <div
          onClick={() => onSelect(table)}
          onDoubleClick={() => onInspect(table)}
          className="relative flex flex-col items-center justify-center cursor-pointer transition-all rounded-[5px]"
          style={{
            width: `${cardWidth}px`,
            height: `${cardHeight}px`,
            background: theme.tableBg,
            border: isHighlighted ? '2px solid #149B89' : '1px solid transparent',
            boxShadow: isHighlighted
              ? '0 0 0 3px rgba(20,155,137,0.2), 0 6px 16px rgba(20,155,137,0.18)'
              : '0 2px 6px rgba(0,0,0,0.04)',
            transform: isHighlighted ? 'scale(1.04)' : 'none',
          }}
        >
          {/* Quick QR button */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onQR(table); }}
            className="absolute top-1.5 right-1.5 p-1 rounded-[5px] opacity-40 hover:opacity-100 transition-opacity"
            style={{ color: theme.textColor }}
            title="View Table QR Code"
          >
            <QrCode size={12} />
          </button>

          {/* Quick Inspect Button */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onInspect(table); }}
            className="absolute top-1.5 left-1.5 p-1 rounded-[5px] opacity-40 hover:opacity-100 transition-opacity"
            style={{ color: theme.textColor }}
            title="Inspect Table Order Details"
          >
            <Eye size={11} />
          </button>

          <span
            className="font-extrabold text-xs tracking-tight"
            style={{ color: theme.textColor }}
          >
            Table #{num}
          </span>

          <div className="flex items-center gap-1 mt-1 opacity-90" style={{ color: theme.textColor }}>
            <Users size={11} />
            <span className="text-[11px] font-bold">
              {isOccupied ? `${guests}` : `${totalChairs}`}
            </span>
          </div>

          
        </div>

        <div className="flex flex-col gap-1.5">
          {rightColors.map((col, i) => (
            <ChairRight key={i} color={col} size={19} />
          ))}
        </div>
      </div>

      {/* Bottom Chairs */}
      <div className={`flex justify-center mt-1 ${isLarge ? 'gap-3' : 'gap-2'}`}>
        {botColors.map((col, i) => (
          <ChairBottom key={i} color={col} size={19} />
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// RESERVATION / SESSION SIDEBAR CARD
// ═══════════════════════════════════════════════════════════════════

function ReservationCard({ session, table, active, onClick, onInspect }) {
  const isOccupied = table?.status === 'occupied' || session?.status === 'active'
  const isReserved = table?.status === 'reserved'
  
  // Calculate Grand Total for this table session
  const grandTotal = (session?.orders || []).reduce(
    (sum, o) => sum + Number(o.total_amount || 0),
    0
  ) || Number(session?.total_amount || session?.total || 0)

  const grandTotalStr = isOccupied ? `$${grandTotal.toFixed(2)}` : '—'

  return (
    <div
      onClick={onClick}
      className={`rounded-[5px] p-3 mx-2 mb-2 flex items-center gap-3 cursor-pointer border transition-all shadow-xs ${
        active
          ? 'ring-2 ring-[#149B89]/20 border-[#149B89]'
          : 'hover:border-slate-300 dark:hover:border-slate-700'
      }`}
      style={{
        background: 'var(--color-card)',
        borderColor: active ? '#149B89' : 'var(--color-border)'
      }}
    >
      {/* Left Badge */}
      <div
        className="w-11 h-11 rounded-[5px] flex flex-col items-center justify-center text-center shrink-0 font-mono"
        style={{
          background: isOccupied ? '#FEE2E2' : isReserved ? '#E1F7F4' : '#E0F2FE',
          color: isOccupied ? '#DC2626' : isReserved ? '#149B89' : '#0369A1'
        }}
      >
        <span className="text-[9px] font-extrabold uppercase leading-none">
          {isOccupied ? 'LIVE' : isReserved ? 'RES' : 'FREE'}
        </span>
        <span className="text-[10px] font-bold leading-tight mt-0.5">
          {isOccupied ? 'DINE' : isReserved ? 'BOOK' : 'TABLE'}
        </span>
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <p className="font-bold text-xs truncate" style={{ color: 'var(--color-text)' }}>
            {session?.customer_name || `Table #${stripPrefix(table?.table_number || table?.id)}`}
          </p>
          <span
            className="text-xs font-mono font-black"
            style={{
              color: isOccupied && grandTotal > 0 ? 'var(--color-500, #BF4040)' : 'var(--color-muted)'
            }}
          >
            {grandTotalStr}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-[11px] font-medium flex items-center gap-1" style={{ color: 'var(--color-text-secondary)' }}>
            <span>🪑</span> Table #{stripPrefix(table?.table_number || table?.id)}
            {session?.created_at && (
              <span className="text-[10px] text-[var(--color-muted)] ml-1">
                • {new Date(session.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
              </span>
            )}
          </span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onInspect(table); }}
            className="text-[10px] font-bold px-2 py-0.5 rounded-[5px] bg-[#149B89]/10 text-[#149B89] hover:bg-[#149B89]/20 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>Orders</span>
            <ChevronRight size={11} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TABLE DETAIL & CUSTOMER ORDER ITEMS INSPECTOR
// ═══════════════════════════════════════════════════════════════════

function TableDetailView({ table, session, onClose, onRefresh, onUpdateStatus, onTransferTable }) {
  const navigate = useNavigate()
  const { subscribe } = useWebSocket('cashier')
  const { subscribe: subscribeTable } = useWebSocket(session?.session_token ? `table_${session.session_token}` : null)
  const [orderItems, setOrderItems] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [tableStatus, setTableStatus] = useState(table.status || 'available')

  // Load active orders for this session / table
  const fetchTableOrders = useCallback(async () => {
    setLoadingOrders(true)
    try {
      if (session?.id) {
        const res = await posApi.getOrdersBySession(session.id)
        setOrderItems(res.data?.data || [])
      } else {
        // Fallback: search kitchen orders matching this table
        const res = await kitchenApi.getOrders()
        const allOrders = res.data?.data || []
        const match = allOrders.filter(o =>
          String(o.table_id) === String(table.id) ||
          stripPrefix(o.table?.table_number || o.table_id) === stripPrefix(table.table_number)
        )
        setOrderItems(match)
      }
    } catch {
      // Mock / fallback items if server call fails
      setOrderItems([])
    } finally {
      setLoadingOrders(false)
    }
  }, [session, table])

  useEffect(() => {
    fetchTableOrders()
  }, [fetchTableOrders])

  // Real-time synchronization for table orders
  useEffect(() => {
    const unsub1 = subscribe('order_updated', () => {
      fetchTableOrders()
      onRefresh?.()
    })
    const unsub2 = subscribe('new_order', () => {
      fetchTableOrders()
      onRefresh?.()
    })
    const unsub3 = subscribe('payment_completed', () => {
      fetchTableOrders()
      onRefresh?.()
    })
    const unsub4 = subscribeTable?.('order_updated', () => {
      fetchTableOrders()
      onRefresh?.()
    })
    const unsub5 = subscribeTable?.('new_order', () => {
      fetchTableOrders()
      onRefresh?.()
    })
    const unsub6 = subscribe('call_cashier', (data) => {
      const match =
        String(data?.table_id) === String(table?.id) ||
        String(data?.table_number) === String(table?.table_number) ||
        String(data?.table_number) === String(stripPrefix(table?.table_number))

      if (match) {
        setActiveCall({
          title: data?.title || 'Service Assistance Requested',
          service_type: data?.service_type || 'waiter',
          time: data?.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
        fetchTableOrders()
        onRefresh?.()
      }
    })

    return () => {
      unsub1?.()
      unsub2?.()
      unsub3?.()
      unsub4?.()
      unsub5?.()
      unsub6?.()
    }
  }, [subscribe, subscribeTable, fetchTableOrders, onRefresh, table])

  const [activeCall, setActiveCall] = useState(() => {
    if (table?.status === 'calling_waiter') {
      return { title: 'Calling Waiter to Table', service_type: 'waiter', time: 'Live' }
    }
    if (table?.status === 'bill_requested') {
      return { title: 'Ready for the Bill / Checkout', service_type: 'bill', time: 'Live' }
    }
    return null
  })

  useEffect(() => {
    if (table?.status === 'calling_waiter') {
      setActiveCall({ title: 'Calling Waiter to Table', service_type: 'waiter', time: 'Live' })
    } else if (table?.status === 'bill_requested') {
      setActiveCall({ title: 'Ready for the Bill / Checkout', service_type: 'bill', time: 'Live' })
    } else if (table?.status === 'available' || table?.status === 'occupied') {
      setActiveCall(null)
    }
  }, [table?.status])

  const handleAcknowledgeCall = async () => {
    try {
      setActiveCall(null)
      await onUpdateStatus(table.id, 'occupied')
      setTableStatus('occupied')
      toast.success(`Table #${stripPrefix(table.table_number)} service call cleared`)
    } catch {
      setActiveCall(null)
    }
  }

  const handleApproveOrder = async (orderId) => {
    try {
      await posApi.updateOrderStatus(orderId, 'confirmed')
      toast.success('Order approved & sent to Kitchen KDS! 👨‍🍳')
      fetchTableOrders()
      onRefresh?.()
    } catch {
      toast.error('Failed to approve order')
    }
  }

  const handleRejectOrder = async (orderId) => {
    try {
      await posApi.updateOrderStatus(orderId, 'cancelled')
      toast.success('Order rejected and cancelled')
      fetchTableOrders()
      onRefresh?.()
    } catch {
      toast.error('Failed to cancel order')
    }
  }

  // Extract all individual food items across orders
  const allItems = useMemo(() => {
    const list = []
    orderItems.forEach((order) => {
      if (Array.isArray(order.items)) {
        order.items.forEach((it) => {
          list.push({
            ...it,
            order_id: order.id,
            order_number: order.order_number,
            order_status: order.status,
            payment_status: order.payment_status || order.status_payment || (order.is_paid ? 'paid' : 'unpaid'),
            created_at: order.created_at
          })
        })
      }
    })
    return list
  }, [orderItems])

  const unpaidItems = useMemo(() => allItems.filter((it) => it.payment_status !== 'paid'), [allItems])
  const paidItems = useMemo(() => allItems.filter((it) => it.payment_status === 'paid'), [allItems])

  const taxRate = typeof window !== 'undefined' && localStorage.getItem('pos_tax_rate') ? Number(localStorage.getItem('pos_tax_rate')) : 7.0
  // Calculate summary for only UNPAID items
  const subtotal = unpaidItems.reduce((acc, it) => acc + (parseFloat(it.price || it.unit_price || 0) * (it.quantity || 1)), 0)
  const paidSubtotal = paidItems.reduce((acc, it) => acc + (parseFloat(it.price || it.unit_price || 0) * (it.quantity || 1)), 0)
  const tax = subtotal * (taxRate / 100.0)
  const total = subtotal + tax
  const paidTotal = paidSubtotal + (paidSubtotal * (taxRate / 100.0))

  const handleStatusChange = async (newStatus) => {
    setTableStatus(newStatus)
    await onUpdateStatus(table.id, newStatus)
    toast.success(`Table #${stripPrefix(table.table_number)} status updated to ${newStatus}`)
  }

  const getItemStatusBadgeClass = (status) => {
    const s = String(status || '').toLowerCase()
    if (s === 'completed' || s === 'ready' || s === 'served' || s === 'finished') {
      return 'badge-order-finished'
    }
    if (s === 'preparing' || s === 'cooking' || s === 'confirmed' || s === 'processing') {
      return 'badge-order-processing'
    }
    if (s === 'cancelled') {
      return 'badge-order-cancelled'
    }
    return 'badge-order-pending'
  }

  const formatItemStatusLabel = (status) => {
    const s = String(status || '').toLowerCase()
    if (s === 'completed' || s === 'finished') return 'Completed'
    if (s === 'ready') return 'Ready'
    if (s === 'served') return 'Served'
    if (s === 'preparing' || s === 'cooking') return 'Cooking'
    if (s === 'confirmed' || s === 'processing') return 'Confirmed'
    if (s === 'cancelled') return 'Cancelled'
    return 'Pending'
  }

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-[#0b0d13] overflow-hidden animate-in fade-in duration-150">
      {/* ── Top Header Navigation Bar ── */}
      <div
        className="p-4 border-b flex items-center justify-between shrink-0 shadow-xs"
        style={{
          background: 'var(--color-surface)',
          borderColor: 'var(--color-border)'
        }}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-[5px] border flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-sm font-extrabold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
              <span>Table #{stripPrefix(table?.table_number || table?.id)}</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full capitalize" style={{ background: 'var(--color-card)', color: 'var(--color-muted)' }}>
                {table?.floor_zone || 'Main Dining'} • {table?.capacity || 4} Seats
              </span>
            </h2>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2">
          

          <button
            type="button"
            onClick={() => {
              navigate('/pos', {
                state: {
                  resumeSession: session?.id || table.id,
                  tableId: table.id,
                },
              })
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-[5px] text-xs font-bold border transition-all hover:bg-amber-500/10 cursor-pointer text-amber-600 dark:text-amber-400 border-amber-500/30"
            style={{
              background: 'var(--color-card)',
            }}
          >
            <Plus size={14} />
            <span>Add Order Item</span>
          </button>

          <button
            type="button"
            onClick={() => {
              navigate('/pos', {
                state: {
                  resumeSession: session?.id || table.id,
                  tableId: table.id,
                  openCheckout: true,
                  existingItems: allItems,
                },
              })
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-[5px] text-xs font-bold text-white shadow-sm transition-all hover:opacity-90 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
            }}
          >
            <CreditCard size={15} />
            <span>Pay & Checkout</span>
          </button>
        </div>
      </div>

      {/* ── Main Content Split ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left Column: Customer & Table Status Controls */}
        <div
          className="w-80 border-r p-4 space-y-4 overflow-y-auto shrink-0"
          style={{
            background: 'var(--color-card)',
            borderColor: 'var(--color-border)'
          }}
        >
          {/* Table Number & Total Items Card */}
          <div
            className="p-3.5 rounded-xl border space-y-3 shadow-2xs"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            {/* Table Number & Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border shadow-2xs font-mono"
                  style={{
                    background: tableStatus === 'occupied' ? '#FEE2E2' : tableStatus === 'reserved' ? '#E1F7F4' : '#E0F2FE',
                    color: tableStatus === 'occupied' ? '#DC2626' : tableStatus === 'reserved' ? '#149B89' : '#0369A1',
                    borderColor: 'var(--color-border)'
                  }}
                >
                  #{stripPrefix(table?.table_number || table?.id)}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm leading-tight" style={{ color: 'var(--color-text)' }}>
                    Table #{stripPrefix(table?.table_number || table?.id)}
                  </h3>
                  <p className="text-[11px] text-[var(--color-muted)] font-medium mt-0.5">
                    {table?.floor_zone || 'Main Dining'} • {table?.capacity || 4} Seats
                  </p>
                </div>
              </div>
              <span
                className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border"
                style={{
                  background: tableStatus === 'occupied' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                  color: tableStatus === 'occupied' ? '#ef4444' : '#10b981',
                  borderColor: tableStatus === 'occupied' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'
                }}
              >
                {tableStatus}
              </span>
            </div>

            
          </div>

          {/* Update Table Status Controls */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider block" style={{ color: 'var(--color-text)' }}>
              Update Table Status
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'available', label: 'Available', color: '#10B981' },
                { id: 'occupied', label: 'On Dine', color: '#E85D3F' },
                { id: 'reserved', label: 'Reserved', color: '#149B89' },
                { id: 'cleaning', label: 'Cleaning', color: '#F59E0B' },
              ].map((s) => {
                const isSelected = tableStatus === s.id
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleStatusChange(s.id)}
                    className={`py-2 px-3 rounded-[5px] text-xs font-bold border transition-all flex items-center justify-between ${
                      isSelected ? 'text-white shadow-xs' : 'hover:opacity-80'
                    }`}
                    style={
                      isSelected
                        ? { background: s.color, borderColor: s.color, color: '#ffffff' }
                        : { background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }
                    }
                  >
                    <span>{s.label}</span>
                    {isSelected && <Check size={13} />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Bill Summary */}
          <div className="p-3 rounded-[5px] border space-y-2" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>
                Amount Due
              </span>
              <span className={`text-sm font-extrabold font-mono ${total > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                ${total.toFixed(2)}
              </span>
            </div>
            <div className="text-[11px] space-y-1 pt-1 border-t" style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}>
              <div className="flex justify-between">
                <span>Subtotal (Unpaid)</span>
                <span className="font-mono">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax ({taxRate}%)</span>
                <span className="font-mono">${tax.toFixed(2)}</span>
              </div>
              {paidTotal > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span className="flex items-center gap-1">
                    <span>Already Paid</span>
                    <span className="text-[9px] px-1 rounded bg-emerald-500/10 font-bold">Settled</span>
                  </span>
                  <span className="font-mono font-bold line-through">-${paidTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-1 border-t font-semibold" style={{ borderColor: 'var(--color-border)' }}>
                <span>Payment Status</span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-[5px] inline-block ${
                  allItems.length > 0 && allItems.every((it) => it.payment_status === 'paid')
                    ? 'badge-paid'
                    : 'badge-unpaid'
                }`}>
                  {allItems.length > 0 && allItems.every((it) => it.payment_status === 'paid') ? 'All Paid' : 'Unpaid'}
                </span>
              </div>
            </div>
          </div>

          {/* List Tickets Orders (Sidebar Mini Tickets) */}
          {orderItems.length > 0 && (
            <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>
                  Tickets ({orderItems.length})
                </span>
                <span className="text-[10px] text-[var(--color-muted)]">
                  {orderItems.filter(o => o.payment_status === 'paid').length} Paid / {orderItems.filter(o => o.payment_status !== 'paid').length} Unpaid
                </span>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {orderItems.map((ord, oIdx) => {
                  const ordPaid = ord.payment_status === 'paid'
                  const ordTot = Number(ord.total_amount || 0) || (ord.items || []).reduce((s, i) => s + (parseFloat(i.price || i.unit_price || 0) * (i.quantity || 1)), 0)
                  return (
                    <div
                      key={ord.id || oIdx}
                      className={`p-2 rounded-[5px] border text-xs flex items-center justify-between transition-all ${
                        ordPaid ? 'bg-black/5 dark:bg-white/5 opacity-70' : 'bg-[var(--color-surface)]'
                      }`}
                      style={{ borderColor: 'var(--color-border)' }}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Receipt size={12} className={ordPaid ? 'text-emerald-500' : 'text-amber-500'} />
                        <span className={`font-mono font-bold truncate ${ordPaid ? 'line-through text-slate-500' : ''}`} style={{ color: ordPaid ? undefined : 'var(--color-text)' }}>
                          #{ord.order_number || `ORD-${ord.id}`}
                        </span>
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded ${ordPaid ? 'badge-paid' : 'badge-unpaid'}`}>
                          {ordPaid ? 'Paid' : 'Unpaid'}
                        </span>
                      </div>
                      <span className={`font-mono font-extrabold text-[11px] ${ordPaid ? 'line-through text-slate-400' : 'text-rose-500'}`}>
                        ${ordTot.toFixed(2)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Action Customer calls (Real-time Live Alert Card) */}
          {activeCall && (
            <div
              className="p-3.5 rounded-[5px] border space-y-2.5 shadow-2xs animate-in fade-in slide-in-from-top-1"
              style={{
                background: activeCall.service_type === 'bill' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                borderColor: activeCall.service_type === 'bill' ? '#f59e0b' : '#ef4444'
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-black text-xs" style={{ color: activeCall.service_type === 'bill' ? '#b45309' : '#b91c1c' }}>
                  <Bell size={14} className="animate-bounce text-amber-500" />
                  <span>Customer Assistance</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-white/70 dark:bg-black/40" style={{ color: 'var(--color-text)' }}>
                  {activeCall.time}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="text-2xl">
                  {activeCall.service_type === 'water' ? '🧊'
                    : activeCall.service_type === 'cutlery' ? '🍴'
                    : activeCall.service_type === 'clean' ? '🧹'
                    : activeCall.service_type === 'bill' ? '💳'
                    : '🛎️'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black leading-tight" style={{ color: 'var(--color-text)' }}>
                    {activeCall.title}
                  </p>
                  <p className="text-[10px] text-[var(--color-muted)] mt-0.5 font-medium">
                    {activeCall.service_type === 'bill'
                      ? 'Guest is requesting the bill & payment'
                      : 'Live table service call received via QR'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1.5 border-t" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
                <button
                  type="button"
                  onClick={handleAcknowledgeCall}
                  className="flex-1 py-1.5 rounded-[4px] text-xs font-bold text-white shadow-xs transition-all hover:opacity-90 active:scale-95 cursor-pointer bg-amber-600 hover:bg-amber-700 text-center"
                >
                  ✓ Mark as Handled
                </button>
                {activeCall.service_type === 'bill' && (
                  <button
                    type="button"
                    onClick={() => {
                      navigate('/pos', {
                        state: {
                          resumeSession: session?.id || table.id,
                          tableId: table.id,
                          openCheckout: true,
                          existingItems: allItems,
                        }
                      })
                    }}
                    className="flex-1 py-1.5 rounded-[4px] text-xs font-bold text-white shadow-xs transition-all hover:opacity-90 active:scale-95 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-center"
                  >
                    Pay Bill 💳
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Ordered Items List */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden" style={{ background: 'var(--color-bg)' }}>
          <div className="p-3.5 px-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-xs" style={{ color: 'var(--color-text)' }}>
                Ordered Items ({allItems.length})
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {allItems.some((it) => it.payment_status === 'paid') && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-[5px] badge-paid">
                  {allItems.filter((it) => it.payment_status === 'paid').length} Paid
                </span>
              )}
              {allItems.some((it) => it.payment_status !== 'paid') && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-[5px] badge-unpaid">
                  {allItems.filter((it) => it.payment_status !== 'paid').length} Unpaid
                </span>
              )}
            </div>
          </div>

          {/* Items Container: Grouped by Ticket Order */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
            {loadingOrders ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                <RefreshCw size={18} className="animate-spin mr-2" /> Loading ordered tickets...
              </div>
            ) : orderItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-14 h-14 rounded-[5px] border flex items-center justify-center mb-3" style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
                  <ShoppingBag size={28} style={{ color: 'var(--color-muted)' }} />
                </div>
                <p className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>
                  No orders placed yet
                </p>
                <p className="text-xs mt-1 max-w-xs" style={{ color: 'var(--color-muted)' }}>
                  Scan the table QR code or use the POS terminal to add food items to this table.
                </p>
              </div>
            ) : (
              orderItems.map((order, orderIdx) => {
                const isOrderPaid = order.payment_status === 'paid'
                const orderTotal = Number(order.total_amount || 0) || (order.items || []).reduce((sum, it) => sum + (parseFloat(it.price || it.unit_price || 0) * (it.quantity || 1)), 0)
                const itemsList = order.items || []

                return (
                  <div
                    key={order.id || orderIdx}
                    className={`rounded-[5px] border shadow-xs overflow-hidden transition-all ${
                      isOrderPaid ? 'opacity-75' : ''
                    }`}
                    style={{
                      background: 'var(--color-card)',
                      borderColor: 'var(--color-border)'
                    }}
                  >
                    {/* Ticket Header */}
                    <div
                      className="px-3.5 py-2.5 border-b flex items-center justify-between gap-2"
                      style={{
                        background: isOrderPaid ? 'var(--color-bg)' : 'var(--color-surface)',
                        borderColor: 'var(--color-border)'
                      }}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex items-center gap-1.5 font-bold text-xs" style={{ color: 'var(--color-text)' }}>
                          <Receipt size={14} className={isOrderPaid ? 'text-emerald-500 shrink-0' : 'text-amber-500 shrink-0'} />
                          <span className={`font-mono font-extrabold ${isOrderPaid ? 'line-through text-slate-500' : ''}`}>
                            #{order.order_number || `ORD-${order.id}`}
                          </span>
                        </div>
                        {order.created_at && (
                          <span className="text-[11px] text-[var(--color-muted)]">
                            • {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                          </span>
                        )}
                        {order.accepted_role && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                            ✓ Accepted by: {order.accepted_role}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Payment Status Badge */}
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-[5px] inline-block ${
                          order.payment_status === 'paid' ? 'badge-paid' : 'badge-unpaid'
                        }`}>
                          {order.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
                        </span>

                        {/* Kitchen Order Status Badge */}
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-[5px] inline-block uppercase ${getItemStatusBadgeClass(order.status)}`}>
                          {formatItemStatusLabel(order.status)}
                        </span>

                        {/* Ticket Total Amount */}
                        <span className={`font-mono font-bold text-xs ml-1 ${
                          isOrderPaid ? 'line-through text-slate-400' : 'text-rose-500'
                        }`}>
                          ${orderTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Pending Approval Action Banner for Customer Orders */}
                    {(order.status === 'pending' || order.status === 'unconfirmed') && (
                      <div
                        className="px-3.5 py-2 border-b flex flex-wrap items-center justify-between gap-2 text-xs"
                        style={{ background: 'rgba(245, 158, 11, 0.08)', borderColor: 'var(--color-border)' }}
                      >
                        <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold">
                          <AlertCircle size={14} className="text-amber-500 animate-pulse" />
                          <span>New Customer Order — Awaiting Approval</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleRejectOrder(order.id)}
                            className="px-2.5 py-1 rounded-[4px] text-xs font-bold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer transition-all active:scale-95"
                          >
                            Reject
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApproveOrder(order.id)}
                            className="px-3 py-1 rounded-[4px] text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs cursor-pointer transition-all active:scale-95 flex items-center gap-1"
                          >
                            <Check size={13} />
                            <span>Approve Order</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Ticket Items List */}
                    <div className="p-3 space-y-2 divide-y divide-[var(--color-border)]">
                      {itemsList.map((item, idx) => {
                        const itemPrice = parseFloat(item.price || item.unit_price || 0)
                        const lineTotal = itemPrice * (item.quantity || 1)

                        return (
                          <div
                            key={`${item.id || idx}-${idx}`}
                            className={`flex items-center justify-between gap-3 ${idx > 0 ? 'pt-2' : ''}`}
                          >
                            {/* Item Image & Title */}
                            <div className="flex items-center gap-3 min-w-0">
                              {item.product?.image_url || item.image_url ? (
                                <img
                                  src={item.product?.image_url || item.image_url}
                                  alt={item.product?.name || item.name || 'Product'}
                                  className="w-10 h-10 rounded-[5px] object-cover border shrink-0"
                                  style={{ borderColor: 'var(--color-border)' }}
                                  onError={(e) => { e.target.style.display = 'none' }}
                                />
                              ) : (
                                <div
                                  className="w-10 h-10 rounded-[5px] flex items-center justify-center font-bold text-xs border shrink-0"
                                  style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-500, #BF4040)' }}
                                >
                                  {(item.item_product_name || item.product?.name || item.name || item.title || 'IT').slice(0, 2).toUpperCase()}
                                </div>
                              )}

                              <div className="min-w-0">
                                <h4 className={`font-bold text-xs truncate ${isOrderPaid ? 'line-through text-slate-500' : ''}`} style={{ color: isOrderPaid ? undefined : 'var(--color-text)' }}>
                                  {item.item_product_name || item.product?.name || item.name || item.title || 'Food Item'}
                                </h4>
                                <div className="flex items-center gap-2 mt-0.5 text-[11px]" style={{ color: 'var(--color-muted)' }}>
                                  <span>Qty: <strong className="font-mono text-slate-800 dark:text-slate-200">{item.quantity || 1}</strong></span>
                                  <span>•</span>
                                  <span className={`font-mono ${isOrderPaid ? 'line-through text-slate-400' : ''}`}>${itemPrice.toFixed(2)} ea</span>
                                </div>
                                {item.options && item.options.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {item.options.map((opt, oIdx) => {
                                      const optLabel =
                                        typeof opt === 'string'
                                          ? opt
                                          : opt?.option_value?.name || opt?.option_value?.value || opt?.name || 'Modifier'
                                      return (
                                        <span
                                          key={opt?.id || oIdx}
                                          className="text-[10px] px-1.5 py-0.5 rounded-[3px] bg-black/5 dark:bg-white/10 font-medium"
                                        >
                                          +{optLabel}
                                        </span>
                                      )
                                    })}
                                  </div>
                                )}
                                {item.special_instructions && (
                                  <p className="text-[10px] text-amber-600 dark:text-amber-400 italic mt-0.5">
                                    "{item.special_instructions}"
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Right: Item Line Total */}
                            <div className="text-right shrink-0">
                              <p className={`font-mono font-bold text-xs ${isOrderPaid ? 'line-through text-slate-400' : ''}`} style={{ color: isOrderPaid ? undefined : 'var(--color-text)' }}>
                                ${lineTotal.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TRANSFER TABLE MODAL
// ═══════════════════════════════════════════════════════════════════

function TransferTableModal({ isOpen, currentTable, tables = [], onClose, onTransfer }) {
  const [targetTableId, setTargetTableId] = useState('')

  if (!isOpen) return null

  const availableTables = tables.filter((t) =>
    String(t.id) !== String(currentTable?.id) &&
    (!t.status || t.status === 'available')
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="rounded-[5px] p-6 max-w-md w-full border shadow-2xl space-y-4"
        style={{
          background: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-[5px] flex items-center justify-center text-white font-bold"
              style={{ background: 'var(--color-500, #BF4040)' }}
            >
              <ArrowLeftRight size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm" style={{ color: 'var(--color-text)' }}>
                Transfer Table
              </h3>
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                Move active dine-in session to another table
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-3">
          <div className="p-3 rounded-[5px] border flex items-center justify-between text-xs" style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
            <span style={{ color: 'var(--color-muted)' }}>Current Table:</span>
            <span className="font-extrabold font-mono text-sm" style={{ color: 'var(--color-500, #BF4040)' }}>
              Table #{stripPrefix(currentTable?.table_number || currentTable?.id)}
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--color-text)' }}>
              Select Destination Table *
            </label>
            {availableTables.length === 0 ? (
              <p className="text-xs text-rose-500 italic p-3 bg-rose-500/10 rounded-[5px] border border-rose-500/20">
                No other available tables currently open.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                {availableTables.map((t) => {
                  const isSel = String(targetTableId) === String(t.id)
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTargetTableId(t.id)}
                      className={`p-3 rounded-[5px] border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                        isSel
                          ? 'border-2 border-emerald-500 bg-emerald-500/10 text-emerald-600 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>Table #{stripPrefix(t.table_number || t.id)}</span>
                      <span className="text-[10px] opacity-75">{t.capacity || 4} seats</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded-[5px] text-xs font-bold border"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!targetTableId}
            onClick={() => onTransfer(currentTable.id, targetTableId)}
            className="flex-1 py-2 rounded-[5px] text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm disabled:opacity-40"
          >
            Confirm Transfer
          </button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// MAIN ACTIVE SESSIONS & FLOOR PLAN PAGE
// ═══════════════════════════════════════════════════════════════════

const ZONES = ['Main Dining', 'Terrace', 'Outdoor', 'VIP Lounge']

export default function ActiveSessions() {
  const { tables, sessions, fetchTables, fetchSessions, openSession, closeSession, updateTableStatus } = useTableStore()
  const { subscribe } = useWebSocket('cashier')
  const [selectedZone, setSelectedZone] = useState('Main Dining')
  const [filterTab, setFilterTab] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedTable, setSelectedTable] = useState(null)
  const [inspectedTable, setInspectedTable] = useState(null)
  const [transferModal, setTransferModal] = useState(null)
  const [qrModal, setQrModal] = useState(null)

  useEffect(() => {
    fetchTables()
    fetchSessions()
  }, [])

  // Real-time synchronization via WebSocket for Cashier room
  useEffect(() => {
    const unsubOrderUpdated = subscribe('order_updated', () => {
      fetchTables()
      fetchSessions()
    })
    const unsubNewOrder = subscribe('new_order', () => {
      fetchTables()
      fetchSessions()
    })
    const unsubTableUpdated = subscribe('table_updated', () => {
      fetchTables()
      fetchSessions()
    })
    const unsubPayment = subscribe('payment_completed', () => {
      fetchTables()
      fetchSessions()
    })
    const unsubCall = subscribe('call_cashier', () => {
      fetchTables()
      fetchSessions()
    })

    return () => {
      unsubOrderUpdated?.()
      unsubNewOrder?.()
      unsubTableUpdated?.()
      unsubPayment?.()
      unsubCall?.()
    }
  }, [subscribe, fetchTables, fetchSessions])

  const handleOpen = async (tableId) => {
    try {
      await openSession(tableId)
      toast.success(`Session opened for Table ${tableId}`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to open session')
    }
  }

  const handleOpenQR = async (table) => {
    let sess = sessions.find((s) => s.table_id === table.id && s.status === 'active')
    if (!sess) {
      try {
        const res = await openSession(table.id)
        sess = res?.data || res
        toast.success(`Dining session opened for Table #${stripPrefix(table.table_number || table.id)}`)
      } catch (err) {
        toast.error('Failed to open dining session for table')
        return
      }
    }
    setQrModal({
      table,
      sessionToken: sess?.session_token
    })
  }

  const handleClose = async (sessionId, tableId) => {
    try {
      if (sessionId) {
        await closeSession(sessionId, tableId)
      } else if (tableId && updateTableStatus) {
        await updateTableStatus(tableId, 'available')
      }
      toast.success('Session closed & table reset to Available')
      setSelectedTable(null)
      setInspectedTable(null)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to close session')
    }
  }

  const handleUpdateTableStatus = async (tableId, newStatus) => {
    try {
      if (updateTableStatus) {
        await updateTableStatus(tableId, newStatus)
      }
      toast.success(`Table status updated to ${newStatus}`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update table status')
    }
  }

  const handleTransferTable = async (fromTableId, toTableId) => {
    try {
      // Close session on fromTable and open on toTable
      const fromSession = sessions.find(s => s.table_id === fromTableId)
      if (fromSession) {
        await closeSession(fromSession.id, fromTableId)
      }
      await openSession(toTableId)
      toast.success(`Session transferred to Table #${toTableId}`)
      setTransferModal(null)
      setInspectedTable(null)
      fetchTables()
      fetchSessions()
    } catch (err) {
      toast.error('Failed to transfer table')
    }
  }

  // Filter tables
  const filteredTables = useMemo(() => {
    return tables.filter((t) => {
      const matchZone = !selectedZone || selectedZone === 'All' || (t.floor_zone || 'Main Dining') === selectedZone
      const matchSearch = !search || String(t.table_number).toLowerCase().includes(search.toLowerCase())
      return matchZone && matchSearch
    })
  }, [tables, selectedZone, search])

  // Summary counts
  const countAll = tables.length
  const countOccupied = tables.filter((t) => t.status === 'occupied' || sessions.some((s) => s.table_id === t.id && s.status === 'active')).length
  const countAvailable = countAll - countOccupied
  const countReserved = tables.filter((t) => t.status === 'reserved').length

  const selectedSession = sessions.find((s) => s.table_id === selectedTable?.id && s.status === 'active')
  const inspectedSession = sessions.find((s) => s.table_id === inspectedTable?.id && s.status === 'active')

  // If user is inspecting a specific table's detailed orders
  if (inspectedTable) {
    return (
      <CashierLayout>
        <TableDetailView
          table={inspectedTable}
          session={inspectedSession}
          onClose={() => setInspectedTable(null)}
          onRefresh={() => { fetchTables(); fetchSessions(); }}
          onUpdateStatus={handleUpdateTableStatus}
          onTransferTable={(tbl) => setTransferModal(tbl)}
        />
        {transferModal && (
          <TransferTableModal
            isOpen={!!transferModal}
            currentTable={transferModal}
            tables={tables}
            onClose={() => setTransferModal(null)}
            onTransfer={handleTransferTable}
          />
        )}
      </CashierLayout>
    )
  }

  return (
    <CashierLayout>
      <div className="flex flex-col h-full overflow-hidden w-full max-w-full">
        {/* ── Top Header & Stats Summary Bar ── */}
        <div
          className="p-4 border-b flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-xs"
          style={{
            background: 'var(--color-surface)',
            borderColor: 'var(--color-border)'
          }}
        >
          {/* Quick Stat Counters */}
          <div className="flex items-center gap-4">
            <div className="text-center shrink-0">
              <p className="font-extrabold text-sm font-mono leading-none" style={{ color: 'var(--color-text)' }}>{countAll}</p>
              <p className="text-[10px] font-semibold mt-1" style={{ color: 'var(--color-muted)' }}>Total</p>
            </div>
            <div className="text-center shrink-0">
              <p className="font-extrabold text-sm font-mono leading-none text-emerald-500">{countAvailable}</p>
              <p className="text-[10px] font-semibold mt-1 text-emerald-600">Available</p>
            </div>
            <div className="text-center shrink-0">
              <p className="font-extrabold text-sm font-mono leading-none text-rose-500">{countOccupied}</p>
              <p className="text-[10px] font-semibold mt-1 text-rose-600">On Dine</p>
            </div>
            <div className="text-center shrink-0">
              <p className="font-extrabold text-sm font-mono leading-none text-teal-600">{countReserved}</p>
              <p className="text-[10px] font-semibold mt-1 text-teal-700">Reserved</p>
            </div>
          </div>

          {/* Actions & Zones */}
          <div className="flex items-center gap-2.5">
            {/* Zone Selector Pills */}
            <div className="flex items-center gap-1 p-1 rounded-[5px] border" style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
              {ZONES.map((z) => {
                const isSel = selectedZone === z
                return (
                  <button
                    key={z}
                    type="button"
                    onClick={() => setSelectedZone(z)}
                    className={`px-3 py-1.5 rounded-[5px] text-xs font-bold transition-all ${
                      isSel
                        ? 'text-white shadow-xs'
                        : 'hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                    style={
                      isSel
                        ? { background: 'linear-gradient(135deg, var(--color-500, #BF4040), var(--color-600, #9D3434))', color: '#ffffff' }
                        : { color: 'var(--color-text-secondary)' }
                    }
                  >
                    {z}
                  </button>
                )
              })}
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={() => { fetchTables(); fetchSessions(); toast.success('Table status refreshed'); }}
              className="p-2 rounded-[5px] border flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/5"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
              title="Refresh Tables"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* ── Main Split View ── */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* ══════════════════════════════════════════════════════════════
              LEFT SIDEBAR — ACTIVE SESSIONS & QUEUE
          ══════════════════════════════════════════════════════════════ */}
          <div
            className="w-80 flex flex-col border-r shrink-0 overflow-hidden select-none"
            style={{
              background: 'var(--color-surface)',
              borderColor: 'var(--color-border)'
            }}
          >
            {/* Search Input */}
            <div className="p-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-[5px] border text-xs shadow-xs"
                style={{
                  background: 'var(--color-bg)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <Search size={14} style={{ color: 'var(--color-muted)' }} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search table or guest..."
                  className="bg-transparent border-none outline-none w-full text-xs placeholder:text-slate-400"
                  style={{ color: 'var(--color-text)' }}
                />
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-2 border-b overflow-x-auto no-scrollbar" style={{ borderColor: 'var(--color-border)' }}>
              {[
                { id: 'all', label: 'All', count: countAll },
                { id: 'occupied', label: 'On Dine', count: countOccupied },
                { id: 'available', label: 'Available', count: countAvailable },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilterTab(f.id)}
                  className={`px-2.5 py-1 rounded-[5px] text-[11px] font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    filterTab === f.id
                      ? 'text-white shadow-xs'
                      : 'hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                  style={
                    filterTab === f.id
                      ? { background: 'var(--color-500, #BF4040)', color: '#ffffff' }
                      : { color: 'var(--color-text-secondary)' }
                  }
                >
                  <span>{f.label}</span>
                  <span className="opacity-80 text-[10px]">({f.count})</span>
                </button>
              ))}
            </div>

            {/* List of Tables / Active Sessions */}
            <div className="flex-1 min-h-0 overflow-y-auto py-2">
              {tables
                .filter((t) => {
                  const isOcc = t.status === 'occupied' || sessions.some((s) => s.table_id === t.id && s.status === 'active')
                  if (filterTab === 'occupied') return isOcc
                  if (filterTab === 'available') return !isOcc
                  return true
                })
                .map((t) => {
                  const sess = sessions.find((s) => s.table_id === t.id && s.status === 'active')
                  return (
                    <ReservationCard
                      key={t.id}
                      table={t}
                      session={sess}
                      active={selectedTable?.id === t.id}
                      onClick={() => setSelectedTable(selectedTable?.id === t.id ? null : t)}
                      onInspect={(tbl) => setInspectedTable(tbl)}
                    />
                  )
                })}
            </div>

            {/* Selected Table Quick Actions Drawer */}
            {selectedTable && (
              <div
                className="p-3.5 border-t space-y-2.5 shadow-lg shrink-0 animate-in fade-in slide-in-from-bottom-2 duration-150"
                style={{
                  background: 'var(--color-card)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs" style={{ color: 'var(--color-text)' }}>
                    Table #{stripPrefix(selectedTable.table_number)} Selected
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedTable(null)}
                    className="p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X size={13} />
                  </button>
                </div>

                {selectedSession ? (
                  <div className="space-y-2">
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setInspectedTable(selectedTable)}
                        className="flex-1 py-2 rounded-[5px] text-xs font-bold border transition-colors hover:opacity-80 flex items-center justify-center gap-1 cursor-pointer"
                        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                      >
                        <Eye size={13} /> View Orders
                      </button>
                      <button
                        type="button"
                        onClick={() => handleClose(selectedSession.id, selectedTable.id)}
                        className="flex-1 py-2 rounded-[5px] text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-sm transition-all cursor-pointer"
                      >
                        Close Session
                      </button>
                    </div>
                  </div>
                ) : selectedTable?.status === 'occupied' || selectedTable?.status === 'reserved' || selectedTable?.status === 'cleaning' ? (
                  <div className="space-y-2">
                    <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                      Table status is <strong className="capitalize">{selectedTable.status}</strong> without an active session.
                    </p>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleUpdateTableStatus(selectedTable.id, 'available')}
                        className="flex-1 py-2 rounded-[5px] text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm transition-all cursor-pointer"
                      >
                        Mark Available
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpen(selectedTable.id)}
                        className="flex-1 py-2 rounded-[5px] text-xs font-bold text-white shadow-sm transition-all cursor-pointer"
                        style={{
                          background: 'linear-gradient(135deg, var(--color-500, #BF4040), var(--color-600, #9D3434))'
                        }}
                      >
                        Open Session
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                      Table is currently empty and available for seating.
                    </p>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenQR(selectedTable)}
                        className="flex-1 py-2 rounded-[5px] text-xs font-bold border transition-colors hover:opacity-80 flex items-center justify-center gap-1 cursor-pointer"
                        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                      >
                        <QrCode size={13} /> QR Menu
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpen(selectedTable.id)}
                        className="flex-1 py-2 rounded-[5px] text-xs font-bold text-white shadow-sm transition-all cursor-pointer"
                        style={{
                          background: 'linear-gradient(135deg, var(--color-500, #BF4040), var(--color-600, #9D3434))'
                        }}
                      >
                        Open Session
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════════════
              RIGHT 2D FLOOR MAP CANVAS
          ══════════════════════════════════════════════════════════════ */}
          <div
            className="flex-1 min-h-0 overflow-y-auto p-6 flex flex-col items-center justify-start relative"
            style={{ background: 'var(--color-bg)' }}
          >
            {/* Zone Tag & Legend */}
            <div className="w-full flex items-center justify-between mb-6 pb-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex items-center gap-2">
                <MapPin size={16} style={{ color: 'var(--color-500, #BF4040)' }} />
                <span className="font-extrabold text-sm" style={{ color: 'var(--color-text)' }}>
                  {selectedZone} Area
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-[5px] bg-black/5 dark:bg-white/10" style={{ color: 'var(--color-muted)' }}>
                  {filteredTables.length} Tables
                </span>
              </div>

              {/* Status Legend */}
              <div className="flex items-center gap-4 text-xs font-semibold" style={{ color: 'var(--color-muted)' }}>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-[3px]" style={{ background: '#E9EFFF', border: '1px solid #CBD5E1' }} />
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-[3px]" style={{ background: '#FDDCD4', border: '1px solid #E85D3F' }} />
                  <span className="text-rose-500">On Dine</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-[3px]" style={{ background: '#BCE7DF', border: '1px solid #149B89' }} />
                  <span className="text-teal-600">Reserved</span>
                </div>
              </div>
            </div>

            {/* 2D Table Layout Grid */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center items-center py-4">
              {filteredTables.map((t) => {
                const sess = sessions.find((s) => s.table_id === t.id && s.status === 'active')
                return (
                  <TableCell
                    key={t.id}
                    table={t}
                    session={sess}
                    isHighlighted={selectedTable?.id === t.id}
                    onSelect={(tbl) => setSelectedTable(selectedTable?.id === tbl.id ? null : tbl)}
                    onInspect={(tbl) => setInspectedTable(tbl)}
                    onOpen={() => handleOpen(t.id)}
                    onClose={() => handleClose(sess?.id, t.id)}
                    onQR={(tbl) => handleOpenQR(tbl)}
                  />
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Real Customer Scan & Order QR Modal (Token Session Only) ── */}
      {qrModal && (() => {
        const menuToken = qrModal.sessionToken
        const cleanTbl = stripPrefix(qrModal.table?.table_number || qrModal.table?.id)
        const menuUrl = `${window.location.origin}/menu/${menuToken}`

        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
            <div
              className="rounded-2xl p-5 w-full max-w-sm border shadow-2xl space-y-3 text-center"
              style={{
                background: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
              }}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b pb-2.5" style={{ borderColor: 'var(--color-border)' }}>
                <div className="text-left">
                  <h3 className="text-sm font-extrabold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                    <span>Table #{cleanTbl} QR Code</span>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600"
                    >
                      Live Dining Session
                    </span>
                  </h3>
                  <p className="text-[11px]" style={{ color: 'var(--color-muted)' }}>
                    Customer Digital Menu & Contactless Ordering
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setQrModal(null)}
                  className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer text-slate-400 hover:text-slate-600"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Real QR Code Display */}
              <div
                className="p-4 rounded-xl border flex flex-col items-center justify-center shadow-2xs space-y-2.5"
                style={{
                  background: '#ffffff',
                  borderColor: 'var(--color-border)'
                }}
              >
                <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center">
                  <QRCodeSVG
                    value={menuUrl}
                    size={175}
                    level="H"
                    includeMargin={false}
                  />
                </div>

                <div className="space-y-0.5 text-center w-full">
                  <p className="text-[10px] font-mono font-bold text-slate-800 break-all select-all px-2 py-1 rounded bg-slate-100 border border-slate-200">
                    {menuUrl}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Point phone camera at QR code to open customer menu
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(menuUrl)
                    toast.success('Customer Menu URL copied to clipboard!')
                  }}
                  className="flex-1 py-2.5 rounded-lg text-xs font-bold border transition-colors hover:opacity-80 cursor-pointer"
                  style={{
                    background: 'var(--color-card)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)'
                  }}
                >
                  Copy Link
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.open(menuUrl, '_blank')
                  }}
                  className="flex-1 py-2.5 rounded-lg text-xs font-bold text-white shadow-md transition-all hover:opacity-90 cursor-pointer flex items-center justify-center gap-1.5"
                  style={{
                    background: 'linear-gradient(135deg, var(--color-500, #BF4040), var(--color-600, #9D3434))'
                  }}
                >
                  <span>Open Menu</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── Transfer Table Modal ── */}
      {transferModal && (
        <TransferTableModal
          isOpen={!!transferModal}
          currentTable={transferModal}
          tables={tables}
          onClose={() => setTransferModal(null)}
          onTransfer={handleTransferTable}
        />
      )}
    </CashierLayout>
  )
}
