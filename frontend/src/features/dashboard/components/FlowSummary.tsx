import { Box, Grid, Text } from '@chakra-ui/react'
import { fmtCurrency } from './format'

interface FlowSummaryProps {
  income: number
  expense: number
  balance: number
}

/** Income / Spending / Net-flow summary triad shared by Behaviour & Payments. */
export default function FlowSummary({ income, expense, balance }: FlowSummaryProps) {
  const metrics = [
    { label: 'Income', value: income, accent: 'var(--pb-income)' },
    { label: 'Spending', value: expense, accent: 'var(--pb-coral)' },
    {
      label: 'Net flow',
      value: balance,
      accent: balance >= 0 ? 'var(--pb-income)' : 'var(--pb-coral)',
    },
  ]

  return (
    <Grid templateColumns={{ base: 'repeat(3, 1fr)' }} gap="0.7rem">
      {metrics.map((metric) => (
        <Box
          key={metric.label}
          position="relative"
          bg="var(--pb-surface)"
          border="1px solid var(--pb-hair)"
          borderRadius="14px"
          boxShadow="0 1px 2px rgba(15,23,42,.05), 0 10px 28px rgba(15,23,42,.06)"
          pl="1.05rem"
          pr="0.95rem"
          py="0.85rem"
          overflow="hidden"
          minW={0}
        >
          <Box position="absolute" left={0} top={0} bottom={0} w="3px" bg={metric.accent} />
          <Text
            fontFamily="var(--pb-mono)"
            fontSize="9.5px"
            letterSpacing="0.13em"
            textTransform="uppercase"
            color="var(--pb-ink-faint)"
            mb="0.35rem"
            noOfLines={1}
          >
            {metric.label}
          </Text>
          <Text
            fontSize={{ base: '1.3rem', md: '1.5rem' }}
            fontWeight={500}
            lineHeight="1"
            color="var(--pb-ink)"
            style={{ fontVariantNumeric: 'tabular-nums' }}
            noOfLines={1}
          >
            {metric.value < 0 ? '−' : ''}
            {fmtCurrency(Math.abs(metric.value))}
          </Text>
        </Box>
      ))}
    </Grid>
  )
}
