import type { PeriodType, Transaction } from '../../../../types'
import {
  getTransactionDate,
  type TransactionDateBasis,
} from '../../../../utils/transactionDates'
import type { AppLocale } from '../../../../i18n'

/**
 * A single bar slot in a period-bucket chart.
 *
 * `key`   — stable React key (unique per slot).
 * `label` — short tick label rendered under the bar (e.g. "M", "12p", "5", "J").
 *           For dense periods (month) this can be empty for hidden ticks.
 * `value` — aggregated transaction amount for the slot.
 * `tooltip` — full label shown in the tooltip ("Mon", "Apr 12", "January").
 */
export interface PeriodBucket {
  key: string
  label: string
  tooltip: string
  value: number
  income: number
  expense: number
  transactions: Transaction[]
}

export type PeriodFilter = 'INCOME' | 'EXPENSE' | 'ALL'

const DAY_BLOCKS: ReadonlyArray<{ start: number; end: number }> = [
  { start: 0, end: 4 },
  { start: 4, end: 8 },
  { start: 8, end: 12 },
  { start: 12, end: 16 },
  { start: 16, end: 20 },
  { start: 20, end: 24 },
]

const formatHour = (hour: number, locale: AppLocale): string =>
  new Intl.DateTimeFormat(locale, { hour: 'numeric' }).format(new Date(2024, 0, 1, hour))

function applyFilter(transactions: Transaction[], filter: PeriodFilter): Transaction[] {
  if (filter === 'ALL') return transactions
  return transactions.filter((t) => t.type === filter)
}

function addTransactionToBucket(bucket: PeriodBucket, transaction: Transaction): void {
  bucket.value += transaction.amount
  bucket.transactions.push(transaction)

  if (transaction.type === 'INCOME') {
    bucket.income += transaction.amount
  } else {
    bucket.expense += transaction.amount
  }
}

function bucketByHourBlocks(
  txs: Transaction[],
  selectedDate: Date,
  dateBasis: TransactionDateBasis,
  locale: AppLocale,
): PeriodBucket[] {
  const buckets: PeriodBucket[] = DAY_BLOCKS.map((b, i) => ({
    key: `h${i}`,
    label: formatHour(b.start, locale),
    tooltip: `${formatHour(b.start, locale)} – ${formatHour(b.end, locale)}`,
    value: 0,
    income: 0,
    expense: 0,
    transactions: [],
  }))
  const y = selectedDate.getFullYear()
  const m = selectedDate.getMonth()
  const d = selectedDate.getDate()

  for (const tx of txs) {
    const txDate = getTransactionDate(tx, dateBasis)
    if (
      txDate.getFullYear() !== y ||
      txDate.getMonth() !== m ||
      txDate.getDate() !== d
    ) {
      continue
    }
    const hour = txDate.getHours()
    const idx = DAY_BLOCKS.findIndex((b) => hour >= b.start && hour < b.end)
    if (idx >= 0) addTransactionToBucket(buckets[idx], tx)
  }
  return buckets
}

function bucketByDayOfWeek(
  txs: Transaction[],
  selectedDate: Date,
  dateBasis: TransactionDateBasis,
  locale: AppLocale,
): PeriodBucket[] {
  const buckets: PeriodBucket[] = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(2024, 0, 1 + i)
    return {
    key: `d${i}`,
    label: new Intl.DateTimeFormat(locale, { weekday: 'narrow' }).format(date),
    tooltip: new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date),
    value: 0,
    income: 0,
    expense: 0,
    transactions: [],
    }
  })

  // Monday-first week: shift selectedDate to start of its ISO week.
  const start = new Date(selectedDate)
  start.setHours(0, 0, 0, 0)
  const dow = start.getDay()
  const shift = dow === 0 ? -6 : 1 - dow
  start.setDate(start.getDate() + shift)

  const end = new Date(start)
  end.setDate(start.getDate() + 7)

  for (const tx of txs) {
    const txDate = getTransactionDate(tx, dateBasis)
    if (txDate < start || txDate >= end) continue
    const dayOfWeek = txDate.getDay()
    const idx = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    addTransactionToBucket(buckets[idx], tx)
  }
  return buckets
}

function bucketByDayOfMonth(
  txs: Transaction[],
  selectedDate: Date,
  dateBasis: TransactionDateBasis,
  locale: AppLocale,
): PeriodBucket[] {
  const year = selectedDate.getFullYear()
  const month = selectedDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  // Reduce label clutter on small screens: only show every 5th day plus the
  // first and last. The other ticks are still rendered (so the chart aligns
  // perfectly with the underlying data) but with empty label strings.
  const buckets: PeriodBucket[] = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1
    const showLabel = day === 1 || day === daysInMonth || day % 5 === 0
    return {
      key: `m${day}`,
      label: showLabel ? String(day) : '',
      tooltip: new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long' }).format(new Date(year, month, day)),
      value: 0,
      income: 0,
      expense: 0,
      transactions: [],
    }
  })

  for (const tx of txs) {
    const txDate = getTransactionDate(tx, dateBasis)
    if (txDate.getFullYear() !== year || txDate.getMonth() !== month) continue
    const idx = txDate.getDate() - 1
    if (idx >= 0 && idx < daysInMonth) addTransactionToBucket(buckets[idx], tx)
  }
  return buckets
}

function bucketByMonthOfYear(
  txs: Transaction[],
  selectedDate: Date,
  dateBasis: TransactionDateBasis,
  locale: AppLocale,
): PeriodBucket[] {
  const year = selectedDate.getFullYear()
  const buckets: PeriodBucket[] = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(year, i, 1)
    return {
    key: `mo${i}`,
    label: new Intl.DateTimeFormat(locale, { month: 'narrow' }).format(date),
    tooltip: new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(date),
    value: 0,
    income: 0,
    expense: 0,
    transactions: [],
    }
  })
  for (const tx of txs) {
    const txDate = getTransactionDate(tx, dateBasis)
    if (txDate.getFullYear() !== year) continue
    addTransactionToBucket(buckets[txDate.getMonth()], tx)
  }
  return buckets
}

/**
 * Aggregate transactions into a fixed-shape series of "buckets" tailored to
 * the active period:
 *
 *  - **day**   → 6 four-hour slots (12a / 4a / 8a / 12p / 4p / 8p)
 *  - **week**  → 7 days, Monday first (M T W T F S S)
 *  - **month** → N day slots, where N is the number of days in the month;
 *                only every 5th tick is labelled to avoid crowding
 *  - **year**  → 12 months (J F M A M J J A S O N D)
 *
 * The output is always a contiguous array (never sparse) so the chart
 * preserves a consistent silhouette even when there is no data for some
 * slots — an important visual cue.
 */
export function bucketTransactionsByPeriod(
  transactions: Transaction[],
  periodType: PeriodType,
  selectedDate: Date,
  filter: PeriodFilter = 'ALL',
  dateBasis: TransactionDateBasis = 'cash-flow',
  locale: AppLocale = 'en-GB',
): PeriodBucket[] {
  const filtered = applyFilter(transactions, filter)
  switch (periodType) {
    case 'day':
      return bucketByHourBlocks(filtered, selectedDate, dateBasis, locale)
    case 'week':
      return bucketByDayOfWeek(filtered, selectedDate, dateBasis, locale)
    case 'month':
      return bucketByDayOfMonth(filtered, selectedDate, dateBasis, locale)
    case 'year':
      return bucketByMonthOfYear(filtered, selectedDate, dateBasis, locale)
    default:
      return []
  }
}

/**
 * Short, friendly title for the bar-chart card.
 * Examples: "TODAY", "THIS WEEK", "APRIL 2026", "2026".
 */
export function getPeriodHeadline(
  periodType: PeriodType,
  selectedDate: Date,
  locale: AppLocale = 'en-GB',
): string {
  const today = new Date()
  const sameDay =
    today.getFullYear() === selectedDate.getFullYear() &&
    today.getMonth() === selectedDate.getMonth() &&
    today.getDate() === selectedDate.getDate()

  switch (periodType) {
    case 'day':
      return sameDay
        ? locale === 'pt-BR' ? 'HOJE' : 'TODAY'
        : selectedDate
            .toLocaleDateString(locale, {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
            })
            .toUpperCase()
    case 'week': {
      const ref = new Date()
      const refStart = new Date(ref)
      refStart.setHours(0, 0, 0, 0)
      const dow = refStart.getDay()
      refStart.setDate(refStart.getDate() + (dow === 0 ? -6 : 1 - dow))
      const selStart = new Date(selectedDate)
      selStart.setHours(0, 0, 0, 0)
      const sDow = selStart.getDay()
      selStart.setDate(selStart.getDate() + (sDow === 0 ? -6 : 1 - sDow))
      return refStart.getTime() === selStart.getTime()
        ? locale === 'pt-BR' ? 'ESTA SEMANA' : 'THIS WEEK'
        : locale === 'pt-BR' ? 'SEMANA' : 'WEEK'
    }
    case 'month':
      return selectedDate
        .toLocaleDateString(locale, { month: 'long', year: 'numeric' })
        .toUpperCase()
    case 'year':
      return selectedDate.getFullYear().toString()
    default:
      return ''
  }
}
