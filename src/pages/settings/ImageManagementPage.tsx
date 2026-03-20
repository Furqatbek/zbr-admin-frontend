import { useState, useRef } from 'react'
import {
  Upload,
  Trash2,
  Loader2,
  Image as ImageIcon,
  FolderOpen,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Input,
  Select,
} from '@/components/ui'
import {
  useUploadImage,
  useUploadMenuItemImageViaImagesApi,
  useDeleteImage,
} from '@/hooks/useImages'
import type { ImageCategory } from '@/types'

const categoryLabels: Record<ImageCategory, string> = {
  restaurants: 'Рестораны',
  'menu-items': 'Позиции меню',
  profiles: 'Профили',
  documents: 'Документы',
}

export function ImageManagementPage() {
  const [category, setCategory] = useState<ImageCategory>('restaurants')
  const [menuItemId, setMenuItemId] = useState('')
  const [deleteCategory, setDeleteCategory] = useState<ImageCategory>('restaurants')
  const [deleteFilename, setDeleteFilename] = useState('')
  const [uploadResult, setUploadResult] = useState<string | null>(null)
  const [menuUploadResult, setMenuUploadResult] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const menuFileInputRef = useRef<HTMLInputElement>(null)

  const uploadImage = useUploadImage(category)
  const uploadMenuItemImage = useUploadMenuItemImageViaImagesApi()
  const deleteImage = useDeleteImage()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const result = await uploadImage.mutateAsync(file)
      setUploadResult(result?.data?.url || result?.data?.filename || 'Загружено')
    } catch {
      setUploadResult(null)
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleMenuItemUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !menuItemId) return

    try {
      const result = await uploadMenuItemImage.mutateAsync({ menuItemId: parseInt(menuItemId), file })
      setMenuUploadResult(result?.data?.url || result?.data?.filename || 'Загружено')
    } catch {
      setMenuUploadResult(null)
    }
    if (menuFileInputRef.current) menuFileInputRef.current.value = ''
  }

  const handleDelete = () => {
    if (!deleteFilename) return
    deleteImage.mutate({ category: deleteCategory, filename: deleteFilename })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Управление изображениями</h1>
        <p className="text-[hsl(var(--muted-foreground))]">
          Загрузка и удаление изображений по категориям
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upload to Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Загрузка по категории
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Категория</label>
              <Select value={category} onChange={(e) => setCategory(e.target.value as ImageCategory)}>
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </Select>
            </div>

            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadImage.isPending}
                className="w-full"
              >
                {uploadImage.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                Выбрать и загрузить файл
              </Button>
            </div>

            {uploadImage.isSuccess && uploadResult && (
              <div className="rounded-lg bg-[hsl(var(--success))]/10 p-3">
                <Badge variant="success">Загружено</Badge>
                <p className="mt-1 text-sm break-all">{uploadResult}</p>
              </div>
            )}
            {uploadImage.isError && (
              <Badge variant="destructive">Ошибка загрузки</Badge>
            )}
          </CardContent>
        </Card>

        {/* Upload Menu Item Image */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Изображение позиции меню
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">ID позиции меню</label>
              <Input
                type="number"
                value={menuItemId}
                onChange={(e) => setMenuItemId(e.target.value)}
                placeholder="Введите ID"
              />
            </div>

            <div>
              <input
                ref={menuFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleMenuItemUpload}
                className="hidden"
              />
              <Button
                onClick={() => menuFileInputRef.current?.click()}
                disabled={uploadMenuItemImage.isPending || !menuItemId}
                className="w-full"
              >
                {uploadMenuItemImage.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                Загрузить изображение
              </Button>
            </div>

            {uploadMenuItemImage.isSuccess && menuUploadResult && (
              <div className="rounded-lg bg-[hsl(var(--success))]/10 p-3">
                <Badge variant="success">Загружено</Badge>
                <p className="mt-1 text-sm break-all">{menuUploadResult}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Image */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Удаление изображения
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="mb-2 block text-sm font-medium">Категория</label>
                <Select value={deleteCategory} onChange={(e) => setDeleteCategory(e.target.value as ImageCategory)}>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </Select>
              </div>
              <div className="flex-1">
                <label className="mb-2 block text-sm font-medium">Имя файла</label>
                <Input
                  value={deleteFilename}
                  onChange={(e) => setDeleteFilename(e.target.value)}
                  placeholder="example.jpg"
                />
              </div>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteImage.isPending || !deleteFilename}
              >
                {deleteImage.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Удалить
              </Button>
            </div>

            {deleteImage.isSuccess && (
              <Badge variant="success">Изображение удалено</Badge>
            )}
            {deleteImage.isError && (
              <Badge variant="destructive">Ошибка удаления</Badge>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Badge variant="outline">
          <FolderOpen className="mr-1 h-3 w-3" />
          Категории: {Object.keys(categoryLabels).length}
        </Badge>
      </div>
    </div>
  )
}
