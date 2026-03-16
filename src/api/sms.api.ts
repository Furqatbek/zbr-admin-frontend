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
    const response = await apiClient.get<SmsStatus>('/admin/sms/status')
    return response.data
  },

  updateConfig: async (config: SmsConfigUpdate) => {
    const response = await apiClient.put<SmsStatus>('/admin/sms/config', config)
    return response.data
  },

  switchProvider: async (provider: SmsProvider) => {
    const response = await apiClient.post<SmsStatus>(`/admin/sms/switch/${provider}`)
    return response.data
  },

  toggle: async (enabled: boolean) => {
    const response = await apiClient.post<SmsStatus>(`/admin/sms/toggle?enabled=${enabled}`)
    return response.data
  },

  sendTest: async (phoneNumber: string, message: string) => {
    const response = await apiClient.post<SmsTestResponse>(
      `/admin/sms/test?phoneNumber=${encodeURIComponent(phoneNumber)}&message=${encodeURIComponent(message)}`
    )
    return response.data
  },

  getProviderDetails: async (provider: SmsProvider) => {
    const response = await apiClient.get<SmsProviderDetails>(`/admin/sms/provider/${provider}`)
    return response.data
  },

  updateProviderCredentials: async (credentials: SmsProviderCredentials) => {
    const response = await apiClient.put('/admin/sms/provider/credentials', credentials)
    return response.data
  },

  enableProvider: async (provider: SmsProvider) => {
    const response = await apiClient.post(`/admin/sms/provider/${provider}/enable`)
    return response.data
  },

  disableProvider: async (provider: SmsProvider) => {
    const response = await apiClient.post(`/admin/sms/provider/${provider}/disable`)
    return response.data
  },
}
