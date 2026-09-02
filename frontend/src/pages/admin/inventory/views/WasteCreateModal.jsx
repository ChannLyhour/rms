import { useState, useMemo } from 'react'
import { X, Trash2, AlertOctagon, DollarSign, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminApi } from '../../../../api/adminApi'
import { Button } from '../../../../components/common/ButtonComponent'
import { SearchSelection } from '../../../../components/plugin/components/Search-Selection-components'

const WASTE_REASONS = [
  { id: 'spoiled', label: '🥩 Spoiled / Expired' },
  { id: 'damaged', label: '📦 Damaged in Transit' },
  { id: 'mistake', label: '🍳 Kitchen Mistake / Overcook' },
  { id: 'quality', label: '⚠️ Quality Rejection' },
]

export default function WasteCreateModal({ ingredients = [], onClose, onSave }) {
  const [wasteForm, setWasteForm] = useState({
    ingredient_id: ingredients[0] ? String(ingredients[0].id) : '',
    quantity: '',
    reason: 'spoiled',
    cost_loss: '',
  })
  const [submitting, setSubmitting] = useState(false)

  // Ingredient options for SearchSelection
  const ingredientOptions = useMemo(() => {
    return ingredients.map((ing) => ({
      id: String(ing.id),
      value: String(ing.id),
      name: ing.name,
      label: `${ing.name} (${ing.unit})`,
      badge: `$${Number(ing.cost_per_unit).toFixed(2)} / ${ing.unit}`,
      unit: ing.unit,
      cost_per_unit: Number(ing.cost_per_unit) || 0,
      description: `In Stock: ${ing.stock_quantity} ${ing.unit}`,
    }))
  }, [ingredients])

  const selectedIng = ingredients.find((i) => String(i.id) === String(wasteForm.ingredient_id))

  const handleIngredientChange = (ingId) => {
    const ing = ingredients.find((i) => String(i.id) === String(ingId))
    const costPerUnit = ing ? Number(ing.cost_per_unit) || 0 : 0
    const qty = parseFloat(wasteForm.quantity) || 0
    setWasteForm({
      ...wasteForm,
      ingredient_id: ingId,
      cost_loss: (qty * costPerUnit).toFixed(2),
    })
  }

  const handleQuantityChange = (qtyVal) => {
    const costPerUnit = selectedIng ? Number(selectedIng.cost_per_unit) || 0 : 0
    const qty = parseFloat(qtyVal) || 0
    setWasteForm({
      ...wasteForm,
      quantity: qtyVal,
      cost_loss: (qty * costPerUnit).toFixed(2),
    })
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    if (!wasteForm.ingredient_id) {
      toast.error('Please select an ingredient')
      return
    }
    const qty = parseFloat(wasteForm.quantity)
    if (isNaN(qty) || qty <= 0) {
      toast.error('Please enter a valid waste quantity')
      return
    }

    const payload = {
      ingredient_id: wasteForm.ingredient_id,
      quantity: qty,
      reason: wasteForm.reason,
      cost_loss: parseFloat(wasteForm.cost_loss) || 0,
    }

    setSubmitting(true)
    try {
      await adminApi.createStockWaste(payload)
      toast.success('Waste record logged and inventory adjusted')
      onSave()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to record waste')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="rounded-[5px] shadow-xl w-full max-w-md overflow-hidden border animate-in zoom-in-95 duration-150"
        style={{
          background: 'var(--color-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div>
            <h3 className="font-extrabold text-base flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
              <AlertOctagon size={16} className="text-rose-500" />
              <span>Record Spoilage / Wastage</span>
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
              Write off expired or damaged food supplies from inventory.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
              Damaged / Spoiled Ingredient *
            </label>
            <SearchSelection
              name="ingredient_id"
              options={ingredientOptions}
              valueKey="id"
              labelKey="label"
              value={String(wasteForm.ingredient_id)}
              autoSelect={false}
              onChange={(val) => handleIngredientChange(val)}
              placeholder="Choose Ingredient..."
              searchPlaceholder="Search ingredient..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
              Discarded Quantity ({selectedIng?.unit || 'unit'}) *
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={wasteForm.quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-[5px] border outline-none font-mono font-bold"
                style={{
                  background: 'var(--color-bg)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                }}
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                {selectedIng?.unit || 'unit'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
              Reason for Wastage
            </label>
            <div className="grid grid-cols-2 gap-2">
              {WASTE_REASONS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setWasteForm({ ...wasteForm, reason: r.id })}
                  className={`p-2 rounded-[5px] border text-left text-xs font-bold transition-all cursor-pointer ${
                    wasteForm.reason === r.id
                      ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500'
                      : 'border-[var(--color-border)] text-[var(--color-muted)] hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Loss Calculation Preview */}
          <div
            className="p-3.5 rounded-[5px] border flex items-center justify-between"
            style={{
              background: 'var(--color-bg)',
              borderColor: 'var(--color-border)',
            }}
          >
            <span className="text-xs text-[var(--color-muted)]">Calculated Financial Loss:</span>
            <span className="text-sm font-extrabold font-mono text-rose-500">
              ${parseFloat(wasteForm.cost_loss || 0).toFixed(2)}
            </span>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-[5px] text-xs font-bold text-white shadow-sm transition-all hover:opacity-90 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #e11d48, #be123c)',
              }}
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              <span>{submitting ? 'Recording...' : 'Record Spoilage Write-Off'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
