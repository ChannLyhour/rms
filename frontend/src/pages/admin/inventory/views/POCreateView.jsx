import { useState, useMemo, useRef } from 'react'
import { Scrollspy } from '../../../../components/reui/scrollspy'
import {
  ArrowLeft,
  Check,
  Plus,
  Trash2,
  Truck,
  Building2,
  Calendar,
  DollarSign,
  FileText,
  Package,
  Loader2,
  Calculator
} from 'lucide-react'
import toast from 'react-hot-toast'
import { adminApi } from '../../../../api/adminApi'
import { Button } from '../../../../components/common/ButtonComponent'
import { SearchSelection } from '../../../../components/plugin/components/Search-Selection-components'

export default function POCreateView({ suppliers = [], ingredients = [], onClose, onSave }) {
  const [poForm, setPoForm] = useState({
    po_number: `PO-${Date.now().toString().slice(-6)}`,
    supplier_id: suppliers[0] ? String(suppliers[0].id) : '',
    expected_delivery_date: '',
    notes: '',
    shipping_cost: 0,
    tax_amount: 0,
  })

  const [items, setItems] = useState([
    {
      ingredient_id: ingredients[0] ? String(ingredients[0].id) : '',
      quantity_ordered: 10,
      unit_cost: ingredients[0] ? Number(ingredients[0].cost_per_unit) || 0 : 0,
    },
  ])

  const parentRef = useRef(null)
  const [submitting, setSubmitting] = useState(false)

  // Supplier options for SearchSelection
  const supplierOptions = useMemo(() => {
    return suppliers.map((s) => ({
      id: String(s.id),
      value: String(s.id),
      name: s.name,
      label: s.name,
      badge: s.contact_person || 'VENDOR',
      description: s.phone ? `Tel: ${s.phone}` : 'Active Supplier',
    }))
  }, [suppliers])

  // Ingredient options for SearchSelection
  const ingredientOptions = useMemo(() => {
    return ingredients.map((ing) => ({
      id: String(ing.id),
      value: String(ing.id),
      name: ing.name,
      label: `${ing.name} (${ing.unit})`,
      badge: ing.unit.toUpperCase(),
      unit: ing.unit,
      cost_per_unit: Number(ing.cost_per_unit) || 0,
      description: `In Stock: ${ing.stock_quantity} ${ing.unit}`,
    }))
  }, [ingredients])

  const handleAddItem = () => {
    const firstIng = ingredients[0]
    setItems([
      ...items,
      {
        ingredient_id: firstIng ? String(firstIng.id) : '',
        quantity_ordered: 1,
        unit_cost: firstIng ? Number(firstIng.cost_per_unit) || 0 : 0,
      },
    ])
  }

  const handleRemoveItem = (index) => {
    if (items.length <= 1) {
      toast.error('At least one item is required on a Purchase Order')
      return
    }
    setItems(items.filter((_, idx) => idx !== index))
  }

  const handleItemChange = (index, field, value) => {
    const updated = [...items]
    updated[index][field] = value

    if (field === 'ingredient_id') {
      const selectedIng = ingredients.find((i) => String(i.id) === String(value))
      if (selectedIng) {
        updated[index].unit_cost = Number(selectedIng.cost_per_unit) || 0
      }
    }
    setItems(updated)
  }

  // Live Totals Calculations
  const itemsSubtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const q = parseFloat(item.quantity_ordered) || 0
      const c = parseFloat(item.unit_cost) || 0
      return sum + q * c
    }, 0)
  }, [items])

  const shippingCost = parseFloat(poForm.shipping_cost) || 0
  const taxAmount = parseFloat(poForm.tax_amount) || 0
  const grandTotal = itemsSubtotal + shippingCost + taxAmount

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    if (!poForm.supplier_id) {
      toast.error('Please select a supplier')
      const el = document.getElementById('general')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }

    const validItems = items.filter(
      (i) => i.ingredient_id && parseFloat(i.quantity_ordered) > 0
    )
    if (validItems.length === 0) {
      toast.error('Please provide at least one valid line item with quantity > 0')
      const el = document.getElementById('items')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }

    const payload = {
      po_number: poForm.po_number || `PO-${Date.now().toString().slice(-6)}`,
      supplier_id: poForm.supplier_id,
      status: 'draft',
      total_amount: grandTotal,
      expected_delivery_date: poForm.expected_delivery_date || undefined,
      notes: poForm.notes || undefined,
      items: validItems.map((i) => ({
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

  const tabs = [
    { id: 'general', label: 'PO Details & Vendor' },
    { id: 'items', label: 'Inbound Line Items' },
    { id: 'delivery', label: 'Delivery & Notes' },
    { id: 'summary', label: 'Financial Summary' },
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
          iconLeading={submitting ? Loader2 : Check}
          disabled={submitting}
          className="shadow-sm"
        >
          {submitting ? 'Creating PO...' : 'Create Purchase Order'}
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
                New Inbound Purchase Order
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                Draft Status
              </span>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
              Procure stock and replenishment ingredients directly from registered distributors and suppliers.
            </p>
          </div>

          {/* Grand Total Live Badge */}
          <div
            className="p-3.5 rounded-[5px] border flex items-center gap-3 shrink-0"
            style={{
              background: 'var(--color-bg)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="w-9 h-9 rounded-lg bg-[#126973]/15 flex items-center justify-center text-[#126973] dark:text-[#F1D8C2]">
              <Truck size={18} />
            </div>
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)]">
                Order Grand Total
              </span>
              <span className="text-base font-extrabold font-mono text-[#126973] dark:text-[#F1D8C2]">
                ${grandTotal.toFixed(2)}
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
              {/* ── TAB 1: General & Vendor ──────────────────────────── */}
              <div id="general" className="space-y-2.5 scroll-mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    PO Details &amp; Vendor Selection
                  </h3>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#126973]/10 text-[#126973] dark:text-[#F1D8C2]">
                    Header Info
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
                        PO Tracking Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={poForm.po_number}
                        onChange={(e) => setPoForm({ ...poForm, po_number: e.target.value })}
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
                        Supplier / Vendor *
                      </label>
                      <SearchSelection
                        name="supplier_id"
                        options={supplierOptions}
                        valueKey="id"
                        labelKey="name"
                        value={poForm.supplier_id}
                        autoSelect={false}
                        onChange={(val) => setPoForm({ ...poForm, supplier_id: val })}
                        placeholder="Select Supplier..."
                        searchPlaceholder="Search vendor..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── TAB 2: Inbound Items ──────────────────────────── */}
              <div id="items" className="space-y-2.5 scroll-mt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      Inbound Line Items
                    </h3>
                    <p className="text-xs mt-0.5 text-[var(--color-muted)]">
                      Add ingredients, unit purchasing prices and quantities.
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleAddItem}
                    iconLeading={Plus}
                  >
                    Add Ingredient
                  </Button>
                </div>

                <div
                  className="rounded-[5px] p-4 sm:p-5 space-y-3 border overflow-hidden"
                  style={{
                    background: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  {items.map((item, idx) => {
                    const rowQty = parseFloat(item.quantity_ordered) || 0
                    const rowCost = parseFloat(item.unit_cost) || 0
                    const rowSubtotal = rowQty * rowCost
                    const matchedIng = ingredients.find((i) => String(i.id) === String(item.ingredient_id))

                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-[5px] border space-y-3"
                        style={{
                          background: 'var(--color-bg)',
                          borderColor: 'var(--color-border)',
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#126973] dark:text-[#F1D8C2]">
                            Line Item #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1 rounded-md text-red-500 hover:bg-red-500/10 transition-colors"
                            title="Remove Line Item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                          <div className="sm:col-span-6">
                            <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 text-[var(--color-muted)]">
                              Ingredient *
                            </label>
                            <SearchSelection
                              name={`ing_${idx}`}
                              options={ingredientOptions}
                              valueKey="id"
                              labelKey="label"
                              value={String(item.ingredient_id)}
                              autoSelect={false}
                              onChange={(val) => handleItemChange(idx, 'ingredient_id', val)}
                              placeholder="Choose Ingredient..."
                              searchPlaceholder="Search ingredient..."
                            />
                          </div>

                          <div className="sm:col-span-3">
                            <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 text-[var(--color-muted)]">
                              Quantity ({matchedIng?.unit || 'unit'})
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0.01"
                              value={item.quantity_ordered}
                              onChange={(e) => handleItemChange(idx, 'quantity_ordered', e.target.value)}
                              className="w-full px-3 py-2 text-xs rounded-[5px] border outline-none font-mono font-bold"
                              style={{
                                background: 'var(--color-surface)',
                                borderColor: 'var(--color-border)',
                                color: 'var(--color-text)',
                              }}
                            />
                          </div>

                          <div className="sm:col-span-3">
                            <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 text-[var(--color-muted)]">
                              Unit Cost ($)
                            </label>
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold font-mono">
                                $
                              </span>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={item.unit_cost}
                                onChange={(e) => handleItemChange(idx, 'unit_cost', e.target.value)}
                                className="w-full pl-6 pr-3 py-2 text-xs rounded-[5px] border outline-none font-mono font-bold"
                                style={{
                                  background: 'var(--color-surface)',
                                  borderColor: 'var(--color-border)',
                                  color: 'var(--color-text)',
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="pt-1 flex items-center justify-between text-xs border-t border-[var(--color-border)]/50">
                          <span className="text-[var(--color-muted)]">
                            Line Subtotal:
                          </span>
                          <span className="font-mono font-extrabold text-slate-900 dark:text-slate-100">
                            ${rowSubtotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* ── TAB 3: Delivery & Notes ──────────────────────────── */}
              <div id="delivery" className="space-y-2.5 scroll-mt-6">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Delivery Schedule &amp; Order Notes
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
                        Expected Delivery Date
                      </label>
                      <input
                        type="date"
                        value={poForm.expected_delivery_date}
                        onChange={(e) => setPoForm({ ...poForm, expected_delivery_date: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs rounded-[5px] border outline-none font-medium transition-all"
                        style={{
                          background: 'var(--color-bg)',
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-text)',
                        }}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                        Special Instructions / Receiving Notes
                      </label>
                      <textarea
                        rows={3}
                        placeholder="e.g. Inbound shipment through rear loading dock #3. Inspect temperature upon delivery."
                        value={poForm.notes}
                        onChange={(e) => setPoForm({ ...poForm, notes: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs rounded-[5px] border outline-none font-medium transition-all"
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

              {/* ── TAB 4: Financial Summary ──────────────────────────── */}
              <div id="summary" className="space-y-2.5 scroll-mt-6">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Grand Total &amp; Valuation Breakdown
                </h3>

                <div
                  className="rounded-[5px] p-6 sm:p-7 space-y-4 border"
                  style={{
                    background: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--color-muted)]">Items Subtotal ({items.length} lines)</span>
                    <span className="font-mono font-bold text-[var(--color-text)]">${itemsSubtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--color-muted)]">Freight / Delivery Fee ($)</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={poForm.shipping_cost}
                      onChange={(e) => setPoForm({ ...poForm, shipping_cost: e.target.value })}
                      className="w-28 px-2 py-1 text-right text-xs rounded border outline-none font-mono font-bold"
                      style={{
                        background: 'var(--color-bg)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text)',
                      }}
                    />
                  </div>

                  <div className="border-t pt-3 flex items-center justify-between text-sm" style={{ borderColor: 'var(--color-border)' }}>
                    <span className="font-extrabold text-[var(--color-text)]">Total Purchase Commitment</span>
                    <span className="font-extrabold font-mono text-lg text-[#126973] dark:text-[#F1D8C2]">
                      ${grandTotal.toFixed(2)}
                    </span>
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
