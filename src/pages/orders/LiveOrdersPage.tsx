import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Eye,
  RefreshCw,
  Loader2,
  Clock,
  AlertCircle,
  CheckCircle,
  ChefHat,
  Package,
  Truck,
  Timer,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Select,
} from '@/components/ui'
import { formatDateTime, formatCurrency } from '@/lib/utils'
import type { Order, OrderStatus } from '@/types'
import { useActiveRestaurantOrders } from '@/hooks/useOrders'
import { useRestaurants } from '@/hooks/useRestaurants'

const statusLabels: Record<OrderStatus, string> = {
  CREATED: 'Создан',
  PENDING: 'Ожидает',
  CONFIRMED: 'Подтверждён',
  ACCEPTED: 'Принят',
  PREPARING: 'Готовится',
  READY: 'Готов',
  READY_FOR_PICKUP: 'Готов к выдаче',
  PICKED_UP: 'Забран',
  IN_TRANSIT: 'В пути',
  DELIVERING: 'Доставляется',
  DELIVERED: 'Доставлен',
  COMPLETED: 'Завершён',
  CANCELLED: 'Отменён',
  REFUNDED: 'Возврат',
}

const statusColors: Record<OrderStatus, 'default' | 'secondary' | 'destructive' | 'success' | 'warning'> = {
  CREATED: 'secondary',
  PENDING: 'secondary',
  CONFIRMED: 'default',
  ACCEPTED: 'default',
  PREPARING: 'warning',
  READY: 'warning',
  READY_FOR_PICKUP: 'warning',
  PICKED_UP: 'default',
  IN_TRANSIT: 'default',
  DELIVERING: 'default',
  DELIVERED: 'success',
  COMPLETED: 'success',
  CANCELLED: 'destructive',
  REFUNDED: 'destructive',
}

const statusIcons: Partial<Record<OrderStatus, React.ReactNode>> = {
  CREATED: <AlertCircle className="h-4 w-4" />,
  ACCEPTED: <CheckCircle className="h-4 w-4" />,
  PREPARING: <ChefHat className="h-4 w-4" />,
  READY: <Package className="h-4 w-4" />,
  PICKED_UP: <Truck className="h-4 w-4" />,
  IN_TRANSIT: <Truck className="h-4 w-4" />,
}

function OrderCard({ order }: { order: Order }) {
  const timeSinceCreated = order.createdAt
    ? Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000)
    : 0

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">
              {order.externalOrderNo || `#${order.id}`}
            </CardTitle>
            <Badge variant={statusColors[order.status]} className="gap-1">
              {statusIcons[order.status]}
              {statusLabels[order.status]}
            </Badge>
          </div>
          <Link to={`/orders/${order.id}`}>
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[hsl(var(--muted-foreground))]">Клиент:</span>
            <span className="font-medium">{order.consumerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[hsl(var(--muted-foreground))]">Сумма:</span>
            <span className="font-medium">{formatCurrency(order.total)}</span>
          </div>
          {order.orderType && (
            <div className="flex justify-between">
              <span className="text-[hsl(var(--muted-foreground))]">Тип:</span>
              <span className="font-medium">
                {order.orderType === 'DELIVERY' && 'Доставка'}
                {order.orderType === 'TAKEAWAY' && 'Самовывоз'}
                {order.orderType === 'PICKUP' && 'Самовывоз'}
                {order.orderType === 'DINE_IN' && 'В зале'}
              </span>
            </div>
          )}
          {order.estimatedPrepTimeMinutes && (
            <div className="flex justify-between">
              <span className="text-[hsl(var(--muted-foreground))]">Ожидаемое время:</span>
              <span className="font-medium">{order.estimatedPrepTimeMinutes} мин</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-[hsl(var(--border))] pt-3">
          <div className="flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))]">
            <Timer className="h-4 w-4" />
            <span>{timeSinceCreated} мин назад</span>
          </div>
          <span className="text-xs text-[hsl(var(--muted-foreground))]">
            {formatDateTime(order.createdAt)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

export function LiveOrdersPage() {
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | null>(null)

  // Fetch restaurants for the dropdown
  const { data: restaurantsData, isLoading: restaurantsLoading } = useRestaurants({ size: 100 })
  const restaurants = restaurantsData?.data?.content ?? []

  // Fetch active orders for selected restaurant
  const {
    data: ordersData,
    isLoading: ordersLoading,
    refetch: refetchOrders,
    isFetching,
  } = useActiveRestaurantOrders(selectedRestaurantId || 0)

  const activeOrders = ordersData?.data ?? []

  // Group orders by status for better visualization
  const ordersByStatus = {
    new: activeOrders.filter((o) => ['CREATED', 'PENDING'].includes(o.status)),
    accepted: activeOrders.filter((o) => o.status === 'ACCEPTED'),
    preparing: activeOrders.filter((o) => o.status === 'PREPARING'),
    ready: activeOrders.filter((o) => ['READY', 'READY_FOR_PICKUP'].includes(o.status)),
    inDelivery: activeOrders.filter((o) =>
      ['PICKED_UP', 'IN_TRANSIT', 'DELIVERING'].includes(o.status)
    ),
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Активные заказы</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Мониторинг заказов в реальном времени
          </p>
        </div>
        <div className="flex items-center gap-4">
          {isFetching && (
            <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Обновление...</span>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchOrders()}
            disabled={!selectedRestaurantId || ordersLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${ordersLoading ? 'animate-spin' : ''}`} />
            Обновить
          </Button>
        </div>
      </div>

      {/* Restaurant selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Выберите ресторан:</label>
            <Select
              value={selectedRestaurantId?.toString() || ''}
              onChange={(e) => setSelectedRestaurantId(e.target.value ? parseInt(e.target.value) : null)}
              className="max-w-md"
              disabled={restaurantsLoading}
            >
              <option value="">Выберите ресторан...</option>
              {restaurants.map((restaurant) => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </option>
              ))}
            </Select>
            {restaurantsLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-[hsl(var(--muted-foreground))]" />
            )}
          </div>
          {selectedRestaurantId && (
            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
              Данные обновляются автоматически каждые 30 секунд
            </p>
          )}
        </CardContent>
      </Card>

      {!selectedRestaurantId ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="mx-auto h-12 w-12 text-[hsl(var(--muted-foreground))]" />
            <h3 className="mt-4 text-lg font-medium">Выберите ресторан</h3>
            <p className="mt-2 text-[hsl(var(--muted-foreground))]">
              Для просмотра активных заказов выберите ресторан из списка выше
            </p>
          </CardContent>
        </Card>
      ) : ordersLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--muted-foreground))]" />
        </div>
      ) : activeOrders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-[hsl(var(--success))]" />
            <h3 className="mt-4 text-lg font-medium">Нет активных заказов</h3>
            <p className="mt-2 text-[hsl(var(--muted-foreground))]">
              Все заказы выполнены или пока нет новых заказов
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          {/* New orders column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-[hsl(var(--secondary))]" />
              <h2 className="font-semibold">Новые</h2>
              <Badge variant="secondary">{ordersByStatus.new.length}</Badge>
            </div>
            {ordersByStatus.new.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
            {ordersByStatus.new.length === 0 && (
              <div className="rounded-lg border border-dashed border-[hsl(var(--border))] p-4 text-center text-sm text-[hsl(var(--muted-foreground))]">
                Нет новых заказов
              </div>
            )}
          </div>

          {/* Accepted column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-[hsl(var(--primary))]" />
              <h2 className="font-semibold">Принят</h2>
              <Badge variant="default">{ordersByStatus.accepted.length}</Badge>
            </div>
            {ordersByStatus.accepted.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
            {ordersByStatus.accepted.length === 0 && (
              <div className="rounded-lg border border-dashed border-[hsl(var(--border))] p-4 text-center text-sm text-[hsl(var(--muted-foreground))]">
                Нет заказов
              </div>
            )}
          </div>

          {/* Preparing column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ChefHat className="h-5 w-5 text-[hsl(var(--warning))]" />
              <h2 className="font-semibold">Готовится</h2>
              <Badge variant="warning">{ordersByStatus.preparing.length}</Badge>
            </div>
            {ordersByStatus.preparing.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
            {ordersByStatus.preparing.length === 0 && (
              <div className="rounded-lg border border-dashed border-[hsl(var(--border))] p-4 text-center text-sm text-[hsl(var(--muted-foreground))]">
                Нет заказов
              </div>
            )}
          </div>

          {/* Ready column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-[hsl(var(--warning))]" />
              <h2 className="font-semibold">Готов</h2>
              <Badge variant="warning">{ordersByStatus.ready.length}</Badge>
            </div>
            {ordersByStatus.ready.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
            {ordersByStatus.ready.length === 0 && (
              <div className="rounded-lg border border-dashed border-[hsl(var(--border))] p-4 text-center text-sm text-[hsl(var(--muted-foreground))]">
                Нет заказов
              </div>
            )}
          </div>

          {/* In delivery column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-[hsl(var(--primary))]" />
              <h2 className="font-semibold">В доставке</h2>
              <Badge variant="default">{ordersByStatus.inDelivery.length}</Badge>
            </div>
            {ordersByStatus.inDelivery.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
            {ordersByStatus.inDelivery.length === 0 && (
              <div className="rounded-lg border border-dashed border-[hsl(var(--border))] p-4 text-center text-sm text-[hsl(var(--muted-foreground))]">
                Нет заказов
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats summary */}
      {selectedRestaurantId && activeOrders.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-5">
              <div className="text-center">
                <div className="text-2xl font-bold">{activeOrders.length}</div>
                <div className="text-sm text-[hsl(var(--muted-foreground))]">Всего активных</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{ordersByStatus.new.length}</div>
                <div className="text-sm text-[hsl(var(--muted-foreground))]">Ожидают принятия</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{ordersByStatus.preparing.length}</div>
                <div className="text-sm text-[hsl(var(--muted-foreground))]">Готовятся</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{ordersByStatus.ready.length}</div>
                <div className="text-sm text-[hsl(var(--muted-foreground))]">Готовы к выдаче</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{ordersByStatus.inDelivery.length}</div>
                <div className="text-sm text-[hsl(var(--muted-foreground))]">В доставке</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
