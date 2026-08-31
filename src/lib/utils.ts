import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'UZS'): string {
  return new Intl.NumberFormat('uz-UZ', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('ru-RU').format(num)
}

export function formatPercent(value: number, decimals = 1): string {
  return `${(value ?? 0).toFixed(decimals)}%`
}

/**
 * Parse a timestamp coming from the backend.
 *
 * The API sends UTC ISO-8601 strings with NO timezone suffix
 * (e.g. "2026-08-31T09:42:19.821"). Left as-is, the JS runtime parses a
 * date-TIME string without an offset as LOCAL time, so every value would be off
 * by the viewer's UTC offset. We append "Z" so it is parsed as UTC. Strings that
 * already carry "Z"/an offset, date-only strings, and Date objects pass through
 * untouched.
 */
export function parseApiDate(value: string | Date): Date {
  if (value instanceof Date) return value
  const hasTime = value.includes('T')
  const hasZone = /[zZ]$/.test(value) || /[+-]\d{2}:?\d{2}$/.test(value)
  return new Date(hasTime && !hasZone ? `${value}Z` : value)
}

export function formatDate(date: string | Date | null | undefined, options?: Intl.DateTimeFormatOptions): string {
  if (!date) return '—'

  const parsedDate = parseApiDate(date)
  if (isNaN(parsedDate.getTime())) return '—'

  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    // The business day runs on Tashkent wall-clock, so render every timestamp
    // in Asia/Tashkent regardless of where the admin's browser is.
    timeZone: 'Asia/Tashkent',
    ...options,
  }
  return new Intl.DateTimeFormat('ru-RU', defaultOptions).format(parsedDate)
}

export function formatDateTime(date: string | Date | null | undefined): string {
  return formatDate(date, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
