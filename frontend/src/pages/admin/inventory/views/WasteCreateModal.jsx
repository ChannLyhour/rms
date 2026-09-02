import { useState } from 'react'
import { X, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminApi } from '../../../../api/adminApi'
import { Button } from '../../../../components/common/ButtonComponent'

export default function WasteCreateModal({ ingredients = [], onClose, onSave }) {
  const [wasteForm, setWasteForm] = useState({
    ingredient_id: ingredients[0] ? String(ingredients[0].id) : '',
    quantity: '',
    reason: 'spoiled', // 'spoiled' | 'expired' | 'damaged' | 'mistake'
    cost_loss: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const selectedIng = ingredients.find(i => String(i.id) === wasteForm.ingredient_id)

  const handleIngredientChange = (ingId) => {
    const ing = ingredients.find(i => String(i.id) === ingId)
    const costPerUnit = ing ? Number(ing.cost_per_unit) : 0
    const qty = parseFloat(wasteForm.quantity) || 0
    setWasteForm({
      ...wasteForm,
      ingredient_id: ingId,
      cost_loss: (qty * costPerUnit).toFixed(2),
    })
  }

  const handleQuantityChange = (qtyVal) => {
    const costPerUnit = selectedIng ? Number(selectedIng.cost_per_unit) : 0
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-md rounded-2xl border shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center justify-between border-b pb-3 border-[var(--color-border)]">
          <h3 className="text-base font-bold text-[var(--color-text)] flex items-center gap-2">
            <Trash2 size={16} className="text-rose-500" />
            <span>Record Spoilage / Wastage</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-500">
              Damaged / Spoiled Ingredient *
            </label>
            <select
              value={wasteForm.ingredient_id}
              onChange={(e) => handleIngredientChange(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border outline-none font-bold bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text)] cursor-pointer"
            >
              {ingredients.map((ing) => (
                <option key={ing.id} value={String(ing.id)}>
                  {ing.name} ({ing.unit}) — Current: {Number(ing.stock_quantity).toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-500">
                Wasted Quantity *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.001"
                  required
                  placeholder="0.00"
                  value={wasteForm.quantity}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border outline-none font-mono font-bold bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text)]"
                />
                <span className="absolute right-3 top-2 text-[11px] font-mono text-slate-400">
                  {selectedIng?.unit || ''}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-500">
                Estimated Cost Loss ($)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={wasteForm.cost_loss}
                onChange={(e) => setWasteForm({ ...wasteForm, cost_loss: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border outline-none font-mono font-bold bg-[var(--color-bg)] border-[var(--color-border)] text-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-500">
              Reason for Wastage
            </label>
            <select
              value={wasteForm.reason}
              onChange={(e) => setWasteForm({ ...wasteForm, reason: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border outline-none font-semibold bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text)] cursor-pointer"
            >
              <option value="spoiled">Spoiled / Rotten Quality</option>
              <option value="expired">Expired Beyond Shelf Life</option>
              <option value="damaged">Damaged Container / Dropped</option>
              <option value="mistake">Kitchen Cooking Mistake</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="secondary" size="md" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" disabled={submitting}>
              {submitting ? 'Recording...' : 'Record Spoilage'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
