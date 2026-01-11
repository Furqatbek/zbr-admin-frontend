import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle,
  X,
  Eye,
  MapPin,
  Phone,
  User,
  Calendar,
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
  Textarea,
} from '@/components/ui'
import { formatDateTime } from '@/lib/utils'
import type { Restaurant } from '@/types'

// Mock pending restaurants
const mockPendingRestaurants: Restaurant[] = [
  {
    id: 4,
    name: 'Вкусный Дом',
    description: 'Домашняя кухня с доставкой',
    address: 'ул. Советская, д. 5',
    phone: '+7 495 456 78 90',
    email: 'home@example.com',
    status: 'PENDING',
    isOpen: false,
    ownerId: 9,
    ownerName: 'Мария Козлова',
    createdAt: '2024-01-14T10:00:00Z',
    updatedAt: '2024-01-14T10:00:00Z',
  },
  {
    id: 6,
    name: 'Новый Ресторан',
    description: 'Европейская кухня высокого уровня',
    address: 'ул. Тверская, д. 1',
    phone: '+7 495 678 90 12',
    status: 'PENDING',
    isOpen: false,
    ownerId: 13,
    ownerName: 'Ольга Новикова',
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
  },
]

export function RestaurantModerationPage() {
  const [pendingRestaurants, setPendingRestaurants] = useState(mockPendingRestaurants)
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
  const [actionModal, setActionModal] = useState<{
    type: 'approve' | 'reject'
    restaurant: Restaurant
  } | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const handleApprove = () => {
    if (actionModal?.restaurant) {
      console.log('Approving restaurant:', actionModal.restaurant.id)
      setPendingRestaurants((prev) => prev.filter((r) => r.id !== actionModal.restaurant.id))
      setActionModal(null)
      setSelectedRestaurant(null)
    }
  }

  const handleReject = () => {
    if (actionModal?.restaurant) {
      console.log('Rejecting restaurant:', actionModal.restaurant.id, rejectReason)
      setPendingRestaurants((prev) => prev.filter((r) => r.id !== actionModal.restaurant.id))
      setActionModal(null)
      setSelectedRestaurant(null)
      setRejectReason('')
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-4">
        <Link to="/restaurants">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Модерация ресторанов</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Проверка заявок на регистрацию ресторанов
          </p>
        </div>
      </div>

      {pendingRestaurants.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-[hsl(var(--success))]" />
            <h3 className="mt-4 text-lg font-semibold">Все заявки обработаны</h3>
            <p className="mt-2 text-[hsl(var(--muted-foreground))]">
              Нет ресторанов, ожидающих модерации
            </p>
            <Link to="/restaurants">
              <Button className="mt-4">Вернуться к списку</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Pending list */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Заявки</span>
                <Badge variant="warning">{pendingRestaurants.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-[hsl(var(--border))]">
                {pendingRestaurants.map((restaurant) => (
                  <button
                    key={restaurant.id}
                    onClick={() => setSelectedRestaurant(restaurant)}
                    className={`w-full p-4 text-left transition-colors hover:bg-[hsl(var(--muted))] ${
                      selectedRestaurant?.id === restaurant.id ? 'bg-[hsl(var(--muted))]' : ''
                    }`}
                  >
                    <p className="font-medium">{restaurant.name}</p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] truncate">
                      {restaurant.address}
                    </p>
                    <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                      {formatDateTime(restaurant.createdAt)}
                    </p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Details panel */}
          <Card className="lg:col-span-2">
            {selectedRestaurant ? (
              <>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Детали заявки</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setActionModal({ type: 'reject', restaurant: selectedRestaurant })}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Отклонить
                    </Button>
                    <Button
                      variant="success"
                      onClick={() => setActionModal({ type: 'approve', restaurant: selectedRestaurant })}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Одобрить
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Restaurant info */}
                  <div>
                    <h3 className="text-xl font-semibold">{selectedRestaurant.name}</h3>
                    {selectedRestaurant.description && (
                      <p className="mt-2 text-[hsl(var(--muted-foreground))]">
                        {selectedRestaurant.description}
                      </p>
                    )}
                  </div>

                  {/* Info grid */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center gap-3 rounded-lg border border-[hsl(var(--border))] p-4">
                      <MapPin className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                      <div>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">Адрес</p>
                        <p className="font-medium">{selectedRestaurant.address}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border border-[hsl(var(--border))] p-4">
                      <Phone className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                      <div>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">Телефон</p>
                        <p className="font-medium">{selectedRestaurant.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border border-[hsl(var(--border))] p-4">
                      <User className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                      <div>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">Владелец</p>
                        <p className="font-medium">{selectedRestaurant.ownerName || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border border-[hsl(var(--border))] p-4">
                      <Calendar className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                      <div>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">Дата заявки</p>
                        <p className="font-medium">{formatDateTime(selectedRestaurant.createdAt)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Links */}
                  <div className="flex gap-3">
                    <Link to={`/restaurants/${selectedRestaurant.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        <Eye className="mr-2 h-4 w-4" />
                        Полный профиль
                      </Button>
                    </Link>
                    <Link to={`/users/${selectedRestaurant.ownerId}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        <User className="mr-2 h-4 w-4" />
                        Профиль владельца
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex h-[400px] items-center justify-center text-[hsl(var(--muted-foreground))]">
                Выберите заявку для просмотра
              </CardContent>
            )}
          </Card>
        </div>
      )}

      {/* Approve modal */}
      <Modal
        isOpen={actionModal?.type === 'approve'}
        onClose={() => setActionModal(null)}
        title="Одобрение ресторана"
        description={`Одобрить ресторан "${actionModal?.restaurant.name}"?`}
        size="sm"
      >
        <p className="text-sm">
          После одобрения ресторан сможет принимать заказы на платформе.
        </p>
        <ModalFooter>
          <Button variant="outline" onClick={() => setActionModal(null)}>
            Отмена
          </Button>
          <Button variant="success" onClick={handleApprove}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Одобрить
          </Button>
        </ModalFooter>
      </Modal>

      {/* Reject modal */}
      <Modal
        isOpen={actionModal?.type === 'reject'}
        onClose={() => {
          setActionModal(null)
          setRejectReason('')
        }}
        title="Отклонение заявки"
        description={`Отклонить заявку ресторана "${actionModal?.restaurant.name}"?`}
      >
        <div>
          <label className="mb-2 block text-sm font-medium">Причина отклонения</label>
          <Textarea
            placeholder="Укажите причину отклонения заявки..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </div>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => {
              setActionModal(null)
              setRejectReason('')
            }}
          >
            Отмена
          </Button>
          <Button variant="destructive" onClick={handleReject}>
            <X className="mr-2 h-4 w-4" />
            Отклонить
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
