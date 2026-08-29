import { useEffect, useState, useCallback } from 'react'
import { wsClient, type WebSocketTopic, type WebSocketMessage } from '@/websocket/client'
import { useAuthStore } from '@/store/auth.store'

export function useWebSocket() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [isConnected, setIsConnected] = useState(() => wsClient.isConnected())
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    // Reflect live connection state — the socket may drop and reconnect on its
    // own (token refresh, tab focus, network back) without this effect re-running.
    const unsubscribe = wsClient.onConnectionChange(setIsConnected)

    wsClient.connect().catch((err) => {
      setError(err instanceof Error ? err.message : 'Connection failed')
    })

    return () => {
      unsubscribe()
      wsClient.disconnect()
    }
  }, [isAuthenticated])

  return { isConnected, error }
}

export function useSubscription<T = unknown>(
  topic: WebSocketTopic,
  handler: (message: WebSocketMessage<T>) => void,
  enabled = true
) {
  const { isConnected } = useWebSocket()

  useEffect(() => {
    if (!enabled || !isConnected) {
      return
    }

    const unsubscribe = wsClient.subscribe(topic, handler)
    return unsubscribe
  }, [topic, handler, enabled, isConnected])
}

// Specialized hooks for common topics
export function useNewOrders(onNewOrder: (order: unknown) => void) {
  const handler = useCallback(
    (message: WebSocketMessage) => {
      if (message.type === 'NEW_ORDER') {
        onNewOrder(message.data)
      }
    },
    [onNewOrder]
  )

  useSubscription('/topic/orders/new', handler)
}

export function useStuckOrders(onStuckOrder: (order: unknown) => void) {
  const handler = useCallback(
    (message: WebSocketMessage) => {
      if (message.type === 'STUCK_ORDER') {
        onStuckOrder(message.data)
      }
    },
    [onStuckOrder]
  )

  useSubscription('/topic/orders/stuck', handler)
}

export function useCourierStatusUpdates(onStatusUpdate: (courier: unknown) => void) {
  const handler = useCallback(
    (message: WebSocketMessage) => {
      if (message.type === 'COURIER_STATUS') {
        onStatusUpdate(message.data)
      }
    },
    [onStatusUpdate]
  )

  useSubscription('/topic/couriers/status', handler)
}

export function useSystemAlerts(onAlert: (alert: unknown) => void) {
  const handler = useCallback(
    (message: WebSocketMessage) => {
      onAlert(message.data)
    },
    [onAlert]
  )

  useSubscription('/topic/system/alerts', handler)
}
