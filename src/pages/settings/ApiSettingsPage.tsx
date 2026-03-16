import { useState } from 'react'
import {
  Radio,
  Send,
  Power,
  PowerOff,
  RefreshCw,
  Loader2,
  CheckCircle,
  XCircle,
  MessageSquare,
  Activity,
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
  Label,
  Badge,
  Modal,
  ModalFooter,
} from '@/components/ui'
import {
  useSmsStatus,
  useUpdateSmsConfig,
  useSwitchSmsProvider,
  useToggleSms,
  useSendTestSms,
} from '@/hooks/useSms'
import type { SmsProvider } from '@/types'
import { formatDateTime } from '@/lib/utils'

type Section = 'status' | 'provider' | 'test'

export function ApiSettingsPage() {
  const { data: smsStatus, isLoading, error } = useSmsStatus()
  const updateConfig = useUpdateSmsConfig()
  const switchProvider = useSwitchSmsProvider()
  const toggleSms = useToggleSms()
  const sendTestSms = useSendTestSms()

  const [activeSection, setActiveSection] = useState<Section>('status')
  const [testPhone, setTestPhone] = useState('')
  const [testMessage, setTestMessage] = useState('')
  const [isToggleModalOpen, setIsToggleModalOpen] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<SmsProvider>('ESKIZ')
  const [retryAttempts, setRetryAttempts] = useState(3)
  const [retryDelayMs, setRetryDelayMs] = useState(1000)

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
        <p className="text-[hsl(var(--destructive))]">Ошибка загрузки настроек SMS API</p>
      </div>
    )
  }

  const handleSwitchProvider = async (provider: SmsProvider) => {
    await switchProvider.mutateAsync(provider)
  }

  const handleToggle = async () => {
    if (smsStatus) {
      await toggleSms.mutateAsync(!smsStatus.enabled)
      setIsToggleModalOpen(false)
    }
  }

  const handleSaveConfig = async () => {
    await updateConfig.mutateAsync({
      activeProvider: selectedProvider,
      retryAttempts,
      retryDelayMs,
    })
  }

  const handleSendTest = async () => {
    if (testPhone && testMessage) {
      await sendTestSms.mutateAsync({ phoneNumber: testPhone, message: testMessage })
    }
  }

  const sections = [
    { id: 'status' as const, label: 'Статус', icon: Activity },
    { id: 'provider' as const, label: 'Провайдер', icon: Radio },
    { id: 'test' as const, label: 'Тестирование', icon: MessageSquare },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Настройки SMS API</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Управление SMS-провайдерами и конфигурацией API
          </p>
        </div>
        <div className="flex items-center gap-2">
          {smsStatus && (
            <Badge variant={smsStatus.enabled ? 'success' : 'destructive'}>
              {smsStatus.enabled ? 'SMS активен' : 'SMS отключён'}
            </Badge>
          )}
          <Button
            variant="outline"
            onClick={() => setIsToggleModalOpen(true)}
          >
            {smsStatus?.enabled ? (
              <>
                <PowerOff className="mr-2 h-4 w-4" />
                Отключить
              </>
            ) : (
              <>
                <Power className="mr-2 h-4 w-4" />
                Включить
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Service disabled alert */}
      {smsStatus && !smsStatus.enabled && (
        <div className="rounded-lg border border-[hsl(var(--destructive))]/50 bg-[hsl(var(--destructive))]/5 p-4">
          <div className="flex items-center gap-3">
            <PowerOff className="h-5 w-5 text-[hsl(var(--destructive))]" />
            <div>
              <p className="font-medium text-[hsl(var(--destructive))]">
                SMS-сервис отключён
              </p>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Уведомления по SMS не будут отправляться пока сервис отключён
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-2">
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      activeSection === section.id
                        ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                        : 'hover:bg-[hsl(var(--muted))]'
                    }`}
                  >
                    <section.icon className="h-4 w-4" />
                    {section.label}
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeSection === 'status' && smsStatus && (
            <div className="space-y-4">
              {/* Provider status cards */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Активный провайдер</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        smsStatus.enabled
                          ? 'bg-[hsl(var(--success))]/10'
                          : 'bg-[hsl(var(--muted))]'
                      }`}>
                        <Radio className={`h-5 w-5 ${
                          smsStatus.enabled
                            ? 'text-[hsl(var(--success))]'
                            : 'text-[hsl(var(--muted-foreground))]'
                        }`} />
                      </div>
                      <div>
                        <p className="text-lg font-semibold">{smsStatus.activeProvider}</p>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                          {smsStatus.enabled ? 'Работает' : 'Не активен'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Статистика за сегодня</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-2xl font-bold">{smsStatus.totalSentToday ?? 0}</p>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">Отправлено</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-[hsl(var(--destructive))]">
                          {smsStatus.failedToday ?? 0}
                        </p>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">Ошибки</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Provider details */}
              <Card>
                <CardHeader>
                  <CardTitle>Основной провайдер</CardTitle>
                  <CardDescription>Конфигурация основного SMS-провайдера</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {smsStatus.primaryProvider && (
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-lg border border-[hsl(var(--border))] p-3">
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">Провайдер</p>
                        <p className="font-medium">{smsStatus.primaryProvider.provider}</p>
                      </div>
                      <div className="rounded-lg border border-[hsl(var(--border))] p-3">
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">Статус</p>
                        <Badge variant={smsStatus.primaryProvider.enabled ? 'success' : 'secondary'}>
                          {smsStatus.primaryProvider.enabled ? 'Включён' : 'Отключён'}
                        </Badge>
                      </div>
                      {smsStatus.primaryProvider.baseUrl && (
                        <div className="rounded-lg border border-[hsl(var(--border))] p-3 md:col-span-2">
                          <p className="text-sm text-[hsl(var(--muted-foreground))]">Base URL</p>
                          <p className="font-mono text-sm">{smsStatus.primaryProvider.baseUrl}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {smsStatus.fallbackProvider && (
                <Card>
                  <CardHeader>
                    <CardTitle>Резервный провайдер</CardTitle>
                    <CardDescription>Используется при недоступности основного</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-lg border border-[hsl(var(--border))] p-3">
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">Провайдер</p>
                        <p className="font-medium">{smsStatus.fallbackProvider.provider}</p>
                      </div>
                      <div className="rounded-lg border border-[hsl(var(--border))] p-3">
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">Статус</p>
                        <Badge variant={smsStatus.fallbackProvider.enabled ? 'success' : 'secondary'}>
                          {smsStatus.fallbackProvider.enabled ? 'Включён' : 'Отключён'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {smsStatus.lastSentAt && (
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Последнее сообщение: {formatDateTime(smsStatus.lastSentAt)}
                </p>
              )}
            </div>
          )}

          {activeSection === 'provider' && (
            <div className="space-y-4">
              {/* Quick switch */}
              <Card>
                <CardHeader>
                  <CardTitle>Быстрое переключение провайдера</CardTitle>
                  <CardDescription>
                    Мгновенное переключение между SMS-провайдерами без перезагрузки
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {(['ESKIZ', 'DEVSMS'] as SmsProvider[]).map((provider) => (
                      <button
                        key={provider}
                        onClick={() => handleSwitchProvider(provider)}
                        disabled={switchProvider.isPending}
                        className={`flex items-center justify-between rounded-lg border p-4 text-left transition-colors ${
                          smsStatus?.activeProvider === provider
                            ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5'
                            : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]/50'
                        }`}
                      >
                        <div>
                          <p className="font-medium">{provider}</p>
                          <p className="text-sm text-[hsl(var(--muted-foreground))]">
                            {provider === 'ESKIZ'
                              ? 'Токен-аутентификация с авто-обновлением'
                              : 'Упрощённая токен-аутентификация'}
                          </p>
                        </div>
                        {smsStatus?.activeProvider === provider ? (
                          <Badge variant="success">Активен</Badge>
                        ) : (
                          <Badge variant="outline">Переключить</Badge>
                        )}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle>Конфигурация</CardTitle>
                  <CardDescription>Настройки повторных попыток и провайдера</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Активный провайдер</Label>
                    <Select
                      value={selectedProvider}
                      onChange={(e) => setSelectedProvider(e.target.value as SmsProvider)}
                    >
                      <option value="ESKIZ">Eskiz</option>
                      <option value="DEVSMS">DevSMS</option>
                    </Select>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Количество повторных попыток</Label>
                      <Input
                        type="number"
                        min={1}
                        max={5}
                        value={retryAttempts}
                        onChange={(e) => setRetryAttempts(Number(e.target.value))}
                      />
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        Максимум 3 попытки с экспоненциальной задержкой
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Задержка между попытками (мс)</Label>
                      <Input
                        type="number"
                        min={500}
                        max={10000}
                        step={500}
                        value={retryDelayMs}
                        onChange={(e) => setRetryDelayMs(Number(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSaveConfig}
                      disabled={updateConfig.isPending}
                    >
                      {updateConfig.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Сохранение...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Сохранить конфигурацию
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'test' && (
            <Card>
              <CardHeader>
                <CardTitle>Отправка тестового SMS</CardTitle>
                <CardDescription>
                  Проверьте работоспособность SMS-сервиса отправив тестовое сообщение
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Номер телефона</Label>
                  <Input
                    placeholder="+998901234567"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                  />
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    Формат: +998XXXXXXXXX
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Текст сообщения</Label>
                  <Input
                    placeholder="Тестовое сообщение от ZBR"
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleSendTest}
                  disabled={sendTestSms.isPending || !testPhone || !testMessage}
                >
                  {sendTestSms.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Отправка...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Отправить тестовое SMS
                    </>
                  )}
                </Button>

                {/* Test result */}
                {sendTestSms.isSuccess && (
                  <div className="rounded-lg border border-[hsl(var(--success))]/50 bg-[hsl(var(--success))]/5 p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-[hsl(var(--success))]" />
                      <div>
                        <p className="font-medium text-[hsl(var(--success))]">
                          SMS успешно отправлено
                        </p>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                          Провайдер: {sendTestSms.data.provider}
                          {sendTestSms.data.messageId && ` | ID: ${sendTestSms.data.messageId}`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {sendTestSms.isError && (
                  <div className="rounded-lg border border-[hsl(var(--destructive))]/50 bg-[hsl(var(--destructive))]/5 p-4">
                    <div className="flex items-center gap-3">
                      <XCircle className="h-5 w-5 text-[hsl(var(--destructive))]" />
                      <div>
                        <p className="font-medium text-[hsl(var(--destructive))]">
                          Ошибка отправки SMS
                        </p>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                          {(sendTestSms.error as Error)?.message || 'Неизвестная ошибка'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Toggle Modal */}
      <Modal
        isOpen={isToggleModalOpen}
        onClose={() => setIsToggleModalOpen(false)}
        title={smsStatus?.enabled ? 'Отключить SMS-сервис' : 'Включить SMS-сервис'}
        description={
          smsStatus?.enabled
            ? 'Вы уверены, что хотите отключить SMS-сервис?'
            : 'Включить SMS-сервис для отправки уведомлений?'
        }
      >
        {smsStatus?.enabled && (
          <div className="rounded-lg border border-[hsl(var(--warning))]/50 bg-[hsl(var(--warning))]/5 p-4">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              При отключении SMS-сервиса OTP-коды, уведомления о заказах и другие SMS не будут отправляться.
            </p>
          </div>
        )}
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsToggleModalOpen(false)}>
            Отмена
          </Button>
          <Button
            variant={smsStatus?.enabled ? 'destructive' : 'success'}
            onClick={handleToggle}
            disabled={toggleSms.isPending}
          >
            {toggleSms.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {smsStatus?.enabled ? 'Отключить' : 'Включить'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
