import { api as apiClient } from './axios'

export interface PlatformSettings {
  platformName: string
  supportEmail: string
  supportPhone: string
  defaultCurrency: string
  timezone: string
  maintenanceMode: boolean
  maintenanceMessage: string
  orderSettings: {
    minOrderAmount: number
    maxOrderAmount: number
    defaultDeliveryRadius: number
    maxDeliveryRadius: number
    freeDeliveryThreshold: number
    baseDeliveryFee: number
  }
  courierSettings: {
    maxActiveOrders: number
    autoAssignEnabled: boolean
    verificationRequired: boolean
    minRatingForBonus: number
  }
  restaurantSettings: {
    commissionRate: number
    autoApproveEnabled: boolean
    maxPrepTime: number
    minRating: number
  }
  notificationSettings: {
    emailEnabled: boolean
    smsEnabled: boolean
    pushEnabled: boolean
    marketingEnabled: boolean
  }
}

export interface DeliveryFeeSettings {
  baseFee: number
  perKmFee: number
  minFee: number
  maxFee: number
  peakHourSurcharge: number
  peakStartHour: number
  peakEndHour: number
  routingEnabled: boolean
  routingOsrmBaseUrl: string
  routingConnectTimeout: number
  routingReadTimeout: number
}

export interface DeliveryFeeSettingEntry {
  key: string
  value: string
}

export interface ExportRequest {
  type: 'USERS' | 'ORDERS' | 'RESTAURANTS' | 'COURIERS' | 'ANALYTICS'
  format: 'CSV' | 'XLSX' | 'JSON'
  dateFrom?: string
  dateTo?: string
  filters?: Record<string, string>
}

export interface ExportJob {
  id: string
  type: string
  format: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  progress: number
  fileUrl?: string
  createdAt: string
  completedAt?: string
  error?: string
  recordCount?: number
}

export const settingsApi = {
  getSettings: async () => {
    const response = await apiClient.get<PlatformSettings>('/settings')
    return response.data
  },

  updateSettings: async (settings: Partial<PlatformSettings>) => {
    const response = await apiClient.put<PlatformSettings>('/settings', settings)
    return response.data
  },

  exportData: async (request: ExportRequest) => {
    const response = await apiClient.post<ExportJob>('/settings/export', request)
    return response.data
  },

  getExportJobs: async () => {
    const response = await apiClient.get<ExportJob[]>('/settings/export/jobs')
    return response.data
  },

  downloadExport: async (jobId: string) => {
    const response = await apiClient.get(`/settings/export/${jobId}/download`, {
      responseType: 'blob',
    })
    return response.data
  },

  // ============ Delivery Fee Settings ============

  getDeliveryFeeSettings: async (): Promise<DeliveryFeeSettings> => {
    const response = await apiClient.get<DeliveryFeeSettings>('/admin/delivery-fee-settings')
    return response.data
  },

  getDeliveryFeeSettingsList: async (): Promise<DeliveryFeeSettingEntry[]> => {
    const response = await apiClient.get<DeliveryFeeSettingEntry[]>('/admin/delivery-fee-settings/all')
    return response.data
  },

  updateDeliveryFeeSettings: async (settings: Partial<DeliveryFeeSettings>): Promise<DeliveryFeeSettings> => {
    const response = await apiClient.put<DeliveryFeeSettings>('/admin/delivery-fee-settings', settings)
    return response.data
  },

  updateDeliveryFeeSetting: async (key: string, value: string | number): Promise<void> => {
    await apiClient.patch(`/admin/delivery-fee-settings/${key}`, null, {
      params: { value },
    })
  },
}
