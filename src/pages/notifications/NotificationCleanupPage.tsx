import { useState } from 'react'
import {
  Trash2,
  AlertTriangle,
  Clock,
  CheckCircle,
  Database,
  Calendar,
  Loader2,
  History,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Select,
  Badge,
  Label,
  Modal,
  ModalFooter,
} from '@/components/ui'
import { formatNumber, formatDateTime } from '@/lib/utils'

// Mock data
const mockStats = {
  totalNotifications: 1250000,
  lastCleanup: '2024-01-10T03:00:00Z',
  oldNotifications: {
    '7days': 45000,
    '14days': 120000,
    '30days': 350000,
    '60days': 580000,
    '90days': 780000,
  },
  storageUsed: 2.4, // GB
  storageLimit: 10, // GB
}

const mockCleanupHistory = [
  {
    id: 1,
    olderThan: 30,
    deletedCount: 125000,
    executedAt: '2024-01-10T03:00:00Z',
    executedBy: 'Система (авто)',
    status: 'success' as const,
  },
  {
    id: 2,
    olderThan: 30,
    deletedCount: 98500,
    executedAt: '2023-12-10T03:00:00Z',
    executedBy: 'Система (авто)',
    status: 'success' as const,
  },
  {
    id: 3,
    olderThan: 14,
    deletedCount: 45200,
    executedAt: '2023-12-01T15:30:00Z',
    executedBy: 'Админ Иванов',
    status: 'success' as const,
  },
  {
    id: 4,
    olderThan: 60,
    deletedCount: 0,
    executedAt: '2023-11-15T10:00:00Z',
    executedBy: 'Админ Петров',
    status: 'failed' as const,
    error: 'Таймаут операции',
  },
]

export function NotificationCleanupPage() {
  const [selectedDays, setSelectedDays] = useState('30')
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isCleaning, setIsCleaning] = useState(false)

  const handleCleanup = () => {
    setIsCleaning(true)
    // Simulate API call
    setTimeout(() => {
      setIsCleaning(false)
      setIsConfirmOpen(false)
    }, 3000)
  }

  const estimatedDeletion = mockStats.oldNotifications[`${selectedDays}days` as keyof typeof mockStats.oldNotifications] || 0
  const storagePercentage = (mockStats.storageUsed / mockStats.storageLimit) * 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Очистка уведомлений</h1>
        <p className="text-[hsl(var(--muted-foreground))]">
          Управление хранилищем уведомлений
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10">
                <Database className="h-6 w-6 text-[hsl(var(--primary))]" />
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Всего</p>
                <p className="text-2xl font-bold">{formatNumber(mockStats.totalNotifications)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--warning))]/10">
                <Clock className="h-6 w-6 text-[hsl(var(--warning))]" />
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Старше 30 дней</p>
                <p className="text-2xl font-bold">{formatNumber(mockStats.oldNotifications['30days'])}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--success))]/10">
                <CheckCircle className="h-6 w-6 text-[hsl(var(--success))]" />
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Последняя очистка</p>
                <p className="text-lg font-bold">{formatDateTime(mockStats.lastCleanup)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[hsl(var(--muted-foreground))]">Хранилище</span>
                <span className="font-medium">{mockStats.storageUsed} / {mockStats.storageLimit} ГБ</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[hsl(var(--muted))]">
                <div
                  className={`h-full rounded-full ${
                    storagePercentage > 80
                      ? 'bg-[hsl(var(--destructive))]'
                      : storagePercentage > 60
                      ? 'bg-[hsl(var(--warning))]'
                      : 'bg-[hsl(var(--success))]'
                  }`}
                  style={{ width: `${storagePercentage}%` }}
                />
              </div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                {storagePercentage.toFixed(1)}% использовано
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Cleanup Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Очистка старых уведомлений
            </CardTitle>
            <CardDescription>
              Удаление уведомлений старше указанного периода
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Удалить уведомления старше</Label>
              <Select value={selectedDays} onChange={(e) => setSelectedDays(e.target.value)}>
                <option value="7">7 дней</option>
                <option value="14">14 дней</option>
                <option value="30">30 дней</option>
                <option value="60">60 дней</option>
                <option value="90">90 дней</option>
              </Select>
            </div>

            <div className="rounded-lg border border-[hsl(var(--warning))]/50 bg-[hsl(var(--warning))]/5 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-[hsl(var(--warning))] mt-0.5" />
                <div>
                  <p className="font-medium text-[hsl(var(--warning))]">
                    Внимание
                  </p>
                  <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                    Будет удалено примерно <strong>{formatNumber(estimatedDeletion)}</strong> уведомлений.
                    Это действие необратимо.
                  </p>
                </div>
              </div>
            </div>

            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setIsConfirmOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Начать очистку
            </Button>
          </CardContent>
        </Card>

        {/* Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Распределение по возрасту
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(mockStats.oldNotifications).map(([key, count]) => {
                const days = key.replace('days', '')
                const percentage = (count / mockStats.totalNotifications) * 100
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Старше {days} дней</span>
                      <span className="font-medium">{formatNumber(count)}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[hsl(var(--muted))]">
                      <div
                        className="h-full rounded-full bg-[hsl(var(--primary))]"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      {percentage.toFixed(1)}% от общего числа
                    </p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            История очисток
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockCleanupHistory.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-[hsl(var(--border))] p-4"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      item.status === 'success'
                        ? 'bg-[hsl(var(--success))]/10'
                        : 'bg-[hsl(var(--destructive))]/10'
                    }`}
                  >
                    {item.status === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-[hsl(var(--success))]" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-[hsl(var(--destructive))]" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">
                      Удалено уведомлений старше {item.olderThan} дней
                    </p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                      {formatDateTime(item.executedAt)} · {item.executedBy}
                    </p>
                    {item.error && (
                      <p className="text-sm text-[hsl(var(--destructive))]">{item.error}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{formatNumber(item.deletedCount)}</p>
                  <Badge variant={item.status === 'success' ? 'success' : 'destructive'}>
                    {item.status === 'success' ? 'Успешно' : 'Ошибка'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Подтверждение очистки"
        description="Это действие необратимо"
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-[hsl(var(--destructive))]/30 bg-[hsl(var(--destructive))]/5 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-[hsl(var(--destructive))] mt-0.5" />
              <div>
                <p className="font-medium">
                  Вы уверены, что хотите удалить уведомления?
                </p>
                <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                  Будет удалено примерно <strong>{formatNumber(estimatedDeletion)}</strong> уведомлений
                  старше <strong>{selectedDays} дней</strong>. Это действие нельзя отменить.
                </p>
              </div>
            </div>
          </div>
        </div>

        <ModalFooter>
          <Button variant="outline" onClick={() => setIsConfirmOpen(false)} disabled={isCleaning}>
            Отмена
          </Button>
          <Button variant="destructive" onClick={handleCleanup} disabled={isCleaning}>
            {isCleaning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Удаление...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Удалить
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
