import { useState, useMemo } from 'react'
import {
  TableCard,
  Table,
  BadgeWithIcon,
  PaginationPageMinimalCenter,
} from '../../../../components/TablesComponents'
import {
  SearchLg,
  Plus,
  Edit01,
  Trash01,
  Check,
  AlertTriangle,
} from '@untitledui/icons'
import {
  Package,
  ShoppingBag,
  ArrowDownUp,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { adminApi } from '../../../../api/adminApi'
import StockAdjustModal from '../views/StockAdjustModal'

export default function IngredientsTab({
  ingredients = [],
  loading = false,
  onRefresh,
  onOpenCreate,
  onOpenEdit,
}) {
  const [search, setSearch] = useState('')
  const [unitFilter, setUnitFilter] = useState('all')
  const [showLowStockOnly, setShowLowStockOnly] = useState(false)
  const [page, setPage] = useState(1)
  const pageSize = 10

  const [sortDescriptor, setSortDescriptor] = useState({
    column: 'name',
    direction: 'ascending',
  })

  // Quick Adjustment Modal state
  const [adjustTarget, setAdjustTarget] = useState(null)

  // Metrics
  const metrics = useMemo(() => {
    const totalItems = ingredients.length
    const lowStockCount = ingredients.filter(i => Number(i.stock_quantity) <= Number(i.low_stock_threshold)).length
    const totalValue = ingredients.reduce((sum, i) => sum + (Number(i.stock_quantity) * Number(i.cost_per_unit) || 0), 0)
    return { totalItems, lowStockCount, totalValue }
  }, [ingredients])

  // Filtered & Sorted List
  const filteredList = useMemo(() => {
    return ingredients.filter((item) => {
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.unit.toLowerCase().includes(search.toLowerCase())
      const matchUnit = unitFilter === 'all' || item.unit === unitFilter
      const isLow = Number(item.stock_quantity) <= Number(item.low_stock_threshold)
      const matchLowStock = !showLowStockOnly || isLow

      return matchSearch && matchUnit && matchLowStock
    })
  }, [ingredients, search, unitFilter, showLowStockOnly])

  const sortedList = useMemo(() => {
    return [...filteredList].sort((a, b) => {
      let first = a[sortDescriptor.column]
      let second = b[sortDescriptor.column]

      if (sortDescriptor.column === 'stock_quantity' || sortDescriptor.column === 'cost_per_unit') {
        first = Number(first) || 0
        second = Number(second) || 0
      }

      if (typeof first === 'number' && typeof second === 'number') {
        return sortDescriptor.direction === 'descending' ? second - first : first - second
      }
      if (typeof first === 'string' && typeof second === 'string') {
        const cmp = first.localeCompare(second)
        return sortDescriptor.direction === 'descending' ? -cmp : cmp
      }
      return 0
    })
  }, [filteredList, sortDescriptor])

  const totalPages = Math.ceil(sortedList.length / pageSize) || 1
  const paginatedList = sortedList.slice((page - 1) * pageSize, page * pageSize)

  const handleSort = (columnId) => {
    setSortDescriptor((prev) => ({
      column: columnId,
      direction:
        prev.column === columnId && prev.direction === 'ascending'
          ? 'descending'
          : 'ascending',
    }))
  }

  const handleDeleteIngredient = async (id) => {
    if (!confirm('Are you sure you want to delete this ingredient?')) return
    try {
      await adminApi.deleteIngredient(id)
      toast.success('Ingredient deleted')
      onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete ingredient')
    }
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* ── Metrics Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className="p-4 rounded-xl border flex items-center justify-between shadow-2xs"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Tracked Items</p>
            <p className="text-xl font-extrabold text-[#072328] dark:text-[#F8F7F4] mt-0.5">{metrics.totalItems}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#126973]/10 dark:bg-[#126973]/25 text-[#126973] dark:text-[#F1D8C2] flex items-center justify-center">
            <Package size={20} />
          </div>
        </div>

        <div
          className="p-4 rounded-xl border flex items-center justify-between shadow-2xs"
          style={{
            background: metrics.lowStockCount > 0 ? 'rgba(245, 158, 11, 0.08)' : 'var(--color-surface)',
            borderColor: metrics.lowStockCount > 0 ? 'rgba(245, 158, 11, 0.3)' : 'var(--color-border)'
          }}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-500">Low Stock Warnings</p>
            <p className="text-xl font-extrabold text-amber-500 mt-0.5">{metrics.lowStockCount} Items</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
            <AlertTriangle size={20} />
          </div>
        </div>

        <div
          className="p-4 rounded-xl border flex items-center justify-between shadow-2xs"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Estimated Stock Valuation</p>
            <p className="text-xl font-extrabold text-emerald-500 mt-0.5">${metrics.totalValue.toFixed(2)}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <ShoppingBag size={20} />
          </div>
        </div>
      </div>

      {/* ── Filters & Search Row ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs min-w-[240px] max-w-sm shadow-2xs"
            style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
          >
            <SearchLg size={15} className="text-slate-400 shrink-0 stroke-[2px]" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Search ingredients..."
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

          <button
            type="button"
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
              showLowStockOnly
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-500 shadow-2xs'
                : 'border-[var(--color-border)] text-slate-600 dark:text-slate-300 hover:bg-[#126973]/5'
            }`}
          >
            <AlertTriangle size={13} />
            <span>Low Stock ({metrics.lowStockCount})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Unit:</span>
          <select
            value={unitFilter}
            onChange={(e) => {
              setUnitFilter(e.target.value)
              setPage(1)
            }}
            className="px-2.5 py-1.5 text-xs rounded-lg border outline-none bg-[var(--color-card)] border-[var(--color-border)] text-[var(--color-text)] cursor-pointer"
          >
            <option value="all">All Units</option>
            <option value="kg">kg (Kilogram)</option>
            <option value="g">g (Gram)</option>
            <option value="l">l (Liter)</option>
            <option value="ml">ml (Milliliter)</option>
            <option value="pcs">pcs (Pieces)</option>
          </select>
        </div>
      </div>

      {/* ── Table Card ── */}
      <TableCard.Root>
        <Table aria-label="Ingredients Stock Table" sortDescriptor={sortDescriptor}>
          <Table.Header>
            <Table.Head
              id="name"
              label="Ingredient Name"
              isRowHeader
              allowsSorting
              sortDescriptor={sortDescriptor}
              onSort={handleSort}
            />
            <Table.Head id="unit" label="Unit" />
            <Table.Head
              id="stock_quantity"
              label="Current Stock"
              allowsSorting
              sortDescriptor={sortDescriptor}
              onSort={handleSort}
            />
            <Table.Head id="threshold" label="Threshold" />
            <Table.Head
              id="cost_per_unit"
              label="Unit Cost"
              allowsSorting
              sortDescriptor={sortDescriptor}
              onSort={handleSort}
            />
            <Table.Head id="total_val" label="Total Value" />
            <Table.Head id="status" label="Status" />
            <Table.Head id="actions" className="text-right">
              Actions
            </Table.Head>
          </Table.Header>

          <Table.Body items={paginatedList}>
            {(item) => {
              const isLowStock = Number(item.stock_quantity) <= Number(item.low_stock_threshold)
              const totalCost = (Number(item.stock_quantity) * Number(item.cost_per_unit)) || 0

              return (
                <Table.Row key={item.id} id={item.id}>
                  {/* Name */}
                  <Table.Cell>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#126973]/10 dark:bg-[#126973]/25 border border-[#126973]/20 dark:border-[#F1D8C2]/30 flex items-center justify-center font-bold text-xs text-[#126973] dark:text-[#F1D8C2] shrink-0">
                        {item.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-xs text-[var(--color-text)]">
                        {item.name}
                      </span>
                    </div>
                  </Table.Cell>

                  {/* Unit */}
                  <Table.Cell>
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {item.unit}
                    </span>
                  </Table.Cell>

                  {/* Current Stock */}
                  <Table.Cell>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`font-mono text-xs font-bold ${
                          isLowStock
                            ? 'text-amber-500 font-extrabold flex items-center gap-1'
                            : 'text-emerald-500'
                        }`}
                      >
                        {Number(item.stock_quantity).toFixed(2)} {item.unit}
                        {isLowStock && <AlertTriangle size={12} className="text-amber-500" />}
                      </span>
                    </div>
                  </Table.Cell>

                  {/* Threshold */}
                  <Table.Cell>
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                      {Number(item.low_stock_threshold).toFixed(2)} {item.unit}
                    </span>
                  </Table.Cell>

                  {/* Cost Per Unit */}
                  <Table.Cell>
                    <span className="font-mono text-xs text-[var(--color-text)]">
                      ${Number(item.cost_per_unit).toFixed(2)}
                    </span>
                  </Table.Cell>

                  {/* Total Value */}
                  <Table.Cell>
                    <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-200">
                      ${totalCost.toFixed(2)}
                    </span>
                  </Table.Cell>

                  {/* Status */}
                  <Table.Cell>
                    {isLowStock ? (
                      <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30">
                        Low Stock
                      </span>
                    ) : (
                      <BadgeWithIcon size="sm" color="success" iconLeading={Check} className="font-semibold capitalize">
                        Healthy
                      </BadgeWithIcon>
                    )}
                  </Table.Cell>

                  {/* Actions */}
                  <Table.Cell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setAdjustTarget(item)}
                        className="px-2 py-1 rounded text-[11px] font-bold text-[#126973] dark:text-[#F1D8C2] bg-[#126973]/10 hover:bg-[#126973]/20 transition-all cursor-pointer flex items-center gap-1"
                        title="Quick Restock / Adjust"
                      >
                        <ArrowDownUp size={13} />
                        <span>Adjust</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenEdit(item)}
                        className="p-1.5 rounded-[5px] text-slate-400 hover:text-[#126973] hover:bg-[#126973]/10 dark:hover:text-[#F1D8C2] transition-all cursor-pointer"
                        title="Edit"
                      >
                        <Edit01 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteIngredient(item.id)}
                        className="p-1.5 rounded-[5px] text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
                        title="Delete"
                      >
                        <Trash01 size={15} />
                      </button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              )
            }}
          </Table.Body>
        </Table>

        {totalPages > 1 && (
          <div className="p-3 border-t border-[var(--color-border)]">
            <PaginationPageMinimalCenter
              page={page}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </TableCard.Root>

      {/* Quick Adjust Modal */}
      {adjustTarget && (
        <StockAdjustModal
          item={adjustTarget}
          onClose={() => setAdjustTarget(null)}
          onSave={onRefresh}
        />
      )}
    </div>
  )
}
