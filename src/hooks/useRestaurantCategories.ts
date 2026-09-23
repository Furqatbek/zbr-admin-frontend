import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { restaurantCategoriesApi } from '@/api/categories.api'
import { restaurantKeys } from './useRestaurants'
import type {
  CreateRestaurantCategoryRequest,
  UpdateRestaurantCategoryRequest,
} from '@/types'

export const categoryKeys = {
  all: ['restaurant-categories'] as const,
  admin: () => [...categoryKeys.all, 'admin'] as const,
  public: () => [...categoryKeys.all, 'public'] as const,
}

/** Every category, including empty and deactivated ones (admin view). */
export function useAllRestaurantCategories() {
  return useQuery({
    queryKey: categoryKeys.admin(),
    queryFn: () => restaurantCategoriesApi.listAll(),
  })
}

/** Only categories with an open restaurant — what the customer app sees. */
export function usePublicRestaurantCategories() {
  return useQuery({
    queryKey: categoryKeys.public(),
    queryFn: () => restaurantCategoriesApi.listPublic(),
  })
}

export function useCreateRestaurantCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateRestaurantCategoryRequest) => restaurantCategoriesApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: categoryKeys.all }),
  })
}

export function useUpdateRestaurantCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateRestaurantCategoryRequest }) =>
      restaurantCategoriesApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: categoryKeys.all }),
  })
}

/**
 * Assign or (with no categoryId) unfile a restaurant. Invalidates restaurants
 * as well as categories: a category's public visibility depends on whether any
 * restaurant points at it.
 */
export function useAssignRestaurantCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ restaurantId, categoryId }: { restaurantId: number; categoryId?: number }) =>
      restaurantCategoriesApi.assign(restaurantId, categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })
      queryClient.invalidateQueries({ queryKey: restaurantKeys.all })
    },
  })
}
