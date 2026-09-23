import { useState, useMemo } from 'react'
import {
  ShoppingCart,
  Loader2,
  Plus,
  CreditCard,
  Trash2,
  Package,
  ListOrdered,
  AlertTriangle,
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
  groupOptions,
  groupMax,
  groupRequired,
  defaultOptionIds,
  defaultVariantId,
  dedupeOptionIds,
  lineTotal,
  validateLine,
  toggleOption,
  variantPrice,
  visibleVariants,
  visibleOptions,
} from '@/lib/menu'
import { apiErrorMessage } from '@/lib/apiError'
import {
  useMyOrders,
  useCreateOrder,
  useCreatePayment,
} from '@/hooks/useOrders'
import { useRestaurantMenu } from '@/hooks/useRestaurants'
import type { OrderType, CreateOrderItemRequest, ItemOption, MenuItem } from '@/types'

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

  // Load the restaurant's menu so lines can be picked by name and carry their
  // sizes/add-ons. Falls back to raw id entry if the menu is unavailable.
  const parsedRestaurantId = parseInt(restaurantId) || 0
  const { data: menuData, isLoading: menuLoading } = useRestaurantMenu(parsedRestaurantId)
  const menuCategories = menuData?.data ?? []
  const menuItems = useMemo(
    () => menuCategories.flatMap((c) => c.items ?? []),
    [menuCategories]
  )
  const findMenuItem = (id: number): MenuItem | undefined => menuItems.find((m) => m.id === id)

  const addItem = () => setItems([...items, { menuItemId: 0, quantity: 1 }])
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index))
  const updateItem = (index: number, field: keyof CreateOrderItemRequest, value: number) => {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    setItems(updated)
  }
  const patchItem = (index: number, patch: Partial<CreateOrderItemRequest>) =>
    setItems(items.map((line, i) => (i === index ? { ...line, ...patch } : line)))

  // Changing the dish resets its choices and preselects the marked defaults.
  const selectMenuItem = (index: number, menuItemId: number) =>
    patchItem(index, {
      menuItemId,
      variantId: defaultVariantId(findMenuItem(menuItemId)),
      optionIds: defaultOptionIds(findMenuItem(menuItemId)),
    })

  const handleToggleOption = (index: number, option: ItemOption, group: ItemOption[]) =>
    patchItem(index, { optionIds: toggleOption(items[index].optionIds ?? [], option, group) })

  // The server enforces these too and refuses the order; validating here
  // catches it before submit rather than after.
  const itemIssues = items.map((line) =>
    line.menuItemId > 0 ? validateLine(findMenuItem(line.menuItemId), line) : []
  )
  const hasIssues = itemIssues.some((issues) => issues.length > 0)
  const orderTotal = items.reduce(
    (sum, line) => sum + lineTotal(findMenuItem(line.menuItemId), line),
    0
  )

  const handleCreateOrder = async () => {
    const validItems = items
      .filter((i) => i.menuItemId > 0)
      .map((i) => {
        const optionIds = dedupeOptionIds(i.optionIds)
        return { ...i, optionIds: optionIds.length ? optionIds : undefined }
      })
    if (!restaurantId || validItems.length === 0 || hasIssues) return

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
                {items.map((item, i) => {
                  const menuItem = findMenuItem(item.menuItemId)
                  const issues = itemIssues[i]
                  return (
                    <div key={i} className="rounded-lg border border-[hsl(var(--border))] p-3 space-y-3">
                      <div className="flex gap-2 items-end">
                        <div className="flex-1">
                          <label className="mb-1 block text-xs text-[hsl(var(--muted-foreground))]">
                            Позиция меню
                          </label>
                          {menuItems.length > 0 ? (
                            <Select
                              value={item.menuItemId || ''}
                              onChange={(e) => selectMenuItem(i, parseInt(e.target.value) || 0)}
                            >
                              <option value="">Выберите позицию</option>
                              {menuCategories.map((category) => (
                                <optgroup key={category.id} label={category.name}>
                                  {(category.items ?? []).map((mi) => (
                                    <option key={mi.id} value={mi.id} disabled={!mi.inStock}>
                                      {mi.name} · {formatCurrency(mi.effectivePrice ?? mi.price)}
                                      {!mi.inStock ? ' (нет в наличии)' : ''}
                                    </option>
                                  ))}
                                </optgroup>
                              ))}
                            </Select>
                          ) : (
                            <Input
                              type="number"
                              placeholder={menuLoading ? 'Загрузка меню...' : 'ID позиции меню'}
                              value={item.menuItemId || ''}
                              onChange={(e) => selectMenuItem(i, parseInt(e.target.value) || 0)}
                            />
                          )}
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

                      {/* Sizes — one-of, and optional (variantId may be omitted) */}
                      {menuItem && visibleVariants(menuItem).length > 0 && (
                        <div>
                          <div className="mb-1 flex items-center gap-2">
                            <span className="text-xs font-medium">
                              Размер <span className="font-normal text-[hsl(var(--muted-foreground))]">(обязательно)</span>
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            {visibleVariants(menuItem).map((v) => (
                              <label
                                key={v.id}
                                className={`flex items-center gap-1 text-sm ${
                                  v.inStock ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`variant-${i}`}
                                  className="h-4 w-4"
                                  checked={item.variantId === v.id}
                                  disabled={!v.inStock}
                                  onChange={() => patchItem(i, { variantId: v.id })}
                                />
                                <span className={v.inStock ? '' : 'line-through'}>
                                  {v.name} · {formatCurrency(variantPrice(menuItem, v))}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Add-ons — grouped; cap of 1 behaves as a radio group */}
                      {menuItem &&
                        visibleOptions(menuItem).length > 0 &&
                        groupOptions(visibleOptions(menuItem)).map(([groupName, opts]) => {
                          const max = groupMax(opts)
                          const chosen = opts.filter((o) => item.optionIds?.includes(o.id)).length
                          return (
                            <div key={groupName}>
                              <p className="mb-1 text-xs font-medium">
                                {groupName}{' '}
                                <span className="font-normal text-[hsl(var(--muted-foreground))]">
                                  ({groupRequired(opts) ? 'обязательно' : 'необязательно'}
                                  {max > 1 ? `, макс. ${max}` : ''})
                                </span>
                              </p>
                              <div className="flex flex-wrap gap-3">
                                {opts.map((o) => {
                                  const checked = item.optionIds?.includes(o.id) ?? false
                                  const atCap = !checked && max > 1 && chosen >= max
                                  const disabled = !o.inStock || atCap
                                  return (
                                    <label
                                      key={o.id}
                                      className={`flex items-center gap-1 text-sm ${
                                        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                                      }`}
                                    >
                                      <input
                                        type={max === 1 ? 'radio' : 'checkbox'}
                                        name={max === 1 ? `opt-${i}-${groupName}` : undefined}
                                        className="h-4 w-4"
                                        checked={checked}
                                        disabled={disabled}
                                        onChange={() => handleToggleOption(i, o, opts)}
                                      />
                                      <span className={o.inStock ? '' : 'line-through'}>
                                        {o.name}
                                        {o.priceDelta !== 0 && ` +${formatCurrency(o.priceDelta)}`}
                                      </span>
                                    </label>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        })}

                      {/* Line issues + line total */}
                      {issues.length > 0 && (
                        <div className="flex items-start gap-2 rounded-md bg-[hsl(var(--destructive))]/10 p-2 text-xs text-[hsl(var(--destructive))]">
                          <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                          <div>
                            {issues.map((issue) => (
                              <p key={issue}>{issue}</p>
                            ))}
                          </div>
                        </div>
                      )}
                      {menuItem && (
                        <p className="text-right text-sm">
                          Итого по позиции:{' '}
                          <strong>{formatCurrency(lineTotal(menuItem, item))}</strong>
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
              {orderTotal > 0 && (
                <p className="mt-2 text-right text-sm">
                  Сумма заказа: <strong>{formatCurrency(orderTotal)}</strong>
                </p>
              )}
            </div>

            <Button
              onClick={handleCreateOrder}
              disabled={createOrder.isPending || !restaurantId || hasIssues}
              className="w-full"
            >
              {createOrder.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShoppingCart className="mr-2 h-4 w-4" />}
              Создать заказ
            </Button>

            {createOrder.isSuccess && <Badge variant="success">Заказ создан</Badge>}
            {createOrder.isError && (
              <div className="flex items-start gap-2 rounded-md bg-[hsl(var(--destructive))]/10 p-3 text-sm text-[hsl(var(--destructive))]">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                {/* The API's refusal messages name what to change — show them verbatim. */}
                <span>{apiErrorMessage(createOrder.error, 'Не удалось создать заказ')}</span>
              </div>
            )}
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
