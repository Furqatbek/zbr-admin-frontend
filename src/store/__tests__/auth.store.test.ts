import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuthStore } from '../auth.store'
import type { LoginResponse } from '@/types'

// Mock the auth API
vi.mock('@/api/auth.api', () => ({
  authApi: {
    login: vi.fn(),
    logout: vi.fn(),
  },
}))

import { authApi } from '@/api/auth.api'

const mockLoginResponse: LoginResponse = {
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
  tokenType: 'Bearer',
  expiresIn: 900,
  userId: 1,
  email: 'admin@test.com',
  fullName: 'System Admin',
  roles: ['ADMIN'],
}

const mockUser = {
  id: 1,
  email: 'admin@test.com',
  fullName: 'System Admin',
  roles: ['ADMIN' as const],
}

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset store state
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    })
    // Clear localStorage
    localStorage.clear()
    // Reset mocks
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('has correct initial values', () => {
      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.accessToken).toBeNull()
      expect(state.refreshToken).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })
  })

  describe('login', () => {
    it('sets loading state during login', async () => {
      vi.mocked(authApi.login).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  success: true,
                  data: mockLoginResponse,
                }),
              100
            )
          )
      )

      const loginPromise = useAuthStore.getState().login({
        emailOrPhone: 'admin@test.com',
        password: 'password',
      })

      expect(useAuthStore.getState().isLoading).toBe(true)
      await loginPromise
      expect(useAuthStore.getState().isLoading).toBe(false)
    })

    it('stores tokens and user after successful login', async () => {
      vi.mocked(authApi.login).mockResolvedValue({
        success: true,
        data: mockLoginResponse,
      })

      await useAuthStore.getState().login({
        emailOrPhone: 'admin@test.com',
        password: 'password',
      })

      const state = useAuthStore.getState()
      expect(state.accessToken).toBe('access-token')
      expect(state.refreshToken).toBe('refresh-token')
      expect(state.isAuthenticated).toBe(true)
      expect(state.user).toEqual(mockUser)
      expect(localStorage.getItem('accessToken')).toBe('access-token')
      expect(localStorage.getItem('refreshToken')).toBe('refresh-token')
    })

    it('extracts user from login response', async () => {
      vi.mocked(authApi.login).mockResolvedValue({
        success: true,
        data: mockLoginResponse,
      })

      await useAuthStore.getState().login({
        emailOrPhone: 'admin@test.com',
        password: 'password',
      })

      const user = useAuthStore.getState().user
      expect(user?.id).toBe(1)
      expect(user?.email).toBe('admin@test.com')
      expect(user?.fullName).toBe('System Admin')
      expect(user?.roles).toEqual(['ADMIN'])
    })

    it('sets error on login failure', async () => {
      vi.mocked(authApi.login).mockRejectedValue(new Error('Invalid credentials'))

      await expect(
        useAuthStore.getState().login({
          emailOrPhone: 'admin@test.com',
          password: 'wrong',
        })
      ).rejects.toThrow()

      const state = useAuthStore.getState()
      expect(state.error).toBe('Invalid credentials')
      expect(state.isAuthenticated).toBe(false)
    })
  })

  describe('logout', () => {
    it('clears all auth state', () => {
      // Set initial authenticated state
      useAuthStore.setState({
        user: mockUser,
        accessToken: 'token',
        refreshToken: 'refresh',
        isAuthenticated: true,
      })

      useAuthStore.getState().logout()

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.accessToken).toBeNull()
      expect(state.refreshToken).toBeNull()
      expect(state.isAuthenticated).toBe(false)
    })

    it('calls authApi.logout', () => {
      useAuthStore.getState().logout()
      expect(authApi.logout).toHaveBeenCalled()
    })
  })

  describe('clearError', () => {
    it('clears error state', () => {
      useAuthStore.setState({ error: 'Some error' })

      useAuthStore.getState().clearError()

      expect(useAuthStore.getState().error).toBeNull()
    })
  })

  describe('hasRole', () => {
    it('returns true if user has the role', () => {
      useAuthStore.setState({ user: mockUser })

      expect(useAuthStore.getState().hasRole('ADMIN')).toBe(true)
    })

    it('returns false if user does not have the role', () => {
      useAuthStore.setState({ user: mockUser })

      expect(useAuthStore.getState().hasRole('COURIER')).toBe(false)
    })

    it('returns false if user is null', () => {
      useAuthStore.setState({ user: null })

      expect(useAuthStore.getState().hasRole('ADMIN')).toBe(false)
    })
  })

  describe('hasAnyRole', () => {
    it('returns true if user has any of the roles', () => {
      useAuthStore.setState({ user: mockUser })

      expect(useAuthStore.getState().hasAnyRole(['ADMIN', 'COURIER'])).toBe(true)
    })

    it('returns false if user has none of the roles', () => {
      useAuthStore.setState({ user: mockUser })

      expect(useAuthStore.getState().hasAnyRole(['COURIER', 'RESTAURANT_OWNER'])).toBe(false)
    })

    it('returns false if user is null', () => {
      useAuthStore.setState({ user: null })

      expect(useAuthStore.getState().hasAnyRole(['ADMIN'])).toBe(false)
    })
  })
})
