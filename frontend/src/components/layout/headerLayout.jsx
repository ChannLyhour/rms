import React from 'react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import DropdownAccountCardMD from '../pos/DropdownAccountCardMD'
import OutletSwitcher from '../pos/OutletSwitcher'
export default function HeaderLayout({ className = '', children }) {
  return (
    <header
      className={`flex h-12 shrink-0 items-center justify-between gap-4 border-b px-4 ${className}`}
      style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
    >
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        {children}
      </div>

      {/* right header layout */}
      <div className="flex items-center gap-2">
        {/* Outlet Information */}
        <OutletSwitcher />
      </div>
    </header>
  )
}
