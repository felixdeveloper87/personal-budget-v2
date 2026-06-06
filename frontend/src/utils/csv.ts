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
}

export interface ParseError {
  line: number
  message: string
}

export interface CsvParseResult {
  rows: ParsedRow[]
  errors: ParseError[]
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

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

  const lines = text
    .replace(/^﻿/, '')
    .split(/\r\n|\n|\r/)
    .map((l) => l)
    .filter((l, idx) => !(idx > 0 && l.trim() === '') || idx === 0)

  if (lines.length === 0 || lines.every((l) => l.trim() === '')) {
    return { rows, errors: [{ line: 0, message: 'The file is empty.' }] }
  }

  // Detect header row.
  const firstCells = parseCsvLine(lines[0]).map(normHeader)
  const hasHeader = firstCells.includes('date') && firstCells.includes('amount')

  const colIndex: Record<string, number> = {
    date: 0,
    type: 1,
    category: 2,
    description: 3,
    amount: 4,
    'payment method': 5,
  }
  if (hasHeader) {
    firstCells.forEach((h, i) => {
      if (h in colIndex) colIndex[h] = i
    })
  }

  const startAt = hasHeader ? 1 : 0

  for (let i = startAt; i < lines.length; i++) {
    const raw = lines[i]
    const lineNo = i + 1
    if (raw.trim() === '') continue

    const cells = parseCsvLine(raw)
    const get = (key: string) => (cells[colIndex[key]] ?? '').trim()

    const date = get('date')
    const typeRaw = get('type').toUpperCase()
    const category = get('category')
    const description = get('description')
    const amountRaw = get('amount')
    const paymentMethodName = get('payment method')

    if (!DATE_RE.test(date)) {
      errors.push({ line: lineNo, message: `Invalid date "${date}" (expected YYYY-MM-DD).` })
      continue
    }
    if (typeRaw !== 'INCOME' && typeRaw !== 'EXPENSE') {
      errors.push({ line: lineNo, message: `Invalid type "${typeRaw}" (expected INCOME or EXPENSE).` })
      continue
    }
    // Strip currency symbols / thousands separators, keep digits, sign and decimal point.
    const amount = Number(amountRaw.replace(/[^0-9.-]/g, ''))
    if (!Number.isFinite(amount)) {
      errors.push({ line: lineNo, message: `Invalid amount "${amountRaw}".` })
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
    })
  }

  return { rows, errors }
}
