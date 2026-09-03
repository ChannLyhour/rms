import { useState, useMemo } from 'react'
import {
  TableCard,
  Table,
  BadgeWithIcon,
  PaginationPageMinimalCenter,
} from '../../../../components/TablesComponents'
import {
  SearchLg,
  Edit01,
  Trash01,
  Phone,
  Mail01,
} from '@untitledui/icons'
import {
  Building2,
  MapPin,
  Check
} from 'lucide-react'
import toast from 'react-hot-toast'
import { adminApi } from '../../../../api/adminApi'

export default function SuppliersPage({
  suppliers = [],
  loading = false,
  onRefresh,
  onOpenCreate,
  onOpenEdit,
}) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      return s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.contact_person && s.contact_person.toLowerCase().includes(search.toLowerCase())) ||
        (s.phone && s.phone.includes(search))
    })
  }, [suppliers, search])

  const totalPages = Math.ceil(filteredSuppliers.length / pageSize) || 1
  const paginatedSuppliers = filteredSuppliers.slice((page - 1) * pageSize, page * pageSize)

  const handleDeleteSupplier = async (id) => {
    if (!confirm('Are you sure you want to delete this supplier?')) return
    try {
      await adminApi.deleteSupplier(id)
      toast.success('Supplier deleted')
      onRefresh()
    } catch (err) {
      toast.error('Failed to delete supplier')
    }
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
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
            placeholder="Search supplier name, contact, phone..."
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
        <Table aria-label="Suppliers List Table">
          <Table.Header>
            <Table.Head id="name" label="Supplier / Company" isRowHeader />
            <Table.Head id="contact" label="Contact Person" />
            <Table.Head id="phone" label="Phone" />
            <Table.Head id="email" label="Email" />
            <Table.Head id="address" label="Address" />
            <Table.Head id="status" label="Status" />
            <Table.Head id="actions" className="text-right">Actions</Table.Head>
          </Table.Header>

          <Table.Body items={paginatedSuppliers}>
            {(s) => (
              <Table.Row key={s.id} id={s.id}>
                {/* Name */}
                <Table.Cell>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-[5px] bg-[#126973]/15 border border-[#126973]/30 flex items-center justify-center font-bold text-xs text-[#126973] dark:text-[#F1D8C2] shrink-0">
                      <Building2 size={16} />
                    </div>
                    <span className="font-bold text-xs" style={{ color: 'var(--color-text)' }}>
                      {s.name}
                    </span>
                  </div>
                </Table.Cell>

                {/* Contact */}
                <Table.Cell>
                  <span className="text-xs" style={{ color: 'var(--color-text)' }}>
                    {s.contact_person || '—'}
                  </span>
                </Table.Cell>

                {/* Phone */}
                <Table.Cell>
                  <div className="flex items-center gap-1.5 text-xs font-mono" style={{ color: 'var(--color-text)' }}>
                    <Phone size={13} className="text-slate-400 shrink-0" />
                    <span>{s.phone || '—'}</span>
                  </div>
                </Table.Cell>

                {/* Email */}
                <Table.Cell>
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-text)' }}>
                    <Mail01 size={13} className="text-slate-400 shrink-0" />
                    <span>{s.email || '—'}</span>
                  </div>
                </Table.Cell>

                {/* Address */}
                <Table.Cell>
                  <span className="text-xs truncate max-w-xs block" style={{ color: 'var(--color-muted)' }}>
                    {s.address || '—'}
                  </span>
                </Table.Cell>

                {/* Status */}
                <Table.Cell>
                  <BadgeWithIcon size="sm" color="success" iconLeading={Check} className="font-semibold capitalize">
                    Active
                  </BadgeWithIcon>
                </Table.Cell>

                {/* Actions */}
                <Table.Cell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onOpenEdit(s)}
                      className="p-1.5 rounded-[5px] text-slate-400 hover:text-[#126973] hover:bg-[#126973]/10 dark:hover:text-[#F1D8C2] transition-all cursor-pointer"
                      title="Edit Supplier"
                    >
                      <Edit01 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSupplier(s.id)}
                      className="p-1.5 rounded-[5px] text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
                      title="Delete Supplier"
                    >
                      <Trash01 size={15} />
                    </button>
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
    </div>
  )
}
