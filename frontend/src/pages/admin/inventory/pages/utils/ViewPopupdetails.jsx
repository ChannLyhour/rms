import { useEffect, useMemo, useCallback } from 'react'
import {
  X,
  Package,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
  Truck,
  FileText,
  Layers,
  ShieldCheck,
  Scale,
  ArrowDownUp,
  Clock,
  Building2,
  Tag,
  AlertOctagon,
  TrendingDown,
  Warehouse,
  ExternalLink,
  Edit3,
} from 'lucide-react'

/**
 * ViewPopupdetails
 * Multi-purpose Detail Modal for any inventory item:
 * - Ingredient / Raw Material
 * - Purchase Order
 * - Supplier
 * - Recipe
 * - Stock Movement Log
 * - Wastage Record
 *
 * @param {Object} item - The data item to view
 * @param {string} [type] - 'ingredient' | 'purchase_order' | 'supplier' | 'recipe' | 'log' | 'waste'
 * @param {boolean} [isOpen=true] - Modal visibility flag
 * @param {Function} onClose - Close callback
 * @param {Function} [onEdit] - Optional edit callback
 * @param {Function} [onAdjust] - Optional adjust stock callback (for ingredients)
 */
export default function ViewPopupdetails({
  item,
  type,
  isOpen = true,
  onClose,
  onEdit,
  onAdjust,
}) {
  // ESC key listener to close modal
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Click-outside handler
  const handleBackdropClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) {
        onClose?.()
      }
    },
    [onClose]
  )

  // Automatically determine type if not explicitly provided
  const resolvedType = useMemo(() => {
    if (type) return type.toLowerCase()
    if (!item) return 'ingredient'
    if (item.po_number || (item.supplier_id && item.total_cost !== undefined)) return 'purchase_order'
    if (item.contact_name || (item.email && item.phone && !item.unit)) return 'supplier'
    if (item.quantity_required !== undefined) return 'recipe'
    if (item.waste_type || (item.reason && item.cost_impact !== undefined)) return 'waste'
    if (item.quantity_after !== undefined || item.type === 'adjustment') return 'log'
    return 'ingredient'
  }, [item, type])

  if (!isOpen || !item) return null

  // Date formatting helper
  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return String(dateStr)
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return String(dateStr)
    }
  }

  // Type metadata (Title, Accent colors, Icon)
  const meta = {
    ingredient: {
      category: 'Raw Material / Ingredient',
      color: '#126973',
      accentBg: 'rgba(18, 105, 115, 0.06)',
      accentBorder: 'rgba(18, 105, 115, 0.15)',
      icon: <Package size={16} className="text-[#126973] dark:text-[#F1D8C2]" />,
    },
    purchase_order: {
      category: 'Purchase Order',
      color: '#2563EB',
      accentBg: 'rgba(37, 99, 235, 0.06)',
      accentBorder: 'rgba(37, 99, 235, 0.15)',
      icon: <Truck size={16} className="text-blue-600 dark:text-blue-400" />,
    },
    supplier: {
      category: 'Supplier Profile',
      color: '#0D9488',
      accentBg: 'rgba(13, 148, 136, 0.06)',
      accentBorder: 'rgba(13, 148, 136, 0.15)',
      icon: <Building2 size={16} className="text-teal-600 dark:text-teal-400" />,
    },
    recipe: {
      category: 'Recipe Specification',
      color: '#7C3AED',
      accentBg: 'rgba(124, 58, 237, 0.06)',
      accentBorder: 'rgba(124, 58, 237, 0.15)',
      icon: <Layers size={16} className="text-violet-600 dark:text-violet-400" />,
    },
    log: {
      category: 'Stock Movement Audit',
      color: '#D97706',
      accentBg: 'rgba(217, 119, 6, 0.06)',
      accentBorder: 'rgba(217, 119, 6, 0.15)',
      icon: <ArrowDownUp size={16} className="text-amber-600 dark:text-amber-400" />,
    },
    waste: {
      category: 'Wastage & Spoilage Record',
      color: '#E11D48',
      accentBg: 'rgba(225, 29, 72, 0.06)',
      accentBorder: 'rgba(225, 29, 72, 0.15)',
      icon: <AlertOctagon size={16} className="text-rose-600 dark:text-rose-400" />,
    },
  }[resolvedType] || {
    category: 'Inventory Detail',
    color: '#126973',
    accentBg: 'rgba(18, 105, 115, 0.06)',
    accentBorder: 'rgba(18, 105, 115, 0.15)',
    icon: <Package size={16} />,
  }

  // ── Shared Section Label ─────────────────────────────────────────────
  const SectionLabel = ({ children }) => (
    <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[var(--color-muted)] mb-2 flex items-center gap-2">
      <span
        className="w-4 h-[1.5px] rounded-full"
        style={{ background: meta.color, opacity: 0.5 }}
      />
      {children}
    </p>
  )

  // ── Shared Attribute Row ─────────────────────────────────────────────
  const AttrRow = ({ icon, label, children, isEven }) => (
    <div
      className="px-3.5 py-2.5 flex items-center justify-between gap-3 transition-colors"
      style={{
        background: isEven ? 'var(--color-surface)' : 'transparent',
      }}
    >
      <span className="text-[var(--color-muted)] flex items-center gap-2 text-xs shrink-0">
        {icon}
        <span>{label}</span>
      </span>
      <span className="text-xs text-right min-w-0">{children}</span>
    </div>
  )

  // ── Render Ingredient Details (Col 1: Image, Col 2: Details) ────────
  const renderIngredient = (ing) => {
    const stockQty = Number(ing.stock_quantity) || 0
    const threshold = Number(ing.low_stock_threshold) || 5
    const costUnit = Number(ing.cost_per_unit) || 0
    const totalVal = stockQty * costUnit
    const isOutOfStock = stockQty <= 0
    const isLowStock = !isOutOfStock && stockQty <= threshold
    return (
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* ── COL 1: Image Showcase ── */}
        <div className="md:col-span-5 flex flex-col">
          {/* Main Product Image Card */}
          <div
            className="relative w-full aspect-square rounded-2xl overflow-hidden border border-[var(--color-border)] flex items-center justify-center group/preview p-3 transition-all"
            style={{
              background: 'radial-gradient(circle at center, var(--color-surface) 0%, var(--color-card) 100%)',
              boxShadow: '0 8px 24px -6px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.03)',
            }}
          >
            {ing.image_url ? (
              <img
                src={ing.image_url}
                alt={ing.name}
                className="w-full h-full object-contain group-hover/preview:scale-105 transition-transform duration-300 drop-shadow-sm select-none"
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#126973]/5 via-teal-500/5 to-transparent">
                <div className="w-20 h-20 rounded-2xl bg-[#126973]/10 dark:bg-[#126973]/20 flex items-center justify-center text-3xl font-extrabold text-[#126973] dark:text-[#F1D8C2] mb-2 shadow-xs">
                  {ing.name?.charAt(0).toUpperCase() || 'I'}
                </div>
                <span className="text-xs font-semibold text-[var(--color-muted)]">
                  No image provided
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── COL 2: Details ── */}
        <div className="md:col-span-7 space-y-4">
          {/* Header Title */}
          <div>
            <h2 className="text-xl font-extrabold text-[var(--color-text)] leading-snug tracking-tight">
              {ing.name}
            </h2>
          </div>

          {/* 4-Stat Metric Cards (2 Columns) */}
          <div className="grid grid-cols-2 gap-2.5">
            {[
              {
                label: 'Current Stock',
                value: `${stockQty.toFixed(2)}`,
                suffix: ing.unit,
                color: isOutOfStock ? 'text-rose-500' : isLowStock ? 'text-amber-500' : 'text-emerald-500',
              },
              {
                label: 'Unit Cost',
                value: `$${costUnit.toFixed(2)}`,
                color: 'text-[var(--color-text)]',
              },
              {
                label: 'Total Value',
                value: `$${totalVal.toFixed(2)}`,
                color: 'text-emerald-600 dark:text-emerald-400',
              },
              {
                label: 'Low Threshold',
                value: `${threshold.toFixed(2)}`,
                suffix: ing.unit,
                color: 'text-slate-600 dark:text-slate-300',
              },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-[var(--color-card)] relative overflow-hidden border border-[var(--color-border)]/60"
                style={{ boxShadow: '0 8px 16px -4px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.02)' }}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-[2.5px] rounded-t-xl"
                  style={{ background: meta.color, opacity: idx === 0 ? 0.8 : 0.2 }}
                />
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)] mt-0.5">
                  {stat.label}
                </p>
                <p className={`text-base font-extrabold font-mono mt-1 ${stat.color}`}>
                  {stat.value}
                  {stat.suffix && (
                    <span className="text-[11px] font-sans font-medium text-[var(--color-muted)] ml-1">
                      {stat.suffix}
                    </span>
                  )}
                </p>
              </div>
            ))}
          </div>

          {/* Specifications & Metadata */}
          <div className="space-y-2">
            <SectionLabel>Specifications & Metadata</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div
                className="px-3.5 py-2.5 rounded-xl flex items-center justify-between gap-1.5 border border-[var(--color-border)]/50"
                style={{
                  background: 'var(--color-surface)',
                  boxShadow: '0 4px 10px -2px rgba(0, 0, 0, 0.03)',
                }}
              >
                <span className="text-[var(--color-muted)] flex items-center gap-2 text-xs shrink-0">
                  <Tag size={14} style={{ color: meta.color }} />
                  <span>Category</span>
                </span>
                <span className="font-semibold text-xs text-[var(--color-text)] truncate text-right">
                  {ing.category?.name || 'Uncategorized'}
                </span>
              </div>

              <div
                className="px-3.5 py-2.5 rounded-xl flex items-center justify-between gap-1.5 border border-[var(--color-border)]/50"
                style={{
                  background: 'var(--color-surface)',
                  boxShadow: '0 4px 10px -2px rgba(0, 0, 0, 0.03)',
                }}
              >
                <span className="text-[var(--color-muted)] flex items-center gap-2 text-xs shrink-0">
                  <Building2 size={14} style={{ color: meta.color }} />
                  <span>Outlet</span>
                </span>
                <span className="font-semibold text-xs text-[var(--color-text)] truncate text-right">
                  {ing.outlet?.name || 'All Outlets (Central)'}
                </span>
              </div>

              <div
                className="px-3.5 py-2.5 rounded-xl flex items-center justify-between gap-1.5 border border-[var(--color-border)]/50"
                style={{
                  background: 'var(--color-surface)',
                  boxShadow: '0 4px 10px -2px rgba(0, 0, 0, 0.03)',
                }}
              >
                <span className="text-[var(--color-muted)] flex items-center gap-2 text-xs shrink-0">
                  <Clock size={14} style={{ color: meta.color }} />
                  <span>Created</span>
                </span>
                <span className="font-mono text-xs text-[var(--color-text)] truncate text-right">
                  {formatDate(ing.created_at)}
                </span>
              </div>

              <div
                className="px-3.5 py-2.5 rounded-xl flex items-center justify-between gap-1.5 border border-[var(--color-border)]/50"
                style={{
                  background: 'var(--color-surface)',
                  boxShadow: '0 4px 10px -2px rgba(0, 0, 0, 0.03)',
                }}
              >
                <span className="text-[var(--color-muted)] flex items-center gap-2 text-xs shrink-0">
                  <Calendar size={14} style={{ color: meta.color }} />
                  <span>Updated</span>
                </span>
                <span className="font-mono text-xs text-[var(--color-text)] truncate text-right">
                  {formatDate(ing.updated_at || ing.created_at)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Render Purchase Order Details ───────────────────────────────────
  const renderPurchaseOrder = (po) => {
    const statusColors = {
      received: { bg: 'bg-emerald-500/12', text: 'text-emerald-600', border: 'border-emerald-500/25' },
      ordered: { bg: 'bg-blue-500/12', text: 'text-blue-600', border: 'border-blue-500/25' },
      draft: { bg: 'bg-slate-500/12', text: 'text-slate-500', border: 'border-slate-500/25' },
      canceled: { bg: 'bg-rose-500/12', text: 'text-rose-500', border: 'border-rose-500/25' },
    }
    const sc = statusColors[po.status] || statusColors.draft

    return (
      <div className="space-y-4">
        {/* PO Header Banner */}
        <div
          className="p-4 rounded-xl"
          style={{
            background: meta.accentBg,
            boxShadow: '0 8px 16px -4px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.03)',
          }}
        >
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500/70 dark:text-blue-400/70">
                PO Reference
              </p>
              <h3 className="text-lg font-extrabold font-mono text-[var(--color-text)] mt-0.5 leading-tight">
                {po.po_number || `#PO-${po.id?.slice(0, 8)}`}
              </h3>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold capitalize ${sc.bg} ${sc.text} border ${sc.border}`}>
              {po.status || 'Pending'}
            </span>
          </div>
        </div>

        {/* Two-column info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="p-3.5 rounded-xl bg-[var(--color-card)] space-y-1.5" style={{ boxShadow: '0 8px 16px -4px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.03)' }}>
            <p className="text-[9.5px] font-bold uppercase tracking-wider text-[var(--color-muted)]">Supplier</p>
            <p className="text-sm font-bold text-[var(--color-text)] leading-tight">
              {po.supplier?.name || po.supplier_name || 'Direct Supplier'}
            </p>
            {po.supplier?.contact_name && (
              <p className="text-[11px] text-[var(--color-muted)]">Attn: {po.supplier.contact_name}</p>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--color-card)] space-y-1.5" style={{ boxShadow: '0 8px 16px -4px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.03)' }}>
            <p className="text-[9.5px] font-bold uppercase tracking-wider text-[var(--color-muted)]">Total Amount</p>
            <p className="text-xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 leading-tight">
              ${(Number(po.total_cost) || 0).toFixed(2)}
            </p>
            <p className="text-[11px] text-[var(--color-muted)]">
              Items: {po.items?.length || 0} line items
            </p>
          </div>
        </div>

        {/* Items list */}
        {po.items && po.items.length > 0 && (
          <div>
            <SectionLabel>Ordered Items</SectionLabel>
            <div className="rounded-xl overflow-hidden max-h-44 overflow-y-auto scrollbar-none" style={{ boxShadow: '0 8px 16px -4px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.03)' }}>
              {po.items.map((it, idx) => (
                <div
                  key={it.id || idx}
                  className="px-3 py-2 flex items-center justify-between text-xs border-b border-[var(--color-border)] last:border-b-0"
                  style={{
                    background: idx % 2 === 0 ? 'transparent' : 'var(--color-surface)',
                  }}
                >
                  <span className="font-semibold text-[var(--color-text)]">
                    {it.ingredient_name || it.name || 'Raw Ingredient'}
                  </span>
                  <div className="font-mono text-right text-[var(--color-muted)]">
                    <span>{it.quantity} {it.unit}</span>
                    <span className="ml-2 text-emerald-600 dark:text-emerald-400 font-bold">
                      @ ${Number(it.unit_cost || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metadata rows */}
        <div>
          <SectionLabel>Dates & Notes</SectionLabel>
          <div className="rounded-xl overflow-hidden" style={{ boxShadow: '0 8px 16px -4px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.03)' }}>
            <AttrRow
              icon={<Clock size={13} className="text-blue-500" />}
              label="Order Created"
              isEven={false}
            >
              <span className="font-mono text-[var(--color-text)]">{formatDate(po.created_at)}</span>
            </AttrRow>

            {po.expected_delivery_date && (
              <AttrRow
                icon={<Truck size={13} className="text-blue-500" />}
                label="Expected Delivery"
                isEven={true}
              >
                <span className="font-mono text-[var(--color-text)]">{formatDate(po.expected_delivery_date)}</span>
              </AttrRow>
            )}

            {po.note && (
              <div className="px-3.5 py-2.5 space-y-1 bg-[var(--color-surface)]">
                <span className="text-[var(--color-muted)] text-xs flex items-center gap-2">
                  <FileText size={13} className="text-blue-500" />
                  Notes
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed pl-5">
                  {po.note}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── Render Supplier Details ─────────────────────────────────────────
  const renderSupplier = (sup) => (
    <div className="space-y-4">
      {/* Supplier Hero */}
      <div
        className="flex items-center gap-3.5 p-4 rounded-xl"
        style={{
          background: meta.accentBg,
          boxShadow: '0 8px 16px -4px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.03)',
        }}
      >
        <div className="w-11 h-11 rounded-xl bg-teal-500/12 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0" style={{ boxShadow: '0 4px 7px -1px rgba(0, 0, 0, 0.04)' }}>
          <Building2 size={22} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-bold text-[var(--color-text)] truncate leading-tight">
            {sup.name}
          </h3>
          <p className="text-[11px] text-[var(--color-muted)] mt-0.5">
            Contact: <strong className="text-[var(--color-text)]">{sup.contact_name || 'N/A'}</strong>
          </p>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
          sup.is_active !== false
            ? 'bg-emerald-500/12 text-emerald-600 border border-emerald-500/25'
            : 'bg-slate-500/12 text-slate-500 border border-slate-500/25'
        }`}>
          {sup.is_active !== false ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Contact Details (2 Columns) */}
      <div>
        <SectionLabel>Contact Information</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div
            className="px-3.5 py-2.5 rounded-xl flex items-center justify-between gap-2"
            style={{
              background: 'var(--color-surface)',
              boxShadow: '0 8px 16px -4px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.03)',
            }}
          >
            <span className="text-[var(--color-muted)] flex items-center gap-1.5 text-xs shrink-0">
              <Phone size={13} className="text-teal-500" />
              <span>Phone</span>
            </span>
            <span className="font-mono font-semibold text-xs text-[var(--color-text)] truncate text-right">
              {sup.phone || '—'}
            </span>
          </div>

          <div
            className="px-3.5 py-2.5 rounded-xl flex items-center justify-between gap-2"
            style={{
              background: 'var(--color-surface)',
              boxShadow: '0 8px 16px -4px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.03)',
            }}
          >
            <span className="text-[var(--color-muted)] flex items-center gap-1.5 text-xs shrink-0">
              <Mail size={13} className="text-teal-500" />
              <span>Email</span>
            </span>
            <span className="font-semibold text-xs text-[var(--color-text)] truncate text-right">
              {sup.email || '—'}
            </span>
          </div>

          <div
            className="px-3.5 py-2.5 rounded-xl flex items-center justify-between gap-2"
            style={{
              background: 'var(--color-surface)',
              boxShadow: '0 8px 16px -4px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.03)',
            }}
          >
            <span className="text-[var(--color-muted)] flex items-center gap-1.5 text-xs shrink-0">
              <MapPin size={13} className="text-teal-500" />
              <span>Address</span>
            </span>
            <span className="font-semibold text-xs text-[var(--color-text)] truncate text-right">
              {sup.address || '—'}
            </span>
          </div>

          <div
            className="px-3.5 py-2.5 rounded-xl flex items-center justify-between gap-2"
            style={{
              background: 'var(--color-surface)',
              boxShadow: '0 8px 16px -4px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.03)',
            }}
          >
            <span className="text-[var(--color-muted)] flex items-center gap-1.5 text-xs shrink-0">
              <Calendar size={13} className="text-teal-500" />
              <span>Registered</span>
            </span>
            <span className="font-mono text-xs text-[var(--color-text)] truncate text-right">
              {formatDate(sup.created_at)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )

  // ── Render Stock Movement Log Details ────────────────────────────────
  const renderLog = (log) => {
    const isIncrease = log.type === 'in' || (Number(log.quantity) > 0 && log.type !== 'out')

    return (
      <div className="space-y-4">
        {/* Movement Hero */}
        <div
          className={`p-4 rounded-xl flex items-center justify-between ${
            isIncrease
              ? 'bg-emerald-50/60 dark:bg-emerald-950/15'
              : 'bg-amber-50/60 dark:bg-amber-950/15'
          }`}
          style={{ boxShadow: '0 1px 9px 0 rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.02)' }}
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)]">
              Movement: <strong className="uppercase text-[var(--color-text)]">{log.type || 'Adjustment'}</strong>
            </p>
            <h3 className="text-xl font-extrabold font-mono mt-1 leading-none">
              <span className={isIncrease ? 'text-emerald-500' : 'text-rose-500'}>
                {isIncrease ? '+' : ''}{Number(log.quantity).toFixed(2)}
              </span>
            </h3>
          </div>
          <div className="text-right">
            <p className="text-[9.5px] font-bold uppercase tracking-wider text-[var(--color-muted)]">Balance After</p>
            <p className="text-sm font-extrabold font-mono text-[var(--color-text)] mt-0.5">
              {Number(log.quantity_after || 0).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Details */}
        <div>
          <SectionLabel>Audit Details</SectionLabel>
          <div className="rounded-xl overflow-hidden" style={{ boxShadow: '0 1px 9px 0 rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.02)' }}>
            <AttrRow
              icon={<Package size={13} style={{ color: meta.color }} />}
              label="Target Item"
              isEven={false}
            >
              <span className="font-bold text-[var(--color-text)]">
                {log.ingredient_name || log.item_name || 'Ingredient'}
              </span>
            </AttrRow>

            <AttrRow
              icon={<Clock size={13} style={{ color: meta.color }} />}
              label="Timestamp"
              isEven={true}
            >
              <span className="font-mono text-[var(--color-text)]">{formatDate(log.created_at)}</span>
            </AttrRow>

            {log.note && (
              <div className="px-3.5 py-2.5 space-y-1">
                <span className="text-[var(--color-muted)] text-xs flex items-center gap-2">
                  <FileText size={13} style={{ color: meta.color }} />
                  Reason / Note
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed pl-5">
                  {log.note}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── Render Wastage Details ──────────────────────────────────────────
  const renderWaste = (w) => (
    <div className="space-y-4">
      {/* Wastage Hero */}
      <div
        className="p-4 rounded-xl bg-rose-50/60 dark:bg-rose-950/15 flex items-center justify-between"
        style={{ boxShadow: '0 1px 9px 0 rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.02)' }}
      >
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-rose-500/70 dark:text-rose-400/70">
            Wasted Quantity
          </p>
          <h3 className="text-xl font-extrabold font-mono text-rose-600 dark:text-rose-400 mt-0.5 leading-none">
            -{Number(w.quantity || 0).toFixed(2)}
            <span className="text-xs font-sans font-medium ml-1">{w.unit || ''}</span>
          </h3>
        </div>
        {w.cost_impact !== undefined && (
          <div className="text-right">
            <p className="text-[9.5px] font-bold uppercase tracking-wider text-[var(--color-muted)]">Financial Impact</p>
            <p className="text-base font-bold font-mono text-rose-500 mt-0.5">
              -${Number(w.cost_impact || 0).toFixed(2)}
            </p>
          </div>
        )}
      </div>

      {/* Details */}
      <div>
        <SectionLabel>Record Details</SectionLabel>
        <div className="rounded-xl overflow-hidden" style={{ boxShadow: '0 1px 9px 0 rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.02)' }}>
          <AttrRow
            icon={<Package size={13} className="text-rose-500" />}
            label="Material"
            isEven={false}
          >
            <span className="font-bold text-[var(--color-text)]">
              {w.ingredient_name || w.name || 'Raw Material'}
            </span>
          </AttrRow>

          <AttrRow
            icon={<AlertOctagon size={13} className="text-rose-500" />}
            label="Reason"
            isEven={true}
          >
            <span className="font-semibold text-rose-600 dark:text-rose-400 capitalize text-[11px] px-2 py-0.5 rounded-full bg-rose-500/8 border border-rose-500/15">
              {w.reason || 'Spoiled / Expired'}
            </span>
          </AttrRow>

          <AttrRow
            icon={<Calendar size={13} className="text-rose-500" />}
            label="Recorded"
            isEven={false}
          >
            <span className="font-mono text-[var(--color-text)]">{formatDate(w.created_at)}</span>
          </AttrRow>

          {w.note && (
            <div className="px-3.5 py-2.5 space-y-1 bg-[var(--color-surface)]">
              <span className="text-[var(--color-muted)] text-xs flex items-center gap-2">
                <FileText size={13} className="text-rose-500" />
                Notes
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed pl-5">
                {w.note}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
      style={{
        animation: 'viewDetailFadeIn 180ms ease-out both',
      }}
    >
      <style>{`
        @keyframes viewDetailFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes viewDetailSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <div
        className={`rounded-2xl w-full ${
          resolvedType === 'ingredient' ? 'max-w-3xl lg:max-w-4xl' : 'max-w-xl'
        } overflow-hidden flex flex-col max-h-[90vh]`}
        style={{
          background: 'var(--color-card)',
          boxShadow: '0 20px 27px 0 rgba(0, 0, 0, 0.05), 0 1px 9px 0 rgba(0, 0, 0, 0.10)',
          animation: 'viewDetailSlideUp 220ms ease-out 30ms both',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Modal Header (Soft UI card-header with 3px accent underline) ── */}
        <div
          className="px-6 py-4 flex items-center justify-between shrink-0"
          style={{ borderBottom: `3px solid ${meta.color}` }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: meta.accentBg,
                boxShadow: '0 4px 7px -1px rgba(0, 0, 0, 0.05)',
              }}
            >
              {meta.icon}
            </div>
            <div className="min-w-0">
              <h2
                className="text-sm font-bold truncate max-w-sm sm:max-w-md leading-tight"
                style={{ color: meta.color }}
              >
                {item.name || item.po_number || 'Item Details'}
              </h2>
              <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--color-muted)] mt-0.5 leading-none">
                {meta.category}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-150 cursor-pointer"
            title="Close (Esc)"
          >
            <X size={15} />
          </button>
        </div>

        {/* ── Modal Body ── */}
        <div className="px-6 py-5 overflow-y-auto flex-1 scrollbar-none">
          {resolvedType === 'ingredient' && renderIngredient(item)}
          {resolvedType === 'purchase_order' && renderPurchaseOrder(item)}
          {resolvedType === 'supplier' && renderSupplier(item)}
          {resolvedType === 'log' && renderLog(item)}
          {resolvedType === 'waste' && renderWaste(item)}
        </div>

        {/* ── Modal Footer ── */}
        <div
          className="px-6 py-3.5 flex items-center justify-between gap-2 shrink-0"
          style={{
            borderTop: '1px solid rgba(0, 0, 0, 0.06)',
            background: 'var(--color-surface)',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-150 cursor-pointer"
            style={{ boxShadow: '0 4px 7px -1px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.06)' }}
          >
            Close
          </button>

          <div className="flex items-center gap-1.5">
            {resolvedType === 'ingredient' && onAdjust && (
              <button
                type="button"
                onClick={() => {
                  onClose?.()
                  onAdjust(item)
                }}
                className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-[#126973] dark:text-[#F1D8C2] bg-[#126973]/8 hover:bg-[#126973]/15 transition-all duration-150 cursor-pointer flex items-center gap-1.5"
                style={{ boxShadow: '0 4px 7px -1px rgba(18, 105, 115, 0.1), 0 0 0 1px rgba(18, 105, 115, 0.12)' }}
              >
                <ArrowDownUp size={12} />
                <span>Adjust Stock</span>
              </button>
            )}

            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose?.()
                  onEdit(item)
                }}
                className="px-3.5 py-1.5 rounded-lg text-[11px] font-bold text-white bg-[#126973] hover:bg-[#126973]/90 active:scale-[0.98] transition-all duration-150 cursor-pointer flex items-center gap-1.5"
                style={{ boxShadow: '0 4px 7px -1px rgba(18, 105, 115, 0.3)' }}
              >
                <Edit3 size={12} />
                <span>Edit Item</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export { ViewPopupdetails as ViewPopupDetails }
