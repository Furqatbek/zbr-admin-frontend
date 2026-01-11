import api from './axios'
import type { ApiResponse, DashboardOverview, StuckOrder, PerformanceData, RevenueData } from '@/types'

export const dashboardApi = {
  getOverview: async (): Promise<ApiResponse<DashboardOverview>> => {
    const response = await api.get<ApiResponse<DashboardOverview>>('/admin/dashboard/overview')
    return response.data
  },

  getStuckOrders: async (stuckMinutes = 30): Promise<ApiResponse<StuckOrder[]>> => {
    const response = await api.get<ApiResponse<StuckOrder[]>>('/admin/dashboard/orders/stuck', {
      params: { stuckMinutes },
    })
    return response.data
  },

  getCanceledOrders: async (): Promise<ApiResponse<{ total: number; reasons: Record<string, number> }>> => {
    const response = await api.get('/admin/dashboard/orders/canceled')
    return response.data
  },

  getPeakHours: async (): Promise<ApiResponse<{ hour: number; count: number }[]>> => {
    const response = await api.get('/admin/dashboard/peak-hours')
    return response.data
  },

  getRestaurantPerformance: async (): Promise<ApiResponse<PerformanceData[]>> => {
    const response = await api.get<ApiResponse<PerformanceData[]>>('/admin/dashboard/restaurants/performance')
    return response.data
  },

  getCourierPerformance: async (): Promise<ApiResponse<PerformanceData[]>> => {
    const response = await api.get<ApiResponse<PerformanceData[]>>('/admin/dashboard/couriers/performance')
    return response.data
  },

  getRevenue: async (): Promise<ApiResponse<RevenueData[]>> => {
    const response = await api.get<ApiResponse<RevenueData[]>>('/admin/dashboard/revenue')
    return response.data
  },

  getSupportSummary: async (): Promise<ApiResponse<{ open: number; resolved: number; pending: number }>> => {
    const response = await api.get('/admin/dashboard/support/summary')
    return response.data
  },

  getSystemHealth: async (): Promise<ApiResponse<{ status: string; services: Record<string, string> }>> => {
    const response = await api.get('/admin/dashboard/system/health')
    return response.data
  },
}
