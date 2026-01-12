import { useState } from 'react'
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

// Mock courier data with locations
const mockCouriers = [
  {
    id: 1,
    name: 'Александр Петров',
    phone: '+7 (999) 123-45-67',
    status: 'DELIVERING' as const,
    lat: 55.7558,
    lng: 37.6173,
    currentOrder: { id: 1045, restaurant: 'Пицца Хат', destination: 'ул. Ленина, 25' },
    speed: 25,
    battery: 85,
  },
  {
    id: 2,
    name: 'Мария Иванова',
    phone: '+7 (999) 234-56-78',
    status: 'AVAILABLE' as const,
    lat: 55.7612,
    lng: 37.6095,
    currentOrder: null,
    speed: 0,
    battery: 92,
  },
  {
    id: 3,
    name: 'Дмитрий Сидоров',
    phone: '+7 (999) 345-67-89',
    status: 'DELIVERING' as const,
    lat: 55.7489,
    lng: 37.6251,
    currentOrder: { id: 1048, restaurant: 'Суши Мастер', destination: 'пр. Мира, 10' },
    speed: 18,
    battery: 45,
  },
  {
    id: 4,
    name: 'Елена Козлова',
    phone: '+7 (999) 456-78-90',
    status: 'OFFLINE' as const,
    lat: 55.7534,
    lng: 37.6012,
    currentOrder: null,
    speed: 0,
    battery: 23,
  },
  {
    id: 5,
    name: 'Иван Новиков',
    phone: '+7 (999) 567-89-01',
    status: 'AVAILABLE' as const,
    lat: 55.7678,
    lng: 37.6189,
    currentOrder: null,
    speed: 0,
    battery: 78,
  },
]

const statusLabels = {
  AVAILABLE: 'Свободен',
  DELIVERING: 'На доставке',
  OFFLINE: 'Офлайн',
}

const statusColors = {
  AVAILABLE: 'success',
  DELIVERING: 'warning',
  OFFLINE: 'secondary',
} as const

export function CouriersMapPage() {
  const [statusFilter, setStatusFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCourier, setSelectedCourier] = useState<number | null>(null)
  const [zoom, setZoom] = useState(12)

  const filteredCouriers = mockCouriers.filter((courier) => {
    const matchesStatus = !statusFilter || courier.status === statusFilter
    const matchesSearch =
      !searchQuery ||
      courier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      courier.phone.includes(searchQuery)
    return matchesStatus && matchesSearch
  })

  const stats = {
    total: mockCouriers.length,
    available: mockCouriers.filter((c) => c.status === 'AVAILABLE').length,
    delivering: mockCouriers.filter((c) => c.status === 'DELIVERING').length,
    offline: mockCouriers.filter((c) => c.status === 'OFFLINE').length,
  }

  const selectedCourierData = selectedCourier
    ? mockCouriers.find((c) => c.id === selectedCourier)
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
        <Button variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
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
                <p className="text-xl font-bold">{stats.delivering}</p>
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
                <option value="DELIVERING">На доставке</option>
                <option value="OFFLINE">Офлайн</option>
              </Select>
            </CardContent>
          </Card>

          {/* Courier List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Курьеры ({filteredCouriers.length})</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[400px] space-y-2 overflow-y-auto p-2">
              {filteredCouriers.map((courier) => (
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
                            : courier.status === 'DELIVERING'
                            ? 'bg-[hsl(var(--warning))]'
                            : 'bg-[hsl(var(--muted-foreground))]'
                        }`}
                      />
                      <span className="font-medium">{courier.name}</span>
                    </div>
                    <Badge variant={statusColors[courier.status]} className="text-xs">
                      {statusLabels[courier.status]}
                    </Badge>
                  </div>
                  {courier.currentOrder && (
                    <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))] truncate">
                      Заказ #{courier.currentOrder.id} → {courier.currentOrder.destination}
                    </p>
                  )}
                </button>
              ))}
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
                    Координаты центра: 55.7558, 37.6173 (Москва)
                  </p>
                </div>

                {/* Mock courier markers */}
                <div className="absolute inset-0 pointer-events-none">
                  {filteredCouriers.map((courier, idx) => (
                    <div
                      key={courier.id}
                      className={`absolute pointer-events-auto cursor-pointer ${
                        selectedCourier === courier.id ? 'z-10' : ''
                      }`}
                      style={{
                        left: `${20 + idx * 15}%`,
                        top: `${30 + (idx % 3) * 20}%`,
                      }}
                      onClick={() => setSelectedCourier(courier.id)}
                    >
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full border-2 shadow-lg ${
                          courier.status === 'AVAILABLE'
                            ? 'border-[hsl(var(--success))] bg-[hsl(var(--success))]/20'
                            : courier.status === 'DELIVERING'
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
                        <p className="font-medium">{selectedCourierData.name}</p>
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
                      <Phone className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                      <span>{selectedCourierData.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                      <span>
                        {selectedCourierData.lat.toFixed(4)}, {selectedCourierData.lng.toFixed(4)}
                      </span>
                    </div>
                    {selectedCourierData.speed > 0 && (
                      <div className="flex items-center gap-2">
                        <Navigation className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                        <span>{selectedCourierData.speed} км/ч</span>
                      </div>
                    )}
                  </div>

                  {selectedCourierData.currentOrder && (
                    <div className="mt-4 rounded-lg bg-[hsl(var(--muted))]/50 p-3">
                      <p className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
                        Текущий заказ
                      </p>
                      <p className="font-medium">
                        #{selectedCourierData.currentOrder.id}
                      </p>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        {selectedCourierData.currentOrder.restaurant}
                      </p>
                      <p className="text-sm">
                        → {selectedCourierData.currentOrder.destination}
                      </p>
                    </div>
                  )}

                  <div className="mt-4 flex gap-2">
                    <Button size="sm" className="flex-1">
                      <Phone className="mr-2 h-4 w-4" />
                      Позвонить
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Профиль
                    </Button>
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
