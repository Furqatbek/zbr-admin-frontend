import api from './axios'
import type {
  ApiResponse,
  Restaurant,
  RestaurantCategory,
  CreateRestaurantCategoryRequest,
  UpdateRestaurantCategoryRequest,
} from '@/types'

const ADMIN_BASE = '/admin/restaurant-categories'

export const restaurantCategoriesApi = {
  /**
   * Admin list — includes categories that are empty or deactivated. The public
   * endpoint hides both, so this is the one to manage from.
   */
  listAll: async (): Promise<ApiResponse<RestaurantCategory[]>> => {
    const response = await api.get<ApiResponse<RestaurantCategory[]>>(ADMIN_BASE)
    return response.data
  },

  /**
   * Public list — only categories with at least one OPEN restaurant, so a chip
   * can never filter to an empty screen. Returns [] until restaurants are
   * assigned, and a cuisine drops out when its only venue closes for the night.
   */
  listPublic: async (): Promise<ApiResponse<RestaurantCategory[]>> => {
    const response = await api.get<ApiResponse<RestaurantCategory[]>>('/restaurants/categories')
    return response.data
  },

  /**
   * Create. Only `nameUz` is required; slug is derived from nameEn falling back
   * to nameUz. The body is strict — a misspelled field is a 400 naming it — so
   * fields are sent explicitly rather than spread from form state.
   */
  create: async (data: CreateRestaurantCategoryRequest): Promise<ApiResponse<RestaurantCategory>> => {
    const response = await api.post<ApiResponse<RestaurantCategory>>(ADMIN_BASE, data)
    return response.data
  },

  /** Partial update. There is no DELETE — retire with `{ active: false }`. */
  update: async (
    id: number,
    data: UpdateRestaurantCategoryRequest
  ): Promise<ApiResponse<RestaurantCategory>> => {
    const response = await api.patch<ApiResponse<RestaurantCategory>>(`${ADMIN_BASE}/${id}`, data)
    return response.data
  },

  /**
   * File a restaurant under a category (at most one). `categoryId` is a QUERY
   * parameter, not a body — and omitting it entirely unfiles the restaurant,
   * which is how a wrong assignment is cleared without inventing a category.
   */
  assign: async (restaurantId: number, categoryId?: number): Promise<ApiResponse<Restaurant>> => {
    const response = await api.put<ApiResponse<Restaurant>>(
      `${ADMIN_BASE}/assignments/${restaurantId}`,
      null,
      categoryId != null ? { params: { categoryId } } : undefined
    )
    return response.data
  },
}
