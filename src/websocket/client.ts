import { Client, type IMessage } from '@stomp/stompjs'

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws'

export type WebSocketTopic =
  | '/topic/orders/new'
  | '/topic/orders/stuck'
  | '/topic/couriers/status'
  | '/topic/system/alerts'

export interface WebSocketMessage<T = unknown> {
  type: string
  data: T
  timestamp: string
}

type MessageHandler<T = unknown> = (message: WebSocketMessage<T>) => void

class WebSocketClient {
  private client: Client | null = null
  private subscriptions: Map<string, { unsubscribe: () => void }> = new Map()
  private handlers: Map<string, Set<MessageHandler>> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 2000

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client = new Client({
        brokerURL: WS_URL,
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        debug: (str) => {
          if (import.meta.env.DEV) {
            console.log('[WS Debug]:', str)
          }
        },
        reconnectDelay: this.reconnectDelay,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          console.log('[WS] Connected')
          this.reconnectAttempts = 0
          resolve()
        },
        onDisconnect: () => {
          console.log('[WS] Disconnected')
        },
        onStompError: (frame) => {
          console.error('[WS] STOMP Error:', frame.headers['message'])
          reject(new Error(frame.headers['message']))
        },
        onWebSocketError: (event) => {
          console.error('[WS] WebSocket Error:', event)
          this.handleReconnect()
        },
        onWebSocketClose: () => {
          console.log('[WS] WebSocket Closed')
          this.handleReconnect()
        },
      })

      this.client.activate()
    })
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`[WS] Reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`)
    } else {
      console.error('[WS] Max reconnect attempts reached')
    }
  }

  disconnect(): void {
    if (this.client) {
      this.subscriptions.forEach((sub) => sub.unsubscribe())
      this.subscriptions.clear()
      this.handlers.clear()
      this.client.deactivate()
      this.client = null
    }
  }

  subscribe<T = unknown>(topic: WebSocketTopic, handler: MessageHandler<T>): () => void {
    if (!this.client || !this.client.connected) {
      console.warn('[WS] Cannot subscribe: not connected')
      return () => {}
    }

    // Add handler
    if (!this.handlers.has(topic)) {
      this.handlers.set(topic, new Set())
    }
    this.handlers.get(topic)!.add(handler as MessageHandler)

    // Subscribe if not already subscribed
    if (!this.subscriptions.has(topic)) {
      const subscription = this.client.subscribe(topic, (message: IMessage) => {
        try {
          const parsed = JSON.parse(message.body) as WebSocketMessage<T>
          const topicHandlers = this.handlers.get(topic)
          topicHandlers?.forEach((h) => h(parsed))
        } catch (error) {
          console.error('[WS] Failed to parse message:', error)
        }
      })

      this.subscriptions.set(topic, subscription)
    }

    // Return unsubscribe function
    return () => {
      const topicHandlers = this.handlers.get(topic)
      if (topicHandlers) {
        topicHandlers.delete(handler as MessageHandler)
        if (topicHandlers.size === 0) {
          this.subscriptions.get(topic)?.unsubscribe()
          this.subscriptions.delete(topic)
          this.handlers.delete(topic)
        }
      }
    }
  }

  isConnected(): boolean {
    return this.client?.connected ?? false
  }
}

// Singleton instance
export const wsClient = new WebSocketClient()
