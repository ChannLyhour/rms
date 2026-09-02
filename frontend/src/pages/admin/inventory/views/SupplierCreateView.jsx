import { useState, useEffect, useRef } from 'react'
import { Scrollspy } from '../../../../components/reui/scrollspy'
import {
  ArrowLeft,
  Check,
  Building2,
  Phone,
  Mail,
  MapPin,
  User,
  Globe,
  Loader2,
  FileText
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

  const parentRef = useRef(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (supplier) {
      setFormData({
        id: supplier.id || '',
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

  const setField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    if (!formData.name.trim()) {
      toast.error('Supplier / Company name is required')
      const el = document.getElementById('identity')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }

    setSaving(true)
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
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'identity', label: 'Company & Identity' },
    { id: 'contact', label: 'Contact Person & Phone' },
    { id: 'location', label: 'Address & Terms' },
  ]

  return (
    <div className="mx-auto w-full pb-10 select-none animate-in fade-in duration-200">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="secondary"
          size="md"
          onClick={onClose}
          iconLeading={ArrowLeft}
        >
          Cancel & Return
        </Button>

        <Button
          variant="primary"
          size="md"
          onClick={handleSubmit}
          iconLeading={saving ? Loader2 : Check}
          disabled={saving}
          className="shadow-sm"
        >
          {saving ? 'Saving...' : supplier ? 'Save Changes' : 'Register Vendor'}
        </Button>
      </div>

      {/* Main Form Container */}
      <div
        className="rounded-[5px] border overflow-hidden shadow-xs"
        style={{
          background: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        {/* Header */}
        <div
          className="px-8 py-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0"
          style={{
            background: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-extrabold text-xl sm:text-2xl" style={{ color: 'var(--color-text)' }}>
                {supplier ? `Edit ${supplier.name}` : 'Register New Vendor / Supplier'}
              </h3>
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                style={{
                  background: 'rgba(18, 105, 115, 0.15)',
                  color: 'var(--color-500, #126973)',
                  border: '1px solid rgba(18, 105, 115, 0.3)',
                }}
              >
                {formData.is_active ? 'Active Partner' : 'Archived'}
              </span>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
              Manage inbound food distributors, beverage importers, wholesale contacts and warehouse delivery addresses.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row">
          {/* Vertical Tab bar with Scrollspy */}
          <div
            className="w-full md:w-56 border-b md:border-b-0 md:border-r shrink-0 p-5"
            style={{
              borderColor: 'var(--color-border)',
              background: 'var(--color-surface)',
            }}
          >
            <Scrollspy
              offset={30}
              targetRef={parentRef}
              className="flex flex-row md:flex-col gap-2.5 overflow-x-auto scrollbar-none"
            >
              {tabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  data-scrollspy-anchor={t.id}
                  className="inline-flex items-center justify-start whitespace-nowrap rounded-[5px] text-xs sm:text-sm font-semibold transition-all focus-visible:outline-none border border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50 h-10 px-4 py-2 text-slate-700 dark:text-slate-300 data-[active=true]:bg-slate-900 data-[active=true]:text-white data-[active=true]:border-slate-900 dark:data-[active=true]:bg-slate-50 dark:data-[active=true]:text-slate-900 dark:data-[active=true]:border-slate-50 shadow-2xs cursor-pointer"
                >
                  {t.label}
                </button>
              ))}
            </Scrollspy>
          </div>

          {/* Form Body */}
          <div ref={parentRef} className="flex-1 overflow-y-auto max-h-[75vh] scroll-smooth p-6 relative scrollbar-none">
            <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
              {/* ── TAB 1: Company & Identity ──────────────────────────── */}
              <div id="identity" className="space-y-2.5 scroll-mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    Vendor Identity
                  </h3>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#126973]/10 text-[#126973] dark:text-[#F1D8C2]">
                    Company Information
                  </span>
                </div>

                <div
                  className="rounded-[5px] p-6 sm:p-7 space-y-5 border"
                  style={{
                    background: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                        Company / Supplier Name *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                          <Building2 size={16} />
                        </span>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Royal Fresh Meats Co., Ltd., Angkor Beverage Supply"
                          value={formData.name}
                          onChange={(e) => setField('name', e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-[5px] border outline-none font-semibold transition-all"
                          style={{
                            background: 'var(--color-bg)',
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-text)',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── TAB 2: Contact Person & Details ──────────────────────────── */}
              <div id="contact" className="space-y-2.5 scroll-mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    Primary Contact Representative
                  </h3>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    Direct Contact
                  </span>
                </div>

                <div
                  className="rounded-[5px] p-6 sm:p-7 space-y-5 border"
                  style={{
                    background: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                        Contact Person Name
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                          <User size={16} />
                        </span>
                        <input
                          type="text"
                          placeholder="e.g. Sokha Chan (Sales Manager)"
                          value={formData.contact_person}
                          onChange={(e) => setField('contact_person', e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-[5px] border outline-none font-semibold transition-all"
                          style={{
                            background: 'var(--color-bg)',
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-text)',
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                        Phone / Telegram
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                          <Phone size={16} />
                        </span>
                        <input
                          type="tel"
                          placeholder="+855 12 345 678"
                          value={formData.phone}
                          onChange={(e) => setField('phone', e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-[5px] border outline-none font-mono font-bold transition-all"
                          style={{
                            background: 'var(--color-bg)',
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-text)',
                          }}
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                        Official Email
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                          <Mail size={16} />
                        </span>
                        <input
                          type="email"
                          placeholder="orders@royalfreshmeats.com"
                          value={formData.email}
                          onChange={(e) => setField('email', e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-[5px] border outline-none font-semibold transition-all"
                          style={{
                            background: 'var(--color-bg)',
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-text)',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── TAB 3: Address & Status ──────────────────────────── */}
              <div id="location" className="space-y-2.5 scroll-mt-6">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Address &amp; Status
                </h3>

                <div
                  className="rounded-[5px] p-6 sm:p-7 space-y-5 border"
                  style={{
                    background: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                        Physical / Warehouse Address
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-3 text-slate-400">
                          <MapPin size={16} />
                        </span>
                        <textarea
                          rows={3}
                          placeholder="Street Address, Khan, Sangkat, Phnom Penh, Cambodia..."
                          value={formData.address}
                          onChange={(e) => setField('address', e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-[5px] border outline-none font-medium transition-all"
                          style={{
                            background: 'var(--color-bg)',
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-text)',
                          }}
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2 flex items-center justify-between p-4 rounded-[5px] border" style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
                      <div>
                        <span className="block text-xs font-bold" style={{ color: 'var(--color-text)' }}>
                          Active Vendor Status
                        </span>
                        <span className="text-[11px]" style={{ color: 'var(--color-muted)' }}>
                          Eligible for Purchase Orders and inventory supply sourcing
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.is_active}
                          onChange={(e) => setField('is_active', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#126973]"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
