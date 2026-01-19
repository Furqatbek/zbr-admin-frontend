import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Star,
  Package,
  User,
  Calendar,
  CheckCircle,
  Clock,
  Loader2,
  Truck,
  ShoppingBag,
  Utensils,
  DollarSign,
  Eye,
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
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Pagination,
} from '@/components/ui'
import { formatDateTime, formatNumber, formatCurrency } from '@/lib/utils'
import { useRestaurant, useUpdateRestaurantStatus, useToggleRestaurantOpen } from '@/hooks/useRestaurants'
import { useOrdersByRestaurant } from '@/hooks/useOrders'
import type { RestaurantStatus, OrderStatus } from '@/types'

const orderStatusLabels: Record<OrderStatus, string> = {
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

const orderStatusColors: Record<OrderStatus, 'default' | 'secondary' | 'destructive' | 'success' | 'warning'> = {
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

const statusLabels: Record<RestaurantStatus, string> = {
  PENDING: 'На модерации',
  ACTIVE: 'Активен',
  SUSPENDED: 'Приостановлен',
  CLOSED: 'Закрыт',
  REJECTED: 'Отклонён',
}

const statusColors: Record<RestaurantStatus, 'default' | 'secondary' | 'destructive' | 'success' | 'warning'> = {
  PENDING: 'warning',
  ACTIVE: 'success',
  SUSPENDED: 'destructive',
  CLOSED: 'secondary',
  REJECTED: 'secondary',
}

export function RestaurantDetailsPage() {
  const { id } = useParams()
  const restaurantId = parseInt(id || '0', 10)

  const { data, isLoading, error, refetch } = useRestaurant(restaurantId)
  const updateStatus = useUpdateRestaurantStatus()
  const toggleOpen = useToggleRestaurantOpen()

  const restaurant = data?.data

  const [statusModal, setStatusModal] = useState(false)
  const [newStatus, setNewStatus] = useState<RestaurantStatus>('ACTIVE')

  // Orders pagination
  const [ordersPage, setOrdersPage] = useState(0)
  const [ordersPageSize, setOrdersPageSize] = useState(10)

  // Fetch restaurant orders
  const {
    data: ordersData,
    isLoading: ordersLoading,
    refetch: refetchOrders,
  } = useOrdersByRestaurant(restaurantId, { page: ordersPage, size: ordersPageSize })

  const orders = ordersData?.data?.content ?? []
  const ordersTotalItems = ordersData?.data?.totalElements ?? 0
  const ordersTotalPages = ordersData?.data?.totalPages ?? 0

  const handleStatusChange = async () => {
    if (restaurant) {
      await updateStatus.mutateAsync({ id: restaurant.id, status: newStatus })
      setStatusModal(false)
      refetch()
    }
  }

  const handleToggleOpen = async () => {
    if (restaurant) {
      await toggleOpen.mutateAsync({ id: restaurant.id, isOpen: !restaurant.isOpen })
      refetch()
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--muted-foreground))]" />
      </div>
    )
  }

  if (error || !restaurant) {
    return (
      <div className="py-12 text-center">
        <Card className="mx-auto max-w-md">
          <CardContent className="pt-6">
            <p className="text-[hsl(var(--destructive))]">Ресторан не найден</p>
            <Link to="/restaurants">
              <Button className="mt-4">Вернуться к списку</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back button and header */}
      <div className="flex items-center gap-4">
        <Link to="/restaurants">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{restaurant.name}</h1>
            <Badge variant={statusColors[restaurant.status]}>
              {statusLabels[restaurant.status]}
            </Badge>
            {restaurant.isOpen ? (
              <Badge variant="success">Открыт</Badge>
            ) : (
              <Badge variant="secondary">Закрыт</Badge>
            )}
            {restaurant.featured && (
              <Badge variant="warning">Рекомендуемый</Badge>
            )}
          </div>
          <p className="text-[hsl(var(--muted-foreground))]">ID: {id}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleToggleOpen}
            disabled={toggleOpen.isPending}
          >
            {toggleOpen.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : restaurant.isOpen ? (
              'Закрыть ресторан'
            ) : (
              'Открыть ресторан'
            )}
          </Button>
          <Button variant="outline" onClick={() => {
            setNewStatus(restaurant.status)
            setStatusModal(true)
          }}>
            Изменить статус
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Информация о ресторане</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Description */}
            {restaurant.description && (
              <div>
                <h3 className="mb-2 font-semibold">Описание</h3>
                <p className="text-[hsl(var(--muted-foreground))]">{restaurant.description}</p>
              </div>
            )}

            {/* Contact info */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-lg border border-[hsl(var(--border))] p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10">
                  <MapPin className="h-5 w-5 text-[hsl(var(--primary))]" />
                </div>
                <div>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">Адрес</p>
                  <p className="font-medium">{restaurant.fullAddress}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-[hsl(var(--border))] p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10">
                  <Phone className="h-5 w-5 text-[hsl(var(--primary))]" />
                </div>
                <div>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">Телефон</p>
                  <p className="font-medium">{restaurant.phone}</p>
                </div>
              </div>
              {restaurant.email && (
                <div className="flex items-center gap-3 rounded-lg border border-[hsl(var(--border))] p-4 sm:col-span-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10">
                    <Mail className="h-5 w-5 text-[hsl(var(--primary))]" />
                  </div>
                  <div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Email</p>
                    <p className="font-medium">{restaurant.email}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Stats grid */}
            <div>
              <h3 className="mb-4 font-semibold">Статистика</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-[hsl(var(--border))] p-4">
                  <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
                    <Star className="h-4 w-4" />
                    <span className="text-sm">Рейтинг</span>
                  </div>
                  <p className="mt-2 text-2xl font-bold">
                    {restaurant.averageRating ? restaurant.averageRating.toFixed(1) : '—'}
                  </p>
                  {restaurant.totalRatings && (
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                      {restaurant.totalRatings} оценок
                    </p>
                  )}
                </div>
                <div className="rounded-lg border border-[hsl(var(--border))] p-4">
                  <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
                    <Package className="h-4 w-4" />
                    <span className="text-sm">Всего заказов</span>
                  </div>
                  <p className="mt-2 text-2xl font-bold">
                    {formatNumber(restaurant.totalOrders || 0)}
                  </p>
                </div>
                <div className="rounded-lg border border-[hsl(var(--border))] p-4">
                  <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Ср. приготовление</span>
                  </div>
                  <p className="mt-2 text-2xl font-bold">
                    {restaurant.averagePrepTimeMinutes || '—'} мин
                  </p>
                </div>
                <div className="rounded-lg border border-[hsl(var(--border))] p-4">
                  <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-sm">Мин. заказ</span>
                  </div>
                  <p className="mt-2 text-2xl font-bold">
                    {restaurant.minimumOrder ? formatCurrency(restaurant.minimumOrder) : '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* Service options */}
            <div>
              <h3 className="mb-4 font-semibold">Опции обслуживания</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className={`flex items-center gap-3 rounded-lg p-4 ${restaurant.acceptsDelivery ? 'bg-[hsl(var(--success))]/10' : 'bg-[hsl(var(--muted))]'}`}>
                  <Truck className={`h-6 w-6 ${restaurant.acceptsDelivery ? 'text-[hsl(var(--success))]' : 'text-[hsl(var(--muted-foreground))]'}`} />
                  <div>
                    <p className="font-medium">Доставка</p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                      {restaurant.acceptsDelivery ? `До ${restaurant.deliveryRadiusKm || '—'} км` : 'Недоступна'}
                    </p>
                    {restaurant.deliveryFee !== undefined && restaurant.acceptsDelivery && (
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        {formatCurrency(restaurant.deliveryFee)}
                      </p>
                    )}
                  </div>
                </div>
                <div className={`flex items-center gap-3 rounded-lg p-4 ${restaurant.acceptsTakeaway ? 'bg-[hsl(var(--success))]/10' : 'bg-[hsl(var(--muted))]'}`}>
                  <ShoppingBag className={`h-6 w-6 ${restaurant.acceptsTakeaway ? 'text-[hsl(var(--success))]' : 'text-[hsl(var(--muted-foreground))]'}`} />
                  <div>
                    <p className="font-medium">Самовывоз</p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                      {restaurant.acceptsTakeaway ? 'Доступен' : 'Недоступен'}
                    </p>
                  </div>
                </div>
                <div className={`flex items-center gap-3 rounded-lg p-4 ${restaurant.acceptsDineIn ? 'bg-[hsl(var(--success))]/10' : 'bg-[hsl(var(--muted))]'}`}>
                  <Utensils className={`h-6 w-6 ${restaurant.acceptsDineIn ? 'text-[hsl(var(--success))]' : 'text-[hsl(var(--muted-foreground))]'}`} />
                  <div>
                    <p className="font-medium">В зале</p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                      {restaurant.acceptsDineIn ? 'Доступно' : 'Недоступно'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Working hours */}
            {(restaurant.opensAt || restaurant.closesAt) && (
              <div>
                <h3 className="mb-4 font-semibold">Часы работы</h3>
                <div className="flex items-center gap-3 rounded-lg border border-[hsl(var(--border))] p-4">
                  <Clock className="h-5 w-5 text-[hsl(var(--primary))]" />
                  <span className="font-medium">
                    {restaurant.opensAt || '—'} — {restaurant.closesAt || '—'}
                  </span>
                  {restaurant.isCurrentlyOpen !== undefined && (
                    <Badge variant={restaurant.isCurrentlyOpen ? 'success' : 'secondary'}>
                      {restaurant.isCurrentlyOpen ? 'Сейчас работает' : 'Сейчас закрыт'}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Owner info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Владелец
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Имя</p>
                <p className="font-medium">{restaurant.ownerName || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">User ID</p>
                <p className="font-medium">{restaurant.ownerId}</p>
              </div>
              <Link to={`/users/${restaurant.ownerId}`}>
                <Button variant="outline" size="sm" className="w-full">
                  Перейти к профилю
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Status card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Статус
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Badge variant={statusColors[restaurant.status]} className="text-sm">
                {statusLabels[restaurant.status]}
              </Badge>
              <div className="flex items-center gap-2">
                {restaurant.isOpen ? (
                  <>
                    <div className="h-2 w-2 rounded-full bg-[hsl(var(--success))] animate-pulse" />
                    <span className="text-sm text-[hsl(var(--success))]">Сейчас открыт</span>
                  </>
                ) : (
                  <>
                    <div className="h-2 w-2 rounded-full bg-[hsl(var(--muted-foreground))]" />
                    <span className="text-sm text-[hsl(var(--muted-foreground))]">Сейчас закрыт</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Даты
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Создан</p>
                <p className="font-medium">{formatDateTime(restaurant.createdAt)}</p>
              </div>
              {restaurant.updatedAt && (
                <div>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">Обновлён</p>
                  <p className="font-medium">{formatDateTime(restaurant.updatedAt)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Order History Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              История заказов
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchOrders()}
              disabled={ordersLoading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${ordersLoading ? 'animate-spin' : ''}`} />
              Обновить
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {ordersLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--muted-foreground))]" />
            </div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center text-[hsl(var(--muted-foreground))]">
              Заказов не найдено
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Клиент</TableHead>
                  <TableHead>Сумма</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Создан</TableHead>
                  <TableHead className="w-[70px]">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.externalOrderNo || `#${order.id}`}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.consumerName}</div>
                        {order.deliveryAddress && (
                          <div className="text-sm text-[hsl(var(--muted-foreground))] truncate max-w-[200px]">
                            {order.deliveryAddress}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(order.total)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={orderStatusColors[order.status]}>
                        {orderStatusLabels[order.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-[hsl(var(--muted-foreground))]">
                      {formatDateTime(order.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Link to={`/orders/${order.id}`}>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Orders Pagination */}
      {ordersTotalItems > 0 && (
        <Pagination
          currentPage={ordersPage}
          totalPages={ordersTotalPages}
          pageSize={ordersPageSize}
          totalItems={ordersTotalItems}
          onPageChange={setOrdersPage}
          onPageSizeChange={(size) => {
            setOrdersPageSize(size)
            setOrdersPage(0)
          }}
        />
      )}

      {/* Status change modal */}
      <Modal
        isOpen={statusModal}
        onClose={() => setStatusModal(false)}
        title="Изменение статуса"
        description={`Изменение статуса ресторана "${restaurant.name}"`}
      >
        <div>
          <label className="mb-2 block text-sm font-medium">Новый статус</label>
          <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value as RestaurantStatus)}>
            <option value="PENDING">На модерации</option>
            <option value="ACTIVE">Активен</option>
            <option value="SUSPENDED">Приостановлен</option>
            <option value="CLOSED">Закрыт</option>
            <option value="REJECTED">Отклонён</option>
          </Select>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setStatusModal(false)}>
            Отмена
          </Button>
          <Button onClick={handleStatusChange} disabled={updateStatus.isPending}>
            {updateStatus.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Сохранить
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
