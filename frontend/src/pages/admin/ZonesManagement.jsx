import { useState, useEffect, useMemo } from 'react'
import axiosClient from '../../api/axiosClient'
import AdminLayout from '../../components/layout/AdminLayout'
import {
  TableCard,
  Table,
  BadgeWithIcon,
  Button as TableButton,
  PaginationPageMinimalCenter,
} from '../../components/TablesComponents'
import { CreateButton } from '../../components/common/ButtonComponent'
import { SearchLg, Plus, Edit01, Trash01, Check, X, LayersThree01 } from '@untitledui/icons'
import { Building2, Utensils, ShoppingCart, Wine, Coffee, Layers } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ZonesManagement() {
  const [outlets, setOutlets] = useState([])
  const [zones, setZones] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [venueFilter, setVenueFilter] = useState('all')
  const [page, setPage] = useState(1)
  const pageSize = 10

  const [sortDescriptor, setSortDescriptor] = useState({
    column: 'id',
    direction: 'ascending',
  })

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingZoneId, setEditingZoneId] = useState(null)
  const [formData, setFormData] = useState({
    outlet_id: '',
    name: '',
    floor_number: 1,
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const [outletsRes, zonesRes] = await Promise.all([
        axiosClient.get('/outlets'),
        axiosClient.get('/zones'),
      ])
      const outletsData = outletsRes.data?.data || []
      const zonesData = zonesRes.data?.data || []
      setOutlets(outletsData)
      setZones(zonesData)
    } catch (err) {
      console.error('Failed to load zones data:', err)
      toast.error('Failed to load floor zones')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Map outlet info to each zone
  const enrichedZones = useMemo(() => {
    const outletMap = {}
    outlets.forEach((o) => {
      outletMap[o.id] = o
    })

    return zones.map((z) => {
      const parent = outletMap[z.outlet_id]
      return {
        ...z,
        outlet_name: parent?.name || 'Unknown Venue',
        outlet_code: parent?.code || 'VENUE',
        outlet_type: parent?.type || 'dine_in',
      }
    })
  }, [zones, outlets])

  // Venue Counts
  const venueZoneCounts = useMemo(() => {
    const counts = { all: enrichedZones.length }
    outlets.forEach((o) => {
      counts[o.id] = 0
    })
    enrichedZones.forEach((z) => {
      if (counts[z.outlet_id] !== undefined) counts[z.outlet_id]++
    })
    return counts
  }, [enrichedZones, outlets])

  // Filtered Zones
  const filteredZones = useMemo(() => {
    const q = search.toLowerCase().trim()
    return enrichedZones.filter((z) => {
      const matchSearch = q
        ? z.name.toLowerCase().includes(q) ||
          z.outlet_name.toLowerCase().includes(q) ||
          z.outlet_code.toLowerCase().includes(q)
        : true

      const matchVenue = venueFilter === 'all' ? true : String(z.outlet_id) === String(venueFilter)
      return matchSearch && matchVenue
    })
  }, [enrichedZones, search, venueFilter])

  // Sorted Zones
  const sortedZones = useMemo(() => {
    const list = [...filteredZones]
    return list.sort((a, b) => {
      let first = a[sortDescriptor.column]
      let second = b[sortDescriptor.column]

      if (typeof first === 'number' && typeof second === 'number') {
        return sortDescriptor.direction === 'descending' ? second - first : first - second
      }
      if (typeof first === 'string' && typeof second === 'string') {
        const cmp = first.localeCompare(second)
        return sortDescriptor.direction === 'descending' ? -cmp : cmp
      }
      return 0
    })
  }, [filteredZones, sortDescriptor])

  const totalPages = Math.ceil(sortedZones.length / pageSize) || 1
  const paginatedZones = sortedZones.slice((page - 1) * pageSize, page * pageSize)

  const handleSort = (columnId) => {
    setSortDescriptor((prev) => ({
      column: columnId,
      direction:
        prev.column === columnId && prev.direction === 'ascending'
          ? 'descending'
          : 'ascending',
    }))
  }

  const handleOpenCreate = () => {
    setEditingZoneId(null)
    setFormData({
      outlet_id: outlets[0]?.id ? String(outlets[0].id) : '',
      name: '',
      floor_number: 1,
    })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (zone) => {
    setEditingZoneId(zone.id)
    setFormData({
      outlet_id: String(zone.outlet_id),
      name: zone.name,
      floor_number: zone.floor_number,
    })
    setIsModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!formData.outlet_id) {
      toast.error('Please select a venue for this zone')
      return
    }

    try {
      if (editingZoneId) {
        await axiosClient.put(`/zones/${editingZoneId}`, {
          outlet_id: formData.outlet_id,
          name: formData.name,
          floor_number: Number(formData.floor_number) || 1,
        })
        toast.success('Floor Zone updated successfully')
      } else {
        await axiosClient.post(`/outlets/${formData.outlet_id}/zones`, {
          name: formData.name,
          floor_number: Number(formData.floor_number) || 1,
        })
        toast.success('Floor Zone created successfully')
      }
      setIsModalOpen(false)
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save zone')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this floor zone?')) return
    try {
      await axiosClient.delete(`/zones/${id}`)
      toast.success('Floor Zone removed')
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete zone')
    }
  }

  const getOutletIcon = (type) => {
    switch (type) {
      case 'cafe':
        return '☕'
      case 'bar':
        return '🍸'
      case 'retail':
        return '🛒'
      case 'dine_in':
      default:
        return '🍽️'
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-10 select-none animate-in fade-in duration-200">
        {/* ── Header Row ── */}
        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div>
            <h1
              className="text-xl font-extrabold tracking-tight"
              style={{ color: 'var(--color-text)' }}
            >
              Floor Zones &amp; Dining Areas
            </h1>
            <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
              Configure physical floors, rooftop lounges, VIP terraces, and seating sections for SKYPARK venues.
            </p>
          </div>

          <CreateButton
            label="Add New Zone"
            onClick={handleOpenCreate}
          />
        </div>

        {/* ── Multi-Venue Filter Tabs ── */}
        <div className="relative">
          <div
            className="flex items-center gap-1 overflow-x-auto no-scrollbar rounded-xl p-1 border"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderColor: 'var(--color-border)',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setVenueFilter('all')
                setPage(1)
              }}
              className={`inline-flex items-center gap-2.5 h-10 px-3.5 rounded-xl text-sm transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                venueFilter === 'all'
                  ? 'shadow-xs font-semibold'
                  : 'hover:bg-black/5 dark:hover:bg-white/5'
              }`}
              style={
                venueFilter === 'all'
                  ? {
                      background: 'var(--color-surface, #1e2230)',
                      color: 'var(--color-text, #ffffff)',
                      border: '1px solid var(--color-border)',
                    }
                  : { color: 'var(--color-muted, #94a3b8)' }
              }
            >
              <Building2 size={18} className="shrink-0 text-[#126973] dark:text-[#F1D8C2]" />
              <span>All Venues</span>
              <span
                className="inline-flex items-center justify-center rounded-lg px-2 h-5 text-[11px] font-semibold"
                style={{
                  background: venueFilter === 'all' ? 'rgba(18, 105, 115, 0.18)' : 'rgba(255, 255, 255, 0.06)',
                  color: venueFilter === 'all' ? 'var(--color-500, #126973)' : 'var(--color-muted, #94a3b8)',
                }}
              >
                {venueZoneCounts.all}
              </span>
            </button>

            {outlets.map((outlet) => {
              const isActive = String(venueFilter) === String(outlet.id)
              const icon = getOutletIcon(outlet.type)
              return (
                <button
                  key={outlet.id}
                  type="button"
                  onClick={() => {
                    setVenueFilter(String(outlet.id))
                    setPage(1)
                  }}
                  className={`inline-flex items-center gap-2.5 h-10 px-3.5 rounded-xl text-sm transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'shadow-xs font-semibold'
                      : 'hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                  style={
                    isActive
                      ? {
                          background: 'var(--color-surface, #1e2230)',
                          color: 'var(--color-text, #ffffff)',
                          border: '1px solid var(--color-border)',
                        }
                      : { color: 'var(--color-muted, #94a3b8)' }
                  }
                >
                  <span className="text-base leading-none">{icon}</span>
                  <span>{outlet.name}</span>
                  <span
                    className="inline-flex items-center justify-center rounded-lg px-2 h-5 text-[11px] font-semibold"
                    style={{
                      background: isActive ? 'rgba(18, 105, 115, 0.18)' : 'rgba(255, 255, 255, 0.06)',
                      color: isActive ? 'var(--color-500, #126973)' : 'var(--color-muted, #94a3b8)',
                    }}
                  >
                    {venueZoneCounts[outlet.id] || 0}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Search Bar ── */}
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
            placeholder="Search zone by name or venue..."
            className="bg-transparent border-none outline-none w-full text-xs placeholder:text-[var(--color-muted)] text-[var(--color-text)]"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="text-[11px] font-medium transition-colors hover:text-red-500 text-[var(--color-muted)]"
            >
              Clear
            </button>
          )}
        </div>

        {/* ── Main Zones Table ── */}
        <TableCard.Root>
          <Table aria-label="Floor Zones Management Table" sortDescriptor={sortDescriptor}>
            <Table.Header>
              <Table.Head
                id="name"
                label="Zone Name"
                isRowHeader
                allowsSorting
                sortDescriptor={sortDescriptor}
                onSort={handleSort}
              />
              <Table.Head
                id="outlet_name"
                label="Assigned Venue"
                allowsSorting
                sortDescriptor={sortDescriptor}
                onSort={handleSort}
              />
              <Table.Head
                id="floor_number"
                label="Floor Level"
                allowsSorting
                sortDescriptor={sortDescriptor}
                onSort={handleSort}
              />
              <Table.Head id="actions" className="text-right">
                Actions
              </Table.Head>
            </Table.Header>

            <Table.Body items={paginatedZones}>
              {(zone) => (
                <Table.Row key={zone.id} id={zone.id}>
                  {/* Zone Name */}
                  <Table.Cell>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-[6px] border flex items-center justify-center text-[#126973] dark:text-[#F1D8C2] shrink-0 shadow-2xs"
                        style={{
                          background: 'var(--color-bg)',
                          borderColor: 'var(--color-border)',
                        }}
                      >
                        <Layers size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-xs" style={{ color: 'var(--color-text)' }}>
                          {zone.name}
                        </p>
                        <span className="text-[10px] text-[var(--color-muted)] font-mono">
                          ID: #{zone.id}
                        </span>
                      </div>
                    </div>
                  </Table.Cell>

                  {/* Assigned Venue */}
                  <Table.Cell>
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] border text-xs font-semibold"
                      style={{
                        background: 'var(--color-bg)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text)',
                      }}
                    >
                      <span>{getOutletIcon(zone.outlet_type)}</span>
                      <span>{zone.outlet_name}</span>
                      <span className="text-[10px] font-mono text-[var(--color-muted)]">
                        ({zone.outlet_code})
                      </span>
                    </span>
                  </Table.Cell>

                  {/* Floor Level */}
                  <Table.Cell>
                    <span className="px-2.5 py-1 rounded-[5px] text-xs font-mono font-bold bg-[#126973]/15 text-[#126973] dark:text-[#F1D8C2]">
                      Floor {zone.floor_number}
                    </span>
                  </Table.Cell>

                  {/* Actions */}
                  <Table.Cell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(zone)}
                        className="p-1.5 rounded-[5px] text-slate-400 hover:text-[#126973] hover:bg-[#126973]/10 dark:hover:text-[#F1D8C2] transition-all cursor-pointer"
                        title="Edit Zone"
                      >
                        <Edit01 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(zone.id)}
                        className="p-1.5 rounded-[5px] text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all cursor-pointer"
                        title="Delete Zone"
                      >
                        <Trash01 size={15} />
                      </button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>

          {/* Pagination */}
          <div className="p-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <PaginationPageMinimalCenter
              page={page}
              total={totalPages}
              onPageChange={setPage}
            />
          </div>
        </TableCard.Root>

        {/* ── Create / Edit Zone Modal ── */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div
              className="rounded-[6px] border max-w-md w-full p-6 shadow-2xl space-y-5"
              style={{
                background: 'var(--color-card)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div
                className="flex items-center justify-between border-b pb-3"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <div>
                  <h3 className="text-base font-extrabold" style={{ color: 'var(--color-text)' }}>
                    {editingZoneId ? 'Edit Floor Zone' : 'Add New Floor Zone'}
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                    Configure floor area and assigned SKYPARK venue.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                    Assigned Venue *
                  </label>
                  <select
                    required
                    value={formData.outlet_id}
                    onChange={(e) => setFormData({ ...formData, outlet_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-[5px] border outline-none font-bold"
                    style={{
                      background: 'var(--color-bg)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  >
                    <option value="" disabled>Select Venue...</option>
                    {outlets.map((o) => (
                      <option key={o.id} value={o.id}>
                        {getOutletIcon(o.type)} {o.name} ({o.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                      Zone Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Rooftop 45F Lounge"
                      className="w-full px-3.5 py-2.5 text-xs rounded-[5px] border outline-none font-bold"
                      style={{
                        background: 'var(--color-bg)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text)',
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                      Floor No. *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.floor_number}
                      onChange={(e) => setFormData({ ...formData, floor_number: e.target.value })}
                      placeholder="1"
                      className="w-full px-3.5 py-2.5 text-xs rounded-[5px] border outline-none font-bold"
                      style={{
                        background: 'var(--color-bg)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text)',
                      }}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold rounded-[5px] border hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    style={{
                      background: 'var(--color-bg)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white rounded-[5px] shadow-sm transition-all hover:opacity-90 active:scale-95 cursor-pointer"
                    style={{
                      background: 'linear-gradient(135deg, #126973, #0a434a)',
                    }}
                  >
                    {editingZoneId ? 'Update Zone' : 'Save Zone'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
