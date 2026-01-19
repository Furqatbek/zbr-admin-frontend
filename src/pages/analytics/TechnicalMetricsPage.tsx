import { useState } from 'react'
import {
  Server,
  Activity,
  Zap,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Wifi,
  RefreshCw,
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
import { SimpleLineChart, SimpleBarChart } from '@/components/charts'
import { formatNumber } from '@/lib/utils'

// Mock data
const mockTechnicalData = {
  apiResponseTime: 145, // ms
  errorRate: 0.8, // percentage
  uptime: 99.95, // percentage
  activeUsers: 1234,
  requestsPerMinute: 4567,
  serverLoad: 42, // percentage
  responseTimeHistory: [
    { timestamp: '12:00', responseTime: 142 },
    { timestamp: '12:05', responseTime: 156 },
    { timestamp: '12:10', responseTime: 138 },
    { timestamp: '12:15', responseTime: 162 },
    { timestamp: '12:20', responseTime: 145 },
    { timestamp: '12:25', responseTime: 151 },
    { timestamp: '12:30', responseTime: 148 },
    { timestamp: '12:35', responseTime: 139 },
    { timestamp: '12:40', responseTime: 144 },
    { timestamp: '12:45', responseTime: 152 },
    { timestamp: '12:50', responseTime: 146 },
    { timestamp: '12:55', responseTime: 145 },
  ],
  errorsByType: [
    { type: '500 Server Error', count: 23 },
    { type: '503 Service Unavailable', count: 8 },
    { type: '504 Gateway Timeout', count: 12 },
    { type: '400 Bad Request', count: 45 },
    { type: '401 Unauthorized', count: 156 },
    { type: '404 Not Found', count: 89 },
  ],
  systemHealth: {
    api: 'healthy' as const,
    database: 'healthy' as const,
    cache: 'healthy' as const,
    websocket: 'degraded' as const,
  },
  endpointPerformance: [
    { endpoint: '/api/orders', avgTime: 89, calls: 12500 },
    { endpoint: '/api/restaurants', avgTime: 45, calls: 8900 },
    { endpoint: '/api/users', avgTime: 62, calls: 5600 },
    { endpoint: '/api/couriers', avgTime: 78, calls: 4200 },
    { endpoint: '/api/auth', avgTime: 120, calls: 3400 },
  ],
}

const healthColors = {
  healthy: 'success',
  degraded: 'warning',
  down: 'destructive',
} as const

const healthLabels = {
  healthy: 'Работает',
  degraded: 'Замедлен',
  down: 'Недоступен',
}

const healthIcons = {
  api: Server,
  database: Database,
  cache: Zap,
  websocket: Wifi,
}

const serviceLabels = {
  api: 'API Сервер',
  database: 'База данных',
  cache: 'Кэш (Redis)',
  websocket: 'WebSocket',
}

export function TechnicalMetricsPage() {
  const [period, setPeriod] = useState('hour')
  const data = mockTechnicalData

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Технические метрики</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Мониторинг производительности системы
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Обновить
          </Button>
          <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="hour">Час</option>
            <option value="day">День</option>
            <option value="week">Неделя</option>
          </Select>
        </div>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Состояние системы
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {(Object.keys(data.systemHealth) as Array<keyof typeof data.systemHealth>).map((service) => {
              const status = data.systemHealth[service]
              const Icon = healthIcons[service]
              return (
                <div
                  key={service}
                  className={`flex items-center gap-3 rounded-lg border p-4 ${
                    status === 'healthy'
                      ? 'border-[hsl(var(--success))]/30 bg-[hsl(var(--success))]/5'
                      : status === 'degraded'
                      ? 'border-[hsl(var(--warning))]/30 bg-[hsl(var(--warning))]/5'
                      : 'border-[hsl(var(--destructive))]/30 bg-[hsl(var(--destructive))]/5'
                  }`}
                >
                  <Icon
                    className={`h-6 w-6 ${
                      status === 'healthy'
                        ? 'text-[hsl(var(--success))]'
                        : status === 'degraded'
                        ? 'text-[hsl(var(--warning))]'
                        : 'text-[hsl(var(--destructive))]'
                    }`}
                  />
                  <div>
                    <p className="font-medium">{serviceLabels[service]}</p>
                    <Badge variant={healthColors[status]}>{healthLabels[status]}</Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Clock className="mx-auto h-6 w-6 text-[hsl(var(--primary))]" />
              <p className="mt-2 text-2xl font-bold">{data.apiResponseTime} мс</p>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Время ответа</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle
                className={`mx-auto h-6 w-6 ${
                  data.errorRate > 2
                    ? 'text-[hsl(var(--destructive))]'
                    : 'text-[hsl(var(--success))]'
                }`}
              />
              <p className="mt-2 text-2xl font-bold">{data.errorRate}%</p>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Ошибки</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="mx-auto h-6 w-6 text-[hsl(var(--success))]" />
              <p className="mt-2 text-2xl font-bold">{data.uptime}%</p>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Uptime</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="mx-auto h-6 w-6 text-[hsl(var(--primary))]" />
              <p className="mt-2 text-2xl font-bold">{formatNumber(data.activeUsers)}</p>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Пользователи</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Zap className="mx-auto h-6 w-6 text-[hsl(var(--warning))]" />
              <p className="mt-2 text-2xl font-bold">{formatNumber(data.requestsPerMinute)}</p>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Запросов/мин</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Server
                className={`mx-auto h-6 w-6 ${
                  data.serverLoad > 80
                    ? 'text-[hsl(var(--destructive))]'
                    : data.serverLoad > 60
                    ? 'text-[hsl(var(--warning))]'
                    : 'text-[hsl(var(--success))]'
                }`}
              />
              <p className="mt-2 text-2xl font-bold">{data.serverLoad}%</p>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Нагрузка</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Response Time History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Время ответа API
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleLineChart
              data={data.responseTimeHistory.map((d) => ({
                label: d.timestamp,
                value: d.responseTime,
              }))}
              height={250}
              color="hsl(var(--primary))"
            />
          </CardContent>
        </Card>

        {/* Errors by Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Ошибки по типам
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart
              data={data.errorsByType.map((e) => ({
                label: e.type.split(' ')[0],
                value: e.count,
                color: e.type.startsWith('5') ? 'hsl(var(--destructive))' : 'hsl(var(--warning))',
              }))}
              height={250}
              valueFormatter={(v) => formatNumber(v)}
            />
          </CardContent>
        </Card>
      </div>

      {/* Endpoint Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Производительность эндпоинтов
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.endpointPerformance.map((endpoint) => (
              <div key={endpoint.endpoint} className="flex items-center gap-4">
                <div className="w-40 font-mono text-sm">{endpoint.endpoint}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="h-2 w-full rounded-full bg-[hsl(var(--muted))]">
                        <div
                          className={`h-full rounded-full ${
                            endpoint.avgTime > 100
                              ? 'bg-[hsl(var(--warning))]'
                              : 'bg-[hsl(var(--success))]'
                          }`}
                          style={{ width: `${Math.min((endpoint.avgTime / 200) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    <span
                      className={`w-16 text-right text-sm font-medium ${
                        endpoint.avgTime > 100
                          ? 'text-[hsl(var(--warning))]'
                          : 'text-[hsl(var(--success))]'
                      }`}
                    >
                      {endpoint.avgTime} мс
                    </span>
                    <span className="w-24 text-right text-sm text-[hsl(var(--muted-foreground))]">
                      {formatNumber(endpoint.calls)} вызовов
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Server Load Indicator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Нагрузка на сервер
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative h-32 w-32">
              <svg className="h-32 w-32 -rotate-90 transform">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="hsl(var(--muted))"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke={
                    data.serverLoad > 80
                      ? 'hsl(var(--destructive))'
                      : data.serverLoad > 60
                      ? 'hsl(var(--warning))'
                      : 'hsl(var(--success))'
                  }
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${(data.serverLoad / 100) * 352} 352`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold">{data.serverLoad}%</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="font-medium">Текущая нагрузка</p>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                {data.serverLoad > 80
                  ? 'Критическая нагрузка. Рекомендуется масштабирование.'
                  : data.serverLoad > 60
                  ? 'Повышенная нагрузка. Мониторинг рекомендуется.'
                  : 'Нормальная нагрузка. Система работает стабильно.'}
              </p>
              <Badge
                variant={
                  data.serverLoad > 80
                    ? 'destructive'
                    : data.serverLoad > 60
                    ? 'warning'
                    : 'success'
                }
              >
                {data.serverLoad > 80 ? 'Критический' : data.serverLoad > 60 ? 'Умеренный' : 'Норма'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
