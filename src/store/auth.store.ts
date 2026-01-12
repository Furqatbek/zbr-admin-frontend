import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '@/api/auth.api'
import type { LoginRequest, UserRole } from '@/types'

// Simplified user type for auth store (matches login response)
interface AuthUser {
  id: number
  email: string
  fullName: string
  roles: UserRole[]
}

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => void
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
          const { accessToken, refreshToken, userId, email, fullName, roles } = response.data

          // Store tokens
          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', refreshToken)

          // Create user from login response
          const user: AuthUser = {
            id: userId,
            email,
            fullName,
            roles: roles || [],
          }

          set({
            accessToken,
            refreshToken,
            user,
            isAuthenticated: true,
            isLoading: false,
          })
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

      clearError: () => set({ error: null }),

      hasRole: (role: UserRole) => {
        const { user } = get()
        return user?.roles?.includes(role) ?? false
      },

      hasAnyRole: (roles: UserRole[]) => {
        const { user } = get()
        return roles.some((role) => user?.roles?.includes(role)) ?? false
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
