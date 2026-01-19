import api from './axios'
import type {
  ApiResponse,
  PaginatedResponse,
  Courier,
  CourierStatus,
  CourierRegistrationRequest,
  CourierUpdateRequest,
  AvailableCourier,
  CourierStatistics,
} from '@/types'

export interface CouriersQueryParams {
  page?: number
  size?: number
}

export interface AvailableCouriersParams {
  lat: number
  lng: number
  radius?: number
}

export const couriersApi = {
  // Get all couriers with pagination (Admin)
  getAll: async (params: CouriersQueryParams = {}): Promise<ApiResponse<PaginatedResponse<Courier>>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Courier>>>('/couriers', {
      params: {
        page: params.page ?? 0,
        size: params.size ?? 20,
      },
    })
    return response.data
  },

  // Get courier by ID
  getById: async (id: number): Promise<ApiResponse<Courier>> => {
    const response = await api.get<ApiResponse<Courier>>(`/couriers/${id}`)
    return response.data
  },

  // Get pending couriers awaiting approval
  getPending: async (params: CouriersQueryParams = {}): Promise<ApiResponse<PaginatedResponse<Courier>>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Courier>>>('/couriers/pending', {
      params: {
        page: params.page ?? 0,
        size: params.size ?? 20,
      },
    })
    return response.data
  },

  // Get online couriers with location (for map)
  getOnline: async (params: CouriersQueryParams = {}): Promise<ApiResponse<PaginatedResponse<Courier>>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Courier>>>('/couriers/online', {
      params: {
        page: params.page ?? 0,
        size: params.size ?? 100,
      },
    })
    return response.data
  },

  // Get couriers by status
  getByStatus: async (status: CourierStatus, params: CouriersQueryParams = {}): Promise<ApiResponse<PaginatedResponse<Courier>>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Courier>>>(`/couriers/by-status/${status}`, {
      params: {
        page: params.page ?? 0,
        size: params.size ?? 20,
      },
    })
    return response.data
  },

  // Get courier statistics for dashboard
  getStatistics: async (): Promise<ApiResponse<CourierStatistics>> => {
    const response = await api.get<ApiResponse<CourierStatistics>>('/couriers/statistics')
    return response.data
  },

  // Get my courier profile (for courier users)
  getMyProfile: async (): Promise<ApiResponse<Courier>> => {
    const response = await api.get<ApiResponse<Courier>>('/couriers/me')
    return response.data
  },

  // Register as courier
  register: async (data: CourierRegistrationRequest): Promise<ApiResponse<Courier>> => {
    const response = await api.post<ApiResponse<Courier>>('/couriers/register', data)
    return response.data
  },

  // Update courier status (self)
  updateStatus: async (status: CourierStatus): Promise<ApiResponse<Courier>> => {
    const response = await api.patch<ApiResponse<Courier>>('/couriers/me/status', null, {
      params: { status },
    })
    return response.data
  },

  // Update courier location
  updateLocation: async (lat: number, lng: number): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.post<ApiResponse<{ message: string }>>('/couriers/me/location', null, {
      params: { lat, lng },
    })
    return response.data
  },

  // Update courier profile (admin)
  update: async (courierId: number, data: CourierUpdateRequest): Promise<ApiResponse<Courier>> => {
    const response = await api.put<ApiResponse<Courier>>(`/couriers/${courierId}`, data)
    return response.data
  },

  // Find available couriers near a location (Admin)
  findAvailable: async (params: AvailableCouriersParams): Promise<ApiResponse<AvailableCourier[]>> => {
    const response = await api.get<ApiResponse<AvailableCourier[]>>('/couriers/available', {
      params: {
        lat: params.lat,
        lng: params.lng,
        ...(params.radius && { radius: params.radius }),
      },
    })
    return response.data
  },

  // Verify a courier (Admin only)
  verify: async (courierId: number): Promise<ApiResponse<Courier>> => {
    const response = await api.post<ApiResponse<Courier>>(`/couriers/${courierId}/verify`)
    return response.data
  },

  // Reject pending courier application (Admin)
  reject: async (courierId: number): Promise<ApiResponse<Courier>> => {
    const response = await api.post<ApiResponse<Courier>>(`/couriers/${courierId}/reject`)
    return response.data
  },

  // Suspend courier account (Admin)
  suspend: async (courierId: number): Promise<ApiResponse<Courier>> => {
    const response = await api.post<ApiResponse<Courier>>(`/couriers/${courierId}/suspend`)
    return response.data
  },

  // Activate/reactivate courier (Admin)
  activate: async (courierId: number): Promise<ApiResponse<Courier>> => {
    const response = await api.post<ApiResponse<Courier>>(`/couriers/${courierId}/activate`)
    return response.data
  },

  // Accept an order (Courier)
  acceptOrder: async (courierId: number, orderId: number): Promise<ApiResponse<Courier>> => {
    const response = await api.post<ApiResponse<Courier>>(
      `/couriers/${courierId}/accept/${orderId}`
    )
    return response.data
  },

  // Complete a delivery (Courier)
  completeDelivery: async (courierId: number, orderId: number): Promise<ApiResponse<Courier>> => {
    const response = await api.post<ApiResponse<Courier>>(
      `/couriers/${courierId}/complete/${orderId}`
    )
    return response.data
  },
}
