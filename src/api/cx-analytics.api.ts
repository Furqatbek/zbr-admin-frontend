import { api } from './axios'
import type {
  ApiResponse,
  NpsMetrics,
  RestaurantRatingMetrics,
  CourierRatingMetrics,
  AppStoreRatingMetrics,
  SupportTicketMetricsResponse,
  CxSummary,
  CxAnalyticsQueryParams,
} from '@/types'

// API functions for CX Analytics module
// Base URL: /api/v1/analytics/cx
export const cxAnalyticsApi = {
  /**
   * Get NPS (Net Promoter Score) metrics
   * Cached for 10 minutes
   */
  getNpsMetrics: async (params: CxAnalyticsQueryParams): Promise<ApiResponse<NpsMetrics>> => {
    const response = await api.get<ApiResponse<NpsMetrics>>('/analytics/cx/nps', {
      params: {
        startDate: params.startDate,
        endDate: params.endDate,
        includeDistribution: params.includeDistribution ?? true,
        includeTrend: params.includeTrend ?? false,
        includeSegments: params.includeSegments ?? false,
      },
    })
    return response.data
  },

  /**
   * Get restaurant rating metrics
   * Cached for 5 minutes
   */
  getRestaurantRatings: async (
    params: CxAnalyticsQueryParams
  ): Promise<ApiResponse<RestaurantRatingMetrics>> => {
    const response = await api.get<ApiResponse<RestaurantRatingMetrics>>(
      '/analytics/cx/ratings/restaurant',
      {
        params: {
          startDate: params.startDate,
          endDate: params.endDate,
          includeDistribution: params.includeDistribution ?? true,
          includeTrend: params.includeTrend ?? false,
          includeTopRestaurants: params.includeTopRestaurants ?? false,
        },
      }
    )
    return response.data
  },

  /**
   * Get individual restaurant rating metrics
   * Cached for 5 minutes
   */
  getRestaurantRatingById: async (
    restaurantId: number,
    params: CxAnalyticsQueryParams
  ): Promise<ApiResponse<RestaurantRatingMetrics>> => {
    const response = await api.get<ApiResponse<RestaurantRatingMetrics>>(
      `/analytics/cx/ratings/restaurant/${restaurantId}`,
      {
        params: {
          startDate: params.startDate,
          endDate: params.endDate,
          includeDistribution: params.includeDistribution ?? true,
          includeTrend: params.includeTrend ?? false,
        },
      }
    )
    return response.data
  },

  /**
   * Get courier rating metrics
   * Cached for 5 minutes
   */
  getCourierRatings: async (
    params: CxAnalyticsQueryParams
  ): Promise<ApiResponse<CourierRatingMetrics>> => {
    const response = await api.get<ApiResponse<CourierRatingMetrics>>(
      '/analytics/cx/ratings/courier',
      {
        params: {
          startDate: params.startDate,
          endDate: params.endDate,
          includeDistribution: params.includeDistribution ?? true,
          includeTrend: params.includeTrend ?? false,
          includeTopCouriers: params.includeTopCouriers ?? false,
        },
      }
    )
    return response.data
  },

  /**
   * Get individual courier rating metrics
   * Cached for 5 minutes
   */
  getCourierRatingById: async (
    courierId: number,
    params: CxAnalyticsQueryParams
  ): Promise<ApiResponse<CourierRatingMetrics>> => {
    const response = await api.get<ApiResponse<CourierRatingMetrics>>(
      `/analytics/cx/ratings/courier/${courierId}`,
      {
        params: {
          startDate: params.startDate,
          endDate: params.endDate,
          includeDistribution: params.includeDistribution ?? true,
          includeTrend: params.includeTrend ?? false,
        },
      }
    )
    return response.data
  },

  /**
   * Get app store rating metrics (iOS and Android)
   * Cached for 5 minutes
   */
  getAppStoreRatings: async (
    params: CxAnalyticsQueryParams
  ): Promise<ApiResponse<AppStoreRatingMetrics>> => {
    const response = await api.get<ApiResponse<AppStoreRatingMetrics>>(
      '/analytics/cx/ratings/app-store',
      {
        params: {
          startDate: params.startDate,
          endDate: params.endDate,
          includeVersionBreakdown: params.includeVersionBreakdown ?? false,
          includeCountryBreakdown: params.includeCountryBreakdown ?? false,
          includeTrend: params.includeTrend ?? false,
        },
      }
    )
    return response.data
  },

  /**
   * Get support ticket metrics with SLA tracking
   * Cached for 1 minute (real-time operational data)
   */
  getSupportTicketMetrics: async (
    params: CxAnalyticsQueryParams
  ): Promise<ApiResponse<SupportTicketMetricsResponse>> => {
    const response = await api.get<ApiResponse<SupportTicketMetricsResponse>>(
      '/analytics/cx/support-tickets',
      {
        params: {
          startDate: params.startDate,
          endDate: params.endDate,
          slaHours: params.slaHours ?? 24,
          includeTrend: params.includeTrend ?? false,
          includeAgentPerformance: params.includeAgentPerformance ?? false,
        },
      }
    )
    return response.data
  },

  /**
   * Get CX summary combining all metrics
   * Cached for 5 minutes
   */
  getCxSummary: async (params: {
    startDate: string
    endDate: string
  }): Promise<ApiResponse<CxSummary>> => {
    const response = await api.get<ApiResponse<CxSummary>>('/analytics/cx/summary', {
      params: {
        startDate: params.startDate,
        endDate: params.endDate,
      },
    })
    return response.data
  },

  // ============ Cache Management ============

  /**
   * Invalidate NPS cache
   * Requires ADMIN role
   */
  invalidateNpsCache: async (): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.post<ApiResponse<{ message: string }>>(
      '/analytics/cx/cache/invalidate/nps'
    )
    return response.data
  },

  /**
   * Invalidate ratings cache (restaurant, courier, app store)
   * Requires ADMIN role
   */
  invalidateRatingsCache: async (): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.post<ApiResponse<{ message: string }>>(
      '/analytics/cx/cache/invalidate/ratings'
    )
    return response.data
  },

  /**
   * Invalidate support tickets cache
   * Requires ADMIN role
   */
  invalidateSupportTicketsCache: async (): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.post<ApiResponse<{ message: string }>>(
      '/analytics/cx/cache/invalidate/support-tickets'
    )
    return response.data
  },

  /**
   * Invalidate all CX analytics caches
   * Requires ADMIN role
   */
  invalidateAllCaches: async (): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.post<ApiResponse<{ message: string }>>(
      '/analytics/cx/cache/invalidate/all'
    )
    return response.data
  },
}
