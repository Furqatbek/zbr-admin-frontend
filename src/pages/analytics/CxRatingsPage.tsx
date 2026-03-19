import { useState } from 'react'
import {
  Star,
  Loader2,
  RefreshCw,
  Search,
  Bike,
  UtensilsCrossed,
  Database,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Input,
} from '@/components/ui'
import { formatNumber, formatDateTime } from '@/lib/utils'
import {
  useRestaurantRatingById,
  useCourierRatingById,
  useInvalidateNpsCache,
  useInvalidateRatingsCache,
  useInvalidateSupportTicketsCache,
} from '@/hooks/useCxAnalytics'
import type { CxAnalyticsQueryParams } from '@/types'

export function CxRatingsPage() {
  const [restaurantId, setRestaurantId] = useState<number>(0)
  const [courierId, setCourierId] = useState<number>(0)
  const [searchRestaurantId, setSearchRestaurantId] = useState('')
  const [searchCourierId, setSearchCourierId] = useState('')

  const dateParams: CxAnalyticsQueryParams = {
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    includeDistribution: true,
    includeTrend: true,
  }

  const { data: restaurantRating, isLoading: restaurantLoading } = useRestaurantRatingById(restaurantId, dateParams)
  const { data: courierRating, isLoading: courierLoading } = useCourierRatingById(courierId, dateParams)
  const invalidateNps = useInvalidateNpsCache()
  const invalidateRatings = useInvalidateRatingsCache()
  const invalidateTickets = useInvalidateSupportTicketsCache()

  const restaurant = restaurantRating?.data
  const courier = courierRating?.data

  const handleSearchRestaurant = () => {
    const id = parseInt(searchRestaurantId)
    if (id > 0) setRestaurantId(id)
  }

  const handleSearchCourier = () => {
    const id = parseInt(searchCourierId)
    if (id > 0) setCourierId(id)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Рейтинги CX</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Рейтинги ресторанов и курьеров, управление кэшем
          </p>
        </div>
      </div>

      {/* Cache Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Управление кэшем CX
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => invalidateNps.mutate()}
              disabled={invalidateNps.isPending}
            >
              {invalidateNps.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Очистить NPS кэш
            </Button>
            <Button
              variant="outline"
              onClick={() => invalidateRatings.mutate()}
              disabled={invalidateRatings.isPending}
            >
              {invalidateRatings.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Очистить кэш рейтингов
            </Button>
            <Button
              variant="outline"
              onClick={() => invalidateTickets.mutate()}
              disabled={invalidateTickets.isPending}
            >
              {invalidateTickets.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Очистить кэш тикетов
            </Button>
          </div>
          <div className="mt-2 flex gap-2">
            {invalidateNps.isSuccess && <Badge variant="success">NPS кэш очищен</Badge>}
            {invalidateRatings.isSuccess && <Badge variant="success">Кэш рейтингов очищен</Badge>}
            {invalidateTickets.isSuccess && <Badge variant="success">Кэш тикетов очищен</Badge>}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Restaurant Rating Lookup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5" />
              Рейтинг ресторана
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="ID ресторана"
                value={searchRestaurantId}
                onChange={(e) => setSearchRestaurantId(e.target.value)}
                type="number"
              />
              <Button onClick={handleSearchRestaurant}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {restaurantLoading && restaurantId > 0 ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : restaurant ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 rounded-lg bg-[hsl(var(--primary))]/10 p-4">
                  <Star className="h-8 w-8 text-[hsl(var(--warning))]" />
                  <div>
                    <p className="text-3xl font-bold">{restaurant.averageRating?.toFixed(2) ?? '—'}</p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                      {formatNumber(restaurant.ratingCount || 0)} отзывов
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border border-[hsl(var(--border))] p-3 text-center">
                    <p className="text-lg font-bold">{restaurant.foodQualityAvg?.toFixed(1) ?? '—'}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">Качество еды</p>
                  </div>
                  <div className="rounded-lg border border-[hsl(var(--border))] p-3 text-center">
                    <p className="text-lg font-bold">{restaurant.portionSizeAvg?.toFixed(1) ?? '—'}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">Размер порции</p>
                  </div>
                  <div className="rounded-lg border border-[hsl(var(--border))] p-3 text-center">
                    <p className="text-lg font-bold">{restaurant.valueForMoneyAvg?.toFixed(1) ?? '—'}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">Цена/качество</p>
                  </div>
                </div>

                {restaurant.distribution && restaurant.distribution.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Распределение оценок</p>
                    {restaurant.distribution.map((d) => (
                      <div key={d.rating} className="flex items-center gap-2">
                        <span className="w-8 text-sm">{d.rating}</span>
                        <Star className="h-3 w-3 text-[hsl(var(--warning))]" />
                        <div className="flex-1 h-2 rounded-full bg-[hsl(var(--muted))]">
                          <div
                            className="h-2 rounded-full bg-[hsl(var(--warning))]"
                            style={{ width: `${d.percentage}%` }}
                          />
                        </div>
                        <span className="w-12 text-right text-xs text-[hsl(var(--muted-foreground))]">
                          {d.count}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {restaurant.calculatedAt && (
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    Обновлено: {formatDateTime(restaurant.calculatedAt)}
                  </p>
                )}
              </div>
            ) : restaurantId > 0 ? (
              <p className="text-center text-[hsl(var(--muted-foreground))] py-4">Нет данных</p>
            ) : (
              <p className="text-center text-[hsl(var(--muted-foreground))] py-4">
                Введите ID ресторана для поиска
              </p>
            )}
          </CardContent>
        </Card>

        {/* Courier Rating Lookup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bike className="h-5 w-5" />
              Рейтинг курьера
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="ID курьера"
                value={searchCourierId}
                onChange={(e) => setSearchCourierId(e.target.value)}
                type="number"
              />
              <Button onClick={handleSearchCourier}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {courierLoading && courierId > 0 ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : courier ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 rounded-lg bg-[hsl(var(--success))]/10 p-4">
                  <Star className="h-8 w-8 text-[hsl(var(--warning))]" />
                  <div>
                    <p className="text-3xl font-bold">{courier.averageRating?.toFixed(2) ?? '—'}</p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                      {formatNumber(courier.ratingCount || 0)} отзывов
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border border-[hsl(var(--border))] p-3 text-center">
                    <p className="text-lg font-bold">{courier.professionalismAvg?.toFixed(1) ?? '—'}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">Профессионализм</p>
                  </div>
                  <div className="rounded-lg border border-[hsl(var(--border))] p-3 text-center">
                    <p className="text-lg font-bold">{courier.communicationAvg?.toFixed(1) ?? '—'}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">Коммуникация</p>
                  </div>
                  <div className="rounded-lg border border-[hsl(var(--border))] p-3 text-center">
                    <p className="text-lg font-bold">{courier.timelinessAvg?.toFixed(1) ?? '—'}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">Пунктуальность</p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg bg-[hsl(var(--muted))] p-3">
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Средние чаевые</p>
                    <p className="text-lg font-bold">{courier.avgTipAmount?.toFixed(0) ?? '—'} сум</p>
                  </div>
                  <div className="rounded-lg bg-[hsl(var(--muted))] p-3">
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Процент чаевых</p>
                    <p className="text-lg font-bold">{courier.tipRate ? `${(courier.tipRate * 100).toFixed(0)}%` : '—'}</p>
                  </div>
                </div>

                {courier.distribution && courier.distribution.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Распределение оценок</p>
                    {courier.distribution.map((d) => (
                      <div key={d.rating} className="flex items-center gap-2">
                        <span className="w-8 text-sm">{d.rating}</span>
                        <Star className="h-3 w-3 text-[hsl(var(--warning))]" />
                        <div className="flex-1 h-2 rounded-full bg-[hsl(var(--muted))]">
                          <div
                            className="h-2 rounded-full bg-[hsl(var(--success))]"
                            style={{ width: `${d.percentage}%` }}
                          />
                        </div>
                        <span className="w-12 text-right text-xs text-[hsl(var(--muted-foreground))]">
                          {d.count}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {courier.calculatedAt && (
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    Обновлено: {formatDateTime(courier.calculatedAt)}
                  </p>
                )}
              </div>
            ) : courierId > 0 ? (
              <p className="text-center text-[hsl(var(--muted-foreground))] py-4">Нет данных</p>
            ) : (
              <p className="text-center text-[hsl(var(--muted-foreground))] py-4">
                Введите ID курьера для поиска
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
