import { useState } from 'react'
import {
  DollarSign,
  CreditCard,
  RefreshCw,
  Store,
  Bike,
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
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui'
import { SimpleBarChart, SimpleLineChart } from '@/components/charts'
import { formatCurrency } from '@/lib/utils'

// Mock data
const mockFinancialData = {
  grossRevenue: 15750000,
  netRevenue: 12600000,
  refunds: 472500,
  payouts: {
    restaurants: 10650000,
    couriers: 1890000,
  },
  pendingPayouts: 856000,
  transactionFees: 157500,
  monthlyFinancials: [
    { month: 'Авг', revenue: 12500000, costs: 9875000, profit: 2625000 },
    { month: 'Сен', revenue: 13200000, costs: 10428000, profit: 2772000 },
    { month: 'Окт', revenue: 14100000, costs: 11139000, profit: 2961000 },
    { month: 'Ноя', revenue: 14800000, costs: 11692000, profit: 3108000 },
    { month: 'Дек', revenue: 15200000, costs: 12008000, profit: 3192000 },
    { month: 'Янв', revenue: 15750000, costs: 12442500, profit: 3307500 },
  ],
  recentPayouts: [
    { id: 1, recipient: 'Пицца Хат', type: 'restaurant', amount: 245000, date: '15.01.2024', status: 'completed' },
    { id: 2, recipient: 'Суши Мастер', type: 'restaurant', amount: 189000, date: '15.01.2024', status: 'completed' },
    { id: 3, recipient: 'Бургер Кинг', type: 'restaurant', amount: 165000, date: '15.01.2024', status: 'pending' },
    { id: 4, recipient: 'Игорь Козлов', type: 'courier', amount: 45000, date: '14.01.2024', status: 'completed' },
    { id: 5, recipient: 'Дмитрий Павлов', type: 'courier', amount: 38000, date: '14.01.2024', status: 'completed' },
  ],
}

export function FinancialAnalyticsPage() {
  const [period, setPeriod] = useState('month')
  const data = mockFinancialData

  const profitMargin = ((data.netRevenue - data.payouts.restaurants - data.payouts.couriers) / data.grossRevenue * 100).toFixed(1)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Финансовая аналитика</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Финансовые потоки и выплаты
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
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Валовый доход</p>
                <p className="text-2xl font-bold">{formatCurrency(data.grossRevenue)}</p>
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
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Чистый доход</p>
                <p className="text-2xl font-bold">{formatCurrency(data.netRevenue)}</p>
                <p className="mt-1 text-sm text-[hsl(var(--success))]">
                  Маржа: {profitMargin}%
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--success))]/10">
                <TrendingUp className="h-6 w-6 text-[hsl(var(--success))]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Возвраты</p>
                <p className="text-2xl font-bold">{formatCurrency(data.refunds)}</p>
                <p className="mt-1 text-sm text-[hsl(var(--destructive))]">
                  {(data.refunds / data.grossRevenue * 100).toFixed(1)}% от оборота
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--destructive))]/10">
                <RefreshCw className="h-6 w-6 text-[hsl(var(--destructive))]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Ожидает выплаты</p>
                <p className="text-2xl font-bold">{formatCurrency(data.pendingPayouts)}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--warning))]/10">
                <Clock className="h-6 w-6 text-[hsl(var(--warning))]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payouts Summary */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10">
                <Store className="h-7 w-7 text-[hsl(var(--primary))]" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Выплаты ресторанам</p>
                <p className="text-2xl font-bold">{formatCurrency(data.payouts.restaurants)}</p>
                <div className="mt-2 h-2 w-full rounded-full bg-[hsl(var(--muted))]">
                  <div
                    className="h-full rounded-full bg-[hsl(var(--primary))]"
                    style={{ width: `${(data.payouts.restaurants / data.grossRevenue) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[hsl(var(--success))]/10">
                <Bike className="h-7 w-7 text-[hsl(var(--success))]" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Выплаты курьерам</p>
                <p className="text-2xl font-bold">{formatCurrency(data.payouts.couriers)}</p>
                <div className="mt-2 h-2 w-full rounded-full bg-[hsl(var(--muted))]">
                  <div
                    className="h-full rounded-full bg-[hsl(var(--success))]"
                    style={{ width: `${(data.payouts.couriers / data.grossRevenue) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue vs Costs */}
        <Card>
          <CardHeader>
            <CardTitle>Доходы и расходы</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleLineChart
              data={data.monthlyFinancials.map((d) => ({
                label: d.month,
                value: d.revenue,
              }))}
              height={250}
              color="hsl(var(--success))"
            />
            <div className="mt-4 flex justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-[hsl(var(--success))]" />
                <span>Доход</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profit Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Динамика прибыли</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart
              data={data.monthlyFinancials.map((d) => ({
                label: d.month,
                value: d.profit,
                color: 'hsl(var(--primary))',
              }))}
              height={250}
              valueFormatter={(v) => formatCurrency(v)}
            />
          </CardContent>
        </Card>
      </div>

      {/* Recent Payouts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Последние выплаты
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Получатель</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead>Сумма</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead>Статус</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recentPayouts.map((payout) => (
                <TableRow key={payout.id}>
                  <TableCell className="font-medium">{payout.recipient}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {payout.type === 'restaurant' ? (
                        <><Store className="mr-1 h-3 w-3" /> Ресторан</>
                      ) : (
                        <><Bike className="mr-1 h-3 w-3" /> Курьер</>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{formatCurrency(payout.amount)}</TableCell>
                  <TableCell>{payout.date}</TableCell>
                  <TableCell>
                    <Badge variant={payout.status === 'completed' ? 'success' : 'warning'}>
                      {payout.status === 'completed' ? 'Выполнено' : 'Ожидает'}
                    </Badge>
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
