import { getCurrentLocale, translateNow } from '../i18n'

/**
 * Formats a Java LocalDateTime string from the backend without applying UTC conversion.
 */
export function formatTransactionDateTime(dateTimeString: string) {
    const date = new Date(dateTimeString)
    const locale = getCurrentLocale()
  
    return {
      date: date.toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      time: date.toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
      shortDate: date.toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
      }),
    }
  }
  
  /** Shortcut for only date (e.g. “Oct 8, 2025”) */
  export const formatTransactionDate = (s: string) =>
    formatTransactionDateTime(s).date
  
  /** Shortcut for only time (e.g. “09:26 PM”) */
  export const formatTransactionTime = (s: string) =>
    formatTransactionDateTime(s).time
  
  /** Shortcut for compact short date (e.g. "Oct 8") */
  export const formatTransactionShortDate = (s: string) =>
    formatTransactionDateTime(s).shortDate

  export function toLocalIsoDateTimeFromYMD(ymd: string, base = new Date()): string {
    const [year, month, day] = ymd.split('-').map(Number)
    const d = new Date(
      year || base.getFullYear(),
      (month || 1) - 1,
      day || 1,
      base.getHours(),
      base.getMinutes(),
      base.getSeconds(),
      0
    )
    const p = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
  }

  export function parseLocalDateOnly(ymd?: string): Date | null {
    if (!ymd) return null
    const [year, month, day] = ymd.split('-').map(Number)
    if (!year || !month || !day) return null
    return new Date(year, month - 1, day)
  }

  /**
   * Formats a backend date using the currently selected display locale.
   * The legacy name is retained because it is part of the existing utility API.
   */
  export const formatDateBR = (dateString: string): string => {
    const locale = getCurrentLocale()
    try {
      // Handle YYYY-MM-DD format from backend
      if (dateString && dateString.includes('-')) {
        const date = new Date(dateString + 'T00:00:00')
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString(locale)
        }
      }
      
      // Fallback for other formats
      const date = new Date(dateString)
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString(locale)
      }
      
      return translateNow('date.invalid', undefined, 'Invalid date')
    } catch (error) {
      return translateNow('date.invalid', undefined, 'Invalid date')
    }
  }
  
