import { useState } from 'react'
import {
  MapPin,
  Loader2,
  UserPlus,
  Bike,
  Navigation,
  CheckCircle,
  Package,
  Search,
  User,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Input,
  Select,
  Modal,
  ModalFooter,
} from '@/components/ui'
import { formatNumber } from '@/lib/utils'
import {
  useMyProfile,
  useAvailableCouriers,
  useRegisterCourier,
  useUpdateCourierStatus,
  useUpdateCourierLocation,
  useAcceptOrder,
  useCompleteDelivery,
} from '@/hooks/useCouriers'
import type { CourierStatus, VehicleType } from '@/types'

const statusLabels: Record<CourierStatus, string> = {
  PENDING_APPROVAL: 'Ожидает проверки',
  AVAILABLE: 'Доступен',
  BUSY: 'Занят',
  OFFLINE: 'Не в сети',
  ON_BREAK: 'На перерыве',
  SUSPENDED: 'Заблокирован',
}

const vehicleLabels: Record<VehicleType, string> = {
  WALKING: 'Пешком',
  BICYCLE: 'Велосипед',
  E_BIKE: 'Электровелосипед',
  MOTORCYCLE: 'Мотоцикл',
  CAR: 'Автомобиль',
  VAN: 'Фургон',
}

export function CourierOperationsPage() {
  const [lat, setLat] = useState('41.2995')
  const [lng, setLng] = useState('69.2401')
  const [radius, setRadius] = useState('5')
  const [searchEnabled, setSearchEnabled] = useState(false)

  const [registerModal, setRegisterModal] = useState(false)
  const [registerForm, setRegisterForm] = useState({
    vehicleType: 'BICYCLE' as VehicleType,
    vehicleNumber: '',
    licenseNumber: '',
    preferredRadiusKm: 5,
  })

  const [acceptCourierId, setAcceptCourierId] = useState('')
  const [acceptOrderId, setAcceptOrderId] = useState('')
  const [completeCourierId, setCompleteCourierId] = useState('')
  const [completeOrderId, setCompleteOrderId] = useState('')

  const [newStatus, setNewStatus] = useState<CourierStatus>('AVAILABLE')
  const [locationLat, setLocationLat] = useState('41.2995')
  const [locationLng, setLocationLng] = useState('69.2401')

  const { data: profileData, isLoading: profileLoading } = useMyProfile()
  const { data: availableData, isLoading: availableLoading } = useAvailableCouriers(
    { lat: parseFloat(lat), lng: parseFloat(lng), radiusKm: parseFloat(radius) },
    searchEnabled
  )
  const registerCourier = useRegisterCourier()
  const updateStatus = useUpdateCourierStatus()
  const updateLocation = useUpdateCourierLocation()
  const acceptOrder = useAcceptOrder()
  const completeDelivery = useCompleteDelivery()

  const profile = profileData?.data
  const availableCouriers = availableData?.data

  const handleRegister = async () => {
    await registerCourier.mutateAsync(registerForm)
    setRegisterModal(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Операции курьеров</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Профиль, поиск, статус, локация, назначение заказов
          </p>
        </div>
        <Button onClick={() => setRegisterModal(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Регистрация курьера
        </Button>
      </div>

      {/* My Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Мой профиль курьера
          </CardTitle>
        </CardHeader>
        <CardContent>
          {profileLoading ? (
            <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : profile ? (
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="rounded-lg border border-[hsl(var(--border))] p-3">
                <p className="text-sm text-[hsl(var(--muted-foreground))]">ID</p>
                <p className="text-lg font-bold">#{profile.id}</p>
              </div>
              <div className="rounded-lg border border-[hsl(var(--border))] p-3">
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Статус</p>
                <Badge variant="secondary">{statusLabels[profile.status] || profile.status}</Badge>
              </div>
              <div className="rounded-lg border border-[hsl(var(--border))] p-3">
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Рейтинг</p>
                <p className="text-lg font-bold">{profile.rating?.toFixed(1) ?? '—'}</p>
              </div>
              <div className="rounded-lg border border-[hsl(var(--border))] p-3">
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Доставок</p>
                <p className="text-lg font-bold">{formatNumber(profile.totalDeliveries || 0)}</p>
              </div>
            </div>
          ) : (
            <p className="text-[hsl(var(--muted-foreground))]">Профиль курьера не найден (вы не зарегистрированы как курьер)</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Update Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bike className="h-5 w-5" />
              Обновить статус
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value as CourierStatus)}>
              {Object.entries(statusLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </Select>
            <Button
              onClick={() => updateStatus.mutate(newStatus)}
              disabled={updateStatus.isPending}
            >
              {updateStatus.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
              Обновить статус
            </Button>
            {updateStatus.isSuccess && <Badge variant="success">Статус обновлён</Badge>}
          </CardContent>
        </Card>

        {/* Update Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              Обновить локацию
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs text-[hsl(var(--muted-foreground))]">Широта</label>
                <Input value={locationLat} onChange={(e) => setLocationLat(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-[hsl(var(--muted-foreground))]">Долгота</label>
                <Input value={locationLng} onChange={(e) => setLocationLng(e.target.value)} />
              </div>
            </div>
            <Button
              onClick={() => updateLocation.mutate({ lat: parseFloat(locationLat), lng: parseFloat(locationLng) })}
              disabled={updateLocation.isPending}
            >
              {updateLocation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
              Отправить локацию
            </Button>
            {updateLocation.isSuccess && <Badge variant="success">Локация обновлена</Badge>}
          </CardContent>
        </Card>

        {/* Accept Order */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Принять заказ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs text-[hsl(var(--muted-foreground))]">ID курьера</label>
                <Input value={acceptCourierId} onChange={(e) => setAcceptCourierId(e.target.value)} type="number" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-[hsl(var(--muted-foreground))]">ID заказа</label>
                <Input value={acceptOrderId} onChange={(e) => setAcceptOrderId(e.target.value)} type="number" />
              </div>
            </div>
            <Button
              onClick={() => acceptOrder.mutate({ courierId: parseInt(acceptCourierId), orderId: parseInt(acceptOrderId) })}
              disabled={acceptOrder.isPending || !acceptCourierId || !acceptOrderId}
            >
              {acceptOrder.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
              Принять заказ
            </Button>
            {acceptOrder.isSuccess && <Badge variant="success">Заказ принят</Badge>}
          </CardContent>
        </Card>

        {/* Complete Delivery */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Завершить доставку
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs text-[hsl(var(--muted-foreground))]">ID курьера</label>
                <Input value={completeCourierId} onChange={(e) => setCompleteCourierId(e.target.value)} type="number" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-[hsl(var(--muted-foreground))]">ID заказа</label>
                <Input value={completeOrderId} onChange={(e) => setCompleteOrderId(e.target.value)} type="number" />
              </div>
            </div>
            <Button
              onClick={() => completeDelivery.mutate({ courierId: parseInt(completeCourierId), orderId: parseInt(completeOrderId) })}
              disabled={completeDelivery.isPending || !completeCourierId || !completeOrderId}
            >
              {completeDelivery.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Package className="mr-2 h-4 w-4" />}
              Завершить доставку
            </Button>
            {completeDelivery.isSuccess && <Badge variant="success">Доставка завершена</Badge>}
          </CardContent>
        </Card>
      </div>

      {/* Available Couriers Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Поиск доступных курьеров
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="mb-1 block text-sm text-[hsl(var(--muted-foreground))]">Широта</label>
              <Input value={lat} onChange={(e) => setLat(e.target.value)} className="w-[120px]" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-[hsl(var(--muted-foreground))]">Долгота</label>
              <Input value={lng} onChange={(e) => setLng(e.target.value)} className="w-[120px]" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-[hsl(var(--muted-foreground))]">Радиус (км)</label>
              <Input value={radius} onChange={(e) => setRadius(e.target.value)} className="w-[100px]" />
            </div>
            <Button onClick={() => setSearchEnabled(true)}>
              <Search className="mr-2 h-4 w-4" />
              Найти
            </Button>
          </div>

          {availableLoading ? (
            <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : Array.isArray(availableCouriers) && availableCouriers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))]">
                    <th className="text-left py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Транспорт</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Рейтинг</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Расстояние</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {availableCouriers.map((c) => (
                    <tr key={c.id} className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]">
                      <td className="py-3 px-4 text-sm font-medium">#{c.id}</td>
                      <td className="py-3 px-4 text-sm">{vehicleLabels[c.vehicleType] || c.vehicleType}</td>
                      <td className="py-3 px-4 text-sm">{c.rating?.toFixed(1) ?? '—'}</td>
                      <td className="py-3 px-4 text-sm">{c.distanceKm?.toFixed(1)} км</td>
                      <td className="py-3 px-4"><Badge variant="success">{statusLabels[c.status] || c.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : searchEnabled ? (
            <p className="text-center py-4 text-[hsl(var(--muted-foreground))]">Курьеры не найдены</p>
          ) : null}
        </CardContent>
      </Card>

      {/* Register Modal */}
      <Modal isOpen={registerModal} onClose={() => setRegisterModal(false)} title="Регистрация курьера">
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Тип транспорта</label>
            <Select value={registerForm.vehicleType} onChange={(e) => setRegisterForm({ ...registerForm, vehicleType: e.target.value as VehicleType })}>
              {Object.entries(vehicleLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Номер транспорта</label>
            <Input value={registerForm.vehicleNumber} onChange={(e) => setRegisterForm({ ...registerForm, vehicleNumber: e.target.value })} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Номер прав</label>
            <Input value={registerForm.licenseNumber} onChange={(e) => setRegisterForm({ ...registerForm, licenseNumber: e.target.value })} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Радиус работы (км)</label>
            <Input type="number" value={registerForm.preferredRadiusKm} onChange={(e) => setRegisterForm({ ...registerForm, preferredRadiusKm: parseInt(e.target.value) || 5 })} />
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setRegisterModal(false)}>Отмена</Button>
          <Button onClick={handleRegister} disabled={registerCourier.isPending}>
            {registerCourier.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Зарегистрировать
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
