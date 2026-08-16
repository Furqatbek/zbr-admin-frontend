import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  MapPin,
  Star,
  Loader2,
  UtensilsCrossed,
  Plus,
  Edit,
  Store,
  Navigation,
  Crown,
  Clock,
  Phone,
  Mail,
  Truck,
  ShoppingBag,
} from 'lucide-react'
import {
  Card,
  CardContent,
  Badge,
  Button,
  Input,
  Modal,
  ModalFooter,
  Textarea,
} from '@/components/ui'
import { formatNumber, formatCurrency } from '@/lib/utils'
import {
  useActiveRestaurants,
  useFeaturedRestaurants,
  useSearchRestaurants,
  useNearbyRestaurants,
  useMyRestaurants,
  useCreateRestaurant,
  useUpdateRestaurant,
  useRestaurantOrders,
} from '@/hooks/useRestaurants'
import { useRole } from '@/hooks/useUsers'
import type { Restaurant, RestaurantStatus } from '@/types'

type ViewTab = 'active' | 'featured' | 'search' | 'nearby' | 'my' | 'orders'

const statusLabels: Record<RestaurantStatus, string> = {
  PENDING: 'На рассмотрении',
  ACTIVE: 'Активен',
  SUSPENDED: 'Приостановлен',
  CLOSED: 'Закрыт',
  REJECTED: 'Отклонён',
}

const statusColors: Record<RestaurantStatus, 'default' | 'secondary' | 'destructive' | 'success' | 'warning'> = {
  PENDING: 'warning',
  ACTIVE: 'success',
  SUSPENDED: 'destructive',
  CLOSED: 'secondary',
  REJECTED: 'destructive',
}

const emptyForm = {
  name: '',
  description: '',
  phone: '',
  email: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  latitude: '',
  longitude: '',
  acceptsDelivery: true,
  acceptsTakeaway: true,
  acceptsDineIn: false,
  minimumOrder: '',
  deliveryFee: '',
  deliveryRadiusKm: '',
  averagePrepTimeMinutes: '',
  opensAt: '',
  closesAt: '',
}

export function RestaurantDirectoryPage() {
  const [activeTab, setActiveTab] = useState<ViewTab>('active')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchEnabled, setSearchEnabled] = useState(false)
  const [nearbyLat, setNearbyLat] = useState('41.2995')
  const [nearbyLng, setNearbyLng] = useState('69.2401')
  const [nearbyRadius, setNearbyRadius] = useState('5')
  const [nearbyEnabled, setNearbyEnabled] = useState(false)
  const [ordersRestaurantId, setOrdersRestaurantId] = useState('')
  const [ordersEnabled, setOrdersEnabled] = useState(false)

  const [createModal, setCreateModal] = useState(false)
  const [editModal, setEditModal] = useState(false)
  const [editId, setEditId] = useState(0)
  const [form, setForm] = useState({ ...emptyForm })

  // Role lookup for admin context
  const { data: roleData } = useRole(1)

  const { data: activeData, isLoading: activeLoading } = useActiveRestaurants({ page: 0, size: 20 })
  const { data: featuredData, isLoading: featuredLoading } = useFeaturedRestaurants({ page: 0, size: 20 })
  const { data: searchData, isLoading: searchLoading } = useSearchRestaurants(
    { q: searchQuery },
    searchEnabled && !!searchQuery
  )
  const { data: nearbyData, isLoading: nearbyLoading } = useNearbyRestaurants(
    { lat: parseFloat(nearbyLat), lng: parseFloat(nearbyLng), radius: parseFloat(nearbyRadius) },
    nearbyEnabled
  )
  const { data: myData, isLoading: myLoading } = useMyRestaurants()
  const { data: ordersData, isLoading: ordersLoading } = useRestaurantOrders(
    parseInt(ordersRestaurantId) || 0,
    { page: 0, size: 20 }
  )

  const createRestaurant = useCreateRestaurant()
  const updateRestaurant = useUpdateRestaurant()

  const tabs: { key: ViewTab; label: string; icon: React.ReactNode }[] = [
    { key: 'active', label: 'Активные', icon: <Store className="h-4 w-4" /> },
    { key: 'featured', label: 'Рекомендуемые', icon: <Crown className="h-4 w-4" /> },
    { key: 'search', label: 'Поиск', icon: <Search className="h-4 w-4" /> },
    { key: 'nearby', label: 'Рядом', icon: <Navigation className="h-4 w-4" /> },
    { key: 'my', label: 'Мои', icon: <UtensilsCrossed className="h-4 w-4" /> },
    { key: 'orders', label: 'Заказы', icon: <Store className="h-4 w-4" /> },
  ]

  const buildRequestData = () => ({
    name: form.name,
    description: form.description || undefined,
    phone: form.phone,
    email: form.email || undefined,
    addressLine1: form.addressLine1,
    addressLine2: form.addressLine2 || undefined,
    city: form.city,
    state: form.state || undefined,
    postalCode: form.postalCode || undefined,
    country: form.country || undefined,
    latitude: form.latitude ? parseFloat(form.latitude) : undefined,
    longitude: form.longitude ? parseFloat(form.longitude) : undefined,
    acceptsDelivery: form.acceptsDelivery,
    acceptsTakeaway: form.acceptsTakeaway,
    acceptsDineIn: form.acceptsDineIn,
    minimumOrder: form.minimumOrder ? parseFloat(form.minimumOrder) : undefined,
    deliveryFee: form.deliveryFee ? parseFloat(form.deliveryFee) : undefined,
    deliveryRadiusKm: form.deliveryRadiusKm ? parseFloat(form.deliveryRadiusKm) : undefined,
    averagePrepTimeMinutes: form.averagePrepTimeMinutes ? parseInt(form.averagePrepTimeMinutes) : undefined,
    opensAt: form.opensAt || undefined,
    closesAt: form.closesAt || undefined,
  })

  const handleCreate = async () => {
    await createRestaurant.mutateAsync(buildRequestData())
    setCreateModal(false)
    setForm({ ...emptyForm })
  }

  const handleUpdate = async () => {
    if (!editId) return
    const data = buildRequestData()
    // For update, only send fields that have values
    const filtered = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined && v !== '')
    )
    await updateRestaurant.mutateAsync({ id: editId, data: filtered })
    setEditModal(false)
  }

  const openEdit = (r: Restaurant) => {
    setEditId(r.id)
    setForm({
      name: r.name,
      description: r.description || '',
      phone: r.phone,
      email: r.email || '',
      addressLine1: r.addressLine1 || '',
      addressLine2: r.addressLine2 || '',
      city: r.city || '',
      state: r.state || '',
      postalCode: r.postalCode || '',
      country: r.country || '',
      latitude: r.latitude != null ? String(r.latitude) : '',
      longitude: r.longitude != null ? String(r.longitude) : '',
      acceptsDelivery: r.acceptsDelivery,
      acceptsTakeaway: r.acceptsTakeaway,
      acceptsDineIn: r.acceptsDineIn,
      minimumOrder: r.minimumOrder != null ? String(r.minimumOrder) : '',
      deliveryFee: r.deliveryFee != null ? String(r.deliveryFee) : '',
      deliveryRadiusKm: r.deliveryRadiusKm != null ? String(r.deliveryRadiusKm) : '',
      averagePrepTimeMinutes: r.averagePrepTimeMinutes != null ? String(r.averagePrepTimeMinutes) : '',
      opensAt: r.opensAt || '',
      closesAt: r.closesAt || '',
    })
    setEditModal(true)
  }

  const renderRestaurantList = (restaurants: Restaurant[] | undefined, loading: boolean) => {
    if (loading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
    if (!restaurants || restaurants.length === 0) {
      return <p className="text-center py-8 text-[hsl(var(--muted-foreground))]">Рестораны не найдены</p>
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {restaurants.map((r) => (
          <Card key={r.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Link to={`/restaurants/${r.id}`} className="text-lg font-semibold hover:underline">
                    {r.name}
                  </Link>
                  <div className="mt-1 flex items-center gap-2 flex-wrap">
                    <Badge variant={statusColors[r.status]}>{statusLabels[r.status]}</Badge>
                    {r.featured && <Badge variant="warning">Featured</Badge>}
                    {r.isCurrentlyOpen && <Badge variant="success">Открыт</Badge>}
                    {r.acceptsDelivery && <Badge variant="outline">Доставка</Badge>}
                    {r.acceptsTakeaway && <Badge variant="outline">Самовывоз</Badge>}
                    {r.acceptsDineIn && <Badge variant="outline">В зале</Badge>}
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => openEdit(r)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </div>

              {r.description && (
                <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))] line-clamp-2">{r.description}</p>
              )}

              <div className="mt-3 flex items-center gap-4 text-sm text-[hsl(var(--muted-foreground))] flex-wrap">
                {r.averageRating != null && r.averageRating > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-[hsl(var(--warning))]" />
                    {r.averageRating.toFixed(1)} ({r.totalRatings || 0})
                  </span>
                )}
                {r.totalOrders != null && (
                  <span className="flex items-center gap-1">
                    <ShoppingBag className="h-3 w-3" />
                    {formatNumber(r.totalOrders)} заказов
                  </span>
                )}
                {r.fullAddress ? (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {r.fullAddress}
                  </span>
                ) : r.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {r.city}
                  </span>
                )}
              </div>

              <div className="mt-2 flex items-center gap-4 text-xs text-[hsl(var(--muted-foreground))] flex-wrap">
                {r.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {r.phone}
                  </span>
                )}
                {r.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {r.email}
                  </span>
                )}
              </div>

              <div className="mt-2 flex items-center gap-4 text-xs text-[hsl(var(--muted-foreground))] flex-wrap">
                {r.minimumOrder != null && (
                  <span>Мин. заказ: {formatCurrency(r.minimumOrder)}</span>
                )}
                {r.deliveryFee != null && (
                  <span className="flex items-center gap-1">
                    <Truck className="h-3 w-3" />
                    Доставка: {formatCurrency(r.deliveryFee)}
                  </span>
                )}
                {r.deliveryRadiusKm != null && (
                  <span>Радиус: {r.deliveryRadiusKm} км</span>
                )}
                {r.averagePrepTimeMinutes != null && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    ~{r.averagePrepTimeMinutes} мин
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Extract restaurants from paginated or array response
  const getRestaurants = (data: unknown): Restaurant[] | undefined => {
    if (!data) return undefined
    const d = data as { data?: unknown }
    if (Array.isArray(d.data)) return d.data as Restaurant[]
    const inner = d.data as { content?: Restaurant[] }
    if (inner?.content) return inner.content
    return undefined
  }

  const renderFormFields = () => (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
      {/* Basic Info */}
      <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Основная информация</p>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">Название *</label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Телефон *</label>
          <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium">Email</label>
        <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium">Описание</label>
        <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
      </div>

      {/* Address */}
      <p className="text-sm font-medium text-[hsl(var(--muted-foreground))] pt-2">Адрес</p>
      <div>
        <label className="mb-2 block text-sm font-medium">Адрес (строка 1) *</label>
        <Input value={form.addressLine1} onChange={(e) => setForm({ ...form, addressLine1: e.target.value })} />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium">Адрес (строка 2)</label>
        <Input value={form.addressLine2} onChange={(e) => setForm({ ...form, addressLine2: e.target.value })} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">Город *</label>
          <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Область/Штат</label>
          <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">Почтовый индекс</label>
          <Input value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Страна</label>
          <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="US" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">Широта</label>
          <Input type="number" step="any" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Долгота</label>
          <Input type="number" step="any" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
        </div>
      </div>

      {/* Service Options */}
      <p className="text-sm font-medium text-[hsl(var(--muted-foreground))] pt-2">Опции обслуживания</p>
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.acceptsDelivery}
            onChange={(e) => setForm({ ...form, acceptsDelivery: e.target.checked })}
            className="rounded border-[hsl(var(--input))]"
          />
          Доставка
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.acceptsTakeaway}
            onChange={(e) => setForm({ ...form, acceptsTakeaway: e.target.checked })}
            className="rounded border-[hsl(var(--input))]"
          />
          Самовывоз
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.acceptsDineIn}
            onChange={(e) => setForm({ ...form, acceptsDineIn: e.target.checked })}
            className="rounded border-[hsl(var(--input))]"
          />
          В зале
        </label>
      </div>

      {/* Delivery & Order Settings */}
      <p className="text-sm font-medium text-[hsl(var(--muted-foreground))] pt-2">Доставка и заказы</p>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">Минимальный заказ</label>
          <Input type="number" step="0.01" value={form.minimumOrder} onChange={(e) => setForm({ ...form, minimumOrder: e.target.value })} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Стоимость доставки</label>
          <Input type="number" step="0.01" value={form.deliveryFee} onChange={(e) => setForm({ ...form, deliveryFee: e.target.value })} />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">Радиус доставки (км)</label>
          <Input type="number" value={form.deliveryRadiusKm} onChange={(e) => setForm({ ...form, deliveryRadiusKm: e.target.value })} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Среднее время подготовки (мин)</label>
          <Input type="number" value={form.averagePrepTimeMinutes} onChange={(e) => setForm({ ...form, averagePrepTimeMinutes: e.target.value })} />
        </div>
      </div>

      {/* Working Hours */}
      <p className="text-sm font-medium text-[hsl(var(--muted-foreground))] pt-2">Часы работы</p>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">Открытие</label>
          <Input type="time" value={form.opensAt} onChange={(e) => setForm({ ...form, opensAt: e.target.value })} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Закрытие</label>
          <Input type="time" value={form.closesAt} onChange={(e) => setForm({ ...form, closesAt: e.target.value })} />
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Каталог ресторанов</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Поиск, фильтрация и управление ресторанами
          </p>
          {roleData?.data && (
            <Badge variant="outline" className="mt-1">Роль: {roleData.data.displayName || 'Admin'}</Badge>
          )}
        </div>
        <Button onClick={() => { setForm({ ...emptyForm }); setCreateModal(true) }}>
          <Plus className="mr-2 h-4 w-4" />
          Новый ресторан
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? 'default' : 'outline'}
            onClick={() => setActiveTab(tab.key)}
            size="sm"
          >
            {tab.icon}
            <span className="ml-2">{tab.label}</span>
          </Button>
        ))}
      </div>

      {/* Search bar for search tab */}
      {activeTab === 'search' && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Input
                placeholder="Поиск ресторанов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') setSearchEnabled(true) }}
              />
              <Button onClick={() => setSearchEnabled(true)}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Nearby params */}
      {activeTab === 'nearby' && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="mb-1 block text-sm text-[hsl(var(--muted-foreground))]">Широта</label>
                <Input value={nearbyLat} onChange={(e) => setNearbyLat(e.target.value)} className="w-[120px]" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-[hsl(var(--muted-foreground))]">Долгота</label>
                <Input value={nearbyLng} onChange={(e) => setNearbyLng(e.target.value)} className="w-[120px]" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-[hsl(var(--muted-foreground))]">Радиус (км)</label>
                <Input value={nearbyRadius} onChange={(e) => setNearbyRadius(e.target.value)} className="w-[100px]" />
              </div>
              <Button onClick={() => setNearbyEnabled(true)}>
                <Navigation className="mr-2 h-4 w-4" />
                Найти
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Orders lookup */}
      {activeTab === 'orders' && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="ID ресторана"
                value={ordersRestaurantId}
                onChange={(e) => setOrdersRestaurantId(e.target.value)}
                type="number"
              />
              <Button onClick={() => setOrdersEnabled(true)}>Загрузить заказы</Button>
            </div>
            {ordersLoading && ordersEnabled ? (
              <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : ordersData?.data ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[hsl(var(--border))]">
                      <th className="text-left py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">ID</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Клиент</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Статус</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Сумма</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Array.isArray(ordersData.data) ? ordersData.data : (ordersData.data as { content?: unknown[] }).content || []).map((order: unknown) => {
                      const o = order as { id: number; consumerName?: string; status: string; total: number }
                      return (
                        <tr key={o.id} className="border-b border-[hsl(var(--border))]">
                          <td className="py-3 px-4 text-sm">#{o.id}</td>
                          <td className="py-3 px-4 text-sm">{o.consumerName || '—'}</td>
                          <td className="py-3 px-4"><Badge variant="secondary">{o.status}</Badge></td>
                          <td className="py-3 px-4 text-sm">{formatCurrency(o.total)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : ordersEnabled ? (
              <p className="text-center py-4 text-[hsl(var(--muted-foreground))]">Нет заказов</p>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Restaurant lists */}
      {activeTab === 'active' && renderRestaurantList(getRestaurants(activeData), activeLoading)}
      {activeTab === 'featured' && renderRestaurantList(getRestaurants(featuredData), featuredLoading)}
      {activeTab === 'search' && searchEnabled && renderRestaurantList(getRestaurants(searchData), searchLoading)}
      {activeTab === 'nearby' && nearbyEnabled && renderRestaurantList(getRestaurants(nearbyData), nearbyLoading)}
      {activeTab === 'my' && renderRestaurantList(getRestaurants(myData), myLoading)}

      {/* Create Modal */}
      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="Новый ресторан">
        {renderFormFields()}
        <ModalFooter>
          <Button variant="outline" onClick={() => setCreateModal(false)}>Отмена</Button>
          <Button onClick={handleCreate} disabled={createRestaurant.isPending || !form.name || !form.phone || !form.addressLine1 || !form.city}>
            {createRestaurant.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Создать
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={editModal} onClose={() => setEditModal(false)} title="Редактирование ресторана">
        {renderFormFields()}
        <ModalFooter>
          <Button variant="outline" onClick={() => setEditModal(false)}>Отмена</Button>
          <Button onClick={handleUpdate} disabled={updateRestaurant.isPending}>
            {updateRestaurant.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Сохранить
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
