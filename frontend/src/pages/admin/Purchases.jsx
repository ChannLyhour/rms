import { useState } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import { Truck, Plus, Phone, Mail, FileText, CheckCircle2, Clock } from 'lucide-react'

export default function Purchases() {
  const [activeTab, setActiveTab] = useState('orders')

  const suppliers = [
    { id: 1, name: 'Prime Meats Wholesale Co.', contact: 'Michael Johnson', phone: '+1 555-0192', email: 'orders@primemeats.com', items: 'Wagyu Beef, Bacon, Patties' },
    { id: 2, name: 'Golden Bakehouse Ltd.', contact: 'Sarah Miller', phone: '+1 555-0248', email: 'sales@goldenbake.com', items: 'Brioche Buns, Toast, Baguettes' },
    { id: 3, name: 'Valley Fresh Produce', contact: 'David Chang', phone: '+1 555-0371', email: 'contact@valleyfresh.org', items: 'Lettuce, Tomatoes, Onions' },
    { id: 4, name: 'Artisan Coffee Roasters', contact: 'Elena Rostova', phone: '+1 555-0482', email: 'supply@artisancoffee.io', items: 'Espresso Beans, Syrups' },
  ]

  const purchaseOrders = [
    { id: 1, poNumber: 'PO-2026-001', supplier: 'Prime Meats Wholesale Co.', total: 450.00, status: 'received', date: '2026-08-28', expectedDate: '2026-08-28' },
    { id: 2, poNumber: 'PO-2026-002', supplier: 'Valley Fresh Produce', total: 185.50, status: 'pending', date: '2026-08-29', expectedDate: '2026-08-30' },
    { id: 3, poNumber: 'PO-2026-003', supplier: 'Artisan Coffee Roasters', total: 320.00, status: 'received', date: '2026-08-27', expectedDate: '2026-08-27' },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5" style={{ borderColor: 'var(--color-border)' }}>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--color-text)' }}>
                Suppliers & Purchase Orders
              </h1>
              
            </div>
            
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                activeTab === 'orders'
                  ? 'text-white border-transparent shadow-sm'
                  : 'hover:opacity-80'
              }`}
              style={
                activeTab === 'orders'
                  ? { background: 'linear-gradient(135deg, var(--color-500, #BF4040), var(--color-600, #9D3434))', color: '#ffffff' }
                  : { background: 'var(--color-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }
              }
            >
              Purchase Orders
            </button>
            <button
              onClick={() => setActiveTab('suppliers')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                activeTab === 'suppliers'
                  ? 'text-white border-transparent shadow-sm'
                  : 'hover:opacity-80'
              }`}
              style={
                activeTab === 'suppliers'
                  ? { background: 'linear-gradient(135deg, var(--color-500, #BF4040), var(--color-600, #9D3434))', color: '#ffffff' }
                  : { background: 'var(--color-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }
              }
            >
              Vendor Directory
            </button>
          </div>
        </div>

        {activeTab === 'orders' ? (
          /* Purchase Orders Table */
          <div
            className="rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
                  {['PO Number', 'Vendor / Supplier', 'Total Amount', 'Order Date', 'Expected By', 'Status'].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold" style={{ color: 'var(--color-muted)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--color-border-subtle)' }}>
                {purchaseOrders.map(po => (
                  <tr key={po.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold" style={{ color: 'var(--color-text)' }}>
                      {po.poNumber}
                    </td>
                    <td className="px-5 py-4 font-semibold text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      {po.supplier}
                    </td>
                    <td className="px-5 py-4 text-xs font-mono font-bold" style={{ color: 'var(--color-500, #BF4040)' }}>
                      ${po.total.toFixed(2)}
                    </td>
                    <td className="px-5 py-4 text-xs font-mono" style={{ color: 'var(--color-muted)' }}>
                      {po.date}
                    </td>
                    <td className="px-5 py-4 text-xs font-mono" style={{ color: 'var(--color-muted)' }}>
                      {po.expectedDate}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-semibold border inline-flex items-center gap-1 capitalize ${
                          po.status === 'received'
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        }`}
                      >
                        {po.status === 'received' ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                        {po.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Suppliers Directory Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suppliers.map(sup => (
              <div
                key={sup.id}
                className="rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all space-y-3"
                style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm shrink-0"
                    style={{ background: 'linear-gradient(135deg, var(--color-500, #BF4040), var(--color-700, #8A2E2E))' }}
                  >
                    <Truck size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>{sup.name}</h3>
                    <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Contact: {sup.contact}</p>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  <p className="flex items-center gap-2">
                    <Phone size={12} className="text-emerald-500" /> {sup.phone}
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail size={12} className="text-amber-500" /> {sup.email}
                  </p>
                  <p className="text-[11px] pt-1" style={{ color: 'var(--color-muted)' }}>
                    Supplied Goods: <span className="font-medium" style={{ color: 'var(--color-text)' }}>{sup.items}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
