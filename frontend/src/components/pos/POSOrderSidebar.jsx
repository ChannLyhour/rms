import { useState, useEffect } from 'react'
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  UtensilsCrossed,
  ShoppingBag,
  Bike,
  Save,
  Receipt,
  Percent
} from 'lucide-react'
import { ChevronDown, SearchLg, Check } from '@untitledui/icons'
import { MenuTrigger, Popover, Button as AriaButton } from 'react-aria-components'
import { InputBase } from '../Dropdowncomponents'
import toast from 'react-hot-toast'
import { adminApi } from '../../api/adminApi'
import { ConfirmModal } from '../common/ModalComponent'

export default function POSOrderSidebar({
  items = [],
  sessions = [],
  selectedSession,
  setSelectedSession,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onPlaceOrder,
  onOpenPayment,
  orderType = 'dine_in',
  setOrderType,
  isPlacingOrder = false
}) {
  const [discountPercent, setDiscountPercent] = useState(0)
  const [tableSearch, setTableSearch] = useState('')
  const [itemToDelete, setItemToDelete] = useState(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
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
    const loadTaxRate = async () => {
      try {
        const saved = localStorage.getItem('pos_tax_rate')
        if (saved !== null) {
          setTaxRate(Number(saved))
        }

        const res = await adminApi.getSetting('tax_rate')
        const val = res.data?.data?.value ?? res.data?.value
        if (val !== undefined && val !== null) {
          const num = Number(val)
          setTaxRate(num)
          localStorage.setItem('pos_tax_rate', String(num))
        }
      } catch (e) {}
    }

    loadTaxRate()

    const handleSettingsChanged = () => {
      const saved = localStorage.getItem('pos_tax_rate')
      if (saved !== null) {
        setTaxRate(Number(saved))
      } else {
        loadTaxRate()
      }
    }

    window.addEventListener('pos_settings_changed', handleSettingsChanged)
    window.addEventListener('storage', handleSettingsChanged)
    return () => {
      window.removeEventListener('pos_settings_changed', handleSettingsChanged)
      window.removeEventListener('storage', handleSettingsChanged)
    }
  }, [])

  const selectedSessionData = sessions.find((s) => s.id === selectedSession)
  const filteredSessions = sessions.filter((s) => {
    const searchTarget = `Table ${s.table?.table_number || s.table_id} ${s.customer_name || 'Guest'}`.toLowerCase()
    return searchTarget.includes(tableSearch.toLowerCase())
  })

  // Calculations
  const subtotal = items.reduce((acc, item) => {
    const base = (item.product?.price || 0) * item.quantity
    const opts = (item.options || []).reduce((o, ov) => o + (ov.price || 0), 0) * item.quantity
    return acc + base + opts
  }, 0)

  const discountAmount = (subtotal * discountPercent) / 100
  const afterDiscount = Math.max(0, subtotal - discountAmount)
  const taxPercentage = taxRate
  const tax = afterDiscount * (taxPercentage / 100)
  const total = afterDiscount + tax
  const totalItemsCount = items.reduce((acc, i) => acc + i.quantity, 0)

  const handleSaveLater = () => {
    if (items.length === 0) {
      toast.error('Cart is empty')
      return
    }
    const key = selectedSession ? `pos_cart_session_${selectedSession}` : 'pos_cart_takeaway'
    try {
      localStorage.setItem(key, JSON.stringify(items))
      if (selectedSessionData) {
        toast.success(`Draft saved for Table ${selectedSessionData.table?.table_number || selectedSessionData.table_id}`)
      } else {
        toast.success('Order ticket saved for later')
      }
    } catch (e) {
      toast.success('Order ticket saved')
    }
  }

  return (
    <div
      className="cart-container w-96 flex flex-col border-l shrink-0 select-none h-full relative z-20"
      style={{
        background: 'var(--color-surface)',
        borderColor: 'var(--color-border)'
      }}
    >
      {/* ── Top Header & Service Type (ROS Cart Header) ── */}
      <div
        className="p-4 border-b space-y-3 shrink-0"
        style={{
          background: 'var(--color-card)',
          borderColor: 'var(--color-border)'
        }}
      >
        {/* Title Bar & Quick Action Circles */}
        <div className="flex justify-between items-center gap-2">
          {orderType === 'dine_in' ? (
            <div className="flex-1 min-w-0">
              <MenuTrigger>
                <AriaButton
                  id="tableId"
                  className="w-full flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-[5px] text-xs border outline-none font-semibold transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-[0.99] text-left cursor-pointer truncate shadow-xs"
                  style={{
                    background: 'var(--color-bg)',
                    borderColor: selectedSession ? 'var(--color-500, #BF4040)' : 'var(--color-border)',
                    color: 'var(--color-text)'
                  }}
                >
                  <div className="flex items-center gap-1.5 min-w-0 truncate">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        selectedSession ? 'bg-emerald-500 ring-2 ring-emerald-500/20' : 'bg-slate-400'
                      }`}
                    />
                    <span className="truncate">
                      {selectedSessionData
                        ? `Table ${selectedSessionData.table?.table_number || selectedSessionData.table_id} (${selectedSessionData.table?.capacity || 4}p) • ${selectedSessionData.customer_name || 'Guest'}`
                        : 'Choose Table / Session'}
                    </span>
                  </div>
                  <ChevronDown size={14} className="shrink-0 text-[var(--color-muted)] stroke-[2.25px]" />
                </AriaButton>

                <Popover
                  placement="bottom start"
                  offset={6}
                  className="w-72 rounded-[6px] border shadow-xl backdrop-blur-md overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150"
                  style={{
                    background: 'var(--color-surface)',
                    borderColor: 'var(--color-border)'
                  }}
                >
                  <div className="p-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <InputBase
                      size="sm"
                      placeholder="Search table or guest..."
                      icon={SearchLg}
                      value={tableSearch}
                      onChange={(e) => setTableSearch(e.target.value)}
                    />
                  </div>

                  <div className="p-1 max-h-56 overflow-y-auto space-y-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSession(null)
                        setTableSearch('')
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium rounded-[4px] transition-colors text-left hover:bg-black/5 dark:hover:bg-white/5 ${
                        !selectedSession ? 'text-[var(--color-500,#BF4040)] font-bold' : ''
                      }`}
                      style={{ color: !selectedSession ? 'var(--color-500, #BF4040)' : 'var(--color-muted)' }}
                    >
                      <span>— No Table Selected —</span>
                      {!selectedSession && <Check size={12} strokeWidth={3} />}
                    </button>

                    {filteredSessions.length === 0 ? (
                      <div className="py-4 text-center text-xs" style={{ color: 'var(--color-muted)' }}>
                        No active tables found
                      </div>
                    ) : (
                      filteredSessions.map((s) => {
                        const isSelected = selectedSession === s.id
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => {
                              setSelectedSession(s.id)
                              setTableSearch('')
                            }}
                            className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 text-xs font-medium rounded-[4px] transition-colors text-left ${
                              isSelected
                                ? 'bg-[var(--color-500,#BF4040)] text-white shadow-xs font-bold'
                                : 'hover:bg-black/5 dark:hover:bg-white/5'
                            }`}
                            style={
                              isSelected
                                ? { background: 'var(--color-500, #BF4040)', color: '#ffffff' }
                                : { color: 'var(--color-text)' }
                            }
                          >
                            <div className="flex items-center gap-2 min-w-0 truncate">
                              <span
                                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                  isSelected ? 'bg-white' : 'bg-emerald-500'
                                }`}
                              />
                              <span className="truncate">
                                Table {s.table?.table_number || s.table_id} ({s.table?.capacity || 4}p) • {s.customer_name || 'Guest'}
                              </span>
                            </div>
                            {isSelected && <Check size={12} strokeWidth={3} className="shrink-0" />}
                          </button>
                        )
                      })
                    )}
                  </div>
                </Popover>
              </MenuTrigger>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
                {orderType === 'takeaway' ? 'Takeaway Order' : 'Current Order'}
              </span>
            </div>
          )}

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleSaveLater}
              className="w-8 h-8 rounded-[5px] border flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-xs"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
                background: 'var(--color-bg)'
              }}
              title="Save Later"
            >
              <Save size={14} />
            </button>
            <button
              onClick={() => setShowClearConfirm(true)}
              disabled={items.length === 0}
              className="w-8 h-8 rounded-[5px] border flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs hover:border-red-500 hover:text-red-500 cursor-pointer"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-muted)',
                background: 'var(--color-bg)'
              }}
              title="Clear Cart"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* ── Order Type Selector (Dine In / Takeaway) ── */}
        <div className="order-type-container">
          <label className="text-[10px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--color-muted)' }}>
            Service Type
          </label>
          <div
            className="grid grid-cols-2 gap-1 p-1 rounded-[5px] border"
            style={{
              background: 'var(--color-bg)',
              borderColor: 'var(--color-border)'
            }}
          >
            <button
              type="button"
              onClick={() => setOrderType?.('dine_in')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-[5px] text-xs font-bold transition-all ${
                orderType === 'dine_in'
                  ? 'shadow-sm text-white'
                  : 'hover:bg-black/5 dark:hover:bg-white/5'
              }`}
              style={
                orderType === 'dine_in'
                  ? { background: 'var(--color-500, #BF4040)', color: '#ffffff' }
                  : { color: 'var(--color-text-secondary)' }
              }
            >
              <UtensilsCrossed size={13} />
              Dine In
            </button>

            <button
              type="button"
              onClick={() => setOrderType?.('takeaway')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-[5px] text-xs font-bold transition-all ${
                orderType === 'takeaway'
                  ? 'shadow-sm text-white'
                  : 'hover:bg-black/5 dark:hover:bg-white/5'
              }`}
              style={
                orderType === 'takeaway'
                  ? { background: 'var(--color-500, #BF4040)', color: '#ffffff' }
                  : { color: 'var(--color-text-secondary)' }
              }
            >
              <ShoppingBag size={13} />
              Takeaway
            </button>
          </div>
        </div>
      </div>

      {/* ── Cart Items List (ROS Item Template) ── */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2" id="cartItems">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 empty-cart-msg">
            <div
              className="w-16 h-16 rounded-[5px] flex items-center justify-center mb-3 border shadow-xs"
              style={{
                background: 'var(--color-card)',
                borderColor: 'var(--color-border)'
              }}
            >
              <ShoppingBag size={32} style={{ color: 'var(--color-muted)' }} />
            </div>
            <p className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>
              Your cart is empty
            </p>
            <p className="text-xs mt-1 max-w-[200px]" style={{ color: 'var(--color-muted)' }}>
              Tap items from the menu to add them to this order ticket.
            </p>
          </div>
        ) : (
          items.map((item, idx) => {
            const itemPrice =
              (item.product?.price || 0) +
              (item.options || []).reduce((o, ov) => o + (ov.price || 0), 0)
            const lineTotal = itemPrice * item.quantity

            return (
              <div
                key={`${item.product?.id || idx}-${idx}`}
                className="cart-item rounded-2xl p-3 border transition-all duration-150 shadow-2xs hover:shadow-xs flex flex-col gap-2 group"
                style={{
                  background: 'var(--color-card)',
                  borderColor: 'var(--color-border)'
                }}
              >
                {/* ── Top Row: Thumbnail, Name & Remove ── */}
                <div className="flex items-start gap-2.5">
                  {/* Thumbnail with Quantity Pill */}
                  <div className="relative shrink-0">
                    {item.product?.image_url ? (
                      <img
                        src={item.product.image_url}
                        alt={item.product?.name}
                        className="w-12 h-12 rounded-xl object-cover border shadow-2xs"
                        style={{ borderColor: 'var(--color-border)' }}
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xs border shadow-2xs"
                        style={{
                          background: 'var(--color-bg)',
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-500, #BF4040)'
                        }}
                      >
                        {item.product?.name?.slice(0, 2).toUpperCase() || 'IT'}
                      </div>
                    )}
                  </div>

                  {/* Title & Pricing */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <p
                        className="font-bold text-xs leading-snug truncate"
                        style={{ color: 'var(--color-text)' }}
                        title={item.product?.name}
                      >
                        {item.product?.name}
                      </p>

                      <button
                        type="button"
                        onClick={() => setItemToDelete({ index: idx, item })}
                        className="p-1 rounded-md transition-colors hover:text-red-500 hover:bg-red-500/10 shrink-0 cursor-pointer"
                        style={{ color: 'var(--color-muted)' }}
                        title="Remove item"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {/* Price Breakdown */}
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span
                        className="text-xs font-black font-mono"
                        style={{ color: 'var(--color-500, #BF4040)' }}
                      >
                        ${lineTotal.toFixed(2)}
                      </span>
                      {item.quantity > 1 && (
                        <span
                          className="text-[10px] font-mono"
                          style={{ color: 'var(--color-muted)' }}
                        >
                          (${itemPrice.toFixed(2)} ea)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Modifiers & Selected Add-ons ── */}
                {item.options && item.options.length > 0 && (
                  <div className="flex flex-wrap gap-1 pl-1">
                    {item.options.map((opt, oIdx) => (
                      <span
                        key={oIdx}
                        className="text-[10px] px-2 py-0.5 rounded-md border font-semibold leading-tight shadow-2xs"
                        style={{
                          background: 'var(--color-bg)',
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-text-secondary)'
                        }}
                      >
                        +{opt.name} {opt.price > 0 && `($${Number(opt.price).toFixed(2)})`}
                      </span>
                    ))}
                  </div>
                )}

                {/* ── Chef Notes / Special Instructions ── */}
                {item.specialInstructions && (
                  <div
                    className="text-[10px] px-2 py-1 rounded-lg border font-medium leading-relaxed italic"
                    style={{
                      background: 'var(--color-bg)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-muted)'
                    }}
                  >
                    📝 {item.specialInstructions}
                  </div>
                )}

                {/* ── Bottom Row: Stepper Controls ── */}
                <div
                  className="flex items-center justify-between pt-1.5 border-t"
                  style={{ borderColor: 'var(--color-border-subtle, var(--color-border))' }}
                >
                  <span className="text-[10px] font-bold" style={{ color: 'var(--color-muted)' }}>
                    Portion Qty
                  </span>

                  <div
                    className="qty-controls flex items-center gap-1 rounded-lg p-0.5 border shadow-2xs"
                    style={{
                      background: 'var(--color-bg)',
                      borderColor: 'var(--color-border)'
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        if (item.quantity <= 1) {
                          setItemToDelete({ index: idx, item })
                        } else {
                          onUpdateQuantity(idx, item.quantity - 1)
                        }
                      }}
                      className="qty-btn w-6 h-6 rounded-md flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                      style={{ color: 'var(--color-text)' }}
                      title="Decrease quantity"
                    >
                      <Minus size={11} strokeWidth={2.5} />
                    </button>

                    <span
                      className="text-xs font-mono font-black w-6 text-center select-none"
                      style={{ color: 'var(--color-text)' }}
                    >
                      {item.quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                      className="qty-btn w-6 h-6 rounded-md flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                      style={{ color: 'var(--color-text)' }}
                      title="Increase quantity"
                    >
                      <Plus size={11} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* ── Summary & Checkout (ROS summary.blade.php) ── */}
      <div
        className="p-4 border-t space-y-3 shrink-0 shadow-lg mt-auto"
        style={{
          background: 'var(--color-surface)',
          borderColor: 'var(--color-border)'
        }}
      >
        {/* Calculation Rows (.summary-details) */}
        <div className="summary-details space-y-1.5 text-xs pt-1 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex justify-between" style={{ color: 'var(--color-muted)' }}>
            <span>Subtotal</span>
            <span className="font-mono font-bold" style={{ color: 'var(--color-text)' }}>
              ${subtotal.toFixed(2)}
            </span>
          </div>

          {discountPercent > 0 && (
            <div className="flex justify-between text-red-500 font-semibold">
              <span>Discount ({discountPercent}%)</span>
              <span className="font-mono font-bold">-${discountAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between pb-2 border-b" style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}>
            <span>Tax ({taxPercentage}%)</span>
            <span className="font-mono font-bold" style={{ color: 'var(--color-text)' }}>
              ${tax.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between items-baseline pt-1">
            <span className="text-sm font-extrabold uppercase tracking-wide" style={{ color: 'var(--color-text)' }}>
              Total
            </span>
            <span className="text-xl font-black font-mono" style={{ color: 'var(--color-500, #BF4040)' }}>
              ${total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* ── Checkout Actions (.checkout-actions) ── */}
        <div className="checkout-actions space-y-2 pt-1">
          {/* Primary Pay & Checkout Button */}
          <button
            type="button"
            onClick={() => onOpenPayment(total)}
            disabled={items.length === 0 && !selectedSession}
            className="w-full py-3.5 px-4 rounded-[5px] text-xs font-extrabold text-white transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-95 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
              boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)',
              letterSpacing: '0.5px'
            }}
          >
            <CreditCard size={17} />
            <span>PAYMENT & CHECKOUT</span>
          </button>


        </div>
      </div>

      {/* ── Delete Item Confirmation Modal ── */}
      <ConfirmModal
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => {
          if (itemToDelete) {
            onRemoveItem(itemToDelete.index)
            setItemToDelete(null)
          }
        }}
        title="Delete item from cart"
        description={`Are you sure you want to remove "${itemToDelete?.item?.product?.name || 'this item'}" from this order ticket? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* ── Clear Entire Cart Confirmation Modal ── */}
      <ConfirmModal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={() => {
          onClearCart()
          setShowClearConfirm(false)
        }}
        title="Clear entire cart"
        description="Are you sure you want to remove all items from this order ticket? All selected items and custom notes will be discarded."
        confirmText="Clear Cart"
        cancelText="Cancel"
      />
    </div>
  )
}
