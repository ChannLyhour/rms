import { useState, useMemo } from 'react'
import {
  TableCard,
  Table,
  PaginationPageMinimalCenter,
} from '../../../../components/TablesComponents'
import {
  SearchLg,
  Plus,
  Trash01,
  Check,
  Truck01
} from '@untitledui/icons'
import {
  Truck,
  FileText,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { adminApi } from '../../../../api/adminApi'

export default function PurchaseOrdersTab({
  purchaseOrders = [],
  loading = false,
  onRefresh,
  onOpenCreate,
}) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const pageSize = 10

  const filteredPOs = useMemo(() => {
    return purchaseOrders.filter((po) => {
      const matchSearch = po.po_number?.toLowerCase().includes(search.toLowerCase()) ||
        po.supplier?.name?.toLowerCase().includes(search.toLowerCase()) ||
        po.status?.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || po.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [purchaseOrders, search, statusFilter])

  const totalPages = Math.ceil(filteredPOs.length / pageSize) || 1
  const paginatedPOs = filteredPOs.slice((page - 1) * pageSize, page * pageSize)

  const handleUpdatePOStatus = async (id, status) => {
    try {
      await adminApi.updatePurchaseOrderStatus(id, status)
      toast.success(`PO marked as ${status.toUpperCase()} (Inventory Stock Restocked)`)
      onRefresh()
    } catch (err) {
      toast.error('Failed to update PO status')
    }
  }

  const handleDeletePO = async (id) => {
    if (!confirm('Are you sure you want to delete this purchase order?')) return
    try {
      await adminApi.deletePurchaseOrder(id)
      toast.success('PO deleted')
      onRefresh()
    } catch (err) {
      toast.error('Failed to delete PO')
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
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search PO number, supplier..."
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
          <span className="text-xs text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            className="px-2.5 py-1.5 text-xs rounded-lg border outline-none bg-[var(--color-card)] border-[var(--color-border)] text-[var(--color-text)] cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="ordered">Ordered (In Transit)</option>
            <option value="received">Received (In Stock)</option>
            <option value="canceled">Canceled</option>
          </select>
        </div>
      </div>

      {/* ── Table Card ── */}
      <TableCard.Root>
        <Table aria-label="Purchase Orders Table">
          <Table.Header>
            <Table.Head id="po_number" label="PO Number" isRowHeader />
            <Table.Head id="supplier" label="Supplier / Vendor" />
            <Table.Head id="amount" label="Total Amount" />
            <Table.Head id="expected" label="Expected Date" />
            <Table.Head id="status" label="Status" />
            <Table.Head id="actions" className="text-right">Actions</Table.Head>
          </Table.Header>

          <Table.Body items={paginatedPOs}>
            {(po) => {
              const isReceived = po.status === 'received'
              const isOrdered = po.status === 'ordered'
              const isDraft = po.status === 'draft'

              return (
                <Table.Row key={po.id} id={po.id}>
                  {/* PO Number */}
                  <Table.Cell>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#126973]/10 dark:bg-[#126973]/25 border border-[#126973]/20 dark:border-[#F1D8C2]/30 flex items-center justify-center font-bold text-xs text-[#126973] dark:text-[#F1D8C2]">
                        <FileText size={14} />
                      </div>
                      <span className="font-mono font-bold text-xs text-[var(--color-text)]">
                        {po.po_number}
                      </span>
                    </div>
                  </Table.Cell>

                  {/* Supplier */}
                  <Table.Cell>
                    <span className="font-semibold text-xs text-[var(--color-text)]">
                      {po.supplier?.name || `Supplier #${po.supplier_id}`}
                    </span>
                  </Table.Cell>

                  {/* Total Amount */}
                  <Table.Cell>
                    <span className="font-mono font-bold text-xs text-emerald-500">
                      ${Number(po.total_amount).toFixed(2)}
                    </span>
                  </Table.Cell>

                  {/* Expected Date */}
                  <Table.Cell>
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                      {po.expected_delivery_date || 'N/A'}
                    </span>
                  </Table.Cell>

                  {/* Status */}
                  <Table.Cell>
                    {isReceived && (
                      <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                        <Check size={12} /> Received
                      </span>
                    )}
                    {isOrdered && (
                      <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-500 border border-blue-500/30">
                        <Truck size={12} /> Ordered
                      </span>
                    )}
                    {isDraft && (
                      <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-slate-500/15 text-slate-400 border border-slate-500/30">
                        Draft
                      </span>
                    )}
                  </Table.Cell>

                  {/* Actions */}
                  <Table.Cell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {!isReceived && (
                        <button
                          type="button"
                          onClick={() => handleUpdatePOStatus(po.id, 'received')}
                          className="px-2.5 py-1 rounded text-[11px] font-bold text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all cursor-pointer flex items-center gap-1"
                          title="Confirm Goods Received (Restock Ingredients)"
                        >
                          <Check size={13} />
                          <span>Receive</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeletePO(po.id)}
                        className="p-1.5 rounded-[5px] text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
                        title="Delete PO"
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
    </div>
  )
}
