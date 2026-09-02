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
  Loader2
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

export default function IngredientCreateView({ ingredient, onClose, onSave }) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    unit: 'kg',
    stock_quantity: '',
    low_stock_threshold: '5',
    cost_per_unit: '',
    sku: '',
    storage_location: 'Main Dry Storage',
    is_active: true,
  })

  const parentRef = useRef(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (ingredient) {
      setFormData({
        id: ingredient.id || '',
        name: ingredient.name || '',
        unit: ingredient.unit || 'kg',
        stock_quantity: String(ingredient.stock_quantity ?? '0'),
        low_stock_threshold: String(ingredient.low_stock_threshold ?? '5'),
        cost_per_unit: String(ingredient.cost_per_unit ?? '0'),
        sku: ingredient.sku || '',
        storage_location: ingredient.storage_location || 'Main Dry Storage',
        is_active: ingredient.is_active !== undefined ? Boolean(ingredient.is_active) : true,
      })
    } else {
      setFormData({
        id: '',
        name: '',
        unit: 'kg',
        stock_quantity: '',
        low_stock_threshold: '5',
        cost_per_unit: '',
        sku: '',
        storage_location: 'Main Dry Storage',
        is_active: true,
      })
    }
  }, [ingredient])

  const setField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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
      name: formData.name.trim(),
      unit: formData.unit,
      stock_quantity: parseFloat(formData.stock_quantity) || 0,
      low_stock_threshold: parseFloat(formData.low_stock_threshold) || 5,
      cost_per_unit: parseFloat(formData.cost_per_unit) || 0,
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
  const lowThreshold = parseFloat(formData.low_stock_threshold) || 5
  const totalValuation = stockQty * costUnit
  const isLowStock = stockQty <= lowThreshold

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'stock', label: 'Stock & Reorder Levels' },
    { id: 'cost', label: 'Cost & Valuation' },
    { id: 'storage', label: 'Storage & Location' },
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
          className="px-8 py-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0"
          style={{
            background: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-extrabold text-xl sm:text-2xl" style={{ color: 'var(--color-text)' }}>
                {ingredient ? `Edit ${ingredient.name}` : 'Add New Raw Ingredient'}
              </h3>
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                style={{
                  background: isLowStock ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  color: isLowStock ? '#ef4444' : '#10b981',
                  border: `1px solid ${isLowStock ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                }}
              >
                {stockQty === 0 ? 'Out of Stock' : isLowStock ? 'Low Stock Warning' : 'Healthy Stock'}
              </span>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
              Configure unit metrics, current on-hand warehouse inventory, reorder triggers and unit purchasing costs.
            </p>
          </div>

          {/* Live Asset Valuation Chip */}
          <div
            className="p-3.5 rounded-[5px] border flex items-center gap-3 shrink-0"
            style={{
              background: 'var(--color-bg)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="w-9 h-9 rounded-lg bg-[#126973]/15 flex items-center justify-center text-[#126973] dark:text-[#F1D8C2]">
              <DollarSign size={18} />
            </div>
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)]">
                On-Hand Valuation
              </span>
              <span className="text-base font-extrabold font-mono text-[#126973] dark:text-[#F1D8C2]">
                ${totalValuation.toFixed(2)}
              </span>
            </div>
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
              {/* ── TAB 1: Basic Info ──────────────────────────── */}
              <div id="basic" className="space-y-2.5 scroll-mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    Ingredient Specification
                  </h3>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#126973]/10 text-[#126973] dark:text-[#F1D8C2]">
                    Required Fields
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
                        Ingredient / Raw Material Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Wagyu Ribeye Beef, Extra Virgin Olive Oil, Fresh Milk"
                        value={formData.name}
                        onChange={(e) => setField('name', e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-[5px] border outline-none font-semibold transition-all"
                        style={{
                          background: 'var(--color-bg)',
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-text)',
                        }}
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
                        placeholder="Select Unit..."
                        searchPlaceholder="Search kg, g, L, pcs..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                        SKU / Item Code (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. RAW-BEEF-001"
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

              {/* ── TAB 2: Stock & Reorder Levels ──────────────────────────── */}
              <div id="stock" className="space-y-2.5 scroll-mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    Stock &amp; Reorder Triggers
                  </h3>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    BOM Consumption
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
                </div>
              </div>

              {/* ── TAB 3: Unit Cost & Valuation ──────────────────────────── */}
              <div id="cost" className="space-y-2.5 scroll-mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    Unit Cost &amp; Valuation
                  </h3>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    Financial COGS
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
                        Estimated Unit Cost ($)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
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

              {/* ── TAB 4: Storage & Location ──────────────────────────── */}
              <div id="storage" className="space-y-2.5 scroll-mt-6">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Storage &amp; Active Status
                </h3>

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
                        Warehouse / Storage Location
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Walk-in Freezer #2, Dry Pantry Shelf B"
                        value={formData.storage_location}
                        onChange={(e) => setField('storage_location', e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-[5px] border outline-none font-semibold transition-all"
                        style={{
                          background: 'var(--color-bg)',
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-text)',
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-[5px] border" style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
                      <div>
                        <span className="block text-xs font-bold" style={{ color: 'var(--color-text)' }}>
                          Active Status
                        </span>
                        <span className="text-[11px]" style={{ color: 'var(--color-muted)' }}>
                          Available for recipes and purchase ordering
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
