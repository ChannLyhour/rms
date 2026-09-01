import React, { useState, useRef, useEffect } from 'react'
import {
  Pencil,
  Trash2,
  Eye,
  Copy,
  Check,
  CheckCircle2,
  MoreHorizontal,
  ExternalLink,
  Archive,
  RotateCcw,
  AlertTriangle,
  Loader2,
  ChevronDown,
  Printer,
  Share2,
  Send,
  Upload,
} from 'lucide-react'
import { Edit01, Trash01 } from '@untitledui/icons'

// Safe icon resolvers
const resolveEditIcon = () => Edit01 || Pencil
const resolveTrashIcon = () => Trash01 || Trash2
const resolveEyeIcon = () => Eye
const resolveCopyIcon = () => Copy
const resolveMoreIcon = () => MoreHorizontal

// Standardized Button Size Configurations
const SIZES = {
  xs: {
    btn: 'h-7 px-2.5 text-[11px] gap-1.5 rounded-[5px]',
    iconOnly: 'w-7 h-7 rounded-[5px]',
    icon: 12,
  },
  sm: {
    btn: 'h-8 px-3.5 text-xs gap-2 rounded-[5px]',
    iconOnly: 'w-8 h-8 rounded-[5px]',
    icon: 13,
  },
  md: {
    btn: 'h-9 px-4 text-xs font-semibold gap-2 rounded-[6px]',
    iconOnly: 'w-9 h-9 rounded-[6px]',
    icon: 14,
  },
  lg: {
    btn: 'h-10 px-5 text-sm font-semibold gap-2.5 rounded-[6px]',
    iconOnly: 'w-10 h-10 rounded-[6px]',
    icon: 16,
  },
}

/**
 * Universal Action Button Component
 *
 * Supports modern styles:
 * 1) 'danger' | 'solid-red'      -> Solid Red [Delete project]
 * 2) 'outline' | 'white'         -> White card with border [Stage for publish]
 * 3) 'purple' | 'publish'        -> Vibrant Purple with checkmark [✓ Publish now]
 * 4) 'brand'                     -> Theme Accent Red (#BF4040)
 * 5) 'soft' | 'subtle'           -> Soft tinted pastel pill
 * 6) 'link'                      -> Minimal inline link
 * 7) 'icon'                      -> Square icon button
 */
export function ActionButton({
  icon: Icon,
  iconLeading: IconLeading,
  iconTrailing: IconTrailing,
  label,
  onClick,
  variant = 'outline', // 'danger' | 'purple' | 'outline' | 'brand' | 'soft' | 'link' | 'ghost' | 'icon'
  color = 'neutral',
  size = 'md',
  iconOnly = false,
  loading = false,
  disabled = false,
  className = '',
  title,
  children,
  type = 'button',
  ...props
}) {
  const sizeConfig = SIZES[size] || SIZES.md
  const ActiveIcon = IconLeading || Icon

  // Variant Styling Resolution
  const getVariantClasses = () => {
    // 1. Icon-Only Mode
    if (iconOnly || variant === 'icon') {
      const iconColors = {
        danger:
          'text-white bg-[#DC2626] hover:bg-[#B91C1C] active:bg-[#991B1B] shadow-xs',
        purple:
          'text-white bg-[#7C3AED] hover:bg-[#6D28D9] active:bg-[#5B21B6] shadow-xs',
        brand:
          'text-white bg-[var(--color-500,#BF4040)] hover:bg-[var(--color-600,#9D3434)] shadow-xs',
        outline:
          'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs',
        soft:
          'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 border border-slate-200/80 dark:border-slate-700/80',
        link:
          'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-black/5 dark:hover:bg-white/10',
      }
      return `${sizeConfig.iconOnly} flex items-center justify-center transition-all duration-150 ${
        iconColors[variant] || iconColors.outline
      }`
    }

    // 2. Solid Red ("Delete project" style)
    if (variant === 'danger' || variant === 'solid-red') {
      return `${sizeConfig.btn} inline-flex items-center justify-center font-bold text-white bg-[#D90404] hover:bg-[#B80303] active:bg-[#990202] border border-red-700/20 shadow-xs hover:shadow-sm transition-all duration-150`
    }

    // 3. Purple / Violet with Checkmark ("✓ Publish now" style)
    if (variant === 'purple' || variant === 'publish') {
      return `${sizeConfig.btn} inline-flex items-center justify-center font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] active:bg-[#5B21B6] border border-purple-600/20 shadow-xs hover:shadow-sm transition-all duration-150`
    }

    // 4. White / Card Outline ("Stage for publish" style)
    if (variant === 'outline' || variant === 'white' || variant === 'secondary') {
      return `${sizeConfig.btn} inline-flex items-center justify-center font-semibold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-2xs transition-all duration-150`
    }

    // 5. Brand Accent Solid
    if (variant === 'brand' || variant === 'primary') {
      return `${sizeConfig.btn} inline-flex items-center justify-center font-bold text-white bg-[var(--color-500,#BF4040)] hover:bg-[var(--color-600,#9D3434)] border border-[var(--color-600,#9D3434)]/30 shadow-xs hover:shadow-sm transition-all duration-150`
    }

    // 6. Soft Tinted Pill
    if (variant === 'soft') {
      const softMap = {
        danger:
          'bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/20',
        purple:
          'bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 border border-purple-500/20',
        brand:
          'bg-[var(--color-500,#BF4040)]/10 text-[var(--color-500,#BF4040)] hover:bg-[var(--color-500,#BF4040)]/20 border border-[var(--color-500,#BF4040)]/20',
        neutral:
          'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/80',
      }
      return `${sizeConfig.btn} inline-flex items-center justify-center font-semibold ${
        softMap[color] || softMap.neutral
      } shadow-2xs transition-all duration-150`
    }

    // 7. Minimal Link Style
    if (variant === 'link') {
      const linkMap = {
        danger: 'text-slate-500 hover:text-red-500 hover:underline',
        purple: 'text-purple-600 hover:text-purple-700 hover:underline',
        brand: 'text-[var(--color-500,#BF4040)] hover:underline',
        neutral: 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:underline',
      }
      return `inline-flex items-center gap-1.5 font-semibold text-xs transition-all duration-150 ${
        linkMap[color] || linkMap.neutral
      }`
    }

    // Default Fallback
    return `${sizeConfig.btn} inline-flex items-center justify-center font-semibold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 shadow-2xs transition-all duration-150`
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      title={title || label}
      className={`select-none cursor-pointer outline-none active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${getVariantClasses()} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 size={sizeConfig.icon} className="animate-spin shrink-0" />
      ) : (
        ActiveIcon && <ActiveIcon size={sizeConfig.icon} className="shrink-0 stroke-[2.4px]" />
      )}

      {!iconOnly && variant !== 'icon' && (
        <span className="truncate">{children || label}</span>
      )}

      {!loading && IconTrailing && (
        <IconTrailing size={sizeConfig.icon} className="shrink-0 stroke-[2.4px]" />
      )}
    </button>
  )
}

/**
 * 1. Delete Button (Preset with solid red "Delete project" or customizable styles)
 */
export function DeleteButton({
  onClick,
  onDelete,
  confirmMessage,
  variant = 'danger', // 'danger' (solid red) | 'outline' | 'soft' | 'link'
  size = 'md',
  label = 'Delete project',
  iconOnly = false,
  className = '',
  disabled = false,
  loading = false,
  children,
  ...props
}) {
  const handleClick = (e) => {
    if (disabled || loading) return
    if (confirmMessage && !window.confirm(confirmMessage)) return
    if (onDelete) onDelete(e)
    else if (onClick) onClick(e)
  }

  return (
    <ActionButton
      icon={variant === 'link' || iconOnly ? resolveTrashIcon() : null}
      label={label}
      variant={variant}
      color="danger"
      size={size}
      iconOnly={iconOnly}
      loading={loading}
      disabled={disabled}
      onClick={handleClick}
      className={className}
      {...props}
    >
      {children}
    </ActionButton>
  )
}

/**
 * 2. Stage / Secondary Button (Preset with white outlined "Stage for publish")
 */
export function StageButton({
  onClick,
  variant = 'outline',
  size = 'md',
  label = 'Stage for publish',
  iconOnly = false,
  className = '',
  disabled = false,
  loading = false,
  children,
  ...props
}) {
  return (
    <ActionButton
      label={label}
      variant={variant}
      size={size}
      iconOnly={iconOnly}
      loading={loading}
      disabled={disabled}
      onClick={onClick}
      className={className}
      {...props}
    >
      {children}
    </ActionButton>
  )
}

/**
 * 3. Publish Button (Preset with purple "✓ Publish now")
 */
export function PublishButton({
  onClick,
  onPublish,
  variant = 'purple',
  size = 'md',
  label = 'Publish now',
  icon: Icon = Check,
  iconOnly = false,
  className = '',
  disabled = false,
  loading = false,
  children,
  ...props
}) {
  const handleClick = (e) => {
    if (disabled || loading) return
    if (onPublish) onPublish(e)
    else if (onClick) onClick(e)
  }

  return (
    <ActionButton
      iconLeading={Icon}
      label={label}
      variant={variant}
      size={size}
      iconOnly={iconOnly}
      loading={loading}
      disabled={disabled}
      onClick={handleClick}
      className={className}
      {...props}
    >
      {children}
    </ActionButton>
  )
}

/**
 * 4. Edit Button
 */
export function EditButton({
  onClick,
  onEdit,
  variant = 'outline', // 'outline' | 'brand' | 'soft' | 'link'
  size = 'md',
  label = 'Edit',
  iconOnly = false,
  className = '',
  disabled = false,
  loading = false,
  children,
  ...props
}) {
  const handleClick = (e) => {
    if (disabled || loading) return
    if (onEdit) onEdit(e)
    else if (onClick) onClick(e)
  }

  return (
    <ActionButton
      iconLeading={resolveEditIcon()}
      label={label}
      variant={variant}
      color="brand"
      size={size}
      iconOnly={iconOnly}
      loading={loading}
      disabled={disabled}
      onClick={handleClick}
      className={className}
      {...props}
    >
      {children}
    </ActionButton>
  )
}

/**
 * 5. View Details Button
 */
export function ViewButton({
  onClick,
  onView,
  variant = 'outline',
  size = 'md',
  label = 'View',
  iconOnly = false,
  className = '',
  disabled = false,
  children,
  ...props
}) {
  const handleClick = (e) => {
    if (disabled) return
    if (onView) onView(e)
    else if (onClick) onClick(e)
  }

  return (
    <ActionButton
      iconLeading={resolveEyeIcon()}
      label={label}
      variant={variant}
      size={size}
      iconOnly={iconOnly}
      disabled={disabled}
      onClick={handleClick}
      className={className}
      {...props}
    >
      {children}
    </ActionButton>
  )
}

/**
 * 6. Duplicate / Clone Button
 */
export function DuplicateButton({
  onClick,
  onDuplicate,
  variant = 'outline',
  size = 'md',
  label = 'Duplicate',
  iconOnly = false,
  className = '',
  disabled = false,
  children,
  ...props
}) {
  const handleClick = (e) => {
    if (disabled) return
    if (onDuplicate) onDuplicate(e)
    else if (onClick) onClick(e)
  }

  return (
    <ActionButton
      iconLeading={resolveCopyIcon()}
      label={label}
      variant={variant}
      size={size}
      iconOnly={iconOnly}
      disabled={disabled}
      onClick={handleClick}
      className={className}
      {...props}
    >
      {children}
    </ActionButton>
  )
}

/**
 * 7. Unified Table Action Buttons Row
 *
 * Supports modern variants:
 * - 'modern' (Default): Solid Red Delete, White Outlined Edit, Purple Publish
 * - 'soft': Soft tinted pastel badges
 * - 'outline': Clean outlined buttons
 * - 'link': Minimal inline links
 * - 'icon': Compact square icon buttons
 */
export function TableActionButtons({
  item,
  onEdit,
  onDelete,
  onView,
  onPublish,
  onDuplicate,
  confirmDelete,
  variant = 'modern', // 'modern' | 'outline' | 'soft' | 'link' | 'danger' | 'icon'
  size = 'sm',
  editLabel = 'Edit',
  deleteLabel = 'Delete',
  viewLabel = 'View',
  publishLabel = 'Publish',
  duplicateLabel = 'Duplicate',
  iconOnly = false,
  gap = 'gap-2',
  align = 'justify-end',
  className = '',
  disabled = false,
  deleteLoading = false,
  editLoading = false,
  extraActions,
}) {
  const isModern = variant === 'modern'
  const isIcon = iconOnly || variant === 'icon'

  // Resolve sub-variants
  const editVariant = isModern ? 'outline' : variant
  const deleteVariant = isModern ? 'danger' : variant
  const publishVariant = isModern ? 'purple' : variant
  const secondaryVariant = isModern ? 'outline' : variant

  return (
    <div className={`flex items-center ${align} ${gap} font-medium select-none ${className}`}>
      {extraActions}

      {/* View Action */}
      {onView && (
        <ViewButton
          size={size}
          variant={secondaryVariant}
          label={viewLabel}
          iconOnly={isIcon}
          disabled={disabled}
          onClick={(e) => {
            e?.stopPropagation?.()
            onView(item || e)
          }}
        />
      )}

      {/* Duplicate Action */}
      {onDuplicate && (
        <DuplicateButton
          size={size}
          variant={secondaryVariant}
          label={duplicateLabel}
          iconOnly={isIcon}
          disabled={disabled}
          onClick={(e) => {
            e?.stopPropagation?.()
            onDuplicate(item || e)
          }}
        />
      )}

      {/* Edit Action (White Outlined) */}
      {onEdit && (
        <EditButton
          size={size}
          variant={editVariant}
          label={editLabel}
          iconOnly={isIcon}
          disabled={disabled}
          loading={editLoading}
          onClick={(e) => {
            e?.stopPropagation?.()
            onEdit(item || e)
          }}
        />
      )}

      {/* Publish Action (Purple with Checkmark) */}
      {onPublish && (
        <PublishButton
          size={size}
          variant={publishVariant}
          label={publishLabel}
          iconOnly={isIcon}
          disabled={disabled}
          onClick={(e) => {
            e?.stopPropagation?.()
            onPublish(item || e)
          }}
        />
      )}

      {/* Delete Action (Solid Red) */}
      {onDelete && (
        <DeleteButton
          size={size}
          variant={deleteVariant}
          label={deleteLabel}
          iconOnly={isIcon}
          disabled={disabled}
          loading={deleteLoading}
          confirmMessage={confirmDelete}
          onClick={(e) => {
            e?.stopPropagation?.()
            onDelete(item || e)
          }}
        />
      )}
    </div>
  )
}

// Aliases
export const ModernButton = ActionButton
export const ActionButtons = TableActionButtons
export const RowActions = TableActionButtons

/**
 * Interactive Pattern Showcase
 * Exactly matches the 3 buttons in the screenshot:
 * [Delete project] (Solid Red)
 * [Stage for publish] (White Outlined)
 * [✓ Publish now] (Purple with Checkmark)
 */
export function Pattern() {
  const [lastAction, setLastAction] = useState('None')
  const [isLoading, setIsLoading] = useState(false)

  const handleAsyncAction = (name) => {
    setIsLoading(true)
    setLastAction(`Processing ${name}...`)
    setTimeout(() => {
      setIsLoading(false)
      setLastAction(`Executed ${name} successfully!`)
    }, 800)
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-8 select-none">
      <div className="space-y-1">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <CheckCircle2 size={20} className="text-purple-600" />
          Modern Action Buttons System
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Clean button design system matching modern publish, stage, and destructive actions.
        </p>
      </div>

      <div className="p-6 rounded-[8px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-7 shadow-xs">
        {/* Exact User Style Header Match */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Primary Showcase (Exact Screenshot Match)
            </span>
            <span className="text-[10px] font-mono text-purple-600 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-[4px]">
              Modern POS & SaaS Actions
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3.5 p-4 rounded-[6px] bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800">
            {/* 1. Red Solid Button */}
            <DeleteButton
              label="Delete project"
              variant="danger"
              size="md"
              confirmMessage="Are you sure you want to delete this project?"
              onClick={() => handleAsyncAction('Delete project')}
            />

            {/* 2. White Outlined Button */}
            <StageButton
              label="Stage for publish"
              variant="outline"
              size="md"
              onClick={() => handleAsyncAction('Stage for publish')}
            />

            {/* 3. Purple Solid Button with Checkmark */}
            <PublishButton
              label="Publish now"
              variant="purple"
              size="md"
              loading={isLoading}
              onClick={() => handleAsyncAction('Publish now')}
            />
          </div>
        </div>

        {/* Small Size Variation */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Compact Size (`size="sm"`)
          </span>
          <div className="flex flex-wrap items-center gap-3 p-3 rounded-[6px] bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800">
            <DeleteButton label="Delete" variant="danger" size="sm" onClick={() => setLastAction('Delete (sm)')} />
            <StageButton label="Stage Draft" variant="outline" size="sm" onClick={() => setLastAction('Stage (sm)')} />
            <PublishButton label="Publish" variant="purple" size="sm" onClick={() => setLastAction('Publish (sm)')} />
            <EditButton label="Edit Item" variant="outline" size="sm" onClick={() => setLastAction('Edit (sm)')} />
          </div>
        </div>

        {/* Icon-Only Compact Variation */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Icon-Only Compact Actions (`iconOnly={true}`)
          </span>
          <div className="flex items-center gap-2.5 p-3 rounded-[6px] bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800">
            <DeleteButton iconOnly variant="danger" size="sm" title="Delete" onClick={() => setLastAction('Delete icon')} />
            <EditButton iconOnly variant="outline" size="sm" title="Edit" onClick={() => setLastAction('Edit icon')} />
            <ViewButton iconOnly variant="outline" size="sm" title="View Details" onClick={() => setLastAction('View icon')} />
            <DuplicateButton iconOnly variant="outline" size="sm" title="Duplicate" onClick={() => setLastAction('Duplicate icon')} />
            <PublishButton iconOnly variant="purple" size="sm" title="Publish Now" onClick={() => setLastAction('Publish icon')} />
          </div>
        </div>

        {/* Real-time Interaction Output */}
        <div className="p-3.5 rounded-[5px] bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-mono flex items-center justify-between">
          <span className="text-slate-500 dark:text-slate-400">Triggered Action:</span>
          <span className="text-purple-600 font-bold">{lastAction}</span>
        </div>
      </div>
    </div>
  )
}

export default ActionButton
