/**
 * Currency formatting utilities
 */

/**
 * Formats amount to Brazilian Real currency
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount)
}

/**
 * Formats amount to Brazilian Real currency with absolute value
 */
export const formatCurrencyAbs = (amount: number): string => {
  return formatCurrency(Math.abs(amount))
}
