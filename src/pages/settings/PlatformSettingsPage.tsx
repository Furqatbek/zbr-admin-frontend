import { useState, useEffect } from 'react'
import {
  Settings,
  Save,
  AlertTriangle,
  Store,
  Truck,
  CreditCard,
  Bell,
  Shield,
  Loader2,
  RefreshCw,
  MapPin,
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
import { usePlatformSettings, useUpdateSettings, useDeliveryFeeSettings, useUpdateDeliveryFeeSettings } from '@/hooks/useSettings'
import type { PlatformSettings, DeliveryFeeSettings } from '@/api/settings.api'

const defaultSettings: PlatformSettings = {
  platformName: '',
  supportEmail: '',
  supportPhone: '',
  defaultCurrency: 'UZS',
  timezone: 'Europe/Moscow',
  maintenanceMode: false,
  maintenanceMessage: '',
  orderSettings: {
    minOrderAmount: 0,
    maxOrderAmount: 0,
    defaultDeliveryRadius: 0,
    maxDeliveryRadius: 0,
    freeDeliveryThreshold: 0,
    baseDeliveryFee: 0,
  },
  courierSettings: {
    maxActiveOrders: 0,
    autoAssignEnabled: false,
    verificationRequired: false,
    minRatingForBonus: 0,
  },
  restaurantSettings: {
    commissionRate: 0,
    autoApproveEnabled: false,
    maxPrepTime: 0,
    minRating: 0,
  },
  notificationSettings: {
    emailEnabled: false,
    smsEnabled: false,
    pushEnabled: false,
    marketingEnabled: false,
  },
}

const defaultDeliveryFeeSettings: DeliveryFeeSettings = {
  baseFee: 0,
  perKmFee: 0,
  minFee: 0,
  maxFee: 0,
  peakHourSurcharge: 0,
  peakStartHour: 12,
  peakEndHour: 14,
  routingEnabled: false,
  routingOsrmBaseUrl: '',
  routingConnectTimeout: 5000,
  routingReadTimeout: 5000,
}

type SettingsSection = 'general' | 'orders' | 'delivery' | 'couriers' | 'restaurants' | 'notifications'

export function PlatformSettingsPage() {
  const { data: platformSettings, isLoading, error } = usePlatformSettings()
  const updateSettings = useUpdateSettings()

  const { data: deliveryFeeData, isLoading: isLoadingDeliveryFee, error: deliveryFeeError } = useDeliveryFeeSettings()
  const updateDeliveryFee = useUpdateDeliveryFeeSettings()

  const [settings, setSettings] = useState<PlatformSettings>(defaultSettings)
  const [deliveryFeeSettings, setDeliveryFeeSettings] = useState<DeliveryFeeSettings>(defaultDeliveryFeeSettings)
  const [activeSection, setActiveSection] = useState<SettingsSection>('general')
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [hasDeliveryFeeChanges, setHasDeliveryFeeChanges] = useState(false)

  useEffect(() => {
    if (platformSettings) {
      setSettings(platformSettings)
    }
  }, [platformSettings])

  useEffect(() => {
    if (deliveryFeeData) {
      setDeliveryFeeSettings(deliveryFeeData)
    }
  }, [deliveryFeeData])

  const handleChange = <T extends keyof PlatformSettings>(
    section: T,
    field: string,
    value: unknown
  ) => {
    if (typeof settings[section] === 'object' && settings[section] !== null) {
      setSettings({
        ...settings,
        [section]: {
          ...(settings[section] as Record<string, unknown>),
          [field]: value,
        },
      })
    } else {
      setSettings({
        ...settings,
        [section]: value as PlatformSettings[T],
      })
    }
    setHasChanges(true)
  }

  const handleDeliveryFeeChange = (field: keyof DeliveryFeeSettings, value: number | string | boolean) => {
    setDeliveryFeeSettings((prev) => ({ ...prev, [field]: value }))
    setHasDeliveryFeeChanges(true)
  }

  const handleSave = async () => {
    if (activeSection === 'delivery') {
      await updateDeliveryFee.mutateAsync(deliveryFeeSettings)
      setHasDeliveryFeeChanges(false)
    } else {
      await updateSettings.mutateAsync(settings)
      setHasChanges(false)
    }
  }

  const handleReset = () => {
    if (activeSection === 'delivery') {
      if (deliveryFeeData) {
        setDeliveryFeeSettings(deliveryFeeData)
        setHasDeliveryFeeChanges(false)
      }
    } else if (platformSettings) {
      setSettings(platformSettings)
      setHasChanges(false)
    }
  }

  const currentHasChanges = activeSection === 'delivery' ? hasDeliveryFeeChanges : hasChanges
  const isSaving = activeSection === 'delivery' ? updateDeliveryFee.isPending : updateSettings.isPending

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
        <p className="text-[hsl(var(--destructive))]">Ошибка загрузки настроек</p>
      </div>
    )
  }

  const sections = [
    { id: 'general' as const, label: 'Общие', icon: Settings },
    { id: 'orders' as const, label: 'Заказы', icon: CreditCard },
    { id: 'delivery' as const, label: 'Доставка', icon: MapPin },
    { id: 'couriers' as const, label: 'Курьеры', icon: Truck },
    { id: 'restaurants' as const, label: 'Рестораны', icon: Store },
    { id: 'notifications' as const, label: 'Уведомления', icon: Bell },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Настройки платформы</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Конфигурация системных параметров
          </p>
        </div>
        <div className="flex items-center gap-2">
          {currentHasChanges && (
            <Badge variant="warning">Есть несохранённые изменения</Badge>
          )}
          <Button variant="outline" onClick={handleReset} disabled={!currentHasChanges}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Сбросить
          </Button>
          <Button onClick={handleSave} disabled={!currentHasChanges || isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Сохранение...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Сохранить
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Maintenance Mode Alert */}
      {settings.maintenanceMode && (
        <div className="rounded-lg border border-[hsl(var(--warning))]/50 bg-[hsl(var(--warning))]/5 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-[hsl(var(--warning))]" />
              <div>
                <p className="font-medium text-[hsl(var(--warning))]">
                  Режим обслуживания активен
                </p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  {settings.maintenanceMessage || 'Платформа недоступна для пользователей'}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleChange('maintenanceMode' as keyof typeof settings, '', false)
              }
            >
              Отключить
            </Button>
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

          <Card className="mt-4">
            <CardContent className="pt-6">
              <button
                onClick={() => setIsMaintenanceModalOpen(true)}
                className="flex w-full items-center gap-3 rounded-lg border border-[hsl(var(--warning))]/50 bg-[hsl(var(--warning))]/5 px-3 py-2 text-left text-sm hover:bg-[hsl(var(--warning))]/10"
              >
                <Shield className="h-4 w-4 text-[hsl(var(--warning))]" />
                <span>Режим обслуживания</span>
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeSection === 'general' && (
            <Card>
              <CardHeader>
                <CardTitle>Общие настройки</CardTitle>
                <CardDescription>Основные параметры платформы</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Название платформы</Label>
                    <Input
                      value={settings.platformName}
                      onChange={(e) =>
                        handleChange('platformName' as keyof typeof settings, '', e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Часовой пояс</Label>
                    <Select
                      value={settings.timezone}
                      onChange={(e) =>
                        handleChange('timezone' as keyof typeof settings, '', e.target.value)
                      }
                    >
                      <option value="Europe/Moscow">Москва (UTC+3)</option>
                      <option value="Europe/Samara">Самара (UTC+4)</option>
                      <option value="Asia/Yekaterinburg">Екатеринбург (UTC+5)</option>
                      <option value="Asia/Novosibirsk">Новосибирск (UTC+7)</option>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Email поддержки</Label>
                    <Input
                      type="email"
                      value={settings.supportEmail}
                      onChange={(e) =>
                        handleChange('supportEmail' as keyof typeof settings, '', e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Телефон поддержки</Label>
                    <Input
                      value={settings.supportPhone}
                      onChange={(e) =>
                        handleChange('supportPhone' as keyof typeof settings, '', e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Валюта по умолчанию</Label>
                  <Select
                    value={settings.defaultCurrency}
                    onChange={(e) =>
                      handleChange('defaultCurrency' as keyof typeof settings, '', e.target.value)
                    }
                  >
                    <option value="UZS">O'zbek so'm (сўм)</option>
                    <option value="USD">Доллар США ($)</option>
                    <option value="EUR">Евро (€)</option>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'orders' && (
            <Card>
              <CardHeader>
                <CardTitle>Настройки заказов</CardTitle>
                <CardDescription>Параметры обработки заказов</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Мин. сумма заказа</Label>
                    <Input
                      type="number"
                      value={settings.orderSettings.minOrderAmount}
                      onChange={(e) =>
                        handleChange('orderSettings', 'minOrderAmount', Number(e.target.value))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Макс. сумма заказа</Label>
                    <Input
                      type="number"
                      value={settings.orderSettings.maxOrderAmount}
                      onChange={(e) =>
                        handleChange('orderSettings', 'maxOrderAmount', Number(e.target.value))
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Радиус доставки по умолчанию (км)</Label>
                    <Input
                      type="number"
                      value={settings.orderSettings.defaultDeliveryRadius}
                      onChange={(e) =>
                        handleChange('orderSettings', 'defaultDeliveryRadius', Number(e.target.value))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Макс. радиус доставки (км)</Label>
                    <Input
                      type="number"
                      value={settings.orderSettings.maxDeliveryRadius}
                      onChange={(e) =>
                        handleChange('orderSettings', 'maxDeliveryRadius', Number(e.target.value))
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Порог бесплатной доставки</Label>
                    <Input
                      type="number"
                      value={settings.orderSettings.freeDeliveryThreshold}
                      onChange={(e) =>
                        handleChange('orderSettings', 'freeDeliveryThreshold', Number(e.target.value))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Базовая стоимость доставки</Label>
                    <Input
                      type="number"
                      value={settings.orderSettings.baseDeliveryFee}
                      onChange={(e) =>
                        handleChange('orderSettings', 'baseDeliveryFee', Number(e.target.value))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'delivery' && (
            <Card>
              <CardHeader>
                <CardTitle>Настройки стоимости доставки</CardTitle>
                <CardDescription>Тарифы и наценки за доставку</CardDescription>
              </CardHeader>
              {isLoadingDeliveryFee ? (
                <CardContent>
                  <div className="flex h-40 items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--primary))]" />
                  </div>
                </CardContent>
              ) : deliveryFeeError ? (
                <CardContent>
                  <div className="flex h-40 items-center justify-center">
                    <p className="text-[hsl(var(--destructive))]">Ошибка загрузки настроек доставки</p>
                  </div>
                </CardContent>
              ) : (
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Базовая стоимость</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={deliveryFeeSettings.baseFee}
                      onChange={(e) =>
                        handleDeliveryFeeChange('baseFee', Number(e.target.value))
                      }
                    />
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      Фиксированная плата за каждую доставку
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Стоимость за км</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={deliveryFeeSettings.perKmFee}
                      onChange={(e) =>
                        handleDeliveryFeeChange('perKmFee', Number(e.target.value))
                      }
                    />
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      Дополнительная плата за каждый километр
                    </p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Минимальная стоимость</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={deliveryFeeSettings.minFee}
                      onChange={(e) =>
                        handleDeliveryFeeChange('minFee', Number(e.target.value))
                      }
                    />
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      Минимальная сумма за доставку
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Максимальная стоимость</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={deliveryFeeSettings.maxFee}
                      onChange={(e) =>
                        handleDeliveryFeeChange('maxFee', Number(e.target.value))
                      }
                    />
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      Максимальный лимит стоимости доставки
                    </p>
                  </div>
                </div>
                <div className="rounded-lg border border-[hsl(var(--border))] p-4 space-y-4">
                  <h4 className="font-medium">Наценка в час-пик</h4>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Наценка</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={deliveryFeeSettings.peakHourSurcharge}
                        onChange={(e) =>
                          handleDeliveryFeeChange('peakHourSurcharge', Number(e.target.value))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Начало (час)</Label>
                      <Input
                        type="number"
                        min={0}
                        max={23}
                        value={deliveryFeeSettings.peakStartHour}
                        onChange={(e) =>
                          handleDeliveryFeeChange('peakStartHour', Number(e.target.value))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Конец (час)</Label>
                      <Input
                        type="number"
                        min={0}
                        max={23}
                        value={deliveryFeeSettings.peakEndHour}
                        onChange={(e) =>
                          handleDeliveryFeeChange('peakEndHour', Number(e.target.value))
                        }
                      />
                    </div>
                  </div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    Дополнительная наценка к стоимости доставки в часы повышенного спроса ({deliveryFeeSettings.peakStartHour}:00 — {deliveryFeeSettings.peakEndHour}:00)
                  </p>
                </div>
                <div className="rounded-lg border border-[hsl(var(--border))] p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Маршрутизация (OSRM)</h4>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        Расчёт расстояния доставки по маршруту вместо прямой линии
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        handleDeliveryFeeChange('routingEnabled', !deliveryFeeSettings.routingEnabled)
                      }
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        deliveryFeeSettings.routingEnabled
                          ? 'bg-[hsl(var(--success))]'
                          : 'bg-[hsl(var(--muted))]'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                          deliveryFeeSettings.routingEnabled
                            ? 'left-[22px]'
                            : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>
                  {deliveryFeeSettings.routingEnabled && (
                    <div className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <Label>OSRM Server URL</Label>
                        <Input
                          type="url"
                          placeholder="https://your-osrm-server.com"
                          value={deliveryFeeSettings.routingOsrmBaseUrl}
                          onChange={(e) =>
                            handleDeliveryFeeChange('routingOsrmBaseUrl', e.target.value)
                          }
                        />
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Connect Timeout (мс)</Label>
                          <Input
                            type="number"
                            min={100}
                            max={30000}
                            value={deliveryFeeSettings.routingConnectTimeout}
                            onChange={(e) =>
                              handleDeliveryFeeChange('routingConnectTimeout', Number(e.target.value))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Read Timeout (мс)</Label>
                          <Input
                            type="number"
                            min={100}
                            max={30000}
                            value={deliveryFeeSettings.routingReadTimeout}
                            onChange={(e) =>
                              handleDeliveryFeeChange('routingReadTimeout', Number(e.target.value))
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              )}
            </Card>
          )}

          {activeSection === 'couriers' && (
            <Card>
              <CardHeader>
                <CardTitle>Настройки курьеров</CardTitle>
                <CardDescription>Параметры работы курьеров</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Макс. активных заказов</Label>
                    <Input
                      type="number"
                      value={settings.courierSettings.maxActiveOrders}
                      onChange={(e) =>
                        handleChange('courierSettings', 'maxActiveOrders', Number(e.target.value))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Мин. рейтинг для бонуса</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={settings.courierSettings.minRatingForBonus}
                      onChange={(e) =>
                        handleChange('courierSettings', 'minRatingForBonus', Number(e.target.value))
                      }
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border border-[hsl(var(--border))] p-4">
                    <div>
                      <p className="font-medium">Автоназначение заказов</p>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        Автоматически назначать курьеров на заказы
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        handleChange(
                          'courierSettings',
                          'autoAssignEnabled',
                          !settings.courierSettings.autoAssignEnabled
                        )
                      }
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        settings.courierSettings.autoAssignEnabled
                          ? 'bg-[hsl(var(--success))]'
                          : 'bg-[hsl(var(--muted))]'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                          settings.courierSettings.autoAssignEnabled
                            ? 'left-[22px]'
                            : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-[hsl(var(--border))] p-4">
                    <div>
                      <p className="font-medium">Обязательная верификация</p>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        Требовать верификацию документов
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        handleChange(
                          'courierSettings',
                          'verificationRequired',
                          !settings.courierSettings.verificationRequired
                        )
                      }
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        settings.courierSettings.verificationRequired
                          ? 'bg-[hsl(var(--success))]'
                          : 'bg-[hsl(var(--muted))]'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                          settings.courierSettings.verificationRequired
                            ? 'left-[22px]'
                            : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'restaurants' && (
            <Card>
              <CardHeader>
                <CardTitle>Настройки ресторанов</CardTitle>
                <CardDescription>Параметры работы ресторанов</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Комиссия платформы (%)</Label>
                    <Input
                      type="number"
                      value={settings.restaurantSettings.commissionRate}
                      onChange={(e) =>
                        handleChange('restaurantSettings', 'commissionRate', Number(e.target.value))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Макс. время приготовления (мин)</Label>
                    <Input
                      type="number"
                      value={settings.restaurantSettings.maxPrepTime}
                      onChange={(e) =>
                        handleChange('restaurantSettings', 'maxPrepTime', Number(e.target.value))
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Минимальный рейтинг</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={settings.restaurantSettings.minRating}
                    onChange={(e) =>
                      handleChange('restaurantSettings', 'minRating', Number(e.target.value))
                    }
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-[hsl(var(--border))] p-4">
                  <div>
                    <p className="font-medium">Автоодобрение ресторанов</p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                      Автоматически одобрять новые рестораны
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleChange(
                        'restaurantSettings',
                        'autoApproveEnabled',
                        !settings.restaurantSettings.autoApproveEnabled
                      )
                    }
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      settings.restaurantSettings.autoApproveEnabled
                        ? 'bg-[hsl(var(--success))]'
                        : 'bg-[hsl(var(--muted))]'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        settings.restaurantSettings.autoApproveEnabled
                          ? 'left-[22px]'
                          : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Настройки уведомлений</CardTitle>
                <CardDescription>Каналы отправки уведомлений</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'emailEnabled', label: 'Email-уведомления', desc: 'Отправка писем на email' },
                  { key: 'smsEnabled', label: 'SMS-уведомления', desc: 'Отправка SMS-сообщений' },
                  { key: 'pushEnabled', label: 'Push-уведомления', desc: 'Push в мобильных приложениях' },
                  { key: 'marketingEnabled', label: 'Маркетинговые рассылки', desc: 'Промо-материалы и акции' },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between rounded-lg border border-[hsl(var(--border))] p-4"
                  >
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">{item.desc}</p>
                    </div>
                    <button
                      onClick={() =>
                        handleChange(
                          'notificationSettings',
                          item.key,
                          !settings.notificationSettings[item.key as keyof typeof settings.notificationSettings]
                        )
                      }
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        settings.notificationSettings[item.key as keyof typeof settings.notificationSettings]
                          ? 'bg-[hsl(var(--success))]'
                          : 'bg-[hsl(var(--muted))]'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                          settings.notificationSettings[item.key as keyof typeof settings.notificationSettings]
                            ? 'left-[22px]'
                            : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Maintenance Modal */}
      <Modal
        isOpen={isMaintenanceModalOpen}
        onClose={() => setIsMaintenanceModalOpen(false)}
        title="Режим обслуживания"
        description="Включить технические работы"
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-[hsl(var(--warning))]/50 bg-[hsl(var(--warning))]/5 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-[hsl(var(--warning))] mt-0.5" />
              <div>
                <p className="font-medium">Внимание</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  При включении режима обслуживания платформа станет недоступна для всех пользователей.
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Сообщение для пользователей</Label>
            <Input
              placeholder="Технические работы. Пожалуйста, попробуйте позже."
              value={settings.maintenanceMessage}
              onChange={(e) =>
                handleChange('maintenanceMessage' as keyof typeof settings, '', e.target.value)
              }
            />
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsMaintenanceModalOpen(false)}>
            Отмена
          </Button>
          <Button
            variant={settings.maintenanceMode ? 'success' : 'destructive'}
            onClick={() => {
              handleChange('maintenanceMode' as keyof typeof settings, '', !settings.maintenanceMode)
              setIsMaintenanceModalOpen(false)
            }}
          >
            {settings.maintenanceMode ? 'Отключить режим' : 'Включить режим'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
