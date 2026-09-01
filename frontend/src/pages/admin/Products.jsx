import { useState, useEffect, useMemo } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import MenuitemCreateView from '../../components/admin/MenuitemCreateView'
import { adminApi } from '../../api/adminApi'
import axiosClient from '../../api/axiosClient'
import { Table, TableCard, BadgeWithIcon, Button, PaginationPageMinimalCenter } from '../../components/TablesComponents'
import { CreateButton } from '../../components/common/ButtonComponent'
import { Check, X, SearchLg, Plus, Edit01, Trash01 } from '@untitledui/icons'
import { Package, Tag, EyeOff, Building2, Coffee, Wine, ShoppingCart, Utensils } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Products() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [outlets, setOutlets] = useState([])
  const [outletFilter, setOutletFilter] = useState('all')
  const [search, setSearch] = useState('')
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
    adminApi.getProducts().then(({ data }) => setProducts(data.data || []))
    adminApi.getCategories().then(({ data }) => setCategories(data.data || []))
    axiosClient.get('/outlets').then(({ data }) => setOutlets(data.data || [])).catch(() => {})
  }

  useEffect(() => {
    loadData()
  }, [])

  // Sort & Filter logic
  const sortedAndFiltered = useMemo(() => {
    let list = products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.category?.name && p.category.name.toLowerCase().includes(search.toLowerCase())) ||
        (p.barcode && p.barcode.toLowerCase().includes(search.toLowerCase()))

      const matchOutlet = outletFilter === 'all' || String(p.outlet_id) === String(outletFilter)
      return matchSearch && matchOutlet
    })

    return list.sort((a, b) => {
      let first = a[sortDescriptor.column]
      let second = b[sortDescriptor.column]

      if (sortDescriptor.column === 'category') {
        first = a.category?.name || ''
        second = b.category?.name || ''
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
  }, [products, search, outletFilter, sortDescriptor])

  // Reset page on search or outlet filter
  useEffect(() => {
    setCurrentPage(1)
  }, [search, outletFilter])

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
              </div>

              <CreateButton
                label="Add New Product"
                onClick={handleOpenCreate}
              />
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

            {/* Search Bar */}
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
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products by title, category, or barcode..."
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

            {/* Untitled UI / React Aria TableCard */}
            <TableCard.Root>
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
                  <Table.Head
                    id="category"
                    label="Category"
                    allowsSorting
                    sortDescriptor={sortDescriptor}
                    onSort={handleSort}
                  />
                  <Table.Head id="outlet" label="Assigned Venue" />
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
                                <span>🍽️</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="font-bold text-xs truncate leading-snug" style={{ color: 'var(--color-text)' }}>
                                  {p.name}
                                </p>
                              </div>
                              {p.barcode && (
                                <span className="font-mono text-[10px] text-slate-400 block mt-0.5">
                                  #{p.barcode}
                                </span>
                              )}
                              {p.description && (
                                <p className="text-[11px] truncate max-w-xs opacity-75" style={{ color: 'var(--color-muted)' }}>
                                  {p.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </Table.Cell>

                        {/* Category */}
                        <Table.Cell>
                          <span
                            className="px-2.5 py-0.5 rounded-[5px] border font-medium inline-block text-[11px]"
                            style={{
                              background: 'var(--color-bg)',
                              borderColor: 'var(--color-border)',
                              color: 'var(--color-text)',
                            }}
                          >
                            {p.category?.name || 'Uncategorized'}
                          </span>
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

                        {/* Price */}
                        <Table.Cell className="font-mono font-bold text-xs" style={{ color: 'var(--color-500, #BF4040)' }}>
                          ${Number(p.price).toFixed(2)}
                        </Table.Cell>

                        {/* Stock */}
                        <Table.Cell className="font-mono text-xs" style={{ color: 'var(--color-muted)' }}>
                          {p.track_stock ? p.stock_quantity : '∞ (Unlimited)'}
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
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(p)}
                              className="p-1.5 rounded-[5px] text-slate-400 hover:text-[#126973] hover:bg-[#126973]/10 dark:hover:text-[#F1D8C2] transition-all cursor-pointer"
                              title="Edit Product"
                            >
                              <Edit01 size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(p.id)}
                              className="p-1.5 rounded-[5px] text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all cursor-pointer"
                              title="Delete Product"
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
