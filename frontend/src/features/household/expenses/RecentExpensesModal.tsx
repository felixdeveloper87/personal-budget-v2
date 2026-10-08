import { useMemo } from 'react'
import { Box, Button, Flex, Icon, Text, VStack } from '@chakra-ui/react'
import { useI18n } from '../../../i18n'
import type { HouseholdDashboard, HouseholdExpense } from '../../../types'
import { Plus, ReceiptText } from '../../../components/ui/icons'
import { PremiumModal } from '../../../components/ui'
import NuModalHeader from '../../../components/ui/NuModalHeader'
import { ExpenseCard } from './ExpenseCard'

export function RecentExpensesModal({
  isOpen,
  onClose,
  household,
  onAddExpense,
  onEditExpense,
  onOpenAttachments,
}: {
  isOpen: boolean
  onClose: () => void
  household: HouseholdDashboard
  onAddExpense: () => void
  onEditExpense: (expense: HouseholdExpense) => void
  onOpenAttachments: (expenseId: number) => void
}) {
  const { formatCurrency, formatDate, formatNumber, t } = useI18n()

  const expensesByMonth = useMemo(() => {
    const grouped = new Map<string, HouseholdExpense[]>()
    for (const expense of household.expenses) {
      const month = expense.expenseDate.slice(0, 7)
      if (!grouped.has(month)) grouped.set(month, [])
      grouped.get(month)!.push(expense)
    }
    return Array.from(grouped.entries()).sort((a, b) => b[0].localeCompare(a[0]))
  }, [household.expenses])

  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      contentProps={{
        className: 'nu-dashboard',
        w: { base: '100%', md: 'min(640px, calc(100vw - 32px))' }, maxW: '640px',
        h: 'auto', maxH: { base: '85dvh', md: '80vh' },
        mt: 'auto', mb: 0, mx: 'auto', borderRadius: '32px 32px 0 0', overflow: 'hidden', bg: 'var(--nu-page, #ffffff)',
      }}
      header={
        <NuModalHeader
          title={t('household.expenses.title')}
          caption={t(
            household.expenses.length === 1 ? 'household.expenses.count.one' : 'household.expenses.count.other',
            { count: formatNumber(household.expenses.length) },
          )}
          onClose={onClose}
        />
      }
    >
      <Box overflowY="auto" flex={1} minH={0} bg="var(--nu-page, #ffffff)" pb="env(safe-area-inset-bottom, 0px)"
        sx={{ WebkitOverflowScrolling: 'touch' }}>
        {household.expenses.length === 0 ? (
          <VStack py={12} px={6} spacing={3} textAlign="center">
            <Flex w="56px" h="56px" align="center" justify="center" borderRadius="full" bg="#f3e8fc" color="#820ad1">
              <Icon as={ReceiptText} boxSize={6} weight="duotone" />
            </Flex>
            <Text fontSize="lg" fontWeight={800} letterSpacing="-.02em" color="var(--pb-ink)">
              {t('household.expenses.emptyTitle')}
            </Text>
            <Text color="var(--pb-ink-soft)" fontSize="sm">
              {t('household.expenses.emptyDescription')}
            </Text>
            <Button
              h="44px" px={5} borderRadius="full" bg="#820ad1" color="white"
              leftIcon={<Icon as={Plus} boxSize={4} />}
              onClick={onAddExpense}
              _hover={{ bg: '#6d08b0' }}
            >
              {t('household.expenses.addFirst')}
            </Button>
          </VStack>
        ) : (
          expensesByMonth.map(([monthKey, expenses]) => {
            const [year, month] = monthKey.split('-')
            const monthDate = new Date(Number(year), Number(month) - 1, 1)
            const monthLabel = formatDate(monthDate, { month: 'long', year: 'numeric' })
            const monthTotal = expenses.reduce((total, expense) => total + expense.amount, 0)

            return (
              <Box key={monthKey}>
                <Flex
                  px={{ base: 4, md: 6 }} pt={3} pb={1} align="center" justify="space-between"
                  fontSize="11px" fontWeight={700} letterSpacing=".04em" textTransform="uppercase" color="var(--pb-ink-faint)"
                >
                  <Text>{monthLabel}</Text>
                  <Text style={{ fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(monthTotal)}</Text>
                </Flex>
                <VStack align="stretch" spacing={0} divider={<Box h="1px" bg="var(--pb-hair)" />}>
                  {expenses.map((expense) => (
                    <ExpenseCard
                      key={expense.id}
                      expense={expense}
                      household={household}
                      onEditExpense={onEditExpense}
                      onOpenAttachments={onOpenAttachments}
                    />
                  ))}
                </VStack>
              </Box>
            )
          })
        )}
      </Box>
    </PremiumModal>
  )
}
