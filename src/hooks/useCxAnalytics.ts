import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cxAnalyticsApi } from '@/api/cx-analytics.api'
import type { CxAnalyticsQueryParams } from '@/types'

// Query keys for CX Analytics
export const cxAnalyticsKeys = {
  all: ['cx-analytics'] as const,
  nps: (params: CxAnalyticsQueryParams) => [...cxAnalyticsKeys.all, 'nps', params] as const,
  restaurantRatings: (params: CxAnalyticsQueryParams) =>
    [...cxAnalyticsKeys.all, 'restaurant-ratings', params] as const,
  restaurantRatingById: (id: number, params: CxAnalyticsQueryParams) =>
    [...cxAnalyticsKeys.all, 'restaurant-rating', id, params] as const,
  courierRatings: (params: CxAnalyticsQueryParams) =>
    [...cxAnalyticsKeys.all, 'courier-ratings', params] as const,
  courierRatingById: (id: number, params: CxAnalyticsQueryParams) =>
    [...cxAnalyticsKeys.all, 'courier-rating', id, params] as const,
  appStoreRatings: (params: CxAnalyticsQueryParams) =>
    [...cxAnalyticsKeys.all, 'app-store-ratings', params] as const,
  supportTickets: (params: CxAnalyticsQueryParams) =>
    [...cxAnalyticsKeys.all, 'support-tickets', params] as const,
  summary: (params: { startDate: string; endDate: string }) =>
    [...cxAnalyticsKeys.all, 'summary', params] as const,
}

/**
 * Hook for fetching NPS metrics
 * Cached for 10 minutes on backend
 */
export function useNpsMetrics(params: CxAnalyticsQueryParams) {
  return useQuery({
    queryKey: cxAnalyticsKeys.nps(params),
    queryFn: () => cxAnalyticsApi.getNpsMetrics(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!params.startDate && !!params.endDate,
  })
}

/**
 * Hook for fetching restaurant rating metrics
 * Cached for 5 minutes on backend
 */
export function useRestaurantRatings(params: CxAnalyticsQueryParams) {
  return useQuery({
    queryKey: cxAnalyticsKeys.restaurantRatings(params),
    queryFn: () => cxAnalyticsApi.getRestaurantRatings(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!params.startDate && !!params.endDate,
  })
}

/**
 * Hook for fetching individual restaurant rating metrics
 * Cached for 5 minutes on backend
 */
export function useRestaurantRatingById(restaurantId: number, params: CxAnalyticsQueryParams) {
  return useQuery({
    queryKey: cxAnalyticsKeys.restaurantRatingById(restaurantId, params),
    queryFn: () => cxAnalyticsApi.getRestaurantRatingById(restaurantId, params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!restaurantId && !!params.startDate && !!params.endDate,
  })
}

/**
 * Hook for fetching courier rating metrics
 * Cached for 5 minutes on backend
 */
export function useCourierRatings(params: CxAnalyticsQueryParams) {
  return useQuery({
    queryKey: cxAnalyticsKeys.courierRatings(params),
    queryFn: () => cxAnalyticsApi.getCourierRatings(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!params.startDate && !!params.endDate,
  })
}

/**
 * Hook for fetching individual courier rating metrics
 * Cached for 5 minutes on backend
 */
export function useCourierRatingById(courierId: number, params: CxAnalyticsQueryParams) {
  return useQuery({
    queryKey: cxAnalyticsKeys.courierRatingById(courierId, params),
    queryFn: () => cxAnalyticsApi.getCourierRatingById(courierId, params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!courierId && !!params.startDate && !!params.endDate,
  })
}

/**
 * Hook for fetching app store rating metrics
 * Cached for 5 minutes on backend
 */
export function useAppStoreRatings(params: CxAnalyticsQueryParams) {
  return useQuery({
    queryKey: cxAnalyticsKeys.appStoreRatings(params),
    queryFn: () => cxAnalyticsApi.getAppStoreRatings(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!params.startDate && !!params.endDate,
  })
}

/**
 * Hook for fetching support ticket metrics
 * Cached for 1 minute on backend (real-time operational data)
 */
export function useSupportTicketMetrics(params: CxAnalyticsQueryParams) {
  return useQuery({
    queryKey: cxAnalyticsKeys.supportTickets(params),
    queryFn: () => cxAnalyticsApi.getSupportTicketMetrics(params),
    staleTime: 1 * 60 * 1000, // 1 minute
    enabled: !!params.startDate && !!params.endDate,
  })
}

/**
 * Hook for fetching CX summary
 * Cached for 5 minutes on backend
 */
export function useCxSummary(params: { startDate: string; endDate: string }) {
  return useQuery({
    queryKey: cxAnalyticsKeys.summary(params),
    queryFn: () => cxAnalyticsApi.getCxSummary(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!params.startDate && !!params.endDate,
  })
}

/**
 * Hook for invalidating NPS cache
 * Requires ADMIN role
 */
export function useInvalidateNpsCache() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => cxAnalyticsApi.invalidateNpsCache(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cxAnalyticsKeys.all })
    },
  })
}

/**
 * Hook for invalidating ratings cache
 * Requires ADMIN role
 */
export function useInvalidateRatingsCache() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => cxAnalyticsApi.invalidateRatingsCache(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cxAnalyticsKeys.all })
    },
  })
}

/**
 * Hook for invalidating support tickets cache
 * Requires ADMIN role
 */
export function useInvalidateSupportTicketsCache() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => cxAnalyticsApi.invalidateSupportTicketsCache(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cxAnalyticsKeys.all })
    },
  })
}

/**
 * Hook for invalidating all CX analytics caches
 * Requires ADMIN role
 */
export function useInvalidateAllCxCaches() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => cxAnalyticsApi.invalidateAllCaches(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cxAnalyticsKeys.all })
    },
  })
}
