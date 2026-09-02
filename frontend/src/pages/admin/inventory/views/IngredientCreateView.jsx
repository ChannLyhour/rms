import { useState, useEffect } from 'react'
import {
  X,
  Plus,
  Trash2,
  Check,
  Package,
  Layers,
  ShoppingBag,
  TrendingDown,
  Warehouse,
  AlertTriangle,
  DollarSign,
  ArrowLeft,
  CheckSquare,
  Square
} from 'lucide-react'
import toast from 'react-hot-toast'
import { adminApi } from '../../../../api/adminApi'
import { Button } from '../../../../components/common/ButtonComponent'

export default function IngredientCreateView({ ingredient, onClose, onSave }) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    unit: 'kg',
    stock_quantity: '',
    low_stock_threshold: '5',
    cost_per_unit: '',
    is_active: true,
  })

  useEffect(() => {
    if (ingredient) {
      setFormData({
        id: ingredient.id,
        name: ingredient.name || '',
        unit: ingredient.unit || 'kg',
        stock_quantity: String(ingredient.stock_quantity ?? '0'),
        low_stock_threshold: String(ingredient.low_stock_threshold ?? '5'),
        cost_per_unit: String(ingredient.cost_per_unit ?? '0'),
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
        is_active: true,
      })
    }
  }, [ingredient])

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    if (!formData.name.trim()) {
      toast.error('Ingredient name is required')
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
    }
  }

  const stockVal = (parseFloat(formData.stock_quantity) || 0) * (parseFloat(formData.cost_per_unit) || 0)

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
      {/* Top Breadcrumb & Action */}
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
              <span>{formData.id ? 'Edit Ingredient' : 'Create Raw Ingredient'}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#126973]/20 text-[#126973] dark:text-[#F1D8C2] font-mono">
                {formData.unit.toUpperCase()}
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Configure inventory item name, measurement unit, default cost, and reorder warning alert.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="md" onClick={handleSubmit}>
            {formData.id ? 'Save Changes' : 'Create Ingredient'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        {/* Basic Info Section */}
        <div className="p-5 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] space-y-4 shadow-2xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#126973] dark:text-[#F1D8C2] flex items-center gap-2">
            <Package size={14} />
            <span>General Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-500">
                Ingredient Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Arabica Coffee Beans, Wagyu Patties"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border outline-none font-bold bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text)] focus:border-[#126973]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-500">
                Measurement Unit *
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border outline-none font-semibold bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text)] cursor-pointer"
              >
                <option value="kg">kg (Kilogram)</option>
                <option value="g">g (Gram)</option>
                <option value="l">l (Liter)</option>
                <option value="ml">ml (Milliliter)</option>
                <option value="pcs">pcs (Pieces / Cans / Units)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stock & Costing Section */}
        <div className="p-5 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] space-y-4 shadow-2xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#126973] dark:text-[#F1D8C2] flex items-center gap-2">
            <DollarSign size={14} />
            <span>Stock Quantities &amp; Cost Valuation</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-500">
                Unit Cost ($)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.cost_per_unit}
                onChange={(e) => setFormData({ ...formData, cost_per_unit: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border outline-none font-mono font-bold bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text)]"
              />
              <span className="text-[10.5px] text-slate-400 mt-1 block">
                Cost per 1 {formData.unit}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-500">
                Current Stock ({formData.unit})
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border outline-none font-mono font-bold bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text)]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-500">
                Low Stock Alert Threshold
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="5.00"
                value={formData.low_stock_threshold}
                onChange={(e) => setFormData({ ...formData, low_stock_threshold: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border outline-none font-mono font-bold bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text)]"
              />
              <span className="text-[10.5px] text-amber-500 mt-1 block">
                Alerts if stock falls &le; threshold
              </span>
            </div>
          </div>

          {/* Quick Valuation Preview */}
          <div className="p-3.5 rounded-xl bg-[#126973]/10 border border-[#126973]/20 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-semibold">
              Calculated Total Stock Value:
            </span>
            <span className="font-mono font-bold text-sm text-emerald-500">
              ${stockVal.toFixed(2)} USD
            </span>
          </div>
        </div>

        {/* Status */}
        <div className="p-4 rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[var(--color-text)]">Active for Recipes &amp; Ordering</p>
            <p className="text-[11px] text-slate-400">If disabled, this item will be hidden from new recipe selections</p>
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
