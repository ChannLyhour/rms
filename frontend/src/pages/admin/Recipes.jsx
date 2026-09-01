import { useState } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import { ChefHat, Plus, Layers, Sparkles, Trash2, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Recipes() {
  const [recipes, setRecipes] = useState([
    {
      id: 1,
      productName: 'Classic Wagyu Burger',
      ingredients: [
        { name: 'Wagyu Beef Patties', qty: 1, unit: 'pcs', cost: 4.50 },
        { name: 'Brioche Burger Buns', qty: 1, unit: 'pcs', cost: 0.80 },
        { name: 'Cheddar Cheese Slices', qty: 1, unit: 'pcs', cost: 0.35 },
        { name: 'Fresh Romaine Lettuce', qty: 0.05, unit: 'kg', cost: 0.11 },
        { name: 'Truffle Aioli Sauce', qty: 0.02, unit: 'l', cost: 0.28 },
      ]
    },
    {
      id: 2,
      productName: 'Truffle French Fries',
      ingredients: [
        { name: 'French Fries (Frozen)', qty: 0.25, unit: 'kg', cost: 0.48 },
        { name: 'Truffle Aioli Sauce', qty: 0.03, unit: 'l', cost: 0.42 },
      ]
    },
    {
      id: 3,
      productName: 'Iced Caramel Latte',
      ingredients: [
        { name: 'Arabica Espresso Beans', qty: 0.018, unit: 'kg', cost: 0.33 },
        { name: 'Whole Milk', qty: 0.18, unit: 'l', cost: 0.27 },
      ]
    }
  ])

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5" style={{ borderColor: 'var(--color-border)' }}>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--color-text)' }}>
                Recipe & Portion Formulas
              </h1>
             
            </div>
           
          </div>
        </div>

        {/* Recipe Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {recipes.map((rcp) => {
            const totalEstimatedCost = rcp.ingredients.reduce((acc, i) => acc + (i.cost || 0), 0)

            return (
              <div
                key={rcp.id}
                className="rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all space-y-4"
                style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
              >
                <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--color-border-subtle)' }}>
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm shrink-0"
                      style={{ background: 'linear-gradient(135deg, var(--color-500, #BF4040), var(--color-700, #8A2E2E))' }}
                    >
                      <ChefHat size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>
                        {rcp.productName}
                      </h3>
                      <span className="text-[11px]" style={{ color: 'var(--color-muted)' }}>
                        {rcp.ingredients.length} required ingredients
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold block" style={{ color: 'var(--color-muted)' }}>
                      Estimated Food Cost
                    </span>
                    <span className="text-sm font-mono font-extrabold text-emerald-500">
                      ${totalEstimatedCost.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Ingredients Breakdown */}
                <div className="space-y-2">
                  {rcp.ingredients.map((ing, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-xl text-xs border"
                      style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        <span className="font-medium" style={{ color: 'var(--color-text)' }}>{ing.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-semibold" style={{ color: 'var(--color-muted)' }}>
                          {ing.qty} {ing.unit}
                        </span>
                        <span className="font-mono text-emerald-500 font-medium text-[11px]">
                          ${Number(ing.cost).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </AdminLayout>
  )
}
