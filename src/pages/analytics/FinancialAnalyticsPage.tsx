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
  Loader2,
  AlertCircle,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  Badge,
  Button,
} from '@/components/ui'
import { SimpleBarChart, SimpleLineChart } from '@/components/charts'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { useFinanceMetrics, useFinanceMetricsFiltered } from '@/hooks/useDashboard'

export function FinancialAnalyticsPage() {
  const [period, setPeriod] = useState('month')

  // Calculate date range based on period
  const getDateRange = () => {
    const endDate = new Date()
    const startDate = new Date()
    switch (period) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1)
        break
      case 'quarter':
        startDate.setMonth(endDate.getMonth() - 3)
        break
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1)
        break
    }
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    }
  }

  const dateRange = getDateRange()

  // Use filtered API when period is selected
  const { data: filteredData, isLoading: filteredLoading, error: filteredError, refetch } = useFinanceMetricsFiltered(dateRange)

  // Fallback to general API
  const { data: generalData, isLoading: generalLoading } = useFinanceMetrics()

  const isLoading = filteredLoading || generalLoading
  const data = filteredData?.data || generalData?.data
  const error = filteredError

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--muted-foreground))]" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <AlertCircle className="h-12 w-12 text-[hsl(var(--destructive))]" />
        <p className="text-[hsl(var(--muted-foreground))]">Не удалось загрузить данные</p>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Повторить
        </Button>
      </div>
    )
  }

  const profitMargin = data.gmv > 0
    ? (((data.netRevenue) / data.gmv) * 100).toFixed(1)
    : '0'

  const refundRate = data.gmv > 0
    ? ((data.refundsPaid / data.gmv) * 100).toFixed(1)
    : '0'

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
                <p className="text-sm text-[hsl(var(--muted-foreground))]">GMV (Оборот)</p>
                <p className="text-2xl font-bold">{formatCurrency(data.gmv)}</p>
                <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                  {data.totalOrders} заказов
                </p>
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
                <p className="text-2xl font-bold">{formatCurrency(data.refundsPaid)}</p>
                <p className="mt-1 text-sm text-[hsl(var(--destructive))]">
                  {refundRate}% от оборота
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
                <p className="text-2xl font-bold">
                  {formatCurrency(data.unsettledRestaurantPayouts + data.unsettledCourierPayouts)}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--warning))]/10">
                <Clock className="h-6 w-6 text-[hsl(var(--warning))]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Комиссия</p>
            <p className="text-2xl font-bold">{formatCurrency(data.commissionRevenue)}</p>
            <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
              Ставка: {(data.commissionRate * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Доход от доставки</p>
            <p className="text-2xl font-bold">{formatCurrency(data.deliveryFeeRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Средний чек</p>
            <p className="text-2xl font-bold">{formatCurrency(data.avgOrderValue)}</p>
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
                <p className="text-2xl font-bold">{formatCurrency(data.restaurantPayouts)}</p>
                {data.payoutSummary && (
                  <p className="mt-1 text-xs text-[hsl(var(--warning))]">
                    Ожидает: {formatCurrency(data.payoutSummary.pendingRestaurantPayouts)}
                  </p>
                )}
                <div className="mt-2 h-2 w-full rounded-full bg-[hsl(var(--muted))]">
                  <div
                    className="h-full rounded-full bg-[hsl(var(--primary))]"
                    style={{ width: data.gmv > 0 ? `${(data.restaurantPayouts / data.gmv) * 100}%` : '0%' }}
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
                <p className="text-2xl font-bold">{formatCurrency(data.courierPayouts)}</p>
                {data.payoutSummary && (
                  <p className="mt-1 text-xs text-[hsl(var(--warning))]">
                    Ожидает: {formatCurrency(data.payoutSummary.pendingCourierPayouts)}
                  </p>
                )}
                <div className="mt-2 h-2 w-full rounded-full bg-[hsl(var(--muted))]">
                  <div
                    className="h-full rounded-full bg-[hsl(var(--success))]"
                    style={{ width: data.gmv > 0 ? `${(data.courierPayouts / data.gmv) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Daily Revenue Chart */}
        {data.dailyRevenue && data.dailyRevenue.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Динамика выручки</CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleLineChart
                data={data.dailyRevenue.map((d) => ({
                  label: new Date(d.date).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' }),
                  value: d.gmv,
                }))}
                height={250}
                color="hsl(var(--success))"
              />
              <div className="mt-4 flex justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-[hsl(var(--success))]" />
                  <span>GMV</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Commission Revenue Chart */}
        {data.dailyRevenue && data.dailyRevenue.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Комиссионные доходы</CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleBarChart
                data={data.dailyRevenue.map((d) => ({
                  label: new Date(d.date).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' }),
                  value: d.commissionRevenue + d.deliveryFeeRevenue,
                  color: 'hsl(var(--primary))',
                }))}
                height={250}
                valueFormatter={(v) => formatCurrency(v)}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Discount Summary */}
      {data.discountSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Скидки и промокоды
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Всего скидок</p>
                <p className="text-xl font-bold">{formatCurrency(data.discountSummary.totalDiscounts)}</p>
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Заказов со скидкой</p>
                <p className="text-xl font-bold">{data.discountSummary.ordersWithDiscount}</p>
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Частота использования</p>
                <p className="text-xl font-bold">{(data.discountSummary.discountUsageRate * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Средняя скидка</p>
                <p className="text-xl font-bold">{formatCurrency(data.discountSummary.avgDiscountPerOrder)}</p>
              </div>
            </div>
            {/* Discount by type breakdown */}
            {data.discountSummary.discountByType && Object.keys(data.discountSummary.discountByType).length > 0 && (
              <div className="mt-4 pt-4 border-t border-[hsl(var(--border))]">
                <p className="text-sm font-medium mb-2">По типам:</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(data.discountSummary.discountByType).map(([type, amount]) => (
                    <Badge key={type} variant="outline">
                      {type}: {formatCurrency(amount as number)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Refund Summary */}
      {data.refundSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Возвраты
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Сумма возвратов</p>
                <p className="text-xl font-bold">{formatCurrency(data.refundSummary.totalRefundAmount)}</p>
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Всего возвратов</p>
                <p className="text-xl font-bold">{data.refundSummary.refundCount}</p>
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Одобрено</p>
                <p className="text-xl font-bold text-[hsl(var(--success))]">{data.refundSummary.approvedRefunds}</p>
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">На рассмотрении</p>
                <p className="text-xl font-bold text-[hsl(var(--warning))]">{data.refundSummary.pendingRefunds}</p>
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Процент одобрения</p>
                <p className="text-xl font-bold">{(data.refundSummary.approvalRate * 100).toFixed(1)}%</p>
              </div>
            </div>
            {/* Refund by reason breakdown */}
            {data.refundSummary.refundByReason && Object.keys(data.refundSummary.refundByReason).length > 0 && (
              <div className="mt-4 pt-4 border-t border-[hsl(var(--border))]">
                <p className="text-sm font-medium mb-2">По причинам:</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(data.refundSummary.refundByReason).map(([reason, count]) => (
                    <Badge key={reason} variant="outline">
                      {reason}: {count as number}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payment Method Breakdown */}
      {data.paymentMethodBreakdown && Object.keys(data.paymentMethodBreakdown).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Способы оплаты</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              {Object.entries(data.paymentMethodBreakdown).map(([method, amount]) => (
                <div key={method} className="flex items-center justify-between p-4 rounded-lg border border-[hsl(var(--border))]">
                  <span className="text-sm font-medium">{method}</span>
                  <span className="font-bold">{formatCurrency(amount as number)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated timestamp */}
      {data.generatedAt && (
        <p className="text-xs text-[hsl(var(--muted-foreground))] text-center">
          Данные обновлены: {formatDateTime(data.generatedAt)}
        </p>
      )}
    </div>
  )
}
