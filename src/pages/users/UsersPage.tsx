import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  MoreHorizontal,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  UserCog,
  UserPlus,
  Filter,
  RefreshCw,
  Loader2,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Select,
  Badge,
  Avatar,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Pagination,
  Dropdown,
  DropdownItem,
  DropdownSeparator,
  Modal,
  ModalFooter,
  Textarea,
} from '@/components/ui'
import { formatDateTime } from '@/lib/utils'
import type { User, UserRole, UserStatus, RegisterRequest, RegisterableRole } from '@/types'
import { useAuthStore } from '@/store/auth.store'
import {
  useUsers,
  useCreateUser,
  useUpdateUserStatus,
  useLockUser,
  useUnlockUser,
  useDeleteUser,
} from '@/hooks'
import { useDebounce } from '@/hooks/useDebounce'

const EMPTY_CREATE_FORM: RegisterRequest = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'CONSUMER',
}

// Backend password rule: lower + upper + digit + one of @#$%^&+=!
const isPasswordValid = (pw: string) =>
  /[a-z]/.test(pw) && /[A-Z]/.test(pw) && /\d/.test(pw) && /[@#$%^&+=!]/.test(pw)

const roleLabels: Record<UserRole, string> = {
  ADMIN: 'Администратор',
  PLATFORM: 'Платформа',
  CONSUMER: 'Потребитель',
  RESTAURANT_OWNER: 'Владелец ресторана',
  COURIER: 'Курьер',
}

const roleColors: Record<UserRole, 'default' | 'secondary' | 'destructive' | 'success' | 'warning'> = {
  ADMIN: 'destructive',
  PLATFORM: 'default',
  CONSUMER: 'secondary',
  RESTAURANT_OWNER: 'warning',
  COURIER: 'success',
}

const statusLabels: Record<UserStatus, string> = {
  ACTIVE: 'Активен',
  INACTIVE: 'Неактивен',
  SUSPENDED: 'Заблокирован',
}

const statusColors: Record<UserStatus, 'default' | 'secondary' | 'destructive' | 'success' | 'warning'> = {
  ACTIVE: 'success',
  INACTIVE: 'secondary',
  SUSPENDED: 'destructive',
}

export function UsersPage() {
  const { hasRole } = useAuthStore()
  const isAdmin = hasRole('ADMIN')

  // Filters state
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  // Debounced search value
  const debouncedSearch = useDebounce(search, 400)

  // Pagination state
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)

  // Reset page when debounced search changes
  useEffect(() => {
    setPage(0)
  }, [debouncedSearch])

  // Modal states
  const [statusModal, setStatusModal] = useState<{ isOpen: boolean; user: User | null }>({
    isOpen: false,
    user: null,
  })
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; user: User | null }>({
    isOpen: false,
    user: null,
  })
  const [statusReason, setStatusReason] = useState('')
  const [newStatus, setNewStatus] = useState<UserStatus>('SUSPENDED')

  // Create-user modal
  const [createModal, setCreateModal] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createForm, setCreateForm] = useState<RegisterRequest>(EMPTY_CREATE_FORM)
  const createUserMutation = useCreateUser()

  // API hooks
  const { data: usersData, isLoading, isFetching, refetch } = useUsers({
    page,
    size: pageSize,
    role: roleFilter as UserRole || undefined,
    status: statusFilter as UserStatus || undefined,
    search: debouncedSearch || undefined,
  })

  const updateStatusMutation = useUpdateUserStatus()
  const lockUserMutation = useLockUser()
  const unlockUserMutation = useUnlockUser()
  const deleteUserMutation = useDeleteUser()

  const allUsers = usersData?.data?.content ?? []
  const totalItems = usersData?.data?.totalElements ?? 0
  const totalPages = usersData?.data?.totalPages ?? 0

  // Client-side filtering as fallback if backend ignores filter params
  const users = allUsers.filter((user) => {
    if (roleFilter && !user.roles.includes(roleFilter as UserRole)) return false
    if (statusFilter && user.status !== statusFilter) return false
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase()
      const match =
        user.firstName.toLowerCase().includes(q) ||
        user.lastName.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        (user.phone && user.phone.includes(q)) ||
        user.id.toString().includes(q)
      if (!match) return false
    }
    return true
  })

  const handleStatusChange = () => {
    if (statusModal.user) {
      updateStatusMutation.mutate(
        { id: statusModal.user.id, data: { status: newStatus, reason: statusReason } },
        {
          onSuccess: () => {
            setStatusModal({ isOpen: false, user: null })
            setStatusReason('')
          },
        }
      )
    }
  }

  const handleDelete = () => {
    if (deleteModal.user) {
      deleteUserMutation.mutate(deleteModal.user.id, {
        onSuccess: () => {
          setDeleteModal({ isOpen: false, user: null })
        },
      })
    }
  }

  const openCreate = () => {
    setCreateForm(EMPTY_CREATE_FORM)
    setCreateError(null)
    setShowPassword(false)
    setCreateModal(true)
  }

  const handleCreate = async () => {
    setCreateError(null)
    try {
      await createUserMutation.mutateAsync(createForm)
      setCreateModal(false)
      setCreateForm(EMPTY_CREATE_FORM)
      setShowPassword(false)
    } catch (err) {
      // Surface the backend's human-readable message ("Email is already in use").
      const e = err as { response?: { data?: { message?: string } }; message?: string }
      setCreateError(e.response?.data?.message || e.message || 'Не удалось создать пользователя')
    }
  }

  const handleLock = (user: User) => {
    lockUserMutation.mutate(user.id)
  }

  const handleUnlock = (user: User) => {
    unlockUserMutation.mutate(user.id)
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Пользователи</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Управление пользователями системы
          </p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Button size="sm" onClick={openCreate}>
              <UserPlus className="mr-2 h-4 w-4" />
              Создать пользователя
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Обновить
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4" />
            Фильтры
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
              <Input
                placeholder="Поиск по имени, email, телефону..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value)
                setPage(0)
              }}
            >
              <option value="">Все роли</option>
              <option value="ADMIN">Администратор</option>
              <option value="PLATFORM">Платформа</option>
              <option value="RESTAURANT_OWNER">Владелец ресторана</option>
              <option value="COURIER">Курьер</option>
              <option value="CONSUMER">Потребитель</option>
            </Select>
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(0)
              }}
            >
              <option value="">Все статусы</option>
              <option value="ACTIVE">Активен</option>
              <option value="INACTIVE">Неактивен</option>
              <option value="SUSPENDED">Заблокирован</option>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearch('')
                setRoleFilter('')
                setStatusFilter('')
                setPage(0)
              }}
            >
              Сбросить
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--muted-foreground))]" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Пользователь</TableHead>
                  <TableHead>Роли</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Последний вход</TableHead>
                  <TableHead>Создан</TableHead>
                  <TableHead className="w-[70px]">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar name={`${user.firstName} ${user.lastName}`} size="sm" />
                        <div>
                          <div className="font-medium">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-[hsl(var(--muted-foreground))]">
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="text-sm text-[hsl(var(--muted-foreground))]">
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => (
                          <Badge key={role} variant={roleColors[role]}>
                            {roleLabels[role]}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[user.status]}>
                        {statusLabels[user.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-[hsl(var(--muted-foreground))]">
                      {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : '—'}
                    </TableCell>
                    <TableCell className="text-sm text-[hsl(var(--muted-foreground))]">
                      {formatDateTime(user.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Dropdown
                        trigger={
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        }
                      >
                        <Link to={`/users/${user.id}`}>
                          <DropdownItem>
                            <Eye className="h-4 w-4" />
                            Просмотр
                          </DropdownItem>
                        </Link>
                        <DropdownItem
                          onClick={() => {
                            setStatusModal({ isOpen: true, user })
                            setNewStatus(user.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED')
                          }}
                        >
                          <UserCog className="h-4 w-4" />
                          Изменить статус
                        </DropdownItem>
                        {user.status === 'ACTIVE' ? (
                          <DropdownItem onClick={() => handleLock(user)}>
                            <Lock className="h-4 w-4" />
                            Заблокировать
                          </DropdownItem>
                        ) : (
                          <DropdownItem onClick={() => handleUnlock(user)}>
                            <Unlock className="h-4 w-4" />
                            Разблокировать
                          </DropdownItem>
                        )}
                        {isAdmin && (
                          <>
                            <DropdownSeparator />
                            <DropdownItem
                              variant="destructive"
                              onClick={() => setDeleteModal({ isOpen: true, user })}
                            >
                              <Trash2 className="h-4 w-4" />
                              Удалить
                            </DropdownItem>
                          </>
                        )}
                      </Dropdown>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!isLoading && users.length === 0 && (
            <div className="py-12 text-center text-[hsl(var(--muted-foreground))]">
              Пользователи не найдены
            </div>
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

      {/* Status change modal */}
      <Modal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ isOpen: false, user: null })}
        title="Изменение статуса"
        description={`Изменение статуса пользователя ${statusModal.user?.firstName} ${statusModal.user?.lastName}`}
      >
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Новый статус</label>
            <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value as UserStatus)}>
              <option value="ACTIVE">Активен</option>
              <option value="INACTIVE">Неактивен</option>
              <option value="SUSPENDED">Заблокирован</option>
            </Select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Причина</label>
            <Textarea
              placeholder="Укажите причину изменения статуса..."
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
            />
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setStatusModal({ isOpen: false, user: null })}>
            Отмена
          </Button>
          <Button onClick={handleStatusChange} disabled={updateStatusMutation.isPending}>
            {updateStatusMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Сохранение...
              </>
            ) : (
              'Сохранить'
            )}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, user: null })}
        title="Удаление пользователя"
        description="Это действие нельзя отменить. Пользователь будет удалён из системы."
        size="sm"
      >
        <p className="text-sm">
          Вы уверены, что хотите удалить пользователя{' '}
          <span className="font-medium">
            {deleteModal.user?.firstName} {deleteModal.user?.lastName}
          </span>
          ?
        </p>
        <ModalFooter>
          <Button variant="outline" onClick={() => setDeleteModal({ isOpen: false, user: null })}>
            Отмена
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteUserMutation.isPending}>
            {deleteUserMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Удаление...
              </>
            ) : (
              'Удалить'
            )}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Create user modal */}
      <Modal
        isOpen={createModal}
        onClose={() => setCreateModal(false)}
        title="Создать пользователя"
        description="Новый пользователь с выбранной ролью"
      >
        <div className="space-y-4">
          {createError && (
            <div className="rounded-md bg-[hsl(var(--destructive))]/10 p-3 text-sm text-[hsl(var(--destructive))]">
              {createError}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Имя</label>
              <Input
                value={createForm.firstName}
                onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                placeholder="Имя"
                maxLength={50}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Фамилия</label>
              <Input
                value={createForm.lastName}
                onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                placeholder="Фамилия"
                maxLength={50}
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Email</label>
            <Input
              type="email"
              value={createForm.email}
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              placeholder="user@example.com"
              maxLength={100}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Пароль</label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                placeholder="Введите пароль"
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p
              className={`mt-1 text-xs ${
                createForm.password && !isPasswordValid(createForm.password)
                  ? 'text-[hsl(var(--destructive))]'
                  : 'text-[hsl(var(--muted-foreground))]'
              }`}
            >
              Минимум: строчная и заглавная буква, цифра и символ (@#$%^&+=!).
            </p>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Роль</label>
            <Select
              value={createForm.role}
              onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as RegisterableRole })}
            >
              <option value="CONSUMER">Потребитель</option>
              <option value="COURIER">Курьер</option>
              <option value="RESTAURANT_OWNER">Владелец ресторана</option>
            </Select>
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setCreateModal(false)}>
            Отмена
          </Button>
          <Button
            onClick={handleCreate}
            disabled={
              createUserMutation.isPending ||
              !createForm.firstName ||
              !createForm.lastName ||
              !createForm.email ||
              !isPasswordValid(createForm.password)
            }
          >
            {createUserMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Создание...
              </>
            ) : (
              'Создать'
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
