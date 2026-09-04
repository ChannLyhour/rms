import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import OptionGroupCreateView from '../../components/admin/OptionGroupCreateView'
import { CreateButton, Button } from '../../components/common/ButtonComponent'
import { Table, TableCard, BadgeWithIcon, PaginationPageMinimalCenter } from '../../components/TablesComponents'
import { adminApi } from '../../api/adminApi'
import axiosClient from '../../api/axiosClient'
import { SlidersHorizontal, Plus, Tag, Check, CircleDot, CheckSquare, Building2, Coffee, Wine, ShoppingCart, Utensils, AlertCircle, Layers, LayoutGrid, Table as TableIcon } from 'lucide-react'
import { SearchLg, Edit01, Trash01 } from '@untitledui/icons'
import toast from 'react-hot-toast'

export default function OptionGroups() {
  const [groups, setGroups] = useState([])
  const [outlets, setOutlets] = useState([])
  const [outletFilter, setOutletFilter] = useState('all')
  const [filterTab, setFilterTab] = useState('all') // 'all' | 'single' | 'multiple' | 'required'
  const [search, setSearch] = useState('')
  const [activeView, setActiveView] = useState('list') // 'list' | 'create' | 'edit'
  const [selectedGroup, setSelectedGroup] = useState(null)

  const [sortDescriptor, setSortDescriptor] = useState({
    column: 'name',
    direction: 'ascending',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

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
        adminApi.getOptionGroups(),
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

  // Counts for tabs (scoped to active venue filter)
  const outletFilteredList = useMemo(() => {
    return groups.filter((g) => outletFilter === 'all' || String(g.outlet_id) === String(outletFilter))
  }, [groups, outletFilter])

  const singleCount = outletFilteredList.filter((g) => g.type === 'single').length
  const multiCount = outletFilteredList.filter((g) => g.type === 'multiple').length
  const requiredCount = outletFilteredList.filter((g) => Boolean(g.is_required)).length

  // Filter & Sort
  const sortedAndFiltered = useMemo(() => {
    let list = groups.filter((g) => {
      const matchSearch =
        g.name.toLowerCase().includes(search.toLowerCase()) ||
        (g.values && g.values.some((v) => v.name.toLowerCase().includes(search.toLowerCase())))

      const matchFilter =
        filterTab === 'all'
          ? true
          : filterTab === 'single'
          ? g.type === 'single'
          : filterTab === 'multiple'
          ? g.type === 'multiple'
          : filterTab === 'required'
          ? Boolean(g.is_required)
          : true

      const matchOutlet =
        outletFilter === 'all' || String(g.outlet_id) === String(outletFilter)

      return matchSearch && matchFilter && matchOutlet
    })

    return list.sort((a, b) => {
      let first = a[sortDescriptor.column]
      let second = b[sortDescriptor.column]

      if (typeof first === 'number' && typeof second === 'number') {
        return sortDescriptor.direction === 'descending' ? second - first : first - second
      }

      if (typeof first === 'boolean' && typeof second === 'boolean') {
        return sortDescriptor.direction === 'descending'
          ? (second === first ? 0 : second ? 1 : -1)
          : (first === second ? 0 : first ? 1 : -1)
      }

      if (typeof first === 'string' && typeof second === 'string') {
        let cmp = first.localeCompare(second)
        return sortDescriptor.direction === 'descending' ? -cmp : cmp
      }

      return 0
    })
  }, [groups, search, filterTab, outletFilter, sortDescriptor])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, filterTab, outletFilter])

  const totalPages = Math.ceil(sortedAndFiltered.length / itemsPerPage) || 1
  const paginatedItems = sortedAndFiltered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

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
    setSelectedGroup(null)
    setActiveView('create')
  }

  const handleOpenEdit = (g) => {
    setSelectedGroup(g)
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
        setCurrentPage(1)
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
    if (!confirm('Are you sure you want to delete this modifier option group?')) return
    try {
      await adminApi.deleteOptionGroup(id)
      setGroups((prev) => prev.filter((g) => g.id !== id))
      toast.success('Option group removed')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete option group')
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-10 select-none animate-in fade-in duration-200">
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
                  Product Modifiers &amp; Add-ons
                </h1>
                <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
                  Manage item variants, drink customizations, extra toppings, and venue assignment scopes.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div
                  className="flex items-center p-1 rounded-xl border gap-1"
                  style={{
                    background: 'var(--color-surface, #ffffff)',
                    borderColor: 'var(--color-border)'
                  }}
                >
                  <div
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-all"
                    style={{
                      background: 'var(--color-500, #126973)',
                      color: '#ffffff'
                    }}
                  >
                    <TableIcon size={14} />
                    <span>Table View</span>
                  </div>
                  <Link
                    to="/groups/variants"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <LayoutGrid size={14} />
                    <span>Group Cards</span>
                  </Link>
                </div>

                <CreateButton
                  label="Add Option Group"
                  onClick={handleOpenCreate}
                />
              </div>
            </div>

            {/* Multi-Venue Tabs */}
            <div className="relative">
              {/* Fade effect on mobile */}
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[var(--color-bg)] to-transparent pointer-events-none z-10 sm:hidden" />

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
                    setOutletFilter('all')
                    setCurrentPage(1)
                  }}
                  className={`inline-flex items-center gap-2.5 h-10 px-3.5 rounded-xl text-sm transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    outletFilter === 'all'
                      ? 'shadow-xs font-semibold'
                      : 'hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                  style={
                    outletFilter === 'all'
                      ? {
                          background: 'var(--color-surface, #1e2230)',
                          color: 'var(--color-text, #ffffff)',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                          border: '1px solid var(--color-border)',
                        }
                      : {
                          color: 'var(--color-muted, #94a3b8)',
                        }
                  }
                >
                  <Building2 size={18} className="shrink-0 text-[#126973] dark:text-[#F1D8C2]" />
                  <span>All Venues</span>
                  <span
                    className="inline-flex items-center justify-center rounded-lg px-2 h-5 text-[11px] font-semibold"
                    style={{
                      background: outletFilter === 'all'
                        ? 'rgba(18, 105, 115, 0.18)'
                        : 'rgba(255, 255, 255, 0.06)',
                      color: outletFilter === 'all' ? 'var(--color-500, #126973)' : 'var(--color-muted, #94a3b8)',
                    }}
                  >
                    {groups.length}
                  </span>
                </button>

                {outlets.map((o) => {
                  const count = groups.filter((g) => String(g.outlet_id) === String(o.id)).length
                  const isSelected = String(outletFilter) === String(o.id)
                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => {
                        setOutletFilter(String(o.id))
                        setCurrentPage(1)
                      }}
                      className={`inline-flex items-center gap-2.5 h-10 px-3.5 rounded-xl text-sm transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                        isSelected
                          ? 'shadow-xs font-semibold'
                          : 'hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                      style={
                        isSelected
                          ? {
                              background: 'var(--color-surface, #1e2230)',
                              color: 'var(--color-text, #ffffff)',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                              border: '1px solid var(--color-border)',
                            }
                          : {
                              color: 'var(--color-muted, #94a3b8)',
                            }
                      }
                    >
                      {getOutletIcon(o.type, 16)}
                      <span>{o.name}</span>
                      <span
                        className="inline-flex items-center justify-center rounded-lg px-2 h-5 text-[11px] font-semibold"
                        style={{
                          background: isSelected
                            ? 'rgba(18, 105, 115, 0.18)'
                            : 'rgba(255, 255, 255, 0.06)',
                          color: isSelected ? 'var(--color-500, #126973)' : 'var(--color-muted, #94a3b8)',
                        }}
                      >
                        {count}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Type Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Type Tabs */}
              <div className="relative overflow-x-auto no-scrollbar">
                <div
                  className="flex items-center gap-1 rounded-xl p-1 border"
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  {[
                    { id: 'all', label: 'All Modifiers', icon: Layers, count: outletFilteredList.length },
                    { id: 'single', label: 'Single Choice', icon: CircleDot, count: singleCount },
                    { id: 'multiple', label: 'Multiple Choice', icon: CheckSquare, count: multiCount },
                    { id: 'required', label: 'Required Only', icon: AlertCircle, count: requiredCount },
                  ].map((tab) => {
                    const Icon = tab.icon
                    const isActive = filterTab === tab.id
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          setFilterTab(tab.id)
                          setCurrentPage(1)
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
                        <Icon size={14} className="shrink-0 text-[#126973] dark:text-[#F1D8C2]" />
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

              {/* Search Bar */}
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
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setCurrentPage(1)
                  }}
                  placeholder="Search modifiers or choices..."
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

            {/* TableCard */}
            <TableCard.Root>
              <Table aria-label="Modifiers Catalog" sortDescriptor={sortDescriptor}>
                <Table.Header>
                  <Table.Head
                    id="name"
                    label="Modifier Group"
                    isRowHeader
                    allowsSorting
                    sortDescriptor={sortDescriptor}
                    onSort={handleSort}
                  />
                  <Table.Head id="type" label="Selection Rule" />
                  <Table.Head id="outlet" label="Assigned Venue" />
                  <Table.Head id="choices" label="Choices & Options" />
                  <Table.Head
                    id="is_required"
                    label="Rule Requirement"
                    allowsSorting
                    sortDescriptor={sortDescriptor}
                    onSort={handleSort}
                  />
                  <Table.Head id="actions" className="text-right">
                    Actions
                  </Table.Head>
                </Table.Header>

                <Table.Body items={paginatedItems}>
                  {(g) => {
                    const values = g.values || []
                    const outlet = outlets.find((o) => String(o.id) === String(g.outlet_id))

                    return (
                      <Table.Row key={g.id} id={g.id}>
                        {/* Option Group Name */}
                        <Table.Cell>
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-[6px] border flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs"
                              style={{
                                background: 'var(--color-bg)',
                                borderColor: 'var(--color-border)',
                                color: 'var(--color-500, #126973)',
                              }}
                            >
                              <Tag size={15} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-xs truncate leading-snug" style={{ color: 'var(--color-text)' }}>
                                {g.name}
                              </p>
                              <span className="text-[11px] opacity-75 font-mono" style={{ color: 'var(--color-muted)' }}>
                                #{g.id} • {values.length} choices
                              </span>
                            </div>
                          </div>
                        </Table.Cell>

                        {/* Selection Rule Type */}
                        <Table.Cell>
                          {g.type === 'single' ? (
                            <span
                              className="px-2.5 py-0.5 rounded-[5px] border font-semibold inline-flex items-center gap-1.5 text-[11px]"
                              style={{
                                background: 'rgba(18, 105, 115, 0.08)',
                                borderColor: 'rgba(18, 105, 115, 0.25)',
                                color: 'var(--color-500, #126973)',
                              }}
                            >
                              <CircleDot size={12} />
                              <span>Single Choice</span>
                            </span>
                          ) : (
                            <span
                              className="px-2.5 py-0.5 rounded-[5px] border font-semibold inline-flex items-center gap-1.5 text-[11px]"
                              style={{
                                background: 'rgba(168, 85, 247, 0.08)',
                                borderColor: 'rgba(168, 85, 247, 0.25)',
                                color: '#9333ea',
                              }}
                            >
                              <CheckSquare size={12} />
                              <span>Multiple Choice</span>
                            </span>
                          )}
                        </Table.Cell>

                        {/* Assigned Venue */}
                        <Table.Cell>
                          {outlet ? (
                            <span
                              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[5px] border text-xs font-semibold"
                              style={{
                                background: 'var(--color-bg)',
                                borderColor: 'var(--color-border)',
                                color: 'var(--color-text)',
                              }}
                            >
                              {getOutletIcon(outlet.type, 13)}
                              <span>{outlet.name}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              🏢 All Venues
                            </span>
                          )}
                        </Table.Cell>

                        {/* Choices Pills */}
                        <Table.Cell>
                          <div className="flex flex-wrap gap-1 max-w-sm">
                            {values.slice(0, 4).map((v) => (
                              <span
                                key={v.id || v.name}
                                className="px-2 py-0.5 rounded-[4px] border text-[10px] font-medium"
                                style={{
                                  background: 'var(--color-bg)',
                                  borderColor: 'var(--color-border)',
                                  color: 'var(--color-text)',
                                }}
                              >
                                {v.name}
                                {v.price > 0 && (
                                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold ml-1">
                                    +${Number(v.price).toFixed(2)}
                                  </span>
                                )}
                                {!v.is_unlimited && (
                                  <span className="font-mono text-slate-500 dark:text-slate-400 font-bold ml-1">
                                    ({v.stock_quantity ?? 0})
                                  </span>
                                )}
                              </span>
                            ))}
                            {values.length > 4 && (
                              <span className="px-1.5 py-0.5 text-[10px] text-slate-400 font-bold">
                                +{values.length - 4} more
                              </span>
                            )}
                          </div>
                        </Table.Cell>

                        {/* Required Rule */}
                        <Table.Cell>
                          {g.is_required ? (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 inline-flex items-center gap-1">
                              <AlertCircle size={11} />
                              Required
                            </span>
                          ) : (
                            <span className="text-[11px] text-[var(--color-muted)] font-medium">
                              Optional
                            </span>
                          )}
                        </Table.Cell>

                        {/* Actions */}
                        <Table.Cell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(g)}
                              className="p-1.5 rounded-[5px] text-slate-400 hover:text-[#126973] hover:bg-[#126973]/10 dark:hover:text-[#F1D8C2] transition-all cursor-pointer"
                              title="Edit Modifier Group"
                            >
                              <Edit01 size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(g.id)}
                              className="p-1.5 rounded-[5px] text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all cursor-pointer"
                              title="Delete Modifier Group"
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

              {/* Pagination */}
              <div className="p-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <PaginationPageMinimalCenter
                  page={currentPage}
                  total={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </TableCard.Root>
          </>
        )}
      </div>
    </AdminLayout>
  )
}
