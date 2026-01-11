import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { restaurantsApi, type RestaurantsQueryParams, type UpdateRestaurantStatusRequest } from '@/api/restaurants.api'

export const restaurantKeys = {
  all: ['restaurants'] as const,
  lists: () => [...restaurantKeys.all, 'list'] as const,
  list: (params: RestaurantsQueryParams) => [...restaurantKeys.lists(), params] as const,
  details: () => [...restaurantKeys.all, 'detail'] as const,
  detail: (id: number) => [...restaurantKeys.details(), id] as const,
  orders: (id: number) => [...restaurantKeys.detail(id), 'orders'] as const,
}

export function useRestaurants(params: RestaurantsQueryParams = {}) {
  return useQuery({
    queryKey: restaurantKeys.list(params),
    queryFn: () => restaurantsApi.getRestaurants(params),
  })
}

export function useRestaurant(id: number) {
  return useQuery({
    queryKey: restaurantKeys.detail(id),
    queryFn: () => restaurantsApi.getRestaurantById(id),
    enabled: !!id,
  })
}

export function useUpdateRestaurantStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateRestaurantStatusRequest }) =>
      restaurantsApi.updateRestaurantStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: restaurantKeys.all })
    },
  })
}

export function useRestaurantOrders(id: number, params: { page?: number; size?: number } = {}) {
  return useQuery({
    queryKey: [...restaurantKeys.orders(id), params],
    queryFn: () => restaurantsApi.getRestaurantOrders(id, params),
    enabled: !!id,
  })
}
