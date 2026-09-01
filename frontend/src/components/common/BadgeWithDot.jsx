import React from 'react'

export function BadgeWithDot({
  children,
  color = 'success', // 'success' | 'brand' | 'warning' | 'gray' | 'danger'
  type = 'modern',
  size = 'sm',
  className = ''
}) {
  const colorMap = {
    success: {
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-500/20',
      dot: 'bg-emerald-500'
    },
    brand: {
      bg: 'bg-red-500/10 dark:bg-red-500/15',
      text: 'text-red-600 dark:text-red-400',
      border: 'border-red-500/20',
      dot: 'bg-red-500'
    },
    warning: {
      bg: 'bg-amber-500/10 dark:bg-amber-500/15',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-500/20',
      dot: 'bg-amber-500'
    },
    gray: {
      bg: 'bg-slate-500/10 dark:bg-slate-500/15',
      text: 'text-slate-600 dark:text-slate-400',
      border: 'border-slate-500/20',
      dot: 'bg-slate-400'
    },
    danger: {
      bg: 'bg-rose-500/10 dark:bg-rose-500/15',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-500/20',
      dot: 'bg-rose-500'
    }
  }

  const selectedColor = colorMap[color] || colorMap.success

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border transition-all ${selectedColor.bg} ${selectedColor.text} ${selectedColor.border} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${selectedColor.dot} animate-pulse shrink-0`} />
      {children}
    </span>
  )
}
