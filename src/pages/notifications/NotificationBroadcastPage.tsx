import { useState } from 'react'
import {
  Send,
  Users,
  Smartphone,
  Mail,
  MessageSquare,
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
  Input,
  Select,
  Textarea,
  Label,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Modal,
  ModalFooter,
} from '@/components/ui'
import { formatDateTime, formatNumber } from '@/lib/utils'

// Mock data
const mockHistory = [
  {
    id: 1,
    title: 'Новогодняя акция!',
    body: 'Скидка 20% на все заказы до 31 декабря',
    type: 'PUSH' as const,
    targetAudience: 'Все пользователи',
    recipientCount: 15420,
    sentAt: '2024-01-14T10:00:00Z',
    status: 'SENT' as const,
  },
  {
    id: 2,
    title: 'Обновление приложения',
    body: 'Доступна новая версия с улучшениями',
    type: 'PUSH' as const,
    targetAudience: 'Клиенты',
    recipientCount: 12350,
    sentAt: '2024-01-13T14:30:00Z',
    status: 'SENT' as const,
  },
  {
    id: 3,
    title: 'Бонус для курьеров',
    body: 'Дополнительные 500₽ за 10 доставок',
    type: 'SMS' as const,
    targetAudience: 'Курьеры',
    recipientCount: 234,
    sentAt: '2024-01-12T09:00:00Z',
    status: 'SENT' as const,
  },
  {
    id: 4,
    title: 'Тестовая рассылка',
    body: 'Проверка системы уведомлений',
    type: 'EMAIL' as const,
    targetAudience: 'Тестовая группа',
    recipientCount: 5,
    sentAt: '2024-01-15T08:00:00Z',
    status: 'PENDING' as const,
  },
]

const typeLabels = {
  PUSH: 'Push',
  SMS: 'SMS',
  EMAIL: 'Email',
}

const typeIcons = {
  PUSH: Smartphone,
  SMS: MessageSquare,
  EMAIL: Mail,
}

const statusLabels = {
  PENDING: 'Ожидает',
  SENDING: 'Отправка',
  SENT: 'Отправлено',
  FAILED: 'Ошибка',
}

const statusColors = {
  PENDING: 'warning',
  SENDING: 'default',
  SENT: 'success',
  FAILED: 'destructive',
} as const

export function NotificationBroadcastPage() {
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    type: 'PUSH' as 'PUSH' | 'SMS' | 'EMAIL',
    targetAudience: 'ALL' as 'ALL' | 'CUSTOMERS' | 'COURIERS' | 'RESTAURANTS',
    scheduledAt: '',
  })
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const audienceLabels = {
    ALL: 'Все пользователи',
    CUSTOMERS: 'Клиенты',
    COURIERS: 'Курьеры',
    RESTAURANTS: 'Рестораны',
  }

  const estimatedRecipients = {
    ALL: 15654,
    CUSTOMERS: 12350,
    COURIERS: 234,
    RESTAURANTS: 87,
  }

  const handleSend = () => {
    setIsSending(true)
    // Simulate API call
    setTimeout(() => {
      setIsSending(false)
      setIsConfirmOpen(false)
      setFormData({
        title: '',
        body: '',
        type: 'PUSH',
        targetAudience: 'ALL',
        scheduledAt: '',
      })
    }, 2000)
  }

  const isFormValid = formData.title.trim() && formData.body.trim()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Рассылка уведомлений</h1>
        <p className="text-[hsl(var(--muted-foreground))]">
          Отправка массовых уведомлений пользователям
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Compose Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Новое уведомление
              </CardTitle>
              <CardDescription>Заполните форму для отправки уведомления</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="type">Тип уведомления</Label>
                  <Select
                    id="type"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as 'PUSH' | 'SMS' | 'EMAIL' })
                    }
                  >
                    <option value="PUSH">Push-уведомление</option>
                    <option value="SMS">SMS</option>
                    <option value="EMAIL">Email</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="audience">Целевая аудитория</Label>
                  <Select
                    id="audience"
                    value={formData.targetAudience}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        targetAudience: e.target.value as 'ALL' | 'CUSTOMERS' | 'COURIERS' | 'RESTAURANTS',
                      })
                    }
                  >
                    <option value="ALL">Все пользователи</option>
                    <option value="CUSTOMERS">Клиенты</option>
                    <option value="COURIERS">Курьеры</option>
                    <option value="RESTAURANTS">Рестораны</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Заголовок</Label>
                <Input
                  id="title"
                  placeholder="Введите заголовок уведомления"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  maxLength={100}
                />
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {formData.title.length}/100 символов
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="body">Текст сообщения</Label>
                <Textarea
                  id="body"
                  placeholder="Введите текст уведомления"
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {formData.body.length}/500 символов
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="schedule">Запланировать (опционально)</Label>
                <Input
                  id="schedule"
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() =>
                    setFormData({
                      title: '',
                      body: '',
                      type: 'PUSH',
                      targetAudience: 'ALL',
                      scheduledAt: '',
                    })
                  }
                >
                  Очистить
                </Button>
                <Button disabled={!isFormValid} onClick={() => setIsConfirmOpen(true)}>
                  <Send className="mr-2 h-4 w-4" />
                  {formData.scheduledAt ? 'Запланировать' : 'Отправить'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview & Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Предпросмотр</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 p-4">
                {(() => {
                  const Icon = typeIcons[formData.type]
                  return <Icon className="mb-2 h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                })()}
                <p className="font-medium">{formData.title || 'Заголовок уведомления'}</p>
                <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                  {formData.body || 'Текст сообщения будет отображён здесь'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4" />
                Получатели
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-3xl font-bold">
                  {formatNumber(estimatedRecipients[formData.targetAudience])}
                </p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  {audienceLabels[formData.targetAudience]}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            История рассылок
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Тип</TableHead>
                <TableHead>Заголовок</TableHead>
                <TableHead>Аудитория</TableHead>
                <TableHead>Получатели</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead>Статус</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockHistory.map((item) => {
                const Icon = typeIcons[item.type]
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                        {typeLabels[item.type]}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-[hsl(var(--muted-foreground))] truncate max-w-xs">
                          {item.body}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{item.targetAudience}</TableCell>
                    <TableCell>{formatNumber(item.recipientCount)}</TableCell>
                    <TableCell>{formatDateTime(item.sentAt)}</TableCell>
                    <TableCell>
                      <Badge variant={statusColors[item.status]}>{statusLabels[item.status]}</Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Подтверждение отправки"
        description="Проверьте данные перед отправкой"
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-[hsl(var(--border))] p-4">
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">Тип:</span>
                <span className="font-medium">{typeLabels[formData.type]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">Аудитория:</span>
                <span className="font-medium">{audienceLabels[formData.targetAudience]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">Получатели:</span>
                <span className="font-medium">
                  {formatNumber(estimatedRecipients[formData.targetAudience])}
                </span>
              </div>
              {formData.scheduledAt && (
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--muted-foreground))]">Запланировано:</span>
                  <span className="font-medium">{formData.scheduledAt}</span>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg bg-[hsl(var(--muted))]/30 p-4">
            <p className="font-medium">{formData.title}</p>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{formData.body}</p>
          </div>
        </div>

        <ModalFooter>
          <Button variant="outline" onClick={() => setIsConfirmOpen(false)} disabled={isSending}>
            Отмена
          </Button>
          <Button onClick={handleSend} disabled={isSending}>
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Отправка...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Подтвердить
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
