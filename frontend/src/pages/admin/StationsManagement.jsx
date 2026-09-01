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
import { SearchLg, Plus, Edit01, Trash01, Check, X, Monitor01 } from '@untitledui/icons'
import { Building2, Utensils, ShoppingCart, Wine, Coffee, Monitor, Printer, Network, Sliders } from 'lucide-react'
import toast from 'react-hot-toast'

export default function StationsManagement() {
  const [outlets, setOutlets] = useState([])
  const [stations, setStations] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [venueFilter, setVenueFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [page, setPage] = useState(1)
  const pageSize = 10

  const [sortDescriptor, setSortDescriptor] = useState({
    column: 'id',
    direction: 'ascending',
  })

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingStationId, setEditingStationId] = useState(null)
  const [formData, setFormData] = useState({
    outlet_id: '',
    name: '',
    type: 'kds',
    ip_address: '',
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const [outletsRes, stationsRes] = await Promise.all([
        axiosClient.get('/outlets'),
        axiosClient.get('/stations'),
      ])
      const outletsData = outletsRes.data?.data || []
      const stationsData = stationsRes.data?.data || []
      setOutlets(outletsData)
      setStations(stationsData)
    } catch (err) {
      console.error('Failed to load stations data:', err)
      toast.error('Failed to load routing stations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Map outlet info to each station
  const enrichedStations = useMemo(() => {
    const outletMap = {}
    outlets.forEach((o) => {
      outletMap[o.id] = o
    })

    return stations.map((st) => {
      const parent = outletMap[st.outlet_id]
      return {
        ...st,
        outlet_name: parent?.name || 'Unknown Venue',
        outlet_code: parent?.code || 'VENUE',
        outlet_type: parent?.type || 'dine_in',
      }
    })
  }, [stations, outlets])

  // Venue Counts
  const venueStationCounts = useMemo(() => {
    const counts = { all: enrichedStations.length }
    outlets.forEach((o) => {
      counts[o.id] = 0
    })
    enrichedStations.forEach((st) => {
      if (counts[st.outlet_id] !== undefined) counts[st.outlet_id]++
    })
    return counts
  }, [enrichedStations, outlets])

  // Filtered Stations
  const filteredStations = useMemo(() => {
    const q = search.toLowerCase().trim()
    return enrichedStations.filter((st) => {
      const matchSearch = q
        ? st.name.toLowerCase().includes(q) ||
          st.outlet_name.toLowerCase().includes(q) ||
          st.outlet_code.toLowerCase().includes(q) ||
          (st.ip_address && st.ip_address.toLowerCase().includes(q))
        : true

      const matchVenue = venueFilter === 'all' ? true : String(st.outlet_id) === String(venueFilter)
      const matchType = typeFilter === 'all' ? true : st.type === typeFilter
      return matchSearch && matchVenue && matchType
    })
  }, [enrichedStations, search, venueFilter, typeFilter])

  // Sorted Stations
  const sortedStations = useMemo(() => {
    const list = [...filteredStations]
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
  }, [filteredStations, sortDescriptor])

  const totalPages = Math.ceil(sortedStations.length / pageSize) || 1
  const paginatedStations = sortedStations.slice((page - 1) * pageSize, page * pageSize)

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
    setEditingStationId(null)
    setFormData({
      outlet_id: outlets[0]?.id ? String(outlets[0].id) : '',
      name: '',
      type: 'kds',
      ip_address: '',
    })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (station) => {
    setEditingStationId(station.id)
    setFormData({
      outlet_id: String(station.outlet_id),
      name: station.name,
      type: station.type,
      ip_address: station.ip_address || '',
    })
    setIsModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!formData.outlet_id) {
      toast.error('Please select a venue for this station')
      return
    }

    try {
      if (editingStationId) {
        await axiosClient.put(`/stations/${editingStationId}`, {
          outlet_id: Number(formData.outlet_id),
          name: formData.name,
          type: formData.type,
          ip_address: formData.ip_address || null,
        })
        toast.success('Routing Station updated successfully')
      } else {
        await axiosClient.post(`/outlets/${formData.outlet_id}/stations`, {
          name: formData.name,
          type: formData.type,
          ip_address: formData.ip_address || null,
        })
        toast.success('Routing Station created successfully')
      }
      setIsModalOpen(false)
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save station')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this station?')) return
    try {
      await axiosClient.delete(`/stations/${id}`)
      toast.success('Routing Station removed')
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete station')
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
              KDS Stations &amp; Routing Printers
            </h1>
            <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
              Configure Barista KDS, Kitchen display screens, ticket thermal printers, and order routing.
            </p>
          </div>

          <CreateButton
            label="Add New Station"
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
                {venueStationCounts.all}
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
                    {venueStationCounts[outlet.id] || 0}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Filters & Search Bar ── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)]">
              Device Type:
            </span>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value)
                setPage(1)
              }}
              className="px-3 py-1.5 text-xs rounded-[5px] border outline-none font-bold"
              style={{
                background: 'var(--color-card)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
            >
              <option value="all">All Devices</option>
              <option value="kds">📺 KDS Display Screen</option>
              <option value="printer">🖨️ Thermal Printer</option>
              <option value="cashier">💻 POS Terminal</option>
            </select>
          </div>

          {/* Search Box */}
          <div
            className="flex items-center gap-3 px-3.5 py-2 rounded-[5px] border text-xs max-w-md shadow-xs w-full sm:w-80"
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
              placeholder="Search station by name or IP..."
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
        </div>

        {/* ── Main Stations Table ── */}
        <TableCard.Root>
          <Table aria-label="Stations and Printers Management Table" sortDescriptor={sortDescriptor}>
            <Table.Header>
              <Table.Head
                id="name"
                label="Station Name"
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
                id="type"
                label="Device Type"
                allowsSorting
                sortDescriptor={sortDescriptor}
                onSort={handleSort}
              />
              <Table.Head
                id="ip_address"
                label="Network Address / Port"
                allowsSorting
                sortDescriptor={sortDescriptor}
                onSort={handleSort}
              />
              <Table.Head id="actions" className="text-right">
                Actions
              </Table.Head>
            </Table.Header>

            <Table.Body items={paginatedStations}>
              {(station) => (
                <Table.Row key={station.id} id={station.id}>
                  {/* Station Name */}
                  <Table.Cell>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-[6px] border flex items-center justify-center text-[#126973] dark:text-[#F1D8C2] shrink-0 shadow-2xs"
                        style={{
                          background: 'var(--color-bg)',
                          borderColor: 'var(--color-border)',
                        }}
                      >
                        {station.type === 'printer' ? <Printer size={18} /> : <Monitor size={18} />}
                      </div>
                      <div>
                        <p className="font-bold text-xs" style={{ color: 'var(--color-text)' }}>
                          {station.name}
                        </p>
                        <span className="text-[10px] text-[var(--color-muted)] font-mono">
                          ID: #{station.id}
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
                      <span>{getOutletIcon(station.outlet_type)}</span>
                      <span>{station.outlet_name}</span>
                      <span className="text-[10px] font-mono text-[var(--color-muted)]">
                        ({station.outlet_code})
                      </span>
                    </span>
                  </Table.Cell>

                  {/* Device Type */}
                  <Table.Cell>
                    <span
                      className="px-2.5 py-1 rounded-[5px] text-xs font-semibold uppercase font-mono border"
                      style={{
                        background: 'var(--color-bg)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text)',
                      }}
                    >
                      {station.type === 'kds' ? '📺 KDS Display' : station.type === 'printer' ? '🖨️ Printer' : '💻 POS Terminal'}
                    </span>
                  </Table.Cell>

                  {/* IP Address */}
                  <Table.Cell>
                    {station.ip_address ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400">
                        <Network size={13} />
                        {station.ip_address}
                      </span>
                    ) : (
                      <span className="text-xs text-[var(--color-muted)] italic">Direct Local / No IP</span>
                    )}
                  </Table.Cell>

                  {/* Actions */}
                  <Table.Cell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(station)}
                        className="p-1.5 rounded-[5px] text-slate-400 hover:text-[#126973] hover:bg-[#126973]/10 dark:hover:text-[#F1D8C2] transition-all cursor-pointer"
                        title="Edit Station"
                      >
                        <Edit01 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(station.id)}
                        className="p-1.5 rounded-[5px] text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all cursor-pointer"
                        title="Delete Station"
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

        {/* ── Create / Edit Station Modal ── */}
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
                    {editingStationId ? 'Edit Routing Station' : 'Add New Station'}
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                    Configure KDS display screen, ticket printer, or terminal routing.
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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                      Station Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Cocktail Bar KDS"
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
                      Device Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-[5px] border outline-none font-bold"
                      style={{
                        background: 'var(--color-bg)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text)',
                      }}
                    >
                      <option value="kds">📺 Kitchen/Bar KDS</option>
                      <option value="printer">🖨️ Thermal Printer</option>
                      <option value="cashier">💻 POS Terminal</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                    Network IP / Hostname (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.ip_address}
                    onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                    placeholder="e.g. 192.168.1.120:9100"
                    className="w-full px-3.5 py-2.5 text-xs rounded-[5px] border outline-none font-mono font-bold"
                    style={{
                      background: 'var(--color-bg)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  />
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
                    {editingStationId ? 'Update Station' : 'Save Station'}
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
