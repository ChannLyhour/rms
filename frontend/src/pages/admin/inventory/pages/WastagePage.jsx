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
} from '@untitledui/icons'
import {
  Trash2,
  DollarSign,
  TrendingDown,
  AlertOctagon
} from 'lucide-react'

export default function WastagePage({
  wasteLogs = [],
  ingredients = [],
  loading = false,
  onRefresh,
  onOpenCreate,
}) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 12

  const filteredWastes = useMemo(() => {
    return wasteLogs.filter((w) => {
      return w.ingredient?.name?.toLowerCase().includes(search.toLowerCase()) ||
        w.reason?.toLowerCase().includes(search.toLowerCase())
    })
  }, [wasteLogs, search])

  const totalWasteLoss = useMemo(() => {
    return wasteLogs.reduce((sum, w) => sum + (Number(w.cost_loss) || 0), 0)
  }, [wasteLogs])

  const totalPages = Math.ceil(filteredWastes.length / pageSize) || 1
  const paginatedWastes = filteredWastes.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* ── Wastage Summary Banner ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          className="p-4 rounded-[5px] border flex items-center justify-between shadow-xs"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-muted)]">Total Waste Incidents</p>
            <p className="text-xl font-extrabold text-[var(--color-text)] mt-0.5">{wasteLogs.length} Records</p>
          </div>
          <div className="w-10 h-10 rounded-[5px] bg-rose-500/10 text-rose-500 flex items-center justify-center">
            <Trash2 size={20} />
          </div>
        </div>

        <div
          className="p-4 rounded-[5px] border flex items-center justify-between shadow-xs"
          style={{ background: 'rgba(239, 68, 68, 0.08)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-rose-500">Cumulative Cost Loss</p>
            <p className="text-xl font-extrabold text-rose-500 mt-0.5">${totalWasteLoss.toFixed(2)} USD</p>
          </div>
          <div className="w-10 h-10 rounded-[5px] bg-rose-500/20 text-rose-500 flex items-center justify-center">
            <TrendingDown size={20} />
          </div>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div
          className="flex items-center gap-3 px-3.5 py-2 rounded-[5px] border text-xs max-w-md shadow-xs w-full sm:w-auto"
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
            placeholder="Search damaged item, reason..."
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
      </div>

      {/* ── Table Card ── */}
      <TableCard.Root>
        <Table aria-label="Wastage & Spoilage Table">
          <Table.Header>
            <Table.Head id="item" label="Damaged / Spoiled Item" isRowHeader />
            <Table.Head id="qty" label="Wasted Quantity" />
            <Table.Head id="reason" label="Reason" />
            <Table.Head id="loss" label="Cost Loss ($)" />
            <Table.Head id="date" label="Date Recorded" className="text-right" />
          </Table.Header>

          <Table.Body items={paginatedWastes}>
            {(w) => (
              <Table.Row key={w.id} id={w.id}>
                {/* Item */}
                <Table.Cell>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-[5px] bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center font-bold text-xs shrink-0">
                      <Trash2 size={15} />
                    </div>
                    <span className="font-bold text-xs" style={{ color: 'var(--color-text)' }}>
                      {w.ingredient?.name || `Ingredient #${w.ingredient_id}`}
                    </span>
                  </div>
                </Table.Cell>

                {/* Quantity */}
                <Table.Cell>
                  <span className="font-mono text-xs font-bold text-rose-500">
                    {Number(w.quantity).toFixed(3)} {w.ingredient?.unit || ''}
                  </span>
                </Table.Cell>

                {/* Reason */}
                <Table.Cell>
                  <span className="capitalize text-xs font-semibold px-2.5 py-0.5 rounded-[5px] border" style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
                    {w.reason}
                  </span>
                </Table.Cell>

                {/* Cost Loss */}
                <Table.Cell>
                  <span className="font-mono text-xs font-bold text-rose-500">
                    ${Number(w.cost_loss).toFixed(2)}
                  </span>
                </Table.Cell>

                {/* Date */}
                <Table.Cell className="text-right">
                  <span className="text-xs font-mono" style={{ color: 'var(--color-muted)' }}>
                    {new Date(w.created_at).toLocaleDateString()}
                  </span>
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
    </div>
  )
}
