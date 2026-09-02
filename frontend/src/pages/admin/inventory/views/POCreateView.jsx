import { useState } from 'react'
import {
  X,
  Truck,
  Plus,
  Trash2,
  ArrowLeft,
  DollarSign,
  FileText,
  Calendar
} from 'lucide-react'
import toast from 'react-hot-toast'
import { adminApi } from '../../../../api/adminApi'
import { Button } from '../../../../components/common/ButtonComponent'

export default function POCreateView({ suppliers = [], ingredients = [], onClose, onSave }) {
  const [poForm, setPOForm] = useState({
    po_number: `PO-${Date.now().toString().slice(-6)}`,
    supplier_id: suppliers[0] ? String(suppliers[0].id) : '',
    expected_delivery_date: new Date().toISOString().split('T')[0],
    notes: '',
    items: [
      {
        ingredient_id: ingredients[0] ? String(ingredients[0].id) : '',
        quantity_ordered: 10,
        unit_cost: ingredients[0]?.cost_per_unit || 0
      }
    ],
  })
  const [submitting, setSubmitting] = useState(false)

  const handleAddItem = () => {
    setPOForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          ingredient_id: ingredients[0] ? String(ingredients[0].id) : '',
          quantity_ordered: 1,
          unit_cost: ingredients[0]?.cost_per_unit || 0,
        },
      ],
    }))
  }

  const handleRemoveItem = (index) => {
    const updated = poForm.items.filter((_, i) => i !== index)
    setPOForm((prev) => ({
      ...prev,
      items: updated.length > 0 ? updated : [{ ingredient_id: '', quantity_ordered: 1, unit_cost: 0 }],
    }))
  }

  const handleItemChange = (index, field, value) => {
    const updated = [...poForm.items]
    updated[index][field] = value

    if (field === 'ingredient_id') {
      const ing = ingredients.find(i => String(i.id) === String(value))
      if (ing) updated[index].unit_cost = Number(ing.cost_per_unit) || 0
    }

    setPOForm((prev) => ({ ...prev, items: updated }))
  }

  const totalAmount = poForm.items.reduce((sum, item) => {
    return sum + ((Number(item.quantity_ordered) || 0) * (Number(item.unit_cost) || 0))
  }, 0)

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    if (!poForm.supplier_id) {
      toast.error('Please select a supplier')
      return
    }

    const validItems = poForm.items.filter(i => i.ingredient_id && Number(i.quantity_ordered) > 0)
    if (validItems.length === 0) {
      toast.error('Please add at least 1 ingredient item with quantity')
      return
    }

    const payload = {
      po_number: poForm.po_number || `PO-${Date.now().toString().slice(-6)}`,
      supplier_id: poForm.supplier_id,
      status: 'draft',
      total_amount: totalAmount,
      expected_delivery_date: poForm.expected_delivery_date || undefined,
      notes: poForm.notes || undefined,
      items: validItems.map(i => ({
        ingredient_id: i.ingredient_id,
        quantity_ordered: Number(i.quantity_ordered),
        unit_cost: Number(i.unit_cost),
        subtotal: Number(i.quantity_ordered) * Number(i.unit_cost),
      })),
    }

    setSubmitting(true)
    try {
      await adminApi.createPurchaseOrder(payload)
      toast.success('Purchase Order created successfully')
      onSave()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create purchase order')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
      {/* Top Header */}
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
              <span>Create Purchase Order (PO)</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#126973]/20 text-[#126973] dark:text-[#F1D8C2] font-mono">
                {poForm.po_number}
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Draft a new inbound order to restock raw ingredients and track supplier delivery dates.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="md" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" size="md" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Creating...' : 'Issue Purchase Order'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        {/* Order Details Header */}
        <div className="p-5 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] space-y-4 shadow-2xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#126973] dark:text-[#F1D8C2] flex items-center gap-2">
            <Truck size={14} />
            <span>Order &amp; Vendor Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-500">
                PO Number
              </label>
              <input
                type="text"
                value={poForm.po_number}
                onChange={(e) => setPOForm({ ...poForm, po_number: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border outline-none font-mono font-bold bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text)]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-500">
                Supplier / Vendor *
              </label>
              <select
                value={poForm.supplier_id}
                onChange={(e) => setPOForm({ ...poForm, supplier_id: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border outline-none font-bold bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text)] cursor-pointer"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={String(s.id)}>
                    {s.name} {s.contact_person ? `(${s.contact_person})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-500">
                Expected Delivery Date
              </label>
              <input
                type="date"
                value={poForm.expected_delivery_date}
                onChange={(e) => setPOForm({ ...poForm, expected_delivery_date: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border outline-none font-mono bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text)] cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-500">
              Order Notes / Delivery Instructions
            </label>
            <input
              type="text"
              placeholder="e.g. Please deliver to Kitchen Back Entrance before 9 AM"
              value={poForm.notes}
              onChange={(e) => setPOForm({ ...poForm, notes: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border outline-none bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text)]"
            />
          </div>
        </div>

        {/* Line Items */}
        <div className="p-5 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#126973] dark:text-[#F1D8C2] flex items-center gap-2">
              <FileText size={14} />
              <span>Inbound Line Items ({poForm.items.length})</span>
            </h3>

            <button
              type="button"
              onClick={handleAddItem}
              className="text-xs font-bold text-[#126973] dark:text-[#F1D8C2] hover:underline cursor-pointer flex items-center gap-1"
            >
              <Plus size={14} /> Add Ingredient Line
            </button>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-2 text-[10.5px] font-bold uppercase tracking-wider text-slate-400 px-2">
              <span className="col-span-5">Ingredient</span>
              <span className="col-span-3">Order Quantity</span>
              <span className="col-span-3">Unit Cost ($)</span>
              <span className="col-span-1 text-right">Del</span>
            </div>

            {poForm.items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center p-2.5 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                <div className="col-span-5">
                  <select
                    value={item.ingredient_id}
                    onChange={(e) => handleItemChange(idx, 'ingredient_id', e.target.value)}
                    className="w-full px-2.5 py-2 text-xs rounded-lg border outline-none font-bold bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text)] truncate"
                  >
                    {ingredients.map((ing) => (
                      <option key={ing.id} value={String(ing.id)}>
                        {ing.name} ({ing.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-3">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Qty"
                    value={item.quantity_ordered}
                    onChange={(e) => handleItemChange(idx, 'quantity_ordered', e.target.value)}
                    className="w-full px-2.5 py-2 text-xs rounded-lg border outline-none font-mono font-bold bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text)]"
                  />
                </div>

                <div className="col-span-3">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Cost"
                    value={item.unit_cost}
                    onChange={(e) => handleItemChange(idx, 'unit_cost', e.target.value)}
                    className="w-full px-2.5 py-2 text-xs rounded-lg border outline-none font-mono font-bold bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text)]"
                  />
                </div>

                <div className="col-span-1 text-right">
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* PO Grand Total Preview */}
          <div className="p-4 rounded-xl bg-[#126973]/10 border border-[#126973]/30 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-bold uppercase tracking-wider">
              Total PO Grand Total:
            </span>
            <span className="font-mono font-extrabold text-base text-emerald-500">
              ${totalAmount.toFixed(2)} USD
            </span>
          </div>
        </div>
      </form>
    </div>
  )
}
