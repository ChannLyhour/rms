import React from 'react'

/**
 * 1. Logo Icon - Modern Utensils in Crimson/Orange Gradient Squircle
 */
export function LogoIcon({ size = 32, className = '', style = {} }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`shrink-0 ${className}`}
      style={{ width: size, height: size, minWidth: size, minHeight: size, ...style }}
    >
      <defs>
        <linearGradient id="clean-logo-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill="url(#clean-logo-bg)" />
      {/* Fork */}
      <path
        d="M8 6V10C8 11.1 8.9 12 10 12V18H11V12C12.1 12 13 11.1 13 10V6H12V9.5C12 9.8 11.8 10 11.5 10H9.5C9.2 10 9 9.8 9 9.5V6H8Z"
        fill="#FFFFFF"
      />
      {/* Knife */}
      <path
        d="M16 6C14.5 6 14 7.5 14 10V13H15V18H16V6Z"
        fill="#FFFFFF"
      />
    </svg>
  )
}

/**
 * 2. POS Terminal Icon - Clean Cyan/Blue Modern POS Register
 */
export function PosIcon({ size = 22, className = '', style = {} }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`shrink-0 ${className}`}
      style={{ width: size, height: size, minWidth: size, minHeight: size, ...style }}
    >
      <defs>
        <linearGradient id="clean-pos-screen" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
        <linearGradient id="clean-pos-base" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#64748B" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
      </defs>
      {/* Monitor Display */}
      <rect x="3" y="3" width="18" height="12" rx="2.5" fill="url(#clean-pos-screen)" />
      {/* Screen Line Chart */}
      <path
        d="M6 10.5L9.5 7.5L13 9.5L18 5.5"
        stroke="#FFFFFF"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="18" cy="5.5" r="1" fill="#FEF08A" />
      {/* Stand Neck */}
      <path d="M10.5 15H13.5L14 18H10L10.5 15Z" fill="#475569" />
      {/* Base */}
      <rect x="5" y="18" width="14" height="3" rx="1.5" fill="url(#clean-pos-base)" />
      {/* Card slot indicator */}
      <rect x="13" y="17" width="5" height="1.5" rx="0.75" fill="#34D399" />
    </svg>
  )
}

/**
 * 3. Tables Icon - Clean Dining Table with Seating
 */
export function TablesIcon({ size = 22, className = '', style = {} }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`shrink-0 ${className}`}
      style={{ width: size, height: size, minWidth: size, minHeight: size, ...style }}
    >
      <defs>
        <linearGradient id="clean-table-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      {/* Left Chair */}
      <rect x="2" y="8" width="2.5" height="8" rx="1.25" fill="#10B981" opacity="0.6" />
      {/* Right Chair */}
      <rect x="19.5" y="8" width="2.5" height="8" rx="1.25" fill="#10B981" opacity="0.6" />
      {/* Table Center */}
      <rect x="6" y="5" width="12" height="14" rx="3" fill="url(#clean-table-grad)" />
      {/* Plate Accent */}
      <circle cx="12" cy="12" r="3" fill="#FFFFFF" />
      <circle cx="12" cy="12" r="1.5" fill="#FDE68A" />
    </svg>
  )
}

/**
 * 4. Kitchen Display (KDS) Icon - Clean Chef Hat with Flame
 */
export function KdsIcon({ size = 22, className = '', style = {} }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`shrink-0 ${className}`}
      style={{ width: size, height: size, minWidth: size, minHeight: size, ...style }}
    >
      <defs>
        <linearGradient id="clean-chef-hat" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F87171" />
          <stop offset="100%" stopColor="#EF4444" />
        </linearGradient>
      </defs>
      {/* Hat Puffs */}
      <circle cx="12" cy="8" r="3.5" fill="url(#clean-chef-hat)" />
      <circle cx="7.5" cy="10" r="3" fill="url(#clean-chef-hat)" />
      <circle cx="16.5" cy="10" r="3" fill="url(#clean-chef-hat)" />
      {/* Hat Body */}
      <path d="M6.5 12H17.5V16C17.5 16.5 17 17 16.5 17H7.5C7 17 6.5 16.5 6.5 16V12Z" fill="url(#clean-chef-hat)" />
      {/* Band */}
      <rect x="6" y="17" width="12" height="3" rx="1" fill="#DC2626" />
      {/* Utensil Dot */}
      <circle cx="12" cy="18.5" r="0.8" fill="#FEF08A" />
    </svg>
  )
}

/**
 * 5. Dashboard Icon - Clean 3-Bar Analytics Card
 */
export function DashboardIcon({ size = 22, className = '', style = {} }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`shrink-0 ${className}`}
      style={{ width: size, height: size, minWidth: size, minHeight: size, ...style }}
    >
      <defs>
        <linearGradient id="clean-dash-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>
      <rect x="2.5" y="3" width="19" height="18" rx="4" fill="url(#clean-dash-bg)" />
      {/* Bars */}
      <rect x="5.5" y="11" width="3" height="7" rx="1" fill="#93C5FD" />
      <rect x="10.5" y="7" width="3" height="11" rx="1" fill="#FFFFFF" />
      <rect x="15.5" y="9" width="3" height="9" rx="1" fill="#60A5FA" />
      {/* Trend Line */}
      <path d="M5.5 9L10.5 5L15.5 7L18.5 4" stroke="#FDE047" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

/**
 * 6. Analytics & Reports Icon - Clean Donut Pie Chart
 */
export function AnalyticsIcon({ size = 22, className = '', style = {} }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`shrink-0 ${className}`}
      style={{ width: size, height: size, minWidth: size, minHeight: size, ...style }}
    >
      {/* Slice 1 (Purple) */}
      <path d="M12 12L12 3A9 9 0 0 0 3 12H12Z" fill="#A855F7" />
      {/* Slice 2 (Orange) */}
      <path d="M12 12H3A9 9 0 1 0 21 12A9 9 0 0 0 12 12Z" fill="#F97316" />
      {/* Slice 3 (Teal detached) */}
      <path d="M13.5 10.5H21.5A9 9 0 0 0 13.5 2.5V10.5Z" fill="#06B6D4" />
      {/* Inner Donut cutout */}
      <circle cx="12" cy="12" r="3.5" fill="#FFFFFF" className="dark:fill-slate-900" />
    </svg>
  )
}

/**
 * 7. Orders & Receipts Icon - Clean Itemized Order Ticket
 */
export function OrdersIcon({ size = 22, className = '', style = {} }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`shrink-0 ${className}`}
      style={{ width: size, height: size, minWidth: size, minHeight: size, ...style }}
    >
      <defs>
        <linearGradient id="clean-receipt-head" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#DC2626" />
        </linearGradient>
      </defs>
      {/* Ticket Base */}
      <path
        d="M5 4C5 3.4 5.4 3 6 3H18C18.6 3 19 3.4 19 4V20.5L16.5 19.5L14 20.5L12 19.5L10 20.5L7.5 19.5L5 20.5V4Z"
        fill="#F8FAFC"
        stroke="#CBD5E1"
        strokeWidth="1"
      />
      {/* Top Banner */}
      <path d="M5 4C5 3.4 5.4 3 6 3H18C18.6 3 19 3.4 19 4V7H5V4Z" fill="url(#clean-receipt-head)" />
      {/* Lines */}
      <rect x="7.5" y="9.5" width="9" height="1.5" rx="0.75" fill="#64748B" />
      <rect x="7.5" y="12.5" width="6.5" height="1.5" rx="0.75" fill="#94A3B8" />
      <rect x="7.5" y="15.5" width="8" height="1.5" rx="0.75" fill="#94A3B8" />
    </svg>
  )
}

/**
 * 8. Product & Catalog Icon - Clean 3D Amber Folder
 */
export function CatalogIcon({ size = 22, className = '', style = {} }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`shrink-0 ${className}`}
      style={{ width: size, height: size, minWidth: size, minHeight: size, ...style }}
    >
      <defs>
        <linearGradient id="clean-folder-back" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EA580C" />
          <stop offset="100%" stopColor="#C2410C" />
        </linearGradient>
        <linearGradient id="clean-folder-front" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="100%" stopColor="#F97316" />
        </linearGradient>
      </defs>
      {/* Back tab */}
      <path d="M3 6C3 5.4 3.4 5 4 5H9L11 7H20C20.6 7 21 7.4 21 8V18C21 18.6 20.6 19 20 19H4C3.4 19 3 18.6 3 18V6Z" fill="url(#clean-folder-back)" />
      {/* White page */}
      <rect x="5" y="8" width="14" height="8" rx="1" fill="#FFFFFF" opacity="0.95" />
      {/* Front flap */}
      <path d="M3 11C3 10.4 3.4 10 4 10H20C20.6 10 21 10.4 21 11V18C21 19.1 20.1 20 19 20H5C3.9 20 3 19.1 3 18V11Z" fill="url(#clean-folder-front)" />
      {/* Tag circle */}
      <circle cx="16.5" cy="15.5" r="2" fill="#FEF08A" />
    </svg>
  )
}

/**
 * 9. Inventory & Supply Icon - Clean 3D Supply Box
 */
export function InventoryIcon({ size = 22, className = '', style = {} }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`shrink-0 ${className}`}
      style={{ width: size, height: size, minWidth: size, minHeight: size, ...style }}
    >
      <defs>
        <linearGradient id="clean-box-top" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>
      {/* Top Face */}
      <path d="M12 2.5L20.5 7L12 11.5L3.5 7L12 2.5Z" fill="url(#clean-box-top)" />
      {/* Left Face */}
      <path d="M3.5 7L12 11.5V21L3.5 16.5V7Z" fill="#B45309" />
      {/* Right Face */}
      <path d="M12 11.5L20.5 7V16.5L12 21V11.5Z" fill="#D97706" />
      {/* Cyan Tape */}
      <path d="M10 3.5L18.5 8L17 8.8L8.5 4.3L10 3.5Z" fill="#38BDF8" />
      <path d="M10.5 12.5H13.5V19.5H10.5V12.5Z" fill="#38BDF8" opacity="0.9" />
    </svg>
  )
}

/**
 * 10. Staff & Roles Icon - Clean Dual Team Avatars
 */
export function StaffIcon({ size = 22, className = '', style = {} }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`shrink-0 ${className}`}
      style={{ width: size, height: size, minWidth: size, minHeight: size, ...style }}
    >
      <defs>
        <linearGradient id="clean-staff-front" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
      </defs>
      {/* Back User */}
      <circle cx="16" cy="8" r="3" fill="#60A5FA" opacity="0.75" />
      <path d="M11.5 17C11.5 14.5 13.5 13 16 13C18.5 13 20.5 14.5 20.5 17V18.5H11.5V17Z" fill="#60A5FA" opacity="0.75" />
      {/* Front User */}
      <circle cx="9" cy="8.5" r="3.5" fill="url(#clean-staff-front)" />
      <path d="M3 19C3 15.7 5.7 13.5 9 13.5C12.3 13.5 15 15.7 15 19V20H3V19Z" fill="url(#clean-staff-front)" />
      {/* Green Badge */}
      <circle cx="18" cy="18" r="2.5" fill="#10B981" />
      <path d="M17 18L17.8 19L19.2 17.2" stroke="#FFFFFF" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/**
 * 11. Settings Icon - Clean Modern Gear
 */
export function SettingsIcon({ size = 22, className = '', style = {} }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`shrink-0 ${className}`}
      style={{ width: size, height: size, minWidth: size, minHeight: size, ...style }}
    >
      <defs>
        <linearGradient id="clean-gear-metal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
      </defs>
      {/* Gear Teeth */}
      <path
        d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
        fill="#FFFFFF"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.2 3.1C10.5 2.4 11.2 2 12 2C12.8 2 13.5 2.4 13.8 3.1L14.2 4.1C14.7 4.3 15.2 4.6 15.7 5L16.7 4.5C17.4 4.1 18.3 4.3 18.8 5C19.3 5.7 19.3 6.6 18.7 7.2L18.1 8C18.4 8.5 18.6 9 18.8 9.5L19.8 9.8C20.6 10.1 21 10.8 21 11.6C21 12.4 20.6 13.1 19.8 13.4L18.8 13.7C18.6 14.2 18.4 14.7 18.1 15.2L18.7 16C19.3 16.6 19.3 17.5 18.8 18.2C18.3 18.9 17.4 19.1 16.7 18.7L15.7 18.2C15.2 18.6 14.7 18.9 14.2 19.1L13.8 20.1C13.5 20.8 12.8 21.2 12 21.2C11.2 21.2 10.5 20.8 10.2 20.1L9.8 19.1C9.3 18.9 8.8 18.6 8.3 18.2L7.3 18.7C6.6 19.1 5.7 18.9 5.2 18.2C4.7 17.5 4.7 16.6 5.3 16L5.9 15.2C5.6 14.7 5.4 14.2 5.2 13.7L4.2 13.4C3.4 13.1 3 12.4 3 11.6C3 10.8 3.4 10.1 4.2 9.8L5.2 9.5C5.4 9 5.6 8.5 5.9 8L5.3 7.2C4.7 6.6 4.7 5.7 5.2 5C5.7 4.3 6.6 4.1 7.3 4.5L8.3 5C8.8 4.6 9.3 4.3 9.8 4.1L10.2 3.1ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z"
        fill="url(#clean-gear-metal)"
      />
      {/* Ruby Center Dot */}
      <circle cx="12" cy="12" r="2" fill="#EF4444" />
    </svg>
  )
}

/**
 * 12. Status: All Orders Icon (Grid)
 */
export function AllOrdersStatusIcon({ size = 18, className = '', style = {} }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`shrink-0 ${className}`}
      style={{ width: size, height: size, minWidth: size, minHeight: size, ...style }}
    >
      <rect x="3" y="3" width="8" height="8" rx="2" fill="#3B82F6" />
      <rect x="13" y="3" width="8" height="8" rx="2" fill="#6366F1" />
      <rect x="3" y="13" width="8" height="8" rx="2" fill="#0EA5E9" />
      <rect x="13" y="13" width="8" height="8" rx="2" fill="#8B5CF6" />
    </svg>
  )
}

/**
 * 13. Status: Pending Icon (Amber Clock)
 */
export function PendingStatusIcon({ size = 18, className = '', style = {} }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`shrink-0 ${className}`}
      style={{ width: size, height: size, minWidth: size, minHeight: size, ...style }}
    >
      <circle cx="12" cy="12" r="9" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2" />
      <path d="M12 7V12L15.5 14" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="1.5" fill="#D97706" />
    </svg>
  )
}

/**
 * 14. Status: Preparing Icon (Blue Chef Hat)
 */
export function PreparingStatusIcon({ size = 18, className = '', style = {} }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`shrink-0 ${className}`}
      style={{ width: size, height: size, minWidth: size, minHeight: size, ...style }}
    >
      <path
        d="M6 13C4.3 13 3 11.7 3 10C3 8.3 4.3 7 6 7C6.3 7 6.6 7 6.9 7.2C7.5 5.3 9.3 4 11.5 4C13.7 4 15.5 5.3 16.1 7.2C16.4 7 16.7 7 17 7C18.7 7 20 8.3 20 10C20 11.7 18.7 13 17 13H6Z"
        fill="#93C5FD"
      />
      <rect x="6" y="13" width="11" height="5" rx="1" fill="#3B82F6" />
      <rect x="5.5" y="17" width="12" height="2.5" rx="1" fill="#1D4ED8" />
    </svg>
  )
}

/**
 * 15. Status: Ready Icon (Emerald Service Bell)
 */
export function ReadyStatusIcon({ size = 18, className = '', style = {} }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`shrink-0 ${className}`}
      style={{ width: size, height: size, minWidth: size, minHeight: size, ...style }}
    >
      {/* Top Handle */}
      <circle cx="12" cy="5" r="1.5" fill="#059669" />
      {/* Bell Dome */}
      <path
        d="M12 6.5C7.6 6.5 4 10.1 4 14.5V17H20V14.5C20 10.1 16.4 6.5 12 6.5Z"
        fill="#34D399"
      />
      {/* Base */}
      <rect x="3" y="17" width="18" height="3" rx="1.5" fill="#059669" />
      <circle cx="12" cy="12" r="1.5" fill="#FFFFFF" />
    </svg>
  )
}

/**
 * 16. Status: Completed Icon (Mint Checkmark Badge)
 */
export function CompletedStatusIcon({ size = 18, className = '', style = {} }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`shrink-0 ${className}`}
      style={{ width: size, height: size, minWidth: size, minHeight: size, ...style }}
    >
      <circle cx="12" cy="12" r="9" fill="#10B981" />
      <path
        d="M8 12.5L10.5 15L16 9.5"
        stroke="#FFFFFF"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * 17. Status: Cancelled Icon (Rose X-Circle Badge)
 */
export function CancelledStatusIcon({ size = 18, className = '', style = {} }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`shrink-0 ${className}`}
      style={{ width: size, height: size, minWidth: size, minHeight: size, ...style }}
    >
      <circle cx="12" cy="12" r="9" fill="#F43F5E" />
      <path
        d="M9 9L15 15M15 9L9 15"
        stroke="#FFFFFF"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * 18. Status: Paid Icon (Emerald Dollar/Check Badge)
 */
export function PaidStatusIcon({ size = 18, className = '', style = {} }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`shrink-0 ${className}`}
      style={{ width: size, height: size, minWidth: size, minHeight: size, ...style }}
    >
      <rect x="3" y="5" width="18" height="14" rx="3" fill="#10B981" />
      <circle cx="12" cy="12" r="3.5" fill="#FFFFFF" opacity="0.25" />
      <path
        d="M12 8.5V15.5M10 10.5C10 9.7 10.9 9 12 9C13.1 9 14 9.7 14 10.5C14 11.5 13 12 12 12C11 12 10 12.5 10 13.5C10 14.3 10.9 15 12 15C13.1 15 14 14.3 14 13.5"
        stroke="#FFFFFF"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

/**
 * 19. Status: Unpaid Icon (Amber/Rose Pending Bill)
 */
export function UnpaidStatusIcon({ size = 18, className = '', style = {} }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`shrink-0 ${className}`}
      style={{ width: size, height: size, minWidth: size, minHeight: size, ...style }}
    >
      <rect x="3" y="5" width="18" height="14" rx="3" fill="#F59E0B" />
      <circle cx="12" cy="12" r="4" fill="#FEF3C7" />
      <path d="M12 10V12.5M12 14.5V14.6" stroke="#D97706" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}


