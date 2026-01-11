import api from './axios'
import type { ApiResponse, PaginatedResponse, Order, OrderStatus } from '@/types'

export interface OrdersQueryParams {
  page?: number
  size?: number
  status?: OrderStatus
  restaurantId?: number
  consumerId?: number
  courierId?: number
  dateFrom?: string
  dateTo?: string
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus
  reason?: string
}

export const ordersApi = {
  getOrders: async (params: OrdersQueryParams = {}): Promise<ApiResponse<PaginatedResponse<Order>>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Order>>>('/orders', { params })
    return response.data
  },

  getOrderById: async (id: number): Promise<ApiResponse<Order>> => {
    const response = await api.get<ApiResponse<Order>>(`/orders/${id}`)
    return response.data
  },

  updateOrderStatus: async (id: number, data: UpdateOrderStatusRequest): Promise<ApiResponse<Order>> => {
    const response = await api.put<ApiResponse<Order>>(`/orders/${id}/status`, data)
    return response.data
  },
}
