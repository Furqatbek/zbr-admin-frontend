import { useMemo } from 'react'
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  AlertTriangle,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Smartphone,
  Bike,
  UtensilsCrossed,
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
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui'
import { SimpleBarChart } from '@/components/charts'
import { formatNumber, formatPercent } from '@/lib/utils'
import {
  useNpsMetrics,
  useRestaurantRatings,
  useCourierRatings,
  useAppStoreRatings,
  useSupportTicketMetrics,
  useCxSummary,
  useInvalidateAllCxCaches,
} from '@/hooks/useCxAnalytics'

// Helper function to get date range (last 30 days)
function getDateRange() {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 30)

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  }
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-[hsl(var(--muted-foreground))]'
          }`}
        />
      ))}
    </div>
  )
}

function getNpsStatusColor(score: number): string {
  if (score >= 70) return 'hsl(var(--success))'
  if (score >= 50) return 'hsl(var(--primary))'
  if (score >= 0) return 'hsl(var(--warning))'
  return 'hsl(var(--destructive))'
}

function getCxStatusBadge(status: string) {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    EXCELLENT: 'default',
    GOOD: 'secondary',
    FAIR: 'outline',
    POOR: 'destructive',
    CRITICAL: 'destructive',
  }
  const labels: Record<string, string> = {
    EXCELLENT: 'Отлично',
    GOOD: 'Хорошо',
    FAIR: 'Удовлетворительно',
    POOR: 'Плохо',
    CRITICAL: 'Критично',
  }
  return <Badge variant={variants[status] || 'outline'}>{labels[status] || status}</Badge>
}

export function CustomerExperienceAnalyticsPage() {
  const dateRange = useMemo(() => getDateRange(), [])

  // Query params for all CX endpoints
  const queryParams = useMemo(
    () => ({
      ...dateRange,
      includeDistribution: true,
      includeTrend: true,
      includeTopRestaurants: true,
      includeTopCouriers: true,
      includeAgentPerformance: true,
    }),
    [dateRange]
  )

  // Fetch all CX data
  const { data: npsData, isLoading: npsLoading } = useNpsMetrics(queryParams)
  const { data: restaurantData, isLoading: restaurantLoading } = useRestaurantRatings(queryParams)
  const { data: courierData, isLoading: courierLoading } = useCourierRatings(queryParams)
  const { data: appStoreData, isLoading: appStoreLoading } = useAppStoreRatings(queryParams)
  const { data: supportData, isLoading: supportLoading } = useSupportTicketMetrics(queryParams)
  const { data: summaryData, isLoading: summaryLoading } = useCxSummary(dateRange)

  const invalidateCacheMutation = useInvalidateAllCxCaches()

  const isLoading =
    npsLoading ||
    restaurantLoading ||
    courierLoading ||
    appStoreLoading ||
    supportLoading ||
    summaryLoading

  const nps = npsData?.data
  const restaurant = restaurantData?.data
  const courier = courierData?.data
  const appStore = appStoreData?.data
  const support = supportData?.data
  const summary = summaryData?.data

  const handleRefreshCache = () => {
    invalidateCacheMutation.mutate()
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
          <h1 className="text-2xl font-bold">Клиентский опыт (CX)</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            NPS, рейтинги, отзывы и поддержка клиентов
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefreshCache}
          disabled={invalidateCacheMutation.isPending}
        >
          {invalidateCacheMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Обновить кэш
        </Button>
      </div>

      {/* CX Summary Card */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Общий показатель CX
              </span>
              {getCxStatusBadge(summary.status)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <p className="text-5xl font-bold text-[hsl(var(--primary))]">
                  {summary.overallScore.toFixed(0)}
                </p>
                <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">CX Score</p>
              </div>
              <div className="text-center">
                <p
                  className="text-3xl font-bold"
                  style={{ color: getNpsStatusColor(summary.npsScore) }}
                >
                  {summary.npsScore}
                </p>
                <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">NPS Score</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{summary.slaComplianceRate.toFixed(1)}%</p>
                <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">SLA Compliance</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{summary.csatScore.toFixed(1)}</p>
                <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">CSAT Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* NPS Section */}
      {nps && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* NPS Score Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Net Promoter Score (NPS)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg bg-[hsl(var(--muted))] p-6 text-center">
                <p
                  className="text-6xl font-bold"
                  style={{ color: getNpsStatusColor(nps.npsScore) }}
                >
                  {nps.npsScore}
                </p>
                <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
                  {formatNumber(nps.totalResponses)} ответов
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg border border-[hsl(var(--border))] p-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <ThumbsUp className="h-4 w-4 text-[hsl(var(--success))]" />
                    <span className="text-lg font-bold text-[hsl(var(--success))]">
                      {formatPercent(nps.promotersPercentage)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                    Промоутеры ({formatNumber(nps.promotersCount)})
                  </p>
                </div>
                <div className="rounded-lg border border-[hsl(var(--border))] p-4 text-center">
                  <span className="text-lg font-bold text-[hsl(var(--muted-foreground))]">
                    {formatPercent(nps.passivesPercentage)}
                  </span>
                  <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                    Пассивные ({formatNumber(nps.passivesCount)})
                  </p>
                </div>
                <div className="rounded-lg border border-[hsl(var(--border))] p-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <ThumbsDown className="h-4 w-4 text-[hsl(var(--destructive))]" />
                    <span className="text-lg font-bold text-[hsl(var(--destructive))]">
                      {formatPercent(nps.detractorsPercentage)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                    Критики ({formatNumber(nps.detractorsCount)})
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* NPS Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Распределение NPS оценок</CardTitle>
            </CardHeader>
            <CardContent>
              {nps.scoreDistribution && (
                <SimpleBarChart
                  data={nps.scoreDistribution.map((d) => ({
                    label: d.score.toString(),
                    value: d.count,
                    color:
                      d.score >= 9
                        ? 'hsl(var(--success))'
                        : d.score >= 7
                          ? 'hsl(var(--warning))'
                          : 'hsl(var(--destructive))',
                  }))}
                  height={200}
                  valueFormatter={(v) => formatNumber(v)}
                />
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Ratings Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Restaurant Ratings */}
        {restaurant && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5" />
                Рейтинг ресторанов
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Star className="h-8 w-8 fill-yellow-400 text-yellow-400" />
                <div>
                  <p className="text-3xl font-bold">{restaurant.averageRating.toFixed(2)}</p>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    {formatNumber(restaurant.ratingCount)} оценок
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Качество еды</span>
                  <span className="font-medium">{restaurant.foodQualityAvg.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Размер порций</span>
                  <span className="font-medium">{restaurant.portionSizeAvg.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Цена/качество</span>
                  <span className="font-medium">{restaurant.valueForMoneyAvg.toFixed(2)}</span>
                </div>
              </div>

              {restaurant.distribution && (
                <div className="space-y-1">
                  {restaurant.distribution.map((item) => (
                    <div key={item.rating} className="flex items-center gap-2 text-sm">
                      <span className="w-4">{item.rating}</span>
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <div className="flex-1">
                        <div className="h-2 w-full rounded-full bg-[hsl(var(--muted))]">
                          <div
                            className="h-full rounded-full bg-yellow-400"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                      <span className="w-12 text-right text-[hsl(var(--muted-foreground))]">
                        {formatPercent(item.percentage)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Courier Ratings */}
        {courier && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bike className="h-5 w-5" />
                Рейтинг курьеров
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Star className="h-8 w-8 fill-yellow-400 text-yellow-400" />
                <div>
                  <p className="text-3xl font-bold">{courier.averageRating.toFixed(2)}</p>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    {formatNumber(courier.ratingCount)} оценок
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Профессионализм</span>
                  <span className="font-medium">{courier.professionalismAvg.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Коммуникация</span>
                  <span className="font-medium">{courier.communicationAvg.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Пунктуальность</span>
                  <span className="font-medium">{courier.timelinessAvg.toFixed(2)}</span>
                </div>
              </div>

              <div className="rounded-lg bg-[hsl(var(--muted))] p-3">
                <div className="flex justify-between text-sm">
                  <span>Средний чаевой</span>
                  <span className="font-medium">{courier.avgTipAmount.toFixed(0)} сум</span>
                </div>
                <div className="mt-1 flex justify-between text-sm">
                  <span>Дают чаевые</span>
                  <span className="font-medium">{formatPercent(courier.tipRate)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* App Store Ratings */}
        {appStore && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Рейтинг в магазинах
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Star className="h-8 w-8 fill-yellow-400 text-yellow-400" />
                <div>
                  <p className="text-3xl font-bold">{appStore.overallAverageRating.toFixed(2)}</p>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    {formatNumber(appStore.totalReviewCount)} отзывов
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-[hsl(var(--border))] p-3 text-center">
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">iOS</p>
                  <p className="text-xl font-bold">
                    {appStore.iosPlatform.averageRating.toFixed(2)}
                  </p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    {formatNumber(appStore.iosPlatform.ratingCount)}
                  </p>
                </div>
                <div className="rounded-lg border border-[hsl(var(--border))] p-3 text-center">
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">Android</p>
                  <p className="text-xl font-bold">
                    {appStore.androidPlatform.averageRating.toFixed(2)}
                  </p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    {formatNumber(appStore.androidPlatform.ratingCount)}
                  </p>
                </div>
              </div>

              {appStore.sentimentSummary && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Анализ отзывов</p>
                  <div className="flex gap-2">
                    <Badge variant="default" className="bg-[hsl(var(--success))]">
                      {formatPercent(
                        (appStore.sentimentSummary.positive /
                          (appStore.sentimentSummary.positive +
                            appStore.sentimentSummary.neutral +
                            appStore.sentimentSummary.negative)) *
                          100
                      )}{' '}
                      позитивных
                    </Badge>
                    <Badge variant="destructive">
                      {formatPercent(
                        (appStore.sentimentSummary.negative /
                          (appStore.sentimentSummary.positive +
                            appStore.sentimentSummary.neutral +
                            appStore.sentimentSummary.negative)) *
                          100
                      )}{' '}
                      негативных
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Support Tickets Section */}
      {support && (
        <>
          {/* Support KPIs */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold">
                    {formatNumber(support.volumeMetrics.totalTickets)}
                  </p>
                  <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">Всего тикетов</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-[hsl(var(--warning))]">
                    {formatNumber(support.volumeMetrics.openTickets)}
                  </p>
                  <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">Открытых</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold">
                    {support.performanceMetrics.avgResolutionTimeHours.toFixed(1)}ч
                  </p>
                  <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                    Среднее время решения
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-[hsl(var(--success))]">
                    {formatPercent(support.slaMetrics.slaComplianceRate)}
                  </p>
                  <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">SLA Compliance</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold">{support.csatMetrics.avgCsatScore.toFixed(1)}</p>
                  <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">CSAT Score</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Ticket Status Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Тикеты по статусу
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-[hsl(var(--warning))]" />
                      <span>Открыты</span>
                    </div>
                    <span className="font-bold">
                      {formatNumber(support.volumeMetrics.openTickets)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-[hsl(var(--primary))]" />
                      <span>В работе</span>
                    </div>
                    <span className="font-bold">
                      {formatNumber(support.volumeMetrics.inProgressTickets)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-[hsl(var(--success))]" />
                      <span>Решены</span>
                    </div>
                    <span className="font-bold">
                      {formatNumber(support.volumeMetrics.resolvedTickets)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-[hsl(var(--muted-foreground))]" />
                      <span>Закрыты</span>
                    </div>
                    <span className="font-bold">
                      {formatNumber(support.volumeMetrics.closedTickets)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ticket Types Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Типы обращений
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleBarChart
                  data={Object.entries(support.volumeMetrics.ticketsByType)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 6)
                    .map(([type, count]) => ({
                      label: type.replace(/_/g, ' '),
                      value: count,
                      color: 'hsl(var(--warning))',
                    }))}
                  height={200}
                  valueFormatter={(v) => formatNumber(v)}
                />
              </CardContent>
            </Card>
          </div>

          {/* SLA Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                SLA Метрики
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-[hsl(var(--border))] p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-[hsl(var(--success))]" />
                    <span className="text-sm text-[hsl(var(--muted-foreground))]">В рамках SLA</span>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-[hsl(var(--success))]">
                    {formatNumber(support.slaMetrics.ticketsWithinSla)}
                  </p>
                </div>
                <div className="rounded-lg border border-[hsl(var(--border))] p-4">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-[hsl(var(--destructive))]" />
                    <span className="text-sm text-[hsl(var(--muted-foreground))]">
                      Нарушили SLA
                    </span>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-[hsl(var(--destructive))]">
                    {formatNumber(support.slaMetrics.ticketsBreachedSla)}
                  </p>
                </div>
                <div className="rounded-lg border border-[hsl(var(--border))] p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-[hsl(var(--warning))]" />
                    <span className="text-sm text-[hsl(var(--muted-foreground))]">
                      Риск нарушения
                    </span>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-[hsl(var(--warning))]">
                    {formatNumber(support.slaMetrics.atRiskOfBreach)}
                  </p>
                </div>
                <div className="rounded-lg border border-[hsl(var(--border))] p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                    <span className="text-sm text-[hsl(var(--muted-foreground))]">SLA цель</span>
                  </div>
                  <p className="mt-2 text-2xl font-bold">{support.slaMetrics.slaHours}ч</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Agent Performance */}
          {support.agentPerformance && support.agentPerformance.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Эффективность агентов
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Агент</TableHead>
                      <TableHead className="text-right">Обработано</TableHead>
                      <TableHead className="text-right">Решено</TableHead>
                      <TableHead className="text-right">Ср. время</TableHead>
                      <TableHead className="text-right">CSAT</TableHead>
                      <TableHead className="text-right">SLA нарушений</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {support.agentPerformance.map((agent) => (
                      <TableRow key={agent.agentId}>
                        <TableCell className="font-medium">
                          {agent.agentName || `Агент #${agent.agentId}`}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatNumber(agent.ticketsHandled)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatNumber(agent.ticketsResolved)} (
                          {formatPercent(agent.resolutionRate)})
                        </TableCell>
                        <TableCell className="text-right">
                          {agent.avgResolutionTimeHours.toFixed(1)}ч
                        </TableCell>
                        <TableCell className="text-right">
                          <StarRating rating={Math.round(agent.csatScore)} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={agent.slaBreaches > 0 ? 'destructive' : 'secondary'}
                          >
                            {agent.slaBreaches}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Top Rated Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Restaurants */}
        {restaurant?.topRatedRestaurants && restaurant.topRatedRestaurants.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5" />
                Лучшие рестораны
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ресторан</TableHead>
                    <TableHead className="text-right">Рейтинг</TableHead>
                    <TableHead className="text-right">Отзывов</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {restaurant.topRatedRestaurants.slice(0, 5).map((r) => (
                    <TableRow key={r.restaurantId}>
                      <TableCell className="font-medium">{r.restaurantName}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{r.averageRating.toFixed(2)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{formatNumber(r.ratingCount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Top Couriers */}
        {courier?.topRatedCouriers && courier.topRatedCouriers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bike className="h-5 w-5" />
                Лучшие курьеры
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Курьер</TableHead>
                    <TableHead className="text-right">Рейтинг</TableHead>
                    <TableHead className="text-right">Оценок</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courier.topRatedCouriers.slice(0, 5).map((c) => (
                    <TableRow key={c.courierId}>
                      <TableCell className="font-medium">{c.courierName}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{c.averageRating.toFixed(2)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{formatNumber(c.ratingCount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* No Data Fallback */}
      {!nps && !restaurant && !courier && !appStore && !support && !summary && (
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
