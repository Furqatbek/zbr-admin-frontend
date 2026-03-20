import { useState } from 'react'
import {
  Shield,
  Loader2,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
} from 'lucide-react'
import {
  Card,
  CardContent,
  Badge,
  Button,
  Modal,
  ModalFooter,
  Input,
  Textarea,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui'
import { useRoles, useCreateRole, useUpdateRole, useDeleteRole } from '@/hooks/useUsers'

const SYSTEM_ROLES = ['ADMIN', 'SYSTEM', 'PLATFORM']

export function UserRolesPage() {
  const { data: rolesResponse, isLoading, error, refetch } = useRoles()
  const createRole = useCreateRole()
  const updateRole = useUpdateRole()
  const deleteRole = useDeleteRole()

  const roles = rolesResponse?.data || []

  // Form state
  const [formModal, setFormModal] = useState(false)
  const [editingRole, setEditingRole] = useState<{ value: string; displayName: string } | null>(null)
  const [form, setForm] = useState({ name: '', displayName: '', description: '', permissions: '' })

  // Delete state
  const [deleteModal, setDeleteModal] = useState<{ id: number; name: string } | null>(null)

  const openCreate = () => {
    setEditingRole(null)
    setForm({ name: '', displayName: '', description: '', permissions: '' })
    setFormModal(true)
  }

  const openEdit = (role: { value: string; displayName: string }) => {
    setEditingRole(role)
    setForm({
      name: role.value,
      displayName: role.displayName,
      description: '',
      permissions: '',
    })
    setFormModal(true)
  }

  const handleSave = async () => {
    if (editingRole) {
      // For update we need the role ID - use value as lookup
      const roleIndex = roles.findIndex(r => r.value === editingRole.value)
      if (roleIndex >= 0) {
        await updateRole.mutateAsync({
          id: roleIndex + 1,
          data: {
            displayName: form.displayName,
            description: form.description || undefined,
            permissions: form.permissions ? form.permissions.split(',').map(p => p.trim()) : undefined,
          },
        })
      }
    } else {
      await createRole.mutateAsync({
        name: form.name,
        displayName: form.displayName,
        description: form.description,
        permissions: form.permissions ? form.permissions.split(',').map(p => p.trim()) : [],
      })
    }
    setFormModal(false)
    refetch()
  }

  const handleDelete = async () => {
    if (!deleteModal) return
    await deleteRole.mutateAsync(deleteModal.id)
    setDeleteModal(null)
    refetch()
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
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Обновить
          </Button>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Новая роль
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
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
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--warning))]/10">
                <Shield className="h-6 w-6 text-[hsl(var(--warning))]" />
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Системных</p>
                <p className="text-2xl font-bold">{roles.filter(r => SYSTEM_ROLES.includes(r.value)).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--success))]/10">
                <Shield className="h-6 w-6 text-[hsl(var(--success))]" />
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Пользовательских</p>
                <p className="text-2xl font-bold">{roles.filter(r => !SYSTEM_ROLES.includes(r.value)).length}</p>
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
                <TableHead>Код</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead className="w-[120px]">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role, index) => (
                <TableRow key={role.value}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                      <p className="font-medium">{role.displayName}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-sm text-[hsl(var(--muted-foreground))]">{role.value}</code>
                  </TableCell>
                  <TableCell>
                    {SYSTEM_ROLES.includes(role.value) ? (
                      <Badge variant="default">Системная</Badge>
                    ) : (
                      <Badge variant="secondary">Пользовательская</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {!SYSTEM_ROLES.includes(role.value) && (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(role)} title="Редактировать">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteModal({ id: index + 1, name: role.displayName })}
                          title="Удалить"
                        >
                          <Trash2 className="h-4 w-4 text-[hsl(var(--destructive))]" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={formModal}
        onClose={() => setFormModal(false)}
        title={editingRole ? 'Редактирование роли' : 'Новая роль'}
      >
        <div className="space-y-4">
          {!editingRole && (
            <div>
              <label className="mb-2 block text-sm font-medium">Код роли</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value.toUpperCase().replace(/\s/g, '_') })}
                placeholder="ROLE_NAME"
              />
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                Латинские буквы, без пробелов
              </p>
            </div>
          )}
          <div>
            <label className="mb-2 block text-sm font-medium">Название</label>
            <Input
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              placeholder="Отображаемое название"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Описание</label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Описание роли и её назначения"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Разрешения</label>
            <Textarea
              value={form.permissions}
              onChange={(e) => setForm({ ...form, permissions: e.target.value })}
              placeholder="READ_ORDERS, WRITE_ORDERS, MANAGE_USERS"
              rows={3}
            />
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              Разделяйте разрешения запятыми
            </p>
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setFormModal(false)}>Отмена</Button>
          <Button
            onClick={handleSave}
            disabled={(!editingRole && !form.name) || !form.displayName || createRole.isPending || updateRole.isPending}
          >
            {(createRole.isPending || updateRole.isPending) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {editingRole ? 'Сохранить' : 'Создать'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Удаление роли"
      >
        <p>
          Вы действительно хотите удалить роль <strong>"{deleteModal?.name}"</strong>?
        </p>
        <p className="mt-2 text-sm text-[hsl(var(--destructive))]">
          Пользователи с этой ролью потеряют связанные разрешения.
        </p>
        <ModalFooter>
          <Button variant="outline" onClick={() => setDeleteModal(null)}>Отмена</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteRole.isPending}>
            {deleteRole.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Удалить
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
