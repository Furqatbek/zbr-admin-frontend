import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle,
  X,
  User,
  Calendar,
  Loader2,
  Bike,
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
import { formatDateTime } from '@/lib/utils'
import { usePendingCouriers, useVerifyCourier, useRejectCourier } from '@/hooks/useCouriers'
import type { Courier, VehicleType } from '@/types'

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
      return <Car className="h-4 w-4" />
    case 'WALKING':
      return <Footprints className="h-4 w-4" />
    default:
      return <Bike className="h-4 w-4" />
  }
}

export function CourierVerificationPage() {
  const [selectedCourier, setSelectedCourier] = useState<Courier | null>(null)
  const [actionModal, setActionModal] = useState<{ type: 'approve' | 'reject'; courier: Courier } | null>(null)

  // Fetch pending couriers from API
  const { data, isLoading, refetch } = usePendingCouriers({ size: 50 })

  const verifyCourier = useVerifyCourier()
  const rejectCourier = useRejectCourier()

  const pendingCouriers = data?.data?.content || []

  const handleApprove = async () => {
    if (actionModal?.courier) {
      await verifyCourier.mutateAsync(actionModal.courier.id)
      setActionModal(null)
      setSelectedCourier(null)
      refetch()
    }
  }

  const handleReject = async () => {
    if (actionModal?.courier) {
      await rejectCourier.mutateAsync(actionModal.courier.id)
      setActionModal(null)
      setSelectedCourier(null)
      refetch()
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--muted-foreground))]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-4">
        <Link to="/couriers">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Верификация курьеров</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Проверка заявок на работу курьером
          </p>
        </div>
      </div>

      {pendingCouriers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-[hsl(var(--success))]" />
            <h3 className="mt-4 text-lg font-semibold">Все заявки обработаны</h3>
            <p className="mt-2 text-[hsl(var(--muted-foreground))]">
              Нет курьеров, ожидающих верификации
            </p>
            <Link to="/couriers">
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
                <Badge variant="warning">{pendingCouriers.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-[hsl(var(--border))]">
                {pendingCouriers.map((courier) => (
                  <button
                    key={courier.id}
                    onClick={() => setSelectedCourier(courier)}
                    className={`w-full p-4 text-left transition-colors hover:bg-[hsl(var(--muted))] ${
                      selectedCourier?.id === courier.id ? 'bg-[hsl(var(--muted))]' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={courier.userName || `Courier ${courier.id}`} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{courier.userName || `Курьер #${courier.id}`}</p>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                          {formatDateTime(courier.createdAt)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Details panel */}
          <Card className="lg:col-span-2">
            {selectedCourier ? (
              <>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Детали заявки</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setActionModal({ type: 'reject', courier: selectedCourier })}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Отклонить
                    </Button>
                    <Button
                      variant="success"
                      onClick={() => setActionModal({ type: 'approve', courier: selectedCourier })}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Одобрить
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Courier info */}
                  <div className="flex items-center gap-4">
                    <Avatar name={selectedCourier.userName || `Courier ${selectedCourier.id}`} size="lg" />
                    <div>
                      <h3 className="text-xl font-semibold">{selectedCourier.userName || `Курьер #${selectedCourier.id}`}</h3>
                      <p className="text-[hsl(var(--muted-foreground))]">
                        ID курьера: {selectedCourier.id}
                      </p>
                    </div>
                  </div>

                  {/* Info grid */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-lg border border-[hsl(var(--border))] p-4">
                      <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
                        <User className="h-4 w-4" />
                        <span className="text-sm">User ID</span>
                      </div>
                      <p className="mt-2 font-medium">{selectedCourier.userId}</p>
                    </div>
                    <div className="rounded-lg border border-[hsl(var(--border))] p-4">
                      <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">Дата заявки</span>
                      </div>
                      <p className="mt-2 font-medium">{formatDateTime(selectedCourier.createdAt)}</p>
                    </div>
                  </div>

                  {/* Vehicle info */}
                  {selectedCourier.vehicleType && (
                    <div>
                      <h4 className="mb-3 font-semibold">Транспорт</h4>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="flex items-center gap-2 rounded-lg border border-[hsl(var(--border))] p-3">
                          <VehicleIcon type={selectedCourier.vehicleType} />
                          <div>
                            <p className="text-xs text-[hsl(var(--muted-foreground))]">Тип</p>
                            <p className="font-medium">{vehicleLabels[selectedCourier.vehicleType]}</p>
                          </div>
                        </div>
                        {selectedCourier.vehicleNumber && (
                          <div className="flex items-center gap-2 rounded-lg border border-[hsl(var(--border))] p-3">
                            <Car className="h-4 w-4" />
                            <div>
                              <p className="text-xs text-[hsl(var(--muted-foreground))]">Номер ТС</p>
                              <p className="font-medium">{selectedCourier.vehicleNumber}</p>
                            </div>
                          </div>
                        )}
                        {selectedCourier.licenseNumber && (
                          <div className="flex items-center gap-2 rounded-lg border border-[hsl(var(--border))] p-3">
                            <User className="h-4 w-4" />
                            <div>
                              <p className="text-xs text-[hsl(var(--muted-foreground))]">Права</p>
                              <p className="font-medium">{selectedCourier.licenseNumber}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Preferred radius */}
                  {selectedCourier.preferredRadiusKm && (
                    <div className="rounded-lg border border-[hsl(var(--border))] p-4">
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">Предпочтительный радиус работы</p>
                      <p className="mt-1 font-medium">{selectedCourier.preferredRadiusKm} км</p>
                    </div>
                  )}

                  {/* User profile link */}
                  <Link to={`/users/${selectedCourier.userId}`}>
                    <Button variant="outline" className="w-full">
                      Открыть профиль пользователя
                    </Button>
                  </Link>
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

      {/* Action modal */}
      <Modal
        isOpen={!!actionModal}
        onClose={() => setActionModal(null)}
        title={actionModal?.type === 'approve' ? 'Подтверждение' : 'Отклонение'}
        description={
          actionModal?.type === 'approve'
            ? `Вы уверены, что хотите одобрить заявку ${actionModal?.courier.userName || `#${actionModal?.courier.id}`}?`
            : `Вы уверены, что хотите отклонить заявку ${actionModal?.courier.userName || `#${actionModal?.courier.id}`}?`
        }
        size="sm"
      >
        <p className="text-sm">
          {actionModal?.type === 'approve'
            ? 'После одобрения курьер сможет принимать заказы на доставку.'
            : 'После отклонения курьер не сможет работать на платформе.'}
        </p>
        <ModalFooter>
          <Button variant="outline" onClick={() => setActionModal(null)}>
            Отмена
          </Button>
          {actionModal?.type === 'approve' ? (
            <Button
              variant="success"
              onClick={handleApprove}
              disabled={verifyCourier.isPending}
            >
              {verifyCourier.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Одобрить
            </Button>
          ) : (
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectCourier.isPending}
            >
              {rejectCourier.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <X className="mr-2 h-4 w-4" />
              )}
              Отклонить
            </Button>
          )}
        </ModalFooter>
      </Modal>
    </div>
  )
}
