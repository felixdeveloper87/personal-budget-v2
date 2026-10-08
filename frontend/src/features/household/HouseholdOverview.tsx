import { Box, Button, Flex, Text, VStack } from '@chakra-ui/react'
import { useI18n } from '../../i18n'
import type { HouseholdDashboard, HouseholdExpense } from '../../types'
import { getHouseholdCategoryConfig } from './expenses/expenseConfig'
import { PayerInitials } from './expenses/PayerInitials'

export function HouseholdOverview({
  household,
  onViewExpenses,
}: {
  household: HouseholdDashboard
  onViewExpenses: () => void
}) {
  const { t } = useI18n()
  const recentExpenses = [...household.expenses]
    .sort((a, b) => b.expenseDate.localeCompare(a.expenseDate) || b.id - a.id)
    .slice(0, 5)

  return (
    <Box id="household-expenses" scrollMarginTop="90px">
      <Flex align="center" justify="space-between" gap={3} mb={3.5}>
        <Box minW={0}>
          <Text fontSize="xs" color="var(--pb-ink-soft)">
            {t('household.expenses.eyebrow')}
          </Text>
          <Text mt={1} fontFamily="var(--pb-serif)" fontSize={{ base: 'xl', md: '2xl' }} fontWeight={600} lineHeight={1.1} color="var(--pb-ink)">
            {t('household.activity.title')}
          </Text>
        </Box>
        {recentExpenses.length > 0 && (
          <Button
            h="40px" px={4} borderRadius="full" flexShrink={0}
            bg="var(--nu-brand-tint)" color="var(--nu-brand)" fontSize="sm" fontWeight={600}
            aria-label={t('household.activity.viewAllAria')} onClick={onViewExpenses}
            _hover={{ bg: '#ead6fa' }}
          >
            {t('household.activity.viewAll')}
          </Button>
        )}
      </Flex>

      {recentExpenses.length > 0 ? (
        <VStack
          align="stretch" spacing={0} borderRadius="18px" bg="var(--pb-surface)" overflow="hidden"
          divider={<Box h="1px" bg="var(--pb-hair)" />}
        >
          {recentExpenses.map((expense) => (
            <RecentExpenseRow key={expense.id} expense={expense} />
          ))}
        </VStack>
      ) : (
        <Box p={5} border="1px solid var(--pb-hair)" borderRadius="18px" bg="var(--pb-surface)">
          <Text fontSize="sm" fontWeight={700} color="var(--pb-ink)">{t('household.expenses.emptyTitle')}</Text>
          <Text mt={1.5} fontSize="xs" lineHeight={1.5} color="var(--pb-ink-soft)">{t('household.expenses.emptyDescription')}</Text>
        </Box>
      )}
    </Box>
  )
}

/** One line: category icon, description, payer initials, date, total. */
function RecentExpenseRow({ expense }: { expense: HouseholdExpense }) {
  const { formatCurrency, formatDate, t } = useI18n()
  const category = getHouseholdCategoryConfig(expense.category)
  const categoryLabel = t(`household.category.${expense.category}`, undefined, expense.category)
  const CategoryIcon = category.icon

  return (
    <Flex
      align="center" gap={2.5} px={3} py={2}
      aria-label={`${categoryLabel}. ${expense.description}. ${t('household.expenses.total')}: ${formatCurrency(expense.amount)}. ${t('household.expenses.paidBy', { name: expense.payerName })}.`}
    >
      <Flex w="28px" h="28px" flexShrink={0} align="center" justify="center" borderRadius="full" bg={category.bg} color={category.color}>
        <CategoryIcon size={15} weight="duotone" aria-hidden="true" />
      </Flex>
      <Text flex={1} minW={0} fontSize="sm" fontWeight={600} color="var(--pb-ink)" noOfLines={1}>
        {expense.description || categoryLabel}
      </Text>
      <PayerInitials name={expense.payerName} />
      <Text flexShrink={0} fontSize="xs" color="var(--pb-ink-faint)">
        {formatDate(expense.expenseDate, { day: 'numeric', month: 'short' })}
      </Text>
      <Text flexShrink={0} minW="64px" textAlign="right" fontSize="sm" fontWeight={800} color="var(--pb-ink)"
        style={{ fontVariantNumeric: 'tabular-nums' }}>
        {formatCurrency(expense.amount)}
      </Text>
    </Flex>
  )
}
