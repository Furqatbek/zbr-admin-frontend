import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useThemeStore } from '../theme.store'

describe('useThemeStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useThemeStore.setState({ theme: 'system' })
    // Clear localStorage
    localStorage.clear()
    // Reset document classes
    document.documentElement.classList.remove('light', 'dark')
  })

  it('has initial theme as system', () => {
    const { theme } = useThemeStore.getState()
    expect(theme).toBe('system')
  })

  it('sets theme to light', () => {
    const { setTheme } = useThemeStore.getState()
    setTheme('light')

    expect(useThemeStore.getState().theme).toBe('light')
    expect(document.documentElement.classList.contains('light')).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('sets theme to dark', () => {
    const { setTheme } = useThemeStore.getState()
    setTheme('dark')

    expect(useThemeStore.getState().theme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.classList.contains('light')).toBe(false)
  })

  it('sets theme to system and applies based on prefers-color-scheme', () => {
    // Mock matchMedia to return light preference
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)' ? false : true,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    const { setTheme } = useThemeStore.getState()
    setTheme('system')

    expect(useThemeStore.getState().theme).toBe('system')
    expect(document.documentElement.classList.contains('light')).toBe(true)
  })

  it('removes previous theme class when changing theme', () => {
    const { setTheme } = useThemeStore.getState()

    // Set to light first
    setTheme('light')
    expect(document.documentElement.classList.contains('light')).toBe(true)

    // Change to dark
    setTheme('dark')
    expect(document.documentElement.classList.contains('light')).toBe(false)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })
})
