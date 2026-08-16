import { useState } from 'react'
import {
  DollarSign,
  ShoppingCart,
  Settings2,
  TrendingUp,
  Users,
  Loader2,
  BarChart3,
  Database,
} from 'lucide-react'
import {
  Card,
  CardContent,
  Badge,
  Button,
  Select,
  Input,
} from '@/components/ui'
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils'
import {
  useRevenueMetrics,
  useOrdersMetrics,
  useOperationsMetrics,
  useFinancialMetrics,
  useCustomerExperienceMetrics,
  useRefreshSpecificCache,
} from '@/hooks/useAnalytics'
import type { AnalyticsQueryParams } from '@/api/analytics.api'

type TabType = 'revenue' | 'orders' | 'operations' | 'financial' | 'cx'

const CACHE_NAMES = [
  'revenue',
  'orders',
  'operations',
  'financial',
  'cx',
  'activity',
  'orderVolume',
  'conversion',
  'aov',
  'activation',
  'churn',
]

export function LegacyAnalyticsDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>('revenue')
  const [dateRange, setDateRange] = useState<AnalyticsQueryParams>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  })
  const [selectedCache, setSelectedCache] = useState(CACHE_NAMES[0])

  const { data: revenueData, isLoading: revenueLoading } = useRevenueMetrics(dateRange)
  const { data: ordersData, isLoading: ordersLoading } = useOrdersMetrics(dateRange)
  const { data: operationsData, isLoading: operationsLoading } = useOperationsMetrics(dateRange)
  const { data: financialData, isLoading: financialLoading } = useFinancialMetrics(dateRange)
  const { data: cxData, isLoading: cxLoading } = useCustomerExperienceMetrics(dateRange)
  const refreshCache = useRefreshSpecificCache()

  const revenue = revenueData
  const orders = ordersData
  const operations = operationsData
  const financial = financialData
  const cx = cxData

  const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
    { key: 'revenue', label: 'Доходы', icon: <DollarSign className="h-4 w-4" /> },
    { key: 'orders', label: 'Заказы', icon: <ShoppingCart className="h-4 w-4" /> },
    { key: 'operations', label: 'Операции', icon: <Settings2 className="h-4 w-4" /> },
    { key: 'financial', label: 'Финансы', icon: <TrendingUp className="h-4 w-4" /> },
    { key: 'cx', label: 'Клиентский опыт', icon: <Users className="h-4 w-4" /> },
  ]

  const isLoading = revenueLoading || ordersLoading || operationsLoading || financialLoading || cxLoading

  const handleRefreshCache = () => {
    refreshCache.mutate(selectedCache)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Расширенная аналитика</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Детальные метрики по всем направлениям (Legacy API)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedCache} onChange={(e) => setSelectedCache(e.target.value)} className="w-[160px]">
            {CACHE_NAMES.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </Select>
          <Button
            variant="outline"
            onClick={handleRefreshCache}
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

      {/* Date range */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div>
              <label className="mb-1 block text-sm text-[hsl(var(--muted-foreground))]">Начало периода</label>
              <Input
                type="date"
                value={dateRange.startDate || ''}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-[hsl(var(--muted-foreground))]">Конец периода</label>
              <Input
                type="date"
                value={dateRange.endDate || ''}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              />
            </div>
            {isLoading && <Loader2 className="h-5 w-5 animate-spin text-[hsl(var(--muted-foreground))] self-end mb-2" />}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? 'default' : 'outline'}
            onClick={() => setActiveTab(tab.key)}
            size="sm"
          >
            {tab.icon}
            <span className="ml-2">{tab.label}</span>
          </Button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'revenue' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <DollarSign className="h-5 w-5" /> Метрики доходов
          </h2>
          {revenueLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : revenue ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {typeof revenue === 'object' && Object.entries(revenue).map(([key, value]) => (
                <Card key={key}>
                  <CardContent className="pt-6">
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">{key}</p>
                    <p className="text-xl font-bold mt-1">
                      {typeof value === 'number' ? (key.toLowerCase().includes('rate') || key.toLowerCase().includes('percent') ? formatPercent(value) : formatNumber(value)) : String(value)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card><CardContent className="py-8 text-center text-[hsl(var(--muted-foreground))]">Нет данных</CardContent></Card>
          )}
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" /> Метрики заказов
          </h2>
          {ordersLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : orders ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {typeof orders === 'object' && Object.entries(orders).map(([key, value]) => (
                <Card key={key}>
                  <CardContent className="pt-6">
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">{key}</p>
                    <p className="text-xl font-bold mt-1">
                      {typeof value === 'number' ? formatNumber(value) : String(value)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card><CardContent className="py-8 text-center text-[hsl(var(--muted-foreground))]">Нет данных</CardContent></Card>
          )}
        </div>
      )}

      {activeTab === 'operations' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Settings2 className="h-5 w-5" /> Операционные метрики
          </h2>
          {operationsLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : operations ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {typeof operations === 'object' && Object.entries(operations).map(([key, value]) => (
                <Card key={key}>
                  <CardContent className="pt-6">
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">{key}</p>
                    <p className="text-xl font-bold mt-1">
                      {typeof value === 'number' ? formatNumber(value) : String(value)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card><CardContent className="py-8 text-center text-[hsl(var(--muted-foreground))]">Нет данных</CardContent></Card>
          )}
        </div>
      )}

      {activeTab === 'financial' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5" /> Финансовые метрики
          </h2>
          {financialLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : financial ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {typeof financial === 'object' && Object.entries(financial).map(([key, value]) => (
                <Card key={key}>
                  <CardContent className="pt-6">
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">{key}</p>
                    <p className="text-xl font-bold mt-1">
                      {typeof value === 'number' ? (key.toLowerCase().includes('amount') || key.toLowerCase().includes('revenue') ? formatCurrency(value) : formatNumber(value)) : String(value)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card><CardContent className="py-8 text-center text-[hsl(var(--muted-foreground))]">Нет данных</CardContent></Card>
          )}
        </div>
      )}

      {activeTab === 'cx' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" /> Клиентский опыт
          </h2>
          {cxLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : cx ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {typeof cx === 'object' && Object.entries(cx).map(([key, value]) => (
                <Card key={key}>
                  <CardContent className="pt-6">
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">{key}</p>
                    <p className="text-xl font-bold mt-1">
                      {typeof value === 'number' ? formatNumber(value) : String(value)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card><CardContent className="py-8 text-center text-[hsl(var(--muted-foreground))]">Нет данных</CardContent></Card>
          )}
        </div>
      )}

      {/* Summary badges */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <Badge variant="outline">
          <BarChart3 className="mr-1 h-3 w-3" />
          5 категорий метрик
        </Badge>
        {refreshCache.isSuccess && (
          <Badge variant="success">Кэш обновлён</Badge>
        )}
      </div>
    </div>
  )
}
