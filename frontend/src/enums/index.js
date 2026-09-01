/**
 * SKYPARK RMS Frontend Enums & Status Configurations
 * Synced with Go Backend: backend/internal/enum/
 */

// ── 1. Order Status (Operational Lifecycle) ──────────────────────────────────
export const ORDER_STATUS = Object.freeze({
  PENDING: 'pending',
  PREPARING: 'preparing',
  READY: 'ready',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
})

// ── 2. Payment Status (Financial Settlement) ─────────────────────────────────
export const PAYMENT_STATUS = Object.freeze({
  UNPAID: 'unpaid',
  PAID: 'paid',
  PARTIALLY_REFUNDED: 'partially_refunded',
  REFUNDED: 'refunded',
  FAILED: 'failed',
})

// ── 3. Item Status (Kitchen / KDS Line Item) ─────────────────────────────────
export const ITEM_STATUS = Object.freeze({
  PENDING: 'pending',
  PREPARING: 'preparing',
  READY: 'ready',
  SERVED: 'served',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
})

// ── 4. Venue / Outlet Type ───────────────────────────────────────────────────
export const OUTLET_TYPE = Object.freeze({
  DINE_IN: 'dine_in',
  CAFE: 'cafe',
  BAR: 'bar',
  RETAIL: 'retail',
})

// ── 5. Table Status ──────────────────────────────────────────────────────────
export const TABLE_STATUS = Object.freeze({
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  RESERVED: 'reserved',
  CLEANING: 'cleaning',
})

// ── 6. User Roles ────────────────────────────────────────────────────────────
export const ROLE_TYPE = Object.freeze({
  ADMIN: 'admin',
  MANAGER: 'manager',
  CASHIER: 'cashier',
  KITCHEN: 'kitchen',
  BARISTA: 'barista',
  WAITER: 'waiter',
})

// ── 7. Order Type / Channels ─────────────────────────────────────────────────
export const ORDER_TYPE = Object.freeze({
  DINE_IN: 'dine_in',
  TAKEAWAY: 'takeaway',
  DELIVERY: 'delivery',
  QR_SCAN: 'qr_scan',
})

// ── 8. Payment Methods ───────────────────────────────────────────────────────
export const PAYMENT_METHOD = Object.freeze({
  CASH: 'cash',
  CREDIT_CARD: 'credit_card',
  ABA_KHQR: 'aba_khqr',
  PROMPT_PAY: 'qr_promptpay',
  STRIPE: 'qr_stripe',
})

// ════════ UI METADATA & HELPER FUNCTIONS ════════

/**
 * Get display metadata for Order Status with venue adaptation
 */
export function getOrderStatusMeta(status, venueType = 'dine_in') {
  const s = String(status || '').toLowerCase()

  switch (s) {
    case ORDER_STATUS.PENDING:
      return {
        label: venueType === 'retail' ? 'Pending Fulfillment' : venueType === 'cafe' ? 'Order Placed' : 'Pending Confirmation',
        labelEn: 'Pending',
        color: 'warning',
        bgClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        badgeColor: 'warning',
      }
    case ORDER_STATUS.PREPARING:
      return {
        label: venueType === 'retail' ? 'Picking Items' : venueType === 'cafe' ? 'Brewing Coffee' : 'Preparing Food',
        labelEn: 'Preparing',
        color: 'blue',
        bgClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        badgeColor: 'blue',
      }
    case ORDER_STATUS.READY:
      return {
        label: venueType === 'retail' ? 'Packed & Ready' : venueType === 'cafe' ? 'Ready for Pickup' : 'Ready to Serve',
        labelEn: 'Ready',
        color: 'purple',
        bgClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
        badgeColor: 'purple',
      }
    case ORDER_STATUS.COMPLETED:
      return {
        label: 'Completed',
        labelEn: 'Completed',
        color: 'success',
        bgClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        badgeColor: 'success',
      }
    case ORDER_STATUS.CANCELLED:
      return {
        label: 'Cancelled',
        labelEn: 'Cancelled',
        color: 'error',
        bgClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
        badgeColor: 'error',
      }
    default:
      return {
        label: s || 'Unknown',
        labelEn: s || 'Unknown',
        color: 'gray',
        bgClass: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
        badgeColor: 'gray',
      }
  }
}

/**
 * Get display metadata for Payment Status
 */
export function getPaymentStatusMeta(status) {
  const s = String(status || '').toLowerCase()

  switch (s) {
    case PAYMENT_STATUS.PAID:
      return {
        label: 'Paid',
        labelEn: 'Paid',
        color: 'success',
        bgClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      }
    case PAYMENT_STATUS.UNPAID:
      return {
        label: 'Unpaid',
        labelEn: 'Unpaid',
        color: 'warning',
        bgClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      }
    case PAYMENT_STATUS.REFUNDED:
      return {
        label: 'Refunded',
        labelEn: 'Refunded',
        color: 'error',
        bgClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      }
    case PAYMENT_STATUS.PARTIALLY_REFUNDED:
      return {
        label: 'Partially Refunded',
        labelEn: 'Partially Refunded',
        color: 'warning',
        bgClass: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
      }
    case PAYMENT_STATUS.FAILED:
      return {
        label: 'Payment Failed',
        labelEn: 'Failed',
        color: 'error',
        bgClass: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
      }
    default:
      return {
        label: s || 'Unpaid',
        labelEn: s || 'Unpaid',
        color: 'gray',
        bgClass: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
      }
  }
}

/**
 * Get metadata for Venue / Outlet Type
 */
export function getOutletTypeMeta(type) {
  const t = String(type || '').toLowerCase()

  switch (t) {
    case OUTLET_TYPE.CAFE:
      return {
        label: 'Cafe & Bakery',
        icon: 'Coffee',
        color: '#d97706',
        posMode: 'quick_service',
      }
    case OUTLET_TYPE.BAR:
      return {
        label: 'SkyBar & Lounge',
        icon: 'Wine',
        color: '#9333ea',
        posMode: 'tab_service',
      }
    case OUTLET_TYPE.RETAIL:
      return {
        label: 'Mart & Supermarket',
        icon: 'ShoppingCart',
        color: '#059669',
        posMode: 'barcode_retail',
      }
    case OUTLET_TYPE.DINE_IN:
    default:
      return {
        label: 'Grand Restaurant',
        icon: 'Utensils',
        color: '#126973',
        posMode: 'table_service',
      }
  }
}

/**
 * Get metadata for Table Status
 */
export function getTableStatusMeta(status) {
  const s = String(status || '').toLowerCase()

  switch (s) {
    case TABLE_STATUS.AVAILABLE:
      return {
        label: 'Available',
        color: 'success',
        bgClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      }
    case TABLE_STATUS.OCCUPIED:
      return {
        label: 'Occupied',
        color: 'error',
        bgClass: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
      }
    case TABLE_STATUS.RESERVED:
      return {
        label: 'Reserved',
        color: 'blue',
        bgClass: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
      }
    case TABLE_STATUS.CLEANING:
      return {
        label: 'Cleaning',
        color: 'warning',
        bgClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
      }
    default:
      return {
        label: s || 'Available',
        color: 'gray',
        bgClass: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
      }
  }
}
