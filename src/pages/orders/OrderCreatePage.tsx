import { useState } from 'react'
import {
  ShoppingCart,
  Loader2,
  Plus,
  CreditCard,
  Trash2,
  Package,
  ListOrdered,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Input,
  Select,
} from '@/components/ui'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import {
  useMyOrders,
  useCreateOrder,
  useCreatePayment,
} from '@/hooks/useOrders'
import type { OrderType, CreateOrderItemRequest } from '@/types'

const orderTypeLabels: Record<OrderType, string> = {
  DELIVERY: 'Доставка',
  TAKEAWAY: 'Самовывоз',
  PICKUP: 'Заберу сам',
  DINE_IN: 'В ресторане',
}

export function OrderCreatePage() {
  const [myOrdersPage, setMyOrdersPage] = useState(0)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)

  // Create order form
  const [restaurantId, setRestaurantId] = useState('')
  const [orderType, setOrderType] = useState<OrderType>('DELIVERY')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<CreateOrderItemRequest[]>([
    { menuItemId: 0, quantity: 1 },
  ])

  // Payment form
  const [paymentOrderId, setPaymentOrderId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('CARD')

  const { data: myOrdersData, isLoading: myOrdersLoading } = useMyOrders({ page: myOrdersPage, size: 10 })
  const createOrder = useCreateOrder()
  const createPayment = useCreatePayment()

  const myOrders = myOrdersData?.data

  const addItem = () => setItems([...items, { menuItemId: 0, quantity: 1 }])
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index))
  const updateItem = (index: number, field: keyof CreateOrderItemRequest, value: number) => {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    setItems(updated)
  }

  const handleCreateOrder = async () => {
    const validItems = items.filter((i) => i.menuItemId > 0)
    if (!restaurantId || validItems.length === 0) return

    await createOrder.mutateAsync({
      restaurantId: parseInt(restaurantId),
      orderType,
      items: validItems,
      deliveryAddress: deliveryAddress || undefined,
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      notes: notes || undefined,
    })
  }

  const handleCreatePayment = async () => {
    if (!paymentOrderId) return
    await createPayment.mutateAsync({
      orderId: parseInt(paymentOrderId),
      data: { paymentMethod },
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Управление заказами</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Мои заказы, создание заказов, оплата
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant={showCreateForm ? 'default' : 'outline'} onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus className="mr-2 h-4 w-4" />
            Создать заказ
          </Button>
          <Button variant={showPaymentForm ? 'default' : 'outline'} onClick={() => setShowPaymentForm(!showPaymentForm)}>
            <CreditCard className="mr-2 h-4 w-4" />
            Оплата
          </Button>
        </div>
      </div>

      {/* Create Order Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Новый заказ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">ID ресторана</label>
                <Input type="number" value={restaurantId} onChange={(e) => setRestaurantId(e.target.value)} placeholder="ID" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Тип заказа</label>
                <Select value={orderType} onChange={(e) => setOrderType(e.target.value as OrderType)}>
                  {Object.entries(orderTypeLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </Select>
              </div>
            </div>

            {orderType === 'DELIVERY' && (
              <div>
                <label className="mb-2 block text-sm font-medium">Адрес доставки</label>
                <Input value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} placeholder="Адрес" />
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Имя клиента</label>
                <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Телефон</label>
                <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Примечания</label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>

            {/* Items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Позиции заказа</label>
                <Button variant="outline" size="sm" onClick={addItem}>
                  <Plus className="mr-1 h-3 w-3" />
                  Добавить
                </Button>
              </div>
              <div className="space-y-2">
                {items.map((item, i) => (
                  <div key={i} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="mb-1 block text-xs text-[hsl(var(--muted-foreground))]">ID позиции меню</label>
                      <Input
                        type="number"
                        value={item.menuItemId || ''}
                        onChange={(e) => updateItem(i, 'menuItemId', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="w-24">
                      <label className="mb-1 block text-xs text-[hsl(var(--muted-foreground))]">Кол-во</label>
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => updateItem(i, 'quantity', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    {items.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => removeItem(i)}>
                        <Trash2 className="h-4 w-4 text-[hsl(var(--destructive))]" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={handleCreateOrder}
              disabled={createOrder.isPending || !restaurantId}
              className="w-full"
            >
              {createOrder.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShoppingCart className="mr-2 h-4 w-4" />}
              Создать заказ
            </Button>

            {createOrder.isSuccess && <Badge variant="success">Заказ создан</Badge>}
            {createOrder.isError && <Badge variant="destructive">Ошибка создания</Badge>}
          </CardContent>
        </Card>
      )}

      {/* Payment Form */}
      {showPaymentForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Создать оплату
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">ID заказа</label>
                <Input type="number" value={paymentOrderId} onChange={(e) => setPaymentOrderId(e.target.value)} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Способ оплаты</label>
                <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  <option value="CARD">Банковская карта</option>
                  <option value="CASH">Наличные</option>
                  <option value="PAYME">Payme</option>
                  <option value="CLICK">Click</option>
                </Select>
              </div>
            </div>
            <Button
              onClick={handleCreatePayment}
              disabled={createPayment.isPending || !paymentOrderId}
            >
              {createPayment.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
              Создать оплату
            </Button>

            {createPayment.isSuccess && <Badge variant="success">Оплата создана</Badge>}
            {createPayment.isError && <Badge variant="destructive">Ошибка оплаты</Badge>}
          </CardContent>
        </Card>
      )}

      {/* My Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListOrdered className="h-5 w-5" />
            Мои заказы
          </CardTitle>
        </CardHeader>
        <CardContent>
          {myOrdersLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : myOrders?.content && myOrders.content.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[hsl(var(--border))]">
                      <th className="text-left py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">ID</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Ресторан</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Статус</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Сумма</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Дата</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myOrders.content.map((order) => (
                      <tr key={order.id} className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]">
                        <td className="py-3 px-4 text-sm font-medium">#{order.externalOrderNo || order.id}</td>
                        <td className="py-3 px-4 text-sm">{order.restaurantName}</td>
                        <td className="py-3 px-4"><Badge variant="secondary">{order.status}</Badge></td>
                        <td className="py-3 px-4 text-sm font-medium">{formatCurrency(order.total)}</td>
                        <td className="py-3 px-4 text-sm text-[hsl(var(--muted-foreground))]">{formatDateTime(order.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Страница {myOrders.number + 1} из {myOrders.totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMyOrdersPage(Math.max(0, myOrdersPage - 1))}
                    disabled={myOrders.first}
                  >
                    Назад
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMyOrdersPage(myOrdersPage + 1)}
                    disabled={myOrders.last}
                  >
                    Далее
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-[hsl(var(--muted-foreground))]" />
              <p className="mt-2 text-[hsl(var(--muted-foreground))]">У вас нет заказов</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
