import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '@/api/auth.api'
import type { User, LoginRequest, UserRole } from '@/types'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => void
  fetchUser: () => Promise<void>
  clearError: () => void
  hasRole: (role: UserRole) => boolean
  hasAnyRole: (roles: UserRole[]) => boolean
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authApi.login(credentials)
          const { accessToken, refreshToken } = response.data

          // Store tokens
          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', refreshToken)

          set({
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          })

          // Fetch user data
          await get().fetchUser()
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Ошибка авторизации'
          set({ error: message, isLoading: false })
          throw error
        }
      },

      logout: () => {
        authApi.logout()
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        })
      },

      fetchUser: async () => {
        try {
          const response = await authApi.getMe()
          set({ user: response.data })
        } catch (error) {
          // If fetching user fails, logout
          get().logout()
          throw error
        }
      },

      clearError: () => set({ error: null }),

      hasRole: (role: UserRole) => {
        const { user } = get()
        return user?.roles.includes(role) ?? false
      },

      hasAnyRole: (roles: UserRole[]) => {
        const { user } = get()
        return roles.some((role) => user?.roles.includes(role)) ?? false
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
