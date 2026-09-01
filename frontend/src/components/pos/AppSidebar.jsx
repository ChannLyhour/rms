import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTableStore } from '../../store/useTableStore'
import { ChevronDown } from '@untitledui/icons'

import {
  LogoIcon,
  PosIcon,
  TablesIcon,
  KdsIcon,
  DashboardIcon,
  AnalyticsIcon,
  OrdersIcon,
  CatalogIcon,
  InventoryIcon,
  StaffIcon,
  SettingsIcon,
  AllOrdersStatusIcon,
  PendingStatusIcon,
  PreparingStatusIcon,
  ReadyStatusIcon,
  CompletedStatusIcon,
  CancelledStatusIcon,
  PaidStatusIcon,
  UnpaidStatusIcon,
} from './sidebar-svg'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

export default function AppSidebar() {
  const { user, hasPermission } = useAuth()
  const { sessions, fetchSessions } = useTableStore()
  const location = useLocation()
  const navigate = useNavigate()
  const { open, setOpen } = useSidebar()
  const contentRef = useRef(null)

  const [openGroups, setOpenGroups] = useState(() => {
    try {
      const saved = sessionStorage.getItem('pos_sidebar_open_groups')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  // Restore scroll position instantly when switching pages
  useLayoutEffect(() => {
    try {
      const savedScroll = sessionStorage.getItem('pos_sidebar_scroll_top')
      if (savedScroll && contentRef.current) {
        contentRef.current.scrollTop = Number(savedScroll)
      }
    } catch {}
  }, [location.pathname])

  useEffect(() => {
    if (!sessions || sessions.length === 0) {
      fetchSessions()
    }
  }, [])

  const userRole = (user?.role?.name || (typeof user?.role === 'string' ? user.role : 'cashier')).toLowerCase()
  const isAdmin = userRole === 'admin' || user?.is_admin === true || userRole.includes('admin')
  const activeSessionsCount = sessions?.length || 0

  const canAccessItem = (item) => {
    if (isAdmin) return true
    if (item.divider) return true
    if (item.roles && item.roles.map(r => r.toLowerCase()).includes(userRole)) return true
    if (item.permissions && item.permissions.some((p) => hasPermission(p))) return true
    if (item.items && item.items.some((sub) => canAccessItem(sub))) return true
    return false
  }

  const navItems = [
    {
      label: 'POS',
      to: '/pos',
      icon: PosIcon,
      roles: ['cashier', 'admin', 'manager', 'waiter'],
      permissions: ['orders.create', 'pos.access'],
    },
    {
      label: 'Tables',
      to: '/sessions',
      icon: TablesIcon,
      roles: ['cashier', 'admin', 'manager', 'waiter'],
      permissions: ['tables.manage', 'pos.access'],
      badge: activeSessionsCount > 0 ? (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {activeSessionsCount} Live
        </span>
      ) : null,
    },
    {
      label: 'Kitchen Display',
      to: '/kds',
      icon: KdsIcon,
      roles: ['kitchen', 'admin', 'cashier', 'manager'],
      permissions: ['orders.kitchen_view'],
    },
    { divider: true, roles: ['admin', 'manager'], permissions: ['reports.sales_summary'] },
    {
      label: 'Dashboard',
      to: user?.role?.name === 'cashier' ? '/pos/dashboard' : '/dashboard',
      icon: DashboardIcon,
      roles: ['admin', 'manager', 'cashier'],
      permissions: ['reports.sales_summary', 'pos.access'],
    },
    {
      label: 'Analytics & Reports',
      to: '/analytics',
      icon: AnalyticsIcon,
      roles: ['admin', 'manager'],
      permissions: ['reports.sales_summary'],
    },
    {
      label: 'Orders & Transactions',
      icon: OrdersIcon,
      roles: ['admin', 'cashier', 'kitchen', 'manager'],
      permissions: ['orders.create', 'orders.kitchen_view'],
      items: [
        { label: 'All Orders', to: '/orders', icon: AllOrdersStatusIcon, roles: ['admin', 'cashier', 'kitchen', 'manager'], permissions: ['orders.create', 'orders.kitchen_view'] },
        { label: 'Pending', to: '/orders?status=pending', icon: PendingStatusIcon, roles: ['admin', 'cashier', 'kitchen', 'manager'], permissions: ['orders.create', 'orders.kitchen_view'] },
        { label: 'Preparing', to: '/orders?status=preparing', icon: PreparingStatusIcon, roles: ['admin', 'cashier', 'kitchen', 'manager'], permissions: ['orders.create', 'orders.kitchen_view'] },
        { label: 'Ready', to: '/orders?status=ready', icon: ReadyStatusIcon, roles: ['admin', 'cashier', 'kitchen', 'manager'], permissions: ['orders.create', 'orders.kitchen_view'] },
        { label: 'Completed', to: '/orders?status=completed', icon: CompletedStatusIcon, roles: ['admin', 'cashier', 'kitchen', 'manager'], permissions: ['orders.create', 'orders.kitchen_view'] },
        { label: 'Paid', to: '/orders?status=paid', icon: PaidStatusIcon, roles: ['admin', 'cashier', 'kitchen', 'manager'], permissions: ['orders.create', 'orders.kitchen_view'] },
        { label: 'Unpaid', to: '/orders?status=unpaid', icon: UnpaidStatusIcon, roles: ['admin', 'cashier', 'kitchen', 'manager'], permissions: ['orders.create', 'orders.kitchen_view'] },
        { label: 'Cancelled', to: '/orders?status=cancelled', icon: CancelledStatusIcon, roles: ['admin', 'cashier', 'kitchen', 'manager'], permissions: ['orders.create', 'orders.kitchen_view'] },
      ],
    },
    { divider: true, roles: ['admin', 'manager'], permissions: ['menu.manage'] },
    {
      label: 'Product & Catalog',
      icon: CatalogIcon,
      roles: ['admin', 'manager'],
      permissions: ['menu.manage'],
      items: [
        { label: 'All Products', to: '/products', roles: ['admin', 'manager'], permissions: ['menu.manage'] },
        { label: 'Categories', to: '/categories', roles: ['admin', 'manager'], permissions: ['menu.manage'] },
        { label: 'Modifiers & Addons', to: '/options', roles: ['admin', 'manager'], permissions: ['menu.manage'] },
      ],
    },
    {
      label: 'Inventory & Supply',
      icon: InventoryIcon,
      roles: ['admin', 'manager', 'kitchen'],
      permissions: ['stock.manage', 'ingredients.manage', 'po.manage', 'suppliers.manage'],
      items: [
        { label: 'Raw Ingredients', to: '/inventory', roles: ['admin', 'manager', 'kitchen'], permissions: ['stock.manage'] },
        { label: 'Recipe Formulas', to: '/recipes', roles: ['admin', 'manager', 'kitchen'], permissions: ['ingredients.manage'] },
        { label: 'Suppliers & POs', to: '/purchases', roles: ['admin', 'manager'], permissions: ['po.manage'] },
        { label: 'Stock Movements', to: '/stock-logs', roles: ['admin', 'manager', 'kitchen'], permissions: ['stock.manage'] },
      ],
    },
    { divider: true, roles: ['admin'], permissions: ['users.manage'] },
    {
      label: 'Staff & Roles',
      icon: StaffIcon,
      roles: ['admin'],
      permissions: ['users.manage'],
      items: [
        { label: 'All Staff Accounts', to: '/users', roles: ['admin'], permissions: ['users.manage'] },
        { label: 'Roles & Permissions', to: '/roles', roles: ['admin'], permissions: ['users.manage'] },
      ],
    },
    {
      label: 'Settings',
      to: '/settings',
      icon: SettingsIcon,
      roles: ['admin'],
      permissions: ['users.manage'],
    },
  ]

  const currentPath = location.pathname + location.search

  // Auto-expand accordion if the active URL belongs to its sub-items
  useEffect(() => {
    navItems.forEach((item) => {
      if (
        item.items &&
        item.items.some((sub) => {
          if (sub.to.includes('?')) return currentPath === sub.to
          return sub.to === location.pathname
        })
      ) {
        setOpenGroups((prev) => {
          if (prev[item.label] === true) return prev
          const next = { ...prev, [item.label]: true }
          try {
            sessionStorage.setItem('pos_sidebar_open_groups', JSON.stringify(next))
          } catch {}
          return next
        })
      }
    })
  }, [location.pathname, location.search])

  const handleGroupOpenChange = (groupLabel, nextOpen) => {
    setOpenGroups((prev) => {
      const next = {
        ...prev,
        [groupLabel]: typeof nextOpen === 'boolean' ? nextOpen : !prev[groupLabel],
      }
      try {
        sessionStorage.setItem('pos_sidebar_open_groups', JSON.stringify(next))
      } catch {}
      return next
    })
  }

  const filteredItems = navItems
    .filter((item) => canAccessItem(item))
    .map((item) => {
      if (item.items) {
        return { ...item, items: item.items.filter((sub) => canAccessItem(sub)) }
      }
      return item
    })
    .filter((item, idx, arr) => {
      if (item.divider) {
        const prev = arr[idx - 1]
        const next = arr[idx + 1]
        if (!prev || prev.divider || !next || next.divider) return false
      }
      return true
    })

  return (
    <Sidebar collapsible="icon">
      {/* ── Logo Header ── */}
      <SidebarHeader className={`border-b transition-all ${open ? 'px-4 py-3.5' : 'py-3 px-1.5'}`} style={{ borderColor: 'var(--color-border)' }}>
        <div className={`flex items-center ${open ? 'gap-3' : 'justify-center'}`}>
          <div
            onClick={() => !open && setOpen(true)}
            className={`shrink-0 transition-transform hover:scale-105 ${!open ? 'cursor-pointer' : ''}`}
            title={!open ? "Expand sidebar" : undefined}
          >
            <LogoIcon size={34} />
          </div>

          {open && (
            <div className="flex flex-col min-w-0">
              <h1 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                SKYPARK
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight mt-0.5">
                RMS
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* ── Navigation ── */}
      <SidebarContent
        ref={contentRef}
        onScroll={(e) => {
          try {
            sessionStorage.setItem('pos_sidebar_scroll_top', String(e.currentTarget.scrollTop))
          } catch {}
        }}
        className={`py-3 overflow-y-auto overflow-x-hidden no-scrollbar ${open ? 'px-3 space-y-1' : 'px-1'}`}
      >
        <SidebarGroup className="p-0">
          {open && (
            <SidebarGroupLabel className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
              Navigation
            </SidebarGroupLabel>
          )}

          <SidebarMenu className="gap-1.5">
            {filteredItems.map((item, idx) => {
              // A. Divider
              if (item.divider) {
                return (
                  <SidebarSeparator
                    key={`div-${idx}`}
                    className={`my-2.5 ${open ? 'mx-1' : 'mx-2'}`}
                    style={{ borderColor: 'var(--color-border)' }}
                  />
                )
              }

              const Icon = item.icon
              const isActive = location.pathname === item.to

              // B. Accordion Group with Submenu
              if (item.items && item.items.length > 0) {
                const isGroupActive = item.items.some((sub) => {
                  if (sub.to.includes('?')) return currentPath === sub.to
                  return (location.pathname === sub.to && !location.search) || (sub.to !== '/orders' && location.pathname.startsWith(sub.to + '/'))
                })
                const isGroupOpen = isGroupActive || Boolean(openGroups[item.label])

                return (
                  <Collapsible
                    key={item.label}
                    open={isGroupOpen}
                    onOpenChange={(next) => handleGroupOpenChange(item.label, next)}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger
                        render={
                          <SidebarMenuButton
                            tooltip={item.label}
                            isActive={isGroupActive}
                            onClick={() => {
                              if (!open) {
                                setOpen(true)
                              }
                            }}
                            className={`flex w-full items-center justify-between transition-all duration-200 cursor-pointer ${
                              open
                                ? 'h-11 px-3 rounded-lg text-sm'
                                : '!w-10 !h-10 !p-0 mx-auto rounded-lg flex items-center justify-center'
                            } ${
                              isGroupActive
                                ? 'font-semibold text-slate-900 dark:text-white bg-slate-100/80 dark:bg-white/5 shadow-2xs'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            <div className={`flex items-center ${open ? 'gap-3 min-w-0' : 'justify-center w-full'}`}>
                              {Icon && <Icon size={24} className="shrink-0 transition-transform group-hover:scale-105" />}
                              {open && <span className="truncate">{item.label}</span>}
                            </div>
                            {open && (
                              <ChevronDown
                                className="ml-auto shrink-0 duration-300 group-data-[panel-open]/collapsible:rotate-180 text-slate-400"
                                size={15}
                              />
                            )}
                          </SidebarMenuButton>
                        }
                      />

                      {open && (
                        <CollapsibleContent>
                          <SidebarMenuSub
                            className="mt-1.5 ml-4.5 space-y-1 border-l border-slate-200 dark:border-slate-800 pl-3.5 slide-in-from-top-1 duration-200"
                          >
                            {item.items.map((sub) => {
                              const isSubActive =
                                sub.to.includes('?')
                                  ? currentPath === sub.to
                                  : location.pathname === sub.to && (!location.search || sub.to !== '/orders')
                              const SubIcon = sub.icon
                              return (
                                <SidebarMenuSubItem key={sub.label}>
                                  <SidebarMenuSubButton
                                    isActive={isSubActive}
                                    onClick={() => navigate(sub.to)}
                                    render={<button type="button" />}
                                    className={`flex items-center gap-3 w-full text-left h-10 px-3 py-2 text-[13.5px] font-medium rounded-lg transition-all cursor-pointer ${
                                      isSubActive
                                        ? 'text-red-700 dark:text-red-400 font-semibold bg-red-50 dark:bg-red-500/10 shadow-2xs'
                                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-white/5'
                                    }`}
                                  >
                                    {SubIcon && <SubIcon size={20} className="shrink-0 transition-transform group-hover:scale-105" />}
                                    <span className="truncate">{sub.label}</span>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              )
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      )}
                    </SidebarMenuItem>
                  </Collapsible>
                )
              }

              // C. Standard Navigation Item
              return (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    tooltip={item.label}
                    isActive={isActive}
                    onClick={() => navigate(item.to)}
                    className={`transition-all duration-200 cursor-pointer ${
                      open
                        ? `flex items-center gap-3 h-11 px-3 rounded-lg text-sm ${
                            isActive
                              ? 'rounded-r-lg font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-l-[3px] border-red-600'
                              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                          }`
                        : `!w-10 !h-10 !p-0 mx-auto rounded-lg flex items-center justify-center ${
                            isActive
                              ? 'bg-red-500/15 text-red-600 border border-red-500/30'
                              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                          }`
                    }`}
                  >
                    <div className={`flex items-center ${open ? 'gap-3 min-w-0' : 'justify-center w-full'}`}>
                      {Icon && <Icon size={24} className="shrink-0 transition-transform group-hover:scale-105" />}
                      {open && <span className="truncate">{item.label}</span>}
                    </div>
                    {open && item.badge && <span className="ml-auto shrink-0">{item.badge}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
