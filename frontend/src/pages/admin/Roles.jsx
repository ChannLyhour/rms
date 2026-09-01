import { useState } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import { Shield, Lock, CheckCircle2, XCircle, Users } from 'lucide-react'

export default function Roles() {
  const [roles] = useState([
    {
      id: 1,
      name: 'admin',
      displayName: 'System Administrator',
      desc: 'Unrestricted full access across all store operations, financials, staff, and system configuration.',
      badge: 'bg-red-500/10 text-red-500 border-red-500/20',
      userCount: 2,
    },
    {
      id: 2,
      name: 'cashier',
      displayName: 'Cashier & Front Desk',
      desc: 'Create orders, manage table sessions, receive customer payments, and print receipts.',
      badge: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      userCount: 4,
    },
    {
      id: 3,
      name: 'kitchen',
      displayName: 'Kitchen & Chef Staff',
      desc: 'Access Kitchen Display Screen (KDS), update food ticket status (preparing, ready), and check recipes.',
      badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      userCount: 3,
    },
  ])

  const modules = [
    { name: 'POS Register & Terminal', admin: true, cashier: true, kitchen: false },
    { name: 'Table Sessions & QR Setup', admin: true, cashier: true, kitchen: false },
    { name: 'Orders Management & History', admin: true, cashier: true, kitchen: true },
    { name: 'Process Payments & Checkout', admin: true, cashier: true, kitchen: false },
    { name: 'Kitchen Display Screen (KDS)', admin: true, cashier: false, kitchen: true },
    { name: 'Update Order Food Preparation', admin: true, cashier: false, kitchen: true },
    { name: 'Product Catalog & Pricing', admin: true, cashier: false, kitchen: false },
    { name: 'Raw Ingredients & Inventory', admin: true, cashier: false, kitchen: false },
    { name: 'Purchase Orders & Suppliers', admin: true, cashier: false, kitchen: false },
    { name: 'Financial & Sales Analytics', admin: true, cashier: false, kitchen: false },
    { name: 'Staff & User Account Management', admin: true, cashier: false, kitchen: false },
    { name: 'System Settings & VAT Config', admin: true, cashier: false, kitchen: false },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="border-b pb-5" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--color-text)' }}>
              Roles & Access Permissions Matrix
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              3 Roles Configured
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
            Granular permission matrix defining authorization boundaries for Administrators, Cashiers, and Kitchen staff.
          </p>
        </div>

        {/* Roles Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {roles.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all space-y-3"
              style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${r.badge}`}>
                  {r.displayName}
                </span>
                <span className="text-xs flex items-center gap-1 font-semibold" style={{ color: 'var(--color-muted)' }}>
                  <Users size={12} /> {r.userCount} users
                </span>
              </div>
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                {r.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Matrix Table */}
        <div
          className="rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
            <h2 className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
              Module Authorization Matrix
            </h2>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}>
                <th className="text-left px-5 py-3.5 text-xs font-semibold" style={{ color: 'var(--color-muted)' }}>Module Feature</th>
                <th className="text-center px-5 py-3.5 text-xs font-semibold text-red-500">Administrator</th>
                <th className="text-center px-5 py-3.5 text-xs font-semibold text-emerald-500">Cashier</th>
                <th className="text-center px-5 py-3.5 text-xs font-semibold text-amber-500">Kitchen Staff</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--color-border-subtle)' }}>
              {modules.map((m, idx) => (
                <tr key={idx} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-xs" style={{ color: 'var(--color-text)' }}>
                    {m.name}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    {m.admin ? <CheckCircle2 size={16} className="inline text-emerald-500" /> : <XCircle size={16} className="inline opacity-30" style={{ color: 'var(--color-muted)' }} />}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    {m.cashier ? <CheckCircle2 size={16} className="inline text-emerald-500" /> : <XCircle size={16} className="inline opacity-30" style={{ color: 'var(--color-muted)' }} />}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    {m.kitchen ? <CheckCircle2 size={16} className="inline text-emerald-500" /> : <XCircle size={16} className="inline opacity-30" style={{ color: 'var(--color-muted)' }} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}
