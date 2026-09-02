import { create } from 'zustand'
import axiosClient from '../api/axiosClient'

export const useOutletStore = create((set, get) => ({
  outlets: [],
  currentOutlet: null,
  isLoading: false,
  error: null,

  fetchOutlets: async (userParam) => {
    set({ isLoading: true, error: null })
    try {
      const res = await axiosClient.get('/outlets?active=true').catch(() => axiosClient.get('/cashier/outlets'))
      const allOutlets = res.data?.data || []
      
      let currentUser = userParam
      if (!currentUser) {
        try {
          const userStr = localStorage.getItem('pos_user')
          if (userStr) currentUser = JSON.parse(userStr)
        } catch {}
      }

      const roleName = (currentUser?.role?.name || '').toLowerCase()
      const isAdmin = roleName === 'admin' || roleName.includes('admin') || currentUser?.is_admin

      // If user has specific multiple assigned outlets and is not global admin
      let permittedOutlets = allOutlets
      if (!isAdmin && currentUser?.outlets && currentUser.outlets.length > 0) {
        const allowedIds = new Set(currentUser.outlets.map((o) => String(o.id)))
        permittedOutlets = allOutlets.filter((o) => allowedIds.has(String(o.id)))
        if (permittedOutlets.length === 0) {
          permittedOutlets = currentUser.outlets
        }
      } else if (!isAdmin && currentUser?.outlet_id) {
        permittedOutlets = allOutlets.filter((o) => String(o.id) === String(currentUser.outlet_id))
        if (permittedOutlets.length === 0 && currentUser.outlet) {
          permittedOutlets = [currentUser.outlet]
        }
      }

      // If permittedOutlets is empty, fallback to all
      if (permittedOutlets.length === 0) {
        permittedOutlets = allOutlets
      }

      let savedOutlet = null
      try {
        const saved = localStorage.getItem('skypark_current_outlet')
        if (saved) savedOutlet = JSON.parse(saved)
      } catch {}

      // Priority 1: User's previously selected venue if it is in permitted list
      let active = null
      if (savedOutlet?.id) {
        active = permittedOutlets.find((o) => String(o.id) === String(savedOutlet.id))
      }

      // Priority 2: User's primary default venue
      if (!active && currentUser?.outlet_id) {
        active = permittedOutlets.find((o) => String(o.id) === String(currentUser.outlet_id))
      }

      // Priority 3: First permitted venue
      if (!active) {
        active = permittedOutlets[0] || null
      }

      set({
        outlets: permittedOutlets,
        currentOutlet: active,
        isLoading: false,
      })

      if (active) {
        localStorage.setItem('skypark_current_outlet', JSON.stringify(active))
      }
    } catch (err) {
      console.error('Failed to fetch outlets:', err)
      // Fallback default SKYPARK outlets if backend is warming up
      const fallback = [
        { id: 1, name: 'SKYPARK Cafe', code: 'CAFE', type: 'cafe', has_tables: true, description: 'Artisan Coffee & Bakery' },
        { id: 2, name: 'SKYPARK SkyBar & Lounge', code: 'BAR', type: 'bar', has_tables: true, description: 'Rooftop Cocktails & Wine' },
        { id: 3, name: 'SKYPARK Mart', code: 'MART', type: 'retail', has_tables: false, description: 'Residence Supermarket & Snacks' },
        { id: 4, name: 'SKYPARK Grand Restaurant', code: 'REST', type: 'dine_in', has_tables: true, description: 'Fine Dining & Banquet' },
      ]
      set({ outlets: fallback, currentOutlet: fallback[0], isLoading: false, error: err.message })
    }
  },

  setCurrentOutlet: (outlet) => {
    set({ currentOutlet: outlet })
    try {
      if (outlet) {
        localStorage.setItem('skypark_current_outlet', JSON.stringify(outlet))
      } else {
        localStorage.removeItem('skypark_current_outlet')
      }
    } catch {}
  },
}))
