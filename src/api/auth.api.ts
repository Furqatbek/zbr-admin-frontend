import api from './axios'
import type { ApiResponse, AuthTokens, LoginRequest, LoginResponse } from '@/types'

export const authApi = {
  login: async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', credentials)
    return response.data
  },

  refresh: async (refreshToken: string): Promise<ApiResponse<AuthTokens>> => {
    const response = await api.post<ApiResponse<AuthTokens>>('/auth/refresh', { refreshToken })
    return response.data
  },

  logout: async (): Promise<void> => {
    // Clear local storage
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  },
}
