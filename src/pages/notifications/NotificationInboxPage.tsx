import { useState } from 'react'
import {
  Bell,
  Mail,
  MailOpen,
  Loader2,
  RefreshCw,
  CheckCheck,
  Trash2,
  Search,
  Eye,
  Filter,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Modal,
  ModalFooter,
  Input,
  Select,
} from '@/components/ui'
import { formatDateTime } from '@/lib/utils'
import {
  useMyNotifications,
  useUnreadCount,
  useNotificationCounts,
  useNotification,
  useNotificationSearch,
  useMarkAsRead,
  useMarkAllAsRead,
  useMarkBatchAsRead,
  useDismissNotification,
  useDeleteNotification,
  useDeleteAllForUser,
  useUnreadNotifications,
} from '@/hooks/useNotifications'
import { useAuthStore } from '@/store/auth.store'
import type { NotificationRole, NotificationCategory } from '@/types'

const categoryLabels: Record<string, string> = {
  ORDER: 'Заказ',
  DELIVERY: 'Доставка',
  PAYMENT: 'Оплата',
  PROMOTION: 'Акция',
  SYSTEM: 'Система',
  ACCOUNT: 'Аккаунт',
}

const priorityColors: Record<string, 'default' | 'secondary' | 'destructive' | 'warning'> = {
  LOW: 'secondary',
  NORMAL: 'default',
  HIGH: 'warning',
  URGENT: 'destructive',
}

export function NotificationInboxPage() {
  const { user } = useAuthStore()
  const userId = user?.id || 0

  const [page, setPage] = useState(0)
  const [isReadFilter, setIsReadFilter] = useState<boolean | undefined>(undefined)
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [detailId, setDetailId] = useState<number | null>(null)

  // Queries
  const { data: notificationsData, isLoading, refetch } = useMyNotifications({
    isRead: isReadFilter,
    category: categoryFilter as NotificationCategory || undefined,
    page,
    pageSize: 20,
  })

  const { data: unreadCountData } = useUnreadCount(userId)
  const { data: countsData } = useNotificationCounts(userId)
  const { data: unreadNotificationsData } = useUnreadNotifications(userId, { pageSize: 5 })
  const { data: detailData, isLoading: detailLoading } = useNotification(detailId || 0)

  // Search query (only when search term is set)
  const { data: searchData, isLoading: searchLoading } = useNotificationSearch(
    { searchTerm, page: 0, pageSize: 50 },
    !!searchTerm
  )

  // Mutations
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()
  const markBatchAsRead = useMarkBatchAsRead()
  const dismissNotification = useDismissNotification()
  const deleteNotification = useDeleteNotification()
  const deleteAllForUser = useDeleteAllForUser()

  const notifications = searchTerm
    ? (searchData?.notifications || [])
    : (notificationsData?.notifications || [])
  const totalElements = notifications.length

  const unreadCount = unreadCountData?.unreadCount || 0
  const counts = countsData
  const recentUnread = unreadNotificationsData?.notifications || []

  const handleMarkAllAsRead = async () => {
    await markAllAsRead.mutateAsync({ userId })
    refetch()
  }

  const handleMarkBatchAsRead = async () => {
    if (selectedIds.size === 0) return
    await markBatchAsRead.mutateAsync(Array.from(selectedIds))
    setSelectedIds(new Set())
    refetch()
  }

  const handleDeleteAll = async () => {
    await deleteAllForUser.mutateAsync(userId)
    refetch()
  }

  const handleSearch = () => {
    setSearchTerm(searchInput)
  }

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const selectAll = () => {
    if (selectedIds.size === notifications.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(notifications.map((n: { id: number }) => n.id)))
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Мои уведомления</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Входящие уведомления и оповещения
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Обновить
          </Button>
          <Button variant="outline" onClick={handleMarkAllAsRead} disabled={markAllAsRead.isPending || unreadCount === 0}>
            <CheckCheck className="mr-2 h-4 w-4" />
            Прочитать все
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10">
                <Bell className="h-6 w-6 text-[hsl(var(--primary))]" />
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Всего</p>
                <p className="text-2xl font-bold">{totalElements}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--destructive))]/10">
                <Mail className="h-6 w-6 text-[hsl(var(--destructive))]" />
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Непрочитанных</p>
                <p className="text-2xl font-bold">{unreadCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--success))]/10">
                <MailOpen className="h-6 w-6 text-[hsl(var(--success))]" />
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Прочитанных</p>
                <p className="text-2xl font-bold">{counts ? counts.total - counts.unread : 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--warning))]/10">
                <Trash2 className="h-6 w-6 text-[hsl(var(--warning))]" />
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Всего</p>
                <p className="text-2xl font-bold">{counts?.total || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Unread Quick View */}
      {recentUnread.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Mail className="h-4 w-4 text-[hsl(var(--destructive))]" />
              Последние непрочитанные ({recentUnread.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentUnread.slice(0, 5).map((n) => (
                <div
                  key={n.id}
                  className="flex items-center gap-3 rounded-lg bg-[hsl(var(--destructive))]/5 p-2 cursor-pointer hover:bg-[hsl(var(--destructive))]/10"
                  onClick={() => { setDetailId(n.id); markAsRead.mutate(n.id) }}
                >
                  <div className="h-2 w-2 rounded-full bg-[hsl(var(--destructive))]" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{n.title}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">{n.message}</p>
                  </div>
                  <span className="text-xs text-[hsl(var(--muted-foreground))] whitespace-nowrap">
                    {formatDateTime(n.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search & Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex flex-1 gap-2">
              <Input
                placeholder="Поиск уведомлений..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button variant="outline" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <Filter className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
            <Select
              value={isReadFilter === undefined ? '' : String(isReadFilter)}
              onChange={(e) => setIsReadFilter(e.target.value === '' ? undefined : e.target.value === 'true')}
            >
              <option value="">Все</option>
              <option value="false">Непрочитанные</option>
              <option value="true">Прочитанные</option>
            </Select>
            <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="">Все категории</option>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </Select>
            {searchTerm && (
              <Button variant="ghost" size="sm" onClick={() => { setSearchTerm(''); setSearchInput('') }}>
                Сбросить поиск
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Batch actions */}
      {selectedIds.size > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Выбрано: {selectedIds.size}</span>
              <Button variant="outline" size="sm" onClick={handleMarkBatchAsRead} disabled={markBatchAsRead.isPending}>
                <CheckCheck className="mr-2 h-4 w-4" />
                Прочитать выбранные
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
                Снять выделение
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notifications list */}
      <Card>
        <CardContent className="p-0">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-[hsl(var(--muted-foreground))]">
              <Bell className="mx-auto h-12 w-12 mb-4" />
              <p className="text-lg font-medium">Нет уведомлений</p>
            </div>
          ) : (
            <div className="divide-y divide-[hsl(var(--border))]">
              {/* Select all row */}
              <div className="flex items-center gap-3 px-6 py-3 bg-[hsl(var(--muted))]/50">
                <input
                  type="checkbox"
                  checked={selectedIds.size === notifications.length && notifications.length > 0}
                  onChange={selectAll}
                  className="h-4 w-4 rounded border-[hsl(var(--border))]"
                />
                <span className="text-sm text-[hsl(var(--muted-foreground))]">Выбрать все</span>
              </div>

              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-center gap-4 px-6 py-4 transition-colors hover:bg-[hsl(var(--muted))]/50 ${
                    !notification.isRead ? 'bg-[hsl(var(--primary))]/5' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(notification.id)}
                    onChange={() => toggleSelect(notification.id)}
                    className="h-4 w-4 rounded border-[hsl(var(--border))]"
                  />
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => {
                      setDetailId(notification.id)
                      if (!notification.isRead) {
                        markAsRead.mutate(notification.id)
                      }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {!notification.isRead && (
                        <div className="h-2 w-2 rounded-full bg-[hsl(var(--primary))] flex-shrink-0" />
                      )}
                      <p className={`font-medium truncate ${!notification.isRead ? 'text-[hsl(var(--foreground))]' : 'text-[hsl(var(--muted-foreground))]'}`}>
                        {notification.title}
                      </p>
                    </div>
                    {notification.message && (
                      <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))] truncate">
                        {notification.message}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {notification.categoryDisplayName && (
                      <Badge variant="secondary">{notification.categoryDisplayName}</Badge>
                    )}
                    {notification.priority && notification.priority !== 'NORMAL' && (
                      <Badge variant={priorityColors[notification.priority] || 'default'}>
                        {notification.priorityDisplayName || notification.priority}
                      </Badge>
                    )}
                    <span className="text-sm text-[hsl(var(--muted-foreground))] whitespace-nowrap">
                      {notification.timeAgo || formatDateTime(notification.createdAt)}
                    </span>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => dismissNotification.mutate(notification.id)}
                      title="Скрыть"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteNotification.mutate(notification.id)}
                      title="Удалить"
                    >
                      <Trash2 className="h-4 w-4 text-[hsl(var(--destructive))]" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalElements > 20 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
            Назад
          </Button>
          <span className="flex items-center px-4 text-sm text-[hsl(var(--muted-foreground))]">
            Страница {page + 1}
          </span>
          <Button variant="outline" onClick={() => setPage(p => p + 1)}>
            Вперёд
          </Button>
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={!!detailId}
        onClose={() => setDetailId(null)}
        title="Уведомление"
      >
        {detailLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : detailData ? (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{detailData.title}</h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                {detailData.timeAgo || formatDateTime(detailData.createdAt)}
              </p>
            </div>
            <p className="text-[hsl(var(--foreground))]">{detailData.message}</p>
            <div className="flex gap-2 flex-wrap">
              {detailData.notificationTypeDisplayName && (
                <Badge variant="default">{detailData.notificationTypeDisplayName}</Badge>
              )}
              {detailData.categoryDisplayName && (
                <Badge variant="secondary">{detailData.categoryDisplayName}</Badge>
              )}
              {detailData.priority && (
                <Badge variant={priorityColors[detailData.priority] || 'default'}>
                  {detailData.priorityDisplayName || detailData.priority}
                </Badge>
              )}
              {detailData.roleDisplayName && (
                <Badge variant="outline">{detailData.roleDisplayName}</Badge>
              )}
            </div>
            {detailData.orderId && (
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Заказ: #{detailData.orderId}
              </p>
            )}
            {detailData.actionUrl && (
              <a
                href={detailData.actionUrl}
                className="text-sm text-[hsl(var(--primary))] hover:underline"
              >
                Перейти к деталям
              </a>
            )}
          </div>
        ) : (
          <p className="text-[hsl(var(--muted-foreground))]">Уведомление не найдено</p>
        )}
        <ModalFooter>
          <Button variant="outline" onClick={() => setDetailId(null)}>Закрыть</Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
