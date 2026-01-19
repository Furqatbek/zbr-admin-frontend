import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  restaurantsApi,
  type RestaurantsQueryParams,
  type SearchParams,
  type NearbyParams,
} from '@/api/restaurants.api'
import type {
  RestaurantStatus,
  CreateRestaurantRequest,
  UpdateRestaurantRequest,
  CreateMenuCategoryRequest,
  CreateMenuItemRequest,
} from '@/types'

export const restaurantKeys = {
  all: ['restaurants'] as const,
  lists: () => [...restaurantKeys.all, 'list'] as const,
  list: (params: RestaurantsQueryParams) => [...restaurantKeys.lists(), params] as const,
  active: (params: RestaurantsQueryParams) => [...restaurantKeys.all, 'active', params] as const,
  featured: (params: RestaurantsQueryParams) => [...restaurantKeys.all, 'featured', params] as const,
  search: (params: SearchParams) => [...restaurantKeys.all, 'search', params] as const,
  nearby: (params: NearbyParams) => [...restaurantKeys.all, 'nearby', params] as const,
  my: () => [...restaurantKeys.all, 'my'] as const,
  details: () => [...restaurantKeys.all, 'detail'] as const,
  detail: (id: number) => [...restaurantKeys.details(), id] as const,
  orders: (id: number) => [...restaurantKeys.detail(id), 'orders'] as const,
  menu: (restaurantId: number) => [...restaurantKeys.detail(restaurantId), 'menu'] as const,
  categories: (restaurantId: number) => [...restaurantKeys.detail(restaurantId), 'categories'] as const,
  menuItems: (restaurantId: number, params?: RestaurantsQueryParams) =>
    [...restaurantKeys.detail(restaurantId), 'items', params] as const,
  menuItem: (restaurantId: number, itemId: number) =>
    [...restaurantKeys.detail(restaurantId), 'item', itemId] as const,
}

// ============ Restaurant Queries ============

// Get all restaurants with pagination
export function useRestaurants(params: RestaurantsQueryParams = {}) {
  return useQuery({
    queryKey: restaurantKeys.list(params),
    queryFn: () => restaurantsApi.getAll(params),
  })
}

// Get a single restaurant by ID
export function useRestaurant(id: number) {
  return useQuery({
    queryKey: restaurantKeys.detail(id),
    queryFn: () => restaurantsApi.getById(id),
    enabled: !!id,
  })
}

// Get active restaurants
export function useActiveRestaurants(params: RestaurantsQueryParams = {}) {
  return useQuery({
    queryKey: restaurantKeys.active(params),
    queryFn: () => restaurantsApi.getActive(params),
  })
}

// Get featured restaurants
export function useFeaturedRestaurants(params: RestaurantsQueryParams = {}) {
  return useQuery({
    queryKey: restaurantKeys.featured(params),
    queryFn: () => restaurantsApi.getFeatured(params),
  })
}

// Search restaurants
export function useSearchRestaurants(params: SearchParams, enabled = true) {
  return useQuery({
    queryKey: restaurantKeys.search(params),
    queryFn: () => restaurantsApi.search(params),
    enabled: enabled && !!params.q,
  })
}

// Get nearby restaurants
export function useNearbyRestaurants(params: NearbyParams, enabled = true) {
  return useQuery({
    queryKey: restaurantKeys.nearby(params),
    queryFn: () => restaurantsApi.getNearby(params),
    enabled: enabled && !!params.lat && !!params.lng,
  })
}

// Get my restaurants (for restaurant owner)
export function useMyRestaurants() {
  return useQuery({
    queryKey: restaurantKeys.my(),
    queryFn: () => restaurantsApi.getMyRestaurants(),
  })
}

// Get restaurant orders
export function useRestaurantOrders(id: number, params: { page?: number; size?: number } = {}) {
  return useQuery({
    queryKey: [...restaurantKeys.orders(id), params],
    queryFn: () => restaurantsApi.getOrders(id, params),
    enabled: !!id,
  })
}

// ============ Restaurant Mutations ============

// Create restaurant
export function useCreateRestaurant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateRestaurantRequest) => restaurantsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: restaurantKeys.all })
    },
  })
}

// Update restaurant
export function useUpdateRestaurant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateRestaurantRequest }) =>
      restaurantsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: restaurantKeys.all })
      queryClient.invalidateQueries({ queryKey: restaurantKeys.detail(id) })
    },
  })
}

// Update restaurant status (Admin)
export function useUpdateRestaurantStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: RestaurantStatus }) =>
      restaurantsApi.updateStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: restaurantKeys.all })
      queryClient.invalidateQueries({ queryKey: restaurantKeys.detail(id) })
    },
  })
}

// Toggle restaurant open/closed
export function useToggleRestaurantOpen() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isOpen }: { id: number; isOpen: boolean }) =>
      restaurantsApi.toggleOpen(id, isOpen),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: restaurantKeys.all })
      queryClient.invalidateQueries({ queryKey: restaurantKeys.detail(id) })
    },
  })
}

// ============ Menu Queries ============

// Get full menu with categories and items
export function useRestaurantMenu(restaurantId: number) {
  return useQuery({
    queryKey: restaurantKeys.menu(restaurantId),
    queryFn: () => restaurantsApi.getFullMenu(restaurantId),
    enabled: !!restaurantId,
  })
}

// Get menu categories
export function useMenuCategories(restaurantId: number) {
  return useQuery({
    queryKey: restaurantKeys.categories(restaurantId),
    queryFn: () => restaurantsApi.getCategories(restaurantId),
    enabled: !!restaurantId,
  })
}

// Get menu items with pagination
export function useMenuItems(restaurantId: number, params: RestaurantsQueryParams = {}) {
  return useQuery({
    queryKey: restaurantKeys.menuItems(restaurantId, params),
    queryFn: () => restaurantsApi.getMenuItems(restaurantId, params),
    enabled: !!restaurantId,
  })
}

// Get single menu item
export function useMenuItem(restaurantId: number, itemId: number) {
  return useQuery({
    queryKey: restaurantKeys.menuItem(restaurantId, itemId),
    queryFn: () => restaurantsApi.getMenuItem(restaurantId, itemId),
    enabled: !!restaurantId && !!itemId,
  })
}

// ============ Menu Category Mutations ============

// Create menu category
export function useCreateMenuCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ restaurantId, data }: { restaurantId: number; data: CreateMenuCategoryRequest }) =>
      restaurantsApi.createCategory(restaurantId, data),
    onSuccess: (_, { restaurantId }) => {
      queryClient.invalidateQueries({ queryKey: restaurantKeys.menu(restaurantId) })
      queryClient.invalidateQueries({ queryKey: restaurantKeys.categories(restaurantId) })
    },
  })
}

// Update menu category
export function useUpdateMenuCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      restaurantId,
      categoryId,
      data,
    }: {
      restaurantId: number
      categoryId: number
      data: CreateMenuCategoryRequest
    }) => restaurantsApi.updateCategory(restaurantId, categoryId, data),
    onSuccess: (_, { restaurantId }) => {
      queryClient.invalidateQueries({ queryKey: restaurantKeys.menu(restaurantId) })
      queryClient.invalidateQueries({ queryKey: restaurantKeys.categories(restaurantId) })
    },
  })
}

// Delete menu category
export function useDeleteMenuCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ restaurantId, categoryId }: { restaurantId: number; categoryId: number }) =>
      restaurantsApi.deleteCategory(restaurantId, categoryId),
    onSuccess: (_, { restaurantId }) => {
      queryClient.invalidateQueries({ queryKey: restaurantKeys.menu(restaurantId) })
      queryClient.invalidateQueries({ queryKey: restaurantKeys.categories(restaurantId) })
    },
  })
}

// ============ Menu Item Mutations ============

// Create menu item
export function useCreateMenuItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ restaurantId, data }: { restaurantId: number; data: CreateMenuItemRequest }) =>
      restaurantsApi.createMenuItem(restaurantId, data),
    onSuccess: (_, { restaurantId }) => {
      queryClient.invalidateQueries({ queryKey: restaurantKeys.menu(restaurantId) })
      queryClient.invalidateQueries({ queryKey: restaurantKeys.menuItems(restaurantId) })
    },
  })
}

// Update menu item
export function useUpdateMenuItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      restaurantId,
      itemId,
      data,
    }: {
      restaurantId: number
      itemId: number
      data: CreateMenuItemRequest
    }) => restaurantsApi.updateMenuItem(restaurantId, itemId, data),
    onSuccess: (_, { restaurantId, itemId }) => {
      queryClient.invalidateQueries({ queryKey: restaurantKeys.menu(restaurantId) })
      queryClient.invalidateQueries({ queryKey: restaurantKeys.menuItems(restaurantId) })
      queryClient.invalidateQueries({ queryKey: restaurantKeys.menuItem(restaurantId, itemId) })
    },
  })
}

// Update menu item stock
export function useUpdateMenuItemStock() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      restaurantId,
      itemId,
      inStock,
    }: {
      restaurantId: number
      itemId: number
      inStock: boolean
    }) => restaurantsApi.updateMenuItemStock(restaurantId, itemId, inStock),
    onSuccess: (_, { restaurantId, itemId }) => {
      queryClient.invalidateQueries({ queryKey: restaurantKeys.menu(restaurantId) })
      queryClient.invalidateQueries({ queryKey: restaurantKeys.menuItems(restaurantId) })
      queryClient.invalidateQueries({ queryKey: restaurantKeys.menuItem(restaurantId, itemId) })
    },
  })
}

// Delete menu item
export function useDeleteMenuItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ restaurantId, itemId }: { restaurantId: number; itemId: number }) =>
      restaurantsApi.deleteMenuItem(restaurantId, itemId),
    onSuccess: (_, { restaurantId }) => {
      queryClient.invalidateQueries({ queryKey: restaurantKeys.menu(restaurantId) })
      queryClient.invalidateQueries({ queryKey: restaurantKeys.menuItems(restaurantId) })
    },
  })
}

// Upload menu item image
export function useUploadMenuItemImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      restaurantId,
      itemId,
      file,
    }: {
      restaurantId: number
      itemId: number
      file: File
    }) => restaurantsApi.uploadMenuItemImage(restaurantId, itemId, file),
    onSuccess: (_, { restaurantId, itemId }) => {
      queryClient.invalidateQueries({ queryKey: restaurantKeys.menu(restaurantId) })
      queryClient.invalidateQueries({ queryKey: restaurantKeys.menuItem(restaurantId, itemId) })
    },
  })
}

// Delete menu item image
export function useDeleteMenuItemImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ restaurantId, itemId }: { restaurantId: number; itemId: number }) =>
      restaurantsApi.deleteMenuItemImage(restaurantId, itemId),
    onSuccess: (_, { restaurantId, itemId }) => {
      queryClient.invalidateQueries({ queryKey: restaurantKeys.menu(restaurantId) })
      queryClient.invalidateQueries({ queryKey: restaurantKeys.menuItem(restaurantId, itemId) })
    },
  })
}
