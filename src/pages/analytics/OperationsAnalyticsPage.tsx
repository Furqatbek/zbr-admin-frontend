import { useState } from 'react'
import {
  Bike,
  Activity,
  Calendar,
  CheckCircle,
  Users,
  RefreshCw,
  Loader2,
  MapPin,
  Star,
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
import { useCourierMetrics, useCourierMetricsFiltered } from '@/hooks/useDashboard'

const statusLabels: Record<string, string> = {
  AVAILABLE: 'Свободен',
  ON_DELIVERY: 'На доставке',
  RETURNING: 'Возвращается',
  ON_BREAK: 'На перерыве',
  OFFLINE: 'Оффлайн',
}

const statusColors: Record<string, string> = {
  AVAILABLE: 'hsl(var(--success))',
  ON_DELIVERY: 'hsl(var(--primary))',
  RETURNING: 'hsl(var(--warning))',
  ON_BREAK: 'hsl(var(--muted-foreground))',
  OFFLINE: 'hsl(var(--destructive))',
}

const vehicleLabels: Record<string, string> = {
  MOTORCYCLE: 'Мотоцикл',
  BICYCLE: 'Велосипед',
  CAR: 'Автомобиль',
  SCOOTER: 'Скутер',
  FOOT: 'Пешком',
}

export function OperationsAnalyticsPage() {
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
  const { data: metricsData, isLoading, refetch } = useCourierMetricsFiltered(dateRange)
  const { data: generalData } = useCourierMetrics()

  const data = metricsData?.data || generalData?.data

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
          <h1 className="text-2xl font-bold">Операционная аналитика</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Показатели эффективности курьерской службы
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
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Ср. время доставки</p>
                <p className="text-2xl font-bold">
                  {data?.performanceSummary?.avgDeliveryTimeMinutes?.toFixed(1) ?? '—'} мин
                </p>
                <p className="mt-1 text-sm text-[hsl(var(--success))]">Цель: 35 мин</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10">
                <Bike className="h-6 w-6 text-[hsl(var(--primary))]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Средний рейтинг</p>
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
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Доставка вовремя</p>
                <p className="text-2xl font-bold">
                  {data?.performanceSummary?.onTimeDeliveryRate?.toFixed(1) ?? '—'}%
                </p>
                <p className="mt-1 text-sm text-[hsl(var(--success))]">Цель: 90%</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--success))]/10">
                <CheckCircle className="h-6 w-6 text-[hsl(var(--success))]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Загрузка курьеров</p>
                <p className="text-2xl font-bold">{data?.utilizationRate?.toFixed(1) ?? '—'}%</p>
                <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                  {data?.onDeliveryCouriers ?? 0}/{data?.activeCouriers ?? 0} занято
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--secondary))]/50">
                <Users className="h-6 w-6 text-[hsl(var(--secondary-foreground))]" />
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
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Всего доставок сегодня</p>
              <p className="text-2xl font-bold">{formatNumber(data.performanceSummary.totalDeliveriesToday)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Ср. доставок на курьера</p>
              <p className="text-2xl font-bold">{data.performanceSummary.avgDeliveriesPerCourier?.toFixed(1) ?? '—'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Ср. расстояние доставки</p>
              <p className="text-2xl font-bold">{data.performanceSummary.avgDistancePerDeliveryKm?.toFixed(1) ?? '—'} км</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Status Breakdown */}
        {data?.statusBreakdown && Object.keys(data.statusBreakdown).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Статусы курьеров
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

        {/* Vehicle Distribution */}
        {data?.vehicleDistribution && Object.keys(data.vehicleDistribution).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bike className="h-5 w-5" />
                Распределение по транспорту
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleBarChart
                data={Object.entries(data.vehicleDistribution).map(([vehicle, count]) => ({
                  label: vehicleLabels[vehicle] || vehicle,
                  value: count,
                }))}
                height={250}
                valueFormatter={(v) => formatNumber(v)}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Courier Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bike className="h-5 w-5" />
            Статус курьеров
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="rounded-lg bg-[hsl(var(--success))]/10 p-6 text-center">
              <p className="text-4xl font-bold text-[hsl(var(--success))]">
                {data?.activeCouriers ?? 0}
              </p>
              <p className="mt-2 text-[hsl(var(--muted-foreground))]">Активных</p>
            </div>
            <div className="rounded-lg bg-[hsl(var(--primary))]/10 p-6 text-center">
              <p className="text-4xl font-bold text-[hsl(var(--primary))]">
                {data?.onDeliveryCouriers ?? 0}
              </p>
              <p className="mt-2 text-[hsl(var(--muted-foreground))]">На доставке</p>
            </div>
            <div className="rounded-lg bg-[hsl(var(--success))]/10 p-6 text-center">
              <p className="text-4xl font-bold text-[hsl(var(--success))]">
                {data?.availableCouriers ?? 0}
              </p>
              <p className="mt-2 text-[hsl(var(--muted-foreground))]">Свободны</p>
            </div>
            <div className="rounded-lg bg-[hsl(var(--muted))] p-6 text-center">
              <p className="text-4xl font-bold">
                {data?.offlineCouriers ?? 0}
              </p>
              <p className="mt-2 text-[hsl(var(--muted-foreground))]">Оффлайн</p>
            </div>
            <div className="rounded-lg border border-[hsl(var(--border))] p-6 text-center">
              <p className="text-4xl font-bold">
                {data?.totalCouriers ?? 0}
              </p>
              <p className="mt-2 text-[hsl(var(--muted-foreground))]">Всего</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Couriers */}
      {data?.couriers && data.couriers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Топ курьеров
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Курьер</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Транспорт</TableHead>
                  <TableHead>Доставок сегодня</TableHead>
                  <TableHead>Ср. время</TableHead>
                  <TableHead>Вовремя</TableHead>
                  <TableHead>Рейтинг</TableHead>
                  <TableHead>Балл</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.couriers
                  .sort((a, b) => b.performanceScore - a.performanceScore)
                  .slice(0, 10)
                  .map((courier) => (
                    <TableRow key={courier.courierId}>
                      <TableCell className="font-medium">{courier.name}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          style={{
                            borderColor: statusColors[courier.status],
                            color: statusColors[courier.status],
                          }}
                        >
                          {statusLabels[courier.status] || courier.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{vehicleLabels[courier.vehicleType] || courier.vehicleType}</TableCell>
                      <TableCell>{courier.deliveriesToday}</TableCell>
                      <TableCell>{courier.avgDeliveryTimeMinutes?.toFixed(0)} мин</TableCell>
                      <TableCell>{courier.onTimeDeliveryRate?.toFixed(0)}%</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-[hsl(var(--warning))]" />
                          {courier.rating?.toFixed(1)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={courier.performanceScore >= 80 ? 'success' : courier.performanceScore >= 60 ? 'warning' : 'destructive'}>
                          {courier.performanceScore?.toFixed(0)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Active Courier Locations */}
      {data?.courierLocations && data.courierLocations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Активные курьеры на карте
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
              {data.courierLocations.slice(0, 8).map((loc) => (
                <div key={loc.courierId} className="rounded-lg border border-[hsl(var(--border))] p-3">
                  <p className="font-medium">{loc.courierName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant="outline"
                      style={{
                        borderColor: statusColors[loc.status],
                        color: statusColors[loc.status],
                      }}
                    >
                      {statusLabels[loc.status] || loc.status}
                    </Badge>
                  </div>
                  {loc.currentOrderId && (
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                      Заказ #{loc.currentOrderId}
                    </p>
                  )}
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                    Обновлено: {formatDateTime(loc.lastPingAt)}
                  </p>
                </div>
              ))}
            </div>
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
