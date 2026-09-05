import { useState, useEffect, useRef, useMemo } from 'react'
import { Scrollspy } from '../../../../../../components/reui/scrollspy'
import {
  X,
  Tag,
  Sparkles,
  Layers,
  SlidersHorizontal,
  ShieldCheck,
  Check,
  AlertCircle,
  Hash,
  ArrowRight,
  HelpCircle,
  Layers3,
  FolderTree,
  Image as ImageIcon,
  UploadCloud,
  Trash2,
  Beef,
  Fish,
  Salad,
  Milk,
  Wheat,
  Utensils,
  Coffee,
  Cookie,
  Boxes,
  Package,
  Zap,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { adminApi } from '../../../../../../api/adminApi'
import { Button } from '../../../../../../components/common/ButtonComponent'
import { Modal } from '../../../../../../components/common/ModalComponent'
import { getCategoryVisual } from './CategoriesIngredients'

// ── Common Ingredient Category Presets ────────────────────────────────────────
export const INGREDIENT_CATEGORY_PRESETS = [
  { code: 'MEAT', name: 'Meat & Poultry', icon: Beef, desc: 'Beef, chicken, pork, lamb & processed cuts' },
  { code: 'SEAFOOD', name: 'Seafood & Fish', icon: Fish, desc: 'Fresh fish, shrimp, crab, squid & shellfish' },
  { code: 'PRODUCE', name: 'Fresh Produce', icon: Salad, desc: 'Vegetables, herbs, greens, fresh fruits' },
  { code: 'DAIRY', name: 'Dairy & Eggs', icon: Milk, desc: 'Milk, cheese, butter, heavy cream & fresh eggs' },
  { code: 'DRY_GOODS', name: 'Dry Goods & Grains', icon: Wheat, desc: 'Rice, flour, pasta, grains, beans & cereals' },
  { code: 'SPICE', name: 'Spices & Seasoning', icon: Utensils, desc: 'Salt, peppers, dried herbs, sauces & condiments' },
  { code: 'BEV', name: 'Beverages & Bar', icon: Coffee, desc: 'Coffee beans, teas, syrups, juices & cocktail mixers' },
  { code: 'BAKERY', name: 'Bakery & Pastry', icon: Cookie, desc: 'Yeast, baking powders, chocolate, sugar & dough' },
  { code: 'CANNED', name: 'Canned & Preserved', icon: Package, desc: 'Canned tomatoes, preserved vegetables, pickles' },
  { code: 'PACKAGING', name: 'Packaging & Supplies', icon: Boxes, desc: 'Takeaway boxes, cups, lids, cutlery & wrap' },
]

// Auto-generate code slug helper
const formatCodeSlug = (text = '') => {
  return text
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 30)
}

/**
 * CategoriesIngredientsModal
 * 
 * Styled after CategoriesCreateView.jsx with Left Vertical Tab Bar + Scrollspy,
 * live preview card, visual preset quick-picker, and smooth Untitled UI modal layout.
 */
export default function CategoriesIngredientsModal({
  isOpen = true,
  item = null,
  onClose,
  onSave,
  onSuccess,
}) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    image: '',
    sort_order: 0,
    is_active: true,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isAutoCode, setIsAutoCode] = useState(true)
  const parentRef = useRef(null)

  const isEdit = Boolean(item && item.id)

  // Initialize or reset form data
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        code: item.code || '',
        description: item.description || '',
        image: item.image || item.image_url || '',
        sort_order: item.sort_order ?? 0,
        is_active: item.is_active !== false,
      })
      setIsAutoCode(false)
    } else {
      setFormData({
        name: '',
        code: '',
        description: '',
        image: '',
        sort_order: 0,
        is_active: true,
      })
      setIsAutoCode(true)
    }
  }, [item, isOpen])

  const setField = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }))
  }

  // Handle name change with optional auto-code generation
  const handleNameChange = (val) => {
    setFormData((prev) => {
      const updated = { ...prev, name: val }
      if (isAutoCode && !isEdit) {
        updated.code = formatCodeSlug(val)
      }
      return updated
    })
  }

  // Quick preset apply
  const handleApplyPreset = (preset) => {
    setFormData((prev) => ({
      ...prev,
      name: prev.name.trim() ? prev.name : preset.name,
      code: preset.code,
      description: prev.description.trim() ? prev.description : preset.desc,
    }))
    setIsAutoCode(false)
    toast.success(`Applied preset "${preset.name}"`)
  }

  // Compute live visual for preview
  const liveVisual = useMemo(() => {
    return getCategoryVisual(formData.code, formData.name)
  }, [formData.code, formData.name])

  // Handle category image file upload
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
      setField('image', reader.result)
    }
    reader.readAsDataURL(file)

    const form = new FormData()
    form.append('image', file)

    setIsUploadingImage(true)
    try {
      const { data } = await adminApi.uploadImage(form, 'categories')
      const uploadedUrl = data?.url || data?.path || data?.file_url || data?.image_url
      if (uploadedUrl) {
        setField('image', uploadedUrl)
        toast.success('Category image uploaded successfully')
      }
    } catch (err) {
      console.warn('Image upload fallback; preserved preview:', err)
    } finally {
      setIsUploadingImage(false)
    }
  }

  // Form submission handler
  const handleSubmit = async (e) => {
    if (e) e.preventDefault()

    const trimmedName = formData.name.trim()
    if (!trimmedName) {
      toast.error('Category name is required')
      const el = document.getElementById('basic')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }

    const finalCode = formData.code?.trim()
      ? formData.code.trim().toUpperCase()
      : formatCodeSlug(trimmedName)

    if (!finalCode) {
      toast.error('Category code is required')
      return
    }

    const payload = {
      name: trimmedName,
      code: finalCode,
      description: formData.description?.trim() || null,
      image: formData.image?.trim() || null,
      sort_order: parseInt(formData.sort_order, 10) || 0,
      is_active: Boolean(formData.is_active),
    }

    try {
      setIsSubmitting(true)
      if (onSave) {
        await onSave(payload)
      } else {
        if (isEdit) {
          await adminApi.updateIngredientCategory(item.id, payload)
          toast.success(`Updated category "${trimmedName}"`)
        } else {
          await adminApi.createIngredientCategory(payload)
          toast.success(`Created category "${trimmedName}"`)
        }
        if (onSuccess) onSuccess()
        if (onClose) onClose()
      }
    } catch (err) {
      console.error('Failed to save category:', err)
      toast.error(err.response?.data?.error || 'Failed to save category')
    } finally {
      setIsSubmitting(false)
    }
  }

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Tag },
    { id: 'visual', label: 'Presets & Preview', icon: Sparkles },
    { id: 'settings', label: 'Display & Status', icon: SlidersHorizontal },
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Material Category' : 'New Material Category'}
      subtitle="Configure raw material category code, classification, and inventory display."
      icon={Tag}
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
            loading={isSubmitting}
            iconLeading={Sparkles}
          >
            {isEdit ? 'Save Changes' : 'Create Category'}
          </Button>
        </div>
      }
    >
      {/* Left Vertical Tab Bar with Scrollspy */}
      <div
        className="w-full md:w-56 border-b md:border-b-0 md:border-r shrink-0 p-4 md:p-5 bg-[var(--color-surface)]"
        style={{ borderColor: 'var(--color-border)' }}
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
          {/* ── TAB 1: Basic Info ─────────────────────────────────── */}
          <div id="basic" className="space-y-2.5 scroll-mt-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Tag size={16} className="text-[#126973]" />
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
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Fresh Meats, Dairy & Eggs, Bakery Supplies"
                  className="w-full px-4 py-2.5 text-xs rounded-xl border outline-none font-bold transition-all focus:border-[#126973] focus:ring-3 focus:ring-[#126973]/15"
                  style={{
                    background: 'var(--color-bg)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                />
              </div>

              {/* Category Code */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    className="block text-xs font-bold uppercase tracking-wider"
                    style={{ color: 'var(--color-muted)' }}
                  >
                    Category Code / Prefix *
                  </label>
                  {!isEdit && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsAutoCode(!isAutoCode)
                        if (!isAutoCode) {
                          setField('code', formatCodeSlug(formData.name))
                        }
                      }}
                      className="text-[11px] font-semibold text-[#126973] dark:text-[#F1D8C2] hover:underline cursor-pointer"
                    >
                      {isAutoCode ? (
                        <span className="inline-flex items-center gap-1">
                          <Zap size={11} className="fill-current" />
                          <span>Auto-Sync Active</span>
                        </span>
                      ) : (
                        'Manual Code'
                      )}
                    </button>
                  )}
                </div>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-slate-400 font-mono text-xs font-bold">
                    #
                  </span>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => {
                      setIsAutoCode(false)
                      setField('code', e.target.value.toUpperCase())
                    }}
                    placeholder="e.g. MEAT, DAIRY, SEAFOOD, PRODUCE"
                    className="w-full pl-8 pr-4 py-2.5 text-xs rounded-xl border outline-none font-mono font-bold tracking-wider transition-all focus:border-[#126973] focus:ring-3 focus:ring-[#126973]/15"
                    style={{
                      background: 'var(--color-bg)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  />
                </div>
                <p className="text-[11px] mt-1.5" style={{ color: 'var(--color-muted)' }}>
                  Used for classification, item filtering, and raw material SKU prefixes (must be unique).
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
                  placeholder="Brief notes on what ingredients or raw stock belong under this group..."
                  className="w-full px-4 py-2.5 text-xs rounded-xl border outline-none resize-none transition-all focus:border-[#126973] focus:ring-3 focus:ring-[#126973]/15"
                  style={{
                    background: 'var(--color-bg)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                />
              </div>

              {/* Cover Image Upload Area */}
              <div>
                <label
                  className="block text-xs font-bold uppercase tracking-wider mb-2"
                  style={{ color: 'var(--color-muted)' }}
                >
                  Category Image
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Thumbnail Preview */}
                  <div
                    className="w-20 h-20 rounded-xl border-2 border-dashed flex items-center justify-center relative overflow-hidden shrink-0 group transition-all"
                    style={{
                      background: 'var(--color-bg)',
                      borderColor: 'var(--color-border)',
                    }}
                  >
                    {formData.image ? (
                      <>
                        <img
                          src={formData.image}
                          alt="preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none'
                          }}
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => setField('image', '')}
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
                      Optional cover image for display in category cards (PNG, JPG, or WEBP under 5MB).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── TAB 2: Presets & Live Preview ─────────────────────── */}
          <div id="visual" className="space-y-2.5 scroll-mt-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles size={16} className="text-[#126973]" />
              <span>Presets &amp; Live Card Preview</span>
            </h3>

            <div
              className="rounded-xl p-5 space-y-5 border"
              style={{
                background: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
              }}
            >
              {/* Quick Preset Tiles */}
              <div>
                <label
                  className="block text-xs font-bold uppercase tracking-wider mb-2"
                  style={{ color: 'var(--color-muted)' }}
                >
                  Quick Classification Presets
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {INGREDIENT_CATEGORY_PRESETS.map((p) => {
                    const isSelected =
                      formData.code === p.code ||
                      formData.name.toLowerCase() === p.name.toLowerCase()

                    return (
                      <button
                        key={p.code}
                        type="button"
                        onClick={() => handleApplyPreset(p)}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer shadow-2xs hover:-translate-y-0.5 ${
                          isSelected
                            ? 'bg-[#126973]/10 border-[#126973] text-[#126973] dark:text-[#F1D8C2] ring-2 ring-[#126973]/20 font-bold'
                            : 'bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text)] hover:border-slate-400'
                        }`}
                        title={p.desc}
                      >
                        {p.icon ? (
                          <p.icon size={20} className="mb-1 text-slate-700 dark:text-slate-200" />
                        ) : (
                          <Tag size={20} className="mb-1 text-slate-700 dark:text-slate-200" />
                        )}
                        <span className="text-[11px] truncate max-w-full font-semibold">
                          {p.name}
                        </span>
                        <span className="text-[9px] font-mono text-[var(--color-muted)] mt-0.5">
                          {p.code}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Live Card Preview Box */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    className="block text-xs font-bold uppercase tracking-wider"
                    style={{ color: 'var(--color-muted)' }}
                  >
                    Live Grid Card Preview
                  </label>
                  <span className="text-[10.5px] font-semibold text-[var(--color-muted)]">
                    Matches Category Cards Grid view
                  </span>
                </div>

                <div
                  className="p-4 rounded-xl border bg-black/5 dark:bg-white/5 border-dashed"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <div
                    className={`max-w-sm mx-auto rounded-2xl border overflow-hidden transition-all shadow-xs ${liveVisual.accent} border-b-[3px]`}
                    style={{
                      background: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                    }}
                  >
                    {formData.image ? (
                      /* Top Cover Banner Preview */
                      <div className="relative w-full h-32 overflow-hidden bg-black/5 dark:bg-white/5 border-b border-[var(--color-border)]">
                        <img
                          src={formData.image}
                          alt="preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none'
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                       

                        <div className="absolute bottom-2 left-3 w-7 h-7 rounded-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border border-white/40 dark:border-slate-700 shadow-md flex items-center justify-center text-[#126973] dark:text-[#F1D8C2]">
                          {liveVisual.icon ? <liveVisual.icon size={14} /> : <Tag size={14} />}
                        </div>
                      </div>
                    ) : null}

                    <div className={formData.image ? 'p-4' : 'p-4.5'}>
                      {!formData.image && (
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/10 border border-[var(--color-border)] flex items-center justify-center shadow-2xs text-[#126973] dark:text-[#F1D8C2]">
                            {liveVisual.icon ? <liveVisual.icon size={22} /> : <Tag size={22} />}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10.5px] font-bold px-2 py-0.5 rounded-md border border-[var(--color-border)] bg-black/5 dark:bg-white/5 text-[var(--color-muted)]">
                              {formData.code || 'CODE'}
                            </span>
                            <span
                              className={`w-2 h-2 rounded-full ${
                                formData.is_active ? 'bg-emerald-500 ring-2 ring-emerald-500/20' : 'bg-slate-400'
                              }`}
                              title={formData.is_active ? 'Active' : 'Inactive'}
                            />
                          </div>
                        </div>
                      )}

                      <h4 className="text-sm font-bold text-[var(--color-text)] truncate">
                        {formData.name || 'Category Name'}
                      </h4>
                      <p className="text-[11px] text-[var(--color-muted)] mt-0.5 line-clamp-2 min-h-[32px]">
                        {formData.description || 'No description provided for this ingredient category.'}
                      </p>

                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-[var(--color-border)] text-xs">
                        <span className="text-[var(--color-muted)] text-[11px]">
                          Order #{formData.sort_order || 0}
                        </span>
                        <span className="font-bold text-[#126973] dark:text-[#F1D8C2] text-[11px] flex items-center gap-1">
                          <span>Preview</span>
                          <ArrowRight size={12} />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── TAB 3: Display & Status ───────────────────────────── */}
          <div id="settings" className="space-y-2.5 scroll-mt-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <SlidersHorizontal size={16} className="text-[#126973]" />
              <span>Display &amp; Status</span>
            </h3>

            <div
              className="rounded-xl p-5 space-y-4 border"
              style={{
                background: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
              }}
            >
              {/* Sort Display Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                    style={{ color: 'var(--color-muted)' }}
                  >
                    Display Sort Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.sort_order}
                    onChange={(e) => setField('sort_order', e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border outline-none font-mono font-bold transition-all focus:border-[#126973] focus:ring-3 focus:ring-[#126973]/15"
                    style={{
                      background: 'var(--color-bg)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  />
                  <p className="text-[11px] mt-1" style={{ color: 'var(--color-muted)' }}>
                    Lower numbers appear first in category tabs and selection dropdowns.
                  </p>
                </div>

                {/* Active Status Checkbox */}
                <div className="flex flex-col justify-center pt-2">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setField('is_active', e.target.checked)}
                      className="w-4 h-4 rounded text-[#126973] focus:ring-[#126973] cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-[var(--color-text)] block">
                        Active &amp; Available
                      </span>
                      <span className="text-[11px] text-[var(--color-muted)]">
                        Enable this category for ingredient assignments and inventory filters.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Edit mode information */}
              {isEdit && item?.ingredients && (
                <div
                  className="p-3.5 rounded-xl border mt-2 flex items-center justify-between text-xs"
                  style={{
                    background: 'var(--color-bg)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  <span className="text-[var(--color-muted)]">
                    Linked Raw Materials:
                  </span>
                  <span className="font-bold text-[var(--color-text)] px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/5 border border-[var(--color-border)]">
                    {item.ingredients.length} items classified
                  </span>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </Modal>
  )
}
