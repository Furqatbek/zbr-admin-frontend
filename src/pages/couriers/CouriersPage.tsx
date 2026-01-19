import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  MoreHorizontal,
  Eye,
  CheckCircle,
  Filter,
  RefreshCw,
  MapPin,
  Star,
  Bike,
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
  Avatar,
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
} from '@/components/ui'
import { formatNumber } from '@/lib/utils'
import type { Courier, CourierStatus } from '@/types'

// Mock data - will be replaced with API calls
const mockCouriers: Courier[] = [
  {
    id: 1,
    userId: 4,
    userName: 'Игорь Козлов',
    status: 'AVAILABLE',
    verified: true,
    verifiedAt: '2024-01-10T10:00:00Z',
    rating: 4.8,
    totalDeliveries: 256,
    currentLocation: { lat: 55.7558, lng: 37.6173 },
  },
  {
    id: 2,
    userId: 8,
    userName: 'Дмитрий Павлов',
    status: 'BUSY',
    verified: true,
    verifiedAt: '2024-01-05T10:00:00Z',
    rating: 4.6,
    totalDeliveries: 189,
    currentLocation: { lat: 55.7512, lng: 37.6184 },
  },
  {
    id: 3,
    userId: 12,
    userName: 'Александр Смирнов',
    status: 'OFFLINE',
    verified: true,
    verifiedAt: '2024-01-08T10:00:00Z',
    rating: 4.9,
    totalDeliveries: 312,
  },
  {
    id: 4,
    userId: 15,
    userName: 'Николай Федоров',
    status: 'PENDING_APPROVAL',
    verified: false,
    rating: 0,
    totalDeliveries: 0,
  },
  {
    id: 5,
    userId: 18,
    userName: 'Сергей Морозов',
    status: 'AVAILABLE',
    verified: true,
    verifiedAt: '2024-01-12T10:00:00Z',
    rating: 4.5,
    totalDeliveries: 145,
    currentLocation: { lat: 55.7601, lng: 37.6189 },
  },
  {
    id: 6,
    userId: 20,
    userName: 'Андрей Волков',
    status: 'PENDING_APPROVAL',
    verified: false,
    rating: 0,
    totalDeliveries: 0,
  },
]

const statusLabels: Record<CourierStatus, string> = {
  PENDING_APPROVAL: 'Ожидает проверки',
  AVAILABLE: 'Доступен',
  BUSY: 'Занят',
  OFFLINE: 'Не в сети',
}

const statusColors: Record<CourierStatus, 'default' | 'secondary' | 'destructive' | 'success' | 'warning'> = {
  PENDING_APPROVAL: 'warning',
  AVAILABLE: 'success',
  BUSY: 'default',
  OFFLINE: 'secondary',
}

export function CouriersPage() {
  // Filters state
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [verifiedFilter, setVerifiedFilter] = useState<string>('')

  // Pagination state
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)

  // Modal state
  const [verifyModal, setVerifyModal] = useState<{ isOpen: boolean; courier: Courier | null }>({
    isOpen: false,
    courier: null,
  })

  // Filter couriers
  const filteredCouriers = mockCouriers.filter((courier) => {
    const matchesSearch =
      !search ||
      courier.userName.toLowerCase().includes(search.toLowerCase()) ||
      courier.id.toString().includes(search)

    const matchesStatus = !statusFilter || courier.status === statusFilter
    const matchesVerified =
      verifiedFilter === '' ||
      (verifiedFilter === 'true' && courier.verified) ||
      (verifiedFilter === 'false' && !courier.verified)

    return matchesSearch && matchesStatus && matchesVerified
  })

  const totalItems = filteredCouriers.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const paginatedCouriers = filteredCouriers.slice(page * pageSize, (page + 1) * pageSize)

  const handleVerify = () => {
    console.log('Verifying courier:', verifyModal.courier?.id)
    setVerifyModal({ isOpen: false, courier: null })
  }

  const pendingCount = mockCouriers.filter((c) => c.status === 'PENDING_APPROVAL').length

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Курьеры</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Управление курьерами платформы
          </p>
        </div>
        <div className="flex gap-2">
          {pendingCount > 0 && (
            <Link to="/couriers/verification">
              <Button variant="outline">
                <CheckCircle className="mr-2 h-4 w-4" />
                Верификация
                <Badge variant="destructive" className="ml-2">
                  {pendingCount}
                </Badge>
              </Button>
            </Link>
          )}
          <Link to="/couriers/map">
            <Button variant="outline">
              <MapPin className="mr-2 h-4 w-4" />
              Карта
            </Button>
          </Link>
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
                <Bike className="h-6 w-6 text-[hsl(var(--success))]" />
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Доступны</p>
                <p className="text-2xl font-bold">
                  {mockCouriers.filter((c) => c.status === 'AVAILABLE').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10">
                <Bike className="h-6 w-6 text-[hsl(var(--primary))]" />
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Заняты</p>
                <p className="text-2xl font-bold">
                  {mockCouriers.filter((c) => c.status === 'BUSY').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--muted))]">
                <Bike className="h-6 w-6 text-[hsl(var(--muted-foreground))]" />
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Не в сети</p>
                <p className="text-2xl font-bold">
                  {mockCouriers.filter((c) => c.status === 'OFFLINE').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--warning))]/10">
                <Bike className="h-6 w-6 text-[hsl(var(--warning))]" />
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Ожидают проверки</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
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
                placeholder="Поиск по имени, ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">Все статусы</option>
              <option value="AVAILABLE">Доступен</option>
              <option value="BUSY">Занят</option>
              <option value="OFFLINE">Не в сети</option>
              <option value="PENDING_APPROVAL">Ожидает проверки</option>
            </Select>
            <Select value={verifiedFilter} onChange={(e) => setVerifiedFilter(e.target.value)}>
              <option value="">Все</option>
              <option value="true">Верифицированы</option>
              <option value="false">Не верифицированы</option>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearch('')
                setStatusFilter('')
                setVerifiedFilter('')
              }}
            >
              Сбросить
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Couriers table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Курьер</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Верификация</TableHead>
                <TableHead>Рейтинг</TableHead>
                <TableHead>Доставки</TableHead>
                <TableHead>Локация</TableHead>
                <TableHead className="w-[70px]">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCouriers.map((courier) => (
                <TableRow key={courier.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar name={courier.userName} size="sm" />
                      <div>
                        <div className="font-medium">{courier.userName}</div>
                        <div className="text-sm text-[hsl(var(--muted-foreground))]">
                          ID: {courier.id}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColors[courier.status]}>
                      {statusLabels[courier.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {courier.verified ? (
                      <div className="flex items-center gap-1 text-[hsl(var(--success))]">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">Верифицирован</span>
                      </div>
                    ) : (
                      <span className="text-sm text-[hsl(var(--muted-foreground))]">
                        Не верифицирован
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {courier.rating && courier.rating > 0 ? (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{courier.rating.toFixed(1)}</span>
                      </div>
                    ) : (
                      <span className="text-[hsl(var(--muted-foreground))]">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{formatNumber(courier.totalDeliveries || 0)}</span>
                  </TableCell>
                  <TableCell>
                    {courier.currentLocation ? (
                      <div className="flex items-center gap-1 text-[hsl(var(--success))]">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">Онлайн</span>
                      </div>
                    ) : (
                      <span className="text-[hsl(var(--muted-foreground))]">—</span>
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
                      <Link to={`/couriers/${courier.id}`}>
                        <DropdownItem>
                          <Eye className="h-4 w-4" />
                          Просмотр
                        </DropdownItem>
                      </Link>
                      {!courier.verified && (
                        <DropdownItem onClick={() => setVerifyModal({ isOpen: true, courier })}>
                          <CheckCircle className="h-4 w-4" />
                          Верифицировать
                        </DropdownItem>
                      )}
                    </Dropdown>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {paginatedCouriers.length === 0 && (
            <div className="py-12 text-center text-[hsl(var(--muted-foreground))]">
              Курьеры не найдены
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

      {/* Verify modal */}
      <Modal
        isOpen={verifyModal.isOpen}
        onClose={() => setVerifyModal({ isOpen: false, courier: null })}
        title="Верификация курьера"
        description={`Подтвердите верификацию курьера ${verifyModal.courier?.userName}`}
        size="sm"
      >
        <p className="text-sm">
          После верификации курьер сможет принимать заказы на доставку.
        </p>
        <ModalFooter>
          <Button variant="outline" onClick={() => setVerifyModal({ isOpen: false, courier: null })}>
            Отмена
          </Button>
          <Button variant="success" onClick={handleVerify}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Верифицировать
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
