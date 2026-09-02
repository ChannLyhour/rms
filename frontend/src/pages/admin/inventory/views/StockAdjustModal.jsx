import { useState } from 'react'
import { X, ArrowDown, ArrowUp, ArrowDownUp, Loader2 } from 'lucide-react'
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

  const currentStock = Number(item.stock_quantity) || 0
  const qty = parseFloat(adjustForm.quantity) || 0

  let projectedStock = currentStock
  if (adjustForm.type === 'in') {
    projectedStock = currentStock + qty
  } else if (adjustForm.type === 'out') {
    projectedStock = Math.max(0, currentStock - qty)
  } else if (adjustForm.type === 'set') {
    projectedStock = qty
  }

  const handleSaveAdjustment = async (e) => {
    if (e) e.preventDefault()
    if (isNaN(qty) || qty <= 0) {
      toast.error('Please enter a valid quantity greater than 0')
      return
    }

    setSubmitting(true)
    try {
      await adminApi.updateIngredient(item.id, {
        ...item,
        stock_quantity: projectedStock,
      })
      toast.success(`Stock adjusted for ${item.name} (${projectedStock} ${item.unit})`)
      onSave()
      onClose()
    } catch (err) {
      toast.error('Failed to adjust stock')
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
            <h3 className="font-extrabold text-base" style={{ color: 'var(--color-text)' }}>
              Quick Stock Adjustment
            </h3>
            <p className="text-xs mt-0.5 text-[#126973] dark:text-[#F1D8C2] font-semibold">
              {item.name} (On Hand: {currentStock.toFixed(2)} {item.unit})
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

        <form onSubmit={handleSaveAdjustment} className="p-6 space-y-4">
          {/* Segmented Type Switcher */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
              Adjustment Action
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: 'in', label: '📥 Add Stock (+)', color: 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
                { type: 'out', label: '📤 Deduct (-)', color: 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400' },
                { type: 'set', label: '🎯 Set Exact (=)', color: 'border-[#126973] bg-[#126973]/10 text-[#126973] dark:text-[#F1D8C2]' },
              ].map((btn) => (
                <button
                  key={btn.type}
                  type="button"
                  onClick={() => setAdjustForm({ ...adjustForm, type: btn.type })}
                  className={`py-2 px-1 rounded-[5px] border text-xs font-bold transition-all cursor-pointer ${
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
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
              Adjustment Quantity ({item.unit}) *
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={adjustForm.quantity}
                onChange={(e) => setAdjustForm({ ...adjustForm, quantity: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-[5px] border outline-none font-mono font-bold"
                style={{
                  background: 'var(--color-bg)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                }}
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                {item.unit}
              </span>
            </div>
          </div>

          {/* Live Result Preview */}
          <div
            className="p-3.5 rounded-[5px] border flex items-center justify-between"
            style={{
              background: 'var(--color-bg)',
              borderColor: 'var(--color-border)',
            }}
          >
            <span className="text-xs text-[var(--color-muted)]">New Balance after Update:</span>
            <span className="text-sm font-extrabold font-mono text-[#126973] dark:text-[#F1D8C2]">
              {projectedStock.toFixed(2)} {item.unit}
            </span>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-[5px] text-xs font-bold text-white shadow-sm transition-all hover:opacity-90 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, var(--color-500, #126973), #0a4249)',
              }}
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              <span>{submitting ? 'Applying...' : 'Apply Stock Adjustment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
