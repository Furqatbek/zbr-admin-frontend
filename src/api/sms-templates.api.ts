import { api as apiClient } from './axios'
import type {
  SmsTemplate,
  SmsTemplateRequest,
  SmsTemplateSyncResponse,
  SmsTemplateStats,
} from '@/types'

export const smsTemplatesApi = {
  list: async () => {
    const response = await apiClient.get<{ data: SmsTemplate[] }>('/sms/templates')
    return response.data.data
  },

  create: async (data: SmsTemplateRequest) => {
    const response = await apiClient.post<{ data: SmsTemplate }>('/sms/templates', data)
    return response.data.data
  },

  update: async (id: number, data: SmsTemplateRequest) => {
    const response = await apiClient.put<{ data: SmsTemplate }>(`/sms/templates/${id}`, data)
    return response.data.data
  },

  sync: async (id: number) => {
    const response = await apiClient.post<{ data: SmsTemplateSyncResponse }>(
      `/sms/templates/${id}/sync`
    )
    return response.data.data
  },

  syncAll: async () => {
    const response = await apiClient.post<{ data: SmsTemplateSyncResponse[] }>(
      '/sms/templates/sync-all'
    )
    return response.data.data
  },

  getStats: async (): Promise<SmsTemplateStats> => {
    const response = await apiClient.get<{ data: SmsTemplateStats }>('/sms/templates/stats')
    return response.data.data ?? { total: 0, draft: 0, pending: 0, approved: 0, byProvider: {} }
  },
}
