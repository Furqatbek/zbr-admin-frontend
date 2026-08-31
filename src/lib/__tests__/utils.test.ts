import { describe, it, expect } from 'vitest'
import { parseApiDate, formatDate, formatDateTime } from '../utils'

describe('parseApiDate', () => {
  it('parses a naive backend timestamp as UTC (appends Z)', () => {
    // No offset in the string -> must be read as UTC, not local.
    expect(parseApiDate('2026-08-31T09:42:19.821').toISOString()).toBe('2026-08-31T09:42:19.821Z')
  })

  it('leaves a string that already has Z untouched', () => {
    expect(parseApiDate('2026-08-31T09:42:19.821Z').toISOString()).toBe('2026-08-31T09:42:19.821Z')
  })

  it('respects an explicit offset', () => {
    // 09:42 at +05:00 is 04:42 UTC.
    expect(parseApiDate('2026-08-31T09:42:19+05:00').toISOString()).toBe('2026-08-31T04:42:19.000Z')
  })

  it('passes through a Date object', () => {
    const d = new Date('2026-08-31T00:00:00Z')
    expect(parseApiDate(d)).toBe(d)
  })
})

describe('formatDateTime (Asia/Tashkent, UTC+5)', () => {
  it('shifts a UTC timestamp into Tashkent wall-clock', () => {
    // 09:42 UTC -> 14:42 in Tashkent. Renders correctly regardless of the
    // machine timezone because formatDate pins timeZone: 'Asia/Tashkent'.
    const out = formatDateTime('2026-08-31T09:42:19.821')
    expect(out).toContain('14:42')
    expect(out).toContain('31.08.2026')
  })

  it('gives the same result whether or not the string carries Z', () => {
    expect(formatDateTime('2026-08-31T09:42:19.821')).toBe(formatDateTime('2026-08-31T09:42:19.821Z'))
  })

  it('crossing midnight UTC lands on the right Tashkent day', () => {
    // 22:00 UTC on the 31st is 03:00 on Sep 1 in Tashkent.
    const out = formatDateTime('2026-08-31T22:00:00')
    expect(out).toContain('01.09.2026')
    expect(out).toContain('03:00')
  })
})

describe('formatDate edge cases', () => {
  it('returns an em dash for empty input', () => {
    expect(formatDate(null)).toBe('—')
    expect(formatDate(undefined)).toBe('—')
    expect(formatDate('')).toBe('—')
  })

  it('formats a date-only string', () => {
    expect(formatDate('2026-08-31')).toContain('31.08.2026')
  })
})
