import { useState, useEffect, useMemo } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import MenuitemCreateView from './products/ProductsitemCreateView'
import { adminApi } from '../../api/adminApi'
import axiosClient from '../../api/axiosClient'
import {
  Table,
  TableCard,
  BadgeWithIcon,
  Button,
  PaginationPageMinimalCenter,
  FilterBar,
  FilterSearchInput,
  FiltersPopover,
  CreateButton,
  TableActionButtons
} from '../../components/TablesComponents'
import { Check, X, SearchLg, Plus } from '@untitledui/icons'
import { Package, Tag, EyeOff, Building2, Coffee, Wine, ShoppingCart, Utensils, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Products() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [outlets, setOutlets] = useState([])
  const [outletFilter, setOutletFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [advancedFilters, setAdvancedFilters] = useState([])
  const [activeView, setActiveView] = useState('list') // 'list' | 'create' | 'edit'
  const [selectedProduct, setSelectedProduct] = useState(null)

  const [sortDescriptor, setSortDescriptor] = useState({
    column: 'id',
    direction: 'descending',
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
    adminApi.getProducts({ limit: 200 }).then(({ data }) => setProducts(data.data || []))
    adminApi.getCategories({ limit: 200 }).then(({ data }) => setCategories(data.data || []))
    axiosClient.get('/outlets').then(({ data }) => setOutlets(data.data || [])).catch(() => {})
  }

  useEffect(() => {
    loadData()
  }, [])

  // Category hierarchy map & resolver
  const categoryMap = useMemo(() => {
    const map = {}
    categories.forEach((c) => {
      map[String(c.id)] = c
    })
    return map
  }, [categories])

  const getProductCategoryHierarchy = (p) => {
    const cat = p.category || categoryMap[String(p.category_id)]
    const isSub = Boolean(cat?.parent_id)
    const parentCat = isSub ? categoryMap[String(cat.parent_id)] : null

    const mainName = isSub
      ? (parentCat?.name || 'Category')
      : (cat?.name || p.category_name || 'Uncategorized')

    const subName = isSub
      ? cat?.name
      : (p.sub_category?.name || p.sub_category || p.sub_category_name || p.subcategory || null)

    return { mainName, subName }
  }

  // Sort & Filter logic
  const sortedAndFiltered = useMemo(() => {
    let list = products.filter((p) => {
      const { mainName, subName } = getProductCategoryHierarchy(p)
      const q = search.toLowerCase()
      const matchSearch = p.name.toLowerCase().includes(q) ||
        mainName.toLowerCase().includes(q) ||
        (subName && subName.toLowerCase().includes(q)) ||
        (p.barcode && p.barcode.toLowerCase().includes(q))

      const matchOutlet = outletFilter === 'all' || String(p.outlet_id) === String(outletFilter)

      // Advanced filters from FiltersPopover
      const matchAdvanced = advancedFilters.length === 0 || advancedFilters.every((c) => {
        if (!c.field || !c.value) return true
        const val = String(c.value).toLowerCase().trim()
        let targetVal = ''

        if (c.field === 'name') {
          targetVal = String(p.name || '').toLowerCase()
        } else if (c.field === 'category') {
          targetVal = String(p.category?.name || '').toLowerCase()
        } else if (c.field === 'barcode') {
          targetVal = String(p.barcode || '').toLowerCase()
        } else if (c.field === 'is_available') {
          targetVal = p.is_available ? 'available' : 'hidden'
        } else if (c.field === 'price') {
          const numTarget = Number(p.price || 0)
          const numVal = Number(c.value || 0)
          if (c.operator === 'greater_than') return numTarget > numVal
          if (c.operator === 'less_than') return numTarget < numVal
          if (c.operator === 'equals') return numTarget === numVal
          if (c.operator === 'not_equals') return numTarget !== numVal
          return true
        } else if (c.field === 'stock_quantity') {
          const numTarget = Number(p.stock_quantity || 0)
          const numVal = Number(c.value || 0)
          if (c.operator === 'greater_than') return numTarget > numVal
          if (c.operator === 'less_than') return numTarget < numVal
          if (c.operator === 'equals') return numTarget === numVal
          if (c.operator === 'not_equals') return numTarget !== numVal
          return true
        } else {
          targetVal = String(p[c.field] || '').toLowerCase()
        }

        if (c.operator === 'equals') return targetVal === val
        if (c.operator === 'contains') return targetVal.includes(val)
        if (c.operator === 'not_equals') return targetVal !== val
        if (c.operator === 'starts_with') return targetVal.startsWith(val)
        return true
      })

      return matchSearch && matchOutlet && matchAdvanced
    })

    return list.sort((a, b) => {
      let first = a[sortDescriptor.column]
      let second = b[sortDescriptor.column]

      if (sortDescriptor.column === 'category') {
        const catA = getProductCategoryHierarchy(a)
        const catB = getProductCategoryHierarchy(b)
        first = `${catA.mainName} ${catA.subName || ''}`
        second = `${catB.mainName} ${catB.subName || ''}`
      }

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
  }, [products, search, outletFilter, sortDescriptor, categoryMap, advancedFilters])

  // Reset page on search or filter change
  useEffect(() => {
    setCurrentPage(1)
  }, [search, outletFilter, advancedFilters])

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
    setSelectedProduct(null)
    setActiveView('create')
  }

  const handleOpenEdit = (p) => {
    setSelectedProduct(p)
    setActiveView('edit')
  }

  const handleCloseView = () => {
    setSelectedProduct(null)
    setActiveView('list')
  }

  const handleSaveProduct = async (payload) => {
    try {
      if (activeView === 'create') {
        await adminApi.createProduct(payload)
        toast.success('Product created successfully')
        setCurrentPage(1)
      } else if (selectedProduct?.id) {
        await adminApi.updateProduct(selectedProduct.id, payload)
        toast.success('Product updated successfully')
      }
      loadData()
      handleCloseView()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    try {
      await adminApi.deleteProduct(id)
      setProducts((prev) => prev.filter((p) => p.id !== id))
      toast.success('Product removed')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete product')
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* If creating or editing, show full MenuitemCreateView */}
        {activeView !== 'list' ? (
          <MenuitemCreateView
            item={selectedProduct}
            categories={categories}
            onClose={handleCloseView}
            onSave={handleSaveProduct}
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
                  Product Catalog
                </h1>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                  Manage menu items, prices, inventory &amp; modifiers across venues
                </p>
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
                    {products.length}
                  </span>
                </button>

                {outlets.map((o) => {
                  const count = products.filter((p) => String(p.outlet_id) === String(o.id)).length
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

            {/* Untitled UI / React Aria TableCard */}
            <TableCard.Root>
              <TableCard.FilterBar
                hasCreate
                onCreate={handleOpenCreate}
                // createLabel="Add New Product"
              >
                <div className="flex items-center gap-2.5 flex-1 max-w-xl">
                  <FilterSearchInput
                    value={search}
                    onChange={(val) => {
                      setSearch(val)
                      setCurrentPage(1)
                    }}
                    placeholder="Search products by title, category, or barcode..."
                    shortcut="⌘K"
                    className="w-full"
                  />

                  <FiltersPopover
                    fields={[
                      { value: 'name', label: 'Product Name' },
                      {
                        value: 'category',
                        label: 'Category',
                        options: categories.map((c) => ({ value: c.name, label: c.name })),
                      },
                      {
                        value: 'is_available',
                        label: 'Availability',
                        options: [
                          { value: 'available', label: 'Available' },
                          { value: 'hidden', label: 'Hidden' },
                        ],
                      },
                      { value: 'price', label: 'Price ($)' },
                      { value: 'stock_quantity', label: 'Stock Quantity' },
                      { value: 'barcode', label: 'Barcode' },
                    ]}
                    initialFilters={advancedFilters}
                    onApply={(rules) => {
                      setAdvancedFilters(rules)
                      setCurrentPage(1)
                      toast.success(`Applied ${rules.length} filter${rules.length === 1 ? '' : 's'}`)
                    }}
                    onClear={() => {
                      setAdvancedFilters([])
                      setCurrentPage(1)
                      toast('Cleared filters')
                    }}
                  />
                </div>
              </TableCard.FilterBar>

              <Table aria-label="Products Catalog" sortDescriptor={sortDescriptor}>
                <Table.Header>
                  <Table.Head
                    id="name"
                    label="Product"
                    isRowHeader
                    allowsSorting
                    sortDescriptor={sortDescriptor}
                    onSort={handleSort}
                  />
                 
                  <Table.Head id="outlet" label="Venue" />
                  <Table.Head
                    id="price"
                    label="Price"
                    allowsSorting
                    sortDescriptor={sortDescriptor}
                    onSort={handleSort}
                  />
                  <Table.Head
                    id="stock_quantity"
                    label="Stock"
                    allowsSorting
                    sortDescriptor={sortDescriptor}
                    onSort={handleSort}
                  />
                  <Table.Head
                    id="is_available"
                    label="Availability"
                    allowsSorting
                    sortDescriptor={sortDescriptor}
                    onSort={handleSort}
                  />
                  <Table.Head id="modifiers" label="Modifiers" className="hidden lg:table-cell" />
                  <Table.Head id="actions" className="text-right">
                    Actions
                  </Table.Head>
                </Table.Header>

                <Table.Body items={paginatedItems}>
                  {(p) => {
                    const optCount = p.option_groups?.length || 0
                    const outlet = outlets.find((o) => String(o.id) === String(p.outlet_id))

                    return (
                      <Table.Row key={p.id} id={p.id}>
                        {/* Product Thumbnail & Details */}
                        <Table.Cell>
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-[6px] overflow-hidden shrink-0 border flex items-center justify-center font-bold text-xs shadow-2xs"
                              style={{
                                background: 'var(--color-bg)',
                                borderColor: 'var(--color-border)',
                              }}
                            >
                              {p.image_url ? (
                                <img
                                  src={p.image_url}
                                  alt={p.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none'
                                  }}
                                />
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded"style={{
                                  background: 'var(--color-bg)',
                                  borderColor: 'var(--color-border)',
                                  color: 'var(--color-text)',
                                }}>
                                  {p.name}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className=" text-xs " style={{ color: 'var(--color-text)' }}>
                                  {p.name}
                                </p>
                              </div>
                              {p.barcode && (
                                <span className="text-[10px] text-slate-400 block mt-0.5">
                                  #{p.barcode}
                                </span>
                              )}
                              {/* {p.description && (
                                <p className="text-[11px] truncate max-w-xs opacity-75" style={{ color: 'var(--color-muted)' }}>
                                  {p.description}
                                </p>
                              )} */}
                              {(() => {
                                const { mainName, subName } = getProductCategoryHierarchy(p)
                                return (
                                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                                    <span>{mainName}</span>
                                    {subName && (
                                      <>
                                        <ChevronRight size={12} className="text-slate-400 shrink-0" />
                                        <span className="font-medium text-slate-600 dark:text-slate-300">
                                          {subName}
                                        </span>
                                      </>
                                    )}
                                  </span>
                                )
                              })()}
                            </div>
                          </div>
                        </Table.Cell>

                        

                        {/* Assigned Venue */}
                        <Table.Cell>
                          {outlet ? (
                           <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded"style={{
                              background: 'var(--color-bg)',
                              borderColor: 'var(--color-border)',
                              color: 'var(--color-text)',
                            }}>
                              
                              <span>{outlet.name}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded"style={{
                              background: 'var(--color-bg)',
                              borderColor: 'var(--color-border)',
                              color: 'var(--color-text)',
                            }}>
                              All Venues
                            </span>
                          )}
                        </Table.Cell>

                        {/* Price */}
                        <Table.Cell className="font-mono font-bold text-xs" style={{ color: 'var(--color-500, #BF4040)' }}>
                          ${Number(p.price).toFixed(2)}
                        </Table.Cell>

                        {/* Stock */}
                        <Table.Cell className="text-xs">
                          {p.is_unlimited || !p.track_stock ? (
                            <span className="inline-flex items-center gap-1 font-medium text-slate-500 dark:text-slate-400">
                              <span className="text-sm leading-none font-sans">∞</span>
                              <span>Unlimited</span>
                            </span>
                          ) : (
                            <div className="flex items-center gap-1.5 font-mono">
                              <span
                                className={`font-bold ${
                                  Number(p.stock_quantity) <= Number(p.low_stock_threshold ?? 5)
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-[var(--color-text)]'
                                }`}
                              >
                                {p.stock_quantity}
                              </span>
                              {Number(p.stock_quantity) <= Number(p.low_stock_threshold ?? 5) && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-sans">
                                  Low
                                </span>
                              )}
                            </div>
                          )}
                        </Table.Cell>

                        {/* Availability Badge */}
                        <Table.Cell>
                          {p.is_available ? (
                            <BadgeWithIcon size="sm" color="success" iconLeading={Check} className="font-semibold capitalize">
                              Available
                            </BadgeWithIcon>
                          ) : (
                            <BadgeWithIcon size="sm" color="gray" iconLeading={EyeOff} className="font-semibold capitalize">
                              Hidden
                            </BadgeWithIcon>
                          )}
                        </Table.Cell>

                        {/* Modifiers */}
                        <Table.Cell className="hidden lg:table-cell">
                          {optCount > 0 ? (
                            <span
                              className="text-[11px] px-2 py-0.5 rounded-[5px] border font-semibold inline-flex items-center gap-1"
                              style={{
                                background: 'rgba(191, 64, 64, 0.08)',
                                borderColor: 'rgba(191, 64, 64, 0.25)',
                                color: 'var(--color-500, #BF4040)',
                              }}
                            >
                              <Tag size={11} />
                              {optCount} {optCount === 1 ? 'group' : 'groups'}
                            </span>
                          ) : (
                            <span className="text-[11px] opacity-50" style={{ color: 'var(--color-muted)' }}>
                              Standard
                            </span>
                          )}
                        </Table.Cell>

                        {/* Actions */}
                        <Table.Cell className="text-right">
                          <TableActionButtons
                            onEdit={() => handleOpenEdit(p)}
                            onDelete={() => handleDelete(p.id)}
                            showView={false}
                            confirmDelete={`Are you sure you want to delete "${p.name}"?`}
                          />
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
