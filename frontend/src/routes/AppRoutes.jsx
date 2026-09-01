import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import RoleBasedRoute from './RoleBasedRoute'

// Auth pages
import Login from '../pages/auth/Login'
import Unauthorized from '../pages/auth/Unauthorized'

// Cashier pages
import CashierPOS from '../pages/cashier/pos/pos'
import ActiveSessions from '../pages/cashier/ActiveSessions'
import DashboardCashier from '../pages/cashier/DashboardCashier'

// Admin pages
import DashboardPage from '../pages/admin/DashboardPage'
import Analytics from '../pages/admin/Analytics'
import OrdersManagement from '../pages/admin/OrdersManagement'
import OrderViewDetails from '../pages/admin/views/orders/Order-View-Details'
import AdminLayout from '../components/layout/AdminLayout'
import TablesManagement from '../pages/admin/TablesManagement'
import Products from '../pages/admin/Products'
import Categories from '../pages/admin/categories/Categories'
import Categoriesgroup from '../pages/admin/categories/Categoriesgroup'
import OptionGroups from '../pages/admin/OptionGroups'
import Variantsgroup from '../pages/admin/variants/Variantsgroup'
import Inventory from '../pages/admin/Inventory'
import Recipes from '../pages/admin/Recipes'
import Purchases from '../pages/admin/Purchases'
import StockLogs from '../pages/admin/StockLogs'
import Users from '../pages/admin/users/Users'
import Roles from '../pages/admin/Roles'
import PermissionRole from '../pages/admin/PermissionRole'
import Settings from '../pages/admin/Settings'
import OutletsManagement from '../pages/admin/OutletsManagement'
import ZonesManagement from '../pages/admin/ZonesManagement'
import StationsManagement from '../pages/admin/StationsManagement'

// Customer pages
import QRMenu from '../pages/customer/QRMenu'
import OrderStatus from '../pages/customer/OrderStatus'
import FinalBillScreen from '../pages/customer/FinalBillScreen'

// Kitchen pages
import KitchenKDS from '../pages/kitchen/KitchenKDS'
import OrderHistory from '../pages/kitchen/OrderHistory'

/** Redirect authenticated users or show QRMenu if on subdomain */
function HomeRedirect() {
  const subdomainToken = (() => {
    try {
      const hostname = window.location.hostname
      const parts = hostname.split('.')
      // If hostname is e.g. "token.192.168.1.4" (5 parts) or "t1.192.168.1.4"
      if (parts.length > 4 && parts.slice(1).every((p) => /^\d+$/.test(p))) {
        return parts[0]
      }
      // If custom domain with subdomain, e.g. "token.pos.com" or "token.localhost"
      if (
        parts.length >= 2 &&
        parts[0] !== 'www' &&
        parts[0] !== 'localhost' &&
        !parts.every((p) => /^\d+$/.test(p))
      ) {
        return parts[0]
      }
    } catch {}
    return null
  })()

  if (subdomainToken) {
    return <QRMenu token={subdomainToken} />
  }

  const { user } = useAuth()
  const savedCustomerToken = typeof window !== 'undefined' ? localStorage.getItem('customer_table_token') : null

  if (savedCustomerToken && !user) {
    return <Navigate to={`/menu/${savedCustomerToken}`} replace />
  }

  if (!user) return <Navigate to="/login" replace />
  if (user.role?.name === 'admin' || user.role?.name === 'manager') return <Navigate to="/dashboard" replace />
  if (user.role?.name === 'kitchen') return <Navigate to="/kds" replace />
  return <Navigate to="/pos" replace />
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Customer QR (public) */}
      <Route path="/menu/:token" element={<QRMenu />} />
      <Route path="/order-status/:token" element={<OrderStatus />} />
      <Route path="/bill/:token" element={<FinalBillScreen />} />
      <Route path="/final-bill/:token" element={<FinalBillScreen />} />

      {/* Point of Sale & Sessions */}
      <Route path="/pos" element={
        <RoleBasedRoute roles={['cashier', 'admin']} permissions={['orders.create', 'pos.access']}>
          <CashierPOS />
        </RoleBasedRoute>
      } />
      <Route path="/sessions" element={
        <RoleBasedRoute roles={['cashier', 'admin']} permissions={['tables.manage', 'pos.access']}>
          <ActiveSessions />
        </RoleBasedRoute>
      } />

      {/* Kitchen Display System */}
      <Route path="/kds" element={
        <RoleBasedRoute roles={['kitchen', 'admin', 'cashier']} permissions={['orders.kitchen_view']}>
          <KitchenKDS />
        </RoleBasedRoute>
      } />
      <Route path="/kds/history" element={
        <RoleBasedRoute roles={['kitchen', 'admin', 'cashier']} permissions={['orders.kitchen_view']}>
          <OrderHistory />
        </RoleBasedRoute>
      } />
      <Route path="/order-history" element={
        <RoleBasedRoute roles={['kitchen', 'admin', 'cashier']} permissions={['orders.kitchen_view']}>
          <OrderHistory />
        </RoleBasedRoute>
      } />

      {/* Dashboard & Analytics */}
      <Route path="/dashboard" element={
        <RoleBasedRoute roles={['admin', 'manager', 'cashier']} permissions={['reports.sales_summary', 'pos.access']}>
          <DashboardPage />
        </RoleBasedRoute>
      } />
      <Route path="/admin/dashboard" element={<Navigate to="/dashboard" replace />} />
      <Route path="/analytics" element={
        <RoleBasedRoute roles={['admin', 'manager', 'cashier']} permissions={['reports.sales_summary', 'pos.access']}>
          <Analytics />
        </RoleBasedRoute>
      } />
      <Route path="/cashier/dashboard" element={
        <RoleBasedRoute roles={['cashier', 'admin']} permissions={['pos.access', 'orders.create']}>
          <DashboardCashier />
        </RoleBasedRoute>
      } />
      <Route path="/pos/dashboard" element={
        <RoleBasedRoute roles={['cashier', 'admin']} permissions={['pos.access', 'orders.create']}>
          <DashboardCashier />
        </RoleBasedRoute>
      } />
      <Route path="/orders" element={
        <RoleBasedRoute roles={['admin', 'cashier', 'kitchen', 'manager']} permissions={['orders.create', 'orders.kitchen_view']}>
          <OrdersManagement />
        </RoleBasedRoute>
      } />
      <Route path="/orders/:id" element={
        <RoleBasedRoute roles={['admin', 'cashier', 'kitchen', 'manager']} permissions={['orders.create', 'orders.kitchen_view']}>
          <AdminLayout>
            <OrderViewDetails />
          </AdminLayout>
        </RoleBasedRoute>
      } />

      {/* Tables & Floor Plan */}
      <Route path="/tables" element={
        <RoleBasedRoute roles={['admin', 'manager', 'cashier']} permissions={['tables.manage']}>
          <TablesManagement />
        </RoleBasedRoute>
      } />

      {/* Product & Menu Catalog */}
      <Route path="/products" element={
        <RoleBasedRoute roles={['admin', 'manager']} permissions={['menu.manage']}>
          <Products />
        </RoleBasedRoute>
      } />
      <Route path="/categories" element={
        <RoleBasedRoute roles={['admin', 'manager']} permissions={['menu.manage']}>
          <Categories />
        </RoleBasedRoute>
      } />
      <Route path="/groups/categories" element={
        <RoleBasedRoute roles={['admin', 'manager']} permissions={['menu.manage']}>
          <Categoriesgroup />
        </RoleBasedRoute>
      } />
      <Route path="/categories-groups" element={
        <RoleBasedRoute roles={['admin', 'manager']} permissions={['menu.manage']}>
          <Categoriesgroup />
        </RoleBasedRoute>
      } />
      <Route path="/options" element={
        <RoleBasedRoute roles={['admin', 'manager']} permissions={['menu.manage']}>
          <OptionGroups />
        </RoleBasedRoute>
      } />
      <Route path="/groups/variants" element={
        <RoleBasedRoute roles={['admin', 'manager']} permissions={['menu.manage']}>
          <Variantsgroup />
        </RoleBasedRoute>
      } />
      <Route path="/variants/grouped" element={
        <RoleBasedRoute roles={['admin', 'manager']} permissions={['menu.manage']}>
          <Variantsgroup />
        </RoleBasedRoute>
      } />
      <Route path="/options/grouped" element={
        <RoleBasedRoute roles={['admin', 'manager']} permissions={['menu.manage']}>
          <Variantsgroup />
        </RoleBasedRoute>
      } />

      {/* Inventory & Supply */}
      <Route path="/inventory" element={
        <RoleBasedRoute roles={['admin', 'manager', 'kitchen']} permissions={['stock.manage']}>
          <Inventory />
        </RoleBasedRoute>
      } />
      <Route path="/recipes" element={
        <RoleBasedRoute roles={['admin', 'manager', 'kitchen']} permissions={['ingredients.manage']}>
          <Recipes />
        </RoleBasedRoute>
      } />
      <Route path="/purchases" element={
        <RoleBasedRoute roles={['admin', 'manager']} permissions={['po.manage']}>
          <Purchases />
        </RoleBasedRoute>
      } />
      <Route path="/stock-logs" element={
        <RoleBasedRoute roles={['admin', 'manager', 'kitchen']} permissions={['stock.manage', 'stock.waste']}>
          <StockLogs />
        </RoleBasedRoute>
      } />

      {/* Staff, Roles & Permissions */}
      <Route path="/users" element={
        <RoleBasedRoute roles={['admin']} permissions={['users.manage']}>
          <Users />
        </RoleBasedRoute>
      } />
      <Route path="/roles" element={
        <RoleBasedRoute roles={['admin']} permissions={['users.manage']}>
          <PermissionRole />
        </RoleBasedRoute>
      } />
      <Route path="/permissions" element={
        <RoleBasedRoute roles={['admin']} permissions={['users.manage']}>
          <PermissionRole />
        </RoleBasedRoute>
      } />

      {/* Venues & Multi-Outlet Management */}
      <Route path="/outlets" element={
        <RoleBasedRoute roles={['admin', 'manager']} permissions={['users.manage']}>
          <OutletsManagement />
        </RoleBasedRoute>
      } />
      <Route path="/zones" element={
        <RoleBasedRoute roles={['admin', 'manager']} permissions={['users.manage']}>
          <ZonesManagement />
        </RoleBasedRoute>
      } />
      <Route path="/stations" element={
        <RoleBasedRoute roles={['admin', 'manager']} permissions={['users.manage']}>
          <StationsManagement />
        </RoleBasedRoute>
      } />

      {/* Settings */}
      <Route path="/settings" element={
        <RoleBasedRoute roles={['admin']} permissions={['users.manage']}>
          <Settings />
        </RoleBasedRoute>
      } />

      {/* Legacy URL Backward Compatibility Redirects */}
      <Route path="/cashier/pos" element={<Navigate to="/pos" replace />} />
      <Route path="/cashier/sessions" element={<Navigate to="/sessions" replace />} />
      <Route path="/kitchen/kds" element={<Navigate to="/kds" replace />} />
      <Route path="/kitchen/orders" element={<Navigate to="/kds" replace />} />
      <Route path="/kitchen/history" element={<Navigate to="/kds/history" replace />} />
      <Route path="/admin/analytics" element={<Navigate to="/analytics" replace />} />
      <Route path="/admin/orders" element={<Navigate to="/orders" replace />} />
      <Route path="/admin/tables" element={<Navigate to="/tables" replace />} />
      <Route path="/admin/products" element={<Navigate to="/products" replace />} />
      <Route path="/admin/categories" element={<Navigate to="/categories" replace />} />
      <Route path="/admin/options" element={<Navigate to="/options" replace />} />
      <Route path="/admin/inventory" element={<Navigate to="/inventory" replace />} />
      <Route path="/admin/recipes" element={<Navigate to="/recipes" replace />} />
      <Route path="/admin/purchases" element={<Navigate to="/purchases" replace />} />
      <Route path="/admin/stock-logs" element={<Navigate to="/stock-logs" replace />} />
      <Route path="/admin/users" element={<Navigate to="/users" replace />} />
      <Route path="/admin/roles" element={<Navigate to="/roles" replace />} />
      <Route path="/admin/permissions" element={<Navigate to="/permissions" replace />} />
      <Route path="/admin/settings" element={<Navigate to="/settings" replace />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

