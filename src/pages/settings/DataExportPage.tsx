import { useState } from 'react'
import {
  Download,
  FileSpreadsheet,
  FileJson,
  FileText,
  Calendar,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Users,
  Package,
  Store,
  Truck,
  BarChart3,
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
  Badge,
} from '@/components/ui'
import { formatDateTime } from '@/lib/utils'

// Mock data
type ExportStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

const mockExportJobs: Array<{
  id: string
  type: string
  format: string
  status: ExportStatus
  progress: number
  fileUrl?: string
  createdAt: string
  completedAt?: string
  recordCount: number
  error?: string
}> = [
  {
    id: 'exp-001',
    type: 'ORDERS',
    format: 'XLSX',
    status: 'COMPLETED',
    progress: 100,
    fileUrl: '/exports/orders-2024-01.xlsx',
    createdAt: '2024-01-15T10:30:00Z',
    completedAt: '2024-01-15T10:32:15Z',
    recordCount: 4250,
  },
  {
    id: 'exp-002',
    type: 'USERS',
    format: 'CSV',
    status: 'COMPLETED',
    progress: 100,
    fileUrl: '/exports/users-2024-01.csv',
    createdAt: '2024-01-14T15:00:00Z',
    completedAt: '2024-01-14T15:01:45Z',
    recordCount: 15420,
  },
  {
    id: 'exp-003',
    type: 'ANALYTICS',
    format: 'XLSX',
    status: 'PROCESSING',
    progress: 65,
    createdAt: '2024-01-15T11:00:00Z',
    recordCount: 0,
  },
  {
    id: 'exp-004',
    type: 'RESTAURANTS',
    format: 'JSON',
    status: 'FAILED',
    progress: 0,
    createdAt: '2024-01-13T09:00:00Z',
    error: 'Превышен лимит времени выполнения',
    recordCount: 0,
  },
]

const exportTypes = [
  { id: 'USERS', label: 'Пользователи', icon: Users, description: 'Все пользователи системы' },
  { id: 'ORDERS', label: 'Заказы', icon: Package, description: 'История заказов' },
  { id: 'RESTAURANTS', label: 'Рестораны', icon: Store, description: 'Данные ресторанов' },
  { id: 'COURIERS', label: 'Курьеры', icon: Truck, description: 'Данные курьеров' },
  { id: 'ANALYTICS', label: 'Аналитика', icon: BarChart3, description: 'Сводная аналитика' },
]

const formatIcons = {
  CSV: FileText,
  XLSX: FileSpreadsheet,
  JSON: FileJson,
}

const statusLabels = {
  PENDING: 'Ожидание',
  PROCESSING: 'Обработка',
  COMPLETED: 'Готово',
  FAILED: 'Ошибка',
}

const statusColors = {
  PENDING: 'warning',
  PROCESSING: 'default',
  COMPLETED: 'success',
  FAILED: 'destructive',
} as const

export function DataExportPage() {
  const [exportForm, setExportForm] = useState({
    type: 'ORDERS',
    format: 'XLSX',
    dateFrom: '',
    dateTo: '',
  })
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = () => {
    setIsExporting(true)
    setTimeout(() => {
      setIsExporting(false)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Экспорт данных</h1>
        <p className="text-[hsl(var(--muted-foreground))]">
          Выгрузка данных платформы в различных форматах
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Export Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Новый экспорт
              </CardTitle>
              <CardDescription>Выберите тип данных и формат для экспорта</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Data Type Selection */}
              <div className="space-y-3">
                <Label>Тип данных</Label>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {exportTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setExportForm({ ...exportForm, type: type.id })}
                      className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                        exportForm.type === type.id
                          ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5'
                          : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]'
                      }`}
                    >
                      <type.icon
                        className={`h-5 w-5 ${
                          exportForm.type === type.id
                            ? 'text-[hsl(var(--primary))]'
                            : 'text-[hsl(var(--muted-foreground))]'
                        }`}
                      />
                      <div>
                        <p className="font-medium">{type.label}</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                          {type.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Format Selection */}
              <div className="space-y-3">
                <Label>Формат файла</Label>
                <div className="flex gap-3">
                  {(['CSV', 'XLSX', 'JSON'] as const).map((format) => {
                    const Icon = formatIcons[format]
                    return (
                      <button
                        key={format}
                        onClick={() => setExportForm({ ...exportForm, format })}
                        className={`flex items-center gap-2 rounded-lg border px-4 py-2 transition-colors ${
                          exportForm.format === format
                            ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5'
                            : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {format}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Date Range */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Период (опционально)
                </Label>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm text-[hsl(var(--muted-foreground))]">С</Label>
                    <Input
                      type="date"
                      value={exportForm.dateFrom}
                      onChange={(e) => setExportForm({ ...exportForm, dateFrom: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-[hsl(var(--muted-foreground))]">По</Label>
                    <Input
                      type="date"
                      value={exportForm.dateTo}
                      onChange={(e) => setExportForm({ ...exportForm, dateTo: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <Button className="w-full" onClick={handleExport} disabled={isExporting}>
                {isExporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Запуск экспорта...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Начать экспорт
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">О форматах</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                <div>
                  <p className="font-medium">CSV</p>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    Текстовый формат, совместим с Excel и большинством систем
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileSpreadsheet className="h-5 w-5 text-[hsl(var(--success))]" />
                <div>
                  <p className="font-medium">XLSX</p>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    Формат Excel с поддержкой форматирования
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileJson className="h-5 w-5 text-[hsl(var(--warning))]" />
                <div>
                  <p className="font-medium">JSON</p>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    Структурированный формат для интеграций
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Всего экспортов</p>
                <p className="text-3xl font-bold">{mockExportJobs.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Export History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>История экспортов</CardTitle>
            <CardDescription>Последние выгрузки данных</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Обновить
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockExportJobs.map((job) => {
              const TypeIcon = exportTypes.find((t) => t.id === job.type)?.icon || Package
              const FormatIcon = formatIcons[job.format as keyof typeof formatIcons] || FileText

              return (
                <div
                  key={job.id}
                  className="flex items-center justify-between rounded-lg border border-[hsl(var(--border))] p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--muted))]">
                      <TypeIcon className="h-6 w-6 text-[hsl(var(--muted-foreground))]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {exportTypes.find((t) => t.id === job.type)?.label}
                        </p>
                        <div className="flex items-center gap-1 rounded bg-[hsl(var(--muted))] px-2 py-0.5">
                          <FormatIcon className="h-3 w-3" />
                          <span className="text-xs">{job.format}</span>
                        </div>
                      </div>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        {formatDateTime(job.createdAt)}
                        {job.recordCount > 0 && ` · ${job.recordCount.toLocaleString()} записей`}
                      </p>
                      {job.error && (
                        <p className="text-sm text-[hsl(var(--destructive))]">{job.error}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {job.status === 'PROCESSING' && (
                      <div className="w-32">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Прогресс</span>
                          <span>{job.progress}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-[hsl(var(--muted))]">
                          <div
                            className="h-full rounded-full bg-[hsl(var(--primary))] transition-all"
                            style={{ width: `${job.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <Badge variant={statusColors[job.status]}>
                      {job.status === 'PROCESSING' && (
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      )}
                      {job.status === 'COMPLETED' && <CheckCircle className="mr-1 h-3 w-3" />}
                      {job.status === 'FAILED' && <XCircle className="mr-1 h-3 w-3" />}
                      {job.status === 'PENDING' && <Clock className="mr-1 h-3 w-3" />}
                      {statusLabels[job.status]}
                    </Badge>

                    {job.status === 'COMPLETED' && job.fileUrl && (
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Скачать
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
