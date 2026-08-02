import { Button, Grid, Text, VStack } from '@chakra-ui/react'
import { Plus } from 'lucide-react'
import Panel from './Panel'
import FlowBars from './FlowBars'
import { fmtCurrency } from './format'

interface MonthHeroProps {
  income: number
  expense: number
  date?: Date
  onAddIncome?: () => void
  onAddExpense?: () => void
}

export default function MonthHero({
  income,
  expense,
  date,
  onAddIncome,
  onAddExpense,
}: MonthHeroProps) {
  const deficit = expense > income
  const monthName = (date ?? new Date()).toLocaleDateString('en-GB', { month: 'long' })

  return (
    <Panel
      background="linear-gradient(135deg, var(--pb-surface) 0%, var(--pb-surface-2) 100%)"
      p={0}
      overflow="hidden"
    >
      <Grid
        templateColumns={{ base: '1fr', md: '50% 50%' }}
        gap={0}
        p="clamp(1.5rem, 3.4vw, 2.4rem)"
      >
        <VStack align="stretch" spacing={4} pr={{ base: 0, md: 8 }}>
          <Text
            fontFamily="var(--pb-mono)"
            fontSize="10.5px"
            fontWeight={600}
            letterSpacing="0.2em"
            textTransform="uppercase"
            color="var(--pb-ink-faint)"
          >
            Cash flow · {monthName}
          </Text>

          <Text
            fontFamily="var(--pb-serif)"
            fontSize="clamp(1.65rem, 3.8vw, 2.35rem)"
            fontWeight={400}
            lineHeight={1.08}
            color="var(--pb-ink)"
            maxW="20ch"
          >
            {deficit ? (
              <>
                You are{' '}
                <Text as="em" color="var(--pb-coral)">
                  {fmtCurrency(expense - income)} over
                </Text>{' '}
                this month’s income.
              </>
            ) : (
              <>
                You have{' '}
                <Text as="em" color="var(--pb-income-2)">
                  {fmtCurrency(income - expense)} left
                </Text>{' '}
                after spending.
              </>
            )}
          </Text>

          <Text fontFamily="var(--pb-serif)" fontSize="md" color="var(--pb-ink-soft)" lineHeight={1.5}>
            {deficit
              ? 'Add income to close the gap, or keep an eye on further spending.'
              : 'Your income is covering spending for this month.'}
          </Text>

          <FlowBars income={income} expense={expense} />

        </VStack>

        {(onAddIncome || onAddExpense) && (
          <VStack
            align="stretch"
            justify="flex-start"
            h="full"
            borderLeft={{ base: 'none', md: '1px solid var(--pb-hair)' }}
            borderTop={{ base: '1px solid var(--pb-hair)', md: 'none' }}
            pl={{ base: 0, md: 8 }}
            pt={{ base: 5, md: 1 }}
            spacing={3}
          >
            <Text
              fontFamily="var(--pb-mono)"
              fontSize="10.5px"
              letterSpacing="0.2em"
              textTransform="uppercase"
              color="var(--pb-ink-faint)"
            >
              Quick add
            </Text>

            <Text fontFamily="var(--pb-serif)" fontSize="xl" color="var(--pb-ink)" lineHeight={1.15}>
              Add a transaction
            </Text>

            <Text fontFamily="var(--pb-serif)" fontSize="sm" color="var(--pb-ink-soft)" lineHeight={1.55}>
              Keep {monthName}'s ledger current.
            </Text>

            <Grid
              templateColumns="repeat(2, minmax(0, 1fr))"
              gap={2.5}
              pt={2}
              mt="auto"
              borderTop="1px solid var(--pb-hair)"
            >
              {onAddIncome && (
                <Button
                  h="50px"
                  borderRadius="10px"
                  bg="var(--pb-income)"
                  color="var(--pb-paper-3)"
                  fontFamily="var(--pb-mono)"
                  fontSize="12px"
                  fontWeight={600}
                  letterSpacing="0.08em"
                  textTransform="uppercase"
                  leftIcon={<Plus size={15} strokeWidth={2.5} />}
                  boxShadow="var(--pb-shadow)"
                  _hover={{ bg: 'var(--pb-income-2)', transform: 'translateY(-1px)', boxShadow: 'var(--pb-shadow-lift)' }}
                  _active={{ transform: 'translateY(0)' }}
                  onClick={onAddIncome}
                >
                  Income
                </Button>
              )}
              {onAddExpense && (
                <Button
                  h="50px"
                  borderRadius="10px"
                  bg="var(--pb-coral)"
                  color="var(--pb-paper-3)"
                  boxShadow="var(--pb-shadow)"
                  fontFamily="var(--pb-mono)"
                  fontSize="12px"
                  fontWeight={600}
                  letterSpacing="0.08em"
                  textTransform="uppercase"
                  leftIcon={<Plus size={14} strokeWidth={2.5} />}
                  _hover={{ bg: 'var(--pb-coral-2)', transform: 'translateY(-1px)', boxShadow: 'var(--pb-shadow-lift)' }}
                  _active={{ transform: 'translateY(0)' }}
                  onClick={onAddExpense}
                >
                  Expense
                </Button>
              )}
            </Grid>
          </VStack>
        )}
      </Grid>
    </Panel>
  )
}
