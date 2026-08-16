import { useState } from 'react'
import {
  Filter,
  AlertTriangle,
  Clock,
  Loader2,
  Package,
  Database,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Input,
  Select,
} from '@/components/ui'
import { formatNumber, formatCurrency, formatDateTime } from '@/lib/utils'
import {
  useActiveOrdersFiltered,
  useStuckOrdersFiltered,
  useRefreshCache,
} from '@/hooks/useDashboard'
import type { ActiveOrdersFilterRequest, StuckOrdersFilterRequest } from '@/api/dashboard.api'
import type { StuckOrderPriority } from '@/types'

type ViewMode = 'active' | 'stuck'

export function FilteredOrdersPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('active')
  const [activeFilters, setActiveFilters] = useState<ActiveOrdersFilterRequest>({
    page: 0,
    pageSize: 20,
    sortBy: 'createdAt',
    sortDirection: 'DESC',
  })
  const [stuckFilters, setStuckFilters] = useState<StuckOrdersFilterRequest>({
    stuckThresholdPending: 15,
    stuckThresholdAccepted: 10,
    stuckThresholdPreparing: 30,
    stuckThresholdReady: 15,
    stuckThresholdInTransit: 45,
    page: 0,
    pageSize: 20,
  })
  const [statusFilter, setStatusFilter] = useState('')
  const [cacheKey, setCacheKey] = useState('overview')

  const { data: activeData, isLoading: activeLoading } = useActiveOrdersFiltered(
    { ...activeFilters, orderStatuses: statusFilter ? [statusFilter] : undefined },
    viewMode === 'active'
  )
  const { data: stuckData, isLoading: stuckLoading } = useStuckOrdersFiltered(
    stuckFilters,
    viewMode === 'stuck'
  )
  const refreshCache = useRefreshCache()

  const activeOrders = activeData?.data
  const stuckOrders = stuckData?.data

  const getPriorityColor = (p: StuckOrderPriority) => {
    switch (p) {
      case 'CRITICAL': return 'destructive' as const
      case 'HIGH': return 'warning' as const
      case 'MEDIUM': return 'secondary' as const
      default: return 'outline' as const
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Фильтрованные заказы</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Расширенная фильтрация активных и застрявших заказов
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Ключ кэша"
            value={cacheKey}
            onChange={(e) => setCacheKey(e.target.value)}
            className="w-[140px]"
          />
          <Button
            variant="outline"
            onClick={() => refreshCache.mutate(cacheKey)}
            disabled={refreshCache.isPending}
          >
            {refreshCache.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Database className="mr-2 h-4 w-4" />
            )}
            Обновить кэш
          </Button>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex gap-2">
        <Button
          variant={viewMode === 'active' ? 'default' : 'outline'}
          onClick={() => setViewMode('active')}
        >
          <Package className="mr-2 h-4 w-4" />
          Активные заказы
        </Button>
        <Button
          variant={viewMode === 'stuck' ? 'default' : 'outline'}
          onClick={() => setViewMode('stuck')}
        >
          <AlertTriangle className="mr-2 h-4 w-4" />
          Застрявшие заказы
        </Button>
        {refreshCache.isSuccess && <Badge variant="success">Кэш обновлён</Badge>}
      </div>

      {/* Active Orders View */}
      {viewMode === 'active' && (
        <>
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Фильтры активных заказов
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div>
                  <label className="mb-1 block text-sm text-[hsl(var(--muted-foreground))]">Статус</label>
                  <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-[160px]">
                    <option value="">Все статусы</option>
                    <option value="PENDING">Ожидает</option>
                    <option value="CONFIRMED">Подтверждён</option>
                    <option value="PREPARING">Готовится</option>
                    <option value="READY_FOR_PICKUP">Готов к выдаче</option>
                    <option value="IN_TRANSIT">В пути</option>
                    <option value="DELIVERING">Доставляется</option>
                  </Select>
                </div>
                <div>
                  <label className="mb-1 block text-sm text-[hsl(var(--muted-foreground))]">Сортировка</label>
                  <Select
                    value={activeFilters.sortBy || 'createdAt'}
                    onChange={(e) => setActiveFilters({ ...activeFilters, sortBy: e.target.value })}
                    className="w-[160px]"
                  >
                    <option value="createdAt">Дата создания</option>
                    <option value="orderTotal">Сумма</option>
                    <option value="status">Статус</option>
                  </Select>
                </div>
                <div>
                  <label className="mb-1 block text-sm text-[hsl(var(--muted-foreground))]">Направление</label>
                  <Select
                    value={activeFilters.sortDirection || 'DESC'}
                    onChange={(e) => setActiveFilters({ ...activeFilters, sortDirection: e.target.value as 'ASC' | 'DESC' })}
                    className="w-[120px]"
                  >
                    <option value="DESC">Убывание</option>
                    <option value="ASC">Возрастание</option>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Orders Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Активные заказы
                  {activeOrders && (
                    <Badge variant="secondary" className="ml-2">
                      {formatNumber(activeOrders.totalActiveOrders)}
                    </Badge>
                  )}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {activeLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : activeOrders?.orders && activeOrders.orders.length > 0 ? (
                <>
                  {/* Status Breakdown */}
                  {activeOrders.statusBreakdown && (
                    <div className="mb-4 flex flex-wrap gap-2">
                      {Object.entries(activeOrders.statusBreakdown).map(([status, count]) => (
                        <Badge key={status} variant="outline">
                          {status}: {count}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[hsl(var(--border))]">
                          <th className="text-left py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Заказ</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Клиент</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Ресторан</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Статус</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Сумма</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Создан</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeOrders.orders.map((order) => (
                          <tr key={order.orderId} className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]">
                            <td className="py-3 px-4 text-sm font-medium">#{order.orderNumber || order.orderId}</td>
                            <td className="py-3 px-4 text-sm">{order.customerName}</td>
                            <td className="py-3 px-4 text-sm">{order.restaurantName}</td>
                            <td className="py-3 px-4">
                              <Badge variant="secondary">{order.orderStatus || order.status}</Badge>
                            </td>
                            <td className="py-3 px-4 text-sm font-medium">{formatCurrency(order.orderTotal)}</td>
                            <td className="py-3 px-4 text-sm text-[hsl(var(--muted-foreground))]">{formatDateTime(order.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <p className="text-center py-8 text-[hsl(var(--muted-foreground))]">Нет активных заказов</p>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Stuck Orders View */}
      {viewMode === 'stuck' && (
        <>
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Пороги застревания (минуты)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-5">
                <div>
                  <label className="mb-1 block text-xs text-[hsl(var(--muted-foreground))]">Ожидание</label>
                  <Input
                    type="number"
                    value={stuckFilters.stuckThresholdPending}
                    onChange={(e) => setStuckFilters({ ...stuckFilters, stuckThresholdPending: parseInt(e.target.value) || 15 })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-[hsl(var(--muted-foreground))]">Принят</label>
                  <Input
                    type="number"
                    value={stuckFilters.stuckThresholdAccepted}
                    onChange={(e) => setStuckFilters({ ...stuckFilters, stuckThresholdAccepted: parseInt(e.target.value) || 10 })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-[hsl(var(--muted-foreground))]">Готовится</label>
                  <Input
                    type="number"
                    value={stuckFilters.stuckThresholdPreparing}
                    onChange={(e) => setStuckFilters({ ...stuckFilters, stuckThresholdPreparing: parseInt(e.target.value) || 30 })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-[hsl(var(--muted-foreground))]">Готов</label>
                  <Input
                    type="number"
                    value={stuckFilters.stuckThresholdReady}
                    onChange={(e) => setStuckFilters({ ...stuckFilters, stuckThresholdReady: parseInt(e.target.value) || 15 })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-[hsl(var(--muted-foreground))]">В пути</label>
                  <Input
                    type="number"
                    value={stuckFilters.stuckThresholdInTransit}
                    onChange={(e) => setStuckFilters({ ...stuckFilters, stuckThresholdInTransit: parseInt(e.target.value) || 45 })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stuck Orders Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-[hsl(var(--warning))]" />
                  Застрявшие заказы
                  {stuckOrders && (
                    <Badge variant="warning">{stuckOrders.totalStuckOrders}</Badge>
                  )}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {stuckLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : stuckOrders?.orders && stuckOrders.orders.length > 0 ? (
                <>
                  {/* Stage breakdown */}
                  <div className="mb-4 grid gap-2 sm:grid-cols-5">
                    <div className="text-center rounded-lg bg-[hsl(var(--destructive))]/10 p-2">
                      <p className="text-lg font-bold">{stuckOrders.stuckPending}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">Ожидают</p>
                    </div>
                    <div className="text-center rounded-lg bg-[hsl(var(--warning))]/10 p-2">
                      <p className="text-lg font-bold">{stuckOrders.stuckAccepted}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">Приняты</p>
                    </div>
                    <div className="text-center rounded-lg bg-[hsl(var(--muted))] p-2">
                      <p className="text-lg font-bold">{stuckOrders.stuckPreparing}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">Готовятся</p>
                    </div>
                    <div className="text-center rounded-lg bg-[hsl(var(--muted))] p-2">
                      <p className="text-lg font-bold">{stuckOrders.stuckReady}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">Готовы</p>
                    </div>
                    <div className="text-center rounded-lg bg-[hsl(var(--muted))] p-2">
                      <p className="text-lg font-bold">{stuckOrders.stuckInTransit}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">В пути</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[hsl(var(--border))]">
                          <th className="text-left py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Заказ</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Ресторан</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Этап</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Приоритет</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Время ожидания</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Действие</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stuckOrders.orders.map((order) => (
                          <tr key={order.orderId} className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]">
                            <td className="py-3 px-4 text-sm font-medium">#{order.externalOrderNo || order.orderId}</td>
                            <td className="py-3 px-4 text-sm">{order.restaurantName}</td>
                            <td className="py-3 px-4">
                              <Badge variant="secondary">{order.stuckStage}</Badge>
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant={getPriorityColor(order.priority)}>{order.priority}</Badge>
                            </td>
                            <td className="py-3 px-4 text-sm font-medium text-[hsl(var(--destructive))]">
                              {order.minutesStuck} мин
                            </td>
                            <td className="py-3 px-4 text-sm text-[hsl(var(--muted-foreground))]">
                              {order.suggestedAction}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <p className="text-center py-8 text-[hsl(var(--muted-foreground))]">Нет застрявших заказов</p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
