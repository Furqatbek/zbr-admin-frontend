import { useState } from 'react'
import {
  Headphones,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  RefreshCw,
  Loader2,
  Users,
  MessageSquare,
  Star,
  TrendingUp,
  AlertCircle,
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
import { formatNumber, formatDateTime } from '@/lib/utils'
import { useSupportMetrics, useSupportMetricsFiltered } from '@/hooks/useDashboard'

const statusLabels: Record<string, string> = {
  OPEN: 'Открыт',
  IN_PROGRESS: 'В работе',
  WAITING_CUSTOMER: 'Ожидает клиента',
  RESOLVED: 'Решён',
  CLOSED: 'Закрыт',
  ESCALATED: 'Эскалирован',
}

const statusColors: Record<string, string> = {
  OPEN: 'hsl(var(--warning))',
  IN_PROGRESS: 'hsl(var(--primary))',
  WAITING_CUSTOMER: 'hsl(var(--muted-foreground))',
  RESOLVED: 'hsl(var(--success))',
  CLOSED: 'hsl(var(--muted-foreground))',
  ESCALATED: 'hsl(var(--destructive))',
}

const priorityLabels: Record<string, string> = {
  CRITICAL: 'Критический',
  HIGH: 'Высокий',
  MEDIUM: 'Средний',
  LOW: 'Низкий',
}

const priorityColors: Record<string, string> = {
  CRITICAL: 'hsl(var(--destructive))',
  HIGH: 'hsl(var(--warning))',
  MEDIUM: 'hsl(var(--primary))',
  LOW: 'hsl(var(--muted-foreground))',
}

const categoryLabels: Record<string, string> = {
  COMPLAINT: 'Жалоба',
  REFUND_REQUEST: 'Возврат',
  INQUIRY: 'Запрос',
  FEEDBACK: 'Отзыв',
  DELIVERY: 'Доставка',
  ORDER: 'Заказ',
  PAYMENT: 'Оплата',
  OTHER: 'Другое',
}

export function SupportMetricsPage() {
  const [period, setPeriod] = useState('month')

  const getDateRange = () => {
    const endDate = new Date()
    const startDate = new Date()
    switch (period) {
      case 'day':
        startDate.setDate(endDate.getDate() - 1)
        break
      case 'week':
        startDate.setDate(endDate.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1)
        break
    }
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    }
  }

  const dateRange = getDateRange()
  const { data: metricsData, isLoading, refetch } = useSupportMetricsFiltered(dateRange)
  const { data: generalData } = useSupportMetrics()

  const data = metricsData?.data || generalData?.data

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
          <h1 className="text-2xl font-bold">Метрики поддержки</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Показатели службы поддержки клиентов
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="day">День</option>
            <option value="week">Неделя</option>
            <option value="month">Месяц</option>
          </Select>
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Всего тикетов</p>
                <p className="text-2xl font-bold">{data?.totalTickets ?? 0}</p>
                <p className="mt-1 text-sm text-[hsl(var(--warning))]">
                  {data?.openTickets ?? 0} открытых
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10">
                <MessageSquare className="h-6 w-6 text-[hsl(var(--primary))]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Ср. время решения</p>
                <p className="text-2xl font-bold">
                  {data?.avgResolutionTimeFormatted ?? (data?.avgResolutionTimeMinutes != null ? data.avgResolutionTimeMinutes.toFixed(0) + ' мин' : '—')}
                </p>
                <p className="mt-1 text-sm text-[hsl(var(--success))]">Цель: 30 мин</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--warning))]/10">
                <Clock className="h-6 w-6 text-[hsl(var(--warning))]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Процент решения</p>
                <p className="text-2xl font-bold">{data?.resolutionRate?.toFixed(1) ?? '—'}%</p>
                <p className="mt-1 text-sm text-[hsl(var(--success))]">Цель: 80%</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--success))]/10">
                <CheckCircle className="h-6 w-6 text-[hsl(var(--success))]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Удовлетворённость</p>
                <p className="text-2xl font-bold">{data?.customerSatisfactionScore?.toFixed(1) ?? '—'}</p>
                <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">из 5.0</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--warning))]/10">
                <Star className="h-6 w-6 text-[hsl(var(--warning))]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ticket Categories */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-[hsl(var(--destructive))]">{data?.complaintCount ?? 0}</p>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Жалобы</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-[hsl(var(--warning))]">{data?.refundRequestCount ?? 0}</p>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Запросы на возврат</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-[hsl(var(--primary))]">{data?.inquiryCount ?? 0}</p>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Запросы</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-[hsl(var(--success))]">{data?.feedbackCount ?? 0}</p>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Отзывы</p>
          </CardContent>
        </Card>
      </div>

      {/* Ticket Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Headphones className="h-5 w-5" />
            Статус тикетов
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="rounded-lg bg-[hsl(var(--warning))]/10 p-6 text-center">
              <p className="text-4xl font-bold text-[hsl(var(--warning))]">
                {data?.openTickets ?? 0}
              </p>
              <p className="mt-2 text-[hsl(var(--muted-foreground))]">Открытые</p>
            </div>
            <div className="rounded-lg bg-[hsl(var(--primary))]/10 p-6 text-center">
              <p className="text-4xl font-bold text-[hsl(var(--primary))]">
                {data?.inProgressTickets ?? 0}
              </p>
              <p className="mt-2 text-[hsl(var(--muted-foreground))]">В работе</p>
            </div>
            <div className="rounded-lg bg-[hsl(var(--success))]/10 p-6 text-center">
              <p className="text-4xl font-bold text-[hsl(var(--success))]">
                {data?.resolvedTickets ?? 0}
              </p>
              <p className="mt-2 text-[hsl(var(--muted-foreground))]">Решённые</p>
            </div>
            <div className="rounded-lg bg-[hsl(var(--muted))] p-6 text-center">
              <p className="text-4xl font-bold">
                {data?.closedTickets ?? 0}
              </p>
              <p className="mt-2 text-[hsl(var(--muted-foreground))]">Закрытые</p>
            </div>
            <div className="rounded-lg bg-[hsl(var(--destructive))]/10 p-6 text-center">
              <p className="text-4xl font-bold text-[hsl(var(--destructive))]">
                {data?.escalatedTickets ?? 0}
              </p>
              <p className="mt-2 text-[hsl(var(--muted-foreground))]">Эскалированные</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SLA Metrics */}
      {data?.slaMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              SLA Метрики
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="text-center">
                <p className="text-3xl font-bold">{data.slaMetrics.totalTickets}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Всего тикетов</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-[hsl(var(--success))]">{data.slaMetrics.slaMetTickets}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">В рамках SLA</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-[hsl(var(--destructive))]">{data.slaMetrics.slaBreachedTickets}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Нарушение SLA</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{data.slaMetrics.slaComplianceRate?.toFixed(1)}%</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Соблюдение SLA</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Status Breakdown */}
        {data?.statusBreakdown && Object.keys(data.statusBreakdown).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                По статусам
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleBarChart
                data={Object.entries(data.statusBreakdown).map(([status, count]) => ({
                  label: statusLabels[status] || status,
                  value: count,
                  color: statusColors[status] || 'hsl(var(--primary))',
                }))}
                height={250}
                valueFormatter={(v) => formatNumber(v)}
              />
            </CardContent>
          </Card>
        )}

        {/* Priority Breakdown */}
        {data?.priorityBreakdown && Object.keys(data.priorityBreakdown).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                По приоритету
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleBarChart
                data={Object.entries(data.priorityBreakdown).map(([priority, count]) => ({
                  label: priorityLabels[priority] || priority,
                  value: count,
                  color: priorityColors[priority] || 'hsl(var(--primary))',
                }))}
                height={250}
                valueFormatter={(v) => formatNumber(v)}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Common Issues */}
      {data?.commonIssues && data.commonIssues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Частые проблемы
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Категория</TableHead>
                  <TableHead>Подкатегория</TableHead>
                  <TableHead>Количество</TableHead>
                  <TableHead>Процент</TableHead>
                  <TableHead>Ср. время решения</TableHead>
                  <TableHead>Тренд</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.commonIssues.map((issue, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{categoryLabels[issue.category] || issue.category}</TableCell>
                    <TableCell>{issue.subcategory}</TableCell>
                    <TableCell>{issue.count}</TableCell>
                    <TableCell>{issue.percentage?.toFixed(1)}%</TableCell>
                    <TableCell>{issue.avgResolutionTimeMinutes?.toFixed(0)} мин</TableCell>
                    <TableCell>
                      <Badge variant={issue.trend === 'UP' ? 'destructive' : issue.trend === 'DOWN' ? 'success' : 'secondary'}>
                        {issue.trend === 'UP' ? '↑' : issue.trend === 'DOWN' ? '↓' : '→'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Agent Performance */}
      {data?.agentPerformance && data.agentPerformance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Производительность агентов
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Агент</TableHead>
                  <TableHead>Обработано</TableHead>
                  <TableHead>Решено</TableHead>
                  <TableHead>% Решения</TableHead>
                  <TableHead>Ср. время</TableHead>
                  <TableHead>Удовлетв.</TableHead>
                  <TableHead>Балл</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.agentPerformance
                  .sort((a, b) => b.performanceScore - a.performanceScore)
                  .map((agent) => (
                    <TableRow key={agent.agentId}>
                      <TableCell className="font-medium">{agent.agentName}</TableCell>
                      <TableCell>{agent.ticketsHandled}</TableCell>
                      <TableCell>{agent.ticketsResolved}</TableCell>
                      <TableCell>{agent.resolutionRate?.toFixed(0)}%</TableCell>
                      <TableCell>{agent.avgResolutionTimeMinutes?.toFixed(0)} мин</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-[hsl(var(--warning))]" />
                          {agent.avgSatisfactionScore?.toFixed(1)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={agent.performanceScore >= 80 ? 'success' : agent.performanceScore >= 60 ? 'warning' : 'destructive'}>
                          {agent.performanceScore?.toFixed(0)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Recent Tickets */}
      {data?.tickets && data.tickets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Последние тикеты
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>№ Тикета</TableHead>
                  <TableHead>Клиент</TableHead>
                  <TableHead>Категория</TableHead>
                  <TableHead>Приоритет</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Агент</TableHead>
                  <TableHead>Ожидание</TableHead>
                  <TableHead>SLA</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.tickets.slice(0, 10).map((ticket) => (
                  <TableRow key={ticket.ticketId}>
                    <TableCell className="font-medium">{ticket.ticketNumber}</TableCell>
                    <TableCell>{ticket.customerName}</TableCell>
                    <TableCell>{categoryLabels[ticket.category] || ticket.category}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        style={{
                          borderColor: priorityColors[ticket.priority],
                          color: priorityColors[ticket.priority],
                        }}
                      >
                        {priorityLabels[ticket.priority] || ticket.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        style={{
                          borderColor: statusColors[ticket.status],
                          color: statusColors[ticket.status],
                        }}
                      >
                        {statusLabels[ticket.status] || ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{ticket.assignedAgentName || '—'}</TableCell>
                    <TableCell>{ticket.waitTimeFormatted || `${ticket.waitTimeMinutes} мин`}</TableCell>
                    <TableCell>
                      {ticket.slaBreached ? (
                        <Badge variant="destructive">Нарушен</Badge>
                      ) : (
                        <Badge variant="success">Норма</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Generated timestamp */}
      {data?.generatedAt && (
        <p className="text-xs text-[hsl(var(--muted-foreground))] text-center">
          Данные обновлены: {formatDateTime(data.generatedAt)}
        </p>
      )}
    </div>
  )
}
