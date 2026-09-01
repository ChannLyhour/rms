import { useState, useEffect, useRef } from 'react'
import { Scrollspy } from '../reui/scrollspy'
import {
  SlidersHorizontal,
  Plus,
  Trash2,
  Sparkles,
  ArrowLeft,
  Tag,
  Check,
  CircleDot,
  CheckSquare,
  DollarSign,
  AlertCircle,
  Layers
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '../common/ButtonComponent'

export default function OptionGroupCreateView({ item, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'single', // 'single' | 'multiple'
    is_required: false,
    values: [
      { name: '', price: 0 },
      { name: '', price: 0 },
    ],
  })

  const parentRef = useRef(null)
  const [previewSelected, setPreviewSelected] = useState([])

  const isEdit = Boolean(item && item.id)

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        type: item.type || 'single',
        is_required: Boolean(item.is_required),
        values:
          item.values && item.values.length > 0
            ? item.values.map((v) => ({ name: v.name, price: v.price || 0 }))
            : [{ name: '', price: 0 }],
      })
    } else {
      setFormData({
        name: '',
        type: 'single',
        is_required: false,
        values: [
          { name: '', price: 0 },
          { name: '', price: 0 },
        ],
      })
    }
  }, [item])

  const setField = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }))
  }

  // Value list management
  const addValueRow = () => {
    setFormData((prev) => ({
      ...prev,
      values: [...prev.values, { name: '', price: 0 }],
    }))
  }

  const updateValueRow = (index, field, value) => {
    setFormData((prev) => {
      const next = [...prev.values]
      next[index] = {
        ...next[index],
        [field]: field === 'price' ? parseFloat(value) || 0 : value,
      }
      return { ...prev, values: next }
    })
  }

  const removeValueRow = (index) => {
    if (formData.values.length <= 1) {
      toast.error('You need at least one choice value')
      return
    }
    setFormData((prev) => ({
      ...prev,
      values: prev.values.filter((_, i) => i !== index),
    }))
  }

  const applyPreset = (presetName, presetValues, presetType = 'single') => {
    setFormData((prev) => ({
      ...prev,
      name: prev.name || presetName,
      type: presetType,
      values: presetValues.map((v) => ({ name: v.name, price: v.price || 0 })),
    }))
    toast.success(`Preset "${presetName}" applied`)
  }

  const handleSubmit = (e) => {
    if (e) e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('Modifier group name is required')
      const el = document.getElementById('basic')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }

    const validValues = formData.values.filter((v) => v.name.trim())
    if (validValues.length === 0) {
      toast.error('Please provide at least one modifier choice option')
      const el = document.getElementById('choices')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }

    const payload = {
      name: formData.name.trim(),
      type: formData.type,
      is_required: Boolean(formData.is_required),
      values: validValues.map((v) => ({
        name: v.name.trim(),
        price: parseFloat(v.price) || 0,
      })),
    }

    onSave(payload)
  }

  const validChoicesCount = formData.values.filter((v) => v.name.trim()).length

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'choices', label: `Choices (${validChoicesCount})` },
    { id: 'preview', label: 'Preview & Display' },
  ]

  const handlePreviewChoiceToggle = (choiceName) => {
    if (formData.type === 'single') {
      setPreviewSelected([choiceName])
    } else {
      setPreviewSelected((prev) =>
        prev.includes(choiceName)
          ? prev.filter((n) => n !== choiceName)
          : [...prev, choiceName]
      )
    }
  }

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
          {isEdit ? 'Save Changes' : '+ Create Option Group'}
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
              {isEdit ? 'Edit Option Group' : 'Add New Option Group'}
            </h3>
            <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
              Configure product customizers, size options, add-ons, and pricing rules.
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
                  {/* Name */}
                  <div>
                    <label
                      className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                      style={{ color: 'var(--color-muted)' }}
                    >
                      Option Group Name *
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setField('name', e.target.value)}
                      placeholder="e.g. Size, Temperature, Extra Toppings, Sugar Level"
                      className="w-full px-3.5 py-2.5 text-xs rounded-[5px] border outline-none font-bold transition-colors"
                      style={{
                        background: 'var(--color-bg)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text)',
                      }}
                    />
                    <span className="text-[10px] mt-1 block" style={{ color: 'var(--color-muted)' }}>
                      This name is shown as the header when customizing items in the POS and online store.
                    </span>
                  </div>

                  {/* Selection Mode (Radio Cards) */}
                  <div>
                    <label
                      className="block text-xs font-bold uppercase tracking-wider mb-2"
                      style={{ color: 'var(--color-muted)' }}
                    >
                      Selection Mode
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Single Choice */}
                      <div
                        onClick={() => setField('type', 'single')}
                        className={`p-4 rounded-[5px] border cursor-pointer transition-all flex items-start gap-3 select-none ${
                          formData.type === 'single'
                            ? 'border-[var(--color-500,#BF4040)] shadow-xs ring-1 ring-[var(--color-500,#BF4040)]/20'
                            : 'hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                        style={{
                          background:
                            formData.type === 'single'
                              ? 'rgba(191, 64, 64, 0.04)'
                              : 'var(--color-bg)',
                          borderColor:
                            formData.type === 'single'
                              ? 'var(--color-500, #BF4040)'
                              : 'var(--color-border)',
                        }}
                      >
                        <div
                          className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5"
                          style={{
                            borderColor:
                              formData.type === 'single'
                                ? 'var(--color-500, #BF4040)'
                                : 'var(--color-muted)',
                          }}
                        >
                          {formData.type === 'single' && (
                            <div
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ background: 'var(--color-500, #BF4040)' }}
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-xs" style={{ color: 'var(--color-text)' }}>
                            Single Choice (Radio)
                          </p>
                          <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-muted)' }}>
                            Customer selects exactly one option (e.g. Small, Medium, Large).
                          </p>
                        </div>
                      </div>

                      {/* Multiple Choices */}
                      <div
                        onClick={() => setField('type', 'multiple')}
                        className={`p-4 rounded-[5px] border cursor-pointer transition-all flex items-start gap-3 select-none ${
                          formData.type === 'multiple'
                            ? 'border-[var(--color-500,#BF4040)] shadow-xs ring-1 ring-[var(--color-500,#BF4040)]/20'
                            : 'hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                        style={{
                          background:
                            formData.type === 'multiple'
                              ? 'rgba(191, 64, 64, 0.04)'
                              : 'var(--color-bg)',
                          borderColor:
                            formData.type === 'multiple'
                              ? 'var(--color-500, #BF4040)'
                              : 'var(--color-border)',
                        }}
                      >
                        <div
                          className="w-5 h-5 rounded-[4px] border-2 flex items-center justify-center shrink-0 mt-0.5"
                          style={{
                            borderColor:
                              formData.type === 'multiple'
                                ? 'var(--color-500, #BF4040)'
                                : 'var(--color-muted)',
                            background:
                              formData.type === 'multiple'
                                ? 'var(--color-500, #BF4040)'
                                : 'transparent',
                          }}
                        >
                          {formData.type === 'multiple' && (
                            <Check size={12} className="text-white stroke-[3px]" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-xs" style={{ color: 'var(--color-text)' }}>
                            Multiple Choices (Add-ons)
                          </p>
                          <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-muted)' }}>
                            Customer can pick several add-ons (e.g. Extra Cheese, Bacon, Egg).
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Requirement Checkbox */}
                  <div className="pt-2">
                    <label
                      onClick={() => setField('is_required', !formData.is_required)}
                      className="flex items-start gap-3 cursor-pointer select-none group"
                    >
                      <div
                        className={`w-5 h-5 rounded-[5px] border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                          formData.is_required
                            ? 'bg-[var(--color-500,#BF4040)] border-[var(--color-500,#BF4040)] text-white shadow-2xs'
                            : 'border-slate-300 dark:border-slate-600 bg-transparent group-hover:border-[var(--color-500,#BF4040)]'
                        }`}
                      >
                        {formData.is_required && <Check size={12} strokeWidth={3} />}
                      </div>
                      <div>
                        <p className="font-bold text-xs" style={{ color: 'var(--color-text)' }}>
                          Mandatory / Required Selection
                        </p>
                        <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-muted)' }}>
                          When checked, an option must be chosen before adding the product to the order.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* ── TAB 2: Choices & Pricing ────────────────────── */}
              <div id="choices" className="space-y-2.5 scroll-mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    Choices & Prices
                  </h3>
                  <button
                    type="button"
                    onClick={addValueRow}
                    className="text-xs font-bold text-[var(--color-500,#BF4040)] hover:underline flex items-center gap-1"
                  >
                    <Plus size={14} /> Add Choice
                  </button>
                </div>

                <div
                  className="rounded-[5px] p-6 sm:p-7 space-y-6"
                  style={{
                    background: 'var(--color-surface)',
                  }}
                >
                  {/* Quick Presets */}
                  <div>
                    <span className="block text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-muted)' }}>
                      Quick Fill Presets
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          applyPreset('Cup Size', [
                            { name: 'Regular (12oz)', price: 0 },
                            { name: 'Large (16oz)', price: 0.75 },
                            { name: 'Jumbo (24oz)', price: 1.5 },
                          ], 'single')
                        }
                        className="px-2.5 py-1 rounded-[5px] border text-[11px] font-semibold transition-colors hover:border-[var(--color-500,#BF4040)]"
                        style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                      >
                        🥤 Cup Sizes (Reg / Lrg / Jumbo)
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          applyPreset('Sweetness Level', [
                            { name: '100% Regular Sugar', price: 0 },
                            { name: '70% Less Sugar', price: 0 },
                            { name: '50% Half Sugar', price: 0 },
                            { name: '0% No Sugar', price: 0 },
                          ], 'single')
                        }
                        className="px-2.5 py-1 rounded-[5px] border text-[11px] font-semibold transition-colors hover:border-[var(--color-500,#BF4040)]"
                        style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                      >
                        🍬 Sugar Level (0% to 100%)
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          applyPreset('Burger Add-ons', [
                            { name: 'Extra Cheddar Cheese', price: 1.0 },
                            { name: 'Crispy Bacon Strips', price: 1.5 },
                            { name: 'Fried Egg', price: 1.25 },
                            { name: 'Jalapeño Slices', price: 0.5 },
                          ], 'multiple')
                        }
                        className="px-2.5 py-1 rounded-[5px] border text-[11px] font-semibold transition-colors hover:border-[var(--color-500,#BF4040)]"
                        style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                      >
                        🍔 Food Toppings & Add-ons
                      </button>
                    </div>
                  </div>

                  {/* Values List */}
                  <div className="space-y-3">
                    {formData.values.map((val, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-[5px] border flex items-center gap-3 shadow-2xs transition-all"
                        style={{
                          background: 'var(--color-bg)',
                          borderColor: 'var(--color-border)',
                        }}
                      >
                        <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] text-[var(--color-muted)] shrink-0 select-none">
                          #{idx + 1}
                        </div>

                        {/* Name */}
                        <div className="flex-1">
                          <input
                            type="text"
                            required
                            value={val.name}
                            onChange={(e) => updateValueRow(idx, 'name', e.target.value)}
                            placeholder="e.g. Large Size, Extra Shot, Almond Milk"
                            className="w-full px-3.5 py-2 text-xs rounded-[5px] border outline-none font-semibold transition-colors"
                            style={{
                              background: 'var(--color-card)',
                              borderColor: 'var(--color-border)',
                              color: 'var(--color-text)',
                            }}
                          />
                        </div>

                        {/* Extra Price */}
                        <div
                          className="w-36 flex items-center gap-1.5 px-3 py-2 rounded-[5px] border"
                          style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
                        >
                          <span className="text-xs font-mono font-bold text-[var(--color-muted)]">+$</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={val.price === 0 ? '' : val.price}
                            onChange={(e) => updateValueRow(idx, 'price', e.target.value)}
                            placeholder="0.00"
                            className="w-full bg-transparent border-none outline-none text-xs font-mono font-bold text-[var(--color-text)]"
                          />
                        </div>

                        {/* Delete Row */}
                        <button
                          type="button"
                          onClick={() => removeValueRow(idx)}
                          className="w-8 h-8 rounded-[5px] flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          title="Remove Choice"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={addValueRow}
                    className="w-full py-2.5 rounded-[5px] border-2 border-dashed flex items-center justify-center gap-2 text-xs font-bold transition-colors hover:border-[var(--color-500,#BF4040)] hover:text-[var(--color-500,#BF4040)]"
                    style={{
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-muted)',
                      background: 'var(--color-bg)',
                    }}
                  >
                    <Plus size={14} /> Add Another Choice
                  </button>
                </div>
              </div>

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
                  <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                    Test and interact with this modifier group as it will behave during order customization.
                  </p>

                  <div
                    className="max-w-md mx-auto p-5 rounded-[5px] border shadow-xs space-y-4"
                    style={{
                      background: 'var(--color-card)',
                      borderColor: 'var(--color-border)',
                    }}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--color-border-subtle)' }}>
                      <div>
                        <h4 className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>
                          {formData.name || 'Option Group Name'}
                        </h4>
                        <p className="text-[11px]" style={{ color: 'var(--color-muted)' }}>
                          {formData.type === 'single' ? 'Select 1 option' : 'Select any add-ons'}
                        </p>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-[5px] border ${
                          formData.is_required
                            ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                            : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                        }`}
                      >
                        {formData.is_required ? 'Required' : 'Optional'}
                      </span>
                    </div>

                    {/* Choices simulation */}
                    <div className="space-y-2">
                      {formData.values.filter((v) => v.name.trim()).length > 0 ? (
                        formData.values
                          .filter((v) => v.name.trim())
                          .map((val, idx) => {
                            const isSelected = previewSelected.includes(val.name)
                            return (
                              <div
                                key={idx}
                                onClick={() => handlePreviewChoiceToggle(val.name)}
                                className={`p-3 rounded-[5px] border flex items-center justify-between cursor-pointer transition-all select-none ${
                                  isSelected
                                    ? 'border-[var(--color-500,#BF4040)] bg-[var(--color-500,#BF4040)]/5 shadow-2xs'
                                    : 'hover:bg-black/5 dark:hover:bg-white/5'
                                }`}
                                style={{
                                  borderColor: isSelected ? 'var(--color-500, #BF4040)' : 'var(--color-border)',
                                }}
                              >
                                <div className="flex items-center gap-2.5">
                                  {formData.type === 'single' ? (
                                    <div
                                      className="w-4 h-4 rounded-full border flex items-center justify-center"
                                      style={{
                                        borderColor: isSelected ? 'var(--color-500, #BF4040)' : 'var(--color-muted)',
                                      }}
                                    >
                                      {isSelected && (
                                        <div
                                          className="w-2 h-2 rounded-full"
                                          style={{ background: 'var(--color-500, #BF4040)' }}
                                        />
                                      )}
                                    </div>
                                  ) : (
                                    <div
                                      className="w-4 h-4 rounded-[3px] border flex items-center justify-center"
                                      style={{
                                        borderColor: isSelected ? 'var(--color-500, #BF4040)' : 'var(--color-muted)',
                                        background: isSelected ? 'var(--color-500, #BF4040)' : 'transparent',
                                      }}
                                    >
                                      {isSelected && <Check size={11} className="text-white stroke-[3px]" />}
                                    </div>
                                  )}
                                  <span className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>
                                    {val.name}
                                  </span>
                                </div>

                                <span className="text-xs font-mono font-bold" style={{ color: val.price > 0 ? 'var(--color-500, #BF4040)' : 'var(--color-muted)' }}>
                                  {val.price > 0 ? `+$${val.price.toFixed(2)}` : 'Free'}
                                </span>
                              </div>
                            )
                          })
                      ) : (
                        <p className="text-xs text-center py-4" style={{ color: 'var(--color-muted)' }}>
                          No choices defined yet. Add choices in the section above.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
