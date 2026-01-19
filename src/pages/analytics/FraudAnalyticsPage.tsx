import { useState } from 'react'
import {
  Shield,
  AlertTriangle,
  UserX,
  CreditCard,
  DollarSign,
  Calendar,
  AlertCircle,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Button,
} from '@/components/ui'
import { SimpleBarChart } from '@/components/charts'
import { formatNumber, formatCurrency, formatDateTime } from '@/lib/utils'

// Mock data
const mockFraudData = {
  suspiciousOrders: 23,
  flaggedAccounts: 8,
  chargebacks: 12,
  fraudPreventedAmount: 856000,
  riskScore: 15, // percentage
  alertsByType: [
    { type: 'Подозрительный платёж', count: 45, severity: 'high' as const },
    { type: 'Множественные аккаунты', count: 23, severity: 'medium' as const },
    { type: 'Нетипичная активность', count: 67, severity: 'low' as const },
    { type: 'Фейковые отзывы', count: 12, severity: 'medium' as const },
    { type: 'Злоупотребление промо', count: 34, severity: 'low' as const },
  ],
  recentAlerts: [
    {
      id: 1,
      type: 'Подозрительный платёж',
      description: 'Несколько неудачных попыток оплаты с разных карт',
      createdAt: '2024-01-14T15:30:00Z',
      severity: 'high' as const,
      status: 'open',
    },
    {
      id: 2,
      type: 'Множественные аккаунты',
      description: 'Обнаружено 3 аккаунта с одного устройства',
      createdAt: '2024-01-14T14:15:00Z',
      severity: 'medium' as const,
      status: 'investigating',
    },
    {
      id: 3,
      type: 'Злоупотребление промо',
      description: 'Повторное использование промокода с разных аккаунтов',
      createdAt: '2024-01-14T12:45:00Z',
      severity: 'low' as const,
      status: 'resolved',
    },
    {
      id: 4,
      type: 'Нетипичная активность',
      description: 'Резкий рост заказов с нового аккаунта',
      createdAt: '2024-01-14T11:20:00Z',
      severity: 'medium' as const,
      status: 'open',
    },
    {
      id: 5,
      type: 'Фейковые отзывы',
      description: 'Подозрительные положительные отзывы на новый ресторан',
      createdAt: '2024-01-14T10:00:00Z',
      severity: 'low' as const,
      status: 'resolved',
    },
  ],
}

const severityColors = {
  low: 'warning',
  medium: 'default',
  high: 'destructive',
} as const

const severityLabels = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
}

const statusLabels = {
  open: 'Открыт',
  investigating: 'Расследуется',
  resolved: 'Решён',
}

const statusColors = {
  open: 'destructive',
  investigating: 'warning',
  resolved: 'success',
} as const

export function FraudAnalyticsPage() {
  const [period, setPeriod] = useState('month')
  const data = mockFraudData

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Безопасность и фрод</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Мониторинг подозрительной активности
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="week">Неделя</option>
            <option value="month">Месяц</option>
            <option value="quarter">Квартал</option>
          </Select>
        </div>
      </div>

      {/* Risk Score Banner */}
      <Card className={data.riskScore > 25 ? 'border-[hsl(var(--destructive))]' : ''}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-full ${
                  data.riskScore > 25
                    ? 'bg-[hsl(var(--destructive))]/10'
                    : data.riskScore > 15
                    ? 'bg-[hsl(var(--warning))]/10'
                    : 'bg-[hsl(var(--success))]/10'
                }`}
              >
                <Shield
                  className={`h-8 w-8 ${
                    data.riskScore > 25
                      ? 'text-[hsl(var(--destructive))]'
                      : data.riskScore > 15
                      ? 'text-[hsl(var(--warning))]'
                      : 'text-[hsl(var(--success))]'
                  }`}
                />
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Общий уровень риска</p>
                <p className="text-3xl font-bold">{data.riskScore}%</p>
              </div>
            </div>
            <Badge
              variant={
                data.riskScore > 25 ? 'destructive' : data.riskScore > 15 ? 'warning' : 'success'
              }
              className="px-4 py-2"
            >
              {data.riskScore > 25 ? 'Высокий' : data.riskScore > 15 ? 'Умеренный' : 'Низкий'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Подозрительные заказы</p>
                <p className="text-2xl font-bold">{data.suspiciousOrders}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--warning))]/10">
                <AlertTriangle className="h-6 w-6 text-[hsl(var(--warning))]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Заблокированные аккаунты</p>
                <p className="text-2xl font-bold">{data.flaggedAccounts}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--destructive))]/10">
                <UserX className="h-6 w-6 text-[hsl(var(--destructive))]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Chargebacks</p>
                <p className="text-2xl font-bold">{data.chargebacks}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--destructive))]/10">
                <CreditCard className="h-6 w-6 text-[hsl(var(--destructive))]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Предотвращено</p>
                <p className="text-2xl font-bold text-[hsl(var(--success))]">
                  {formatCurrency(data.fraudPreventedAmount)}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--success))]/10">
                <DollarSign className="h-6 w-6 text-[hsl(var(--success))]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Alerts by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Оповещения по типам</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart
              data={data.alertsByType.map((a) => ({
                label: a.type,
                value: a.count,
                color:
                  a.severity === 'high'
                    ? 'hsl(var(--destructive))'
                    : a.severity === 'medium'
                    ? 'hsl(var(--warning))'
                    : 'hsl(var(--muted-foreground))',
              }))}
              height={250}
              valueFormatter={(v) => formatNumber(v)}
            />
          </CardContent>
        </Card>

        {/* Severity Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Распределение по серьёзности</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(['high', 'medium', 'low'] as const).map((severity) => {
                const total = data.alertsByType.reduce((sum, a) => sum + a.count, 0)
                const count = data.alertsByType
                  .filter((a) => a.severity === severity)
                  .reduce((sum, a) => sum + a.count, 0)
                const percentage = (count / total) * 100

                return (
                  <div key={severity} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <AlertCircle
                          className={`h-4 w-4 ${
                            severity === 'high'
                              ? 'text-[hsl(var(--destructive))]'
                              : severity === 'medium'
                              ? 'text-[hsl(var(--warning))]'
                              : 'text-[hsl(var(--muted-foreground))]'
                          }`}
                        />
                        <span>{severityLabels[severity]} риск</span>
                      </div>
                      <span className="font-medium">{count} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[hsl(var(--muted))]">
                      <div
                        className={`h-full rounded-full ${
                          severity === 'high'
                            ? 'bg-[hsl(var(--destructive))]'
                            : severity === 'medium'
                            ? 'bg-[hsl(var(--warning))]'
                            : 'bg-[hsl(var(--muted-foreground))]'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Последние оповещения
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Тип</TableHead>
                <TableHead>Описание</TableHead>
                <TableHead>Серьёзность</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Время</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recentAlerts.map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell className="font-medium">{alert.type}</TableCell>
                  <TableCell className="max-w-xs truncate">{alert.description}</TableCell>
                  <TableCell>
                    <Badge variant={severityColors[alert.severity]}>
                      {severityLabels[alert.severity]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColors[alert.status as keyof typeof statusColors]}>
                      {statusLabels[alert.status as keyof typeof statusLabels]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-[hsl(var(--muted-foreground))]">
                    {formatDateTime(alert.createdAt)}
                  </TableCell>
                  <TableCell>
                    {alert.status !== 'resolved' && (
                      <Button variant="ghost" size="sm">
                        Расследовать
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
