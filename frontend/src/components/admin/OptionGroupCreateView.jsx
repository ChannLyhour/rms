import { useState, useEffect, useRef, useMemo } from 'react'
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
  Layers,
  Building2
} from 'lucide-react'
import toast from 'react-hot-toast'
import axiosClient from '../../api/axiosClient'
import { Button } from '../common/ButtonComponent'
import { SearchSelection } from '../plugin/components/Search-Selection-components'

export default function OptionGroupCreateView({ item, onClose, onSave }) {
  const [outlets, setOutlets] = useState([])
  const [formData, setFormData] = useState({
    outlet_id: '',
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
    axiosClient.get('/outlets').then((res) => setOutlets(res.data?.data || [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (item) {
      setFormData({
        outlet_id: item.outlet_id ? String(item.outlet_id) : '',
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
        outlet_id: '',
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

  // Outlet / Venue options with badges for SearchSelection
  const outletOptions = useMemo(() => {
    const list = [
      {
        value: '',
        id: '',
        label: '🏢 All Venues (Global / Shared)',
        name: '🏢 All Venues (Global / Shared)',
        badge: 'ALL',
        description: 'Available across all SKYPARK venues and products',
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
      outlet_id: formData.outlet_id ? Number(formData.outlet_id) : null,
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
    { id: 'venue', label: 'Venue & Outlet' },
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
          Cancel &amp; Return
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
                      Assigned Venue / Modifier Scope
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
                      Assigning a venue limits this option group to menu items and POS stations of that specific venue.
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
                  {/* Preset Quick Loader */}
                  <div>
                    <span className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-muted)' }}>
                      Quick Load Common Presets
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        {
                          name: 'Drink Size',
                          type: 'single',
                          values: [
                            { name: 'Small (Regular)', price: 0 },
                            { name: 'Medium (+12oz)', price: 0.5 },
                            { name: 'Large (+20oz)', price: 1.0 },
                          ],
                        },
                        {
                          name: 'Sugar / Sweetness Level',
                          type: 'single',
                          values: [
                            { name: '100% Normal Sweet', price: 0 },
                            { name: '70% Less Sweet', price: 0 },
                            { name: '50% Half Sweet', price: 0 },
                            { name: '0% No Sugar', price: 0 },
                          ],
                        },
                        {
                          name: 'Ice Level',
                          type: 'single',
                          values: [
                            { name: 'Normal Ice (100%)', price: 0 },
                            { name: 'Less Ice (50%)', price: 0 },
                            { name: 'No Ice', price: 0 },
                          ],
                        },
                        {
                          name: 'Coffee Add-ons & Toppings',
                          type: 'multiple',
                          values: [
                            { name: 'Extra Espresso Shot', price: 0.75 },
                            { name: 'Boba Pearls', price: 0.5 },
                            { name: 'Caramel Drizzle', price: 0.4 },
                            { name: 'Oat Milk Sub', price: 0.8 },
                          ],
                        },
                      ].map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => applyPreset(preset.name, preset.values, preset.type)}
                          className="px-2.5 py-1 rounded-[5px] border text-xs font-semibold hover:border-[var(--color-500,#BF4040)] hover:text-[var(--color-500,#BF4040)] transition-all cursor-pointer shadow-2xs"
                          style={{
                            background: 'var(--color-bg)',
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-text)',
                          }}
                        >
                          ⚡ {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Option Group Name */}
                  <div>
                    <label
                      className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                      style={{ color: 'var(--color-muted)' }}
                    >
                      Option Group Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setField('name', e.target.value)}
                      placeholder="e.g. Drink Size, Extra Toppings, Cooking Temperature"
                      className="w-full px-4 py-2.5 text-xs rounded-[5px] border outline-none font-bold transition-all"
                      style={{
                        background: 'var(--color-bg)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text)',
                      }}
                    />
                  </div>

                  {/* Selection Type & Required Rule */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
                    <div>
                      <label
                        className="block text-xs font-bold uppercase tracking-wider mb-2"
                        style={{ color: 'var(--color-muted)' }}
                      >
                        Selection Rule Type
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setField('type', 'single')}
                          className={`p-3 rounded-[5px] border flex flex-col items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                            formData.type === 'single'
                              ? 'border-[var(--color-500,#BF4040)] bg-[var(--color-500,#BF4040)]/10 text-[var(--color-500,#BF4040)]'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          <CircleDot size={18} />
                          <span>Single Choice</span>
                          <span className="text-[10px] font-normal opacity-70">(Radio Button)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setField('type', 'multiple')}
                          className={`p-3 rounded-[5px] border flex flex-col items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                            formData.type === 'multiple'
                              ? 'border-[var(--color-500,#BF4040)] bg-[var(--color-500,#BF4040)]/10 text-[var(--color-500,#BF4040)]'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          <CheckSquare size={18} />
                          <span>Multiple Choice</span>
                          <span className="text-[10px] font-normal opacity-70">(Checkboxes)</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col justify-center pt-2 sm:pt-0">
                      <label className="flex items-center gap-2.5 cursor-pointer p-3 rounded-[5px] border" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}>
                        <input
                          type="checkbox"
                          checked={formData.is_required}
                          onChange={(e) => setField('is_required', e.target.checked)}
                          className="w-4 h-4 rounded-[4px] accent-[var(--color-500,#BF4040)]"
                        />
                        <div>
                          <span className="text-xs font-bold block" style={{ color: 'var(--color-text)' }}>
                            Mandatory / Required
                          </span>
                          <span className="text-[11px] block" style={{ color: 'var(--color-muted)' }}>
                            Customer/Cashier must select at least 1 option before adding to cart.
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── TAB 2: Modifier Choices ──────────────────────────── */}
              <div id="choices" className="space-y-2.5 scroll-mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    Modifier Choices &amp; Add-on Values ({validChoicesCount})
                  </h3>
                  <button
                    type="button"
                    onClick={addValueRow}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-white px-3 py-1.5 rounded-[5px] shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                    style={{
                      background: 'linear-gradient(135deg, var(--color-500, #BF4040), var(--color-600, #9D3434))',
                    }}
                  >
                    <Plus size={13} />
                    <span>Add Choice Option</span>
                  </button>
                </div>

                <div
                  className="rounded-[5px] p-6 sm:p-7 space-y-3"
                  style={{
                    background: 'var(--color-surface)',
                  }}
                >
                  <div className="space-y-2.5">
                    {formData.values.map((val, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 sm:gap-3 p-2 rounded-[5px] border shadow-2xs"
                        style={{
                          background: 'var(--color-bg)',
                          borderColor: 'var(--color-border)',
                        }}
                      >
                        <span className="w-5 text-center font-mono text-[11px] text-slate-400 font-bold shrink-0">
                          {idx + 1}.
                        </span>

                        <input
                          type="text"
                          required
                          value={val.name}
                          onChange={(e) => updateValueRow(idx, 'name', e.target.value)}
                          placeholder="e.g. Regular, Medium, Large, Extra Cheese"
                          className="flex-1 px-3 py-2 text-xs rounded-[4px] border outline-none font-medium"
                          style={{
                            background: 'var(--color-card)',
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-text)',
                          }}
                        />

                        <div className="flex items-center gap-1 shrink-0 w-28 sm:w-32">
                          <span className="text-xs font-bold text-slate-400">$</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={val.price}
                            onChange={(e) => updateValueRow(idx, 'price', e.target.value)}
                            placeholder="0.00"
                            className="w-full px-2.5 py-2 text-xs rounded-[4px] border outline-none font-mono text-right"
                            style={{
                              background: 'var(--color-card)',
                              borderColor: 'var(--color-border)',
                              color: 'var(--color-text)',
                            }}
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => removeValueRow(idx)}
                          className="p-2 rounded-[4px] text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer shrink-0"
                          title="Remove option"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={addValueRow}
                    className="w-full py-2.5 mt-2 border-2 border-dashed rounded-[5px] text-xs font-bold text-slate-500 dark:text-slate-400 hover:border-[var(--color-500,#BF4040)] hover:text-[var(--color-500,#BF4040)] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <Plus size={13} />
                    <span>+ Add Another Option Choice</span>
                  </button>
                </div>
              </div>

              {/* ── TAB 3: Interactive POS Preview ──────────────────── */}
              <div id="preview" className="space-y-2.5 scroll-mt-6">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  POS &amp; Customer Menu Preview
                </h3>
                <div
                  className="rounded-[5px] p-6 sm:p-7 flex items-center justify-center"
                  style={{
                    background: 'var(--color-surface)',
                  }}
                >
                  <div
                    className="w-full max-w-md rounded-[6px] border p-5 shadow-sm space-y-4"
                    style={{
                      background: 'var(--color-card)',
                      borderColor: 'var(--color-border)',
                    }}
                  >
                    <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--color-border)' }}>
                      <div>
                        <h4 className="font-extrabold text-sm" style={{ color: 'var(--color-text)' }}>
                          {formData.name || 'Modifier Group Name'}
                        </h4>
                        <span className="text-[11px]" style={{ color: 'var(--color-muted)' }}>
                          {formData.type === 'single' ? 'Select 1 option' : 'Select any options'}
                        </span>
                      </div>
                      {formData.is_required && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-500 text-white uppercase">
                          Required
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      {formData.values.filter((v) => v.name.trim()).map((val, idx) => {
                        const isChecked = previewSelected.includes(val.name)
                        return (
                          <div
                            key={idx}
                            onClick={() => handlePreviewChoiceToggle(val.name)}
                            className={`flex items-center justify-between p-3 rounded-[5px] border text-xs cursor-pointer transition-all ${
                              isChecked
                                ? 'border-[var(--color-500,#BF4040)] bg-[var(--color-500,#BF4040)]/5 font-bold'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              {formData.type === 'single' ? (
                                <div
                                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                    isChecked
                                      ? 'border-[var(--color-500,#BF4040)] bg-[var(--color-500,#BF4040)]'
                                      : 'border-slate-300 dark:border-slate-700'
                                  }`}
                                >
                                  {isChecked && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </div>
                              ) : (
                                <div
                                  className={`w-4 h-4 rounded border flex items-center justify-center ${
                                    isChecked
                                      ? 'border-[var(--color-500,#BF4040)] bg-[var(--color-500,#BF4040)]'
                                      : 'border-slate-300 dark:border-slate-700'
                                  }`}
                                >
                                  {isChecked && <Check size={11} className="text-white stroke-[3px]" />}
                                </div>
                              )}
                              <span style={{ color: 'var(--color-text)' }}>{val.name}</span>
                            </div>

                            <span
                              className="font-mono text-[11px] font-bold"
                              style={{ color: 'var(--color-500, #BF4040)' }}
                            >
                              {val.price > 0 ? `+$${val.price.toFixed(2)}` : 'Free'}
                            </span>
                          </div>
                        )
                      })}
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
