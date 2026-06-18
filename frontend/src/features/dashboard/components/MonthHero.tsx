import { Box, Grid, HStack, Text, VStack, Button } from '@chakra-ui/react'
import Panel from './Panel'
import FlowBars from './FlowBars'
import BalanceSeal from './BalanceSeal'
import { fmtCurrency } from './format'
import type { TransactionDateBasis } from '../../../utils/transactionDates'

interface MonthHeroProps {
  income: number
  expense: number
  net: number
  transactions: number
  serialLabel: string
  dateBasis: TransactionDateBasis
  onAddIncome?: () => void
  onAddExpense?: () => void
}

export default function MonthHero({
  income,
  expense,
  net,
  transactions,
  serialLabel,
  dateBasis,
  onAddIncome,
  onAddExpense,
}: MonthHeroProps) {
  const deficit = expense > income
  const surplus = income - expense

  const lede = deficit
    ? 'Spending has outpaced income this month.'
    : 'Income is ahead of spending this month.'

  const sublede = deficit
    ? `${fmtCurrency(income)} earned against ${fmtCurrency(expense)} in expenses and bills.`
    : `${fmtCurrency(income)} earned with ${fmtCurrency(surplus)} surplus after ${fmtCurrency(expense)} in expenses.`

  const netLabel = fmtCurrency(Math.abs(net))

  return (
    <Panel
      background={`linear-gradient(135deg, var(--pb-surface) 0%, var(--pb-surface-2) 100%)`}
      p={0}
      overflow="hidden"
    >
      <Grid
        templateColumns={{ base: '1fr', md: '1.35fr 0.9fr' }}
        gap={`clamp(1.4rem, 3vw, 2.2rem)`}
        p={`clamp(1.5rem, 3.4vw, 2.4rem)`}
      >
        {/* Left — statement */}
        <VStack align="stretch" spacing={5}>
          {/* Serial number */}
          <Box
            borderBottom="1px solid var(--pb-hair)"
            pb={2}
            aria-hidden="true"
          >
            <Text
              fontFamily="var(--pb-mono)"
              fontSize="10px"
              letterSpacing="0.18em"
              color="var(--pb-ink-faint)"
              textTransform="uppercase"
            >
              {serialLabel} &nbsp;·&nbsp; GBP &nbsp;·&nbsp; {transactions} entries
            </Text>
          </Box>

          {/* Lede */}
          <VStack align="stretch" spacing={2}>
            <Text
              fontFamily="var(--pb-serif)"
              fontSize="clamp(1.7rem, 4.4vw, 2.5rem)"
              fontWeight={400}
              lineHeight={1.08}
              color="var(--pb-ink)"
              maxW="18ch"
            >
              {deficit ? (
                <>
                  Spending has{' '}
                  <Text as="em" color="var(--pb-coral)">
                    outpaced
                  </Text>{' '}
                  income this month.
                </>
              ) : (
                <>
                  Income is{' '}
                  <Text as="em" color="var(--pb-mint)">
                    ahead
                  </Text>{' '}
                  of spending this month.
                </>
              )}
            </Text>

            <Text
              fontFamily="var(--pb-serif)"
              fontSize="sm"
              color="var(--pb-ink-soft)"
              lineHeight={1.55}
            >
              {sublede}
            </Text>
          </VStack>

          {/* Flow bars */}
          <FlowBars income={income} expense={expense} transactions={transactions} />

          {/* Quick actions */}
          {(onAddIncome || onAddExpense) && (
            <HStack spacing={2} maxW="440px" pt={1}>
              {onAddIncome && (
                <Button
                  flex={1}
                  h="36px"
                  borderRadius="999px"
                  bg="var(--pb-tint-green)"
                  color="var(--pb-forest)"
                  border="1px solid var(--pb-hair)"
                  fontFamily="var(--pb-mono)"
                  fontSize="11px"
                  fontWeight={500}
                  letterSpacing="0.08em"
                  textTransform="uppercase"
                  _hover={{ bg: 'rgba(45,106,79,0.16)', borderColor: 'var(--pb-hair-2)' }}
                  onClick={onAddIncome}
                >
                  + Add income
                </Button>
              )}
              {onAddExpense && (
                <Button
                  flex={1}
                  h="36px"
                  borderRadius="999px"
                  bg="var(--pb-tint-coral)"
                  color="var(--pb-coral)"
                  border="1px solid var(--pb-hair)"
                  fontFamily="var(--pb-mono)"
                  fontSize="11px"
                  fontWeight={500}
                  letterSpacing="0.08em"
                  textTransform="uppercase"
                  _hover={{ bg: 'rgba(168,67,46,0.15)', borderColor: 'var(--pb-hair-2)' }}
                  onClick={onAddExpense}
                >
                  + Add expense
                </Button>
              )}
            </HStack>
          )}
        </VStack>

        {/* Right — balance seal */}
        <VStack
          align="center"
          justify="center"
          borderLeft={{ base: 'none', md: '1px solid var(--pb-hair)' }}
          borderTop={{ base: '1px solid var(--pb-hair)', md: 'none' }}
          pl={{ base: 0, md: 6 }}
          pt={{ base: 5, md: 0 }}
          spacing={2}
        >
          <Box w="full" maxW="260px">
            <BalanceSeal netLabel={netLabel} currency="GBP" />
          </Box>
          <Text
            fontFamily="var(--pb-mono)"
            fontSize="10px"
            letterSpacing="0.16em"
            textTransform="uppercase"
            color="var(--pb-ink-faint)"
            textAlign="center"
          >
            Net this period · income minus spending
          </Text>
        </VStack>
      </Grid>
    </Panel>
  )
}
