import { api as apiClient } from './axios'
import type {
  SmsTemplate,
  SmsTemplateRequest,
  SmsTemplateSyncResponse,
  SmsTemplateStats,
} from '@/types'

export const smsTemplatesApi = {
  list: async () => {
    const response = await apiClient.get<SmsTemplate[]>('/sms/templates')
    return response.data
  },

  create: async (data: SmsTemplateRequest) => {
    const response = await apiClient.post<SmsTemplate>('/sms/templates', data)
    return response.data
  },

  update: async (id: number, data: SmsTemplateRequest) => {
    const response = await apiClient.put<SmsTemplate>(`/sms/templates/${id}`, data)
    return response.data
  },

  sync: async (id: number) => {
    const response = await apiClient.post<SmsTemplateSyncResponse>(
      `/sms/templates/${id}/sync`
    )
    return response.data
  },

  syncAll: async () => {
    const response = await apiClient.post<SmsTemplateSyncResponse[]>(
      '/sms/templates/sync-all'
    )
    return response.data
  },

  getStats: async (): Promise<SmsTemplateStats> => {
    const response = await apiClient.get<SmsTemplateStats>('/sms/templates/stats')
    return response.data ?? { total: 0, draft: 0, pending: 0, approved: 0, byProvider: {} }
  },

  deactivate: async (id: number) => {
    const response = await apiClient.delete<SmsTemplate>(`/sms/templates/${id}`)
    return response.data
  },
}
