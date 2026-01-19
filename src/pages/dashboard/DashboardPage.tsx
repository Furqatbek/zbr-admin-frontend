import {
  Package,
  DollarSign,
  Users,
  UtensilsCrossed,
  Bike,
  Clock,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui'
import { formatCurrency, formatNumber } from '@/lib/utils'

// Mock data - will be replaced with API calls
const mockOverview = {
  totalOrders: 15420,
  totalRevenue: 458750.00,
  activeUsers: 3250,
  activeRestaurants: 128,
  activeCouriers: 45,
  pendingApprovals: 12,
}

const mockStuckOrders = [
  { id: 1001, restaurantName: 'Пицца Хат', status: 'PREPARING', stuckMinutes: 45, createdAt: '2024-01-15T10:30:00Z' },
  { id: 1002, restaurantName: 'Суши Мастер', status: 'READY_FOR_PICKUP', stuckMinutes: 35, createdAt: '2024-01-15T10:45:00Z' },
  { id: 1003, restaurantName: 'Бургер Кинг', status: 'CONFIRMED', stuckMinutes: 50, createdAt: '2024-01-15T10:20:00Z' },
]

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: { value: number; isPositive: boolean }
  description?: string
}

function StatCard({ title, value, icon, trend, description }: StatCardProps) {
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
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 flex items-center gap-1">
            <TrendingUp
              className={`h-3 w-3 ${trend.isPositive ? 'text-[hsl(var(--success))]' : 'text-[hsl(var(--destructive))] rotate-180'}`}
            />
            <span className={trend.isPositive ? 'text-[hsl(var(--success))]' : 'text-[hsl(var(--destructive))]'}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
            <span>за последние 7 дней</span>
          </p>
        )}
        {description && (
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}

export function DashboardPage() {
  const statusLabels: Record<string, string> = {
    PENDING: 'Ожидает',
    CONFIRMED: 'Подтверждён',
    PREPARING: 'Готовится',
    READY_FOR_PICKUP: 'Готов к выдаче',
    PICKED_UP: 'Забран',
    DELIVERING: 'Доставляется',
    DELIVERED: 'Доставлен',
    CANCELLED: 'Отменён',
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold">Главная</h1>
        <p className="text-[hsl(var(--muted-foreground))]">
          Обзор ключевых показателей платформы
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Всего заказов"
          value={formatNumber(mockOverview.totalOrders)}
          icon={<Package className="h-4 w-4" />}
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatCard
          title="Общая выручка"
          value={formatCurrency(mockOverview.totalRevenue)}
          icon={<DollarSign className="h-4 w-4" />}
          trend={{ value: 8.2, isPositive: true }}
        />
        <StatCard
          title="Активные пользователи"
          value={formatNumber(mockOverview.activeUsers)}
          icon={<Users className="h-4 w-4" />}
          trend={{ value: 5.1, isPositive: true }}
        />
        <StatCard
          title="Рестораны"
          value={formatNumber(mockOverview.activeRestaurants)}
          icon={<UtensilsCrossed className="h-4 w-4" />}
          trend={{ value: 2.3, isPositive: true }}
        />
        <StatCard
          title="Активные курьеры"
          value={formatNumber(mockOverview.activeCouriers)}
          icon={<Bike className="h-4 w-4" />}
          description="Онлайн сейчас"
        />
        <StatCard
          title="Ожидают одобрения"
          value={formatNumber(mockOverview.pendingApprovals)}
          icon={<Clock className="h-4 w-4" />}
          description="Заявки на рассмотрении"
        />
      </div>

      {/* Stuck orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-[hsl(var(--warning))]" />
            <CardTitle>Застрявшие заказы</CardTitle>
          </div>
          <Badge variant="warning">{mockStuckOrders.length} заказов</Badge>
        </CardHeader>
        <CardContent>
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
                    Время ожидания
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockStuckOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] cursor-pointer"
                  >
                    <td className="py-3 px-4 text-sm font-medium">#{order.id}</td>
                    <td className="py-3 px-4 text-sm">{order.restaurantName}</td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary">{statusLabels[order.status] || order.status}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-[hsl(var(--destructive))] font-medium">
                        {order.stuckMinutes} мин
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Placeholder for charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Выручка за неделю</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-[hsl(var(--muted-foreground))]">
              График выручки будет здесь
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Пиковые часы</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-[hsl(var(--muted-foreground))]">
              Тепловая карта пиковых часов будет здесь
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
