import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Filter,
  RefreshCw,
  Star,
  UtensilsCrossed,
  Clock,
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
  DropdownSeparator,
  Modal,
  ModalFooter,
} from '@/components/ui'
import { formatNumber } from '@/lib/utils'
import type { Restaurant, RestaurantStatus } from '@/types'

// Mock data
const mockRestaurants: Restaurant[] = [
  {
    id: 1,
    name: 'Пицца Хат',
    description: 'Итальянская пицца',
    address: 'ул. Пушкина, д. 15',
    phone: '+7 495 123 45 67',
    email: 'pizza@example.com',
    status: 'APPROVED',
    isOpen: true,
    rating: 4.5,
    totalOrders: 1250,
    ownerId: 3,
    ownerName: 'Дмитрий Сидоров',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    name: 'Суши Мастер',
    description: 'Японская кухня',
    address: 'ул. Ленина, д. 25',
    phone: '+7 495 234 56 78',
    status: 'APPROVED',
    isOpen: true,
    rating: 4.8,
    totalOrders: 890,
    ownerId: 5,
    ownerName: 'Елена Петрова',
    createdAt: '2024-01-02T10:00:00Z',
    updatedAt: '2024-01-14T10:00:00Z',
  },
  {
    id: 3,
    name: 'Бургер Кинг',
    description: 'Фастфуд',
    address: 'пр. Мира, д. 10',
    phone: '+7 495 345 67 89',
    status: 'APPROVED',
    isOpen: false,
    rating: 4.2,
    totalOrders: 2100,
    ownerId: 7,
    ownerName: 'Андрей Иванов',
    createdAt: '2024-01-03T10:00:00Z',
    updatedAt: '2024-01-13T10:00:00Z',
  },
  {
    id: 4,
    name: 'Вкусный Дом',
    description: 'Домашняя кухня',
    address: 'ул. Советская, д. 5',
    phone: '+7 495 456 78 90',
    status: 'PENDING',
    isOpen: false,
    ownerId: 9,
    ownerName: 'Мария Козлова',
    createdAt: '2024-01-14T10:00:00Z',
    updatedAt: '2024-01-14T10:00:00Z',
  },
  {
    id: 5,
    name: 'KFC',
    description: 'Курица и фастфуд',
    address: 'ул. Гагарина, д. 30',
    phone: '+7 495 567 89 01',
    status: 'APPROVED',
    isOpen: true,
    rating: 4.0,
    totalOrders: 1800,
    ownerId: 11,
    ownerName: 'Павел Смирнов',
    createdAt: '2024-01-04T10:00:00Z',
    updatedAt: '2024-01-12T10:00:00Z',
  },
  {
    id: 6,
    name: 'Новый Ресторан',
    description: 'Европейская кухня',
    address: 'ул. Тверская, д. 1',
    phone: '+7 495 678 90 12',
    status: 'PENDING',
    isOpen: false,
    ownerId: 13,
    ownerName: 'Ольга Новикова',
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
  },
  {
    id: 7,
    name: 'Закрытое Кафе',
    description: 'Было закрыто',
    address: 'ул. Старая, д. 100',
    phone: '+7 495 789 01 23',
    status: 'SUSPENDED',
    isOpen: false,
    ownerId: 15,
    ownerName: 'Иван Жуков',
    createdAt: '2023-12-01T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z',
  },
]

const statusLabels: Record<RestaurantStatus, string> = {
  PENDING: 'На модерации',
  APPROVED: 'Одобрен',
  SUSPENDED: 'Приостановлен',
  REJECTED: 'Отклонён',
}

const statusColors: Record<RestaurantStatus, 'default' | 'secondary' | 'destructive' | 'success' | 'warning'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  SUSPENDED: 'destructive',
  REJECTED: 'secondary',
}

export function RestaurantsPage() {
  // Filters state
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [openFilter, setOpenFilter] = useState<string>('')

  // Pagination state
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)

  // Modal state
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean
    restaurant: Restaurant | null
    newStatus: RestaurantStatus | null
  }>({
    isOpen: false,
    restaurant: null,
    newStatus: null,
  })

  // Filter restaurants
  const filteredRestaurants = mockRestaurants.filter((restaurant) => {
    const matchesSearch =
      !search ||
      restaurant.name.toLowerCase().includes(search.toLowerCase()) ||
      restaurant.address.toLowerCase().includes(search.toLowerCase()) ||
      restaurant.ownerName?.toLowerCase().includes(search.toLowerCase())

    const matchesStatus = !statusFilter || restaurant.status === statusFilter
    const matchesOpen =
      openFilter === '' ||
      (openFilter === 'true' && restaurant.isOpen) ||
      (openFilter === 'false' && !restaurant.isOpen)

    return matchesSearch && matchesStatus && matchesOpen
  })

  const totalItems = filteredRestaurants.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const paginatedRestaurants = filteredRestaurants.slice(page * pageSize, (page + 1) * pageSize)

  const handleStatusChange = () => {
    console.log('Changing status:', statusModal.restaurant?.id, statusModal.newStatus)
    setStatusModal({ isOpen: false, restaurant: null, newStatus: null })
  }

  const pendingCount = mockRestaurants.filter((r) => r.status === 'PENDING').length

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Рестораны</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Управление ресторанами платформы
          </p>
        </div>
        <div className="flex gap-2">
          {pendingCount > 0 && (
            <Link to="/restaurants/moderation">
              <Button variant="outline">
                <Clock className="mr-2 h-4 w-4" />
                Модерация
                <Badge variant="warning" className="ml-2">
                  {pendingCount}
                </Badge>
              </Button>
            </Link>
          )}
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Обновить
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--success))]/10">
                <UtensilsCrossed className="h-6 w-6 text-[hsl(var(--success))]" />
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Всего</p>
                <p className="text-2xl font-bold">{mockRestaurants.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--success))]/10">
                <CheckCircle className="h-6 w-6 text-[hsl(var(--success))]" />
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Открыты</p>
                <p className="text-2xl font-bold">
                  {mockRestaurants.filter((r) => r.isOpen).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--warning))]/10">
                <Clock className="h-6 w-6 text-[hsl(var(--warning))]" />
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">На модерации</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--destructive))]/10">
                <XCircle className="h-6 w-6 text-[hsl(var(--destructive))]" />
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Приостановлены</p>
                <p className="text-2xl font-bold">
                  {mockRestaurants.filter((r) => r.status === 'SUSPENDED').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
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
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
              <Input
                placeholder="Поиск по названию, адресу, владельцу..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">Все статусы</option>
              <option value="PENDING">На модерации</option>
              <option value="APPROVED">Одобрен</option>
              <option value="SUSPENDED">Приостановлен</option>
              <option value="REJECTED">Отклонён</option>
            </Select>
            <Select value={openFilter} onChange={(e) => setOpenFilter(e.target.value)}>
              <option value="">Все</option>
              <option value="true">Открыты</option>
              <option value="false">Закрыты</option>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearch('')
                setStatusFilter('')
                setOpenFilter('')
              }}
            >
              Сбросить
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Restaurants table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ресторан</TableHead>
                <TableHead>Владелец</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Рейтинг</TableHead>
                <TableHead>Заказы</TableHead>
                <TableHead>Работает</TableHead>
                <TableHead className="w-[70px]">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRestaurants.map((restaurant) => (
                <TableRow key={restaurant.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{restaurant.name}</div>
                      <div className="text-sm text-[hsl(var(--muted-foreground))]">
                        {restaurant.address}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{restaurant.ownerName || '—'}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColors[restaurant.status]}>
                      {statusLabels[restaurant.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {restaurant.rating ? (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{restaurant.rating.toFixed(1)}</span>
                      </div>
                    ) : (
                      <span className="text-[hsl(var(--muted-foreground))]">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">
                      {formatNumber(restaurant.totalOrders || 0)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {restaurant.isOpen ? (
                      <Badge variant="success">Открыт</Badge>
                    ) : (
                      <Badge variant="secondary">Закрыт</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Dropdown
                      trigger={
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      }
                    >
                      <Link to={`/restaurants/${restaurant.id}`}>
                        <DropdownItem>
                          <Eye className="h-4 w-4" />
                          Просмотр
                        </DropdownItem>
                      </Link>
                      <DropdownSeparator />
                      {restaurant.status !== 'APPROVED' && (
                        <DropdownItem
                          onClick={() =>
                            setStatusModal({ isOpen: true, restaurant, newStatus: 'APPROVED' })
                          }
                        >
                          <CheckCircle className="h-4 w-4" />
                          Одобрить
                        </DropdownItem>
                      )}
                      {restaurant.status !== 'SUSPENDED' && (
                        <DropdownItem
                          variant="destructive"
                          onClick={() =>
                            setStatusModal({ isOpen: true, restaurant, newStatus: 'SUSPENDED' })
                          }
                        >
                          <XCircle className="h-4 w-4" />
                          Приостановить
                        </DropdownItem>
                      )}
                    </Dropdown>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {paginatedRestaurants.length === 0 && (
            <div className="py-12 text-center text-[hsl(var(--muted-foreground))]">
              Рестораны не найдены
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

      {/* Status change modal */}
      <Modal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ isOpen: false, restaurant: null, newStatus: null })}
        title={statusModal.newStatus === 'APPROVED' ? 'Одобрение ресторана' : 'Приостановка ресторана'}
        description={`${statusModal.newStatus === 'APPROVED' ? 'Одобрить' : 'Приостановить'} ресторан "${statusModal.restaurant?.name}"?`}
        size="sm"
      >
        <p className="text-sm">
          {statusModal.newStatus === 'APPROVED'
            ? 'После одобрения ресторан сможет принимать заказы.'
            : 'После приостановки ресторан не сможет принимать заказы.'}
        </p>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setStatusModal({ isOpen: false, restaurant: null, newStatus: null })}
          >
            Отмена
          </Button>
          <Button
            variant={statusModal.newStatus === 'APPROVED' ? 'success' : 'destructive'}
            onClick={handleStatusChange}
          >
            {statusModal.newStatus === 'APPROVED' ? 'Одобрить' : 'Приостановить'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
