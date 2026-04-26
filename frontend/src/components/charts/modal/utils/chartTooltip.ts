import type { CSSProperties } from 'react'
import type { TooltipProps } from 'recharts'
import type { ChartColors } from '../hooks/useChartColors'

type TooltipStyleSlice = Pick<
  TooltipProps<number, string>,
  'contentStyle' | 'labelStyle' | 'itemStyle'
>

/**
 * Shared Recharts `<Tooltip />` styles so every chart reads from the same
 * visual language (fintech-clean, not heavy drop-shadow).
 */
export function getRechartsTooltipProps(
  chartColors: ChartColors,
  textPrimary: string,
): TooltipStyleSlice {
  const contentStyle: CSSProperties = {
    backgroundColor: chartColors.cardBg,
    border: `1px solid ${chartColors.borderColor}`,
    borderRadius: '10px',
    boxShadow:
      '0 4px 24px -6px rgba(15, 23, 42, 0.12), 0 2px 8px rgba(15, 23, 42, 0.06)',
    fontSize: '12px',
    padding: '10px 14px',
  }

  const labelStyle = {
    color: textPrimary,
    fontWeight: 700,
    fontSize: '11px',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  } as NonNullable<TooltipStyleSlice['labelStyle']>

  const itemStyle: CSSProperties = {
    color: textPrimary,
    fontWeight: 600,
    padding: '2px 0',
    fontSize: '12px',
  }

  return { contentStyle, labelStyle, itemStyle }
}
