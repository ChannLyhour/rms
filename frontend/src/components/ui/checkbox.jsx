import React from 'react'
import { Check } from 'lucide-react'

export const Checkbox = React.forwardRef(function Checkbox(
  {
    className = '',
    checked,
    defaultChecked = false,
    onCheckedChange,
    onChange,
    disabled = false,
    onClick,
    ...props
  },
  ref
) {
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked)
  const isControlled = checked !== undefined
  const isChecked = isControlled ? Boolean(checked) : internalChecked

  const handleClick = (e) => {
    if (disabled) return
    if (onClick) onClick(e)
    if (!e.defaultPrevented) {
      const nextChecked = !isChecked
      if (!isControlled) {
        setInternalChecked(nextChecked)
      }
      if (onCheckedChange) {
        onCheckedChange(nextChecked)
      }
      if (onChange) {
        onChange({ target: { checked: nextChecked } })
      }
    }
  }

  const handleKeyDown = (e) => {
    if (disabled) return
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      handleClick(e)
    }
  }

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={isChecked}
      disabled={disabled}
      ref={ref}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      data-state={isChecked ? 'checked' : 'unchecked'}
      className={`peer inline-flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 dark:focus-visible:ring-slate-300 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900 data-[state=checked]:text-white dark:data-[state=checked]:bg-slate-100 dark:data-[state=checked]:border-slate-100 dark:data-[state=checked]:text-slate-900 ${className}`}
      {...props}
    >
      {isChecked && (
        <Check className="size-3 stroke-[3]" />
      )}
    </button>
  )
})

export default Checkbox
