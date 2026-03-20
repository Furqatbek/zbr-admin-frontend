import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { platformApi, type ReferralsQueryParams } from '@/api/platform.api'

export const platformKeys = {
  all: ['platform'] as const,
  referrals: () => [...platformKeys.all, 'referrals'] as const,
  referralsList: (params: ReferralsQueryParams) => [...platformKeys.referrals(), 'list', params] as const,
  myReferrals: (params: ReferralsQueryParams) => [...platformKeys.referrals(), 'my', params] as const,
  myReferralStats: () => [...platformKeys.referrals(), 'my', 'stats'] as const,
  referralByCode: (code: string) => [...platformKeys.referrals(), 'code', code] as const,
  analytics: () => [...platformKeys.all, 'analytics'] as const,
  orderAnalytics: (days: number) => [...platformKeys.analytics(), 'orders', days] as const,
}

// ============ Query Hooks ============

/**
 * Get referrals created by the authenticated user
 */
export function useMyReferrals(params: ReferralsQueryParams = {}) {
  return useQuery({
    queryKey: platformKeys.myReferrals(params),
    queryFn: () => platformApi.getMyReferrals(params),
  })
}

/**
 * Get referral statistics for the authenticated user
 */
export function useMyReferralStats() {
  return useQuery({
    queryKey: platformKeys.myReferralStats(),
    queryFn: () => platformApi.getMyReferralStats(),
  })
}

/**
 * Get referral details by code
 */
export function useReferralByCode(code: string) {
  return useQuery({
    queryKey: platformKeys.referralByCode(code),
    queryFn: () => platformApi.getReferralByCode(code),
    enabled: !!code,
  })
}

/**
 * Get all referrals (Admin)
 */
export function useAllReferrals(params: ReferralsQueryParams = {}) {
  return useQuery({
    queryKey: platformKeys.referralsList(params),
    queryFn: () => platformApi.getAllReferrals(params),
  })
}

/**
 * Get order analytics for the specified period
 */
export function useOrderAnalytics(days: number = 7) {
  return useQuery({
    queryKey: platformKeys.orderAnalytics(days),
    queryFn: () => platformApi.getOrderAnalytics(days),
  })
}

// ============ Mutation Hooks ============

/**
 * Generate a new referral code
 */
export function useGenerateReferralCode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => platformApi.generateReferralCode(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: platformKeys.referrals() })
    },
  })
}
