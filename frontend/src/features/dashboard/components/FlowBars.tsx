import { Box, Text, VStack } from '@chakra-ui/react'
import { useReducedMotion } from 'framer-motion'
import { MotionBox, barV } from './motion'
import { fmtCurrency } from './format'

interface FlowBarsProps {
  income: number
  expense: number
  transactions?: number
}

export default function FlowBars({ income, expense, transactions }: FlowBarsProps) {
  const reduce = useReducedMotion()
  const max = Math.max(income, expense, 1)
  const incomePct = (income / max) * 100
  const expensePct = (expense / max) * 100
  const deficit = expense > income
  const expenseRatio = income > 0 ? Math.round((expense / income) * 100) : 0

  const trackStyle: React.CSSProperties = {
    height: '30px',
    borderRadius: '7px',
    background: 'var(--pb-surface-3)',
    border: '1px solid var(--pb-hair)',
    overflow: 'hidden',
    position: 'relative',
  }

  return (
    <VStack align="stretch" spacing={3}>
      {/* Income bar */}
      <Box>
        <Text
          fontFamily="var(--pb-mono)"
          fontSize="10px"
          letterSpacing="0.2em"
          textTransform="uppercase"
          color="var(--pb-ink-faint)"
          mb={1}
        >
          Income
        </Text>
        <Box style={trackStyle} aria-hidden="true">
          <MotionBox
            position="absolute"
            top={0}
            left={0}
            height="100%"
            width={`${incomePct}%`}
            style={{
              transformOrigin: 'left center',
              background: 'linear-gradient(to right, #1f8a4f, #29a25e)',
              borderRadius: '7px',
            }}
            variants={reduce ? undefined : barV}
            initial={reduce ? false : 'hidden'}
            animate={reduce ? false : 'show'}
          />
        </Box>
      </Box>

      {/* Expense bar */}
      <Box>
        <Text
          fontFamily="var(--pb-mono)"
          fontSize="10px"
          letterSpacing="0.2em"
          textTransform="uppercase"
          color="var(--pb-ink-faint)"
          mb={1}
        >
          Expenses
        </Text>
        <Box
          style={trackStyle}
          role="img"
          aria-label={`Expenses ${fmtCurrency(expense)}${deficit ? ', shortfall shown as hatched band' : ''}`}
        >
          <MotionBox
            position="absolute"
            top={0}
            left={0}
            height="100%"
            width={`${expensePct}%`}
            style={{
              transformOrigin: 'left center',
              background: 'linear-gradient(to right, #c23a2c, #d84a39)',
              borderRadius: '7px',
            }}
            variants={reduce ? undefined : barV}
            initial={reduce ? false : 'hidden'}
            animate={reduce ? false : 'show'}
          />
          {deficit && (
            <Box
              position="absolute"
              top={0}
              bottom={0}
              left={`${incomePct}%`}
              right={0}
              borderLeft="1.5px dashed rgba(255,255,255,0.7)"
              backgroundImage="repeating-linear-gradient(135deg, rgba(255,255,255,0.22) 0 3px, transparent 3px 7px)"
              pointerEvents="none"
            />
          )}
        </Box>
      </Box>

      {/* Caption */}
      <Text
        fontFamily="var(--pb-mono)"
        fontSize="10px"
        letterSpacing="0.08em"
        color="var(--pb-ink-faint)"
        lineHeight="1.55"
      >
        {deficit
          ? `The hatched band is this month's shortfall — spending reached about ${expenseRatio}% of income${transactions ? `, across ${transactions} entries` : ''}.`
          : `Income covered spending with ${fmtCurrency(income - expense)} to spare${transactions ? ` across ${transactions} entries` : ''}.`}
      </Text>
    </VStack>
  )
}
