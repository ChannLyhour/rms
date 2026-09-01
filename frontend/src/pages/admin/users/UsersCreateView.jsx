import { useState, useEffect, useRef, useMemo } from 'react'
import { Scrollspy } from '../../../components/reui/scrollspy'
import {
  X,
  Image as ImageIcon,
  Plus,
  Trash2,
  Check,
  Shield,
  User,
  Lock,
  Building2,
  Mail,
  Phone,
  ArrowLeft,
  KeyRound,
  Eye,
  EyeOff,
  UserCheck,
  BadgePercent,
  Ban,
  Wallet
} from 'lucide-react'
import toast from 'react-hot-toast'
import axiosClient from '../../../api/axiosClient'
import { adminApi } from '../../../api/adminApi'
import { Button } from '../../../components/common/ButtonComponent'
import { SearchSelection } from '../../../components/plugin/components/Search-Selection-components'

export default function UsersCreateView({ user, onClose, onSave }) {
  const [roles, setRoles] = useState([])
  const [outlets, setOutlets] = useState([])
  const [loadingRoles, setLoadingRoles] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    username: '',
    email: '',
    phone: '',
    image_url: '',
    password: '',
    confirm_password: '',
    role_id: 2,
    outlet_id: '',
    is_active: true,
    can_discount: false,
    can_void: false,
    can_open_cash_drawer: true,
  })

  const parentRef = useRef(null)

  useEffect(() => {
    setLoadingRoles(true)
    Promise.all([
      adminApi.getRoles().catch(() => ({ data: { data: [] } })),
      axiosClient.get('/outlets').catch(() => ({ data: { data: [] } })),
    ])
      .then(([rolesRes, outletsRes]) => {
        const rolesList = rolesRes.data?.data || []
        const outletsList = outletsRes.data?.data || []
        setRoles(rolesList)
        setOutlets(outletsList)
        if (!user && rolesList.length > 0) {
          setFormData((prev) => ({ ...prev, role_id: rolesList[0].id }))
        }
      })
      .finally(() => setLoadingRoles(false))
  }, [user])

  useEffect(() => {
    if (user) {
      setFormData({
        id: user.id || '',
        name: user.name || '',
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        image_url: user.image_url || '',
        password: '',
        confirm_password: '',
        role_id: user.role_id || user.role?.id || 2,
        outlet_id: user.outlet_id ? String(user.outlet_id) : '',
        is_active: user.is_active !== undefined ? Boolean(user.is_active) : true,
        can_discount: Boolean(user.can_discount),
        can_void: Boolean(user.can_void),
        can_open_cash_drawer: user.can_open_cash_drawer !== undefined ? Boolean(user.can_open_cash_drawer) : true,
      })
    }
  }, [user])

  const setField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (PNG, JPG, WebP)')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    const uploadFormData = new FormData()
    uploadFormData.append('image', file)

    setIsUploadingImage(true)
    try {
      const { data } = await adminApi.uploadImage(uploadFormData, 'users')
      const uploadedUrl = data?.url || data?.image_url || data?.data?.url
      if (uploadedUrl) {
        setField('image_url', uploadedUrl)
        toast.success('Avatar photo uploaded')
      } else {
        toast.error('Failed to get uploaded photo URL')
      }
    } catch (err) {
      console.error('Image upload failed:', err)
      toast.error(err.response?.data?.error || 'Failed to upload photo')
    } finally {
      setIsUploadingImage(false)
    }
  }

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'role', label: 'Role & Permissions' },
    { id: 'venue', label: 'Venue & Outlets' },
    { id: 'security', label: 'Security & Access' },
  ]

  // Role Options for SearchSelection
  const roleOptions = useMemo(() => {
    if (roles.length === 0) {
      return [
        { value: 1, id: 1, label: 'Administrator', badge: 'Full Access', description: 'Complete system control & reports' },
        { value: 2, id: 2, label: 'Cashier', badge: 'POS Terminal', description: 'Table orders & billing settlements' },
        { value: 3, id: 3, label: 'Kitchen Staff', badge: 'KDS Display', description: 'Live order prep & kitchen station' },
        { value: 4, id: 4, label: 'Waiter', badge: 'Floor Service', description: 'Table serving & quick ordering' },
      ]
    }
    return roles.map((r) => ({
      value: r.id,
      id: r.id,
      label: r.name,
      name: r.name,
      badge: r.code || r.name.toUpperCase(),
      description: r.description || `Access rights for ${r.name}`,
    }))
  }, [roles])

  // Outlet / Venue options with badges and flags for SearchSelection
  const outletOptions = useMemo(() => {
    const list = [
      {
        value: '',
        id: '',
        label: '🏢 All Venues (HQ / Global Staff)',
        name: '🏢 All Venues (HQ / Global Staff)',
        badge: 'ALL',
        description: 'Can operate across all SKYPARK locations',
      },
    ]
    outlets.forEach((o) => {
      list.push({
        value: String(o.id),
        id: String(o.id),
        label: o.name,
        name: o.name,
        badge: o.code,
        description:
          o.type === 'cafe'
            ? 'Cafe & Bakery'
            : o.type === 'bar'
            ? 'SkyBar & Lounge'
            : o.type === 'retail'
            ? 'Supermarket / Mart'
            : 'Grand Restaurant',
      })
    })
    return list
  }, [outlets])

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('Full Name is required')
      return
    }

    if (!formData.username.trim()) {
      toast.error('Username is required')
      return
    }

    if (!user && !formData.password.trim()) {
      toast.error('Password is required for new accounts')
      return
    }

    const payload = {
      name: formData.name.trim(),
      username: formData.username.trim().toLowerCase().replace(/\s+/g, ''),
      email: formData.email.trim() || undefined,
      phone: formData.phone.trim() || undefined,
      image_url: formData.image_url ? formData.image_url.trim() : undefined,
      role_id: Number(formData.role_id),
      outlet_id: formData.outlet_id ? Number(formData.outlet_id) : null,
      is_active: Boolean(formData.is_active),
    }

    if (formData.password.trim()) {
      if (formData.password.trim() !== formData.confirm_password.trim()) {
        toast.error('Passwords do not match. Please confirm your password.')
        return
      }
      payload.password = formData.password.trim()
    }

    onSave(payload)
  }

  return (
    <div className="max-w-5xl mx-auto w-full pb-10 select-none animate-in fade-in duration-200">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="secondary"
          size="md"
          onClick={onClose}
          iconLeading={ArrowLeft}
        >
          Cancel &amp; Return
        </Button>

        <Button
          variant="primary"
          size="md"
          onClick={handleSubmit}
          iconLeading={Check}
          className="shadow-sm"
        >
          {user ? 'Save Changes' : 'Save Staff Account'}
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
          className="px-8 py-6 border-b flex items-center justify-between shrink-0"
          style={{
            background: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div>
            <h3 className="font-extrabold text-xl sm:text-2xl" style={{ color: 'var(--color-text)' }}>
              {user ? 'Edit Staff Account' : 'Add New Staff Account'}
            </h3>
            <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
              Configure login credentials, photo avatar, role assignments, and venue permissions.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row">
          {/* Vertical Tab bar */}
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
          <div ref={parentRef} className="flex-1 overflow-y-auto max-h-[75vh] scroll-smooth p-5 relative scrollbar-none">
            <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
              {/* ── TAB 1: Basic Info ──────────────────────────── */}
              <div id="basic" className="space-y-2.5 scroll-mt-6">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Basic Info
                </h3>
                <div
                  className="rounded-[5px] p-6 sm:p-7 space-y-6"
                  style={{
                    background: 'var(--color-surface)',
                  }}
                >
                  {/* Avatar & Title Row */}
                  <div className="flex flex-col sm:flex-row items-start gap-6">
                    {/* Avatar Upload Box */}
                    <div
                      className="w-28 h-28 rounded-[8px] border-2 border-dashed flex flex-col items-center justify-center shrink-0 shadow-sm relative overflow-hidden group transition-colors"
                      style={{
                        background: 'var(--color-bg)',
                        borderColor: 'var(--color-border)',
                      }}
                    >
                      {isUploadingImage && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white z-10">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mb-1" />
                          <span className="text-[9px] font-bold">Uploading...</span>
                        </div>
                      )}

                      {formData.image_url ? (
                        <>
                          <img
                            src={formData.image_url}
                            alt="avatar"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none'
                            }}
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 z-10">
                            <button
                              type="button"
                              onClick={() => setField('image_url', '')}
                              className="w-8 h-8 rounded-[5px] bg-white text-rose-600 flex items-center justify-center hover:bg-rose-50 shadow-sm transition-transform active:scale-90 cursor-pointer"
                              title="Remove Photo"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-black text-white shadow-sm mb-1"
                            style={{
                              background: 'linear-gradient(135deg, #126973, #072328)',
                            }}
                          >
                            {formData.name ? formData.name.slice(0, 2).toUpperCase() : 'ST'}
                          </div>
                          <span className="text-[10px] font-bold text-[var(--color-muted)]">
                            Upload Avatar
                          </span>
                        </>
                      )}

                      {!formData.image_url && (
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFile}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          title="Upload User Photo"
                        />
                      )}
                    </div>

                    {/* Inputs */}
                    <div className="flex-1 w-full space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Sopheak Som"
                          value={formData.name}
                          onChange={(e) => setField('name', e.target.value)}
                          className="w-full px-4 py-2.5 text-xs rounded-[5px] border outline-none font-bold transition-all"
                          style={{
                            background: 'var(--color-bg)',
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-text)',
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                            Username *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. barista_sopheak"
                            value={formData.username}
                            onChange={(e) => setField('username', e.target.value.toLowerCase().replace(/\s+/g, ''))}
                            className="w-full px-3.5 py-2.5 text-xs rounded-[5px] border outline-none font-mono font-bold transition-all"
                            style={{
                              background: 'var(--color-bg)',
                              borderColor: 'var(--color-border)',
                              color: 'var(--color-text)',
                            }}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            placeholder="e.g. 012 345 678"
                            value={formData.phone}
                            onChange={(e) => setField('phone', e.target.value)}
                            className="w-full px-3.5 py-2.5 text-xs rounded-[5px] border outline-none font-mono transition-all"
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
                          Email Address
                        </label>
                        <input
                          type="email"
                          placeholder="staff@skypark.com"
                          value={formData.email}
                          onChange={(e) => setField('email', e.target.value)}
                          className="w-full px-4 py-2.5 text-xs rounded-[5px] border outline-none transition-all"
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

              {/* ── TAB 2: Role & Permissions ──────────────────────────── */}
              <div id="role" className="space-y-2.5 scroll-mt-6">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Role &amp; Permissions
                </h3>
                <div
                  className="rounded-[5px] p-6 sm:p-7 space-y-6"
                  style={{
                    background: 'var(--color-surface)',
                  }}
                >
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                      System Role *
                    </label>
                    <SearchSelection
                      name="role_id"
                      options={roleOptions}
                      valueKey="id"
                      labelKey="name"
                      value={formData.role_id}
                      autoSelect={false}
                      onChange={(val) => setField('role_id', Number(val))}
                      placeholder="Select System Role..."
                      searchPlaceholder="Search roles (Admin, Cashier, Kitchen)..."
                    />
                  </div>

                  {/* Role Presets Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {[
                      { id: 1, title: '🛡️ Administrator', desc: 'Full backend access, reports, user control & menu settings.' },
                      { id: 2, title: '💳 Cashier Terminal', desc: 'POS order creation, checkout billing, table management & receipts.' },
                      { id: 3, title: '🍳 Kitchen Display', desc: 'Real-time KDS food prep screen, ticket routing & order bump.' },
                      { id: 4, title: '🤵 Waiter / Runner', desc: 'Mobile table ordering, guest assistance & order service.' },
                    ].map((card) => {
                      const isSelected = Number(formData.role_id) === card.id
                      return (
                        <div
                          key={card.id}
                          onClick={() => setField('role_id', card.id)}
                          className={`p-3.5 rounded-[5px] border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-[#126973] bg-[#126973]/10 ring-1 ring-[#126973]'
                              : 'border-[var(--color-border)] hover:bg-black/5 dark:hover:bg-white/5'
                          }`}
                          style={{
                            background: isSelected ? undefined : 'var(--color-bg)',
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs" style={{ color: 'var(--color-text)' }}>
                              {card.title}
                            </span>
                            {isSelected && <Check size={14} className="text-[#126973] dark:text-[#F1D8C2]" />}
                          </div>
                          <p className="text-[11px] mt-1 leading-snug" style={{ color: 'var(--color-muted)' }}>
                            {card.desc}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* ── TAB 3: Venue & Outlets ──────────────────────────── */}
              <div id="venue" className="space-y-2.5 scroll-mt-6">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Venue &amp; Outlets
                </h3>
                <div
                  className="rounded-[5px] p-6 sm:p-7 space-y-4"
                  style={{
                    background: 'var(--color-surface)',
                  }}
                >
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                      Assigned Venue / Location Scope
                    </label>
                    <SearchSelection
                      name="outlet_id"
                      options={outletOptions}
                      valueKey="id"
                      labelKey="name"
                      value={String(formData.outlet_id || '')}
                      autoSelect={false}
                      onChange={(val) => setField('outlet_id', String(val))}
                      placeholder="Select Venue Assignment..."
                      searchPlaceholder="Search venue (Cafe, SkyBar, Mart, Restaurant)..."
                    />
                    <p className="text-[11px] mt-1.5" style={{ color: 'var(--color-muted)' }}>
                      Assigning a specific venue restricts this staff member&apos;s POS and KDS operations to that venue.
                    </p>
                  </div>
                </div>
              </div>

              {/* ── TAB 4: Security & Access ──────────────────────────── */}
              <div id="security" className="space-y-2.5 scroll-mt-6">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Security &amp; Access
                </h3>
                <div
                  className="rounded-[5px] p-6 sm:p-7 space-y-6"
                  style={{
                    background: 'var(--color-surface)',
                  }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                        Login Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required={!user}
                          placeholder={user ? '••••••••' : 'Enter strong password'}
                          value={formData.password}
                          onChange={(e) => setField('password', e.target.value)}
                          className="w-full px-3.5 py-2.5 pr-10 text-xs rounded-[5px] border outline-none font-mono transition-all"
                          style={{
                            background: 'var(--color-bg)',
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-text)',
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required={!user && Boolean(formData.password)}
                          placeholder={user ? '••••••••' : 'Re-enter password'}
                          value={formData.confirm_password}
                          onChange={(e) => setField('confirm_password', e.target.value)}
                          className="w-full px-3.5 py-2.5 pr-10 text-xs rounded-[5px] border outline-none font-mono transition-all"
                          style={{
                            background: 'var(--color-bg)',
                            borderColor:
                              formData.confirm_password && formData.password !== formData.confirm_password
                                ? '#ef4444'
                                : 'var(--color-border)',
                            color: 'var(--color-text)',
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                      {formData.confirm_password && formData.password !== formData.confirm_password && (
                        <p className="text-[11px] text-red-500 mt-1 font-medium">
                          Passwords do not match
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Account Permissions & Status Checkboxes */}
                  <div
                    className="space-y-3 pt-4 border-t"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setField('is_active', e.target.checked)}
                        className="w-4 h-4 rounded-[4px] accent-[#126973]"
                      />
                      <div>
                        <span className="text-xs font-bold block" style={{ color: 'var(--color-text)' }}>
                          Account is Active
                        </span>
                        <span className="text-[11px] block" style={{ color: 'var(--color-muted)' }}>
                          Allow this user to login to POS, KDS, and Admin portal.
                        </span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.can_open_cash_drawer}
                        onChange={(e) => setField('can_open_cash_drawer', e.target.checked)}
                        className="w-4 h-4 rounded-[4px] accent-[#126973]"
                      />
                      <div>
                        <span className="text-xs font-bold block" style={{ color: 'var(--color-text)' }}>
                          Authorized to Open Cash Drawer
                        </span>
                        <span className="text-[11px] block" style={{ color: 'var(--color-muted)' }}>
                          Permit manual kick opening on POS thermal receipt printers.
                        </span>
                      </div>
                    </label>
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
