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
  Loader2,
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
import { useRestaurants, useUpdateRestaurantStatus } from '@/hooks/useRestaurants'
import type { Restaurant, RestaurantStatus } from '@/types'

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

  // Fetch restaurants from API
  const { data, isLoading, refetch } = useRestaurants({ page, size: pageSize })
  const updateStatus = useUpdateRestaurantStatus()

  const restaurants = data?.data?.content || []
  const totalElements = data?.data?.totalElements || 0
  const totalPages = data?.data?.totalPages || 0

  // Apply client-side filters
  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearch =
      !search ||
      restaurant.name.toLowerCase().includes(search.toLowerCase()) ||
      restaurant.fullAddress?.toLowerCase().includes(search.toLowerCase()) ||
      restaurant.ownerName?.toLowerCase().includes(search.toLowerCase())

    const matchesStatus = !statusFilter || restaurant.status === statusFilter
    const matchesOpen =
      openFilter === '' ||
      (openFilter === 'true' && restaurant.isOpen) ||
      (openFilter === 'false' && !restaurant.isOpen)

    return matchesSearch && matchesStatus && matchesOpen
  })

  const handleStatusChange = async () => {
    if (statusModal.restaurant && statusModal.newStatus) {
      await updateStatus.mutateAsync({
        id: statusModal.restaurant.id,
        status: statusModal.newStatus,
      })
      setStatusModal({ isOpen: false, restaurant: null, newStatus: null })
    }
  }

  // Calculate stats from current data
  const pendingCount = restaurants.filter((r) => r.status === 'PENDING').length
  const openCount = restaurants.filter((r) => r.isOpen).length
  const suspendedCount = restaurants.filter((r) => r.status === 'SUSPENDED').length

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
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
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
                <p className="text-2xl font-bold">{totalElements}</p>
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
                <p className="text-2xl font-bold">{openCount}</p>
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
                <p className="text-2xl font-bold">{suspendedCount}</p>
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
              <option value="ACTIVE">Активен</option>
              <option value="SUSPENDED">Приостановлен</option>
              <option value="CLOSED">Закрыт</option>
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
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--muted-foreground))]" />
            </div>
          ) : (
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
                {filteredRestaurants.map((restaurant) => (
                  <TableRow key={restaurant.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{restaurant.name}</div>
                        <div className="text-sm text-[hsl(var(--muted-foreground))]">
                          {restaurant.fullAddress}
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
                      {restaurant.averageRating ? (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{restaurant.averageRating.toFixed(1)}</span>
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
                        {restaurant.status !== 'ACTIVE' && (
                          <DropdownItem
                            onClick={() =>
                              setStatusModal({ isOpen: true, restaurant, newStatus: 'ACTIVE' })
                            }
                          >
                            <CheckCircle className="h-4 w-4" />
                            Активировать
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
          )}

          {!isLoading && filteredRestaurants.length === 0 && (
            <div className="py-12 text-center text-[hsl(var(--muted-foreground))]">
              Рестораны не найдены
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalElements > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalElements}
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
        title={statusModal.newStatus === 'ACTIVE' ? 'Активация ресторана' : 'Приостановка ресторана'}
        description={`${statusModal.newStatus === 'ACTIVE' ? 'Активировать' : 'Приостановить'} ресторан "${statusModal.restaurant?.name}"?`}
        size="sm"
      >
        <p className="text-sm">
          {statusModal.newStatus === 'ACTIVE'
            ? 'После активации ресторан сможет принимать заказы.'
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
            variant={statusModal.newStatus === 'ACTIVE' ? 'success' : 'destructive'}
            onClick={handleStatusChange}
            disabled={updateStatus.isPending}
          >
            {updateStatus.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : statusModal.newStatus === 'ACTIVE' ? (
              <CheckCircle className="mr-2 h-4 w-4" />
            ) : (
              <XCircle className="mr-2 h-4 w-4" />
            )}
            {statusModal.newStatus === 'ACTIVE' ? 'Активировать' : 'Приостановить'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
