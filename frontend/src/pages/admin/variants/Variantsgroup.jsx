import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../../components/layout/AdminLayout'
import OptionGroupCreateView from '../../../components/admin/OptionGroupCreateView'
import { adminApi } from '../../../api/adminApi'
import axiosClient from '../../../api/axiosClient'
import { BadgeWithIcon } from '../../../components/TablesComponents'
import { CreateButton } from '../../../components/common/ButtonComponent'
import { Check, X, SearchLg, Plus, Edit01, Trash01 } from '@untitledui/icons'
import {
  SlidersHorizontal,
  Tag,
  CircleDot,
  CheckSquare,
  AlertCircle,
  Building2,
  Coffee,
  Wine,
  ShoppingCart,
  Utensils,
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles,
  DollarSign,
  LayoutGrid,
  Table as TableIcon
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function Variantsgroup() {
  const [groups, setGroups] = useState([])
  const [outlets, setOutlets] = useState([])
  const [outletFilter, setOutletFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [activeView, setActiveView] = useState('list') // 'list' | 'create' | 'edit'
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [collapsedVenues, setCollapsedVenues] = useState({})

  const getOutletIcon = (type, size = 16, className = '') => {
    switch (type) {
      case 'cafe':
        return <Coffee size={size} className={className || "text-amber-600 dark:text-amber-400 shrink-0"} />
      case 'bar':
        return <Wine size={size} className={className || "text-purple-600 dark:text-purple-400 shrink-0"} />
      case 'retail':
        return <ShoppingCart size={size} className={className || "text-emerald-600 dark:text-emerald-400 shrink-0"} />
      case 'dine_in':
      default:
        return <Utensils size={size} className={className || "text-[#126973] dark:text-[#F1D8C2] shrink-0"} />
    }
  }

  const loadData = async () => {
    try {
      const [grpRes, outRes] = await Promise.all([
        adminApi.getOptionGroups().catch(() => ({ data: { data: [] } })),
        axiosClient.get('/outlets').catch(() => ({ data: { data: [] } })),
      ])
      setGroups(grpRes.data?.data || [])
      setOutlets(outRes.data?.data || [])
    } catch {
      // silent
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Build Venue Grouped Data
  const venueGroups = useMemo(() => {
    const q = search.toLowerCase().trim()

    // 1. Map physical outlets
    const list = outlets.map((outlet) => {
      const venueGroupsList = groups.filter((g) => String(g.outlet_id) === String(outlet.id))

      const filteredGroups = venueGroupsList.filter((g) => {
        if (q) {
          const matchName = g.name?.toLowerCase().includes(q)
          const matchVal = g.values && g.values.some((v) => v.name?.toLowerCase().includes(q))
          return matchName || matchVal
        }
        return true
      })

      return {
        id: String(outlet.id),
        venue: outlet,
        isGlobal: false,
        groups: filteredGroups,
        totalGroups: venueGroupsList.length,
        singleCount: venueGroupsList.filter((g) => g.type === 'single').length,
        multiCount: venueGroupsList.filter((g) => g.type === 'multiple').length,
      }
    })

    // 2. Global / Unassigned option groups
    const globalGroups = groups.filter((g) => !g.outlet_id || g.outlet_id === 0)
    const filteredGlobalGroups = globalGroups.filter((g) => {
      if (q) {
        const matchName = g.name?.toLowerCase().includes(q)
        const matchVal = g.values && g.values.some((v) => v.name?.toLowerCase().includes(q))
        return matchName || matchVal
      }
      return true
    })

    if (globalGroups.length > 0 || outletFilter === 'global') {
      list.push({
        id: 'global',
        venue: {
          id: 'global',
          name: 'Global / Shared Variants',
          code: 'GLOBAL',
          type: 'global',
          description: 'Option groups available across all venues'
        },
        isGlobal: true,
        groups: filteredGlobalGroups,
        totalGroups: globalGroups.length,
        singleCount: globalGroups.filter((g) => g.type === 'single').length,
        multiCount: globalGroups.filter((g) => g.type === 'multiple').length,
      })
    }

    // Filter by active outlet tab
    if (outletFilter === 'all') return list
    if (outletFilter === 'global') return list.filter((g) => g.isGlobal)
    return list.filter((g) => String(g.venue.id) === String(outletFilter))
  }, [outlets, groups, search, outletFilter])

  // Handlers
  const handleOpenCreate = (outletId = null) => {
    setSelectedGroup(outletId ? { outlet_id: outletId } : null)
    setActiveView('create')
  }

  const handleOpenEdit = (grp) => {
    setSelectedGroup(grp)
    setActiveView('edit')
  }

  const handleCloseView = () => {
    setSelectedGroup(null)
    setActiveView('list')
  }

  const handleSaveGroup = async (payload) => {
    try {
      if (activeView === 'create') {
        await adminApi.createOptionGroup(payload)
        toast.success('Option group created successfully')
      } else if (selectedGroup?.id) {
        await adminApi.updateOptionGroup(selectedGroup.id, payload)
        toast.success('Option group updated successfully')
      }
      loadData()
      handleCloseView()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this option group? Product attachments may be affected.')) return
    try {
      await adminApi.deleteOptionGroup(id)
      setGroups((prev) => prev.filter((g) => g.id !== id))
      toast.success('Option group removed')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete option group')
    }
  }

  const isGroupCollapsed = (groupId) => {
    if (collapsedVenues[groupId] !== undefined) {
      return Boolean(collapsedVenues[groupId])
    }
    // Default to COLLAPSED when page loads/refreshes
    return true
  }

  const toggleCollapse = (id) => {
    setCollapsedVenues((prev) => {
      const current = prev[id] !== undefined ? prev[id] : true
      return {
        ...prev,
        [id]: !current
      }
    })
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* If creating or editing, show full OptionGroupCreateView */}
        {activeView !== 'list' ? (
          <OptionGroupCreateView
            item={selectedGroup}
            onClose={handleCloseView}
            onSave={handleSaveGroup}
          />
        ) : (
          <>
            {/* Header */}
            <div
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div>
                <h1
                  className="text-xl font-extrabold tracking-tight"
                  style={{ color: 'var(--color-text)' }}
                >
                  Variants Groups
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Manage option groups, modifiers, and addons grouped by physical venues & outlets
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* <div
                  className="flex items-center p-1 rounded-xl border gap-1"
                  style={{
                    background: 'var(--color-surface, #ffffff)',
                    borderColor: 'var(--color-border)'
                  }}
                >
                  <Link
                    to="/options"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <TableIcon size={14} />
                    <span>Table View</span>
                  </Link>
                  <div
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-all"
                    style={{
                      background: 'var(--color-500, #126973)',
                      color: '#ffffff'
                    }}
                  >
                    <LayoutGrid size={14} />
                    <span>Group Cards</span>
                  </div>
                </div> */}

                <CreateButton
                  label="Add Option Group"
                  onClick={() => handleOpenCreate(outletFilter !== 'all' && outletFilter !== 'global' ? outletFilter : null)}
                />
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex items-center justify-between gap-3">
              <div
                className="flex items-center gap-3 px-3.5 py-2 rounded-[5px] border text-xs min-w-[240px] max-w-sm shadow-xs w-full sm:w-auto"
                style={{
                  background: 'var(--color-card)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <SearchLg size={16} className="text-[var(--color-muted)] shrink-0 stroke-[2px]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search option groups or choices..."
                  className="bg-transparent border-none outline-none w-full text-xs placeholder:text-[var(--color-muted)] text-[var(--color-text)]"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="text-[11px] font-medium transition-colors hover:text-red-500 text-[var(--color-muted)] cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* ═════════ VENUE GROUP CARDS (ONLY GROUP STYLE) ═════════ */}
            {venueGroups.length === 0 ? (
              <div
                className="p-12 rounded-xl border text-center space-y-3"
                style={{
                  background: 'var(--color-surface)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <div className="w-12 h-12 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center mx-auto text-slate-400">
                  <SlidersHorizontal size={24} />
                </div>
                <h3 className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>
                  No option groups found
                </h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  {search ? `No results match "${search}"` : 'Get started by creating an option group'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {venueGroups.map((group) => {
                  const isCollapsed = isGroupCollapsed(group.id)
                  const venueOutletId = group.isGlobal ? null : group.venue.id

                  return (
                    <div
                      key={group.id}
                      className="rounded-xl border shadow-xs overflow-hidden transition-all duration-200"
                      style={{
                        background: 'var(--color-surface, #1e2230)',
                        borderColor: 'var(--color-border)'
                      }}
                    >
                      {/* Venue Group Header */}
                      <div
                        onClick={() => toggleCollapse(group.id)}
                        className={`px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 cursor-pointer select-none transition-colors hover:bg-black/5 dark:hover:bg-white/5 ${
                          !isCollapsed ? 'border-b' : ''
                        }`}
                        style={{
                          background: 'rgba(255, 255, 255, 0.02)',
                          borderColor: 'var(--color-border)'
                        }}
                      >
                        {/* Venue Title & Info */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h2 className="text-sm sm:text-base font-bold tracking-tight truncate" style={{ color: 'var(--color-text)' }}>
                                {group.venue.name}
                              </h2>
                            </div>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                              {group.totalGroups} Option Groups · {group.singleCount} Single Choice · {group.multiCount} Multi Choice
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleOpenCreate(venueOutletId)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#126973] hover:bg-[#126973]/90 transition-colors shadow-xs cursor-pointer"
                          >
                            <Plus size={13} />
                            <span>Add Option Group</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleCollapse(group.id)
                            }}
                            className="p-1.5 rounded-lg border border-black/5 dark:border-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                            title={isCollapsed ? 'Expand' : 'Collapse'}
                          >
                            {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                          </button>
                        </div>
                      </div>

                      {/* Venue Option Groups Grid */}
                      {!isCollapsed && (
                        <div className="p-4 sm:p-5">
                          {group.groups.length === 0 ? (
                            <div
                              className="py-8 px-4 rounded-lg border border-dashed text-center space-y-2"
                              style={{
                                borderColor: 'var(--color-border)',
                                background: 'rgba(255, 255, 255, 0.01)'
                              }}
                            >
                              <p className="text-xs text-slate-400">
                                No option groups found in {group.venue.name}
                              </p>
                              <button
                                type="button"
                                onClick={() => handleOpenCreate(venueOutletId)}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-[#126973] dark:text-[#F1D8C2] hover:underline cursor-pointer"
                              >
                                <Plus size={12} />
                                <span>Create Option Group</span>
                              </button>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                              {group.groups.map((grp) => {
                                const values = grp.values || []
                                const isSingle = grp.type === 'single'
                                const isRequired = Boolean(grp.is_required)

                                return (
                                  <div
                                    key={grp.id}
                                    className="group rounded-xl border shadow-xs hover:border-[#126973]/50 transition-all duration-150 overflow-hidden flex flex-col justify-between"
                                    style={{
                                      background: 'var(--color-card)',
                                      borderColor: 'var(--color-border)'
                                    }}
                                  >
                                    {/* Card Header & Visual */}
                                    <div className="p-3.5 space-y-3">
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                          <div
                                            className="w-9 h-9 rounded-lg overflow-hidden shrink-0 border flex items-center justify-center"
                                            style={{
                                              background: 'var(--color-bg)',
                                              borderColor: 'var(--color-border)',
                                              color: 'var(--color-500, #126973)'
                                            }}
                                          >
                                            <SlidersHorizontal size={17} />
                                          </div>

                                          <div className="min-w-0">
                                            <h3
                                              className="text-xs font-bold truncate group-hover:text-[#126973] dark:group-hover:text-[#F1D8C2] transition-colors"
                                              style={{ color: 'var(--color-text)' }}
                                            >
                                              {grp.name}
                                            </h3>
                                            <div className="flex items-center gap-1.5 text-[10.5px] text-slate-400 mt-0.5">
                                              <span>{values.length} {values.length === 1 ? 'Choice' : 'Choices'}</span>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Single / Multiple Badge */}
                                        <div className="shrink-0">
                                          <span
                                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                                              isSingle
                                                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                                                : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                                            }`}
                                          >
                                            {isSingle ? <CircleDot size={10} /> : <CheckSquare size={10} />}
                                            <span>{isSingle ? 'Single' : 'Multiple'}</span>
                                          </span>
                                        </div>
                                      </div>

                                      {/* Required / Optional Pill */}
                                      <div className="flex items-center gap-1.5">
                                        <span
                                          className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9.5px] font-semibold ${
                                            isRequired
                                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                              : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                                          }`}
                                        >
                                          {isRequired ? 'Required' : 'Optional'}
                                        </span>
                                      </div>

                                      {/* Values Preview Chips */}
                                      {values.length > 0 ? (
                                        <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                                          <div className="flex flex-wrap gap-1 max-h-20 overflow-hidden">
                                            {values.slice(0, 4).map((v, idx) => (
                                              <span
                                                key={idx}
                                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-black/5 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-black/5 dark:border-white/10"
                                              >
                                                <span>{v.name}</span>
                                                {Number(v.price) > 0 && (
                                                  <span className="text-[9.5px] font-semibold text-emerald-600 dark:text-emerald-400">
                                                    +${Number(v.price).toFixed(2)}
                                                  </span>
                                                )}
                                              </span>
                                            ))}
                                            {values.length > 4 && (
                                              <span className="text-[9.5px] font-mono text-slate-400 self-center px-1">
                                                +{values.length - 4} more
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      ) : (
                                        <p className="text-[10.5px] text-slate-400 italic">No values configured</p>
                                      )}
                                    </div>

                                    {/* Card Footer Actions */}
                                    <div
                                      className="px-3.5 py-2 border-t flex items-center justify-between gap-2"
                                      style={{
                                        background: 'rgba(255, 255, 255, 0.01)',
                                        borderColor: 'var(--color-border)'
                                      }}
                                    >
                                      <span className="text-[10px] text-slate-400 font-mono">
                                        ID #{grp.id}
                                      </span>

                                      <div className="flex items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() => handleOpenEdit(grp)}
                                          className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                                          title="Edit option group"
                                        >
                                          <Edit01 size={14} />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDelete(grp.id)}
                                          className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                          title="Delete option group"
                                        >
                                          <Trash01 size={14} />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  )
}
