import { useState, useEffect } from 'react'
import {
  X,
  Building2,
  Plus,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  CheckSquare,
  Square
} from 'lucide-react'
import toast from 'react-hot-toast'
import { adminApi } from '../../../../api/adminApi'
import { Button } from '../../../../components/common/ButtonComponent'

export default function SupplierCreateView({ supplier, onClose, onSave }) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    is_active: true,
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (supplier) {
      setFormData({
        id: supplier.id,
        name: supplier.name || '',
        contact_person: supplier.contact_person || '',
        phone: supplier.phone || '',
        email: supplier.email || '',
        address: supplier.address || '',
        is_active: supplier.is_active !== undefined ? Boolean(supplier.is_active) : true,
      })
    } else {
      setFormData({
        id: '',
        name: '',
        contact_person: '',
        phone: '',
        email: '',
        address: '',
        is_active: true,
      })
    }
  }, [supplier])

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    if (!formData.name.trim()) {
      toast.error('Supplier / Company name is required')
      return
    }

    setSubmitting(true)
    try {
      if (formData.id) {
        await adminApi.updateSupplier(formData.id, formData)
        toast.success('Supplier updated successfully')
      } else {
        await adminApi.createSupplier(formData)
        toast.success('Supplier registered successfully')
      }
      onSave()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save supplier')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b pb-4 border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-[#126973]/10 hover:bg-[#126973]/20 text-[#126973] dark:text-[#F1D8C2] transition-all cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-lg font-bold text-[var(--color-text)] flex items-center gap-2">
              <span>{formData.id ? 'Edit Supplier' : 'Register New Vendor / Supplier'}</span>
            </h2>
            <p className="text-xs text-slate-500">
              Manage supplier contacts, wholesale terms, and delivery address.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="md" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" size="md" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Saving...' : formData.id ? 'Save Changes' : 'Register Supplier'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        <div className="p-5 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] space-y-4 shadow-2xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#126973] dark:text-[#F1D8C2] flex items-center gap-2">
            <Building2 size={14} />
            <span>Supplier Details</span>
          </h3>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-500">
              Company / Vendor Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Prime Meats Wholesale Co., Golden Bakehouse"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border outline-none font-bold bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text)] focus:border-[#126973]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-500">
                Contact Person Name
              </label>
              <input
                type="text"
                placeholder="e.g. Michael Johnson"
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border outline-none font-medium bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text)]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-500">
                Phone Number
              </label>
              <input
                type="text"
                placeholder="e.g. +855 12 345 678"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border outline-none font-mono bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-500">
              Email Address
            </label>
            <input
              type="email"
              placeholder="e.g. orders@primemeats.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border outline-none bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text)]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-500">
              Warehouse / Office Address
            </label>
            <textarea
              rows={2}
              placeholder="e.g. #123, St. 2004, Phnom Penh, Cambodia"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border outline-none bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text)] resize-none"
            />
          </div>
        </div>

        {/* Status */}
        <div className="p-4 rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[var(--color-text)]">Active Vendor Status</p>
            <p className="text-[11px] text-slate-400">Can be selected when creating new Purchase Orders</p>
          </div>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
              formData.is_active
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-500'
                : 'bg-slate-500/15 border-slate-500/30 text-slate-400'
            }`}
          >
            {formData.is_active ? <CheckSquare size={16} /> : <Square size={16} />}
            <span>{formData.is_active ? 'Active' : 'Disabled'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
