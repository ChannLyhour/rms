import { useState, useEffect, useMemo } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import CategoriesCreateView from '../../components/admin/CategoriesCreateView'
import { adminApi } from '../../api/adminApi'
import { Table, TableCard, BadgeWithIcon, Button, PaginationPageMinimalCenter } from '../../components/TablesComponents'
import { CreateButton } from '../../components/common/ButtonComponent'
import { TableActionButtons } from '../../components/plugin/components/button-Action-Components'
import { CatalogCard, Cards } from '../../components/plugin/components/cards-components'
import { Check, SearchLg, Plus, Edit01, Trash01 } from '@untitledui/icons'
import { Layers, EyeOff, FolderTree, LayoutGrid, List, CornerDownRight, Folder } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [filterTab, setFilterTab] = useState('main') // 'main' | 'sub'
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'table'
  const [activeView, setActiveView] = useState('list') // 'list' | 'create' | 'edit'
  const [selectedCategory, setSelectedCategory] = useState(null)

  const [sortDescriptor, setSortDescriptor] = useState({
    column: 'sort_order',
    direction: 'ascending',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  const fetchCategories = async () => {
    try {
      const { data } = await adminApi.getCategories()
      setCategories(data.data || [])
    } catch {
      // silent
    }
  }

  useEffect(() => {
    fetchCategories()
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

  const sortedAndFiltered = useMemo(() => {
    let list = categories.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(search.toLowerCase()))

      const isSub = Boolean(c.parent_id)
      const matchFilter =
        filterTab === 'all'
          ? true
          : filterTab === 'main'
          ? !isSub
          : isSub

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
  }, [categories, search, filterTab, sortDescriptor])

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

  const openCreate = (parentId = null) => {
    setSelectedCategory(parentId ? { parent_id: parentId } : null)
    setActiveView('create')
  }

  const openEdit = (c) => {
    setSelectedCategory(c)
    setActiveView('edit')
  }

  const handleCloseView = () => {
    setSelectedCategory(null)
    setActiveView('list')
  }

  const handleSave = async (payload) => {
    try {
      if (activeView === 'create') {
        await adminApi.createCategory(payload)
        toast.success(payload.parent_id ? 'Sub-category created successfully' : 'Category created successfully')
      } else if (selectedCategory?.id) {
        await adminApi.updateCategory(selectedCategory.id, payload)
        toast.success('Category updated successfully')
      }
      fetchCategories()
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
      toast.success('Category deleted')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete category')
    }
  }

  const mainCount = categories.filter((c) => !c.parent_id).length
  const subCount = categories.filter((c) => c.parent_id).length

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {activeView !== 'list' ? (
          <CategoriesCreateView
            item={selectedCategory}
            categories={categories}
            onClose={handleCloseView}
            onSave={handleSave}
            onQuickCreateSubCategory={fetchCategories}
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
                    Product & Sub-Categories
                  </h1>
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
                  Organize food and beverage catalog hierarchy, parent groups, and display sorting.
                </p>
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
                  label="Add Category"
                  onClick={() => openCreate()}
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
                  onClick={() => setFilterTab('main')}
                  className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                    filterTab === 'main'
                      ? 'bg-[var(--color-500,#BF4040)] text-white shadow-2xs'
                      : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
                  }`}
                >
                  Main Categories ({mainCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('sub')}
                  className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                    filterTab === 'sub'
                      ? 'bg-[var(--color-500,#BF4040)] text-white shadow-2xs'
                      : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
                  }`}
                >
                  Sub-Categories ({subCount})
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
                  placeholder="Search categories..."
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
              <Cards itemsPerRow={4}>
                {paginatedItems.map((cat) => {
                  const isSub = Boolean(cat.parent_id)
                  const parentName = categoryMap[cat.parent_id]
                  const directSubCount = subCountMap[cat.id] || 0

                  return (
                    <CatalogCard
                      key={cat.id}
                      item={cat}
                      isSub={isSub}
                      parentName={parentName}
                      subCount={directSubCount}
                      onAddSub={() => openCreate(cat.id)}
                      onEdit={() => openEdit(cat)}
                      onDelete={() => handleDelete(cat.id)}
                    />
                  )
                })}
              </Cards>
            )}

            {/* 2. TABLE VIEW */}
            {viewMode === 'table' && (
              <TableCard.Root>
                <Table aria-label="Categories Catalog" sortDescriptor={sortDescriptor}>
                  <Table.Header>
                    <Table.Head
                      id="name"
                      label="Category Name"
                      isRowHeader
                      allowsSorting
                      sortDescriptor={sortDescriptor}
                      onSort={handleSort}
                    />
                    <Table.Head
                      id="parent_id"
                      label="Type / Parent"
                      allowsSorting
                      sortDescriptor={sortDescriptor}
                      onSort={handleSort}
                    />
                    <Table.Head
                      id="description"
                      label="Description"
                      allowsSorting
                      sortDescriptor={sortDescriptor}
                      onSort={handleSort}
                    />
                    <Table.Head
                      id="sort_order"
                      label="Sort Order"
                      allowsSorting
                      sortDescriptor={sortDescriptor}
                      onSort={handleSort}
                    />
                    <Table.Head
                      id="is_active"
                      label="Status"
                      allowsSorting
                      sortDescriptor={sortDescriptor}
                      onSort={handleSort}
                    />
                    <Table.Head id="actions" className="text-right">
                      Actions
                    </Table.Head>
                  </Table.Header>

                  <Table.Body items={paginatedItems}>
                    {(cat) => {
                      const isSub = Boolean(cat.parent_id)
                      const parentName = categoryMap[cat.parent_id]
                      const directSubCount = subCountMap[cat.id] || 0

                      return (
                        <Table.Row key={cat.id} id={cat.id}>
                          {/* Category Name & Thumbnail */}
                          <Table.Cell>
                            <div className="flex items-center gap-3">
                              <div
                                className="w-9 h-9 rounded-[6px] overflow-hidden shrink-0 border flex items-center justify-center font-bold text-xs shadow-2xs"
                                style={{
                                  background: 'var(--color-bg)',
                                  borderColor: 'var(--color-border)',
                                }}
                              >
                                {cat.image_url ? (
                                  <img
                                    src={cat.image_url}
                                    alt={cat.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.style.display = 'none'
                                    }}
                                  />
                                ) : isSub ? (
                                  <CornerDownRight size={14} className="text-[var(--color-muted)]" />
                                ) : (
                                  <Layers size={14} style={{ color: 'var(--color-muted)' }} />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p
                                  className="font-bold text-xs truncate leading-snug"
                                  style={{ color: 'var(--color-text)' }}
                                >
                                  {cat.name}
                                </p>
                              </div>
                            </div>
                          </Table.Cell>

                          {/* Type / Parent */}
                          <Table.Cell>
                            {isSub ? (
                              <span
                                className="px-2 py-0.5 rounded-[5px] border text-[11px] font-semibold inline-flex items-center gap-1"
                                style={{
                                  background: 'rgba(191, 64, 64, 0.08)',
                                  borderColor: 'rgba(191, 64, 64, 0.2)',
                                  color: 'var(--color-500, #BF4040)',
                                }}
                              >
                                ↳ Sub of: {parentName || 'Parent'}
                              </span>
                            ) : (
                              <span
                                className="px-2 py-0.5 rounded-[5px] border text-[11px] font-semibold text-[var(--color-text)]"
                                style={{
                                  background: 'var(--color-bg)',
                                  borderColor: 'var(--color-border)',
                                }}
                              >
                                Main Category {directSubCount > 0 ? `(${directSubCount} Sub)` : ''}
                              </span>
                            )}
                          </Table.Cell>

                          {/* Description */}
                          <Table.Cell className="text-xs max-w-xs truncate" style={{ color: 'var(--color-muted)' }}>
                            {cat.description || '—'}
                          </Table.Cell>

                          {/* Sort Order */}
                          <Table.Cell className="font-mono text-xs" style={{ color: 'var(--color-muted)' }}>
                            #{cat.sort_order || 0}
                          </Table.Cell>

                          {/* Status */}
                          <Table.Cell>
                            {cat.is_active ? (
                              <BadgeWithIcon size="sm" color="success" iconLeading={Check} className="font-semibold capitalize">
                                Active
                              </BadgeWithIcon>
                            ) : (
                              <BadgeWithIcon size="sm" color="gray" iconLeading={EyeOff} className="font-semibold capitalize">
                                Hidden
                              </BadgeWithIcon>
                            )}
                          </Table.Cell>

                          {/* Actions */}
                          <Table.Cell>
                            <TableActionButtons
                              item={cat}
                              onEdit={() => openEdit(cat)}
                              onDelete={() => handleDelete(cat.id)}
                              confirmDelete={`Are you sure you want to delete category "${cat.name}"? Sub-categories linked to it will also be deleted.`}
                              extraActions={
                                !cat.parent_id && (
                                  <button
                                    type="button"
                                    onClick={() => openCreate(cat.id)}
                                    className="text-xs font-bold text-[var(--color-500,#BF4040)] hover:underline mr-1 flex items-center gap-1"
                                  >
                                    <Plus size={12} strokeWidth={2.5} /> Sub-Cat
                                  </button>
                                )
                              }
                            />
                          </Table.Cell>
                        </Table.Row>
                      )
                    }}
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
                <FolderTree
                  size={40}
                  className="mx-auto mb-2 opacity-40"
                  style={{ color: 'var(--color-muted)' }}
                />
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                  No categories found
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
                  Click Add Category to create your first menu category or sub-category.
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
