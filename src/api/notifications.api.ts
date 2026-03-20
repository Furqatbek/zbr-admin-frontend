import { api as apiClient } from './axios'
import type {
  ApiResponse,
  Notification,
  CreateNotificationRequest,
  NotificationSearchRequest,
  NotificationCounts,
  NotificationRole,
  NotificationCategory,
  BulkActionRequest,
  CleanupResponse,
  BulkActionResponse,
  MarkReadResponse,
  NotificationTypeOption,
  NotificationRoleOption,
  NotificationCategoryOption,
  NotificationPriorityOption,
  NotificationReferenceData,
  NotificationTemplate,
  CreateTemplateRequest,
  UpdateTemplateRequest,
} from '@/types'

// Paginated response type for notifications
interface NotificationPage {
  content: Notification[]
  page: number
  pageSize: number
  totalElements: number
  totalPages: number
}

export const notificationsApi = {
  // ==================== CREATE ====================

  /**
   * Create a new notification
   */
  create: async (data: CreateNotificationRequest): Promise<ApiResponse<Notification>> => {
    const response = await apiClient.post<ApiResponse<Notification>>('/notifications', data)
    return response.data
  },

  // ==================== READ ====================

  /**
   * Get notification by ID
   */
  getById: async (id: number): Promise<ApiResponse<Notification>> => {
    const response = await apiClient.get<ApiResponse<Notification>>(`/notifications/${id}`)
    return response.data
  },

  /**
   * Get notifications with filters
   */
  getAll: async (params?: {
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
  }): Promise<ApiResponse<NotificationPage>> => {
    const response = await apiClient.get<ApiResponse<NotificationPage>>('/notifications', { params })
    return response.data
  },

  /**
   * Search notifications with advanced filters (POST)
   */
  search: async (request: NotificationSearchRequest): Promise<ApiResponse<NotificationPage>> => {
    const response = await apiClient.post<ApiResponse<NotificationPage>>('/notifications/search', request)
    return response.data
  },

  /**
   * Get current user's notifications
   */
  getMyNotifications: async (params?: {
    role?: NotificationRole
    isRead?: boolean
    category?: NotificationCategory
    page?: number
    pageSize?: number
  }): Promise<ApiResponse<NotificationPage>> => {
    const response = await apiClient.get<ApiResponse<NotificationPage>>('/notifications/me', { params })
    return response.data
  },

  /**
   * Get unread notifications for a user
   */
  getUnread: async (
    userId: number,
    params?: {
      role?: NotificationRole
      page?: number
      pageSize?: number
    }
  ): Promise<ApiResponse<NotificationPage>> => {
    const response = await apiClient.get<ApiResponse<NotificationPage>>(
      `/notifications/user/${userId}/unread`,
      { params }
    )
    return response.data
  },

  /**
   * Get notification counts for a user
   */
  getCounts: async (userId: number): Promise<ApiResponse<NotificationCounts>> => {
    const response = await apiClient.get<ApiResponse<NotificationCounts>>(
      `/notifications/user/${userId}/counts`
    )
    return response.data
  },

  /**
   * Get unread count only
   */
  getUnreadCount: async (
    userId: number,
    role?: NotificationRole
  ): Promise<ApiResponse<{ unreadCount: number }>> => {
    const response = await apiClient.get<ApiResponse<{ unreadCount: number }>>(
      `/notifications/user/${userId}/unread-count`,
      { params: role ? { role } : undefined }
    )
    return response.data
  },

  // ==================== UPDATE ====================

  /**
   * Mark notification as read
   */
  markAsRead: async (id: number): Promise<ApiResponse<Notification>> => {
    const response = await apiClient.patch<ApiResponse<Notification>>(`/notifications/${id}/read`)
    return response.data
  },

  /**
   * Mark all notifications as read for a user
   */
  markAllAsRead: async (
    userId: number,
    role?: NotificationRole
  ): Promise<ApiResponse<MarkReadResponse>> => {
    const response = await apiClient.patch<ApiResponse<MarkReadResponse>>(
      '/notifications/read-all',
      null,
      { params: { userId, ...(role && { role }) } }
    )
    return response.data
  },

  /**
   * Mark batch of notifications as read
   */
  markBatchAsRead: async (ids: number[]): Promise<ApiResponse<MarkReadResponse>> => {
    const response = await apiClient.patch<ApiResponse<MarkReadResponse>>(
      '/notifications/read-batch',
      ids
    )
    return response.data
  },

  /**
   * Dismiss notification
   */
  dismiss: async (id: number): Promise<ApiResponse<Notification>> => {
    const response = await apiClient.patch<ApiResponse<Notification>>(`/notifications/${id}/dismiss`)
    return response.data
  },

  /**
   * Bulk action on notifications
   */
  bulkAction: async (request: BulkActionRequest): Promise<ApiResponse<BulkActionResponse>> => {
    const response = await apiClient.post<ApiResponse<BulkActionResponse>>(
      '/notifications/bulk-action',
      request
    )
    return response.data
  },

  // ==================== DELETE ====================

  /**
   * Delete notification
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/notifications/${id}`)
  },

  /**
   * Delete all notifications for a user
   */
  deleteAllForUser: async (userId: number): Promise<ApiResponse<{ deletedCount: number }>> => {
    const response = await apiClient.delete<ApiResponse<{ deletedCount: number }>>(
      `/notifications/user/${userId}`
    )
    return response.data
  },

  // ==================== ADMIN ====================

  /**
   * Cleanup expired notifications
   */
  cleanupExpired: async (): Promise<ApiResponse<CleanupResponse>> => {
    const response = await apiClient.post<ApiResponse<CleanupResponse>>(
      '/notifications/admin/cleanup/expired'
    )
    return response.data
  },

  /**
   * Cleanup dismissed notifications
   */
  cleanupDismissed: async (daysOld = 7): Promise<ApiResponse<CleanupResponse>> => {
    const response = await apiClient.post<ApiResponse<CleanupResponse>>(
      '/notifications/admin/cleanup/dismissed',
      null,
      { params: { daysOld } }
    )
    return response.data
  },

  /**
   * Cleanup old read notifications
   */
  cleanupRead: async (daysOld = 90): Promise<ApiResponse<CleanupResponse>> => {
    const response = await apiClient.post<ApiResponse<CleanupResponse>>(
      '/notifications/admin/cleanup/read',
      null,
      { params: { daysOld } }
    )
    return response.data
  },

  // ==================== REFERENCE DATA / ENUMS ====================

  /**
   * Get all notification types
   */
  getTypes: async (): Promise<NotificationTypeOption[]> => {
    const response = await apiClient.get<NotificationTypeOption[]>('/notifications/types')
    return response.data
  },

  /**
   * Get all notification roles
   */
  getRoles: async (): Promise<NotificationRoleOption[]> => {
    const response = await apiClient.get<NotificationRoleOption[]>('/notifications/roles')
    return response.data
  },

  /**
   * Get all notification categories
   */
  getCategories: async (): Promise<NotificationCategoryOption[]> => {
    const response = await apiClient.get<NotificationCategoryOption[]>('/notifications/categories')
    return response.data
  },

  /**
   * Get all notification priorities
   */
  getPriorities: async (): Promise<NotificationPriorityOption[]> => {
    const response = await apiClient.get<NotificationPriorityOption[]>('/notifications/priorities')
    return response.data
  },

  /**
   * Get all reference data in one call
   */
  getReferenceData: async (): Promise<NotificationReferenceData> => {
    const response = await apiClient.get<NotificationReferenceData>('/notifications/reference-data')
    return response.data
  },

  // ==================== TEMPLATES ====================

  /**
   * Get all templates
   */
  getTemplates: async (): Promise<NotificationTemplate[]> => {
    const response = await apiClient.get<NotificationTemplate[]>('/notifications/templates')
    return response.data
  },

  /**
   * Get template by ID
   */
  getTemplateById: async (id: number): Promise<NotificationTemplate> => {
    const response = await apiClient.get<NotificationTemplate>(`/notifications/templates/${id}`)
    return response.data
  },

  /**
   * Get templates by notification type
   */
  getTemplatesByType: async (type: string): Promise<NotificationTemplate[]> => {
    const response = await apiClient.get<NotificationTemplate[]>(
      `/notifications/templates/by-type/${type}`
    )
    return response.data
  },

  /**
   * Get templates by role
   */
  getTemplatesByRole: async (role: NotificationRole): Promise<NotificationTemplate[]> => {
    const response = await apiClient.get<NotificationTemplate[]>(
      `/notifications/templates/by-role/${role}`
    )
    return response.data
  },

  /**
   * Get templates by type and role
   */
  getTemplatesByTypeAndRole: async (
    type: string,
    role: NotificationRole
  ): Promise<NotificationTemplate[]> => {
    const response = await apiClient.get<NotificationTemplate[]>(
      '/notifications/templates/by-type-and-role',
      { params: { type, role } }
    )
    return response.data
  },

  /**
   * Create template (Admin)
   */
  createTemplate: async (data: CreateTemplateRequest): Promise<NotificationTemplate> => {
    const response = await apiClient.post<NotificationTemplate>('/notifications/templates', data)
    return response.data
  },

  /**
   * Update template (Admin)
   */
  updateTemplate: async (id: number, data: UpdateTemplateRequest): Promise<NotificationTemplate> => {
    const response = await apiClient.put<NotificationTemplate>(
      `/notifications/templates/${id}`,
      data
    )
    return response.data
  },

  /**
   * Delete template (Admin)
   */
  deleteTemplate: async (id: number): Promise<void> => {
    await apiClient.delete(`/notifications/templates/${id}`)
  },

  /**
   * Toggle template active status (Admin)
   */
  toggleTemplateActive: async (id: number): Promise<NotificationTemplate> => {
    const response = await apiClient.patch<NotificationTemplate>(
      `/notifications/templates/${id}/toggle-active`
    )
    return response.data
  },
}
