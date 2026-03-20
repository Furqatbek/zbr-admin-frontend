import { useState } from 'react'
import {
  Trash2,
  AlertTriangle,
  Clock,
  CheckCircle,
  Eye,
  Calendar,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Input,
  Label,
  Modal,
  ModalFooter,
} from '@/components/ui'
import { useCleanupExpired, useCleanupDismissed, useCleanupRead } from '@/hooks/useNotifications'

type CleanupType = 'expired' | 'dismissed' | 'read'

export function NotificationCleanupPage() {
  const [selectedCleanup, setSelectedCleanup] = useState<CleanupType | null>(null)
  const [dismissedDays, setDismissedDays] = useState(7)
  const [readDays, setReadDays] = useState(90)
  const [lastResults, setLastResults] = useState<{ type: string; count: number }[]>([])

  const cleanupExpired = useCleanupExpired()
  const cleanupDismissed = useCleanupDismissed()
  const cleanupRead = useCleanupRead()

  const isAnyLoading =
    cleanupExpired.isPending || cleanupDismissed.isPending || cleanupRead.isPending

  const getDeletedCount = (result: unknown): number => {
    // Handle both ApiResponse wrapper and direct response formats
    if (typeof result === 'object' && result !== null) {
      const res = result as Record<string, unknown>
      if (typeof res.deletedCount === 'number') {
        return res.deletedCount
      }
      if (res.data && typeof res.data === 'object') {
        const data = res.data as Record<string, unknown>
        if (typeof data.deletedCount === 'number') {
          return data.deletedCount
        }
      }
    }
    return 0
  }

  const handleCleanup = async () => {
    if (!selectedCleanup) return

    try {
      switch (selectedCleanup) {
        case 'expired': {
          const result = await cleanupExpired.mutateAsync()
          setLastResults((prev) => [
            { type: 'Просроченные', count: getDeletedCount(result) },
            ...prev.slice(0, 4),
          ])
          break
        }
        case 'dismissed': {
          const result = await cleanupDismissed.mutateAsync(dismissedDays)
          setLastResults((prev) => [
            { type: `Скрытые (>${dismissedDays} дней)`, count: getDeletedCount(result) },
            ...prev.slice(0, 4),
          ])
          break
        }
        case 'read': {
          const result = await cleanupRead.mutateAsync(readDays)
          setLastResults((prev) => [
            { type: `Прочитанные (>${readDays} дней)`, count: getDeletedCount(result) },
            ...prev.slice(0, 4),
          ])
          break
        }
      }
      setSelectedCleanup(null)
    } catch (error) {
      console.error('Cleanup failed:', error)
    }
  }

  const getCleanupTitle = () => {
    switch (selectedCleanup) {
      case 'expired':
        return 'Удаление просроченных уведомлений'
      case 'dismissed':
        return `Удаление скрытых уведомлений старше ${dismissedDays} дней`
      case 'read':
        return `Удаление прочитанных уведомлений старше ${readDays} дней`
      default:
        return ''
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Очистка уведомлений</h1>
        <p className="text-[hsl(var(--muted-foreground))]">
          Управление хранилищем уведомлений (Admin)
        </p>
      </div>

      {/* Cleanup Actions */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Expired Cleanup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-[hsl(var(--warning))]" />
              Просроченные
            </CardTitle>
            <CardDescription>
              Удаление уведомлений с истёкшим сроком действия (expiresAt)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-[hsl(var(--muted))]/30 p-4 text-center">
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Будут удалены все уведомления, срок действия которых истёк
              </p>
            </div>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => setSelectedCleanup('expired')}
              disabled={isAnyLoading}
            >
              {cleanupExpired.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Очистить просроченные
            </Button>
          </CardContent>
        </Card>

        {/* Dismissed Cleanup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Eye className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
              Скрытые
            </CardTitle>
            <CardDescription>
              Удаление скрытых (dismissed) уведомлений старше указанного периода
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dismissedDays">Старше (дней)</Label>
              <Input
                id="dismissedDays"
                type="number"
                min={1}
                max={365}
                value={dismissedDays}
                onChange={(e) => setDismissedDays(parseInt(e.target.value, 10) || 7)}
              />
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                По умолчанию: 7 дней
              </p>
            </div>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => setSelectedCleanup('dismissed')}
              disabled={isAnyLoading}
            >
              {cleanupDismissed.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Очистить скрытые
            </Button>
          </CardContent>
        </Card>

        {/* Read Cleanup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="h-5 w-5 text-[hsl(var(--success))]" />
              Прочитанные
            </CardTitle>
            <CardDescription>
              Удаление прочитанных уведомлений старше указанного периода
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="readDays">Старше (дней)</Label>
              <Input
                id="readDays"
                type="number"
                min={1}
                max={365}
                value={readDays}
                onChange={(e) => setReadDays(parseInt(e.target.value, 10) || 90)}
              />
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                По умолчанию: 90 дней
              </p>
            </div>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => setSelectedCleanup('read')}
              disabled={isAnyLoading}
            >
              {cleanupRead.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Очистить прочитанные
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Cleanup Schedule Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Расписание автоматической очистки
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-[hsl(var(--border))] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--warning))]/10">
                  <Clock className="h-5 w-5 text-[hsl(var(--warning))]" />
                </div>
                <div>
                  <p className="font-medium">Скрытые</p>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    Каждые 7 дней
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-[hsl(var(--border))] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--success))]/10">
                  <CheckCircle className="h-5 w-5 text-[hsl(var(--success))]" />
                </div>
                <div>
                  <p className="font-medium">Прочитанные</p>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    Каждые 90 дней
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-[hsl(var(--border))] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--muted))]/50">
                  <RefreshCw className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                </div>
                <div>
                  <p className="font-medium">Непрочитанные</p>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    Каждые 180 дней
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Results */}
      {lastResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Результаты очистки</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lastResults.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border border-[hsl(var(--border))] p-3"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-[hsl(var(--success))]" />
                    <span>{result.type}</span>
                  </div>
                  <span className="font-bold">
                    {result.count.toLocaleString()} удалено
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={selectedCleanup !== null}
        onClose={() => setSelectedCleanup(null)}
        title="Подтверждение очистки"
        description="Это действие необратимо"
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-[hsl(var(--warning))]/50 bg-[hsl(var(--warning))]/5 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-[hsl(var(--warning))]" />
              <div>
                <p className="font-medium">{getCleanupTitle()}</p>
                <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                  Удалённые уведомления невозможно восстановить. Вы уверены, что хотите
                  продолжить?
                </p>
              </div>
            </div>
          </div>
        </div>

        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setSelectedCleanup(null)}
            disabled={isAnyLoading}
          >
            Отмена
          </Button>
          <Button variant="destructive" onClick={handleCleanup} disabled={isAnyLoading}>
            {isAnyLoading ? (
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
