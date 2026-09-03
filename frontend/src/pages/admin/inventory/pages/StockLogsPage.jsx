import { useState, useMemo } from 'react'
import {
  TableCard,
  Table,
  BadgeWithIcon,
  PaginationPageMinimalCenter,
} from '../../../../components/TablesComponents'
import {
  SearchLg,
  ArrowDown,
  ArrowUp,
} from '@untitledui/icons'
import {
  Package,
  Trash2,
  ArrowDownUp,
  History,
  FileText
} from 'lucide-react'

export default function StockLogsPage({
  movementLogs = [],
  loading = false,
  onRefresh,
}) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [page, setPage] = useState(1)
  const pageSize = 12

  const filteredMovements = useMemo(() => {
    return movementLogs.filter((log) => {
      const matchSearch = log.ingredient?.name?.toLowerCase().includes(search.toLowerCase()) ||
        log.note?.toLowerCase().includes(search.toLowerCase()) ||
        log.type?.toLowerCase().includes(search.toLowerCase())
      const matchType = typeFilter === 'all' || log.type === typeFilter
      return matchSearch && matchType
    })
  }, [movementLogs, search, typeFilter])

  const totalPages = Math.ceil(filteredMovements.length / pageSize) || 1
  const paginatedMovements = filteredMovements.slice((page - 1) * pageSize, page * pageSize)

  const getMovementBadge = (type) => {
    switch (type) {
      case 'order_deduct':
      case 'order_deduction':
        return (
          <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
            <ArrowDown size={11} /> POS Sale Deduct
          </span>
        )
      case 'po_receive':
      case 'po_received':
        return (
          <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <ArrowUp size={11} /> PO Inbound
          </span>
        )
      case 'waste':
      case 'waste_loss':
        return (
          <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <Trash2 size={11} /> Waste / Damage
          </span>
        )
      case 'adjustment':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-[#126973]/15 text-[#126973] dark:text-[#F1D8C2] border border-[#126973]/30">
            <ArrowDownUp size={11} /> Manual Adjustment
          </span>
        )
    }
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* ── Search & Filter ── */}
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
            placeholder="Search movement audit trail..."
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

        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--color-muted)]">Event Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value)
              setPage(1)
            }}
            className="px-3 py-1.5 text-xs rounded-[5px] border outline-none font-semibold cursor-pointer"
            style={{
              background: 'var(--color-card)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
          >
            <option value="all">All Movement Types</option>
            <option value="order_deduct">POS Order Deduct</option>
            <option value="po_receive">PO Receiving (Inbound)</option>
            <option value="adjustment">Manual Adjustment</option>
            <option value="waste">Waste &amp; Spoilage</option>
          </select>
        </div>
      </div>

      {/* ── Table Card ── */}
      <TableCard.Root>
        <Table aria-label="Stock Movements Audit Table">
          <Table.Header>
            <Table.Head id="item" label="Ingredient Item" isRowHeader />
            <Table.Head id="type" label="Movement Type" />
            <Table.Head id="change" label="Quantity In / Out" />
            <Table.Head id="balance" label="Balance After" />
            <Table.Head id="note" label="Reference / Notes" />
            <Table.Head id="time" label="Timestamp" className="text-right" />
          </Table.Header>

          <Table.Body items={paginatedMovements}>
            {(log) => {
              const qty = Number(log.quantity)
              const isPositive = qty > 0

              return (
                <Table.Row key={log.id} id={log.id}>
                  {/* Ingredient Item */}
                  <Table.Cell>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-[5px] bg-[#126973]/15 border border-[#126973]/30 flex items-center justify-center font-bold text-xs text-[#126973] dark:text-[#F1D8C2] shrink-0">
                        <Package size={15} />
                      </div>
                      <span className="font-bold text-xs" style={{ color: 'var(--color-text)' }}>
                        {log.ingredient?.name || `Ingredient #${log.ingredient_id}`}
                      </span>
                    </div>
                  </Table.Cell>

                  {/* Movement Type */}
                  <Table.Cell>
                    {getMovementBadge(log.type)}
                  </Table.Cell>

                  {/* Quantity Change */}
                  <Table.Cell>
                    <span
                      className={`font-mono text-xs font-bold ${
                        isPositive ? 'text-emerald-500' : 'text-rose-500'
                      }`}
                    >
                      {isPositive ? `+${qty.toFixed(3)}` : qty.toFixed(3)} {log.ingredient?.unit || ''}
                    </span>
                  </Table.Cell>

                  {/* Balance After */}
                  <Table.Cell>
                    <span className="font-mono text-xs font-bold" style={{ color: 'var(--color-text)' }}>
                      {Number(log.quantity_after).toFixed(3)} {log.ingredient?.unit || ''}
                    </span>
                  </Table.Cell>

                  {/* Notes / Ref */}
                  <Table.Cell>
                    <span className="text-xs max-w-xs truncate block" style={{ color: 'var(--color-muted)' }}>
                      {log.note || (log.order_id ? `Order #${log.order_id}` : log.purchase_order_id ? `PO #${log.purchase_order_id}` : 'System Log')}
                    </span>
                  </Table.Cell>

                  {/* Timestamp */}
                  <Table.Cell className="text-right">
                    <span className="text-xs font-mono" style={{ color: 'var(--color-muted)' }}>
                      {new Date(log.created_at).toLocaleString()}
                    </span>
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
    </div>
  )
}
