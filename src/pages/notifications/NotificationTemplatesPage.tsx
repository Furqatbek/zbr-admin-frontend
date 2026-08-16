import { useState } from 'react'
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Loader2,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  Filter,
} from 'lucide-react'
import {
  Card,
  CardContent,
  Button,
  Badge,
  Modal,
  ModalFooter,
  Input,
  Textarea,
  Select,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui'
import {
  useNotificationTemplates,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
  useToggleTemplateActive,
  useNotificationTypes,
  useNotificationRoles,
  useNotificationCategories,
  useNotificationPriorities,
} from '@/hooks/useNotifications'
import type {
  NotificationTemplate,
  NotificationRole,
  NotificationCategory,
  NotificationPriority,
  CreateTemplateRequest,
  UpdateTemplateRequest,
} from '@/types'

export function NotificationTemplatesPage() {
  const { data: templates, isLoading, refetch } = useNotificationTemplates()
  const { data: types } = useNotificationTypes()
  const { data: roles } = useNotificationRoles()
  const { data: categories } = useNotificationCategories()
  const { data: priorities } = useNotificationPriorities()

  const createTemplate = useCreateTemplate()
  const updateTemplate = useUpdateTemplate()
  const deleteTemplate = useDeleteTemplate()
  const toggleActive = useToggleTemplateActive()

  const [formModal, setFormModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ id: number; name: string } | null>(null)
  const [form, setForm] = useState<{
    type: string
    role: NotificationRole
    category: NotificationCategory
    title: string
    messageTemplate: string
    defaultPriority: NotificationPriority
  }>({
    type: '',
    role: 'ALL',
    category: 'SYSTEM',
    title: '',
    messageTemplate: '',
    defaultPriority: 'NORMAL',
  })

  // Filters
  const [filterType, setFilterType] = useState('')
  const [filterRole, setFilterRole] = useState('')

  const templateList = Array.isArray(templates) ? templates : []

  const filteredTemplates = templateList.filter((t) => {
    if (filterType && t.type !== filterType) return false
    if (filterRole && t.role !== filterRole) return false
    return true
  })

  const openCreate = () => {
    setEditingId(null)
    setForm({
      type: '',
      role: 'ALL',
      category: 'SYSTEM',
      title: '',
      messageTemplate: '',
      defaultPriority: 'NORMAL',
    })
    setFormModal(true)
  }

  const openEdit = (template: NotificationTemplate) => {
    setEditingId(template.id)
    setForm({
      type: template.type,
      role: template.role,
      category: template.category,
      title: template.title,
      messageTemplate: template.messageTemplate,
      defaultPriority: template.defaultPriority,
    })
    setFormModal(true)
  }

  const handleSave = async () => {
    if (editingId) {
      const data: UpdateTemplateRequest = {
        title: form.title,
        messageTemplate: form.messageTemplate,
        defaultPriority: form.defaultPriority,
        category: form.category,
      }
      await updateTemplate.mutateAsync({ id: editingId, data })
    } else {
      const data: CreateTemplateRequest = {
        type: form.type,
        role: form.role,
        category: form.category,
        title: form.title,
        messageTemplate: form.messageTemplate,
        defaultPriority: form.defaultPriority,
      }
      await createTemplate.mutateAsync(data)
    }
    setFormModal(false)
    refetch()
  }

  const handleDelete = async () => {
    if (!deleteModal) return
    await deleteTemplate.mutateAsync(deleteModal.id)
    setDeleteModal(null)
    refetch()
  }

  const handleToggle = async (id: number) => {
    await toggleActive.mutateAsync(id)
    refetch()
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Шаблоны уведомлений</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Управление шаблонами для автоматических уведомлений
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Обновить
          </Button>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Новый шаблон
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10">
                <FileText className="h-6 w-6 text-[hsl(var(--primary))]" />
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Всего шаблонов</p>
                <p className="text-2xl font-bold">{templateList.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--success))]/10">
                <ToggleRight className="h-6 w-6 text-[hsl(var(--success))]" />
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Активных</p>
                <p className="text-2xl font-bold">{templateList.filter((t) => t.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--muted))]/50">
                <ToggleLeft className="h-6 w-6 text-[hsl(var(--muted-foreground))]" />
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Неактивных</p>
                <p className="text-2xl font-bold">{templateList.filter((t) => !t.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
            <Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="">Все типы</option>
              {Array.isArray(types) && types.map((t) => (
                <option key={t.value} value={t.value}>{t.displayName}</option>
              ))}
            </Select>
            <Select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
              <option value="">Все роли</option>
              {Array.isArray(roles) && roles.map((r) => (
                <option key={r.value} value={r.value}>{r.displayName}</option>
              ))}
            </Select>
            {(filterType || filterRole) && (
              <Button variant="ghost" size="sm" onClick={() => { setFilterType(''); setFilterRole('') }}>
                Сбросить
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Templates Table */}
      <Card>
        <CardContent className="p-0">
          {filteredTemplates.length === 0 ? (
            <div className="py-12 text-center text-[hsl(var(--muted-foreground))]">
              Шаблоны не найдены
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Тип</TableHead>
                  <TableHead>Роль</TableHead>
                  <TableHead>Приоритет</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="w-[150px]">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTemplates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{template.title}</p>
                        <p className="text-sm text-[hsl(var(--muted-foreground))] truncate max-w-[300px]">
                          {template.messageTemplate}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">{template.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{template.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={template.defaultPriority === 'HIGH' || template.defaultPriority === 'URGENT' ? 'destructive' : 'secondary'}>
                        {template.defaultPriority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <button onClick={() => handleToggle(template.id)}>
                        {template.isActive ? (
                          <Badge variant="success" className="cursor-pointer">Активен</Badge>
                        ) : (
                          <Badge variant="secondary" className="cursor-pointer">Неактивен</Badge>
                        )}
                      </button>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(template)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteModal({ id: template.id, name: template.title })}
                        >
                          <Trash2 className="h-4 w-4 text-[hsl(var(--destructive))]" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={formModal}
        onClose={() => setFormModal(false)}
        title={editingId ? 'Редактирование шаблона' : 'Новый шаблон'}
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          <div>
            <label className="mb-2 block text-sm font-medium">Тип уведомления</label>
            <Select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              disabled={!!editingId}
            >
              <option value="">Выберите тип</option>
              {Array.isArray(types) && types.map((t) => (
                <option key={t.value} value={t.value}>{t.displayName}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Заголовок</label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Заголовок уведомления"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Текст</label>
            <Textarea
              value={form.messageTemplate}
              onChange={(e) => setForm({ ...form, messageTemplate: e.target.value })}
              placeholder="Текст уведомления. Используйте {{переменные}} для подстановки"
              rows={4}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Целевая роль</label>
              <Select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as NotificationRole })}
                disabled={!!editingId}
              >
                {Array.isArray(roles) && roles.map((r) => (
                  <option key={r.value} value={r.value}>{r.displayName}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Приоритет</label>
              <Select
                value={form.defaultPriority}
                onChange={(e) => setForm({ ...form, defaultPriority: e.target.value as NotificationPriority })}
              >
                {Array.isArray(priorities) ? priorities.map((p) => (
                  <option key={p.value} value={p.value}>{p.displayName}</option>
                )) : (
                  <>
                    <option value="LOW">Низкий</option>
                    <option value="NORMAL">Нормальный</option>
                    <option value="HIGH">Высокий</option>
                    <option value="URGENT">Срочный</option>
                  </>
                )}
              </Select>
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Категория</label>
            <Select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as NotificationCategory })}
            >
              {Array.isArray(categories) && categories.map((c) => (
                <option key={c.value} value={c.value}>{c.displayName}</option>
              ))}
            </Select>
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setFormModal(false)}>Отмена</Button>
          <Button
            onClick={handleSave}
            disabled={!form.type || !form.title || !form.messageTemplate || createTemplate.isPending || updateTemplate.isPending}
          >
            {(createTemplate.isPending || updateTemplate.isPending) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {editingId ? 'Сохранить' : 'Создать'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Удаление шаблона"
      >
        <p>
          Вы действительно хотите удалить шаблон <strong>"{deleteModal?.name}"</strong>?
        </p>
        <ModalFooter>
          <Button variant="outline" onClick={() => setDeleteModal(null)}>Отмена</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteTemplate.isPending}>
            {deleteTemplate.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Удалить
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
