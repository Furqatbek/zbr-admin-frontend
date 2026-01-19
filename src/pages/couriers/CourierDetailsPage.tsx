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
import type { Courier, CourierStatus } from '@/types'

// Mock courier data
const mockCourier: Courier = {
  id: 1,
  userId: 4,
  userName: 'Игорь Козлов',
  status: 'AVAILABLE',
  verified: true,
  verifiedAt: '2024-01-10T10:00:00Z',
  rating: 4.8,
  totalDeliveries: 256,
  currentLocation: { lat: 55.7558, lng: 37.6173 },
}

// Mock delivery stats
const mockStats = {
  todayDeliveries: 8,
  weekDeliveries: 42,
  monthDeliveries: 156,
  averageDeliveryTime: 28, // minutes
  completionRate: 98.5, // percent
}

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

export function CourierDetailsPage() {
  const { id } = useParams()
  const courier = mockCourier
  const stats = mockStats

  const [verifyModal, setVerifyModal] = useState(false)

  const handleVerify = () => {
    console.log('Verifying courier:', id)
    setVerifyModal(false)
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
        {!courier.verified && (
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
              <Avatar name={courier.userName} size="lg" />
              <div>
                <h2 className="text-xl font-semibold">{courier.userName}</h2>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant={statusColors[courier.status]}>
                    {statusLabels[courier.status]}
                  </Badge>
                  {courier.verified && (
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
                  {courier.rating && courier.rating > 0 ? courier.rating.toFixed(1) : '—'}
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
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Ср. время доставки</span>
                </div>
                <p className="mt-2 text-2xl font-bold">{stats.averageDeliveryTime} мин</p>
              </div>
              <div className="rounded-lg border border-[hsl(var(--border))] p-4">
                <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Выполнение</span>
                </div>
                <p className="mt-2 text-2xl font-bold">{stats.completionRate}%</p>
              </div>
            </div>

            {/* Delivery stats */}
            <div>
              <h3 className="mb-4 font-semibold">Статистика доставок</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="flex items-center gap-3 rounded-lg bg-[hsl(var(--muted))] p-4">
                  <Bike className="h-8 w-8 text-[hsl(var(--primary))]" />
                  <div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Сегодня</p>
                    <p className="text-xl font-bold">{stats.todayDeliveries}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-[hsl(var(--muted))] p-4">
                  <Bike className="h-8 w-8 text-[hsl(var(--primary))]" />
                  <div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">За неделю</p>
                    <p className="text-xl font-bold">{stats.weekDeliveries}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-[hsl(var(--muted))] p-4">
                  <Bike className="h-8 w-8 text-[hsl(var(--primary))]" />
                  <div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">За месяц</p>
                    <p className="text-xl font-bold">{stats.monthDeliveries}</p>
                  </div>
                </div>
              </div>
            </div>
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
              {courier.verified ? (
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
              {courier.currentLocation ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[hsl(var(--success))]">
                    <div className="h-2 w-2 rounded-full bg-[hsl(var(--success))] animate-pulse" />
                    <span>Онлайн</span>
                  </div>
                  <div className="rounded-lg bg-[hsl(var(--muted))] p-3">
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">Координаты</p>
                    <p className="font-mono text-sm">
                      {courier.currentLocation.lat.toFixed(4)}, {courier.currentLocation.lng.toFixed(4)}
                    </p>
                  </div>
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
        description={`Подтвердите верификацию курьера ${courier.userName}`}
        size="sm"
      >
        <p className="text-sm">
          После верификации курьер сможет принимать заказы на доставку.
        </p>
        <ModalFooter>
          <Button variant="outline" onClick={() => setVerifyModal(false)}>
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
