import React, { useState, useEffect, useCallback } from 'react'
import {
  BellRing,
  CheckCircle2,
  Clock,
  Sparkles,
  Flame,
  ChefHat,
  Receipt,
  MessageSquare,
  HelpCircle,
  Loader2,
  AlertCircle,
  CheckCheck
} from 'lucide-react'
import { customerApi } from '../../api/posApi'
import toast from 'react-hot-toast'

export default function MessageScreen({ token, session, tableNum, orders = [], subscribe }) {
  const storageKey = token ? `customer_service_calls_${token}` : 'customer_service_calls'

  const [calledServices, setCalledServices] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [callingId, setCallingId] = useState(null)

  // Persist called services
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(calledServices))
    } catch {}
  }, [calledServices, storageKey])

  // Listen to WebSocket events for real-time cashier acknowledgements
  useEffect(() => {
    if (!subscribe) return

    const unsubCall = subscribe('call_cashier', (data) => {
      // If someone called, refresh or update status
      if (data?.title) {
        setCalledServices((prev) => {
          const exists = prev.some((item) => item.title === data.title && item.time === data.time)
          if (!exists) {
            return [
              {
                id: Date.now(),
                title: data.title,
                icon: getIconForService(data.service_type),
                time: data.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: 'Alert Sent to Waiter 🔔'
              },
              ...prev
            ]
          }
          return prev
        })
      }
    })

    return () => {
      unsubCall?.()
    }
  }, [subscribe])

  const quickServices = [
    { id: 'water', title: 'Request Extra Water / Ice', icon: '🧊', desc: 'Complimentary cold water & ice cubes' },
    { id: 'cutlery', title: 'Need Extra Cutlery & Napkins', icon: '🍴', desc: 'Forks, spoons, tissues & chop sticks' },
    { id: 'waiter', title: 'Call Waiter to Table', icon: '🛎️', desc: 'Staff assistance for food & questions' },
    { id: 'clean', title: 'Request Table Cleaning', icon: '🧹', desc: 'Clear used plates & clean tabletop' },
    { id: 'bill', title: 'Ready for the Bill / Checkout', icon: '💳', desc: 'Cashier will bring your bill & KHQR' },
  ]

  const getIconForService = (type) => {
    switch (type) {
      case 'water': return '🧊'
      case 'cutlery': return '🍴'
      case 'waiter': return '🛎️'
      case 'clean': return '🧹'
      case 'bill': return '💳'
      default: return '🔔'
    }
  }

  const handleCall = async (service) => {
    if (callingId) return
    setCallingId(service.id)

    const newEntry = {
      id: Date.now(),
      title: service.title,
      icon: service.icon,
      service_type: service.id,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Sent to Staff Desk 🛎️',
    }

    try {
      if (token) {
        await customerApi.callCashier(token, {
          table_number: String(tableNum || session?.table?.table_number || ''),
          service_type: service.id,
          title: service.title
        })
      }

      setCalledServices((prev) => [newEntry, ...prev.slice(0, 15)])
      toast.success(`${service.title} requested! Staff notified. 🛎️`, { duration: 4000 })

      // Trigger phone vibration if supported
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([100, 50, 100])
      }
    } catch {
      // Still add optimistically so customer sees their action
      setCalledServices((prev) => [newEntry, ...prev.slice(0, 15)])
      toast.success(`${service.title} sent! Staff notified.`)
    } finally {
      setCallingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f6fa] p-4 pb-28 space-y-4 max-w-lg mx-auto select-none">

      {/* ── Table Header Indicator ── */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assistance &amp; Orders</span>
          <h2 className="text-sm font-black text-slate-900">
            Table {tableNum || session?.table?.table_number || '#1'} Service Center
          </h2>
        </div>
        <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-extrabold text-xs border border-amber-500/20">
          <BellRing size={18} className="animate-pulse" />
        </div>
      </div>

      {/* ── Quick Service Bell Grid ── */}
      <div className="space-y-2">
        <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider px-1 flex items-center justify-between">
          <span>Instant Service Bell</span>
          <span className="text-[10px] text-red-500 font-bold">Tap to Call</span>
        </h3>

        <div className="grid grid-cols-1 gap-2">
          {quickServices.map((srv) => {
            const isProcessing = callingId === srv.id
            return (
              <button
                key={srv.id}
                type="button"
                onClick={() => handleCall(srv)}
                disabled={isProcessing}
                className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs flex items-center justify-between transition-all hover:border-red-200 hover:shadow-sm active:scale-98 cursor-pointer text-left group disabled:opacity-60"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{srv.icon}</span>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900 group-hover:text-[#ff1837] transition-colors">
                      {srv.title}
                    </h4>
                    <p className="text-[10px] text-slate-400">{srv.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-[#ff1837] bg-red-50 px-2.5 py-1.5 rounded-xl group-hover:bg-red-500 group-hover:text-white transition-all shrink-0">
                  {isProcessing ? (
                    <>
                      <Loader2 size={12} className="animate-spin" />
                      <span>Calling...</span>
                    </>
                  ) : (
                    <span>Call ➔</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Kitchen & Order Notifications Feed ── */}
      <div className="space-y-2 pt-2">
        <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider px-1 flex items-center justify-between">
          <span>Live Notifications &amp; History</span>
          <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Real-time
          </span>
        </h3>

        <div className="space-y-2">
          {/* Automated Order Updates from active tickets */}
          {orders.map((ord) => {
            const statusUpper = String(ord.status || 'pending').toUpperCase()
            const isCooking = ['cooking', 'preparing', 'pending'].includes(String(ord.status).toLowerCase())
            const isReady = String(ord.status).toLowerCase() === 'ready'
            const isCompleted = ['completed', 'paid', 'served'].includes(String(ord.status).toLowerCase())

            return (
              <div
                key={ord.id}
                className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs flex items-start gap-3"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  isReady ? 'bg-emerald-50 text-emerald-600' : isCooking ? 'bg-amber-50 text-amber-500' : 'bg-slate-100 text-slate-600'
                }`}>
                  {isReady ? <CheckCircle2 size={18} /> : isCooking ? <ChefHat size={18} className="animate-pulse" /> : <Receipt size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-xs text-slate-900">
                      Ticket #{ord.id} ({ord.order_number || 'Order'})
                    </h4>
                    <span className="text-[9px] font-mono text-slate-400">
                      {(parseFloat(ord.total_amount || ord.subtotal) || 0).toFixed(2)}$
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Status: <strong className={isReady ? 'text-emerald-600 font-black' : 'text-[#ff1837] font-bold'}>{statusUpper}</strong>
                    {isReady && ' — Your food is ready and on the way to your table! 🍽️'}
                    {isCooking && ' — Food is currently being prepared fresh in the kitchen. 👨‍🍳🔥'}
                    {isCompleted && ' — Order served & completed.'}
                  </p>

                  {/* Line item summary pills */}
                  {Array.isArray(ord.items || ord.order_items) && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(ord.items || ord.order_items).slice(0, 4).map((it, i) => (
                        <span key={i} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-100">
                          {it.quantity}x {it.product?.name || it.name || it.title}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {/* Service Bell History */}
          {calledServices.map((entry) => (
            <div
              key={entry.id}
              className="bg-white rounded-2xl p-3 border border-slate-100 shadow-xs flex items-start gap-3 animate-in fade-in slide-in-from-top-1"
            >
              <span className="text-xl shrink-0 mt-0.5">{entry.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs text-slate-900">{entry.title}</h4>
                  <span className="text-[9px] font-mono text-slate-400">{entry.time}</span>
                </div>
                <p className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                  <CheckCheck size={13} className="text-emerald-500" />
                  <span>{entry.status || 'Request received by floor staff'}</span>
                </p>
              </div>
            </div>
          ))}

          {calledServices.length === 0 && orders.length === 0 && (
            <div className="bg-white rounded-2xl p-6 text-center border border-slate-100 shadow-xs">
              <MessageSquare size={26} className="mx-auto mb-2 text-slate-300" />
              <p className="text-xs font-bold text-slate-600">No message notifications yet</p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Tap any Instant Service Bell above to alert your table server
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
