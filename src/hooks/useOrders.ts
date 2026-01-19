import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi, type OrdersQueryParams, type UpdateOrderStatusRequest } from '@/api/orders.api'

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (params: OrdersQueryParams) => [...orderKeys.lists(), params] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: number) => [...orderKeys.details(), id] as const,
}

export function useOrders(params: OrdersQueryParams = {}) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => ordersApi.getOrders(params),
  })
}

export function useOrder(id: number) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => ordersApi.getOrderById(id),
    enabled: !!id,
  })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateOrderStatusRequest }) =>
      ordersApi.updateOrderStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
    },
  })
}
