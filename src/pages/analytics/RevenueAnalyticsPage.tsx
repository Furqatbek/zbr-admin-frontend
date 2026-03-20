import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Package,
  Calculator,
  RefreshCw,
  Loader2,
  Truck,
  Heart,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
} from '@/components/ui'
import { formatNumber, formatCurrency, formatDateTime } from '@/lib/utils'
import { useAOVMetrics, useRefreshAnalyticsCache } from '@/hooks/useAnalytics'

export function RevenueAnalyticsPage() {
  const { data: aovData, isLoading, refetch } = useAOVMetrics()
  const refreshCacheMutation = useRefreshAnalyticsCache()

  const aov = aovData?.data

  const handleRefresh = () => {
    refetch()
  }

  const handleForceRefresh = () => {
    refreshCacheMutation.mutate()
  }

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
          <h1 className="text-2xl font-bold">Аналитика доходов</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Средний чек и показатели выручки
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={handleForceRefresh}
            disabled={refreshCacheMutation.isPending}
          >
            {refreshCacheMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Обновить кэш
          </Button>
        </div>
      </div>

      {aov ? (
        <>
          {/* Revenue KPI Cards - Today / Week / Month */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Выручка сегодня</p>
                    <p className="text-2xl font-bold">{formatCurrency(aov.totalRevenueToday, aov.currency)}</p>
                    <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                      {formatNumber(aov.completedOrdersToday)} заказов
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
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Выручка за неделю</p>
                    <p className="text-2xl font-bold">{formatCurrency(aov.totalRevenueWeek, aov.currency)}</p>
                    <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                      {formatNumber(aov.completedOrdersWeek)} заказов
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
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Выручка за месяц</p>
                    <p className="text-2xl font-bold">{formatCurrency(aov.totalRevenueMonth, aov.currency)}</p>
                    <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                      {formatNumber(aov.completedOrdersMonth)} заказов
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--warning))]/10">
                    <ShoppingCart className="h-6 w-6 text-[hsl(var(--warning))]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AOV Cards - Today / Week / Month */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Средний чек сегодня</p>
                    <p className="text-2xl font-bold">{formatCurrency(aov.aovToday, aov.currency)}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10">
                    <Calculator className="h-6 w-6 text-[hsl(var(--primary))]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Средний чек за неделю</p>
                    <p className="text-2xl font-bold">{formatCurrency(aov.aovWeek, aov.currency)}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--success))]/10">
                    <Calculator className="h-6 w-6 text-[hsl(var(--success))]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Средний чек за месяц</p>
                    <p className="text-2xl font-bold">{formatCurrency(aov.aovMonth, aov.currency)}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--warning))]/10">
                    <Calculator className="h-6 w-6 text-[hsl(var(--warning))]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Order Value Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Анализ стоимости заказов (сегодня)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg bg-[hsl(var(--muted))] p-6">
                  <div className="text-center">
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Медианный чек</p>
                    <p className="text-5xl font-bold text-[hsl(var(--primary))]">
                      {formatCurrency(aov.medianOrderValueToday, aov.currency)}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-[hsl(var(--border))] p-4 text-center">
                    <p className="text-2xl font-bold">{formatCurrency(aov.minOrderValueToday, aov.currency)}</p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Минимальный заказ</p>
                  </div>
                  <div className="rounded-lg border border-[hsl(var(--border))] p-4 text-center">
                    <p className="text-2xl font-bold">{formatCurrency(aov.maxOrderValueToday, aov.currency)}</p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Максимальный заказ</p>
                  </div>
                </div>

                {aov.aovToday > aov.medianOrderValueToday && aov.medianOrderValueToday > 0 && (
                  <div className="rounded-lg bg-[hsl(var(--warning))]/10 p-4">
                    <p className="text-sm">
                      <strong>Примечание:</strong> Средний чек выше медианного на{' '}
                      {formatCurrency(aov.aovToday - aov.medianOrderValueToday, aov.currency)}.
                      Это указывает на наличие крупных заказов, которые повышают среднее значение.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Дополнительные показатели
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                      <span>Позиций в заказе (среднее)</span>
                    </div>
                    <span className="font-bold">{(aov.averageItemsPerOrder ?? 0).toFixed(1)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                      <span>Средняя стоимость доставки</span>
                    </div>
                    <span className="font-bold">{formatCurrency(aov.averageDeliveryFee, aov.currency)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                      <span>Средние чаевые</span>
                    </div>
                    <span className="font-bold">{formatCurrency(aov.averageTipAmount, aov.currency)}</span>
                  </div>
                </div>

                {/* Daily Trend */}
                {aov.dailyTrend && aov.dailyTrend.length > 0 && (
                  <div>
                    <p className="mb-3 text-sm font-medium">Динамика по дням</p>
                    <div className="space-y-2">
                      {aov.dailyTrend.map((day) => (
                        <div
                          key={day.date}
                          className="flex items-center justify-between rounded-lg border border-[hsl(var(--border))] p-3"
                        >
                          <div>
                            <p className="text-sm font-medium">{day.date}</p>
                            <p className="text-xs text-[hsl(var(--muted-foreground))]">
                              {formatNumber(day.orderCount)} заказов
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{formatCurrency(day.totalRevenue, aov.currency)}</p>
                            <p className="text-xs text-[hsl(var(--muted-foreground))]">
                              AOV: {formatCurrency(day.aov, aov.currency)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-lg border border-[hsl(var(--border))] p-4">
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    Формула: Выручка = Количество заказов × Средний чек
                  </p>
                  <p className="mt-2 font-mono text-sm">
                    {formatNumber(aov.completedOrdersMonth)} × {formatCurrency(aov.aovMonth, aov.currency)} = {formatCurrency(aov.totalRevenueMonth, aov.currency)}
                  </p>
                  <Badge variant="secondary" className="mt-2">За месяц</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timestamp */}
          {aov.calculatedAt && (
            <p className="text-xs text-[hsl(var(--muted-foreground))] text-center">
              Данные обновлены: {formatDateTime(aov.calculatedAt)}
            </p>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-[hsl(var(--muted-foreground))]">
              Нет данных для отображения
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
