/** Banknote palette for category slices (forest-green led, with gold + coral accents). */
export const CATEGORY_COLORS = [
  '#2d7a57',
  '#b58a2e',
  '#b8452f',
  '#557c8e',
  '#8a9a5b',
  '#1e4d38',
  '#c9a35a',
  '#4f9d74',
  '#6b7c8e',
] as const

export const categoryColor = (index: number): string =>
  CATEGORY_COLORS[index % CATEGORY_COLORS.length]

export const fmtCurrency = (amount: number, opts: Intl.NumberFormatOptions = {}): string => {
  const merged: Intl.NumberFormatOptions = { maximumFractionDigits: 0, ...opts }
  // Intl throws RangeError when minimumFractionDigits > maximumFractionDigits
  if (
    merged.minimumFractionDigits !== undefined &&
    merged.maximumFractionDigits !== undefined &&
    merged.minimumFractionDigits > merged.maximumFractionDigits
  ) {
    merged.maximumFractionDigits = merged.minimumFractionDigits
  }
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', ...merged }).format(amount)
}
