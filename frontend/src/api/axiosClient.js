import axios from 'axios'

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

// Attach JWT token to every request
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('pos_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 globally — redirect to login (except public customer menu/order routes)
axiosClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const isCustomerRoute =
      window.location.pathname.startsWith('/menu') ||
      window.location.pathname.startsWith('/order-status')
    if (error.response?.status === 401 && !isCustomerRoute) {
      localStorage.removeItem('pos_token')
      localStorage.removeItem('pos_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default axiosClient
