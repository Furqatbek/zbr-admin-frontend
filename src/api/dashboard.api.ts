import api from './axios'
import type {
  ApiResponse,
  DashboardOverview,
  ActiveOrdersResponse,
  StuckOrdersResponse,
  CancelledOrdersResponse,
  RejectedOrdersResponse,
  RestaurantMetricsResponse,
  CourierMetricsResponse,
  FinanceMetricsResponse,
  SupportMetricsResponse,
} from '@/types'

// Query params interfaces
export interface DateRangeParams {
  startDate?: string
  endDate?: string
}

export interface ActiveOrdersFilterRequest {
  startDate?: string
  endDate?: string
  restaurantIds?: number[]
  courierIds?: number[]
  orderStatuses?: string[]
  page?: number
  pageSize?: number
  sortBy?: string
  sortDirection?: 'ASC' | 'DESC'
}

export interface StuckOrdersFilterRequest {
  startDate?: string
  endDate?: string
  stuckThresholdPending?: number
  stuckThresholdAccepted?: number
  stuckThresholdPreparing?: number
  stuckThresholdReady?: number
  stuckThresholdInTransit?: number
  page?: number
  pageSize?: number
}

export interface CancelledOrdersFilterRequest {
  startDate?: string
  endDate?: string
  restaurantIds?: number[]
  page?: number
  pageSize?: number
}

export interface RejectedOrdersFilterRequest {
  startDate?: string
  endDate?: string
  restaurantIds?: number[]
  page?: number
  pageSize?: number
}

export interface RestaurantMetricsFilterRequest {
  startDate?: string
  endDate?: string
  status?: string
  cuisineType?: string
  city?: string
  page?: number
  pageSize?: number
}

export interface CourierMetricsFilterRequest {
  startDate?: string
  endDate?: string
  status?: string
  vehicleType?: string
  page?: number
  pageSize?: number
}

export interface FinanceMetricsFilterRequest {
  startDate?: string
  endDate?: string
}

export interface SupportMetricsFilterRequest {
  startDate?: string
  endDate?: string
  status?: string
  priority?: string
  category?: string
  page?: number
  pageSize?: number
}

export const dashboardApi = {
  // ============ Overview ============

  // Get dashboard overview
  getOverview: async (params?: DateRangeParams): Promise<ApiResponse<DashboardOverview>> => {
    const response = await api.get<ApiResponse<DashboardOverview>>('/admin/dashboard/overview', {
      params,
    })
    return response.data
  },

  // ============ Orders ============

  // Get active orders
  getActiveOrders: async (params?: { date?: string; page?: number; pageSize?: number }): Promise<ApiResponse<ActiveOrdersResponse>> => {
    const response = await api.get<ApiResponse<ActiveOrdersResponse>>('/admin/dashboard/orders/active', {
      params,
    })
    return response.data
  },

  // Get active orders with advanced filtering
  getActiveOrdersFiltered: async (data: ActiveOrdersFilterRequest): Promise<ApiResponse<ActiveOrdersResponse>> => {
    const response = await api.post<ApiResponse<ActiveOrdersResponse>>('/admin/dashboard/orders/active', data)
    return response.data
  },

  // Get stuck orders
  getStuckOrders: async (): Promise<ApiResponse<StuckOrdersResponse>> => {
    const response = await api.get<ApiResponse<StuckOrdersResponse>>('/admin/dashboard/orders/stuck')
    return response.data
  },

  // Get stuck orders with custom thresholds
  getStuckOrdersFiltered: async (data: StuckOrdersFilterRequest): Promise<ApiResponse<StuckOrdersResponse>> => {
    const response = await api.post<ApiResponse<StuckOrdersResponse>>('/admin/dashboard/orders/stuck', data)
    return response.data
  },

  // Get cancelled orders
  getCancelledOrders: async (data?: CancelledOrdersFilterRequest): Promise<ApiResponse<CancelledOrdersResponse>> => {
    const response = await api.post<ApiResponse<CancelledOrdersResponse>>('/admin/dashboard/orders/cancelled', data || {})
    return response.data
  },

  // Get rejected orders
  getRejectedOrders: async (data?: RejectedOrdersFilterRequest): Promise<ApiResponse<RejectedOrdersResponse>> => {
    const response = await api.post<ApiResponse<RejectedOrdersResponse>>('/admin/dashboard/orders/rejected', data || {})
    return response.data
  },

  // ============ Restaurant Metrics ============

  // Get restaurant metrics
  getRestaurantMetrics: async (): Promise<ApiResponse<RestaurantMetricsResponse>> => {
    const response = await api.get<ApiResponse<RestaurantMetricsResponse>>('/admin/dashboard/restaurants')
    return response.data
  },

  // Get restaurant metrics with filtering
  getRestaurantMetricsFiltered: async (data: RestaurantMetricsFilterRequest): Promise<ApiResponse<RestaurantMetricsResponse>> => {
    const response = await api.post<ApiResponse<RestaurantMetricsResponse>>('/admin/dashboard/restaurants', data)
    return response.data
  },

  // ============ Courier Metrics ============

  // Get courier metrics
  getCourierMetrics: async (): Promise<ApiResponse<CourierMetricsResponse>> => {
    const response = await api.get<ApiResponse<CourierMetricsResponse>>('/admin/dashboard/couriers')
    return response.data
  },

  // Get courier metrics with filtering
  getCourierMetricsFiltered: async (data: CourierMetricsFilterRequest): Promise<ApiResponse<CourierMetricsResponse>> => {
    const response = await api.post<ApiResponse<CourierMetricsResponse>>('/admin/dashboard/couriers', data)
    return response.data
  },

  // ============ Finance Metrics ============

  // Get finance metrics
  getFinanceMetrics: async (): Promise<ApiResponse<FinanceMetricsResponse>> => {
    const response = await api.get<ApiResponse<FinanceMetricsResponse>>('/admin/dashboard/finance')
    return response.data
  },

  // Get finance metrics with date range
  getFinanceMetricsFiltered: async (data: FinanceMetricsFilterRequest): Promise<ApiResponse<FinanceMetricsResponse>> => {
    const response = await api.post<ApiResponse<FinanceMetricsResponse>>('/admin/dashboard/finance', data)
    return response.data
  },

  // ============ Support Metrics ============

  // Get support metrics
  getSupportMetrics: async (): Promise<ApiResponse<SupportMetricsResponse>> => {
    const response = await api.get<ApiResponse<SupportMetricsResponse>>('/admin/dashboard/support')
    return response.data
  },

  // Get support metrics with filtering
  getSupportMetricsFiltered: async (data: SupportMetricsFilterRequest): Promise<ApiResponse<SupportMetricsResponse>> => {
    const response = await api.post<ApiResponse<SupportMetricsResponse>>('/admin/dashboard/support', data)
    return response.data
  },

  // ============ Cache Management ============

  // Refresh all caches
  refreshAllCaches: async (): Promise<ApiResponse<{ status: string; message: string }>> => {
    const response = await api.post<ApiResponse<{ status: string; message: string }>>('/admin/dashboard/cache/refresh')
    return response.data
  },

  // Refresh specific cache
  refreshCache: async (cacheKey: string): Promise<ApiResponse<{ status: string; message: string }>> => {
    const response = await api.post<ApiResponse<{ status: string; message: string }>>(`/admin/dashboard/cache/refresh/${cacheKey}`)
    return response.data
  },
}
