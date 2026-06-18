/** Engraving-friendly palette for category slices (forest → gold → coral spectrum). */
export const CATEGORY_COLORS = [
  '#2d6a4f',
  '#b1872f',
  '#a8432e',
  '#4f9d74',
  '#357a55',
  '#876723',
  '#c0563d',
  '#1e4d38',
  '#8a9287',
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
