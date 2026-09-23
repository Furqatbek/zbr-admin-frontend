import { useState } from 'react'
import { Link } from 'react-router-dom'
import { UtensilsCrossed, Star, Loader2, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Select } from '@/components/ui'
import { apiErrorMessage } from '@/lib/apiError'
import { useAuthStore } from '@/store/auth.store'
import {
  useAllRestaurantCategories,
  useAssignRestaurantCategory,
} from '@/hooks/useRestaurantCategories'
import { useSetRestaurantFeatured } from '@/hooks/useRestaurants'
import type { Restaurant } from '@/types'

interface Props {
  restaurant: Restaurant
}

/** Cuisine category + the adjacent featured switch (same permission level). */
export function CategoryAssignment({ restaurant }: Props) {
  const { hasAnyRole } = useAuthStore()
  const canManage = hasAnyRole(['ADMIN', 'PLATFORM'])

  const { data } = useAllRestaurantCategories()
  const assign = useAssignRestaurantCategory()
  const setFeatured = useSetRestaurantFeatured()
  const [error, setError] = useState<string | null>(null)

  // Only active categories can be assigned; a retired one stays shown if this
  // restaurant is still filed under it.
  const categories = [...(data?.data ?? [])]
    .filter((c) => (c.active ?? true) || c.id === restaurant.category?.id)
    .sort((a, b) => a.sortOrder - b.sortOrder)

  const handleAssign = async (value: string) => {
    setError(null)
    try {
      // An empty choice means unfile: the categoryId is omitted entirely.
      await assign.mutateAsync({
        restaurantId: restaurant.id,
        categoryId: value ? parseInt(value) : undefined,
      })
    } catch (err) {
      setError(apiErrorMessage(err, 'Не удалось изменить категорию'))
    }
  }

  const handleFeatured = async () => {
    setError(null)
    try {
      await setFeatured.mutateAsync({ id: restaurant.id, featured: !restaurant.featured })
    } catch (err) {
      setError(apiErrorMessage(err, 'Не удалось изменить признак «Рекомендуемый»'))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UtensilsCrossed className="h-5 w-5" />
          Кухня и витрина
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && (
          <div className="flex items-start gap-2 rounded-md bg-[hsl(var(--destructive))]/10 p-2 text-xs text-[hsl(var(--destructive))]">
            <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <p className="mb-2 text-sm text-[hsl(var(--muted-foreground))]">Категория кухни</p>
          {canManage ? (
            <Select
              value={restaurant.category?.id ?? ''}
              disabled={assign.isPending}
              onChange={(e) => handleAssign(e.target.value)}
            >
              <option value="">Без категории</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameUz || c.name}
                  {c.active === false ? ' (отключена)' : ''}
                </option>
              ))}
            </Select>
          ) : restaurant.category ? (
            <Badge variant="secondary">{restaurant.category.name}</Badge>
          ) : (
            <span className="text-sm text-[hsl(var(--muted-foreground))]">Без категории</span>
          )}
          {assign.isPending && (
            <p className="mt-1 flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))]">
              <Loader2 className="h-3 w-3 animate-spin" />
              Сохранение...
            </p>
          )}
          {!restaurant.category && (
            <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
              Пока ресторан не отнесён к кухне, он не попадает в чипы клиентского приложения.
            </p>
          )}
        </div>

        {canManage && (
          <div className="flex items-center justify-between rounded-lg border border-[hsl(var(--border))] p-3">
            <div>
              <p className="text-sm font-medium">Рекомендуемый</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Показывается в подборке на главной
              </p>
            </div>
            <Button
              variant={restaurant.featured ? 'default' : 'outline'}
              size="sm"
              disabled={setFeatured.isPending}
              onClick={handleFeatured}
            >
              {setFeatured.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Star className={`mr-1 h-4 w-4 ${restaurant.featured ? 'fill-current' : ''}`} />
              )}
              {restaurant.featured ? 'Да' : 'Нет'}
            </Button>
          </div>
        )}

        {canManage && (
          <Link to="/restaurants/categories" className="block">
            <Button variant="outline" size="sm" className="w-full">
              Управление категориями
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
