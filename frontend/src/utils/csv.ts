import { TransactionType } from '../types'

/**
 * CSV columns, in order. Header row uses these exact labels — the backend export
 * emits the same columns so an exported file round-trips cleanly back through the importer.
 */
export const CSV_HEADERS = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Payment Method'] as const

/** Trigger a browser download for a Blob (e.g. a CSV returned by the API). */
export function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/** Trigger a browser download for a generated CSV string. */
export function downloadCsv(filename: string, content: string): void {
  // BOM so Excel reads UTF-8 correctly.
  downloadBlob(filename, new Blob(['﻿', content], { type: 'text/csv;charset=utf-8;' }))
}

type CsvValue = string | number | boolean | null | undefined

/** Escape a single CSV cell, quoting when it contains commas, quotes or newlines. */
function csvCell(value: CsvValue): string {
  const s = value === null || value === undefined ? '' : String(value)
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/** Build a CSV string (CRLF line endings) from a header row and data rows. */
export function buildCsv(headers: string[], rows: CsvValue[][]): string {
  return [headers.map(csvCell).join(','), ...rows.map((r) => r.map(csvCell).join(','))].join('\r\n')
}

/** Parse one CSV line into cells, honoring quoted fields with embedded commas/quotes. */
function parseCsvLine(line: string): string[] {
  const cells: string[] = []
  let cur = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        cur += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      cells.push(cur)
      cur = ''
    } else {
      cur += ch
    }
  }
  cells.push(cur)
  return cells
}

export interface ParsedRow {
  /** 1-based line number in the source file (header is line 1). */
  line: number
  date: string
  type: TransactionType
  category: string
  description: string
  amount: number
  paymentMethodName: string
  accountName: string
  paymentDate?: string
  status?: 'PLANNED' | 'PENDING' | 'CLEARED' | 'RECONCILED'
  installmentPlanId?: string
  fixedPaymentId?: string
}

export interface FullDataRecord {
  line: number
  recordType: string
  values: Record<string, string>
}

export interface ParseError {
  line: number
  message: string
}

export interface CsvParseResult {
  rows: ParsedRow[]
  errors: ParseError[]
  fullDataRows: FullDataRecord[]
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

const MONTHS: Record<string, string> = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
}

/**
 * Normalize a date cell to YYYY-MM-DD, or return null if unrecognized.
 * Accepts ISO (`2026-06-25`), bank-style `25 Jun 2026` / `25 June 2026`, and
 * UK day-first `25/06/2026` or `25-06-2026`.
 */
function toIsoDate(raw: string): string | null {
  const s = raw.trim()
  if (DATE_RE.test(s)) return s

  let m = s.match(/^(\d{1,2})\s+([A-Za-z]{3,})\s+(\d{4})$/)
  if (m) {
    const mon = MONTHS[m[2].slice(0, 3).toLowerCase()]
    if (mon) return `${m[3]}-${mon}-${m[1].padStart(2, '0')}`
  }

  m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/)
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`

  return null
}

/** Normalize a header cell for matching: lowercase, trimmed, spaces collapsed. */
function normHeader(h: string): string {
  return h.trim().toLowerCase().replace(/\s+/g, ' ')
}

/**
 * Parse CSV text into transaction rows plus per-line errors. Tolerant of column
 * order via the header row; falls back to fixed order when no header is present.
 */
export function parseTransactionsCsv(text: string): CsvParseResult {
  const rows: ParsedRow[] = []
  const errors: ParseError[] = []
  const fullDataRows: FullDataRecord[] = []

  const lines = text
    .replace(/^﻿/, '')
    .split(/\r\n|\n|\r/)
    .map((l) => l)
    .filter((l, idx) => !(idx > 0 && l.trim() === '') || idx === 0)

  if (lines.length === 0 || lines.every((l) => l.trim() === '')) {
    return { rows, errors: [{ line: 0, message: 'The file is empty.' }], fullDataRows }
  }

  // Detect header row.
  const firstCells = parseCsvLine(lines[0]).map(normHeader)
  const hasHeader =
    firstCells.includes('date') && (firstCells.includes('amount') || firstCells.includes('value'))

  const colIndex: Record<string, number> = {
    'record type': -1,
    date: 0,
    type: 1,
    category: 2,
    description: 3,
    amount: 4,
    value: -1,
    'payment method': 5,
    account: 6,
    'account name': -1,
    'payment date': 7,
    status: 8,
    'installment plan id': -1,
    'fixed payment id': -1,
  }
  if (hasHeader) {
    firstCells.forEach((h, i) => {
      if (h in colIndex) colIndex[h] = i
    })
  }

  // Bank exports name the signed amount column "Value"; our own exports use "Amount".
  const useValueColumn = hasHeader && !firstCells.includes('amount') && firstCells.includes('value')

  const startAt = hasHeader ? 1 : 0

  for (let i = startAt; i < lines.length; i++) {
    const raw = lines[i]
    const lineNo = i + 1
    if (raw.trim() === '') continue

    const cells = parseCsvLine(raw)
    const get = (key: string) => (cells[colIndex[key]] ?? '').trim()
    const recordType = get('record type').toUpperCase()

    if (recordType) {
      const values: Record<string, string> = {}
      firstCells.forEach((header, index) => {
        values[header] = (cells[index] ?? '').trim()
      })
      fullDataRows.push({ line: lineNo, recordType, values })
    }

    if (recordType && recordType !== 'TRANSACTION') continue

    const dateRaw = get('date')
    let typeRaw = get('type').toUpperCase()
    const category = get('category')
    const description = get('description')
    const amountRaw = useValueColumn ? get('value') : get('amount')
    const paymentMethodName = get('payment method')
    const accountName = get('account') || get('account name')
    const paymentDateRaw = get('payment date')
    const statusRaw = get('status').toUpperCase()

    const date = toIsoDate(dateRaw)
    if (!date) {
      errors.push({ line: lineNo, message: `Invalid date "${dateRaw}" (expected YYYY-MM-DD).` })
      continue
    }
    // Strip currency symbols / thousands separators, keep digits, sign and decimal point.
    const amount = Number(amountRaw.replace(/[^0-9.-]/g, ''))
    if (!amountRaw.trim() || !Number.isFinite(amount)) {
      errors.push({ line: lineNo, message: `Invalid amount "${amountRaw}".` })
      continue
    }
    // Bank exports carry a transaction-code column (POS/D-D/BAC…) instead of INCOME/EXPENSE,
    // so when the type isn't explicit we derive it from the sign of the value.
    if (typeRaw !== 'INCOME' && typeRaw !== 'EXPENSE') {
      typeRaw = amount < 0 ? 'EXPENSE' : 'INCOME'
    }
    let paymentDate = ''
    if (paymentDateRaw) {
      const iso = toIsoDate(paymentDateRaw)
      if (!iso) {
        errors.push({ line: lineNo, message: `Invalid payment date "${paymentDateRaw}" (expected YYYY-MM-DD).` })
        continue
      }
      paymentDate = iso
    }
    const validStatuses = ['PLANNED', 'PENDING', 'CLEARED', 'RECONCILED'] as const
    if (statusRaw && !validStatuses.includes(statusRaw as typeof validStatuses[number])) {
      errors.push({ line: lineNo, message: `Invalid status "${statusRaw}".` })
      continue
    }
    rows.push({
      line: lineNo,
      date,
      type: typeRaw as TransactionType,
      category: category || 'Others',
      description,
      amount: Math.abs(amount),
      paymentMethodName,
      accountName,
      paymentDate: paymentDate || undefined,
      status: statusRaw
        ? statusRaw as typeof validStatuses[number]
        : undefined,
      installmentPlanId: get('installment plan id') || undefined,
      fixedPaymentId: get('fixed payment id') || undefined,
    })
  }

  return { rows, errors, fullDataRows }
}
