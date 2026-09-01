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
  Folder
} from 'lucide-react'
import toast from 'react-hot-toast'
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
            className="text-slate-400 hover:text-slate-600 transition-colors"
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
            className="w-full py-2.5 rounded-[5px] text-xs font-bold text-white shadow-sm transition-all hover:opacity-90 active:scale-95"
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
  const [formData, setFormData] = useState({
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
    if (item) {
      setFormData({
        parent_id: item.parent_id ? Number(item.parent_id) : null,
        name: item.name || '',
        description: item.description || '',
        sort_order: item.sort_order ?? 0,
        is_active: item.is_active !== false,
        image_url: item.image_url || '',
      })
    } else {
      setFormData({
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
      parent_id: formData.parent_id ? Number(formData.parent_id) : null,
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
          Cancel & Return
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
                ? 'Add New Sub-Category'
                : 'Add New Category'}
            </h3>
            
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
                  className="inline-flex items-center justify-start whitespace-nowrap rounded-[5px] text-xs sm:text-sm font-semibold transition-all focus-visible:outline-none border border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50 h-10 px-4 py-2 text-slate-700 dark:text-slate-300 data-[active=true]:bg-slate-900 data-[active=true]:text-white data-[active=true]:border-slate-900 dark:data-[active=true]:bg-slate-50 dark:data-[active=true]:text-slate-900 dark:data-[active=true]:border-slate-50 shadow-2xs"
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
                  {/* Image Upload & Title */}
                  <div className="flex flex-col sm:flex-row items-start gap-6">
                    {/* Image Box */}
                    <div
                      className="w-32 h-32 rounded-[5px] border-2 border-dashed flex flex-col items-center justify-center shrink-0 overflow-hidden relative group transition-colors"
                      style={{
                        background: 'var(--color-bg)',
                        borderColor: 'var(--color-border)',
                      }}
                    >
                      {isUploadingImage && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white z-10">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mb-1" />
                          <span className="text-[10px] font-bold">Uploading...</span>
                        </div>
                      )}

                      {formData.image_url ? (
                        <>
                          <img
                            src={formData.image_url}
                            alt="Category preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none'
                            }}
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => setField('image_url', '')}
                              className="w-8 h-8 rounded-[5px] bg-white text-rose-600 flex items-center justify-center hover:bg-rose-50 shadow-sm transition-transform active:scale-90"
                              title="Remove Photo"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div
                            className="w-9 h-9 rounded-[5px] flex items-center justify-center mb-1.5"
                            style={{
                              background: 'rgba(191, 64, 64, 0.08)',
                              color: 'var(--color-500, #BF4040)',
                            }}
                          >
                            <UploadCloud size={18} />
                          </div>
                          <span className="text-[11px] font-bold" style={{ color: 'var(--color-text)' }}>
                            Upload Photo
                          </span>
                          <span className="text-[9px]" style={{ color: 'var(--color-muted)' }}>
                            PNG, JPG up to 5MB
                          </span>
                        </>
                      )}

                      {!formData.image_url && (
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFile}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          title="Upload Image File"
                        />
                      )}
                    </div>

                    {/* Title & Hierarchy Parent */}
                    <div className="flex-1 space-y-4 w-full">
                      {/* Category Name */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                          Category Name *
                        </label>
                        <input
                          required
                          type="text"
                          value={formData.name}
                          onChange={(e) => setField('name', e.target.value)}
                          placeholder="e.g "
                          className="w-full px-3.5 py-2.5 text-xs rounded-[5px] border outline-none font-bold transition-colors"
                          style={{
                            background: 'var(--color-bg)',
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-text)',
                          }}
                        />
                      </div>

                      {/* Parent Category (Sub-Category Selector) */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                          Parent Category (Hierarchy)
                        </label>
                        <SearchSelection
                          name="parent_id"
                          options={parentCategoryOptions}
                          valueKey="id"
                          labelKey="name"
                          value={formData.parent_id}
                          autoSelect={false}
                          isClearable={true}
                          onChange={(val) => {
                            setField('parent_id', val ? Number(val) : null)
                          }}
                          placeholder="None (Main Top-Level Category)"
                          searchPlaceholder="Search parent category..."
                          emptyMessage="No parent categories found"
                        />
                       
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setField('description', e.target.value)}
                      placeholder="e.g"
                      className="w-full px-3.5 py-2.5 text-xs rounded-[5px] border outline-none resize-none transition-colors"
                      style={{
                        background: 'var(--color-bg)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text)',
                      }}
                    />
                  </div>

                  {/* Sort Order & Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    {/* Sort Order */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                        Display Sort Order
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.sort_order}
                        onChange={(e) => setField('sort_order', e.target.value)}
                        placeholder="0"
                        className="w-full px-3.5 py-2.5 text-xs rounded-[5px] border outline-none font-mono font-bold transition-colors"
                        style={{
                          background: 'var(--color-bg)',
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-text)',
                        }}
                      />
                      
                    </div>

                    {/* Active / Hidden Status Toggle */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                        Menu Visibility
                      </label>
                      <button
                        type="button"
                        onClick={() => setField('is_active', !formData.is_active)}
                        className={`w-full px-3.5 py-2.5 rounded-[5px] border flex items-center justify-between transition-all ${
                          formData.is_active
                            ? 'border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20'
                            : 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {formData.is_active ? (
                            <Eye size={15} className="text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <EyeOff size={15} className="text-slate-400" />
                          )}
                          <span
                            className={`text-xs font-bold ${
                              formData.is_active
                                ? 'text-emerald-700 dark:text-emerald-400'
                                : 'text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {formData.is_active ? 'Active & Visible' : 'Hidden from Menu'}
                          </span>
                        </div>

                        {/* Switch pill */}
                        <div
                          className={`w-8 h-4.5 rounded-full transition-colors relative ${
                            formData.is_active ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                          }`}
                        >
                          <div
                            className={`w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-0.5 ${
                              formData.is_active ? 'left-4' : 'left-0.5'
                            }`}
                          />
                        </div>
                      </button>
                    
                    </div>
                  </div>
                </div>
              </div>

              {/* ── TAB 2: Sub-Categories (When editing a main category) ── */}
              {isEdit && !item?.parent_id && (
                <div id="subcategories" className="space-y-2.5 scroll-mt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      Sub-Categories
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsSubModalOpen(true)}
                      className="text-xs font-bold text-[var(--color-500,#BF4040)] hover:underline flex items-center gap-1"
                    >
                      <Plus size={14} /> Add Sub-Category
                    </button>
                  </div>

                  <div
                    className="rounded-[5px] p-6 sm:p-7 space-y-4"
                    style={{
                      background: 'var(--color-surface)',
                    }}
                  >
                    {existingSubCategories.length > 0 ? (
                      <div className="divide-y border rounded-[5px] overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
                        {existingSubCategories.map((sub, idx) => (
                          <div
                            key={sub.id}
                            className="p-3.5 flex items-center justify-between transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                            style={{ background: 'var(--color-card)' }}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded-[5px] flex items-center justify-center font-bold text-white shadow-2xs shrink-0"
                                style={{
                                  background: 'linear-gradient(135deg, #64748b, #475569)',
                                }}
                              >
                                {sub.image_url ? (
                                  <img src={sub.image_url} alt={sub.name} className="w-full h-full object-cover rounded-[5px]" />
                                ) : (
                                  <CornerDownRight size={14} />
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-xs" style={{ color: 'var(--color-text)' }}>
                                  {sub.name}
                                </p>
                                <p className="text-[10px]" style={{ color: 'var(--color-muted)' }}>
                                  Sort #{sub.sort_order || idx + 1} • {sub.is_active ? 'Active' : 'Hidden'}
                                </p>
                              </div>
                            </div>

                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                                sub.is_active
                                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                  : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                              }`}
                            >
                              {sub.is_active ? 'Active' : 'Hidden'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 rounded-[5px] border border-dashed" style={{ borderColor: 'var(--color-border)' }}>
                        <Folder size={32} className="mx-auto mb-2 opacity-30 text-[var(--color-muted)]" />
                        <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>
                          No sub-categories yet
                        </p>
                        <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-muted)' }}>
                          Break down &ldquo;{formData.name || 'this category'}&rdquo; into specific sub-groups.
                        </p>
                        <button
                          type="button"
                          onClick={() => setIsSubModalOpen(true)}
                          className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] text-xs font-bold text-white shadow-2xs"
                          style={{
                            background: 'linear-gradient(135deg, var(--color-500, #BF4040), var(--color-600, #9D3434))',
                          }}
                        >
                          <Plus size={13} /> Add First Sub-Category
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── TAB 3: Preview & Display ──────────────────── */}
              <div id="preview" className="space-y-2.5 scroll-mt-6">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Preview & Display
                </h3>
                <div
                  className="rounded-[5px] p-6 sm:p-7 space-y-6"
                  style={{
                    background: 'var(--color-surface)',
                  }}
                >

                  <div className="max-w-xs mx-auto">
                    <CatalogCard
                      title={formData.name || 'Category Name'}
                      subtitle={isSubCategory ? `↳ Sub of: ${parentName || 'Parent'}` : `Main Category • #${formData.sort_order || 0}`}
                      description={formData.description || 'No description provided for this category.'}
                      imageUrl={formData.image_url}
                      isActive={formData.is_active}
                      isSub={isSubCategory}
                      parentName={parentName}
                      sortOrder={formData.sort_order}
                      subCount={existingSubCategories.length}
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Sub Category Quick Modal */}
      <CreateSubCatModal
        isOpen={isSubModalOpen}
        parentCategory={item}
        onClose={() => setIsSubModalOpen(false)}
        onSave={handleQuickAddSubCategory}
      />
    </div>
  )
}
