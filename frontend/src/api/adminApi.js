import client from './axiosClient'

export const adminApi = {
  // Users & Roles
  getUsers: (page = 1, limit = 50) => client.get(`/admin/users?page=${page}&limit=${limit}`),
  createUser: (data) => client.post('/admin/users', data),
  updateUser: (id, data) => client.put(`/admin/users/${id}`, data),
  deleteUser: (id) => client.delete(`/admin/users/${id}`),

  // Roles
  getRoles: (page = 1, limit = 100) => client.get(`/admin/roles?page=${page}&limit=${limit}`),
  getRole: (id) => client.get(`/admin/roles/${id}`),
  createRole: (data) => client.post('/admin/roles', data),
  updateRole: (id, data) => client.put(`/admin/roles/${id}`, data),
  deleteRole: (id) => client.delete(`/admin/roles/${id}`),

  // Permissions
  getPermissions: (page = 1, limit = 200) => client.get(`/admin/permissions?page=${page}&limit=${limit}`),
  assignPermission: (roleId, permissionId) => client.post('/admin/roles/permissions', { role_id: roleId, permission_id: permissionId }),
  revokePermission: (roleId, permissionId) => client.delete('/admin/roles/permissions', { data: { role_id: roleId, permission_id: permissionId } }),

  // Categories
  getCategories: () => client.get('/admin/categories'),
  createCategory: (data) => client.post('/admin/categories', data),
  updateCategory: (id, data) => client.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => client.delete(`/admin/categories/${id}`),

  // Products
  getProducts: (categoryId) => client.get(`/admin/products${categoryId ? `?category_id=${categoryId}` : ''}`),
  createProduct: (data) => client.post('/admin/products', data),
  updateProduct: (id, data) => client.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => client.delete(`/admin/products/${id}`),

  // Option Groups & Add-ons
  getOptionGroups: () => client.get('/admin/option-groups'),
  createOptionGroup: (data) => client.post('/admin/option-groups', data),
  updateOptionGroup: (id, data) => client.put(`/admin/option-groups/${id}`, data),
  deleteOptionGroup: (id) => client.delete(`/admin/option-groups/${id}`),

  // File Uploads
  uploadImage: (formData, folder = 'products') =>
    client.post(`/upload/${folder}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Reports
  getSalesSummary: (from, to) => client.get(`/admin/reports/sales?from=${from}&to=${to}`),

  // Tables & Sessions
  getTables: () => client.get('/cashier/tables'),
  getSessions: () => client.get('/cashier/sessions'),

  // Orders
  getOrders: (params) => client.get('/admin/orders', { params }),
  getOrderById: (id) => client.get(`/admin/orders/${id}`),
  updateOrderStatus: (id, status) => client.patch(`/admin/orders/${id}/status`, { status }),

  // Inventory & Supplies
  getIngredients: (params) => client.get('/admin/ingredients', { params }),
  getSuppliers: (params) => client.get('/admin/suppliers', { params }),
  getRecipes: (params) => client.get('/admin/recipes', { params }),
  getPurchaseOrders: (params) => client.get('/admin/purchase-orders', { params }),
  getStockLogs: () => client.get('/admin/stock-logs/ingredients'),

  // System Settings
  getSettings: () => client.get('/admin/settings'),
  getSetting: (key) => client.get(`/admin/settings/${key}`),
  setSetting: (data) => client.post('/admin/settings', data),
}

