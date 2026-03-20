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
  CreditCard,
  Receipt,
  Navigation,
  Phone,
  RefreshCw,
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
  Input,
} from '@/components/ui'
import { formatDateTime, formatCurrency } from '@/lib/utils'
import type { OrderStatus, OrderType, PaymentStatus } from '@/types'
import { useOrder, useUpdateOrderStatus, useOrderPayment, useCancelOrder } from '@/hooks'

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

const statusIcons: Record<OrderStatus, React.ReactNode> = {
  CREATED: <Clock className="h-4 w-4" />,
  PENDING: <Clock className="h-4 w-4" />,
  CONFIRMED: <CheckCircle className="h-4 w-4" />,
  ACCEPTED: <CheckCircle className="h-4 w-4" />,
  PREPARING: <ChefHat className="h-4 w-4" />,
  READY: <Package className="h-4 w-4" />,
  READY_FOR_PICKUP: <Package className="h-4 w-4" />,
  PICKED_UP: <Truck className="h-4 w-4" />,
  IN_TRANSIT: <Navigation className="h-4 w-4" />,
  DELIVERING: <Truck className="h-4 w-4" />,
  DELIVERED: <CheckCircle className="h-4 w-4" />,
  COMPLETED: <CheckCircle className="h-4 w-4" />,
  CANCELLED: <XCircle className="h-4 w-4" />,
  REFUNDED: <RefreshCw className="h-4 w-4" />,
}

const orderTypeLabels: Record<OrderType, string> = {
  DELIVERY: 'Доставка',
  TAKEAWAY: 'Самовывоз',
  PICKUP: 'Самовывоз',
  DINE_IN: 'В зале',
}

const paymentStatusLabels: Record<PaymentStatus, string> = {
  PENDING: 'Ожидает',
  PROCESSING: 'Обработка',
  CONFIRMED: 'Оплачен',
  FAILED: 'Ошибка',
  REFUNDED: 'Возврат',
  CANCELLED: 'Отменён',
}

const paymentStatusColors: Record<PaymentStatus, 'default' | 'secondary' | 'destructive' | 'success' | 'warning'> = {
  PENDING: 'secondary',
  PROCESSING: 'warning',
  CONFIRMED: 'success',
  FAILED: 'destructive',
  REFUNDED: 'destructive',
  CANCELLED: 'destructive',
}

const allStatuses: OrderStatus[] = [
  'CREATED',
  'ACCEPTED',
  'PREPARING',
  'READY',
  'PICKED_UP',
  'IN_TRANSIT',
  'DELIVERED',
  'COMPLETED',
  'CANCELLED',
]

// Terminal statuses where status can't be changed
const terminalStatuses: OrderStatus[] = ['COMPLETED', 'CANCELLED', 'REFUNDED']

// Cancellable statuses
const cancellableStatuses: OrderStatus[] = ['CREATED', 'ACCEPTED', 'PREPARING', 'READY']

export function OrderDetailsPage() {
  const { id } = useParams()
  const orderId = parseInt(id || '0', 10)

  const { data: orderData, isLoading } = useOrder(orderId)
  const { data: paymentData } = useOrderPayment(orderId)
  const order = orderData?.data
  const payment = paymentData?.data

  const updateStatusMutation = useUpdateOrderStatus()
  const cancelOrderMutation = useCancelOrder()

  // Modal state
  const [statusModal, setStatusModal] = useState(false)
  const [cancelModal, setCancelModal] = useState(false)
  const [newStatus, setNewStatus] = useState<OrderStatus>('ACCEPTED')
  const [statusNotes, setStatusNotes] = useState('')
  const [estimatedPrepTime, setEstimatedPrepTime] = useState('')
  const [cancelReason, setCancelReason] = useState('')

  const handleStatusChange = () => {
    if (order) {
      updateStatusMutation.mutate(
        {
          id: order.id,
          data: {
            status: newStatus,
            notes: statusNotes || undefined,
            estimatedPrepTimeMinutes: estimatedPrepTime ? parseInt(estimatedPrepTime, 10) : undefined,
          },
        },
        {
          onSuccess: () => {
            setStatusModal(false)
            setStatusNotes('')
            setEstimatedPrepTime('')
          },
        }
      )
    }
  }

  const handleCancel = () => {
    if (order) {
      cancelOrderMutation.mutate(
        {
          id: order.id,
          data: { reason: cancelReason, requestRefund: true },
        },
        {
          onSuccess: () => {
            setCancelModal(false)
            setCancelReason('')
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

  const canChangeStatus = !terminalStatuses.includes(order.status)
  const canCancel = cancellableStatuses.includes(order.status)

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
            <h1 className="text-2xl font-bold">
              {order.externalOrderNo || `Заказ #${id}`}
            </h1>
            <Badge variant={statusColors[order.status]} className="text-sm">
              {statusLabels[order.status]}
            </Badge>
            {order.orderType && (
              <Badge variant="secondary" className="text-sm">
                {orderTypeLabels[order.orderType]}
              </Badge>
            )}
          </div>
          <p className="text-[hsl(var(--muted-foreground))]">
            Создан {formatDateTime(order.createdAt)}
          </p>
        </div>
        <div className="flex gap-2">
          {canCancel && (
            <Button variant="outline" onClick={() => setCancelModal(true)}>
              <XCircle className="mr-2 h-4 w-4" />
              Отменить
            </Button>
          )}
          {canChangeStatus && (
            <Button
              onClick={() => {
                setNewStatus(order.status === 'CREATED' ? 'ACCEPTED' : order.status)
                setStatusModal(true)
              }}
            >
              Изменить статус
            </Button>
          )}
        </div>
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
                    className="flex items-start justify-between border-b border-[hsl(var(--border))] pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--muted))]">
                        <UtensilsCrossed className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                      </div>
                      <div>
                        <p className="font-medium">{item.itemName || item.name}</p>
                        {item.variantName && (
                          <p className="text-sm text-[hsl(var(--muted-foreground))]">
                            {item.variantName}
                            {item.variantPriceDelta ? ` (+${formatCurrency(item.variantPriceDelta)})` : ''}
                          </p>
                        )}
                        {item.modifiers && item.modifiers.length > 0 && (
                          <div className="mt-1">
                            {item.modifiers.map((mod) => (
                              <p key={mod.id} className="text-xs text-[hsl(var(--muted-foreground))]">
                                + {mod.name} ({formatCurrency(mod.price)})
                              </p>
                            ))}
                          </div>
                        )}
                        {item.specialInstructions && (
                          <p className="mt-1 text-xs italic text-[hsl(var(--muted-foreground))]">
                            "{item.specialInstructions}"
                          </p>
                        )}
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                          {item.quantity} x {formatCurrency(item.unitPrice || item.price)}
                        </p>
                      </div>
                    </div>
                    <p className="font-medium">
                      {formatCurrency(item.totalPrice || item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-4 space-y-2 border-t border-[hsl(var(--border))] pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[hsl(var(--muted-foreground))]">Подытог</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                {order.tax != null && order.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[hsl(var(--muted-foreground))]">Налог</span>
                    <span>{formatCurrency(order.tax)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-[hsl(var(--muted-foreground))]">Доставка</span>
                  <span>{formatCurrency(order.deliveryFee)}</span>
                </div>
                {order.discount != null && order.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Скидка</span>
                    <span>-{formatCurrency(order.discount)}</span>
                  </div>
                )}
                {order.tipAmount != null && order.tipAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[hsl(var(--muted-foreground))]">Чаевые</span>
                    <span>{formatCurrency(order.tipAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-lg pt-2 border-t border-[hsl(var(--border))]">
                  <span>Итого</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status & Payment info */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Current status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Статус заказа
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
                {order.estimatedPrepTimeMinutes && (
                  <div className="mt-4 rounded-lg bg-[hsl(var(--muted))] p-3">
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">Время приготовления</p>
                    <p className="font-medium">{order.estimatedPrepTimeMinutes} мин</p>
                  </div>
                )}
                {order.cancellationReason && (
                  <div className="mt-4 rounded-lg bg-red-50 p-3 border border-red-200">
                    <p className="text-xs text-red-600">Причина отмены</p>
                    <p className="text-sm text-red-800">{order.cancellationReason}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Оплата
                </CardTitle>
              </CardHeader>
              <CardContent>
                {order.paymentStatus && (
                  <div className="flex items-center gap-3 mb-4">
                    <Badge variant={paymentStatusColors[order.paymentStatus]}>
                      {paymentStatusLabels[order.paymentStatus]}
                    </Badge>
                  </div>
                )}
                {payment && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[hsl(var(--muted-foreground))]">Метод</span>
                      <span className="capitalize">{payment.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[hsl(var(--muted-foreground))]">Провайдер</span>
                      <span className="capitalize">{payment.provider}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[hsl(var(--muted-foreground))]">Сумма</span>
                      <span>{formatCurrency(payment.amount)} {payment.currency}</span>
                    </div>
                    {payment.confirmedAt && (
                      <div className="flex justify-between">
                        <span className="text-[hsl(var(--muted-foreground))]">Оплачен</span>
                        <span>{formatDateTime(payment.confirmedAt)}</span>
                      </div>
                    )}
                    {payment.refundAmount != null && payment.refundAmount > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>Возврат</span>
                        <span>{formatCurrency(payment.refundAmount)}</span>
                      </div>
                    )}
                  </div>
                )}
                {!payment && !order.paymentStatus && (
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    Информация об оплате недоступна
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
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
                <p className="font-medium">{order.customerName || order.consumerName}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">ID: {order.consumerId}</p>
              </div>
              {order.customerPhone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                  <p className="text-sm">{order.customerPhone}</p>
                </div>
              )}
              {order.deliveryAddress && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-[hsl(var(--muted-foreground))] shrink-0 mt-0.5" />
                  <p className="text-sm">{order.deliveryAddress}</p>
                </div>
              )}
              {order.deliveryInstructions && (
                <div className="rounded-lg bg-[hsl(var(--muted))] p-3">
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">Инструкции доставки</p>
                  <p className="text-sm">{order.deliveryInstructions}</p>
                </div>
              )}
              {order.tableId && (
                <div className="rounded-lg bg-[hsl(var(--muted))] p-3">
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">Столик</p>
                  <p className="font-medium">{order.tableId}</p>
                </div>
              )}
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

          {/* Order timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Временные метки
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">Создан</span>
                <span>{formatDateTime(order.createdAt)}</span>
              </div>
              {order.acceptedAt && (
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--muted-foreground))]">Принят</span>
                  <span>{formatDateTime(order.acceptedAt)}</span>
                </div>
              )}
              {order.readyAt && (
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--muted-foreground))]">Готов</span>
                  <span>{formatDateTime(order.readyAt)}</span>
                </div>
              )}
              {order.deliveredAt && (
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--muted-foreground))]">Доставлен</span>
                  <span>{formatDateTime(order.deliveredAt)}</span>
                </div>
              )}
            </CardContent>
          </Card>

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
        description={`Изменение статуса заказа ${order.externalOrderNo || '#' + id}`}
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
          {newStatus === 'ACCEPTED' && (
            <div>
              <label className="mb-2 block text-sm font-medium">Время приготовления (мин)</label>
              <Input
                type="number"
                placeholder="25"
                value={estimatedPrepTime}
                onChange={(e) => setEstimatedPrepTime(e.target.value)}
              />
            </div>
          )}
          <div>
            <label className="mb-2 block text-sm font-medium">Примечание</label>
            <Textarea
              placeholder="Добавьте примечание к изменению статуса..."
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
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

      {/* Cancel order modal */}
      <Modal
        isOpen={cancelModal}
        onClose={() => setCancelModal(false)}
        title="Отмена заказа"
        description={`Отмена заказа ${order.externalOrderNo || '#' + id}`}
      >
        <div>
          <label className="mb-2 block text-sm font-medium">Причина отмены *</label>
          <Textarea
            placeholder="Укажите причину отмены заказа..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
          <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">
            Будет запрошен возврат средств
          </p>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setCancelModal(false)}>
            Назад
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={cancelOrderMutation.isPending || !cancelReason.trim()}
          >
            {cancelOrderMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Отмена...
              </>
            ) : (
              'Отменить заказ'
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
