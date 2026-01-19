import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi, type OrdersQueryParams, type UpdateOrderStatusRequest } from '@/api/orders.api'
import type { CreateOrderRequest, CreatePaymentRequest, CancelOrderRequest } from '@/types'

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (params: OrdersQueryParams) => [...orderKeys.lists(), params] as const,
  my: (params?: { page?: number; size?: number; sort?: string }) => [...orderKeys.all, 'my', params] as const,
  restaurant: (restaurantId: number, params?: { page?: number; size?: number }) =>
    [...orderKeys.all, 'restaurant', restaurantId, params] as const,
  restaurantActive: (restaurantId: number) => [...orderKeys.all, 'restaurant', restaurantId, 'active'] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: number) => [...orderKeys.details(), id] as const,
  byNumber: (orderNo: string) => [...orderKeys.all, 'number', orderNo] as const,
  payment: (orderId: number) => [...orderKeys.detail(orderId), 'payment'] as const,
}

// ============ Query Hooks ============

/**
 * Get all orders with pagination and filters
 */
export function useOrders(params: OrdersQueryParams = {}) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => ordersApi.getOrders(params),
  })
}

/**
 * Get order by ID
 */
export function useOrder(id: number) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => ordersApi.getOrderById(id),
    enabled: !!id,
  })
}

/**
 * Get order by external order number (e.g., ORD-2024-001)
 */
export function useOrderByNumber(orderNo: string) {
  return useQuery({
    queryKey: orderKeys.byNumber(orderNo),
    queryFn: () => ordersApi.getOrderByNumber(orderNo),
    enabled: !!orderNo,
  })
}

/**
 * Get orders for the currently authenticated user
 */
export function useMyOrders(params: { page?: number; size?: number; sort?: string } = {}) {
  return useQuery({
    queryKey: orderKeys.my(params),
    queryFn: () => ordersApi.getMyOrders(params),
  })
}

/**
 * Get all orders for a specific restaurant (via orders API)
 * Note: useRestaurantOrders from useRestaurants.ts is also available
 */
export function useOrdersByRestaurant(
  restaurantId: number,
  params: { page?: number; size?: number } = {}
) {
  return useQuery({
    queryKey: orderKeys.restaurant(restaurantId, params),
    queryFn: () => ordersApi.getRestaurantOrders(restaurantId, params),
    enabled: !!restaurantId,
  })
}

/**
 * Get active (non-terminal) orders for a restaurant
 */
export function useActiveRestaurantOrders(restaurantId: number) {
  return useQuery({
    queryKey: orderKeys.restaurantActive(restaurantId),
    queryFn: () => ordersApi.getActiveRestaurantOrders(restaurantId),
    enabled: !!restaurantId,
    refetchInterval: 30000, // Refresh every 30 seconds for active orders
  })
}

/**
 * Get payment details for an order
 */
export function useOrderPayment(orderId: number) {
  return useQuery({
    queryKey: orderKeys.payment(orderId),
    queryFn: () => ordersApi.getPayment(orderId),
    enabled: !!orderId,
  })
}

// ============ Mutation Hooks ============

/**
 * Create a new order
 */
export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateOrderRequest) => ordersApi.createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
    },
  })
}

/**
 * Update order status
 */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateOrderStatusRequest }) =>
      ordersApi.updateOrderStatus(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.id) })
    },
  })
}

/**
 * Cancel an order
 */
export function useCancelOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CancelOrderRequest }) =>
      ordersApi.cancelOrder(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.id) })
    },
  })
}

/**
 * Create payment for an order
 */
export function useCreatePayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, data }: { orderId: number; data: CreatePaymentRequest }) =>
      ordersApi.createPayment(orderId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.payment(variables.orderId) })
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.orderId) })
    },
  })
}
