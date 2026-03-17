import { useState, useEffect } from 'react'
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
  KeyRound,
  Eye,
  EyeOff,
  Shield,
  Save,
  AlertTriangle,
  ArrowRight,
  FileText,
  Plus,
  Upload,
  Pencil,
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
  Textarea,
} from '@/components/ui'
import { useToastActions } from '@/components/ui/toast'
import {
  useSmsStatus,
  useUpdateSmsConfig,
  useSwitchSmsProvider,
  useToggleSms,
  useSendTestSms,
  useProviderDetails,
  useUpdateProviderCredentials,
  useEnableProvider,
  useDisableProvider,
} from '@/hooks/useSms'
import {
  useSmsTemplates,
  useSmsTemplateStats,
  useCreateSmsTemplate,
  useUpdateSmsTemplate,
  useSyncSmsTemplate,
  useSyncAllSmsTemplates,
} from '@/hooks/useSmsTemplates'
import type { SmsProvider, SmsTemplate, SmsTemplateRequest, SmsTemplateType } from '@/types'

type Section = 'status' | 'provider' | 'credentials' | 'test' | 'templates'

export function ApiSettingsPage() {
  const { data: smsStatus, isLoading, error } = useSmsStatus()
  const updateConfig = useUpdateSmsConfig()
  const switchProvider = useSwitchSmsProvider()
  const toggleSms = useToggleSms()
  const sendTestSms = useSendTestSms()
  const updateCredentials = useUpdateProviderCredentials()
  const enableProvider = useEnableProvider()
  const disableProvider = useDisableProvider()
  const toast = useToastActions()

  // SMS Templates
  const { data: templates, isLoading: templatesLoading } = useSmsTemplates()
  const { data: templateStats } = useSmsTemplateStats()
  const createTemplate = useCreateSmsTemplate()
  const updateTemplate = useUpdateSmsTemplate()
  const syncTemplate = useSyncSmsTemplate()
  const syncAllTemplates = useSyncAllSmsTemplates()

  const [activeSection, setActiveSection] = useState<Section>('status')
  const [testPhone, setTestPhone] = useState('')
  const [testMessage, setTestMessage] = useState('')
  const [isToggleModalOpen, setIsToggleModalOpen] = useState(false)

  // Template form state
  const [isTemplateFormOpen, setIsTemplateFormOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<SmsTemplate | null>(null)
  const [tplName, setTplName] = useState('')
  const [tplCode, setTplCode] = useState('')
  const [tplContent, setTplContent] = useState('')
  const [tplType, setTplType] = useState<SmsTemplateType>('OTP')
  const [tplProvider, setTplProvider] = useState<SmsProvider>('ESKIZ')
  const [tplDescription, setTplDescription] = useState('')
  const [tplLanguage, setTplLanguage] = useState('uz')

  // Config form state
  const [configProvider, setConfigProvider] = useState<SmsProvider>('ESKIZ')
  const [configFallbackEnabled, setConfigFallbackEnabled] = useState(true)
  const [configFallbackProvider, setConfigFallbackProvider] = useState<SmsProvider>('DEVSMS')
  const [configHasChanges, setConfigHasChanges] = useState(false)

  // Credentials form state
  const [credProvider, setCredProvider] = useState<SmsProvider>('ESKIZ')
  const [credEnabled, setCredEnabled] = useState(true)
  const [credEmail, setCredEmail] = useState('')
  const [credPassword, setCredPassword] = useState('')
  const [credToken, setCredToken] = useState('')
  const [credFrom, setCredFrom] = useState('4546')
  const [showPassword, setShowPassword] = useState(false)
  const [showToken, setShowToken] = useState(false)
  const [showSwitchAfterSave, setShowSwitchAfterSave] = useState(false)
  const [savedCredProvider, setSavedCredProvider] = useState<SmsProvider | null>(null)

  // Provider details
  const [detailsProvider, setDetailsProvider] = useState<SmsProvider>('ESKIZ')
  const { data: providerDetails, isLoading: detailsLoading } = useProviderDetails(detailsProvider)

  // Initialize config form from server data
  useEffect(() => {
    if (smsStatus) {
      setConfigProvider(smsStatus.currentProvider)
      setConfigFallbackEnabled(smsStatus.fallbackEnabled)
      setConfigFallbackProvider(smsStatus.fallbackProvider)
      setConfigHasChanges(false)
    }
  }, [smsStatus])

  // Pre-fill credentials enabled state from provider details
  useEffect(() => {
    if (providerDetails && providerDetails.provider === credProvider) {
      setCredEnabled(providerDetails.enabled)
      setCredFrom(providerDetails.from || '4546')
    }
  }, [providerDetails, credProvider])

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

  const handleToggle = async () => {
    if (!smsStatus) return
    try {
      await toggleSms.mutateAsync(!smsStatus.enabled)
      toast.success(
        smsStatus.enabled ? 'SMS-сервис отключён' : 'SMS-сервис включён'
      )
      setIsToggleModalOpen(false)
    } catch {
      toast.error('Ошибка', 'Не удалось изменить статус SMS-сервиса')
    }
  }

  const handleSaveConfig = async () => {
    try {
      await updateConfig.mutateAsync({
        provider: configProvider,
        fallbackEnabled: configFallbackEnabled,
        fallbackProvider: configFallbackProvider,
        enabled: smsStatus?.enabled,
      })
      setConfigHasChanges(false)
      toast.success('Конфигурация сохранена')
    } catch {
      toast.error('Ошибка', 'Не удалось сохранить конфигурацию')
    }
  }

  const handleResetConfig = () => {
    if (smsStatus) {
      setConfigProvider(smsStatus.currentProvider)
      setConfigFallbackEnabled(smsStatus.fallbackEnabled)
      setConfigFallbackProvider(smsStatus.fallbackProvider)
      setConfigHasChanges(false)
    }
  }

  const handleSaveCredentials = async () => {
    try {
      await updateCredentials.mutateAsync({
        provider: credProvider,
        enabled: credEnabled,
        from: credFrom,
        ...(credProvider === 'ESKIZ'
          ? { email: credEmail, password: credPassword }
          : { token: credToken }),
      })
      toast.success('Учётные данные обновлены', `Провайдер: ${credProvider}`)
      // Offer to switch if this isn't the current provider
      if (smsStatus && credProvider !== smsStatus.currentProvider && credEnabled) {
        setSavedCredProvider(credProvider)
        setShowSwitchAfterSave(true)
      }
    } catch {
      toast.error('Ошибка', 'Не удалось обновить учётные данные')
    }
  }

  const handleSwitchAfterSave = async () => {
    if (!savedCredProvider) return
    try {
      await switchProvider.mutateAsync(savedCredProvider)
      toast.success('Провайдер переключён', `Активный провайдер: ${savedCredProvider}`)
    } catch {
      toast.error('Ошибка', `Не удалось переключиться на ${savedCredProvider}`)
    }
    setShowSwitchAfterSave(false)
    setSavedCredProvider(null)
  }

  const getProviderInfo = (provider: SmsProvider) =>
    smsStatus?.providers?.find((p) => p.type === provider)

  const handleSwitchProvider = async (provider: SmsProvider) => {
    const info = getProviderInfo(provider)
    if (info && !info.available) {
      toast.error(
        `${provider} недоступен`,
        info.configured
          ? 'Провайдер не включён. Включите его или настройте учётные данные.'
          : 'Сначала настройте учётные данные провайдера.'
      )
      return
    }
    try {
      await switchProvider.mutateAsync(provider)
      toast.success('Провайдер переключён', `Активный провайдер: ${provider}`)
    } catch {
      toast.error(
        'Ошибка',
        `Не удалось переключиться на ${provider}. Убедитесь, что провайдер включён и имеет настроенные учётные данные.`
      )
    }
  }

  const handleSendTest = async () => {
    if (!testPhone || !testMessage) return
    try {
      await sendTestSms.mutateAsync({ phoneNumber: testPhone, message: testMessage })
    } catch {
      // Error shown inline
    }
  }

  const handleToggleProvider = async (provider: SmsProvider, currentlyEnabled: boolean) => {
    try {
      if (currentlyEnabled) {
        await disableProvider.mutateAsync(provider)
        toast.warning(`${provider} отключён`)
      } else {
        await enableProvider.mutateAsync(provider)
        toast.success(`${provider} включён`)
      }
    } catch {
      toast.error(
        'Ошибка',
        currentlyEnabled
          ? `Не удалось отключить ${provider}`
          : `Не удалось включить ${provider}. Возможно, учётные данные не настроены.`
      )
    }
  }

  const markConfigChanged = () => setConfigHasChanges(true)

  const sections = [
    { id: 'status' as const, label: 'Статус', icon: Activity },
    { id: 'provider' as const, label: 'Провайдер', icon: Radio },
    { id: 'credentials' as const, label: 'Учётные данные', icon: KeyRound },
    { id: 'test' as const, label: 'Тестирование', icon: MessageSquare },
    { id: 'templates' as const, label: 'Шаблоны', icon: FileText },
  ]

  const openTemplateForm = (template?: SmsTemplate) => {
    if (template) {
      setEditingTemplate(template)
      setTplName(template.name)
      setTplCode(template.templateCode)
      setTplContent(template.content)
      setTplType(template.templateType)
      setTplProvider(template.provider)
      setTplDescription(template.description ?? '')
      setTplLanguage(template.language ?? 'uz')
    } else {
      setEditingTemplate(null)
      setTplName('')
      setTplCode('')
      setTplContent('')
      setTplType('OTP')
      setTplProvider(smsStatus?.currentProvider ?? 'ESKIZ')
      setTplDescription('')
      setTplLanguage('uz')
    }
    setIsTemplateFormOpen(true)
  }

  const handleSaveTemplate = async () => {
    // Extract variables from content like {code}, {minutes}
    const variables = [...tplContent.matchAll(/\{(\w+)}/g)].map((m) => m[1])
    const data: SmsTemplateRequest = {
      name: tplName,
      templateCode: tplCode,
      content: tplContent,
      templateType: tplType,
      provider: tplProvider,
      variables,
      language: tplLanguage,
      description: tplDescription || undefined,
    }
    try {
      if (editingTemplate) {
        await updateTemplate.mutateAsync({ id: editingTemplate.id, data })
        toast.success('Шаблон обновлён')
      } else {
        await createTemplate.mutateAsync(data)
        toast.success('Шаблон создан')
      }
      setIsTemplateFormOpen(false)
    } catch {
      toast.error('Ошибка', editingTemplate ? 'Не удалось обновить шаблон' : 'Не удалось создать шаблон')
    }
  }

  const handleSyncAll = async () => {
    try {
      const results = await syncAllTemplates.mutateAsync()
      const successCount = results.filter((r) => r.success).length
      toast.success(`Синхронизировано ${successCount} из ${results.length} шаблонов`)
    } catch {
      toast.error('Ошибка', 'Не удалось синхронизировать шаблоны')
    }
  }

  const handleSyncTemplate = async (id: number) => {
    try {
      const result = await syncTemplate.mutateAsync(id)
      if (result.success) {
        toast.success(result.message || 'Шаблон синхронизирован')
      } else {
        toast.warning(result.message || 'Синхронизация не удалась')
      }
    } catch {
      toast.error('Ошибка', 'Не удалось синхронизировать шаблон')
    }
  }

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
          {/* ===== STATUS SECTION ===== */}
          {activeSection === 'status' && smsStatus && (
            <div className="space-y-4">
              {/* Overview cards */}
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
                        <p className="text-lg font-semibold">{smsStatus.currentProvider}</p>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                          {smsStatus.enabled ? 'Работает' : 'Не активен'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Резервный провайдер</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        smsStatus.fallbackEnabled
                          ? 'bg-[hsl(var(--primary))]/10'
                          : 'bg-[hsl(var(--muted))]'
                      }`}>
                        <Shield className={`h-5 w-5 ${
                          smsStatus.fallbackEnabled
                            ? 'text-[hsl(var(--primary))]'
                            : 'text-[hsl(var(--muted-foreground))]'
                        }`} />
                      </div>
                      <div>
                        <p className="text-lg font-semibold">{smsStatus.fallbackProvider}</p>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                          {smsStatus.fallbackEnabled ? 'Фоллбэк включён' : 'Фоллбэк отключён'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Provider list */}
              <Card>
                <CardHeader>
                  <CardTitle>Провайдеры</CardTitle>
                  <CardDescription>Статус и доступность всех SMS-провайдеров</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(smsStatus.providers ?? []).map((provider) => (
                    <div
                      key={provider.type}
                      className="flex items-center justify-between rounded-lg border border-[hsl(var(--border))] p-4"
                    >
                      <div>
                        <p className="font-medium">{provider.type}</p>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                          {provider.statusMessage}
                        </p>
                        {!provider.available && provider.configured && (
                          <p className="mt-1 text-xs text-[hsl(var(--warning))]">
                            Настроен, но не включён — используйте toggle или сохраните учётные данные с enabled: true
                          </p>
                        )}
                        {!provider.configured && (
                          <button
                            onClick={() => {
                              setCredProvider(provider.type)
                              setActiveSection('credentials')
                            }}
                            className="mt-1 inline-flex items-center gap-1 text-xs text-[hsl(var(--primary))] hover:underline"
                          >
                            Настроить учётные данные
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={provider.configured ? 'success' : 'secondary'}>
                          {provider.configured ? 'Настроен' : 'Не настроен'}
                        </Badge>
                        <Badge variant={provider.available ? 'success' : 'destructive'}>
                          {provider.available ? 'Доступен' : 'Недоступен'}
                        </Badge>
                        <button
                          onClick={() => handleToggleProvider(provider.type, provider.available)}
                          disabled={enableProvider.isPending || disableProvider.isPending}
                          title={provider.available ? 'Отключить провайдер' : 'Включить провайдер'}
                          className={`relative h-6 w-11 rounded-full transition-colors ${
                            provider.available
                              ? 'bg-[hsl(var(--success))]'
                              : 'bg-[hsl(var(--muted))]'
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                              provider.available ? 'left-[22px]' : 'left-0.5'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Provider details viewer */}
              <Card>
                <CardHeader>
                  <CardTitle>Детали провайдера</CardTitle>
                  <CardDescription>Подробная информация о конфигурации</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select
                    value={detailsProvider}
                    onChange={(e) => setDetailsProvider(e.target.value as SmsProvider)}
                  >
                    <option value="ESKIZ">Eskiz</option>
                    <option value="DEVSMS">DevSMS</option>
                  </Select>

                  {detailsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--primary))]" />
                    </div>
                  ) : providerDetails ? (
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-lg border border-[hsl(var(--border))] p-3">
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">Провайдер</p>
                        <p className="font-medium">{providerDetails.provider}</p>
                      </div>
                      <div className="rounded-lg border border-[hsl(var(--border))] p-3">
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">Статус</p>
                        <Badge variant={providerDetails.enabled ? 'success' : 'secondary'}>
                          {providerDetails.enabled ? 'Включён' : 'Отключён'}
                        </Badge>
                      </div>
                      <div className="rounded-lg border border-[hsl(var(--border))] p-3">
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">Base URL</p>
                        <p className="font-mono text-sm">{providerDetails.baseUrl}</p>
                      </div>
                      <div className="rounded-lg border border-[hsl(var(--border))] p-3">
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">Отправитель</p>
                        <p className="font-medium">{providerDetails.from}</p>
                      </div>
                      <div className="rounded-lg border border-[hsl(var(--border))] p-3">
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">Токен</p>
                        <Badge variant={providerDetails.hasToken ? 'success' : 'warning'}>
                          {providerDetails.hasToken ? 'Установлен' : 'Отсутствует'}
                        </Badge>
                      </div>
                      <div className="rounded-lg border border-[hsl(var(--border))] p-3">
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">Доступность</p>
                        <Badge variant={providerDetails.available ? 'success' : 'destructive'}>
                          {providerDetails.available ? 'Доступен' : 'Недоступен'}
                        </Badge>
                      </div>
                      {providerDetails.callbackUrl && (
                        <div className="rounded-lg border border-[hsl(var(--border))] p-3 md:col-span-2">
                          <p className="text-sm text-[hsl(var(--muted-foreground))]">Callback URL</p>
                          <p className="font-mono text-sm">{providerDetails.callbackUrl}</p>
                        </div>
                      )}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </div>
          )}

          {/* ===== PROVIDER SECTION ===== */}
          {activeSection === 'provider' && (
            <div className="space-y-4">
              {/* Quick switch */}
              <Card>
                <CardHeader>
                  <CardTitle>Быстрое переключение провайдера</CardTitle>
                  <CardDescription>
                    Переключение требует, чтобы провайдер был включён и имел настроенные учётные данные
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    {(['ESKIZ', 'DEVSMS'] as SmsProvider[]).map((provider) => {
                      const info = getProviderInfo(provider)
                      const isActive = smsStatus?.currentProvider === provider
                      const isAvailable = info?.available ?? false
                      const isConfigured = info?.configured ?? false
                      return (
                        <button
                          key={provider}
                          onClick={() => handleSwitchProvider(provider)}
                          disabled={switchProvider.isPending || isActive}
                          className={`flex flex-col gap-3 rounded-lg border p-4 text-left transition-colors ${
                            isActive
                              ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5'
                              : isAvailable
                                ? 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]/50'
                                : 'border-[hsl(var(--border))] opacity-75'
                          }`}
                        >
                          <div className="flex w-full items-center justify-between">
                            <div>
                              <p className="font-medium">{provider}</p>
                              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                {provider === 'ESKIZ'
                                  ? 'Email/пароль аутентификация'
                                  : 'Токен-аутентификация'}
                              </p>
                            </div>
                            {isActive ? (
                              <Badge variant="success">Активен</Badge>
                            ) : isAvailable ? (
                              <Badge variant="outline">Переключить</Badge>
                            ) : (
                              <Badge variant="warning">Недоступен</Badge>
                            )}
                          </div>
                          {!isActive && !isAvailable && (
                            <div className="flex items-center gap-2 text-xs text-[hsl(var(--warning))]">
                              <AlertTriangle className="h-3 w-3 shrink-0" />
                              {!isConfigured
                                ? 'Учётные данные не настроены'
                                : 'Провайдер отключён — включите через учётные данные'}
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {/* Workflow hint */}
                  {smsStatus?.providers?.some((p) => !p.available && p.type !== smsStatus.currentProvider) && (
                    <div className="rounded-lg border border-[hsl(var(--primary))]/30 bg-[hsl(var(--primary))]/5 p-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--primary))]" />
                        <div className="text-sm text-[hsl(var(--muted-foreground))]">
                          <p className="font-medium text-[hsl(var(--foreground))]">Порядок подключения провайдера:</p>
                          <ol className="mt-1 list-inside list-decimal space-y-0.5">
                            <li>Настройте учётные данные во вкладке «Учётные данные»</li>
                            <li>Убедитесь, что провайдер включён (enabled: true)</li>
                            <li>Переключитесь на провайдер кнопкой выше</li>
                          </ol>
                          <button
                            onClick={() => setActiveSection('credentials')}
                            className="mt-2 inline-flex items-center gap-1 text-[hsl(var(--primary))] hover:underline"
                          >
                            Перейти к учётным данным
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Configuration */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Конфигурация</CardTitle>
                      <CardDescription>Настройки провайдера и фоллбэка</CardDescription>
                    </div>
                    {configHasChanges && (
                      <Badge variant="warning">Есть несохранённые изменения</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Основной провайдер</Label>
                      <Select
                        value={configProvider}
                        onChange={(e) => {
                          setConfigProvider(e.target.value as SmsProvider)
                          markConfigChanged()
                        }}
                      >
                        <option value="ESKIZ">Eskiz</option>
                        <option value="DEVSMS">DevSMS</option>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Резервный провайдер</Label>
                      <Select
                        value={configFallbackProvider}
                        onChange={(e) => {
                          setConfigFallbackProvider(e.target.value as SmsProvider)
                          markConfigChanged()
                        }}
                      >
                        <option value="ESKIZ">Eskiz</option>
                        <option value="DEVSMS">DevSMS</option>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-[hsl(var(--border))] p-4">
                    <div>
                      <p className="font-medium">Автоматический фоллбэк</p>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        Автоматически переключаться на резервный провайдер при сбое
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setConfigFallbackEnabled(!configFallbackEnabled)
                        markConfigChanged()
                      }}
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        configFallbackEnabled
                          ? 'bg-[hsl(var(--success))]'
                          : 'bg-[hsl(var(--muted))]'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                          configFallbackEnabled ? 'left-[22px]' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={handleResetConfig}
                      disabled={!configHasChanges}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Сбросить
                    </Button>
                    <Button
                      onClick={handleSaveConfig}
                      disabled={!configHasChanges || updateConfig.isPending}
                    >
                      {updateConfig.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Сохранение...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Сохранить конфигурацию
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ===== CREDENTIALS SECTION ===== */}
          {activeSection === 'credentials' && (
            <Card>
              <CardHeader>
                <CardTitle>Учётные данные провайдера</CardTitle>
                <CardDescription>
                  Обновление ключей аутентификации для SMS-провайдеров
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Провайдер</Label>
                    <Select
                      value={credProvider}
                      onChange={(e) => setCredProvider(e.target.value as SmsProvider)}
                    >
                      <option value="ESKIZ">Eskiz</option>
                      <option value="DEVSMS">DevSMS</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Sender ID (from)</Label>
                    <Input
                      placeholder="4546"
                      value={credFrom}
                      onChange={(e) => setCredFrom(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-[hsl(var(--border))] p-4">
                  <div>
                    <p className="font-medium">Провайдер включён</p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                      Включить или отключить {credProvider} при сохранении
                    </p>
                  </div>
                  <button
                    onClick={() => setCredEnabled(!credEnabled)}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      credEnabled
                        ? 'bg-[hsl(var(--success))]'
                        : 'bg-[hsl(var(--muted))]'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        credEnabled ? 'left-[22px]' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>

                {credProvider === 'ESKIZ' && (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-[hsl(var(--primary))]/30 bg-[hsl(var(--primary))]/5 p-3">
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        Eskiz использует email/пароль для аутентификации. Токен генерируется автоматически (TTL: 29 дней) и обновляется каждые 25 дней.
                      </p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          value={credEmail}
                          onChange={(e) => setCredEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Пароль</Label>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Пароль Eskiz"
                            value={credPassword}
                            onChange={(e) => setCredPassword(e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {credProvider === 'DEVSMS' && (
                  <div className="space-y-2">
                    <Label>API Токен</Label>
                    <div className="relative">
                      <Input
                        type={showToken ? 'text' : 'password'}
                        placeholder="DevSMS API токен"
                        value={credToken}
                        onChange={(e) => setCredToken(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowToken(!showToken)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                      >
                        {showToken ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      Токен для аутентификации с DevSMS API
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    После сохранения используйте «Быстрое переключение» для активации провайдера
                  </p>
                  <Button
                    onClick={handleSaveCredentials}
                    disabled={
                      updateCredentials.isPending ||
                      (credProvider === 'ESKIZ' ? !credEmail || !credPassword : !credToken)
                    }
                  >
                    {updateCredentials.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Сохранение...
                      </>
                    ) : (
                      <>
                        <KeyRound className="mr-2 h-4 w-4" />
                        Сохранить учётные данные
                      </>
                    )}
                  </Button>
                </div>

                {/* Switch prompt after saving credentials */}
                {showSwitchAfterSave && savedCredProvider && (
                  <div className="rounded-lg border border-[hsl(var(--success))]/50 bg-[hsl(var(--success))]/5 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-[hsl(var(--success))]" />
                        <div>
                          <p className="font-medium text-[hsl(var(--success))]">
                            Учётные данные {savedCredProvider} сохранены
                          </p>
                          <p className="text-sm text-[hsl(var(--muted-foreground))]">
                            Переключить активный провайдер на {savedCredProvider}?
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { setShowSwitchAfterSave(false); setSavedCredProvider(null) }}
                        >
                          Позже
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSwitchAfterSave}
                          disabled={switchProvider.isPending}
                        >
                          {switchProvider.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <ArrowRight className="mr-2 h-4 w-4" />
                          )}
                          Переключить
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* ===== TEST SECTION ===== */}
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
                    Формат: +998XXXXXXXXX, 998XXXXXXXXX, 8XXXXXXXXX или 9XXXXXXXXX
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

                {sendTestSms.isSuccess && (
                  <div className="rounded-lg border border-[hsl(var(--success))]/50 bg-[hsl(var(--success))]/5 p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-[hsl(var(--success))]" />
                      <div>
                        <p className="font-medium text-[hsl(var(--success))]">
                          {sendTestSms.data.message}
                        </p>
                        {sendTestSms.data.data && (
                          <p className="text-sm text-[hsl(var(--muted-foreground))]">
                            {sendTestSms.data.data}
                          </p>
                        )}
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

          {/* ===== TEMPLATES SECTION ===== */}
          {activeSection === 'templates' && (
            <div className="space-y-4">
              {/* Stats */}
              {templateStats && (
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold">{templateStats.total}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">Всего</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-[hsl(var(--muted-foreground))]">{templateStats.draft}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">Черновик</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-[hsl(var(--warning))]">{templateStats.pending}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">Ожидание</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-[hsl(var(--success))]">{templateStats.approved}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">Одобрено</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Templates list */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>SMS-шаблоны</CardTitle>
                      <CardDescription>Управление шаблонами сообщений для провайдеров</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={handleSyncAll}
                        disabled={syncAllTemplates.isPending}
                      >
                        {syncAllTemplates.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="mr-2 h-4 w-4" />
                        )}
                        Синхронизировать все
                      </Button>
                      <Button onClick={() => openTemplateForm()}>
                        <Plus className="mr-2 h-4 w-4" />
                        Создать шаблон
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {templatesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--muted-foreground))]" />
                    </div>
                  ) : !templates?.length ? (
                    <div className="py-8 text-center text-[hsl(var(--muted-foreground))]">
                      <FileText className="mx-auto mb-2 h-8 w-8" />
                      <p>Шаблоны не найдены</p>
                      <p className="text-sm">Создайте первый шаблон для начала работы</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {templates.map((tpl) => (
                        <div
                          key={tpl.id}
                          className="flex items-start justify-between rounded-lg border border-[hsl(var(--border))] p-4"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-medium">{tpl.name}</p>
                              <Badge
                                variant={
                                  tpl.status === 'APPROVED'
                                    ? 'success'
                                    : tpl.status === 'PENDING'
                                      ? 'warning'
                                      : 'secondary'
                                }
                              >
                                {tpl.status === 'APPROVED'
                                  ? 'Одобрен'
                                  : tpl.status === 'PENDING'
                                    ? 'Ожидание'
                                    : 'Черновик'}
                              </Badge>
                              <Badge variant="outline">{tpl.provider}</Badge>
                              <Badge variant="outline">{tpl.templateType}</Badge>
                              {!tpl.active && (
                                <Badge variant="destructive">Неактивен</Badge>
                              )}
                            </div>
                            <p className="mt-1 font-mono text-xs text-[hsl(var(--muted-foreground))]">
                              {tpl.templateCode}
                            </p>
                            {tpl.description && (
                              <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
                                {tpl.description}
                              </p>
                            )}
                            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                              {tpl.content.length > 120 ? `${tpl.content.slice(0, 120)}...` : tpl.content}
                            </p>
                            {tpl.variables?.length > 0 && (
                              <div className="mt-1 flex gap-1">
                                {tpl.variables.map((v) => (
                                  <span key={v} className="rounded bg-[hsl(var(--muted))] px-1.5 py-0.5 font-mono text-xs">
                                    {`{${v}}`}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="ml-4 flex shrink-0 gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openTemplateForm(tpl)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSyncTemplate(tpl.id)}
                              disabled={syncTemplate.isPending}
                            >
                              {syncTemplate.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Upload className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
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

      {/* Template Create/Edit Modal */}
      <Modal
        isOpen={isTemplateFormOpen}
        onClose={() => setIsTemplateFormOpen(false)}
        title={editingTemplate ? 'Редактировать шаблон' : 'Создать шаблон'}
        description={editingTemplate ? 'Измените параметры SMS-шаблона' : 'Заполните данные нового SMS-шаблона'}
      >
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Название</Label>
              <Input
                placeholder="OTP Signup"
                value={tplName}
                onChange={(e) => setTplName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Код шаблона</Label>
              <Input
                placeholder="OTP_SIGNUP"
                value={tplCode}
                onChange={(e) => setTplCode(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Тип</Label>
              <Select
                value={tplType}
                onChange={(e) => setTplType(e.target.value as SmsTemplateType)}
              >
                <option value="OTP">OTP</option>
                <option value="NOTIFICATION">Уведомление</option>
                <option value="MARKETING">Маркетинг</option>
                <option value="TRANSACTIONAL">Транзакционный</option>
                <option value="WELCOME">Приветствие</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Провайдер</Label>
              <Select
                value={tplProvider}
                onChange={(e) => setTplProvider(e.target.value as SmsProvider)}
              >
                <option value="ESKIZ">Eskiz</option>
                <option value="DEVSMS">DevSMS</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Язык</Label>
              <Select
                value={tplLanguage}
                onChange={(e) => setTplLanguage(e.target.value)}
              >
                <option value="uz">Узбекский</option>
                <option value="ru">Русский</option>
                <option value="en">Английский</option>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Описание</Label>
            <Input
              placeholder="OTP code for user signup"
              value={tplDescription}
              onChange={(e) => setTplDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Текст шаблона</Label>
            <Textarea
              placeholder="Ваш код подтверждения: {code}. Код действителен {minutes} минут."
              value={tplContent}
              onChange={(e) => setTplContent(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Используйте {'{переменная}'} для подстановки значений. Переменные определяются автоматически.
            </p>
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsTemplateFormOpen(false)}>
            Отмена
          </Button>
          <Button
            onClick={handleSaveTemplate}
            disabled={
              !tplName || !tplCode || !tplContent ||
              createTemplate.isPending || updateTemplate.isPending
            }
          >
            {(createTemplate.isPending || updateTemplate.isPending) ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {editingTemplate ? 'Сохранить' : 'Создать'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
