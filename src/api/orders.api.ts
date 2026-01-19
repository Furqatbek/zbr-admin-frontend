import api from './axios'
import type {
  ApiResponse,
  PaginatedResponse,
  Order,
  OrderStatus,
  Payment,
  CreateOrderRequest,
  CreatePaymentRequest,
  CancelOrderRequest,
} from '@/types'

export interface OrdersQueryParams {
  page?: number
  size?: number
  sort?: string
  status?: OrderStatus
  restaurantId?: number
  consumerId?: number
  courierId?: number
  dateFrom?: string
  dateTo?: string
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus
  estimatedPrepTimeMinutes?: number
  notes?: string
  reason?: string
}

export type ProblemType = 'STUCK' | 'DELAYED' | 'NO_COURIER' | 'COMPLAINT'

export interface ProblematicOrder {
  id: number
  problem: ProblemType
  problemLabel: string
  status: string
  statusLabel: string
  stuckMinutes: number
  customer: { name: string; phone: string }
  restaurant: { id: number; name: string }
  courier: { id: number; name: string; phone: string } | null
  total: number
  createdAt: string
  complaint?: string
}

export interface ProblematicOrdersQueryParams {
  problemType?: ProblemType
}

export interface ResolveOrderProblemRequest {
  resolution: string
}

export const ordersApi = {
  // ============ Create Order ============

  /**
   * Create a new order
   * Roles: CONSUMER, PLATFORM, ADMIN
   */
  createOrder: async (data: CreateOrderRequest): Promise<ApiResponse<Order>> => {
    const response = await api.post<ApiResponse<Order>>('/orders', data)
    return response.data
  },

  // ============ Retrieve Orders ============

  /**
   * Get all orders with pagination and filters
   */
  getOrders: async (params: OrdersQueryParams = {}): Promise<ApiResponse<PaginatedResponse<Order>>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Order>>>('/orders', { params })
    return response.data
  },

  /**
   * Get order by ID
   */
  getOrderById: async (id: number): Promise<ApiResponse<Order>> => {
    const response = await api.get<ApiResponse<Order>>(`/orders/${id}`)
    return response.data
  },

  /**
   * Get order by external order number (e.g., ORD-2024-001)
   */
  getOrderByNumber: async (orderNo: string): Promise<ApiResponse<Order>> => {
    const response = await api.get<ApiResponse<Order>>(`/orders/number/${orderNo}`)
    return response.data
  },

  /**
   * Get orders for the currently authenticated user
   * Roles: Any authenticated user
   */
  getMyOrders: async (params: { page?: number; size?: number; sort?: string } = {}): Promise<ApiResponse<PaginatedResponse<Order>>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Order>>>('/orders/my', { params })
    return response.data
  },

  /**
   * Get all orders for a specific restaurant
   * Roles: RESTAURANT_OWNER, RESTAURANT_STAFF, PLATFORM, ADMIN
   */
  getRestaurantOrders: async (
    restaurantId: number,
    params: { page?: number; size?: number } = {}
  ): Promise<ApiResponse<PaginatedResponse<Order>>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Order>>>(
      `/orders/restaurant/${restaurantId}`,
      { params }
    )
    return response.data
  },

  /**
   * Get active (non-terminal) orders for a restaurant
   * Returns orders that are not in COMPLETED, CANCELLED, or REFUNDED state
   * Roles: RESTAURANT_OWNER, RESTAURANT_STAFF, PLATFORM, ADMIN
   */
  getActiveRestaurantOrders: async (restaurantId: number): Promise<ApiResponse<Order[]>> => {
    const response = await api.get<ApiResponse<Order[]>>(`/orders/restaurant/${restaurantId}/active`)
    return response.data
  },

  // ============ Order Status Management ============

  /**
   * Update order status with optional timing information
   * Roles: RESTAURANT_OWNER, RESTAURANT_STAFF, COURIER, PLATFORM, ADMIN
   */
  updateOrderStatus: async (id: number, data: UpdateOrderStatusRequest): Promise<ApiResponse<Order>> => {
    const response = await api.patch<ApiResponse<Order>>(`/orders/${id}/status`, data)
    return response.data
  },

  /**
   * Cancel an existing order
   * Orders can only be cancelled in CREATED, ACCEPTED, PREPARING, or READY states
   * Roles: Any authenticated user (order owner)
   */
  cancelOrder: async (id: number, data: CancelOrderRequest): Promise<ApiResponse<Order>> => {
    const response = await api.post<ApiResponse<Order>>(`/orders/${id}/cancel`, data)
    return response.data
  },

  // ============ Payment Operations ============

  /**
   * Create a payment intent for an order
   * Roles: Any authenticated
   */
  createPayment: async (orderId: number, data: CreatePaymentRequest): Promise<ApiResponse<Payment>> => {
    const response = await api.post<ApiResponse<Payment>>(`/orders/${orderId}/payment`, data)
    return response.data
  },

  /**
   * Get payment details for an order
   * Roles: Any authenticated
   */
  getPayment: async (orderId: number): Promise<ApiResponse<Payment>> => {
    const response = await api.get<ApiResponse<Payment>>(`/orders/${orderId}/payment`)
    return response.data
  },

  // ============ Problematic Orders ============

  /**
   * Get problematic orders requiring operator attention
   * Roles: PLATFORM, ADMIN
   */
  getProblematicOrders: async (
    params: ProblematicOrdersQueryParams = {}
  ): Promise<ApiResponse<ProblematicOrder[]>> => {
    const response = await api.get<ApiResponse<ProblematicOrder[]>>('/orders/problematic', {
      params,
    })
    return response.data
  },

  /**
   * Resolve a problematic order
   * Roles: PLATFORM, ADMIN
   */
  resolveOrderProblem: async (
    orderId: number,
    data: ResolveOrderProblemRequest
  ): Promise<ApiResponse<ProblematicOrder>> => {
    const response = await api.post<ApiResponse<ProblematicOrder>>(
      `/orders/${orderId}/resolve`,
      data
    )
    return response.data
  },
}
