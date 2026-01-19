import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import {
  ArrowLeft,
  User,
  MapPin,
  Star,
  CheckCircle,
  Package,
  Clock,
  Bike,
  Loader2,
  Car,
  Footprints,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Avatar,
  Modal,
  ModalFooter,
} from '@/components/ui'
import { formatDateTime, formatNumber } from '@/lib/utils'
import { useCourier, useVerifyCourier } from '@/hooks/useCouriers'
import type { CourierStatus, VehicleType } from '@/types'

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

const vehicleLabels: Record<VehicleType, string> = {
  WALKING: 'Пешком',
  BICYCLE: 'Велосипед',
  E_BIKE: 'Электровелосипед',
  MOTORCYCLE: 'Мотоцикл',
  CAR: 'Автомобиль',
  VAN: 'Фургон',
}

const VehicleIcon = ({ type }: { type?: VehicleType }) => {
  switch (type) {
    case 'CAR':
    case 'VAN':
      return <Car className="h-5 w-5" />
    case 'WALKING':
      return <Footprints className="h-5 w-5" />
    default:
      return <Bike className="h-5 w-5" />
  }
}

export function CourierDetailsPage() {
  const { id } = useParams()
  const courierId = parseInt(id || '0', 10)

  const { data, isLoading, error } = useCourier(courierId)
  const verifyCourier = useVerifyCourier()

  const [verifyModal, setVerifyModal] = useState(false)

  const courier = data?.data

  const handleVerify = async () => {
    if (courier) {
      await verifyCourier.mutateAsync(courier.id)
      setVerifyModal(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--muted-foreground))]" />
      </div>
    )
  }

  if (error || !courier) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/couriers">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Курьер не найден</h1>
          </div>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-[hsl(var(--muted-foreground))]">
              Курьер с ID {id} не найден
            </p>
            <Link to="/couriers">
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
        <Link to="/couriers">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Профиль курьера</h1>
          <p className="text-[hsl(var(--muted-foreground))]">ID: {id}</p>
        </div>
        {!courier.isVerified && (
          <Button variant="success" onClick={() => setVerifyModal(true)}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Верифицировать
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Основная информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Courier avatar and name */}
            <div className="flex items-center gap-4">
              <Avatar name={courier.userName || `Courier ${courier.id}`} size="lg" />
              <div>
                <h2 className="text-xl font-semibold">{courier.userName || `Курьер #${courier.id}`}</h2>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant={statusColors[courier.status]}>
                    {statusLabels[courier.status]}
                  </Badge>
                  {courier.isVerified && (
                    <Badge variant="success" className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Верифицирован
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-[hsl(var(--border))] p-4">
                <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
                  <Star className="h-4 w-4" />
                  <span className="text-sm">Рейтинг</span>
                </div>
                <p className="mt-2 text-2xl font-bold">
                  {courier.rating > 0 ? courier.rating.toFixed(1) : '—'}
                </p>
              </div>
              <div className="rounded-lg border border-[hsl(var(--border))] p-4">
                <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
                  <Package className="h-4 w-4" />
                  <span className="text-sm">Всего доставок</span>
                </div>
                <p className="mt-2 text-2xl font-bold">
                  {formatNumber(courier.totalDeliveries || 0)}
                </p>
              </div>
              <div className="rounded-lg border border-[hsl(var(--border))] p-4">
                <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
                  <Package className="h-4 w-4" />
                  <span className="text-sm">Текущие заказы</span>
                </div>
                <p className="mt-2 text-2xl font-bold">
                  {courier.currentOrderCount || 0} / {courier.maxConcurrentOrders || 3}
                </p>
              </div>
              <div className="rounded-lg border border-[hsl(var(--border))] p-4">
                <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">Радиус работы</span>
                </div>
                <p className="mt-2 text-2xl font-bold">
                  {courier.preferredRadiusKm || '—'} км
                </p>
              </div>
            </div>

            {/* Vehicle info */}
            {courier.vehicleType && (
              <div>
                <h3 className="mb-4 font-semibold">Транспорт</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="flex items-center gap-3 rounded-lg bg-[hsl(var(--muted))] p-4">
                    <VehicleIcon type={courier.vehicleType} />
                    <div>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">Тип</p>
                      <p className="font-medium">{vehicleLabels[courier.vehicleType]}</p>
                    </div>
                  </div>
                  {courier.vehicleNumber && (
                    <div className="flex items-center gap-3 rounded-lg bg-[hsl(var(--muted))] p-4">
                      <Car className="h-5 w-5" />
                      <div>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">Номер</p>
                        <p className="font-medium">{courier.vehicleNumber}</p>
                      </div>
                    </div>
                  )}
                  {courier.licenseNumber && (
                    <div className="flex items-center gap-3 rounded-lg bg-[hsl(var(--muted))] p-4">
                      <User className="h-5 w-5" />
                      <div>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">Права</p>
                        <p className="font-medium">{courier.licenseNumber}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* User info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Пользователь
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">User ID</p>
                <p className="font-medium">{courier.userId}</p>
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Дата регистрации</p>
                <p className="font-medium">{courier.createdAt ? formatDateTime(courier.createdAt) : '—'}</p>
              </div>
              <Link to={`/users/${courier.userId}`}>
                <Button variant="outline" size="sm" className="w-full">
                  Перейти к профилю
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Verification info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Верификация
              </CardTitle>
            </CardHeader>
            <CardContent>
              {courier.isVerified ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[hsl(var(--success))]">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Верифицирован</span>
                  </div>
                  {courier.verifiedAt && (
                    <div>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">Дата верификации</p>
                      <p className="font-medium">{formatDateTime(courier.verifiedAt)}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-[hsl(var(--warning))]">Ожидает верификации</p>
                  <Button variant="success" size="sm" className="w-full" onClick={() => setVerifyModal(true)}>
                    Верифицировать
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Текущая локация
              </CardTitle>
            </CardHeader>
            <CardContent>
              {courier.currentLatitude && courier.currentLongitude ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[hsl(var(--success))]">
                    <div className="h-2 w-2 rounded-full bg-[hsl(var(--success))] animate-pulse" />
                    <span>Онлайн</span>
                  </div>
                  <div className="rounded-lg bg-[hsl(var(--muted))] p-3">
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">Координаты</p>
                    <p className="font-mono text-sm">
                      {courier.currentLatitude.toFixed(4)}, {courier.currentLongitude.toFixed(4)}
                    </p>
                  </div>
                  {courier.lastLocationUpdate && (
                    <div>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">Последнее обновление</p>
                      <p className="text-sm">{formatDateTime(courier.lastLocationUpdate)}</p>
                    </div>
                  )}
                  <Link to="/couriers/map">
                    <Button variant="outline" size="sm" className="w-full">
                      Показать на карте
                    </Button>
                  </Link>
                </div>
              ) : (
                <p className="text-[hsl(var(--muted-foreground))]">Не в сети</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Verify modal */}
      <Modal
        isOpen={verifyModal}
        onClose={() => setVerifyModal(false)}
        title="Верификация курьера"
        description={`Подтвердите верификацию курьера ${courier.userName || `#${courier.id}`}`}
        size="sm"
      >
        <p className="text-sm">
          После верификации курьер сможет принимать заказы на доставку.
        </p>
        <ModalFooter>
          <Button variant="outline" onClick={() => setVerifyModal(false)}>
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
    </div>
  )
}
