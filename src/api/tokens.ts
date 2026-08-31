import axios from 'axios'

/**
 * Canonical token store + single-flight refresh.
 *
 * Tokens live in localStorage (NOT sessionStorage/memory) so they are shared
 * across tabs; the auth store listens for the `storage` event to stay in sync.
 * This module is the single source of truth that both the axios interceptor
 * and the WebSocket client read from.
 */

const API_URL = import.meta.env.VITE_API_URL || '/api/v1'

const ACCESS_KEY = 'accessToken'
const REFRESH_KEY = 'refreshToken'
const EXPIRY_KEY = 'accessTokenExpiresAt' // epoch milliseconds

export interface StoredTokens {
  accessToken: string
  refreshToken?: string
  /** Lifetime of the access token in SECONDS (not ms) — as the backend sends it. */
  expiresIn?: number
}

export function getAccessToken(): string | null {
  try {
    return localStorage.getItem(ACCESS_KEY)
  } catch {
    return null
  }
}

export function getRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_KEY)
  } catch {
    return null
  }
}

export function getAccessTokenExpiresAt(): number | null {
  try {
    const v = localStorage.getItem(EXPIRY_KEY)
    return v ? Number(v) : null
  } catch {
    return null
  }
}

export function setTokens({ accessToken, refreshToken, expiresIn }: StoredTokens): void {
  try {
    localStorage.setItem(ACCESS_KEY, accessToken)
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken)
    // expiresIn is SECONDS -> convert to an absolute epoch-ms deadline.
    if (typeof expiresIn === 'number' && expiresIn > 0) {
      localStorage.setItem(EXPIRY_KEY, String(Date.now() + expiresIn * 1000))
    }
  } catch {
    /* private mode / quota — ignore, we fall back to 401-driven refresh */
  }
}

export function clearTokens(): void {
  try {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
    localStorage.removeItem(EXPIRY_KEY)
  } catch {
    /* ignore */
  }
}

/**
 * Whether the stored access token is expired (or within `skewMs` of expiring).
 * If we don't know the expiry, return false and let a real 401 drive the refresh.
 */
export function isAccessTokenExpired(skewMs = 30_000): boolean {
  const expiresAt = getAccessTokenExpiresAt()
  if (!expiresAt) return false
  return Date.now() >= expiresAt - skewMs
}

// A bare axios client with NO interceptors, so a refresh call can never
// recurse back into the refresh logic.
const bareClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

let inFlight: Promise<string> | null = null

async function doRefresh(): Promise<string> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) throw new Error('No refresh token')

  // No Authorization header — the refresh token in the body IS the credential.
  // A failed refresh returns 400 (not 401); axios throws on any non-2xx, which
  // we treat as terminal (the caller clears tokens and redirects to login).
  const res = await bareClient.post('/auth/refresh', { refreshToken })
  const data = res.data?.data
  if (!data?.accessToken) throw new Error('Malformed refresh response')

  setTokens({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken ?? refreshToken,
    expiresIn: data.expiresIn,
  })
  return data.accessToken as string
}

/**
 * Single-flight refresh: many parallel 401s (a dashboard fires a dozen requests
 * on load) share ONE in-flight refresh instead of racing over which token wins.
 */
export function refreshAccessToken(): Promise<string> {
  return (inFlight ??= doRefresh().finally(() => {
    inFlight = null
  }))
}

/** Return a usable access token, refreshing first if it is missing/expired. */
export async function getValidAccessToken(): Promise<string> {
  const token = getAccessToken()
  if (token && !isAccessTokenExpired()) return token
  return refreshAccessToken()
}

/**
 * Whether a refresh failure is *terminal* (the session is really over) vs
 * *transient* (a network blip we should not punish the user for).
 *
 * Per the backend's shared contract, a dead/revoked refresh token comes back as
 * a non-200 *response* (typically 400). Any server response means "your token
 * is no good" -> log out. A network error has NO response -> the server was
 * simply unreachable; keep the session and let the caller retry.
 */
export function isTerminalRefreshError(err: unknown): boolean {
  if (err instanceof Error && (err.message === 'No refresh token' || err.message === 'Malformed refresh response')) {
    return true
  }
  if (axios.isAxiosError(err)) {
    // A response present (any status the server returned) = terminal.
    // No response (network/timeout) = transient.
    return !!err.response
  }
  return false
}

/**
 * Terminal session end: the refresh token is dead/revoked. Clear everything and
 * send the user to login exactly once (guard against redirect loops). The full
 * navigation reloads the app, so in-memory auth state resets cleanly.
 */
export function handleSessionExpired(): void {
  clearTokens()
  if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
    window.location.assign('/login')
  }
}
