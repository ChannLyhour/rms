import { useState, useEffect, useMemo } from 'react'
import {
  X,
  Plus,
  Minus,
  ShoppingCart,
  Sparkles,
  Check,
  Flame,
  AlertCircle,
  MessageSquareQuote,
  Tag,
  Info,
  CheckCircle2,
  Utensils,
  Clock
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Modal } from '../../../components/common/ModalComponent'

const QUICK_NOTES = [
  '🌶️ Less Spicy',
  '🧊 Less Ice',
  '🚫 No Sugar',
  '🥛 Oat Milk',
  '🥡 Pack Separately',
  '⚠️ Allergy Alert',
  '🧀 Extra Sauce',
  '🔥 Extra Hot'
]

export default function DetailProductsModal({
  product,
  categoryName,
  isOpen,
  onClose,
  onAddToCart
}) {
  const [quantity, setQuantity] = useState(1)
  const [selectedSingleOptions, setSelectedSingleOptions] = useState({}) // { [groupId]: optionValue }
  const [selectedMultiOptions, setSelectedMultiOptions] = useState({}) // { [groupId]: [optionValue, ...] }
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [activeNotes, setActiveNotes] = useState([])

  // Reset / Pre-populate defaults when product changes
  useEffect(() => {
    if (!product) return

    setQuantity(1)
    setSpecialInstructions('')
    setActiveNotes([])

    const initialSingle = {}
    const initialMulti = {}

    if (product.option_groups && Array.isArray(product.option_groups)) {
      product.option_groups.forEach((group) => {
        if (!group.values || group.values.length === 0) return

        if (group.type === 'single') {
          // If required or default, select the first option or free option by default
          const defaultVal = group.values.find((v) => v.price === 0) || group.values[0]
          if (group.is_required && defaultVal) {
            initialSingle[group.id] = defaultVal
          }
        } else {
          initialMulti[group.id] = []
        }
      })
    }

    setSelectedSingleOptions(initialSingle)
    setSelectedMultiOptions(initialMulti)
  }, [product])

  if (!isOpen || !product) return null

  const basePrice = Number(product.price || 0)

  // Calculate Extra Option Price
  const singleOptionsExtra = Object.values(selectedSingleOptions).reduce(
    (acc, val) => acc + Number(val?.price || 0),
    0
  )

  const multiOptionsExtra = Object.values(selectedMultiOptions).reduce((acc, list) => {
    return acc + (list || []).reduce((sub, val) => sub + Number(val?.price || 0), 0)
  }, 0)

  const optionsExtraTotal = singleOptionsExtra + multiOptionsExtra
  const unitPrice = basePrice + optionsExtraTotal
  const totalPrice = unitPrice * quantity

  // Option Toggles
  const handleSelectSingle = (groupId, optionValue) => {
    setSelectedSingleOptions((prev) => ({
      ...prev,
      [groupId]: optionValue
    }))
  }

  const handleToggleMulti = (groupId, optionValue) => {
    setSelectedMultiOptions((prev) => {
      const currentList = prev[groupId] || []
      const exists = currentList.some((item) => item.id === optionValue.id)
      const nextList = exists
        ? currentList.filter((item) => item.id !== optionValue.id)
        : [...currentList, optionValue]

      return {
        ...prev,
        [groupId]: nextList
      }
    })
  }

  const toggleNote = (note) => {
    setActiveNotes((prev) => {
      const exists = prev.includes(note)
      const next = exists ? prev.filter((n) => n !== note) : [...prev, note]
      return next
    })
  }

  // Submit Handler
  const handleAdd = () => {
    // Validate required option groups
    if (product.option_groups && Array.isArray(product.option_groups)) {
      for (const group of product.option_groups) {
        if (group.is_required) {
          const hasSelection =
            group.type === 'single'
              ? !!selectedSingleOptions[group.id]
              : (selectedMultiOptions[group.id] || []).length > 0

          if (!hasSelection) {
            toast.error(`Please make a selection for "${group.name}"`)
            return
          }
        }
      }
    }

    // Flatten all selected options
    const allSelectedOptions = [
      ...Object.values(selectedSingleOptions).filter(Boolean),
      ...Object.values(selectedMultiOptions).flat().filter(Boolean)
    ]

    // Combined instructions
    const combinedNotes = [
      ...activeNotes,
      specialInstructions.trim()
    ].filter(Boolean).join(' • ')

    if (onAddToCart) {
      onAddToCart(product, quantity, allSelectedOptions, combinedNotes)
    }

    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      cols={2}
      size="4xl"
      title="Product Details & Customizers"
      icon={Utensils}
      iconBadgeColor="var(--color-500, #BF4040)"
      draggable={true}
      showDragHandle={true}
      footer={
        <>
          {/* Price Breakdown Preview */}
          <div>
            <span
              className="text-[10px] uppercase font-extrabold tracking-wider block"
              style={{ color: 'var(--color-muted)' }}
            >
              Order Total
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                ${totalPrice.toFixed(2)}
              </span>
              {quantity > 1 && (
                <span className="text-[11px] font-mono text-slate-400 font-medium">
                  (${unitPrice.toFixed(2)} × {quantity})
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors hover:opacity-80 cursor-pointer"
              style={{
                background: 'var(--color-card)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-secondary)',
              }}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleAdd}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black text-white shadow-lg transition-all hover:opacity-95 active:scale-95 cursor-pointer"
              style={{
                background:
                  'linear-gradient(135deg, var(--color-500, #BF4040), var(--color-600, #9D3434))',
                boxShadow: '0 4px 14px rgba(191, 64, 64, 0.35)',
              }}
            >
              <ShoppingCart size={15} strokeWidth={2.5} />
              <span>Add to Order • ${totalPrice.toFixed(2)}</span>
            </button>
          </div>
        </>
      }
    >
      {/* ══════════════════════════════════════════════════════════════════
          COLUMN 1: PRODUCT HERO PREVIEW & DETAILS (LEFT SIDE)
      ══════════════════════════════════════════════════════════════════ */}
      <div className="p-5 sm:p-6 flex flex-col justify-between space-y-5 overflow-y-auto">
        <div>
          {/* Image Box */}
          <div
            className="relative w-full h-56 sm:h-64 rounded-2xl overflow-hidden border shadow-xs bg-slate-900 shrink-0"
            style={{ borderColor: 'var(--color-border)' }}
          >
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-slate-400 gap-2">
                <span className="text-6xl">🍽️</span>
                <span className="text-xs font-bold uppercase tracking-wider opacity-60">
                  {product.name}
                </span>
              </div>
            )}

            {/* Floating Price Pill */}
            <div className="absolute bottom-3 right-3 px-3 py-1 rounded-lg font-extrabold text-sm font-mono text-white shadow-md backdrop-blur-md z-10 bg-black/70 border border-white/15">
              ${basePrice.toFixed(2)}
            </div>
          </div>

          {/* Product Header & Info */}
          <div className="mt-4 space-y-2">
            <h3
              className="text-lg sm:text-xl font-extrabold tracking-tight"
              style={{ color: 'var(--color-text)' }}
            >
              {product.name}
            </h3>

            {product.description ? (
              <p
                className="text-xs leading-relaxed"
                style={{ color: 'var(--color-muted)' }}
              >
                {product.description}
              </p>
            ) : (
              <p className="text-xs italic text-[var(--color-muted)]">
                Chef specialty prepared fresh on demand.
              </p>
            )}
          </div>
        </div>

        {/* Quick Highlights / Station Tag */}
        <div
          className="p-3 rounded-xl border flex items-center justify-between text-xs"
          style={{
            background: 'var(--color-bg)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-secondary)',
          }}
        >
          <span className="flex items-center gap-1.5 font-medium">
            <Clock size={14} className="text-[var(--color-muted)]" /> Prep time: ~10-15 mins
          </span>
          <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
            ${unitPrice.toFixed(2)} / unit
          </span>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          COLUMN 2: CUSTOMIZERS, NOTES & QUANTITY (RIGHT SIDE)
      ══════════════════════════════════════════════════════════════════ */}
      <div className="p-5 sm:p-6 space-y-6 overflow-y-auto h-full">
        {/* ── 1. Option Groups / Modifiers ── */}
        {product.option_groups && product.option_groups.length > 0 && (
          <div className="space-y-4">
            <div
              className="flex items-center justify-between border-b pb-1.5"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <h4
                className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5"
                style={{ color: 'var(--color-text)' }}
              >
                Add-ons and Options
              </h4>
              <span className="text-[10px] font-bold" style={{ color: 'var(--color-muted)' }}>
                {product.option_groups.length} {product.option_groups.length === 1 ? 'group' : 'groups'}
              </span>
            </div>

            {product.option_groups.map((group) => {
              const isSingle = group.type === 'single'
              const isRequired = group.is_required
              const hasValues = group.values && group.values.length > 0

              if (!hasValues) return null

              return (
                <div
                  key={group.id}
                  className="p-3.5 rounded-2xl border space-y-2.5 shadow-2xs"
                  style={{
                    background: 'var(--color-card)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>
                        {group.name}
                      </span>
                      {isRequired && (
                        <span className="text-[10px] font-extrabold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-md">
                          Required
                        </span>
                      )}
                    </div>
                    <span className="text-[10px]" style={{ color: 'var(--color-muted)' }}>
                      {isSingle ? 'Choose 1' : 'Multiple choices'}
                    </span>
                  </div>

                  {/* Choice Values Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {group.values.map((val) => {
                      const isSelected = isSingle
                        ? selectedSingleOptions[group.id]?.id === val.id
                        : (selectedMultiOptions[group.id] || []).some((item) => item.id === val.id)

                      const extra = Number(val.price || 0)

                      return (
                        <button
                          key={val.id}
                          type="button"
                          onClick={() => {
                            if (isSingle) {
                              handleSelectSingle(group.id, val)
                            } else {
                              handleToggleMulti(group.id, val)
                            }
                          }}
                          className={`p-2.5 rounded-xl border flex items-center justify-between text-left transition-all text-xs cursor-pointer ${
                            isSelected
                              ? 'border-[#BF4040] shadow-xs'
                              : 'hover:bg-black/5 dark:hover:bg-white/5'
                          }`}
                          style={{
                            background: isSelected ? 'rgba(191, 64, 64, 0.06)' : 'var(--color-bg)',
                            borderColor: isSelected ? 'var(--color-500, #BF4040)' : 'var(--color-border)',
                          }}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className={`w-4 h-4 rounded-${isSingle ? 'full' : '[4px]'} border flex items-center justify-center shrink-0 transition-all ${
                                isSelected
                                  ? 'bg-[#BF4040] border-[#BF4040] text-white shadow-2xs'
                                  : 'border-slate-300 dark:border-slate-600 bg-transparent'
                              }`}
                            >
                              {isSelected && (
                                isSingle ? (
                                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                ) : (
                                  <Check size={10} strokeWidth={3} />
                                )
                              )}
                            </div>
                            <span
                              className="font-semibold truncate text-[11px]"
                              style={{ color: isSelected ? 'var(--color-500, #BF4040)' : 'var(--color-text)' }}
                            >
                              {val.name}
                            </span>
                          </div>

                          <span
                            className="font-mono font-bold text-[10px] shrink-0"
                            style={{
                              color: extra > 0 ? 'var(--color-500, #BF4040)' : 'var(--color-muted)',
                            }}
                          >
                            {extra > 0 ? `+$${extra.toFixed(2)}` : 'Free'}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        

        {/* ── 3. Special Instructions ── */}
        <div className="space-y-1.5">
          <label
            className="block text-xs font-black uppercase tracking-wider"
            style={{ color: 'var(--color-muted)' }}
          >
            Custom Note
          </label>
          <textarea
            rows={2}
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            placeholder="e.g. "
            className="w-full p-3 rounded-xl border text-xs outline-none font-medium transition-colors resize-none"
            style={{
              background: 'var(--color-bg)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
          />
        </div>

        {/* ── 4. Quantity Stepper ── */}
        <div
          className="p-3.5 rounded-2xl border flex items-center justify-between shadow-2xs"
          style={{
            background: 'var(--color-card)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div>
            <span className="text-xs font-bold block" style={{ color: 'var(--color-text)' }}>
              Quantity
            </span>
            <span className="text-[10px]" style={{ color: 'var(--color-muted)' }}>
              Select serving portions
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Stepper Buttons */}
            <div
              className="flex items-center gap-1 rounded-xl p-1 border shadow-xs"
              style={{
                background: 'var(--color-bg)',
                borderColor: 'var(--color-border)',
              }}
            >
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                style={{ color: 'var(--color-text)' }}
              >
                <Minus size={13} strokeWidth={2.5} />
              </button>

              <span
                className="w-8 text-center text-sm font-black font-mono select-none"
                style={{ color: 'var(--color-text)' }}
              >
                {quantity}
              </span>

              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
                style={{ color: 'var(--color-text)' }}
              >
                <Plus size={13} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}