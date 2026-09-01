import { useEffect, useRef, useState, useCallback } from 'react'

const getWsUrl = (path, room) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1'
  const isHttps = window.location.protocol === 'https:'
  const wsProtocol = isHttps ? 'wss:' : 'ws:'
  


  if (baseUrl.startsWith('http')) {
    const wsBase = baseUrl.replace(/^http(s)?:\/\//, '')
    // The backend registers /ws at the root of the api group (e.g. /api/v1/ws)
    return `${wsProtocol}//${wsBase}${path}?room=${room}`
  } else {
    // Relative URL
    const host = window.location.host
    return `${wsProtocol}//${host}${baseUrl}${path}?room=${room}`
  }
}

export const useWebSocket = (room) => {
  const [isConnected, setIsConnected] = useState(false)
  const ws = useRef(null)
  
  // Keep track of event listeners
  const listeners = useRef(new Map())

  const onMessage = useCallback((event) => {
    try {
      const raw = typeof event.data === 'string' ? event.data : ''
      // Support newline-delimited JSON stream when multiple messages are batched in a single frame
      const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean)
      for (const line of lines) {
        try {
          const data = JSON.parse(line)
          const eventName = data.event
          if (eventName && listeners.current.has(eventName)) {
            listeners.current.get(eventName).forEach((cb) => cb(data))
          }
        } catch {
          // Ignore invalid individual line chunk
        }
      }
    } catch (e) {
      console.error('Failed to parse WS message:', e)
    }
  }, [])

  useEffect(() => {
    if (!room) return

    let reconnectTimer = null
    let isUnmounted = false

    const connect = () => {
      if (isUnmounted) return
      try {
        const wsUrl = getWsUrl('/ws', room)
        const socket = new WebSocket(wsUrl)
        ws.current = socket

        socket.onopen = () => {
          if (isUnmounted) {
            try { socket.close() } catch {}
            return
          }
          console.log('✅ WebSocket Connected successfully to room:', room)
          setIsConnected(true)
          if (reconnectTimer) clearTimeout(reconnectTimer)
        }

        socket.onmessage = onMessage

        socket.onclose = () => {
          if (isUnmounted) return
          setIsConnected(false)
          if (reconnectTimer) clearTimeout(reconnectTimer)
          reconnectTimer = setTimeout(connect, 3000)
        }

        socket.onerror = () => {
          if (isUnmounted) return
          try { socket.close() } catch {}
        }
      } catch (err) {
        if (!isUnmounted) {
          reconnectTimer = setTimeout(connect, 3000)
        }
      }
    }

    connect()

    return () => {
      isUnmounted = true
      if (reconnectTimer) clearTimeout(reconnectTimer)
      if (ws.current) {
        const socket = ws.current
        socket.onopen = null
        socket.onclose = null
        socket.onerror = null
        socket.onmessage = null
        try {
          if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
            socket.close()
          }
        } catch {}
        ws.current = null
      }
    }
  }, [room, onMessage])

  // Method to subscribe to specific events
  const subscribe = useCallback((eventName, callback) => {
    if (!listeners.current.has(eventName)) {
      listeners.current.set(eventName, new Set())
    }
    listeners.current.get(eventName).add(callback)
    
    // Return unsubscribe function
    return () => {
      if (listeners.current.has(eventName)) {
        listeners.current.get(eventName).delete(callback)
      }
    }
  }, [])

  return { isConnected, subscribe }
}
