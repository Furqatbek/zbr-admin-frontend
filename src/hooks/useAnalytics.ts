import { useQuery } from '@tanstack/react-query'
import { analyticsApi, type AnalyticsQueryParams } from '@/api/analytics.api'

export const analyticsKeys = {
  all: ['analytics'] as const,
  revenue: (params: AnalyticsQueryParams) => [...analyticsKeys.all, 'revenue', params] as const,
  orders: (params: AnalyticsQueryParams) => [...analyticsKeys.all, 'orders', params] as const,
  operations: (params: AnalyticsQueryParams) => [...analyticsKeys.all, 'operations', params] as const,
  financial: (params: AnalyticsQueryParams) => [...analyticsKeys.all, 'financial', params] as const,
  cx: (params: AnalyticsQueryParams) => [...analyticsKeys.all, 'cx', params] as const,
  fraud: (params: AnalyticsQueryParams) => [...analyticsKeys.all, 'fraud', params] as const,
  technical: (params: AnalyticsQueryParams) => [...analyticsKeys.all, 'technical', params] as const,
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
