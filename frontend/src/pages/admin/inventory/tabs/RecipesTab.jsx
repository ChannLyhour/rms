import { useState, useMemo } from 'react'
import {
  SearchLg,
  Plus,
  Trash01,
} from '@untitledui/icons'
import {
  ChefHat,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { adminApi } from '../../../../api/adminApi'

export default function RecipesTab({
  recipes = [],
  products = [],
  ingredients = [],
  loading = false,
  onRefresh,
  onOpenCreate,
}) {
  const [search, setSearch] = useState('')
  const [selectedProductId, setSelectedProductId] = useState('all')

  // Group recipes by product
  const groupedRecipes = useMemo(() => {
    const map = new Map()

    products.forEach((p) => {
      map.set(p.id, {
        product: p,
        items: [],
      })
    })

    recipes.forEach((r) => {
      if (r.product_id && map.has(r.product_id)) {
        map.get(r.product_id).items.push(r)
      }
    })

    return Array.from(map.values()).filter(({ product, items }) => {
      const matchProduct = selectedProductId === 'all' || String(product.id) === String(selectedProductId)
      const matchSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
        items.some((i) => i.ingredient?.name?.toLowerCase().includes(search.toLowerCase()))
      return matchProduct && matchSearch
    })
  }, [products, recipes, search, selectedProductId])

  const handleDeleteRecipeItem = async (id) => {
    if (!confirm('Remove this ingredient from dish recipe?')) return
    try {
      await adminApi.deleteRecipe(id)
      toast.success('Ingredient removed from recipe')
      onRefresh()
    } catch (err) {
      toast.error('Failed to remove recipe item')
    }
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* ── Search & Filter ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs min-w-[240px] max-w-sm shadow-2xs"
          style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
        >
          <SearchLg size={15} className="text-slate-400 shrink-0 stroke-[2px]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product recipes..."
            className="bg-transparent border-none outline-none w-full text-xs text-[var(--color-text)] placeholder:text-slate-400"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="text-[11px] font-medium text-slate-400 hover:text-rose-500 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Filter Dish:</span>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border outline-none bg-[var(--color-card)] border-[var(--color-border)] text-[var(--color-text)] cursor-pointer max-w-xs truncate"
          >
            <option value="all">All Menu Dishes</option>
            {products.map((p) => (
              <option key={p.id} value={String(p.id)}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Recipe Cards Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {groupedRecipes.map(({ product, items }) => {
          const totalEstimatedCost = items.reduce((sum, r) => {
            const ingCost = r.ingredient ? Number(r.ingredient.cost_per_unit) : 0
            return sum + (Number(r.quantity_required) * ingCost)
          }, 0)

          const price = Number(product.price) || 0
          const foodCostPct = price > 0 ? ((totalEstimatedCost / price) * 100).toFixed(1) : 0

          return (
            <div
              key={product.id}
              className="rounded-2xl border p-5 space-y-4 shadow-2xs transition-all hover:border-[#126973]/40"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              {/* Dish Header */}
              <div className="flex items-start justify-between gap-3 border-b pb-3.5 border-[var(--color-border)]">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#126973]/10 dark:bg-[#126973]/25 border border-[#126973]/20 dark:border-[#F1D8C2]/30 flex items-center justify-center font-bold text-sm text-[#126973] dark:text-[#F1D8C2] shrink-0">
                    <ChefHat size={20} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-[var(--color-text)] truncate">
                      {product.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Price: ${price.toFixed(2)} · {product.category?.name || 'Menu Item'}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10.5px] uppercase font-bold text-slate-400">Recipe Cost:</span>
                  <p className="text-sm font-extrabold text-emerald-500 font-mono">
                    ${totalEstimatedCost.toFixed(2)}{' '}
                    <span className="text-[10.5px] font-semibold text-slate-400 font-sans">
                      ({foodCostPct}% Cost)
                    </span>
                  </p>
                </div>
              </div>

              {/* Ingredients List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                  <span>Ingredient</span>
                  <span>Portion & Cost</span>
                </div>

                {items.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-[var(--color-border)] text-center text-xs text-slate-400">
                    No ingredients linked yet. Click &quot;Add Ingredient&quot; below.
                  </div>
                ) : (
                  <div className="space-y-1.5 font-mono text-xs">
                    {items.map((r) => {
                      const ing = r.ingredient
                      const unitCost = ing ? Number(ing.cost_per_unit) : 0
                      const subtotal = Number(r.quantity_required) * unitCost

                      return (
                        <div
                          key={r.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] group"
                        >
                          <div className="flex items-center gap-2 min-w-0 font-sans">
                            <span className="w-2 h-2 rounded-full bg-[#126973] dark:bg-[#F1D8C2]" />
                            <span className="font-semibold text-xs text-[var(--color-text)] truncate">
                              {ing?.name || `Ingredient #${r.ingredient_id}`}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-slate-500 dark:text-slate-400">
                              {Number(r.quantity_required).toFixed(3)} {ing?.unit || 'unit'}
                            </span>
                            <span className="font-bold text-emerald-500 w-14 text-right">
                              ${subtotal.toFixed(2)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteRecipeItem(r.id)}
                              className="p-1 rounded text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              title="Remove"
                            >
                              <Trash01 size={13} />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Quick Add Ingredient to this dish */}
              <button
                type="button"
                onClick={() => onOpenCreate(product)}
                className="w-full py-1.5 rounded-lg border border-dashed border-[#126973]/30 text-[#126973] dark:text-[#F1D8C2] hover:bg-[#126973]/10 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus size={13} />
                <span>Add Ingredient to {product.name}</span>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
