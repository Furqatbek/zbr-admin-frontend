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
} from '@/components/ui'
import { formatDateTime, formatNumber } from '@/lib/utils'
import type { Restaurant, RestaurantStatus } from '@/types'

// Mock restaurant data
const mockRestaurant: Restaurant = {
  id: 1,
  name: 'Пицца Хат',
  description: 'Итальянская пицца и паста. Доставка и самовывоз.',
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
}

// Mock orders stats
const mockStats = {
  todayOrders: 25,
  weekOrders: 156,
  monthOrders: 580,
  avgPrepTime: 22, // minutes
  completionRate: 97.5,
}

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

export function RestaurantDetailsPage() {
  const { id } = useParams()
  const restaurant = mockRestaurant
  const stats = mockStats

  const [statusModal, setStatusModal] = useState(false)
  const [newStatus, setNewStatus] = useState<RestaurantStatus>(restaurant.status)

  const handleStatusChange = () => {
    console.log('Changing status:', id, newStatus)
    setStatusModal(false)
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
          </div>
          <p className="text-[hsl(var(--muted-foreground))]">ID: {id}</p>
        </div>
        <Button variant="outline" onClick={() => setStatusModal(true)}>
          Изменить статус
        </Button>
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
                  <p className="font-medium">{restaurant.address}</p>
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
                    {restaurant.rating ? restaurant.rating.toFixed(1) : '—'}
                  </p>
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
                  <p className="mt-2 text-2xl font-bold">{stats.avgPrepTime} мин</p>
                </div>
                <div className="rounded-lg border border-[hsl(var(--border))] p-4">
                  <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Выполнение</span>
                  </div>
                  <p className="mt-2 text-2xl font-bold">{stats.completionRate}%</p>
                </div>
              </div>
            </div>

            {/* Orders stats */}
            <div>
              <h3 className="mb-4 font-semibold">Заказы</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="flex items-center gap-3 rounded-lg bg-[hsl(var(--muted))] p-4">
                  <Package className="h-8 w-8 text-[hsl(var(--primary))]" />
                  <div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Сегодня</p>
                    <p className="text-xl font-bold">{stats.todayOrders}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-[hsl(var(--muted))] p-4">
                  <Package className="h-8 w-8 text-[hsl(var(--primary))]" />
                  <div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">За неделю</p>
                    <p className="text-xl font-bold">{stats.weekOrders}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-[hsl(var(--muted))] p-4">
                  <Package className="h-8 w-8 text-[hsl(var(--primary))]" />
                  <div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">За месяц</p>
                    <p className="text-xl font-bold">{stats.monthOrders}</p>
                  </div>
                </div>
              </div>
            </div>
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
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Обновлён</p>
                <p className="font-medium">{formatDateTime(restaurant.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

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
            <option value="APPROVED">Одобрен</option>
            <option value="SUSPENDED">Приостановлен</option>
            <option value="REJECTED">Отклонён</option>
          </Select>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setStatusModal(false)}>
            Отмена
          </Button>
          <Button onClick={handleStatusChange}>Сохранить</Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
