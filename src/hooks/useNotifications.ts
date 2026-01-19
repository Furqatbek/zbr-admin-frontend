import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsApi, type BroadcastRequest } from '@/api/notifications.api'

export const notificationKeys = {
  all: ['notifications'] as const,
  templates: () => [...notificationKeys.all, 'templates'] as const,
  history: (page: number) => [...notificationKeys.all, 'history', page] as const,
  stats: () => [...notificationKeys.all, 'stats'] as const,
}

export function useNotificationTemplates() {
  return useQuery({
    queryKey: notificationKeys.templates(),
    queryFn: () => notificationsApi.getTemplates(),
  })
}

export function useBroadcastHistory(page = 0) {
  return useQuery({
    queryKey: notificationKeys.history(page),
    queryFn: () => notificationsApi.getBroadcastHistory(page),
  })
}

export function useNotificationStats() {
  return useQuery({
    queryKey: notificationKeys.stats(),
    queryFn: () => notificationsApi.getStats(),
  })
}

export function useBroadcastNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: BroadcastRequest) => notificationsApi.broadcast(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.history(0) })
      queryClient.invalidateQueries({ queryKey: notificationKeys.stats() })
    },
  })
}

export function useCleanupNotifications() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (olderThanDays: number) => notificationsApi.cleanup(olderThanDays),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.stats() })
    },
  })
}
