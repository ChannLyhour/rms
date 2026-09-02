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
  Trash01,
  Check,
} from '@untitledui/icons'
import {
  Truck,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle
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
      toast.success(`PO marked as ${status.toUpperCase()} (Inventory Restocked)`)
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
            placeholder="Search PO number, vendor..."
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
          <span className="text-xs text-[var(--color-muted)]">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            className="px-3 py-1.5 text-xs rounded-[5px] border outline-none font-semibold cursor-pointer"
            style={{
              background: 'var(--color-card)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
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
            <Table.Head id="amount" label="Total Commitment" />
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
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-[5px] bg-[#126973]/15 border border-[#126973]/30 flex items-center justify-center font-bold text-xs text-[#126973] dark:text-[#F1D8C2] shrink-0">
                        <FileText size={15} />
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
                    <span className="font-mono font-extrabold text-xs text-emerald-500">
                      ${Number(po.total_amount).toFixed(2)}
                    </span>
                  </Table.Cell>

                  {/* Expected Date */}
                  <Table.Cell>
                    <span className="text-xs font-mono text-[var(--color-muted)]">
                      {po.expected_delivery_date || 'N/A'}
                    </span>
                  </Table.Cell>

                  {/* Status */}
                  <Table.Cell>
                    {isReceived && (
                      <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        <Check size={12} /> Received
                      </span>
                    )}
                    {isOrdered && (
                      <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                        <Truck size={12} /> In Transit
                      </span>
                    )}
                    {isDraft && (
                      <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-slate-500/15 text-slate-500 dark:text-slate-400 border border-slate-500/30">
                        <Clock size={12} /> Draft
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
                          className="px-2.5 py-1 rounded-[5px] text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all cursor-pointer flex items-center gap-1"
                          title="Confirm Goods Received (Auto Restock)"
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
