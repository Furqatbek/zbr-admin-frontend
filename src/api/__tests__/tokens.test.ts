import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock the bare axios client that tokens.ts creates for the refresh call.
const { postMock } = vi.hoisted(() => ({ postMock: vi.fn() }))
vi.mock('axios', () => ({
  default: { create: () => ({ post: postMock }) },
}))

import {
  setTokens,
  clearTokens,
  getAccessToken,
  getAccessTokenExpiresAt,
  isAccessTokenExpired,
  refreshAccessToken,
  getValidAccessToken,
} from '../tokens'

const refreshResponse = (accessToken: string) => ({
  data: { success: true, data: { accessToken, refreshToken: 'new-refresh', expiresIn: 3600 } },
})

describe('tokens', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('expiry (seconds -> ms)', () => {
    it('stores expiry as an absolute epoch-ms deadline from a seconds lifetime', () => {
      const before = Date.now()
      setTokens({ accessToken: 'a', refreshToken: 'r', expiresIn: 3600 })
      const expiresAt = getAccessTokenExpiresAt()!
      // 3600s -> ~3_600_000ms in the future, not 3600ms.
      expect(expiresAt - before).toBeGreaterThanOrEqual(3_600_000 - 1000)
      expect(expiresAt - before).toBeLessThan(3_600_000 + 5000)
    })

    it('treats a token past its deadline as expired', () => {
      setTokens({ accessToken: 'a', refreshToken: 'r', expiresIn: 60 })
      expect(isAccessTokenExpired()).toBe(false)
      // Force an already-passed deadline.
      localStorage.setItem('accessTokenExpiresAt', String(Date.now() - 1000))
      expect(isAccessTokenExpired()).toBe(true)
    })
  })

  describe('single-flight refresh', () => {
    it('collapses many concurrent refreshes into ONE network call', async () => {
      setTokens({ accessToken: 'old', refreshToken: 'r', expiresIn: 1 })
      let resolve!: (v: unknown) => void
      postMock.mockReturnValue(new Promise((r) => { resolve = r }))

      // Ten callers hit refresh simultaneously (mimics a dashboard's parallel 401s).
      const calls = Promise.all(Array.from({ length: 10 }, () => refreshAccessToken()))
      resolve(refreshResponse('new-access'))
      const results = await calls

      expect(postMock).toHaveBeenCalledTimes(1)
      expect(results.every((t) => t === 'new-access')).toBe(true)
      expect(getAccessToken()).toBe('new-access')
    })

    it('allows a new refresh after the in-flight one settles', async () => {
      setTokens({ accessToken: 'old', refreshToken: 'r', expiresIn: 1 })
      postMock.mockResolvedValueOnce(refreshResponse('first'))
      expect(await refreshAccessToken()).toBe('first')

      postMock.mockResolvedValueOnce(refreshResponse('second'))
      expect(await refreshAccessToken()).toBe('second')
      expect(postMock).toHaveBeenCalledTimes(2)
    })
  })

  describe('terminal failure', () => {
    it('rejects (and does not swallow) when refresh fails, e.g. 400', async () => {
      setTokens({ accessToken: 'old', refreshToken: 'r', expiresIn: 1 })
      postMock.mockRejectedValueOnce(new Error('Request failed with status code 400'))
      await expect(refreshAccessToken()).rejects.toThrow()
    })

    it('throws when there is no refresh token', async () => {
      clearTokens()
      await expect(refreshAccessToken()).rejects.toThrow('No refresh token')
      expect(postMock).not.toHaveBeenCalled()
    })
  })

  describe('getValidAccessToken', () => {
    it('returns the current token without refreshing when it is still valid', async () => {
      setTokens({ accessToken: 'still-good', refreshToken: 'r', expiresIn: 3600 })
      expect(await getValidAccessToken()).toBe('still-good')
      expect(postMock).not.toHaveBeenCalled()
    })

    it('refreshes when the current token is expired', async () => {
      setTokens({ accessToken: 'stale', refreshToken: 'r', expiresIn: 3600 })
      localStorage.setItem('accessTokenExpiresAt', String(Date.now() - 1000))
      postMock.mockResolvedValueOnce(refreshResponse('fresh'))
      expect(await getValidAccessToken()).toBe('fresh')
      expect(postMock).toHaveBeenCalledTimes(1)
    })
  })
})
