import api from './axios'
import type {
  ApiResponse,
  PaginatedResponse,
  Restaurant,
  RestaurantStatus,
  CreateRestaurantRequest,
  UpdateRestaurantRequest,
  MenuCategory,
  CreateMenuCategoryRequest,
  MenuItem,
  CreateMenuItemRequest,
  Order,
} from '@/types'

export interface RestaurantsQueryParams {
  page?: number
  size?: number
  sort?: string
}

export interface SearchParams {
  q: string
  page?: number
  size?: number
}

export interface NearbyParams {
  lat: number
  lng: number
  radius?: number
}

export const restaurantsApi = {
  // ============ Restaurant Management ============

  // Create a new restaurant
  create: async (data: CreateRestaurantRequest): Promise<ApiResponse<Restaurant>> => {
    const response = await api.post<ApiResponse<Restaurant>>('/restaurants', data)
    return response.data
  },

  // Get restaurant by ID
  getById: async (id: number): Promise<ApiResponse<Restaurant>> => {
    const response = await api.get<ApiResponse<Restaurant>>(`/restaurants/${id}`)
    return response.data
  },

  // Get restaurant by slug
  getBySlug: async (slug: string): Promise<ApiResponse<Restaurant>> => {
    const response = await api.get<ApiResponse<Restaurant>>(`/restaurants/slug/${slug}`)
    return response.data
  },

  // Get all restaurants with pagination
  getAll: async (params: RestaurantsQueryParams = {}): Promise<ApiResponse<PaginatedResponse<Restaurant>>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Restaurant>>>('/restaurants', {
      params: {
        page: params.page ?? 0,
        size: params.size ?? 20,
        ...(params.sort && { sort: params.sort }),
      },
    })
    return response.data
  },

  // Get active restaurants
  getActive: async (params: RestaurantsQueryParams = {}): Promise<ApiResponse<PaginatedResponse<Restaurant>>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Restaurant>>>('/restaurants/active', {
      params: {
        page: params.page ?? 0,
        size: params.size ?? 20,
      },
    })
    return response.data
  },

  // Search restaurants
  search: async (params: SearchParams): Promise<ApiResponse<PaginatedResponse<Restaurant>>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Restaurant>>>('/restaurants/search', {
      params: {
        q: params.q,
        page: params.page ?? 0,
        size: params.size ?? 20,
      },
    })
    return response.data
  },

  // Get featured restaurants
  getFeatured: async (params: RestaurantsQueryParams = {}): Promise<ApiResponse<PaginatedResponse<Restaurant>>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Restaurant>>>('/restaurants/featured', {
      params: {
        page: params.page ?? 0,
        size: params.size ?? 10,
      },
    })
    return response.data
  },

  // Get nearby restaurants
  getNearby: async (params: NearbyParams): Promise<ApiResponse<Restaurant[]>> => {
    const response = await api.get<ApiResponse<Restaurant[]>>('/restaurants/nearby', {
      params: {
        lat: params.lat,
        lng: params.lng,
        ...(params.radius && { radius: params.radius }),
      },
    })
    return response.data
  },

  // Get my restaurants (for restaurant owner)
  getMyRestaurants: async (): Promise<ApiResponse<Restaurant[]>> => {
    const response = await api.get<ApiResponse<Restaurant[]>>('/restaurants/my')
    return response.data
  },

  // Update restaurant
  update: async (id: number, data: UpdateRestaurantRequest): Promise<ApiResponse<Restaurant>> => {
    const response = await api.put<ApiResponse<Restaurant>>(`/restaurants/${id}`, data)
    return response.data
  },

  // Update restaurant status (Admin/Platform)
  updateStatus: async (id: number, status: RestaurantStatus): Promise<ApiResponse<Restaurant>> => {
    const response = await api.patch<ApiResponse<Restaurant>>(`/restaurants/${id}/status`, null, {
      params: { status },
    })
    return response.data
  },

  // Toggle restaurant open/closed status
  toggleOpen: async (id: number, isOpen: boolean): Promise<ApiResponse<Restaurant>> => {
    const response = await api.patch<ApiResponse<Restaurant>>(`/restaurants/${id}/toggle-open`, null, {
      params: { isOpen },
    })
    return response.data
  },

  // Get restaurant orders
  getOrders: async (id: number, params: { page?: number; size?: number } = {}): Promise<ApiResponse<PaginatedResponse<Order>>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Order>>>(`/restaurants/${id}/orders`, { params })
    return response.data
  },

  // ============ Menu Categories ============

  // Get full menu with categories and items
  getFullMenu: async (restaurantId: number): Promise<ApiResponse<MenuCategory[]>> => {
    const response = await api.get<ApiResponse<MenuCategory[]>>(`/restaurants/${restaurantId}/menu`)
    return response.data
  },

  // Get menu categories
  getCategories: async (restaurantId: number): Promise<ApiResponse<MenuCategory[]>> => {
    const response = await api.get<ApiResponse<MenuCategory[]>>(`/restaurants/${restaurantId}/menu/categories`)
    return response.data
  },

  // Create menu category
  createCategory: async (restaurantId: number, data: CreateMenuCategoryRequest): Promise<ApiResponse<MenuCategory>> => {
    const response = await api.post<ApiResponse<MenuCategory>>(
      `/restaurants/${restaurantId}/menu/categories`,
      data
    )
    return response.data
  },

  // Update menu category
  updateCategory: async (
    restaurantId: number,
    categoryId: number,
    data: CreateMenuCategoryRequest
  ): Promise<ApiResponse<MenuCategory>> => {
    const response = await api.put<ApiResponse<MenuCategory>>(
      `/restaurants/${restaurantId}/menu/categories/${categoryId}`,
      data
    )
    return response.data
  },

  // Delete menu category
  deleteCategory: async (restaurantId: number, categoryId: number): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(
      `/restaurants/${restaurantId}/menu/categories/${categoryId}`
    )
    return response.data
  },

  // ============ Menu Items ============

  // Get all menu items with pagination
  getMenuItems: async (
    restaurantId: number,
    params: RestaurantsQueryParams = {}
  ): Promise<ApiResponse<PaginatedResponse<MenuItem>>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<MenuItem>>>(
      `/restaurants/${restaurantId}/menu/items`,
      {
        params: {
          page: params.page ?? 0,
          size: params.size ?? 20,
        },
      }
    )
    return response.data
  },

  // Get featured menu items
  getFeaturedItems: async (restaurantId: number): Promise<ApiResponse<MenuItem[]>> => {
    const response = await api.get<ApiResponse<MenuItem[]>>(
      `/restaurants/${restaurantId}/menu/items/featured`
    )
    return response.data
  },

  // Search menu items
  searchMenuItems: async (restaurantId: number, params: SearchParams): Promise<ApiResponse<PaginatedResponse<MenuItem>>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<MenuItem>>>(
      `/restaurants/${restaurantId}/menu/items/search`,
      {
        params: {
          q: params.q,
          page: params.page ?? 0,
          size: params.size ?? 20,
        },
      }
    )
    return response.data
  },

  // Get menu item details
  getMenuItem: async (restaurantId: number, itemId: number): Promise<ApiResponse<MenuItem>> => {
    const response = await api.get<ApiResponse<MenuItem>>(
      `/restaurants/${restaurantId}/menu/items/${itemId}`
    )
    return response.data
  },

  // Create menu item
  createMenuItem: async (restaurantId: number, data: CreateMenuItemRequest): Promise<ApiResponse<MenuItem>> => {
    const response = await api.post<ApiResponse<MenuItem>>(
      `/restaurants/${restaurantId}/menu/items`,
      data
    )
    return response.data
  },

  // Update menu item
  updateMenuItem: async (
    restaurantId: number,
    itemId: number,
    data: CreateMenuItemRequest
  ): Promise<ApiResponse<MenuItem>> => {
    const response = await api.put<ApiResponse<MenuItem>>(
      `/restaurants/${restaurantId}/menu/items/${itemId}`,
      data
    )
    return response.data
  },

  // Update menu item stock
  updateMenuItemStock: async (
    restaurantId: number,
    itemId: number,
    inStock: boolean
  ): Promise<ApiResponse<MenuItem>> => {
    const response = await api.patch<ApiResponse<MenuItem>>(
      `/restaurants/${restaurantId}/menu/items/${itemId}/stock`,
      null,
      { params: { inStock } }
    )
    return response.data
  },

  // Delete menu item
  deleteMenuItem: async (restaurantId: number, itemId: number): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(
      `/restaurants/${restaurantId}/menu/items/${itemId}`
    )
    return response.data
  },

  // Upload menu item image
  uploadMenuItemImage: async (restaurantId: number, itemId: number, file: File): Promise<ApiResponse<MenuItem>> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post<ApiResponse<MenuItem>>(
      `/restaurants/${restaurantId}/menu/items/${itemId}/image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data
  },

  // Delete menu item image
  deleteMenuItemImage: async (restaurantId: number, itemId: number): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(
      `/restaurants/${restaurantId}/menu/items/${itemId}/image`
    )
    return response.data
  },
}
