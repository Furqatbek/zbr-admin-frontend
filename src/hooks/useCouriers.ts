import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { couriersApi, type CouriersQueryParams, type AvailableCouriersParams } from '@/api/couriers.api'
import type { CourierStatus, CourierUpdateRequest } from '@/types'

export const courierKeys = {
  all: ['couriers'] as const,
  lists: () => [...courierKeys.all, 'list'] as const,
  list: (params: CouriersQueryParams) => [...courierKeys.lists(), params] as const,
  pending: (params: CouriersQueryParams) => [...courierKeys.all, 'pending', params] as const,
  online: (params: CouriersQueryParams) => [...courierKeys.all, 'online', params] as const,
  byStatus: (status: CourierStatus, params: CouriersQueryParams) => [...courierKeys.all, 'by-status', status, params] as const,
  statistics: () => [...courierKeys.all, 'statistics'] as const,
  details: () => [...courierKeys.all, 'detail'] as const,
  detail: (id: number) => [...courierKeys.details(), id] as const,
  available: (params: AvailableCouriersParams) => [...courierKeys.all, 'available', params] as const,
}

// Get all couriers with pagination
export function useCouriers(params: CouriersQueryParams = {}) {
  return useQuery({
    queryKey: courierKeys.list(params),
    queryFn: () => couriersApi.getAll(params),
  })
}

// Get pending couriers awaiting approval
export function usePendingCouriers(params: CouriersQueryParams = {}) {
  return useQuery({
    queryKey: courierKeys.pending(params),
    queryFn: () => couriersApi.getPending(params),
  })
}

// Get online couriers with location (for map)
export function useOnlineCouriers(params: CouriersQueryParams = {}) {
  return useQuery({
    queryKey: courierKeys.online(params),
    queryFn: () => couriersApi.getOnline(params),
  })
}

// Get couriers by status
export function useCouriersByStatus(status: CourierStatus, params: CouriersQueryParams = {}) {
  return useQuery({
    queryKey: courierKeys.byStatus(status, params),
    queryFn: () => couriersApi.getByStatus(status, params),
    enabled: !!status,
  })
}

// Get courier statistics for dashboard
export function useCourierStatistics() {
  return useQuery({
    queryKey: courierKeys.statistics(),
    queryFn: () => couriersApi.getStatistics(),
  })
}

// Get a single courier by ID
export function useCourier(id: number) {
  return useQuery({
    queryKey: courierKeys.detail(id),
    queryFn: () => couriersApi.getById(id),
    enabled: !!id,
  })
}

// Find available couriers near a location
export function useAvailableCouriers(params: AvailableCouriersParams, enabled = true) {
  return useQuery({
    queryKey: courierKeys.available(params),
    queryFn: () => couriersApi.findAvailable(params),
    enabled: enabled && !!params.lat && !!params.lng,
  })
}

// Update courier profile (admin)
export function useUpdateCourier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ courierId, data }: { courierId: number; data: CourierUpdateRequest }) =>
      couriersApi.update(courierId, data),
    onSuccess: (_, { courierId }) => {
      queryClient.invalidateQueries({ queryKey: courierKeys.all })
      queryClient.invalidateQueries({ queryKey: courierKeys.detail(courierId) })
    },
  })
}

// Verify a courier (admin)
export function useVerifyCourier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (courierId: number) => couriersApi.verify(courierId),
    onSuccess: (_, courierId) => {
      queryClient.invalidateQueries({ queryKey: courierKeys.all })
      queryClient.invalidateQueries({ queryKey: courierKeys.detail(courierId) })
    },
  })
}

// Reject pending courier application (admin)
export function useRejectCourier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (courierId: number) => couriersApi.reject(courierId),
    onSuccess: (_, courierId) => {
      queryClient.invalidateQueries({ queryKey: courierKeys.all })
      queryClient.invalidateQueries({ queryKey: courierKeys.detail(courierId) })
    },
  })
}

// Suspend courier account (admin)
export function useSuspendCourier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (courierId: number) => couriersApi.suspend(courierId),
    onSuccess: (_, courierId) => {
      queryClient.invalidateQueries({ queryKey: courierKeys.all })
      queryClient.invalidateQueries({ queryKey: courierKeys.detail(courierId) })
    },
  })
}

// Activate/reactivate courier (admin)
export function useActivateCourier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (courierId: number) => couriersApi.activate(courierId),
    onSuccess: (_, courierId) => {
      queryClient.invalidateQueries({ queryKey: courierKeys.all })
      queryClient.invalidateQueries({ queryKey: courierKeys.detail(courierId) })
    },
  })
}

