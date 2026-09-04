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
  getCategories: (params) => {
    if (typeof params === 'object' && params !== null) {
      return client.get('/admin/categories', { params })
    }
    const query = params ? `?outlet_id=${params}` : ''
    return client.get(`/admin/categories${query}`)
  },
  createCategory: (data) => client.post('/admin/categories', data),
  updateCategory: (id, data) => client.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => client.delete(`/admin/categories/${id}`),

  // Products
  getProducts: (params) => {
    if (typeof params === 'object' && params !== null) {
      return client.get('/admin/products', { params })
    }
    const query = params ? `?category_id=${params}` : ''
    return client.get(`/admin/products${query}`)
  },
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

  // Stations
  getStations: (params) => {
    if (typeof params === 'object' && params !== null) {
      return client.get('/admin/stations', { params })
    }
    const query = params ? `?outlet_id=${params}` : ''
    return client.get(`/admin/stations${query}`)
  },

  // Orders
  getOrders: (params) => client.get('/admin/orders', { params }),
  getOrderById: (id) => client.get(`/admin/orders/${id}`),
  updateOrderStatus: (id, status) => client.patch(`/admin/orders/${id}/status`, { status }),

  // Raw Material / Ingredient Categories CRUD
  getIngredientCategories: (params) => client.get('/admin/ingredient-categories', { params }),
  getIngredientCategory: (id) => client.get(`/admin/ingredient-categories/${id}`),
  createIngredientCategory: (data) => client.post('/admin/ingredient-categories', data),
  updateIngredientCategory: (id, data) => client.put(`/admin/ingredient-categories/${id}`, data),
  deleteIngredientCategory: (id) => client.delete(`/admin/ingredient-categories/${id}`),

  // Inventory & Supplies CRUD
  getIngredients: (params) => client.get('/admin/ingredients', { params }),
  getIngredient: (id) => client.get(`/admin/ingredients/${id}`),
  createIngredient: (data) => client.post('/admin/ingredients', data),
  updateIngredient: (id, data) => client.put(`/admin/ingredients/${id}`, data),
  deleteIngredient: (id) => client.delete(`/admin/ingredients/${id}`),

  getSuppliers: (params) => client.get('/admin/suppliers', { params }),
  getSupplier: (id) => client.get(`/admin/suppliers/${id}`),
  createSupplier: (data) => client.post('/admin/suppliers', data),
  updateSupplier: (id, data) => client.put(`/admin/suppliers/${id}`, data),
  deleteSupplier: (id) => client.delete(`/admin/suppliers/${id}`),

  getRecipes: (params) => client.get('/admin/recipes', { params }),
  createRecipe: (data) => client.post('/admin/recipes', data),
  deleteRecipe: (id) => client.delete(`/admin/recipes/${id}`),

  getPurchaseOrders: (params) => client.get('/admin/purchase-orders', { params }),
  getPurchaseOrder: (id) => client.get(`/admin/purchase-orders/${id}`),
  createPurchaseOrder: (data) => client.post('/admin/purchase-orders', data),
  updatePurchaseOrderStatus: (id, status) => client.patch(`/admin/purchase-orders/${id}/status`, { status }),
  deletePurchaseOrder: (id) => client.delete(`/admin/purchase-orders/${id}`),

  getStockLogs: (params) => client.get('/admin/stock-logs/ingredients', { params }),
  getProductStockLogs: (params) => client.get('/admin/stock-logs/products', { params }),
  getStockWastes: (params) => client.get('/admin/stock-wastes', { params }),
  createStockWaste: (data) => client.post('/admin/stock-wastes', data),

  // System Settings
  getSettings: () => client.get('/admin/settings'),
  getSetting: (key) => client.get(`/admin/settings/${key}`),
  setSetting: (data) => client.post('/admin/settings', data),

  // Multi-Outlet System (Venues, Zones, Stations)
  getOutlets: (params) => client.get('/admin/outlets', { params }),
  getOutlet: (id) => client.get(`/admin/outlets/${id}`),
  createOutlet: (data) => client.post('/admin/outlets', data),
  updateOutlet: (id, data) => client.put(`/admin/outlets/${id}`, data),
  deleteOutlet: (id) => client.delete(`/admin/outlets/${id}`),

  getZones: (params) => client.get('/admin/zones', { params }),
  getZone: (id) => client.get(`/admin/zones/${id}`),
  createZone: (data) => client.post('/admin/zones', data),
  updateZone: (id, data) => client.put(`/admin/zones/${id}`, data),
  deleteZone: (id) => client.delete(`/admin/zones/${id}`),

  getStations: (params) => client.get('/admin/stations', { params }),
  getStation: (id) => client.get(`/admin/stations/${id}`),
  createStation: (data) => client.post('/admin/stations', data),
  updateStation: (id, data) => client.put(`/admin/stations/${id}`, data),
  deleteStation: (id) => client.delete(`/admin/stations/${id}`),
}

