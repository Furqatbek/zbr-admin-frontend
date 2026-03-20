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
  const [form, setForm] = useState({
    name: '',
    phone: '',
    addressLine1: '',
    city: '',
    description: '',
  })

  // Role lookup for admin context
  const { data: roleData } = useRole(1)

  const { data: activeData, isLoading: activeLoading } = useActiveRestaurants({ page: 0, size: 20 })
  const { data: featuredData, isLoading: featuredLoading } = useFeaturedRestaurants({ page: 0, size: 20 })
  const { data: searchData, isLoading: searchLoading } = useSearchRestaurants(
    { q: searchQuery },
    searchEnabled && !!searchQuery
  )
  const { data: nearbyData, isLoading: nearbyLoading } = useNearbyRestaurants(
    { lat: parseFloat(nearbyLat), lng: parseFloat(nearbyLng), radiusKm: parseFloat(nearbyRadius) },
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

  const handleCreate = async () => {
    await createRestaurant.mutateAsync({
      name: form.name,
      phone: form.phone,
      addressLine1: form.addressLine1,
      city: form.city,
      description: form.description || undefined,
    })
    setCreateModal(false)
    setForm({ name: '', phone: '', addressLine1: '', city: '', description: '' })
  }

  const handleUpdate = async () => {
    if (!editId) return
    await updateRestaurant.mutateAsync({
      id: editId,
      data: {
        name: form.name || undefined,
        phone: form.phone || undefined,
        addressLine1: form.addressLine1 || undefined,
        city: form.city || undefined,
        description: form.description || undefined,
      },
    })
    setEditModal(false)
  }

  const openEdit = (r: Restaurant) => {
    setEditId(r.id)
    setForm({
      name: r.name,
      phone: r.phone,
      addressLine1: r.addressLine1 || '',
      city: r.city || '',
      description: r.description || '',
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
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant={statusColors[r.status]}>{statusLabels[r.status]}</Badge>
                    {r.featured && <Badge variant="warning">Featured</Badge>}
                    {r.isCurrentlyOpen && <Badge variant="success">Открыт</Badge>}
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => openEdit(r)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </div>

              {r.description && (
                <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))] line-clamp-2">{r.description}</p>
              )}

              <div className="mt-3 flex items-center gap-4 text-sm text-[hsl(var(--muted-foreground))]">
                {r.averageRating != null && r.averageRating > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-[hsl(var(--warning))]" />
                    {r.averageRating.toFixed(1)}
                  </span>
                )}
                {r.totalOrders != null && (
                  <span>{formatNumber(r.totalOrders)} заказов</span>
                )}
                {r.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {r.city}
                  </span>
                )}
              </div>

              {r.minimumOrder != null && (
                <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">
                  Мин. заказ: {formatCurrency(r.minimumOrder)} | Доставка: {formatCurrency(r.deliveryFee || 0)}
                </p>
              )}
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
            <Badge variant="outline" className="mt-1">Роль: {roleData.data.name || 'Admin'}</Badge>
          )}
        </div>
        <Button onClick={() => setCreateModal(true)}>
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
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Название</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Телефон</label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Адрес</label>
            <Input value={form.addressLine1} onChange={(e) => setForm({ ...form, addressLine1: e.target.value })} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Город</label>
            <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Описание</label>
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setCreateModal(false)}>Отмена</Button>
          <Button onClick={handleCreate} disabled={createRestaurant.isPending || !form.name || !form.phone}>
            {createRestaurant.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Создать
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={editModal} onClose={() => setEditModal(false)} title="Редактирование ресторана">
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Название</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Телефон</label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Адрес</label>
            <Input value={form.addressLine1} onChange={(e) => setForm({ ...form, addressLine1: e.target.value })} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Город</label>
            <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Описание</label>
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
        </div>
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
