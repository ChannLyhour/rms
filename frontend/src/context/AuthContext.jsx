import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../api/authApi'
import { useOutletStore } from '../store/useOutletStore'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('pos_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(false)
  const [isBooting, setIsBooting] = useState(true)

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('pos_token')
    if (!token) return
    try {
      const { data } = await authApi.me()
      if (data?.user) {
        setUser(data.user)
        localStorage.setItem('pos_user', JSON.stringify(data.user))
        // Sync venue if user has assigned outlet
        if (data.user?.outlet) {
          useOutletStore.getState().setCurrentOutlet(data.user.outlet)
        } else {
          useOutletStore.getState().fetchOutlets(data.user)
        }
      }
    } catch {
      // Ignore background sync errors
    }
  }, [])

  // Sync latest user permissions on mount
  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  // Initial page refresh boot animation fallback
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsBooting(false)
    }, 3400)
    return () => clearTimeout(timer)
  }, [])

  const login = useCallback(async (username, password) => {
    setLoading(true)
    try {
      const { data } = await authApi.login({ username, password })
      localStorage.setItem('pos_token', data.token)
      localStorage.setItem('pos_user', JSON.stringify(data.user))
      sessionStorage.removeItem('pos_current_route')
      setUser(data.user)

      // Automatically sync and initialize active venue for this user
      if (data.user?.outlet) {
        useOutletStore.getState().setCurrentOutlet(data.user.outlet)
      } else {
        useOutletStore.getState().fetchOutlets(data.user)
      }

      return { success: true, role: data.user.role?.name, user: data.user }
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed'
      return { success: false, error: msg }
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try { await authApi.logout() } catch { /* ignore */ }
    localStorage.removeItem('pos_token')
    localStorage.removeItem('pos_user')
    sessionStorage.removeItem('pos_current_route')
    setUser(null)
  }, [])

  const hasPermission = useCallback((slug) => {
    if (!user) return false
    if (user.role?.name === 'admin') return true
    if (!user.role?.permissions) return false
    return user.role.permissions.some((p) => {
      const s = typeof p === 'string' ? p : p.slug
      return s === slug
    })
  }, [user])

  const hasRole = useCallback((...roles) => {
    return roles.includes(user?.role?.name)
  }, [user])

  return (
    <AuthContext.Provider value={{ user, loading, isBooting, setIsBooting, login, logout, refreshUser, hasPermission, hasRole }}>
      {children}
    </AuthContext.Provider>
  )

}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
