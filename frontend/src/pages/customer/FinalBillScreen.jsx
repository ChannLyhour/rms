import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Receipt,
  QrCode,
  CreditCard,
  Banknote,
  BellRing,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Printer,
  Download,
  Utensils,
  Clock,
  Sparkles,
  ShieldCheck,
  Star,
  X,
  Share2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Store,
  FileText,
  Radio
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import toast from 'react-hot-toast'
import { customerApi } from '../../api/posApi'
import { useWebSocket } from '../../hooks/useWebSocket'

export default function FinalBillScreen({
  session: propSession,
  tableNum: propTableNum,
  orders: propOrders,
  token: propToken,
  onNavigateTab,
}) {
  const { token: routeToken } = useParams()
  const savedToken = typeof window !== 'undefined' ? (localStorage.getItem('customer_table_token') || sessionStorage.getItem('customer_table_token')) : null
  const token = propToken || routeToken || savedToken
  const navigate = useNavigate()
  const { isConnected, subscribe } = useWebSocket(token ? `table_${token}` : null)

  // Save session token to storage
  useEffect(() => {
    if (token) {
      localStorage.setItem('customer_table_token', token)
      sessionStorage.setItem('customer_table_token', token)
    }
  }, [token])

  const [session, setSession] = useState(propSession || null)
  const [orders, setOrders] = useState(propOrders || [])
  const [loading, setLoading] = useState(!propOrders)

  // Fetch bill data from server
  const fetchBillData = useCallback(async (isInitial = false) => {
    if (!token) return
    if (isInitial) setLoading(true)
    try {
      const { data } = await customerApi.getOrderStatus(token)
      const list = data?.orders || data?.data || []
      setOrders(list.filter((o) => o.status !== 'cancelled'))
      if (data?.session) {
        setSession(data.session)
      }
    } catch (err) {
      if (isInitial) toast.error('Failed to load bill data.')
    } finally {
      if (isInitial) setLoading(false)
    }
  }, [token])

  // Sync state if props change from parent
  useEffect(() => {
    if (propOrders) {
      setOrders(propOrders.filter((o) => o.status !== 'cancelled'))
    }
  }, [propOrders])

  useEffect(() => {
    if (propSession) {
      setSession(propSession)
    }
  }, [propSession])

  // Initial load & WebSocket real-time subscription
  useEffect(() => {
    if (!propOrders || !propSession) {
      fetchBillData(true)
    }
    const unsubUpdate = subscribe('order_updated', () => fetchBillData(false))
    const unsubNew = subscribe('new_order', () => fetchBillData(false))
    return () => {
      if (unsubUpdate) unsubUpdate()
      if (unsubNew) unsubNew()
    }
  }, [token, subscribe, fetchBillData, propOrders, propSession])

  const tableNum = propTableNum || session?.table?.table_number || session?.table_id || '8'

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null) // null | 'khqr' | 'aba' | 'cash'
  const [callingCashier, setCallingCashier] = useState(false)
  const [cashierCalled, setCashierCalled] = useState(false)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [rating, setRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [copied, setCopied] = useState(false)
  const [itemsExpanded, setItemsExpanded] = useState(true)

  // Aggregate ordered items across tickets, with paid/unpaid segregation
  const { aggregatedItems, subtotal, paidSubtotal, tax, taxRate, total, paidTotal, totalItemCount } = useMemo(() => {
    const itemMap = new Map()
    let rawSubtotal = 0
    let paidRawSubtotal = 0

    orders.forEach((ord) => {
      const isOrdPaid = ord.payment_status === 'paid' || ord.status_payment === 'paid' || ord.is_paid
      ;(ord.items || []).forEach((item) => {
        const key = `${item.product_id || item.name}_${(item.options || []).map((o) => o.option_value_id || o.id).join('-')}_${isOrdPaid ? 'paid' : 'unpaid'}`
        const unitPrice = parseFloat(item.unit_price || item.price || 0)
        const qty = item.quantity || 1
        const lineTotal = unitPrice * qty

        if (isOrdPaid) {
          paidRawSubtotal += lineTotal
        } else {
          rawSubtotal += lineTotal
        }

        if (itemMap.has(key)) {
          const existing = itemMap.get(key)
          existing.quantity += qty
          existing.lineTotal += lineTotal
        } else {
          itemMap.set(key, {
            id: item.id,
            name: item.product?.name || item.name || 'Dish',
            unitPrice,
            quantity: qty,
            lineTotal,
            options: item.options || [],
            specialInstructions: item.special_instructions,
            isPaid: isOrdPaid,
          })
        }
      })
    })

    const taxRate = typeof window !== 'undefined' && localStorage.getItem('pos_tax_rate') ? Number(localStorage.getItem('pos_tax_rate')) : 7.0
    const taxAmount = rawSubtotal * (taxRate / 100.0)
    const grandTotal = rawSubtotal + taxAmount
    const paidTax = paidRawSubtotal * (taxRate / 100.0)
    const paidTotalAmount = paidRawSubtotal + paidTax
    const count = Array.from(itemMap.values()).reduce((sum, i) => sum + i.quantity, 0)

    return {
      aggregatedItems: Array.from(itemMap.values()),
      subtotal: rawSubtotal,
      paidSubtotal: paidRawSubtotal,
      tax: taxAmount,
      taxRate: taxRate,
      total: grandTotal,
      paidTotal: paidTotalAmount,
      totalItemCount: count,
    }
  }, [orders])

  // Payment status
  const isPaid = session?.status === 'closed' || (orders.length > 0 && orders.every((o) => o.payment_status === 'paid')) || (orders.length > 0 && total === 0)

  // Trigger celebration toast when bill is paid in real-time
  const prevPaidRef = useRef(isPaid)
  useEffect(() => {
    if (!prevPaidRef.current && isPaid) {
      toast.success('Payment completed! Bill has been settled. 🎉', { duration: 4000 })
    }
    prevPaidRef.current = isPaid
  }, [isPaid])

  // Handle Call Cashier
  const handleCallCashier = async () => {
    if (!token) {
      toast.error('Session token missing.')
      return
    }
    setCallingCashier(true)
    try {
      await customerApi.callCashier(token, tableNum)
      setCashierCalled(true)
      toast.success(`Cashier alerted for Table #${tableNum}! Staff will arrive shortly. 🛎️💳`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to alert cashier. Please wave to a waiter directly.')
    } finally {
      setCallingCashier(false)
    }
  }

  const handleCopyBill = () => {
    const text = `exView Dining Bill - Table #${tableNum}\nTotal: $${total.toFixed(2)}\nItems: ${totalItemCount}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Bill summary copied to clipboard! 📋')
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-900 pb-28 font-sans select-none max-w-md mx-auto relative">
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 1. TOP APP BAR                                                     */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-3 sticky top-0 z-30 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-red-50 text-[#ff1837] flex items-center justify-center font-black">
            <Receipt size={19} />
          </div>
          <div>
            <h1 className="text-xs font-black text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>Final Bill & Checkout</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff1837]" />
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-[10px] text-slate-400 font-bold">Table #{tableNum} • {orders.length} Tickets</p>
              {isConnected && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 bg-emerald-50 text-emerald-600 border border-emerald-200/60 rounded-full text-[9px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopyBill}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Copy Bill Summary"
          >
            {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
          </button>
          <button
            type="button"
            onClick={() => setShowReceiptModal(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Print Receipt Chit"
          >
            <Printer size={16} />
          </button>
        </div>
      </div>

      <div className="p-3.5 space-y-3.5">
        {/* Payment Settled Banner (Only shown once paid) */}
        {isPaid && (
          <div className="rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-4 shadow-lg shadow-emerald-500/20 flex items-center gap-3.5 animate-in fade-in duration-300">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 size={26} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-100">Bill Settled</span>
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              </div>
              <h2 className="text-sm font-extrabold text-white mt-0.5">Payment Completed!</h2>
              <p className="text-[11px] text-emerald-100 leading-snug">Thank you for dining with us! Have a wonderful day.</p>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* 3. PAYMENT METHODS & DIRECT SCAN HUB                              */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        {!isPaid && (
          <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                <CreditCard size={15} className="text-[#ff1837]" />
                <span>Select Payment Method</span>
              </h3>
             
            </div>

            {/* 3-Pill Segmented Method Selector */}
            <div className="grid grid-cols-3 gap-2">
              {/* Option 1: KHQR Bakong */}
              <button
                type="button"
                onClick={() => setSelectedPaymentMethod(prev => prev === 'khqr' ? null : 'khqr')}
                className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 relative ${
                  selectedPaymentMethod === 'khqr'
                    ? 'border-[#ff1837] bg-red-50/50 text-[#ff1837] shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-red-100/80 flex items-center justify-center text-[#ff1837] font-black text-xs">
                  <QrCode size={16} />
                </div>
                <span className="text-[10px] font-black block">KHQR</span>
                {selectedPaymentMethod === 'khqr' && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#ff1837] rounded-full border-2 border-white" />
                )}
              </button>

              {/* Option 2: ABA PAY */}
              <button
                type="button"
                onClick={() => setSelectedPaymentMethod(prev => prev === 'aba' ? null : 'aba')}
                className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 relative ${
                  selectedPaymentMethod === 'aba'
                    ? 'border-cyan-600 bg-cyan-50/60 text-cyan-800 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-cyan-900 text-cyan-100 flex items-center justify-center font-black text-[10px]">
                  ABA
                </div>
                <span className="text-[10px] font-black block">ABA PAY</span>
                {selectedPaymentMethod === 'aba' && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-600 rounded-full border-2 border-white" />
                )}
              </button>

              {/* Option 3: Cash / Counter */}
              <button
                type="button"
                onClick={() => setSelectedPaymentMethod(prev => prev === 'cash' ? null : 'cash')}
                className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 relative ${
                  selectedPaymentMethod === 'cash'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Banknote size={16} />
                </div>
                <span className="text-[10px] font-black block">Cash Staff</span>
                {selectedPaymentMethod === 'cash' && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                )}
              </button>
            </div>

            {/* Interactive QR Display Canvas */}
            {selectedPaymentMethod === 'khqr' && (
              <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-50 to-white border border-slate-200/80 text-center space-y-3 shadow-inner">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100/70 text-[#ff1837] text-[10px] font-black uppercase tracking-wider">
                  <Sparkles size={11} />
                  <span>Bakong KHQR • Universal Scan</span>
                </div>

                {/* Framed QR Code with Scanning Accents */}
                <div className="p-3.5 bg-white rounded-2xl shadow-md inline-block border border-slate-200/80 relative">
                  <QRCodeSVG
                    value={`https://bakong.nbc.org.kh/pay?amount=${total.toFixed(2)}&currency=USD&table=${tableNum}`}
                    size={160}
                    level="H"
                    includeMargin={false}
                  />
                  {/* Subtle Corner Brackets */}
                  <span className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-[#ff1837] rounded-tl-sm" />
                  <span className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-[#ff1837] rounded-tr-sm" />
                  <span className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-[#ff1837] rounded-bl-sm" />
                  <span className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-[#ff1837] rounded-br-sm" />
                </div>

                <div className="space-y-0.5">
                  <p className="font-mono font-black text-sm text-slate-900">
                    ${total.toFixed(2)} USD
                  </p>
                  <p className="text-[10px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                    Open <strong>ABA Mobile, ACLEDA, Wing, Canadia</strong> or any bank app to scan & pay.
                  </p>
                </div>
              </div>
            )}

            {selectedPaymentMethod === 'aba' && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950 to-slate-950 text-cyan-100 text-center space-y-3 shadow-lg">
                <div className="w-11 h-11 rounded-2xl bg-cyan-800 text-white flex items-center justify-center font-black text-xs mx-auto shadow-md">
                  ABA
                </div>
                <div>
                  <h4 className="font-black text-sm text-white">ABA Mobile Instant PayWay</h4>
                  <p className="text-[11px] text-cyan-300/80 mt-0.5">Fast, one-tap mobile checkout</p>
                </div>
                <button
                  type="button"
                  onClick={() => toast.success('Launching ABA Mobile PayWay... 📲')}
                  className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-md cursor-pointer transition-all active:scale-95"
                >
                  Pay ${total.toFixed(2)} via ABA
                </button>
              </div>
            )}

            {selectedPaymentMethod === 'cash' && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2.5">
                <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <Banknote size={22} />
                </div>
                <div>
                  <h4 className="font-black text-xs text-slate-900">Pay with Cash / Request POS</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Click below and our floor staff will bring the folder and wireless terminal to Table #{tableNum}.
                  </p>
                </div>
              </div>
            )}

            {/* CALL CASHIER BUTTON */}
            <button
              type="button"
              disabled={callingCashier || isPaid}
              onClick={handleCallCashier}
              className={`w-full py-3.5 rounded-2xl font-black text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 ${
                cashierCalled
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25'
                  : 'bg-[#ff1837] hover:bg-[#e01e38] text-white shadow-red-500/25'
              }`}
            >
              <BellRing size={15} className={callingCashier ? 'animate-spin' : 'animate-bounce'} />
              <span>
                {callingCashier
                  ? 'Notifying Cashier POS...'
                  : cashierCalled
                  ? 'Staff Alerted! (Click to re-alert) 🛎️'
                  : 'Call Cashier to Table 🛎️ Pay Now'}
              </span>
            </button>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* 4. ITEM RECEIPTS BREAKDOWN                                        */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm space-y-3">
          <div
            onClick={() => setItemsExpanded(!itemsExpanded)}
            className="flex items-center justify-between pb-2 border-b border-slate-100 cursor-pointer select-none"
          >
            <div className="flex items-center gap-1.5">
              <Utensils size={14} className="text-[#ff1837]" />
              <h3 className="font-extrabold text-xs text-slate-900">
                Order Summary ({totalItemCount} Items)
              </h3>
            </div>
            <div className="flex items-center gap-1 text-slate-400 text-[11px] font-bold">
              <span>{orders.length} Tickets</span>
              {itemsExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </div>
          </div>

          {/* Collapsible Items Stream */}
          {itemsExpanded && (
            <div className="divide-y divide-slate-100">
              {aggregatedItems.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs">
                  No ordered dishes found for this session.
                </div>
              ) : (
                aggregatedItems.map((item, idx) => (
                  <div key={idx} className={`py-2.5 flex items-start justify-between text-xs ${item.isPaid ? 'opacity-65' : ''}`}>
                    <div className="flex-1 pr-3">
                      <p className="font-bold text-slate-800 flex items-baseline gap-1.5">
                        <span className={`font-black shrink-0 ${item.isPaid ? 'line-through text-emerald-600' : 'text-[#ff1837]'}`}>{item.quantity}×</span>
                        <span className={`leading-snug ${item.isPaid ? 'line-through text-slate-400' : ''}`}>{item.name}</span>
                        {item.isPaid && (
                          <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700 ml-1">
                            Paid
                          </span>
                        )}
                      </p>
                      {item.options && item.options.length > 0 && (
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {item.options.map((o) => o.option_value?.name || o.name).filter(Boolean).join(', ')}
                        </p>
                      )}
                      {item.specialInstructions && (
                        <p className="text-[9px] text-amber-600 italic mt-0.5">Note: {item.specialInstructions}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`font-mono font-black text-xs ${item.isPaid ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        ${item.lineTotal.toFixed(2)}
                      </span>
                      <span className={`text-[9px] block font-mono ${item.isPaid ? 'line-through text-slate-400' : 'text-slate-400'}`}>
                        @${item.unitPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Financial Calculation Breakdown */}
          <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal (Unpaid)</span>
              <span className="font-mono font-bold text-slate-800">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>VAT / Tax ({taxRate}%)</span>
              <span className="font-mono font-bold text-slate-800">${tax.toFixed(2)}</span>
            </div>
            {paidTotal > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span className="flex items-center gap-1">
                  <span>Already Paid (Settled)</span>
                </span>
                <span className="font-mono line-through">-${paidTotal.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-black text-slate-900">
              <span>Amount Due</span>
              <span className="font-mono text-[#ff1837] text-base font-black">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* 5. BOTTOM ACTIONS: MENU & REVIEW                                  */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => onNavigateTab?.('food')}
            className="py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-xs hover:bg-slate-50 cursor-pointer active:scale-95 transition-all"
          >
            <Utensils size={14} className="text-[#ff1837]" />
            <span>Order More Food</span>
          </button>

          <button
            type="button"
            onClick={() => setShowReviewModal(true)}
            className="py-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-xs hover:bg-amber-100 cursor-pointer active:scale-95 transition-all"
          >
            <Star size={14} className="text-amber-500 fill-amber-400" />
            <span>Rate Experience</span>
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* RECEIPT PRINT / CHIT MODAL                                         */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {showReceiptModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowReceiptModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
            >
              <X size={18} />
            </button>

            {/* Receipt Chit Header */}
            <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-2xl font-mono text-xs space-y-3 text-slate-800">
              <div className="text-center space-y-1 pb-2.5 border-b border-dashed border-slate-300">
                <div className="w-8 h-8 rounded-full bg-red-100 text-[#ff1837] flex items-center justify-center mx-auto mb-1">
                  <Receipt size={16} />
                </div>
                <h3 className="font-black text-sm tracking-wider uppercase">exView Dining POS</h3>
                <p className="text-[10px] text-slate-500">Contactless QR Dining Chit</p>
                <p className="text-[10px] font-bold mt-1">Table #{tableNum}</p>
                <p className="text-[9px] text-slate-400">{new Date().toLocaleString()}</p>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {aggregatedItems.map((item, i) => (
                  <div key={i} className="flex justify-between text-[11px]">
                    <span className="truncate max-w-[170px]">{item.quantity}× {item.name}</span>
                    <span className="font-bold shrink-0">${item.lineTotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-dashed border-slate-300 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT / Tax ({taxRate}%):</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-black text-xs pt-1 border-t border-slate-300 text-slate-900">
                  <span>TOTAL:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-center pt-2 border-t border-dashed border-slate-300 text-[10px] text-slate-500">
                <p>Thank You For Dining With Us!</p>
                <p className="text-[9px] text-slate-400">Please visit again soon 🌟</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-95 transition-all"
              >
                <Printer size={15} />
                <span>Print Receipt</span>
              </button>
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="px-4 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer hover:bg-slate-200 active:scale-95 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* REVIEW & RATING MODAL                                              */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl relative text-center">
            <button
              type="button"
              onClick={() => setShowReviewModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
            >
              <X size={18} />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
              <Star size={24} className="fill-amber-500" />
            </div>

            <div>
              <h3 className="text-sm font-black text-slate-900">How was your dining experience?</h3>
              <p className="text-xs text-slate-400 mt-0.5">Rate Table #{tableNum} service and cuisine</p>
            </div>

            {/* Star Rating Selector */}
            <div className="flex items-center justify-center gap-2 py-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 cursor-pointer transition-transform hover:scale-125 active:scale-95"
                >
                  <Star
                    size={28}
                    className={
                      star <= rating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-200'
                    }
                  />
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Tell us what you loved or how we can improve..."
              className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 outline-none resize-none focus:border-[#ff1837]"
            />

            <button
              type="button"
              onClick={() => {
                setShowReviewModal(false)
                toast.success('Thank you for your valuable feedback! ⭐⭐⭐⭐⭐')
              }}
              className="w-full py-3.5 rounded-2xl bg-[#ff1837] hover:bg-[#e01e38] text-white font-extrabold text-xs shadow-md shadow-red-500/20 cursor-pointer active:scale-95 transition-all"
            >
              Submit Review
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

