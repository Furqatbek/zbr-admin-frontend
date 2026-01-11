import api from './axios'
import type { ApiResponse, PaginatedResponse, Restaurant, RestaurantStatus, Order } from '@/types'

export interface RestaurantsQueryParams {
  page?: number
  size?: number
  status?: RestaurantStatus
  isOpen?: boolean
  search?: string
}

export interface UpdateRestaurantStatusRequest {
  status: RestaurantStatus
}

export const restaurantsApi = {
  getRestaurants: async (params: RestaurantsQueryParams = {}): Promise<ApiResponse<PaginatedResponse<Restaurant>>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Restaurant>>>('/restaurants', { params })
    return response.data
  },

  getRestaurantById: async (id: number): Promise<ApiResponse<Restaurant>> => {
    const response = await api.get<ApiResponse<Restaurant>>(`/restaurants/${id}`)
    return response.data
  },

  updateRestaurantStatus: async (id: number, data: UpdateRestaurantStatusRequest): Promise<ApiResponse<Restaurant>> => {
    const response = await api.put<ApiResponse<Restaurant>>(`/restaurants/${id}/status`, data)
    return response.data
  },

  getRestaurantOrders: async (id: number, params: { page?: number; size?: number } = {}): Promise<ApiResponse<PaginatedResponse<Order>>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Order>>>(`/restaurants/${id}/orders`, { params })
    return response.data
  },
}
