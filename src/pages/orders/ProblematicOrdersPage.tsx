import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  Clock,
  RefreshCw,
  Eye,
  Phone,
  MessageSquare,
  CheckCircle,
  Filter,
  Timer,
  Store,
  Truck,
  User,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Select,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Modal,
  ModalFooter,
  Textarea,
  Label,
} from '@/components/ui'
import { formatDateTime, formatCurrency } from '@/lib/utils'

// Mock data
const mockProblematicOrders = [
  {
    id: 1089,
    problem: 'STUCK' as const,
    problemLabel: 'Застрявший заказ',
    status: 'PREPARING',
    statusLabel: 'Готовится',
    stuckMinutes: 45,
    customer: { name: 'Анна Смирнова', phone: '+7 (999) 111-22-33' },
    restaurant: { id: 1, name: 'Пицца Хат' },
    courier: null,
    total: 1850,
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 1085,
    problem: 'DELAYED' as const,
    problemLabel: 'Задержка доставки',
    status: 'DELIVERING',
    statusLabel: 'Доставляется',
    stuckMinutes: 25,
    customer: { name: 'Петр Иванов', phone: '+7 (999) 222-33-44' },
    restaurant: { id: 2, name: 'Суши Мастер' },
    courier: { id: 5, name: 'Дмитрий Сидоров', phone: '+7 (999) 345-67-89' },
    total: 2340,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 1078,
    problem: 'NO_COURIER' as const,
    problemLabel: 'Нет курьера',
    status: 'READY',
    statusLabel: 'Готов',
    stuckMinutes: 15,
    customer: { name: 'Мария Козлова', phone: '+7 (999) 333-44-55' },
    restaurant: { id: 3, name: 'Бургер Кинг' },
    courier: null,
    total: 1120,
    createdAt: '2024-01-15T10:45:00Z',
  },
  {
    id: 1072,
    problem: 'COMPLAINT' as const,
    problemLabel: 'Жалоба клиента',
    status: 'DELIVERED',
    statusLabel: 'Доставлен',
    stuckMinutes: 0,
    customer: { name: 'Иван Новиков', phone: '+7 (999) 444-55-66' },
    restaurant: { id: 1, name: 'Пицца Хат' },
    courier: { id: 3, name: 'Елена Петрова', phone: '+7 (999) 456-78-90' },
    total: 1560,
    createdAt: '2024-01-15T09:00:00Z',
    complaint: 'Холодная еда при получении',
  },
  {
    id: 1065,
    problem: 'STUCK' as const,
    problemLabel: 'Застрявший заказ',
    status: 'CONFIRMED',
    statusLabel: 'Подтверждён',
    stuckMinutes: 60,
    customer: { name: 'Ольга Сергеева', phone: '+7 (999) 555-66-77' },
    restaurant: { id: 4, name: 'KFC' },
    courier: null,
    total: 890,
    createdAt: '2024-01-15T09:30:00Z',
  },
]

const problemColors = {
  STUCK: 'destructive',
  DELAYED: 'warning',
  NO_COURIER: 'warning',
  COMPLAINT: 'secondary',
} as const

const problemIcons = {
  STUCK: Timer,
  DELAYED: Clock,
  NO_COURIER: Truck,
  COMPLAINT: MessageSquare,
}

export function ProblematicOrdersPage() {
  const [problemFilter, setProblemFilter] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<typeof mockProblematicOrders[0] | null>(null)
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean
    action: 'resolve' | 'cancel' | 'reassign' | null
  }>({ isOpen: false, action: null })
  const [resolution, setResolution] = useState('')

  const filteredOrders = mockProblematicOrders.filter(
    (order) => !problemFilter || order.problem === problemFilter
  )

  const stats = {
    total: mockProblematicOrders.length,
    stuck: mockProblematicOrders.filter((o) => o.problem === 'STUCK').length,
    delayed: mockProblematicOrders.filter((o) => o.problem === 'DELAYED').length,
    noCourier: mockProblematicOrders.filter((o) => o.problem === 'NO_COURIER').length,
    complaints: mockProblematicOrders.filter((o) => o.problem === 'COMPLAINT').length,
  }

  const handleAction = () => {
    console.log('Action:', actionModal.action, 'Order:', selectedOrder?.id, 'Resolution:', resolution)
    setActionModal({ isOpen: false, action: null })
    setSelectedOrder(null)
    setResolution('')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Проблемные заказы</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Заказы, требующие внимания оператора
          </p>
        </div>
        <Button variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Обновить
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--destructive))]/10">
                <AlertTriangle className="h-5 w-5 text-[hsl(var(--destructive))]" />
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Всего</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--destructive))]/10">
                <Timer className="h-5 w-5 text-[hsl(var(--destructive))]" />
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Застряли</p>
                <p className="text-xl font-bold">{stats.stuck}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--warning))]/10">
                <Clock className="h-5 w-5 text-[hsl(var(--warning))]" />
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Задержки</p>
                <p className="text-xl font-bold">{stats.delayed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--warning))]/10">
                <Truck className="h-5 w-5 text-[hsl(var(--warning))]" />
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Нет курьера</p>
                <p className="text-xl font-bold">{stats.noCourier}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--muted))]">
                <MessageSquare className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Жалобы</p>
                <p className="text-xl font-bold">{stats.complaints}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4" />
            Фильтры
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select
              value={problemFilter}
              onChange={(e) => setProblemFilter(e.target.value)}
              className="w-48"
            >
              <option value="">Все проблемы</option>
              <option value="STUCK">Застряли</option>
              <option value="DELAYED">Задержки</option>
              <option value="NO_COURIER">Нет курьера</option>
              <option value="COMPLAINT">Жалобы</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Заказ</TableHead>
                <TableHead>Проблема</TableHead>
                <TableHead>Клиент</TableHead>
                <TableHead>Ресторан</TableHead>
                <TableHead>Курьер</TableHead>
                <TableHead>Сумма</TableHead>
                <TableHead className="w-[140px]">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => {
                const ProblemIcon = problemIcons[order.problem]
                return (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div>
                        <Link
                          to={`/orders/${order.id}`}
                          className="font-medium text-[hsl(var(--primary))] hover:underline"
                        >
                          #{order.id}
                        </Link>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                          {formatDateTime(order.createdAt)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={problemColors[order.problem]}>
                          <ProblemIcon className="mr-1 h-3 w-3" />
                          {order.problemLabel}
                        </Badge>
                        {order.stuckMinutes > 0 && (
                          <span className="text-sm text-[hsl(var(--muted-foreground))]">
                            {order.stuckMinutes} мин
                          </span>
                        )}
                      </div>
                      {order.complaint && (
                        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                          {order.complaint}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                        <div>
                          <p className="font-medium">{order.customer.name}</p>
                          <p className="text-sm text-[hsl(var(--muted-foreground))]">
                            {order.customer.phone}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Store className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                        <span>{order.restaurant.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {order.courier ? (
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                          <div>
                            <p className="font-medium">{order.courier.name}</p>
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">
                              {order.courier.phone}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-[hsl(var(--muted-foreground))]">—</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(order.total)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Link to={`/orders/${order.id}`}>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedOrder(order)
                            setActionModal({ isOpen: true, action: 'resolve' })
                          }}
                        >
                          <CheckCircle className="h-4 w-4 text-[hsl(var(--success))]" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {filteredOrders.length === 0 && (
            <div className="py-12 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-[hsl(var(--success))]" />
              <p className="mt-4 text-lg font-medium">Нет проблемных заказов</p>
              <p className="text-[hsl(var(--muted-foreground))]">
                Все заказы обрабатываются нормально
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Modal */}
      <Modal
        isOpen={actionModal.isOpen}
        onClose={() => setActionModal({ isOpen: false, action: null })}
        title={
          actionModal.action === 'resolve'
            ? 'Решить проблему'
            : actionModal.action === 'cancel'
            ? 'Отменить заказ'
            : 'Переназначить курьера'
        }
        description={`Заказ #${selectedOrder?.id}`}
      >
        <div className="space-y-4">
          {selectedOrder && (
            <div className="rounded-lg border border-[hsl(var(--border))] p-4">
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--muted-foreground))]">Проблема:</span>
                  <Badge variant={problemColors[selectedOrder.problem]}>
                    {selectedOrder.problemLabel}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--muted-foreground))]">Клиент:</span>
                  <span>{selectedOrder.customer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--muted-foreground))]">Ресторан:</span>
                  <span>{selectedOrder.restaurant.name}</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Комментарий к решению</Label>
            <Textarea
              placeholder="Опишите принятые меры..."
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setActionModal({ isOpen: false, action: null })}
          >
            Отмена
          </Button>
          <Button variant="success" onClick={handleAction}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Решить
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
