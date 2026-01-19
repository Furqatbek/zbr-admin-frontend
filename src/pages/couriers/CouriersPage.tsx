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
  Loader2,
  Ban,
  Play,
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
import {
  useCouriers,
  useCouriersByStatus,
  useCourierStatistics,
  useVerifyCourier,
  useSuspendCourier,
  useActivateCourier,
} from '@/hooks/useCouriers'
import type { Courier, CourierStatus } from '@/types'

const statusLabels: Record<CourierStatus, string> = {
  PENDING_APPROVAL: 'Ожидает проверки',
  AVAILABLE: 'Доступен',
  BUSY: 'Занят',
  OFFLINE: 'Не в сети',
  ON_BREAK: 'На перерыве',
  SUSPENDED: 'Заблокирован',
}

const statusColors: Record<CourierStatus, 'default' | 'secondary' | 'destructive' | 'success' | 'warning'> = {
  PENDING_APPROVAL: 'warning',
  AVAILABLE: 'success',
  BUSY: 'default',
  OFFLINE: 'secondary',
  ON_BREAK: 'secondary',
  SUSPENDED: 'destructive',
}

export function CouriersPage() {
  // Filters state
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<CourierStatus | ''>('')

  // Pagination state
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)

  // Modal state
  const [verifyModal, setVerifyModal] = useState<{ isOpen: boolean; courier: Courier | null }>({
    isOpen: false,
    courier: null,
  })
  const [suspendModal, setSuspendModal] = useState<{ isOpen: boolean; courier: Courier | null }>({
    isOpen: false,
    courier: null,
  })
  const [activateModal, setActivateModal] = useState<{ isOpen: boolean; courier: Courier | null }>({
    isOpen: false,
    courier: null,
  })

  // Fetch courier statistics
  const { data: statsData, isLoading: isLoadingStats } = useCourierStatistics()
  const stats = statsData?.data

  // Fetch couriers - use by-status endpoint if filter is set, otherwise get all
  const { data: allData, isLoading: isLoadingAll, refetch: refetchAll } = useCouriers({
    page,
    size: pageSize,
  })

  const { data: filteredData, isLoading: isLoadingFiltered, refetch: refetchFiltered } = useCouriersByStatus(
    statusFilter as CourierStatus,
    { page, size: pageSize }
  )

  const isLoading = statusFilter ? isLoadingFiltered : isLoadingAll
  const data = statusFilter ? filteredData : allData
  const refetch = statusFilter ? refetchFiltered : refetchAll

  const verifyCourier = useVerifyCourier()
  const suspendCourier = useSuspendCourier()
  const activateCourier = useActivateCourier()

  const allCouriers = data?.data?.content || []
  const totalItems = data?.data?.totalElements || 0
  const totalPages = data?.data?.totalPages || 0

  // Client-side search filtering (backend doesn't support search)
  const couriers = search
    ? allCouriers.filter((courier) =>
        (courier.userName || '').toLowerCase().includes(search.toLowerCase()) ||
        courier.id.toString().includes(search)
      )
    : allCouriers

  const handleVerify = async () => {
    if (verifyModal.courier) {
      await verifyCourier.mutateAsync(verifyModal.courier.id)
      setVerifyModal({ isOpen: false, courier: null })
    }
  }

  const handleSuspend = async () => {
    if (suspendModal.courier) {
      await suspendCourier.mutateAsync(suspendModal.courier.id)
      setSuspendModal({ isOpen: false, courier: null })
    }
  }

  const handleActivate = async () => {
    if (activateModal.courier) {
      await activateCourier.mutateAsync(activateModal.courier.id)
      setActivateModal({ isOpen: false, courier: null })
    }
  }

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
          {stats && stats.pendingApproval > 0 && (
            <Link to="/couriers/verification">
              <Button variant="outline">
                <CheckCircle className="mr-2 h-4 w-4" />
                Верификация
                <Badge variant="destructive" className="ml-2">
                  {stats.pendingApproval}
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
          <Button variant="outline" size="sm" onClick={() => refetch()}>
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
                <Bike className="h-6 w-6 text-[hsl(var(--success))]" />
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Доступны</p>
                <p className="text-2xl font-bold">
                  {isLoadingStats ? '...' : stats?.available || 0}
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
                  {isLoadingStats ? '...' : stats?.busy || 0}
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
                  {isLoadingStats ? '...' : stats?.offline || 0}
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
                <p className="text-2xl font-bold">
                  {isLoadingStats ? '...' : stats?.pendingApproval || 0}
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
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
              <Input
                placeholder="Поиск по имени, ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as CourierStatus | '')
                setPage(0)
              }}
            >
              <option value="">Все статусы</option>
              <option value="AVAILABLE">Доступен</option>
              <option value="BUSY">Занят</option>
              <option value="OFFLINE">Не в сети</option>
              <option value="ON_BREAK">На перерыве</option>
              <option value="PENDING_APPROVAL">Ожидает проверки</option>
              <option value="SUSPENDED">Заблокирован</option>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearch('')
                setStatusFilter('')
                setPage(0)
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
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--muted-foreground))]" />
            </div>
          ) : (
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
                {couriers.map((courier) => (
                  <TableRow key={courier.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar name={courier.userName || `Courier ${courier.id}`} size="sm" />
                        <div>
                          <div className="font-medium">{courier.userName || `Курьер #${courier.id}`}</div>
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
                      {(courier.isVerified || courier.verified) ? (
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
                      {courier.rating > 0 ? (
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
                      {courier.currentLatitude && courier.currentLongitude ? (
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
                        {!(courier.isVerified || courier.verified) && courier.status === 'PENDING_APPROVAL' && (
                          <DropdownItem onClick={() => setVerifyModal({ isOpen: true, courier })}>
                            <CheckCircle className="h-4 w-4" />
                            Верифицировать
                          </DropdownItem>
                        )}
                        {courier.status !== 'SUSPENDED' && (courier.isVerified || courier.verified) && (
                          <DropdownItem onClick={() => setSuspendModal({ isOpen: true, courier })}>
                            <Ban className="h-4 w-4" />
                            Заблокировать
                          </DropdownItem>
                        )}
                        {courier.status === 'SUSPENDED' && (
                          <DropdownItem onClick={() => setActivateModal({ isOpen: true, courier })}>
                            <Play className="h-4 w-4" />
                            Активировать
                          </DropdownItem>
                        )}
                      </Dropdown>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!isLoading && couriers.length === 0 && (
            <div className="py-12 text-center text-[hsl(var(--muted-foreground))]">
              Курьеры не найдены
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalItems > 0 && !search && (
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
        description={`Подтвердите верификацию курьера ${verifyModal.courier?.userName || `#${verifyModal.courier?.id}`}`}
        size="sm"
      >
        <p className="text-sm">
          После верификации курьер сможет принимать заказы на доставку.
        </p>
        <ModalFooter>
          <Button variant="outline" onClick={() => setVerifyModal({ isOpen: false, courier: null })}>
            Отмена
          </Button>
          <Button
            variant="success"
            onClick={handleVerify}
            disabled={verifyCourier.isPending}
          >
            {verifyCourier.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="mr-2 h-4 w-4" />
            )}
            Верифицировать
          </Button>
        </ModalFooter>
      </Modal>

      {/* Suspend modal */}
      <Modal
        isOpen={suspendModal.isOpen}
        onClose={() => setSuspendModal({ isOpen: false, courier: null })}
        title="Блокировка курьера"
        description={`Вы уверены, что хотите заблокировать курьера ${suspendModal.courier?.userName || `#${suspendModal.courier?.id}`}?`}
        size="sm"
      >
        <p className="text-sm">
          После блокировки курьер не сможет принимать заказы на доставку.
        </p>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSuspendModal({ isOpen: false, courier: null })}>
            Отмена
          </Button>
          <Button
            variant="destructive"
            onClick={handleSuspend}
            disabled={suspendCourier.isPending}
          >
            {suspendCourier.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Ban className="mr-2 h-4 w-4" />
            )}
            Заблокировать
          </Button>
        </ModalFooter>
      </Modal>

      {/* Activate modal */}
      <Modal
        isOpen={activateModal.isOpen}
        onClose={() => setActivateModal({ isOpen: false, courier: null })}
        title="Активация курьера"
        description={`Вы уверены, что хотите активировать курьера ${activateModal.courier?.userName || `#${activateModal.courier?.id}`}?`}
        size="sm"
      >
        <p className="text-sm">
          После активации курьер сможет снова принимать заказы на доставку.
        </p>
        <ModalFooter>
          <Button variant="outline" onClick={() => setActivateModal({ isOpen: false, courier: null })}>
            Отмена
          </Button>
          <Button
            variant="success"
            onClick={handleActivate}
            disabled={activateCourier.isPending}
          >
            {activateCourier.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            Активировать
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
