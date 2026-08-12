import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { resources } from './resources'
import { formatGbp, formatLocalDate, formatLocalNumber } from './format'
import type { AppLocale, TranslationValues } from './types'
import {
  DEFAULT_LOCALE,
  getCurrentLocale,
  interpolate,
  isAppLocale,
  LOCALE_STORAGE_KEY,
} from './runtime'

const readStoredLocale = (): AppLocale => {
  try {
    return getCurrentLocale()
  } catch {
    return DEFAULT_LOCALE
  }
}

interface I18nContextValue {
  locale: AppLocale
  setLocale: (locale: AppLocale) => void
  toggleLocale: () => void
  t: (key: string, values?: TranslationValues, fallback?: string) => string
  formatCurrency: (value: number, options?: Intl.NumberFormatOptions) => string
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string
  formatDate: (value: Date | number | string, options?: Intl.DateTimeFormatOptions) => string
  categoryLabel: (category: string) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>(readStoredLocale)

  const setLocale = useCallback((nextLocale: AppLocale) => {
    setLocaleState(nextLocale)
    try { localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale) } catch { /* storage is optional */ }
  }, [])

  const toggleLocale = useCallback(() => {
    setLocaleState((current) => {
      const nextLocale: AppLocale = current === 'en-GB' ? 'pt-BR' : 'en-GB'
      try { localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale) } catch { /* storage is optional */ }
      return nextLocale
    })
  }, [])

  useLayoutEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = 'ltr'
    document.title = resources[locale]['app.meta.title']
    document
      .querySelector<HTMLMetaElement>('meta[name="description"]')
      ?.setAttribute('content', resources[locale]['app.meta.description'])
    document
      .querySelector<HTMLMetaElement>('meta[property="og:title"]')
      ?.setAttribute('content', resources[locale]['app.meta.title'])
    document
      .querySelector<HTMLMetaElement>('meta[property="og:description"]')
      ?.setAttribute('content', resources[locale]['app.meta.description'])
  }, [locale])

  useEffect(() => {
    const syncLocale = (event: StorageEvent) => {
      if (event.key === LOCALE_STORAGE_KEY && isAppLocale(event.newValue)) {
        setLocaleState(event.newValue)
      }
    }
    window.addEventListener('storage', syncLocale)
    return () => window.removeEventListener('storage', syncLocale)
  }, [])

  const t = useCallback(
    (key: string, values?: TranslationValues, fallback?: string) => {
      const message = resources[locale][key] ?? resources[DEFAULT_LOCALE][key] ?? fallback ?? key
      return interpolate(message, values)
    },
    [locale],
  )

  const value = useMemo<I18nContextValue>(() => ({
    locale,
    setLocale,
    toggleLocale,
    t,
    formatCurrency: (amount, options) => formatGbp(amount, locale, options),
    formatNumber: (number, options) => formatLocalNumber(number, locale, options),
    formatDate: (input, options) => {
      const normalized = typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input)
        ? `${input}T00:00:00`
        : input
      const date = normalized instanceof Date ? normalized : new Date(normalized)
      return formatLocalDate(date, locale, options)
    },
    categoryLabel: (category) => t(`category.${category}`, undefined, category),
  }), [locale, setLocale, t, toggleLocale])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) throw new Error('useI18n must be used within I18nProvider')
  return context
}

export { DEFAULT_LOCALE, LOCALE_STORAGE_KEY }
