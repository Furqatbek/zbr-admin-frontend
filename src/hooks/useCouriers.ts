import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { couriersApi, type CouriersQueryParams, type AvailableCouriersParams } from '@/api/couriers.api'
import type { CourierStatus, CourierRegistrationRequest } from '@/types'

export const courierKeys = {
  all: ['couriers'] as const,
  lists: () => [...courierKeys.all, 'list'] as const,
  list: (params: CouriersQueryParams) => [...courierKeys.lists(), params] as const,
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
