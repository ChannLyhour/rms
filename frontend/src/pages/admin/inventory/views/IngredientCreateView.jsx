import { useState, useEffect, useRef, useMemo } from 'react'
import { Scrollspy } from '../../../../components/reui/scrollspy'
import {
  ArrowLeft,
  Check,
  Package,
  Layers,
  ShoppingBag,
  TrendingDown,
  Warehouse,
  AlertTriangle,
  DollarSign,
  Scale,
  Sparkles,
  Building2,
  Tag,
  Loader2,
  Image as ImageIcon,
  Trash2,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'
import { adminApi } from '../../../../api/adminApi'
import { Button } from '../../../../components/common/ButtonComponent'
import { SearchSelection } from '../../../../components/plugin/components/Search-Selection-components'

const UNIT_OPTIONS = [
  { id: 'kg', value: 'kg', label: 'Kilogram (kg)', name: 'Kilogram (kg)', badge: 'WEIGHT' },
  { id: 'g', value: 'g', label: 'Gram (g)', name: 'Gram (g)', badge: 'WEIGHT' },
  { id: 'L', value: 'L', label: 'Liter (L)', name: 'Liter (L)', badge: 'VOLUME' },
  { id: 'ml', value: 'ml', label: 'Milliliter (ml)', name: 'Milliliter (ml)', badge: 'VOLUME' },
  { id: 'pcs', value: 'pcs', label: 'Pieces (pcs)', name: 'Pieces (pcs)', badge: 'COUNT' },
  { id: 'pack', value: 'pack', label: 'Pack / Bundle', name: 'Pack / Bundle', badge: 'COUNT' },
  { id: 'can', value: 'can', label: 'Can / Tin', name: 'Can / Tin', badge: 'PACK' },
  { id: 'bottle', value: 'bottle', label: 'Bottle', name: 'Bottle', badge: 'PACK' },
  { id: 'box', value: 'box', label: 'Carton / Box', name: 'Carton / Box', badge: 'BULK' },
]

export default function IngredientCreateView({ ingredient, categories = [], onClose, onSave }) {
  const [formData, setFormData] = useState({
    id: '',
    category_id: '',
    outlet_id: '',
    name: '',
    unit: 'kg',
    stock_quantity: '',
    low_stock_threshold: '5',
    cost_per_unit: '',
    sku: '',
    image_url: '',
    is_active: true,
  })

  const [outlets, setOutlets] = useState([])

  useEffect(() => {
    adminApi.getOutlets({ active: true })
      .then((res) => {
        const data = res.data?.data || res.data || []
        setOutlets(Array.isArray(data) ? data : [])
      })
      .catch((err) => console.error('Failed to load outlets:', err))
  }, [])

  const outletOptions = useMemo(() => [
    { id: '', value: '', name: 'All Outlets / Central Warehouse (Shared)', label: 'All Outlets / Central Warehouse (Shared)', badge: 'CENTRAL' },
    ...outlets.map((o) => ({
      id: String(o.id),
      value: String(o.id),
      label: o.name,
      name: o.name,
      badge: o.code || o.type?.toUpperCase() || 'BRANCH',
      description:
        o.type === 'cafe'
          ? 'Cafe & Bakery'
          : o.type === 'bar'
          ? 'SkyBar & Lounge'
          : o.type === 'retail'
          ? 'Supermarket / Mart'
          : 'Grand Restaurant',
    })),
  ], [outlets])

  const categoryOptions = useMemo(() => [
    { id: '', value: '', label: 'None (Uncategorized)', name: 'None (Uncategorized)' },
    ...categories.map((c) => ({
      id: c.id,
      value: c.id,
      label: c.name + (c.code ? ` (${c.code})` : ''),
      name: c.name + (c.code ? ` (${c.code})` : ''),
      badge: c.code || undefined,
    })),
  ], [categories])

  const parentRef = useRef(null)
  const [saving, setSaving] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  useEffect(() => {
    if (ingredient) {
      setFormData({
        id: ingredient.id || '',
        category_id: ingredient.category_id || '',
        outlet_id: ingredient.outlet_id || '',
        name: ingredient.name || '',
        unit: ingredient.unit || 'kg',
        stock_quantity: String(ingredient.stock_quantity ?? '0'),
        low_stock_threshold: String(ingredient.low_stock_threshold ?? '5'),
        cost_per_unit: String(ingredient.cost_per_unit ?? '0'),
        sku: ingredient.sku || '',
        image_url: ingredient.image_url || '',
        is_active: ingredient.is_active !== undefined ? Boolean(ingredient.is_active) : true,
      })
    } else {
      setFormData({
        id: '',
        category_id: '',
        outlet_id: '',
        name: '',
        unit: 'kg',
        stock_quantity: '',
        low_stock_threshold: '5',
        cost_per_unit: '',
        sku: '',
        image_url: '',
        is_active: true,
      })
    }
  }, [ingredient])

  const setField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const form = new FormData()
    form.append('image', file)
    setIsUploadingImage(true)
    try {
      const { data } = await adminApi.uploadImage(form, 'ingredients')
      const uploadedUrl = data?.url || data?.path || data?.full_url
      if (uploadedUrl) {
        setField('image_url', uploadedUrl)
        toast.success('Image uploaded successfully')
      }
    } catch (err) {
      console.error('Failed to upload image:', err)
      toast.error('Failed to upload image')
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    if (!formData.name.trim()) {
      toast.error('Ingredient name is required')
      const el = document.getElementById('basic')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }

    const payload = {
      category_id: formData.category_id || null,
      outlet_id: formData.outlet_id || null,
      name: formData.name.trim(),
      unit: formData.unit,
      stock_quantity: parseFloat(formData.stock_quantity) || 0,
      low_stock_threshold: parseFloat(formData.low_stock_threshold) || 5,
      cost_per_unit: parseFloat(formData.cost_per_unit) || 0,
      image_url: formData.image_url || null,
      is_active: Boolean(formData.is_active),
    }

    setSaving(true)
    try {
      if (formData.id) {
        await adminApi.updateIngredient(formData.id, payload)
        toast.success('Ingredient updated successfully')
      } else {
        await adminApi.createIngredient(payload)
        toast.success('Ingredient created successfully')
      }
      onSave()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save ingredient')
    } finally {
      setSaving(false)
    }
  }

  const stockQty = parseFloat(formData.stock_quantity) || 0
  const costUnit = parseFloat(formData.cost_per_unit) || 0
  const totalValuation = stockQty * costUnit

  const tabs = [
    { id: 'venue', label: 'Venue & Outlet' },
    { id: 'basic', label: 'Basic Info' },
    { id: 'cost', label: 'Cost & Valuation' },
    { id: 'stock', label: 'Stock & Inventory' },
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
          {saving ? 'Saving...' : ingredient ? 'Save Changes' : 'Save Ingredient'}
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
              {ingredient ? `Edit ${formData.name || 'Raw Material'}` : 'Add New Raw Material'}
            </h3>
            <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
              Fill out the details below to define your raw ingredient.
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
              {/* ── TAB 1: Venue & Outlet ──────────────────────────── */}
              <div id="venue" className="space-y-2.5 scroll-mt-6">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Venue and Outlet
                </h3>
                <div
                  className="rounded-[5px] p-6 sm:p-7 space-y-4"
                  style={{
                    background: 'var(--color-surface)',
                  }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                        Venue / Outlet
                      </label>
                      <SearchSelection
                        name="outlet_id"
                        options={outletOptions}
                        valueKey="id"
                        labelKey="name"
                        value={String(formData.outlet_id || '')}
                        autoSelect={false}
                        onChange={(val) => setField('outlet_id', val || null)}
                        placeholder="Select Venue / Outlet"
                        searchPlaceholder="Search outlets..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                        Barcode / SKU (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Scan or type barcode / SKU"
                        value={formData.sku}
                        onChange={(e) => setField('sku', e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-[5px] border outline-none font-mono font-bold transition-all"
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

              {/* ── TAB 2: Basic Info ──────────────────────────── */}
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
                  {/* Image Upload & Title */}
                  <div className="flex flex-col sm:flex-row items-start gap-6">
                    {/* Image Box */}
                    <div
                      className="w-32 h-32 rounded-[5px] border-2 border-dashed flex flex-col items-center justify-center shrink-0 overflow-hidden relative group transition-colors"
                      style={{
                        background: 'var(--color-bg)',
                        borderColor: 'var(--color-border)',
                      }}
                    >
                      {isUploadingImage && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white z-10">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mb-1" />
                          <span className="text-[10px] font-bold">Uploading...</span>
                        </div>
                      )}
                      {formData.image_url ? (
                        <>
                          <img
                            src={formData.image_url}
                            alt="preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none'
                            }}
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => setField('image_url', '')}
                              className="w-9 h-9 rounded-[5px] bg-white text-rose-600 flex items-center justify-center hover:bg-rose-50 shadow-sm transition-transform active:scale-90 cursor-pointer"
                              title="Remove Photo"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <ImageIcon size={32} style={{ color: 'var(--color-muted)' }} />
                          <span className="text-[11px] font-bold mt-2" style={{ color: 'var(--color-muted)' }}>
                            Upload Photo
                          </span>
                        </>
                      )}
                      {!formData.image_url && (
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          title="Upload Image File"
                        />
                      )}
                    </div>

                    {/* Title & Category / Unit */}
                    <div className="flex-1 w-full space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                          Ingredient Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Fresh Red Dragon Fruit, Wagyu Beef, Monin Mojito Mint Syrup"
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
                            Category *
                          </label>
                          <SearchSelection
                            name="category_id"
                            options={categoryOptions}
                            valueKey="value"
                            labelKey="name"
                            value={formData.category_id}
                            autoSelect={false}
                            onChange={(val) => setField('category_id', val)}
                            placeholder="Select category..."
                            searchPlaceholder="Search categories..."
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                            Measurement Unit *
                          </label>
                          <SearchSelection
                            name="unit"
                            options={UNIT_OPTIONS}
                            valueKey="value"
                            labelKey="name"
                            value={formData.unit}
                            autoSelect={false}
                            onChange={(val) => setField('unit', val)}
                            placeholder="Select unit..."
                            searchPlaceholder="Search kg, g, L, pcs..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── TAB 3: Cost & Valuation ──────────────────────────── */}
              <div id="cost" className="space-y-2.5 scroll-mt-6">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Cost &amp; Valuation
                </h3>
                <div
                  className="rounded-[5px] p-6 sm:p-7 space-y-6"
                  style={{
                    background: 'var(--color-surface)',
                  }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                        Cost Per Unit ($)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs font-mono">
                          $
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={formData.cost_per_unit}
                          onChange={(e) => setField('cost_per_unit', e.target.value)}
                          className="w-full pl-8 pr-16 py-2.5 text-xs rounded-[5px] border outline-none font-mono font-bold transition-all"
                          style={{
                            background: 'var(--color-bg)',
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-text)',
                          }}
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                          / {formData.unit}
                        </span>
                      </div>
                      <p className="text-[11px] mt-1" style={{ color: 'var(--color-muted)' }}>
                        Used in recipe cost calculations and food cost percentage analysis.
                      </p>
                    </div>

                    <div
                      className="rounded-[5px] p-4 border flex flex-col justify-center"
                      style={{
                        background: 'var(--color-bg)',
                        borderColor: 'var(--color-border)',
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)]">
                          Total Value on Hand
                        </span>
                        <span className="text-xs font-mono font-bold text-[#126973] dark:text-[#F1D8C2]">
                          {stockQty} {formData.unit} × ${costUnit.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-xl font-extrabold font-mono mt-1 text-slate-900 dark:text-slate-100">
                        ${totalValuation.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── TAB 4: Stock & Inventory ──────────────────────────── */}
              <div id="stock" className="space-y-2.5 scroll-mt-6">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Stock &amp; Inventory
                </h3>
                <div
                  className="rounded-[5px] p-6 sm:p-7 space-y-6"
                  style={{
                    background: 'var(--color-surface)',
                  }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                        Current Stock on Hand ({formData.unit})
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={formData.stock_quantity}
                          onChange={(e) => setField('stock_quantity', e.target.value)}
                          className="w-full px-3.5 py-2.5 text-xs rounded-[5px] border outline-none font-mono font-bold transition-all"
                          style={{
                            background: 'var(--color-bg)',
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-text)',
                          }}
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                          {formData.unit}
                        </span>
                      </div>
                      <p className="text-[11px] mt-1" style={{ color: 'var(--color-muted)' }}>
                        Will automatically deduct as dishes with recipe formulas are ordered.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                        Low Stock Alert Threshold ({formData.unit})
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="5"
                          value={formData.low_stock_threshold}
                          onChange={(e) => setField('low_stock_threshold', e.target.value)}
                          className="w-full px-3.5 py-2.5 text-xs rounded-[5px] border outline-none font-mono font-bold transition-all"
                          style={{
                            background: 'var(--color-bg)',
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-text)',
                          }}
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-500">
                          {formData.unit}
                        </span>
                      </div>
                      <p className="text-[11px] mt-1 text-amber-600 dark:text-amber-400">
                        Highlights in warning badges and flags for purchase reorders.
                      </p>
                    </div>
                  </div>

                  {/* Active Status Row */}
                  <div
                    className="flex items-center justify-between p-4 rounded-[5px] border"
                    style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
                  >
                    <div>
                      <span className="block text-xs font-bold" style={{ color: 'var(--color-text)' }}>
                        Active Status
                      </span>
                      <span className="text-[11px]" style={{ color: 'var(--color-muted)' }}>
                        Available for recipes, consumption tracking, and purchase ordering
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
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
