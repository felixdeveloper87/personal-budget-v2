import type { AppLocale } from './types'

export function formatGbp(
  value: number,
  locale: AppLocale,
  options: Intl.NumberFormatOptions = {},
) {
  return new Intl.NumberFormat(locale, {
    ...options,
    style: 'currency',
    currency: 'GBP',
  }).format(value)
}

export function formatLocalNumber(
  value: number,
  locale: AppLocale,
  options?: Intl.NumberFormatOptions,
) {
  return new Intl.NumberFormat(locale, options).format(value)
}

export function formatLocalDate(
  value: Date | number,
  locale: AppLocale,
  options?: Intl.DateTimeFormatOptions,
) {
  const date = value instanceof Date ? value : new Date(value)
  return new Intl.DateTimeFormat(locale, options).format(date)
}
