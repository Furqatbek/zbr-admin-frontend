import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '@/api/auth.api'
import {
  setTokens,
  clearTokens,
  getAccessToken,
  getRefreshToken,
} from '@/api/tokens'
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
  /** Reconcile in-memory auth state from the canonical token store (used by the cross-tab listener). */
  syncFromTokens: () => void
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
          const { accessToken, refreshToken, expiresIn, userId, email, fullName, roles } =
            response.data

          // Persist tokens (with expiry) in the canonical store.
          setTokens({ accessToken, refreshToken, expiresIn })

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
        clearTokens()
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

      syncFromTokens: () => {
        const accessToken = getAccessToken()
        if (accessToken) {
          set({ accessToken, refreshToken: getRefreshToken(), isAuthenticated: true })
        } else {
          // Tokens cleared in another tab (logout or dead refresh) -> log out here too.
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          })
        }
      },
    }),
    {
      name: 'auth-storage',
      // Tokens live in their own localStorage keys (see tokens.ts); only persist
      // the user profile here. isAuthenticated is derived from token presence on
      // rehydrate so it can never disagree with whether a token actually exists.
      partialize: (state) => ({ user: state.user }),
      merge: (persisted, current) => {
        const accessToken = getAccessToken()
        return {
          ...current,
          ...(persisted as Partial<AuthState>),
          accessToken,
          refreshToken: getRefreshToken(),
          isAuthenticated: !!accessToken,
        }
      },
    }
  )
)

// ---- Multi-tab sync -------------------------------------------------------
// The `storage` event fires only in OTHER tabs, so when one tab refreshes or
// clears tokens, the rest pick up the change instead of overwriting each other.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'accessToken' || e.key === null) {
      useAuthStore.getState().syncFromTokens()
    }
  })
}
