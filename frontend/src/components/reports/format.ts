// Presentation-only formatting helpers for the report views.
// No business logic — all numbers come pre-computed from the backend.

const currencyFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
})

const numberFormatter = new Intl.NumberFormat('en-GB')

export function formatCurrency(value: number): string {
  return currencyFormatter.format(Number(value) || 0)
}

export function formatNumber(value: number): string {
  return numberFormatter.format(Number(value) || 0)
}

/** Pluralise a noun based on a count: 1 record / 2 records. */
export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${formatNumber(count)} ${count === 1 ? singular : plural}`
}

/** Format a yyyy-MM-dd date string as "01 Jun 2026". */
export function formatDate(value?: string | null): string {
  if (!value) return '-'
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/** Format an ISO date-time string as "01 Jun 2026, 14:30". */
export function formatDateTime(value?: string | null): string {
  if (!value) return '-'
  return new Date(value).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
