import { useState, useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
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
import { SearchLg, Plus, Edit01, Trash01, Check, X, Building07, LayersThree01, Monitor01 } from '@untitledui/icons'
import { Building2, Utensils, ShoppingCart, Wine, Coffee, Layers, Monitor, Network, Printer } from 'lucide-react'
import toast from 'react-hot-toast'

export default function OutletsManagement() {
  const location = useLocation()
  const navigate = useNavigate()

  // Determine active view mode based on path or query
  const viewMode = useMemo(() => {
    if (location.pathname === '/zones') return 'zones'
    if (location.pathname === '/stations') return 'stations'
    const params = new URLSearchParams(location.search)
    return params.get('tab') || 'outlets'
  }, [location.pathname, location.search])

  const [outlets, setOutlets] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [selectedOutletFilter, setSelectedOutletFilter] = useState('all')
  const [page, setPage] = useState(1)
  const pageSize = 10

  const [sortDescriptor, setSortDescriptor] = useState({
    column: 'id',
    direction: 'ascending',
  })

  // Selected outlet for detail/zone/station modals
  const [selectedOutlet, setSelectedOutlet] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false)
  const [isStationModalOpen, setIsStationModalOpen] = useState(false)

  // Edit IDs
  const [editingZoneId, setEditingZoneId] = useState(null)
  const [editingStationId, setEditingStationId] = useState(null)

  // Form states
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    code: '',
    type: 'cafe',
    description: '',
    has_tables: true,
    is_active: true,
  })

  const [zoneData, setZoneData] = useState({
    outlet_id: '',
    name: '',
    floor_number: 1,
  })

  const [stationData, setStationData] = useState({
    outlet_id: '',
    name: '',
    type: 'kds',
    ip_address: '',
  })

  const fetchOutlets = async () => {
    setLoading(true)
    try {
      const res = await axiosClient.get('/outlets')
      const data = res.data?.data || []
      setOutlets(data)
      if (selectedOutlet) {
        const refreshed = data.find((o) => o.id === selectedOutlet.id) || data[0] || null
        setSelectedOutlet(refreshed)
      }
    } catch (err) {
      console.error('Failed to load venues:', err)
      toast.error('Failed to load venue list')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOutlets()
  }, [])

  // Flattened All Zones across Outlets
  const allZones = useMemo(() => {
    const list = []
    outlets.forEach((o) => {
      if (Array.isArray(o.zones)) {
        o.zones.forEach((z) => {
          list.push({
            ...z,
            outlet_name: o.name,
            outlet_code: o.code,
            outlet_type: o.type,
          })
        })
      }
    })
    return list
  }, [outlets])

  // Flattened All Stations across Outlets
  const allStations = useMemo(() => {
    const list = []
    outlets.forEach((o) => {
      if (Array.isArray(o.stations)) {
        o.stations.forEach((st) => {
          list.push({
            ...st,
            outlet_name: o.name,
            outlet_code: o.code,
            outlet_type: o.type,
          })
        })
      }
    })
    return list
  }, [outlets])

  // Venue Counts
  const venueCounts = useMemo(() => {
    const counts = { all: outlets.length, cafe: 0, bar: 0, retail: 0, dine_in: 0 }
    outlets.forEach((o) => {
      if (counts[o.type] !== undefined) counts[o.type]++
    })
    return counts
  }, [outlets])

  // Filtered Items based on viewMode
  const filteredOutlets = useMemo(() => {
    const q = search.toLowerCase().trim()
    return outlets.filter((o) => {
      const matchSearch = q
        ? o.name.toLowerCase().includes(q) ||
          o.code.toLowerCase().includes(q) ||
          (o.description && o.description.toLowerCase().includes(q))
        : true

      const matchType = typeFilter === 'all' ? true : o.type === typeFilter
      return matchSearch && matchType
    })
  }, [outlets, search, typeFilter])

  const filteredZones = useMemo(() => {
    const q = search.toLowerCase().trim()
    return allZones.filter((z) => {
      const matchSearch = q
        ? z.name.toLowerCase().includes(q) ||
          z.outlet_name?.toLowerCase().includes(q) ||
          z.outlet_code?.toLowerCase().includes(q)
        : true
      const matchOutlet =
        selectedOutletFilter === 'all' ? true : String(z.outlet_id) === String(selectedOutletFilter)
      return matchSearch && matchOutlet
    })
  }, [allZones, search, selectedOutletFilter])

  const filteredStations = useMemo(() => {
    const q = search.toLowerCase().trim()
    return allStations.filter((st) => {
      const matchSearch = q
        ? st.name.toLowerCase().includes(q) ||
          st.outlet_name?.toLowerCase().includes(q) ||
          st.type?.toLowerCase().includes(q) ||
          (st.ip_address && st.ip_address.toLowerCase().includes(q))
        : true
      const matchOutlet =
        selectedOutletFilter === 'all' ? true : String(st.outlet_id) === String(selectedOutletFilter)
      return matchSearch && matchOutlet
    })
  }, [allStations, search, selectedOutletFilter])

  // Active current list for pagination
  const currentList = viewMode === 'zones' ? filteredZones : viewMode === 'stations' ? filteredStations : filteredOutlets
  const totalPages = Math.ceil(currentList.length / pageSize) || 1
  const paginatedList = currentList.slice((page - 1) * pageSize, page * pageSize)

  const handleSort = (columnId) => {
    setSortDescriptor((prev) => ({
      column: columnId,
      direction:
        prev.column === columnId && prev.direction === 'ascending'
          ? 'descending'
          : 'ascending',
    }))
  }

  // ── Outlet Actions ──
  const handleOpenCreateOutlet = () => {
    setFormData({
      id: '',
      name: '',
      code: '',
      type: 'cafe',
      description: '',
      has_tables: true,
      is_active: true,
    })
    setIsModalOpen(true)
  }

  const handleOpenEditOutlet = (outlet) => {
    setFormData({
      id: outlet.id,
      name: outlet.name,
      code: outlet.code,
      type: outlet.type,
      description: outlet.description || '',
      has_tables: outlet.has_tables,
      is_active: outlet.is_active,
    })
    setIsModalOpen(true)
  }

  const handleSaveOutlet = async (e) => {
    e.preventDefault()
    try {
      if (formData.id) {
        await axiosClient.put(`/outlets/${formData.id}`, {
          name: formData.name,
          type: formData.type,
          description: formData.description,
          has_tables: formData.has_tables,
          is_active: formData.is_active,
        })
        toast.success('Venue updated successfully')
      } else {
        await axiosClient.post('/outlets', formData)
        toast.success('Venue created successfully')
      }
      setIsModalOpen(false)
      fetchOutlets()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save venue')
    }
  }

  const handleDeleteOutlet = async (id) => {
    if (!confirm('Are you sure you want to delete this venue?')) return
    try {
      await axiosClient.delete(`/outlets/${id}`)
      toast.success('Venue removed')
      fetchOutlets()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete venue')
    }
  }

  // ── Zone Actions ──
  const handleOpenCreateZone = (outlet = null) => {
    const targetOutlet = outlet || outlets[0] || null
    setSelectedOutlet(targetOutlet)
    setZoneData({
      outlet_id: targetOutlet?.id ? String(targetOutlet.id) : (outlets[0]?.id ? String(outlets[0].id) : ''),
      name: '',
      floor_number: 1,
    })
    setEditingZoneId(null)
    setIsZoneModalOpen(true)
  }

  const handleEditZoneClick = (zone) => {
    setEditingZoneId(zone.id)
    setZoneData({
      outlet_id: String(zone.outlet_id),
      name: zone.name,
      floor_number: zone.floor_number,
    })
    const parent = outlets.find((o) => o.id === zone.outlet_id) || selectedOutlet
    setSelectedOutlet(parent)
    setIsZoneModalOpen(true)
  }

  const handleCancelEditZone = () => {
    setEditingZoneId(null)
    setZoneData({ outlet_id: selectedOutlet?.id ? String(selectedOutlet.id) : '', name: '', floor_number: 1 })
  }

  const handleSaveZone = async (e) => {
    e.preventDefault()
    const targetOutletId = zoneData.outlet_id || selectedOutlet?.id
    if (!targetOutletId) {
      toast.error('Please select a venue for this zone')
      return
    }

    try {
      if (editingZoneId) {
        await axiosClient.put(`/zones/${editingZoneId}`, {
          outlet_id: Number(targetOutletId),
          name: zoneData.name,
          floor_number: Number(zoneData.floor_number) || 1,
        })
        toast.success('Zone updated')
      } else {
        await axiosClient.post(`/outlets/${targetOutletId}/zones`, {
          name: zoneData.name,
          floor_number: Number(zoneData.floor_number) || 1,
        })
        toast.success('Zone created')
      }
      setZoneData({ outlet_id: targetOutletId, name: '', floor_number: 1 })
      setEditingZoneId(null)
      setIsZoneModalOpen(false)
      fetchOutlets()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save zone')
    }
  }

  const handleDeleteZone = async (zoneId) => {
    if (!confirm('Delete this zone?')) return
    try {
      await axiosClient.delete(`/zones/${zoneId}`)
      toast.success('Zone removed')
      fetchOutlets()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete zone')
    }
  }

  // ── Station Actions ──
  const handleOpenCreateStation = (outlet = null) => {
    const targetOutlet = outlet || outlets[0] || null
    setSelectedOutlet(targetOutlet)
    setStationData({
      outlet_id: targetOutlet?.id ? String(targetOutlet.id) : (outlets[0]?.id ? String(outlets[0].id) : ''),
      name: '',
      type: 'kds',
      ip_address: '',
    })
    setEditingStationId(null)
    setIsStationModalOpen(true)
  }

  const handleEditStationClick = (station) => {
    setEditingStationId(station.id)
    setStationData({
      outlet_id: String(station.outlet_id),
      name: station.name,
      type: station.type,
      ip_address: station.ip_address || '',
    })
    const parent = outlets.find((o) => o.id === station.outlet_id) || selectedOutlet
    setSelectedOutlet(parent)
    setIsStationModalOpen(true)
  }

  const handleCancelEditStation = () => {
    setEditingStationId(null)
    setStationData({ outlet_id: selectedOutlet?.id ? String(selectedOutlet.id) : '', name: '', type: 'kds', ip_address: '' })
  }

  const handleSaveStation = async (e) => {
    e.preventDefault()
    const targetOutletId = stationData.outlet_id || selectedOutlet?.id
    if (!targetOutletId) {
      toast.error('Please select a venue for this station')
      return
    }

    try {
      if (editingStationId) {
        await axiosClient.put(`/stations/${editingStationId}`, {
          outlet_id: Number(targetOutletId),
          name: stationData.name,
          type: stationData.type,
          ip_address: stationData.ip_address || null,
        })
        toast.success('Station updated')
      } else {
        await axiosClient.post(`/outlets/${targetOutletId}/stations`, {
          name: stationData.name,
          type: stationData.type,
          ip_address: stationData.ip_address || null,
        })
        toast.success('Station created')
      }
      setStationData({ outlet_id: targetOutletId, name: '', type: 'kds', ip_address: '' })
      setEditingStationId(null)
      setIsStationModalOpen(false)
      fetchOutlets()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save station')
    }
  }

  const handleDeleteStation = async (stationId) => {
    if (!confirm('Delete this station?')) return
    try {
      await axiosClient.delete(`/stations/${stationId}`)
      toast.success('Station removed')
      fetchOutlets()
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
        {/* ── 1. Top Header Row ── */}
        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div>
            <div className="flex items-center gap-2">
              <h1
                className="text-xl font-extrabold tracking-tight"
                style={{ color: 'var(--color-text)' }}
              >
                {viewMode === 'zones'
                  ? 'Floor Zones & Dining Areas'
                  : viewMode === 'stations'
                  ? 'KDS Stations & Routing Printers'
                  : 'Venues & Multi-Outlet Management'}
              </h1>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
              {viewMode === 'zones'
                ? 'Manage physical floors, dining sections, rooftop terraces, and VIP lounges.'
                : viewMode === 'stations'
                ? 'Configure Barista KDS, Kitchen screens, thermal printers, and POS terminals.'
                : 'Manage SKYPARK business units (Cafe, SkyBar, Mart, Grand Dining), zones, and routing.'}
            </p>
          </div>

          <CreateButton
            label={
              viewMode === 'zones'
                ? 'Add New Zone'
                : viewMode === 'stations'
                ? 'Add New Station'
                : 'Add New Venue'
            }
            onClick={() => {
              if (viewMode === 'zones') handleOpenCreateZone()
              else if (viewMode === 'stations') handleOpenCreateStation()
              else handleOpenCreateOutlet()
            }}
          />
        </div>

        {/* ── 2. Top Level Architecture Mode Switcher ── */}
        <div
          className="flex items-center gap-1.5 p-1 rounded-xl border max-w-fit"
          style={{
            background: 'var(--color-card)',
            borderColor: 'var(--color-border)',
          }}
        >
          <button
            type="button"
            onClick={() => {
              navigate('/outlets')
              setPage(1)
            }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'outlets'
                ? 'bg-[#126973] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <Building2 size={16} />
            <span>1. Outlets &amp; Venues ({outlets.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              navigate('/zones')
              setPage(1)
            }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'zones'
                ? 'bg-[#126973] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <Layers size={16} />
            <span>2. Floor Zones ({allZones.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              navigate('/stations')
              setPage(1)
            }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'stations'
                ? 'bg-[#126973] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <Monitor size={16} />
            <span>3. KDS &amp; Stations ({allStations.length})</span>
          </button>
        </div>

        {/* ── 3. Filters & Search Bar ── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Multi-Venue Category Tabs (for Outlets View) or Outlet Selector (for Zones/Stations) */}
          {viewMode === 'outlets' ? (
            <div className="relative overflow-x-auto no-scrollbar">
              <div
                className="flex items-center gap-1 rounded-xl p-1 border"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderColor: 'var(--color-border)',
                }}
              >
                {[
                  { id: 'all', label: 'All Venues', icon: Building2, count: venueCounts.all },
                  { id: 'cafe', label: 'Cafe & Bakery', icon: Coffee, count: venueCounts.cafe },
                  { id: 'bar', label: 'SkyBar & Lounge', icon: Wine, count: venueCounts.bar },
                  { id: 'retail', label: 'Supermarket / Mart', icon: ShoppingCart, count: venueCounts.retail },
                  { id: 'dine_in', label: 'Grand Restaurant', icon: Utensils, count: venueCounts.dine_in },
                ].map((tab) => {
                  const Icon = tab.icon
                  const isActive = typeFilter === tab.id
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setTypeFilter(tab.id)
                        setPage(1)
                      }}
                      className={`inline-flex items-center gap-2 h-9 px-3 rounded-lg text-xs transition-all whitespace-nowrap shrink-0 cursor-pointer ${
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
                          : {
                              color: 'var(--color-muted, #94a3b8)',
                            }
                      }
                    >
                      <Icon size={15} className="shrink-0 text-[#126973] dark:text-[#F1D8C2]" />
                      <span>{tab.label}</span>
                      <span
                        className="inline-flex items-center justify-center rounded px-1.5 h-4.5 text-[10px] font-semibold"
                        style={{
                          background: isActive
                            ? 'rgba(18, 105, 115, 0.18)'
                            : 'rgba(255, 255, 255, 0.06)',
                          color: isActive ? 'var(--color-500, #126973)' : 'var(--color-muted, #94a3b8)',
                        }}
                      >
                        {tab.count}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)]">
                Filter Venue:
              </span>
              <select
                value={selectedOutletFilter}
                onChange={(e) => {
                  setSelectedOutletFilter(e.target.value)
                  setPage(1)
                }}
                className="px-3 py-1.5 text-xs rounded-[5px] border outline-none font-bold"
                style={{
                  background: 'var(--color-card)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                }}
              >
                <option value="all">🏢 All Venues ({outlets.length})</option>
                {outlets.map((o) => (
                  <option key={o.id} value={o.id}>
                    {getOutletIcon(o.type)} {o.name} ({o.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Search Box */}
          <div
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-[5px] border text-xs min-w-[240px] max-w-sm shadow-xs"
            style={{
              background: 'var(--color-card)',
              borderColor: 'var(--color-border)',
            }}
          >
            <SearchLg size={15} className="text-[var(--color-muted)] shrink-0" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder={`Search ${viewMode}...`}
              className="bg-transparent border-none outline-none w-full text-xs placeholder:text-[var(--color-muted)] text-[var(--color-text)]"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="text-[10px] font-bold transition-colors hover:text-red-500 text-[var(--color-muted)]"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* ── 4. Main Tables (Dynamic depending on viewMode) ── */}
        {viewMode === 'outlets' && (
          <TableCard.Root>
            <Table aria-label="Venues and Outlets Management Table" sortDescriptor={sortDescriptor}>
              <Table.Header>
                <Table.Head id="name" label="Venue Name" isRowHeader allowsSorting sortDescriptor={sortDescriptor} onSort={handleSort} />
                <Table.Head id="type" label="Venue Type" allowsSorting sortDescriptor={sortDescriptor} onSort={handleSort} />
                <Table.Head id="has_tables" label="Floor Plan Mode" allowsSorting sortDescriptor={sortDescriptor} onSort={handleSort} />
                <Table.Head id="zones" label="Zones & Floors" allowsSorting sortDescriptor={sortDescriptor} onSort={handleSort} />
                <Table.Head id="stations" label="KDS & Routing" allowsSorting sortDescriptor={sortDescriptor} onSort={handleSort} />
                <Table.Head id="is_active" label="Status" allowsSorting sortDescriptor={sortDescriptor} onSort={handleSort} />
                <Table.Head id="actions" className="text-right">Actions</Table.Head>
              </Table.Header>

              <Table.Body items={paginatedList}>
                {(outlet) => {
                  const zoneCount = outlet.zones?.length || 0
                  const stationCount = outlet.stations?.length || 0
                  const icon = getOutletIcon(outlet.type)

                  return (
                    <Table.Row key={outlet.id} id={outlet.id}>
                      <Table.Cell>
                        <div className="flex items-center gap-3">
                        
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-xs truncate leading-snug" style={{ color: 'var(--color-text)' }}>
                                {outlet.name}
                              </p>
                            </div>
                            {outlet.description && (
                              <p className="text-[11px] truncate max-w-xs opacity-75" style={{ color: 'var(--color-muted)' }}>
                                {outlet.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </Table.Cell>

                      <Table.Cell>
                        <span
                          className="px-2.5 py-0.5 rounded-[5px] border font-medium inline-block text-[11px] capitalize"
                          style={{
                            background: 'var(--color-bg)',
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-text)',
                          }}
                        >
                          {outlet.type.replace('_', ' ')}
                        </span>
                      </Table.Cell>

                      <Table.Cell>
                        {outlet.has_tables ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                            <span>🍽️ Table Dining</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                            <span>🛒 Quick Scan Counter</span>
                          </span>
                        )}
                      </Table.Cell>

                      <Table.Cell>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOutlet(outlet)
                            navigate('/zones')
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] text-xs font-semibold border transition-all hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                          style={{
                            background: 'var(--color-bg)',
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-text)',
                          }}
                        >
                          <Layers size={13} className="text-[#126973] dark:text-[#F1D8C2]" />
                          <span>{zoneCount} Zones</span>
                        </button>
                      </Table.Cell>

                      <Table.Cell>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOutlet(outlet)
                            navigate('/stations')
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] text-xs font-semibold border transition-all hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                          style={{
                            background: 'var(--color-bg)',
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-text)',
                          }}
                        >
                          <Monitor size={13} className="text-[#126973] dark:text-[#F1D8C2]" />
                          <span>{stationCount} Stations</span>
                        </button>
                      </Table.Cell>

                      <Table.Cell>
                        {outlet.is_active ? (
                          <BadgeWithIcon size="sm" color="success" iconLeading={Check} className="font-semibold capitalize">
                            Active
                          </BadgeWithIcon>
                        ) : (
                          <BadgeWithIcon size="sm" color="gray" iconLeading={X} className="font-semibold capitalize">
                            Disabled
                          </BadgeWithIcon>
                        )}
                      </Table.Cell>

                      <Table.Cell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditOutlet(outlet)}
                            className="p-1.5 rounded-[5px] text-slate-400 hover:text-[#126973] hover:bg-[#126973]/10 dark:hover:text-[#F1D8C2] transition-all cursor-pointer"
                            title="Edit Venue"
                          >
                            <Edit01 size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteOutlet(outlet.id)}
                            className="p-1.5 rounded-[5px] text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all cursor-pointer"
                            title="Delete Venue"
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
            <div className="p-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <PaginationPageMinimalCenter page={page} total={totalPages} onPageChange={setPage} />
            </div>
          </TableCard.Root>
        )}

        {viewMode === 'zones' && (
          <TableCard.Root>
            <Table aria-label="Floor Zones Management Table">
              <Table.Header>
                <Table.Head id="name" label="Zone Name" isRowHeader />
                <Table.Head id="outlet" label="Assigned Venue" />
                <Table.Head id="floor" label="Floor Level" />
                <Table.Head id="actions" className="text-right">Actions</Table.Head>
              </Table.Header>

              <Table.Body items={paginatedList}>
                {(zone) => (
                  <Table.Row key={zone.id} id={zone.id}>
                    <Table.Cell>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-[5px] bg-[#126973]/15 text-[#126973] dark:text-[#F1D8C2] flex items-center justify-center font-bold text-xs">
                          <Layers size={15} />
                        </div>
                        <p className="font-bold text-xs" style={{ color: 'var(--color-text)' }}>
                          {zone.name}
                        </p>
                      </div>
                    </Table.Cell>

                    <Table.Cell>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[5px] border text-xs font-semibold" style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
                        <span>{getOutletIcon(zone.outlet_type)}</span>
                        <span>{zone.outlet_name}</span>
                        <span className="text-[10px] text-[var(--color-muted)] font-mono">({zone.outlet_code})</span>
                      </span>
                    </Table.Cell>

                    <Table.Cell>
                      <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        Floor {zone.floor_number}
                      </span>
                    </Table.Cell>

                    <Table.Cell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleEditZoneClick(zone)}
                          className="p-1.5 rounded-[5px] text-slate-400 hover:text-[#126973] hover:bg-[#126973]/10 dark:hover:text-[#F1D8C2] transition-all cursor-pointer"
                          title="Edit Zone"
                        >
                          <Edit01 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteZone(zone.id)}
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
            <div className="p-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <PaginationPageMinimalCenter page={page} total={totalPages} onPageChange={setPage} />
            </div>
          </TableCard.Root>
        )}

        {viewMode === 'stations' && (
          <TableCard.Root>
            <Table aria-label="Stations and Printers Management Table">
              <Table.Header>
                <Table.Head id="name" label="Station Name" isRowHeader />
                <Table.Head id="outlet" label="Assigned Venue" />
                <Table.Head id="type" label="Station Type" />
                <Table.Head id="ip" label="Network IP / Port" />
                <Table.Head id="actions" className="text-right">Actions</Table.Head>
              </Table.Header>

              <Table.Body items={paginatedList}>
                {(station) => (
                  <Table.Row key={station.id} id={station.id}>
                    <Table.Cell>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-[5px] bg-[#0E7490]/15 text-[#0E7490] dark:text-[#38BDF8] flex items-center justify-center font-bold text-xs">
                          {station.type === 'printer' ? <Printer size={15} /> : <Monitor size={15} />}
                        </div>
                        <p className="font-bold text-xs" style={{ color: 'var(--color-text)' }}>
                          {station.name}
                        </p>
                      </div>
                    </Table.Cell>

                    <Table.Cell>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[5px] border text-xs font-semibold" style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
                        <span>{getOutletIcon(station.outlet_type)}</span>
                        <span>{station.outlet_name}</span>
                        <span className="text-[10px] text-[var(--color-muted)] font-mono">({station.outlet_code})</span>
                      </span>
                    </Table.Cell>

                    <Table.Cell>
                      <span className="px-2.5 py-0.5 rounded-[5px] border text-xs font-semibold uppercase font-mono" style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
                        {station.type}
                      </span>
                    </Table.Cell>

                    <Table.Cell>
                      {station.ip_address ? (
                        <span className="inline-flex items-center gap-1 text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400">
                          <Network size={12} />
                          {station.ip_address}
                        </span>
                      ) : (
                        <span className="text-xs text-[var(--color-muted)] italic">No IP assigned</span>
                      )}
                    </Table.Cell>

                    <Table.Cell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleEditStationClick(station)}
                          className="p-1.5 rounded-[5px] text-slate-400 hover:text-[#126973] hover:bg-[#126973]/10 dark:hover:text-[#F1D8C2] transition-all cursor-pointer"
                          title="Edit Station"
                        >
                          <Edit01 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteStation(station.id)}
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
            <div className="p-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <PaginationPageMinimalCenter page={page} total={totalPages} onPageChange={setPage} />
            </div>
          </TableCard.Root>
        )}

        {/* ── Venue Modal (Create / Edit) ── */}
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
                <h3 className="text-base font-extrabold" style={{ color: 'var(--color-text)' }}>
                  {formData.id ? 'Edit Venue' : 'Create New Venue'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveOutlet} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                    Venue Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. SKYPARK SkyBar"
                    className="w-full px-3.5 py-2.5 text-xs rounded-[5px] border outline-none font-bold transition-colors"
                    style={{
                      background: 'var(--color-bg)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                      Code Identifier *
                    </label>
                    <input
                      type="text"
                      required
                      disabled={Boolean(formData.id)}
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="e.g. BAR"
                      className="w-full px-3.5 py-2.5 text-xs rounded-[5px] border outline-none font-mono font-bold transition-colors uppercase"
                      style={{
                        background: 'var(--color-bg)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text)',
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                      Venue Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-[5px] border outline-none font-bold transition-colors"
                      style={{
                        background: 'var(--color-bg)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text)',
                      }}
                    >
                      <option value="cafe">☕ Cafe &amp; Bakery</option>
                      <option value="bar">🍸 SkyBar &amp; Lounge</option>
                      <option value="retail">🛒 Supermarket / Mart</option>
                      <option value="dine_in">🍽️ Grand Restaurant</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Venue floor, seating capacity, offerings..."
                    className="w-full px-3.5 py-2 text-xs rounded-[5px] border outline-none resize-none leading-relaxed transition-colors"
                    style={{
                      background: 'var(--color-bg)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  />
                </div>

                <div className="flex items-center gap-6 pt-1">
                  <label className="flex items-center gap-2.5 text-xs font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.has_tables}
                      onChange={(e) => setFormData({ ...formData, has_tables: e.target.checked })}
                      className="w-4 h-4 rounded-[4px] accent-[#126973]"
                    />
                    Requires Table Plan
                  </label>

                  <label className="flex items-center gap-2.5 text-xs font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 rounded-[4px] accent-[#126973]"
                    />
                    Is Active
                  </label>
                </div>

                <div
                  className="flex justify-end gap-2.5 pt-4 border-t"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold rounded-[5px] border transition-all hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
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
                    Save Venue
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Zone Modal (Create / Edit) ── */}
        {isZoneModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div
              className="rounded-[6px] border max-w-md w-full p-6 shadow-2xl space-y-4"
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
                    Configure floor area and assigned venue.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsZoneModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveZone} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                    Assigned Venue *
                  </label>
                  <select
                    required
                    value={zoneData.outlet_id}
                    onChange={(e) => setZoneData({ ...zoneData, outlet_id: e.target.value })}
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
                      value={zoneData.name}
                      onChange={(e) => setZoneData({ ...zoneData, name: e.target.value })}
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
                      value={zoneData.floor_number}
                      onChange={(e) => setZoneData({ ...zoneData, floor_number: e.target.value })}
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
                    onClick={() => setIsZoneModalOpen(false)}
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

        {/* ── Station Modal (Create / Edit) ── */}
        {isStationModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div
              className="rounded-[6px] border max-w-md w-full p-6 shadow-2xl space-y-4"
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
                    {editingStationId ? 'Edit Station' : 'Add New Station'}
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                    Configure KDS display or printer routing.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsStationModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveStation} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                    Assigned Venue *
                  </label>
                  <select
                    required
                    value={stationData.outlet_id}
                    onChange={(e) => setStationData({ ...stationData, outlet_id: e.target.value })}
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
                      value={stationData.name}
                      onChange={(e) => setStationData({ ...stationData, name: e.target.value })}
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
                      value={stationData.type}
                      onChange={(e) => setStationData({ ...stationData, type: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-[5px] border outline-none font-bold"
                      style={{
                        background: 'var(--color-bg)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text)',
                      }}
                    >
                      <option value="kds">Kitchen/Bar KDS</option>
                      <option value="printer">Thermal Printer</option>
                      <option value="cashier">POS Terminal</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                    Network IP / Hostname (Optional)
                  </label>
                  <input
                    type="text"
                    value={stationData.ip_address}
                    onChange={(e) => setStationData({ ...stationData, ip_address: e.target.value })}
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
                    onClick={() => setIsStationModalOpen(false)}
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
