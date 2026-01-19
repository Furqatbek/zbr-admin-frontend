import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Clock,
  Shield,
  Lock,
  Unlock,
  Trash2,
  UserCog,
  Plus,
  X,
  Loader2,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Avatar,
  Modal,
  ModalFooter,
  Select,
  Textarea,
} from '@/components/ui'
import { formatDateTime } from '@/lib/utils'
import type { UserRole, UserStatus } from '@/types'
import { useAuthStore } from '@/store/auth.store'
import { useState, useEffect } from 'react'
import {
  useUser,
  useUpdateUserStatus,
  useLockUser,
  useUnlockUser,
  useDeleteUser,
  useAssignRole,
  useRemoveRole,
} from '@/hooks'

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

const allRoles: UserRole[] = ['ADMIN', 'PLATFORM', 'RESTAURANT_OWNER', 'COURIER', 'CONSUMER']

export function UserDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { hasRole } = useAuthStore()
  const isAdmin = hasRole('ADMIN')

  const userId = parseInt(id || '0', 10)
  const { data: userData, isLoading } = useUser(userId)
  const user = userData?.data

  // Mutations
  const updateStatusMutation = useUpdateUserStatus()
  const lockUserMutation = useLockUser()
  const unlockUserMutation = useUnlockUser()
  const deleteUserMutation = useDeleteUser()
  const assignRoleMutation = useAssignRole()
  const removeRoleMutation = useRemoveRole()

  // Modal states
  const [statusModal, setStatusModal] = useState(false)
  const [roleModal, setRoleModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)

  const [newStatus, setNewStatus] = useState<UserStatus>('ACTIVE')
  const [statusReason, setStatusReason] = useState('')
  const [selectedRole, setSelectedRole] = useState<UserRole>('CONSUMER')

  useEffect(() => {
    if (user) {
      setNewStatus(user.status)
    }
  }, [user])

  const availableRoles = user ? allRoles.filter((role) => !user.roles.includes(role)) : []

  useEffect(() => {
    if (availableRoles.length > 0 && !availableRoles.includes(selectedRole)) {
      setSelectedRole(availableRoles[0])
    }
  }, [availableRoles, selectedRole])

  const handleStatusChange = () => {
    if (user) {
      updateStatusMutation.mutate(
        { id: user.id, data: { status: newStatus, reason: statusReason } },
        {
          onSuccess: () => {
            setStatusModal(false)
            setStatusReason('')
          },
        }
      )
    }
  }

  const handleAddRole = () => {
    if (user) {
      assignRoleMutation.mutate(
        { id: user.id, data: { role: selectedRole } },
        {
          onSuccess: () => {
            setRoleModal(false)
          },
        }
      )
    }
  }

  const handleRemoveRole = (role: UserRole) => {
    if (user) {
      removeRoleMutation.mutate({ id: user.id, role })
    }
  }

  const handleDelete = () => {
    if (user) {
      deleteUserMutation.mutate(user.id, {
        onSuccess: () => {
          setDeleteModal(false)
          navigate('/users')
        },
      })
    }
  }

  const handleLock = () => {
    if (user) {
      lockUserMutation.mutate(user.id)
    }
  }

  const handleUnlock = () => {
    if (user) {
      unlockUserMutation.mutate(user.id)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--muted-foreground))]" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/users">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Пользователь не найден</h1>
            <p className="text-[hsl(var(--muted-foreground))]">ID: {id}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back button and header */}
      <div className="flex items-center gap-4">
        <Link to="/users">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Профиль пользователя</h1>
          <p className="text-[hsl(var(--muted-foreground))]">ID: {id}</p>
        </div>
        <div className="flex gap-2">
          {user.status === 'ACTIVE' ? (
            <Button
              variant="outline"
              onClick={handleLock}
              disabled={lockUserMutation.isPending}
            >
              {lockUserMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Lock className="mr-2 h-4 w-4" />
              )}
              Заблокировать
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={handleUnlock}
              disabled={unlockUserMutation.isPending}
            >
              {unlockUserMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Unlock className="mr-2 h-4 w-4" />
              )}
              Разблокировать
            </Button>
          )}
          {isAdmin && (
            <Button variant="destructive" onClick={() => setDeleteModal(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Удалить
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Основная информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* User avatar and name */}
            <div className="flex items-center gap-4">
              <Avatar name={`${user.firstName} ${user.lastName}`} size="lg" />
              <div>
                <h2 className="text-xl font-semibold">
                  {user.firstName} {user.lastName}
                </h2>
                <Badge variant={statusColors[user.status]} className="mt-1">
                  {statusLabels[user.status]}
                </Badge>
              </div>
            </div>

            {/* Contact info */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-lg border border-[hsl(var(--border))] p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10">
                  <Mail className="h-5 w-5 text-[hsl(var(--primary))]" />
                </div>
                <div>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-[hsl(var(--border))] p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10">
                  <Phone className="h-5 w-5 text-[hsl(var(--primary))]" />
                </div>
                <div>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">Телефон</p>
                  <p className="font-medium">{user.phone || '—'}</p>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                <div>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">Дата регистрации</p>
                  <p className="font-medium">{formatDateTime(user.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                <div>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">Последний вход</p>
                  <p className="font-medium">
                    {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : '—'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                <div>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">Обновлён</p>
                  <p className="font-medium">{formatDateTime(user.updatedAt)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar cards */}
        <div className="space-y-6">
          {/* Status card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <UserCog className="h-5 w-5" />
                Статус
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => setStatusModal(true)}>
                Изменить
              </Button>
            </CardHeader>
            <CardContent>
              <Badge variant={statusColors[user.status]} className="text-sm">
                {statusLabels[user.status]}
              </Badge>
            </CardContent>
          </Card>

          {/* Roles card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Роли
              </CardTitle>
              {isAdmin && availableRoles.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => setRoleModal(true)}>
                  <Plus className="mr-1 h-4 w-4" />
                  Добавить
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {user.roles.map((role) => (
                  <Badge
                    key={role}
                    variant={roleColors[role]}
                    className="flex items-center gap-1 pr-1"
                  >
                    {roleLabels[role]}
                    {isAdmin && user.roles.length > 1 && (
                      <button
                        onClick={() => handleRemoveRole(role)}
                        className="ml-1 rounded-full p-0.5 hover:bg-black/10"
                        disabled={removeRoleMutation.isPending}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Status change modal */}
      <Modal
        isOpen={statusModal}
        onClose={() => setStatusModal(false)}
        title="Изменение статуса"
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
          <Button variant="outline" onClick={() => setStatusModal(false)}>
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

      {/* Add role modal */}
      <Modal
        isOpen={roleModal}
        onClose={() => setRoleModal(false)}
        title="Добавление роли"
        size="sm"
      >
        <div>
          <label className="mb-2 block text-sm font-medium">Роль</label>
          <Select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value as UserRole)}>
            {availableRoles.map((role) => (
              <option key={role} value={role}>
                {roleLabels[role]}
              </option>
            ))}
          </Select>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setRoleModal(false)}>
            Отмена
          </Button>
          <Button onClick={handleAddRole} disabled={assignRoleMutation.isPending}>
            {assignRoleMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Добавление...
              </>
            ) : (
              'Добавить'
            )}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Удаление пользователя"
        description="Это действие нельзя отменить."
        size="sm"
      >
        <p className="text-sm">
          Вы уверены, что хотите удалить пользователя{' '}
          <span className="font-medium">
            {user.firstName} {user.lastName}
          </span>
          ?
        </p>
        <ModalFooter>
          <Button variant="outline" onClick={() => setDeleteModal(false)}>
            Отмена
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteUserMutation.isPending}
          >
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
    </div>
  )
}
