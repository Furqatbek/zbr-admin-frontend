import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { couriersApi, type CouriersQueryParams, type NearbyQueryParams } from '@/api/couriers.api'

export const courierKeys = {
  all: ['couriers'] as const,
  lists: () => [...courierKeys.all, 'list'] as const,
  list: (params: CouriersQueryParams) => [...courierKeys.lists(), params] as const,
  details: () => [...courierKeys.all, 'detail'] as const,
  detail: (id: number) => [...courierKeys.details(), id] as const,
  nearby: (params: NearbyQueryParams) => [...courierKeys.all, 'nearby', params] as const,
}

export function useCouriers(params: CouriersQueryParams = {}) {
  return useQuery({
    queryKey: courierKeys.list(params),
    queryFn: () => couriersApi.getCouriers(params),
  })
}

export function useCourier(id: number) {
  return useQuery({
    queryKey: courierKeys.detail(id),
    queryFn: () => couriersApi.getCourierById(id),
    enabled: !!id,
  })
}

export function useVerifyCourier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => couriersApi.verifyCourier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courierKeys.all })
    },
  })
}

export function useNearbyCouriers(params: NearbyQueryParams, enabled = true) {
  return useQuery({
    queryKey: courierKeys.nearby(params),
    queryFn: () => couriersApi.getNearby(params),
    enabled: enabled && !!params.lat && !!params.lng,
  })
}
