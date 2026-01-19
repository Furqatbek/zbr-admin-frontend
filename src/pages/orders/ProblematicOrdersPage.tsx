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
  Loader2,
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
import { useProblematicOrders, useResolveOrderProblem } from '@/hooks/useOrders'
import type { ProblematicOrder, ProblemType } from '@/api/orders.api'

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
  const [problemFilter, setProblemFilter] = useState<ProblemType | ''>('')
  const { data: ordersResponse, isLoading, error, refetch } = useProblematicOrders(
    problemFilter ? { problemType: problemFilter } : {}
  )
  const resolveOrderProblem = useResolveOrderProblem()

  const orders = ordersResponse?.data || []

  const [selectedOrder, setSelectedOrder] = useState<ProblematicOrder | null>(null)
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean
    action: 'resolve' | 'cancel' | 'reassign' | null
  }>({ isOpen: false, action: null })
  const [resolution, setResolution] = useState('')

  const filteredOrders = orders

  const stats = {
    total: orders.length,
    stuck: orders.filter((o) => o.problem === 'STUCK').length,
    delayed: orders.filter((o) => o.problem === 'DELAYED').length,
    noCourier: orders.filter((o) => o.problem === 'NO_COURIER').length,
    complaints: orders.filter((o) => o.problem === 'COMPLAINT').length,
  }

  const handleAction = async () => {
    if (selectedOrder && resolution) {
      await resolveOrderProblem.mutateAsync({
        orderId: selectedOrder.id,
        data: { resolution },
      })
    }
    setActionModal({ isOpen: false, action: null })
    setSelectedOrder(null)
    setResolution('')
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-[hsl(var(--destructive))]">Ошибка загрузки данных</p>
      </div>
    )
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
        <Button variant="outline" onClick={() => refetch()}>
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
              onChange={(e) => setProblemFilter(e.target.value as ProblemType | '')}
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
          <Button variant="success" onClick={handleAction} disabled={resolveOrderProblem.isPending || !resolution}>
            {resolveOrderProblem.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="mr-2 h-4 w-4" />
            )}
            Решить
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
