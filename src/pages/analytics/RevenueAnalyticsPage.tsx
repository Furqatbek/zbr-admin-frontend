import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Package,
  Calculator,
  RefreshCw,
  Loader2,
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
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Общая выручка</p>
                    <p className="text-2xl font-bold">{formatCurrency(aov.totalRevenue, aov.currency)}</p>
                    <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                      {formatNumber(aov.totalCompletedOrders)} заказов
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
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Средний чек (AOV)</p>
                    <p className="text-2xl font-bold">{formatCurrency(aov.averageOrderValue, aov.currency)}</p>
                    <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                      Среднее значение
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
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Медианный чек</p>
                    <p className="text-2xl font-bold">{formatCurrency(aov.medianOrderValue, aov.currency)}</p>
                    <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                      50-й перцентиль
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--warning))]/10">
                    <Calculator className="h-6 w-6 text-[hsl(var(--warning))]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Позиций в заказе</p>
                    <p className="text-2xl font-bold">{aov.averageItemsPerOrder.toFixed(1)}</p>
                    <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                      В среднем
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--secondary))]/50">
                    <Package className="h-6 w-6 text-[hsl(var(--secondary-foreground))]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Metrics */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* AOV Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Анализ среднего чека
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg bg-[hsl(var(--muted))] p-6">
                  <div className="text-center">
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Средний чек (AOV)</p>
                    <p className="text-5xl font-bold text-[hsl(var(--primary))]">
                      {formatCurrency(aov.averageOrderValue, aov.currency)}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-[hsl(var(--border))] p-4 text-center">
                    <p className="text-2xl font-bold">{formatCurrency(aov.medianOrderValue, aov.currency)}</p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Медианный чек</p>
                    <Badge variant="secondary" className="mt-2">50-й перцентиль</Badge>
                  </div>
                  <div className="rounded-lg border border-[hsl(var(--border))] p-4 text-center">
                    <p className="text-2xl font-bold">{aov.averageItemsPerOrder.toFixed(2)}</p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Позиций в заказе</p>
                    <Badge variant="secondary" className="mt-2">В среднем</Badge>
                  </div>
                </div>

                {aov.averageOrderValue > aov.medianOrderValue && (
                  <div className="rounded-lg bg-[hsl(var(--warning))]/10 p-4">
                    <p className="text-sm">
                      <strong>Примечание:</strong> Средний чек выше медианного на{' '}
                      {formatCurrency(aov.averageOrderValue - aov.medianOrderValue, aov.currency)}.
                      Это указывает на наличие крупных заказов, которые повышают среднее значение.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Revenue Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Сводка по выручке
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg bg-[hsl(var(--success))]/10 p-6">
                  <div className="text-center">
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Общая выручка</p>
                    <p className="text-5xl font-bold text-[hsl(var(--success))]">
                      {formatCurrency(aov.totalRevenue, aov.currency)}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                      <span>Завершённых заказов</span>
                    </div>
                    <span className="font-bold">{formatNumber(aov.totalCompletedOrders)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                      <span>Средний чек</span>
                    </div>
                    <span className="font-bold">{formatCurrency(aov.averageOrderValue, aov.currency)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                      <span>Позиций в заказе</span>
                    </div>
                    <span className="font-bold">{aov.averageItemsPerOrder.toFixed(1)}</span>
                  </div>
                </div>

                <div className="rounded-lg border border-[hsl(var(--border))] p-4">
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    Формула: Общая выручка = Количество заказов × Средний чек
                  </p>
                  <p className="mt-2 font-mono text-sm">
                    {formatNumber(aov.totalCompletedOrders)} × {formatCurrency(aov.averageOrderValue, aov.currency)} = {formatCurrency(aov.totalRevenue, aov.currency)}
                  </p>
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
