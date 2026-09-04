import { useState, useEffect, useRef, useMemo } from 'react'
import { Scrollspy } from '../../../components/reui/scrollspy'
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
import axiosClient from '../../../api/axiosClient'
import { adminApi } from '../../../api/adminApi'
import { Button } from '../../../components/common/ButtonComponent'
import { CatalogCard } from '../../../components/plugin/components/cards-components'
import { SearchSelection } from '../../../components/plugin/components/Search-Selection-components'
import { Modal } from '../../../components/common/ModalComponent'

function CreateSubCatModal({ isOpen, parentCategory, onClose, onSave }) {
  const [name, setName] = useState('')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border animate-in zoom-in-95 duration-150"
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
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border outline-none font-medium transition-colors"
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
            className="w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-sm transition-all hover:opacity-90 active:scale-95 cursor-pointer bg-[#126973]"
          >
            Save Sub-Category
          </button>
        </form>
      </div>
    </div>
  )
}

export default function CategoriesCreateView({
  isOpen = true,
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubModalOpen, setIsSubModalOpen] = useState(false)

  useEffect(() => {
    axiosClient.get('/outlets').then((res) => setOutlets(res.data?.data || [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (item) {
      setFormData({
        outlet_id: item.outlet_id ? String(item.outlet_id) : '',
        parent_id: item.parent_id ? String(item.parent_id) : null,
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

  // Filter available parent categories (cannot select itself, only top-level categories)
  const parentCategoryOptions = useMemo(() => {
    const list = [
      {
        value: '',
        id: '',
        label: '📁 None (Top-Level Main Category)',
        name: '📁 None (Top-Level Main Category)',
        badge: 'MAIN',
        description: 'Independent top-level category with no parent',
      },
    ]

    categories
      .filter((c) => {
        if (item?.id && String(c.id) === String(item.id)) return false
        if (c.parent_id) return false
        // If a venue is selected, show parents matching that venue or global parents
        if (formData.outlet_id) {
          return !c.outlet_id || String(c.outlet_id) === String(formData.outlet_id)
        }
        return true
      })
      .forEach((c) => {
        list.push({
          value: String(c.id),
          id: String(c.id),
          label: c.name,
          name: c.name,
          badge: c.outlet?.code || 'MAIN CAT',
          description: c.description || (c.outlet ? `Venue: ${c.outlet.name}` : 'Shared Across All Venues'),
        })
      })

    return list
  }, [categories, item, formData.outlet_id])

  // Existing sub-categories belonging to this category
  const existingSubCategories = categories.filter(
    (c) => item && String(c.parent_id) === String(item.id)
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

  const handleSubmit = async (e) => {
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

    try {
      setIsSubmitting(true)
      await onSave?.(payload)
    } finally {
      setIsSubmitting(false)
    }
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
  const isSubCategory = Boolean(formData.parent_id || item?.parent_id)
  const parentName = categories.find((c) => String(c.id) === String(formData.parent_id))?.name

  const tabs = [
    { id: 'venue', label: 'Venue & Outlet', icon: Building2 },
    { id: 'basic', label: 'Basic Info', icon: Folder },
    ...(isEdit && !item?.parent_id
      ? [{ id: 'subcategories', label: `Sub-Categories (${existingSubCategories.length})`, icon: FolderTree }]
      : []),
    
  ]

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={
          isEdit
            ? item?.parent_id
              ? 'Edit Sub-Category'
              : 'Edit Category'
            : isSubCategory
            ? 'Add Sub-Category'
            : 'Add Category'
        }
        subtitle="Configure details, venue assignment, hierarchy, and visual display."
        icon={FolderTree}
        iconBadgeColor="var(--color-primary, #126973)"
        size="4xl"
        draggable={true}
        showDragHandle={true}
        bodyClassName="p-0 flex flex-col md:flex-row !overflow-hidden h-full"
        footer={
          <div className="flex items-center justify-end gap-2.5 w-full">
            <Button
              variant="secondary"
              size="md"
              type="button"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              type="button"
              onClick={handleSubmit}
              loading={isSubmitting || isUploadingImage}
              iconLeading={Sparkles}
            >
              {isEdit ? 'Save Changes' : isSubCategory ? 'Create Sub-Category' : 'Create Category'}
            </Button>
          </div>
        }
      >
        {/* Left Vertical Tab bar with Scrollspy */}
        <div
          className="w-full md:w-56 border-b md:border-b-0 md:border-r shrink-0 p-4 md:p-5 bg-[var(--color-surface)]"
          style={{
            borderColor: 'var(--color-border)',
          }}
        >
          <Scrollspy
            offset={30}
            targetRef={parentRef}
            className="flex flex-row md:flex-col gap-2 overflow-x-auto scrollbar-none"
          >
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                data-scrollspy-anchor={t.id}
                className="inline-flex items-center gap-2 justify-start whitespace-nowrap rounded-xl text-xs font-semibold transition-all focus-visible:outline-none border border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50 h-9 px-3.5 py-2 text-slate-700 dark:text-slate-300 data-[active=true]:bg-[#126973] data-[active=true]:text-white data-[active=true]:border-[#126973] shadow-2xs cursor-pointer"
              >
                {t.icon && <t.icon size={14} className="shrink-0" />}
                <span>{t.label}</span>
              </button>
            ))}
          </Scrollspy>
        </div>

        {/* Right Form Body */}
        <div
          ref={parentRef}
          className="flex-1 overflow-y-auto h-full scroll-smooth p-5 md:p-7 relative scrollbar-none"
        >
          <form onSubmit={handleSubmit} className="space-y-7 max-w-2xl">
            {/* ── TAB: Venue & Outlet ──────────────────────────── */}
            <div id="venue" className="space-y-2.5 scroll-mt-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Building2 size={16} className="text-[#126973]" />
                <span>Venue &amp; Outlet</span>
              </h3>
              <div
                className="rounded-xl p-5 space-y-4 border"
                style={{
                  background: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
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
                    onChange={(val) => {
                      const newOutlet = val ? String(val) : ''
                      setFormData((prev) => {
                        const parentMatches = prev.parent_id && categories.some(
                          (c) => String(c.id) === String(prev.parent_id) && (newOutlet ? String(c.outlet_id) === newOutlet : !c.outlet_id)
                        )
                        return {
                          ...prev,
                          outlet_id: newOutlet,
                          parent_id: parentMatches ? prev.parent_id : null,
                        }
                      })
                    }}
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
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Folder size={16} className="text-[#126973]" />
                <span>Basic Info</span>
              </h3>
              <div
                className="rounded-xl p-5 space-y-5 border"
                style={{
                  background: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
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
                    className="w-full px-4 py-2.5 text-xs rounded-xl border outline-none font-bold transition-all"
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
                  <SearchSelection
                    name="parent_id"
                    options={parentCategoryOptions}
                    valueKey="id"
                    labelKey="name"
                    value={String(formData.parent_id || '')}
                    autoSelect={false}
                    onChange={(val) => {
                      setField('parent_id', val ? String(val) : null)
                      if (val) {
                        const chosenParent = categories.find((c) => String(c.id) === String(val))
                        if (chosenParent?.outlet_id && !formData.outlet_id) {
                          setField('outlet_id', String(chosenParent.outlet_id))
                        }
                      }
                    }}
                    placeholder="None (Top-Level Main Category)..."
                    searchPlaceholder="Search parent category..."
                  />
                  <p className="text-[11px] mt-1.5" style={{ color: 'var(--color-muted)' }}>
                    {formData.parent_id ? (
                      <span className="text-amber-600 dark:text-amber-400 font-medium">
                        ↳ This will be created as a sub-category under{' '}
                        <strong>{parentName || 'selected parent'}</strong>.
                      </span>
                    ) : (
                      <span>
                        Leave as None to create this as an independent top-level category.
                      </span>
                    )}
                  </p>
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
                    className="w-full px-4 py-2.5 text-xs rounded-xl border outline-none resize-none transition-all"
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
                      className="w-24 h-24 rounded-xl border-2 border-dashed flex items-center justify-center relative overflow-hidden shrink-0 group transition-all"
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
                              className="p-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 cursor-pointer shadow-sm"
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
                      <label className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl border cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-xs">
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
                        Recommended: 800x600 PNG, JPG, or WEBP under 5MB.
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
                      className="w-full px-3.5 py-2 text-xs rounded-xl border outline-none font-mono"
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
                        className="w-4 h-4 rounded text-[#126973] focus:ring-[#126973] cursor-pointer"
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
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <FolderTree size={16} className="text-[#126973]" />
                    <span>Sub-Categories ({existingSubCategories.length})</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsSubModalOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-white px-3 py-1.5 rounded-xl shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer bg-[#126973]"
                  >
                    <Plus size={13} />
                    <span>Add Sub-Category</span>
                  </button>
                </div>

                <div
                  className="rounded-xl p-5 space-y-3 border"
                  style={{
                    background: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  {existingSubCategories.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {existingSubCategories.map((sub) => (
                        <div
                          key={sub.id}
                          className="flex items-center justify-between p-3 rounded-xl border shadow-2xs"
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

          </form>
        </div>
      </Modal>

      <CreateSubCatModal
        isOpen={isSubModalOpen}
        parentCategory={item}
        onClose={() => setIsSubModalOpen(false)}
        onSave={handleQuickAddSubCategory}
      />
    </>
  )
}
