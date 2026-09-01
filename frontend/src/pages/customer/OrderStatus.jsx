import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { customerApi } from '../../api/posApi'
import { useCartStore } from '../../store/useCartStore'
import {
  Search,
  SlidersHorizontal,
  Home,
  Utensils,
  FileSpreadsheet,
  BellRing,
  User,
  Clock,
  CheckCircle2,
  Flame,
  Package,
  RotateCcw,
  Star,
  MoreHorizontal,
  ChevronRight,
  RefreshCw,
  ArrowLeft,
  X,
  Receipt,
  ShoppingCart,
  CreditCard,
  QrCode,
  Smartphone
} from 'lucide-react'
import toast from 'react-hot-toast'
import client from '../../api/axiosClient'
import { useWebSocket } from '../../hooks/useWebSocket'

export default function OrderStatus() {
  const { token: routeToken } = useParams()
  const savedToken = typeof window !== 'undefined' ? (localStorage.getItem('customer_table_token') || sessionStorage.getItem('customer_table_token')) : null
  const token = routeToken || savedToken
  const navigate = useNavigate()
  const { subscribe } = useWebSocket(token ? `table_${token}` : null)

  // Save session token to storage
  useEffect(() => {
    if (token) {
      localStorage.setItem('customer_table_token', token)
      sessionStorage.setItem('customer_table_token', token)
    }
  }, [token])

  const [orders, setOrders] = useState([])
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all') // 'all' | 'pending' | 'processing' | 'finished'
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState(null)
  const [evaluatingOrder, setEvaluatingOrder] = useState(null)
  const [rating, setRating] = useState(5)
  const [reviewText, setReviewText] = useState('')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null)
  const [orderToPay, setOrderToPay] = useState(null)

  const { addItem } = useCartStore()

  const fetchOrders = async (isManual = false) => {
    if (isManual) setRefreshing(true)
    try {
      const { data } = await customerApi.getOrderStatus(token)
      setSession(data?.session || null)
      setOrders(data?.orders || data?.data || [])
    } catch {
      // silent
    } finally {
      setLoading(false)
      if (isManual) setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchOrders()
    const unsubOrder = subscribe('order_updated', () => fetchOrders(false))
    const unsubPayment = subscribe('payment_completed', () => fetchOrders(false))
    const unsubNew = subscribe('new_order', () => fetchOrders(false))
    return () => {
      if (unsubOrder) unsubOrder()
      if (unsubPayment) unsubPayment()
      if (unsubNew) unsubNew()
    }
  }, [token, subscribe])

  const handleConfirmPayTicket = async () => {
    if (!orderToPay) return
    const ticket = orderToPay
    const method = selectedPaymentMethod || 'qr'

    // 1. Instant optimistic update in local state
    setOrders((prev) =>
      prev.map((o) =>
        o.id === ticket.id ? { ...o, payment_status: 'paid' } : o
      )
    )
    toast.success(`Payment confirmed for Ticket #${ticket.order_number}! 🎉`)
    setShowPaymentModal(false)
    setSelectedPaymentMethod(null)
    setOrderToPay(null)

    // 2. Persist to server and broadcast real-time WebSocket to POS, Kitchen & Customers
    try {
      await customerApi.payTicket(token, {
        order_id: ticket.id,
        payment_method: method,
      })
      fetchOrders(false)
    } catch (err) {
      console.error('Failed to sync ticket payment:', err)
      fetchOrders(false)
    }
  }

  // Filtered and Sorted Orders (Latest / Newest Orders First)
  const filteredOrders = useMemo(() => {
    return [...orders]
      .filter((o) => {
        if (o.status === 'cancelled') return false

        // Filter by tab
        if (activeFilter === 'pending' && o.status !== 'pending') return false
        if (activeFilter === 'processing' && o.status !== 'preparing' && o.status !== 'confirmed') return false
        if (activeFilter === 'finished' && o.status !== 'completed' && o.status !== 'ready') return false

        // Filter by search query
        if (searchQuery) {
          const matchOrderNum = o.order_number?.toLowerCase().includes(searchQuery.toLowerCase())
          const matchItem = o.items?.some((i) =>
            (i.product?.name || i.name || '').toLowerCase().includes(searchQuery.toLowerCase())
          )
          return matchOrderNum || matchItem
        }
        return true
      })
      .sort((a, b) => {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0
        if (timeA !== timeB) return timeB - timeA
        return (Number(b.id) || 0) - (Number(a.id) || 0)
      })
  }, [orders, activeFilter, searchQuery])

  // Count orders per status tab
  const counts = useMemo(() => {
    const validOrders = orders.filter((o) => o.status !== 'cancelled')
    return {
      all: validOrders.length,
      pending: validOrders.filter((o) => o.status === 'pending').length,
      processing: validOrders.filter((o) => o.status === 'preparing' || o.status === 'confirmed').length,
      finished: validOrders.filter((o) => o.status === 'completed' || o.status === 'ready').length,
    }
  }, [orders])

  // Format Order Date/Time (e.g. 27/08/2026 10:46)
  const formatDateTime = (dateStr) => {
    if (!dateStr) return '27/08/2026 10:46'
    const d = new Date(dateStr)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${day}/${month}/${year} ${hours}:${minutes}`
  }

  // Get dynamic styles and colors for Order Status
  const getOrderStatusConfig = (status) => {
    switch (status) {
      case 'completed':
      case 'ready':
        return {
          badgeClass: 'badge-order-finished',
          textClass: 'text-order-finished',
          cardBgClass: 'bg-order-finished border-order-finished',
          barColor: 'var(--color-order-finished-text, #16A34A)',
          label: status === 'completed' ? 'Completed' : 'Ready to Serve',
          progress: status === 'completed' ? '100%' : '80%',
        }
      case 'preparing':
      case 'confirmed':
        return {
          badgeClass: 'badge-order-processing',
          textClass: 'text-order-processing',
          cardBgClass: 'bg-order-processing border-order-processing',
          barColor: 'var(--color-order-processing-text, #2563EB)',
          label: 'Cooking',
          progress: '50%',
        }
      case 'cancelled':
        return {
          badgeClass: 'badge-order-cancelled',
          textClass: 'text-order-cancelled',
          cardBgClass: 'bg-order-cancelled border-order-cancelled',
          barColor: 'var(--color-order-cancelled-text, #64748B)',
          label: 'Cancelled',
          progress: '100%',
        }
      case 'pending':
      default:
        return {
          badgeClass: 'badge-order-pending',
          textClass: 'text-order-pending',
          cardBgClass: 'bg-order-pending border-order-pending',
          barColor: 'var(--color-order-pending-text, #D97706)',
          label: 'Pending',
          progress: '25%',
        }
    }
  }

  const handleOrderAgain = (order) => {
    if (!order.items || order.items.length === 0) return
    order.items.forEach((item) => {
      if (item.product) {
        addItem(item.product, item.quantity, item.options || [], item.special_instructions || '')
      }
    })
    toast.success('Dishes re-added to your cart! 🛒')
    navigate(`/menu/${token}`)
  }

  const handleEvaluateSubmit = () => {
    setEvaluatingOrder(null)
    setReviewText('')
    toast.success('Thank you for your 5-star review! ⭐⭐⭐⭐⭐')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#f5f6fa]">
        <div className="w-14 h-14 rounded-2xl bg-red-50 text-[#ff2442] flex items-center justify-center mb-3 animate-spin">
          <RefreshCw size={26} />
        </div>
        <p className="text-xs font-bold text-slate-500">Loading Order Tickets...</p>
      </div>
    )
  }

  const tableNum = session?.table?.table_number || session?.table_id || '8'

  return (
    <div className="min-h-screen bg-[#f5f6fa] text-slate-900 pb-24 font-sans antialiased select-none max-w-md mx-auto relative shadow-2xl">
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TOP SEARCH & FILTER BAR (Matching Screenshot) */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-20 bg-white border-b border-slate-100 shadow-xs px-4 pt-3 pb-2.5">
        <div className="flex items-center gap-3">
          {/* Search Input Box */}
          <div className="flex-1 flex items-center bg-slate-100/90 rounded-full px-3.5 py-2 shadow-inner-xs">
            <Search size={15} className="text-slate-400 shrink-0 mr-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dish or order #..."
              className="w-full text-xs text-slate-800 placeholder:text-slate-400 bg-transparent outline-none truncate"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="p-0.5 text-slate-400">
                <X size={13} />
              </button>
            )}
          </div>

          
        </div>

        {/* ── Horizontal Status Tabs ── */}
        <div className="flex items-center justify-between gap-3 mt-3 overflow-x-auto no-scrollbar scrollbar-none border-b border-slate-100 text-sm font-bold px-1">
          {/* All */}
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`pb-2 transition-all shrink-0 cursor-pointer relative flex items-center gap-1.5 ${
              activeFilter === 'all'
                ? 'text-[#ff2442] font-black'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>All</span>
            <span
              className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                activeFilter === 'all'
                  ? 'bg-red-50 text-[#ff2442] font-black'
                  : 'bg-slate-100 text-slate-500 font-semibold'
              }`}
            >
              {counts.all}
            </span>
            {activeFilter === 'all' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff2442] rounded-full" />
            )}
          </button>

          {/* Pending payment */}
          <button
            type="button"
            onClick={() => setActiveFilter('pending')}
            className={`pb-2 transition-all shrink-0 cursor-pointer relative flex items-center gap-1.5 ${
              activeFilter === 'pending'
                ? 'text-[#ff2442] font-black'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Pending</span>
            <span
              className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                activeFilter === 'pending'
                  ? 'bg-red-50 text-[#ff2442] font-black'
                  : 'bg-slate-100 text-slate-500 font-semibold'
              }`}
            >
              {counts.pending}
            </span>
            {activeFilter === 'pending' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff2442] rounded-full" />
            )}
          </button>

          {/* Processing */}
          <button
            type="button"
            onClick={() => setActiveFilter('processing')}
            className={`pb-2 transition-all shrink-0 cursor-pointer relative flex items-center gap-1.5 ${
              activeFilter === 'processing'
                ? 'text-[#ff2442] font-black'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Processing</span>
            <span
              className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                activeFilter === 'processing'
                  ? 'bg-red-50 text-[#ff2442] font-black'
                  : 'bg-slate-100 text-slate-500 font-semibold'
              }`}
            >
              {counts.processing}
            </span>
            {activeFilter === 'processing' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff2442] rounded-full" />
            )}
          </button>

          {/* Finished */}
          <button
            type="button"
            onClick={() => setActiveFilter('finished')}
            className={`pb-2 transition-all shrink-0 cursor-pointer relative flex items-center gap-1.5 ${
              activeFilter === 'finished'
                ? 'text-[#ff2442] font-black'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Finished</span>
            <span
              className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                activeFilter === 'finished'
                  ? 'bg-red-50 text-[#ff2442] font-black'
                  : 'bg-slate-100 text-slate-500 font-semibold'
              }`}
            >
              {counts.finished}
            </span>
            {activeFilter === 'finished' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff2442] rounded-full" />
            )}
          </button>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ORDERS STREAM (Matching Screenshot Cards) */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <main className="p-3.5 space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-xs space-y-3 mt-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Clock size={28} />
            </div>
            <h3 className="font-black text-sm text-slate-800">No orders found</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              You don't have any orders matching this category yet.
            </p>
            <Link
              to={`/menu/${token}`}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#ff2442] text-white font-extrabold text-xs shadow-md shadow-red-500/25 mt-1"
            >
              <span>Go to Food Menu</span>
              <ChevronRight size={13} />
            </Link>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isFinished = order.status === 'completed' || order.status === 'ready'
            const isProcessing = order.status === 'preparing' || order.status === 'confirmed'
            const totalQty = (order.items || []).reduce((sum, i) => sum + (i.quantity || 1), 0)
            const firstItem = order.items?.[0]
            const firstItemName = firstItem?.product?.name || firstItem?.name || 'Delicious Dish'

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3"
              >
                {/* Header: Order Number + Kitchen Status */}
                <div className="flex items-center justify-between border-b border-slate-50 pb-2.5">
                  <div
                    onClick={() => setSelectedOrderForDetail(order)}
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <div className="flex items-center gap-1 font-extrabold text-xs text-slate-900 group-hover:text-[#ff2442]">
                      <span className="truncate max-w-[170px]">
                        {order.order_number}
                      </span>
                      <ChevronRight size={14} className="text-slate-400" />
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      isFinished
                        ? 'badge-order-finished'
                        : isProcessing
                        ? 'badge-order-processing flex items-center gap-1'
                        : 'badge-order-pending'
                    }`}
                  >
                    {isFinished ? (
                      'Finished'
                    ) : isProcessing ? (
                      <>
                        <Flame size={11} className="animate-pulse text-blue-600" />
                        <span>Cooking</span>
                      </>
                    ) : (
                      'Pending'
                    )}
                  </span>
                </div>

                {/* Body: Dish Thumbnails & Name + Total Items */}
                <div
                  onClick={() => setSelectedOrderForDetail(order)}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  {/* Thumbnails Row */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {(order.items || []).slice(0, 2).map((item, idx) => (
                      <div
                        key={idx}
                        className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden border border-slate-100 flex items-center justify-center"
                      >
                        {item.product?.image_url ? (
                          <img
                            src={item.product.image_url}
                            alt="Dish"
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.style.display = 'none' }}
                          />
                        ) : (
                          <span className="text-base">🍜</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Dish Title & Item Count */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-extrabold text-xs text-slate-900 truncate">
                      {firstItemName}
                      {(order.items || []).length > 1 ? ` & ${(order.items || []).length - 1} more` : ''}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Total {totalQty} {totalQty === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                </div>

                {/* Footer: Date + Total Amount */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-medium text-slate-400">
                    {formatDateTime(order.created_at)}
                  </span>
                  <div className="text-right">
                    <span className="text-xs text-slate-600 font-medium mr-1">Total:</span>
                    <span className="font-mono font-black text-sm text-slate-900">
                      ${Number(order.total_amount).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Bottom Row: Payment Status & Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                  {/* Payment Status Label */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-slate-500">Payment:</span>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        order.payment_status === 'paid' ? 'badge-paid' : 'badge-unpaid'
                      }`}
                    >
                      {order.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedOrderForDetail(order)}
                    className="text-xs font-bold text-[#ff2442] hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>View Detail</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </main>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* BOTTOM APP NAVIGATION BAR (5 Tabs) */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200/80 max-w-md mx-auto shadow-lg">
        <div className="grid grid-cols-5 py-2 text-center">
          {/* Home */}
          <Link
            to={token ? `/menu/${token}?tab=home` : '/'}
            className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-[#ff2442]"
          >
            <Home size={20} className="stroke-[1.8]" />
            <span className="text-[10px] font-bold">Home</span>
          </Link>

          {/* Food Menu */}
          <Link
            to={token ? `/menu/${token}?tab=food` : '/'}
            className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-[#ff2442]"
          >
            <Utensils size={20} className="stroke-[1.8]" />
            <span className="text-[10px] font-bold">Food</span>
          </Link>

          {/* Order (Active) */}
          <button
            type="button"
            className="flex flex-col items-center gap-0.5 text-[#ff2442] cursor-pointer"
          >
            <div className="w-8 h-5 rounded-md bg-[#ff2442] text-white flex items-center justify-center shadow-xs">
              <FileSpreadsheet size={13} className="stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-black">Order</span>
          </button>

          {/* Message */}
          <Link
            to={token ? `/menu/${token}?tab=message` : '/'}
            className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-[#ff2442] relative cursor-pointer"
          >
            <div className="relative">
              <BellRing size={20} className="stroke-[1.8]" />
              <span className="absolute -top-1 -right-2 px-1 py-0.2 bg-[#ff2442] text-white rounded-full text-[8px] font-black">
                4
              </span>
            </div>
            <span className="text-[10px] font-bold">Message</span>
          </Link>

          {/* Mine / Cart */}
          <Link
            to={token ? `/menu/${token}?tab=mine` : '/'}
            className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-[#ff2442]"
          >
            <User size={20} className="stroke-[1.8]" />
            <span className="text-[10px] font-bold">Mine</span>
          </Link>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ORDER TICKET DETAILS / RECEIPT MODAL */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {selectedOrderForDetail && (() => {
        const matchedOrder = orders.find((o) => o.id === selectedOrderForDetail.id) || selectedOrderForDetail
        const currentStatus = matchedOrder?.status || 'pending'
        const currentPaymentStatus = matchedOrder?.payment_status || 'unpaid'

        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center p-0 animate-in fade-in duration-150">
            <div className="w-full max-w-md bg-white rounded-t-3xl border-t border-slate-200 p-5 space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-sm text-slate-900">
                      {selectedOrderForDetail.order_number}
                    </h3>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        currentPaymentStatus === 'paid' ? 'badge-paid' : 'badge-unpaid'
                      }`}
                    >
                      {currentPaymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Placed on {formatDateTime(selectedOrderForDetail.created_at)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrderForDetail(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Cooking Stage Timeline */}
              {(() => {
                const statusCfg = getOrderStatusConfig(currentStatus)
                return (
                  <div className={`p-3.5 rounded-2xl border space-y-2.5 transition-all ${statusCfg.cardBgClass}`}>
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-700 font-extrabold">Order Status</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide ${statusCfg.badgeClass}`}>
                        {statusCfg.label}
                      </span>
                    </div>
                    <div className="h-2 bg-black/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: statusCfg.progress,
                          backgroundColor: statusCfg.barColor,
                        }}
                      />
                    </div>
                  </div>
                )
              })()}

            {/* Items List */}
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Dishes in this Ticket
              </h4>
              {(selectedOrderForDetail.items || []).map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-900">
                      {item.quantity}× {item.product?.name || item.name || 'Dish'}
                    </p>
                    {item.special_instructions && (
                      <p className="text-[10px] text-amber-600 italic">
                        Note: {item.special_instructions}
                      </p>
                    )}
                  </div>
                  <span className="font-mono font-bold text-slate-800">
                    ${(parseFloat(item.unit_price || item.price || 0) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t space-y-1 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono font-bold text-slate-800">
                  ${Number(selectedOrderForDetail.subtotal || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span className="font-mono font-bold text-slate-800">
                  ${Number(selectedOrderForDetail.tax_amount || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1.5 border-t text-sm font-black text-slate-900">
                <span>Ticket Total</span>
                <span className="font-mono text-[#ff2442]">
                  ${Number(selectedOrderForDetail.total_amount || 0).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              {currentPaymentStatus === 'paid' ? (
                <div className="w-full py-3 rounded-2xl bg-emerald-50 text-emerald-700 font-extrabold text-xs border border-emerald-200/80 flex items-center justify-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>Ticket Already Paid ✓</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setOrderToPay(matchedOrder)
                    setShowPaymentModal(true)
                    setSelectedOrderForDetail(null)
                  }}
                  className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md cursor-pointer flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  <CreditCard size={15} />
                  <span>Pay Only This Ticket (${Number(matchedOrder.total_amount || 0).toFixed(2)})</span>
                </button>
              )}

              <button
                type="button"
                onClick={async () => {
                  try {
                    await client.post(`/customer/call-cashier/${token}`)
                    toast.success('Cashier notified: Ready for Table Checkout! 💳')
                  } catch (e) {
                    toast.error('Failed to notify cashier')
                  }
                  setSelectedOrderForDetail(null)
                }}
                className="w-full py-3 rounded-2xl bg-[#ff2442] hover:bg-[#e01f3b] text-white font-extrabold text-xs shadow-md shadow-red-500/25 cursor-pointer flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <BellRing size={15} />
                <span>Call Cashier (Full Bill)</span>
              </button>
            </div>
          </div>
        </div>
      )
    })()}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* EVALUATE / RATING MODAL */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {evaluatingOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center p-0 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-t-3xl border-t border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-black text-sm text-slate-900">Evaluate Dishes & Service</h3>
                <p className="text-[10px] text-slate-400">{evaluatingOrder.order_number}</p>
              </div>
              <button
                type="button"
                onClick={() => setEvaluatingOrder(null)}
                className="p-1 rounded-full text-slate-400"
              >
                <X size={18} />
              </button>
            </div>

            {/* Star Selector */}
            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 text-2xl transition-transform hover:scale-125 cursor-pointer"
                >
                  <Star
                    size={28}
                    className={
                      star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                    }
                  />
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="How was the taste and service? Share your feedback with the chef..."
              className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#ff2442] resize-none"
            />

            <button
              type="button"
              onClick={handleEvaluateSubmit}
              className="w-full py-3 rounded-2xl bg-[#ff2442] text-white font-extrabold text-xs shadow-md shadow-red-500/25 cursor-pointer"
            >
              Submit Review ⭐
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* PAYMENT MODAL (Pay Specific Ticket) */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {showPaymentModal && orderToPay && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center p-0 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-t-3xl border-t border-slate-200 p-5 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-black text-sm text-slate-900">
                  Pay Ticket #{orderToPay.order_number}
                </h3>
                <p className="text-[10px] text-slate-400">
                  Ticket Total: ${Number(orderToPay.total_amount).toFixed(2)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowPaymentModal(false)
                  setSelectedPaymentMethod(null)
                  setOrderToPay(null)
                }}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {!selectedPaymentMethod ? (
              <div className="space-y-3 py-2">
                {/* ABA Bank */}
                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod('aba')}
                  className="w-full p-4 rounded-2xl border-2 border-slate-100 hover:border-blue-500 bg-white flex items-center justify-between transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black group-hover:scale-110 transition-transform">
                      <Smartphone size={20} />
                    </div>
                    <div className="text-left">
                      <h4 className="font-extrabold text-sm text-slate-900">ABA Bank</h4>
                      <p className="text-[10px] text-slate-400">Pay Ticket #{orderToPay.order_number} with ABA</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-500" />
                </button>

                {/* KHQR Bakong */}
                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod('khqr')}
                  className="w-full p-4 rounded-2xl border-2 border-slate-100 hover:border-red-500 bg-white flex items-center justify-between transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-black group-hover:scale-110 transition-transform">
                      <QrCode size={20} />
                    </div>
                    <div className="text-left">
                      <h4 className="font-extrabold text-sm text-slate-900">KHQR Bakong</h4>
                      <p className="text-[10px] text-slate-400">Scan KHQR for Ticket #{orderToPay.order_number}</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-red-500" />
                </button>
              </div>
            ) : (
              <div className="py-4 flex flex-col items-center space-y-4">
                <div className="text-center space-y-1">
                  <div className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-[10px] font-extrabold text-slate-700">
                    Ticket #{orderToPay.order_number}
                  </div>
                  <h4 className="font-black text-slate-900">
                    {selectedPaymentMethod === 'aba' ? 'ABA Pay' : 'KHQR Payment'}
                  </h4>
                  <p className="text-xs text-slate-500">Scan the QR code to pay only this ticket</p>
                </div>
                
                {/* Mock QR Code Display */}
                <div className="p-4 bg-white border-2 border-slate-100 rounded-2xl shadow-sm">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=pay_order_${orderToPay.id}_${selectedPaymentMethod}_${Number(orderToPay.total_amount).toFixed(2)}`}
                    alt="Payment QR Code"
                    className="w-48 h-48"
                  />
                </div>

                <div className="font-mono font-black text-xl text-[#ff2442]">
                  ${Number(orderToPay.total_amount).toFixed(2)}
                </div>

                <div className="w-full flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod(null)}
                    className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmPayTicket}
                    className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-500/25 hover:bg-emerald-600 transition-all cursor-pointer"
                  >
                    I have paid
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
