import { useState, useCallback } from 'react'
import {
  Wifi,
  WifiOff,
  ShoppingCart,
  AlertTriangle,
  Bike,
  Bell,
  Trash2,
  Radio,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
} from '@/components/ui'
import { formatDateTime } from '@/lib/utils'
import {
  useWebSocket,
  useSubscription,
  useNewOrders,
  useStuckOrders,
  useCourierStatusUpdates,
  useSystemAlerts,
} from '@/hooks/useWebSocket'
import type { WebSocketMessage } from '@/websocket/client'

interface EventItem {
  id: number
  type: string
  data: unknown
  receivedAt: string
}

let eventCounter = 0

export function RealtimeMonitorPage() {
  const { isConnected, error } = useWebSocket()
  const [events, setEvents] = useState<EventItem[]>([])
  const [customTopic, setCustomTopic] = useState('')
  const [customEvents, setCustomEvents] = useState<EventItem[]>([])

  const addEvent = useCallback((type: string, data: unknown) => {
    setEvents((prev) => [
      { id: ++eventCounter, type, data, receivedAt: new Date().toISOString() },
      ...prev.slice(0, 99),
    ])
  }, [])

  const addCustomEvent = useCallback((data: unknown) => {
    setCustomEvents((prev) => [
      { id: ++eventCounter, type: 'CUSTOM', data, receivedAt: new Date().toISOString() },
      ...prev.slice(0, 49),
    ])
  }, [])

  // Subscribe to all WebSocket topics
  useNewOrders(
    useCallback((order: unknown) => addEvent('NEW_ORDER', order), [addEvent])
  )

  useStuckOrders(
    useCallback((order: unknown) => addEvent('STUCK_ORDER', order), [addEvent])
  )

  useCourierStatusUpdates(
    useCallback((courier: unknown) => addEvent('COURIER_STATUS', courier), [addEvent])
  )

  useSystemAlerts(
    useCallback((alert: unknown) => addEvent('SYSTEM_ALERT', alert), [addEvent])
  )

  // Custom subscription
  const customHandler = useCallback(
    (message: WebSocketMessage) => addCustomEvent(message.data),
    [addCustomEvent]
  )
  useSubscription(
    customTopic as '/topic/orders/new',
    customHandler,
    !!customTopic
  )

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'NEW_ORDER': return <ShoppingCart className="h-4 w-4 text-[hsl(var(--success))]" />
      case 'STUCK_ORDER': return <AlertTriangle className="h-4 w-4 text-[hsl(var(--warning))]" />
      case 'COURIER_STATUS': return <Bike className="h-4 w-4 text-[hsl(var(--primary))]" />
      case 'SYSTEM_ALERT': return <Bell className="h-4 w-4 text-[hsl(var(--destructive))]" />
      default: return <Radio className="h-4 w-4" />
    }
  }

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'NEW_ORDER': return <Badge variant="success">Новый заказ</Badge>
      case 'STUCK_ORDER': return <Badge variant="warning">Застрявший заказ</Badge>
      case 'COURIER_STATUS': return <Badge variant="default">Статус курьера</Badge>
      case 'SYSTEM_ALERT': return <Badge variant="destructive">Системное</Badge>
      default: return <Badge variant="secondary">{type}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Мониторинг реального времени</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            WebSocket подписки на события платформы
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Badge variant="success" className="flex items-center gap-1">
              <Wifi className="h-3 w-3" />
              Подключено
            </Badge>
          ) : (
            <Badge variant="destructive" className="flex items-center gap-1">
              <WifiOff className="h-3 w-3" />
              Отключено
            </Badge>
          )}
          {error && <Badge variant="destructive">{error}</Badge>}
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--success))]/10">
                <ShoppingCart className="h-5 w-5 text-[hsl(var(--success))]" />
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Новые заказы</p>
                <p className="text-xl font-bold">
                  {events.filter((e) => e.type === 'NEW_ORDER').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--warning))]/10">
                <AlertTriangle className="h-5 w-5 text-[hsl(var(--warning))]" />
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Застрявшие</p>
                <p className="text-xl font-bold">
                  {events.filter((e) => e.type === 'STUCK_ORDER').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10">
                <Bike className="h-5 w-5 text-[hsl(var(--primary))]" />
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Обновления курьеров</p>
                <p className="text-xl font-bold">
                  {events.filter((e) => e.type === 'COURIER_STATUS').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--destructive))]/10">
                <Bell className="h-5 w-5 text-[hsl(var(--destructive))]" />
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Системные алерты</p>
                <p className="text-xl font-bold">
                  {events.filter((e) => e.type === 'SYSTEM_ALERT').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Custom Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5" />
            Пользовательская подписка
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <input
              className="flex h-10 w-full rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm"
              placeholder="/topic/custom/channel"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
            />
            {customTopic && <Badge variant="success">Подписан</Badge>}
          </div>
          {customEvents.length > 0 && (
            <div className="max-h-40 overflow-auto rounded-lg bg-[hsl(var(--muted))] p-3">
              {customEvents.map((e) => (
                <div key={e.id} className="text-xs font-mono mb-1">
                  <span className="text-[hsl(var(--muted-foreground))]">{formatDateTime(e.receivedAt)}</span>{' '}
                  {JSON.stringify(e.data).slice(0, 100)}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Feed */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Лента событий ({events.length})</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setEvents([])}>
            <Trash2 className="mr-2 h-4 w-4" />
            Очистить
          </Button>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-12">
              <Radio className="mx-auto h-12 w-12 text-[hsl(var(--muted-foreground))] animate-pulse" />
              <p className="mt-4 text-[hsl(var(--muted-foreground))]">
                Ожидание событий...
              </p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                События появятся здесь при получении через WebSocket
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-auto">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 rounded-lg border border-[hsl(var(--border))] p-3"
                >
                  {getEventIcon(event.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {getEventBadge(event.type)}
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">
                        {formatDateTime(event.receivedAt)}
                      </span>
                    </div>
                    <pre className="mt-1 text-xs font-mono text-[hsl(var(--muted-foreground))] overflow-hidden text-ellipsis whitespace-nowrap">
                      {JSON.stringify(event.data, null, 0).slice(0, 200)}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
