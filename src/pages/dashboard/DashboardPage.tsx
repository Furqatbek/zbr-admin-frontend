import {
  Package,
  DollarSign,
  UtensilsCrossed,
  Bike,
  Clock,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Loader2,
  Activity,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@/components/ui'
import { formatCurrency, formatNumber, formatDateTime } from '@/lib/utils'
import { useDashboardOverview, useDashboardStuckOrders, useRefreshAllCaches } from '@/hooks/useDashboard'
import type { TrendDirection, StuckOrderPriority } from '@/types'

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: { value: number; direction: TrendDirection }
  description?: string
  isLoading?: boolean
}

function StatCard({ title, value, icon, trend, description, isLoading }: StatCardProps) {
  const isPositive = trend?.direction === 'UP'
  const isNegative = trend?.direction === 'DOWN'

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
          {title}
        </CardTitle>
        <div className="h-8 w-8 rounded-lg bg-[hsl(var(--primary))]/10 flex items-center justify-center text-[hsl(var(--primary))]">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-8 flex items-center">
            <Loader2 className="h-5 w-5 animate-spin text-[hsl(var(--muted-foreground))]" />
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {trend && (
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 flex items-center gap-1">
                <TrendingUp
                  className={`h-3 w-3 ${
                    isPositive
                      ? 'text-[hsl(var(--success))]'
                      : isNegative
                        ? 'text-[hsl(var(--destructive))] rotate-180'
                        : 'text-[hsl(var(--muted-foreground))]'
                  }`}
                />
                <span
                  className={
                    isPositive
                      ? 'text-[hsl(var(--success))]'
                      : isNegative
                        ? 'text-[hsl(var(--destructive))]'
                        : ''
                  }
                >
                  {isPositive ? '+' : ''}
                  {trend.value}%
                </span>
                <span>по сравнению со вчера</span>
              </p>
            )}
            {description && (
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{description}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

function getPriorityBadge(priority: StuckOrderPriority) {
  switch (priority) {
    case 'CRITICAL':
      return <Badge variant="destructive">Критический</Badge>
    case 'HIGH':
      return <Badge variant="warning">Высокий</Badge>
    case 'MEDIUM':
      return <Badge variant="secondary">Средний</Badge>
    case 'LOW':
      return <Badge variant="outline">Низкий</Badge>
    default:
      return <Badge variant="secondary">{priority}</Badge>
  }
}

export function DashboardPage() {
  const { data: overviewData, isLoading: overviewLoading, refetch: refetchOverview } = useDashboardOverview()
  const { data: stuckOrdersData, isLoading: stuckOrdersLoading, refetch: refetchStuckOrders } = useDashboardStuckOrders()
  const refreshCaches = useRefreshAllCaches()

  const overview = overviewData?.data
  const stuckOrders = stuckOrdersData?.data?.orders || []

  const statusLabels: Record<string, string> = {
    PENDING: 'Ожидает',
    CONFIRMED: 'Подтверждён',
    PREPARING: 'Готовится',
    READY_FOR_PICKUP: 'Готов к выдаче',
    PICKED_UP: 'Забран',
    DELIVERING: 'Доставляется',
    IN_TRANSIT: 'В пути',
    DELIVERED: 'Доставлен',
    CANCELLED: 'Отменён',
    ACCEPTED: 'Принят',
  }

  const handleRefresh = async () => {
    await refreshCaches.mutateAsync()
    refetchOverview()
    refetchStuckOrders()
  }

  const systemStatusBadge = () => {
    if (!overview?.systemStatus) return null
    const status = overview.systemStatus.overallHealth
    switch (status) {
      case 'HEALTHY':
        return <Badge variant="success">Система работает</Badge>
      case 'DEGRADED':
        return <Badge variant="warning">Деградация</Badge>
      case 'UNHEALTHY':
        return <Badge variant="destructive">Сбой</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Главная</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Обзор ключевых показателей платформы
          </p>
        </div>
        <div className="flex items-center gap-4">
          {systemStatusBadge()}
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshCaches.isPending}
          >
            {refreshCaches.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Обновить
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Заказов сегодня"
          value={formatNumber(overview?.ordersToday ?? 0)}
          icon={<Package className="h-4 w-4" />}
          trend={
            overview?.orderComparison
              ? {
                  value: overview.orderComparison.percentageChange,
                  direction: overview.orderComparison.trend,
                }
              : undefined
          }
          isLoading={overviewLoading}
        />
        <StatCard
          title="Выручка сегодня"
          value={formatCurrency(overview?.revenueToday ?? 0)}
          icon={<DollarSign className="h-4 w-4" />}
          isLoading={overviewLoading}
        />
        <StatCard
          title="Среднее время доставки"
          value={overview?.avgDeliveryTimeMinutes ? `${overview.avgDeliveryTimeMinutes} мин` : '—'}
          icon={<Clock className="h-4 w-4" />}
          isLoading={overviewLoading}
        />
        <StatCard
          title="Активные рестораны"
          value={formatNumber(overview?.activeRestaurants ?? 0)}
          icon={<UtensilsCrossed className="h-4 w-4" />}
          isLoading={overviewLoading}
        />
        <StatCard
          title="Активные курьеры"
          value={formatNumber(overview?.activeCouriers ?? 0)}
          icon={<Bike className="h-4 w-4" />}
          description="Онлайн сейчас"
          isLoading={overviewLoading}
        />
        <StatCard
          title="Активные компоненты"
          value={overview?.systemStatus?.activeComponents ?? '—'}
          icon={<Activity className="h-4 w-4" />}
          description={`из ${overview?.systemStatus?.totalComponents ?? 0}`}
          isLoading={overviewLoading}
        />
      </div>

      {/* Stuck orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-[hsl(var(--warning))]" />
            <CardTitle>Застрявшие заказы</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {stuckOrdersData?.data?.summary && (
              <span className="text-sm text-[hsl(var(--muted-foreground))]">
                Критических: {stuckOrdersData.data.summary.critical}
              </span>
            )}
            <Badge variant="warning">{stuckOrders.length} заказов</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {stuckOrdersLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--muted-foreground))]" />
            </div>
          ) : stuckOrders.length === 0 ? (
            <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">
              Нет застрявших заказов
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))]">
                    <th className="text-left py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">
                      ID заказа
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">
                      Ресторан
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">
                      Статус
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">
                      Приоритет
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">
                      Время ожидания
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">
                      Создан
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stuckOrders.map((order) => (
                    <tr
                      key={order.orderId}
                      className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] cursor-pointer"
                    >
                      <td className="py-3 px-4 text-sm font-medium">#{order.orderId}</td>
                      <td className="py-3 px-4 text-sm">{order.restaurantName}</td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary">
                          {statusLabels[order.currentStatus] || order.currentStatus}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">{getPriorityBadge(order.priority)}</td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-[hsl(var(--destructive))] font-medium">
                          {order.stuckMinutes} мин
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-[hsl(var(--muted-foreground))]">
                        {formatDateTime(order.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary cards */}
      {stuckOrdersData?.data?.summary && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-[hsl(var(--destructive))]">
                  {stuckOrdersData.data.summary.critical}
                </div>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                  Критических заказов
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-[hsl(var(--warning))]">
                  {stuckOrdersData.data.summary.high}
                </div>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                  Высокий приоритет
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold">
                  {stuckOrdersData.data.summary.medium}
                </div>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                  Средний приоритет
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-[hsl(var(--muted-foreground))]">
                  {stuckOrdersData.data.summary.low}
                </div>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                  Низкий приоритет
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Generated timestamp */}
      {overview?.generatedAt && (
        <p className="text-xs text-[hsl(var(--muted-foreground))] text-center">
          Данные обновлены: {formatDateTime(overview.generatedAt)}
        </p>
      )}
    </div>
  )
}
