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
import type { Order, OrderStatus } from '@/types'

// Mock order data - will be replaced with API call
const mockOrder: Order = {
  id: 1003,
  consumerId: 7,
  consumerName: 'Елена Васильева',
  restaurantId: 3,
  restaurantName: 'Бургер Кинг',
  courierId: 8,
  courierName: 'Дмитрий Павлов',
  status: 'DELIVERING',
  items: [
    { id: 4, name: 'Воппер', quantity: 2, price: 349 },
    { id: 5, name: 'Картофель фри', quantity: 2, price: 129 },
    { id: 6, name: 'Кока-Кола 0.5л', quantity: 2, price: 99 },
  ],
  subtotal: 1154,
  deliveryFee: 99,
  total: 1253,
  deliveryAddress: 'пр. Мира, д. 15, кв. 42',
  notes: 'Позвонить за 5 минут до приезда',
  createdAt: '2024-01-15T10:45:00Z',
  updatedAt: '2024-01-15T11:20:00Z',
  estimatedDeliveryTime: '2024-01-15T11:45:00Z',
}

// Mock timeline data
const mockTimeline = [
  { status: 'PENDING', timestamp: '2024-01-15T10:45:00Z', note: 'Заказ создан' },
  { status: 'CONFIRMED', timestamp: '2024-01-15T10:47:00Z', note: 'Ресторан подтвердил заказ' },
  { status: 'PREPARING', timestamp: '2024-01-15T10:50:00Z', note: 'Начато приготовление' },
  { status: 'READY_FOR_PICKUP', timestamp: '2024-01-15T11:10:00Z', note: 'Заказ готов' },
  { status: 'PICKED_UP', timestamp: '2024-01-15T11:15:00Z', note: 'Курьер забрал заказ' },
  { status: 'DELIVERING', timestamp: '2024-01-15T11:20:00Z', note: 'Курьер в пути' },
]

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

  // In real app, fetch order by id
  const order = mockOrder
  const timeline = mockTimeline

  // Modal state
  const [statusModal, setStatusModal] = useState(false)
  const [newStatus, setNewStatus] = useState<OrderStatus>(order.status)
  const [statusReason, setStatusReason] = useState('')

  const handleStatusChange = () => {
    console.log('Changing status:', id, newStatus, statusReason)
    setStatusModal(false)
    setStatusReason('')
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
          <Button onClick={() => setStatusModal(true)}>Изменить статус</Button>
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

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                История заказа
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-px bg-[hsl(var(--border))]" />

                <div className="space-y-6">
                  {timeline.map((event, index) => (
                    <div key={index} className="relative flex gap-4 pl-10">
                      {/* Timeline dot */}
                      <div
                        className={`absolute left-0 flex h-8 w-8 items-center justify-center rounded-full ${
                          index === timeline.length - 1
                            ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                            : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'
                        }`}
                      >
                        {statusIcons[event.status as OrderStatus]}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{statusLabels[event.status as OrderStatus]}</p>
                          <p className="text-sm text-[hsl(var(--muted-foreground))]">
                            {formatDateTime(event.timestamp)}
                          </p>
                        </div>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">{event.note}</p>
                      </div>
                    </div>
                  ))}
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
          <Button onClick={handleStatusChange}>Сохранить</Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
