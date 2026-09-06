import { useMemo } from 'react'
import { Badge, Box, Button, Flex, Icon, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import { useI18n } from '../../../i18n'
import type { HouseholdDashboard, HouseholdExpense } from '../../../types'
import { Plus, ReceiptText } from '../../../components/ui/icons'
import { ModalHeader, PremiumModal } from '../../../components/ui'
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
      size={{ base: 'full', md: '2xl' }}
      header={
        <ModalHeader
          title={t('household.expenses.title')}
          caption={t('household.expenses.description')}
          onClose={onClose}
          rightSlot={
            <Badge
              bg="var(--pb-tint-green)"
              color="var(--pb-forest-2)"
              border="1px solid var(--pb-hair)"
              borderRadius="full"
              px={3}
              py={1}
              textTransform="none"
            >
              {t(
                household.expenses.length === 1
                  ? 'household.expenses.count.one'
                  : 'household.expenses.count.other',
                { count: formatNumber(household.expenses.length) },
              )}
            </Badge>
          }
        />
      }
      footer={
        <Flex justify="flex-end" w="full">
          <Button
            h="44px"
            w={{ base: 'full', sm: 'auto' }}
            px={5}
            borderRadius="11px"
            bg="var(--pb-forest-2)"
            color="var(--pb-on-accent)"
            onClick={onClose}
            _hover={{ bg: 'var(--pb-forest)' }}
          >
            {t('household.common.close')}
          </Button>
        </Flex>
      }
    >
      <Box p={{ base: 3, sm: 4, md: 5 }} bg="var(--pb-surface-2)">
        {household.expenses.length === 0 ? (
          <VStack
            py={9}
            px={4}
            spacing={3}
            border="1px dashed var(--pb-hair-2)"
            borderRadius="14px"
            bg="var(--pb-surface)"
          >
            <Flex
              w={11}
              h={11}
              align="center"
              justify="center"
              borderRadius="full"
              bg="var(--pb-tint-green)"
              color="var(--pb-forest-2)"
            >
              <Icon as={ReceiptText} boxSize={6} weight="duotone" />
            </Flex>
            <Text
              fontFamily="var(--pb-serif)"
              fontSize="lg"
              fontWeight={500}
              textAlign="center"
            >
              {t('household.expenses.emptyTitle')}
            </Text>
            <Text color="var(--pb-ink-soft)" fontSize="sm" textAlign="center">
              {t('household.expenses.emptyDescription')}
            </Text>
            <Button
              h="40px"
              leftIcon={<Icon as={Plus} boxSize={4} />}
              bg="var(--pb-forest-2)"
              color="var(--pb-on-accent)"
              onClick={onAddExpense}
              _hover={{ bg: 'var(--pb-forest)' }}
            >
              {t('household.expenses.addFirst')}
            </Button>
          </VStack>
        ) : (
          <VStack spacing={6} align="stretch">
            {expensesByMonth.map(([monthKey, expenses]) => {
              const [year, month] = monthKey.split('-')
              const monthDate = new Date(Number(year), Number(month) - 1, 1)
              const monthLabel = formatDate(monthDate, { month: 'long', year: 'numeric' })

              return (
                <Box key={monthKey}>
                  <Text
                    fontFamily="var(--pb-mono)"
                    fontSize="xs"
                    fontWeight={700}
                    letterSpacing="0.1em"
                    textTransform="uppercase"
                    color="var(--pb-ink-faint)"
                    mb={3}
                  >
                    {monthLabel}
                  </Text>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                    {expenses.map((expense) => (
                      <ExpenseCard
                        key={expense.id}
                        expense={expense}
                        household={household}
                        onEditExpense={onEditExpense}
                        onOpenAttachments={onOpenAttachments}
                      />
                    ))}
                  </SimpleGrid>
                </Box>
              )
            })}
          </VStack>
        )}
      </Box>
    </PremiumModal>
  )
}
