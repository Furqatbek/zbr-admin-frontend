import { useState } from 'react'
import {
  Store,
  Star,
  Timer,
  Activity,
  Calendar,
  CheckCircle,
  XCircle,
  RefreshCw,
  Loader2,
  TrendingUp,
  MapPin,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  Badge,
  Button,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui'
import { SimpleBarChart } from '@/components/charts'
import { formatNumber, formatDateTime } from '@/lib/utils'
import { useRestaurantMetrics, useRestaurantMetricsFiltered } from '@/hooks/useDashboard'

const statusLabels: Record<string, string> = {
  ONLINE: 'Онлайн',
  OFFLINE: 'Оффлайн',
  BUSY: 'Занят',
  CLOSED: 'Закрыт',
  TEMPORARILY_CLOSED: 'Временно закрыт',
}

const statusColors: Record<string, string> = {
  ONLINE: 'hsl(var(--success))',
  OFFLINE: 'hsl(var(--destructive))',
  BUSY: 'hsl(var(--warning))',
  CLOSED: 'hsl(var(--muted-foreground))',
  TEMPORARILY_CLOSED: 'hsl(var(--muted-foreground))',
}

export function RestaurantMetricsPage() {
  const [period, setPeriod] = useState('month')

  const getDateRange = () => {
    const endDate = new Date()
    const startDate = new Date()
    switch (period) {
      case 'day':
        startDate.setDate(endDate.getDate() - 1)
        break
      case 'week':
        startDate.setDate(endDate.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1)
        break
    }
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    }
  }

  const dateRange = getDateRange()
  const { data: metricsData, isLoading, refetch } = useRestaurantMetricsFiltered(dateRange)
  const { data: generalData } = useRestaurantMetrics()

  const data = metricsData || generalData

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--muted-foreground))]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Метрики ресторанов</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Показатели эффективности ресторанов
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="day">День</option>
            <option value="week">Неделя</option>
            <option value="month">Месяц</option>
          </Select>
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Всего ресторанов</p>
                <p className="text-2xl font-bold">{data?.totalRestaurants ?? 0}</p>
                <p className="mt-1 text-sm text-[hsl(var(--success))]">
                  {(data?.onlinePercentage ?? 0).toFixed(1)}% онлайн
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10">
                <Store className="h-6 w-6 text-[hsl(var(--primary))]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Ср. приготовление</p>
                <p className="text-2xl font-bold">
                  {data?.performanceSummary?.avgPreparationTimeMinutes?.toFixed(1) ?? '—'} мин
                </p>
                <p className="mt-1 text-sm text-[hsl(var(--success))]">Цель: 20 мин</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--warning))]/10">
                <Timer className="h-6 w-6 text-[hsl(var(--warning))]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Ср. рейтинг</p>
                <p className="text-2xl font-bold">
                  {data?.performanceSummary?.avgRating?.toFixed(1) ?? '—'}
                </p>
                <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">из 5.0</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--warning))]/10">
                <Star className="h-6 w-6 text-[hsl(var(--warning))]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Процент принятия</p>
                <p className="text-2xl font-bold">
                  {data?.performanceSummary?.avgAcceptanceRate?.toFixed(1) ?? '—'}%
                </p>
                <p className="mt-1 text-sm text-[hsl(var(--destructive))]">
                  Отклонений: {data?.performanceSummary?.rejectionRate?.toFixed(1) ?? 0}%
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--success))]/10">
                <CheckCircle className="h-6 w-6 text-[hsl(var(--success))]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      {data?.performanceSummary && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Всего заказов обработано</p>
              <p className="text-2xl font-bold">{formatNumber(data.performanceSummary.totalOrdersProcessed)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Ср. время принятия заказа</p>
              <p className="text-2xl font-bold">{data.performanceSummary.avgAcceptanceLatencySeconds?.toFixed(0) ?? '—'} сек</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Процент отклонений</p>
              <p className="text-2xl font-bold text-[hsl(var(--destructive))]">{data.performanceSummary.rejectionRate?.toFixed(1) ?? '—'}%</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Restaurant Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Статус ресторанов
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-[hsl(var(--success))]/10 p-6 text-center">
              <p className="text-4xl font-bold text-[hsl(var(--success))]">
                {data?.onlineRestaurants ?? 0}
              </p>
              <p className="mt-2 text-[hsl(var(--muted-foreground))]">Онлайн</p>
            </div>
            <div className="rounded-lg bg-[hsl(var(--destructive))]/10 p-6 text-center">
              <p className="text-4xl font-bold text-[hsl(var(--destructive))]">
                {data?.offlineRestaurants ?? 0}
              </p>
              <p className="mt-2 text-[hsl(var(--muted-foreground))]">Оффлайн</p>
            </div>
            <div className="rounded-lg bg-[hsl(var(--warning))]/10 p-6 text-center">
              <p className="text-4xl font-bold text-[hsl(var(--warning))]">
                {data?.busyRestaurants ?? 0}
              </p>
              <p className="mt-2 text-[hsl(var(--muted-foreground))]">Заняты</p>
            </div>
            <div className="rounded-lg border border-[hsl(var(--border))] p-6 text-center">
              <p className="text-4xl font-bold">
                {data?.totalRestaurants ?? 0}
              </p>
              <p className="mt-2 text-[hsl(var(--muted-foreground))]">Всего</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Status Breakdown */}
        {data?.statusBreakdown && Object.keys(data.statusBreakdown).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Распределение по статусам
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleBarChart
                data={Object.entries(data.statusBreakdown).map(([status, count]) => ({
                  label: statusLabels[status] || status,
                  value: count,
                  color: statusColors[status] || 'hsl(var(--primary))',
                }))}
                height={250}
                valueFormatter={(v) => formatNumber(v)}
              />
            </CardContent>
          </Card>
        )}

        {/* Cuisine Distribution */}
        {data?.cuisineDistribution && Object.keys(data.cuisineDistribution).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Распределение по кухне
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleBarChart
                data={Object.entries(data.cuisineDistribution)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 10)
                  .map(([cuisine, count]) => ({
                    label: cuisine,
                    value: count,
                  }))}
                height={250}
                valueFormatter={(v) => formatNumber(v)}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Geographic Distribution */}
      {data?.geographicDistribution && Object.keys(data.geographicDistribution).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Распределение по городам
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart
              data={Object.entries(data.geographicDistribution)
                .sort(([, a], [, b]) => b - a)
                .map(([city, count]) => ({
                  label: city,
                  value: count,
                }))}
              height={250}
              valueFormatter={(v) => formatNumber(v)}
            />
          </CardContent>
        </Card>
      )}

      {/* All Restaurants Table */}
      {data?.restaurants && data.restaurants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Все рестораны
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ресторан</TableHead>
                  <TableHead>Город</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Заказов сегодня</TableHead>
                  <TableHead>Ср. приготовление</TableHead>
                  <TableHead>Принятие</TableHead>
                  <TableHead>Рейтинг</TableHead>
                  <TableHead>Балл</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.restaurants
                  .sort((a, b) => b.performanceScore - a.performanceScore)
                  .map((restaurant) => (
                    <TableRow key={restaurant.restaurantId}>
                      <TableCell className="font-medium">{restaurant.name}</TableCell>
                      <TableCell>{restaurant.city || '—'}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          style={{
                            borderColor: statusColors[restaurant.status],
                            color: statusColors[restaurant.status],
                          }}
                        >
                          {statusLabels[restaurant.status] || restaurant.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{restaurant.totalOrdersToday}</TableCell>
                      <TableCell>{restaurant.avgPreparationTimeMinutes?.toFixed(0)} мин</TableCell>
                      <TableCell>{restaurant.acceptanceRate?.toFixed(0)}%</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-[hsl(var(--warning))]" />
                          {restaurant.rating?.toFixed(1)}
                          {restaurant.totalRatings > 0 && (
                            <span className="text-xs text-[hsl(var(--muted-foreground))]">
                              ({restaurant.totalRatings})
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={restaurant.performanceScore >= 80 ? 'success' : restaurant.performanceScore >= 60 ? 'warning' : 'destructive'}>
                          {restaurant.performanceScore?.toFixed(0)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Underperformers */}
      {data?.underperformers && data.underperformers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[hsl(var(--destructive))]">
              <XCircle className="h-5 w-5" />
              Рестораны требующие внимания
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ресторан</TableHead>
                  <TableHead>Город</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Заказов сегодня</TableHead>
                  <TableHead>Ср. приготовление</TableHead>
                  <TableHead>Рейтинг</TableHead>
                  <TableHead>Балл</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.underperformers.map((restaurant) => (
                  <TableRow key={restaurant.restaurantId}>
                    <TableCell className="font-medium">{restaurant.name}</TableCell>
                    <TableCell>{restaurant.city || '—'}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        style={{
                          borderColor: statusColors[restaurant.status],
                          color: statusColors[restaurant.status],
                        }}
                      >
                        {statusLabels[restaurant.status] || restaurant.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{restaurant.totalOrdersToday}</TableCell>
                    <TableCell>{restaurant.avgPreparationTimeMinutes?.toFixed(0)} мин</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-[hsl(var(--warning))]" />
                        {restaurant.rating?.toFixed(1)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive">
                        {restaurant.performanceScore?.toFixed(0)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Generated timestamp */}
      {data?.generatedAt && (
        <p className="text-xs text-[hsl(var(--muted-foreground))] text-center">
          Данные обновлены: {formatDateTime(data.generatedAt)}
        </p>
      )}
    </div>
  )
}
