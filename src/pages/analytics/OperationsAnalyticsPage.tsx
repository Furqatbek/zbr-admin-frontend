import { useState } from 'react'
import {
  Clock,
  Bike,
  Timer,
  Activity,
  Calendar,
  CheckCircle,
  Users,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  Badge,
} from '@/components/ui'
import { SimpleBarChart } from '@/components/charts'
import { formatNumber } from '@/lib/utils'

// Mock data
const mockOperationsData = {
  averageDeliveryTime: 32,
  averagePrepTime: 18,
  onTimeDeliveryRate: 94.5,
  courierUtilization: 78,
  activeCouriers: 45,
  busyCouriers: 35,
  peakHours: [
    { hour: 11, load: 65 },
    { hour: 12, load: 89 },
    { hour: 13, load: 95 },
    { hour: 14, load: 72 },
    { hour: 18, load: 88 },
    { hour: 19, load: 98 },
    { hour: 20, load: 92 },
    { hour: 21, load: 75 },
  ],
  deliveryTimeDistribution: [
    { range: '< 20 мин', count: 312 },
    { range: '20-30 мин', count: 856 },
    { range: '30-40 мин', count: 624 },
    { range: '40-50 мин', count: 289 },
    { range: '> 50 мин', count: 98 },
  ],
  prepTimeDistribution: [
    { range: '< 10 мин', count: 423 },
    { range: '10-15 мин', count: 712 },
    { range: '15-20 мин', count: 534 },
    { range: '20-30 мин', count: 398 },
    { range: '> 30 мин', count: 112 },
  ],
}

export function OperationsAnalyticsPage() {
  const [period, setPeriod] = useState('month')
  const data = mockOperationsData

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Операционная аналитика</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Показатели эффективности операций
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="day">День</option>
            <option value="week">Неделя</option>
            <option value="month">Месяц</option>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Ср. время доставки</p>
                <p className="text-2xl font-bold">{data.averageDeliveryTime} мин</p>
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
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Ср. приготовление</p>
                <p className="text-2xl font-bold">{data.averagePrepTime} мин</p>
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
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Доставка вовремя</p>
                <p className="text-2xl font-bold">{data.onTimeDeliveryRate}%</p>
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
                <p className="text-2xl font-bold">{data.courierUtilization}%</p>
                <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                  {data.busyCouriers}/{data.activeCouriers} занято
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--secondary))]/50">
                <Users className="h-6 w-6 text-[hsl(var(--secondary-foreground))]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Peak Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Загрузка в пиковые часы
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart
              data={data.peakHours.map((d) => ({
                label: `${d.hour}:00`,
                value: d.load,
                color: d.load > 90 ? 'hsl(var(--destructive))' : d.load > 75 ? 'hsl(var(--warning))' : 'hsl(var(--success))',
              }))}
              height={250}
              valueFormatter={(v) => `${v}%`}
            />
            <div className="mt-4 flex justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-[hsl(var(--success))]" />
                <span>Норма (&lt;75%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-[hsl(var(--warning))]" />
                <span>Высокая (75-90%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-[hsl(var(--destructive))]" />
                <span>Критическая (&gt;90%)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Time Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Распределение времени доставки
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart
              data={data.deliveryTimeDistribution.map((d) => ({
                label: d.range,
                value: d.count,
              }))}
              height={250}
              valueFormatter={(v) => formatNumber(v)}
            />
          </CardContent>
        </Card>
      </div>

      {/* Prep Time Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Распределение времени приготовления
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            {data.prepTimeDistribution.map((item, index) => (
              <div
                key={index}
                className="rounded-lg border border-[hsl(var(--border))] p-4 text-center"
              >
                <p className="text-2xl font-bold">{formatNumber(item.count)}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">{item.range}</p>
                <Badge variant="outline" className="mt-2">
                  {((item.count / data.prepTimeDistribution.reduce((a, b) => a + b.count, 0)) * 100).toFixed(1)}%
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Courier Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bike className="h-5 w-5" />
            Статус курьеров
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-[hsl(var(--success))]/10 p-6 text-center">
              <p className="text-4xl font-bold text-[hsl(var(--success))]">
                {data.activeCouriers}
              </p>
              <p className="mt-2 text-[hsl(var(--muted-foreground))]">Всего активных</p>
            </div>
            <div className="rounded-lg bg-[hsl(var(--primary))]/10 p-6 text-center">
              <p className="text-4xl font-bold text-[hsl(var(--primary))]">
                {data.busyCouriers}
              </p>
              <p className="mt-2 text-[hsl(var(--muted-foreground))]">На доставке</p>
            </div>
            <div className="rounded-lg bg-[hsl(var(--muted))] p-6 text-center">
              <p className="text-4xl font-bold">
                {data.activeCouriers - data.busyCouriers}
              </p>
              <p className="mt-2 text-[hsl(var(--muted-foreground))]">Свободны</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
