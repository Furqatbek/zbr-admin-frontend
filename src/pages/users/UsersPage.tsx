import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  MoreHorizontal,
  Eye,
  Lock,
  Unlock,
  Trash2,
  UserCog,
  Filter,
  RefreshCw,
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
import type { User, UserRole, UserStatus } from '@/types'
import { useAuthStore } from '@/store/auth.store'

// Mock data - will be replaced with API calls
const mockUsers: User[] = [
  {
    id: 1,
    email: 'admin@fooddelivery.com',
    phone: '+7 999 123 45 67',
    firstName: 'Алексей',
    lastName: 'Петров',
    roles: ['ADMIN'],
    status: 'ACTIVE',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    lastLoginAt: '2024-01-15T09:30:00Z',
  },
  {
    id: 2,
    email: 'platform@fooddelivery.com',
    phone: '+7 999 234 56 78',
    firstName: 'Мария',
    lastName: 'Иванова',
    roles: ['PLATFORM'],
    status: 'ACTIVE',
    createdAt: '2024-01-02T10:00:00Z',
    updatedAt: '2024-01-14T10:00:00Z',
    lastLoginAt: '2024-01-14T15:30:00Z',
  },
  {
    id: 3,
    email: 'restaurant@example.com',
    phone: '+7 999 345 67 89',
    firstName: 'Дмитрий',
    lastName: 'Сидоров',
    roles: ['RESTAURANT_OWNER'],
    status: 'ACTIVE',
    createdAt: '2024-01-03T10:00:00Z',
    updatedAt: '2024-01-13T10:00:00Z',
  },
  {
    id: 4,
    email: 'courier@example.com',
    phone: '+7 999 456 78 90',
    firstName: 'Игорь',
    lastName: 'Козлов',
    roles: ['COURIER'],
    status: 'SUSPENDED',
    createdAt: '2024-01-04T10:00:00Z',
    updatedAt: '2024-01-12T10:00:00Z',
  },
  {
    id: 5,
    email: 'user@example.com',
    phone: '+7 999 567 89 01',
    firstName: 'Анна',
    lastName: 'Новикова',
    roles: ['CONSUMER'],
    status: 'ACTIVE',
    createdAt: '2024-01-05T10:00:00Z',
    updatedAt: '2024-01-11T10:00:00Z',
  },
]

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

  // Pagination state
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)

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

  // Filter users
  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      !search ||
      user.firstName.toLowerCase().includes(search.toLowerCase()) ||
      user.lastName.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.phone?.includes(search)

    const matchesRole = !roleFilter || user.roles.includes(roleFilter as UserRole)
    const matchesStatus = !statusFilter || user.status === statusFilter

    return matchesSearch && matchesRole && matchesStatus
  })

  const totalItems = filteredUsers.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const paginatedUsers = filteredUsers.slice(page * pageSize, (page + 1) * pageSize)

  const handleStatusChange = () => {
    // Will be replaced with API call
    console.log('Changing status:', statusModal.user?.id, newStatus, statusReason)
    setStatusModal({ isOpen: false, user: null })
    setStatusReason('')
  }

  const handleDelete = () => {
    // Will be replaced with API call
    console.log('Deleting user:', deleteModal.user?.id)
    setDeleteModal({ isOpen: false, user: null })
  }

  const handleLock = (user: User) => {
    console.log('Locking user:', user.id)
  }

  const handleUnlock = (user: User) => {
    console.log('Unlocking user:', user.id)
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
        <Button variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Обновить
        </Button>
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
            <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="">Все роли</option>
              <option value="ADMIN">Администратор</option>
              <option value="PLATFORM">Платформа</option>
              <option value="RESTAURANT_OWNER">Владелец ресторана</option>
              <option value="COURIER">Курьер</option>
              <option value="CONSUMER">Потребитель</option>
            </Select>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
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
              {paginatedUsers.map((user) => (
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

          {paginatedUsers.length === 0 && (
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
          <Button onClick={handleStatusChange}>Сохранить</Button>
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
          <Button variant="destructive" onClick={handleDelete}>
            Удалить
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
