import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import {
  getAccessToken,
  refreshAccessToken,
  handleSessionExpired,
  isTerminalRefreshError,
} from './tokens'

const API_URL = import.meta.env.VITE_API_URL || '/api/v1'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - attach the current access token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - silent access-token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined

    const isAuthEndpoint = originalRequest?.url?.includes('/auth/')

    // On 401 from any API call (except the auth endpoints themselves): refresh
    // once and retry the original request exactly once. refreshAccessToken() is
    // single-flight, so ten simultaneous 401s trigger only ONE /auth/refresh.
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true
      try {
        const token = await refreshAccessToken()
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`
        }
        return api(originalRequest)
      } catch (refreshError) {
        // Only end the session if the refresh was genuinely rejected by the
        // server (e.g. 400 — refresh token expired/revoked). A transient network
        // failure must NOT log the user out; just surface the original error.
        if (isTerminalRefreshError(refreshError)) {
          handleSessionExpired()
        }
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api
