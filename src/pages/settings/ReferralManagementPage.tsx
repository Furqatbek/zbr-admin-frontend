import { useState } from 'react'
import {
  Gift,
  Loader2,
  Plus,
  BarChart3,
  Users,
  Copy,
  CheckCircle,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
} from '@/components/ui'
import { formatNumber, formatCurrency, formatDateTime } from '@/lib/utils'
import {
  useMyReferrals,
  useMyReferralStats,
  useGenerateReferralCode,
} from '@/hooks/usePlatform'
import type { ReferralStatus } from '@/types'

const statusLabels: Record<ReferralStatus, string> = {
  PENDING: 'Ожидает',
  USED: 'Использован',
  COMPLETED: 'Завершён',
  EXPIRED: 'Истёк',
  CANCELLED: 'Отменён',
}

const statusColors: Record<ReferralStatus, 'default' | 'secondary' | 'destructive' | 'success' | 'warning'> = {
  PENDING: 'warning',
  USED: 'default',
  COMPLETED: 'success',
  EXPIRED: 'secondary',
  CANCELLED: 'destructive',
}

export function ReferralManagementPage() {
  const [page, setPage] = useState(0)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const { data: referralsData, isLoading: referralsLoading } = useMyReferrals({ page, size: 10 })
  const { data: statsData, isLoading: statsLoading } = useMyReferralStats()
  const generateCode = useGenerateReferralCode()

  const referrals = referralsData?.data
  const stats = statsData?.data

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Мои рефералы</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Реферальные коды, статистика и награды
          </p>
        </div>
        <Button
          onClick={() => generateCode.mutate()}
          disabled={generateCode.isPending}
        >
          {generateCode.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          Создать код
        </Button>
      </div>

      {/* Generated Code Result */}
      {generateCode.isSuccess && generateCode.data?.data && (
        <Card className="border-[hsl(var(--success))]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <CheckCircle className="h-6 w-6 text-[hsl(var(--success))]" />
              <div>
                <p className="font-medium">Новый реферальный код создан!</p>
                <p className="text-lg font-bold font-mono">
                  {typeof generateCode.data.data === 'object' && 'code' in generateCode.data.data
                    ? (generateCode.data.data as { code: string }).code
                    : String(generateCode.data.data)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Завершённых рефералов</p>
                <p className="text-2xl font-bold">
                  {statsLoading ? '...' : formatNumber(stats?.completedReferrals ?? 0)}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--success))]/10">
                <Users className="h-6 w-6 text-[hsl(var(--success))]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Общая награда</p>
                <p className="text-2xl font-bold">
                  {statsLoading ? '...' : formatCurrency(stats?.totalRewards ?? 0)}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--warning))]/10">
                <Gift className="h-6 w-6 text-[hsl(var(--warning))]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Награда за реферала</p>
                <p className="text-2xl font-bold">
                  {statsLoading ? '...' : formatCurrency(stats?.rewardPerReferral ?? 0)}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10">
                <BarChart3 className="h-6 w-6 text-[hsl(var(--primary))]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referrals Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Список рефералов
          </CardTitle>
        </CardHeader>
        <CardContent>
          {referralsLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : referrals?.content && referrals.content.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[hsl(var(--border))]">
                      <th className="text-left py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Код</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Статус</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Приглашённый</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Награда</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Дата</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {referrals.content.map((ref) => (
                      <tr key={ref.id} className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]">
                        <td className="py-3 px-4 font-mono text-sm font-medium">{ref.code}</td>
                        <td className="py-3 px-4">
                          <Badge variant={statusColors[ref.status]}>{statusLabels[ref.status]}</Badge>
                        </td>
                        <td className="py-3 px-4 text-sm">{ref.referredName || '—'}</td>
                        <td className="py-3 px-4 text-sm font-medium">
                          {formatCurrency(ref.rewardAmount, ref.currency)}
                          {ref.referrerRewarded && (
                            <Badge variant="success" className="ml-2">Получена</Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-[hsl(var(--muted-foreground))]">
                          {formatDateTime(ref.createdAt)}
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCopyCode(ref.code)}
                          >
                            {copiedCode === ref.code ? (
                              <CheckCircle className="h-4 w-4 text-[hsl(var(--success))]" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Страница {referrals.number + 1} из {referrals.totalPages}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPage(Math.max(0, page - 1))} disabled={referrals.first}>
                    Назад
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={referrals.last}>
                    Далее
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Gift className="mx-auto h-12 w-12 text-[hsl(var(--muted-foreground))]" />
              <p className="mt-2 text-[hsl(var(--muted-foreground))]">Нет рефералов</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
