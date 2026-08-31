import api from './axios'
import type { ApiResponse, AuthTokens, LoginRequest, LoginResponse, RegisterRequest, User } from '@/types'

export const authApi = {
  login: async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', credentials)
    return response.data
  },

  // Admin-side user creation. The admin's own session is untouched — we only
  // read the envelope's success/message and refetch the users list; any tokens
  // in the response are intentionally ignored.
  register: async (data: RegisterRequest): Promise<ApiResponse<User>> => {
    const response = await api.post<ApiResponse<User>>('/auth/register', data)
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
