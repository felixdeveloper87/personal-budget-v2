/**
 * ✅ Formats a dateTime string from backend UTC (e.g. "2025-10-08T20:26:46")
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
  
  /** Shortcut for compact short date (e.g. “Oct 8”) */
  export const formatTransactionShortDate = (s: string) =>
    formatTransactionDateTime(s).shortDate
  