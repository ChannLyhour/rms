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
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { adminApi } from '../../../../api/adminApi'
import StockAdjustModal from '../views/StockAdjustModal'

export default function IngredientsPage({
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

  // Inline Table Add Row state
  const [isAddingRow, setIsAddingRow] = useState(false)
  const [savingNew, setSavingNew] = useState(false)
  const [newRow, setNewRow] = useState({
    name: '',
    unit: 'kg',
    stock_quantity: '',
    low_stock_threshold: '5',
    cost_per_unit: '',
  })

  const handleSaveInlineRow = async () => {
    if (!newRow.name || !newRow.name.trim()) {
      toast.error('Please enter ingredient name')
      return
    }

    setSavingNew(true)
    try {
      await adminApi.createIngredient({
        name: newRow.name.trim(),
        unit: newRow.unit || 'kg',
        stock_quantity: parseFloat(newRow.stock_quantity) || 0,
        low_stock_threshold: parseFloat(newRow.low_stock_threshold) || 5,
        cost_per_unit: parseFloat(newRow.cost_per_unit) || 0,
        is_active: true,
      })

      toast.success(`Added ${newRow.name.trim()} successfully`)
      setNewRow({
        name: '',
        unit: 'kg',
        stock_quantity: '',
        low_stock_threshold: '5',
        cost_per_unit: '',
      })
      setIsAddingRow(false)
      if (onRefresh) onRefresh()
    } catch (err) {
      console.error('Failed to create ingredient:', err)
      toast.error(err.response?.data?.error || 'Failed to add ingredient')
    } finally {
      setSavingNew(false)
    }
  }

  const handleCancelInlineRow = () => {
    setIsAddingRow(false)
    setNewRow({
      name: '',
      unit: 'kg',
      stock_quantity: '',
      low_stock_threshold: '5',
      cost_per_unit: '',
    })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSaveInlineRow()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancelInlineRow()
    }
  }

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
          className="p-4 rounded-[5px] border flex items-center justify-between shadow-xs"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-muted)]">Total Tracked Items</p>
            <p className="text-xl font-extrabold text-[var(--color-text)] mt-0.5">{metrics.totalItems}</p>
          </div>
          <div className="w-10 h-10 rounded-[5px] bg-[#126973]/15 text-[#126973] dark:text-[#F1D8C2] flex items-center justify-center">
            <Package size={20} />
          </div>
        </div>

        <div
          className="p-4 rounded-[5px] border flex items-center justify-between shadow-xs"
          style={{
            background: metrics.lowStockCount > 0 ? 'rgba(245, 158, 11, 0.08)' : 'var(--color-surface)',
            borderColor: metrics.lowStockCount > 0 ? 'rgba(245, 158, 11, 0.3)' : 'var(--color-border)'
          }}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-500">Low Stock Warnings</p>
            <p className="text-xl font-extrabold text-amber-500 mt-0.5">{metrics.lowStockCount} Items</p>
          </div>
          <div className="w-10 h-10 rounded-[5px] bg-amber-500/20 text-amber-500 flex items-center justify-center">
            <AlertTriangle size={20} />
          </div>
        </div>

        <div
          className="p-4 rounded-[5px] border flex items-center justify-between shadow-xs"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-muted)]">Estimated Stock Valuation</p>
            <p className="text-xl font-extrabold text-emerald-500 mt-0.5">${metrics.totalValue.toFixed(2)}</p>
          </div>
          <div className="w-10 h-10 rounded-[5px] bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <ShoppingBag size={20} />
          </div>
        </div>
      </div>

      {/* ── Filters & Search Row ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div
            className="flex items-center gap-3 px-3.5 py-2 rounded-[5px] border text-xs max-w-md shadow-xs"
            style={{
              background: 'var(--color-card)',
              borderColor: 'var(--color-border)',
            }}
          >
            <SearchLg size={16} className="text-[var(--color-muted)] shrink-0 stroke-[2px]" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Search ingredients by name, unit..."
              className="bg-transparent border-none outline-none w-full text-xs placeholder:text-[var(--color-muted)] text-[var(--color-text)]"
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
            className={`px-3 py-2 rounded-[5px] text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
              showLowStockOnly
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-500 shadow-xs'
                : 'border-[var(--color-border)] text-[var(--color-muted)] hover:bg-[#126973]/5'
            }`}
          >
            <AlertTriangle size={13} />
            <span>Low Stock ({metrics.lowStockCount})</span>
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsAddingRow(true)}
            className="px-3.5 py-1.5 rounded-[5px] text-xs font-bold text-white bg-[#126973] hover:bg-[#126973]/90 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1.5 shadow-xs shrink-0"
            title="Add new ingredient row directly on table"
          >
            <Plus size={14} className="stroke-[2.5px]" />
            <span>Add Ingredient</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--color-muted)] shrink-0">Filter Unit:</span>
          <select
            value={unitFilter}
            onChange={(e) => {
              setUnitFilter(e.target.value)
              setPage(1)
            }}
            className="px-3 py-1.5 text-xs rounded-[5px] border outline-none font-semibold cursor-pointer"
            style={{
              background: 'var(--color-card)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
          >
            <option value="all">All Units</option>
            <option value="kg">kg (Kilogram)</option>
            <option value="g">g (Gram)</option>
            <option value="L">L (Liter)</option>
            <option value="ml">ml (Milliliter)</option>
            <option value="pcs">pcs (Pieces)</option>
            <option value="pack">pack (Pack / Bundle)</option>
            <option value="bottle">bottle (Bottle)</option>
            <option value="can">can (Can / Tin)</option>
            <option value="box">box (Carton / Box)</option>
          </select>
        </div>
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

          <Table.Body>
            {/* ── Inline Add New Ingredient Row on Table.Cell ── */}
            {isAddingRow && (
              <Table.Row className="bg-[#126973]/8 dark:bg-[#126973]/15 border-b-2 border-[#126973]/50 animate-in fade-in duration-150">
                {/* 1. Ingredient Name & Unit */}
                <Table.Cell>
                  <div className="flex items-center gap-2 py-0.5">
                    <div className="w-8 h-8 rounded-[5px] bg-[#126973]/20 border border-[#126973]/40 flex items-center justify-center font-bold text-xs text-[#126973] dark:text-[#F1D8C2] shrink-0">
                      {newRow.name ? newRow.name.charAt(0).toUpperCase() : '+'}
                    </div>
                    <div className="flex-1 flex items-center gap-1.5 min-w-[170px]">
                      <input
                        type="text"
                        autoFocus
                        placeholder="Ingredient name (e.g. Tomato)..."
                        value={newRow.name}
                        onChange={(e) => setNewRow({ ...newRow, name: e.target.value })}
                        onKeyDown={handleKeyDown}
                        className="w-full px-2.5 py-1.5 rounded-[5px] text-xs font-semibold border outline-none bg-[var(--color-surface)] text-[var(--color-text)] border-[#126973]/40 focus:border-[#126973] focus:ring-1 focus:ring-[#126973]"
                      />
                      <select
                        value={newRow.unit}
                        onChange={(e) => setNewRow({ ...newRow, unit: e.target.value })}
                        className="px-2 py-1.5 rounded-[5px] text-xs font-semibold border outline-none bg-[var(--color-surface)] text-[var(--color-text)] border-[#126973]/40 cursor-pointer shrink-0"
                      >
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                        <option value="L">L</option>
                        <option value="ml">ml</option>
                        <option value="pcs">pcs</option>
                        <option value="pack">pack</option>
                        <option value="bottle">bottle</option>
                        <option value="can">can</option>
                        <option value="box">box</option>
                      </select>
                    </div>
                  </div>
                </Table.Cell>

                {/* 2. Current Stock */}
                <Table.Cell>
                  <div className="flex items-center gap-1 min-w-[100px]">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={newRow.stock_quantity}
                      onChange={(e) => setNewRow({ ...newRow, stock_quantity: e.target.value })}
                      onKeyDown={handleKeyDown}
                      className="w-20 px-2 py-1.5 rounded-[5px] text-xs font-mono font-bold border outline-none bg-[var(--color-surface)] text-[var(--color-text)] border-[#126973]/40 focus:border-[#126973]"
                    />
                    <span className="text-xs text-[var(--color-muted)] font-mono">{newRow.unit}</span>
                  </div>
                </Table.Cell>

                {/* 3. Threshold */}
                <Table.Cell>
                  <div className="flex items-center gap-1 min-w-[95px]">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="5.00"
                      value={newRow.low_stock_threshold}
                      onChange={(e) => setNewRow({ ...newRow, low_stock_threshold: e.target.value })}
                      onKeyDown={handleKeyDown}
                      className="w-20 px-2 py-1.5 rounded-[5px] text-xs font-mono border outline-none bg-[var(--color-surface)] text-[var(--color-text)] border-[#126973]/40 focus:border-[#126973]"
                    />
                    <span className="text-xs text-[var(--color-muted)] font-mono">{newRow.unit}</span>
                  </div>
                </Table.Cell>

                {/* 4. Cost Per Unit */}
                <Table.Cell>
                  <div className="flex items-center gap-1 min-w-[85px]">
                    <span className="text-xs font-bold text-[var(--color-muted)]">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={newRow.cost_per_unit}
                      onChange={(e) => setNewRow({ ...newRow, cost_per_unit: e.target.value })}
                      onKeyDown={handleKeyDown}
                      className="w-18 px-2 py-1.5 rounded-[5px] text-xs font-mono border outline-none bg-[var(--color-surface)] text-[var(--color-text)] border-[#126973]/40 focus:border-[#126973]"
                    />
                  </div>
                </Table.Cell>

                {/* 5. Total Value Preview */}
                <Table.Cell>
                  <span className="font-mono text-xs font-bold text-[var(--color-text)]">
                    ${((Number(newRow.stock_quantity) || 0) * (Number(newRow.cost_per_unit) || 0)).toFixed(2)}
                  </span>
                </Table.Cell>

                {/* 6. Status Preview */}
                <Table.Cell>
                  {(Number(newRow.stock_quantity) || 0) <= 0 ? (
                    <span className="inline-flex items-center text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-500 border border-rose-500/30">
                      Out of Stock
                    </span>
                  ) : (Number(newRow.stock_quantity) || 0) <= (Number(newRow.low_stock_threshold) || 0) ? (
                    <span className="inline-flex items-center text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30">
                      Low Stock
                    </span>
                  ) : (
                    <BadgeWithIcon color="success" className="font-semibold capitalize">
                      Good
                    </BadgeWithIcon>
                  )}
                </Table.Cell>

                {/* 7. Actions */}
                <Table.Cell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      disabled={savingNew}
                      onClick={handleSaveInlineRow}
                      className="px-2.5 py-1.5 rounded-[5px] text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                      title="Save (or press Enter)"
                    >
                      {savingNew ? (
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Check size={13} strokeWidth={2.5} />
                      )}
                      <span>Save</span>
                    </button>
                    <button
                      type="button"
                      disabled={savingNew}
                      onClick={handleCancelInlineRow}
                      className="p-1.5 rounded-[5px] text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
                      title="Cancel (or press Esc)"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </Table.Cell>
              </Table.Row>
            )}

            {/* ── Existing Data Rows ── */}
            {paginatedList.map((item) => {
              const isLowStock = Number(item.stock_quantity) <= Number(item.low_stock_threshold)
              const totalCost = (Number(item.stock_quantity) * Number(item.cost_per_unit)) || 0

              return (
                <Table.Row key={item.id} id={item.id}>
                  {/* Name */}
                  <Table.Cell>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-[5px] bg-[#126973]/15 border border-[#126973]/30 flex items-center justify-center font-bold text-xs text-[#126973] dark:text-[#F1D8C2] shrink-0">
                        {item.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-xs text-[var(--color-text)]">
                        {item.name}
                      </span>
                    </div>
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
                    <span className="text-xs font-mono" style={{ color: 'var(--color-muted)' }}>
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
                    <span className="font-mono text-xs font-bold text-[var(--color-text)]">
                      ${totalCost.toFixed(2)}
                    </span>
                  </Table.Cell>

                  {/* Status */}
                  <Table.Cell>
                    {isLowStock ? (
                      <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30">
                        Low Stock
                      </span>
                    ) : (
                      <BadgeWithIcon color="success" className="font-semibold capitalize">
                        Good
                      </BadgeWithIcon>
                    )}
                  </Table.Cell>

                  {/* Actions */}
                  <Table.Cell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setAdjustTarget(item)}
                        className="px-2.5 py-1 rounded-[5px] text-[11px] font-bold text-[#126973] dark:text-[#F1D8C2] bg-[#126973]/10 hover:bg-[#126973]/20 transition-all cursor-pointer flex items-center gap-1"
                        title="Quick Restock / Adjust"
                      >
                        <ArrowDownUp size={13} />
                        <span>Adjust</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenEdit(item)}
                        className="p-1.5 rounded-[5px] text-slate-400 hover:text-[#126973] hover:bg-[#126973]/10 dark:hover:text-[#F1D8C2] transition-all cursor-pointer"
                        title="Edit Ingredient"
                      >
                        <Edit01 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteIngredient(item.id)}
                        className="p-1.5 rounded-[5px] text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
                        title="Delete Ingredient"
                      >
                        <Trash01 size={15} />
                      </button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              )
            })}

            {/* ── Empty State ── */}
            {paginatedList.length === 0 && !isAddingRow && (
              <Table.Row>
                <Table.Cell colSpan={7} className="py-12 text-center text-[var(--color-muted)]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Package size={30} className="text-slate-300 dark:text-slate-600" />
                    <p className="text-xs font-semibold">No ingredients found</p>
                    <button
                      type="button"
                      onClick={() => setIsAddingRow(true)}
                      className="mt-1 px-3 py-1.5 rounded-[5px] text-xs font-bold text-white bg-[#126973] hover:bg-[#126973]/90 transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                    >
                      <Plus size={13} strokeWidth={2.5} />
                      <span>Add First Ingredient Directly</span>
                    </button>
                  </div>
                </Table.Cell>
              </Table.Row>
            )}

            {/* ── Bottom Quick Add Trigger Row ── */}
            {!isAddingRow && paginatedList.length > 0 && (
              <Table.Row
                onClick={() => setIsAddingRow(true)}
                className="hover:bg-[#126973]/5 dark:hover:bg-[#126973]/10 cursor-pointer border-t border-dashed border-[var(--color-border)] group transition-colors"
              >
                <Table.Cell colSpan={7} className="py-2.5 px-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#126973] dark:text-[#F1D8C2] group-hover:underline">
                    <Plus size={14} className="stroke-[2.5px]" />
                    <span>+ Add new ingredient row directly on table...</span>
                  </div>
                </Table.Cell>
              </Table.Row>
            )}
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
