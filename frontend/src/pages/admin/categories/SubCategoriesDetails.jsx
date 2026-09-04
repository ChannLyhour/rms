import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import AdminLayout from '../../../components/layout/AdminLayout'
import { adminApi } from '../../../api/adminApi'
import axiosClient from '../../../api/axiosClient'
import {
  Table,
  TableCard,
  BadgeWithIcon,
  FilterSearchInput,
  TableActionButtons,
  FiltersPopover,
  CreateButton,
} from '../../../components/TablesComponents'
import { Button } from '../../../components/common/ButtonComponent'
import { Modal, ConfirmModal } from '../../../components/common/ModalComponent'
import CategoriesCreateView from './CategoriesCreateView'
import { Check, X, Edit01, Trash01, ArrowLeft } from '@untitledui/icons'
import {
  CornerDownRight,
  Building2,
  Coffee,
  Wine,
  ShoppingCart,
  Utensils,
  FolderTree,
  Package,
  CheckCircle2,
  ChevronRight,
  UploadCloud,
  AlertTriangle
} from 'lucide-react'
import toast from 'react-hot-toast'

// Emoji helper
const getCategoryEmoji = (name) => {
  const n = String(name || '').toLowerCase()
  if (n.includes('coffee') || n.includes('espresso') || n.includes('latte')) return '☕'
  if (n.includes('tea') || n.includes('matcha') || n.includes('boba')) return '🍵'
  if (n.includes('drink') || n.includes('beverage') || n.includes('juice') || n.includes('smoothie')) return '🧃'
  if (n.includes('cocktail') || n.includes('wine') || n.includes('beer') || n.includes('liquor')) return '🍸'
  if (n.includes('soup') || n.includes('ramen') || n.includes('noodle')) return '🥣'
  if (n.includes('burger') || n.includes('sandwich')) return '🍔'
  if (n.includes('pizza') || n.includes('pasta')) return '🍕'
  if (n.includes('chicken') || n.includes('bbq') || n.includes('steak') || n.includes('meat')) return '🍗'
  if (n.includes('rice') || n.includes('main') || n.includes('curry')) return '🍛'
  if (n.includes('salad') || n.includes('appetizer') || n.includes('snack')) return '🥗'
  if (n.includes('dessert') || n.includes('cake') || n.includes('bakery') || n.includes('pastry')) return '🍰'
  if (n.includes('mart') || n.includes('grocery') || n.includes('snack')) return '🛍️'
  return '🍽️'
}

export default function SubCategoriesDetails({
  subCategory: propSubCategory,
  subCategoryId: propSubCategoryId,
  parentCategory: propParentCategory,
  categories: propCategories,
  outlets: propOutlets,
  onBack: propOnBack,
  onEdit: propOnEdit,
  onRefresh: propOnRefresh,
}) {
  const { id: routeId, subId: routeSubId } = useParams()
  const navigate = useNavigate()

  const targetSubCategoryId = propSubCategory?.id || propSubCategoryId || routeSubId || routeId

  // State
  const [subCategory, setSubCategory] = useState(propSubCategory || null)
  const [parentCategory, setParentCategory] = useState(propParentCategory || null)
  const [categories, setCategories] = useState(propCategories || [])
  const [outlets, setOutlets] = useState(propOutlets || [])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(!propSubCategory)

  // Products Filter & Search State
  const [searchProduct, setSearchProduct] = useState('')
  const [advancedFilters, setAdvancedFilters] = useState([])

  // Modal State for Quick Add/Edit Sub-Category
  const [subModalOpen, setSubModalOpen] = useState(false)
  const [subForm, setSubForm] = useState({
    name: '',
    description: '',
    sort_order: 0,
    is_active: true,
    image_url: '',
  })
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  // Delete Confirmation Modal
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    item: null,
  })

  // Load Data
  const loadAllData = async () => {
    try {
      setLoading(true)
      const [catsRes, outletsRes, prodsRes] = await Promise.all([
        categories.length ? Promise.resolve({ data: { data: categories } }) : adminApi.getCategories(),
        outlets.length ? Promise.resolve({ data: { data: outlets } }) : axiosClient.get('/outlets'),
        adminApi.getProducts({ limit: 300 }).catch(() => ({ data: { data: [] } })),
      ])

      const fetchedCats = catsRes.data?.data || []
      const fetchedOutlets = outletsRes.data?.data || []
      const fetchedProds = prodsRes.data?.data || []

      setCategories(fetchedCats)
      setOutlets(fetchedOutlets)
      setProducts(fetchedProds)

      if (targetSubCategoryId) {
        const foundSub = fetchedCats.find((c) => String(c.id) === String(targetSubCategoryId))
        if (foundSub) {
          setSubCategory(foundSub)
          if (foundSub.parent_id) {
            const foundParent = fetchedCats.find((c) => String(c.id) === String(foundSub.parent_id))
            if (foundParent) setParentCategory(foundParent)
          }
        }
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to load sub-category details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAllData()
  }, [targetSubCategoryId])

  // Sync prop changes
  useEffect(() => {
    if (propSubCategory) {
      setSubCategory(propSubCategory)
      setSubForm({
        name: propSubCategory.name || '',
        description: propSubCategory.description || '',
        sort_order: propSubCategory.sort_order ?? 0,
        is_active: propSubCategory.is_active !== false,
        image_url: propSubCategory.image_url || '',
      })
    }
  }, [propSubCategory])

  useEffect(() => {
    if (propParentCategory) {
      setParentCategory(propParentCategory)
    } else if (subCategory?.parent_id && categories.length > 0) {
      const found = categories.find((c) => String(c.id) === String(subCategory.parent_id))
      if (found) setParentCategory(found)
    }
  }, [propParentCategory, subCategory?.parent_id, categories])

  // Products under this sub-category
  const subCategoryProducts = useMemo(() => {
    if (!subCategory?.id) return []
    return products.filter((p) => String(p.category_id) === String(subCategory.id))
  }, [products, subCategory?.id])

  // Filtered products by search query & advanced filters
  const filteredProducts = useMemo(() => {
    let result = subCategoryProducts
    const q = searchProduct.toLowerCase().trim()
    if (q) {
      result = result.filter(
        (p) => p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q) || p.barcode?.toLowerCase().includes(q)
      )
    }
    if (advancedFilters.length > 0) {
      advancedFilters.forEach((filter) => {
        if (!filter.field || !filter.value) return
        const val = filter.value.toLowerCase()
        if (filter.field === 'name') {
          result = result.filter((p) => p.name?.toLowerCase().includes(val))
        } else if (filter.field === 'sku') {
          result = result.filter((p) => p.sku?.toLowerCase().includes(val) || p.barcode?.toLowerCase().includes(val))
        } else if (filter.field === 'status') {
          const wantActive = val === 'active'
          result = result.filter((p) => (p.is_available !== false) === wantActive)
        } else if (filter.field === 'price') {
          result = result.filter((p) => String(p.price || 0).includes(val))
        }
      })
    }
    return result
  }, [subCategoryProducts, searchProduct, advancedFilters])

  // Venue / Outlet Information (inherited from sub-category or parent category)
  const outletInfo = useMemo(() => {
    const outletId = subCategory?.outlet_id || parentCategory?.outlet_id
    if (!outletId) {
      return {
        id: 'global',
        name: 'All Venues (Global / Shared)',
        type: 'global',
        code: 'ALL',
      }
    }
    const found = outlets.find((o) => String(o.id) === String(outletId))
    return (
      found || {
        id: String(outletId),
        name: `Venue #${outletId}`,
        type: 'dine_in',
        code: 'VENUE',
      }
    )
  }, [subCategory?.outlet_id, parentCategory?.outlet_id, outlets])

  const getOutletIcon = (type, size = 16, className = '') => {
    switch (type) {
      case 'cafe':
        return <Coffee size={size} className={className || 'text-amber-600 dark:text-amber-400 shrink-0'} />
      case 'bar':
        return <Wine size={size} className={className || 'text-purple-600 dark:text-purple-400 shrink-0'} />
      case 'retail':
        return <ShoppingCart size={size} className={className || 'text-emerald-600 dark:text-emerald-400 shrink-0'} />
      case 'global':
        return <Building2 size={size} className={className || 'text-[var(--color-500,#BF4040)] shrink-0'} />
      case 'dine_in':
      default:
        return <Utensils size={size} className={className || 'text-[var(--color-500,#BF4040)] shrink-0'} />
    }
  }

  // Navigation Handler
  const handleBack = () => {
    if (propOnBack) {
      propOnBack()
    } else if (parentCategory?.id) {
      navigate(`/groups/categories/${parentCategory.id}`)
    } else {
      navigate('/groups/categories')
    }
  }

  // Toggle Sub-Category Status (Active / Inactive)
  const handleToggleStatus = async () => {
    if (!subCategory) return
    const newStatus = subCategory.is_active === false
    try {
      await adminApi.updateCategory(subCategory.id, {
        name: subCategory.name,
        is_active: newStatus,
        parent_id: subCategory.parent_id,
        outlet_id: subCategory.outlet_id,
      })
      const updated = { ...subCategory, is_active: newStatus }
      setSubCategory(updated)
      toast.success(`Sub-category "${subCategory.name}" is now ${newStatus ? 'Active' : 'Inactive'}`)
      propOnRefresh?.()
    } catch (err) {
      console.error(err)
      toast.error('Failed to update status')
    }
  }

  // Toggle Individual Product Status (Available / Unavailable)
  const handleToggleProductStatus = async (prod) => {
    const newStatus = prod.is_available === false
    try {
      await adminApi.updateProduct(prod.id, {
        is_available: newStatus,
      })
      setProducts((prev) =>
        prev.map((p) => (p.id === prod.id ? { ...p, is_available: newStatus } : p))
      )
      toast.success(`Product "${prod.name}" is now ${newStatus ? 'Available' : 'Hidden'}`)
    } catch (err) {
      console.error(err)
      toast.error('Failed to update product status')
    }
  }

  // Open Edit Modal
  const handleOpenEditModal = () => {
    if (!subCategory) return
    setSubForm({
      name: subCategory.name || '',
      description: subCategory.description || '',
      sort_order: subCategory.sort_order ?? 0,
      is_active: subCategory.is_active !== false,
      image_url: subCategory.image_url || '',
    })
    setSubModalOpen(true)
  }

  // Save Edit Sub-Category
  const handleSaveSubCategory = async (e) => {
    e?.preventDefault()
    if (!subForm.name.trim()) {
      toast.error('Sub-category name is required')
      return
    }

    try {
      const payload = {
        name: subForm.name.trim(),
        description: subForm.description.trim() || null,
        sort_order: Number(subForm.sort_order) || 0,
        is_active: subForm.is_active,
        image_url: subForm.image_url.trim() || null,
        parent_id: subCategory?.parent_id || parentCategory?.id || null,
        outlet_id: subCategory?.outlet_id || parentCategory?.outlet_id || null,
      }

      await adminApi.updateCategory(subCategory.id, payload)
      toast.success('Sub-category updated successfully')
      setSubModalOpen(false)
      const updated = { ...subCategory, ...payload }
      setSubCategory(updated)
      propOnRefresh?.()
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.error || 'Failed to update sub-category')
    }
  }

  // Delete Sub-Category
  const confirmDelete = () => {
    setDeleteModal({
      isOpen: true,
      item: subCategory,
    })
  }

  const handleExecuteDelete = async () => {
    if (!deleteModal.item) return
    try {
      await adminApi.deleteCategory(deleteModal.item.id)
      toast.success(`Sub-category "${deleteModal.item.name}" deleted successfully`)
      setDeleteModal({ isOpen: false, item: null })
      propOnRefresh?.()
      handleBack()
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.error || 'Failed to delete sub-category')
    }
  }

  // Image Upload Handler
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, WebP)')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      setIsUploadingImage(true)
      const res = await axiosClient.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const url = res.data?.data?.url || res.data?.url
      if (url) {
        setSubForm((prev) => ({ ...prev, image_url: url }))
        toast.success('Image uploaded successfully')
      }
    } catch (err) {
      console.error(err)
      toast.error('Image upload failed')
    } finally {
      setIsUploadingImage(false)
    }
  }

  // Render State
  const isEmbedded = Boolean(propSubCategory || propSubCategoryId || propOnBack)

  if (loading && !subCategory) {
    const loadingView = (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 border-4 border-[#126973] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-[var(--color-muted)]">Loading sub-category details...</p>
      </div>
    )
    return isEmbedded ? loadingView : <AdminLayout>{loadingView}</AdminLayout>
  }

  if (!subCategory) {
    const notFoundView = (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4 max-w-md mx-auto p-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
          <FolderTree size={32} />
        </div>
        <h2 className="text-lg font-bold text-[var(--color-text)]">Sub-Category Not Found</h2>
        <p className="text-xs text-[var(--color-muted)]">
          The sub-category requested does not exist or has been removed.
        </p>
        <Button variant="primary" onClick={handleBack}>
          Return to Categories
        </Button>
      </div>
    )
    return isEmbedded ? notFoundView : <AdminLayout>{notFoundView}</AdminLayout>
  }

  const emoji = getCategoryEmoji(subCategory.name)
  const activeProductsCount = subCategoryProducts.filter((p) => p.is_available !== false).length

  const mainContent = (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-150">
      {/* ══════════ TOP BREADCRUMB & BACK NAVIGATION ══════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Button
            variant="secondary"
            size="xs"
            iconLeading={ArrowLeft}
            onClick={handleBack}
            className="shadow-2xs"
            title="Go back"
          />
          <Link
            to="/groups/categories"
            className="hover:text-[var(--color-text)] transition-colors cursor-pointer"
          >
            Categories
          </Link>
          <ChevronRight size={13} className="text-slate-400 shrink-0" />
          {parentCategory && (
            <>
              <button
                type="button"
                onClick={handleBack}
                className="hover:text-[var(--color-text)] transition-colors cursor-pointer truncate max-w-[140px] font-medium"
              >
                {parentCategory.name}
              </button>
              <ChevronRight size={13} className="text-slate-400 shrink-0" />
            </>
          )}
          <span className="inline-flex items-center gap-1.5 font-bold text-xs" style={{ color: 'var(--color-text)' }}>
            <span className="truncate max-w-[180px] sm:max-w-md">{subCategory.name}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="xs"
            iconLeading={Edit01}
            onClick={handleOpenEditModal}
          >
            Edit Sub-Category
          </Button>
          <Button
            variant="secondary"
            size="xs"
            iconLeading={Trash01}
            onClick={confirmDelete}
            className="text-rose-500 hover:text-rose-600 dark:text-rose-400"
          >
            Delete
          </Button>
        </div>
      </div>

      {/* ══════════ SUB-CATEGORY OVERVIEW HERO CARD ══════════ */}
      <div
        className="p-5 sm:p-6 rounded-xl border shadow-xs hover:shadow-md transition-all duration-200 border-b-[3px] border-b-amber-500"
        style={{
          background: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="flex flex-col sm:flex-row items-start justify-between gap-5">
          <div className="flex items-start gap-4 min-w-0 flex-1">
            {/* Visual Image / Emoji Box */}
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shrink-0 border flex items-center justify-center text-3xl shadow-xs"
              style={{
                background: 'var(--color-bg)',
                borderColor: 'var(--color-border)',
              }}
            >
              {subCategory.image_url ? (
                <img
                  src={subCategory.image_url}
                  alt={subCategory.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              ) : (
                <span>{emoji}</span>
              )}
            </div>

            {/* Name, Badges & Meta */}
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1
                  className="text-xl sm:text-2xl font-extrabold tracking-tight truncate"
                  style={{ color: 'var(--color-text)' }}
                >
                  {subCategory.name}
                </h1>

                

                {/* Status Badge */}
                <button
                  type="button"
                  onClick={handleToggleStatus}
                  className="cursor-pointer transition-opacity hover:opacity-80"
                  title="Click to toggle active status"
                >
                  <BadgeWithIcon
                    color={subCategory.is_active !== false ? 'success' : 'gray'}
                    icon={subCategory.is_active !== false ? Check : X}
                    size="sm"
                  >
                    {subCategory.is_active !== false ? 'Active' : 'Inactive'}
                  </BadgeWithIcon>
                </button>

             
                
              </div>

              {/* Secondary Details */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-muted)] pt-0.5">
                
                <span className="font-medium">{outletInfo.name}</span>
                <span>·</span>
                <span>Sort Order: #{subCategory.sort_order ?? 0}</span>
                <span>·</span>
                <span>{subCategoryProducts.length} {subCategoryProducts.length === 1 ? 'Direct Product' : 'Direct Products'}</span>
              </div>

              {subCategory.description ? (
                <p className="text-xs text-[var(--color-muted)] leading-relaxed max-w-3xl pt-0.5">
                  {subCategory.description}
                </p>
              ) : (
                <p className="text-xs text-[var(--color-muted)]/70 italic pt-0.5">
                  No description provided for this sub-category.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      

      {/* ══════════ TABLE CARD: SUB-CATEGORY PRODUCTS ══════════ */}
      <TableCard.Root>
        {/* Unified FilterBar from TablesComponents - Matching Pic 2 */}
        <TableCard.FilterBar
          hasCreate
          onCreate={() => navigate('/products')}
          createLabel="Product"
        >
          <div className="flex items-center gap-2.5 flex-1 max-w-xl">
            <FilterSearchInput
              value={searchProduct}
              onChange={setSearchProduct}
              placeholder="Search..."
              
              className="w-full"
            />

            <FiltersPopover
              fields={[
                { value: 'name', label: 'Product Name' },
                { value: 'sku', label: 'SKU / Barcode' },
                { value: 'price', label: 'Price ($)' },
                {
                  value: 'status',
                  label: 'Status',
                  options: [
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' },
                  ],
                },
              ]}
              initialFilters={advancedFilters}
              onApply={(rules) => {
                setAdvancedFilters(rules)
                if (rules.length > 0) {
                  toast.success(`Applied ${rules.length} filter${rules.length === 1 ? '' : 's'}`)
                }
              }}
              onClear={() => {
                setAdvancedFilters([])
                toast('Cleared filters')
              }}
            />
          </div>
        </TableCard.FilterBar>

        {filteredProducts.length === 0 ? (
          <div className="py-14 px-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#126973]/10 text-[#126973] flex items-center justify-center mx-auto">
              <Package size={24} />
            </div>
            <h3 className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>
              {searchProduct ? 'No matching products found' : 'No Products in this Sub-Category'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              {searchProduct
                ? `No products match "${searchProduct}". Try clearing your search.`
                : `Assign or create menu items under "${subCategory.name}".`}
            </p>
            <Link to="/products">
              <CreateButton label="Go to Products Management" />
            </Link>
          </div>
        ) : (
          <Table aria-label="Sub-Category Products">
            <Table.Header>
              <Table.Head id="product" label="Product / Dish" />
              <Table.Head id="sku" label="SKU / Code" />
              <Table.Head id="price" label="Price" />
              <Table.Head id="availability" label="Availability" />
              <Table.Head id="actions" label="Actions" className="text-right" />
            </Table.Header>
            <Table.Body items={filteredProducts}>
              {(p) => {
                const prodEmoji = getCategoryEmoji(p.name)
                return (
                  <Table.Row key={p.id}>
                    <Table.Cell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-black/10 dark:border-white/10 flex items-center justify-center bg-black/5 dark:bg-white/5 text-base shadow-2xs">
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
                            <span>{prodEmoji}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-xs" style={{ color: 'var(--color-text)' }}>
                            {p.name}
                          </p>
                          {p.description && (
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-xs">
                              {p.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </Table.Cell>
                    <Table.Cell className="font-mono text-xs text-slate-500 dark:text-slate-400">
                      {p.sku || p.barcode || '—'}
                    </Table.Cell>
                    <Table.Cell className="font-bold text-xs" style={{ color: 'var(--color-text)' }}>
                      ${Number(p.price || 0).toFixed(2)}
                    </Table.Cell>
                    <Table.Cell>
                      <button
                        type="button"
                        onClick={() => handleToggleProductStatus(p)}
                        className="cursor-pointer transition-opacity hover:opacity-80"
                        title="Toggle availability"
                      >
                        <BadgeWithIcon
                          color={p.is_available !== false ? 'success' : 'gray'}
                          icon={p.is_available !== false ? Check : X}
                          size="sm"
                        >
                          {p.is_available !== false ? 'Available' : 'Hidden'}
                        </BadgeWithIcon>
                      </button>
                    </Table.Cell>
                    <Table.Cell className="text-right">
                      <TableActionButtons
                        variant="icon"
                        size="sm"
                        onEdit={() => navigate(`/products`)}
                      />
                    </Table.Cell>
                  </Table.Row>
                )
              }}
            </Table.Body>
          </Table>
        )}
      </TableCard.Root>

      {/* ══════════ MODAL: EDIT SUB-CATEGORY ══════════ */}
      <CategoriesCreateView
        isOpen={subModalOpen}
        item={subCategory}
        categories={categories}
        onClose={() => setSubModalOpen(false)}
        onSave={async (payload) => {
          try {
            await adminApi.updateCategory(subCategory.id, payload)
            toast.success('Sub-category updated successfully')
            setSubModalOpen(false)
            loadAllData()
            onRefresh?.()
          } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to update sub-category')
          }
        }}
        onQuickCreateSubCategory={loadAllData}
      />

      {/* ══════════ MODAL: DELETE CONFIRMATION ══════════ */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, item: null })}
        onConfirm={handleExecuteDelete}
        title="Delete Sub-Category"
        description={`Are you sure you want to delete sub-category "${deleteModal.item?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        icon={AlertTriangle}
        variant="destructive"
      />
    </div>
  )

  return isEmbedded ? mainContent : <AdminLayout>{mainContent}</AdminLayout>
}
