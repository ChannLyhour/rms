import React, { useState } from 'react'
import { Check, Edit01, Trash01, Plus } from '@untitledui/icons'
import { EyeOff, CornerDownRight, Layers, Folder, User } from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// 1. SEMANTIC UI + MODERN TAILWIND CARD SYSTEM
// ─────────────────────────────────────────────────────────────────────────────

/**
 * <CardGroup> or <Cards> or <Card.Group>
 * Matches `<div class="ui cards">` or `<div class="ui two cards">`
 */
export function CardGroup({
  children,
  itemsPerRow = 2, // 1 | 2 | 3 | 4 | 5 | 6 | 'one' | 'two' | 'three' | 'four'
  gap = 'gap-4',
  stackable = true,
  className = '',
  ...props
}) {
  const count = typeof itemsPerRow === 'string'
    ? { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 }[itemsPerRow] || 2
    : itemsPerRow

  const colClasses = {
    1: 'grid-cols-1',
    2: stackable ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2',
    3: stackable ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-3',
    4: stackable ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-4',
    5: stackable ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-5',
    6: stackable ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6' : 'grid-cols-6',
  }[count] || 'grid-cols-1 sm:grid-cols-2'

  return (
    <div className={`grid ${colClasses} ${gap} w-full ${className}`} {...props}>
      {children}
    </div>
  )
}

/**
 * <Card> or <Card.Root>
 * Matches `<div class="card">` or `<div class="ui card">`
 */
export function Card({
  children,
  fluid = false,
  centered = false,
  raised = true,
  hoverable = true,
  color, // 'red' | 'green' | 'blue' | 'yellow' | 'purple' (colored top bar)
  className = '',
  style = {},
  onClick,
  ...props
}) {
  const isClickable = Boolean(onClick)

  const colorBarStyles = {
    red: 'border-t-4 border-t-red-500',
    green: 'border-t-4 border-t-emerald-500',
    blue: 'border-t-4 border-t-blue-500',
    yellow: 'border-t-4 border-t-amber-500',
    purple: 'border-t-4 border-t-purple-500',
    primary: 'border-t-4 border-t-[var(--color-500,#BF4040)]',
  }[color] || ''

  return (
    <div
      onClick={onClick}
      className={`rounded-xl border flex flex-col justify-between overflow-hidden transition-all duration-200 ${
        fluid ? 'w-full' : 'max-w-sm w-full'
      } ${centered ? 'mx-auto' : ''} ${
        raised ? 'shadow-xs hover:shadow-md' : ''
      } ${
        hoverable ? 'hover:border-slate-300 dark:hover:border-slate-700' : ''
      } ${colorBarStyles} ${isClickable ? 'cursor-pointer' : ''} ${className}`}
      style={{
        background: 'var(--color-card, #ffffff)',
        borderColor: 'var(--color-border, #e2e8f0)',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * <CardContent> or <Card.Content>
 * Matches `<div class="content">` or `<div class="extra content">`
 */
export function CardContent({
  children,
  extra = false,
  className = '',
  padding,
  style = {},
  ...props
}) {
  const defaultPadding = extra ? 'px-4 py-3' : 'p-4 sm:p-5'
  const paddingClass = padding || defaultPadding

  if (extra) {
    return (
      <div
        className={`${paddingClass} border-t bg-slate-50/60 dark:bg-slate-900/40 text-xs text-slate-500 select-none ${className}`}
        style={{
          borderColor: 'var(--color-border-subtle, #f1f5f9)',
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    )
  }

  return (
    <div
      className={`${paddingClass} relative after:content-[''] after:table after:clear-both ${className}`}
      style={style}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * <CardHeader> or <Card.Header>
 * Matches `<div class="header">`
 */
export function CardHeader({
  children,
  size = 'md', // 'sm' | 'md' | 'lg'
  className = '',
  style = {},
  ...props
}) {
  const sizeClasses = {
    sm: 'text-sm font-bold',
    md: 'text-base font-bold',
    lg: 'text-lg font-bold',
  }[size] || 'text-base font-bold'

  return (
    <div
      className={`${sizeClasses} text-slate-900 dark:text-slate-100 tracking-tight leading-snug ${className}`}
      style={{ color: 'var(--color-text)', ...style }}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * <CardMeta> or <Card.Meta>
 * Matches `<div class="meta">`
 */
export function CardMeta({
  children,
  className = '',
  style = {},
  ...props
}) {
  return (
    <div
      className={`text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-normal ${className}`}
      style={{ color: 'var(--color-muted)', ...style }}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * <CardDescription> or <Card.Description>
 * Matches `<div class="description">`
 */
export function CardDescription({
  children,
  lines,
  className = '',
  style = {},
  ...props
}) {
  const clampClass = lines ? `line-clamp-${lines}` : ''

  return (
    <div
      className={`text-sm text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed ${clampClass} ${className}`}
      style={{ ...style }}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * <CardImage> or <Card.Image>
 * Matches `<img class="right floated mini ui image" src="...">`
 */
export function CardImage({
  src,
  alt = '',
  size = 'mini', // 'mini' (36px) | 'tiny' (48px) | 'small' (64px) | 'medium' (80px) | 'full'
  floated = 'right', // 'right' | 'left' | false
  circular = true, // rounded-full or rounded-xl
  rounded = 'rounded-full',
  fallbackIcon: FallbackIcon,
  className = '',
  style = {},
  ...props
}) {
  const [hasError, setHasError] = useState(false)

  const sizeClasses = {
    mini: 'w-10 h-10',
    tiny: 'w-12 h-12',
    small: 'w-16 h-16',
    medium: 'w-20 h-20',
    full: 'w-full h-44',
  }[size] || 'w-10 h-10'

  const floatClass = floated === 'right' ? 'float-right ml-3 mb-1' : floated === 'left' ? 'float-left mr-3 mb-1' : ''
  const roundClass = circular ? 'rounded-full' : rounded

  if (size === 'full') {
    return (
      <div className={`w-full overflow-hidden bg-slate-100 dark:bg-slate-800 ${className}`}>
        {src && !hasError ? (
          <img
            src={src}
            alt={alt}
            onError={() => setHasError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-44 flex items-center justify-center text-slate-400">
            <Layers size={32} />
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className={`${sizeClasses} ${roundClass} ${floatClass} overflow-hidden shrink-0 border border-slate-200/80 dark:border-slate-700/80 bg-slate-100 dark:bg-slate-800 shadow-2xs flex items-center justify-center text-slate-500 select-none ${className}`}
      style={style}
      {...props}
    >
      {src && !hasError ? (
        <img
          src={src}
          alt={alt}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover"
        />
      ) : FallbackIcon ? (
        <FallbackIcon size={size === 'mini' ? 16 : 22} />
      ) : (
        <User size={size === 'mini' ? 18 : 24} />
      )}
    </div>
  )
}

/**
 * <CardButtons> or <Card.Buttons>
 * Matches `<div class="ui two buttons">`
 */
export function CardButtons({
  children,
  count = 2, // 1 | 2 | 3 | 'two' | 'three'
  attached = false,
  gap = 'gap-2',
  className = '',
  ...props
}) {
  const num = typeof count === 'string' ? { one: 1, two: 2, three: 3 }[count] || 2 : count

  if (attached) {
    return (
      <div
        className={`flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 divide-x divide-slate-200 dark:divide-slate-700 w-full ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }

  const gridClass = num === 2 ? 'grid grid-cols-2' : num === 3 ? 'grid grid-cols-3' : 'flex flex-col'

  return (
    <div className={`${gridClass} ${gap} w-full ${className}`} {...props}>
      {children}
    </div>
  )
}

/**
 * <CardButton> or <Card.Button>
 * Matches `<div class="ui basic green button">Approve</div>`
 */
export function CardButton({
  children,
  color = 'green', // 'green' | 'red' | 'blue' | 'gray' | 'primary'
  basic = true, // Basic outlined style vs solid style
  size = 'sm', // 'xs' | 'sm' | 'md'
  iconLeading: IconLeading,
  iconTrailing: IconTrailing,
  onClick,
  disabled = false,
  className = '',
  ...props
}) {
  const sizeClasses = {
    xs: 'py-1 px-2.5 text-[11px]',
    sm: 'py-1.5 px-3 text-xs',
    md: 'py-2 px-4 text-sm',
  }[size] || 'py-1.5 px-3 text-xs'

  let colorClasses = ''

  if (basic) {
    // Semantic UI "basic button" appearance
    switch (color) {
      case 'green':
      case 'success':
        colorClasses =
          'border-emerald-500/80 text-emerald-600 hover:bg-emerald-600 hover:text-white dark:text-emerald-400 dark:border-emerald-500/60 dark:hover:bg-emerald-600 dark:hover:text-white'
        break
      case 'red':
      case 'danger':
        colorClasses =
          'border-red-500/80 text-red-600 hover:bg-red-600 hover:text-white dark:text-red-400 dark:border-red-500/60 dark:hover:bg-red-600 dark:hover:text-white'
        break
      case 'blue':
      case 'info':
        colorClasses =
          'border-blue-500/80 text-blue-600 hover:bg-blue-600 hover:text-white dark:text-blue-400 dark:border-blue-500/60 dark:hover:bg-blue-600 dark:hover:text-white'
        break
      case 'primary':
        colorClasses =
          'border-[var(--color-500,#BF4040)] text-[var(--color-500,#BF4040)] hover:bg-[var(--color-500,#BF4040)] hover:text-white'
        break
      default:
        colorClasses =
          'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
        break
    }
  } else {
    // Solid button
    switch (color) {
      case 'green':
        colorClasses = 'bg-emerald-600 text-white border-transparent hover:bg-emerald-700'
        break
      case 'red':
        colorClasses = 'bg-red-600 text-white border-transparent hover:bg-red-700'
        break
      case 'primary':
        colorClasses = 'bg-[var(--color-500,#BF4040)] text-white border-transparent hover:brightness-110'
        break
      default:
        colorClasses = 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 hover:opacity-90'
        break
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`font-semibold rounded-[5px] border shadow-2xs transition-all duration-150 text-center flex items-center justify-center gap-1.5 select-none ${sizeClasses} ${colorClasses} ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-[0.98]'
      } ${className}`}
      {...props}
    >
      {IconLeading && <IconLeading size={13} />}
      {children}
      {IconTrailing && <IconTrailing size={13} />}
    </button>
  )
}

/**
 * <CardExtra> Alias for `<CardContent extra>`
 */
export const CardExtra = (props) => <CardContent extra {...props} />

// Compound components attachment
Card.Group = CardGroup
Card.Content = CardContent
Card.Header = CardHeader
Card.Meta = CardMeta
Card.Description = CardDescription
Card.Image = CardImage
Card.Extra = CardExtra
Card.Buttons = CardButtons
Card.Button = CardButton

// Semantic UI naming aliases
export const Cards = CardGroup
export const CardSection = CardContent

// ─────────────────────────────────────────────────────────────────────────────
// 2. READY-TO-USE APPROVAL / REQUEST CARD (Direct Implementation of Your HTML)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Exact implementation of the Semantic UI HTML Request Card:
 *
 * <div class="card">
 *   <div class="content">
 *     <img class="right floated mini ui image" src="...">
 *     <div class="header">Elliot Fu</div>
 *     <div class="meta">Friends of Veronika</div>
 *     <div class="description">Elliot requested permission...</div>
 *   </div>
 *   <div class="extra content">
 *     <div class="ui two buttons">
 *       <div class="ui basic green button">Approve</div>
 *       <div class="ui basic red button">Decline</div>
 *     </div>
 *   </div>
 * </div>
 */
export function ApprovalCard({
  avatarSrc,
  name,
  meta,
  description,
  onApprove,
  onDecline,
  approveLabel = 'Approve',
  declineLabel = 'Decline',
  className = '',
}) {
  return (
    <Card className={className}>
      <CardContent>
        {avatarSrc && (
          <CardImage
            src={avatarSrc}
            alt={name}
            floated="right"
            size="mini"
            circular
          />
        )}
        <CardHeader>{name}</CardHeader>
        {meta && <CardMeta>{meta}</CardMeta>}
        {description && (
          <CardDescription>
            {typeof description === 'string' ? (
              <span dangerouslySetInnerHTML={{ __html: description }} />
            ) : (
              description
            )}
          </CardDescription>
        )}
      </CardContent>

      <CardContent extra>
        <CardButtons count={2}>
          <CardButton basic color="green" onClick={onApprove}>
            {approveLabel}
          </CardButton>
          <CardButton basic color="red" onClick={onDecline}>
            {declineLabel}
          </CardButton>
        </CardButtons>
      </CardContent>
    </Card>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. READY-TO-USE ADMIN CATALOG CARD (Matching Category / Product Screenshot)
// ─────────────────────────────────────────────────────────────────────────────

export function CatalogCard({
  item,
  imageUrl,
  title,
  subtitle,
  description,
  isActive = true,
  isSub = false,
  parentName,
  sortOrder,
  subCount = 0,
  subCountLabel = 'Sub-Category',
  subCountPluralLabel = 'Sub-Categories',
  onAddSub,
  addSubLabel = '+ Sub-Cat',
  onEdit,
  onDelete,
  extraTopRight,
  extraBottomLeft,
  extraBottomRight,
  className = '',
  onClick,
}) {
  const name = title || item?.name || 'Untitled'
  const desc = description ?? item?.description
  const active = typeof isActive === 'boolean' ? isActive : item?.is_active ?? true
  const image = imageUrl || item?.image_url
  const order = sortOrder ?? item?.sort_order ?? 0

  return (
    <Card className={`p-5 rounded-2xl ${className}`} onClick={onClick}>
      <div>
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Image Thumbnail with Gradient Fallback */}
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white shadow-xs shrink-0 overflow-hidden"
              style={{
                background: isSub
                  ? 'linear-gradient(135deg, #64748b, #475569)'
                  : 'linear-gradient(135deg, var(--color-500, #BF4040), var(--color-700, #8A2E2E))',
              }}
            >
              {image ? (
                <img
                  src={image}
                  alt={name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              ) : isSub ? (
                <CornerDownRight size={18} />
              ) : (
                <Layers size={18} />
              )}
            </div>

            {/* Title & Meta */}
            <div className="min-w-0">
              <CardHeader size="sm" className="truncate leading-snug">
                {name}
              </CardHeader>

              {isSub ? (
                <p className="text-[10px] font-semibold text-[var(--color-500,#BF4040)] truncate">
                  ↳ Sub of: {parentName || 'Parent'}
                </p>
              ) : (
                <CardMeta className="font-mono text-[10px]">
                  {subtitle || `Main Category • #${order}`}
                </CardMeta>
              )}
            </div>
          </div>

          {/* Status Badge */}
          {extraTopRight || (
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 shrink-0 ${
                active
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
              }`}
            >
              {active ? <Check size={10} strokeWidth={2.5} /> : <EyeOff size={10} />}
              {active ? 'Active' : 'Hidden'}
            </span>
          )}
        </div>

        {/* Description */}
        <CardDescription lines={2} className="text-xs">
          {desc || 'No description provided for this category.'}
        </CardDescription>

        {/* Sub-Categories Pill Badge */}
        {!isSub && subCount > 0 && (
          <div className="mt-3 mb-1">
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-md border inline-flex items-center gap-1"
              style={{
                background: 'rgba(191, 64, 64, 0.08)',
                borderColor: 'rgba(191, 64, 64, 0.2)',
                color: 'var(--color-500, #BF4040)',
              }}
            >
              <Folder size={11} />
              {subCount} {subCount === 1 ? subCountLabel : subCountPluralLabel}
            </span>
          </div>
        )}
      </div>

      {/* Bottom Footer Actions */}
      <div
        className="pt-3 border-t flex items-center justify-between gap-2 mt-4 select-none"
        style={{ borderColor: 'var(--color-border-subtle, #f1f5f9)' }}
      >
        {/* Left Action */}
        <div>
          {extraBottomLeft ? (
            extraBottomLeft
          ) : !isSub && onAddSub ? (
            <button
              type="button"
              onClick={(e) => {
                e?.stopPropagation?.()
                onAddSub(item)
              }}
              className="text-[11px] font-bold text-[var(--color-500,#BF4040)] hover:underline flex items-center gap-1"
            >
              <Plus size={12} strokeWidth={2.5} />
              {addSubLabel.replace(/^\+\s*/, '')}
            </button>
          ) : isSub ? (
            <span className="text-[11px] text-[var(--color-muted,#64748b)]">Sub-item</span>
          ) : null}
        </div>

        {/* Right Action (Edit/Delete) */}
        <div className="flex items-center gap-2">
          {extraBottomRight}
          {onEdit && (
            <button
              type="button"
              onClick={(e) => {
                e?.stopPropagation?.()
                onEdit(item)
              }}
              className="text-[11px] font-semibold text-[var(--color-500,#BF4040)] hover:underline inline-flex items-center gap-1 px-1.5 py-0.5"
            >
              <Edit01 size={13} />
              Edit
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e?.stopPropagation?.()
                onDelete(item)
              }}
              className="text-[11px] font-semibold text-[var(--color-muted,#64748b)] hover:text-red-500 inline-flex items-center gap-1 px-1.5 py-0.5 transition-colors"
            >
              <Trash01 size={13} />
              Delete
            </button>
          )}
        </div>
      </div>
    </Card>
  )
}

export default Card
