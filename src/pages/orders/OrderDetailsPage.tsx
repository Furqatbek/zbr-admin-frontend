import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  UtensilsCrossed,
  ChefHat,
  FileText,
  Loader2,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Modal,
  ModalFooter,
  Select,
  Textarea,
} from '@/components/ui'
import { formatDateTime, formatCurrency } from '@/lib/utils'
import type { OrderStatus } from '@/types'
import { useOrder, useUpdateOrderStatus } from '@/hooks'

const statusLabels: Record<OrderStatus, string> = {
  PENDING: 'Ожидает',
  CONFIRMED: 'Подтверждён',
  PREPARING: 'Готовится',
  READY_FOR_PICKUP: 'Готов к выдаче',
  PICKED_UP: 'Забран',
  DELIVERING: 'Доставляется',
  DELIVERED: 'Доставлен',
  CANCELLED: 'Отменён',
}

const statusColors: Record<OrderStatus, 'default' | 'secondary' | 'destructive' | 'success' | 'warning'> = {
  PENDING: 'secondary',
  CONFIRMED: 'default',
  PREPARING: 'warning',
  READY_FOR_PICKUP: 'warning',
  PICKED_UP: 'default',
  DELIVERING: 'default',
  DELIVERED: 'success',
  CANCELLED: 'destructive',
}

const statusIcons: Record<OrderStatus, React.ReactNode> = {
  PENDING: <Clock className="h-4 w-4" />,
  CONFIRMED: <CheckCircle className="h-4 w-4" />,
  PREPARING: <ChefHat className="h-4 w-4" />,
  READY_FOR_PICKUP: <Package className="h-4 w-4" />,
  PICKED_UP: <Truck className="h-4 w-4" />,
  DELIVERING: <Truck className="h-4 w-4" />,
  DELIVERED: <CheckCircle className="h-4 w-4" />,
  CANCELLED: <XCircle className="h-4 w-4" />,
}

const allStatuses: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY_FOR_PICKUP',
  'PICKED_UP',
  'DELIVERING',
  'DELIVERED',
  'CANCELLED',
]

export function OrderDetailsPage() {
  const { id } = useParams()
  const orderId = parseInt(id || '0', 10)

  const { data: orderData, isLoading } = useOrder(orderId)
  const order = orderData?.data

  const updateStatusMutation = useUpdateOrderStatus()

  // Modal state
  const [statusModal, setStatusModal] = useState(false)
  const [newStatus, setNewStatus] = useState<OrderStatus>('PENDING')
  const [statusReason, setStatusReason] = useState('')

  const handleStatusChange = () => {
    if (order) {
      updateStatusMutation.mutate(
        { id: order.id, data: { status: newStatus, reason: statusReason } },
        {
          onSuccess: () => {
            setStatusModal(false)
            setStatusReason('')
          },
        }
      )
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--muted-foreground))]" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/orders">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Заказ не найден</h1>
            <p className="text-[hsl(var(--muted-foreground))]">ID: {id}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back button and header */}
      <div className="flex items-center gap-4">
        <Link to="/orders">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Заказ #{id}</h1>
            <Badge variant={statusColors[order.status]} className="text-sm">
              {statusLabels[order.status]}
            </Badge>
          </div>
          <p className="text-[hsl(var(--muted-foreground))]">
            Создан {formatDateTime(order.createdAt)}
          </p>
        </div>
        {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
          <Button
            onClick={() => {
              setNewStatus(order.status)
              setStatusModal(true)
            }}
          >
            Изменить статус
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Состав заказа
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--muted))]">
                        <UtensilsCrossed className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                      </div>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                          {item.quantity} x {formatCurrency(item.price)}
                        </p>
                      </div>
                    </div>
                    <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-4 space-y-2 border-t border-[hsl(var(--border))] pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[hsl(var(--muted-foreground))]">Подытог</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[hsl(var(--muted-foreground))]">Доставка</span>
                  <span>{formatCurrency(order.deliveryFee)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg">
                  <span>Итого</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline - Static for now since API doesn't provide history */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Текущий статус
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]">
                  {statusIcons[order.status]}
                </div>
                <div>
                  <p className="font-medium text-lg">{statusLabels[order.status]}</p>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    Обновлён: {formatDateTime(order.updatedAt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Клиент
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium">{order.consumerName}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">ID: {order.consumerId}</p>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-[hsl(var(--muted-foreground))] shrink-0 mt-0.5" />
                <p className="text-sm">{order.deliveryAddress}</p>
              </div>
            </CardContent>
          </Card>

          {/* Restaurant info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5" />
                Ресторан
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{order.restaurantName}</p>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">ID: {order.restaurantId}</p>
            </CardContent>
          </Card>

          {/* Courier info */}
          {order.courierId && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Курьер
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-medium">{order.courierName}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  ID: {order.courierId}
                </p>
                {order.estimatedDeliveryTime && (
                  <div className="mt-3 rounded-lg bg-[hsl(var(--muted))] p-3">
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">Ожидаемая доставка</p>
                    <p className="font-medium">{formatDateTime(order.estimatedDeliveryTime)}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Примечания
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Status change modal */}
      <Modal
        isOpen={statusModal}
        onClose={() => setStatusModal(false)}
        title="Изменение статуса"
        description={`Изменение статуса заказа #${id}`}
      >
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Новый статус</label>
            <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value as OrderStatus)}>
              {allStatuses.map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Причина изменения</label>
            <Textarea
              placeholder="Укажите причину изменения статуса..."
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
            />
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setStatusModal(false)}>
            Отмена
          </Button>
          <Button onClick={handleStatusChange} disabled={updateStatusMutation.isPending}>
            {updateStatusMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Сохранение...
              </>
            ) : (
              'Сохранить'
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
