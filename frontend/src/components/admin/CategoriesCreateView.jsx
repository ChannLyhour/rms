import { useState, useEffect, useRef, useMemo } from 'react'
import { Scrollspy } from '../reui/scrollspy'
import {
  X,
  Image as ImageIcon,
  Plus,
  Trash2,
  Check,
  Layers,
  Sparkles,
  ArrowLeft,
  Eye,
  EyeOff,
  FolderTree,
  UploadCloud,
  CornerDownRight,
  Folder,
  Building2
} from 'lucide-react'
import toast from 'react-hot-toast'
import axiosClient from '../../api/axiosClient'
import { adminApi } from '../../api/adminApi'
import { Button } from '../common/ButtonComponent'
import { CatalogCard } from '../plugin/components/cards-components'
import { SearchSelection } from '../plugin/components/Search-Selection-components'

function CreateSubCatModal({ isOpen, parentCategory, onClose, onSave }) {
  const [name, setName] = useState('')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div
        className="rounded-[5px] shadow-xl w-full max-w-sm overflow-hidden border animate-in zoom-in-95 duration-150"
        style={{
          background: 'var(--color-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div>
            <h3 className="font-extrabold text-base" style={{ color: 'var(--color-text)' }}>
              New Sub-Category
            </h3>
            {parentCategory && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                Under: <span className="font-semibold">{parentCategory.name}</span>
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!name.trim()) return
            onSave(name.trim())
            setName('')
          }}
          className="p-6 space-y-4"
        >
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
              Sub-Category Name *
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-[5px] border outline-none font-medium transition-colors"
              style={{
                background: 'var(--color-bg)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
              placeholder="e.g. Espresso, Burgers, Cold Appetizer"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-[5px] text-xs font-bold text-white shadow-sm transition-all hover:opacity-90 active:scale-95 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, var(--color-500, #BF4040), var(--color-600, #9D3434))',
            }}
          >
            Save Sub-Category
          </button>
        </form>
      </div>
    </div>
  )
}

export default function CategoriesCreateView({
  item,
  categories = [],
  onClose,
  onSave,
  onQuickCreateSubCategory,
}) {
  const [outlets, setOutlets] = useState([])
  const [formData, setFormData] = useState({
    outlet_id: '',
    parent_id: null,
    name: '',
    description: '',
    sort_order: 0,
    is_active: true,
    image_url: '',
  })

  const parentRef = useRef(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isSubModalOpen, setIsSubModalOpen] = useState(false)

  useEffect(() => {
    axiosClient.get('/outlets').then((res) => setOutlets(res.data?.data || [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (item) {
      setFormData({
        outlet_id: item.outlet_id ? String(item.outlet_id) : '',
        parent_id: item.parent_id ? Number(item.parent_id) : null,
        name: item.name || '',
        description: item.description || '',
        sort_order: item.sort_order ?? 0,
        is_active: item.is_active !== false,
        image_url: item.image_url || '',
      })
    } else {
      setFormData({
        outlet_id: '',
        parent_id: null,
        name: '',
        description: '',
        sort_order: 0,
        is_active: true,
        image_url: '',
      })
    }
  }, [item])

  const setField = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }))
  }

  // Outlet / Venue options with badges and flags for SearchSelection
  const outletOptions = useMemo(() => {
    const list = [
      {
        value: '',
        id: '',
        label: '🏢 All Venues (Global / Shared)',
        name: '🏢 All Venues (Global / Shared)',
        badge: 'ALL',
        description: 'Appears across all SKYPARK venues and menus',
      },
    ]
    outlets.forEach((o) => {
      list.push({
        value: String(o.id),
        id: String(o.id),
        label: o.name,
        name: o.name,
        badge: o.code,
        description:
          o.type === 'cafe'
            ? 'Cafe & Bakery'
            : o.type === 'bar'
            ? 'SkyBar & Lounge'
            : o.type === 'retail'
            ? 'Supermarket / Mart'
            : 'Grand Restaurant',
      })
    })
    return list
  }, [outlets])

  // Filter available parent categories (cannot select itself)
  const parentCategoryOptions = useMemo(() => {
    return categories
      .filter((c) => {
        if (item && c.id === item.id) return false
        return !c.parent_id
      })
      .map((c) => ({
        id: c.id,
        name: c.name,
        image: c.image_url,
      }))
  }, [categories, item])

  // Existing sub-categories belonging to this category
  const existingSubCategories = categories.filter(
    (c) => item && c.parent_id === item.id
  )

  const handleImageFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, WEBP)')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    // Immediate local preview
    const reader = new FileReader()
    reader.onload = () => {
      setField('image_url', reader.result)
    }
    reader.readAsDataURL(file)

    const form = new FormData()
    form.append('image', file)

    setIsUploadingImage(true)
    try {
      const { data } = await adminApi.uploadImage(form, 'categories')
      const uploadedUrl = data?.url || data?.path || data?.file_url || data?.image_url
      if (uploadedUrl) {
        setField('image_url', uploadedUrl)
        toast.success('Category image uploaded successfully')
      }
    } catch (err) {
      console.warn('Image upload fallback; preserved base64 preview:', err)
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleSubmit = (e) => {
    if (e) e.preventDefault()
    if (!formData.name.trim()) {
      toast.error('Category name is required')
      const el = document.getElementById('basic')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }

    const payload = {
      outlet_id: formData.outlet_id || null,
      parent_id: formData.parent_id || null,
      name: formData.name.trim(),
      description: formData.description.trim(),
      sort_order: parseInt(formData.sort_order) || 0,
      is_active: Boolean(formData.is_active),
      image_url: formData.image_url || '',
    }

    onSave(payload)
  }

  const handleQuickAddSubCategory = async (subCatName) => {
    if (!item?.id) {
      toast.error('Please save this parent category first before adding sub-categories')
      return
    }

    try {
      await adminApi.createCategory({
        outlet_id: item.outlet_id || null,
        parent_id: item.id,
        name: subCatName,
        description: '',
        sort_order: existingSubCategories.length + 1,
        is_active: true,
        image_url: '',
      })
      toast.success(`Sub-category "${subCatName}" created`)
      setIsSubModalOpen(false)
      onQuickCreateSubCategory?.()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create sub-category')
    }
  }

  const isEdit = Boolean(item && item.id)
  const isSubCategory = Boolean(formData.parent_id)
  const parentName = categories.find((c) => c.id === formData.parent_id)?.name

  const tabs = [
    { id: 'venue', label: 'Venue & Outlet' },
    { id: 'basic', label: 'Basic Info' },
    ...(isEdit && !item?.parent_id
      ? [{ id: 'subcategories', label: `Sub-Categories (${existingSubCategories.length})` }]
      : []),
    { id: 'preview', label: 'Preview & Display' },
  ]

  return (
    <div className="max-w-5xl mx-auto w-full pb-10 select-none animate-in fade-in duration-200">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="secondary"
          size="md"
          onClick={onClose}
          iconLeading={ArrowLeft}
        >
          Cancel &amp; Return
        </Button>

        <Button
          variant="primary"
          size="md"
          onClick={handleSubmit}
          iconLeading={Sparkles}
        >
          {isEdit ? 'Save Changes' : isSubCategory ? '+ Create Sub-Category' : '+ Create Category'}
        </Button>
      </div>

      {/* Main Form Container */}
      <div
        className="rounded-[5px] w-full shadow-sm border overflow-hidden flex flex-col"
        style={{
          background: 'var(--color-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        {/* Header */}
        <div
          className="px-8 py-6 border-b flex items-center justify-between shrink-0"
          style={{
            background: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div>
            <h3 className="font-extrabold text-xl sm:text-2xl" style={{ color: 'var(--color-text)' }}>
              {isEdit
                ? item.parent_id
                  ? 'Edit Sub-Category'
                  : 'Edit Category'
                : isSubCategory
                ? 'Add Sub-Category'
                : 'Add Category'}
            </h3>
            <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
              Configure category details, venue assignment, hierarchy, and visual display cards.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row">
          {/* Vertical Tab bar with Scrollspy */}
          <div
            className="w-full md:w-56 border-b md:border-b-0 md:border-r shrink-0 p-5"
            style={{
              borderColor: 'var(--color-border)',
              background: 'var(--color-surface)',
            }}
          >
            <Scrollspy
              offset={30}
              targetRef={parentRef}
              className="flex flex-row md:flex-col gap-2.5 overflow-x-auto scrollbar-none"
            >
              {tabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  data-scrollspy-anchor={t.id}
                  className="inline-flex items-center justify-start whitespace-nowrap rounded-[5px] text-xs sm:text-sm font-semibold transition-all focus-visible:outline-none border border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50 h-10 px-4 py-2 text-slate-700 dark:text-slate-300 data-[active=true]:bg-slate-900 data-[active=true]:text-white data-[active=true]:border-slate-900 dark:data-[active=true]:bg-slate-50 dark:data-[active=true]:text-slate-900 dark:data-[active=true]:border-slate-50 shadow-2xs cursor-pointer"
                >
                  {t.label}
                </button>
              ))}
            </Scrollspy>
          </div>

          {/* Form Body */}
          <div
            ref={parentRef}
            className="flex-1 overflow-y-auto max-h-[75vh] scroll-smooth p-5 relative scrollbar-none"
          >
            <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
              {/* ── TAB: Venue & Outlet ──────────────────────────── */}
              <div id="venue" className="space-y-2.5 scroll-mt-6">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Venue &amp; Outlet
                </h3>
                <div
                  className="rounded-[5px] p-6 sm:p-7 space-y-4"
                  style={{
                    background: 'var(--color-surface)',
                  }}
                >
                  <div>
                    <label
                      className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                      style={{ color: 'var(--color-muted)' }}
                    >
                      Assigned Venue / Location Scope
                    </label>
                    <SearchSelection
                      name="outlet_id"
                      options={outletOptions}
                      valueKey="id"
                      labelKey="name"
                      value={String(formData.outlet_id || '')}
                      autoSelect={false}
                      onChange={(val) => setField('outlet_id', String(val))}
                      placeholder="Select Venue Assignment..."
                      searchPlaceholder="Search venue (Cafe, SkyBar, Mart, Restaurant)..."
                    />
                    <p className="text-[11px] mt-1.5" style={{ color: 'var(--color-muted)' }}>
                      Assigning a venue limits this category and its menu items to POS terminals and QR menus for that specific venue.
                    </p>
                  </div>
                </div>
              </div>

              {/* ── TAB 1: Basic Info ──────────────────────────── */}
              <div id="basic" className="space-y-2.5 scroll-mt-6">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Basic Info
                </h3>
                <div
                  className="rounded-[5px] p-6 sm:p-7 space-y-6"
                  style={{
                    background: 'var(--color-surface)',
                  }}
                >
                  {/* Category Name */}
                  <div>
                    <label
                      className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                      style={{ color: 'var(--color-muted)' }}
                    >
                      Category Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setField('name', e.target.value)}
                      placeholder="e.g. Hot Drinks, Cold Beverages, Pizza & Pasta"
                      className="w-full px-4 py-2.5 text-xs rounded-[5px] border outline-none font-bold transition-all"
                      style={{
                        background: 'var(--color-bg)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text)',
                      }}
                    />
                  </div>

                  {/* Parent Category Selector */}
                  <div>
                    <label
                      className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                      style={{ color: 'var(--color-muted)' }}
                    >
                      Parent Category (Optional)
                    </label>
                    <select
                      value={formData.parent_id || ''}
                      onChange={(e) =>
                        setField('parent_id', e.target.value ? Number(e.target.value) : null)
                      }
                      className="w-full px-3.5 py-2.5 text-xs rounded-[5px] border outline-none font-medium transition-colors"
                      style={{
                        background: 'var(--color-bg)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text)',
                      }}
                    >
                      <option value="">None (Top-Level Main Category)</option>
                      {parentCategoryOptions.map((pc) => (
                        <option key={pc.id} value={pc.id}>
                          📁 {pc.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label
                      className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                      style={{ color: 'var(--color-muted)' }}
                    >
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setField('description', e.target.value)}
                      placeholder="Brief description of this menu category..."
                      className="w-full px-4 py-2.5 text-xs rounded-[5px] border outline-none resize-none transition-all"
                      style={{
                        background: 'var(--color-bg)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text)',
                      }}
                    />
                  </div>

                  {/* Image Upload Area */}
                  <div>
                    <label
                      className="block text-xs font-bold uppercase tracking-wider mb-2"
                      style={{ color: 'var(--color-muted)' }}
                    >
                      Cover Image
                    </label>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {/* Thumbnail Preview */}
                      <div
                        className="w-24 h-24 rounded-[6px] border-2 border-dashed flex items-center justify-center relative overflow-hidden shrink-0 group transition-all"
                        style={{
                          background: 'var(--color-bg)',
                          borderColor: 'var(--color-border)',
                        }}
                      >
                        {formData.image_url ? (
                          <>
                            <img
                              src={formData.image_url}
                              alt="preview"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none'
                              }}
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => setField('image_url', '')}
                                className="p-1.5 rounded-[5px] bg-red-600 text-white hover:bg-red-700 cursor-pointer shadow-sm"
                                title="Remove photo"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </>
                        ) : (
                          <ImageIcon size={22} className="text-slate-400" />
                        )}
                      </div>

                      {/* Upload Controls */}
                      <div className="flex-1 space-y-2">
                        <label className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-[5px] border cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-xs">
                          <UploadCloud size={14} />
                          <span>{isUploadingImage ? 'Uploading...' : 'Choose Image File'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageFile}
                            className="hidden"
                          />
                        </label>
                        <p className="text-[11px]" style={{ color: 'var(--color-muted)' }}>
                          Recommended: 800x600 PNG or JPG under 5MB.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Sort Order & Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
                    <div>
                      <label
                        className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                        style={{ color: 'var(--color-muted)' }}
                      >
                        Sort Display Order
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.sort_order}
                        onChange={(e) => setField('sort_order', e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-[5px] border outline-none font-mono"
                        style={{
                          background: 'var(--color-bg)',
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-text)',
                        }}
                      />
                    </div>

                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.is_active}
                          onChange={(e) => setField('is_active', e.target.checked)}
                          className="w-4 h-4 rounded-[4px] accent-[var(--color-500,#BF4040)]"
                        />
                        <span className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>
                          Active &amp; Visible on POS / Menus
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── TAB 2: Sub-Categories List (Edit mode only) ── */}
              {isEdit && !item?.parent_id && (
                <div id="subcategories" className="space-y-2.5 scroll-mt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      Sub-Categories ({existingSubCategories.length})
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsSubModalOpen(true)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-white px-3 py-1.5 rounded-[5px] shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                      style={{
                        background: 'linear-gradient(135deg, var(--color-500, #BF4040), var(--color-600, #9D3434))',
                      }}
                    >
                      <Plus size={13} />
                      <span>Add Sub-Category</span>
                    </button>
                  </div>

                  <div
                    className="rounded-[5px] p-6 sm:p-7 space-y-3"
                    style={{
                      background: 'var(--color-surface)',
                    }}
                  >
                    {existingSubCategories.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {existingSubCategories.map((sub) => (
                          <div
                            key={sub.id}
                            className="flex items-center justify-between p-3 rounded-[5px] border shadow-2xs"
                            style={{
                              background: 'var(--color-bg)',
                              borderColor: 'var(--color-border)',
                            }}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <CornerDownRight size={14} className="text-slate-400 shrink-0" />
                              <span className="text-xs font-bold truncate" style={{ color: 'var(--color-text)' }}>
                                {sub.name}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400">
                              Order #{sub.sort_order}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-xs text-[var(--color-muted)]">
                        No sub-categories linked yet. Click &ldquo;+ Add Sub-Category&rdquo; above.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── TAB 3: Preview & Display ──────────────────────────── */}
              <div id="preview" className="space-y-2.5 scroll-mt-6">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Catalog Card Preview
                </h3>
                <div
                  className="rounded-[5px] p-6 sm:p-7 flex items-center justify-center"
                  style={{
                    background: 'var(--color-surface)',
                  }}
                >
                  <div className="w-full max-w-sm">
                    <CatalogCard
                      item={{
                        id: formData.parent_id || 'preview',
                        title: formData.name || 'Category Name',
                        image: formData.image_url || 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&auto=format&fit=crop&q=80',
                        description: formData.description || 'Category description will appear here on POS and menus.',
                        itemCount: existingSubCategories.length || 0,
                      }}
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <CreateSubCatModal
        isOpen={isSubModalOpen}
        parentCategory={item}
        onClose={() => setIsSubModalOpen(false)}
        onSave={handleQuickAddSubCategory}
      />
    </div>
  )
}
