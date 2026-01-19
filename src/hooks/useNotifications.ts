import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsApi } from '@/api/notifications.api'
import type {
  CreateNotificationRequest,
  NotificationSearchRequest,
  NotificationRole,
  NotificationCategory,
  BulkActionRequest,
} from '@/types'

export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...notificationKeys.lists(), filters] as const,
  details: () => [...notificationKeys.all, 'detail'] as const,
  detail: (id: number) => [...notificationKeys.details(), id] as const,
  counts: (userId: number) => [...notificationKeys.all, 'counts', userId] as const,
  unreadCount: (userId: number, role?: NotificationRole) =>
    [...notificationKeys.all, 'unread-count', userId, role] as const,
  myNotifications: (filters: Record<string, unknown>) =>
    [...notificationKeys.all, 'my', filters] as const,
}

// ==================== READ HOOKS ====================

/**
 * Get notification by ID
 */
export function useNotification(id: number) {
  return useQuery({
    queryKey: notificationKeys.detail(id),
    queryFn: () => notificationsApi.getById(id),
    enabled: !!id,
  })
}

/**
 * Get notifications with filters
 */
export function useNotifications(params?: {
  userId?: number
  role?: NotificationRole
  isRead?: boolean
  category?: NotificationCategory
  orderId?: number
  createdFrom?: string
  createdTo?: string
  searchTerm?: string
  includeDismissed?: boolean
  page?: number
  pageSize?: number
  sortBy?: string
  sortDirection?: 'ASC' | 'DESC'
}) {
  return useQuery({
    queryKey: notificationKeys.list(params || {}),
    queryFn: () => notificationsApi.getAll(params),
  })
}

/**
 * Search notifications with POST request
 */
export function useNotificationSearch(request: NotificationSearchRequest, enabled = true) {
  return useQuery({
    queryKey: notificationKeys.list({ search: true, ...request }),
    queryFn: () => notificationsApi.search(request),
    enabled,
  })
}

/**
 * Get current user's notifications
 */
export function useMyNotifications(params?: {
  role?: NotificationRole
  isRead?: boolean
  category?: NotificationCategory
  page?: number
  pageSize?: number
}) {
  return useQuery({
    queryKey: notificationKeys.myNotifications(params || {}),
    queryFn: () => notificationsApi.getMyNotifications(params),
  })
}

/**
 * Get unread notifications for a user
 */
export function useUnreadNotifications(
  userId: number,
  params?: {
    role?: NotificationRole
    page?: number
    pageSize?: number
  }
) {
  return useQuery({
    queryKey: notificationKeys.list({ userId, unread: true, ...params }),
    queryFn: () => notificationsApi.getUnread(userId, params),
    enabled: !!userId,
  })
}

/**
 * Get notification counts for a user
 */
export function useNotificationCounts(userId: number) {
  return useQuery({
    queryKey: notificationKeys.counts(userId),
    queryFn: () => notificationsApi.getCounts(userId),
    enabled: !!userId,
  })
}

/**
 * Get unread count only
 */
export function useUnreadCount(userId: number, role?: NotificationRole) {
  return useQuery({
    queryKey: notificationKeys.unreadCount(userId, role),
    queryFn: () => notificationsApi.getUnreadCount(userId, role),
    enabled: !!userId,
    refetchInterval: 60000, // Refresh every minute
  })
}

// ==================== MUTATION HOOKS ====================

/**
 * Create notification
 */
export function useCreateNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateNotificationRequest) => notificationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
    },
  })
}

/**
 * Mark notification as read
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => notificationsApi.markAsRead(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

/**
 * Mark all notifications as read
 */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, role }: { userId: number; role?: NotificationRole }) =>
      notificationsApi.markAllAsRead(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

/**
 * Mark batch as read
 */
export function useMarkBatchAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: number[]) => notificationsApi.markBatchAsRead(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

/**
 * Dismiss notification
 */
export function useDismissNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => notificationsApi.dismiss(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
    },
  })
}

/**
 * Bulk action
 */
export function useBulkAction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: BulkActionRequest) => notificationsApi.bulkAction(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

/**
 * Delete notification
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => notificationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

/**
 * Delete all for user
 */
export function useDeleteAllForUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: number) => notificationsApi.deleteAllForUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

// ==================== ADMIN HOOKS ====================

/**
 * Cleanup expired notifications
 */
export function useCleanupExpired() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => notificationsApi.cleanupExpired(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

/**
 * Cleanup dismissed notifications
 */
export function useCleanupDismissed() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (daysOld?: number) => notificationsApi.cleanupDismissed(daysOld),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

/**
 * Cleanup old read notifications
 */
export function useCleanupRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (daysOld?: number) => notificationsApi.cleanupRead(daysOld),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

// ==================== ENUM HOOKS ====================

/**
 * Get all notification enums
 */
export function useNotificationEnums() {
  return useQuery({
    queryKey: [...notificationKeys.all, 'enums'],
    queryFn: () => notificationsApi.getEnums(),
    staleTime: 1000 * 60 * 60, // 1 hour - enums rarely change
    gcTime: 1000 * 60 * 60 * 24, // 24 hours cache
  })
}

/**
 * Get notification categories
 */
export function useNotificationCategories() {
  return useQuery({
    queryKey: [...notificationKeys.all, 'enums', 'categories'],
    queryFn: () => notificationsApi.getCategories(),
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
  })
}

/**
 * Get notification roles
 */
export function useNotificationRoles() {
  return useQuery({
    queryKey: [...notificationKeys.all, 'enums', 'roles'],
    queryFn: () => notificationsApi.getRoles(),
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
  })
}

/**
 * Get notification priorities
 */
export function useNotificationPriorities() {
  return useQuery({
    queryKey: [...notificationKeys.all, 'enums', 'priorities'],
    queryFn: () => notificationsApi.getPriorities(),
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
  })
}

/**
 * Get notification icons
 */
export function useNotificationIcons() {
  return useQuery({
    queryKey: [...notificationKeys.all, 'enums', 'icons'],
    queryFn: () => notificationsApi.getIcons(),
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
  })
}
