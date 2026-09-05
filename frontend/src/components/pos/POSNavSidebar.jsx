import { useState, useEffect } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTableStore } from '../../store/useTableStore'
import { BadgeWithDot } from '../common/BadgeWithDot'
import {
  HomeLine,
  BarChartSquare02,
  Rows01,
  Folder,
  PieChart03,
  Settings01,
  MessageChatCircle,
  LayoutAlt01,
  SearchLg,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  LogOut01,
  Users01,
  Server01,
} from '@untitledui/icons'
import DropdownAccountCardMD from './DropdownAccountCardMD'
import { UtensilsCrossed, ChefHat, Store } from 'lucide-react'
import toast from 'react-hot-toast'

export default function POSNavSidebar({ collapsed, setCollapsed }) {
  const { user, logout } = useAuth()
  const { sessions, fetchSessions } = useTableStore()
  const location = useLocation()
  const navigate = useNavigate()

  const [searchQuery, setSearchQuery] = useState('')
  const [openGroups, setOpenGroups] = useState(() => {
    try {
      const saved = sessionStorage.getItem('pos_sidebar_open_groups')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  useEffect(() => {
    fetchSessions()
  }, [])

  // Auto-expand accordion if the active URL belongs to its sub-items
  useEffect(() => {
    navItemsWithDividers.forEach((item) => {
      if (item.items && item.items.some((sub) => sub.to === location.pathname)) {
        setOpenGroups((prev) => {
          const next = { ...prev, [item.label]: true }
          try {
            sessionStorage.setItem('pos_sidebar_open_groups', JSON.stringify(next))
          } catch {}
          return next
        })
      }
    })
  }, [location.pathname])

  const toggleGroup = (groupLabel) => {
    setOpenGroups((prev) => {
      const next = {
        ...prev,
        [groupLabel]: prev[groupLabel] === undefined ? false : !prev[groupLabel],
      }
      try {
        sessionStorage.setItem('pos_sidebar_open_groups', JSON.stringify(next))
      } catch {}
      return next
    })
  }

  const userRole = user?.role?.name || 'cashier'
  const isAdmin = userRole === 'admin'
  const activeSessionsCount = sessions?.length || 0

  // ── Untitled UI Navigation Specification with Dynamic Role & Permission Access ──
  const navItemsWithDividers = [
    // Front Desk / Cashier & Admin
    {
      label: 'POS',
      to: '/pos',
      icon: UtensilsCrossed,
      roles: ['cashier', 'admin', 'manager', 'waiter'],
      permissions: ['orders.create', 'pos.access'],
    },
    {
      label: 'Tables',
      to: '/sessions',
      icon: Store,
      roles: ['cashier', 'admin', 'manager', 'waiter'],
      permissions: ['tables.manage', 'pos.access'],
      badge: activeSessionsCount > 0 ? (
        <BadgeWithDot color="success" size="sm">
          {activeSessionsCount} Live
        </BadgeWithDot>
      ) : null,
    },
    // Kitchen Display
    {
      label: 'Kitchen Display',
      to: '/kds',
      icon: ChefHat,
      roles: ['kitchen', 'admin', 'cashier', 'manager'],
      permissions: ['orders.kitchen_view'],
    },
    { divider: true, roles: ['admin', 'manager'], permissions: ['reports.sales_summary', 'orders.create', 'orders.kitchen_view'] },
    // Operations & Orders
    {
      label: 'Dashboard',
      to: user?.role?.name === 'cashier' ? '/pos/dashboard' : '/dashboard',
      icon: BarChartSquare02,
      roles: ['admin', 'manager', 'cashier'],
      permissions: ['reports.sales_summary', 'pos.access'],
    },
    {
      label: 'Analytics & Reports',
      to: '/analytics',
      icon: PieChart03,
      roles: ['admin', 'manager'],
      permissions: ['reports.sales_summary'],
    },
    {
      label: 'Orders & Receipts',
      to: '/orders',
      icon: Rows01,
      roles: ['admin', 'cashier', 'kitchen', 'manager'],
      permissions: ['orders.create', 'orders.kitchen_view'],
    },
    { divider: true, roles: ['admin', 'manager'], permissions: ['menu.manage', 'stock.manage', 'ingredients.manage'] },
    // Catalog & Menu
    {
      label: 'Product & Catalog',
      icon: Folder,
      roles: ['admin', 'manager'],
      permissions: ['menu.manage'],
      items: [
        { label: 'All Products', to: '/products', roles: ['admin', 'manager'], permissions: ['menu.manage'] },
        { label: 'Categories', to: '/categories', roles: ['admin', 'manager'], permissions: ['menu.manage'] },
        { label: 'Modifiers & Addons', to: '/options', roles: ['admin', 'manager'], permissions: ['menu.manage'] },
      ],
    },
    // Inventory & Supply
    {
      label: 'Inventory & Supply',
      icon: Server01,
      roles: ['admin', 'manager', 'kitchen'],
      permissions: ['stock.manage', 'ingredients.manage', 'po.manage', 'suppliers.manage'],
      items: [
        { label: 'Inventory Overview', to: '/inventory', roles: ['admin', 'manager', 'kitchen'], permissions: ['stock.manage'] },
        { label: 'Raw Ingredients', to: '/inventory/ingredients', roles: ['admin', 'manager', 'kitchen'], permissions: ['stock.manage', 'ingredients.manage'] },
        { label: 'Material Categories', to: '/inventory/categories', roles: ['admin', 'manager', 'kitchen'], permissions: ['stock.manage', 'ingredients.manage'] },
        { label: 'Recipe Formulas', to: '/recipes', roles: ['admin', 'manager', 'kitchen'], permissions: ['ingredients.manage'] },
        { label: 'Suppliers & POs', to: '/purchases', roles: ['admin', 'manager'], permissions: ['po.manage', 'suppliers.manage'] },
        { label: 'Supplier Directory', to: '/inventory/suppliers', roles: ['admin', 'manager'], permissions: ['po.manage', 'suppliers.manage'] },
        { label: 'Stock Movements', to: '/stock-logs', roles: ['admin', 'manager', 'kitchen'], permissions: ['stock.manage', 'stock.waste'] },
        { label: 'Waste & Spoilage', to: '/inventory/waste', roles: ['admin', 'manager', 'kitchen'], permissions: ['stock.manage', 'stock.waste'] },
      ],
    },
    { divider: true, roles: ['admin'], permissions: ['users.manage'] },
    // Management & Settings
    {
      label: 'Staff & Roles',
      icon: Users01,
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
      icon: Settings01,
      roles: ['admin'],
      permissions: ['users.manage'],
    },
  ]

  const { hasPermission } = useAuth()

  const canAccessItem = (item) => {
    if (isAdmin) return true
    if (item.divider) return true
    if (item.roles && item.roles.includes(userRole)) return true
    if (item.permissions && item.permissions.some((p) => hasPermission(p))) return true
    // If it has sub-items, allow if ANY sub-item can be accessed
    if (item.items && item.items.some((sub) => canAccessItem(sub))) return true
    return false
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  // Filter items based on dynamic user role & permissions & search query
  const filteredNavItems = navItemsWithDividers
    .filter((item) => canAccessItem(item))
    .map((item) => {
      // 2. Filter sub-items by role / permissions
      if (item.items) {
        return {
          ...item,
          items: item.items.filter((sub) => canAccessItem(sub)),
        }
      }
      return item
    })
    .filter((item, idx, arr) => {
      // 3. Clean up orphaned dividers
      if (item.divider) {
        const prev = arr[idx - 1]
        const next = arr[idx + 1]
        if (!prev || prev.divider || !next || next.divider) return false
      }
      return true
    })
    .filter((item) => {
      // 4. Search query filter
      if (!searchQuery.trim()) return true
      if (item.divider) return false
      if (item.label.toLowerCase().includes(searchQuery.toLowerCase())) return true
      if (item.items && item.items.some((sub) => sub.label.toLowerCase().includes(searchQuery.toLowerCase()))) {
        return true
      }
      return false
    })


  return (
    <aside
      className={`flex flex-col shrink-0 border-r transition-all duration-300 select-none z-30 ${
        collapsed ? 'w-20' : 'w-72'
      }`}
      style={{
        background: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* ── 1. Header Brand ── */}
      <div className={`p-4 flex items-center ${collapsed ? 'flex-col gap-2 justify-center' : 'justify-between'}`}>
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-9 h-9 rounded-[5px] flex items-center justify-center font-bold text-white shadow-md shrink-0 cursor-pointer"
            onClick={() => collapsed && setCollapsed(false)}
            style={{
              background: 'linear-gradient(135deg, var(--color-500, #BF4040), var(--color-700, #8A2E2E))',
              boxShadow: '0 2px 8px rgba(191, 64, 64, 0.3)'
            }}
          >
            <UtensilsCrossed size={18} />
          </div>
          {!collapsed && (
            <span
              className="text-base font-bold tracking-tight truncate"
              style={{ color: 'var(--color-text)' }}
            >
              Cater POS
            </span>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-[5px] transition-colors hover:bg-black/5 dark:hover:bg-white/10 shrink-0"
          style={{ color: 'var(--color-muted)' }}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      
  

      {/* ── 3. Navigation List with Section Dividers ── */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item, idx) => {
          // A. Divider
          if (item.divider) {
            return (
              <div
                key={`divider-${idx}`}
                className="my-3 border-t"
                style={{ borderColor: 'var(--color-border)' }}
              />
            )
          }

          // B. Accordion Submenu Group
          if (item.items && item.items.length > 0) {
            const isGroupActive = item.items.some((sub) => location.pathname === sub.to)
            const isOpen = openGroups[item.label] ?? isGroupActive
            const Icon = item.icon

            return (
              <div key={item.label} className="space-y-1">
                <button
                  type="button"
                  onClick={() => toggleGroup(item.label)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-[5px] text-sm font-medium transition-all group ${
                    isGroupActive
                      ? 'bg-black/5 dark:bg-white/5 font-semibold'
                      : 'hover:bg-black/5 dark:hover:bg-white/5'
                  } ${collapsed ? 'justify-center' : ''}`}
                  style={{
                    color: isGroupActive ? 'var(--color-text)' : 'var(--color-text-secondary)',
                  }}
                  title={collapsed ? item.label : undefined}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {Icon && <Icon size={20} className="shrink-0 transition-transform group-hover:scale-105" />}
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {!collapsed && (
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-200 ${
                        isOpen ? 'rotate-0' : '-rotate-90 opacity-60'
                      }`}
                      style={{ color: 'var(--color-muted)' }}
                    />
                  )}
                </button>

                {/* Submenu Accordion Items */}
                {isOpen && !collapsed && (
                  <div
                    className="ml-5 pl-3 space-y-0.5 border-l"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    {item.items.map((sub) => {
                      const isSubActive = location.pathname === sub.to
                      return (
                        <button
                          key={sub.label}
                          type="button"
                          onClick={() => navigate(sub.to)}
                          className={`w-full flex items-center justify-between px-5 py-2 rounded-lg text-xs font-semibold transition-all text-left ${
                            isSubActive
                              ? 'font-bold shadow-xs'
                              : 'hover:bg-black/5 dark:hover:bg-white/5'
                          }`}
                          style={
                            isSubActive
                              ? {
                                  background: 'linear-gradient(135deg, var(--color-500, #BF4040), var(--color-600, #9D3434))',
                                  color: '#ffffff',
                                }
                              : {
                                  color: 'var(--color-text-secondary)',
                                }
                          }
                        >
                          <span className="truncate">{sub.label}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          }

          // C. Action Button Item (e.g. Support)
          if (item.isButton) {
            const Icon = item.icon
            return (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-[5px] text-sm font-medium transition-all group hover:bg-black/5 dark:hover:bg-white/5 ${
                  collapsed ? 'justify-center' : ''
                }`}
                style={{ color: 'var(--color-text-secondary)' }}
                title={collapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {Icon && <Icon size={20} className="shrink-0 transition-transform group-hover:scale-105" />}
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </div>
                {!collapsed && item.badge && <div>{item.badge}</div>}
              </button>
            )
          }

          // D. External Link Item
          const Icon = item.icon
          const isExternal = item.isExternal

          if (isExternal) {
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => window.open(item.to || '/menu/demo-table', '_blank')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-[5px] text-sm font-medium transition-all group hover:bg-black/5 dark:hover:bg-white/5 text-left ${
                  collapsed ? 'justify-center' : ''
                }`}
                style={{ color: 'var(--color-text-secondary)' }}
                title={collapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {Icon && <Icon size={20} className="shrink-0 transition-transform group-hover:scale-105" />}
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </div>
                {!collapsed && (
                  <LayoutAlt01 size={14} style={{ color: 'var(--color-muted)' }} />
                )}
              </button>
            )
          }

          // E. Standard Navigation Item
          const isItemActive = location.pathname === item.to

          return (
            <button
              key={item.label}
              type="button"
              onClick={() => navigate(item.to)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-[5px] text-sm font-medium transition-all group text-left ${
                isItemActive
                  ? 'shadow-xs font-semibold'
                  : 'hover:bg-black/5 dark:hover:bg-white/5'
              } ${collapsed ? 'justify-center' : ''}`}
              style={
                isItemActive
                  ? {
                      background: 'linear-gradient(135deg, var(--color-500, #BF4040), var(--color-600, #9D3434))',
                      color: '#ffffff',
                    }
                  : {
                      color: 'var(--color-text-secondary)',
                    }
              }
              title={collapsed ? item.label : undefined}
            >
              <div className="flex items-center gap-3 min-w-0">
                {Icon && <Icon size={20} className="shrink-0 transition-transform group-hover:scale-105" />}
                {!collapsed && <span className="truncate">{item.label}</span>}
              </div>
              {!collapsed && item.badge && <div>{item.badge}</div>}
            </button>
          )
        })}
      </nav>

      {/* ── 4.  Dropdown Account Card Footer ── */}
      <div
        className="p-3 border-t shrink-0 relative"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <DropdownAccountCardMD collapsed={collapsed} />
      </div>
    </aside>
  )
}
