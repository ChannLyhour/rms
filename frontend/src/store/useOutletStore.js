import { create } from 'zustand'
import axiosClient from '../api/axiosClient'

export const useOutletStore = create((set, get) => ({
  outlets: [],
  currentOutlet: null,
  isLoading: false,
  error: null,

  fetchOutlets: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await axiosClient.get('/outlets?active=true')
      const data = res.data?.data || []
      
      let savedOutlet = null
      try {
        const saved = localStorage.getItem('skypark_current_outlet')
        if (saved) savedOutlet = JSON.parse(saved)
      } catch {}

      const active = data.find((o) => o.id === savedOutlet?.id) || data[0] || null

      set({
        outlets: data,
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
      localStorage.setItem('skypark_current_outlet', JSON.stringify(outlet))
    } catch {}
  },
}))
