import { Box, Grid, Text } from '@chakra-ui/react'
import { useI18n } from '../../../i18n'

export interface FlowMetric {
  label: string
  value: number
  accent: string
}

interface FlowSummaryProps {
  income: number
  expense: number
  balance: number
  /** Override the default Income/Spending/Net-flow triad (used by Payments). */
  metrics?: FlowMetric[]
}

/** Three-up summary triad. Defaults to Income / Spending / Net flow (Behaviour);
 * callers can pass their own `metrics` for an outflow-focused breakdown. */
export default function FlowSummary({ income, expense, balance, metrics }: FlowSummaryProps) {
  const { t, formatCurrency } = useI18n()
  const triad: FlowMetric[] = metrics ?? [
    { label: t('dashboard.income'), value: income, accent: 'var(--pb-income)' },
    { label: t('dashboard.spending'), value: expense, accent: 'var(--pb-coral)' },
    {
      label: t('dashboard.netFlow'),
      value: balance,
      accent: balance >= 0 ? 'var(--pb-income)' : 'var(--pb-coral)',
    },
  ]

  return (
    <Grid templateColumns={{ base: 'repeat(3, 1fr)' }} gap="0.55rem">
      {triad.map((metric) => (
        <Box
          key={metric.label}
          position="relative"
          bg="var(--pb-surface)"
          border="1px solid var(--pb-hair)"
          borderRadius="11px"
          boxShadow="0 1px 2px rgba(15,23,42,.05), 0 10px 28px rgba(15,23,42,.06)"
          pl="0.85rem"
          pr="0.7rem"
          py="0.55rem"
          overflow="hidden"
          minW={0}
        >
          <Box position="absolute" left={0} top={0} bottom={0} w="3px" bg={metric.accent} />
          <Text
            fontFamily="var(--pb-mono)"
            fontSize="8.5px"
            letterSpacing="0.12em"
            textTransform="uppercase"
            color="var(--pb-ink-faint)"
            mb="0.2rem"
            noOfLines={1}
          >
            {metric.label}
          </Text>
          <Text
            fontSize={{ base: '1rem', md: '1.1rem' }}
            fontWeight={500}
            lineHeight="1"
            color="var(--pb-ink)"
            style={{ fontVariantNumeric: 'tabular-nums' }}
            noOfLines={1}
          >
            {metric.value < 0 ? '−' : ''}
            {formatCurrency(Math.abs(metric.value))}
          </Text>
        </Box>
      ))}
    </Grid>
  )
}
