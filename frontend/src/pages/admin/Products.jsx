import { useState, useEffect, useMemo } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import MenuitemCreateView from '../../components/admin/MenuitemCreateView'
import { adminApi } from '../../api/adminApi'
import { Table, TableCard, BadgeWithIcon, Button, PaginationPageMinimalCenter } from '../../components/TablesComponents'
import { CreateButton } from '../../components/common/ButtonComponent'
import { TableActionButtons } from '../../components/plugin/components/button-Action-Components'
import { Check, X, SearchLg, Plus, Edit01, Trash01 } from '@untitledui/icons'
import { Package, Tag, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Products() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [activeView, setActiveView] = useState('list') // 'list' | 'create' | 'edit'
  const [selectedProduct, setSelectedProduct] = useState(null)

  const [sortDescriptor, setSortDescriptor] = useState({
    column: 'id',
    direction: 'descending',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const loadData = () => {
    adminApi.getProducts().then(({ data }) => setProducts(data.data || []))
    adminApi.getCategories().then(({ data }) => setCategories(data.data || []))
  }

  useEffect(() => {
    loadData()
  }, [])

  // Sort & Filter logic
  const sortedAndFiltered = useMemo(() => {
    let list = products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.category?.name && p.category.name.toLowerCase().includes(search.toLowerCase()))
    )

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
  }, [products, search, sortDescriptor])

  // Reset page on search
  useEffect(() => {
    setCurrentPage(1)
  }, [search])

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
                placeholder="Search products by title or category..."
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
                              <p className="font-bold text-xs truncate leading-snug" style={{ color: 'var(--color-text)' }}>
                                {p.name}
                              </p>
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
                        <Table.Cell>
                          <TableActionButtons
                            item={p}
                            onEdit={() => handleOpenEdit(p)}
                            onDelete={() => handleDelete(p.id)}
                            confirmDelete={`Are you sure you want to delete product "${p.name}"?`}
                          />
                        </Table.Cell>
                      </Table.Row>
                    )
                  }}
                </Table.Body>
              </Table>

              {sortedAndFiltered.length === 0 && (
                <div className="py-16 text-center">
                  <Package size={36} className="mx-auto mb-2 opacity-40" style={{ color: 'var(--color-muted)' }} />
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                    No products found
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
                    Try adjusting your search query or add a new product.
                  </p>
                </div>
              )}

              {/* Bottom Pagination */}
              {sortedAndFiltered.length > 0 && (
                <PaginationPageMinimalCenter
                  page={currentPage}
                  total={totalPages}
                  onPageChange={setCurrentPage}
                  className="px-4 py-3"
                />
              )}
            </TableCard.Root>
          </>
        )}
      </div>
    </AdminLayout>
  )
}
