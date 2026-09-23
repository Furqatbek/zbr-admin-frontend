import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Loader2,
  RefreshCw,
  Package,
  Image as ImageIcon,
  ChevronDown,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  Upload,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Modal,
  ModalFooter,
  Input,
  Textarea,
} from '@/components/ui'
import { formatCurrency } from '@/lib/utils'
import { useRestaurant } from '@/hooks/useRestaurants'
import {
  useRestaurantMenu,
  useCreateMenuCategory,
  useUpdateMenuCategory,
  useDeleteMenuCategory,
  useCreateMenuItem,
  useUpdateMenuItem,
  useUpdateMenuItemStock,
  useDeleteMenuItem,
  useUploadMenuItemImage,
  useDeleteMenuItemImage,
} from '@/hooks/useRestaurants'
import type { MenuCategory, MenuItem, ItemOption, CreateMenuCategoryRequest, CreateMenuItemRequest } from '@/types'

// Draft rows for the create form. These mirror what POST /menu/items accepts
// nested on the item (ids/stock are assigned server-side).
type VariantDraft = { name: string; priceDelta: number }
type OptionDraft = {
  groupName: string
  name: string
  priceDelta: number
  isDefault: boolean
  required: boolean
  maxSelections: number
}

const UNGROUPED = 'Прочее'

/** Add-ons are grouped by `groupName`; `required`/`maxSelections` describe the group rule. */
function groupOptions(options: ItemOption[]): [string, ItemOption[]][] {
  const groups = new Map<string, ItemOption[]>()
  for (const option of options) {
    const key = option.groupName || UNGROUPED
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(option)
  }
  return Array.from(groups.entries())
}

export function RestaurantMenuPage() {
  const { id } = useParams()
  const restaurantId = parseInt(id || '0', 10)

  const { data: restaurantData, isLoading: restaurantLoading } = useRestaurant(restaurantId)
  const { data: menuData, isLoading: menuLoading, refetch: refetchMenu } = useRestaurantMenu(restaurantId)

  const restaurant = restaurantData?.data
  const categories = menuData?.data || []

  // Category modal state
  const [categoryModal, setCategoryModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null)
  const [categoryForm, setCategoryForm] = useState<CreateMenuCategoryRequest>({ name: '', description: '', sortOrder: 0 })

  // Item modal state
  const [itemModal, setItemModal] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [itemCategoryId, setItemCategoryId] = useState<number>(0)
  // Sizes (one-of) and add-ons (grouped), draft rows for the CREATE form only.
  // The backend accepts these nested in POST /menu/items and silently ignores
  // them on PUT, so they can never be edited after the item exists.
  const [variantDrafts, setVariantDrafts] = useState<VariantDraft[]>([])
  const [optionDrafts, setOptionDrafts] = useState<OptionDraft[]>([])
  const [itemForm, setItemForm] = useState<CreateMenuItemRequest>({
    categoryId: 0,
    name: '',
    description: '',
    price: 0,
    prepTimeMinutes: 15,
    calories: 0,
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    spicy: false,
    featured: false,
    sortOrder: 0,
  })

  // Image upload state
  const [imageModal, setImageModal] = useState(false)
  const [imageItemId, setImageItemId] = useState<number>(0)
  const [imageFile, setImageFile] = useState<File | null>(null)

  // Delete confirmation
  const [deleteModal, setDeleteModal] = useState<{ type: 'category' | 'item'; id: number; name: string } | null>(null)

  // Expanded categories
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set())

  // Mutations
  const createCategory = useCreateMenuCategory()
  const updateCategory = useUpdateMenuCategory()
  const deleteCategory = useDeleteMenuCategory()
  const createItem = useCreateMenuItem()
  const updateItem = useUpdateMenuItem()
  const updateStock = useUpdateMenuItemStock()
  const deleteItem = useDeleteMenuItem()
  const uploadImage = useUploadMenuItemImage()
  const deleteImage = useDeleteMenuItemImage()

  const toggleCategory = (categoryId: number) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(categoryId)) {
        next.delete(categoryId)
      } else {
        next.add(categoryId)
      }
      return next
    })
  }

  // Category handlers
  const openCreateCategory = () => {
    setEditingCategory(null)
    setCategoryForm({ name: '', description: '', sortOrder: categories.length })
    setCategoryModal(true)
  }

  const openEditCategory = (category: MenuCategory) => {
    setEditingCategory(category)
    setCategoryForm({ name: category.name, description: category.description || '', sortOrder: category.sortOrder })
    setCategoryModal(true)
  }

  const handleSaveCategory = async () => {
    if (editingCategory) {
      await updateCategory.mutateAsync({ restaurantId, categoryId: editingCategory.id, data: categoryForm })
    } else {
      await createCategory.mutateAsync({ restaurantId, data: categoryForm })
    }
    setCategoryModal(false)
    refetchMenu()
  }

  // Item handlers
  const openCreateItem = (categoryId: number) => {
    setEditingItem(null)
    setItemCategoryId(categoryId)
    setVariantDrafts([])
    setOptionDrafts([])
    setItemForm({
      categoryId,
      name: '',
      description: '',
      price: 0,
      prepTimeMinutes: 15,
      calories: 0,
      vegetarian: false,
      vegan: false,
      glutenFree: false,
      spicy: false,
      featured: false,
      sortOrder: 0,
    })
    setItemModal(true)
  }

  const openEditItem = (item: MenuItem) => {
    setEditingItem(item)
    setItemCategoryId(item.categoryId)
    setVariantDrafts([])
    setOptionDrafts([])
    setItemForm({
      categoryId: item.categoryId,
      name: item.name,
      description: item.description || '',
      price: item.price,
      prepTimeMinutes: item.prepTimeMinutes || 15,
      calories: item.calories || 0,
      vegetarian: item.vegetarian || false,
      vegan: item.vegan || false,
      glutenFree: item.glutenFree || false,
      spicy: item.spicy || false,
      featured: item.featured,
      sortOrder: item.sortOrder || 0,
    })
    setItemModal(true)
  }

  const handleSaveItem = async () => {
    if (editingItem) {
      // Deliberately does NOT send variants/options: PUT accepts and silently
      // ignores them, so sending would look like it worked.
      await updateItem.mutateAsync({ restaurantId, itemId: editingItem.id, data: { ...itemForm, categoryId: itemCategoryId } })
    } else {
      const variants = variantDrafts.filter((v) => v.name.trim())
      const options = optionDrafts.filter((o) => o.name.trim())
      await createItem.mutateAsync({
        restaurantId,
        data: {
          ...itemForm,
          categoryId: itemCategoryId,
          ...(variants.length > 0 && { variants }),
          ...(options.length > 0 && {
            options: options.map((o) => ({ ...o, groupName: o.groupName.trim() || UNGROUPED })),
          }),
        },
      })
    }
    setItemModal(false)
    refetchMenu()
  }

  const updateVariantDraft = (index: number, patch: Partial<VariantDraft>) =>
    setVariantDrafts(variantDrafts.map((v, i) => (i === index ? { ...v, ...patch } : v)))

  const updateOptionDraft = (index: number, patch: Partial<OptionDraft>) =>
    setOptionDrafts(optionDrafts.map((o, i) => (i === index ? { ...o, ...patch } : o)))

  const handleToggleStock = async (item: MenuItem) => {
    await updateStock.mutateAsync({ restaurantId, itemId: item.id, inStock: !item.inStock })
    refetchMenu()
  }

  const handleDelete = async () => {
    if (!deleteModal) return
    if (deleteModal.type === 'category') {
      await deleteCategory.mutateAsync({ restaurantId, categoryId: deleteModal.id })
    } else {
      await deleteItem.mutateAsync({ restaurantId, itemId: deleteModal.id })
    }
    setDeleteModal(null)
    refetchMenu()
  }

  // Image handlers
  const openImageUpload = (itemId: number) => {
    setImageItemId(itemId)
    setImageFile(null)
    setImageModal(true)
  }

  const handleImageUpload = async () => {
    if (!imageFile) return
    await uploadImage.mutateAsync({ restaurantId, itemId: imageItemId, file: imageFile })
    setImageModal(false)
    refetchMenu()
  }

  const handleImageDelete = async (itemId: number) => {
    await deleteImage.mutateAsync({ restaurantId, itemId })
    refetchMenu()
  }

  if (restaurantLoading || menuLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--muted-foreground))]" />
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="py-12 text-center">
        <Card className="mx-auto max-w-md">
          <CardContent className="pt-6">
            <p className="text-[hsl(var(--destructive))]">Ресторан не найден</p>
            <Link to="/restaurants">
              <Button className="mt-4">Вернуться к списку</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to={`/restaurants/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Меню: {restaurant.name}</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Управление категориями и позициями меню
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetchMenu()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Обновить
          </Button>
          <Button onClick={openCreateCategory}>
            <Plus className="mr-2 h-4 w-4" />
            Добавить категорию
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10">
                <Package className="h-6 w-6 text-[hsl(var(--primary))]" />
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Категории</p>
                <p className="text-2xl font-bold">{categories.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--success))]/10">
                <Package className="h-6 w-6 text-[hsl(var(--success))]" />
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Всего позиций</p>
                <p className="text-2xl font-bold">
                  {categories.reduce((sum, cat) => sum + (cat.items?.length || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--warning))]/10">
                <Package className="h-6 w-6 text-[hsl(var(--warning))]" />
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Нет в наличии</p>
                <p className="text-2xl font-bold">
                  {categories.reduce((sum, cat) => sum + (cat.items?.filter(i => !i.inStock).length || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories with items */}
      {categories.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="mx-auto h-12 w-12 text-[hsl(var(--muted-foreground))]" />
            <p className="mt-4 text-lg font-medium">Меню пусто</p>
            <p className="mt-1 text-[hsl(var(--muted-foreground))]">
              Добавьте первую категорию, чтобы начать создание меню
            </p>
            <Button className="mt-4" onClick={openCreateCategory}>
              <Plus className="mr-2 h-4 w-4" />
              Добавить категорию
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {categories.map((category) => (
            <Card key={category.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="flex items-center gap-3 text-left"
                  >
                    {expandedCategories.has(category.id) ? (
                      <ChevronDown className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                    )}
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {category.name}
                        <Badge variant={category.active ? 'success' : 'secondary'}>
                          {category.active ? 'Активна' : 'Неактивна'}
                        </Badge>
                        <Badge variant="default">
                          {category.items?.length || 0} позиций
                        </Badge>
                      </CardTitle>
                      {category.description && (
                        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </button>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openCreateItem(category.id)} title="Добавить позицию">
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openEditCategory(category)} title="Редактировать">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteModal({ type: 'category', id: category.id, name: category.name })}
                      title="Удалить"
                    >
                      <Trash2 className="h-4 w-4 text-[hsl(var(--destructive))]" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {expandedCategories.has(category.id) && (
                <CardContent className="pt-0">
                  {(!category.items || category.items.length === 0) ? (
                    <div className="rounded-lg border border-dashed border-[hsl(var(--border))] p-8 text-center">
                      <p className="text-[hsl(var(--muted-foreground))]">Нет позиций в этой категории</p>
                      <Button variant="outline" size="sm" className="mt-2" onClick={() => openCreateItem(category.id)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Добавить позицию
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {category.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 rounded-lg border border-[hsl(var(--border))] p-4"
                        >
                          {/* Image */}
                          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--muted))] overflow-hidden">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                            ) : (
                              <ImageIcon className="h-6 w-6 text-[hsl(var(--muted-foreground))]" />
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium truncate">{item.name}</p>
                              {item.featured && <Badge variant="warning">Рекомендуемое</Badge>}
                              {item.spicy && <Badge variant="destructive">Острое</Badge>}
                              {item.vegetarian && <Badge variant="success">Вегетарианское</Badge>}
                              {item.vegan && <Badge variant="success">Веганское</Badge>}
                            </div>
                            {item.description && (
                              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))] truncate">
                                {item.description}
                              </p>
                            )}
                            <div className="mt-1 flex items-center gap-3 text-sm text-[hsl(var(--muted-foreground))]">
                              {item.prepTimeMinutes && <span>{item.prepTimeMinutes} мин</span>}
                              {item.calories && <span>{item.calories} ккал</span>}
                            </div>

                            {/* Sizes: one-of. totalPrice is the server's own sum
                                (base + delta) — show it rather than re-deriving. */}
                            {item.variants && item.variants.length > 0 && (
                              <div className="mt-2 flex flex-wrap items-center gap-1">
                                <span className="text-xs text-[hsl(var(--muted-foreground))]">Размеры:</span>
                                {item.variants.map((v) => (
                                  <Badge
                                    key={v.id}
                                    variant={v.inStock ? 'secondary' : 'outline'}
                                    className={v.inStock ? '' : 'line-through opacity-60'}
                                    title={v.inStock ? undefined : 'Нет в наличии'}
                                  >
                                    {v.name} · {formatCurrency(v.totalPrice ?? item.price + v.priceDelta)}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {/* Add-ons, grouped by groupName; the group rule comes
                                from required/maxSelections on its members. */}
                            {item.options && item.options.length > 0 &&
                              groupOptions(item.options).map(([groupName, opts]) => (
                                <div key={groupName} className="mt-1 flex flex-wrap items-center gap-1">
                                  <span className="text-xs text-[hsl(var(--muted-foreground))]">
                                    {groupName} ({opts[0].required ? 'обязательно' : 'необязательно'}
                                    {opts[0].maxSelections ? `, макс. ${opts[0].maxSelections}` : ''}):
                                  </span>
                                  {opts.map((o) => (
                                    <Badge
                                      key={o.id}
                                      variant={o.inStock ? 'secondary' : 'outline'}
                                      className={o.inStock ? '' : 'line-through opacity-60'}
                                      title={o.inStock ? undefined : 'Нет в наличии'}
                                    >
                                      {o.isDefault && '★ '}
                                      {o.name}
                                      {o.priceDelta !== 0 && ` +${formatCurrency(o.priceDelta)}`}
                                    </Badge>
                                  ))}
                                </div>
                              ))}
                          </div>

                          {/* Price. `effectivePrice` is what the customer is
                              actually charged; it equals `price` today, but a
                              POS partner can set it away from `price`, so show
                              it — and flag the divergence rather than hiding it
                              (an invisible markup is what caused the incident). */}
                          <div className="text-right">
                            {(() => {
                              const charged = item.effectivePrice ?? item.price
                              const diverges = item.effectivePrice != null && item.effectivePrice !== item.price
                              return (
                                <>
                                  <p className="text-lg font-bold">{formatCurrency(charged)}</p>
                                  {diverges && (
                                    <p className="text-xs text-[hsl(var(--warning))]">
                                      База: {formatCurrency(item.price)}
                                    </p>
                                  )}
                                  {item.originalPrice && item.originalPrice > charged && (
                                    <p className="text-sm text-[hsl(var(--muted-foreground))] line-through">
                                      {formatCurrency(item.originalPrice)}
                                    </p>
                                  )}
                                </>
                              )
                            })()}
                          </div>

                          {/* Stock toggle */}
                          <button
                            onClick={() => handleToggleStock(item)}
                            className="flex-shrink-0"
                            title={item.inStock ? 'В наличии — нажмите для снятия' : 'Нет в наличии — нажмите для возврата'}
                          >
                            {item.inStock ? (
                              <ToggleRight className="h-8 w-8 text-[hsl(var(--success))]" />
                            ) : (
                              <ToggleLeft className="h-8 w-8 text-[hsl(var(--muted-foreground))]" />
                            )}
                          </button>

                          {/* Actions */}
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openImageUpload(item.id)} title="Загрузить изображение">
                              <Upload className="h-4 w-4" />
                            </Button>
                            {item.imageUrl && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleImageDelete(item.id)}
                                title="Удалить изображение"
                              >
                                <ImageIcon className="h-4 w-4 text-[hsl(var(--destructive))]" />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" onClick={() => openEditItem(item)} title="Редактировать">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteModal({ type: 'item', id: item.id, name: item.name })}
                              title="Удалить"
                            >
                              <Trash2 className="h-4 w-4 text-[hsl(var(--destructive))]" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Category Modal */}
      <Modal
        isOpen={categoryModal}
        onClose={() => setCategoryModal(false)}
        title={editingCategory ? 'Редактирование категории' : 'Новая категория'}
      >
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Название</label>
            <Input
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              placeholder="Название категории"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Описание</label>
            <Textarea
              value={categoryForm.description || ''}
              onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
              placeholder="Описание категории"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Порядок сортировки</label>
            <Input
              type="number"
              value={categoryForm.sortOrder || 0}
              onChange={(e) => setCategoryForm({ ...categoryForm, sortOrder: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setCategoryModal(false)}>Отмена</Button>
          <Button
            onClick={handleSaveCategory}
            disabled={!categoryForm.name || createCategory.isPending || updateCategory.isPending}
          >
            {(createCategory.isPending || updateCategory.isPending) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {editingCategory ? 'Сохранить' : 'Создать'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Item Modal */}
      <Modal
        isOpen={itemModal}
        onClose={() => setItemModal(false)}
        title={editingItem ? 'Редактирование позиции' : 'Новая позиция'}
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          <div>
            <label className="mb-2 block text-sm font-medium">Название</label>
            <Input
              value={itemForm.name}
              onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
              placeholder="Название позиции"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Описание</label>
            <Textarea
              value={itemForm.description || ''}
              onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
              placeholder="Описание позиции"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Цена</label>
              <Input
                type="number"
                step="0.01"
                value={itemForm.price}
                onChange={(e) => setItemForm({ ...itemForm, price: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Старая цена</label>
              <Input
                type="number"
                step="0.01"
                value={itemForm.originalPrice || ''}
                onChange={(e) => setItemForm({ ...itemForm, originalPrice: parseFloat(e.target.value) || undefined })}
                placeholder="Если есть скидка"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Время приготовления (мин)</label>
              <Input
                type="number"
                value={itemForm.prepTimeMinutes || ''}
                onChange={(e) => setItemForm({ ...itemForm, prepTimeMinutes: parseInt(e.target.value) || undefined })}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Калории</label>
              <Input
                type="number"
                value={itemForm.calories || ''}
                onChange={(e) => setItemForm({ ...itemForm, calories: parseInt(e.target.value) || undefined })}
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Порядок сортировки</label>
            <Input
              type="number"
              value={itemForm.sortOrder || 0}
              onChange={(e) => setItemForm({ ...itemForm, sortOrder: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-medium">Свойства</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'featured', label: 'Рекомендуемое' },
                { key: 'vegetarian', label: 'Вегетарианское' },
                { key: 'vegan', label: 'Веганское' },
                { key: 'glutenFree', label: 'Без глютена' },
                { key: 'spicy', label: 'Острое' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!itemForm[key as keyof typeof itemForm]}
                    onChange={(e) => setItemForm({ ...itemForm, [key]: e.target.checked })}
                    className="h-4 w-4 rounded border-[hsl(var(--border))]"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sizes & add-ons. The backend only accepts these nested in the
              CREATE call — PUT accepts and silently ignores them — so they are
              editable when creating and read-only forever after. */}
          {editingItem ? (
            <div className="rounded-lg border border-[hsl(var(--warning))]/40 bg-[hsl(var(--warning))]/5 p-3">
              <p className="text-sm font-medium">Размеры и добавки нельзя изменить</p>
              <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                Бэкенд принимает их только при создании позиции: при сохранении изменений они
                молча игнорируются. Чтобы изменить — удалите позицию и создайте заново.
              </p>
              {(editingItem.variants?.length ?? 0) + (editingItem.options?.length ?? 0) > 0 ? (
                <div className="mt-2 space-y-1 text-xs">
                  {editingItem.variants?.map((v) => (
                    <div key={`v-${v.id}`}>
                      Размер: <strong>{v.name}</strong> ·{' '}
                      {formatCurrency(v.totalPrice ?? editingItem.price + v.priceDelta)}
                      {!v.inStock && ' (нет в наличии)'}
                    </div>
                  ))}
                  {editingItem.options?.map((o) => (
                    <div key={`o-${o.id}`}>
                      {o.groupName || UNGROUPED}: <strong>{o.name}</strong>
                      {o.priceDelta !== 0 && ` +${formatCurrency(o.priceDelta)}`}
                      {o.isDefault && ' · по умолчанию'}
                      {!o.inStock && ' (нет в наличии)'}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-xs">У этой позиции нет размеров и добавок.</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Variants — one-of (a size) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Размеры (выбор одного)</label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setVariantDrafts([...variantDrafts, { name: '', priceDelta: 0 }])}
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Добавить
                  </Button>
                </div>
                {variantDrafts.length === 0 && (
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    Необязательно. Цена указывается как разница от базовой.
                  </p>
                )}
                {variantDrafts.map((v, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      placeholder="Например: Большой"
                      value={v.name}
                      onChange={(e) => updateVariantDraft(i, { name: e.target.value })}
                    />
                    <Input
                      type="number"
                      className="w-32"
                      placeholder="+ к цене"
                      value={v.priceDelta}
                      onChange={(e) => updateVariantDraft(i, { priceDelta: parseFloat(e.target.value) || 0 })}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setVariantDrafts(variantDrafts.filter((_, idx) => idx !== i))}
                    >
                      <Trash2 className="h-4 w-4 text-[hsl(var(--destructive))]" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Options — add-ons, grouped by name */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Добавки</label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setOptionDrafts([
                        ...optionDrafts,
                        { groupName: '', name: '', priceDelta: 0, isDefault: false, required: false, maxSelections: 1 },
                      ])
                    }
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Добавить
                  </Button>
                </div>
                {optionDrafts.length === 0 && (
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    Необязательно. Добавки с одинаковой группой образуют один блок выбора.
                  </p>
                )}
                {optionDrafts.map((o, i) => (
                  <div key={i} className="space-y-2 rounded-lg border border-[hsl(var(--border))] p-2">
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        placeholder="Группа: Соус"
                        value={o.groupName}
                        onChange={(e) => updateOptionDraft(i, { groupName: e.target.value })}
                      />
                      <Input
                        placeholder="Название: Чесночный"
                        value={o.name}
                        onChange={(e) => updateOptionDraft(i, { name: e.target.value })}
                      />
                      <Input
                        type="number"
                        placeholder="+ к цене"
                        value={o.priceDelta}
                        onChange={(e) => updateOptionDraft(i, { priceDelta: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <label className="flex cursor-pointer items-center gap-1">
                        <input
                          type="checkbox"
                          checked={o.required}
                          onChange={(e) => updateOptionDraft(i, { required: e.target.checked })}
                          className="h-4 w-4 rounded border-[hsl(var(--border))]"
                        />
                        Обязательно
                      </label>
                      <label className="flex items-center gap-1">
                        Макс.
                        <Input
                          type="number"
                          min={1}
                          className="h-7 w-16"
                          value={o.maxSelections}
                          onChange={(e) => updateOptionDraft(i, { maxSelections: parseInt(e.target.value) || 1 })}
                        />
                      </label>
                      <label className="flex cursor-pointer items-center gap-1">
                        <input
                          type="checkbox"
                          checked={o.isDefault}
                          onChange={(e) => updateOptionDraft(i, { isDefault: e.target.checked })}
                          className="h-4 w-4 rounded border-[hsl(var(--border))]"
                        />
                        По умолчанию
                      </label>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto"
                        onClick={() => setOptionDrafts(optionDrafts.filter((_, idx) => idx !== i))}
                      >
                        <Trash2 className="h-4 w-4 text-[hsl(var(--destructive))]" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setItemModal(false)}>Отмена</Button>
          <Button
            onClick={handleSaveItem}
            disabled={!itemForm.name || !itemForm.price || createItem.isPending || updateItem.isPending}
          >
            {(createItem.isPending || updateItem.isPending) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {editingItem ? 'Сохранить' : 'Создать'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Image Upload Modal */}
      <Modal
        isOpen={imageModal}
        onClose={() => setImageModal(false)}
        title="Загрузка изображения"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Файл изображения</label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />
          </div>
          {imageFile && (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Выбран: {imageFile.name} ({(imageFile.size / 1024).toFixed(1)} КБ)
            </p>
          )}
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setImageModal(false)}>Отмена</Button>
          <Button onClick={handleImageUpload} disabled={!imageFile || uploadImage.isPending}>
            {uploadImage.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Загрузить
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Подтверждение удаления"
      >
        <p>
          Вы действительно хотите удалить {deleteModal?.type === 'category' ? 'категорию' : 'позицию'}{' '}
          <strong>"{deleteModal?.name}"</strong>?
        </p>
        {deleteModal?.type === 'category' && (
          <p className="mt-2 text-sm text-[hsl(var(--destructive))]">
            Все позиции в этой категории также будут удалены.
          </p>
        )}
        <ModalFooter>
          <Button variant="outline" onClick={() => setDeleteModal(null)}>Отмена</Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteCategory.isPending || deleteItem.isPending}
          >
            {(deleteCategory.isPending || deleteItem.isPending) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Удалить
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
