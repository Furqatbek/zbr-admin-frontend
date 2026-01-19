import { useState } from 'react'
import {
  Users,
  UserPlus,
  UserMinus,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Clock,
  Gift,
  Calendar,
  RefreshCw,
  Loader2,
  ArrowRight,
  AlertTriangle,
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
import { formatNumber, formatPercent, formatDateTime } from '@/lib/utils'
import {
  useActivityMetrics,
  useConversionMetrics,
  useActivationMetrics,
  useChurnMetrics,
  useRefreshAnalyticsCache,
} from '@/hooks/useAnalytics'

export function UserAnalyticsPage() {
  const [conversionDays, setConversionDays] = useState(7)

  const { data: activityData, isLoading: activityLoading, refetch: refetchActivity } = useActivityMetrics()
  const { data: conversionData, isLoading: conversionLoading, refetch: refetchConversion } = useConversionMetrics(conversionDays)
  const { data: activationData, isLoading: activationLoading, refetch: refetchActivation } = useActivationMetrics()
  const { data: churnData, isLoading: churnLoading, refetch: refetchChurn } = useChurnMetrics()

  const refreshCacheMutation = useRefreshAnalyticsCache()

  const isLoading = activityLoading || conversionLoading || activationLoading || churnLoading

  const handleRefresh = () => {
    refetchActivity()
    refetchConversion()
    refetchActivation()
    refetchChurn()
  }

  const handleForceRefresh = () => {
    refreshCacheMutation.mutate()
  }

  const activity = activityData?.data
  const conversion = conversionData?.data
  const activation = activationData?.data
  const churn = churnData?.data

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
          <h1 className="text-2xl font-bold">Аналитика пользователей</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Активность, конверсия, активация и отток
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

      {/* DAU/WAU/MAU Cards */}
      {activity && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">DAU (сегодня)</p>
                    <p className="text-3xl font-bold">{formatNumber(activity.dailyActiveUsers)}</p>
                    <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                      +{formatNumber(activity.newUsersToday)} новых
                    </p>
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--primary))]/10">
                    <Users className="h-7 w-7 text-[hsl(var(--primary))]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">WAU (неделя)</p>
                    <p className="text-3xl font-bold">{formatNumber(activity.weeklyActiveUsers)}</p>
                    <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                      +{formatNumber(activity.newUsersThisWeek)} новых
                    </p>
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--success))]/10">
                    <Activity className="h-7 w-7 text-[hsl(var(--success))]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">MAU (месяц)</p>
                    <p className="text-3xl font-bold">{formatNumber(activity.monthlyActiveUsers)}</p>
                    <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                      +{formatNumber(activity.newUsersThisMonth)} новых
                    </p>
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--warning))]/10">
                    <UserPlus className="h-7 w-7 text-[hsl(var(--warning))]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stickiness Ratios */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Показатели вовлечённости (Stickiness)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="text-center">
                  <p className="text-4xl font-bold text-[hsl(var(--primary))]">
                    {formatPercent(activity.dauMauRatio * 100)}
                  </p>
                  <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">DAU/MAU Ratio</p>
                  <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                    {activity.dauMauRatio >= 0.2 ? 'Отличный показатель' : activity.dauMauRatio >= 0.1 ? 'Хороший показатель' : 'Требует улучшения'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-[hsl(var(--success))]">
                    {formatPercent(activity.dauWauRatio * 100)}
                  </p>
                  <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">DAU/WAU Ratio</p>
                  <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                    Еженедельная активность
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-[hsl(var(--warning))]">
                    {formatPercent(activity.wauMauRatio * 100)}
                  </p>
                  <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">WAU/MAU Ratio</p>
                  <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                    Ежемесячная активность
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Conversion Funnel */}
      {conversion && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Воронка конверсии
              </CardTitle>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                <Select
                  value={conversionDays.toString()}
                  onChange={(e) => setConversionDays(parseInt(e.target.value))}
                  className="w-32"
                >
                  <option value="7">7 дней</option>
                  <option value="14">14 дней</option>
                  <option value="30">30 дней</option>
                  <option value="90">90 дней</option>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Overall Conversion Rate */}
            <div className="mb-6 rounded-lg bg-[hsl(var(--muted))] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">Общая конверсия</p>
                  <p className="text-3xl font-bold text-[hsl(var(--primary))]">
                    {formatPercent(conversion.overallConversionRate)}
                  </p>
                </div>
                <div className="text-right text-sm text-[hsl(var(--muted-foreground))]">
                  {formatNumber(conversion.paymentCompletedEvents)} из {formatNumber(conversion.restaurantViews)} просмотров
                </div>
              </div>
            </div>

            {/* Funnel Steps */}
            <div className="space-y-4">
              {conversion.funnelSteps.map((step, index) => (
                <div key={step.stepNumber} className="flex items-center gap-4">
                  <div className="w-8 text-center">
                    <Badge variant={index === 0 ? 'default' : 'secondary'}>{step.stepNumber}</Badge>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{step.stepName}</span>
                      <span className="text-sm text-[hsl(var(--muted-foreground))]">
                        {formatNumber(step.count)}
                      </span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-[hsl(var(--muted))]">
                      <div
                        className="h-full rounded-full bg-[hsl(var(--primary))]"
                        style={{
                          width: `${(step.count / conversion.restaurantViews) * 100}%`,
                        }}
                      />
                    </div>
                    {index > 0 && (
                      <div className="mt-1 flex items-center gap-2 text-xs">
                        <span className={step.conversionFromPrevious >= 50 ? 'text-[hsl(var(--success))]' : 'text-[hsl(var(--warning))]'}>
                          Конверсия: {formatPercent(step.conversionFromPrevious)}
                        </span>
                        <span className="text-[hsl(var(--destructive))]">
                          Отток: {formatPercent(step.dropOffFromPrevious)}
                        </span>
                      </div>
                    )}
                  </div>
                  {index < conversion.funnelSteps.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                  )}
                </div>
              ))}
            </div>

            {/* Step-by-step conversion rates */}
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-[hsl(var(--border))] p-4 text-center">
                <p className="text-2xl font-bold">{formatPercent(conversion.viewToCartRate)}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Просмотр → Корзина</p>
              </div>
              <div className="rounded-lg border border-[hsl(var(--border))] p-4 text-center">
                <p className="text-2xl font-bold">{formatPercent(conversion.cartToCheckoutRate)}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Корзина → Оформление</p>
              </div>
              <div className="rounded-lg border border-[hsl(var(--border))] p-4 text-center">
                <p className="text-2xl font-bold">{formatPercent(conversion.checkoutToPaymentRate)}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Оформление → Оплата</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Activation Metrics */}
        {activation && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Активация пользователей
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-[hsl(var(--success))]/10 p-4 text-center">
                  <p className="text-3xl font-bold text-[hsl(var(--success))]">
                    {formatPercent(activation.activationRate)}
                  </p>
                  <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">Процент активации</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    {formatNumber(activation.newUsersActivated)} из {formatNumber(activation.totalNewUsers)}
                  </p>
                </div>
                <div className="rounded-lg bg-[hsl(var(--primary))]/10 p-4 text-center">
                  <p className="text-3xl font-bold text-[hsl(var(--primary))]">
                    {activation.avgActivationTimeHours.toFixed(1)}ч
                  </p>
                  <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">Среднее время активации</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    Медиана: {activation.medianActivationTimeHours.toFixed(1)}ч
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Первые доставки сегодня</span>
                  <span className="font-medium">{formatNumber(activation.firstDeliveryCount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4 text-[hsl(var(--warning))]" />
                    <span className="text-sm">Использование рефералов</span>
                  </div>
                  <span className="font-medium">{formatPercent(activation.referralUsageRate)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Churn Metrics */}
        {churn && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserMinus className="h-5 w-5" />
                Показатели оттока
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* User Churn */}
              <div className="rounded-lg border border-[hsl(var(--border))] p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                    <span className="font-medium">Пользователи</span>
                  </div>
                  <Badge variant={churn.userChurnRate > 20 ? 'destructive' : churn.userChurnRate > 10 ? 'warning' : 'success'}>
                    {formatPercent(churn.userChurnRate)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-[hsl(var(--muted-foreground))]">
                  <span>{formatNumber(churn.userChurnCount)} ушло</span>
                  <span>{formatNumber(churn.activeUsersCount)} активных</span>
                </div>
                <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                  Период: {churn.userChurnPeriodDays} дней
                </p>
              </div>

              {/* Restaurant Churn */}
              <div className="rounded-lg border border-[hsl(var(--border))] p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                    <span className="font-medium">Рестораны</span>
                  </div>
                  <Badge variant={churn.restaurantChurnRate > 15 ? 'destructive' : churn.restaurantChurnRate > 5 ? 'warning' : 'success'}>
                    {formatPercent(churn.restaurantChurnRate)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-[hsl(var(--muted-foreground))]">
                  <span>{formatNumber(churn.restaurantChurnCount)} неактивных</span>
                  <span>{formatNumber(churn.activeRestaurantsCount)} активных</span>
                </div>
                <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                  Период: {churn.restaurantChurnPeriodDays} дней
                </p>
              </div>

              {/* Courier Churn */}
              <div className="rounded-lg border border-[hsl(var(--border))] p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                    <span className="font-medium">Курьеры</span>
                  </div>
                  <Badge variant={churn.courierChurnRate > 25 ? 'destructive' : churn.courierChurnRate > 15 ? 'warning' : 'success'}>
                    {formatPercent(churn.courierChurnRate)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-[hsl(var(--muted-foreground))]">
                  <span>{formatNumber(churn.courierChurnCount)} неактивных</span>
                  <span>{formatNumber(churn.activeCouriersCount)} активных</span>
                </div>
                <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                  Период: {churn.courierChurnPeriodDays} дней
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Generated timestamps */}
      <div className="flex flex-col gap-1 text-xs text-[hsl(var(--muted-foreground))] text-center">
        {activity?.calculatedAt && (
          <p>Активность обновлена: {formatDateTime(activity.calculatedAt)}</p>
        )}
        {conversion?.calculatedAt && (
          <p>Конверсия обновлена: {formatDateTime(conversion.calculatedAt)}</p>
        )}
        {activation?.calculatedAt && (
          <p>Активация обновлена: {formatDateTime(activation.calculatedAt)}</p>
        )}
        {churn?.calculatedAt && (
          <p>Отток обновлён: {formatDateTime(churn.calculatedAt)}</p>
        )}
      </div>
    </div>
  )
}
