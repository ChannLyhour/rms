import client from './axiosClient'

export const posApi = {
  // Tables & Sessions
  getTables: () => client.get('/cashier/tables'),
  updateTableStatus: (id, status) => client.patch(`/cashier/tables/${id}/status`, { status }),
  getSessions: () => client.get('/cashier/sessions?status=active'),
  getActiveSessions: () => client.get('/cashier/sessions/active'),
  openSession: (data) => client.post('/cashier/sessions', data),
  closeSession: (id, tableId) => client.delete(`/cashier/sessions/${id}?table_id=${tableId}`),

  // Orders
  getOrdersBySession: (sessionId) => client.get(`/cashier/orders?session_id=${sessionId}`),
  getAllOrders: (params) => client.get('/cashier/orders/all', { params }),
  createOrder: (data) => client.post('/cashier/orders', data),
  updateOrderStatus: (id, status) => client.patch(`/cashier/orders/${id}/status`, { status }),

  // Catalog (Categories & Products)
  getCategories: () => client.get('/cashier/categories'),
  getProducts: (categoryId) => client.get(`/cashier/products${categoryId ? `?category_id=${categoryId}` : ''}`),
  getOptionGroups: () => client.get('/cashier/option-groups'),

  // Payments
  processPayment: (data) => client.post('/cashier/payments', data),
  getPayments: (params) => client.get('/cashier/payments', { params }),
}

export const kitchenApi = {
  getOrders: () => client.get('/kitchen/orders'),
  updateStatus: (id, status) => client.patch(`/kitchen/orders/${id}/status`, { status }),
}

export const customerApi = {
  getMenu: (token) => client.get(`/customer/menu/${token}`),
  placeOrder: (token, data) => client.post(`/customer/orders/${token}`, data),
  getOrderStatus: (token) => client.get(`/customer/orders/${token}/status`),
  payTicket: (token, data) => client.post(`/customer/orders/${token}/pay-ticket`, data),
  callCashier: (token, payload) =>
    client.post(`/customer/call-cashier/${token}`, typeof payload === 'object' ? payload : { table_number: payload }),
}
