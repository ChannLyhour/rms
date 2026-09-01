import React, { useState, useEffect, useMemo, useRef } from 'react'
import {
  CreditCard,
  Banknote,
  QrCode,
  Percent,
  DollarSign,
  Plus,
  Minus,
  Trash2,
  Receipt,
  Check,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  ShoppingBag,
  Clock,
  User,
  UtensilsCrossed,
  Printer,
  ChevronRight,
  ChevronDown,
  Search,
  Users,
  Layers,
  Split,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { ConfirmModal } from '../common/ModalComponent'
import { adminApi } from '../../api/adminApi'
import { posApi } from '../../api/posApi'
import { ProductCheckoutCard } from '../CardProductComponents'

const PAYMENT_METHODS = [
  { id: 'cash', label: 'Cash', icon: Banknote, desc: 'Tender cash & return change' },
  { id: 'card', label: 'Card / Terminal', icon: CreditCard, desc: 'POS Terminal / Tap to pay' },
  { id: 'qr', label: 'ABA / KHQR', icon: QrCode, desc: 'Scan KHQR / Mobile wallet' },
]

export default function CheckoutView({
  onBack,
  items = [],
  sessions = [],
  selectedSession,
  onSelectSession,
  orderType = 'dine_in',
  onUpdateQuantity,
  onUpdateItem,
  onRemoveItem,
  onProcessPayment,
  onPayLater,
  isProcessing = false
}) {
  // ── Table Dropdown State ──
  const [showTableDropdown, setShowTableDropdown] = useState(false)
  const [tableSearchQuery, setTableSearchQuery] = useState('')

  // ── Checkout Mode: 'single' (Full) | 'split' (Split Bills) ──
  const [checkoutMode, setCheckoutMode] = useState('single')

  // ── Single Mode Payment State ──
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [discountType, setDiscountType] = useState('percent') // 'percent' | 'fixed'
  const [discountPercent, setDiscountPercent] = useState(0)
  const [discountFixed, setDiscountFixed] = useState('')
  const [amountPaid, setAmountPaid] = useState('')
  const [customerNote, setCustomerNote] = useState('')
  const [itemToDelete, setItemToDelete] = useState(null)

  // ── Split Payment Mode States ──
  // 'tender' (Multi-Tender / Custom) | 'equal' (Even Split by Guests)
  const [splitType, setSplitType] = useState('tender')
  const [tenderList, setTenderList] = useState([]) // [{ id, method, amount }]
  const [currentTenderMethod, setCurrentTenderMethod] = useState('cash')
  const [currentTenderAmount, setCurrentTenderAmount] = useState('')

  // Equal Split States
  const [guestCount, setGuestCount] = useState(2)
  const [guestPayments, setGuestPayments] = useState([]) // [{ id, name, method, isPaid }]

  // ── Tax Rate State ──
  const [taxRate, setTaxRate] = useState(() => {
    try {
      const saved = localStorage.getItem('pos_tax_rate')
      return saved ? Number(saved) : 7
    } catch (e) {
      return 7
    }
  })

  // Synchronize tax rate from settings
  useEffect(() => {
    const loadTax = async () => {
      try {
        const saved = localStorage.getItem('pos_tax_rate')
        if (saved !== null) setTaxRate(Number(saved))
        const res = await adminApi.getSetting('tax_rate')
        const val = res.data?.data?.value ?? res.data?.value
        if (val !== undefined && val !== null) {
          setTaxRate(Number(val))
        }
      } catch (e) {}
    }
    loadTax()
  }, [])

  // Active Session info & Table dropdown handling
  const tableDropdownRef = useRef(null)
  const selectedSessionData = sessions.find((s) => s.id === selectedSession)
  const [sessionOrders, setSessionOrders] = useState([])

  // Automatically fetch existing placed table orders for billing when in checkout
  useEffect(() => {
    if (selectedSession) {
      posApi.getOrdersBySession(selectedSession).then(({ data }) => {
        const orderList = data.data || []
        const fetched = []
        orderList.forEach((ord) => {
          if (Array.isArray(ord.items) && ord.status !== 'cancelled') {
            ord.items.forEach((it) => {
              fetched.push({
                product: it.product || {
                  id: it.product_id || it.id,
                  name: it.name || 'Food Item',
                  price: Number(it.price || it.unit_price || 0),
                  image_url: it.image_url,
                },
                quantity: Number(it.quantity || 1),
                options: (it.options || []).map((opt) =>
                  typeof opt === 'string' ? { id: opt, name: opt, price: 0 } : opt?.option_value || opt
                ),
                specialInstructions: it.special_instructions || '',
                order_id: ord.id,
                order_number: ord.order_number,
                order_status: ord.status,
                item_status: it.item_status || ord.status,
                status: it.item_status || ord.status,
                payment_status: ord.payment_status || ord.status_payment || (ord.is_paid ? 'paid' : 'unpaid'),
              })
            })
          }
        })
        setSessionOrders(fetched)
      }).catch(() => {})
    } else {
      setSessionOrders([])
    }
  }, [selectedSession])

  // Combine items for checkout billing
  const checkoutItems = useMemo(() => {
    if (items && items.length > 0) return items
    return sessionOrders
  }, [items, sessionOrders])

  const unpaidCheckoutItems = useMemo(() => {
    return checkoutItems.filter((i) => i.payment_status !== 'paid')
  }, [checkoutItems])

  const paidCheckoutItems = useMemo(() => {
    return checkoutItems.filter((i) => i.payment_status === 'paid')
  }, [checkoutItems])

  // Click outside to close table dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (tableDropdownRef.current && !tableDropdownRef.current.contains(e.target)) {
        setShowTableDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filter tables by search query
  const filteredSessions = useMemo(() => {
    if (!tableSearchQuery.trim()) return sessions
    const q = tableSearchQuery.toLowerCase()
    return sessions.filter((s) => {
      const tableNum = String(s.table?.table_number || s.table_id || '').toLowerCase()
      const guestName = String(s.customer_name || '').toLowerCase()
      return tableNum.includes(q) || guestName.includes(q)
    })
  }, [sessions, tableSearchQuery])

  // ── Financial Calculations (ONLY UNPAID ITEMS) ──
  const subtotal = useMemo(() => {
    return unpaidCheckoutItems.reduce((acc, item) => {
      const base = (item.product?.price || 0) * item.quantity
      const opts = (item.options || []).reduce((o, ov) => o + (ov.price || 0), 0) * item.quantity
      return acc + base + opts
    }, 0)
  }, [unpaidCheckoutItems])

  const paidSubtotal = useMemo(() => {
    return paidCheckoutItems.reduce((acc, item) => {
      const base = (item.product?.price || 0) * item.quantity
      const opts = (item.options || []).reduce((o, ov) => o + (ov.price || 0), 0) * item.quantity
      return acc + base + opts
    }, 0)
  }, [paidCheckoutItems])

  const discountAmount = useMemo(() => {
    if (discountType === 'percent') {
      return (subtotal * (Number(discountPercent) || 0)) / 100
    }
    return Math.min(subtotal, Number(discountFixed) || 0)
  }, [subtotal, discountType, discountPercent, discountFixed])

  const afterDiscount = Math.max(0, subtotal - discountAmount)
  const tax = afterDiscount * (taxRate / 100)
  const total = afterDiscount + tax
  const paidTotal = paidSubtotal + (paidSubtotal * (taxRate / 100))

  // Set default amount paid when total changes
  useEffect(() => {
    if (total > 0) {
      setAmountPaid(String(Math.ceil(total * 100) / 100))
    }
  }, [total])

  const numericPaid = parseFloat(amountPaid) || 0
  const changeDue = Math.max(0, numericPaid - total)
  const isExactOrSufficient = numericPaid >= total

  // ── Split Calculations (Multi-Tender) ──
  const totalTenderCollected = useMemo(() => {
    return tenderList.reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
  }, [tenderList])

  const tenderRemaining = Math.max(0, total - totalTenderCollected)
  const tenderChange = Math.max(0, totalTenderCollected - total)
  const isTenderFullyPaid = totalTenderCollected >= total - 0.001

  // Set default current tender amount to remaining balance
  useEffect(() => {
    if (tenderRemaining > 0) {
      setCurrentTenderAmount(String(Math.ceil(tenderRemaining * 100) / 100))
    } else {
      setCurrentTenderAmount('')
    }
  }, [tenderRemaining])

  // ── Equal Guest Split Calculations ──
  const perGuestShare = useMemo(() => {
    if (guestCount <= 0) return 0
    return Math.round((total / guestCount) * 100) / 100
  }, [total, guestCount])

  // Initialize / Sync guest list when guest count changes
  useEffect(() => {
    setGuestPayments((prev) => {
      const next = []
      for (let i = 1; i <= guestCount; i++) {
        const existing = prev.find((g) => g.id === i)
        if (existing) {
          next.push(existing)
        } else {
          next.push({
            id: i,
            name: `Guest ${i}`,
            method: 'cash',
            isPaid: false,
          })
        }
      }
      return next
    })
  }, [guestCount])

  const paidGuestsCount = useMemo(() => {
    return guestPayments.filter((g) => g.isPaid).length
  }, [guestPayments])

  const isEqualSplitFullyPaid = guestPayments.length > 0 && paidGuestsCount === guestPayments.length

  // Add Multi-Tender Payment Entry
  const handleAddTenderPayment = () => {
    const amt = parseFloat(currentTenderAmount)
    if (!amt || amt <= 0) {
      toast.error('Please enter a valid payment amount')
      return
    }

    const newTender = {
      id: Date.now(),
      method: currentTenderMethod,
      amount: amt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setTenderList((prev) => [...prev, newTender])
    toast.success(`Recorded $${amt.toFixed(2)} via ${currentTenderMethod.toUpperCase()}`)
  }

  // Remove Tender Entry
  const handleRemoveTender = (id) => {
    setTenderList((prev) => prev.filter((t) => t.id !== id))
  }

  // Toggle Equal Guest Paid Status
  const handleToggleGuestPaid = (guestId) => {
    setGuestPayments((prev) =>
      prev.map((g) => (g.id === guestId ? { ...g, isPaid: !g.isPaid } : g))
    )
  }

  // Update Equal Guest Payment Method
  const handleUpdateGuestMethod = (guestId, method) => {
    setGuestPayments((prev) =>
      prev.map((g) => (g.id === guestId ? { ...g, method } : g))
    )
  }

  // ── Handle Checkout Final Submission ──
  const handleCompletePayment = () => {
    if (items.length === 0) {
      toast.error('Cart has no items')
      return
    }

    if (checkoutMode === 'single') {
      if (paymentMethod === 'cash' && !isExactOrSufficient) {
        toast.error(`Cash received is less than total amount ($${total.toFixed(2)})`)
        return
      }

      onProcessPayment?.({
        isSplit: false,
        paymentMethod,
        subtotal,
        discountAmount,
        discountPercent: discountType === 'percent' ? discountPercent : 0,
        tax,
        total,
        amountPaid: numericPaid,
        changeDue,
        customerNote,
        selectedSession,
      })
    } else {
      // Split Bill Mode
      if (splitType === 'tender') {
        if (!isTenderFullyPaid) {
          toast.error(`Remaining unpaid balance: $${tenderRemaining.toFixed(2)}`)
          return
        }

        onProcessPayment?.({
          isSplit: true,
          splitType: 'tender',
          splitPayments: tenderList,
          paymentMethod: 'split',
          subtotal,
          discountAmount,
          tax,
          total,
          amountPaid: totalTenderCollected,
          changeDue: tenderChange,
          customerNote,
          selectedSession,
        })
      } else {
        // Equal Split Mode
        if (!isEqualSplitFullyPaid) {
          toast.error(`Please collect payment for all ${guestCount} guests (${paidGuestsCount}/${guestCount} paid)`)
          return
        }

        const splitData = guestPayments.map((g) => ({
          name: g.name,
          amount: perGuestShare,
          method: g.method,
        }))

        onProcessPayment?.({
          isSplit: true,
          splitType: 'equal',
          guestCount,
          splitPayments: splitData,
          paymentMethod: 'split',
          subtotal,
          discountAmount,
          tax,
          total,
          amountPaid: total,
          changeDue: 0,
          customerNote,
          selectedSession,
        })
      }
    }
  }

  return (
    <div
      className="w-full h-full flex-1 flex flex-col min-h-0 overflow-hidden"
      style={{ background: 'var(--color-bg)' }}
    >
      {/* ── 2-Column Main Workspace (Edge-to-edge flush layout) ── */}
      <div className="w-full h-full flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* ══════════════════════════════════════════════════════════════════
            COLUMN 1: ORDERED PRODUCTS LIST & QUANTITY EDITING (7 Cols)
        ══════════════════════════════════════════════════════════════════ */}
        <div
          className="w-full h-full lg:col-span-7 flex flex-col border-r overflow-hidden min-h-0"
          style={{
            background: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          {/* Header Bar with Back Button, Table Dropdown & Item Count */}
          <div
            className="px-4 py-3 border-b flex items-center justify-between gap-3 shrink-0"
            style={{
              background: 'var(--color-card)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onBack}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 cursor-pointer shadow-2xs shrink-0"
                style={{
                  background: 'var(--color-bg)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                }}
              >
                <ArrowLeft size={15} />
                <span>Back to Menu</span>
              </button>

              {/* ── Interactive Tables Dropdown ── */}
              <div className="relative" ref={tableDropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowTableDropdown((prev) => !prev)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 cursor-pointer shadow-2xs"
                  style={{
                    background: 'var(--color-bg)',
                    borderColor: selectedSession ? 'var(--color-500, #BF4040)' : 'var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                >
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      selectedSession ? 'bg-emerald-500 ring-2 ring-emerald-500/20 animate-pulse' : 'bg-slate-400'
                    }`}
                  />
                  <span className="font-extrabold truncate max-w-[210px]">
                    {selectedSessionData
                      ? `Table ${selectedSessionData.table?.table_number || selectedSessionData.table_id} (${selectedSessionData.customer_name || 'Dine-In'})`
                      : 'Takeaway / Quick Order'}
                  </span>
                  <ChevronDown size={14} className="text-[var(--color-muted)] shrink-0 transition-transform duration-200" style={{ transform: showTableDropdown ? 'rotate(180deg)' : 'none' }} />
                </button>

                {/* Popover Dropdown Panel */}
                {showTableDropdown && (
                  <div
                    className="absolute left-0 top-full mt-2 w-80 rounded-2xl border shadow-2xl backdrop-blur-md overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 p-2 space-y-2"
                    style={{
                      background: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                    }}
                  >
                    {/* Search Input */}
                    <div className="relative">
                      <Search
                        size={13}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
                      />
                      <input
                        type="text"
                        value={tableSearchQuery}
                        onChange={(e) => setTableSearchQuery(e.target.value)}
                        placeholder="Search table or guest..."
                        className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs border outline-none font-medium"
                        style={{
                          background: 'var(--color-bg)',
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-text)',
                        }}
                      />
                    </div>

                    {/* Table Sessions List */}
                    <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                      {/* Takeaway Option */}
                      <button
                        type="button"
                        onClick={() => {
                          onSelectSession?.(null, 'takeaway')
                          setShowTableDropdown(false)
                        }}
                        className={`w-full p-2 rounded-xl text-left text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                          !selectedSession
                            ? 'bg-[var(--color-500,#BF4040)]/10 text-[var(--color-500,#BF4040)] border border-[var(--color-500,#BF4040)]/20'
                            : 'hover:bg-black/5 dark:hover:bg-white/5 text-[var(--color-text)]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <ShoppingBag size={14} />
                          <span>Takeaway / Quick Order</span>
                        </div>
                        {!selectedSession && <Check size={14} />}
                      </button>

                      {filteredSessions.map((s) => {
                        const isCurrent = s.id === selectedSession
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => {
                              onSelectSession?.(s.id, 'dine_in')
                              setShowTableDropdown(false)
                            }}
                            className={`w-full p-2.5 rounded-xl text-left text-xs flex items-center justify-between transition-all cursor-pointer ${
                              isCurrent
                                ? 'bg-[var(--color-500,#BF4040)]/10 text-[var(--color-500,#BF4040)] font-bold border border-[var(--color-500,#BF4040)]/20'
                                : 'hover:bg-black/5 dark:hover:bg-white/5 text-[var(--color-text)]'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                              <div className="truncate">
                                <span className="font-extrabold block leading-tight">
                                  Table {s.table?.table_number || s.table_id} ({s.table?.capacity || 4}p)
                                </span>
                                <span className="text-[10px] text-[var(--color-muted)] font-normal block truncate mt-0.5">
                                  Guest: {s.customer_name || 'Walk-in'} • {s.orders?.length || 0} Orders
                                </span>
                              </div>
                            </div>

                            {isCurrent && <Check size={14} className="shrink-0 text-[var(--color-500,#BF4040)]" />}
                          </button>
                        )
                      })}

                      {filteredSessions.length === 0 && (
                        <div className="p-4 text-center text-xs text-[var(--color-muted)]">
                          No active tables found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <span
              className="text-xs font-mono font-bold px-3 py-1 rounded-xl border shadow-2xs"
              style={{
                background: 'var(--color-bg)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
            >
              {checkoutItems.reduce((s, i) => s + i.quantity, 0)} Items
            </span>
          </div>

          {/* Scrollable Order Items Cards */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 pr-2">
            {checkoutItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                <ShoppingBag size={48} style={{ color: 'var(--color-muted)' }} />
                <p className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>
                  No items in checkout ticket
                </p>
                <button
                  type="button"
                  onClick={onBack}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md cursor-pointer"
                  style={{ background: 'var(--color-500, #BF4040)' }}
                >
                  Return to Menu
                </button>
              </div>
            ) : (
              checkoutItems.map((item, idx) => (
                <ProductCheckoutCard
                  key={`${item.product?.id || idx}-${idx}`}
                  item={item}
                  index={idx}
                  onUpdateQuantity={(index, newQty) => {
                    if (newQty <= 0) {
                      setItemToDelete({ index, item })
                    } else {
                      onUpdateQuantity?.(index, newQty)
                    }
                  }}
                  onUpdateItem={onUpdateItem}
                  onRemove={(index, item) => setItemToDelete({ index, item })}
                />
              ))
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            COLUMN 2: PAYMENT, SPLIT BILLS & COMPLETE (5 Cols)
        ══════════════════════════════════════════════════════════════════ */}
        <div
          className="w-full h-full lg:col-span-5 flex flex-col p-4 sm:p-5 justify-between overflow-y-auto space-y-3 min-h-0"
          style={{
            background: 'var(--color-surface)',
          }}
        >
          <div className="space-y-3.5">
            {/* ── 1. Payment Mode Switcher: Single vs Split Bills ── */}
            <div
              className="p-1 rounded-2xl border grid grid-cols-2 gap-1 shadow-2xs"
              style={{
                background: 'var(--color-card)',
                borderColor: 'var(--color-border)',
              }}
            >
              <button
                type="button"
                onClick={() => setCheckoutMode('single')}
                className={`py-2 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  checkoutMode === 'single'
                    ? 'text-white shadow-sm'
                    : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
                }`}
                style={
                  checkoutMode === 'single'
                    ? {
                        background: 'linear-gradient(135deg, var(--color-500, #BF4040), var(--color-600, #9D3434))',
                      }
                    : {}
                }
              >
                <Banknote size={14} />
                <span>Single Payment</span>
              </button>

              <button
                type="button"
                onClick={() => setCheckoutMode('split')}
                className={`py-2 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  checkoutMode === 'split'
                    ? 'text-white shadow-sm'
                    : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
                }`}
                style={
                  checkoutMode === 'split'
                    ? {
                        background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                      }
                    : {}
                }
              >
                <Split size={14} />
                <span>Split Bills</span>
              </button>
            </div>

            {/* ══════════════════════════════════════════════════════════════
                A. SINGLE PAYMENT MODE
            ══════════════════════════════════════════════════════════════ */}
            {checkoutMode === 'single' && (
              <>
                {/* Select Payment Method */}
                <div className="space-y-2">
                  <span
                    className="text-xs font-extrabold uppercase tracking-wider block"
                    style={{ color: 'var(--color-text)' }}
                  >
                    Select Payment Method
                  </span>

                  <div className="grid grid-cols-3 gap-2.5">
                    {PAYMENT_METHODS.map((pm) => {
                      const Icon = pm.icon
                      const isSelected = paymentMethod === pm.id
                      return (
                        <button
                          key={pm.id}
                          type="button"
                          onClick={() => setPaymentMethod(pm.id)}
                          className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center gap-1.5 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[var(--color-500,#BF4040)] ring-1 ring-[var(--color-500,#BF4040)] shadow-xs'
                              : 'hover:bg-black/5 dark:hover:bg-white/5'
                          }`}
                          style={{
                            background: isSelected ? 'rgba(191, 64, 64, 0.06)' : 'var(--color-card)',
                            borderColor: isSelected ? 'var(--color-500, #BF4040)' : 'var(--color-border)',
                          }}
                        >
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                              isSelected
                                ? 'bg-[var(--color-500,#BF4040)] text-white shadow-2xs'
                                : 'bg-black/5 dark:bg-white/10 text-[var(--color-muted)]'
                            }`}
                          >
                            <Icon size={16} />
                          </div>
                          <span
                            className="text-xs font-bold truncate max-w-full"
                            style={{ color: isSelected ? 'var(--color-500,#BF4040)' : 'var(--color-text)' }}
                          >
                            {pm.label}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Tender / Cash Calculation Details */}
                {paymentMethod === 'cash' && (
                  <div
                    className="p-4 rounded-2xl border space-y-3 shadow-2xs"
                    style={{
                      background: 'var(--color-card)',
                      borderColor: 'var(--color-border)',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>
                        Cash Tendered ($)
                      </span>
                      <span className="text-xs font-mono font-semibold text-[var(--color-muted)]">
                        Exact Due: ${total.toFixed(2)}
                      </span>
                    </div>

                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-2.5 rounded-2xl text-xl font-mono font-black border outline-none shadow-2xs"
                      style={{
                        background: 'var(--color-bg)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text)',
                      }}
                    />

                    {/* Quick Cash Shortcuts */}
                    <div className="grid grid-cols-5 gap-1.5">
                      {[
                        { label: 'Exact', val: total },
                        { label: '+$5', val: numericPaid + 5 },
                        { label: '+$10', val: numericPaid + 10 },
                        { label: '$50', val: 50 },
                        { label: '$100', val: 100 },
                      ].map((sc, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setAmountPaid(String(Math.ceil(sc.val * 100) / 100))}
                          className="py-1.5 rounded-xl text-xs font-mono font-bold border transition-colors hover:opacity-80 cursor-pointer shadow-2xs"
                          style={{
                            background: 'var(--color-bg)',
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-text-secondary)',
                          }}
                        >
                          {sc.label}
                        </button>
                      ))}
                    </div>

                    {/* Change Due Banner */}
                    <div
                      className="p-3 rounded-xl border flex items-center justify-between shadow-2xs"
                      style={{
                        background: 'var(--color-bg)',
                        borderColor: 'var(--color-border)',
                      }}
                    >
                      <span className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                        Change to Return:
                      </span>
                      <span className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                        ${changeDue.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                {/* QR Code Pay Info */}
                {paymentMethod === 'qr' && (
                  <div
                    className="p-4 rounded-2xl border text-center space-y-2 shadow-2xs"
                    style={{
                      background: 'var(--color-card)',
                      borderColor: 'var(--color-border)',
                    }}
                  >
                    <div className="w-28 h-28 mx-auto rounded-2xl border p-2 flex items-center justify-center bg-white shadow-xs">
                      <QrCode size={95} className="text-slate-900" />
                    </div>
                    <p className="text-xs font-bold text-[var(--color-text)]">
                      Scan KHQR via ABA / Wing / Mobile Banking
                    </p>
                    <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-black">
                      Total: ${total.toFixed(2)}
                    </p>
                  </div>
                )}

                {/* Card Terminal Info */}
                {paymentMethod === 'card' && (
                  <div
                    className="p-4 rounded-2xl border text-center space-y-2 shadow-2xs"
                    style={{
                      background: 'var(--color-card)',
                      borderColor: 'var(--color-border)',
                    }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto shadow-2xs">
                      <CreditCard size={22} />
                    </div>
                    <p className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>
                      Terminal Ready for Visa / Mastercard / UnionPay
                    </p>
                    <p className="text-xs font-mono text-[var(--color-muted)]">
                      Authorized: ${total.toFixed(2)}
                    </p>
                  </div>
                )}
              </>
            )}

            {/* ══════════════════════════════════════════════════════════════
                B. SPLIT PAYMENT MODE
            ══════════════════════════════════════════════════════════════ */}
            {checkoutMode === 'split' && (
              <div className="space-y-3">
                {/* Split Strategy Pill Toggle */}
                <div
                  className="p-1 rounded-xl border grid grid-cols-2 gap-1 text-[11px] font-bold shadow-2xs"
                  style={{
                    background: 'var(--color-card)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setSplitType('tender')}
                    className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      splitType === 'tender'
                        ? 'bg-[var(--color-bg)] border text-[var(--color-text)] shadow-xs'
                        : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
                    }`}
                    style={splitType === 'tender' ? { borderColor: 'var(--color-border)' } : {}}
                  >
                    <Layers size={12} />
                    <span>Multi-Tender (Cash + Card + QR)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSplitType('equal')}
                    className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      splitType === 'equal'
                        ? 'bg-[var(--color-bg)] border text-[var(--color-text)] shadow-xs'
                        : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
                    }`}
                    style={splitType === 'equal' ? { borderColor: 'var(--color-border)' } : {}}
                  >
                    <Users size={12} />
                    <span>Even Split by Guests</span>
                  </button>
                </div>

                {/* ── Split Option 1: Multi-Tender / Custom Amounts ── */}
                {splitType === 'tender' && (
                  <div
                    className="p-4 rounded-2xl border space-y-3 shadow-2xs"
                    style={{
                      background: 'var(--color-card)',
                      borderColor: 'var(--color-border)',
                    }}
                  >
                    {/* Remaining & Progress Summary */}
                    <div
                      className="p-3 rounded-xl border flex items-center justify-between"
                      style={{
                        background: isTenderFullyPaid ? 'rgba(22, 163, 74, 0.08)' : 'var(--color-bg)',
                        borderColor: isTenderFullyPaid ? '#16a34a' : 'var(--color-border)',
                      }}
                    >
                      <div>
                        <span className="text-[10px] uppercase font-extrabold tracking-wider block" style={{ color: 'var(--color-muted)' }}>
                          {isTenderFullyPaid ? 'Status' : 'Remaining Balance'}
                        </span>
                        <span
                          className={`text-base font-black font-mono ${
                            isTenderFullyPaid
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {isTenderFullyPaid ? '✓ Fully Collected' : `$${tenderRemaining.toFixed(2)} Due`}
                        </span>
                      </div>

                      <div className="text-right font-mono text-xs">
                        <span style={{ color: 'var(--color-muted)' }}>Collected: </span>
                        <span className="font-extrabold text-[var(--color-text)]">${totalTenderCollected.toFixed(2)}</span>
                        <span style={{ color: 'var(--color-muted)' }}> / ${total.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Recorded Split Payments List */}
                    {tenderList.length > 0 && (
                      <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                        {tenderList.map((t, idx) => {
                          const pm = PAYMENT_METHODS.find((p) => p.id === t.method)
                          const Icon = pm?.icon || Banknote
                          return (
                            <div
                              key={t.id || idx}
                              className="p-2 rounded-xl border flex items-center justify-between text-xs animate-in fade-in"
                              style={{
                                background: 'var(--color-bg)',
                                borderColor: 'var(--color-border)',
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-[var(--color-500,#BF4040)]/10 text-[var(--color-500,#BF4040)] flex items-center justify-center">
                                  <Icon size={13} />
                                </div>
                                <span className="font-bold capitalize" style={{ color: 'var(--color-text)' }}>
                                  {pm?.label || t.method}
                                </span>
                                <span className="text-[10px] text-[var(--color-muted)] font-mono">
                                  {t.timestamp}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">
                                  +${Number(t.amount).toFixed(2)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTender(t.id)}
                                  className="text-red-500 hover:bg-red-500/10 p-1 rounded-md transition-colors cursor-pointer"
                                  title="Remove payment"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Add Payment Input Row */}
                    {!isTenderFullyPaid && (
                      <div className="space-y-2 pt-1 border-t" style={{ borderColor: 'var(--color-border)' }}>
                        <span className="text-[11px] font-bold block" style={{ color: 'var(--color-text)' }}>
                          Add Payment Tender
                        </span>

                        <div className="grid grid-cols-3 gap-1.5">
                          {PAYMENT_METHODS.map((pm) => (
                            <button
                              key={pm.id}
                              type="button"
                              onClick={() => setCurrentTenderMethod(pm.id)}
                              className={`py-1.5 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                currentTenderMethod === pm.id
                                  ? 'bg-[var(--color-500,#BF4040)] text-white border-[var(--color-500,#BF4040)] shadow-2xs'
                                  : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:bg-black/5 dark:hover:bg-white/5'
                              }`}
                            >
                              {pm.label}
                            </button>
                          ))}
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={currentTenderAmount}
                            onChange={(e) => setCurrentTenderAmount(e.target.value)}
                            placeholder="0.00"
                            className="flex-1 px-3 py-2 rounded-xl font-mono font-black text-sm border outline-none shadow-2xs"
                            style={{
                              background: 'var(--color-bg)',
                              borderColor: 'var(--color-border)',
                              color: 'var(--color-text)',
                            }}
                          />

                          <button
                            type="button"
                            onClick={handleAddTenderPayment}
                            className="px-4 py-2 rounded-xl text-xs font-extrabold text-white shadow-md transition-all hover:opacity-90 active:scale-95 cursor-pointer shrink-0"
                            style={{
                              background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                            }}
                          >
                            + Add Tender
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Split Option 2: Even Split by Guests ── */}
                {splitType === 'equal' && (
                  <div
                    className="p-4 rounded-2xl border space-y-3 shadow-2xs"
                    style={{
                      background: 'var(--color-card)',
                      borderColor: 'var(--color-border)',
                    }}
                  >
                    {/* Guest Count Selector */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold block" style={{ color: 'var(--color-text)' }}>
                          Number of Guests:
                        </span>
                        <span className="text-[11px] font-mono text-[var(--color-muted)]">
                          Each pays: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">${perGuestShare.toFixed(2)}</strong>
                        </span>
                      </div>

                      {/* Guest Stepper */}
                      <div
                        className="flex items-center gap-1.5 p-1 rounded-xl border shadow-2xs"
                        style={{
                          background: 'var(--color-bg)',
                          borderColor: 'var(--color-border)',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setGuestCount((c) => Math.max(2, c - 1))}
                          className="w-7 h-7 rounded-lg flex items-center justify-center font-black hover:bg-black/5 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                          style={{ color: 'var(--color-text)' }}
                        >
                          <Minus size={13} strokeWidth={2.5} />
                        </button>

                        <span className="w-8 text-center font-mono font-black text-xs select-none" style={{ color: 'var(--color-text)' }}>
                          {guestCount}
                        </span>

                        <button
                          type="button"
                          onClick={() => setGuestCount((c) => Math.min(20, c + 1))}
                          className="w-7 h-7 rounded-lg flex items-center justify-center font-black hover:bg-black/5 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                          style={{ color: 'var(--color-text)' }}
                        >
                          <Plus size={13} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>

                    {/* Quick Guest Count Buttons */}
                    <div className="grid grid-cols-5 gap-1">
                      {[2, 3, 4, 5, 6].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setGuestCount(num)}
                          className={`py-1 rounded-lg text-xs font-mono font-bold border transition-colors cursor-pointer ${
                            guestCount === num
                              ? 'bg-[var(--color-500,#BF4040)] text-white border-[var(--color-500,#BF4040)] shadow-2xs'
                              : 'hover:bg-black/5 dark:hover:bg-white/5 text-[var(--color-text-secondary)]'
                          }`}
                          style={
                            guestCount !== num
                              ? {
                                  background: 'var(--color-bg)',
                                  borderColor: 'var(--color-border)',
                                }
                              : {}
                          }
                        >
                          {num}p
                        </button>
                      ))}
                    </div>

                    {/* Guest Payment Cards List */}
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {guestPayments.map((g) => (
                        <div
                          key={g.id}
                          className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                            g.isPaid
                              ? 'border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-500/10'
                              : 'shadow-2xs'
                          }`}
                          style={
                            !g.isPaid
                              ? {
                                  background: 'var(--color-bg)',
                                  borderColor: 'var(--color-border)',
                                }
                              : {}
                          }
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
                                g.isPaid
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-black/5 dark:bg-white/10 text-[var(--color-muted)]'
                              }`}
                            >
                              {g.isPaid ? <Check size={13} strokeWidth={3} /> : g.id}
                            </div>

                            <div>
                              <span className="font-bold block leading-tight truncate" style={{ color: 'var(--color-text)' }}>
                                {g.name}
                              </span>
                              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                                ${perGuestShare.toFixed(2)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Method Selector */}
                            <select
                              disabled={g.isPaid}
                              value={g.method}
                              onChange={(e) => handleUpdateGuestMethod(g.id, e.target.value)}
                              className="px-2 py-1 rounded-lg text-[11px] font-semibold border outline-none cursor-pointer disabled:opacity-50"
                              style={{
                                background: 'var(--color-card)',
                                borderColor: 'var(--color-border)',
                                color: 'var(--color-text)',
                              }}
                            >
                              <option value="cash">Cash</option>
                              <option value="qr">ABA QR</option>
                              <option value="card">Card</option>
                            </select>

                            {/* Mark Paid Toggle Button */}
                            <button
                              type="button"
                              onClick={() => handleToggleGuestPaid(g.id)}
                              className={`px-3 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                                g.isPaid
                                  ? 'bg-emerald-600 text-white shadow-2xs hover:opacity-90'
                                  : 'border border-[var(--color-border)] hover:bg-black/5 dark:hover:bg-white/5 text-[var(--color-text)]'
                              }`}
                            >
                              {g.isPaid ? 'Paid ✓' : 'Pay Share'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── 3. Financial Summary & Complete CTA ── */}
          <div className="space-y-3 pt-2">
            {/* Detailed Calculations Box */}
            <div
              className="p-4 rounded-2xl border space-y-2 text-xs shadow-2xs"
              style={{
                background: 'var(--color-card)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div className="flex justify-between" style={{ color: 'var(--color-muted)' }}>
                <span>Subtotal (Unpaid)</span>
                <span className="font-mono font-bold" style={{ color: 'var(--color-text)' }}>
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between font-semibold text-emerald-600 dark:text-emerald-400">
                  <span>
                    Discount {discountType === 'percent' ? `(${discountPercent}%)` : '($ Fixed)'}
                  </span>
                  <span className="font-mono font-bold">-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between" style={{ color: 'var(--color-muted)' }}>
                <span>VAT / Tax ({taxRate}%)</span>
                <span className="font-mono font-bold" style={{ color: 'var(--color-text)' }}>
                  ${tax.toFixed(2)}
                </span>
              </div>

              {paidTotal > 0 && (
                <div className="flex justify-between font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="flex items-center gap-1">
                    <span>Already Paid (Settled)</span>
                  </span>
                  <span className="font-mono font-bold line-through">-${paidTotal.toFixed(2)}</span>
                </div>
              )}

              <div
                className="flex justify-between items-baseline pt-2 border-t"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <span className="text-sm font-black uppercase tracking-wider" style={{ color: 'var(--color-text)' }}>
                  Grand Total Due
                </span>
                <span className="text-2xl font-black font-mono" style={{ color: total > 0 ? 'var(--color-500, #BF4040)' : '#10b981' }}>
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={onBack}
                disabled={isProcessing}
                className="px-4 py-3.5 rounded-2xl border text-xs font-bold transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 disabled:opacity-50 cursor-pointer shadow-2xs"
                style={{
                  background: 'var(--color-card)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => onPayLater?.()}
                disabled={isProcessing || items.length === 0}
                className="px-4 py-3.5 rounded-2xl border text-xs font-extrabold transition-all hover:bg-amber-500/10 hover:text-amber-500 hover:border-amber-500/30 active:scale-95 disabled:opacity-40 cursor-pointer shadow-2xs flex items-center gap-1.5 shrink-0"
                style={{
                  background: 'var(--color-card)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                }}
                title="Send order to kitchen and hold bill for later payment"
              >
                <Clock size={15} className="text-amber-500" />
                <span>Pay Later</span>
              </button>

              <button
                type="button"
                onClick={handleCompletePayment}
                disabled={
                  isProcessing ||
                  items.length === 0 ||
                  (checkoutMode === 'split' && splitType === 'tender' && !isTenderFullyPaid) ||
                  (checkoutMode === 'split' && splitType === 'equal' && !isEqualSplitFullyPaid)
                }
                className="flex-1 py-3.5 px-4 rounded-2xl text-xs font-extrabold text-white shadow-xl transition-all flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 disabled:opacity-50 cursor-pointer min-w-0"
                style={{
                  background:
                    checkoutMode === 'split'
                      ? 'linear-gradient(135deg, #0284c7, #0369a1)'
                      : 'linear-gradient(135deg, #16a34a, #15803d)',
                  boxShadow:
                    checkoutMode === 'split'
                      ? '0 4px 14px rgba(2, 132, 199, 0.35)'
                      : '0 4px 14px rgba(22, 163, 74, 0.35)',
                }}
              >
                <Check size={18} strokeWidth={3} />
                <span className="truncate">
                  {isProcessing
                    ? 'Processing Payment...'
                    : checkoutMode === 'split'
                    ? `Complete Split • $${total.toFixed(2)}`
                    : `Complete Payment • $${total.toFixed(2)}`}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Confirm Delete Item Modal ── */}
      <ConfirmModal
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => {
          if (itemToDelete) {
            onRemoveItem?.(itemToDelete.index)
            setItemToDelete(null)
          }
        }}
        title="Remove item from order"
        description={`Are you sure you want to remove "${itemToDelete?.item?.product?.name || 'this item'}" from this order ticket?`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  )
}
