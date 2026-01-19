import { useState } from 'react'
import {
  Send,
  Users,
  Bell,
  Loader2,
  User,
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
  Select,
  Textarea,
  Label,
  Modal,
  ModalFooter,
} from '@/components/ui'
import {
  useCreateNotification,
  useNotificationReferenceData,
} from '@/hooks/useNotifications'
import type { NotificationCategory, NotificationRole, NotificationPriority } from '@/types'

// Fallback icons (not provided by backend API)
const ICON_OPTIONS = [
  { value: 'shopping-bag', label: 'Order' },
  { value: 'truck', label: 'Delivery' },
  { value: 'credit-card', label: 'Payment' },
  { value: 'alert-triangle', label: 'Alert' },
  { value: 'check-circle', label: 'Success' },
  { value: 'x-circle', label: 'Error' },
  { value: 'info', label: 'Information' },
  { value: 'headphones', label: 'Support' },
  { value: 'tag', label: 'Promotional' },
  { value: 'user', label: 'Account' },
  { value: 'settings', label: 'System' },
]

export function NotificationBroadcastPage() {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: '',
    category: '' as NotificationCategory | '',
    role: '' as NotificationRole | '',
    priority: '' as NotificationPriority | '',
    icon: 'info',
    actionUrl: '',
    expiresAt: '',
    userId: '',
  })
  const [targetType, setTargetType] = useState<'role' | 'user'>('role')
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  // Fetch reference data from backend
  const { data: referenceData, isLoading: isLoadingRef } = useNotificationReferenceData()
  const createNotification = useCreateNotification()

  const types = referenceData?.types || []
  const categories = referenceData?.categories || []
  const roles = referenceData?.roles || []
  const priorities = referenceData?.priorities || []

  const selectedType = types.find((t) => t.value === formData.type)
  const selectedRole = roles.find((r) => r.value === formData.role)
  const selectedCategory = categories.find((c) => c.value === formData.category)
  const selectedPriority = priorities.find((p) => p.value === formData.priority)
  const selectedIcon = ICON_OPTIONS.find((i) => i.value === formData.icon)

  const handleSend = async () => {
    if (!formData.category || !formData.priority) return

    try {
      await createNotification.mutateAsync({
        title: formData.title,
        message: formData.message,
        type: formData.type || undefined,
        category: formData.category,
        ...(targetType === 'role' && formData.role
          ? { role: formData.role }
          : { userId: parseInt(formData.userId, 10) }),
        priority: formData.priority,
        icon: formData.icon,
        actionUrl: formData.actionUrl || undefined,
        expiresAt: formData.expiresAt || undefined,
      })

      setIsConfirmOpen(false)
      setFormData({
        title: '',
        message: '',
        type: '',
        category: '',
        role: '',
        priority: '',
        icon: 'info',
        actionUrl: '',
        expiresAt: '',
        userId: '',
      })
    } catch (error) {
      console.error('Failed to send notification:', error)
    }
  }

  const isFormValid =
    formData.title.trim() &&
    formData.message.trim() &&
    formData.category &&
    formData.priority &&
    (targetType === 'role' ? formData.role : formData.userId)

  if (isLoadingRef) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-[hsl(var(--muted-foreground))]" />
        <span className="ml-2 text-[hsl(var(--muted-foreground))]">Загрузка данных...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Создать уведомление</h1>
        <p className="text-[hsl(var(--muted-foreground))]">
          Отправка уведомлений пользователям или группам
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
              {/* Target Type */}
              <div className="space-y-2">
                <Label>Тип получателя</Label>
                <div className="flex gap-2">
                  <Button
                    variant={targetType === 'role' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTargetType('role')}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    По роли
                  </Button>
                  <Button
                    variant={targetType === 'user' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTargetType('user')}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Конкретный пользователь
                  </Button>
                </div>
              </div>

              {/* Target Selection */}
              {targetType === 'role' ? (
                <div className="space-y-2">
                  <Label htmlFor="role">Целевая роль</Label>
                  <Select
                    id="role"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value as NotificationRole })
                    }
                  >
                    <option value="">Выберите роль</option>
                    {roles.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.displayName}
                      </option>
                    ))}
                  </Select>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="userId">ID пользователя</Label>
                  <Input
                    id="userId"
                    type="number"
                    placeholder="Введите ID пользователя"
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="type">Тип уведомления</Label>
                <Select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="">Выберите тип</option>
                  {types.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.displayName}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Категория</Label>
                  <Select
                    id="category"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as NotificationCategory })
                    }
                  >
                    <option value="">Выберите категорию</option>
                    {categories.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.displayName}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Приоритет</Label>
                  <Select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value as NotificationPriority })
                    }
                  >
                    <option value="">Выберите приоритет</option>
                    {priorities.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.displayName}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon">Иконка</Label>
                <Select
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                >
                  {ICON_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
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
                <Label htmlFor="message">Текст сообщения</Label>
                <Textarea
                  id="message"
                  placeholder="Введите текст уведомления"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {formData.message.length}/500 символов
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="actionUrl">URL действия (опционально)</Label>
                  <Input
                    id="actionUrl"
                    placeholder="/orders/123"
                    value={formData.actionUrl}
                    onChange={(e) => setFormData({ ...formData, actionUrl: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiresAt">Срок действия (опционально)</Label>
                  <Input
                    id="expiresAt"
                    type="datetime-local"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() =>
                    setFormData({
                      title: '',
                      message: '',
                      type: '',
                      category: '',
                      role: '',
                      priority: '',
                      icon: 'info',
                      actionUrl: '',
                      expiresAt: '',
                      userId: '',
                    })
                  }
                >
                  Очистить
                </Button>
                <Button disabled={!isFormValid} onClick={() => setIsConfirmOpen(true)}>
                  <Send className="mr-2 h-4 w-4" />
                  Отправить
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
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--primary))]/10">
                    <Bell className="h-5 w-5 text-[hsl(var(--primary))]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{formData.title || 'Заголовок уведомления'}</p>
                    <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                      {formData.message || 'Текст сообщения будет отображён здесь'}
                    </p>
                    {formData.actionUrl && (
                      <p className="mt-2 text-xs text-[hsl(var(--primary))]">
                        Ссылка: {formData.actionUrl}
                      </p>
                    )}
                  </div>
                </div>
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
                {targetType === 'role' ? (
                  <>
                    <p className="text-3xl font-bold">{selectedRole?.displayName || '—'}</p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                      Группа получателей
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-3xl font-bold">{formData.userId ? '1' : '—'}</p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                      {formData.userId ? `Пользователь #${formData.userId}` : 'Укажите ID'}
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">Тип:</span>
                <span className="font-medium">{selectedType?.displayName || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">Категория:</span>
                <span className="font-medium">{selectedCategory?.displayName || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">Приоритет:</span>
                <span className="font-medium">{selectedPriority?.displayName || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">Иконка:</span>
                <span className="font-medium">{selectedIcon?.label || '—'}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

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
                <span className="text-[hsl(var(--muted-foreground))]">Получатель:</span>
                <span className="font-medium">
                  {targetType === 'role' ? selectedRole?.displayName : `User #${formData.userId}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">Тип:</span>
                <span className="font-medium">{selectedType?.displayName || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">Категория:</span>
                <span className="font-medium">{selectedCategory?.displayName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">Приоритет:</span>
                <span className="font-medium">{selectedPriority?.displayName}</span>
              </div>
              {formData.expiresAt && (
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--muted-foreground))]">Срок действия:</span>
                  <span className="font-medium">{formData.expiresAt}</span>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg bg-[hsl(var(--muted))]/30 p-4">
            <p className="font-medium">{formData.title}</p>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{formData.message}</p>
          </div>
        </div>

        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setIsConfirmOpen(false)}
            disabled={createNotification.isPending}
          >
            Отмена
          </Button>
          <Button onClick={handleSend} disabled={createNotification.isPending}>
            {createNotification.isPending ? (
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
