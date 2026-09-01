import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { adminApi } from '../../../../api/adminApi'
import { posApi } from '../../../../api/posApi'
import client from '../../../../api/axiosClient'
import {
  ArrowLeft,
  Printer,
  RefreshCw,
  AlertCircle,
  Copy,
  Check,
  UtensilsCrossed,
  XCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { printInvoice } from './prints-invoice'

export default function OrderViewDetails({
  orderId: propOrderId,
  order: propOrder,
  onClose,
  onUpdateStatus: propOnUpdateStatus,
}) {
  const params = useParams()
  const navigate = useNavigate()
  const orderId = propOrderId || params.id

  const [order, setOrder] = useState(propOrder || null)
  const [loading, setLoading] = useState(!propOrder)
  const [updating, setUpdating] = useState(false)
  const [copied, setCopied] = useState(false)

  // Fetch Order Details by ID if not provided or when ID changes
  const fetchOrder = useCallback(async () => {
    if (!orderId) return
    setLoading(true)
    try {
      let res
      try {
        res = await adminApi.getOrderById(orderId)
      } catch {
        res = await client.get(`/cashier/orders/${orderId}`)
      }
      const data = res.data?.data || res.data
      setOrder(data)
    } catch (err) {
      console.error('Failed to load order details:', err)
      toast.error('Could not load order details')
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    if (propOrder && propOrder.id === Number(orderId)) {
      setOrder(propOrder)
      setLoading(false)
    } else {
      fetchOrder()
    }
  }, [orderId, propOrder, fetchOrder])

  // Update Order Status handler
  const handleStatusChange = async (newStatus) => {
    if (!order?.id) return
    setUpdating(true)
    try {
      try {
        await adminApi.updateOrderStatus(order.id, newStatus)
      } catch {
        await posApi.updateOrderStatus(order.id, newStatus)
      }
      toast.success(`Order updated to ${newStatus.toUpperCase()}`)
      setOrder((prev) => (prev ? { ...prev, status: newStatus } : prev))
      if (propOnUpdateStatus) {
        propOnUpdateStatus(order.id, newStatus)
      }
    } catch (err) {
      console.error('Failed to update status:', err)
      toast.error(err.response?.data?.message || 'Failed to update order status')
    } finally {
      setUpdating(false)
    }
  }

  // Copy order reference
  const handleCopyOrderNumber = () => {
    const num = order?.order_number || `ORD-${String(order?.id || '').padStart(5, '0')}`
    navigator.clipboard.writeText(num)
    setCopied(true)
    toast.success('Order number copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  // Print Handler
  const handlePrint = () => {
    if (order) {
      printInvoice(order, {
        storeName: 'SKYPARK',
        cashier: order.accepted_role ? `#${order.accepted_role}` : '#1',
        manager: 'Eric Steer',
      })
    } else {
      window.print()
    }
  }

  // Back Navigation
  const handleBack = () => {
    if (onClose) {
      onClose()
    } else {
      navigate('/orders')
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] p-8 text-center">
        <RefreshCw size={32} className="animate-spin text-rose-500 mb-3" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Loading Order Details...
        </p>
        <p className="text-xs text-slate-400 mt-1">Fetching items and session information</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] p-8 text-center">
        <AlertCircle size={40} className="text-rose-500 mb-3" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Order Not Found
        </h3>
        <p className="text-xs text-slate-400 mt-1 mb-5">
          The requested order #{orderId} does not exist or has been removed.
        </p>
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700 transition cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Orders</span>
        </button>
      </div>
    )
  }

  const orderNum = order.order_number || `ORD-${String(order.id).padStart(5, '0')}`
  const tableNum = order.table_session?.table?.table_number || order.table_session?.table_id
  const totalItemsCount = (order.items || []).reduce((acc, i) => acc + (i.quantity || 1), 0)
  const isPaid = order.payment_status === 'paid' || order.status === 'completed' || order.status === 'paid'
  const isPending = order.status === 'pending' || order.status === 'confirmed'
  const isPreparing = order.status === 'preparing' || order.status === 'cooking'
  const isReady = order.status === 'ready'
  const isCompleted = order.status === 'completed'
  const isCancelled = order.status === 'cancelled'

  // Extract all special notes from items
  const allSpecialNotes = (order.items || [])
    .map((i) => i.special_instructions)
    .filter(Boolean)

  return (
    <div className="w-full p-2 sm:p-4 lg:p-6 font-sans">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="p-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-all cursor-pointer shadow-xs"
              title="Back to Orders"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Order Details</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{orderNum}</p>
                <button
                  type="button"
                  onClick={handleCopyOrderNumber}
                  className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                  title="Copy reference"
                >
                  {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Status Pill & Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Badge */}
          {isCompleted && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              Completed
            </span>
          )}
          {isReady && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
              Ready
            </span>
          )}
          {isPreparing && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              Preparing
            </span>
          )}
          {isPending && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
              Pending
            </span>
          )}
          {isCancelled && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
              Cancelled
            </span>
          )}

          {/* Print Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shadow-2xs"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>

          {/* Primary Action Button based on current status */}
          {isPending && (
            <button
              type="button"
              disabled={updating}
              onClick={() => handleStatusChange('preparing')}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              {updating ? <RefreshCw size={15} className="animate-spin" /> : null}
              <span>Send to Kitchen</span>
            </button>
          )}

          {isPreparing && (
            <button
              type="button"
              disabled={updating}
              onClick={() => handleStatusChange('ready')}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              {updating ? <RefreshCw size={15} className="animate-spin" /> : null}
              <span>Mark Ready</span>
            </button>
          )}

          {isReady && (
            <button
              type="button"
              disabled={updating}
              onClick={() => handleStatusChange('completed')}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              {updating ? <RefreshCw size={15} className="animate-spin" /> : null}
              <span>Complete Order</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Main Layout: 3 Columns (Compact Timeline, Expanded Items, Summary) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_340px] gap-6">

        {/* ── Column 1: Timeline Card (Compact Width) ── */}
        <div className="space-y-6">
          {/* Timeline Card */}
          <div className="bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700/80 overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700/60">
              <h2 className="font-semibold text-slate-900 dark:text-white">Timeline</h2>
            </div>
            <div className="p-5">
              <div className="space-y-4">
                {/* Step 1: Order Placed */}
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500"></div>
                    <div className="w-px h-full bg-slate-200 dark:bg-slate-700 mt-1"></div>
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Order Placed</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {order.created_at ? new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </p>
                  </div>
                </div>

                {/* Step 2: Preparing */}
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`h-2.5 w-2.5 rounded-full ${isPreparing || isReady || isCompleted ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                    <div className="w-px h-full bg-slate-200 dark:bg-slate-700 mt-1"></div>
                  </div>
                  <div className="pb-4">
                    <p className={`text-sm font-medium ${isPreparing || isReady || isCompleted ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                      Preparing
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {isPreparing ? 'Currently cooking in kitchen' : isReady || isCompleted ? 'Dishes prepared' : 'Pending kitchen acceptance'}
                    </p>
                  </div>
                </div>

                {/* Step 3: Ready / Completed */}
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`h-2.5 w-2.5 rounded-full ${isReady || isCompleted ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isReady || isCompleted ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                      {isCompleted ? 'Completed' : isReady ? 'Ready for Service' : 'Ready'}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {isCompleted ? 'Served and closed' : isReady ? 'Waiting to be served' : 'Pending'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Column 2: Order Items & Notes ── */}
        <div className="space-y-6">
          {/* Order Items Card */}
          <div className="bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700/80 overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900 dark:text-white">Order Items</h2>
              <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">{totalItemsCount} items</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {(order.items || []).map((item, idx) => {
                const options = item.options || []
                const itemTotal = Number(item.unit_price || 0) * (item.quantity || 1)

                return (
                  <div key={item.id || idx} className="p-4 sm:p-5 flex gap-3.5">
                    {/* Item Thumbnail / Icon */}
                    <div className="h-14 w-14 rounded-lg bg-slate-100 dark:bg-slate-700/60 flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-slate-600/40">
                      {item.product?.image_url ? (
                        <img
                          src={item.product.image_url}
                          alt={item.product?.name}
                          className="h-full w-full object-cover rounded-lg"
                        />
                      ) : (
                        <svg className="h-6 w-6 text-slate-400 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-medium text-sm text-slate-900 dark:text-white truncate">
                            {item.product?.name || `Product #${item.product_id}`}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {item.product?.category?.name || item.category || 'Menu Item'}
                          </p>

                          {/* Modifiers & Options */}
                          {options.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {options.map((opt, optIdx) => (
                                <span
                                  key={opt.id || optIdx}
                                  className="inline-flex px-1.5 py-0.5 rounded text-[11px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium"
                                >
                                  {opt.option_value?.name || opt.name || 'Option'}
                                  {Number(opt.price || 0) > 0 && ` (+$${Number(opt.price).toFixed(2)})`}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Inline Item Special Instruction */}
                          {item.special_instructions && (
                            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 italic">
                              "{item.special_instructions}"
                            </p>
                          )}
                        </div>

                        {/* Price & Quantity */}
                        <div className="text-right shrink-0">
                          <p className="font-medium text-xs sm:text-sm text-slate-900 dark:text-white font-mono">
                            ${Number(item.unit_price || 0).toFixed(2)}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                            × {item.quantity}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Order Notes Card */}
          <div className="bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700/80 p-5 shadow-xs">
            <h2 className="font-semibold text-slate-900 dark:text-white mb-3">Order Notes</h2>
            {allSpecialNotes.length > 0 ? (
              <div className="space-y-1.5">
                {allSpecialNotes.map((note, idx) => (
                  <p key={idx} className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed flex items-start gap-2">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>{note}</span>
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed italic">
                No special customer instructions or dietary requirements for this order.
              </p>
            )}
          </div>
        </div>

        {/* ── Column 3: Summary & Details (Merged Unified Card) ── */}
        <div className="space-y-6">

          {/* Unified Order Summary & Details Card */}
          <div className="bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700/80 overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900 dark:text-white">Summary &amp; Details</h2>
              <span
                className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors border"
                style={{
                  backgroundColor: order.payment_status === 'paid' || isPaid ? 'var(--color-paid-50)' : 'var(--color-unpaid-50)',
                  color: order.payment_status === 'paid' || isPaid ? 'var(--color-paid-700)' : 'var(--color-unpaid-700)',
                  borderColor: order.payment_status === 'paid' || isPaid ? 'var(--color-paid-100)' : 'var(--color-unpaid-100)',
                }}
              >
                {order.payment_status || (isPaid ? 'Paid' : 'Unpaid')}
              </span>
            </div>

            {/* Financial Calculation Section */}
            <div className="p-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
                <span className="text-slate-900 dark:text-white font-medium font-mono">
                  ${Number(order.subtotal || order.total_amount || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Tax</span>
                <span className="text-slate-900 dark:text-white font-medium font-mono">
                  ${Number(order.tax_amount || 0).toFixed(2)}
                </span>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-700/60 pt-3 flex justify-between items-baseline">
                <span className="font-semibold text-slate-900 dark:text-white">Total</span>
                <span className="font-semibold text-slate-900 dark:text-white text-lg font-mono">
                  ${Number(order.total_amount || 0).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Divider between financial and meta */}
            <div className="border-t border-slate-100 dark:border-slate-700/60" />

            {/* Meta Details Section */}
            <div className="p-5 space-y-4">
              <div>
                <p className="text-xs font-medium text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Table / Destination
                </p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {order.order_type === 'takeaway'
                    ? 'Takeaway • To-Go'
                    : order.order_type === 'qr_scan'
                    ? `Table ${tableNum || '--'} • Customer QR`
                    : `Table ${tableNum || '--'} • Dine In`}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Server / Staff
                </p>
                <p className="text-sm font-medium text-slate-900 dark:text-white capitalize">
                  {order.accepted_role ? `Staff (${order.accepted_role})` : 'Self-Serve QR Order'}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Ordered At
                </p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {order.created_at ? new Date(order.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Payment Method
                </p>
                <span
                  className="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold capitalize"
                >
                  {order.payment_method || '--'}
                </span>
              </div>
            </div>
          </div>

          {/* Cancel Order Action if active */}
          {!isCancelled && !isCompleted && (
            <button
              type="button"
              disabled={updating}
              onClick={() => handleStatusChange('cancelled')}
              className="w-full py-2.5 px-4 rounded-xl text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 font-medium text-xs transition active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <XCircle size={15} />
              <span>Cancel Order</span>
            </button>
          )}

        </div>
      </div>
    </div>
  )
}
