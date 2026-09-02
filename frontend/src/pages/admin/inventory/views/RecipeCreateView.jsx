import { useState } from 'react'
import {
  X,
  ChefHat,
  Plus,
  ArrowLeft,
  DollarSign,
  Layers,
  Sparkles
} from 'lucide-react'
import toast from 'react-hot-toast'
import { adminApi } from '../../../../api/adminApi'
import { Button } from '../../../../components/common/ButtonComponent'

export default function RecipeCreateView({ products = [], ingredients = [], onClose, onSave }) {
  const [formData, setFormData] = useState({
    product_id: products[0] ? String(products[0].id) : '',
    ingredient_id: ingredients[0] ? String(ingredients[0].id) : '',
    quantity_required: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const selectedProduct = products.find(p => String(p.id) === formData.product_id)
  const selectedIngredient = ingredients.find(i => String(i.id) === formData.ingredient_id)

  const qty = parseFloat(formData.quantity_required) || 0
  const unitCost = selectedIngredient ? Number(selectedIngredient.cost_per_unit) : 0
  const estimatedCost = qty * unitCost
  const dishPrice = selectedProduct ? Number(selectedProduct.price) : 0
  const foodCostPct = dishPrice > 0 ? ((estimatedCost / dishPrice) * 100).toFixed(1) : 0

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    if (!formData.product_id || !formData.ingredient_id) {
      toast.error('Please select both Menu Item and Ingredient')
      return
    }
    if (qty <= 0) {
      toast.error('Required portion quantity must be greater than 0')
      return
    }

    setSubmitting(true)
    try {
      await adminApi.createRecipe({
        product_id: formData.product_id,
        ingredient_id: formData.ingredient_id,
        quantity_required: qty,
      })
      toast.success('Ingredient mapped to dish recipe')
      onSave()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create recipe item')
    } finally {
      setSubmitting(false)
    }
  }

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
              <span>Link Recipe Ingredient (BOM)</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#126973]/20 text-[#126973] dark:text-[#F1D8C2] font-mono">
                AUTO-DEDUCT
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Map dishes to raw kitchen ingredients for live POS stock deduction and food cost analysis.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="md" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" size="md" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Recipe Item'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        <div className="p-5 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] space-y-4 shadow-2xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#126973] dark:text-[#F1D8C2] flex items-center gap-2">
            <ChefHat size={14} />
            <span>Select Dish &amp; Ingredient</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-500">
                Menu Item / Dish *
              </label>
              <select
                value={formData.product_id}
                onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border outline-none font-bold bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text)] cursor-pointer"
              >
                {products.map((p) => (
                  <option key={p.id} value={String(p.id)}>
                    {p.name} (${Number(p.price).toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-500">
                Kitchen Raw Ingredient *
              </label>
              <select
                value={formData.ingredient_id}
                onChange={(e) => setFormData({ ...formData, ingredient_id: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border outline-none font-bold bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text)] cursor-pointer"
              >
                {ingredients.map((ing) => (
                  <option key={ing.id} value={String(ing.id)}>
                    {ing.name} ({ing.unit}) — ${Number(ing.cost_per_unit).toFixed(2)}/{ing.unit}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-500">
              Required Quantity (per portion) *
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.001"
                required
                placeholder="e.g. 0.018 for 18g or 1 for 1 pcs"
                value={formData.quantity_required}
                onChange={(e) => setFormData({ ...formData, quantity_required: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border outline-none font-mono font-bold bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text)]"
              />
              <span className="absolute right-3.5 top-2.5 text-xs font-mono font-bold text-slate-400">
                {selectedIngredient?.unit || 'unit'}
              </span>
            </div>
          </div>

          {/* Real-time Calculation Box */}
          <div className="p-4 rounded-xl bg-[#126973]/10 border border-[#126973]/30 grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Portion Cost</p>
              <p className="text-sm font-bold font-mono text-emerald-500 mt-0.5">
                ${estimatedCost.toFixed(3)}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Selling Price</p>
              <p className="text-sm font-bold font-mono text-[var(--color-text)] mt-0.5">
                ${dishPrice.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Ingredient Cost %</p>
              <p className="text-sm font-bold font-mono text-[#126973] dark:text-[#F1D8C2] mt-0.5">
                {foodCostPct}%
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
