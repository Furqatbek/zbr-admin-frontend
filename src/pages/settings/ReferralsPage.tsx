import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  RefreshCw,
  Loader2,
  Gift,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Hash,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Pagination,
  Select,
} from '@/components/ui'
import { formatDateTime, formatCurrency } from '@/lib/utils'
import type { ReferralStatus } from '@/types'
import { useAllReferrals, useReferralByCode } from '@/hooks'

const statusLabels: Record<ReferralStatus, string> = {
  PENDING: 'Ожидает',
  USED: 'Использован',
  COMPLETED: 'Завершён',
  EXPIRED: 'Истёк',
  CANCELLED: 'Отменён',
}

const statusColors: Record<ReferralStatus, 'default' | 'secondary' | 'destructive' | 'success' | 'warning'> = {
  PENDING: 'secondary',
  USED: 'warning',
  COMPLETED: 'success',
  EXPIRED: 'destructive',
  CANCELLED: 'destructive',
}

const statusIcons: Record<ReferralStatus, React.ReactNode> = {
  PENDING: <Clock className="h-4 w-4" />,
  USED: <AlertCircle className="h-4 w-4" />,
  COMPLETED: <CheckCircle className="h-4 w-4" />,
  EXPIRED: <XCircle className="h-4 w-4" />,
  CANCELLED: <XCircle className="h-4 w-4" />,
}

export function ReferralsPage() {
  // Search state
  const [codeSearch, setCodeSearch] = useState('')
  const [searchedCode, setSearchedCode] = useState('')

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('')

  // Pagination
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)

  // Fetch all referrals
  const {
    data: referralsData,
    isLoading,
    refetch,
  } = useAllReferrals({ page, size: pageSize })

  // Search by code
  const {
    data: searchedReferral,
    isLoading: searchLoading,
    error: searchError,
  } = useReferralByCode(searchedCode)

  const referrals = referralsData?.data?.content ?? []
  const totalItems = referralsData?.data?.totalElements ?? 0
  const totalPages = referralsData?.data?.totalPages ?? 0

  // Filter by status (client-side for now)
  const filteredReferrals = statusFilter
    ? referrals.filter((r) => r.status === statusFilter)
    : referrals

  // Calculate stats
  const stats = {
    total: referrals.length,
    pending: referrals.filter((r) => r.status === 'PENDING').length,
    completed: referrals.filter((r) => r.status === 'COMPLETED').length,
    totalRewards: referrals
      .filter((r) => r.status === 'COMPLETED')
      .reduce((sum, r) => sum + r.rewardAmount, 0),
  }

  const handleCodeSearch = () => {
    if (codeSearch.trim()) {
      setSearchedCode(codeSearch.trim())
    }
  }

  const handleCodeKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCodeSearch()
    }
  }

  const clearCodeSearch = () => {
    setCodeSearch('')
    setSearchedCode('')
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Реферальная программа</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Управление реферальными кодами и вознаграждениями
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Обновить
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10">
                <Gift className="h-6 w-6 text-[hsl(var(--primary))]" />
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Всего рефералов</p>
                <p className="text-2xl font-bold">{totalItems}</p>
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
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Ожидают</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--success))]/10">
                <Users className="h-6 w-6 text-[hsl(var(--success))]" />
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Завершённые</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10">
                <DollarSign className="h-6 w-6 text-[hsl(var(--primary))]" />
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Выплачено</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalRewards)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Code search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Hash className="h-4 w-4" />
            Поиск по коду реферала
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
              <Input
                placeholder="Введите код реферала (REF-ABC123)..."
                value={codeSearch}
                onChange={(e) => setCodeSearch(e.target.value)}
                onKeyDown={handleCodeKeyDown}
                className="pl-10"
              />
            </div>
            <Button onClick={handleCodeSearch} disabled={searchLoading || !codeSearch.trim()}>
              {searchLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Найти
            </Button>
            {searchedCode && (
              <Button variant="outline" onClick={clearCodeSearch}>
                Очистить
              </Button>
            )}
          </div>

          {/* Search Result */}
          {searchedCode && (
            <div className="mt-4">
              {searchLoading ? (
                <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Поиск...</span>
                </div>
              ) : searchError || !searchedReferral?.data ? (
                <div className="rounded-lg border border-[hsl(var(--destructive))]/20 bg-[hsl(var(--destructive))]/10 p-4">
                  <p className="text-[hsl(var(--destructive))]">
                    Реферал с кодом "{searchedCode}" не найден
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 p-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-lg">{searchedReferral.data.code}</span>
                        <Badge variant={statusColors[searchedReferral.data.status]} className="gap-1">
                          {statusIcons[searchedReferral.data.status]}
                          {statusLabels[searchedReferral.data.status]}
                        </Badge>
                      </div>
                      <div className="text-sm text-[hsl(var(--muted-foreground))]">
                        <p>Реферер: {searchedReferral.data.referrerName} (ID: {searchedReferral.data.referrerId})</p>
                        {searchedReferral.data.referredName && (
                          <p>Приглашённый: {searchedReferral.data.referredName} (ID: {searchedReferral.data.referredId})</p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-[hsl(var(--muted-foreground))]">Награда: </span>
                        <span className="font-medium">{formatCurrency(searchedReferral.data.rewardAmount)}</span>
                      </p>
                      <p>
                        <span className="text-[hsl(var(--muted-foreground))]">Создан: </span>
                        {formatDateTime(searchedReferral.data.createdAt)}
                      </p>
                      {searchedReferral.data.expiresAt && (
                        <p>
                          <span className="text-[hsl(var(--muted-foreground))]">Истекает: </span>
                          {formatDateTime(searchedReferral.data.expiresAt)}
                        </p>
                      )}
                      {searchedReferral.data.completedAt && (
                        <p>
                          <span className="text-[hsl(var(--muted-foreground))]">Завершён: </span>
                          {formatDateTime(searchedReferral.data.completedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <label className="text-sm font-medium">Фильтр по статусу:</label>
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(0)
              }}
              className="max-w-[200px]"
            >
              <option value="">Все статусы</option>
              <option value="PENDING">Ожидает</option>
              <option value="USED">Использован</option>
              <option value="COMPLETED">Завершён</option>
              <option value="EXPIRED">Истёк</option>
              <option value="CANCELLED">Отменён</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Referrals table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--muted-foreground))]" />
            </div>
          ) : filteredReferrals.length === 0 ? (
            <div className="py-12 text-center text-[hsl(var(--muted-foreground))]">
              Рефералы не найдены
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Код</TableHead>
                  <TableHead>Реферер</TableHead>
                  <TableHead>Приглашённый</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Награда</TableHead>
                  <TableHead>Выплачено</TableHead>
                  <TableHead>Создан</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReferrals.map((referral) => (
                  <TableRow key={referral.id}>
                    <TableCell className="font-mono font-medium">
                      {referral.code}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{referral.referrerName}</div>
                        <Link
                          to={`/users/${referral.referrerId}`}
                          className="text-sm text-[hsl(var(--primary))] hover:underline"
                        >
                          ID: {referral.referrerId}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell>
                      {referral.referredName ? (
                        <div>
                          <div className="font-medium">{referral.referredName}</div>
                          <Link
                            to={`/users/${referral.referredId}`}
                            className="text-sm text-[hsl(var(--primary))] hover:underline"
                          >
                            ID: {referral.referredId}
                          </Link>
                        </div>
                      ) : (
                        <span className="text-[hsl(var(--muted-foreground))]">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[referral.status]} className="gap-1">
                        {statusIcons[referral.status]}
                        {statusLabels[referral.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(referral.rewardAmount)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {referral.referrerRewarded ? (
                          <Badge variant="success" className="text-xs">Реферер</Badge>
                        ) : null}
                        {referral.referredRewarded ? (
                          <Badge variant="success" className="text-xs">Приглашённый</Badge>
                        ) : null}
                        {!referral.referrerRewarded && !referral.referredRewarded && (
                          <span className="text-[hsl(var(--muted-foreground))]">—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-[hsl(var(--muted-foreground))]">
                      {formatDateTime(referral.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalItems > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setPage(0)
          }}
        />
      )}
    </div>
  )
}
