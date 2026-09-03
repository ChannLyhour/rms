import { useState, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import CashierLayout from '../../../components/layout/CashierLayout'
import POSOrderSidebar from '../../../components/pos/POSOrderSidebar'
import DetailProductsModal from './DetailProductsModal'
import CheckoutView from '../../../components/pos/CheckoutView'
import VenueSelectDropdown from '../../../components/pos/VenueSelectDropdown'
import { ProductGridCard } from '../../../components/CardProductComponents'
import { adminApi } from '../../../api/adminApi'
import { posApi } from '../../../api/posApi'
import { useCartStore } from '../../../store/useCartStore'
import { useAuth } from '../../../context/AuthContext'
import { useOutletStore } from '../../../store/useOutletStore'
import { Search, Sparkles, CreditCard, Banknote, QrCode, LayoutGrid, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

const getCategoryEmoji = (categoryName) => {
  const name = String(categoryName || '').toLowerCase()
  if (name.includes('special')) return '🍲'
  if (name.includes('soup')) return '🥣'
  if (name.includes('chicken')) return '🍗'
  if (name.includes('main') || name.includes('burger')) return '🍔'
  if (name.includes('pasta') || name.includes('pizza')) return '🍕'
  if (name.includes('dessert') || name.includes('cake') || name.includes('pancake')) return '🍰'
  if (name.includes('drink') || name.includes('coffee') || name.includes('tea') || name.includes('juice')) return '☕'
  return '🍽️'
}

export default function CashierPOS() {
  const location = useLocation()
  const { user, hasRole } = useAuth()
  const { currentOutlet, setCurrentOutlet } = useOutletStore()

  // Initialize selectedOutlet based on logged-in user's assigned venue or current store venue
  const initialOutletId = user?.outlet_id
    ? String(user.outlet_id)
    : currentOutlet?.id
    ? String(currentOutlet.id)
    : 'all'

  const [outlets, setOutlets] = useState([])
  const [selectedOutlet, setSelectedOutlet] = useState(initialOutletId)
  const [loadingCatalog, setLoadingCatalog] = useState(false)
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [selectedCat, setSelectedCat] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12
  const [sessions, setSessions] = useState([])
  const [selectedSession, setSelectedSession] = useState(null)
  const [orderType, setOrderType] = useState('dine_in')
  const [isCheckoutView, setIsCheckoutView] = useState(false)
  const [amountPaid, setAmountPaid] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [selectedProductForModal, setSelectedProductForModal] = useState(null)

  const {
    items,
    setItems,
    addItem,
    removeItem,
    updateQuantity,
    updateItem,
    clearCart,
    loadCartForSession,
    saveCartForSession
  } = useCartStore()

  const fetchCatalog = async (outletId = selectedOutlet) => {
    setLoadingCatalog(true)
    try {
      // 1. Fetch Outlets if not yet loaded
      try {
        const outRes = await posApi.getOutlets().catch(() => adminApi.getOutlets())
        const loadedOutlets = outRes.data?.data || []
        setOutlets(loadedOutlets)
      } catch (err) {
        console.error('Failed to load outlets:', err)
      }

      // 2. Fetch Categories by outlet
      try {
        const catParams = outletId && outletId !== 'all' ? { outlet_id: outletId, limit: 200 } : { limit: 200 }
        const catRes = await posApi.getCategories(catParams).catch(() => adminApi.getCategories(catParams))
        setCategories(catRes.data?.data || [])
      } catch (err) {
        console.error('Failed to load categories:', err)
      }

      // 3. Fetch Products by outlet
      try {
        const prodParams = outletId && outletId !== 'all' ? { outlet_id: outletId, limit: 200 } : { limit: 200 }
        const prodRes = await posApi.getProducts(prodParams).catch(() => adminApi.getProducts(prodParams))
        setProducts(prodRes.data?.data || [])
      } catch (err) {
        console.error('Failed to load products:', err)
      }

      // 4. Fetch Sessions
      try {
        const sessRes = await posApi.getSessions()
        const sessList = sessRes.data?.data || []
        setSessions(sessList)

        // If resumeSession was passed, match session
        if (location.state?.resumeSession || location.state?.tableId) {
          const targetId = Number(location.state.resumeSession || location.state.tableId)
          const matched = sessList.find((s) => s.id === targetId || s.table_id === targetId || s.table?.id === targetId)
          if (matched) {
            setSelectedSession(matched.id)
            loadCartForSession(matched.id)
          } else if (targetId) {
            setSelectedSession(targetId)
            loadCartForSession(targetId)
          }
        } else {
          loadCartForSession(null)
        }
      } catch (err) {
        console.error('Failed to load sessions:', err)
      }
    } finally {
      setLoadingCatalog(false)
    }
  }

  // Reload catalog whenever user login changes or assigned outlet changes
  useEffect(() => {
    const userOutletId = user?.outlet_id ? String(user.outlet_id) : (currentOutlet?.id ? String(currentOutlet.id) : 'all')
    setSelectedOutlet(userOutletId)
    fetchCatalog(userOutletId)
  }, [user?.outlet_id])

  const handleSelectOutlet = (outletId, outletObj) => {
    setSelectedOutlet(outletId)
    setSelectedCat(null)
    setCurrentPage(1)
    if (outletObj) {
      setCurrentOutlet(outletObj)
    }
    fetchCatalog(outletId)
  }

  // Handle incoming navigation state (e.g. from ActiveSessions "Pay & Checkout" or "Add Order Item")
  useEffect(() => {
    if (location.state?.resumeSession || location.state?.openCheckout) {
      const sessId = Number(location.state.resumeSession || location.state.tableId)
      if (sessId) {
        setSelectedSession(sessId)
        setOrderType('dine_in')

        if (location.state.openCheckout) {
          setIsCheckoutView(true)
        } else {
          setIsCheckoutView(false)
          loadCartForSession(sessId)
        }
      }
    }
  }, [location.state])

  // Load saved cart whenever user changes selected table session in POS ordering mode
  const handleSelectSession = (sessId, type) => {
    setSelectedSession(sessId)
    setOrderType(type || (sessId ? 'dine_in' : 'takeaway'))
    loadCartForSession(sessId)
  }

  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCat ? p.category_id === selectedCat : true
    const matchSearch = searchQuery ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) : true
    return matchCat && matchSearch
  })

  // Product counts by outlet for the Venue selector
  const productCounts = useMemo(() => {
    const counts = { all: products.length }
    products.forEach((p) => {
      if (p.outlet_id) {
        counts[String(p.outlet_id)] = (counts[String(p.outlet_id)] || 0) + 1
      }
    })
    return counts
  }, [products])

  // Reset page when category or search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCat, searchQuery])

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage)
  const startResult = filteredProducts.length > 0 ? startIndex + 1 : 0
  const endResult = Math.min(startIndex + itemsPerPage, filteredProducts.length)

  const handlePlaceOrder = async () => {
    if (!selectedSession) {
      toast.error('Please select an active table session first')
      return
    }
    if (items.length === 0) {
      toast.error('Your order cart is empty')
      return
    }

    setIsPlacingOrder(true)
    try {
      const payload = {
        table_session_id: selectedSession,
        order_type: orderType || 'dine_in',
        items: items.map((i) => {
          const itemObj = {
            product_id: i.product?.id || i.product_id,
            quantity: Math.max(1, Number(i.quantity || 1)),
            option_value_ids: (i.options || [])
              .map((o) => o.id || o.option_value_id)
              .filter(Boolean),
          }
          if (i.specialInstructions && String(i.specialInstructions).trim()) {
            itemObj.special_instructions = String(i.specialInstructions).trim()
          }
          return itemObj
        }),
      }
      await posApi.createOrder(payload)
      clearCart(selectedSession)
      toast.success('Order sent to kitchen successfully!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place order')
    } finally {
      setIsPlacingOrder(false)
    }
  }

  const handleOpenPayment = () => {
    setIsCheckoutView(true)
  }

  const handleCheckoutPayment = async (checkoutData) => {
    setIsPlacingOrder(true)
    try {
      let targetSessionId = selectedSession

      // Resolve valid session ID for Takeaway or Dine-In
      if (!targetSessionId) {
        if (sessions && sessions.length > 0) {
          targetSessionId = sessions[0].id
        } else {
          try {
            const tablesRes = await posApi.getTables()
            const tablesList = tablesRes.data?.data || []
            const availTable = tablesList.find((t) => t.status === 'available') || tablesList[0]
            if (availTable) {
              try {
                const sessRes = await posApi.openSession({ table_id: availTable.id })
                targetSessionId = sessRes.data?.session?.id || sessRes.data?.data?.session?.id
              } catch (openErr) {
                const activeSessRes = await posApi.getSessions()
                const activeList = activeSessRes.data?.data || []
                if (activeList.length > 0) {
                  targetSessionId = activeList[0].id
                }
              }
            }
          } catch (e) {
            console.warn('Takeaway quick session resolution warning:', e)
          }
        }
      }

      if (targetSessionId) {
        // 1. If cart has pending items, save order to DB first
        if (items && items.length > 0) {
          const orderPayload = {
            table_session_id: targetSessionId,
            order_type: orderType || (selectedSession ? 'dine_in' : 'takeaway'),
            items: items.map((i) => {
              const prodId = i.product?.id || i.product_id
              const qty = Math.max(1, Number(i.quantity || 1))
              const optIds = (i.options || [])
                .map((o) => o.id || o.option_value_id)
                .filter(Boolean)

              const itemObj = {
                product_id: prodId,
                quantity: qty,
                option_value_ids: optIds,
              }
              if (i.specialInstructions && String(i.specialInstructions).trim()) {
                itemObj.special_instructions = String(i.specialInstructions).trim()
              }
              return itemObj
            }),
          }
          await posApi.createOrder(orderPayload)
        }

        // 2. Process payment record
        const transRef = checkoutData.isSplit
          ? `SPLIT:${checkoutData.splitType || 'multi'}`
          : undefined

        await posApi.processPayment({
          table_session_id: targetSessionId,
          payment_method: checkoutData.paymentMethod || 'cash',
          amount_paid: Number(checkoutData.amountPaid || checkoutData.total || 0),
          transaction_ref: transRef,
        })

        // 3. Auto-close session & mark table as available
        const currentSession = sessions.find((s) => s.id === targetSessionId)
        const tableId = currentSession?.table_id || currentSession?.table?.id
        if (tableId) {
          try {
            await posApi.closeSession(targetSessionId, tableId)
          } catch (e) {
            console.warn('Auto close session warning:', e)
          }
        }
      }

      setIsCheckoutView(false)
      clearCart(selectedSession)
      toast.success(
        checkoutData.isSplit
          ? 'Split payments completed successfully!'
          : 'Payment completed successfully!'
      )

      // Refresh active sessions & tables
      const { data } = await posApi.getSessions()
      setSessions(data.data || [])
      setSelectedSession(null)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Payment failed')
    } finally {
      setIsPlacingOrder(false)
    }
  }

  const handlePayLater = async () => {
    if (!selectedSession && orderType !== 'takeaway') {
      toast.error('Please select an active table session for dine-in')
      return
    }

    if (items.length === 0) {
      toast.error('No items in order to send to kitchen')
      return
    }

    setIsPlacingOrder(true)
    try {
      let targetSessionId = selectedSession

      if (!targetSessionId) {
        try {
          const activeSessRes = await posApi.getSessions()
          const activeList = activeSessRes.data?.data || []
          if (activeList.length > 0) {
            targetSessionId = activeList[0].id
          } else {
            const tablesRes = await posApi.getTables()
            const tablesList = tablesRes.data?.data || []
            const availTable = tablesList.find((t) => t.status === 'available') || tablesList[0]
            if (availTable) {
              const sessRes = await posApi.openSession({ table_id: availTable.id })
              targetSessionId = sessRes.data?.session?.id || sessRes.data?.data?.session?.id
            }
          }
        } catch (e) {
          console.warn('Takeaway quick session resolution warning:', e)
        }
      }

      if (targetSessionId) {
        const orderPayload = {
          table_session_id: targetSessionId,
          order_type: orderType || (selectedSession ? 'dine_in' : 'takeaway'),
          items: items.map((i) => {
            const prodId = i.product?.id || i.product_id
            const qty = Math.max(1, Number(i.quantity || 1))
            const optIds = (i.options || [])
              .map((o) => o.id || o.option_value_id)
              .filter(Boolean)

            const itemObj = {
              product_id: prodId,
              quantity: qty,
              option_value_ids: optIds,
            }
            if (i.specialInstructions && String(i.specialInstructions).trim()) {
              itemObj.special_instructions = String(i.specialInstructions).trim()
            }
            return itemObj
          }),
        }
        await posApi.createOrder(orderPayload)
      }

      setIsCheckoutView(false)
      clearCart(selectedSession)
      toast.success('Order sent to kitchen! Bill held for later payment.')

      // Refresh active sessions & tables
      const { data } = await posApi.getSessions()
      setSessions(data.data || [])
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place order')
    } finally {
      setIsPlacingOrder(false)
    }
  }

  return (
    <CashierLayout>
      {isCheckoutView ? (
        <CheckoutView
          onBack={() => setIsCheckoutView(false)}
          items={items}
          sessions={sessions}
          selectedSession={selectedSession}
          onSelectSession={handleSelectSession}
          orderType={orderType}
          onUpdateQuantity={updateQuantity}
          onUpdateItem={updateItem}
          onRemoveItem={removeItem}
          onProcessPayment={handleCheckoutPayment}
          onPayLater={handlePayLater}
          isProcessing={isPlacingOrder}
        />
      ) : (
        <div className="flex h-full overflow-hidden">
          {/* Main Catalog & Menu Panel */}
          <div className="flex-1 flex flex-col min-w-0 min-h-0 h-full overflow-hidden">
            {/* POS Header info & Search & Categories */}
            <div
              className="p-4 border-b space-y-3 shrink-0"
              style={{
                background: 'var(--color-surface)',
                borderColor: 'var(--color-border)'
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="header-info">
                  <h4 className="font-extrabold text-lg tracking-tight" style={{ color: 'var(--color-text)' }}>
                    {selectedSession ? `Resume #${selectedSession}` : 'New Order'}
                  </h4>
                </div>

                {/* Right Actions: Venue Filter Dropdown & Search Input */}
                <div className="flex flex-wrap items-center gap-2.5 flex-1 justify-end">
                  {/* Select Search & Selection Dropdown Component for get products by Venues */}
                  <VenueSelectDropdown
                    outlets={outlets}
                    selectedOutlet={selectedOutlet}
                    onSelectOutlet={handleSelectOutlet}
                    productCounts={productCounts}
                    loading={loadingCatalog}
                    disabled={!hasRole('admin')}
                  />

                  <div className="search-box w-full sm:w-auto max-w-xs flex-1">
                    <div
                      className="flex items-center gap-2 px-3.5 py-2 rounded-[6px] border text-sm shadow-xs transition-colors"
                      style={{
                        background: 'var(--color-bg)',
                        borderColor: 'var(--color-border)'
                      }}
                    >
                      <Search size={16} style={{ color: 'var(--color-muted)' }} />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search products..."
                        className="bg-transparent border-none outline-none w-full text-xs placeholder:text-slate-400"
                        style={{ color: 'var(--color-text)' }}
                      />
                      {searchQuery ? (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="text-xs transition-colors hover:text-red-500 cursor-pointer"
                          style={{ color: 'var(--color-muted)' }}
                        >
                          Clear
                        </button>
                      ) : (
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 text-slate-400">
                          /
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Categories Pills Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setSelectedCat(null)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] text-xs font-semibold shrink-0 transition-all border ${
                    selectedCat === null
                      ? 'shadow-xs text-white'
                      : 'hover:opacity-80'
                  }`}
                  style={
                    selectedCat === null
                      ? { background: 'var(--color-500, #BF4040)', borderColor: 'var(--color-500, #BF4040)' }
                      : {
                          background: 'var(--color-card)',
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-text-secondary)'
                        }
                  }
                >
                  <LayoutGrid size={13} />
                  <span>All Items</span>
                  <span
                    className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      selectedCat === null ? 'bg-white/20 text-white' : 'bg-black/5 dark:bg-white/10'
                    }`}
                  >
                    {products.length}
                  </span>
                </button>

                {categories.map((c) => {
                  const count = products.filter((p) => p.category_id === c.id).length
                  const isSelected = selectedCat === c.id
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedCat(c.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] text-xs font-semibold shrink-0 transition-all border ${
                        isSelected
                          ? 'shadow-xs text-white'
                          : 'hover:opacity-80'
                      }`}
                      style={
                        isSelected
                          ? { background: 'var(--color-500, #BF4040)', borderColor: 'var(--color-500, #BF4040)' }
                          : {
                              background: 'var(--color-card)',
                              borderColor: 'var(--color-border)',
                              color: 'var(--color-text-secondary)'
                            }
                      }
                    >
                      <span>{getCategoryEmoji(c.name)}</span>
                      <span>{c.name}</span>
                      <span
                        className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-black/5 dark:bg-white/10'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Products Grid & Pagination (.catalog-scrollable-area) */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden catalog-scrollable-area">
              <div className="flex-1 overflow-y-auto p-4">
                {paginatedProducts.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                    <div
                      className="w-16 h-16 rounded-[5px] flex items-center justify-center border shadow-xs"
                      style={{
                        background: 'var(--color-card)',
                        borderColor: 'var(--color-border)'
                      }}
                    >
                      <Sparkles size={28} style={{ color: 'var(--color-muted)' }} />
                    </div>
                    <p className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>
                      No dishes found
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                      Try selecting another category or clear your search
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                    {paginatedProducts.map((p) => {
                      const catName = categories.find((c) => c.id === p.category_id)?.name
                      return (
                        <ProductGridCard
                          key={p.id}
                          product={p}
                          categoryName={catName}
                          onSelect={() => setSelectedProductForModal(p)}
                        />
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Minimal Bottom Pagination Bar (.catalog-pagination-bar) */}
              <div
                className="catalog-pagination-bar px-4 py-2 border-t flex items-center justify-between gap-3 text-xs shrink-0 shadow-xs"
                style={{
                  background: 'var(--color-surface)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <div className="font-medium" style={{ color: 'var(--color-muted)' }}>
                  Showing <span className="font-bold font-mono" style={{ color: 'var(--color-text)' }}>{startResult}-{endResult}</span> of{' '}
                  <span className="font-bold font-mono" style={{ color: 'var(--color-text)' }}>{filteredProducts.length}</span> items
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="p-1 rounded-[5px] border transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black/5 dark:hover:bg-white/5"
                      style={{
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text)'
                      }}
                      title="Previous page"
                    >
                      <ChevronLeft size={15} />
                    </button>

                    <div className="flex items-center gap-1 px-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setCurrentPage(num)}
                          className={`w-6 h-6 rounded-[5px] text-[11px] font-mono font-bold transition-all ${
                            currentPage === num
                              ? 'text-white shadow-xs'
                              : 'hover:bg-black/5 dark:hover:bg-white/5'
                          }`}
                          style={
                            currentPage === num
                              ? { background: 'var(--color-500, #BF4040)' }
                              : { color: 'var(--color-text)' }
                          }
                        >
                          {num}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className="p-1 rounded-[5px] border transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black/5 dark:hover:bg-white/5"
                      style={{
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text)'
                      }}
                      title="Next page"
                    >
                      <ChevronRight size={15} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right-hand Order Ticket Sidebar */}
          <POSOrderSidebar
            items={items}
            sessions={sessions}
            selectedSession={selectedSession}
            setSelectedSession={handleSelectSession}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeItem}
            onClearCart={clearCart}
            onPlaceOrder={handlePlaceOrder}
            onOpenPayment={handleOpenPayment}
            orderType={orderType}
            setOrderType={setOrderType}
            isPlacingOrder={isPlacingOrder}
          />
        </div>
      )}

      {/* Product Details & Modifiers Modal */}
      <DetailProductsModal
        isOpen={!!selectedProductForModal}
        product={selectedProductForModal}
        categoryName={
          categories.find((c) => c.id === selectedProductForModal?.category_id)?.name || 'Menu Item'
        }
        onClose={() => setSelectedProductForModal(null)}
        onAddToCart={(product, qty, options, notes) => {
          addItem(product, qty, options, notes)
          toast.success(`Added ${qty}x ${product.name} to order`)
        }}
      />
    </CashierLayout>
  )
}
