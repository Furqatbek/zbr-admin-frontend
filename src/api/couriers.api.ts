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

/**
 * Maps raw API courier data to the Courier type.
 * The backend uses short field names (currentLat, currentLng, averageRating, verified)
 * while the frontend type uses full names (currentLatitude, currentLongitude, rating, isVerified).
 */
function mapCourier(raw: Record<string, unknown>): Courier {
  return {
    ...raw,
    currentLatitude: (raw.currentLatitude as number) ?? (raw.currentLat as number) ?? undefined,
    currentLongitude: (raw.currentLongitude as number) ?? (raw.currentLng as number) ?? undefined,
    rating: (raw.rating as number) ?? (raw.averageRating as number) ?? 0,
    isVerified: (raw.isVerified as boolean) ?? (raw.verified as boolean) ?? false,
  } as Courier
}

function mapCourierResponse(response: ApiResponse<Courier>): ApiResponse<Courier> {
  if (response.data) {
    return { ...response, data: mapCourier(response.data as unknown as Record<string, unknown>) }
  }
  return response
}

function mapCourierPageResponse(response: ApiResponse<PaginatedResponse<Courier>>): ApiResponse<PaginatedResponse<Courier>> {
  if (response.data?.content) {
    return {
      ...response,
      data: {
        ...response.data,
        content: response.data.content.map((c) => mapCourier(c as unknown as Record<string, unknown>)),
      },
    }
  }
  return response
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
    return mapCourierPageResponse(response.data)
  },

  // Get courier by ID
  getById: async (id: number): Promise<ApiResponse<Courier>> => {
    const response = await api.get<ApiResponse<Courier>>(`/couriers/${id}`)
    return mapCourierResponse(response.data)
  },

  // Get pending couriers awaiting approval
  getPending: async (params: CouriersQueryParams = {}): Promise<ApiResponse<PaginatedResponse<Courier>>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Courier>>>('/couriers/pending', {
      params: {
        page: params.page ?? 0,
        size: params.size ?? 20,
      },
    })
    return mapCourierPageResponse(response.data)
  },

  // Get online couriers with location (for map)
  getOnline: async (params: CouriersQueryParams = {}): Promise<ApiResponse<PaginatedResponse<Courier>>> => {
    const response = await api.get('/couriers/online', {
      params: {
        page: params.page ?? 0,
        size: params.size ?? 100,
      },
    })
    const raw = response.data as ApiResponse<unknown>

    // Backend may return data as a plain array or as a paginated object with content
    const payload = raw.data
    let couriers: Courier[]

    if (Array.isArray(payload)) {
      couriers = payload.map((c: unknown) => mapCourier(c as Record<string, unknown>))
    } else if (payload && typeof payload === 'object' && 'content' in payload) {
      const paged = payload as PaginatedResponse<Courier>
      couriers = paged.content.map((c) => mapCourier(c as unknown as Record<string, unknown>))
      return {
        ...raw,
        data: { ...paged, content: couriers },
      } as ApiResponse<PaginatedResponse<Courier>>
    } else {
      couriers = []
    }

    return {
      ...raw,
      data: {
        content: couriers,
        totalElements: couriers.length,
        totalPages: 1,
        page: 0,
        size: couriers.length,
        first: true,
        last: true,
        empty: couriers.length === 0,
      },
    } as ApiResponse<PaginatedResponse<Courier>>
  },

  // Get couriers by status
  getByStatus: async (status: CourierStatus, params: CouriersQueryParams = {}): Promise<ApiResponse<PaginatedResponse<Courier>>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Courier>>>(`/couriers/by-status/${status}`, {
      params: {
        page: params.page ?? 0,
        size: params.size ?? 20,
      },
    })
    return mapCourierPageResponse(response.data)
  },

  // Get courier statistics for dashboard
  getStatistics: async (): Promise<ApiResponse<CourierStatistics>> => {
    const response = await api.get<ApiResponse<CourierStatistics>>('/couriers/statistics')
    return response.data
  },

  // Get my courier profile (for courier users)
  getMyProfile: async (): Promise<ApiResponse<Courier>> => {
    const response = await api.get<ApiResponse<Courier>>('/couriers/me')
    return mapCourierResponse(response.data)
  },

  // Register as courier
  register: async (data: CourierRegistrationRequest): Promise<ApiResponse<Courier>> => {
    const response = await api.post<ApiResponse<Courier>>('/couriers/register', data)
    return mapCourierResponse(response.data)
  },

  // Update courier status (self)
  updateStatus: async (status: CourierStatus): Promise<ApiResponse<Courier>> => {
    const response = await api.patch<ApiResponse<Courier>>('/couriers/me/status', null, {
      params: { status },
    })
    return mapCourierResponse(response.data)
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
    return mapCourierResponse(response.data)
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
    return mapCourierResponse(response.data)
  },

  // Reject pending courier application (Admin)
  reject: async (courierId: number): Promise<ApiResponse<Courier>> => {
    const response = await api.post<ApiResponse<Courier>>(`/couriers/${courierId}/reject`)
    return mapCourierResponse(response.data)
  },

  // Suspend courier account (Admin)
  suspend: async (courierId: number): Promise<ApiResponse<Courier>> => {
    const response = await api.post<ApiResponse<Courier>>(`/couriers/${courierId}/suspend`)
    return mapCourierResponse(response.data)
  },

  // Activate/reactivate courier (Admin)
  activate: async (courierId: number): Promise<ApiResponse<Courier>> => {
    const response = await api.post<ApiResponse<Courier>>(`/couriers/${courierId}/activate`)
    return mapCourierResponse(response.data)
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
