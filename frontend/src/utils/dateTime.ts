/**
 * Formats a dateTime string from backend UTC (e.g. "2025-10-08T20:26:46")
 *    to the user's local timezone (e.g. "21:26" in London)
 */
export function formatTransactionDateTime(dateTimeString: string) {
    // Force interpret as UTC, then convert automatically to local time
    const date = new Date(dateTimeString + 'Z')
  
    return {
      date: date.toLocaleDateString('en-GB', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      time: date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
      shortDate: date.toLocaleDateString('en-GB', {
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

  /**
   * Formats date string to Brazilian format (DD/MM/YYYY)
   * Handles both YYYY-MM-DD backend format and other date formats
   */
  export const formatDateBR = (dateString: string): string => {
    try {
      // Handle YYYY-MM-DD format from backend
      if (dateString && dateString.includes('-')) {
        const date = new Date(dateString + 'T00:00:00')
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('pt-BR')
        }
      }
      
      // Fallback for other formats
      const date = new Date(dateString)
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('pt-BR')
      }
      
      return 'Invalid Date'
    } catch (error) {
      return 'Invalid Date'
    }
  }
  