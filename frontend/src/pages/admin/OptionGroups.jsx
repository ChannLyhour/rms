import { useState, useEffect, useMemo } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import OptionGroupCreateView from '../../components/admin/OptionGroupCreateView'
import { CreateButton, Button } from '../../components/common/ButtonComponent'
import { TableActionButtons } from '../../components/plugin/components/button-Action-Components'
import { Table, TableCard, BadgeWithIcon, PaginationPageMinimalCenter } from '../../components/TablesComponents'
import { adminApi } from '../../api/adminApi'
import { SlidersHorizontal, Plus, Tag, Check, LayoutGrid, List, Trash2, Pencil, Search } from 'lucide-react'
import { SearchLg, Edit01, Trash01 } from '@untitledui/icons'
import toast from 'react-hot-toast'

export default function OptionGroups() {
  const [groups, setGroups] = useState([])
  const [search, setSearch] = useState('')
  const [filterTab, setFilterTab] = useState('all') // 'all' | 'single' | 'multiple' | 'required'
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'table'
  const [activeView, setActiveView] = useState('list') // 'list' | 'create' | 'edit'
  const [selectedGroup, setSelectedGroup] = useState(null)

  const [sortDescriptor, setSortDescriptor] = useState({
    column: 'name',
    direction: 'ascending',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  const fetchGroups = async () => {
    try {
      const { data } = await adminApi.getOptionGroups()
      setGroups(data.data || [])
    } catch {
      // silent
    }
  }

  useEffect(() => {
    fetchGroups()
  }, [])

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

      return matchSearch && matchFilter
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
  }, [groups, search, filterTab, sortDescriptor])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, filterTab])

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

  const openCreate = () => {
    setSelectedGroup(null)
    setActiveView('create')
  }

  const openEdit = (g) => {
    setSelectedGroup(g)
    setActiveView('edit')
  }

  const handleCloseView = () => {
    setSelectedGroup(null)
    setActiveView('list')
  }

  const handleSave = async (payload) => {
    try {
      if (activeView === 'create') {
        await adminApi.createOptionGroup(payload)
        toast.success('Option group created successfully')
      } else if (selectedGroup?.id) {
        await adminApi.updateOptionGroup(selectedGroup.id, payload)
        toast.success('Option group updated successfully')
      }
      fetchGroups()
      handleCloseView()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this option group? Products linked to it will no longer show these modifiers.')) return
    try {
      await adminApi.deleteOptionGroup(id)
      setGroups((prev) => prev.filter((g) => g.id !== id))
      toast.success('Option group deleted')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete option group')
    }
  }

  const countSingle = groups.filter((g) => g.type === 'single').length
  const countMultiple = groups.filter((g) => g.type === 'multiple').length
  const countRequired = groups.filter((g) => g.is_required).length

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {activeView !== 'list' ? (
          <OptionGroupCreateView
            item={selectedGroup}
            onClose={handleCloseView}
            onSave={handleSave}
          />
        ) : (
          <>
            {/* Header */}
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
                    Product Modifiers & Add-ons
                  </h1>
                </div>
                
              </div>

              <div className="flex items-center gap-2.5">
                {/* View Toggle */}
                <div
                  className="p-0.5 rounded-xl border flex items-center shadow-xs"
                  style={{
                    background: 'var(--color-card)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                      viewMode === 'grid'
                        ? 'bg-black/5 dark:bg-white/10 text-[var(--color-text)] shadow-2xs'
                        : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
                    }`}
                    title="Grid View"
                  >
                    <LayoutGrid size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('table')}
                    className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                      viewMode === 'table'
                        ? 'bg-black/5 dark:bg-white/10 text-[var(--color-text)] shadow-2xs'
                        : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
                    }`}
                    title="Table View"
                  >
                    <List size={15} />
                  </button>
                </div>

                <CreateButton
                  label="Add Option Group"
                  onClick={openCreate}
                />
              </div>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Filter Tabs */}
              <div
                className="flex items-center gap-1.5 p-1 rounded-xl border text-xs shadow-2xs overflow-x-auto scrollbar-none"
                style={{
                  background: 'var(--color-card)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setFilterTab('all')}
                  className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                    filterTab === 'all'
                      ? 'bg-[var(--color-500,#BF4040)] text-white shadow-2xs'
                      : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
                  }`}
                >
                  All ({groups.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('single')}
                  className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                    filterTab === 'single'
                      ? 'bg-[var(--color-500,#BF4040)] text-white shadow-2xs'
                      : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
                  }`}
                >
                  Single Choice ({countSingle})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('multiple')}
                  className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                    filterTab === 'multiple'
                      ? 'bg-[var(--color-500,#BF4040)] text-white shadow-2xs'
                      : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
                  }`}
                >
                  Multiple Choices ({countMultiple})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('required')}
                  className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                    filterTab === 'required'
                      ? 'bg-[var(--color-500,#BF4040)] text-white shadow-2xs'
                      : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
                  }`}
                >
                  Required ({countRequired})
                </button>
              </div>

              {/* Search Bar */}
              <div
                className="flex items-center gap-3 px-3.5 py-2 rounded-[5px] border text-xs w-full sm:max-w-xs shadow-xs"
                style={{
                  background: 'var(--color-card)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <SearchLg size={16} className="text-[var(--color-muted)] shrink-0 stroke-[2px]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search modifiers or choices..."
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

            {/* 1. GRID VIEW */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedItems.map((g) => {
                  const valuesCount = (g.values || []).length

                  return (
                    <div
                      key={g.id}
                      className="rounded-2xl p-5 border flex flex-col justify-between shadow-xs hover:shadow-md transition-all group"
                      style={{
                        background: 'var(--color-card)',
                        borderColor: 'var(--color-border)',
                      }}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm shrink-0"
                              style={{
                                background:
                                  'linear-gradient(135deg, var(--color-500, #BF4040), var(--color-700, #8A2E2E))',
                              }}
                            >
                              <SlidersHorizontal size={18} />
                            </div>
                            <div className="min-w-0">
                              <p
                                className="font-bold text-sm truncate"
                                style={{ color: 'var(--color-text)' }}
                              >
                                {g.name}
                              </p>
                              <p
                                className="text-[11px] capitalize"
                                style={{ color: 'var(--color-muted)' }}
                              >
                                {g.type === 'single'
                                  ? 'Single Choice (Radio)'
                                  : 'Multiple Choices (Checkbox)'}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${
                              g.is_required
                                ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                            }`}
                          >
                            {g.is_required ? 'Required' : 'Optional'}
                          </span>
                        </div>

                        {/* Option Values List */}
                        <div className="space-y-1.5 mt-4 mb-3">
                          <p
                            className="text-[10px] font-bold uppercase tracking-wider"
                            style={{ color: 'var(--color-muted)' }}
                          >
                            Available Choices ({valuesCount})
                          </p>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {valuesCount > 0 ? (
                              g.values.map((v, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs px-2.5 py-1 rounded-lg border flex items-center gap-1.5 font-medium"
                                  style={{
                                    background: 'var(--color-bg)',
                                    borderColor: 'var(--color-border)',
                                    color: 'var(--color-text)',
                                  }}
                                >
                                  <span>{v.name}</span>
                                  {v.price > 0 && (
                                    <span
                                      className="font-mono font-bold text-[11px]"
                                      style={{ color: 'var(--color-500, #BF4040)' }}
                                    >
                                      +${Number(v.price).toFixed(2)}
                                    </span>
                                  )}
                                </span>
                              ))
                            ) : (
                              <span
                                className="text-xs italic"
                                style={{ color: 'var(--color-muted)' }}
                              >
                                No choice values configured yet.
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div
                        className="pt-3 border-t flex items-center justify-between mt-3"
                        style={{ borderColor: 'var(--color-border-subtle)' }}
                      >
                        <Button
                          size="sm"
                          variant="link-gray"
                          onClick={() => handleDelete(g.id)}
                          iconLeading={Trash01}
                          className="hover:text-red-500 text-[11px]"
                        >
                          Delete
                        </Button>

                        <Button
                          size="sm"
                          variant="link-color"
                          onClick={() => openEdit(g)}
                          iconLeading={Edit01}
                          className="text-[11px]"
                        >
                          Edit Group
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* 2. TABLE VIEW */}
            {viewMode === 'table' && (
              <TableCard.Root>
                <Table aria-label="Option Groups Catalog" sortDescriptor={sortDescriptor}>
                  <Table.Header>
                    <Table.Head
                      id="name"
                      label="Modifier Group"
                      isRowHeader
                      allowsSorting
                      sortDescriptor={sortDescriptor}
                      onSort={handleSort}
                    />
                    <Table.Head
                      id="type"
                      label="Selection Mode"
                      allowsSorting
                      sortDescriptor={sortDescriptor}
                      onSort={handleSort}
                    />
                    <Table.Head
                      id="is_required"
                      label="Requirement"
                      allowsSorting
                      sortDescriptor={sortDescriptor}
                      onSort={handleSort}
                    />
                    <Table.Head id="values" label="Choices & Add-on Prices" />
                    <Table.Head id="actions" className="text-right">
                      Actions
                    </Table.Head>
                  </Table.Header>

                  <Table.Body items={paginatedItems}>
                    {(g) => (
                      <Table.Row key={g.id} id={g.id}>
                        {/* Group Name */}
                        <Table.Cell>
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white shadow-2xs shrink-0"
                              style={{
                                background:
                                  'linear-gradient(135deg, var(--color-500, #BF4040), var(--color-700, #8A2E2E))',
                              }}
                            >
                              <SlidersHorizontal size={15} />
                            </div>
                            <span
                              className="font-bold text-xs"
                              style={{ color: 'var(--color-text)' }}
                            >
                              {g.name}
                            </span>
                          </div>
                        </Table.Cell>

                        {/* Mode */}
                        <Table.Cell>
                          <span
                            className="px-2 py-0.5 rounded-[5px] border text-[11px] font-semibold capitalize"
                            style={{
                              background: 'var(--color-bg)',
                              borderColor: 'var(--color-border)',
                              color: 'var(--color-text)',
                            }}
                          >
                            {g.type === 'single' ? 'Single Choice' : 'Multiple Choices'}
                          </span>
                        </Table.Cell>

                        {/* Requirement */}
                        <Table.Cell>
                          {g.is_required ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                              Required
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-500 border border-slate-500/20">
                              Optional
                            </span>
                          )}
                        </Table.Cell>

                        {/* Choices Pills */}
                        <Table.Cell>
                          <div className="flex flex-wrap gap-1 max-w-sm">
                            {(g.values || []).map((v, i) => (
                              <span
                                key={i}
                                className="text-[11px] px-2 py-0.5 rounded-md border font-medium inline-flex items-center gap-1"
                                style={{
                                  background: 'var(--color-bg)',
                                  borderColor: 'var(--color-border)',
                                  color: 'var(--color-text)',
                                }}
                              >
                                <span>{v.name}</span>
                                {v.price > 0 && (
                                  <span className="font-mono font-bold text-[10px] text-[var(--color-500,#BF4040)]">
                                    +${Number(v.price).toFixed(2)}
                                  </span>
                                )}
                              </span>
                            ))}
                          </div>
                        </Table.Cell>

                        {/* Actions */}
                        <Table.Cell>
                          <TableActionButtons
                            item={g}
                            onEdit={() => openEdit(g)}
                            onDelete={() => handleDelete(g.id)}
                            confirmDelete={`Are you sure you want to delete option group "${g.name}"? Products linked to it will no longer show these modifiers.`}
                          />
                        </Table.Cell>
                      </Table.Row>
                    )}
                  </Table.Body>
                </Table>
              </TableCard.Root>
            )}

            {sortedAndFiltered.length === 0 && (
              <div
                className="py-16 text-center rounded-2xl border"
                style={{
                  background: 'var(--color-card)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <SlidersHorizontal
                  size={40}
                  className="mx-auto mb-2 opacity-40"
                  style={{ color: 'var(--color-muted)' }}
                />
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                  No option groups found
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
                  Click Add Option Group to create modifiers and choice add-ons.
                </p>
              </div>
            )}

            {/* Pagination */}
            {sortedAndFiltered.length > 0 && (
              <PaginationPageMinimalCenter
                page={currentPage}
                total={totalPages}
                onPageChange={setCurrentPage}
                className="px-4 py-3"
              />
            )}
          </>
        )}
      </div>
    </AdminLayout>
  )
}
