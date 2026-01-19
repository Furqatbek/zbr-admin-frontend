import api from './axios'
import type { ApiResponse, PaginatedResponse, Courier, CourierStatus } from '@/types'

export interface CouriersQueryParams {
  page?: number
  size?: number
  status?: CourierStatus
  verified?: boolean
  search?: string
}

export interface NearbyQueryParams {
  lat: number
  lng: number
  radiusKm?: number
}

export const couriersApi = {
  getCouriers: async (params: CouriersQueryParams = {}): Promise<ApiResponse<PaginatedResponse<Courier>>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Courier>>>('/couriers', { params })
    return response.data
  },

  getCourierById: async (id: number): Promise<ApiResponse<Courier>> => {
    const response = await api.get<ApiResponse<Courier>>(`/couriers/${id}`)
    return response.data
  },

  verifyCourier: async (id: number): Promise<ApiResponse<Courier>> => {
    const response = await api.post<ApiResponse<Courier>>(`/couriers/${id}/verify`)
    return response.data
  },

  getNearby: async (params: NearbyQueryParams): Promise<ApiResponse<Courier[]>> => {
    const response = await api.get<ApiResponse<Courier[]>>('/couriers/nearby', { params })
    return response.data
  },
}
