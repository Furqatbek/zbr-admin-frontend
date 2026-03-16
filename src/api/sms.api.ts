import { api as apiClient } from './axios'
import type {
  SmsStatus,
  SmsConfigUpdate,
  SmsProvider,
  SmsTestResponse,
  SmsProviderDetails,
  SmsProviderCredentials,
} from '@/types'

export const smsApi = {
  getStatus: async () => {
    const response = await apiClient.get<{ data: SmsStatus }>('/admin/sms/status')
    return response.data.data
  },

  updateConfig: async (config: SmsConfigUpdate) => {
    const response = await apiClient.put<{ data: SmsStatus }>('/admin/sms/config', config)
    return response.data.data
  },

  switchProvider: async (provider: SmsProvider) => {
    const response = await apiClient.post<{ data: SmsStatus }>(`/admin/sms/switch/${provider}`)
    return response.data.data
  },

  toggle: async (enabled: boolean) => {
    const response = await apiClient.post<{ data: SmsStatus }>(`/admin/sms/toggle?enabled=${enabled}`)
    return response.data.data
  },

  sendTest: async (phoneNumber: string, message: string) => {
    const response = await apiClient.post<{ data: SmsTestResponse }>(
      `/admin/sms/test?phoneNumber=${encodeURIComponent(phoneNumber)}&message=${encodeURIComponent(message)}`
    )
    return response.data.data
  },

  getProviderDetails: async (provider: SmsProvider) => {
    const response = await apiClient.get<{ data: SmsProviderDetails }>(`/admin/sms/provider/${provider}`)
    return response.data.data
  },

  updateProviderCredentials: async (credentials: SmsProviderCredentials) => {
    const response = await apiClient.put<{ data: unknown }>('/admin/sms/provider/credentials', credentials)
    return response.data.data
  },

  enableProvider: async (provider: SmsProvider) => {
    const response = await apiClient.post<{ data: unknown }>(`/admin/sms/provider/${provider}/enable`)
    return response.data.data
  },

  disableProvider: async (provider: SmsProvider) => {
    const response = await apiClient.post<{ data: unknown }>(`/admin/sms/provider/${provider}/disable`)
    return response.data.data
  },
}
