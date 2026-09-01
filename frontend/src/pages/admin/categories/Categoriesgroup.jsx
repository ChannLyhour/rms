import { useState, useEffect, useMemo } from 'react'
import AdminLayout from '../../../components/layout/AdminLayout'
import CategoriesCreateView from '../../../components/admin/CategoriesCreateView'
import { adminApi } from '../../../api/adminApi'
import axiosClient from '../../../api/axiosClient'
import { TableCard, BadgeWithIcon, Button } from '../../../components/TablesComponents'
import { CreateButton } from '../../../components/common/ButtonComponent'
import { Check, X, SearchLg, Plus, Edit01, Trash01 } from '@untitledui/icons'
import {
  Folder,
  CornerDownRight,
  EyeOff,
  Building2,
  Coffee,
  Wine,
  ShoppingCart,
  Utensils,
  FolderTree,
  Layers,
  ChevronDown,
  ChevronUp,
  Package,
  Sparkles
} from 'lucide-react'
import toast from 'react-hot-toast'

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

export default function Categoriesgroup() {
  const [categories, setCategories] = useState([])
  const [outlets, setOutlets] = useState([])
  const [products, setProducts] = useState([])
  const [outletFilter, setOutletFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all') // 'all' | 'main' | 'sub'
  const [search, setSearch] = useState('')
  const [activeView, setActiveView] = useState('list') // 'list' | 'create' | 'edit'
  const [selectedCategory, setSelectedCategory] = useState(null)
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

  const loadData = () => {
    adminApi.getCategories().then(({ data }) => setCategories(data.data || [])).catch(() => {})
    axiosClient.get('/outlets').then(({ data }) => setOutlets(data.data || [])).catch(() => {})
    adminApi.getProducts({ limit: 100 }).then(({ data }) => setProducts(data.data || [])).catch(() => {})
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

  // Sub-categories map (parentId -> array of sub categories)
  const subCategoryMap = useMemo(() => {
    const map = {}
    categories.forEach((c) => {
      if (c.parent_id) {
        if (!map[c.parent_id]) map[c.parent_id] = []
        map[c.parent_id].push(c)
      }
    })
    return map
  }, [categories])

  // Count products per category
  const productCountMap = useMemo(() => {
    const map = {}
    products.forEach((p) => {
      if (p.category_id) {
        map[p.category_id] = (map[p.category_id] || 0) + 1
      }
    })
    return map
  }, [products])

  // Outlet-scoped categories list
  const outletFilteredList = useMemo(() => {
    return categories.filter((c) => outletFilter === 'all' || String(c.outlet_id) === String(outletFilter))
  }, [categories, outletFilter])

  const mainCount = outletFilteredList.filter((c) => !c.parent_id).length
  const subCount = outletFilteredList.filter((c) => c.parent_id).length

  // Build Venue Grouped Data
  const venueGroups = useMemo(() => {
    const q = search.toLowerCase().trim()

    // 1. Map physical outlets
    const list = outlets.map((outlet) => {
      const venueCats = categories.filter((c) => String(c.outlet_id) === String(outlet.id))

      const filteredCats = venueCats.filter((c) => {
        const isSub = Boolean(c.parent_id)
        if (typeFilter === 'main' && isSub) return false
        if (typeFilter === 'sub' && !isSub) return false

        if (q) {
          const matchName = c.name?.toLowerCase().includes(q)
          const matchDesc = c.description?.toLowerCase().includes(q)
          const matchSub = (subCategoryMap[c.id] || []).some((sc) => sc.name?.toLowerCase().includes(q))
          return matchName || matchDesc || matchSub
        }
        return true
      })

      return {
        id: String(outlet.id),
        venue: outlet,
        isGlobal: false,
        categories: filteredCats,
        totalCategories: venueCats.length,
        mainCategories: venueCats.filter((c) => !c.parent_id).length,
        subCategories: venueCats.filter((c) => Boolean(c.parent_id)).length,
      }
    })

    // 2. Global / Unassigned categories
    const globalCats = categories.filter((c) => !c.outlet_id || c.outlet_id === 0)
    const filteredGlobalCats = globalCats.filter((c) => {
      const isSub = Boolean(c.parent_id)
      if (typeFilter === 'main' && isSub) return false
      if (typeFilter === 'sub' && !isSub) return false

      if (q) {
        const matchName = c.name?.toLowerCase().includes(q)
        const matchDesc = c.description?.toLowerCase().includes(q)
        const matchSub = (subCategoryMap[c.id] || []).some((sc) => sc.name?.toLowerCase().includes(q))
        return matchName || matchDesc || matchSub
      }
      return true
    })

    if (globalCats.length > 0 || outletFilter === 'global') {
      list.push({
        id: 'global',
        venue: {
          id: 'global',
          name: 'Global / Shared Categories',
          code: 'GLOBAL',
          type: 'global',
          description: 'Categories available across all venues'
        },
        isGlobal: true,
        categories: filteredGlobalCats,
        totalCategories: globalCats.length,
        mainCategories: globalCats.filter((c) => !c.parent_id).length,
        subCategories: globalCats.filter((c) => Boolean(c.parent_id)).length,
      })
    }

    // Filter by active outlet tab
    if (outletFilter === 'all') return list
    if (outletFilter === 'global') return list.filter((g) => g.isGlobal)
    return list.filter((g) => String(g.venue.id) === String(outletFilter))
  }, [outlets, categories, search, typeFilter, outletFilter, subCategoryMap])

  // Handlers
  const handleOpenCreate = (outletId = null, parentId = null) => {
    setSelectedCategory(
      outletId || parentId
        ? { outlet_id: outletId, parent_id: parentId }
        : null
    )
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

  const handleToggleStatus = async (cat) => {
    const updatedStatus = !cat.is_active
    try {
      await adminApi.updateCategory(cat.id, {
        ...cat,
        is_active: updatedStatus
      })
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, is_active: updatedStatus } : c))
      )
      toast.success(`Category is now ${updatedStatus ? 'Active' : 'Inactive'}`)
    } catch (err) {
      toast.error('Failed to update status')
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
        {/* If creating or editing, show full CategoriesCreateView */}
        {activeView !== 'list' ? (
          <CategoriesCreateView
            item={selectedCategory}
            categories={categories}
            onClose={handleCloseView}
            onSave={handleSaveCategory}
            onQuickCreateSubCategory={loadData}
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
                  Categories Groups
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Manage & organize menu categories grouped by physical venues & outlets
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <CreateButton
                  label="Add New Category"
                  onClick={() => handleOpenCreate(outletFilter !== 'all' && outletFilter !== 'global' ? outletFilter : null)}
                />
              </div>
            </div>

            {/* Multi-Venue Tabs */}
            <div className="relative">
              {/* Fade effect on mobile */}
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[var(--color-bg)] to-transparent pointer-events-none z-10 sm:hidden" />

              {/* <div
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
              </div> */}
            </div>

            {/* Type Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* <div className="relative overflow-x-auto no-scrollbar">
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
              </div> */}

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
                  onChange={(e) => setSearch(e.target.value)}
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
                  <FolderTree size={24} />
                </div>
                <h3 className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>
                  No categories found
                </h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  {search ? `No results match "${search}"` : 'Get started by creating a category'}
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
                              {group.totalCategories} Categories · {group.mainCategories} Main · {group.subCategories} Sub
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
                            <span>Add Category</span>
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

                      {/* Venue Categories Grid */}
                      {!isCollapsed && (
                        <div className="p-4 sm:p-5">
                          {group.categories.length === 0 ? (
                            <div
                              className="py-8 px-4 rounded-lg border border-dashed text-center space-y-2"
                              style={{
                                borderColor: 'var(--color-border)',
                                background: 'rgba(255, 255, 255, 0.01)'
                              }}
                            >
                              <p className="text-xs text-slate-400">
                                No categories found in {group.venue.name}
                              </p>
                              <button
                                type="button"
                                onClick={() => handleOpenCreate(venueOutletId)}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-[#126973] dark:text-[#F1D8C2] hover:underline cursor-pointer"
                              >
                                <Plus size={12} />
                                <span>Create Category</span>
                              </button>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                              {group.categories.map((cat) => {
                                const isSub = Boolean(cat.parent_id)
                                const parentName = cat.parent_id ? categoryMap[cat.parent_id] : null
                                const subList = subCategoryMap[cat.id] || []
                                const productCount = productCountMap[cat.id] || 0
                                const emoji = getCategoryEmoji(cat.name)

                                return (
                                  <div
                                    key={cat.id}
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
                                          {/* Image / Emoji */}
                                          <div
                                            className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border flex items-center justify-center text-lg"
                                            style={{
                                              background: 'var(--color-bg)',
                                              borderColor: 'var(--color-border)'
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
                                            ) : (
                                              <span>{emoji}</span>
                                            )}
                                          </div>

                                          <div className="min-w-0">
                                            <h3
                                              className="text-xs font-bold truncate group-hover:text-[#126973] dark:group-hover:text-[#F1D8C2] transition-colors"
                                              style={{ color: 'var(--color-text)' }}
                                            >
                                              {cat.name}
                                            </h3>
                                            <div className="flex items-center gap-1.5 text-[10.5px] text-slate-400 mt-0.5">
                                              <span>#{cat.sort_order ?? 0}</span>
                                              <span>·</span>
                                              <span>{productCount} {productCount === 1 ? 'Dish' : 'Dishes'}</span>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Status Badge */}
                                        <button
                                          type="button"
                                          onClick={() => handleToggleStatus(cat)}
                                          className="cursor-pointer"
                                          title="Toggle status"
                                        >
                                          <BadgeWithIcon
                                            color={cat.is_active !== false ? 'success' : 'gray'}
                                            icon={cat.is_active !== false ? Check : X}
                                            size="sm"
                                          >
                                            {cat.is_active !== false ? 'Active' : 'Inactive'}
                                          </BadgeWithIcon>
                                        </button>
                                      </div>

                                      {/* Sub-category info or parent name */}
                                      {isSub ? (
                                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                          <CornerDownRight size={11} />
                                          <span className="truncate">Under: {parentName || `Parent #${cat.parent_id}`}</span>
                                        </div>
                                      ) : subList.length > 0 ? (
                                        <div className="flex flex-wrap items-center gap-1">
                                          <span className="text-[10px] text-slate-400 font-medium">
                                            {subList.length} Sub-categories:
                                          </span>
                                          {subList.slice(0, 2).map((s) => (
                                            <span
                                              key={s.id}
                                              className="px-1.5 py-0.2 rounded text-[9.5px] bg-black/5 dark:bg-white/5 text-slate-500 truncate max-w-[80px]"
                                            >
                                              {s.name}
                                            </span>
                                          ))}
                                          {subList.length > 2 && (
                                            <span className="text-[9.5px] text-slate-400">
                                              +{subList.length - 2}
                                            </span>
                                          )}
                                        </div>
                                      ) : null}

                                      {/* Description */}
                                      {cat.description && (
                                        <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-2">
                                          {cat.description}
                                        </p>
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
                                      {!isSub ? (
                                        <button
                                          type="button"
                                          onClick={() => handleOpenCreate(venueOutletId, cat.id)}
                                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-[#126973] dark:hover:text-[#F1D8C2] transition-colors cursor-pointer"
                                        >
                                          <Plus size={12} />
                                          <span>Add Sub</span>
                                        </button>
                                      ) : (
                                        <span className="text-[10px] text-slate-400">
                                          Sub-item
                                        </span>
                                      )}

                                      <div className="flex items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() => handleOpenEdit(cat)}
                                          className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                                          title="Edit"
                                        >
                                          <Edit01 size={14} />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDelete(cat.id)}
                                          className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                          title="Delete"
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
