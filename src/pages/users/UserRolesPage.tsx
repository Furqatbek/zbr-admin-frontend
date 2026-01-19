import { useState } from 'react'
import {
  Shield,
  Users,
  Plus,
  Edit,
  Trash2,
  Key,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Lock,
  Unlock,
  Loader2,
} from 'lucide-react'
import {
  Card,
  CardContent,
  Button,
  Input,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Modal,
  ModalFooter,
  Label,
} from '@/components/ui'
import { formatNumber } from '@/lib/utils'
import { useRoles, useCreateRole, useUpdateRole, useDeleteRole } from '@/hooks/useUsers'
import type { RoleDefinition } from '@/api/users.api'

const allPermissions = {
  users: {
    label: 'Пользователи',
    permissions: [
      { id: 'users.read', label: 'Просмотр' },
      { id: 'users.write', label: 'Редактирование' },
      { id: 'users.delete', label: 'Удаление' },
    ],
  },
  orders: {
    label: 'Заказы',
    permissions: [
      { id: 'orders.read', label: 'Просмотр' },
      { id: 'orders.write', label: 'Редактирование' },
      { id: 'orders.cancel', label: 'Отмена' },
    ],
  },
  restaurants: {
    label: 'Рестораны',
    permissions: [
      { id: 'restaurants.read', label: 'Просмотр' },
      { id: 'restaurants.write', label: 'Редактирование' },
      { id: 'restaurants.moderate', label: 'Модерация' },
    ],
  },
  couriers: {
    label: 'Курьеры',
    permissions: [
      { id: 'couriers.read', label: 'Просмотр' },
      { id: 'couriers.write', label: 'Редактирование' },
      { id: 'couriers.verify', label: 'Верификация' },
    ],
  },
  analytics: {
    label: 'Аналитика',
    permissions: [
      { id: 'analytics.read', label: 'Просмотр' },
      { id: 'analytics.export', label: 'Экспорт' },
    ],
  },
  settings: {
    label: 'Настройки',
    permissions: [
      { id: 'settings.read', label: 'Просмотр' },
      { id: 'settings.write', label: 'Редактирование' },
    ],
  },
  notifications: {
    label: 'Уведомления',
    permissions: [
      { id: 'notifications.send', label: 'Отправка' },
      { id: 'notifications.cleanup', label: 'Очистка' },
    ],
  },
}

export function UserRolesPage() {
  const { data: rolesResponse, isLoading, error } = useRoles()
  const createRole = useCreateRole()
  const updateRole = useUpdateRole()
  const deleteRoleMutation = useDeleteRole()

  const roles = rolesResponse?.data || []

  const [selectedRole, setSelectedRole] = useState<RoleDefinition | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    displayName: '',
    description: '',
    permissions: [] as string[],
  })

  const handleEditRole = (role: RoleDefinition) => {
    setSelectedRole(role)
    setEditForm({
      displayName: role.displayName,
      description: role.description,
      permissions: [...role.permissions],
    })
    setIsEditModalOpen(true)
  }

  const handleCreateRole = () => {
    setSelectedRole(null)
    setEditForm({
      displayName: '',
      description: '',
      permissions: [],
    })
    setIsEditModalOpen(true)
  }

  const togglePermission = (permissionId: string) => {
    if (editForm.permissions.includes(permissionId)) {
      setEditForm({
        ...editForm,
        permissions: editForm.permissions.filter((p) => p !== permissionId),
      })
    } else {
      setEditForm({
        ...editForm,
        permissions: [...editForm.permissions, permissionId],
      })
    }
  }

  const handleSave = async () => {
    if (selectedRole) {
      await updateRole.mutateAsync({
        id: selectedRole.id,
        data: {
          displayName: editForm.displayName,
          description: editForm.description,
          permissions: editForm.permissions,
        },
      })
    } else {
      await createRole.mutateAsync({
        name: editForm.displayName.toUpperCase().replace(/\s+/g, '_'),
        displayName: editForm.displayName,
        description: editForm.description,
        permissions: editForm.permissions,
      })
    }
    setIsEditModalOpen(false)
  }

  const handleDelete = async () => {
    if (selectedRole) {
      await deleteRoleMutation.mutateAsync(selectedRole.id)
    }
    setIsDeleteModalOpen(false)
    setSelectedRole(null)
  }

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
        <p className="text-[hsl(var(--destructive))]">Ошибка загрузки ролей</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Роли и права</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Управление ролями и разрешениями пользователей
          </p>
        </div>
        <Button onClick={handleCreateRole}>
          <Plus className="mr-2 h-4 w-4" />
          Создать роль
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10">
                <Shield className="h-6 w-6 text-[hsl(var(--primary))]" />
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Всего ролей</p>
                <p className="text-2xl font-bold">{roles.length}</p>
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
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Пользователей с ролями</p>
                <p className="text-2xl font-bold">
                  {formatNumber(roles.reduce((sum, r) => sum + r.usersCount, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--warning))]/10">
                <Key className="h-6 w-6 text-[hsl(var(--warning))]" />
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Всего разрешений</p>
                <p className="text-2xl font-bold">
                  {Object.values(allPermissions).reduce((sum, g) => sum + g.permissions.length, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Roles Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Роль</TableHead>
                <TableHead>Описание</TableHead>
                <TableHead>Пользователей</TableHead>
                <TableHead>Разрешений</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead className="w-[100px]">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                      <div>
                        <p className="font-medium">{role.displayName}</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">{role.name}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="text-sm text-[hsl(var(--muted-foreground))] truncate">
                      {role.description}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{role.usersCount}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{role.permissions.length}</Badge>
                  </TableCell>
                  <TableCell>
                    {role.isSystem ? (
                      <Badge variant="default">
                        <Lock className="mr-1 h-3 w-3" />
                        Системная
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <Unlock className="mr-1 h-3 w-3" />
                        Пользовательская
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditRole(role)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {!role.isSystem && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedRole(role)
                            setIsDeleteModalOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-[hsl(var(--destructive))]" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit/Create Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={selectedRole ? 'Редактировать роль' : 'Создать роль'}
        description={selectedRole?.isSystem ? 'Системные роли можно только просматривать' : undefined}
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Название</Label>
              <Input
                value={editForm.displayName}
                onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                disabled={selectedRole?.isSystem}
                placeholder="Название роли"
              />
            </div>
            <div className="space-y-2">
              <Label>Описание</Label>
              <Input
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                disabled={selectedRole?.isSystem}
                placeholder="Описание роли"
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Разрешения
            </Label>

            <div className="max-h-[400px] space-y-4 overflow-y-auto rounded-lg border border-[hsl(var(--border))] p-4">
              {Object.entries(allPermissions).map(([groupKey, group]) => (
                <div key={groupKey} className="space-y-2">
                  <p className="font-medium">{group.label}</p>
                  <div className="grid gap-2 md:grid-cols-3">
                    {group.permissions.map((permission) => {
                      const isChecked = editForm.permissions.includes(permission.id)
                      return (
                        <button
                          key={permission.id}
                          onClick={() => !selectedRole?.isSystem && togglePermission(permission.id)}
                          disabled={selectedRole?.isSystem}
                          className={`flex items-center gap-2 rounded-lg border p-2 text-left text-sm transition-colors ${
                            isChecked
                              ? 'border-[hsl(var(--success))] bg-[hsl(var(--success))]/5'
                              : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]'
                          } ${selectedRole?.isSystem ? 'cursor-not-allowed opacity-70' : ''}`}
                        >
                          {isChecked ? (
                            <CheckCircle className="h-4 w-4 text-[hsl(var(--success))]" />
                          ) : (
                            <XCircle className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                          )}
                          <span>{permission.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <ModalFooter>
          <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
            {selectedRole?.isSystem ? 'Закрыть' : 'Отмена'}
          </Button>
          {!selectedRole?.isSystem && (
            <Button onClick={handleSave} disabled={updateRole.isPending || createRole.isPending}>
              {updateRole.isPending || createRole.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Сохранить
            </Button>
          )}
        </ModalFooter>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Удаление роли"
        description="Это действие необратимо"
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-[hsl(var(--destructive))]/30 bg-[hsl(var(--destructive))]/5 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-[hsl(var(--destructive))] mt-0.5" />
              <div>
                <p className="font-medium">
                  Вы уверены, что хотите удалить роль "{selectedRole?.displayName}"?
                </p>
                {selectedRole && selectedRole.usersCount > 0 && (
                  <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                    У {selectedRole.usersCount} пользователей будет отозвана эта роль.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <ModalFooter>
          <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
            Отмена
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteRoleMutation.isPending}>
            {deleteRoleMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            Удалить
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
