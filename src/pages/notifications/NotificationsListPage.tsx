import { useState } from 'react'
import { format } from 'date-fns'
import {
  Bell,
  Search,
  Filter,
  CheckCheck,
  Trash2,
  Eye,
  MoreHorizontal,
  RefreshCw,
} from 'lucide-react'
import {
  Button,
  Input,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Select,
  Dropdown,
} from '@/components/ui'
import {
  useNotifications,
  useMarkAsRead,
  useDismissNotification,
  useDeleteNotification,
  useBulkAction,
} from '@/hooks/useNotifications'
import type { NotificationCategory, NotificationRole } from '@/types'

// Based on notification-api.md documentation
const CATEGORY_OPTIONS: { value: NotificationCategory | ''; label: string }[] = [
  { value: '', label: 'All Categories' },
  { value: 'ORDER', label: 'Order Updates' },
  { value: 'FINANCE', label: 'Financial' },
  { value: 'SUPPORT', label: 'Customer Support' },
  { value: 'SYSTEM', label: 'System' },
  { value: 'PROMOTION', label: 'Promotions' },
  { value: 'ACCOUNT', label: 'Account' },
  { value: 'DELIVERY', label: 'Delivery' },
  { value: 'RESTAURANT_OPS', label: 'Restaurant Operations' },
  { value: 'ALERT', label: 'Alerts' },
]

const ROLE_OPTIONS: { value: NotificationRole | ''; label: string }[] = [
  { value: '', label: 'All Roles' },
  { value: 'ALL', label: 'All Users' },
  { value: 'CUSTOMER', label: 'Customer' },
  { value: 'COURIER', label: 'Courier' },
  { value: 'RESTAURANT', label: 'Restaurant' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'SUPPORT', label: 'Support Agent' },
  { value: 'FINANCE', label: 'Finance' },
  { value: 'OPERATIONS', label: 'Operations Manager' },
]

const READ_STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'false', label: 'Unread' },
  { value: 'true', label: 'Read' },
]

const CATEGORY_LABELS: Record<NotificationCategory, string> = {
  ORDER: 'Order Updates',
  FINANCE: 'Financial',
  SUPPORT: 'Customer Support',
  SYSTEM: 'System',
  PROMOTION: 'Promotions',
  ACCOUNT: 'Account',
  DELIVERY: 'Delivery',
  RESTAURANT_OPS: 'Restaurant Operations',
  ALERT: 'Alerts',
}

const CATEGORY_COLORS: Record<NotificationCategory, string> = {
  ORDER: 'bg-blue-100 text-blue-800',
  FINANCE: 'bg-green-100 text-green-800',
  SUPPORT: 'bg-purple-100 text-purple-800',
  SYSTEM: 'bg-gray-100 text-gray-800',
  PROMOTION: 'bg-orange-100 text-orange-800',
  ACCOUNT: 'bg-indigo-100 text-indigo-800',
  DELIVERY: 'bg-cyan-100 text-cyan-800',
  RESTAURANT_OPS: 'bg-amber-100 text-amber-800',
  ALERT: 'bg-red-100 text-red-800',
}

export function NotificationsListPage() {
  const [page, setPage] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState<NotificationCategory | ''>('')
  const [role, setRole] = useState<NotificationRole | ''>('')
  const [isRead, setIsRead] = useState<string>('')
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const { data, isLoading, refetch } = useNotifications({
    page,
    pageSize: 20,
    searchTerm: searchTerm || undefined,
    category: category || undefined,
    role: role || undefined,
    isRead: isRead === '' ? undefined : isRead === 'true',
    sortBy: 'createdAt',
    sortDirection: 'DESC',
  })

  const markAsRead = useMarkAsRead()
  const dismiss = useDismissNotification()
  const deleteNotification = useDeleteNotification()
  const bulkAction = useBulkAction()

  const notifications = data?.data?.content || []
  const totalPages = data?.data?.totalPages || 0
  const totalElements = data?.data?.totalElements || 0

  const handleSelectAll = () => {
    if (selectedIds.length === notifications.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(notifications.map((n) => n.id))
    }
  }

  const handleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleBulkMarkRead = async () => {
    if (selectedIds.length === 0) return
    await bulkAction.mutateAsync({ notificationIds: selectedIds, action: 'MARK_READ' })
    setSelectedIds([])
  }

  const handleBulkDismiss = async () => {
    if (selectedIds.length === 0) return
    await bulkAction.mutateAsync({ notificationIds: selectedIds, action: 'DISMISS' })
    setSelectedIds([])
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return
    await bulkAction.mutateAsync({ notificationIds: selectedIds, action: 'DELETE' })
    setSelectedIds([])
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Уведомления</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Всего: {totalElements} уведомлений
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Обновить
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Фильтры
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
              <Input
                placeholder="Поиск..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value as NotificationCategory | '')}
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>

            <Select
              value={role}
              onChange={(e) => setRole(e.target.value as NotificationRole | '')}
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>

            <Select value={isRead} onChange={(e) => setIsRead(e.target.value)}>
              {READ_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-[hsl(var(--muted))] p-3">
          <span className="text-sm font-medium">
            Выбрано: {selectedIds.length}
          </span>
          <div className="ml-auto flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleBulkMarkRead}
              disabled={bulkAction.isPending}
            >
              <CheckCheck className="mr-1 h-4 w-4" />
              Прочитано
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleBulkDismiss}
              disabled={bulkAction.isPending}
            >
              <Eye className="mr-1 h-4 w-4" />
              Скрыть
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={bulkAction.isPending}
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Удалить
            </Button>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <RefreshCw className="h-8 w-8 animate-spin text-[hsl(var(--muted-foreground))]" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-[hsl(var(--muted-foreground))]">
              <Bell className="mb-4 h-12 w-12" />
              <p>Уведомления не найдены</p>
            </div>
          ) : (
            <>
              {/* Select All Header */}
              <div className="flex items-center gap-3 border-b border-[hsl(var(--border))] px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedIds.length === notifications.length && notifications.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 rounded border-[hsl(var(--border))]"
                />
                <span className="text-sm text-[hsl(var(--muted-foreground))]">
                  Выбрать все
                </span>
              </div>

              {/* Notification Items */}
              <div className="divide-y divide-[hsl(var(--border))]">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-4 p-4 transition-colors hover:bg-[hsl(var(--muted))] ${
                      !notification.isRead ? 'bg-[hsl(var(--accent))]' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(notification.id)}
                      onChange={() => handleSelect(notification.id)}
                      className="mt-1 h-4 w-4 rounded border-[hsl(var(--border))]"
                    />

                    <div
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                        CATEGORY_COLORS[notification.category] || 'bg-gray-100'
                      }`}
                    >
                      <Bell className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-medium">{notification.title}</h4>
                          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                            {notification.message}
                          </p>
                        </div>
                        <div className="flex flex-shrink-0 items-center gap-2">
                          <Badge
                            variant="secondary"
                            className={CATEGORY_COLORS[notification.category]}
                          >
                            {CATEGORY_LABELS[notification.category]}
                          </Badge>
                          {!notification.isRead && (
                            <span className="h-2 w-2 rounded-full bg-[hsl(var(--primary))]" />
                          )}
                        </div>
                      </div>

                      <div className="mt-2 flex items-center gap-4 text-xs text-[hsl(var(--muted-foreground))]">
                        <span>
                          {format(new Date(notification.createdAt), 'dd.MM.yyyy HH:mm')}
                        </span>
                        {notification.role && <span>Роль: {notification.role}</span>}
                        {notification.userId && <span>User ID: {notification.userId}</span>}
                        {notification.priority && notification.priority !== 'NORMAL' && (
                          <Badge
                            variant={
                              notification.priority === 'URGENT'
                                ? 'destructive'
                                : notification.priority === 'HIGH'
                                ? 'warning'
                                : 'secondary'
                            }
                          >
                            {notification.priority}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Dropdown
                      trigger={
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      }
                      align="right"
                    >
                      {!notification.isRead && (
                        <button
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-[hsl(var(--muted))]"
                          onClick={() => markAsRead.mutate(notification.id)}
                        >
                          <CheckCheck className="h-4 w-4" />
                          Отметить прочитанным
                        </button>
                      )}
                      <button
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-[hsl(var(--muted))]"
                        onClick={() => dismiss.mutate(notification.id)}
                      >
                        <Eye className="h-4 w-4" />
                        Скрыть
                      </button>
                      <button
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[hsl(var(--destructive))] hover:bg-[hsl(var(--muted))]"
                        onClick={() => deleteNotification.mutate(notification.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Удалить
                      </button>
                    </Dropdown>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Страница {page + 1} из {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Назад
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              Вперёд
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
