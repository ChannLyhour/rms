import { useState } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import { Warehouse, Plus, AlertTriangle, Search, Pencil, ArrowDownUp, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Inventory() {
  const [ingredients, setIngredients] = useState([
    { id: 1, name: 'Wagyu Beef Patties', unit: 'pcs', stock_quantity: 45, low_stock_threshold: 20, cost_per_unit: 4.50, is_active: true },
    { id: 2, name: 'Brioche Burger Buns', unit: 'pcs', stock_quantity: 60, low_stock_threshold: 30, cost_per_unit: 0.80, is_active: true },
    { id: 3, name: 'Cheddar Cheese Slices', unit: 'pcs', stock_quantity: 120, low_stock_threshold: 40, cost_per_unit: 0.35, is_active: true },
    { id: 4, name: 'Fresh Romaine Lettuce', unit: 'kg', stock_quantity: 4.2, low_stock_threshold: 5.0, cost_per_unit: 2.20, is_active: true },
    { id: 5, name: 'Truffle Aioli Sauce', unit: 'l', stock_quantity: 1.8, low_stock_threshold: 3.0, cost_per_unit: 14.00, is_active: true },
    { id: 6, name: 'French Fries (Frozen)', unit: 'kg', stock_quantity: 28.5, low_stock_threshold: 15.0, cost_per_unit: 1.90, is_active: true },
    { id: 7, name: 'Whole Milk', unit: 'l', stock_quantity: 8.0, low_stock_threshold: 10.0, cost_per_unit: 1.50, is_active: true },
    { id: 8, name: 'Arabica Espresso Beans', unit: 'kg', stock_quantity: 12.0, low_stock_threshold: 4.0, cost_per_unit: 18.50, is_active: true },
  ])

  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ name: '', unit: 'kg', stock_quantity: '', low_stock_threshold: '', cost_per_unit: '' })

  const filtered = ingredients.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
  const lowStockItems = ingredients.filter(i => Number(i.stock_quantity) <= Number(i.low_stock_threshold))

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error('Ingredient name is required')
      return
    }
    const newIng = {
      id: Date.now(),
      name: form.name,
      unit: form.unit,
      stock_quantity: parseFloat(form.stock_quantity) || 0,
      low_stock_threshold: parseFloat(form.low_stock_threshold) || 5,
      cost_per_unit: parseFloat(form.cost_per_unit) || 0,
      is_active: true,
    }
    setIngredients([...ingredients, newIng])
    toast.success('Ingredient stock item added')
    setModal(null)
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5" style={{ borderColor: 'var(--color-border)' }}>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--color-text)' }}>
                Raw Ingredients & Inventory
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                {ingredients.length} Tracked Items
              </span>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
              Real-time stock monitoring, ingredient unit costs, and automated low-stock warnings.
            </p>
          </div>

          <button
            onClick={() => { setForm({ name: '', unit: 'kg', stock_quantity: '', low_stock_threshold: '', cost_per_unit: '' }); setModal(true) }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'linear-gradient(135deg, var(--color-500, #BF4040), var(--color-600, #9D3434))' }}
          >
            <Plus size={14} /> Add Ingredient
          </button>
        </div>

        {/* Low Stock Warning Banner */}
        {lowStockItems.length > 0 && (
          <div
            className="p-4 rounded-2xl border flex items-center justify-between gap-3 shadow-sm"
            style={{
              background: 'rgba(245, 158, 11, 0.08)',
              borderColor: 'rgba(245, 158, 11, 0.3)'
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-500">
                  {lowStockItems.length} Ingredients Below Reorder Threshold
                </p>
                <p className="text-[11px] text-amber-600/90 dark:text-amber-400/80">
                  {lowStockItems.map(i => `${i.name} (${i.stock_quantity} ${i.unit})`).join(', ')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div
          className="flex items-center gap-3 px-4 py-2.5 rounded-2xl border text-sm max-w-md"
          style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
        >
          <Search size={16} style={{ color: 'var(--color-muted)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ingredients by name..."
            className="bg-transparent border-none outline-none w-full text-xs placeholder:text-slate-400"
            style={{ color: 'var(--color-text)' }}
          />
        </div>

        {/* Ingredients Table */}
        <div
          className="rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
                {['Ingredient', 'Unit', 'Stock On Hand', 'Cost / Unit', 'Low Threshold', 'Status'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold" style={{ color: 'var(--color-muted)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--color-border-subtle)' }}>
              {filtered.map(ing => {
                const isLow = Number(ing.stock_quantity) <= Number(ing.low_stock_threshold)

                return (
                  <tr key={ing.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="px-5 py-4 font-semibold" style={{ color: 'var(--color-text)' }}>
                      {ing.name}
                    </td>
                    <td className="px-5 py-4 text-xs uppercase font-mono" style={{ color: 'var(--color-muted)' }}>
                      {ing.unit}
                    </td>
                    <td className="px-5 py-4 text-xs font-mono font-bold" style={{ color: isLow ? '#ef4444' : 'var(--color-text)' }}>
                      {ing.stock_quantity} {ing.unit}
                    </td>
                    <td className="px-5 py-4 text-xs font-mono" style={{ color: 'var(--color-muted)' }}>
                      ${Number(ing.cost_per_unit).toFixed(2)}
                    </td>
                    <td className="px-5 py-4 text-xs font-mono" style={{ color: 'var(--color-muted)' }}>
                      {ing.low_stock_threshold} {ing.unit}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-semibold border inline-flex items-center gap-1 ${
                          isLow
                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        }`}
                      >
                        {isLow ? <AlertTriangle size={11} /> : <CheckCircle2 size={11} />}
                        {isLow ? 'Low Stock' : 'Optimal'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Add Modal */}
        {modal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div
              className="rounded-3xl p-6 w-full max-w-md border shadow-2xl space-y-4"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <div className="border-b pb-3" style={{ borderColor: 'var(--color-border)' }}>
                <h2 className="text-base font-bold" style={{ color: 'var(--color-text)' }}>
                  Add Raw Ingredient
                </h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                  Record stock unit and replenishment alert levels
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                    Ingredient Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    placeholder="e.g. Mozzarella Cheese"
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none"
                    style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                      Measurement Unit
                    </label>
                    <select
                      value={form.unit}
                      onChange={(e) => setForm({ ...form, unit: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none"
                      style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                    >
                      <option value="kg">Kilograms (kg)</option>
                      <option value="g">Grams (g)</option>
                      <option value="l">Liters (l)</option>
                      <option value="ml">Milliliters (ml)</option>
                      <option value="pcs">Pieces / Units (pcs)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                      Cost / Unit ($)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.cost_per_unit}
                      placeholder="0.00"
                      onChange={(e) => setForm({ ...form, cost_per_unit: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none"
                      style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                      Current Stock
                    </label>
                    <input
                      type="number"
                      value={form.stock_quantity}
                      placeholder="0"
                      onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none"
                      style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                      Low Stock Alert
                    </label>
                    <input
                      type="number"
                      value={form.low_stock_threshold}
                      placeholder="5"
                      onChange={(e) => setForm({ ...form, low_stock_threshold: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none"
                      style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={() => setModal(null)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-colors hover:opacity-80"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-95"
                  style={{ background: 'linear-gradient(135deg, var(--color-500, #BF4040), var(--color-600, #9D3434))' }}
                >
                  Save Ingredient
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
