import { useState } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import { FileSpreadsheet, Plus, AlertOctagon, ArrowDown, ArrowUp, Calendar, Trash2 } from 'lucide-react'

export default function StockLogs() {
  const [activeTab, setActiveTab] = useState('movements')

  const stockMovements = [
    { id: 1, item: 'Wagyu Beef Patties', type: 'order_deduction', qty: -2, balance: 45, unit: 'pcs', ref: 'Order #104', time: '10 mins ago' },
    { id: 2, item: 'Brioche Burger Buns', type: 'order_deduction', qty: -2, balance: 60, unit: 'pcs', ref: 'Order #104', time: '10 mins ago' },
    { id: 3, item: 'French Fries (Frozen)', type: 'po_received', qty: +10.0, balance: 28.5, unit: 'kg', ref: 'PO-2026-001', time: '1 hour ago' },
    { id: 4, item: 'Arabica Espresso Beans', type: 'order_deduction', qty: -0.036, balance: 12.0, unit: 'kg', ref: 'Order #103', time: '2 hours ago' },
    { id: 5, item: 'Romaine Lettuce', type: 'waste_loss', qty: -0.8, balance: 4.2, unit: 'kg', ref: 'Expired Spoilage', time: 'Yesterday' },
  ]

  const wasteRecords = [
    { id: 1, item: 'Romaine Lettuce', quantity: '0.8 kg', reason: 'Spoilage / Expiration', costLoss: 1.76, reportedBy: 'Chef Marco', date: '2026-08-28' },
    { id: 2, item: 'Whole Milk', quantity: '1.0 l', reason: 'Container Leak / Spilled', costLoss: 1.50, reportedBy: 'Barista Jane', date: '2026-08-27' },
    { id: 3, item: 'Brioche Buns', quantity: '3 pcs', reason: 'Burnt in Preparation', costLoss: 2.40, reportedBy: 'Cook Alex', date: '2026-08-26' },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5" style={{ borderColor: 'var(--color-border)' }}>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--color-text)' }}>
                Stock Movements & Waste Logs
              </h1>
              
            </div>
           
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('movements')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                activeTab === 'movements'
                  ? 'text-white border-transparent shadow-sm'
                  : 'hover:opacity-80'
              }`}
              style={
                activeTab === 'movements'
                  ? { background: 'linear-gradient(135deg, var(--color-500, #BF4040), var(--color-600, #9D3434))', color: '#ffffff' }
                  : { background: 'var(--color-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }
              }
            >
              Stock Movements
            </button>
            <button
              onClick={() => setActiveTab('waste')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                activeTab === 'waste'
                  ? 'text-white border-transparent shadow-sm'
                  : 'hover:opacity-80'
              }`}
              style={
                activeTab === 'waste'
                  ? { background: 'linear-gradient(135deg, var(--color-500, #BF4040), var(--color-600, #9D3434))', color: '#ffffff' }
                  : { background: 'var(--color-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }
              }
            >
              Waste & Loss Ledger
            </button>
          </div>
        </div>

        {activeTab === 'movements' ? (
          /* Movements Table */
          <div
            className="rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
                  {['Item / Ingredient', 'Movement Type', 'Change Qty', 'Balance After', 'Reference Note', 'Time'].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold" style={{ color: 'var(--color-muted)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--color-border-subtle)' }}>
                {stockMovements.map(m => {
                  const isPositive = m.qty > 0

                  return (
                    <tr key={m.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="px-5 py-4 font-semibold" style={{ color: 'var(--color-text)' }}>
                        {m.item}
                      </td>
                      <td className="px-5 py-4 text-xs capitalize" style={{ color: 'var(--color-text-secondary)' }}>
                        <span className="px-2 py-0.5 rounded border" style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
                          {m.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs font-mono font-bold">
                        <span className={`inline-flex items-center gap-1 ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                          {isPositive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                          {m.qty > 0 ? `+${m.qty}` : m.qty} {m.unit}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs font-mono font-semibold" style={{ color: 'var(--color-text)' }}>
                        {m.balance} {m.unit}
                      </td>
                      <td className="px-5 py-4 text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                        {m.ref}
                      </td>
                      <td className="px-5 py-4 text-xs font-mono" style={{ color: 'var(--color-muted)' }}>
                        {m.time}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Waste Table */
          <div
            className="rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
                  {['Item', 'Quantity Lost', 'Reason for Waste', 'Cost Loss ($)', 'Reported By', 'Date'].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold" style={{ color: 'var(--color-muted)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--color-border-subtle)' }}>
                {wasteRecords.map(w => (
                  <tr key={w.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="px-5 py-4 font-semibold" style={{ color: 'var(--color-text)' }}>
                      {w.item}
                    </td>
                    <td className="px-5 py-4 text-xs font-mono font-bold text-red-500">
                      {w.quantity}
                    </td>
                    <td className="px-5 py-4 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      {w.reason}
                    </td>
                    <td className="px-5 py-4 text-xs font-mono font-bold text-red-500">
                      -${w.costLoss.toFixed(2)}
                    </td>
                    <td className="px-5 py-4 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      {w.reportedBy}
                    </td>
                    <td className="px-5 py-4 text-xs font-mono" style={{ color: 'var(--color-muted)' }}>
                      {w.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
