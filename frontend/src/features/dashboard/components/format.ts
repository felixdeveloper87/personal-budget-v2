/** Cool metallic palette for category slices (steel-blue led, with brass + red accents). */
export const CATEGORY_COLORS = [
  '#2f7bb0',
  '#1d5a87',
  '#5aa1d6',
  '#1f8a4f',
  '#9c7b2c',
  '#3f86c2',
  '#c23a2c',
  '#6b7c8e',
  '#c19a3c',
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
