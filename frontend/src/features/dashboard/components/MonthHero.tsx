import { Button, Grid, Text, VStack } from '@chakra-ui/react'
import { Plus } from 'lucide-react'
import Panel from './Panel'
import FlowBars from './FlowBars'
import { useI18n } from '../../../i18n'

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
  const { t, formatCurrency, formatDate } = useI18n()
  const deficit = expense > income
  const monthName = formatDate(date ?? new Date(), { month: 'long' })

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
            {t('dashboard.cashFlowMonth', { month: monthName })}
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
                {t('dashboard.youAre')}{' '}
                <Text as="em" color="var(--pb-coral)">
                  {t('dashboard.overIncome', { amount: formatCurrency(expense - income) })}
                </Text>{' '}
                {t('dashboard.thisMonthsIncome')}
              </>
            ) : (
              <>
                {t('dashboard.youHave')}{' '}
                <Text as="em" color="var(--pb-income-2)">
                  {t('dashboard.leftAfterSpending', { amount: formatCurrency(income - expense) })}
                </Text>{' '}
                {t('dashboard.afterSpending')}
              </>
            )}
          </Text>

          <Text fontFamily="var(--pb-serif)" fontSize="md" color="var(--pb-ink-soft)" lineHeight={1.5}>
            {deficit
              ? t('dashboard.deficitGuidance')
              : t('dashboard.coveredGuidance')}
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
              {t('dashboard.quickAdd')}
            </Text>

            <Text fontFamily="var(--pb-serif)" fontSize="xl" color="var(--pb-ink)" lineHeight={1.15}>
              {t('dashboard.addTransaction')}
            </Text>

            <Text fontFamily="var(--pb-serif)" fontSize="sm" color="var(--pb-ink-soft)" lineHeight={1.55}>
              {t('dashboard.keepLedgerCurrent', { month: monthName })}
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
                  {t('dashboard.income')}
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
                  {t('dashboard.expense')}
                </Button>
              )}
            </Grid>
          </VStack>
        )}
      </Grid>
    </Panel>
  )
}
