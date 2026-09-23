import { useRef, useState } from 'react'
import { UtensilsCrossed, Plus, Edit, Loader2, RefreshCw, Image as ImageIcon, EyeOff, Upload } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Badge,
  Modal,
  ModalFooter,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui'
import { apiErrorMessage } from '@/lib/apiError'
import {
  useAllRestaurantCategories,
  usePublicRestaurantCategories,
  useCreateRestaurantCategory,
  useUpdateRestaurantCategory,
} from '@/hooks/useRestaurantCategories'
import { useUploadImage } from '@/hooks/useImages'
import type { RestaurantCategory } from '@/types'

/** Read a picked image's pixel size so we can warn about the expected 256x256. */
function readImageSize(file: File): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(null)
    }
    img.src = objectUrl
  })
}

const EMPTY_FORM = {
  nameUz: '',
  nameRu: '',
  nameEn: '',
  sortOrder: 0,
  imageUrl: '',
}

export function RestaurantCategoriesPage() {
  const { data, isLoading, isFetching, refetch } = useAllRestaurantCategories()
  const { data: publicData } = usePublicRestaurantCategories()
  const createCategory = useCreateRestaurantCategory()
  const updateCategory = useUpdateRestaurantCategory()

  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<RestaurantCategory | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState<string | null>(null)
  const [sizeWarning, setSizeWarning] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  // There is no cuisine-category bucket in the images API, so icons go in the
  // 'restaurants' bucket; the endpoint returns the URL we store on the category.
  const uploadImage = useUploadImage('restaurants')

  const categories = [...(data?.data ?? [])].sort((a, b) => a.sortOrder - b.sortOrder)
  // The public endpoint only returns categories with an open restaurant.
  const visibleIds = new Set((publicData?.data ?? []).map((c) => c.id))

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setError(null)
    setSizeWarning(null)
    setModal(true)
  }

  const openEdit = (category: RestaurantCategory) => {
    setEditing(category)
    setForm({
      nameUz: category.nameUz ?? category.name ?? '',
      nameRu: category.nameRu ?? '',
      nameEn: category.nameEn ?? '',
      sortOrder: category.sortOrder ?? 0,
      imageUrl: category.imageUrl ?? '',
    })
    setError(null)
    setSizeWarning(null)
    setModal(true)
  }

  const handlePickImage = async (file?: File | null) => {
    if (!file) return
    setError(null)
    setSizeWarning(null)
    if (!file.type.startsWith('image/')) {
      setError('Выбранный файл не является изображением')
      return
    }
    try {
      const size = await readImageSize(file)
      if (size && (size.width !== 256 || size.height !== 256)) {
        setSizeWarning(`Ожидается 256×256 PNG, выбрано ${size.width}×${size.height}. Файл загружен как есть.`)
      }
      const uploaded = await uploadImage.mutateAsync(file)
      const url = uploaded.data?.url
      if (!url) throw new Error('Ответ загрузки не содержит URL')
      setForm((f) => ({ ...f, imageUrl: url }))
    } catch (err) {
      setError(apiErrorMessage(err, 'Не удалось загрузить изображение'))
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSave = async () => {
    setError(null)
    try {
      // The body is strict — a misspelled field is a 400 naming it — so send
      // only known fields, and only those with a value.
      if (editing) {
        await updateCategory.mutateAsync({
          id: editing.id,
          data: {
            nameUz: form.nameUz.trim(),
            nameRu: form.nameRu.trim() || undefined,
            nameEn: form.nameEn.trim() || undefined,
            sortOrder: form.sortOrder,
            imageUrl: form.imageUrl.trim() || undefined,
          },
        })
      } else {
        await createCategory.mutateAsync({
          nameUz: form.nameUz.trim(),
          nameRu: form.nameRu.trim() || undefined,
          nameEn: form.nameEn.trim() || undefined,
          sortOrder: form.sortOrder,
          imageUrl: form.imageUrl.trim() || undefined,
        })
      }
      setModal(false)
    } catch (err) {
      setError(apiErrorMessage(err, 'Не удалось сохранить категорию'))
    }
  }

  const toggleActive = async (category: RestaurantCategory) => {
    setError(null)
    try {
      await updateCategory.mutateAsync({ id: category.id, data: { active: !(category.active ?? true) } })
    } catch (err) {
      setError(apiErrorMessage(err, 'Не удалось изменить категорию'))
    }
  }

  const saving = createCategory.isPending || updateCategory.isPending

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Категории кухонь</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Справочник кухонь для витрины клиентского приложения
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Обновить
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Новая категория
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-[hsl(var(--destructive))]/10 p-3 text-sm text-[hsl(var(--destructive))]">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 p-3 text-sm text-[hsl(var(--muted-foreground))]">
        Клиент видит только категории, в которых есть хотя бы один открытый ресторан — чтобы чип
        не вёл на пустой экран. «Не видна» ниже означает именно это, а не ошибку.
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UtensilsCrossed className="h-4 w-4" />
            Все категории ({categories.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--muted-foreground))]" />
            </div>
          ) : categories.length === 0 ? (
            <div className="py-12 text-center text-[hsl(var(--muted-foreground))]">
              Категорий нет
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[70px]">Порядок</TableHead>
                  <TableHead>Название</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Изображение</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="w-[140px]">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => {
                  const active = category.active ?? true
                  return (
                    <TableRow key={category.id} className={active ? '' : 'opacity-60'}>
                      <TableCell className="text-sm text-[hsl(var(--muted-foreground))]">
                        {category.sortOrder}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{category.nameUz || category.name}</div>
                        <div className="text-sm text-[hsl(var(--muted-foreground))]">
                          {[category.nameRu, category.nameEn].filter(Boolean).join(' · ') || '—'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs text-[hsl(var(--muted-foreground))]">{category.slug}</code>
                      </TableCell>
                      <TableCell>
                        {category.imageUrl ? (
                          <img src={category.imageUrl} alt="" className="h-8 w-8 rounded object-cover" />
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-[hsl(var(--warning))]">
                            <ImageIcon className="h-3 w-3" />
                            нет
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {active ? (
                            <Badge variant="success">Активна</Badge>
                          ) : (
                            <Badge variant="secondary">Отключена</Badge>
                          )}
                          {active && !visibleIds.has(category.id) && (
                            <Badge variant="outline" title="Нет открытых ресторанов в этой категории">
                              <EyeOff className="mr-1 h-3 w-3" />
                              Не видна
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(category)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={saving}
                            onClick={() => toggleActive(category)}
                          >
                            {active ? 'Отключить' : 'Включить'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={modal}
        onClose={() => setModal(false)}
        title={editing ? 'Редактирование категории' : 'Новая категория'}
        description={editing ? `slug: ${editing.slug}` : 'Slug будет создан автоматически'}
      >
        <div className="space-y-4">
          {error && (
            <div className="rounded-md bg-[hsl(var(--destructive))]/10 p-3 text-sm text-[hsl(var(--destructive))]">
              {error}
            </div>
          )}
          <div>
            <label className="mb-2 block text-sm font-medium">Название (uz) *</label>
            <Input
              value={form.nameUz}
              onChange={(e) => setForm({ ...form, nameUz: e.target.value })}
              placeholder="Milliy taomlar"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Название (ru)</label>
              <Input
                value={form.nameRu}
                onChange={(e) => setForm({ ...form, nameRu: e.target.value })}
                placeholder="Национальная кухня"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Название (en)</label>
              <Input
                value={form.nameEn}
                onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                placeholder="National"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Порядок</label>
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Изображение</label>
              <div className="flex items-center gap-2">
                {form.imageUrl ? (
                  <img src={form.imageUrl} alt="" className="h-10 w-10 shrink-0 rounded object-cover" />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-[hsl(var(--muted))]">
                    <ImageIcon className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handlePickImage(e.target.files?.[0])}
                />
                <Button
                  variant="outline"
                  size="sm"
                  disabled={uploadImage.isPending}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploadImage.isPending ? (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-1 h-4 w-4" />
                  )}
                  Загрузить
                </Button>
                {form.imageUrl && (
                  <Button variant="ghost" size="sm" onClick={() => setForm({ ...form, imageUrl: '' })}>
                    Убрать
                  </Button>
                )}
              </div>
              <Input
                className="mt-2"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="или вставьте URL"
              />
              {sizeWarning && (
                <p className="mt-1 text-xs text-[hsl(var(--warning))]">{sizeWarning}</p>
              )}
            </div>
          </div>
          {editing && (
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Slug не редактируется — на него ссылаются аналитика и ссылки. Категории нельзя
              удалить, только отключить.
            </p>
          )}
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setModal(false)}>
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={saving || !form.nameUz.trim()}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {editing ? 'Сохранить' : 'Создать'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
