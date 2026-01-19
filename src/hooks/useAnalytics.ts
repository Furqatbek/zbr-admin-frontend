import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { analyticsApi, type AnalyticsQueryParams } from '@/api/analytics.api'

export const analyticsKeys = {
  all: ['analytics'] as const,
  // Legacy keys
  revenue: (params: AnalyticsQueryParams) => [...analyticsKeys.all, 'revenue', params] as const,
  orders: (params: AnalyticsQueryParams) => [...analyticsKeys.all, 'orders', params] as const,
  operations: (params: AnalyticsQueryParams) => [...analyticsKeys.all, 'operations', params] as const,
  financial: (params: AnalyticsQueryParams) => [...analyticsKeys.all, 'financial', params] as const,
  cx: (params: AnalyticsQueryParams) => [...analyticsKeys.all, 'cx', params] as const,
  fraud: (params: AnalyticsQueryParams) => [...analyticsKeys.all, 'fraud', params] as const,
  technical: (params: AnalyticsQueryParams) => [...analyticsKeys.all, 'technical', params] as const,
  // New Analytics Module keys
  activity: () => [...analyticsKeys.all, 'activity'] as const,
  orderVolume: () => [...analyticsKeys.all, 'orderVolume'] as const,
  conversion: (days: number) => [...analyticsKeys.all, 'conversion', days] as const,
  aov: () => [...analyticsKeys.all, 'aov'] as const,
  activation: () => [...analyticsKeys.all, 'activation'] as const,
  churn: () => [...analyticsKeys.all, 'churn'] as const,
  summary: () => [...analyticsKeys.all, 'summary'] as const,
}

export function useRevenueMetrics(params: AnalyticsQueryParams = {}) {
  return useQuery({
    queryKey: analyticsKeys.revenue(params),
    queryFn: () => analyticsApi.getRevenueMetrics(params),
  })
}

export function useOrdersMetrics(params: AnalyticsQueryParams = {}) {
  return useQuery({
    queryKey: analyticsKeys.orders(params),
    queryFn: () => analyticsApi.getOrdersMetrics(params),
  })
}

export function useOperationsMetrics(params: AnalyticsQueryParams = {}) {
  return useQuery({
    queryKey: analyticsKeys.operations(params),
    queryFn: () => analyticsApi.getOperationsMetrics(params),
  })
}

export function useFinancialMetrics(params: AnalyticsQueryParams = {}) {
  return useQuery({
    queryKey: analyticsKeys.financial(params),
    queryFn: () => analyticsApi.getFinancialMetrics(params),
  })
}

export function useCustomerExperienceMetrics(params: AnalyticsQueryParams = {}) {
  return useQuery({
    queryKey: analyticsKeys.cx(params),
    queryFn: () => analyticsApi.getCustomerExperienceMetrics(params),
  })
}

export function useFraudMetrics(params: AnalyticsQueryParams = {}) {
  return useQuery({
    queryKey: analyticsKeys.fraud(params),
    queryFn: () => analyticsApi.getFraudMetrics(params),
  })
}

export function useTechnicalMetrics(params: AnalyticsQueryParams = {}) {
  return useQuery({
    queryKey: analyticsKeys.technical(params),
    queryFn: () => analyticsApi.getTechnicalMetrics(params),
  })
}

// ============ New Analytics Module Hooks ============

/**
 * Hook for fetching user activity metrics (DAU/WAU/MAU)
 * Data is cached for 5 minutes on backend
 */
export function useActivityMetrics() {
  return useQuery({
    queryKey: analyticsKeys.activity(),
    queryFn: () => analyticsApi.getActivityMetrics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook for fetching order volume metrics
 * Data is cached for 1 minute on backend
 */
export function useOrderVolumeMetrics() {
  return useQuery({
    queryKey: analyticsKeys.orderVolume(),
    queryFn: () => analyticsApi.getOrderVolumeMetrics(),
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

/**
 * Hook for fetching conversion funnel metrics
 * @param days Number of days for the analysis period (default: 7)
 * Data is cached for 30 seconds on backend
 */
export function useConversionMetrics(days: number = 7) {
  return useQuery({
    queryKey: analyticsKeys.conversion(days),
    queryFn: () => analyticsApi.getConversionMetrics(days),
    staleTime: 30 * 1000, // 30 seconds
  })
}

/**
 * Hook for fetching Average Order Value metrics
 * Data is cached for 1 minute on backend
 */
export function useAOVMetrics() {
  return useQuery({
    queryKey: analyticsKeys.aov(),
    queryFn: () => analyticsApi.getAOVMetrics(),
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

/**
 * Hook for fetching user activation metrics
 * Data is cached for 5 minutes on backend
 */
export function useActivationMetrics() {
  return useQuery({
    queryKey: analyticsKeys.activation(),
    queryFn: () => analyticsApi.getActivationMetrics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook for fetching churn metrics
 * Data is cached for 10 minutes on backend
 */
export function useChurnMetrics() {
  return useQuery({
    queryKey: analyticsKeys.churn(),
    queryFn: () => analyticsApi.getChurnMetrics(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook for fetching analytics summary
 * Quick overview of all key metrics
 */
export function useAnalyticsSummary() {
  return useQuery({
    queryKey: analyticsKeys.summary(),
    queryFn: () => analyticsApi.getSummary(),
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

/**
 * Hook for refreshing all analytics caches
 * Requires ADMIN role
 */
export function useRefreshAnalyticsCache() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => analyticsApi.refreshCache(),
    onSuccess: () => {
      // Invalidate all analytics queries
      queryClient.invalidateQueries({ queryKey: analyticsKeys.all })
    },
  })
}

/**
 * Hook for refreshing a specific analytics cache
 * @param cacheName Cache name to refresh
 * Requires ADMIN role
 */
export function useRefreshSpecificCache() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (cacheName: string) => analyticsApi.refreshSpecificCache(cacheName),
    onSuccess: () => {
      // Invalidate all analytics queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: analyticsKeys.all })
    },
  })
}
