import api from './axios'
import type {
  ApiResponse,
  PaginatedResponse,
  Referral,
  ReferralStats,
  OrderAnalytics,
} from '@/types'

export interface ReferralsQueryParams {
  page?: number
  size?: number
  sort?: string
}

export const platformApi = {
  // ============ Referral Program (User-facing) ============

  /**
   * Generate a new referral code for the authenticated user
   * Roles: Any authenticated user
   */
  generateReferralCode: async (): Promise<ApiResponse<Referral>> => {
    const response = await api.post<ApiResponse<Referral>>('/referrals/generate')
    return response.data
  },

  /**
   * Get all referrals created by the authenticated user
   * Roles: Any authenticated user
   */
  getMyReferrals: async (params: ReferralsQueryParams = {}): Promise<ApiResponse<PaginatedResponse<Referral>>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Referral>>>('/referrals/my', { params })
    return response.data
  },

  /**
   * Get referral statistics for the authenticated user
   * Roles: Any authenticated user
   */
  getMyReferralStats: async (): Promise<ApiResponse<ReferralStats>> => {
    const response = await api.get<ApiResponse<ReferralStats>>('/referrals/my/stats')
    return response.data
  },

  /**
   * Get referral details by referral code
   * Roles: Any authenticated user
   */
  getReferralByCode: async (code: string): Promise<ApiResponse<Referral>> => {
    const response = await api.get<ApiResponse<Referral>>(`/referrals/${code}`)
    return response.data
  },

  // ============ Admin Analytics ============

  /**
   * Get basic order metrics for the specified period
   * Roles: ADMIN, PLATFORM
   */
  getOrderAnalytics: async (days: number = 7): Promise<ApiResponse<OrderAnalytics>> => {
    const response = await api.get<ApiResponse<OrderAnalytics>>('/admin/analytics/orders', {
      params: { days },
    })
    return response.data
  },

  // ============ Admin Referral Management ============

  /**
   * List all referrals in the system with pagination
   * Roles: ADMIN, PLATFORM
   */
  getAllReferrals: async (params: ReferralsQueryParams = {}): Promise<ApiResponse<PaginatedResponse<Referral>>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Referral>>>('/admin/referrals', { params })
    return response.data
  },
}
