import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  MoreHorizontal,
  Eye,
  X,
  Filter,
  RefreshCw,
  Calendar,
  Loader2,
  Hash,
  ArrowRight,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Select,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Pagination,
  Dropdown,
  DropdownItem,
  Modal,
  ModalFooter,
  Textarea,
} from '@/components/ui'
import { formatDateTime, formatCurrency } from '@/lib/utils'
import type { Order, OrderStatus } from '@/types'
import { useOrders, useCancelOrder, useOrderByNumber } from '@/hooks'

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

// Orders that can be cancelled according to API
const cancellableStatuses: OrderStatus[] = ['CREATED', 'ACCEPTED', 'PREPARING', 'READY']

export function OrdersPage() {
  // Order number search state
  const [orderNoSearch, setOrderNoSearch] = useState('')
  const [searchedOrderNo, setSearchedOrderNo] = useState('')

  // Filters state
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Pagination state
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)

  // Modal states
  const [cancelModal, setCancelModal] = useState<{ isOpen: boolean; order: Order | null }>({
    isOpen: false,
    order: null,
  })
  const [cancelReason, setCancelReason] = useState('')

  // Order number search hook
  const {
    data: orderByNoData,
    isLoading: orderByNoLoading,
    error: orderByNoError,
  } = useOrderByNumber(searchedOrderNo)

  const foundOrder = orderByNoData?.data

  // Handle order number search
  const handleOrderNoSearch = () => {
    if (orderNoSearch.trim()) {
      setSearchedOrderNo(orderNoSearch.trim())
    }
  }

  const handleOrderNoKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleOrderNoSearch()
    }
  }

  const clearOrderNoSearch = () => {
    setOrderNoSearch('')
    setSearchedOrderNo('')
  }

  // API hooks
  const { data: ordersData, isLoading, refetch } = useOrders({
    page,
    size: pageSize,
    status: statusFilter as OrderStatus || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  })

  const cancelOrderMutation = useCancelOrder()

  const orders = ordersData?.data?.content ?? []
  const totalItems = ordersData?.data?.totalElements ?? 0
  const totalPages = ordersData?.data?.totalPages ?? 0

  // Client-side search filter (for now)
  const filteredOrders = orders.filter((order) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      order.id.toString().includes(search) ||
      (order.externalOrderNo?.toLowerCase().includes(searchLower)) ||
      order.consumerName.toLowerCase().includes(searchLower) ||
      order.restaurantName.toLowerCase().includes(searchLower) ||
      order.courierName?.toLowerCase().includes(searchLower)
    )
  })

  const handleCancel = () => {
    if (cancelModal.order) {
      cancelOrderMutation.mutate(
        {
          id: cancelModal.order.id,
          data: { reason: cancelReason, requestRefund: true },
        },
        {
          onSuccess: () => {
            setCancelModal({ isOpen: false, order: null })
            setCancelReason('')
          },
        }
      )
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Заказы</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Управление заказами системы
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Обновить
        </Button>
      </div>

      {/* Quick Order Number Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Hash className="h-4 w-4" />
            Быстрый поиск по номеру заказа
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
              <Input
                placeholder="Введите номер заказа (ORD-2024-001)..."
                value={orderNoSearch}
                onChange={(e) => setOrderNoSearch(e.target.value)}
                onKeyDown={handleOrderNoKeyDown}
                className="pl-10"
              />
            </div>
            <Button onClick={handleOrderNoSearch} disabled={orderByNoLoading || !orderNoSearch.trim()}>
              {orderByNoLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Найти
            </Button>
            {searchedOrderNo && (
              <Button variant="outline" onClick={clearOrderNoSearch}>
                Очистить
              </Button>
            )}
          </div>

          {/* Search Result */}
          {searchedOrderNo && (
            <div className="mt-4">
              {orderByNoLoading ? (
                <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Поиск заказа...</span>
                </div>
              ) : orderByNoError || !foundOrder ? (
                <div className="rounded-lg border border-[hsl(var(--destructive))]/20 bg-[hsl(var(--destructive))]/10 p-4">
                  <p className="text-[hsl(var(--destructive))]">
                    Заказ с номером "{searchedOrderNo}" не найден
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-lg">
                          {foundOrder.externalOrderNo || `#${foundOrder.id}`}
                        </span>
                        <Badge variant={statusColors[foundOrder.status]}>
                          {statusLabels[foundOrder.status]}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-[hsl(var(--muted-foreground))]">
                        <span>Клиент: {foundOrder.consumerName}</span>
                        <span>Ресторан: {foundOrder.restaurantName}</span>
                        <span>Сумма: {formatCurrency(foundOrder.total)}</span>
                        <span>{formatDateTime(foundOrder.createdAt)}</span>
                      </div>
                    </div>
                    <Link to={`/orders/${foundOrder.id}`}>
                      <Button>
                        Открыть заказ
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4" />
            Фильтры
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
              <Input
                placeholder="Поиск по ID, клиенту, ресторану..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(0)
              }}
            >
              <option value="">Все статусы</option>
              <option value="CREATED">Создан</option>
              <option value="ACCEPTED">Принят</option>
              <option value="PREPARING">Готовится</option>
              <option value="READY">Готов</option>
              <option value="PICKED_UP">Забран</option>
              <option value="IN_TRANSIT">В пути</option>
              <option value="DELIVERED">Доставлен</option>
              <option value="COMPLETED">Завершён</option>
              <option value="CANCELLED">Отменён</option>
              <option value="REFUNDED">Возврат</option>
            </Select>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
              <Input
                type="date"
                placeholder="С"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value)
                  setPage(0)
                }}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
              <Input
                type="date"
                placeholder="По"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value)
                  setPage(0)
                }}
                className="pl-10"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setSearch('')
                setStatusFilter('')
                setDateFrom('')
                setDateTo('')
                setPage(0)
              }}
            >
              Сбросить
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--muted-foreground))]" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Клиент</TableHead>
                  <TableHead>Ресторан</TableHead>
                  <TableHead>Курьер</TableHead>
                  <TableHead>Сумма</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Создан</TableHead>
                  <TableHead className="w-[70px]">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.externalOrderNo || `#${order.id}`}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.consumerName}</div>
                        <div className="text-sm text-[hsl(var(--muted-foreground))] truncate max-w-[200px]">
                          {order.deliveryAddress}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{order.restaurantName}</TableCell>
                    <TableCell>
                      {order.courierName || (
                        <span className="text-[hsl(var(--muted-foreground))]">—</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(order.total)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[order.status]}>
                        {statusLabels[order.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-[hsl(var(--muted-foreground))]">
                      {formatDateTime(order.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Dropdown
                        trigger={
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        }
                      >
                        <Link to={`/orders/${order.id}`}>
                          <DropdownItem>
                            <Eye className="h-4 w-4" />
                            Просмотр
                          </DropdownItem>
                        </Link>
                        {cancellableStatuses.includes(order.status) && (
                          <DropdownItem
                            variant="destructive"
                            onClick={() => setCancelModal({ isOpen: true, order })}
                          >
                            <X className="h-4 w-4" />
                            Отменить
                          </DropdownItem>
                        )}
                      </Dropdown>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!isLoading && filteredOrders.length === 0 && (
            <div className="py-12 text-center text-[hsl(var(--muted-foreground))]">
              Заказы не найдены
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalItems > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setPage(0)
          }}
        />
      )}

      {/* Cancel order modal */}
      <Modal
        isOpen={cancelModal.isOpen}
        onClose={() => setCancelModal({ isOpen: false, order: null })}
        title="Отмена заказа"
        description={`Отмена заказа #${cancelModal.order?.id}`}
      >
        <div>
          <label className="mb-2 block text-sm font-medium">Причина отмены</label>
          <Textarea
            placeholder="Укажите причину отмены заказа..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setCancelModal({ isOpen: false, order: null })}>
            Назад
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={cancelOrderMutation.isPending}
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
