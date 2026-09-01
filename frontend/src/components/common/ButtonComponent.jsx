import React, { isValidElement } from 'react'
import { Plus } from '@untitledui/icons'

// Helper to safely render icons (functions, forwardRef objects, or JSX elements)
const renderIcon = (Icon, props = {}) => {
  if (!Icon) return null
  if (isValidElement(Icon)) return Icon
  const IconComponent = Icon
  return <IconComponent {...props} />
}

/**
 * Universal Button Component (Untitled UI / Modern POS Design System)
 *
 * @param {'primary'|'secondary'|'destructive'|'outline'|'ghost'|'link'|'link-color'|'link-gray'} variant
 * @param {'xs'|'sm'|'md'|'lg'} size
 * @param {React.ComponentType|React.ReactNode} iconLeading
 * @param {React.ComponentType|React.ReactNode} iconTrailing
 * @param {boolean} loading
 * @param {boolean} disabled
 */
export const Button = ({
  variant = 'primary',
  size = 'md',
  iconLeading: IconLeading,
  iconTrailing: IconTrailing,
  loading = false,
  disabled = false,
  className = '',
  style = {},
  children,
  type = 'button',
  ...props
}) => {
  const isLink = variant.startsWith('link')

  // Size mapping
  const sizeClasses = {
    xs: 'px-2.5 py-1 text-[11px] font-semibold gap-1.5 rounded-[5px]',
    sm: 'px-3 py-1.5 text-xs font-semibold gap-1.5 rounded-[6px]',
    md: 'px-4 py-2 text-xs font-bold gap-2 rounded-xl',
    lg: 'px-5 py-2.5 text-sm font-bold gap-2.5 rounded-xl',
  }[size] || 'px-4 py-2 text-xs font-bold gap-2 rounded-xl'

  // Variant styling
  let variantClasses = ''
  let variantStyles = {}

  switch (variant) {
    case 'primary':
      variantClasses =
        'text-white shadow-md hover:opacity-95 active:scale-95 border border-transparent'
      variantStyles = {
        background:
          'linear-gradient(135deg, var(--color-500, #BF4040), var(--color-600, #9D3434))',
        boxShadow: '0 4px 14px rgba(191, 64, 64, 0.35)',
      }
      break

    case 'secondary':
      variantClasses =
        'border shadow-2xs hover:bg-black/5 dark:hover:bg-white/5 active:scale-98'
      variantStyles = {
        background: 'var(--color-card, #ffffff)',
        borderColor: 'var(--color-border)',
        color: 'var(--color-text)',
      }
      break

    case 'outline':
      variantClasses =
        'border bg-transparent hover:bg-black/5 dark:hover:bg-white/5 active:scale-98'
      variantStyles = {
        borderColor: 'var(--color-border)',
        color: 'var(--color-text)',
      }
      break

    case 'destructive':
      variantClasses =
        'bg-red-600 text-white shadow-sm hover:bg-red-700 active:scale-95 border border-transparent'
      break

    case 'ghost':
      variantClasses =
        'bg-transparent hover:bg-black/5 dark:hover:bg-white/5 active:scale-98 border border-transparent'
      variantStyles = {
        color: 'var(--color-text)',
      }
      break

    case 'link-color':
      variantClasses =
        'bg-transparent hover:underline p-0 border-none'
      variantStyles = {
        color: 'var(--color-500, #BF4040)',
      }
      break

    case 'link-gray':
      variantClasses =
        'bg-transparent hover:underline hover:text-[var(--color-text)] p-0 border-none'
      variantStyles = {
        color: 'var(--color-muted)',
      }
      break

    case 'link':
      variantClasses =
        'bg-transparent hover:underline p-0 border-none'
      variantStyles = {
        color: 'var(--color-text)',
      }
      break

    default:
      variantClasses = 'border shadow-2xs'
      variantStyles = {
        background: 'var(--color-card)',
        borderColor: 'var(--color-border)',
        color: 'var(--color-text)',
      }
  }

  const isDisabled = disabled || loading
  const iconSize = size === 'lg' ? 16 : size === 'xs' ? 12 : 14

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={`inline-flex items-center justify-center transition-all select-none cursor-pointer outline-none ${
        isLink ? 'font-medium' : sizeClasses
      } ${variantClasses} ${
        isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
      } ${className}`}
      style={{ ...variantStyles, ...style }}
      {...props}
    >
      {loading ? (
        <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0 mr-1" />
      ) : (
        renderIcon(IconLeading, { size: iconSize, className: 'shrink-0 stroke-[2.5px]' })
      )}

      {children}

      {!loading &&
        renderIcon(IconTrailing, { size: iconSize, className: 'shrink-0 stroke-[2.5px]' })}
    </button>
  )
}

/**
 * Standardized Create / Add Button for all admin headers and drawers
 */
export const CreateButton = ({
  label = 'Create',
  icon: Icon = Plus,
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  return (
    <Button
      variant="primary"
      size={size}
      iconLeading={Icon}
      className={className}
      {...props}
    >
      {children || label}
    </Button>
  )
}

export default Button
