import { create } from 'zustand'

const getStorageKey = (sessionId) => {
  if (sessionId !== undefined && sessionId !== null && sessionId !== '') {
    return `pos_cart_session_${sessionId}`
  }
  return 'pos_cart_takeaway'
}

const persistCart = (sessionId, items) => {
  if (typeof window === 'undefined') return
  try {
    const key = getStorageKey(sessionId)
    if (items && items.length > 0) {
      localStorage.setItem(key, JSON.stringify(items))
    } else {
      localStorage.removeItem(key)
    }
  } catch (e) {
    console.warn('Failed to persist cart to localStorage:', e)
  }
}

const readCart = (sessionId) => {
  if (typeof window === 'undefined') return []
  try {
    const key = getStorageKey(sessionId)
    const saved = localStorage.getItem(key)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) {
        return parsed
      }
    }
  } catch (e) {
    console.warn('Failed to read cart from localStorage:', e)
  }
  return []
}

export const useCartStore = create((set, get) => ({
  items: [], // [{ product, quantity, options, specialInstructions }]
  sessionId: null,

  setSession: (id) => {
    const savedItems = readCart(id)
    set({ sessionId: id ?? null, items: savedItems })
  },

  setItems: (items) => {
    const newItems = items || []
    const { sessionId } = get()
    persistCart(sessionId, newItems)
    set({ items: newItems })
  },

  addItem: (product, quantity = 1, options = [], specialInstructions = '') => {
    set((state) => {
      const existing = state.items.findIndex(
        (i) =>
          i.product?.id === product?.id &&
          JSON.stringify(i.options || []) === JSON.stringify(options || []) &&
          (i.specialInstructions || '') === (specialInstructions || '')
      )
      let newItems
      if (existing >= 0) {
        newItems = [...state.items]
        newItems[existing] = {
          ...newItems[existing],
          quantity: newItems[existing].quantity + quantity,
        }
      } else {
        newItems = [...state.items, { product, quantity, options, specialInstructions }]
      }
      persistCart(state.sessionId, newItems)
      return { items: newItems }
    })
  },

  removeItem: (index) =>
    set((state) => {
      const newItems = state.items.filter((_, i) => i !== index)
      persistCart(state.sessionId, newItems)
      return { items: newItems }
    }),

  updateQuantity: (index, quantity) =>
    set((state) => {
      let newItems
      if (quantity <= 0) {
        newItems = state.items.filter((_, i) => i !== index)
      } else {
        newItems = [...state.items]
        newItems[index] = { ...newItems[index], quantity }
      }
      persistCart(state.sessionId, newItems)
      return { items: newItems }
    }),

  updateItem: (index, updatedData) =>
    set((state) => {
      const newItems = [...state.items]
      if (newItems[index]) {
        newItems[index] = { ...newItems[index], ...updatedData }
      }
      persistCart(state.sessionId, newItems)
      return { items: newItems }
    }),

  clearCart: (sessionId) => {
    const targetSessionId = sessionId !== undefined ? sessionId : get().sessionId
    if (typeof window !== 'undefined') {
      try {
        const key = getStorageKey(targetSessionId)
        localStorage.removeItem(key)
      } catch (e) {}
    }
    set({ items: [] })
  },

  saveCartForSession: (sessionId) => {
    const targetSessionId = sessionId !== undefined ? sessionId : get().sessionId
    const { items } = get()
    persistCart(targetSessionId, items)
  },

  loadCartForSession: (sessionId) => {
    const items = readCart(sessionId)
    set({ items, sessionId: sessionId ?? null })
    return items
  },

  get subtotal() {
    return get().items.reduce((acc, item) => {
      const base = (item.product?.price || 0) * item.quantity
      const opts = (item.options || []).reduce((o, ov) => o + (ov.price || 0), 0) * item.quantity
      return acc + base + opts
    }, 0)
  },

  get itemCount() {
    return get().items.reduce((acc, i) => acc + i.quantity, 0)
  },
}))
