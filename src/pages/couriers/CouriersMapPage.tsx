import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MapPin,
  Navigation,
  Bike,
  Package,
  Clock,
  Filter,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Layers,
  Phone,
  User,
  Loader2,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Select,
  Badge,
  Input,
} from '@/components/ui'
import { useOnlineCouriers, useCourierStatistics } from '@/hooks/useCouriers'
import type { CourierStatus } from '@/types'

const statusLabels: Record<CourierStatus, string> = {
  AVAILABLE: 'Свободен',
  BUSY: 'На доставке',
  OFFLINE: 'Офлайн',
  PENDING_APPROVAL: 'Ожидает проверки',
  ON_BREAK: 'На перерыве',
  SUSPENDED: 'Заблокирован',
}

const statusColors: Record<CourierStatus, 'success' | 'warning' | 'secondary' | 'destructive' | 'default'> = {
  AVAILABLE: 'success',
  BUSY: 'warning',
  OFFLINE: 'secondary',
  PENDING_APPROVAL: 'warning',
  ON_BREAK: 'secondary',
  SUSPENDED: 'destructive',
}

export function CouriersMapPage() {
  const [statusFilter, setStatusFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCourier, setSelectedCourier] = useState<number | null>(null)
  const [zoom, setZoom] = useState(12)

  // Fetch online couriers from API (couriers with location)
  const { data, isLoading, refetch } = useOnlineCouriers({
    size: 200,
  })

  // Fetch statistics for the stats cards
  const { data: statisticsData } = useCourierStatistics()

  const onlineCouriers = data?.data?.content || []
  const statistics = statisticsData?.data

  // Apply client-side filters for status and search
  const filteredCouriers = onlineCouriers.filter((courier) => {
    const matchesStatus = !statusFilter || courier.status === statusFilter
    const matchesSearch =
      !searchQuery ||
      (courier.userName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      courier.id.toString().includes(searchQuery)
    return matchesStatus && matchesSearch
  })

  const stats = {
    total: statistics?.totalCouriers || onlineCouriers.length,
    available: statistics?.available || onlineCouriers.filter((c) => c.status === 'AVAILABLE').length,
    busy: statistics?.busy || onlineCouriers.filter((c) => c.status === 'BUSY').length,
    offline: statistics?.offline || 0,
  }

  const selectedCourierData = selectedCourier
    ? filteredCouriers.find((c) => c.id === selectedCourier)
    : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Карта курьеров</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Отслеживание местоположения курьеров в реальном времени
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Обновить
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10">
                <Bike className="h-5 w-5 text-[hsl(var(--primary))]" />
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Всего</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--success))]/10">
                <Navigation className="h-5 w-5 text-[hsl(var(--success))]" />
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Свободны</p>
                <p className="text-xl font-bold">{stats.available}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--warning))]/10">
                <Package className="h-5 w-5 text-[hsl(var(--warning))]" />
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">На доставке</p>
                <p className="text-xl font-bold">{stats.busy}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--muted))]">
                <Clock className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Офлайн</p>
                <p className="text-xl font-bold">{stats.offline}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar */}
        <div className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Filter className="h-4 w-4" />
                Фильтры
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Поиск курьера..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Все статусы</option>
                <option value="AVAILABLE">Свободны</option>
                <option value="BUSY">На доставке</option>
                <option value="OFFLINE">Офлайн</option>
              </Select>
            </CardContent>
          </Card>

          {/* Courier List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Курьеры на карте ({filteredCouriers.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[400px] space-y-2 overflow-y-auto p-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--muted-foreground))]" />
                </div>
              ) : filteredCouriers.length === 0 ? (
                <p className="py-4 text-center text-sm text-[hsl(var(--muted-foreground))]">
                  Нет курьеров с активной геолокацией
                </p>
              ) : (
                filteredCouriers.map((courier) => (
                  <button
                    key={courier.id}
                    onClick={() => setSelectedCourier(courier.id)}
                    className={`w-full rounded-lg border p-3 text-left transition-colors ${
                      selectedCourier === courier.id
                        ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5'
                        : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            courier.status === 'AVAILABLE'
                              ? 'bg-[hsl(var(--success))]'
                              : courier.status === 'BUSY'
                              ? 'bg-[hsl(var(--warning))]'
                              : 'bg-[hsl(var(--muted-foreground))]'
                          }`}
                        />
                        <span className="font-medium">
                          {courier.userName || `Курьер #${courier.id}`}
                        </span>
                      </div>
                      <Badge variant={statusColors[courier.status]} className="text-xs">
                        {statusLabels[courier.status]}
                      </Badge>
                    </div>
                    {courier.currentOrderCount && courier.currentOrderCount > 0 && (
                      <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                        Заказов: {courier.currentOrderCount}
                      </p>
                    )}
                  </button>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Map Area */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardContent className="relative h-[600px] p-0">
              {/* Map Placeholder */}
              <div className="flex h-full items-center justify-center bg-[hsl(var(--muted))]/30 rounded-lg">
                <div className="text-center">
                  <MapPin className="mx-auto h-16 w-16 text-[hsl(var(--muted-foreground))]" />
                  <p className="mt-4 text-lg font-medium">Карта</p>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    Здесь будет интерактивная карта с Yandex Maps или Leaflet
                  </p>
                  <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">
                    Координаты центра: 41.2995, 69.2401 (Ташкент)
                  </p>
                </div>

                {/* Courier markers */}
                <div className="absolute inset-0 pointer-events-none">
                  {filteredCouriers.map((courier, idx) => (
                    <div
                      key={courier.id}
                      className={`absolute pointer-events-auto cursor-pointer ${
                        selectedCourier === courier.id ? 'z-10' : ''
                      }`}
                      style={{
                        left: `${20 + idx * 12}%`,
                        top: `${30 + (idx % 4) * 15}%`,
                      }}
                      onClick={() => setSelectedCourier(courier.id)}
                    >
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full border-2 shadow-lg ${
                          courier.status === 'AVAILABLE'
                            ? 'border-[hsl(var(--success))] bg-[hsl(var(--success))]/20'
                            : courier.status === 'BUSY'
                            ? 'border-[hsl(var(--warning))] bg-[hsl(var(--warning))]/20'
                            : 'border-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))]'
                        } ${selectedCourier === courier.id ? 'ring-2 ring-[hsl(var(--primary))]' : ''}`}
                      >
                        <Bike className="h-4 w-4" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Map Controls */}
              <div className="absolute right-4 top-4 flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-white"
                  onClick={() => setZoom((z) => Math.min(z + 1, 18))}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-white"
                  onClick={() => setZoom((z) => Math.max(z - 1, 5))}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="bg-white">
                  <Layers className="h-4 w-4" />
                </Button>
              </div>

              {/* Zoom indicator */}
              <div className="absolute bottom-4 left-4 rounded bg-white/90 px-2 py-1 text-xs shadow">
                Масштаб: {zoom}x
              </div>

              {/* Selected Courier Panel */}
              {selectedCourierData && (
                <div className="absolute bottom-4 right-4 w-72 rounded-lg border border-[hsl(var(--border))] bg-white p-4 shadow-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--primary))]/10">
                        <User className="h-5 w-5 text-[hsl(var(--primary))]" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {selectedCourierData.userName || `Курьер #${selectedCourierData.id}`}
                        </p>
                        <Badge variant={statusColors[selectedCourierData.status]}>
                          {statusLabels[selectedCourierData.status]}
                        </Badge>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedCourier(null)}
                      className="text-[hsl(var(--muted-foreground))] hover:text-foreground"
                    >
                      ×
                    </button>
                  </div>

                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                      <span>
                        {selectedCourierData.currentLatitude?.toFixed(4)},{' '}
                        {selectedCourierData.currentLongitude?.toFixed(4)}
                      </span>
                    </div>
                    {selectedCourierData.rating > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-[hsl(var(--muted-foreground))]">Рейтинг:</span>
                        <span className="font-medium">{selectedCourierData.rating.toFixed(1)}</span>
                      </div>
                    )}
                    {selectedCourierData.totalDeliveries > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-[hsl(var(--muted-foreground))]">Доставок:</span>
                        <span className="font-medium">{selectedCourierData.totalDeliveries}</span>
                      </div>
                    )}
                  </div>

                  {selectedCourierData.currentOrderCount && selectedCourierData.currentOrderCount > 0 && (
                    <div className="mt-4 rounded-lg bg-[hsl(var(--muted))]/50 p-3">
                      <p className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
                        Текущие заказы
                      </p>
                      <p className="font-medium">
                        {selectedCourierData.currentOrderCount} / {selectedCourierData.maxConcurrentOrders || 3}
                      </p>
                    </div>
                  )}

                  <div className="mt-4 flex gap-2">
                    <Link to={`/couriers/${selectedCourierData.id}`} className="flex-1">
                      <Button size="sm" className="w-full">
                        Профиль
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
