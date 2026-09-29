import { Box, Button, Flex, HStack, Text, VStack } from '@chakra-ui/react'
import { ReceiptText } from '../../components/ui/icons'
import { useI18n } from '../../i18n'
import type { HouseholdDashboard, HouseholdExpense } from '../../types'
import { getHouseholdCategoryConfig } from './expenses/expenseConfig'

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
          <Text
            fontFamily="var(--pb-mono)" fontSize="9px" fontWeight={800} letterSpacing="0.12em"
            textTransform="uppercase" color="var(--pb-income)"
          >
            {t('household.expenses.eyebrow')}
          </Text>
          <Text mt={1} fontFamily="var(--pb-serif)" fontSize={{ base: 'xl', md: '2xl' }} fontWeight={600} lineHeight={1.1} color="var(--pb-ink)">
            {t('household.activity.title')}
          </Text>
        </Box>
        {recentExpenses.length > 0 && (
          <Button
            minH="44px" px={{ base: 3, md: 4 }} borderRadius="13px"
            bg="var(--pb-tint-green)" color="var(--pb-forest-2)"
            aria-label={t('household.activity.viewAllAria')} onClick={onViewExpenses}
            _hover={{ bg: 'var(--pb-surface-3)', transform: 'translateY(-1px)' }}
            _active={{ transform: 'translateY(0)' }}
          >
            {t('household.activity.viewAll')}
          </Button>
        )}
      </Flex>

      {recentExpenses.length > 0 ? (
        <VStack align="stretch" spacing={2}>
          {recentExpenses.map((expense) => (
            <RecentExpenseRow
              key={expense.id}
              expense={expense}
              household={household}
            />
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

function RecentExpenseRow({ expense, household }: {
  expense: HouseholdExpense
  household: HouseholdDashboard
}) {
  const { formatCurrency, formatDate, formatNumber, t } = useI18n()
  const category = getHouseholdCategoryConfig(expense.category)
  const currentShare = expense.shares.find((share) => share.memberId === household.currentMemberId)
  const attachmentCount = expense.attachments.filter((attachment) => attachment.status === 'AVAILABLE').length
  const categoryLabel = t(`household.category.${expense.category}`, undefined, expense.category)
  const CategoryIcon = category.icon

  return (
    <Flex
      position="relative" overflow="hidden"
      align="center" gap={{ base: 2.5, sm: 3 }} px={{ base: 3, sm: 3.5 }} py={3}
      border="1px solid var(--pb-hair)" borderRadius="16px"
      background="radial-gradient(ellipse 48% 115% at 100% 50%, var(--pb-surface-2) 0%, var(--pb-surface-2) 99.5%, transparent 100%), var(--pb-surface)"
      boxShadow="var(--pb-shadow)"
      aria-label={`${categoryLabel}. ${expense.description}. ${t('household.expenses.total')}: ${formatCurrency(expense.amount)}. ${t('household.expenses.paidBy', { name: expense.payerName })}.`}
    >
      <Flex
        w="36px" h="36px" flexShrink={0} align="center" justify="center" borderRadius="11px"
        bg={category.bg} color={category.color}
      >
        <CategoryIcon size={18} weight="duotone" aria-hidden="true" />
      </Flex>

      <Box minW={0} flex={1}>
        <HStack spacing={1.5} minW={0}>
          <Text fontSize="sm" fontWeight={700} color="var(--pb-ink)" noOfLines={1}>{categoryLabel}</Text>
          {attachmentCount > 0 && (
            <HStack flexShrink={0} spacing={1} px={1.5} py={0.5} borderRadius="6px" bg="var(--pb-tint-green)" color="var(--pb-forest-2)">
              <ReceiptText size={12} weight="duotone" aria-hidden="true" />
              <Text fontSize="2xs" fontWeight={700}>{formatNumber(attachmentCount)}</Text>
            </HStack>
          )}
        </HStack>
        {expense.description && (
          <Text mt={0.5} fontSize="xs" lineHeight={1.35} color="var(--pb-ink-soft)" noOfLines={1}>{expense.description}</Text>
        )}
        <Text mt={0.5} fontSize="2xs" fontWeight={700} color="var(--pb-income)" noOfLines={1}>
          {currentShare
            ? `${t('household.expenses.yourShare')}: ${formatCurrency(currentShare.amount)}`
            : t('household.expenses.notParticipating')}
        </Text>
      </Box>

      <VStack minW={0} flex={{ base: '0 1 38%', sm: '0 1 32%' }} align="flex-end" spacing={0.5}>
        <Text fontSize={{ base: 'sm', sm: 'md' }} fontWeight={800} color="var(--pb-ink)" noOfLines={1} style={{ fontVariantNumeric: 'tabular-nums' }}>
          {formatCurrency(expense.amount)}
        </Text>
        <Text fontSize="2xs" color="var(--pb-ink-soft)" noOfLines={1}>
          {t('household.expenses.paidByLabel')}{' '}
          <Text as="span" color="var(--pb-income)" fontWeight={700}>{expense.payerName}</Text>
        </Text>
        <Text fontSize="2xs" color="var(--pb-ink-faint)" noOfLines={1}>
          {formatDate(expense.expenseDate, { day: '2-digit', month: 'short', year: 'numeric' })}
        </Text>
      </VStack>
    </Flex>
  )
}
