import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { customerApi } from '../../api/posApi'
import { useCartStore } from '../../store/useCartStore'
import {
  Home,
  Utensils,
  FileSpreadsheet,
  BellRing,
  User,
  ShoppingCart,
  ArrowRight,
  X,
  Minus,
  Plus,
  Receipt,
  AlertCircle,
  HelpCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

// Modular Screen Imports
import HomeScreen from './HomeScreen'
import FoodScreen from './FoodScreen'
import OrderStatus from './OrderStatus'
import MessageScreen from './MessageScreen'
import CheckoutScreen from './CheckoutScreen'
import FinalBillScreen from './FinalBillScreen'
import { useWebSocket } from '../../hooks/useWebSocket'

export default function QRMenu({ token: propToken }) {
  const { token: routeToken } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()

  const subdomainToken = (() => {
    try {
      const hostname = window.location.hostname
      const parts = hostname.split('.')
      // If hostname is e.g. "token.192.168.1.4" (5 parts) or "t1.192.168.1.4"
      if (parts.length > 4 && parts.slice(1).every((p) => /^\d+$/.test(p))) {
        return parts[0]
      }
      // If custom domain with subdomain, e.g. "token.pos.com" or "token.localhost"
      if (
        parts.length >= 2 &&
        parts[0] !== 'www' &&
        parts[0] !== 'localhost' &&
        !parts.every((p) => /^\d+$/.test(p))
      ) {
        return parts[0]
      }
    } catch {}
    return null
  })()

  const savedToken = typeof window !== 'undefined' ? (localStorage.getItem('customer_table_token') || sessionStorage.getItem('customer_table_token')) : null
  const token = propToken || routeToken || subdomainToken || savedToken
  const navigate = useNavigate()
  const { subscribe } = useWebSocket(token ? `table_${token}` : null)

  // Save session token to storage for all screens
  useEffect(() => {
    if (token) {
      localStorage.setItem('customer_table_token', token)
      sessionStorage.setItem('customer_table_token', token)
    }
  }, [token])

  // Data states
  const [session, setSession] = useState(null)
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Active Tab: 'home' | 'food' | 'order' | 'message' | 'mine' | 'bill'
  // Persist tab across page refreshes
  const initialTab = searchParams.get('tab') || (typeof window !== 'undefined' ? sessionStorage.getItem('customer_active_tab') : null) || 'home'
  const [activeTab, setActiveTabState] = useState(initialTab)

  const setActiveTab = (tab) => {
    setActiveTabState(tab)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('customer_active_tab', tab)
    }
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (tab === 'home') {
        next.delete('tab')
      } else {
        next.set('tab', tab)
      }
      return next
    }, { replace: true })
  }

  // Keep state in sync if URL query param changes
  useEffect(() => {
    const urlTab = searchParams.get('tab')
    if (urlTab && urlTab !== activeTab) {
      setActiveTabState(urlTab)
      sessionStorage.setItem('customer_active_tab', urlTab)
    }
  }, [searchParams])

  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [language, setLanguage] = useState('en')
  const [customizingProduct, setCustomizingProduct] = useState(null)
  const [isReviewOpen, setIsReviewOpen] = useState(false)
  const [placingOrder, setPlacingOrder] = useState(false)
  const [existingOrders, setExistingOrders] = useState([])
  const [cartBump, setCartBump] = useState(false)
  const [taxRate, setTaxRate] = useState(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('pos_tax_rate') : null
    return saved ? Number(saved) : 7.0
  })

  // Zustand Cart Store
  const { items, addItem, updateQuantity, removeItem, clearCart, loadCartForSession } = useCartStore()

  // Fetch Menu Data & Restore Session Cart
  useEffect(() => {
    if (!token) {
      setLoading(false)
      setError('Please scan a table QR code to start dining.')
      return
    }

    loadCartForSession(token)

    setLoading(true)
    customerApi.getMenu(token)
      .then(({ data }) => {
        const payload = data?.data || data || {}
        setSession(payload.session || null)
        setCategories(payload.categories || [])
        setProducts(payload.products || [])
        if (payload.tax_rate !== undefined) {
          setTaxRate(Number(payload.tax_rate))
          localStorage.setItem('pos_tax_rate', String(payload.tax_rate))
        }
        setLoading(false)
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'This QR Code is invalid, closed, or expired.')
        setLoading(false)
      })
  }, [token])

  // Live Orders Polling & Real-time Sync
  const fetchOrders = () => {
    if (!token) return
    customerApi.getOrderStatus(token)
      .then(({ data }) => {
        const list = data?.orders || data?.data || []
        setExistingOrders(list.filter((o) => o.status !== 'cancelled'))
        if (data?.session) {
          setSession(data.session)
        }
      })
      .catch(() => {})
  }

  useEffect(() => {
    fetchOrders()
    const unsubUpdate = subscribe('order_updated', () => fetchOrders())
    const unsubNew = subscribe('new_order', () => fetchOrders())
    const unsubClose = subscribe('session_closed', () => {
      clearCart(token)
      setSession((prev) => prev ? { ...prev, status: 'closed' } : null)
      setError('This dining session has been closed by the cashier. Thank you for dining with us!')
      toast('Dining session closed by cashier', { icon: '🔒' })
    })
    return () => {
      if (unsubUpdate) unsubUpdate()
      if (unsubNew) unsubNew()
      if (unsubClose) unsubClose()
    }
  }, [token, subscribe])

  // Cart Calculations (using real dynamic taxRate)
  const cartTotalQty = items.reduce((sum, item) => sum + (item.quantity || 1), 0)
  const cartSubtotal = items.reduce((sum, item) => {
    const itemBase = parseFloat(item.product?.price || 0)
    const optionsExtra = (item.options || []).reduce((oSum, opt) => oSum + parseFloat(opt.price || 0), 0)
    return sum + (itemBase + optionsExtra) * (item.quantity || 1)
  }, 0)
  const cartTax = cartSubtotal * (taxRate / 100.0)
  const cartGrandTotal = cartSubtotal + cartTax

  const getProductCartQty = (productId) => {
    return items
      .filter((i) => i.product.id === productId)
      .reduce((sum, i) => sum + i.quantity, 0)
  }

  const triggerCartAnimation = (product) => {
    setCartBump(true)
    setTimeout(() => setCartBump(false), 800)
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-in fade-in slide-in-from-top-3' : 'animate-out fade-out'
          } max-w-sm w-full bg-slate-900/95 backdrop-blur-md text-white shadow-2xl rounded-2xl pointer-events-auto flex p-2.5 items-center justify-between gap-3 border border-slate-700/80`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt=""
                className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-700"
                onError={(e) => { e.target.style.display = 'none' }}
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-[#ff1837] flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                {product.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="truncate">
              <p className="text-xs font-bold truncate text-white">{product.name}</p>
              <p className="text-[10px] text-emerald-400 font-extrabold flex items-center gap-1">
                <span>✓ Added to Cart</span>
                <span className="text-slate-400 font-normal">(${Number(product.price).toFixed(2)})</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              toast.dismiss(t.id)
              setActiveTab('mine')
            }}
            className="px-3 py-1.5 bg-[#ff1837] hover:bg-[#e01e38] text-white text-[11px] font-black rounded-xl shrink-0 cursor-pointer shadow-md active:scale-95 transition-all"
          >
            Checkout
          </button>
        </div>
      ),
      { duration: 2500, position: 'top-center' }
    )
  }

  const handleQuickAdd = (product) => {
    if (product.option_groups && product.option_groups.length > 0) {
      setCustomizingProduct(product)
    } else {
      addItem(product, 1, [], '')
      triggerCartAnimation(product)
    }
  }

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      toast.error('Your order cart is empty')
      return
    }

    setPlacingOrder(true)
    try {
      const payload = {
        order_type: 'qr_scan',
        items: items.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
          special_instructions: item.specialInstructions ? item.specialInstructions : undefined,
          option_value_ids: (item.options || []).map((o) => o.id || o.option_value_id).filter(Boolean),
        })),
      }

      await customerApi.placeOrder(token, payload)
      clearCart(token)
      toast.success('Your order has been sent to the kitchen! 👨‍🍳🔥')
      setIsReviewOpen(false)
      fetchOrders()
      setActiveTab('order')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place order. Please ask your server.')
    } finally {
      setPlacingOrder(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#f5f6fa]">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#ff1837] to-[#ff4757] flex items-center justify-center text-white shadow-xl shadow-red-500/20 mb-4 animate-bounce">
          <Utensils size={30} />
        </div>
        <h2 className="text-sm font-black text-slate-800">Loading exView Menu...</h2>
        <p className="text-xs text-slate-400 mt-1">Connecting to your table terminal</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#f5f6fa] text-center">
        <div className="w-20 h-20 rounded-3xl bg-red-50 border border-red-100 flex items-center justify-center mb-4 text-[#ff1837] shadow-sm">
          <AlertCircle size={40} />
        </div>
        <h2 className="text-lg font-black text-slate-900 mb-1">Session Expired or Closed</h2>
        <p className="text-xs text-slate-500 max-w-xs leading-relaxed mb-5">{error}</p>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 max-w-xs w-full text-left space-y-2 shadow-xs">
          <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <HelpCircle size={14} className="text-[#ff1837]" /> Need Assistance?
          </p>
          <p className="text-[11px] text-slate-500 leading-normal">
            Please ask staff to refresh or open your table dining session QR code.
          </p>
        </div>
      </div>
    )
  }

  const tableNum = session?.table?.table_number || session?.table_id || '8'

  return (
    <div className="min-h-screen bg-[#f5f6fa] text-slate-900 font-sans antialiased select-none max-w-md mx-auto relative shadow-2xl overflow-x-hidden">
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SCREEN CONTAINER (Renders Active Tab Screen) */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'home' && (
        <HomeScreen
          session={session}
          tableNum={tableNum}
          orders={existingOrders}
          categories={categories}
          products={products}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          language={language}
          setLanguage={setLanguage}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          onQuickAdd={handleQuickAdd}
          onOpenCustomizer={setCustomizingProduct}
          getProductCartQty={getProductCartQty}
          onNavigateTab={setActiveTab}
          onCallWaiterModal={() => setActiveTab('message')}
        />
      )}

      {activeTab === 'food' && (
        <FoodScreen
          categories={categories}
          products={products}
          tableNum={tableNum}
          onQuickAdd={handleQuickAdd}
          onOpenCustomizer={setCustomizingProduct}
          getProductCartQty={getProductCartQty}
        />
      )}

      {activeTab === 'order' && (
        <OrderStatus />
      )}

      {activeTab === 'message' && (
        <MessageScreen
          token={token}
          session={session}
          tableNum={tableNum}
          orders={existingOrders}
          subscribe={subscribe}
        />
      )}

      {activeTab === 'mine' && (
        <CheckoutScreen
          session={session}
          tableNum={tableNum}
          orders={existingOrders}
          items={items}
          updateQuantity={updateQuantity}
          removeItem={removeItem}
          clearCart={clearCart}
          onPlaceOrder={handlePlaceOrder}
          placingOrder={placingOrder}
          onNavigateTab={setActiveTab}
        />
      )}

      {activeTab === 'bill' && (
        <FinalBillScreen
          session={session}
          tableNum={tableNum}
          orders={existingOrders}
          token={token}
          onNavigateTab={setActiveTab}
        />
      )}



      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* BOTTOM APP NAVIGATION BAR (5 Tabs) */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200/80 max-w-md mx-auto shadow-lg">
        <div className="grid grid-cols-5 py-2 text-center">
          {/* Home */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('home')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            className={`flex flex-col items-center gap-0.5 cursor-pointer ${
              activeTab === 'home' ? 'text-[#ff1837]' : 'text-slate-400'
            }`}
          >
            <Home size={20} className={activeTab === 'home' ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
            <span className="text-[10px] font-bold">Home</span>
          </button>

          {/* Food Menu */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('food')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            className={`flex flex-col items-center gap-0.5 cursor-pointer ${
              activeTab === 'food' ? 'text-[#ff1837]' : 'text-slate-400'
            }`}
          >
            <Utensils size={20} className={activeTab === 'food' ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
            <span className="text-[10px] font-bold">Food</span>
          </button>

          {/* Order Status */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('order')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            className={`flex flex-col items-center gap-0.5 cursor-pointer relative ${
              activeTab === 'order' ? 'text-[#ff1837]' : 'text-slate-400'
            }`}
          >
            <div className="relative">
              <FileSpreadsheet size={20} className={activeTab === 'order' ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
              {existingOrders.length > 0 && (
                <span className="absolute -top-1 -right-2 px-1 py-0.2 bg-[#ff1837] text-white rounded-full text-[8px] font-black animate-pulse">
                  {existingOrders.length}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold">Order</span>
          </button>

          {/* Message / Service */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('message')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            className={`flex flex-col items-center gap-0.5 cursor-pointer relative ${
              activeTab === 'message' ? 'text-[#ff1837]' : 'text-slate-400'
            }`}
          >
            <div className="relative">
              <BellRing size={20} className={activeTab === 'message' ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
              <span className="absolute -top-1 -right-2 px-1 py-0.2 bg-[#ff1837] text-white rounded-full text-[8px] font-black">
                4
              </span>
            </div>
            <span className="text-[10px] font-bold">Message</span>
          </button>

          {/* Cart & Checkout */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('mine')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            className={`flex flex-col items-center gap-0.5 cursor-pointer relative ${
              activeTab === 'mine' ? 'text-[#ff1837]' : 'text-slate-400'
            }`}
          >
            <div className={`relative transition-transform duration-300 ${cartBump ? 'scale-125' : 'scale-100'}`}>
              <ShoppingCart size={20} className={activeTab === 'mine' ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
              {cartTotalQty > 0 && (
                <span className={`absolute -top-1 -right-2 px-1 py-0.2 bg-[#ff1837] text-white rounded-full text-[8px] font-black ${cartBump ? 'animate-bounce' : ''}`}>
                  {cartTotalQty}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold">Cart</span>
          </button>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* PRODUCT CUSTOMIZER BOTTOM SHEET */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {customizingProduct && (
        <ProductCustomizerModal
          product={customizingProduct}
          onClose={() => setCustomizingProduct(null)}
          onAdd={(product, qty, options, notes) => {
            addItem(product, qty, options, notes)
            triggerCartAnimation(product)
            setCustomizingProduct(null)
          }}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ORDER REVIEW & CHECKOUT BOTTOM SHEET */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {isReviewOpen && (
        <OrderReviewSheet
          isOpen={isReviewOpen}
          items={items}
          subtotal={cartSubtotal}
          tax={cartTax}
          total={cartGrandTotal}
          tableNum={tableNum}
          loading={placingOrder}
          onClose={() => setIsReviewOpen(false)}
          onUpdateQty={updateQuantity}
          onRemoveItem={removeItem}
          onSubmitOrder={handlePlaceOrder}
        />
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// PRODUCT CUSTOMIZER BOTTOM SHEET MODAL
// ═══════════════════════════════════════════════════════════════════

function ProductCustomizerModal({ product, onClose, onAdd }) {
  const [quantity, setQuantity] = useState(1)
  const [selectedOptions, setSelectedOptions] = useState([])
  const [specialNotes, setSpecialNotes] = useState('')

  const handleOptionToggle = (optValue, group) => {
    if (group.is_multi_select) {
      if (selectedOptions.some((o) => o.id === optValue.id)) {
        setSelectedOptions(selectedOptions.filter((o) => o.id !== optValue.id))
      } else {
        setSelectedOptions([...selectedOptions, optValue])
      }
    } else {
      const otherGroupOptions = selectedOptions.filter((o) => o.option_group_id !== group.id)
      setSelectedOptions([...otherGroupOptions, optValue])
    }
  }

  const extraTotal = selectedOptions.reduce((sum, o) => sum + parseFloat(o.price || 0), 0)
  const unitPrice = parseFloat(product.price || 0) + extraTotal
  const finalTotal = unitPrice * quantity

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center p-0 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-t-3xl border-t border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-black text-sm text-slate-900">{product.name}</h3>
            <p className="text-xs font-mono font-bold text-[#ff1837] mt-0.5">
              ${Number(product.price).toFixed(2)} base
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-full text-slate-400">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {(product.option_groups || []).map((grp) => (
            <div key={grp.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                  {grp.name}
                </label>
                <span className="text-[9px] text-slate-400">{grp.is_multi_select ? 'Multiple' : 'Choose 1'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(grp.values || []).map((val) => {
                  const isSelected = selectedOptions.some((o) => o.id === val.id)
                  const price = parseFloat(val.price || 0)

                  return (
                    <button
                      key={val.id}
                      type="button"
                      onClick={() => handleOptionToggle(val, grp)}
                      className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#ff1837] bg-red-50 text-[#ff1837]'
                          : 'border-slate-200 bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="text-xs font-bold truncate">{val.name || val.value}</span>
                      {price > 0 && <span className="text-[10px] font-mono font-bold">+${price.toFixed(2)}</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          <div className="space-y-1">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
              Special Cooking Notes
            </label>
            <textarea
              rows={2}
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              placeholder="e.g. Less spicy, no onions, sauce on the side..."
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#ff1837] resize-none"
            />
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={quantity <= 1}
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 disabled:opacity-40"
            >
              <Minus size={13} />
            </button>
            <span className="font-mono font-black text-sm w-5 text-center">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700"
            >
              <Plus size={13} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => onAdd(product, quantity, selectedOptions, specialNotes)}
            className="flex-1 py-3 px-4 rounded-xl bg-[#ff1837] text-white font-extrabold text-xs shadow-md shadow-red-500/25 flex items-center justify-between cursor-pointer"
          >
            <span>Add to Cart</span>
            <span className="font-mono font-black">${finalTotal.toFixed(2)}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// ORDER REVIEW & CHECKOUT BOTTOM SHEET
// ═══════════════════════════════════════════════════════════════════

function OrderReviewSheet({
  isOpen,
  items,
  subtotal,
  tax,
  total,
  tableNum,
  loading,
  onClose,
  onUpdateQty,
  onRemoveItem,
  onSubmitOrder,
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center p-0 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-t-3xl border-t border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-[#ff1837] flex items-center justify-center font-bold">
              <Receipt size={16} />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900">Review Table Order</h3>
              <p className="text-[10px] text-slate-400">Table #{tableNum} • Kitchen Direct</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-full text-slate-400">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
          {items.map((item, idx) => {
            const itemBase = parseFloat(item.product?.price || 0)
            const optionsExtra = (item.options || []).reduce((sum, opt) => sum + parseFloat(opt.price || 0), 0)
            const lineTotal = (itemBase + optionsExtra) * item.quantity

            return (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2"
              >
                <div className="min-w-0 flex-1">
                  <h4 className="font-extrabold text-xs text-slate-900 truncate">{item.product?.name}</h4>
                  <p className="text-[11px] font-mono font-bold text-[#ff1837] mt-0.5">
                    ${(itemBase + optionsExtra).toFixed(2)} ea
                  </p>
                  {item.options && item.options.length > 0 && (
                    <p className="text-[9px] text-slate-500 mt-0.5">
                      +{item.options.map((o) => o.name || o.value).join(', ')}
                    </p>
                  )}
                  {item.specialInstructions && (
                    <p className="text-[9px] text-amber-600 italic mt-0.5">Note: {item.specialInstructions}</p>
                  )}
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="font-mono font-black text-xs text-slate-900">${lineTotal.toFixed(2)}</span>
                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => onUpdateQty(idx, item.quantity - 1)}
                      className="w-5 h-5 rounded flex items-center justify-center text-slate-600"
                    >
                      <Minus size={11} />
                    </button>
                    <span className="w-4 text-center font-mono font-bold text-xs">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => onUpdateQty(idx, item.quantity + 1)}
                      className="w-5 h-5 rounded flex items-center justify-center text-slate-600"
                    >
                      <Plus size={11} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-2.5 shrink-0">
          <div className="space-y-1 text-xs text-slate-500">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-mono font-bold text-slate-700">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (7%)</span>
              <span className="font-mono font-bold text-slate-700">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-200 text-sm font-black text-slate-900">
              <span>Grand Total</span>
              <span className="font-mono text-[#ff1837]">${total.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="button"
            disabled={loading || items.length === 0}
            onClick={onSubmitOrder}
            className="w-full py-3.5 rounded-2xl bg-[#ff1837] text-white font-extrabold text-xs shadow-lg shadow-red-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span>Sending Order to Kitchen...</span>
            ) : (
              <span>Submit Order to Kitchen (${total.toFixed(2)}) 🔥</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
