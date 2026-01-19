import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { couriersApi, type CouriersQueryParams, type AvailableCouriersParams } from '@/api/couriers.api'
import type { CourierStatus, CourierRegistrationRequest, CourierUpdateRequest } from '@/types'

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
  myProfile: () => [...courierKeys.all, 'me'] as const,
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

// Get my courier profile
export function useMyProfile() {
  return useQuery({
    queryKey: courierKeys.myProfile(),
    queryFn: () => couriersApi.getMyProfile(),
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

// Register as courier
export function useRegisterCourier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CourierRegistrationRequest) => couriersApi.register(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courierKeys.all })
    },
  })
}

// Update courier status
export function useUpdateCourierStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (status: CourierStatus) => couriersApi.updateStatus(status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courierKeys.all })
    },
  })
}

// Update courier location
export function useUpdateCourierLocation() {
  return useMutation({
    mutationFn: ({ lat, lng }: { lat: number; lng: number }) => couriersApi.updateLocation(lat, lng),
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courierKeys.all })
    },
  })
}

// Reject pending courier application (admin)
export function useRejectCourier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (courierId: number) => couriersApi.reject(courierId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courierKeys.all })
    },
  })
}

// Suspend courier account (admin)
export function useSuspendCourier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (courierId: number) => couriersApi.suspend(courierId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courierKeys.all })
    },
  })
}

// Activate/reactivate courier (admin)
export function useActivateCourier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (courierId: number) => couriersApi.activate(courierId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courierKeys.all })
    },
  })
}

// Accept an order
export function useAcceptOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ courierId, orderId }: { courierId: number; orderId: number }) =>
      couriersApi.acceptOrder(courierId, orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courierKeys.all })
    },
  })
}

// Complete a delivery
export function useCompleteDelivery() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ courierId, orderId }: { courierId: number; orderId: number }) =>
      couriersApi.completeDelivery(courierId, orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courierKeys.all })
    },
  })
}
