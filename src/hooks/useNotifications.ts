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

// ==================== REFERENCE DATA / ENUM HOOKS ====================

/**
 * Get all notification types
 */
export function useNotificationTypes() {
  return useQuery({
    queryKey: [...notificationKeys.all, 'types'],
    queryFn: () => notificationsApi.getTypes(),
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  })
}

/**
 * Get all notification roles
 */
export function useNotificationRoles() {
  return useQuery({
    queryKey: [...notificationKeys.all, 'roles'],
    queryFn: () => notificationsApi.getRoles(),
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
  })
}

/**
 * Get all notification categories
 */
export function useNotificationCategories() {
  return useQuery({
    queryKey: [...notificationKeys.all, 'categories'],
    queryFn: () => notificationsApi.getCategories(),
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
  })
}

/**
 * Get all notification priorities
 */
export function useNotificationPriorities() {
  return useQuery({
    queryKey: [...notificationKeys.all, 'priorities'],
    queryFn: () => notificationsApi.getPriorities(),
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
  })
}

/**
 * Get all reference data in one call
 */
export function useNotificationReferenceData() {
  return useQuery({
    queryKey: [...notificationKeys.all, 'reference-data'],
    queryFn: () => notificationsApi.getReferenceData(),
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
  })
}

// ==================== TEMPLATE HOOKS ====================

/**
 * Get all templates
 */
export function useNotificationTemplates() {
  return useQuery({
    queryKey: [...notificationKeys.all, 'templates'],
    queryFn: () => notificationsApi.getTemplates(),
  })
}

/**
 * Get template by ID
 */
export function useNotificationTemplate(id: number) {
  return useQuery({
    queryKey: [...notificationKeys.all, 'templates', id],
    queryFn: () => notificationsApi.getTemplateById(id),
    enabled: !!id,
  })
}

/**
 * Get templates by type
 */
export function useTemplatesByType(type: string) {
  return useQuery({
    queryKey: [...notificationKeys.all, 'templates', 'by-type', type],
    queryFn: () => notificationsApi.getTemplatesByType(type),
    enabled: !!type,
  })
}

/**
 * Get templates by role
 */
export function useTemplatesByRole(role: NotificationRole) {
  return useQuery({
    queryKey: [...notificationKeys.all, 'templates', 'by-role', role],
    queryFn: () => notificationsApi.getTemplatesByRole(role),
    enabled: !!role,
  })
}

/**
 * Create template
 */
export function useCreateTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: notificationsApi.createTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...notificationKeys.all, 'templates'] })
    },
  })
}

/**
 * Update template
 */
export function useUpdateTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof notificationsApi.updateTemplate>[1] }) =>
      notificationsApi.updateTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...notificationKeys.all, 'templates'] })
    },
  })
}

/**
 * Delete template
 */
export function useDeleteTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => notificationsApi.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...notificationKeys.all, 'templates'] })
    },
  })
}

/**
 * Toggle template active status
 */
export function useToggleTemplateActive() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => notificationsApi.toggleTemplateActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...notificationKeys.all, 'templates'] })
    },
  })
}
