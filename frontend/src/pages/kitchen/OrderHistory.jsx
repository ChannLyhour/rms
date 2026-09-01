import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Clock,
  ChefHat,
  ArrowLeft,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  Filter,
  UtensilsCrossed
} from 'lucide-react'
import { kitchenApi } from '../../api/posApi'
import { adminApi } from '../../api/adminApi'
import ThemeToggle from '../../components/ThemeToggle'

export default function OrderHistory() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await adminApi.getOrders()
      setOrders(res.data?.data || [])
    } catch (e) {
      try {
        const kRes = await kitchenApi.getOrders()
        setOrders(kRes.data?.data || [])
      } catch (err) {}
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const num = String(o.order_number || '').toLowerCase()
      const table = String(o.table_session?.table?.table_number || o.table_session?.table_id || '').toLowerCase()
      return num.includes(q) || table.includes(q)
    }
    return true
  })

  return (
    <div
      className="w-full h-screen flex flex-col select-none overflow-hidden font-sans"
      style={{
        background: 'var(--color-bg)',
        color: 'var(--color-text)'
      }}
    >
      {/* Header Bar */}
      <header
        className="px-4 py-3 border-b flex flex-wrap items-center justify-between gap-3 shrink-0"
        style={{
          background: 'var(--color-card)',
          borderColor: 'var(--color-border)'
        }}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/kds')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] border text-xs font-bold transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 cursor-pointer shadow-2xs"
            style={{
              background: 'var(--color-bg)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)'
            }}
          >
            <ArrowLeft size={15} />
            <span>Live KDS</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[5px] flex items-center justify-center bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Clock size={18} />
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-tight leading-none">Kitchen Order History</h1>
              <span className="text-[11px] text-[var(--color-muted)] font-medium">
                Completed & Prepared Food Logs
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search order # or table..."
              className="pl-8 pr-3 py-1.5 rounded-[5px] text-xs border outline-none font-medium w-48"
              style={{
                background: 'var(--color-bg)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)'
              }}
            />
          </div>

          {/* Refresh */}
          <button
            type="button"
            onClick={fetchOrders}
            disabled={loading}
            className="p-2 rounded-[5px] border text-[var(--color-text)] transition-all cursor-pointer active:scale-95 hover:bg-black/5 dark:hover:bg-white/5"
            style={{
              background: 'var(--color-bg)',
              borderColor: 'var(--color-border)'
            }}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-amber-500' : ''} />
          </button>

          <ThemeToggle className="!rounded-[5px]" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 max-w-7xl mx-auto w-full">
        {filteredOrders.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center text-center p-8 space-y-3">
            <Clock size={40} className="opacity-30" />
            <p className="text-sm font-bold" style={{ color: 'var(--color-muted)' }}>
              No order history records found
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map((order) => {
              const tableNum = order.table_session?.table?.table_number || order.table_session?.table_id
              return (
                <div
                  key={order.id}
                  className="rounded-[5px] border p-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-all space-y-3"
                  style={{
                    background: 'var(--color-card)',
                    borderColor: 'var(--color-border)'
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 border-b pb-2.5" style={{ borderColor: 'var(--color-border)' }}>
                      <div>
                        <span className="font-mono font-black text-sm block leading-tight">
                          {order.order_number || `ORD-${String(order.id).padStart(5, '0')}`}
                        </span>
                        <span className="text-[11px] text-[var(--color-muted)] font-medium mt-0.5 block">
                          {tableNum ? `Table ${tableNum}` : 'Takeaway'} • {new Date(order.created_at).toLocaleString()}
                        </span>
                      </div>
                      <span className="px-2.5 py-1 rounded-[5px] text-[11px] font-extrabold uppercase tracking-wide bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {order.status}
                      </span>
                    </div>

                    <div className="mt-3 space-y-2">
                      {(order.items || []).map((item) => {
                        const productImg = item.product?.image_url || item.image_url
                        return (
                          <div key={item.id} className="flex items-center justify-between text-xs py-0.5">
                            <div className="flex items-center gap-2 min-w-0">
                              {/* Product Thumbnail */}
                              <div className="relative shrink-0">
                                {productImg ? (
                                  <img
                                    src={productImg}
                                    alt={item.product?.name || 'Item'}
                                    className="w-7 h-7 rounded-[5px] object-cover border shrink-0 shadow-2xs"
                                    style={{ borderColor: 'var(--color-border)' }}
                                    onError={(e) => {
                                      e.target.style.display = 'none'
                                      if (e.target.nextSibling) {
                                        e.target.nextSibling.style.display = 'flex'
                                      }
                                    }}
                                  />
                                ) : null}
                                <div
                                  className="w-7 h-7 rounded-[5px] items-center justify-center font-bold text-[10px] border shrink-0 bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-2xs"
                                  style={{
                                    borderColor: 'var(--color-border)',
                                    display: productImg ? 'none' : 'flex'
                                  }}
                                >
                                  <UtensilsCrossed size={12} className="opacity-70" />
                                </div>
                              </div>

                              <span className="font-mono font-bold text-amber-500 shrink-0">{item.quantity}x</span>
                              <span className="font-medium truncate text-slate-800 dark:text-slate-200">{item.product?.name || 'Item'}</span>
                            </div>
                            <span className="font-mono font-semibold text-[var(--color-muted)] shrink-0 ml-2">
                              ${((item.unit_price || 0) * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="border-t pt-2.5 flex items-center justify-between text-xs font-bold" style={{ borderColor: 'var(--color-border)' }}>
                    <span className="text-[var(--color-muted)]">Total Amount:</span>
                    <span className="font-mono text-sm text-[var(--color-500,#BF4040)]">
                      ${(order.total_amount || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
