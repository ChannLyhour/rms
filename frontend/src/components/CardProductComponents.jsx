import React, { useState, useEffect, useMemo } from 'react'
import { Plus, Minus, Trash2, Check, MessageSquareQuote, Sparkles, X, Utensils } from 'lucide-react'
import { useCartStore } from '../store/useCartStore'
import { Modal } from './common/ModalComponent'
import toast from 'react-hot-toast'

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

/**
 * Modal to edit Modifiers, Add-ons & Notes for a Cart Item
 */
export function EditItemModifiersModal({
  isOpen,
  onClose,
  item,
  index,
  onSave
}) {
  const [selectedSingleOptions, setSelectedSingleOptions] = useState({})
  const [selectedMultiOptions, setSelectedMultiOptions] = useState({})
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [activeNotes, setActiveNotes] = useState([])

  const product = item?.product

  // Populate existing selections
  useEffect(() => {
    if (!item || !product) return

    setSpecialInstructions(item.specialInstructions || '')

    const currentOptions = item.options || []
    const initialSingle = {}
    const initialMulti = {}

    if (product.option_groups && Array.isArray(product.option_groups)) {
      product.option_groups.forEach((group) => {
        if (!group.values) return

        if (group.type === 'single') {
          // Find matching selected option in this group
          const match = group.values.find((v) =>
            currentOptions.some((co) => co.id === v.id || co.name === v.name)
          )
          if (match) {
            initialSingle[group.id] = match
          } else if (group.is_required && group.values.length > 0) {
            initialSingle[group.id] = group.values[0]
          }
        } else {
          // Find all matching multi options in this group
          const matches = group.values.filter((v) =>
            currentOptions.some((co) => co.id === v.id || co.name === v.name)
          )
          initialMulti[group.id] = matches
        }
      })
    }

    setSelectedSingleOptions(initialSingle)
    setSelectedMultiOptions(initialMulti)
  }, [item, product, isOpen])

  const basePrice = Number(product?.price || 0)

  // Calculate Extra Option Price (Hook called unconditionally)
  const extraOptionsPrice = useMemo(() => {
    let extra = 0
    Object.values(selectedSingleOptions).forEach((opt) => {
      if (opt && opt.price) extra += Number(opt.price)
    })
    Object.values(selectedMultiOptions).forEach((optArray) => {
      if (Array.isArray(optArray)) {
        optArray.forEach((opt) => {
          if (opt && opt.price) extra += Number(opt.price)
        })
      }
    })
    return extra
  }, [selectedSingleOptions, selectedMultiOptions])

  if (!isOpen || !item || !product) return null

  const unitPrice = basePrice + extraOptionsPrice
  const lineTotal = unitPrice * (item.quantity || 1)

  // Single option select
  const handleSelectSingle = (groupId, optionValue) => {
    setSelectedSingleOptions((prev) => ({
      ...prev,
      [groupId]: optionValue,
    }))
  }

  // Multi option toggle
  const handleToggleMulti = (groupId, optionValue) => {
    setSelectedMultiOptions((prev) => {
      const current = prev[groupId] || []
      const exists = current.some((v) => v.id === optionValue.id)
      if (exists) {
        return { ...prev, [groupId]: current.filter((v) => v.id !== optionValue.id) }
      } else {
        return { ...prev, [groupId]: [...current, optionValue] }
      }
    })
  }

  // Quick note chip toggle
  const toggleQuickNote = (note) => {
    setActiveNotes((prev) => {
      const exists = prev.includes(note)
      const nextNotes = exists ? prev.filter((n) => n !== note) : [...prev, note]
      const customPart = specialInstructions
        .split(' • ')
        .filter((part) => !QUICK_NOTES.includes(part))
        .join(' • ')
      const combined = [...nextNotes, customPart].filter(Boolean).join(' • ')
      setSpecialInstructions(combined)
      return nextNotes
    })
  }

  // Save changes
  const handleSave = () => {
    // Validate required single option groups
    if (product.option_groups && Array.isArray(product.option_groups)) {
      for (const group of product.option_groups) {
        if (group.is_required && group.type === 'single' && !selectedSingleOptions[group.id]) {
          toast.error(`Please select a ${group.name}`)
          return
        }
      }
    }

    const flatOptions = [
      ...Object.values(selectedSingleOptions).filter(Boolean),
      ...Object.values(selectedMultiOptions).flat().filter(Boolean),
    ]

    onSave?.(index, {
      ...item,
      options: flatOptions,
      specialInstructions,
    })

    toast.success(`Updated modifiers for ${product.name}`)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      cols={1}
      size="2xl"
      title={`Customize: ${product.name}`}
      subtitle={`Update modifiers, add-ons and chef instructions`}
      icon={Utensils}
      iconBadgeColor="var(--color-500, #BF4040)"
      showDragHandle={true}
      draggable={true}
      footer={
        <div className="w-full flex items-center justify-between gap-4">
          <div className="flex items-baseline gap-2">
            <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
              Item Total:
            </span>
            <span
              className="text-lg font-black font-mono"
              style={{ color: 'var(--color-500, #BF4040)' }}
            >
              ${lineTotal.toFixed(2)}
            </span>
            <span className="text-[11px] font-mono" style={{ color: 'var(--color-muted)' }}>
              (${unitPrice.toFixed(2)} ea)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border text-xs font-bold transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 cursor-pointer"
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
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl text-xs font-extrabold text-white shadow-md transition-all hover:opacity-90 active:scale-95 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, var(--color-500, #BF4040), var(--color-600, #9D3434))',
              }}
            >
              Save Modifiers
            </button>
          </div>
        </div>
      }
    >
      <div className="p-5 space-y-5">
        {/* Option Groups List */}
        {product.option_groups && product.option_groups.length > 0 ? (
          <div className="space-y-4">
            {product.option_groups.map((group) => {
              const isSingle = group.type === 'single'
              return (
                <div
                  key={group.id}
                  className="rounded-2xl border p-4 space-y-3"
                  style={{
                    background: 'var(--color-card)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-xs" style={{ color: 'var(--color-text)' }}>
                        {group.name}
                      </h4>
                      {group.is_required ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
                          Required
                        </span>
                      ) : (
                        <span
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full border"
                          style={{
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-muted)',
                          }}
                        >
                          Optional
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] font-mono" style={{ color: 'var(--color-muted)' }}>
                      {isSingle ? 'Choose 1' : 'Multiple choices allowed'}
                    </span>
                  </div>

                  {/* Options Values Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {group.values?.map((val) => {
                      const isSelected = isSingle
                        ? selectedSingleOptions[group.id]?.id === val.id
                        : (selectedMultiOptions[group.id] || []).some((v) => v.id === val.id)

                      return (
                        <button
                          key={val.id}
                          type="button"
                          onClick={() =>
                            isSingle
                              ? handleSelectSingle(group.id, val)
                              : handleToggleMulti(group.id, val)
                          }
                          className={`p-3 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[var(--color-500,#BF4040)] ring-1 ring-[var(--color-500,#BF4040)] shadow-2xs'
                              : 'hover:bg-black/5 dark:hover:bg-white/5'
                          }`}
                          style={{
                            background: isSelected
                              ? 'rgba(191, 64, 64, 0.05)'
                              : 'var(--color-bg)',
                            borderColor: isSelected
                              ? 'var(--color-500, #BF4040)'
                              : 'var(--color-border)',
                          }}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className={`w-4 h-4 rounded-${isSingle ? 'full' : 'md'} border flex items-center justify-center transition-all ${
                                isSelected
                                  ? 'bg-[var(--color-500,#BF4040)] border-[var(--color-500,#BF4040)] text-white'
                                  : 'border-slate-300 dark:border-slate-600'
                              }`}
                            >
                              {isSelected && <Check size={10} strokeWidth={3} />}
                            </div>
                            <span
                              className="text-xs font-bold truncate"
                              style={{
                                color: isSelected
                                  ? 'var(--color-500, #BF4040)'
                                  : 'var(--color-text)',
                              }}
                            >
                              {val.name}
                            </span>
                          </div>

                          <span
                            className="text-xs font-mono font-bold shrink-0 ml-2"
                            style={{
                              color:
                                val.price > 0
                                  ? 'var(--color-500, #BF4040)'
                                  : 'var(--color-muted)',
                            }}
                          >
                            {val.price > 0 ? `+$${Number(val.price).toFixed(2)}` : 'Free'}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div
            className="p-4 rounded-2xl border text-center text-xs"
            style={{
              background: 'var(--color-card)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-muted)',
            }}
          >
            This product has no preset modifier options. You can still add special instructions below.
          </div>
        )}

        {/* Special Instructions & Quick Notes */}
        <div
          className="rounded-2xl border p-4 space-y-3"
          style={{
            background: 'var(--color-card)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-center gap-2">
            <MessageSquareQuote size={15} className="text-[var(--color-500,#BF4040)]" />
            <h4 className="font-extrabold text-xs" style={{ color: 'var(--color-text)' }}>
              Chef & Kitchen Instructions
            </h4>
          </div>

          {/* Quick Note Presets */}
          <div className="flex flex-wrap gap-1.5">
            {QUICK_NOTES.map((qn) => {
              const isActive = specialInstructions.includes(qn)
              return (
                <button
                  key={qn}
                  type="button"
                  onClick={() => toggleQuickNote(qn)}
                  className={`text-[10px] px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[var(--color-500,#BF4040)] text-white border-[var(--color-500,#BF4040)] shadow-2xs'
                      : 'hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                  style={
                    !isActive
                      ? {
                          background: 'var(--color-bg)',
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-text-secondary)',
                        }
                      : {}
                  }
                >
                  {qn}
                </button>
              )
            })}
          </div>

          <textarea
            rows={2}
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            placeholder="Type extra notes (e.g. sauce on the side, well done, allergy alert)..."
            className="w-full px-3 py-2 rounded-xl text-xs border outline-none resize-none leading-relaxed"
            style={{
              background: 'var(--color-bg)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
          />
        </div>
      </div>
    </Modal>
  )
}

/**
 * 1. Checkout / Cart Order Item Card (ROS / Untitled UI Design)
 *
 * Features:
 * - Left image thumbnail with fallback monogram
 * - Title & selected options/modifiers tags
 * - Right vertical divider pricing column ($unit x qty / $total)
 * - Bottom action bar: [- Qty +] stepper + "Modifiers", "Edit/Note" & "Remove" text buttons
 */
export function ProductCheckoutCard({
  item,
  index,
  onUpdateQuantity,
  onUpdateItem,
  onRemove,
  onEditNote,
}) {
  const [showModifiersModal, setShowModifiersModal] = useState(false)
  const isItemPaid = item.payment_status === 'paid' || item.is_paid

  const rawStatus = String(item.item_status || item.status || item.order_status || '').toLowerCase()
  const isCooking = ['cooking', 'preparing', 'in_progress'].includes(rawStatus)
  const isReady = ['ready', 'served', 'completed', 'finished'].includes(rawStatus)
  const isSentToKitchen = isCooking || isReady || (Boolean(item.order_id) && rawStatus !== 'draft')

  const itemPrice =
    (item.product?.price || 0) +
    (item.options || []).reduce((o, ov) => o + (ov.price || 0), 0)
  const lineTotal = itemPrice * item.quantity

  return (
    <>
      <div
        className={`rounded-xl border transition-all duration-150 shadow-2xs hover:shadow-xs flex flex-col overflow-hidden ${
          isItemPaid ? 'opacity-70 bg-black/5 dark:bg-white/5' : isSentToKitchen ? 'bg-slate-50/50 dark:bg-zinc-900/40' : ''
        }`}
        style={{
          background: isItemPaid ? undefined : isSentToKitchen ? undefined : 'var(--color-card)',
          borderColor: isCooking ? '#f59e0b40' : isReady ? '#10b98140' : 'var(--color-border)',
        }}
      >
        {/* ── Top Section: Thumbnail | Name & Options | Pricing Column ── */}
        <div className="flex items-stretch gap-3 p-3">
          {/* Image Thumbnail */}
          <div className="relative shrink-0">
            {item.product?.image_url ? (
              <img
                src={item.product.image_url}
                alt={item.product?.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover border p-0.5 shadow-2xs"
                style={{
                  borderColor: 'var(--color-border)',
                  background: 'var(--color-bg)',
                }}
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            ) : (
              <div
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg flex items-center justify-center font-black text-sm border shadow-2xs"
                style={{
                  background: 'var(--color-bg)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-500, #BF4040)',
                }}
              >
                {item.product?.name?.slice(0, 2).toUpperCase() || 'IT'}
              </div>
            )}
          </div>

          {/* Product Name & Modifiers */}
          <div className="flex-1 min-w-0 flex flex-col justify-start py-0.5">
            <div className="flex items-center gap-2">
              <h4
                className={`font-bold text-sm sm:text-base leading-snug truncate ${isItemPaid ? 'line-through text-slate-500' : ''}`}
                style={{ color: isItemPaid ? undefined : 'var(--color-text)' }}
                title={item.product?.name}
              >
                {item.product?.name}
              </h4>
              {isItemPaid ? (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-[5px] badge-paid shrink-0">
                  Paid
                </span>
              ) : isCooking ? (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-[5px] bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 shrink-0">
                  👨‍🍳 Cooking
                </span>
              ) : isReady ? (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-[5px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shrink-0">
                  🍽️ Ready
                </span>
              ) : isSentToKitchen ? (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-[5px] bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-500/30 shrink-0">
                  ⏳ In Kitchen
                </span>
              ) : null}
            </div>

            {/* Modifiers / Options Summary */}
            {item.options && item.options.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {item.options.map((opt, oIdx) => (
                  <span
                    key={oIdx}
                    className="text-[10px] px-2 py-0.5 rounded-md border font-semibold leading-tight shadow-2xs"
                    style={{
                      background: 'var(--color-bg)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    +{opt.name} {opt.price > 0 && `($${Number(opt.price).toFixed(2)})`}
                  </span>
                ))}
              </div>
            )}

            {/* Prep / Chef Note */}
            {item.specialInstructions && (
              <p
                className="text-[11px] mt-1.5 italic font-medium truncate"
                style={{ color: 'var(--color-muted)' }}
              >
                Note: {item.specialInstructions}
              </p>
            )}
          </div>

          {/* Right Pricing Column with Divider */}
          <div
            className="border-l pl-3.5 pr-1 flex flex-col justify-center text-right shrink-0 min-w-[90px] sm:min-w-[105px]"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <div
              className={`text-xs font-mono font-semibold pb-1 border-b ${isItemPaid ? 'line-through text-slate-400' : ''}`}
              style={{
                borderColor: 'var(--color-border-subtle, var(--color-border))',
                color: isItemPaid ? undefined : 'var(--color-muted)',
              }}
            >
              ${itemPrice.toFixed(2)} x {item.quantity}
            </div>
            <div
              className={`text-base sm:text-lg font-black font-mono pt-1 ${isItemPaid ? 'line-through text-slate-400' : ''}`}
              style={{ color: isItemPaid ? undefined : 'var(--color-text)' }}
            >
              ${lineTotal.toFixed(2)}
            </div>
          </div>
        </div>

        {/* ── Bottom Bar: Stepper Controls & Action Links ── */}
        <div
          className="border-t flex items-center justify-between px-3 py-1.5 text-xs"
          style={{
            background: 'var(--color-bg)',
            borderColor: 'var(--color-border)',
          }}
        >
          {isItemPaid ? (
            <div className="w-full flex items-center justify-between py-1 text-emerald-600 font-bold text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Ticket Already Settled & Paid</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400 font-normal">No action needed</span>
            </div>
          ) : isSentToKitchen ? (
            <div className="w-full flex items-center justify-between py-1 text-xs">
              <span className={`flex items-center gap-1.5 font-bold ${
                isReady ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isReady ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                <span>{isReady ? '🍽️ Food Ready / Served (Locked)' : '👨‍🍳 Kitchen Cooking (Cannot Edit)'}</span>
              </span>
              <span className="text-[10px] font-mono text-[var(--color-muted)] font-semibold">
                {item.order_number ? `#${item.order_number}` : 'Sent to Kitchen'}
              </span>
            </div>
          ) : (
            <>
              {/* Stepper: - 1 + */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onUpdateQuantity?.(index, item.quantity - 1)}
                  className="w-7 h-7 rounded-md flex items-center justify-center font-bold transition-all hover:bg-black/5 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                  style={{ color: 'var(--color-text)' }}
                  title="Decrease quantity"
                >
                  <Minus size={13} strokeWidth={2.5} />
                </button>

                <span
                  className="w-7 text-center font-black font-mono text-xs select-none"
                  style={{ color: 'var(--color-text)' }}
                >
                  {item.quantity}
                </span>

                <button
                  type="button"
                  onClick={() => onUpdateQuantity?.(index, item.quantity + 1)}
                  className="w-7 h-7 rounded-md flex items-center justify-center font-bold transition-all hover:bg-black/5 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                  style={{ color: 'var(--color-text)' }}
                  title="Increase quantity"
                >
                  <Plus size={13} strokeWidth={2.5} />
                </button>
              </div>

              {/* Action Links: Modifiers | Edit/Note | Remove */}
              <div className="flex items-center gap-3 font-semibold text-xs">
                <button
                  type="button"
                  onClick={() => setShowModifiersModal(true)}
                  className="text-blue-600 hover:text-blue-700 hover:underline cursor-pointer transition-colors"
                >
                  Modifiers
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onEditNote) {
                      onEditNote(index, item)
                    } else {
                      setShowModifiersModal(true)
                    }
                  }}
                  className="text-blue-600 hover:text-blue-700 hover:underline cursor-pointer transition-colors"
                >
                  Edit/Note
                </button>

                <button
                  type="button"
                  onClick={() => onRemove?.(index, item)}
                  className="text-red-600 hover:text-red-700 hover:underline font-bold cursor-pointer transition-colors"
                >
                  Remove
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Edit Modifiers & Add-ons Modal ── */}
      <EditItemModifiersModal
        isOpen={showModifiersModal}
        onClose={() => setShowModifiersModal(false)}
        item={item}
        index={index}
        onSave={(idx, updatedData) => {
          onUpdateItem?.(idx, updatedData)
        }}
      />
    </>
  )
}

/**
 * 2. POS Catalog Menu Grid Card
 */
export function ProductGridCard({
  product,
  categoryName,
  emoji = '🍽️',
  onSelect,
}) {
  const [imgError, setImgError] = useState(!product.image_url)
  const cartItems = useCartStore((state) => state.items)
  const cartCount = cartItems
    .filter((i) => i.product?.id === product.id)
    .reduce((sum, i) => sum + i.quantity, 0)
  const isInCart = cartCount > 0

  return (
    <div
      onClick={() => onSelect(product)}
      className={`menu-item-card group rounded-[8px] border transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md cursor-pointer overflow-hidden flex flex-col justify-between select-none shadow-xs min-h-[180px] h-full ${
        isInCart
          ? 'border-[var(--color-500,#BF4040)] ring-1 ring-[var(--color-500,#BF4040)] shadow-sm'
          : 'hover:border-[var(--color-500,#BF4040)]'
      }`}
      style={{
        background: 'var(--color-card)',
        borderColor: isInCart ? 'var(--color-500, #BF4040)' : 'var(--color-border)',
      }}
    >
      {/* Product Image Banner */}
      <div
        className="w-full h-28 sm:h-32 relative overflow-hidden shrink-0 flex items-center justify-center"
        style={{ background: 'var(--color-bg)' }}
      >
        {!imgError && product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2 text-center bg-slate-100 dark:bg-slate-800/60">
            <span className="text-3xl filter drop-shadow-sm">{emoji}</span>
            <span
              className="text-[10px] font-extrabold uppercase tracking-wider opacity-60 truncate max-w-full px-1"
              style={{ color: 'var(--color-muted)' }}
            >
              {product.name}
            </span>
          </div>
        )}

        {/* Top-Left Active In-Cart Badge */}
        {isInCart && (
          <div
            className="absolute top-2 left-2 px-2 py-0.5 rounded-md font-bold text-[10px] font-mono text-white shadow-md backdrop-blur-md z-10 flex items-center gap-1 animate-in zoom-in-75 duration-150"
            style={{
              background: 'linear-gradient(135deg, var(--color-500, #BF4040), var(--color-600, #9D3434))',
            }}
          >
            <span>{cartCount} in cart</span>
          </div>
        )}

        {/* Floating Price Pill */}
        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md font-extrabold text-[11px] font-mono text-white shadow-sm backdrop-blur-md z-10 bg-black/70 border border-white/15">
          ${Number(product.price || 0).toFixed(2)}
        </div>
      </div>

      {/* Card Content & Plus Icon */}
      <div
        className="p-2.5 sm:p-3 flex items-center justify-between gap-2 border-t shrink-0 flex-1"
        style={{
          background: 'var(--color-card)',
          borderColor: isInCart ? 'rgba(191, 64, 64, 0.2)' : 'var(--color-border)',
        }}
      >
        <div className="overflow-hidden min-w-0 flex-1">
          <h6
            className={`font-bold text-xs truncate leading-snug mb-0.5 transition-colors ${
              isInCart ? 'text-[var(--color-500,#BF4040)]' : 'group-hover:text-[var(--color-500,#BF4040)]'
            }`}
            style={{ color: isInCart ? 'var(--color-500, #BF4040)' : 'var(--color-text)' }}
            title={product.name}
          >
            {product.name}
          </h6>
          <p className="text-[11px] truncate leading-tight" style={{ color: 'var(--color-muted)' }}>
            {categoryName}
          </p>
        </div>

        <div
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-[6px] flex items-center justify-center font-bold shadow-xs shrink-0 transition-all group-hover:scale-110 active:scale-95 border ${
            isInCart
              ? 'text-white border-transparent shadow-md scale-105'
              : 'border-[var(--color-border)] group-hover:border-[var(--color-500,#BF4040)]'
          }`}
          style={
            isInCart
              ? {
                  background: 'linear-gradient(135deg, var(--color-500, #BF4040), var(--color-600, #9D3434))',
                  color: '#ffffff',
                }
              : {
                  background: 'var(--color-bg)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                }
          }
          title={isInCart ? `${cartCount} in cart` : 'Customize & Add'}
        >
          <Plus size={15} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  )
}

export default {
  ProductCheckoutCard,
  ProductGridCard,
  EditItemModifiersModal,
}
