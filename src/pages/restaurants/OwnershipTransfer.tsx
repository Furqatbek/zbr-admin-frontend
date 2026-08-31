import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  User as UserIcon,
  ArrowLeftRight,
  Search,
  Loader2,
  AlertTriangle,
  Mail,
  Hash,
  CheckCircle,
  X,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Badge,
  Avatar,
  Modal,
  ModalFooter,
} from '@/components/ui'
import { useAuthStore } from '@/store/auth.store'
import { useUser, useUsersByRole, useSearchUsers } from '@/hooks/useUsers'
import { useTransferRestaurantOwnership } from '@/hooks/useRestaurants'
import type { Restaurant, User, UserStatus } from '@/types'

const userStatusLabels: Record<UserStatus, string> = {
  ACTIVE: 'Активен',
  INACTIVE: 'Неактивен',
  SUSPENDED: 'Заблокирован',
}

const userStatusColors: Record<UserStatus, 'success' | 'secondary' | 'destructive'> = {
  ACTIVE: 'success',
  INACTIVE: 'secondary',
  SUSPENDED: 'destructive',
}

const fullName = (u: Pick<User, 'firstName' | 'lastName'>) => `${u.firstName} ${u.lastName}`.trim()

// "Asad karim" -> "Asad Karim" (the search is case-sensitive; offer this variant).
const capitalizeWords = (s: string) =>
  s.replace(/\S+/g, (w) => w.charAt(0).toUpperCase() + w.slice(1))

interface Props {
  restaurant: Restaurant
}

export function OwnershipTransfer({ restaurant }: Props) {
  const { hasAnyRole } = useAuthStore()
  const canTransfer = hasAnyRole(['ADMIN', 'PLATFORM'])

  const { data: ownerData } = useUser(restaurant.ownerId)
  const owner = ownerData?.data

  const [open, setOpen] = useState(false)
  const [phase, setPhase] = useState<'select' | 'confirm'>('select')
  const [mode, setMode] = useState<'owners' | 'search'>('owners')
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selected, setSelected] = useState<User | null>(null)
  const [error, setError] = useState<{ message: string; suspendedUserId?: number } | null>(null)
  const [done, setDone] = useState<{ previousOwner?: User; newOwner: User } | null>(null)

  const transfer = useTransferRestaurantOwnership()

  const trimmed = searchInput.trim()
  const phoneLike = /\d/.test(trimmed) && /^[\d\s+()-]+$/.test(trimmed)

  const ownersQuery = useUsersByRole(
    'RESTAURANT_OWNER',
    { page: 0, size: 20 },
    open && mode === 'owners'
  )
  const searchResults = useSearchUsers(
    searchQuery,
    { page: 0, size: 20 },
    open && mode === 'search' && !!searchQuery
  )

  const source = mode === 'owners' ? ownersQuery : searchResults
  const candidates = (source.data?.data?.content ?? []).filter((u) => u.id !== restaurant.ownerId)
  const capitalized = capitalizeWords(searchQuery)

  const openModal = () => {
    setPhase('select')
    setMode('owners')
    setSearchInput('')
    setSearchQuery('')
    setSelected(null)
    setError(null)
    setOpen(true)
  }

  const pick = (user: User) => {
    if (user.status !== 'ACTIVE') return
    setSelected(user)
    setError(null)
    setPhase('confirm')
  }

  const runSearch = () => {
    if (phoneLike) return
    setSearchQuery(trimmed)
  }

  const confirmTransfer = async () => {
    if (!selected) return
    setError(null)
    try {
      await transfer.mutateAsync({ id: restaurant.id, newOwnerId: selected.id })
      setDone({ previousOwner: owner, newOwner: selected })
      setOpen(false)
    } catch (err) {
      const e = err as { response?: { status?: number; data?: { message?: string } }; message?: string }
      const status = e.response?.status
      const message = e.response?.data?.message || e.message || 'Не удалось передать владение'
      const suspended = status === 400 && /suspend/i.test(message)
      setError({ message, suspendedUserId: suspended ? selected.id : undefined })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserIcon className="h-5 w-5" />
          Владелец
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Имя</p>
          <p className="font-medium">{owner ? fullName(owner) : restaurant.ownerName || '—'}</p>
        </div>
        {owner?.email && (
          <div>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Email</p>
            <p className="font-medium">{owner.email}</p>
          </div>
        )}
        <div>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">User ID</p>
          <p className="font-medium">{restaurant.ownerId}</p>
        </div>
        {owner && (
          <Badge variant={userStatusColors[owner.status]}>{userStatusLabels[owner.status]}</Badge>
        )}
        <Link to={`/users/${restaurant.ownerId}`} className="block">
          <Button variant="outline" size="sm" className="w-full">
            Перейти к профилю
          </Button>
        </Link>

        {/* Success banner: names both parties + optional role-cleanup follow-up */}
        {done && (
          <div className="rounded-lg border border-[hsl(var(--success))]/40 bg-[hsl(var(--success))]/10 p-3 text-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--success))]" />
                <div>
                  <p>
                    Ресторан передан пользователю <strong>{fullName(done.newOwner)}</strong>.
                  </p>
                  {done.previousOwner && (
                    <p className="mt-1 text-[hsl(var(--muted-foreground))]">
                      Если{' '}
                      <Link
                        to={`/users/${done.previousOwner.id}`}
                        className="underline hover:text-[hsl(var(--foreground))]"
                      >
                        {fullName(done.previousOwner)}
                      </Link>{' '}
                      больше не владеет ресторанами, роль «Владелец ресторана» можно снять на его
                      странице.
                    </p>
                  )}
                </div>
              </div>
              <button onClick={() => setDone(null)} className="text-[hsl(var(--muted-foreground))]">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Transfer action — deliberately separated, weighted like suspend/delete */}
        {canTransfer && (
          <div className="mt-2 rounded-lg border border-[hsl(var(--warning))]/40 bg-[hsl(var(--warning))]/5 p-3">
            <p className="mb-2 text-xs text-[hsl(var(--muted-foreground))]">
              Передача владения немедленно лишает текущего владельца доступа. Отменить можно только
              обратной передачей.
            </p>
            <Button variant="outline" size="sm" className="w-full" onClick={openModal}>
              <ArrowLeftRight className="mr-2 h-4 w-4" />
              Передать владение
            </Button>
          </div>
        )}
      </CardContent>

      {/* Transfer modal */}
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Передача владения рестораном"
        description={restaurant.name}
      >
        {phase === 'select' ? (
          <div className="space-y-4">
            {/* Source toggle */}
            <div className="flex gap-2">
              <Button
                variant={mode === 'owners' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('owners')}
              >
                Существующие владельцы
              </Button>
              <Button
                variant={mode === 'search' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('search')}
              >
                Поиск
              </Button>
            </div>

            {mode === 'search' && (
              <div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                    <Input
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && runSearch()}
                      placeholder="Поиск по имени или email"
                      className="pl-10"
                    />
                  </div>
                  <Button size="sm" onClick={runSearch} disabled={!trimmed || phoneLike}>
                    Найти
                  </Button>
                </div>
                {phoneLike && (
                  <p className="mt-1 text-xs text-[hsl(var(--warning))]">
                    Поиск по номеру телефона не поддерживается — ищите по имени или email.
                  </p>
                )}
              </div>
            )}

            {/* Results */}
            <div className="max-h-[320px] space-y-2 overflow-y-auto">
              {source.isFetching ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--muted-foreground))]" />
                </div>
              ) : candidates.length === 0 ? (
                <div className="py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
                  {mode === 'search' && searchQuery ? (
                    <div className="space-y-2">
                      <p>Ничего не найдено. Поиск чувствителен к регистру.</p>
                      {capitalized !== searchQuery && (
                        <Button variant="outline" size="sm" onClick={() => setSearchQuery(capitalized)}>
                          Искать «{capitalized}»
                        </Button>
                      )}
                    </div>
                  ) : mode === 'search' ? (
                    'Введите имя или email и нажмите «Найти».'
                  ) : (
                    'Владельцы не найдены.'
                  )}
                </div>
              ) : (
                candidates.map((u) => {
                  const disabled = u.status !== 'ACTIVE'
                  return (
                    <button
                      key={u.id}
                      onClick={() => pick(u)}
                      disabled={disabled}
                      className={`flex w-full items-center gap-3 rounded-lg border border-[hsl(var(--border))] p-3 text-left transition-colors ${
                        disabled
                          ? 'cursor-not-allowed opacity-60'
                          : 'hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--muted))]'
                      }`}
                    >
                      <Avatar name={fullName(u)} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{fullName(u)}</p>
                        <p className="flex items-center gap-1 truncate text-sm text-[hsl(var(--muted-foreground))]">
                          <Mail className="h-3 w-3" /> {u.email}
                          <span className="mx-1">·</span>
                          <Hash className="h-3 w-3" />
                          {u.id}
                        </p>
                        {disabled && (
                          <p className="mt-1 text-xs text-[hsl(var(--destructive))]">
                            {u.status === 'SUSPENDED'
                              ? 'Аккаунт заблокирован — сначала активируйте пользователя'
                              : 'Аккаунт неактивен'}
                          </p>
                        )}
                      </div>
                      <Badge variant={userStatusColors[u.status]}>{userStatusLabels[u.status]}</Badge>
                    </button>
                  )
                })
              )}
            </div>
          </div>
        ) : (
          /* Confirm phase */
          <div className="space-y-4">
            {error && (
              <div className="rounded-md bg-[hsl(var(--destructive))]/10 p-3 text-sm text-[hsl(var(--destructive))]">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p>{error.message}</p>
                    {error.suspendedUserId && (
                      <Link
                        to={`/users/${error.suspendedUserId}`}
                        className="mt-1 inline-block underline"
                      >
                        Открыть страницу пользователя →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}
            <p className="text-sm">
              Передать <strong>{restaurant.name}</strong> от{' '}
              <strong>{owner ? fullName(owner) : restaurant.ownerName || `#${restaurant.ownerId}`}</strong>
              {owner?.email && ` (${owner.email})`} к <strong>{selected && fullName(selected)}</strong>
              {selected?.email && ` (${selected.email})`}?
            </p>
            <div className="rounded-lg bg-[hsl(var(--destructive))]/10 p-3 text-sm">
              <strong>{owner ? fullName(owner) : 'Текущий владелец'}</strong> немедленно потеряет доступ
              к этому ресторану. Это действие нельзя отменить, кроме как передачей ресторана обратно.
            </div>
          </div>
        )}

        <ModalFooter>
          {phase === 'confirm' && (
            <Button variant="outline" onClick={() => setPhase('select')} disabled={transfer.isPending}>
              Назад
            </Button>
          )}
          {phase === 'select' ? (
            <Button variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
          ) : (
            <Button onClick={confirmTransfer} disabled={transfer.isPending}>
              {transfer.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Передача...
                </>
              ) : (
                'Передать владение'
              )}
            </Button>
          )}
        </ModalFooter>
      </Modal>
    </Card>
  )
}
