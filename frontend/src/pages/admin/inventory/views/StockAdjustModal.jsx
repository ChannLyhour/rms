import { useState } from 'react'
import { X, ArrowDown, ArrowUp, ArrowDownUp } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminApi } from '../../../../api/adminApi'
import { Button } from '../../../../components/common/ButtonComponent'

export default function StockAdjustModal({ item, onClose, onSave }) {
  const [adjustForm, setAdjustForm] = useState({
    type: 'in', // 'in' | 'out' | 'set'
    quantity: '',
    note: '',
  })
  const [submitting, setSubmitting] = useState(false)

  if (!item) return null

  const handleSaveAdjustment = async (e) => {
    if (e) e.preventDefault()
    const qty = parseFloat(adjustForm.quantity)
    if (isNaN(qty) || qty <= 0) {
      toast.error('Please enter a valid quantity greater than 0')
      return
    }

    let nextStock = Number(item.stock_quantity)
    if (adjustForm.type === 'in') {
      nextStock += qty
    } else if (adjustForm.type === 'out') {
      nextStock = Math.max(0, nextStock - qty)
    } else if (adjustForm.type === 'set') {
      nextStock = qty
    }

    setSubmitting(true)
    try {
      await adminApi.updateIngredient(item.id, {
        ...item,
        stock_quantity: nextStock,
      })
      toast.success(`Stock adjusted for ${item.name} (${nextStock} ${item.unit})`)
      onSave()
      onClose()
    } catch (err) {
      toast.error('Failed to adjust stock')
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
          <div>
            <h3 className="text-base font-bold text-[var(--color-text)]">
              Quick Stock Adjustment
            </h3>
            <p className="text-xs text-[#126973] dark:text-[#F1D8C2] font-semibold">
              {item.name} (Current: {Number(item.stock_quantity).toFixed(2)} {item.unit})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSaveAdjustment} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-500">
              Adjustment Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: 'in', label: '📥 Stock In (+)', color: 'border-emerald-500 bg-emerald-500/10 text-emerald-500' },
                { type: 'out', label: '📤 Stock Out (-)', color: 'border-rose-500 bg-rose-500/10 text-rose-500' },
                { type: 'set', label: '🎯 Set Exact', color: 'border-[#126973] bg-[#126973]/10 text-[#126973] dark:text-[#F1D8C2]' },
              ].map((btn) => (
                <button
                  key={btn.type}
                  type="button"
                  onClick={() => setAdjustForm({ ...adjustForm, type: btn.type })}
                  className={`p-2 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                    adjustForm.type === btn.type
                      ? btn.color
                      : 'border-[var(--color-border)] text-slate-500 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-500">
              Quantity ({item.unit}) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="Enter quantity"
              value={adjustForm.quantity}
              onChange={(e) => setAdjustForm({ ...adjustForm, quantity: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border outline-none font-mono font-bold bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text)]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-500">
              Reason / Audit Note
            </label>
            <input
              type="text"
              placeholder="e.g. Received shipment, Kitchen replenishment"
              value={adjustForm.note}
              onChange={(e) => setAdjustForm({ ...adjustForm, note: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border outline-none bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text)]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="secondary" size="md" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" disabled={submitting}>
              {submitting ? 'Applying...' : 'Apply Adjustment'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
