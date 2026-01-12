import { api as apiClient } from './axios'

export interface NotificationTemplate {
  id: number
  name: string
  title: string
  body: string
  type: 'PUSH' | 'SMS' | 'EMAIL'
  createdAt: string
}

export interface BroadcastRequest {
  templateId?: number
  title: string
  body: string
  type: 'PUSH' | 'SMS' | 'EMAIL'
  targetAudience: 'ALL' | 'CUSTOMERS' | 'COURIERS' | 'RESTAURANTS' | 'CUSTOM'
  userIds?: number[]
  scheduledAt?: string
}

export interface BroadcastHistory {
  id: number
  title: string
  body: string
  type: 'PUSH' | 'SMS' | 'EMAIL'
  targetAudience: string
  recipientCount: number
  sentAt: string
  status: 'PENDING' | 'SENDING' | 'SENT' | 'FAILED'
}

export interface NotificationStats {
  totalSent: number
  totalPending: number
  totalFailed: number
  lastCleanup: string
  oldNotificationsCount: number
}

export const notificationsApi = {
  getTemplates: async () => {
    const response = await apiClient.get<NotificationTemplate[]>('/notifications/templates')
    return response.data
  },

  createTemplate: async (template: Omit<NotificationTemplate, 'id' | 'createdAt'>) => {
    const response = await apiClient.post<NotificationTemplate>('/notifications/templates', template)
    return response.data
  },

  broadcast: async (request: BroadcastRequest) => {
    const response = await apiClient.post('/notifications/broadcast', request)
    return response.data
  },

  getBroadcastHistory: async (page = 0, size = 20) => {
    const response = await apiClient.get<{ content: BroadcastHistory[]; totalElements: number }>(
      '/notifications/broadcast/history',
      { params: { page, size } }
    )
    return response.data
  },

  getStats: async () => {
    const response = await apiClient.get<NotificationStats>('/notifications/stats')
    return response.data
  },

  cleanup: async (olderThanDays: number) => {
    const response = await apiClient.delete('/notifications/cleanup', {
      params: { olderThanDays },
    })
    return response.data
  },
}
