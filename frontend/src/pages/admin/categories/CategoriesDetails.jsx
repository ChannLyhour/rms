import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import AdminLayout from '../../../components/layout/AdminLayout'
import SubCategoriesDetails from './SubCategoriesDetails'
import { adminApi } from '../../../api/adminApi'
import axiosClient from '../../../api/axiosClient'
import {
  Table,
  TableCard,
  BadgeWithIcon,
  FilterSearchInput,
  ViewToggle,
  TableActionButtons,
  FiltersPopover,
  CreateButton,
} from '../../../components/TablesComponents'
import { Button } from '../../../components/common/ButtonComponent'
import { Modal, ConfirmModal } from '../../../components/common/ModalComponent'
import CategoriesCreateView from './CategoriesCreateView'
import { Check, X, SearchLg, Plus, Edit01, Trash01, ArrowLeft, Eye } from '@untitledui/icons'
import {
  Folder,
  CornerDownRight,
  Building2,
  Coffee,
  Wine,
  ShoppingCart,
  Utensils,
  FolderTree,
  Layers,
  LayoutGrid,
  Table as TableIcon,
  Sparkles,
  Image as ImageIcon,
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

export default function CategoriesDetails({
  category: propCategory,
  categoryId: propCategoryId,
  categories: propCategories,
  onBack: propOnBack,
  onEdit: propOnEdit,
  onRefresh: propOnRefresh,
}) {
  const { id: routeId } = useParams()
  const navigate = useNavigate()

  const targetCategoryId = propCategory?.id || propCategoryId || routeId

  // State
  const [category, setCategory] = useState(propCategory || null)
  const [categories, setCategories] = useState(propCategories || [])
  const [outlets, setOutlets] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(!propCategory)

  // Sub-categories UI State
  const [searchSub, setSearchSub] = useState('')
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'table'
  const [activeTab, setActiveTab] = useState('subcategories') // 'subcategories' | 'products'
  const [searchProduct, setSearchProduct] = useState('')
  const [advancedFilters, setAdvancedFilters] = useState([])
  const [selectedSubCategory, setSelectedSubCategory] = useState(null)

  // Modal State for Quick Add/Edit Sub-Category
  const [subModalOpen, setSubModalOpen] = useState(false)
  const [editingSub, setEditingSub] = useState(null)
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
    type: 'subcategory', // 'subcategory' | 'main'
  })

  // Load Data
  const loadAllData = async () => {
    try {
      setLoading(true)
      const [catsRes, outletsRes, prodsRes] = await Promise.all([
        adminApi.getCategories(),
        axiosClient.get('/outlets'),
        adminApi.getProducts({ limit: 300 }).catch(() => ({ data: { data: [] } })),
      ])

      const fetchedCats = catsRes.data?.data || []
      const fetchedOutlets = outletsRes.data?.data || []
      const fetchedProds = prodsRes.data?.data || []

      setCategories(fetchedCats)
      setOutlets(fetchedOutlets)
      setProducts(fetchedProds)

      if (targetCategoryId) {
        const found = fetchedCats.find((c) => String(c.id) === String(targetCategoryId))
        if (found) {
          setCategory(found)
        }
      }
    } catch (err) {
      toast.error('Failed to load category details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAllData()
  }, [targetCategoryId])

  // Sync propCategory if updated from outside
  useEffect(() => {
    if (propCategory) {
      setCategory(propCategory)
    }
  }, [propCategory])

  // Sub-categories under this main category
  const subCategories = useMemo(() => {
    if (!category?.id) return []
    return categories
      .filter((c) => String(c.parent_id) === String(category.id))
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || (a.name || '').localeCompare(b.name || ''))
  }, [categories, category?.id])

  // Filtered sub-categories by search query & advanced filters
  const filteredSubCategories = useMemo(() => {
    let result = subCategories
    const q = searchSub.toLowerCase().trim()
    if (q) {
      result = result.filter(
        (s) => s.name?.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q)
      )
    }
    if (advancedFilters.length > 0 && activeTab === 'subcategories') {
      advancedFilters.forEach((filter) => {
        if (!filter.field || !filter.value) return
        const val = filter.value.toLowerCase()
        if (filter.field === 'name') {
          result = result.filter((s) => s.name?.toLowerCase().includes(val))
        } else if (filter.field === 'status') {
          const wantActive = val === 'active'
          result = result.filter((s) => (s.is_active !== false) === wantActive)
        }
      })
    }
    return result
  }, [subCategories, searchSub, advancedFilters, activeTab])

  // Products under this category and its subcategories
  const categoryProducts = useMemo(() => {
    if (!category?.id) return []
    const subIds = new Set(subCategories.map((s) => String(s.id)))
    return products.filter((p) => String(p.category_id) === String(category.id) || subIds.has(String(p.category_id)))
  }, [products, category?.id, subCategories])

  // Filtered products by search query & advanced filters
  const filteredProducts = useMemo(() => {
    let result = categoryProducts
    const q = searchProduct.toLowerCase().trim()
    if (q) {
      result = result.filter((p) => p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q))
    }
    if (advancedFilters.length > 0 && activeTab === 'products') {
      advancedFilters.forEach((filter) => {
        if (!filter.field || !filter.value) return
        const val = filter.value.toLowerCase()
        if (filter.field === 'name') {
          result = result.filter((p) => p.name?.toLowerCase().includes(val))
        } else if (filter.field === 'sku') {
          result = result.filter((p) => p.sku?.toLowerCase().includes(val))
        } else if (filter.field === 'status') {
          const wantActive = val === 'active'
          result = result.filter((p) => (p.is_active !== false) === wantActive)
        } else if (filter.field === 'price') {
          result = result.filter((p) => String(p.price || 0).includes(val))
        }
      })
    }
    return result
  }, [categoryProducts, searchProduct, advancedFilters, activeTab])

  // Product counts map for quick lookup
  const productCountMap = useMemo(() => {
    const map = {}
    products.forEach((p) => {
      if (p.category_id) {
        map[p.category_id] = (map[p.category_id] || 0) + 1
      }
    })
    return map
  }, [products])

  // Venue / Outlet Information
  const outletInfo = useMemo(() => {
    if (!category?.outlet_id) {
      return {
        id: 'global',
        name: 'All Venues (Global / Shared)',
        type: 'global',
        code: 'ALL',
      }
    }
    const found = outlets.find((o) => String(o.id) === String(category.outlet_id))
    return (
      found || {
        id: String(category.outlet_id),
        name: `Venue #${category.outlet_id}`,
        type: 'dine_in',
        code: 'VENUE',
      }
    )
  }, [category?.outlet_id, outlets])

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
    } else {
      navigate('/groups/categories')
    }
  }

  // Toggle Category Status (Active / Inactive)
  const handleToggleStatus = async (itemToToggle) => {
    const nextStatus = itemToToggle.is_active === false
    try {
      await adminApi.updateCategory(itemToToggle.id, {
        ...itemToToggle,
        is_active: nextStatus,
      })

      // Update local state
      if (String(itemToToggle.id) === String(category?.id)) {
        setCategory((prev) => ({ ...prev, is_active: nextStatus }))
      }
      setCategories((prev) =>
        prev.map((c) => (String(c.id) === String(itemToToggle.id) ? { ...c, is_active: nextStatus } : c))
      )

      toast.success(`${itemToToggle.name} is now ${nextStatus ? 'Active' : 'Inactive'}`)
      if (propOnRefresh) propOnRefresh()
    } catch (err) {
      toast.error('Failed to update category status')
    }
  }

  // Open Sub-category Create/Edit Modal
  const handleOpenSubModal = (subToEdit = null) => {
    if (subToEdit) {
      setEditingSub(subToEdit)
      setSubForm({
        name: subToEdit.name || '',
        description: subToEdit.description || '',
        sort_order: subToEdit.sort_order ?? subCategories.length,
        is_active: subToEdit.is_active !== false,
        image_url: subToEdit.image_url || '',
      })
    } else {
      setEditingSub(null)
      setSubForm({
        name: '',
        description: '',
        sort_order: subCategories.length,
        is_active: true,
        image_url: '',
      })
    }
    setSubModalOpen(true)
  }

  // Save Sub-Category
  const handleSaveSubCategory = async (e) => {
    e.preventDefault()
    if (!subForm.name.trim()) {
      toast.error('Please enter sub-category name')
      return
    }

    try {
      const payload = {
        name: subForm.name.trim(),
        description: subForm.description.trim(),
        sort_order: Number(subForm.sort_order) || 0,
        is_active: subForm.is_active,
        image_url: subForm.image_url,
        parent_id: category.id,
        outlet_id: category.outlet_id || null,
      }

      if (editingSub) {
        await adminApi.updateCategory(editingSub.id, payload)
        toast.success(`Sub-category "${subForm.name}" updated successfully!`)
      } else {
        await adminApi.createCategory(payload)
        toast.success(`Sub-category "${subForm.name}" created successfully!`)
      }

      setSubModalOpen(false)
      loadAllData()
      if (propOnRefresh) propOnRefresh()
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to save sub-category')
    }
  }

  // Handle Image Upload for Sub-category
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('image', file)

    try {
      setIsUploadingImage(true)
      const res = await adminApi.uploadImage(formData, 'categories')
      const uploadedUrl = res.data?.url || res.data?.data?.url
      if (uploadedUrl) {
        setSubForm((prev) => ({ ...prev, image_url: uploadedUrl }))
        toast.success('Image uploaded successfully')
      }
    } catch (err) {
      toast.error('Failed to upload image')
    } finally {
      setIsUploadingImage(false)
    }
  }

  // Trigger Delete Confirmation
  const confirmDelete = (item, type = 'subcategory') => {
    setDeleteModal({
      isOpen: true,
      item,
      type,
    })
  }

  // Execute Delete
  const handleExecuteDelete = async () => {
    const { item, type } = deleteModal
    if (!item) return

    try {
      await adminApi.deleteCategory(item.id)
      toast.success(`${type === 'main' ? 'Category' : 'Sub-category'} deleted successfully`)
      setDeleteModal({ isOpen: false, item: null, type: 'subcategory' })

      if (type === 'main') {
        handleBack()
      } else {
        loadAllData()
      }
      if (propOnRefresh) propOnRefresh()
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to delete category')
    }
  }

  const isEmbedded = Boolean(propOnBack || propCategory)

  if (loading) {
    const loadingView = (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-3">
        <div
          className="w-10 h-10 border-4 rounded-full animate-spin"
          style={{
            borderColor: 'rgba(191, 64, 64, 0.2)',
            borderTopColor: 'var(--color-500, #BF4040)',
          }}
        />
        <p className="text-xs font-semibold text-slate-500 tracking-wide">Loading category details...</p>
      </div>
    )
    return isEmbedded ? loadingView : <AdminLayout>{loadingView}</AdminLayout>
  }

  if (!category) {
    const notFoundView = (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
          <AlertTriangle size={28} />
        </div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
          Category Not Found
        </h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          The category you are looking for does not exist or may have been removed.
        </p>
        <Button
          variant="primary"
          size="md"
          iconLeading={ArrowLeft}
          onClick={handleBack}
        >
          Return to Categories
        </Button>
      </div>
    )
    return isEmbedded ? notFoundView : <AdminLayout>{notFoundView}</AdminLayout>
  }

  if (selectedSubCategory) {
    const subContent = (
      <SubCategoriesDetails
        subCategory={selectedSubCategory}
        parentCategory={category}
        categories={categories}
        outlets={outlets}
        onBack={() => {
          setSelectedSubCategory(null)
          loadAllData()
        }}
        onEdit={(sub) => {
          handleOpenSubModal(sub)
        }}
        onRefresh={loadAllData}
      />
    )
    return isEmbedded ? subContent : <AdminLayout>{subContent}</AdminLayout>
  }

  const emoji = getCategoryEmoji(category.name)
  const isMainCategory = !category.parent_id
  const totalDirectProducts = productCountMap[category.id] || 0
  const activeProductsCount = categoryProducts.filter((p) => p.is_active !== false).length

  const mainContent = (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ══════════ TOP BREADCRUMB & BACK NAVIGATION ══════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Button
            variant="secondary"
            size="xs"
            iconLeading={ArrowLeft}
            onClick={handleBack}
            className="shadow-2xs"
          />
          <ChevronRight size={13} className="text-slate-400" />
          <span className="inline-flex items-center gap-1.5 font-bold text-xs" style={{ color: 'var(--color-text)' }}>
            <span className="truncate max-w-[180px] sm:max-w-md">{category.name}</span>
          </span>
        </div>

        {propOnEdit && (
          <Button
            variant="secondary"
            size="xs"
            iconLeading={Edit01}
            onClick={() => propOnEdit(category)}
          >
            Edit Category
          </Button>
        )}
      </div>

        {/* ══════════ MAIN CATEGORY OVERVIEW CARD ══════════ */}
        <div
          className="p-5 sm:p-6 rounded-xl border shadow-xs hover:shadow-md transition-all duration-200 border-b-[3px] border-b-[#126973]"
          style={{
            background: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          {/* Identity Row */}
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
                {category.image_url ? (
                  <img
                    src={category.image_url}
                    alt={category.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                ) : (
                  <span>{emoji}</span>
                )}
              </div>

              {/* Details Text */}
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight" style={{ color: 'var(--color-text)' }}>
                    {category.name}
                  </h1>

                  <button
                    type="button"
                    onClick={() => handleToggleStatus(category)}
                    className="cursor-pointer transition-transform active:scale-95"
                    title="Click to toggle status"
                  >
                    <BadgeWithIcon
                      color={category.is_active !== false ? 'success' : 'gray'}
                      icon={category.is_active !== false ? Check : X}
                      size="sm"
                    >
                      {category.is_active !== false ? 'Active' : 'Inactive'}
                    </BadgeWithIcon>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-muted)]">
                  <span className="font-medium">{outletInfo.name}</span>
                  <span>·</span>
                  <span>Sort Order: #{category.sort_order ?? 0}</span>
                </div>

                {category.description ? (
                  <p className="text-xs text-[var(--color-muted)] leading-relaxed max-w-3xl pt-0.5">
                    {category.description}
                  </p>
                ) : (
                  <p className="text-xs text-[var(--color-muted)]/70 italic pt-0.5">No description provided for this category.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Metrics Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Sub-Categories */}
          <div
            className="p-4 rounded-xl border flex items-center justify-between shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group border-b-[3px] border-b-amber-500"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-muted)]">Sub-Categories</p>
              <p className="text-2xl font-extrabold text-[var(--color-text)] mt-1 tracking-tight">
                {subCategories.length}
              </p>
              <p className="text-[10.5px] text-[var(--color-muted)] mt-0.5">Child groups</p>
            </div>
            <div className="w-13 h-13 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-110 transition-transform duration-200 text-amber-500">
              <FolderTree size={28} />
            </div>
          </div>

          {/* Card 2: Direct Products */}
          <div
            className="p-4 rounded-xl border flex items-center justify-between shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group border-b-[3px] border-b-[#126973]"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-muted)]">Direct Products</p>
              <p className="text-2xl font-extrabold text-[var(--color-text)] mt-1 tracking-tight">
                {totalDirectProducts}
              </p>
              <p className="text-[10.5px] text-[var(--color-muted)] mt-0.5">Directly assigned</p>
            </div>
            <div className="w-13 h-13 rounded-2xl bg-[#126973]/10 dark:bg-[#126973]/20 border border-[#126973]/20 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-110 transition-transform duration-200 text-[#126973] dark:text-[#F1D8C2]">
              <Package size={28} />
            </div>
          </div>

          {/* Card 3: Active Products */}
          <div
            className="p-4 rounded-xl border flex items-center justify-between shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group border-b-[3px] border-b-emerald-500"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-muted)]">Active Products</p>
              <p className="text-2xl font-extrabold text-[var(--color-text)] mt-1 tracking-tight">
                {activeProductsCount}
              </p>
              <p className="text-[10.5px] text-[var(--color-muted)] mt-0.5">In entire group</p>
            </div>
            <div className="w-13 h-13 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-110 transition-transform duration-200 text-emerald-500">
              <CheckCircle2 size={28} />
            </div>
          </div>

          {/* Card 4: Venue Scope */}
          <div
            className="p-4 rounded-xl border flex items-center justify-between shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group border-b-[3px] border-b-purple-500"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <div className="min-w-0 pr-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-muted)]">Venue Scope</p>
              <p className="text-base font-extrabold text-[var(--color-text)] mt-1 tracking-tight truncate max-w-[130px]" title={outletInfo.name}>
                {outletInfo.name}
              </p>
              <p className="text-[10.5px] text-[var(--color-muted)] mt-0.5">Assigned outlet</p>
            </div>
            <div className="w-13 h-13 rounded-2xl bg-purple-500/10 dark:bg-purple-500/20 border border-purple-500/20 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-110 transition-transform duration-200 text-purple-500">
              <Building2 size={28} />
            </div>
          </div>
        </div>

        {/* ── Sub-Categories & Products Segmented Tabs (Above TableCard like Products.jsx) ── */}
        <div className="flex items-center justify-between gap-4 overflow-x-auto pb-1">
          <div
            className="inline-flex items-center gap-1.5 p-1 rounded-2xl border"
            style={{
              background: 'var(--color-card, #ffffff)',
              borderColor: 'var(--color-border, #e2e8f0)',
            }}
          >
            {[
              { id: 'subcategories', label: 'Sub-Categories', icon: FolderTree, count: subCategories.length },
              { id: 'products', label: 'Products / Dishes', icon: Package, count: categoryProducts.length },
            ].map((tab) => {
              const isSelected = activeTab === tab.id
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id)
                    setAdvancedFilters([])
                  }}
                  className={`inline-flex items-center gap-2.5 h-10 px-4 rounded-xl text-sm transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    isSelected
                      ? 'shadow-xs font-semibold'
                      : 'hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                  style={
                    isSelected
                      ? {
                          background: 'var(--color-surface, #f8fafc)',
                          color: 'var(--color-text, #0f172a)',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                          border: '1px solid var(--color-border, #e2e8f0)',
                        }
                      : {
                          color: 'var(--color-muted, #94a3b8)',
                        }
                  }
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                  <span
                    className="inline-flex items-center justify-center rounded-lg px-2 h-5 text-[11px] font-semibold"
                    style={{
                      background: isSelected
                        ? 'rgba(18, 105, 115, 0.18)'
                        : 'rgba(0, 0, 0, 0.05)',
                      color: isSelected ? 'var(--color-500, #126973)' : 'var(--color-muted, #94a3b8)',
                    }}
                  >
                    {tab.count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ══════════ TABLE CARD: SUB-CATEGORIES & PRODUCTS ══════════ */}
        <TableCard.Root>
          {/* Unified FilterBar from TablesComponents - Matching Pic 2 */}
          <TableCard.FilterBar
            hasCreate
            onCreate={() => {
              if (activeTab === 'subcategories') {
                handleOpenSubModal()
              } else {
                navigate('/products')
              }
            }}
            createLabel="Create"
            actions={
              activeTab === 'subcategories' ? (
                <ViewToggle
                  view={viewMode === 'grid' ? 'grid' : 'list'}
                  onChange={(v) => setViewMode(v === 'grid' ? 'grid' : 'table')}
                />
              ) : null
            }
          >
            <div className="flex items-center gap-2.5 flex-1 max-w-xl">
              <FilterSearchInput
                value={activeTab === 'subcategories' ? searchSub : searchProduct}
                onChange={(val) => {
                  if (activeTab === 'subcategories') {
                    setSearchSub(val)
                  } else {
                    setSearchProduct(val)
                  }
                }}
                placeholder={
                  activeTab === 'subcategories'
                    ? 'Search sub-categories by title, category, or barcode...'
                    : 'Search products by title, category, or barcode...'
                }
                shortcut="⌘K"
                className="w-full"
              />

              <FiltersPopover
                fields={
                  activeTab === 'subcategories'
                    ? [
                        { value: 'name', label: 'Sub-Category Name' },
                        {
                          value: 'status',
                          label: 'Status',
                          options: [
                            { value: 'active', label: 'Active' },
                            { value: 'inactive', label: 'Inactive' },
                          ],
                        },
                      ]
                    : [
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
                      ]
                }
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

          {/* Tab 1: Sub-Categories Content */}
          {activeTab === 'subcategories' && (
            <div>
              {filteredSubCategories.length === 0 ? (
                <div className="py-14 px-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
                    <FolderTree size={24} />
                  </div>
                  <h3 className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>
                    {searchSub ? 'No matching sub-categories' : 'No Sub-Categories Found'}
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                    {searchSub
                      ? `No sub-categories match your search query "${searchSub}".`
                      : `Create child categories under "${category.name}" to organize specific dishes, drinks, or items.`}
                  </p>
                  <CreateButton
                    label="Create First Sub-Category"
                    onClick={() => handleOpenSubModal()}
                  />
                </div>
              ) : viewMode === 'grid' ? (
                /* Grid View */
                <div className="p-4 sm:p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredSubCategories.map((sub) => {
                      const subProductCount = productCountMap[sub.id] || 0
                      const subEmoji = getCategoryEmoji(sub.name)

                      return (
                        <div
                          key={sub.id}
                          className="group rounded-xl border border-l-[4px] border-l-amber-500 dark:border-l-amber-400 bg-amber-500/[0.02] dark:bg-amber-500/[0.03] shadow-xs hover:shadow-md hover:border-amber-500/60 transition-all duration-200 overflow-hidden flex flex-col justify-between"
                          style={{
                            background: 'var(--color-card)',
                            borderColor: 'var(--color-border)',
                            borderLeftColor: '#f59e0b',
                          }}
                        >
                          <div className="p-3.5 space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                {/* Icon / Image */}
                                <div
                                  onClick={() => setSelectedSubCategory(sub)}
                                  className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-amber-500/30 bg-amber-500/10 flex items-center justify-center text-lg transition-transform duration-200 group-hover:scale-105 shadow-2xs cursor-pointer"
                                  title={`View ${sub.name} details`}
                                >
                                  {sub.image_url ? (
                                    <img
                                      src={sub.image_url}
                                      alt={sub.name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.style.display = 'none'
                                      }}
                                    />
                                  ) : (
                                    <span>{subEmoji}</span>
                                  )}
                                </div>

                                <div
                                  className="min-w-0 flex-1 cursor-pointer"
                                  onClick={() => setSelectedSubCategory(sub)}
                                >
                                  <h3
                                    className="text-xs font-bold truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors hover:underline cursor-pointer"
                                    style={{ color: 'var(--color-text)' }}
                                    title={`View ${sub.name} details`}
                                  >
                                    {sub.name}
                                  </h3>
                                  <div className="flex items-center gap-1.5 text-[10.5px] text-slate-400 mt-0.5">
                                    <span>#{sub.sort_order ?? 0}</span>
                                    <span>·</span>
                                    <span>{subProductCount} {subProductCount === 1 ? 'Product' : 'Products'}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Status Badge */}
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(sub)}
                                className="cursor-pointer shrink-0 transition-opacity hover:opacity-80"
                                title="Toggle status"
                              >
                                <BadgeWithIcon
                                  color={sub.is_active !== false ? 'success' : 'gray'}
                                  icon={sub.is_active !== false ? Check : X}
                                  size="sm"
                                >
                                  {sub.is_active !== false ? 'Active' : 'Inactive'}
                                </BadgeWithIcon>
                              </button>
                            </div>

                
                             

                            {/* Description */}
                            {sub.description && (
                              <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-2 leading-relaxed">
                                {sub.description}
                              </p>
                            )}
                          </div>

                          {/* Card Footer */}
                          <div
                            className="px-3.5 py-2.5 border-t flex items-center justify-between gap-2"
                            style={{
                              background: 'rgba(255, 255, 255, 0.015)',
                              borderColor: 'var(--color-border)',
                            }}
                          >


                            <TableActionButtons
                              variant="icon"
                              size="sm"
                              onView={() => setSelectedSubCategory(sub)}
                              onEdit={() => handleOpenSubModal(sub)}
                              onDelete={() => confirmDelete(sub, 'subcategory')}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                /* Table View */
                <Table aria-label="Sub-Categories">
                  <Table.Header>
                    <Table.Head id="name" label="Sub-Category" />
                    <Table.Head id="sort_order" label="Sort Order" className="text-center" />
                    <Table.Head id="products" label="Products" className="text-center" />
                    <Table.Head id="status" label="Status" className="text-center" />
                    <Table.Head id="actions" label="Actions" className="text-right" />
                  </Table.Header>
                  <Table.Body items={filteredSubCategories}>
                    {(sub) => {
                      const subProductCount = productCountMap[sub.id] || 0
                      const subEmoji = getCategoryEmoji(sub.name)

                      return (
                        <Table.Row key={sub.id}>
                          <Table.Cell>
                            <div className="flex items-center gap-3">
                              <div
                                onClick={() => setSelectedSubCategory(sub)}
                                className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-amber-500/25 bg-amber-500/10 flex items-center justify-center text-lg shadow-2xs cursor-pointer hover:scale-105 transition-transform"
                                title={`View ${sub.name} details`}
                              >
                                {sub.image_url ? (
                                  <img
                                    src={sub.image_url}
                                    alt={sub.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.style.display = 'none'
                                    }}
                                  />
                                ) : (
                                  <span>{subEmoji}</span>
                                )}
                              </div>
                              <div
                                className="min-w-0 cursor-pointer"
                                onClick={() => setSelectedSubCategory(sub)}
                              >
                                <div className="flex items-center gap-2">
                                  <p
                                    className="font-bold text-xs group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors hover:underline cursor-pointer"
                                    style={{ color: 'var(--color-text)' }}
                                    title={`View ${sub.name} details`}
                                  >
                                    {sub.name}
                                  </p>
                                  <span className="inline-flex items-center gap-1 text-[9.5px] font-medium text-amber-700 dark:text-amber-300 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                                    <CornerDownRight size={9} />
                                    <span>Sub</span>
                                  </span>
                                </div>
                                {sub.description ? (
                                  <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-sm mt-0.5">
                                    {sub.description}
                                  </p>
                                ) : (
                                  <p className="text-[10.5px] text-slate-400/70 italic mt-0.5">Under {category.name}</p>
                                )}
                              </div>
                            </div>
                          </Table.Cell>
                          <Table.Cell className="text-center font-semibold text-slate-600 dark:text-slate-300">
                            #{sub.sort_order ?? 0}
                          </Table.Cell>
                          <Table.Cell className="text-center">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-black/5 dark:bg-white/5 text-slate-700 dark:text-slate-200">
                              <Package size={13} className="text-slate-400" />
                              <span>{subProductCount} {subProductCount === 1 ? 'Dish' : 'Dishes'}</span>
                            </span>
                          </Table.Cell>
                          <Table.Cell className="text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(sub)}
                              className="cursor-pointer transition-transform active:scale-95"
                              title="Click to toggle status"
                            >
                              <BadgeWithIcon
                                color={sub.is_active !== false ? 'success' : 'gray'}
                                icon={sub.is_active !== false ? Check : X}
                                size="sm"
                              >
                                {sub.is_active !== false ? 'Active' : 'Inactive'}
                              </BadgeWithIcon>
                            </button>
                          </Table.Cell>
                          <Table.Cell className="text-right">
                            <TableActionButtons
                              variant="icon"
                              size="sm"
                              onView={() => setSelectedSubCategory(sub)}
                              onEdit={() => handleOpenSubModal(sub)}
                              onDelete={() => confirmDelete(sub, 'subcategory')}
                            />
                          </Table.Cell>
                        </Table.Row>
                      )
                    }}
                  </Table.Body>
                </Table>
              )}
            </div>
          )}

          {/* Tab 2: Products Tab Content */}
          {activeTab === 'products' && (
            <div>
              {filteredProducts.length === 0 ? (
                <div className="py-14 px-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center mx-auto">
                    <Package size={24} />
                  </div>
                  <h3 className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>
                    {searchProduct ? 'No matching products found' : 'No Products in this Category'}
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                    {searchProduct
                      ? `No dishes match "${searchProduct}".`
                      : `No products have been assigned to "${category.name}" or its sub-categories yet.`}
                  </p>
                  <Link to="/products">
                    <CreateButton label="Go to Products Management" />
                  </Link>
                </div>
              ) : (
                <Table aria-label="Category Products">
                  <Table.Header>
                    <Table.Head id="product" label="Product / Dish" />
                    <Table.Head id="sku" label="SKU / Code" />
                    <Table.Head id="level" label="Category Level" />
                    <Table.Head id="price" label="Price" />
                    <Table.Head id="status" label="Status" />
                  </Table.Header>
                  <Table.Body items={filteredProducts}>
                    {(p) => {
                      const isDirect = String(p.category_id) === String(category.id)
                      const subCat = subCategories.find((s) => String(s.id) === String(p.category_id))

                      return (
                        <Table.Row key={p.id}>
                          <Table.Cell>
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 border bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-bold">
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
                              <div>
                                <p className="font-bold text-slate-800 dark:text-slate-100">{p.name}</p>
                                {p.description && (
                                  <p className="text-[11px] text-slate-400 truncate max-w-xs">{p.description}</p>
                                )}
                              </div>
                            </div>
                          </Table.Cell>
                          <Table.Cell className="font-mono text-slate-500">
                            {p.sku || `N/A`}
                          </Table.Cell>
                          <Table.Cell>
                            {isDirect ? (
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border"
                                style={{
                                  background: 'rgba(191, 64, 64, 0.08)',
                                  color: 'var(--color-500, #BF4040)',
                                  borderColor: 'rgba(191, 64, 64, 0.2)',
                                }}
                              >
                                <Folder size={11} />
                                <span>Main: {category.name}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                                <CornerDownRight size={11} />
                                <span>Sub: {subCat?.name || `#${p.category_id}`}</span>
                              </span>
                            )}
                          </Table.Cell>
                          <Table.Cell className="font-bold text-slate-800 dark:text-slate-100">
                            ${Number(p.price || 0).toFixed(2)}
                          </Table.Cell>
                          <Table.Cell>
                            <BadgeWithIcon
                              color={p.is_active !== false ? 'success' : 'gray'}
                              icon={p.is_active !== false ? Check : X}
                              size="sm"
                            >
                              {p.is_active !== false ? 'Active' : 'Inactive'}
                            </BadgeWithIcon>
                          </Table.Cell>
                        </Table.Row>
                      )
                    }}
                  </Table.Body>
                </Table>
              )}
            </div>
          )}
        </TableCard.Root>

        {/* ══════════ QUICK ADD / EDIT SUB-CATEGORY MODAL ══════════ */}
        <CategoriesCreateView
          isOpen={subModalOpen}
          item={editingSub || { parent_id: category?.id, outlet_id: category?.outlet_id }}
          categories={categories}
          onClose={() => setSubModalOpen(false)}
          onSave={async (payload) => {
            try {
              if (editingSub) {
                await adminApi.updateCategory(editingSub.id, payload)
                toast.success(`Sub-category "${payload.name}" updated successfully!`)
              } else {
                await adminApi.createCategory(payload)
                toast.success(`Sub-category "${payload.name}" created successfully!`)
              }
              setSubModalOpen(false)
              loadAllData()
              if (propOnRefresh) propOnRefresh()
            } catch (err) {
              toast.error(err?.response?.data?.error || 'Failed to save sub-category')
            }
          }}
          onQuickCreateSubCategory={loadAllData}
        />

        {/* ══════════ DELETE CONFIRMATION MODAL ══════════ */}
        <ConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, item: null, type: 'subcategory' })}
          onConfirm={handleExecuteDelete}
          title={deleteModal.type === 'main' ? 'Delete Category' : 'Delete Sub-Category'}
          description={`Are you sure you want to delete "${deleteModal.item?.name}"?${
            deleteModal.type === 'main'
              ? ' This will affect all associated sub-categories and dishes.'
              : ' This action cannot be undone.'
          }`}
          confirmText="Delete"
          cancelText="Cancel"
          icon={AlertTriangle}
          variant="destructive"
        />
      </div>
    )

  return isEmbedded ? mainContent : <AdminLayout>{mainContent}</AdminLayout>
}
