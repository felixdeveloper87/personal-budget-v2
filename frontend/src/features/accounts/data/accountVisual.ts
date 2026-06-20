import type { FinancialAccount } from '../../../types'
import { getBankMeta } from '../../../components/ui'

/** Brand-ish palette for monogram tiles / ribbon segments / share bars. */
const PALETTE = [
  '#1d5a87',
  '#2f7bb0',
  '#1f8a4f',
  '#9c7b2c',
  '#7d5a86',
  '#a8506b',
  '#3f8a7a',
  '#4a7a96',
  '#c23a2c',
] as const

function hashIndex(seed: string, mod: number): number {
  let h = 0
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return h % mod
}

/** Stable colour for an account — the bank's brand colour when known, else a palette hash. */
export function accountColor(account: FinancialAccount): string {
  const brand = getBankMeta(account.institution)
  if (brand) return brand.bg
  const seed = `${account.institution ?? ''}·${account.name}`.toLowerCase()
  return PALETTE[hashIndex(seed, PALETTE.length)]
}

/** A single-letter monogram — a rendered tile, never a third-party logo. */
export function monogram(account: FinancialAccount): string {
  const source = account.name?.trim() || account.institution?.trim() || '?'
  const firstWord = source.replace(/[^A-Za-z0-9]/g, ' ').trim().split(/\s+/)[0] ?? source
  return (firstWord[0] ?? '?').toUpperCase()
}
