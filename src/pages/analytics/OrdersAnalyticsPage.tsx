import { useState } from 'react'
import {
  Package,
  XCircle,
  Clock,
  Calendar,
  RefreshCw,
  Loader2,
  AlertCircle,
  Ban,
  TrendingUp,
  CheckCircle,
  Users,
  UserPlus,
  BarChart3,
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
import { formatNumber, formatCurrency, formatDateTime, formatPercent } from '@/lib/utils'
import {
  useActiveOrders,
  useCancelledOrders,
  useRejectedOrders,
} from '@/hooks/useDashboard'
import { useOrderVolumeMetrics } from '@/hooks/useAnalytics'

const statusLabels: Record<string, string> = {
  PENDING: 'Ожидает',
  CONFIRMED: 'Подтверждён',
  ACCEPTED: 'Принят',
  PREPARING: 'Готовится',
  READY: 'Готов',
  READY_FOR_PICKUP: 'Готов к выдаче',
  PICKED_UP: 'Забран',
  DELIVERING: 'Доставляется',
  IN_TRANSIT: 'В пути',
  DELIVERED: 'Доставлен',
  CANCELLED: 'Отменён',
  REJECTED: 'Отклонён',
}

const statusColors: Record<string, string> = {
  PENDING: 'hsl(var(--warning))',
  CONFIRMED: 'hsl(var(--primary))',
  ACCEPTED: 'hsl(var(--primary))',
  PREPARING: 'hsl(var(--primary))',
  READY: 'hsl(var(--success))',
  READY_FOR_PICKUP: 'hsl(var(--success))',
  PICKED_UP: 'hsl(var(--primary))',
  DELIVERING: 'hsl(var(--primary))',
  IN_TRANSIT: 'hsl(var(--primary))',
  DELIVERED: 'hsl(var(--success))',
  CANCELLED: 'hsl(var(--destructive))',
  REJECTED: 'hsl(var(--destructive))',
}

export function OrdersAnalyticsPage() {
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

  const { data: activeOrdersData, isLoading: activeLoading, refetch: refetchActive } = useActiveOrders()
  const { data: cancelledOrdersData, isLoading: cancelledLoading, refetch: refetchCancelled } = useCancelledOrders(dateRange)
  const { data: rejectedOrdersData, isLoading: rejectedLoading, refetch: refetchRejected } = useRejectedOrders(dateRange)
  const { data: orderVolumeData, isLoading: volumeLoading, refetch: refetchVolume } = useOrderVolumeMetrics()

  const isLoading = activeLoading || cancelledLoading || rejectedLoading || volumeLoading

  const handleRefresh = () => {
    refetchActive()
    refetchCancelled()
    refetchRejected()
    refetchVolume()
  }

  const activeOrders = activeOrdersData?.data
  const cancelledOrders = cancelledOrdersData?.data
  const rejectedOrders = rejectedOrdersData?.data
  const orderVolume = orderVolumeData?.data

  // Calculate totals
  const totalActiveOrders = activeOrders?.totalActiveOrders ?? 0
  const totalCancelledOrders = cancelledOrders?.totalCancelledOrders ?? 0
  const totalRejectedOrders = rejectedOrders?.totalRejectedOrders ?? 0

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
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Order Volume Stats (from Analytics API) */}
      {orderVolume && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">Заказов сегодня</p>
                  <p className="text-2xl font-bold">{formatNumber(orderVolume.ordersToday)}</p>
                </div>
                <Package className="h-6 w-6 text-[hsl(var(--primary))]" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">За неделю</p>
                  <p className="text-2xl font-bold">{formatNumber(orderVolume.ordersThisWeek)}</p>
                </div>
                <BarChart3 className="h-6 w-6 text-[hsl(var(--primary))]" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">Первые заказы</p>
                  <p className="text-2xl font-bold">{formatNumber(orderVolume.firstOrdersToday)}</p>
                </div>
                <UserPlus className="h-6 w-6 text-[hsl(var(--success))]" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">Повторные</p>
                  <p className="text-2xl font-bold">{formatNumber(orderVolume.repeatOrdersToday)}</p>
                </div>
                <Users className="h-6 w-6 text-[hsl(var(--warning))]" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">Успешность</p>
                  <p className="text-2xl font-bold text-[hsl(var(--success))]">
                    {formatPercent(orderVolume.successRate)}
                  </p>
                </div>
                <CheckCircle className="h-6 w-6 text-[hsl(var(--success))]" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">Отмены</p>
                  <p className="text-2xl font-bold text-[hsl(var(--destructive))]">
                    {formatPercent(orderVolume.cancellationRate)}
                  </p>
                </div>
                <XCircle className="h-6 w-6 text-[hsl(var(--destructive))]" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Orders per Hour Chart */}
      {orderVolume?.ordersPerHour && Object.keys(orderVolume.ordersPerHour).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Распределение заказов по часам (сегодня)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart
              data={Object.entries(orderVolume.ordersPerHour)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .map(([hour, count]) => ({
                  label: `${hour}:00`,
                  value: count,
                  color: 'hsl(var(--primary))',
                }))}
              height={250}
              valueFormatter={(v) => formatNumber(v)}
            />
          </CardContent>
        </Card>
      )}

      {/* First vs Repeat Orders */}
      {orderVolume && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Новые vs Повторные заказы
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-[hsl(var(--border))] p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--success))]/10">
                    <UserPlus className="h-8 w-8 text-[hsl(var(--success))]" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{formatNumber(orderVolume.firstOrdersToday)}</p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Первые заказы сегодня</p>
                    <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                      Новые клиенты
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="h-2 w-full rounded-full bg-[hsl(var(--muted))]">
                    <div
                      className="h-full rounded-full bg-[hsl(var(--success))]"
                      style={{
                        width: `${orderVolume.ordersToday > 0 ? (orderVolume.firstOrdersToday / orderVolume.ordersToday) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                    {orderVolume.ordersToday > 0
                      ? formatPercent((orderVolume.firstOrdersToday / orderVolume.ordersToday) * 100)
                      : '0%'}{' '}
                    от всех заказов
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-[hsl(var(--border))] p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--warning))]/10">
                    <Users className="h-8 w-8 text-[hsl(var(--warning))]" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{formatNumber(orderVolume.repeatOrdersToday)}</p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Повторные заказы сегодня</p>
                    <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                      Возвратные клиенты
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="h-2 w-full rounded-full bg-[hsl(var(--muted))]">
                    <div
                      className="h-full rounded-full bg-[hsl(var(--warning))]"
                      style={{
                        width: `${orderVolume.ordersToday > 0 ? (orderVolume.repeatOrdersToday / orderVolume.ordersToday) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                    {orderVolume.ordersToday > 0
                      ? formatPercent((orderVolume.repeatOrdersToday / orderVolume.ordersToday) * 100)
                      : '0%'}{' '}
                    от всех заказов
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success / Cancellation Rates */}
      {orderVolume && (
        <Card>
          <CardHeader>
            <CardTitle>Показатели эффективности</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-[hsl(var(--success))]/10 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Успешность заказов</p>
                    <p className="text-4xl font-bold text-[hsl(var(--success))]">
                      {formatPercent(orderVolume.successRate)}
                    </p>
                  </div>
                  <CheckCircle className="h-12 w-12 text-[hsl(var(--success))]" />
                </div>
                <div className="mt-4">
                  <div className="h-3 w-full rounded-full bg-[hsl(var(--muted))]">
                    <div
                      className="h-full rounded-full bg-[hsl(var(--success))]"
                      style={{ width: `${orderVolume.successRate}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-[hsl(var(--destructive))]/10 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Процент отмен</p>
                    <p className="text-4xl font-bold text-[hsl(var(--destructive))]">
                      {formatPercent(orderVolume.cancellationRate)}
                    </p>
                  </div>
                  <XCircle className="h-12 w-12 text-[hsl(var(--destructive))]" />
                </div>
                <div className="mt-4">
                  <div className="h-3 w-full rounded-full bg-[hsl(var(--muted))]">
                    <div
                      className="h-full rounded-full bg-[hsl(var(--destructive))]"
                      style={{ width: `${orderVolume.cancellationRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Активные заказы</p>
                <p className="text-2xl font-bold">{formatNumber(totalActiveOrders)}</p>
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
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Отменено</p>
                <p className="text-2xl font-bold">{formatNumber(totalCancelledOrders)}</p>
                {cancelledOrders && (
                  <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                    Возвращено: {formatCurrency(cancelledOrders.totalRefundAmount)}
                  </p>
                )}
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
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Отклонено</p>
                <p className="text-2xl font-bold">{formatNumber(totalRejectedOrders)}</p>
                {rejectedOrders && (
                  <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                    Потери: {formatCurrency(rejectedOrders.totalLostRevenue)}
                  </p>
                )}
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--warning))]/10">
                <Ban className="h-6 w-6 text-[hsl(var(--warning))]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Причин отклонений</p>
                <p className="text-2xl font-bold">
                  {rejectedOrders?.reasonBreakdown ? Object.keys(rejectedOrders.reasonBreakdown).length : 0}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--muted))]/10">
                <AlertCircle className="h-6 w-6 text-[hsl(var(--muted-foreground))]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      {activeOrders?.statusBreakdown && Object.keys(activeOrders.statusBreakdown).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Заказы по статусам</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-6">
              {Object.entries(activeOrders.statusBreakdown).map(([status, count]) => (
                <div
                  key={status}
                  className="rounded-lg border border-[hsl(var(--border))] p-4 text-center"
                >
                  <div
                    className="mx-auto mb-2 h-2 w-2 rounded-full"
                    style={{ backgroundColor: statusColors[status] || 'hsl(var(--muted))' }}
                  />
                  <p className="text-2xl font-bold">{formatNumber(count)}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    {statusLabels[status] || status}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Cancellation Distribution */}
        {cancelledOrders?.hourlyDistribution && Object.keys(cancelledOrders.hourlyDistribution).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Отмены по часам</CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleBarChart
                data={Object.entries(cancelledOrders.hourlyDistribution)
                  .sort(([a], [b]) => parseInt(a) - parseInt(b))
                  .map(([hour, count]) => ({
                    label: `${hour}:00`,
                    value: count,
                    color: 'hsl(var(--destructive))',
                  }))}
                height={250}
                valueFormatter={(v) => formatNumber(v)}
              />
            </CardContent>
          </Card>
        )}

        {/* Cancellation Reasons */}
        {cancelledOrders?.reasonBreakdown && Object.keys(cancelledOrders.reasonBreakdown).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Причины отмен</CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleBarChart
                data={Object.entries(cancelledOrders.reasonBreakdown)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 10)
                  .map(([reason, count]) => ({
                    label: reason.length > 15 ? reason.substring(0, 15) + '...' : reason,
                    value: count,
                    color: 'hsl(var(--warning))',
                  }))}
                height={250}
                valueFormatter={(v) => formatNumber(v)}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Cancellation Sources */}
      {cancelledOrders && (
        <Card>
          <CardHeader>
            <CardTitle>Источники отмен</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-[hsl(var(--border))] p-4 text-center">
                <p className="text-3xl font-bold">{formatNumber(cancelledOrders.cancelledByCustomer)}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Клиентами</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                  {cancelledOrders.totalCancelledOrders > 0
                    ? ((cancelledOrders.cancelledByCustomer / cancelledOrders.totalCancelledOrders) * 100).toFixed(1)
                    : 0}%
                </p>
              </div>
              <div className="rounded-lg border border-[hsl(var(--border))] p-4 text-center">
                <p className="text-3xl font-bold">{formatNumber(cancelledOrders.cancelledByRestaurant)}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Ресторанами</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                  {cancelledOrders.totalCancelledOrders > 0
                    ? ((cancelledOrders.cancelledByRestaurant / cancelledOrders.totalCancelledOrders) * 100).toFixed(1)
                    : 0}%
                </p>
              </div>
              <div className="rounded-lg border border-[hsl(var(--border))] p-4 text-center">
                <p className="text-3xl font-bold">{formatNumber(cancelledOrders.cancelledBySystem)}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Системой</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                  {cancelledOrders.totalCancelledOrders > 0
                    ? ((cancelledOrders.cancelledBySystem / cancelledOrders.totalCancelledOrders) * 100).toFixed(1)
                    : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rejection Reasons */}
      {rejectedOrders?.reasonBreakdown && Object.keys(rejectedOrders.reasonBreakdown).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Причины отклонений ресторанами</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {Object.entries(rejectedOrders.reasonBreakdown).map(([reason, count]) => (
                <Badge key={reason} variant="outline" className="px-4 py-2 text-sm">
                  {reason}: {formatNumber(count)}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Orders List */}
      {activeOrders?.orders && activeOrders.orders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Активные заказы
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Клиент</TableHead>
                  <TableHead>Ресторан</TableHead>
                  <TableHead>Сумма</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Создан</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeOrders.orders.slice(0, 10).map((order) => (
                  <TableRow key={order.orderId}>
                    <TableCell className="font-medium">#{order.orderId}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{order.restaurantName}</TableCell>
                    <TableCell>{formatCurrency(order.orderTotal)}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        style={{
                          borderColor: statusColors[order.orderStatus],
                          color: statusColors[order.orderStatus],
                        }}
                      >
                        {statusLabels[order.orderStatus] || order.orderStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[hsl(var(--muted-foreground))]">
                      {formatDateTime(order.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Recently Cancelled Orders */}
      {cancelledOrders?.orders && cancelledOrders.orders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-[hsl(var(--destructive))]" />
              Последние отмены
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Клиент</TableHead>
                  <TableHead>Ресторан</TableHead>
                  <TableHead>Причина</TableHead>
                  <TableHead>Возврат</TableHead>
                  <TableHead>Отменён</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cancelledOrders.orders.slice(0, 10).map((order) => (
                  <TableRow key={order.orderId}>
                    <TableCell className="font-medium">#{order.orderId}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{order.restaurantName}</TableCell>
                    <TableCell>
                      <span className="text-sm">{order.cancellationReason}</span>
                    </TableCell>
                    <TableCell>
                      {order.refundAmount > 0 ? (
                        <Badge variant={order.refundStatus === 'COMPLETED' ? 'success' : 'warning'}>
                          {formatCurrency(order.refundAmount)}
                        </Badge>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell className="text-[hsl(var(--muted-foreground))]">
                      {formatDateTime(order.cancelledAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Recently Rejected Orders */}
      {rejectedOrders?.orders && rejectedOrders.orders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-[hsl(var(--warning))]" />
              Последние отклонения
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Клиент</TableHead>
                  <TableHead>Ресторан</TableHead>
                  <TableHead>Причина</TableHead>
                  <TableHead>Сумма</TableHead>
                  <TableHead>Отклонён</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rejectedOrders.orders.slice(0, 10).map((order) => (
                  <TableRow key={order.orderId}>
                    <TableCell className="font-medium">#{order.orderId}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{order.restaurantName}</TableCell>
                    <TableCell>
                      <span className="text-sm">{order.rejectionReason}</span>
                    </TableCell>
                    <TableCell>{formatCurrency(order.orderTotal)}</TableCell>
                    <TableCell className="text-[hsl(var(--muted-foreground))]">
                      {formatDateTime(order.rejectedAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Generated timestamps */}
      <div className="flex flex-col gap-1 text-xs text-[hsl(var(--muted-foreground))] text-center">
        {activeOrders?.generatedAt && (
          <p>Активные заказы обновлены: {formatDateTime(activeOrders.generatedAt)}</p>
        )}
        {cancelledOrders?.generatedAt && (
          <p>Отменённые заказы обновлены: {formatDateTime(cancelledOrders.generatedAt)}</p>
        )}
      </div>
    </div>
  )
}
