import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs'
import {
  getAccessToken,
  getValidAccessToken,
  handleSessionExpired,
  isTerminalRefreshError,
} from '@/api/tokens'

/**
 * Resolve the WebSocket endpoint.
 * - If VITE_WS_URL is set at build time (e.g. local dev .env), use it.
 * - Otherwise derive a same-origin URL so the browser connects to the host
 *   that served the app and nginx proxies /ws to the backend. Uses wss:// on
 *   HTTPS pages to avoid mixed-content blocking.
 */
function resolveWsUrl(): string {
  const configured = import.meta.env.VITE_WS_URL
  if (configured) return configured
  if (typeof window !== 'undefined' && window.location) {
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    return `${proto}//${window.location.host}/ws`
  }
  return 'ws://localhost:8080/ws'
}

const WS_URL = resolveWsUrl()

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
type ConnectionListener = (connected: boolean) => void

class WebSocketClient {
  private client: Client | null = null
  private subscriptions: Map<string, StompSubscription> = new Map()
  private handlers: Map<string, Set<MessageHandler>> = new Map()
  private connectionListeners = new Set<ConnectionListener>()

  // Exponential backoff with NO hard attempt cap — only the delay is capped, so
  // the socket keeps trying to reconnect for as long as the app is open.
  private reconnectAttempts = 0
  private readonly baseReconnectDelay = 1000
  private readonly maxReconnectDelay = 30_000

  // Reference count so the shared singleton stays up while any consumer needs
  // it (many hooks call connect/disconnect) and only tears down at zero.
  private refCount = 0
  private stopped = false
  private wakeBound = false

  private nextReconnectDelay(): number {
    const delay = Math.min(
      this.baseReconnectDelay * 2 ** this.reconnectAttempts,
      this.maxReconnectDelay
    )
    // Jitter avoids a thundering herd of tabs reconnecting in lock-step.
    return delay + Math.floor(Math.random() * 300)
  }

  connect(): Promise<void> {
    this.refCount++
    this.stopped = false

    // Already have a client (connected or reconnecting) — nothing to do.
    if (this.client) return Promise.resolve()

    this.bindWakeHandlers()

    const client = new Client({
      brokerURL: WS_URL,
      // STOMP authenticates ONCE at CONNECT and is never re-checked, so a fresh
      // token is only needed at (re)connect time. Refresh (if expired) and
      // rebuild the CONNECT header before EVERY connection attempt.
      beforeConnect: async () => {
        try {
          const token = await getValidAccessToken()
          client.connectHeaders = { Authorization: `Bearer ${token}` }
        } catch (err) {
          if (isTerminalRefreshError(err)) {
            // Refresh token dead/revoked — stop reconnecting and send to login.
            this.stopped = true
            client.deactivate().catch(() => {})
            handleSessionExpired()
          } else {
            // Transient (network) — keep the session. Try the existing token;
            // if the socket still can't connect, backoff will retry.
            const existing = getAccessToken()
            if (existing) client.connectHeaders = { Authorization: `Bearer ${existing}` }
          }
        }
      },
      reconnectDelay: this.baseReconnectDelay,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        if (import.meta.env.DEV) console.log('[WS Debug]:', str)
      },
      onConnect: () => {
        console.log('[WS] Connected')
        this.reconnectAttempts = 0
        client.reconnectDelay = this.baseReconnectDelay
        // StompJS does not auto-resubscribe — re-establish every topic on the
        // new connection so live data resumes after a reconnect.
        this.subscriptions.clear()
        this.handlers.forEach((_handlers, topic) => this.establishSubscription(topic))
        this.notifyConnection(true)
      },
      onDisconnect: () => {
        console.log('[WS] Disconnected')
        this.notifyConnection(false)
      },
      onStompError: (frame) => {
        console.error('[WS] STOMP Error:', frame.headers['message'])
      },
      onWebSocketError: (event) => {
        console.error('[WS] WebSocket Error:', event)
      },
      onWebSocketClose: () => {
        console.log('[WS] WebSocket Closed')
        this.notifyConnection(false)
        if (!this.stopped) {
          // Grow the backoff for the next automatic reconnect attempt.
          this.reconnectAttempts++
          client.reconnectDelay = this.nextReconnectDelay()
        }
      },
    })

    this.client = client
    client.activate()
    return Promise.resolve()
  }

  disconnect(): void {
    // Only tear down when the last consumer has released the connection.
    this.refCount = Math.max(0, this.refCount - 1)
    if (this.refCount > 0) return

    this.stopped = true
    this.unbindWakeHandlers()
    this.subscriptions.forEach((sub) => {
      try {
        sub.unsubscribe()
      } catch {
        /* socket already gone */
      }
    })
    this.subscriptions.clear()
    this.handlers.clear()
    this.client?.deactivate().catch(() => {})
    this.client = null
    this.notifyConnection(false)
  }

  subscribe<T = unknown>(topic: WebSocketTopic, handler: MessageHandler<T>): () => void {
    if (!this.handlers.has(topic)) {
      this.handlers.set(topic, new Set())
    }
    this.handlers.get(topic)!.add(handler as MessageHandler)

    // Establish the STOMP subscription now if we're connected; otherwise it is
    // (re)established in onConnect.
    if (this.client?.connected && !this.subscriptions.has(topic)) {
      this.establishSubscription(topic)
    }

    return () => {
      const topicHandlers = this.handlers.get(topic)
      if (!topicHandlers) return
      topicHandlers.delete(handler as MessageHandler)
      if (topicHandlers.size === 0) {
        try {
          this.subscriptions.get(topic)?.unsubscribe()
        } catch {
          /* ignore */
        }
        this.subscriptions.delete(topic)
        this.handlers.delete(topic)
      }
    }
  }

  private establishSubscription(topic: string): void {
    if (!this.client?.connected) return
    const subscription = this.client.subscribe(topic, (message: IMessage) => {
      try {
        const parsed = JSON.parse(message.body) as WebSocketMessage
        this.handlers.get(topic)?.forEach((h) => h(parsed))
      } catch (error) {
        console.error('[WS] Failed to parse message:', error)
      }
    })
    this.subscriptions.set(topic, subscription)
  }

  onConnectionChange(listener: ConnectionListener): () => void {
    this.connectionListeners.add(listener)
    listener(this.isConnected())
    return () => this.connectionListeners.delete(listener)
  }

  private notifyConnection(connected: boolean): void {
    this.connectionListeners.forEach((listener) => listener(connected))
  }

  isConnected(): boolean {
    return this.client?.connected ?? false
  }

  // ---- Reconnect on wake ("focus" / "online" / tab becomes visible) --------
  // The socket auto-reconnects on its own backoff; these just make it reconnect
  // IMMEDIATELY when the user comes back, so live data resumes without waiting.
  private bindWakeHandlers(): void {
    if (this.wakeBound || typeof window === 'undefined') return
    window.addEventListener('focus', this.reconnectNow)
    window.addEventListener('online', this.reconnectNow)
    document.addEventListener('visibilitychange', this.onVisibilityChange)
    this.wakeBound = true
  }

  private unbindWakeHandlers(): void {
    if (!this.wakeBound || typeof window === 'undefined') return
    window.removeEventListener('focus', this.reconnectNow)
    window.removeEventListener('online', this.reconnectNow)
    document.removeEventListener('visibilitychange', this.onVisibilityChange)
    this.wakeBound = false
  }

  private onVisibilityChange = (): void => {
    if (document.visibilityState === 'visible') this.reconnectNow()
  }

  private reconnectNow = (): void => {
    if (this.stopped || !this.client) return
    if (this.client.connected) return // already up, nothing to do

    this.reconnectAttempts = 0
    this.client.reconnectDelay = this.baseReconnectDelay

    if (this.client.active) {
      // Force an immediate attempt instead of waiting out the backoff timer.
      this.client
        .deactivate()
        .then(() => {
          if (!this.stopped) this.client?.activate()
        })
        .catch(() => {
          if (!this.stopped) this.client?.activate()
        })
    } else {
      this.client.activate()
    }
  }
}

// Singleton instance
export const wsClient = new WebSocketClient()
