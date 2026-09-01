import { useState } from 'react'
import {
  ShoppingCart,
  Receipt,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Utensils,
  CreditCard,
  ChefHat,
  MessageSquare,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ChevronLeft
} from 'lucide-react'
import toast from 'react-hot-toast'
import FinalBillScreen from './FinalBillScreen'

export default function CheckoutScreen({
  session,
  tableNum,
  orders = [],
  items = [],
  updateQuantity,
  removeItem,
  clearCart,
  onPlaceOrder,
  placingOrder,
  onNavigateTab,
}) {
  const [kitchenNote, setKitchenNote] = useState('')
  const [showFinalBill, setShowFinalBill] = useState(false)

  // Cart Calculations
  const cartSubtotal = items.reduce((sum, item) => {
    const itemBase = parseFloat(item.product?.price || 0)
    const optionsExtra = (item.options || []).reduce(
      (oSum, opt) => oSum + parseFloat(opt.price || 0),
      0
    )
    return sum + (itemBase + optionsExtra) * (item.quantity || 1)
  }, 0)
  const taxRate = typeof window !== 'undefined' && localStorage.getItem('pos_tax_rate') ? Number(localStorage.getItem('pos_tax_rate')) : 7.0
  const cartTax = cartSubtotal * (taxRate / 100.0)
  const cartGrandTotal = cartSubtotal + cartTax
  const cartTotalQty = items.reduce((sum, item) => sum + (item.quantity || 1), 0)

  // Placed Orders Cumulative Bill
  const placedTotal = orders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0)
  const placedDishesCount = orders.reduce(
    (sum, o) => sum + (o.items || []).reduce((iSum, item) => iSum + (item.quantity || 1), 0),
    0
  )

  const handlePayNow = async () => {
    if (onPlaceOrder) {
      await onPlaceOrder()
    }
    if (onNavigateTab) {
      onNavigateTab('bill')
    } else {
      setShowFinalBill(true)
    }
  }

  const handleRequestBill = () => {
    if (onNavigateTab) {
      onNavigateTab('bill')
    } else {
      setShowFinalBill(true)
    }
  }

  if (showFinalBill) {
    return (
      <div className="relative">
        <div className="sticky top-0 z-30 bg-white border-b border-slate-100 p-3 flex items-center justify-between shadow-xs">
          <button
            type="button"
            onClick={() => setShowFinalBill(false)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 flex items-center gap-1 text-xs font-extrabold cursor-pointer transition-colors"
          >
            <ChevronLeft size={16} />
            <span>Back to Cart</span>
          </button>
          <span className="text-xs font-black text-slate-900">Table #{tableNum} Final Bill</span>
          <div className="w-16" />
        </div>
        <FinalBillScreen
          session={session}
          tableNum={tableNum}
          orders={orders}
          token={session?.token}
          onNavigateTab={onNavigateTab}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f6fa] p-4 pb-28 space-y-4">
      {/* ── Table & Cart Header ── */}
      

      {/* ── Cart Items List / Empty State ── */}
      {items.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xs text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center mx-auto text-3xl text-slate-300">
            🍽️
          </div>
          <h3 className="font-extrabold text-sm text-slate-800">Your cart is empty</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Explore delicious dishes from our digital menu and add them to your table order.
          </p>
          <button
            type="button"
            onClick={() => onNavigateTab('food')}
            className="px-5 py-2.5 rounded-2xl bg-[#ff1837] hover:bg-[#e01e38] text-white font-extrabold text-xs shadow-md shadow-red-500/25 inline-flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <Utensils size={14} />
            <span>Explore Menu & Order</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 px-1">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Item Orders
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab('food')}
              className="text-xs font-bold text-[#ff1837] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus size={13} />
              <span>Add More</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {items.map((item, index) => {
              const itemBase = parseFloat(item.product?.price || 0)
              const optionsExtra = (item.options || []).reduce(
                (oSum, opt) => oSum + parseFloat(opt.price || 0),
                0
              )
              const itemTotal = (itemBase + optionsExtra) * (item.quantity || 1)

              return (
                <div key={index} className="py-3 flex items-center gap-3">
                  {/* Dish Thumbnail */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-100 shrink-0 flex items-center justify-center">
                    {item.product?.image_url ? (
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    ) : (
                      <span className="font-bold text-xs text-[#ff1837]">
                        {item.product?.name?.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-extrabold text-xs text-slate-900 truncate">
                      {item.product?.name}
                    </h4>
                    {item.options && item.options.length > 0 && (
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {item.options.map((o) => o.name || o.value).join(', ')}
                      </p>
                    )}
                    {item.specialInstructions && (
                      <p className="text-[10px] text-amber-600 truncate mt-0.5">
                        Note: {item.specialInstructions}
                      </p>
                    )}
                    <span className="font-mono font-black text-xs text-[#ff1837] mt-1 block">
                      ${itemTotal.toFixed(2)}
                    </span>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1.5 bg-slate-100 rounded-xl p-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => updateQuantity(index, (item.quantity || 1) - 1)}
                      className="w-6 h-6 rounded-lg bg-white shadow-xs flex items-center justify-center text-slate-700 hover:text-red-500 cursor-pointer active:scale-90"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-5 text-center font-mono font-black text-xs text-slate-800">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(index, (item.quantity || 1) + 1)}
                      className="w-6 h-6 rounded-lg bg-white shadow-xs flex items-center justify-center text-slate-700 hover:text-[#ff1837] cursor-pointer active:scale-90"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Kitchen Order Note */}
          <div className="pt-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
              <MessageSquare size={13} className="text-slate-400" />
              <span>Notes</span>
            </div>
            <input
              type="text"
              value={kitchenNote}
              onChange={(e) => setKitchenNote(e.target.value)}
              placeholder="Optional.."
              className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 outline-none text-slate-800 placeholder:text-slate-400 focus:border-red-300"
            />
          </div>

          {/* ── Bill Summary ── */}
          <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-mono font-bold text-slate-900">
                ${cartSubtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Tax ({taxRate}%)</span>
              <span className="font-mono font-bold text-slate-900">
                ${cartTax.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm font-black text-slate-900 pt-1.5 border-t border-slate-100">
              <span>Total</span>
              <span className="font-mono text-[#ff1837]">
                ${cartGrandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* ── Submit Order Actions: Pay Later & Pay Now ── */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            {/* Pay Later (Send to Kitchen) */}
            <button
              type="button"
              disabled={placingOrder}
              onClick={onPlaceOrder}
              className="py-3.5 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-50 border border-slate-200/80"
            >
              {placingOrder ? (
                <div className="w-4 h-4 border-2 border-slate-700 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ChefHat size={16} className="text-slate-600" />
                  <span>Pay Later</span>
                </>
              )}
            </button>

            {/* Pay Now (Checkout Immediately) */}
            <button
              type="button"
              disabled={placingOrder}
              onClick={handlePayNow}
              className="py-3.5 px-3 rounded-2xl bg-[#ff1837] hover:bg-[#e01e38] text-white font-extrabold text-xs shadow-lg shadow-red-500/25 flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {placingOrder ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CreditCard size={16} />
                  <span>Pay Now</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── Existing Placed Table Orders / Cumulative Dine-in Bill ── */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
           
            <div>
              <h3 className="font-black text-sm text-slate-900">Current Table Bill</h3>
              <p className="text-[10px] text-slate-400">
                {orders.length} Placed tickets ({placedDishesCount} dishes)
              </p>
            </div>
          </div>
          <span className="font-mono font-black text-base text-emerald-600">
            ${placedTotal.toFixed(2)}
          </span>
        </div>

        {orders.length > 0 ? (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Orders Placed:</span>
              <span className="font-bold text-slate-900">{orders.length} tickets</span>
            </div>
            <div className="flex justify-between text-xs text-slate-600">
              <span>Cumulative Total:</span>
              <span className="font-mono font-bold text-slate-900">${placedTotal.toFixed(2)}</span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-1">
            No previous tickets placed yet for this table session.
          </p>
        )}

        {/* Request Checkout Action */}
        <button
          type="button"
          onClick={handleRequestBill}
          className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <CreditCard size={15} />
          <span>Final Bill</span>
        </button>
      </div>
    </div>
  )
}
