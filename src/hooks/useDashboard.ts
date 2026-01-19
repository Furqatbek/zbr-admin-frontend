import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  dashboardApi,
  type DateRangeParams,
  type ActiveOrdersFilterRequest,
  type StuckOrdersFilterRequest,
  type CancelledOrdersFilterRequest,
  type RejectedOrdersFilterRequest,
  type RestaurantMetricsFilterRequest,
  type CourierMetricsFilterRequest,
  type FinanceMetricsFilterRequest,
  type SupportMetricsFilterRequest,
} from '@/api/dashboard.api'

export const dashboardKeys = {
  all: ['dashboard'] as const,
  overview: (params?: DateRangeParams) => [...dashboardKeys.all, 'overview', params] as const,
  activeOrders: (params?: { date?: string; page?: number; pageSize?: number }) =>
    [...dashboardKeys.all, 'activeOrders', params] as const,
  activeOrdersFiltered: (params: ActiveOrdersFilterRequest) =>
    [...dashboardKeys.all, 'activeOrdersFiltered', params] as const,
  stuckOrders: () => [...dashboardKeys.all, 'stuckOrders'] as const,
  stuckOrdersFiltered: (params: StuckOrdersFilterRequest) =>
    [...dashboardKeys.all, 'stuckOrdersFiltered', params] as const,
  cancelledOrders: (params?: CancelledOrdersFilterRequest) =>
    [...dashboardKeys.all, 'cancelledOrders', params] as const,
  rejectedOrders: (params?: RejectedOrdersFilterRequest) =>
    [...dashboardKeys.all, 'rejectedOrders', params] as const,
  restaurantMetrics: () => [...dashboardKeys.all, 'restaurantMetrics'] as const,
  restaurantMetricsFiltered: (params: RestaurantMetricsFilterRequest) =>
    [...dashboardKeys.all, 'restaurantMetricsFiltered', params] as const,
  courierMetrics: () => [...dashboardKeys.all, 'courierMetrics'] as const,
  courierMetricsFiltered: (params: CourierMetricsFilterRequest) =>
    [...dashboardKeys.all, 'courierMetricsFiltered', params] as const,
  financeMetrics: () => [...dashboardKeys.all, 'financeMetrics'] as const,
  financeMetricsFiltered: (params: FinanceMetricsFilterRequest) =>
    [...dashboardKeys.all, 'financeMetricsFiltered', params] as const,
  supportMetrics: () => [...dashboardKeys.all, 'supportMetrics'] as const,
  supportMetricsFiltered: (params: SupportMetricsFilterRequest) =>
    [...dashboardKeys.all, 'supportMetricsFiltered', params] as const,
}

// ============ Overview ============

export function useDashboardOverview(params?: DateRangeParams) {
  return useQuery({
    queryKey: dashboardKeys.overview(params),
    queryFn: () => dashboardApi.getOverview(params),
    refetchInterval: 30000, // Refresh every 30 seconds
  })
}

// ============ Orders ============

export function useActiveOrders(params?: { date?: string; page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: dashboardKeys.activeOrders(params),
    queryFn: () => dashboardApi.getActiveOrders(params),
    refetchInterval: 15000, // Refresh every 15 seconds for active orders
  })
}

export function useActiveOrdersFiltered(params: ActiveOrdersFilterRequest, enabled = true) {
  return useQuery({
    queryKey: dashboardKeys.activeOrdersFiltered(params),
    queryFn: () => dashboardApi.getActiveOrdersFiltered(params),
    enabled,
    refetchInterval: 15000,
  })
}

export function useDashboardStuckOrders() {
  return useQuery({
    queryKey: dashboardKeys.stuckOrders(),
    queryFn: () => dashboardApi.getStuckOrders(),
    refetchInterval: 30000,
  })
}

export function useStuckOrdersFiltered(params: StuckOrdersFilterRequest, enabled = true) {
  return useQuery({
    queryKey: dashboardKeys.stuckOrdersFiltered(params),
    queryFn: () => dashboardApi.getStuckOrdersFiltered(params),
    enabled,
    refetchInterval: 30000,
  })
}

export function useCancelledOrders(params?: CancelledOrdersFilterRequest) {
  return useQuery({
    queryKey: dashboardKeys.cancelledOrders(params),
    queryFn: () => dashboardApi.getCancelledOrders(params),
  })
}

export function useRejectedOrders(params?: RejectedOrdersFilterRequest) {
  return useQuery({
    queryKey: dashboardKeys.rejectedOrders(params),
    queryFn: () => dashboardApi.getRejectedOrders(params),
  })
}

// ============ Restaurant Metrics ============

export function useRestaurantMetrics() {
  return useQuery({
    queryKey: dashboardKeys.restaurantMetrics(),
    queryFn: () => dashboardApi.getRestaurantMetrics(),
    refetchInterval: 60000, // Refresh every minute
  })
}

export function useRestaurantMetricsFiltered(params: RestaurantMetricsFilterRequest, enabled = true) {
  return useQuery({
    queryKey: dashboardKeys.restaurantMetricsFiltered(params),
    queryFn: () => dashboardApi.getRestaurantMetricsFiltered(params),
    enabled,
  })
}

// ============ Courier Metrics ============

export function useCourierMetrics() {
  return useQuery({
    queryKey: dashboardKeys.courierMetrics(),
    queryFn: () => dashboardApi.getCourierMetrics(),
    refetchInterval: 60000,
  })
}

export function useCourierMetricsFiltered(params: CourierMetricsFilterRequest, enabled = true) {
  return useQuery({
    queryKey: dashboardKeys.courierMetricsFiltered(params),
    queryFn: () => dashboardApi.getCourierMetricsFiltered(params),
    enabled,
  })
}

// ============ Finance Metrics ============

export function useFinanceMetrics() {
  return useQuery({
    queryKey: dashboardKeys.financeMetrics(),
    queryFn: () => dashboardApi.getFinanceMetrics(),
    refetchInterval: 60000,
  })
}

export function useFinanceMetricsFiltered(params: FinanceMetricsFilterRequest, enabled = true) {
  return useQuery({
    queryKey: dashboardKeys.financeMetricsFiltered(params),
    queryFn: () => dashboardApi.getFinanceMetricsFiltered(params),
    enabled,
  })
}

// ============ Support Metrics ============

export function useSupportMetrics() {
  return useQuery({
    queryKey: dashboardKeys.supportMetrics(),
    queryFn: () => dashboardApi.getSupportMetrics(),
    refetchInterval: 60000,
  })
}

export function useSupportMetricsFiltered(params: SupportMetricsFilterRequest, enabled = true) {
  return useQuery({
    queryKey: dashboardKeys.supportMetricsFiltered(params),
    queryFn: () => dashboardApi.getSupportMetricsFiltered(params),
    enabled,
  })
}

// ============ Cache Management ============

export function useRefreshAllCaches() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => dashboardApi.refreshAllCaches(),
    onSuccess: () => {
      // Invalidate all dashboard queries
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
    },
  })
}

export function useRefreshCache() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (cacheKey: string) => dashboardApi.refreshCache(cacheKey),
    onSuccess: () => {
      // Invalidate all dashboard queries when any cache is refreshed
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
    },
  })
}
