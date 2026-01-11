import { useState } from 'react'
import {
  Package,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  TrendingUp,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  Badge,
} from '@/components/ui'
import { SimpleBarChart, SimpleLineChart } from '@/components/charts'
import { formatNumber, formatCurrency } from '@/lib/utils'

// Mock data
const mockOrdersData = {
  totalOrders: 4250,
  completedOrders: 3978,
  cancelledOrders: 272,
  averageOrderValue: 3700,
  ordersByStatus: {
    PENDING: 45,
    CONFIRMED: 78,
    PREPARING: 156,
    READY: 89,
    DELIVERING: 234,
    DELIVERED: 3978,
    CANCELLED: 272,
  } as Record<string, number>,
  hourlyDistribution: [
    { hour: 8, orders: 45 },
    { hour: 9, orders: 78 },
    { hour: 10, orders: 120 },
    { hour: 11, orders: 189 },
    { hour: 12, orders: 356 },
    { hour: 13, orders: 412 },
    { hour: 14, orders: 289 },
    { hour: 15, orders: 198 },
    { hour: 16, orders: 167 },
    { hour: 17, orders: 234 },
    { hour: 18, orders: 445 },
    { hour: 19, orders: 523 },
    { hour: 20, orders: 489 },
    { hour: 21, orders: 378 },
    { hour: 22, orders: 245 },
    { hour: 23, orders: 82 },
  ],
  dailyOrders: [
    { date: '01.01', orders: 285, completed: 267, cancelled: 18 },
    { date: '02.01', orders: 256, completed: 240, cancelled: 16 },
    { date: '03.01', orders: 312, completed: 294, cancelled: 18 },
    { date: '04.01', orders: 345, completed: 321, cancelled: 24 },
    { date: '05.01', orders: 298, completed: 278, cancelled: 20 },
    { date: '06.01', orders: 412, completed: 389, cancelled: 23 },
    { date: '07.01', orders: 389, completed: 365, cancelled: 24 },
    { date: '08.01', orders: 276, completed: 258, cancelled: 18 },
    { date: '09.01', orders: 267, completed: 251, cancelled: 16 },
    { date: '10.01', orders: 298, completed: 280, cancelled: 18 },
    { date: '11.01', orders: 334, completed: 312, cancelled: 22 },
    { date: '12.01', orders: 312, completed: 291, cancelled: 21 },
    { date: '13.01', orders: 398, completed: 374, cancelled: 24 },
    { date: '14.01', orders: 368, completed: 345, cancelled: 23 },
  ],
}

const statusLabels: Record<string, string> = {
  PENDING: 'Ожидает',
  CONFIRMED: 'Подтверждён',
  PREPARING: 'Готовится',
  READY: 'Готов',
  DELIVERING: 'Доставляется',
  DELIVERED: 'Доставлен',
  CANCELLED: 'Отменён',
}

const statusColors: Record<string, string> = {
  PENDING: 'hsl(var(--warning))',
  CONFIRMED: 'hsl(var(--primary))',
  PREPARING: 'hsl(var(--primary))',
  READY: 'hsl(var(--success))',
  DELIVERING: 'hsl(var(--primary))',
  DELIVERED: 'hsl(var(--success))',
  CANCELLED: 'hsl(var(--destructive))',
}

export function OrdersAnalyticsPage() {
  const [period, setPeriod] = useState('month')
  const data = mockOrdersData
  const completionRate = ((data.completedOrders / data.totalOrders) * 100).toFixed(1)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Аналитика заказов</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Статистика и динамика заказов
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="week">Неделя</option>
            <option value="month">Месяц</option>
            <option value="quarter">Квартал</option>
            <option value="year">Год</option>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Всего заказов</p>
                <p className="text-2xl font-bold">{formatNumber(data.totalOrders)}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10">
                <Package className="h-6 w-6 text-[hsl(var(--primary))]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Выполнено</p>
                <p className="text-2xl font-bold">{formatNumber(data.completedOrders)}</p>
                <p className="mt-1 text-sm text-[hsl(var(--success))]">
                  {completionRate}% успешных
                </p>
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
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Отменено</p>
                <p className="text-2xl font-bold">{formatNumber(data.cancelledOrders)}</p>
                <p className="mt-1 text-sm text-[hsl(var(--destructive))]">
                  {((data.cancelledOrders / data.totalOrders) * 100).toFixed(1)}% отмен
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--destructive))]/10">
                <XCircle className="h-6 w-6 text-[hsl(var(--destructive))]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Средний чек</p>
                <p className="text-2xl font-bold">{formatCurrency(data.averageOrderValue)}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--warning))]/10">
                <TrendingUp className="h-6 w-6 text-[hsl(var(--warning))]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Orders Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Динамика заказов</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleLineChart
              data={data.dailyOrders.map((d) => ({
                label: d.date,
                value: d.orders,
              }))}
              height={250}
              color="hsl(var(--primary))"
            />
          </CardContent>
        </Card>

        {/* Hourly Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Распределение по часам</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart
              data={data.hourlyDistribution.map((d) => ({
                label: `${d.hour}:00`,
                value: d.orders,
              }))}
              height={250}
              valueFormatter={(v) => formatNumber(v)}
            />
          </CardContent>
        </Card>
      </div>

      {/* Orders by Status */}
      <Card>
        <CardHeader>
          <CardTitle>Заказы по статусам</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-7">
            {Object.entries(data.ordersByStatus).map(([status, count]) => (
              <div
                key={status}
                className="rounded-lg border border-[hsl(var(--border))] p-4 text-center"
              >
                <div
                  className="mx-auto mb-2 h-2 w-2 rounded-full"
                  style={{ backgroundColor: statusColors[status] }}
                />
                <p className="text-2xl font-bold">{formatNumber(count)}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {statusLabels[status]}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Orders Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Активные заказы
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERING'].map((status) => (
              <Badge key={status} variant="outline" className="px-4 py-2 text-sm">
                <span
                  className="mr-2 inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: statusColors[status] }}
                />
                {statusLabels[status]}: {formatNumber(data.ordersByStatus[status])}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
