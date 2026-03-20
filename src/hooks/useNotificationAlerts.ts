import { useCallback, useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useToastActions } from '@/components/ui/toast'
import { useWebSocket, useNewOrders, useStuckOrders, useSystemAlerts } from './useWebSocket'

const NOTIFICATION_SOUND_URL = '/notification.mp3'

/**
 * Plays a short notification sound.
 * Falls back to Web Audio API beep if the mp3 file is not available.
 */
function playNotificationSound() {
  const audio = new Audio(NOTIFICATION_SOUND_URL)
  audio.volume = 0.5
  audio.play().catch(() => {
    // Fallback: generate a short beep with Web Audio API
    try {
      const ctx = new AudioContext()
      const oscillator = ctx.createOscillator()
      const gain = ctx.createGain()
      oscillator.connect(gain)
      gain.connect(ctx.destination)
      oscillator.frequency.value = 880
      oscillator.type = 'sine'
      gain.gain.value = 0.3
      oscillator.start()
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
      oscillator.stop(ctx.currentTime + 0.3)
    } catch {
      // Audio not available, silently ignore
    }
  })
}

/**
 * Requests browser notification permission and shows a native notification.
 */
function showBrowserNotification(title: string, body: string) {
  if (!('Notification' in window)) return

  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/favicon.ico' })
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        new Notification(title, { body, icon: '/favicon.ico' })
      }
    })
  }
}

/**
 * Global hook that listens to WebSocket events and shows
 * toast notifications, plays sounds, and triggers browser notifications.
 * Should be mounted once in the main layout.
 */
export function useNotificationAlerts() {
  const toast = useToastActions()
  const queryClient = useQueryClient()
  const permissionRequested = useRef(false)

  // Request browser notification permission on mount
  useEffect(() => {
    if (!permissionRequested.current && 'Notification' in window && Notification.permission === 'default') {
      permissionRequested.current = true
      Notification.requestPermission()
    }
  }, [])

  // Connect WebSocket
  const { isConnected } = useWebSocket()

  // Invalidate unread count when any notification arrives
  const invalidateNotifications = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['notifications'] })
  }, [queryClient])

  // New order handler
  const handleNewOrder = useCallback(
    (order: unknown) => {
      const o = order as { id?: number; orderNumber?: string; restaurantName?: string }
      const title = 'Новый заказ'
      const message = o.orderNumber
        ? `Заказ ${o.orderNumber}${o.restaurantName ? ` — ${o.restaurantName}` : ''}`
        : `Заказ #${o.id || ''}`

      toast.info(title, message)
      playNotificationSound()
      showBrowserNotification(title, message)
      invalidateNotifications()
    },
    [toast, invalidateNotifications]
  )

  // Stuck order handler
  const handleStuckOrder = useCallback(
    (order: unknown) => {
      const o = order as { id?: number; orderNumber?: string; reason?: string }
      const title = 'Заказ задерживается'
      const message = o.orderNumber
        ? `Заказ ${o.orderNumber}${o.reason ? `: ${o.reason}` : ''}`
        : `Заказ #${o.id || ''} требует внимания`

      toast.warning(title, message)
      playNotificationSound()
      showBrowserNotification(title, message)
      invalidateNotifications()
    },
    [toast, invalidateNotifications]
  )

  // System alert handler
  const handleSystemAlert = useCallback(
    (alert: unknown) => {
      const a = alert as { title?: string; message?: string; severity?: string }
      const title = a.title || 'Системное уведомление'
      const message = a.message || ''

      if (a.severity === 'ERROR' || a.severity === 'CRITICAL') {
        toast.error(title, message)
      } else if (a.severity === 'WARNING') {
        toast.warning(title, message)
      } else {
        toast.info(title, message)
      }

      playNotificationSound()
      showBrowserNotification(title, message)
      invalidateNotifications()
    },
    [toast, invalidateNotifications]
  )

  useNewOrders(handleNewOrder)
  useStuckOrders(handleStuckOrder)
  useSystemAlerts(handleSystemAlert)

  return { isConnected }
}
