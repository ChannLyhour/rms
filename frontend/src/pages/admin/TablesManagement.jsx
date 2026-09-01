import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import { CreateButton } from '../../components/common/ButtonComponent'
import { posApi } from '../../api/posApi'
import { adminApi } from '../../api/adminApi'
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
  ShoppingBag,
  UtensilsCrossed,
  CreditCard,
  Receipt,
  ArrowRight
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
  emptyChair: '#CBD5E1',
}

const getStatusType = (status) => {
  const s = String(status || '').toLowerCase()
  if (['occupied', 'active', 'calling_waiter', 'bill_requested'].includes(s)) return 'occupied'
  if (['reserved'].includes(s)) return 'reserved'
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
// ═══════════════════════════════════════════════════════════════════
// 2D TABLE CELL COMPONENT
// ═══════════════════════════════════════════════════════════════════

function TableCell({ table, session, orderStats, onEdit, onQR, onSelect, isHighlighted }) {
  const isOccupied = table.status === 'occupied' || !!session
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

  const orderTotal = Number(orderStats?.total || 0)

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
          onClick={() => (onSelect ? onSelect(table) : onEdit(table))}
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
            onClick={(e) => {
              e.stopPropagation()
              onQR(table)
            }}
            className="absolute top-1.5 right-1.5 p-1 rounded-[5px] opacity-40 hover:opacity-100 transition-opacity"
            style={{ color: theme.textColor }}
            title="View Table QR Code"
          >
            <QrCode size={12} />
          </button>

          {/* Quick Edit button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onEdit(table)
            }}
            className="absolute top-1.5 left-1.5 p-1 rounded-[5px] opacity-40 hover:opacity-100 transition-opacity"
            style={{ color: theme.textColor }}
            title="Edit Table"
          >
            <Edit2 size={11} />
          </button>

          <span className="font-extrabold text-xs tracking-tight" style={{ color: theme.textColor }}>
            Table #{num}
          </span>

          <div className="flex items-center gap-1 mt-0.5 opacity-90" style={{ color: theme.textColor }}>
            <Users size={11} />
            <span className="text-[11px] font-bold">
              {isOccupied ? `${guests} seated` : `${totalChairs} seats`}
            </span>
          </div>

          {isOccupied && orderTotal > 0 && (
            <span
              className="text-[10px] font-mono font-black mt-0.5 px-1.5 py-0.2 rounded-[3px] bg-black/10 dark:bg-black/25"
              style={{ color: theme.textColor }}
            >
              ${orderTotal.toFixed(2)}
            </span>
          )}
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

function ReservationCard({ session, table, orderTotal = 0, active, onClick, onOpenOrders, onOpenQR }) {
  const isOccupied = table.status === 'occupied' || (session && session.status === 'active')
  const isReserved = table.status === 'reserved'

  return (
    <div
      onClick={onClick}
      className={`rounded-[5px] p-3 mx-2 mb-2 flex items-center justify-between gap-3 cursor-pointer border transition-all shadow-xs ${
        active
          ? 'ring-2 ring-[#149B89]/20 border-[#149B89]'
          : 'hover:border-slate-300 dark:hover:border-slate-700'
      }`}
      style={{
        background: 'var(--color-card)',
        borderColor: active ? '#149B89' : 'var(--color-border)',
      }}
    >
      {/* Left side: Status Badge + Table Info */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Left Badge */}
        <div
          className="w-11 h-11 rounded-[5px] flex flex-col items-center justify-center text-center shrink-0 font-mono"
          style={{
            background: isOccupied ? '#FEE2E2' : isReserved ? '#BCE7DF' : '#E0F2FE',
            color: isOccupied ? '#DC2626' : isReserved ? '#135E54' : '#0369A1',
          }}
        >
          <span className="text-[9px] font-extrabold uppercase leading-none">
            {isOccupied ? 'LIVE' : isReserved ? 'RSVD' : 'FREE'}
          </span>
          <span className="text-[10px] font-bold leading-tight mt-0.5">
            {isOccupied ? 'DINE' : 'TABLE'}
          </span>
        </div>

        {/* Details */}
        <div className="min-w-0 flex-1">
          <p className="font-bold text-xs truncate" style={{ color: 'var(--color-text)' }}>
            {session?.customer_name || `Table #${stripPrefix(table?.table_number || table?.id)}`}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5 text-[11px]" style={{ color: 'var(--color-muted)' }}>
            <span>🪑</span>
            <span>Table #{stripPrefix(table?.table_number || table?.id)}</span>
          </div>
        </div>
      </div>

      {/* Right side: Real-time Order Amount & "Orders >" link */}
      <div className="text-right shrink-0">
        <p className="font-mono font-extrabold text-xs" style={{ color: isOccupied ? '#E85D3F' : 'var(--color-muted)' }}>
          {isOccupied ? `$${Number(orderTotal || 0).toFixed(2)}` : '—'}
        </p>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onOpenOrders(table, session)
          }}
          className="text-[11px] font-bold text-[#149B89] hover:text-[#0f7668] hover:underline flex items-center justify-end gap-0.5 mt-1 cursor-pointer transition-colors"
        >
          <span>Orders</span>
          <span>&gt;</span>
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// REAL-TIME TABLE ORDERS MODAL
// ═══════════════════════════════════════════════════════════════════

function TableOrdersModal({ table, session, orders = [], onClose, onOpenPOS, onOpenQR }) {
  if (!table) return null

  const isOccupied = table.status === 'occupied' || !!session
  const subtotal = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0)

  const getBadgeClass = (status) => {
    const s = String(status || '').toLowerCase()
    if (s === 'completed' || s === 'ready' || s === 'served') return 'badge-order-finished'
    if (s === 'preparing' || s === 'cooking' || s === 'confirmed') return 'badge-order-processing'
    if (s === 'cancelled') return 'badge-order-cancelled'
    return 'badge-order-pending'
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div
        className="rounded-xl w-full max-w-lg border shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        style={{
          background: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between shrink-0" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border font-mono"
              style={{
                background: isOccupied ? '#FEE2E2' : '#E0F2FE',
                color: isOccupied ? '#DC2626' : '#0369A1',
                borderColor: 'var(--color-border)'
              }}
            >
              #{stripPrefix(table?.table_number || table?.id)}
            </div>
            <div>
              <h3 className="font-extrabold text-sm flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                <span>Table #{stripPrefix(table?.table_number || table?.id)}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize" style={{ background: 'var(--color-bg)', color: 'var(--color-muted)' }}>
                  {table?.floor_zone || 'Main Dining'}
                </span>
              </h3>
              <p className="text-xs text-[var(--color-muted)] mt-0.5">
                {session?.customer_name ? `Customer: ${session.customer_name}` : 'Live Real-Time Orders & Tickets'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onOpenQR(table)}
              className="p-2 rounded-lg border text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              title="Table QR Code"
            >
              <QrCode size={15} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg border text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Orders List Container */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3" style={{ background: 'var(--color-bg)' }}>
          {orders.length === 0 ? (
            <div className="text-center py-10 flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-xl border flex items-center justify-center mb-2" style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
                <ShoppingBag size={22} style={{ color: 'var(--color-muted)' }} />
              </div>
              <p className="font-bold text-xs" style={{ color: 'var(--color-text)' }}>No orders placed yet</p>
              <p className="text-[11px] text-[var(--color-muted)] mt-0.5">Orders placed via QR code or POS terminal will appear here in real-time.</p>
            </div>
          ) : (
            orders.map((order, idx) => (
              <div
                key={order.id || idx}
                className="p-3 rounded-xl border shadow-2xs space-y-2.5"
                style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
              >
                {/* Ticket Header */}
                <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-xs" style={{ color: 'var(--color-text)' }}>
                      #{order.order_number || `ORD-${order.id}`}
                    </span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-[5px] uppercase ${getBadgeClass(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-[5px] ${order.payment_status === 'paid' ? 'badge-paid' : 'badge-unpaid'}`}>
                      {order.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
                    </span>
                    <span className="font-mono font-black text-xs text-rose-500">
                      ${Number(order.total_amount || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Items in Ticket */}
                <div className="space-y-1.5">
                  {(order.items || []).map((item, iIdx) => {
                    const price = Number(item.price || item.unit_price || 0)
                    return (
                      <div key={item.id || iIdx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-mono font-bold text-slate-500">{item.quantity || 1}x</span>
                          <span className="font-medium truncate" style={{ color: 'var(--color-text)' }}>
                            {item.product?.name || item.name || 'Food Item'}
                          </span>
                        </div>
                        <span className="font-mono text-slate-600 dark:text-slate-400 shrink-0">
                          ${(price * (item.quantity || 1)).toFixed(2)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary & Quick Action */}
        <div className="p-4 border-t shrink-0 space-y-3" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[var(--color-muted)]">Active Orders Total:</span>
            <span className="font-mono font-black text-sm text-rose-500">
              ${subtotal.toFixed(2)}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => onOpenPOS(table, session)}
              className="flex-1 py-2.5 rounded-lg text-xs font-extrabold text-white shadow-md hover:opacity-90 cursor-pointer flex items-center justify-center gap-1.5"
              style={{
                background: 'linear-gradient(135deg, var(--color-500, #BF4040), var(--color-600, #9D3434))'
              }}
            >
              <CreditCard size={14} />
              <span>POS Terminal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// MAIN TABLES MANAGER PAGE
// ═══════════════════════════════════════════════════════════════════

const ZONES = ['Main Dining', 'Terrace', 'Outdoor', 'VIP Lounge']

export default function TablesManagement() {
  const navigate = useNavigate()
  const [tables, setTables] = useState([])
  const [sessions, setSessions] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedZone, setSelectedZone] = useState('Main Dining')
  const [filterTab, setFilterTab] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedTable, setSelectedTable] = useState(null)
  const [inspectingOrders, setInspectingOrders] = useState(null)
  const [tableModal, setTableModal] = useState(false)
  const [editingTable, setEditingTable] = useState(null)
  const [qrModal, setQrModal] = useState(null)
  const [form, setForm] = useState({ table_number: '', capacity: 4, floor_zone: 'Main Dining' })

  const { subscribe } = useWebSocket('cashier')

  const loadData = useCallback(async (isManual = false) => {
    if (isManual) setLoading(true)
    try {
      const [tRes, sRes, oRes] = await Promise.allSettled([
        posApi.getTables(),
        posApi.getSessions(),
        adminApi.getOrders({ limit: 150 }),
      ])
      if (tRes.status === 'fulfilled') setTables(tRes.value.data?.data || [])
      if (sRes.status === 'fulfilled') setSessions(sRes.value.data?.data || [])
      if (oRes.status === 'fulfilled') {
        const orderList = oRes.value.data?.data?.data || oRes.value.data?.data || []
        setOrders(orderList)
      }
    } finally {
      if (isManual) setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData(true)

    const unsubOrder = subscribe('order_updated', () => loadData(false))
    const unsubNewOrder = subscribe('new_order', () => loadData(false))
    const unsubPay = subscribe('payment_completed', () => loadData(false))
    const unsubTable = subscribe('table_updated', () => loadData(false))
    const unsubCall = subscribe('call_cashier', () => loadData(false))

    return () => {
      if (unsubOrder) unsubOrder()
      if (unsubNewOrder) unsubNewOrder()
      if (unsubPay) unsubPay()
      if (unsubTable) unsubTable()
      if (unsubCall) unsubCall()
    }
  }, [loadData, subscribe])

  // Real-time table order totals & tickets lookup
  const tableOrderStats = useMemo(() => {
    const map = {}
    tables.forEach((t) => {
      const sess = sessions.find((s) => s.table_id === t.id && s.status === 'active')
      if (sess) {
        const sessionOrders = orders.filter(
          (o) => o.table_session_id === sess.id && o.status !== 'cancelled'
        )
        const total = sessionOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0)
        map[t.id] = {
          total,
          count: sessionOrders.length,
          orders: sessionOrders,
        }
      } else {
        map[t.id] = { total: 0, count: 0, orders: [] }
      }
    })
    return map
  }, [tables, sessions, orders])

  const handleOpenPOS = (tbl, sess) => {
    navigate('/pos', { state: { resumeSession: sess?.id || tbl?.id } })
  }

  const handleOpenAdd = () => {
    setEditingTable(null)
    setForm({ table_number: `T-${tables.length + 1}`, capacity: 4, floor_zone: selectedZone })
    setTableModal(true)
  }

  const handleOpenEdit = (t) => {
    setEditingTable(t)
    setForm({ table_number: t.table_number, capacity: t.capacity || 4, floor_zone: t.floor_zone || 'Main Dining' })
    setTableModal(true)
  }

  const handleSaveTable = async (e) => {
    e?.preventDefault()
    if (!form.table_number.trim()) {
      toast.error('Table number is required')
      return
    }

    if (editingTable) {
      setTables((prev) =>
        prev.map((t) =>
          t.id === editingTable.id
            ? { ...t, table_number: form.table_number, capacity: parseInt(form.capacity) || 4, floor_zone: form.floor_zone }
            : t
        )
      )
      toast.success(`Table ${form.table_number} updated`)
    } else {
      const newT = {
        id: Date.now(),
        table_number: form.table_number,
        capacity: parseInt(form.capacity) || 4,
        floor_zone: form.floor_zone || 'Main Dining',
        status: 'available'
      }
      setTables((prev) => [...prev, newT])
      toast.success(`Table ${form.table_number} created`)
    }

    setTableModal(false)
    setEditingTable(null)
  }

  const handleDeleteTable = (tId) => {
    setTables((prev) => prev.filter((t) => t.id !== tId))
    toast.success('Table removed')
    setTableModal(false)
  }

  // Filter tables by zone & search
  const filteredTables = useMemo(() => {
    return tables.filter((t) => {
      const matchZone = !selectedZone || selectedZone === 'All' || (t.floor_zone || 'Main Dining') === selectedZone
      const matchSearch = !search || String(t.table_number).toLowerCase().includes(search.toLowerCase())
      return matchZone && matchSearch
    })
  }, [tables, selectedZone, search])

  // Summary counts
  const countAll = tables.length
  const countOccupied = tables.filter((t) => t.status === 'occupied' || sessions.some((s) => s.table_id === t.id)).length
  const countAvailable = countAll - countOccupied
  const countReserved = tables.filter((t) => t.status === 'reserved').length

  return (
    <AdminLayout>
      <div className="flex flex-col h-full overflow-hidden w-full max-w-full">
        {/* ── Top Header & Stats Summary Bar ── */}
        <div
          className="p-4 border-b flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-xs"
          style={{
            background: 'var(--color-surface)',
            borderColor: 'var(--color-border)'
          }}
        >
          {/* Title & Stats */}
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
            <div>
              <h1 className="text-base font-black tracking-tight" style={{ color: 'var(--color-text)' }}>
                Tables & 2D Floor Plan
              </h1>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                Live visual restaurant floor management
              </p>
            </div>

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />

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
              onClick={loadData}
              className="p-2 rounded-[5px] border flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/5"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
              title="Refresh Tables"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>

            {/* Add Table Button */}
            <CreateButton
              label="Add Table"
              onClick={handleOpenAdd}
              size="sm"
            />
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
                  const isOcc = t.status === 'occupied' || sessions.some((s) => s.table_id === t.id)
                  if (filterTab === 'occupied') return isOcc
                  if (filterTab === 'available') return !isOcc
                  return true
                })
                .map((t) => {
                  const sess = sessions.find((s) => s.table_id === t.id)
                  const stats = tableOrderStats[t.id] || { total: 0, orders: [] }
                  return (
                    <ReservationCard
                      key={t.id}
                      table={t}
                      session={sess}
                      orderTotal={stats.total}
                      active={selectedTable?.id === t.id}
                      onClick={() => setSelectedTable(selectedTable?.id === t.id ? null : t)}
                      onOpenOrders={() => setInspectingOrders({ table: t, session: sess, orders: stats.orders })}
                      onOpenQR={() => setQrModal(t)}
                    />
                  )
                })}
            </div>
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
                  {filteredTables.length} Tables Assigned
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
                const sess = sessions.find((s) => s.table_id === t.id)
                const stats = tableOrderStats[t.id] || { total: 0, orders: [] }
                return (
                  <TableCell
                    key={t.id}
                    table={t}
                    session={sess}
                    orderStats={stats}
                    isHighlighted={selectedTable?.id === t.id}
                    onSelect={(tbl) => setSelectedTable(selectedTable?.id === tbl.id ? null : tbl)}
                    onEdit={handleOpenEdit}
                    onQR={(tbl) => setQrModal(tbl)}
                  />
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Table Create / Edit Modal ── */}
      {tableModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className="rounded-[5px] p-6 w-full max-w-md border shadow-2xl space-y-4"
            style={{
              background: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--color-border)' }}>
              <h3 className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
                {editingTable ? `Edit Table #${stripPrefix(editingTable.table_number)}` : 'Add New Restaurant Table'}
              </h3>
              <button
                type="button"
                onClick={() => setTableModal(false)}
                className="p-1 rounded-[5px] hover:bg-black/5 dark:hover:bg-white/5"
                style={{ color: 'var(--color-muted)' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveTable} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold mb-1" style={{ color: 'var(--color-text)' }}>
                  Table Identifier / Name
                </label>
                <input
                  type="text"
                  value={form.table_number}
                  onChange={(e) => setForm({ ...form, table_number: e.target.value })}
                  placeholder="e.g. T-1, Table 12, VIP-1"
                  required
                  className="w-full px-3 py-2 rounded-[5px] border outline-none font-bold"
                  style={{
                    background: 'var(--color-bg)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)'
                  }}
                />
              </div>

              <div>
                <label className="block font-bold mb-1" style={{ color: 'var(--color-text)' }}>
                  Seating Capacity
                </label>
                <select
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-[5px] border outline-none font-bold cursor-pointer"
                  style={{
                    background: 'var(--color-bg)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)'
                  }}
                >
                  <option value={2}>2 Guests (Small Cozy Table)</option>
                  <option value={4}>4 Guests (Standard Table)</option>
                  <option value={6}>6 Guests (Large Dining Table)</option>
                  <option value={8}>8 Guests (Family Table)</option>
                  <option value={10}>10 Guests (Party / VIP Table)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1" style={{ color: 'var(--color-text)' }}>
                  Floor Zone Location
                </label>
                <select
                  value={form.floor_zone}
                  onChange={(e) => setForm({ ...form, floor_zone: e.target.value })}
                  className="w-full px-3 py-2 rounded-[5px] border outline-none font-bold cursor-pointer"
                  style={{
                    background: 'var(--color-bg)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)'
                  }}
                >
                  {ZONES.map((z) => (
                    <option key={z} value={z}>{z}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                {editingTable && (
                  <button
                    type="button"
                    onClick={() => handleDeleteTable(editingTable.id)}
                    className="px-3 py-2 rounded-[5px] font-bold text-rose-500 hover:bg-rose-500/10 transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setTableModal(false)}
                  className="flex-1 py-2 rounded-[5px] font-semibold border transition-colors hover:opacity-80"
                  style={{
                    background: 'var(--color-card)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-secondary)'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 py-2 rounded-[5px] font-bold text-white shadow-md transition-all hover:opacity-90"
                  style={{
                    background: 'linear-gradient(135deg, var(--color-500, #BF4040), var(--color-600, #9D3434))'
                  }}
                >
                  {editingTable ? 'Save Changes' : 'Create Table'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Table QR Code Modal ── */}
      {qrModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className="rounded-[5px] p-6 w-full max-w-sm border shadow-2xl space-y-4 text-center"
            style={{
              background: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--color-border)' }}>
              <div className="text-left">
                <h3 className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
                  Table #{stripPrefix(qrModal.table_number)} QR Code
                </h3>
                <p className="text-[11px]" style={{ color: 'var(--color-muted)' }}>
                  Customer Digital Menu & Ordering Token
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQrModal(null)}
                className="p-1 rounded-[5px] hover:bg-black/5 dark:hover:bg-white/5"
                style={{ color: 'var(--color-muted)' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* QR Mock Display */}
            <div
              className="p-6 rounded-[5px] border flex flex-col items-center justify-center"
              style={{
                background: '#ffffff',
                borderColor: 'var(--color-border)'
              }}
            >
              <div className="w-48 h-48 bg-slate-900 rounded-[5px] flex items-center justify-center p-3 text-white">
                <QrCode size={160} />
              </div>
              <p className="text-xs font-mono font-bold text-slate-800 mt-3">
                exview.pos/menu/{qrModal.table_number.toLowerCase()}
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`http://localhost:5173/menu/${qrModal.table_number.toLowerCase()}`)
                  toast.success('QR URL copied to clipboard')
                }}
                className="flex-1 py-2.5 rounded-[5px] text-xs font-bold border transition-colors hover:opacity-80"
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
                  window.open(`/menu/${qrModal.table_number.toLowerCase()}`, '_blank')
                }}
                className="flex-1 py-2.5 rounded-[5px] text-xs font-bold text-white shadow-md transition-all hover:opacity-90"
                style={{
                  background: 'linear-gradient(135deg, var(--color-500, #BF4040), var(--color-600, #9D3434))'
                }}
              >
                Open Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Real-Time Table Orders Modal ── */}
      {inspectingOrders && (
        <TableOrdersModal
          table={inspectingOrders.table}
          session={inspectingOrders.session}
          orders={tableOrderStats[inspectingOrders.table?.id]?.orders || inspectingOrders.orders || []}
          onClose={() => setInspectingOrders(null)}
          onOpenPOS={handleOpenPOS}
          onOpenQR={(t) => {
            setInspectingOrders(null)
            setQrModal(t)
          }}
        />
      )}
    </AdminLayout>
  )
}
