import { Box, Flex, Text, VStack } from '@chakra-ui/react'
import { useReducedMotion } from 'framer-motion'
import { MotionBox, barV } from './motion'
import { fmtCurrency } from './format'

interface FlowBarsProps {
  income: number
  expense: number
}

/** A single, comparable cash-flow meter. The fill represents how much of the
 * current expenses has been covered by income, so it grows as income arrives. */
export default function FlowBars({ income, expense }: FlowBarsProps) {
  const reduce = useReducedMotion()
  const deficit = expense > income
  const gap = Math.abs(expense - income)
  const incomeCoverage = expense > 0 ? Math.min((income / expense) * 100, 100) : 100
  const fill = expense > 0 ? incomeCoverage : income > 0 ? 100 : 0
  const gapColor = deficit ? 'var(--pb-coral)' : 'var(--pb-income-2)'

  return (
    <VStack align="stretch" spacing={4}>
      <Flex align="baseline" gap={{ base: 4, sm: 6 }} wrap="wrap">
        <LedgerValue label="Income" value={fmtCurrency(income)} color="var(--pb-income-2)" />
        <Box h="18px" w="1px" bg="var(--pb-hair)" aria-hidden />
        <LedgerValue label="Expenses" value={fmtCurrency(expense)} color="var(--pb-coral)" />
      </Flex>

      <Box>
        <Box
          h="12px"
          borderRadius="full"
          bg="var(--pb-surface-3)"
          border="1px solid var(--pb-hair)"
          overflow="hidden"
          aria-label={deficit
            ? `${fmtCurrency(gap)} of spending is not covered by income`
            : `Spending is covered, with ${fmtCurrency(income - expense)} remaining`}
        >
          <MotionBox
            h="full"
            w={`${fill}%`}
            borderRadius="full"
            bg="linear-gradient(90deg, var(--pb-income), var(--pb-income-2))"
            variants={reduce ? undefined : barV}
            initial={reduce ? false : 'hidden'}
            animate={reduce ? false : 'show'}
            style={{ transformOrigin: 'left center' }}
          />
        </Box>

        <Flex justify="space-between" gap={3} mt={1.5}>
          <Text fontFamily="var(--pb-mono)" fontSize="9.5px" color="var(--pb-ink-faint)">
            {Math.round(incomeCoverage)}% of expenses covered
          </Text>
          <Text fontFamily="var(--pb-mono)" fontSize="9.5px" color={gapColor} textAlign="right">
            {deficit ? `${fmtCurrency(gap)} remaining` : `${fmtCurrency(income - expense)} left`}
          </Text>
        </Flex>
      </Box>
    </VStack>
  )
}

function LedgerValue({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <Flex align="baseline" gap={2}>
      <Text
        fontFamily="var(--pb-mono)"
        fontSize="9.5px"
        letterSpacing="0.16em"
        textTransform="uppercase"
        color="var(--pb-ink-faint)"
      >
        {label}
      </Text>
      <Text
        fontFamily="var(--pb-serif)"
        fontSize="lg"
        fontWeight={600}
        lineHeight={1}
        color={color}
        style={{ fontVariantNumeric: 'tabular-nums lining-nums' }}
      >
        {value}
      </Text>
    </Flex>
  )
}
