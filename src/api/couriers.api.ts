import api from './axios'
import type {
  ApiResponse,
  PaginatedResponse,
  Courier,
  CourierStatus,
  CourierRegistrationRequest,
  AvailableCourier,
} from '@/types'

// Note: Backend API only supports page and size for courier listing
// Status and verification filtering must be done client-side
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
  // Note: No filtering supported by backend - filter client-side if needed
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

  // Update courier status
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
