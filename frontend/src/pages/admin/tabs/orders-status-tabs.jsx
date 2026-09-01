import React from 'react'
import {
  LayoutGrid,
  Clock,
  ChefHat,
  BellRing,
  CheckCircle2,
  XCircle,
  CreditCard,
  DollarSign,
  AlertCircle,
  RotateCcw,
  Receipt,
  UtensilsCrossed
} from 'lucide-react'

/* ─── Status Configurations ───────────────────────── */
export const ORDER_STATUS_TABS = [
  { id: 'all', label: 'All Orders', icon: LayoutGrid, color: '#6366F1' },
  { id: 'pending', label: 'Pending', icon: Clock, color: '#F59E0B' },
  { id: 'preparing', label: 'Preparing', icon: ChefHat, color: '#3B82F6' },
  { id: 'ready', label: 'Ready', icon: BellRing, color: '#10B981' },
  { id: 'completed', label: 'Completed', icon: CheckCircle2, color: '#10B981' },
  { id: 'cancelled', label: 'Cancelled', icon: XCircle, color: '#EF4444' },
]

export const PAYMENT_STATUS_TABS = [
  { id: 'all', label: 'All Payments', icon: LayoutGrid, color: '#6366F1' },
  { id: 'paid', label: 'Paid', icon: CheckCircle2, color: '#10B981' },
  { id: 'unpaid', label: 'Unpaid', icon: AlertCircle, color: '#EF4444' },
  { id: 'refunded', label: 'Refunded', icon: RotateCcw, color: '#64748B' },
]

/**
 * Modern Underline Tab Bar for Order & Payment Statuses
 * Follows clean minimalist design with active underline indicator,
 * icon alignment, badge counters, and smooth micro-interactions.
 */
export function OrderStatusTabs({
  activeTab = 'all',
  onTabChange = () => {},
  tabs = ORDER_STATUS_TABS,
  counts = {},
  showCounts = true,
  className = '',
  indicatorColor, // optional custom underline color
}) {
  return (
    <div className={`w-full overflow-x-auto scrollbar-none ${className}`}>
      <div
        className="flex items-center gap-1 sm:gap-2 min-w-max border-b px-1 transition-colors"
        style={{ borderColor: 'var(--color-border, #E2E8F0)' }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          const count = counts[tab.id]

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className="group relative flex items-center gap-2 py-3 px-3.5 sm:px-4 text-xs font-semibold transition-all duration-200 cursor-pointer select-none outline-none"
              style={{
                color: isActive
                  ? 'var(--color-text, #0F172A)'
                  : 'var(--color-muted, #64748B)',
              }}
            >
              {/* Icon */}
              {Icon && (
                <Icon
                  size={15}
                  className="transition-transform duration-200 group-hover:scale-110 shrink-0"
                  style={{
                    color: isActive
                      ? (indicatorColor || 'var(--color-text, #0F172A)')
                      : 'var(--color-muted, #64748B)',
                    strokeWidth: isActive ? 2.2 : 1.8,
                  }}
                />
              )}

              {/* Label */}
              <span
                className={`transition-colors whitespace-nowrap ${
                  isActive ? 'font-bold' : 'font-medium'
                }`}
              >
                {tab.label}
              </span>

              {/* Optional Count Badge */}
              {showCounts && count !== undefined && count !== null && (
                <span
                  className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold transition-all shrink-0"
                  style={{
                    background: isActive
                      ? 'var(--color-text, #0F172A)'
                      : 'var(--color-card, #F1F5F9)',
                    color: isActive
                      ? '#FFFFFF'
                      : 'var(--color-muted, #64748B)',
                    border: isActive
                      ? '1px solid transparent'
                      : '1px solid var(--color-border, #E2E8F0)',
                  }}
                >
                  {count}
                </span>
              )}

              {/* Active Underline Indicator (Picture Style) */}
              {isActive && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-t-full transition-all duration-300 shadow-xs"
                  style={{
                    background: indicatorColor || 'var(--color-text, #0F172A)',
                  }}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Dedicated Payment Status Tabs
 */
export function PaymentStatusTabs({
  activeTab = 'all',
  onTabChange = () => {},
  counts = {},
  showCounts = true,
  className = '',
}) {
  return (
    <OrderStatusTabs
      activeTab={activeTab}
      onTabChange={onTabChange}
      tabs={PAYMENT_STATUS_TABS}
      counts={counts}
      showCounts={showCounts}
      className={className}
    />
  )
}

/**
 * Dual Status Tabs Panel: allows switching between
 * "Order Status" and "Payment Status" views or displaying them combined.
 */
export function DualOrdersStatusTabs({
  orderStatus = 'all',
  onOrderStatusChange = () => {},
  paymentStatus = 'all',
  onPaymentStatusChange = () => {},
  orderCounts = {},
  paymentCounts = {},
  showCounts = true,
  className = '',
}) {
  const [activeGroup, setActiveGroup] = React.useState('orders') // 'orders' | 'payments'

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Group Switcher Header */}
      <div className="flex items-center justify-between gap-3 pb-1">
        <div
          className="inline-flex p-1 rounded-xl border"
          style={{
            background: 'var(--color-card, #F8FAFC)',
            borderColor: 'var(--color-border, #E2E8F0)',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveGroup('orders')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeGroup === 'orders'
                ? 'bg-white dark:bg-slate-800 text-[var(--color-text,#0F172A)] shadow-xs'
                : 'text-[var(--color-muted,#64748B)] hover:text-[var(--color-text,#0F172A)]'
            }`}
          >
            <Receipt size={13} />
            <span>Order Status</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveGroup('payments')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeGroup === 'payments'
                ? 'bg-white dark:bg-slate-800 text-[var(--color-text,#0F172A)] shadow-xs'
                : 'text-[var(--color-muted,#64748B)] hover:text-[var(--color-text,#0F172A)]'
            }`}
          >
            <DollarSign size={13} />
            <span>Payment Status</span>
          </button>
        </div>
      </div>

      {/* Underline Tabs View */}
      {activeGroup === 'orders' ? (
        <OrderStatusTabs
          activeTab={orderStatus}
          onTabChange={onOrderStatusChange}
          tabs={ORDER_STATUS_TABS}
          counts={orderCounts}
          showCounts={showCounts}
        />
      ) : (
        <PaymentStatusTabs
          activeTab={paymentStatus}
          onTabChange={onPaymentStatusChange}
          counts={paymentCounts}
          showCounts={showCounts}
        />
      )}
    </div>
  )
}

export default OrderStatusTabs
