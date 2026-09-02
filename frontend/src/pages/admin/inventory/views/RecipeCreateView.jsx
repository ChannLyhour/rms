import { useState, useMemo, useRef } from 'react'
import { Scrollspy } from '../../../../components/reui/scrollspy'
import {
  ArrowLeft,
  Check,
  ChefHat,
  DollarSign,
  Package,
  Layers,
  Sparkles,
  PieChart,
  Percent,
  Scale,
  Loader2,
  Utensils
} from 'lucide-react'
import toast from 'react-hot-toast'
import { adminApi } from '../../../../api/adminApi'
import { Button } from '../../../../components/common/ButtonComponent'
import { SearchSelection } from '../../../../components/plugin/components/Search-Selection-components'

export default function RecipeCreateView({ products = [], ingredients = [], onClose, onSave }) {
  const [formData, setFormData] = useState({
    product_id: products[0] ? String(products[0].id) : '',
    ingredient_id: ingredients[0] ? String(ingredients[0].id) : '',
    quantity_required: '',
  })

  const parentRef = useRef(null)
  const [submitting, setSubmitting] = useState(false)

  // Dish options for SearchSelection
  const productOptions = useMemo(() => {
    return products.map((p) => ({
      id: String(p.id),
      value: String(p.id),
      name: p.name,
      label: p.name,
      badge: `$${Number(p.price).toFixed(2)}`,
      price: Number(p.price) || 0,
      description: p.category?.name || 'Menu Dish',
    }))
  }, [products])

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

  const selectedProduct = products.find((p) => String(p.id) === String(formData.product_id))
  const selectedIngredient = ingredients.find((i) => String(i.id) === String(formData.ingredient_id))

  const qty = parseFloat(formData.quantity_required) || 0
  const unitCost = selectedIngredient ? Number(selectedIngredient.cost_per_unit) || 0 : 0
  const estimatedCost = qty * unitCost
  const dishPrice = selectedProduct ? Number(selectedProduct.price) || 0 : 0
  const foodCostPct = dishPrice > 0 ? ((estimatedCost / dishPrice) * 100).toFixed(1) : '0.0'
  const grossMargin = dishPrice - estimatedCost

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    if (!formData.product_id || !formData.ingredient_id) {
      toast.error('Please select both Menu Item and Ingredient')
      return
    }
    if (qty <= 0) {
      toast.error('Required portion quantity must be greater than 0')
      const el = document.getElementById('ingredient')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
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

  const tabs = [
    { id: 'dish', label: 'Dish Selection' },
    { id: 'ingredient', label: 'Portion & Formula' },
    { id: 'analysis', label: 'Food Cost Analysis' },
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
          {submitting ? 'Mapping...' : 'Link Recipe Ingredient'}
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
                Map Recipe Bill of Materials (BOM)
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#126973]/15 text-[#126973] dark:text-[#F1D8C2] border border-[#126973]/30">
                Auto Stock Deduct
              </span>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
              Link menu products to raw ingredients so whenever a customer orders, inventory is deducted in real-time.
            </p>
          </div>

          {/* Food Cost Margin Chip */}
          <div
            className="p-3.5 rounded-[5px] border flex items-center gap-3 shrink-0"
            style={{
              background: 'var(--color-bg)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="w-9 h-9 rounded-lg bg-[#126973]/15 flex items-center justify-center text-[#126973] dark:text-[#F1D8C2]">
              <ChefHat size={18} />
            </div>
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)]">
                Portion Cost Ratio
              </span>
              <span className="text-base font-extrabold font-mono text-[#126973] dark:text-[#F1D8C2]">
                {foodCostPct}% of Dish Price
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
              {/* ── TAB 1: Dish Selection ──────────────────────────── */}
              <div id="dish" className="space-y-2.5 scroll-mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    Menu Dish Selection
                  </h3>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#126973]/10 text-[#126973] dark:text-[#F1D8C2]">
                    Target Item
                  </span>
                </div>

                <div
                  className="rounded-[5px] p-6 sm:p-7 space-y-5 border"
                  style={{
                    background: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                      Select Menu Product *
                    </label>
                    <SearchSelection
                      name="product_id"
                      options={productOptions}
                      valueKey="id"
                      labelKey="name"
                      value={formData.product_id}
                      autoSelect={false}
                      onChange={(val) => setFormData({ ...formData, product_id: val })}
                      placeholder="Choose Menu Product..."
                      searchPlaceholder="Search dish by name..."
                    />
                  </div>

                  {selectedProduct && (
                    <div
                      className="p-3.5 rounded-[5px] border flex items-center justify-between"
                      style={{
                        background: 'var(--color-bg)',
                        borderColor: 'var(--color-border)',
                      }}
                    >
                      <div>
                        <span className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>
                          {selectedProduct.name}
                        </span>
                        <span className="block text-[11px]" style={{ color: 'var(--color-muted)' }}>
                          Category: {selectedProduct.category?.name || 'General'}
                        </span>
                      </div>
                      <span className="text-sm font-extrabold font-mono text-[#126973] dark:text-[#F1D8C2]">
                        Selling Price: ${dishPrice.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* ── TAB 2: Portion & Formula ──────────────────────────── */}
              <div id="ingredient" className="space-y-2.5 scroll-mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    Portion Formula &amp; Required Raw Quantity
                  </h3>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    Ingredient Specification
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
                        Raw Ingredient *
                      </label>
                      <SearchSelection
                        name="ingredient_id"
                        options={ingredientOptions}
                        valueKey="id"
                        labelKey="label"
                        value={formData.ingredient_id}
                        autoSelect={false}
                        onChange={(val) => setFormData({ ...formData, ingredient_id: val })}
                        placeholder="Choose Ingredient..."
                        searchPlaceholder="Search ingredient..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                        Portion Quantity per Dish ({selectedIngredient?.unit || 'unit'}) *
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.001"
                          min="0.001"
                          required
                          placeholder="e.g. 0.250 for 250g"
                          value={formData.quantity_required}
                          onChange={(e) => setFormData({ ...formData, quantity_required: e.target.value })}
                          className="w-full px-3.5 py-2.5 text-xs rounded-[5px] border outline-none font-mono font-bold"
                          style={{
                            background: 'var(--color-bg)',
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-text)',
                          }}
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                          {selectedIngredient?.unit || 'unit'}
                        </span>
                      </div>
                      <p className="text-[11px] mt-1" style={{ color: 'var(--color-muted)' }}>
                        Deducted from stock each time this dish is sold.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── TAB 3: Food Cost Analysis ──────────────────────────── */}
              <div id="analysis" className="space-y-2.5 scroll-mt-6">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Cost Breakdown &amp; Margin Simulation
                </h3>

                <div
                  className="rounded-[5px] p-6 sm:p-7 space-y-4 border"
                  style={{
                    background: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-3.5 rounded-[5px] border" style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)]">
                        Raw Ingredient Cost
                      </span>
                      <span className="text-base font-extrabold font-mono text-slate-900 dark:text-slate-100">
                        ${estimatedCost.toFixed(2)}
                      </span>
                      <span className="block text-[10px] text-[var(--color-muted)] mt-0.5">
                        {qty} {selectedIngredient?.unit} × ${unitCost.toFixed(2)}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-[5px] border" style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)]">
                        Dish Selling Price
                      </span>
                      <span className="text-base font-extrabold font-mono text-[#126973] dark:text-[#F1D8C2]">
                        ${dishPrice.toFixed(2)}
                      </span>
                      <span className="block text-[10px] text-[var(--color-muted)] mt-0.5">
                        POS Menu Price
                      </span>
                    </div>

                    <div className="p-3.5 rounded-[5px] border" style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)]">
                        Portion COGS Ratio
                      </span>
                      <span className={`text-base font-extrabold font-mono ${parseFloat(foodCostPct) > 40 ? 'text-red-500' : 'text-emerald-500'}`}>
                        {foodCostPct}%
                      </span>
                      <span className="block text-[10px] text-[var(--color-muted)] mt-0.5">
                        {parseFloat(foodCostPct) <= 30 ? 'Excellent margin' : 'Review portion size'}
                      </span>
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
