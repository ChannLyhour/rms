import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../../components/layout/AdminLayout'
import CategoriesCreateView from './CategoriesCreateView'
import { adminApi } from '../../../api/adminApi'
import axiosClient from '../../../api/axiosClient'
import { Table, TableCard, BadgeWithIcon, Button, PaginationPageMinimalCenter } from '../../../components/TablesComponents'
import { CreateButton } from '../../../components/common/ButtonComponent'
import { Check, X, SearchLg, Plus, Edit01, Trash01 } from '@untitledui/icons'
import { Folder, CornerDownRight, EyeOff, Building2, Coffee, Wine, ShoppingCart, Utensils, FolderTree, Layers, LayoutGrid, Table as TableIcon } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [outlets, setOutlets] = useState([])
  const [outletFilter, setOutletFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all') // 'all' | 'main' | 'sub'
  const [search, setSearch] = useState('')
  const [activeView, setActiveView] = useState('list') // 'list' | 'create' | 'edit'
  const [selectedCategory, setSelectedCategory] = useState(null)

  const [sortDescriptor, setSortDescriptor] = useState({
    column: 'sort_order',
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

  const loadData = () => {
    adminApi.getCategories().then(({ data }) => setCategories(data.data || []))
    axiosClient.get('/outlets').then(({ data }) => setOutlets(data.data || [])).catch(() => {})
  }

  useEffect(() => {
    loadData()
  }, [])

  // Helper map for parent category names
  const categoryMap = useMemo(() => {
    const map = {}
    categories.forEach((c) => {
      map[c.id] = c.name
    })
    return map
  }, [categories])

  // Count sub-categories per parent
  const subCountMap = useMemo(() => {
    const map = {}
    categories.forEach((c) => {
      if (c.parent_id) {
        map[c.parent_id] = (map[c.parent_id] || 0) + 1
      }
    })
    return map
  }, [categories])

  // Outlet-scoped categories list
  const outletFilteredList = useMemo(() => {
    return categories.filter((c) => outletFilter === 'all' || String(c.outlet_id) === String(outletFilter))
  }, [categories, outletFilter])

  const mainCount = outletFilteredList.filter((c) => !c.parent_id).length
  const subCount = outletFilteredList.filter((c) => c.parent_id).length

  // Sort & Filter logic
  const sortedAndFiltered = useMemo(() => {
    let list = categories.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(search.toLowerCase()))

      const isSub = Boolean(c.parent_id)
      const matchType =
        typeFilter === 'all'
          ? true
          : typeFilter === 'main'
          ? !isSub
          : isSub

      const matchOutlet =
        outletFilter === 'all' || String(c.outlet_id) === String(outletFilter)

      return matchSearch && matchType && matchOutlet
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
  }, [categories, search, typeFilter, outletFilter, sortDescriptor])

  // Reset page on search or filter change
  useEffect(() => {
    setCurrentPage(1)
  }, [search, typeFilter, outletFilter])

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

  const handleOpenCreate = (parentId = null) => {
    setSelectedCategory(parentId ? { parent_id: parentId } : null)
    setActiveView('create')
  }

  const handleOpenEdit = (c) => {
    setSelectedCategory(c)
    setActiveView('edit')
  }

  const handleCloseView = () => {
    setSelectedCategory(null)
    setActiveView('list')
  }

  const handleSaveCategory = async (payload) => {
    try {
      if (activeView === 'create') {
        await adminApi.createCategory(payload)
        toast.success(payload.parent_id ? 'Sub-category created successfully' : 'Category created successfully')
        setCurrentPage(1)
      } else if (selectedCategory?.id) {
        await adminApi.updateCategory(selectedCategory.id, payload)
        toast.success('Category updated successfully')
      }
      loadData()
      handleCloseView()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category? Sub-categories linked to it will also be deleted.')) return
    try {
      await adminApi.deleteCategory(id)
      setCategories((prev) => prev.filter((c) => c.id !== id))
      toast.success('Category removed')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete category')
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
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
                  Categories Catalog
                </h1>
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
                    to="/groups/categories"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <LayoutGrid size={14} />
                    <span>Group Cards</span>
                  </Link>
                </div>

                <CreateButton
                  label="Add New Category"
                  onClick={() => handleOpenCreate()}
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
                    {categories.length}
                  </span>
                </button>

                {outlets.map((o) => {
                  const count = categories.filter((c) => String(c.outlet_id) === String(o.id)).length
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
              <div className="relative overflow-x-auto no-scrollbar">
                <div
                  className="flex items-center gap-1 rounded-xl p-1 border"
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  {[
                    { id: 'all', label: 'All Categories', icon: Layers, count: outletFilteredList.length },
                    { id: 'main', label: 'Main Categories', icon: Folder, count: mainCount },
                    { id: 'sub', label: 'Sub-Categories', icon: CornerDownRight, count: subCount },
                  ].map((tab) => {
                    const Icon = tab.icon
                    const isActive = typeFilter === tab.id
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          setTypeFilter(tab.id)
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
                  placeholder="Search categories by name..."
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
              <Table aria-label="Categories Catalog" sortDescriptor={sortDescriptor}>
                <Table.Header>
                  <Table.Head
                    id="name"
                    label="Category"
                    isRowHeader
                    allowsSorting
                    sortDescriptor={sortDescriptor}
                    onSort={handleSort}
                  />
                  <Table.Head id="type" label="Type / Hierarchy" />
                  <Table.Head id="outlet" label="Assigned Venue" />
                  <Table.Head
                    id="sort_order"
                    label="Display Order"
                    allowsSorting
                    sortDescriptor={sortDescriptor}
                    onSort={handleSort}
                  />
                  <Table.Head
                    id="is_active"
                    label="Availability"
                    allowsSorting
                    sortDescriptor={sortDescriptor}
                    onSort={handleSort}
                  />
                  <Table.Head id="actions" className="text-right">
                    Actions
                  </Table.Head>
                </Table.Header>

                <Table.Body items={paginatedItems}>
                  {(c) => {
                    const isSub = Boolean(c.parent_id)
                    const pName = isSub ? categoryMap[c.parent_id] : null
                    const subTotal = !isSub ? subCountMap[c.id] || 0 : 0
                    const outlet = outlets.find((o) => String(o.id) === String(c.outlet_id))

                    return (
                      <Table.Row key={c.id} id={c.id}>
                        {/* Category Thumbnail & Details */}
                        <Table.Cell>
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-[6px] overflow-hidden shrink-0 border flex items-center justify-center font-bold text-xs shadow-2xs"
                              style={{
                                background: 'var(--color-bg)',
                                borderColor: 'var(--color-border)',
                              }}
                            >
                              {c.image_url ? (
                                <img
                                  src={c.image_url}
                                  alt={c.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none'
                                  }}
                                />
                              ) : (
                                <span>📁</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="font-bold text-xs truncate leading-snug" style={{ color: 'var(--color-text)' }}>
                                  {c.name}
                                </p>
                              </div>
                              {c.description && (
                                <p className="text-[11px] truncate max-w-xs opacity-75 mt-0.5" style={{ color: 'var(--color-muted)' }}>
                                  {c.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </Table.Cell>

                        {/* Type / Parent */}
                        <Table.Cell>
                          {isSub ? (
                            <span
                              className="px-2.5 py-0.5 rounded-[5px] border font-semibold inline-flex items-center gap-1 text-[11px]"
                              style={{
                                background: 'rgba(245, 158, 11, 0.1)',
                                borderColor: 'rgba(245, 158, 11, 0.3)',
                                color: '#d97706',
                              }}
                            >
                              <CornerDownRight size={12} />
                              <span>{pName}</span>
                            </span>
                          ) : (
                            <span
                              className="px-2.5 py-0.5 rounded-[5px] border font-semibold inline-flex items-center gap-1 text-[11px]"
                              style={{
                                background: 'var(--color-bg)',
                                borderColor: 'var(--color-border)',
                                color: 'var(--color-text)',
                              }}
                            >
                              <Folder size={12} className="text-[#126973] dark:text-[#F1D8C2]" />
                              <span>Main ({subTotal} {subTotal === 1 ? 'sub' : 'subs'})</span>
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

                        {/* Display Order */}
                        <Table.Cell className="font-mono text-xs" style={{ color: 'var(--color-muted)' }}>
                          #{c.sort_order}
                        </Table.Cell>

                        {/* Availability Badge */}
                        <Table.Cell>
                          {c.is_active ? (
                            <BadgeWithIcon size="sm" color="success" iconLeading={Check} className="font-semibold capitalize">
                              Available
                            </BadgeWithIcon>
                          ) : (
                            <BadgeWithIcon size="sm" color="gray" iconLeading={EyeOff} className="font-semibold capitalize">
                              Hidden
                            </BadgeWithIcon>
                          )}
                        </Table.Cell>

                        {/* Actions */}
                        <Table.Cell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {!isSub && (
                              <button
                                type="button"
                                onClick={() => handleOpenCreate(c.id)}
                                className="p-1.5 rounded-[5px] text-slate-400 hover:text-[#126973] hover:bg-[#126973]/10 dark:hover:text-[#F1D8C2] transition-all cursor-pointer"
                                title="Add Sub-Category"
                              >
                                <Plus size={15} />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(c)}
                              className="p-1.5 rounded-[5px] text-slate-400 hover:text-[#126973] hover:bg-[#126973]/10 dark:hover:text-[#F1D8C2] transition-all cursor-pointer"
                              title="Edit Category"
                            >
                              <Edit01 size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(c.id)}
                              className="p-1.5 rounded-[5px] text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all cursor-pointer"
                              title="Delete Category"
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

        {/* Modal for Create / Edit Category */}
        <CategoriesCreateView
          isOpen={activeView !== 'list'}
          item={selectedCategory}
          categories={categories}
          onClose={handleCloseView}
          onSave={handleSaveCategory}
          onQuickCreateSubCategory={loadData}
        />
      </div>
    </AdminLayout>
  )
}
