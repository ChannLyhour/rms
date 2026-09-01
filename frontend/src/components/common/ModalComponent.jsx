import React, { useState, useEffect, useRef, isValidElement } from 'react'
import { X, Trash2 } from 'lucide-react'

// Helper to safely render icons (functions, forwardRef objects, or JSX elements)
const renderIcon = (Icon, props = {}) => {
  if (!Icon) return null
  if (isValidElement(Icon)) return Icon
  const IconComponent = Icon
  return <IconComponent {...props} />
}

/**
 * Universal Draggable Modal Component (Untitled UI / Modern POS System)
 *
 * @param {boolean} isOpen - Whether modal is visible
 * @param {Function} onClose - Close callback handler
 * @param {string|React.ReactNode} title - Modal title text or node
 * @param {string} subtitle - Modal subtitle text
 * @param {React.ComponentType|React.ReactNode} icon - Leading icon
 * @param {string} iconBadgeColor - Icon color
 * @param {string} size - 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | 'full'
 * @param {number} cols - 1 or 2 columns layout (default: 1)
 * @param {boolean} draggable - Whether modal can be dragged (default: true)
 * @param {boolean} showDragHandle - Whether top pill handle is rendered (default: true)
 * @param {React.ReactNode} headerExtra - Extra items on the right side of header
 * @param {React.ReactNode} footer - Optional bottom footer bar
 * @param {React.ReactNode} children - Modal content
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  iconBadgeColor = 'var(--color-500, #BF4040)',
  size,
  cols = 1,
  draggable = true,
  showDragHandle = true,
  headerExtra,
  footer,
  className = '',
  bodyClassName = '',
  closeOnBackdrop = true,
  closeOnEsc = true,
  children,
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 })
  const modalRef = useRef(null)

  // Reset position when modal opens
  useEffect(() => {
    if (isOpen) {
      setPosition({ x: 0, y: 0 })
    }
  }, [isOpen])

  // ESC key handler
  useEffect(() => {
    if (!closeOnEsc) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, closeOnEsc])

  // Drag listeners
  const handleMouseDown = (e) => {
    if (!draggable) return
    if (e.button !== 0) return // Left click only
    if (e.target.closest('button, input, textarea, select, a, [role="button"]')) return

    setIsDragging(true)
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
    }
  }

  // Touch drag support for POS tablets
  const handleTouchStart = (e) => {
    if (!draggable || e.touches.length !== 1) return
    if (e.target.closest('button, input, textarea, select, a, [role="button"]')) return

    const touch = e.touches[0]
    setIsDragging(true)
    dragStartRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      initialX: position.x,
      initialY: position.y,
    }
  }

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return
      const dx = e.clientX - dragStartRef.current.startX
      const dy = e.clientY - dragStartRef.current.startY
      setPosition({
        x: dragStartRef.current.initialX + dx,
        y: dragStartRef.current.initialY + dy,
      })
    }

    const handleTouchMove = (e) => {
      if (!isDragging || e.touches.length !== 1) return
      const touch = e.touches[0]
      const dx = touch.clientX - dragStartRef.current.startX
      const dy = touch.clientY - dragStartRef.current.startY
      setPosition({
        x: dragStartRef.current.initialX + dx,
        y: dragStartRef.current.initialY + dy,
      })
    }

    const handleDragEnd = () => {
      if (isDragging) setIsDragging(false)
    }

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleDragEnd)
      window.addEventListener('touchmove', handleTouchMove)
      window.addEventListener('touchend', handleDragEnd)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleDragEnd)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleDragEnd)
    }
  }, [isDragging])

  if (!isOpen) return null

  // Default size: if cols === 2, default to '4xl' (max-w-5xl)
  const effectiveSize = size || (cols === 2 ? '4xl' : '2xl')

  // Max width mapping
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-xl',
    xl: 'max-w-2xl',
    '2xl': 'max-w-3xl',
    '3xl': 'max-w-4xl',
    '4xl': 'max-w-5xl',
    '5xl': 'max-w-6xl',
    '6xl': 'max-w-7xl',
    full: 'max-w-[95vw] h-[92vh]',
  }[effectiveSize] || 'max-w-5xl'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-hidden select-none">
      {/* Backdrop with smooth blur */}
      <div
        onClick={closeOnBackdrop ? onClose : undefined}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Modal Container */}
      <div
        ref={modalRef}
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
          background: 'var(--color-surface, #ffffff)',
          borderColor: 'var(--color-border)',
        }}
        className={`relative w-full ${sizeClasses} rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[86vh] h-[86vh] transition-transform duration-75 animate-in zoom-in-95 duration-150 ${className}`}
      >
        {/* Top Centered Drag Handle Pill */}
        {showDragHandle && draggable && (
          <div
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            className="w-full pt-2.5 pb-1 flex items-center justify-center cursor-grab active:cursor-grabbing shrink-0 group"
            style={{ background: 'var(--color-surface)' }}
          >
            <div
              className="w-12 h-1.5 rounded-full transition-all group-hover:scale-x-110 group-hover:opacity-80"
              style={{ background: 'var(--color-border)' }}
            />
          </div>
        )}

        {/* Modal Header Bar */}
        {(title || Icon || headerExtra) && (
          <div
            onMouseDown={draggable ? handleMouseDown : undefined}
            onTouchStart={draggable ? handleTouchStart : undefined}
            className={`px-6 py-3.5 border-b flex items-center justify-between gap-4 shrink-0 ${
              draggable ? 'cursor-grab active:cursor-grabbing' : ''
            }`}
            style={{
              borderColor: 'var(--color-border)',
              background: 'var(--color-surface)',
            }}
          >
            <div className="flex items-center gap-3 min-w-0">
              {Icon && (
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs"
                  style={{
                    borderColor: 'var(--color-border)',
                    background: 'var(--color-bg)',
                    color: iconBadgeColor,
                  }}
                >
                  {renderIcon(Icon, { size: 18, className: 'stroke-[2.2px]' })}
                </div>
              )}

              <div className="min-w-0">
                {title && (
                  <h3
                    className="font-extrabold text-sm sm:text-base tracking-tight truncate uppercase"
                    style={{ color: 'var(--color-text)' }}
                  >
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p
                    className="text-xs truncate font-medium"
                    style={{ color: 'var(--color-muted)' }}
                  >
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {headerExtra}
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 text-[var(--color-muted)] hover:text-[var(--color-text)] cursor-pointer"
                title="Close (Esc)"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Content Body (1-Column or 2-Columns Grid Layout) */}
        {cols === 2 ? (
          <div
            className={`flex-1 min-h-0 overflow-y-auto md:overflow-hidden grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x ${bodyClassName}`}
            style={{ borderColor: 'var(--color-border)' }}
          >
            {children}
          </div>
        ) : (
          <div
            className={`flex-1 min-h-0 overflow-y-auto scrollbar-none select-text ${bodyClassName}`}
          >
            {children}
          </div>
        )}

        {/* Footer Bar (Draggable from non-button areas) */}
        {footer && (
          <div
            onMouseDown={draggable ? handleMouseDown : undefined}
            onTouchStart={draggable ? handleTouchStart : undefined}
            className={`px-6 py-4 border-t flex items-center justify-between gap-3 shrink-0 ${
              draggable ? 'cursor-grab active:cursor-grabbing' : ''
            }`}
            style={{
              borderColor: 'var(--color-border)',
              background: 'var(--color-surface)',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Untitled UI Confirmation / Delete Modal
 */
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete item',
  description = 'Are you sure you want to delete this item? This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  icon: Icon = Trash2,
  variant = 'destructive', // 'destructive' | 'primary' | 'warning'
  isLoading = false,
}) => {
  if (!isOpen) return null

  const isDestructive = variant === 'destructive'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs"
      />

      {/* Modal Card */}
      <div
        className="relative w-full max-w-sm sm:max-w-md rounded-2xl border shadow-2xl p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-150 z-10"
        style={{
          background: 'var(--color-surface, #ffffff)',
          borderColor: 'var(--color-border)',
        }}
      >
        {/* Top Row: Icon Badge & Close Button */}
        <div className="flex items-start justify-between">
          <div
            className={`w-11 h-11 rounded-xl border flex items-center justify-center shadow-xs ${
              isDestructive
                ? 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
                : 'bg-[var(--color-500,#BF4040)]/10 border-[var(--color-500,#BF4040)]/20 text-[var(--color-500,#BF4040)]'
            }`}
          >
            {renderIcon(Icon, { size: 20, className: 'stroke-[2.2px]' })}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Text Content */}
        <div className="space-y-1.5">
          <h3
            className="font-extrabold text-base tracking-tight"
            style={{ color: 'var(--color-text)' }}
          >
            {title}
          </h3>
          <p
            className="text-xs leading-relaxed"
            style={{ color: 'var(--color-muted)' }}
          >
            {description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-2.5 px-4 rounded-xl border text-xs font-bold transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 disabled:opacity-50 cursor-pointer text-center"
            style={{
              background: 'var(--color-card)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-secondary)',
            }}
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white shadow-md transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-[var(--color-500,#BF4040)] hover:bg-[var(--color-600,#9D3434)]'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Modal

