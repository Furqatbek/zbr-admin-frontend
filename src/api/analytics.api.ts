import { api } from './axios'
import type {
  ApiResponse,
  UserActivityMetrics,
  OrderVolumeMetrics,
  ConversionMetrics,
  AOVMetrics,
  ActivationMetrics,
  ChurnMetrics,
  AnalyticsSummary,
} from '@/types'

// Legacy Types (for backward compatibility)
export interface RevenueMetrics {
  totalRevenue: number
  platformFees: number
  deliveryFees: number
  restaurantRevenue: number
  periodComparison: {
    current: number
    previous: number
    changePercent: number
  }
  dailyRevenue: Array<{
    date: string
    revenue: number
    orders: number
  }>
  topRestaurants: Array<{
    id: number
    name: string
    revenue: number
    orders: number
  }>
}

export interface OrdersMetrics {
  totalOrders: number
  completedOrders: number
  cancelledOrders: number
  averageOrderValue: number
  ordersByStatus: Record<string, number>
  hourlyDistribution: Array<{
    hour: number
    orders: number
  }>
  dailyOrders: Array<{
    date: string
    orders: number
    completed: number
    cancelled: number
  }>
}

export interface OperationsMetrics {
  averageDeliveryTime: number
  averagePrepTime: number
  onTimeDeliveryRate: number
  courierUtilization: number
  activeCouriers: number
  busyCouriers: number
  peakHours: Array<{
    hour: number
    load: number
  }>
  deliveryTimeDistribution: Array<{
    range: string
    count: number
  }>
}

export interface FinancialMetrics {
  grossRevenue: number
  netRevenue: number
  refunds: number
  payouts: {
    restaurants: number
    couriers: number
  }
  pendingPayouts: number
  transactionFees: number
  monthlyFinancials: Array<{
    month: string
    revenue: number
    costs: number
    profit: number
  }>
}

export interface CustomerExperienceMetrics {
  averageRating: number
  totalReviews: number
  npsScore: number
  complaintsCount: number
  resolutionRate: number
  ratingDistribution: Array<{
    rating: number
    count: number
  }>
  topComplaints: Array<{
    type: string
    count: number
  }>
  satisfactionTrend: Array<{
    date: string
    score: number
  }>
}

export interface FraudMetrics {
  suspiciousOrders: number
  flaggedAccounts: number
  chargebacks: number
  fraudPreventedAmount: number
  riskScore: number
  alertsByType: Array<{
    type: string
    count: number
    severity: 'low' | 'medium' | 'high'
  }>
  recentAlerts: Array<{
    id: number
    type: string
    description: string
    createdAt: string
    severity: 'low' | 'medium' | 'high'
    status: 'open' | 'investigating' | 'resolved'
  }>
}

export interface TechnicalMetrics {
  apiResponseTime: number
  errorRate: number
  uptime: number
  activeUsers: number
  requestsPerMinute: number
  serverLoad: number
  responseTimeHistory: Array<{
    timestamp: string
    responseTime: number
  }>
  errorsByType: Array<{
    type: string
    count: number
  }>
  systemHealth: {
    api: 'healthy' | 'degraded' | 'down'
    database: 'healthy' | 'degraded' | 'down'
    cache: 'healthy' | 'degraded' | 'down'
    websocket: 'healthy' | 'degraded' | 'down'
  }
  endpointPerformance: Array<{
    endpoint: string
    avgTime: number
    calls: number
  }>
}

export interface AnalyticsQueryParams {
  startDate?: string
  endDate?: string
  period?: 'day' | 'week' | 'month' | 'year'
}

// API functions
export const analyticsApi = {
  getRevenueMetrics: async (params: AnalyticsQueryParams = {}): Promise<RevenueMetrics> => {
    const response = await api.get('/admin/analytics/revenue', { params })
    return response.data
  },

  getOrdersMetrics: async (params: AnalyticsQueryParams = {}): Promise<OrdersMetrics> => {
    const response = await api.get('/admin/analytics/orders', { params })
    return response.data
  },

  getOperationsMetrics: async (params: AnalyticsQueryParams = {}): Promise<OperationsMetrics> => {
    const response = await api.get('/admin/analytics/operations', { params })
    return response.data
  },

  getFinancialMetrics: async (params: AnalyticsQueryParams = {}): Promise<FinancialMetrics> => {
    const response = await api.get('/admin/analytics/financial', { params })
    return response.data
  },

  getCustomerExperienceMetrics: async (params: AnalyticsQueryParams = {}): Promise<CustomerExperienceMetrics> => {
    const response = await api.get('/admin/analytics/cx', { params })
    return response.data
  },

  getFraudMetrics: async (params: AnalyticsQueryParams = {}): Promise<FraudMetrics> => {
    const response = await api.get('/admin/analytics/fraud', { params })
    return response.data
  },

  getTechnicalMetrics: async (params: AnalyticsQueryParams = {}): Promise<TechnicalMetrics> => {
    const response = await api.get('/admin/analytics/technical', { params })
    return response.data
  },

  // ============ New Analytics API (from ANALYTICS.md) ============
  // Base URL: /api/v1/analytics
  // Required roles: ADMIN, PLATFORM

  /**
   * Get user activity metrics including DAU, WAU, MAU and their ratios
   * Cached for 5 minutes
   */
  getActivityMetrics: async (): Promise<ApiResponse<UserActivityMetrics>> => {
    const response = await api.get<ApiResponse<UserActivityMetrics>>('/analytics/activity')
    return response.data
  },

  /**
   * Get order volume metrics including orders per day/hour,
   * first orders, repeat orders, and success/cancellation rates
   * Cached for 1 minute
   */
  getOrderVolumeMetrics: async (): Promise<ApiResponse<OrderVolumeMetrics>> => {
    const response = await api.get<ApiResponse<OrderVolumeMetrics>>('/analytics/orders')
    return response.data
  },

  /**
   * Get conversion funnel metrics for a specified period
   * Includes view-to-cart, cart-to-checkout, and checkout-to-payment rates
   * Cached for 30 seconds
   * @param days Number of days for the analysis period (default: 7)
   */
  getConversionMetrics: async (days: number = 7): Promise<ApiResponse<ConversionMetrics>> => {
    const response = await api.get<ApiResponse<ConversionMetrics>>('/analytics/conversion', {
      params: { days },
    })
    return response.data
  },

  /**
   * Get AOV metrics including average, median order values and items per order
   * Cached for 1 minute
   */
  getAOVMetrics: async (): Promise<ApiResponse<AOVMetrics>> => {
    const response = await api.get<ApiResponse<AOVMetrics>>('/analytics/aov')
    return response.data
  },

  /**
   * Get user activation metrics including first delivery count,
   * activation time, and referral usage rate
   * Cached for 5 minutes
   */
  getActivationMetrics: async (): Promise<ApiResponse<ActivationMetrics>> => {
    const response = await api.get<ApiResponse<ActivationMetrics>>('/analytics/activation')
    return response.data
  },

  /**
   * Get churn metrics for users, restaurants, and couriers
   * Cached for 10 minutes
   */
  getChurnMetrics: async (): Promise<ApiResponse<ChurnMetrics>> => {
    const response = await api.get<ApiResponse<ChurnMetrics>>('/analytics/churn')
    return response.data
  },

  /**
   * Get quick summary of all key metrics
   * Useful for dashboard overview
   */
  getSummary: async (): Promise<ApiResponse<AnalyticsSummary>> => {
    const response = await api.get<ApiResponse<AnalyticsSummary>>('/analytics/summary')
    return response.data
  },

  /**
   * Force refresh all analytics caches
   * Requires ADMIN role
   */
  refreshCache: async (): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.post<ApiResponse<{ message: string }>>('/analytics/cache/refresh')
    return response.data
  },

  /**
   * Force refresh a specific analytics cache
   * Requires ADMIN role
   * @param cacheName Cache name to refresh (e.g., 'dau_wau_mau', 'conversion', 'aov', etc.)
   */
  refreshSpecificCache: async (cacheName: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.post<ApiResponse<{ message: string }>>(
      `/analytics/cache/refresh/${cacheName}`
    )
    return response.data
  },
}
