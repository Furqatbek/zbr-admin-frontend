import { useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Truck,
  Store,
  Calendar,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui'
import { SimpleBarChart, SimpleLineChart } from '@/components/charts'
import { formatNumber, formatCurrency } from '@/lib/utils'

// Mock data
const mockRevenueData = {
  totalRevenue: 15750000,
  platformFees: 1575000,
  deliveryFees: 2362500,
  restaurantRevenue: 11812500,
  periodComparison: {
    current: 15750000,
    previous: 14200000,
    changePercent: 10.9,
  },
  dailyRevenue: [
    { date: '01.01', revenue: 520000, orders: 156 },
    { date: '02.01', revenue: 480000, orders: 142 },
    { date: '03.01', revenue: 560000, orders: 168 },
    { date: '04.01', revenue: 610000, orders: 183 },
    { date: '05.01', revenue: 590000, orders: 177 },
    { date: '06.01', revenue: 720000, orders: 216 },
    { date: '07.01', revenue: 680000, orders: 204 },
    { date: '08.01', revenue: 540000, orders: 162 },
    { date: '09.01', revenue: 510000, orders: 153 },
    { date: '10.01', revenue: 580000, orders: 174 },
    { date: '11.01', revenue: 620000, orders: 186 },
    { date: '12.01', revenue: 590000, orders: 177 },
    { date: '13.01', revenue: 710000, orders: 213 },
    { date: '14.01', revenue: 740000, orders: 222 },
  ],
  topRestaurants: [
    { id: 1, name: 'Пицца Хат', revenue: 2150000, orders: 645 },
    { id: 2, name: 'Суши Мастер', revenue: 1890000, orders: 567 },
    { id: 3, name: 'Бургер Кинг', revenue: 1650000, orders: 495 },
    { id: 4, name: 'KFC', revenue: 1420000, orders: 426 },
    { id: 5, name: 'Додо Пицца', revenue: 1280000, orders: 384 },
  ],
}

export function RevenueAnalyticsPage() {
  const [period, setPeriod] = useState('month')
  const data = mockRevenueData
  const isPositiveChange = data.periodComparison.changePercent >= 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Аналитика доходов</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Финансовые показатели платформы
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
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Общий доход</p>
                <p className="text-2xl font-bold">{formatCurrency(data.totalRevenue)}</p>
                <div className="mt-1 flex items-center gap-1">
                  {isPositiveChange ? (
                    <TrendingUp className="h-4 w-4 text-[hsl(var(--success))]" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-[hsl(var(--destructive))]" />
                  )}
                  <span
                    className={`text-sm ${
                      isPositiveChange ? 'text-[hsl(var(--success))]' : 'text-[hsl(var(--destructive))]'
                    }`}
                  >
                    {isPositiveChange ? '+' : ''}{data.periodComparison.changePercent}%
                  </span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10">
                <DollarSign className="h-6 w-6 text-[hsl(var(--primary))]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Комиссия платформы</p>
                <p className="text-2xl font-bold">{formatCurrency(data.platformFees)}</p>
                <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                  10% от оборота
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--success))]/10">
                <CreditCard className="h-6 w-6 text-[hsl(var(--success))]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Доставка</p>
                <p className="text-2xl font-bold">{formatCurrency(data.deliveryFees)}</p>
                <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                  Сборы за доставку
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--warning))]/10">
                <Truck className="h-6 w-6 text-[hsl(var(--warning))]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Доход ресторанов</p>
                <p className="text-2xl font-bold">{formatCurrency(data.restaurantRevenue)}</p>
                <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                  После комиссии
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--secondary))]/50">
                <Store className="h-6 w-6 text-[hsl(var(--secondary-foreground))]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Динамика доходов</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleLineChart
              data={data.dailyRevenue.map((d) => ({
                label: d.date,
                value: d.revenue,
              }))}
              height={250}
              color="hsl(var(--primary))"
            />
          </CardContent>
        </Card>

        {/* Orders Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Количество заказов</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart
              data={data.dailyRevenue.map((d) => ({
                label: d.date,
                value: d.orders,
              }))}
              height={250}
              valueFormatter={(v) => formatNumber(v)}
            />
          </CardContent>
        </Card>
      </div>

      {/* Top Restaurants */}
      <Card>
        <CardHeader>
          <CardTitle>Топ ресторанов по доходу</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Ресторан</TableHead>
                <TableHead>Заказов</TableHead>
                <TableHead>Доход</TableHead>
                <TableHead>Ср. чек</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.topRestaurants.map((restaurant, index) => (
                <TableRow key={restaurant.id}>
                  <TableCell>
                    <Badge variant={index < 3 ? 'default' : 'secondary'}>
                      {index + 1}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{restaurant.name}</TableCell>
                  <TableCell>{formatNumber(restaurant.orders)}</TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(restaurant.revenue)}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(Math.round(restaurant.revenue / restaurant.orders))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
