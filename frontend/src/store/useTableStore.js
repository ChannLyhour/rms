import { create } from 'zustand'
import { posApi } from '../api/posApi'

export const useTableStore = create((set, get) => ({
  tables: [],
  sessions: [],
  loading: false,
  error: null,

  fetchTables: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await posApi.getTables()
      set({ tables: data.data || [] })
    } catch (err) {
      set({ error: err.message })
    } finally {
      set({ loading: false })
    }
  },

  fetchSessions: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await posApi.getSessions()
      set({ sessions: data.data || [] })
    } catch (err) {
      set({ error: err.message })
    } finally {
      set({ loading: false })
    }
  },

  openSession: async (tableId) => {
    const { data } = await posApi.openSession({ table_id: tableId })
    await get().fetchSessions()
    await get().fetchTables()
    return data
  },

  closeSession: async (sessionId, tableId) => {
    await posApi.closeSession(sessionId, tableId)
    await get().fetchSessions()
    await get().fetchTables()
  },

  updateTableStatus: async (tableId, status) => {
    await posApi.updateTableStatus(tableId, status)
    await get().fetchTables()
  },
}))
