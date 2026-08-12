import { resources } from './resources'
import type { AppLocale, TranslationValues } from './types'

export const DEFAULT_LOCALE: AppLocale = 'en-GB'
export const LOCALE_STORAGE_KEY = 'pb-locale'

export const isAppLocale = (value: string | null): value is AppLocale =>
  value === 'en-GB' || value === 'pt-BR'

export const getCurrentLocale = (): AppLocale => {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
    return isAppLocale(stored) ? stored : DEFAULT_LOCALE
  } catch {
    return DEFAULT_LOCALE
  }
}

export const interpolate = (message: string, values?: TranslationValues) => {
  if (!values) return message
  return message.replace(/{{\s*([\w.-]+)\s*}}/g, (match, key: string) =>
    Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : match,
  )
}

export function translateNow(
  key: string,
  values?: TranslationValues,
  fallback?: string,
) {
  const locale = getCurrentLocale()
  const message = resources[locale][key] ?? resources[DEFAULT_LOCALE][key] ?? fallback ?? key
  return interpolate(message, values)
}
