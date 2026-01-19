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

// Mock data - will be replaced with API calls
const mockOrders: Order[] = [
  {
    id: 1001,
    consumerId: 5,
    consumerName: 'Анна Новикова',
    restaurantId: 1,
    restaurantName: 'Пицца Хат',
    courierId: 4,
    courierName: 'Игорь Козлов',
    status: 'DELIVERED',
    items: [
      { id: 1, name: 'Пицца Маргарита', quantity: 2, price: 599 },
      { id: 2, name: 'Кола 0.5л', quantity: 2, price: 99 },
    ],
    subtotal: 1396,
    deliveryFee: 149,
    total: 1545,
    deliveryAddress: 'ул. Пушкина, д. 10, кв. 25',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T11:15:00Z',
  },
  {
    id: 1002,
    consumerId: 6,
    consumerName: 'Михаил Сергеев',
    restaurantId: 2,
    restaurantName: 'Суши Мастер',
    status: 'PREPARING',
    items: [
      { id: 3, name: 'Сет Филадельфия', quantity: 1, price: 1299 },
    ],
    subtotal: 1299,
    deliveryFee: 199,
    total: 1498,
    deliveryAddress: 'ул. Ленина, д. 5',
    createdAt: '2024-01-15T11:00:00Z',
    updatedAt: '2024-01-15T11:05:00Z',
  },
  {
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
    ],
    subtotal: 956,
    deliveryFee: 99,
    total: 1055,
    deliveryAddress: 'пр. Мира, д. 15, кв. 42',
    createdAt: '2024-01-15T10:45:00Z',
    updatedAt: '2024-01-15T11:20:00Z',
    estimatedDeliveryTime: '2024-01-15T11:45:00Z',
  },
  {
    id: 1004,
    consumerId: 8,
    consumerName: 'Павел Орлов',
    restaurantId: 1,
    restaurantName: 'Пицца Хат',
    status: 'CANCELLED',
    items: [
      { id: 6, name: 'Пицца Пепперони', quantity: 1, price: 649 },
    ],
    subtotal: 649,
    deliveryFee: 149,
    total: 798,
    deliveryAddress: 'ул. Гагарина, д. 20',
    notes: 'Отменён клиентом',
    createdAt: '2024-01-15T09:30:00Z',
    updatedAt: '2024-01-15T09:45:00Z',
  },
  {
    id: 1005,
    consumerId: 9,
    consumerName: 'Ольга Кузнецова',
    restaurantId: 4,
    restaurantName: 'KFC',
    status: 'CONFIRMED',
    items: [
      { id: 7, name: 'Баскет Дуэт', quantity: 1, price: 599 },
    ],
    subtotal: 599,
    deliveryFee: 129,
    total: 728,
    deliveryAddress: 'ул. Советская, д. 8',
    createdAt: '2024-01-15T11:30:00Z',
    updatedAt: '2024-01-15T11:32:00Z',
  },
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

export function OrdersPage() {
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

  // Filter orders
  const filteredOrders = mockOrders.filter((order) => {
    const matchesSearch =
      !search ||
      order.id.toString().includes(search) ||
      order.consumerName.toLowerCase().includes(search.toLowerCase()) ||
      order.restaurantName.toLowerCase().includes(search.toLowerCase()) ||
      order.courierName?.toLowerCase().includes(search.toLowerCase())

    const matchesStatus = !statusFilter || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const totalItems = filteredOrders.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const paginatedOrders = filteredOrders.slice(page * pageSize, (page + 1) * pageSize)

  const handleCancel = () => {
    console.log('Cancelling order:', cancelModal.order?.id, cancelReason)
    setCancelModal({ isOpen: false, order: null })
    setCancelReason('')
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
        <Button variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Обновить
        </Button>
      </div>

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
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">Все статусы</option>
              <option value="PENDING">Ожидает</option>
              <option value="CONFIRMED">Подтверждён</option>
              <option value="PREPARING">Готовится</option>
              <option value="READY_FOR_PICKUP">Готов к выдаче</option>
              <option value="PICKED_UP">Забран</option>
              <option value="DELIVERING">Доставляется</option>
              <option value="DELIVERED">Доставлен</option>
              <option value="CANCELLED">Отменён</option>
            </Select>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
              <Input
                type="date"
                placeholder="С"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
              <Input
                type="date"
                placeholder="По"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
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
              {paginatedOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id}</TableCell>
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
                      {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
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

          {paginatedOrders.length === 0 && (
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
          <Button variant="destructive" onClick={handleCancel}>
            Отменить заказ
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
