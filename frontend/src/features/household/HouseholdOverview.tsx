import { Badge, Box, Button, Flex, HStack, Icon, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import { CheckCircle2, Wallet } from '../../components/ui/icons'
import { useI18n } from '../../i18n'
import type { HouseholdDashboard } from '../../types'
import { Surface } from './components/HouseholdPageComponents'

type ActivityItem =
  | { kind: 'expense'; id: number; date: string; amount: number; title: string; detail: string }
  | { kind: 'settlement'; id: number; date: string; amount: number; title: string; detail: string }

export function HouseholdOverview({
  household,
  onViewExpenses,
  onViewPayments,
}: {
  household: HouseholdDashboard
  onViewExpenses: () => void
  onViewPayments: () => void
}) {
  const { formatCurrency, formatDate, formatNumber, t } = useI18n()
  const activities: ActivityItem[] = [
    ...household.expenses.map((expense) => ({
      kind: 'expense' as const,
      id: expense.id,
      date: expense.expenseDate,
      amount: expense.amount,
      title: expense.description,
      detail: t('household.expenses.paidBy', { name: expense.payerName }),
    })),
    ...household.settlements.map((settlement) => ({
      kind: 'settlement' as const,
      id: settlement.id,
      date: settlement.settlementDate,
      amount: settlement.amount,
      title: `${settlement.fromMemberName} → ${settlement.toMemberName}`,
      detail: t(`household.status.${settlement.status}`),
    })),
  ].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id).slice(0, 5)

  return (
    <Surface id="household-expenses" scrollMarginTop="90px" p={{ base: 4, md: 5 }}>
      <Flex align="center" justify="space-between" gap={3}>
        <SectionHeading
          eyebrow={t('household.expenses.eyebrow')}
          title={t('household.activity.title')}
          detail={t('household.activity.detail')}
          count={t(
            activities.length === 1
              ? 'household.activity.count.one'
              : 'household.activity.count.other',
            { count: formatNumber(household.expenses.length + household.settlements.length) },
          )}
        />
        <HStack display={{ base: 'none', sm: 'flex' }} flexShrink={0} spacing={2}>
          <Button size="sm" variant="outline" borderColor="var(--pb-hair)" onClick={onViewExpenses}>
            {t('household.expenses.open')}
          </Button>
          <Button size="sm" variant="outline" borderColor="var(--pb-hair)" onClick={onViewPayments}>
            {t('household.settlements.open')}
          </Button>
        </HStack>
      </Flex>

      {activities.length === 0 ? (
        <Box mt={4} p={4} borderRadius="14px" border="1px dashed var(--pb-hair-2)" textAlign="center" bg="var(--pb-surface-2)">
          <Text fontSize="sm" color="var(--pb-ink-soft)">{t('household.expenses.emptyTitle')}</Text>
        </Box>
      ) : (
        <VStack mt={3} align="stretch" spacing={0} divider={<Box borderTop="1px solid var(--pb-hair)" />}>
          {activities.map((activity) => (
            <Flex key={`${activity.kind}-${activity.id}`} py={3} align="center" justify="space-between" gap={3}>
              <HStack minW={0} spacing={3}>
                <Flex
                  w={9} h={9} flexShrink={0} borderRadius="12px" align="center" justify="center"
                  bg={activity.kind === 'expense' ? 'var(--pb-tint-green)' : 'var(--pb-tint-income)'}
                  color={activity.kind === 'expense' ? 'var(--pb-forest-2)' : 'var(--pb-income)'}
                >
                  <Icon as={activity.kind === 'expense' ? Wallet : CheckCircle2} boxSize={4.5} weight="duotone" />
                </Flex>
                <Box minW={0}>
                  <Text fontSize="sm" fontWeight={600} color="var(--pb-ink)" noOfLines={1}>{activity.title}</Text>
                  <HStack spacing={1.5} color="var(--pb-ink-faint)" fontSize="xs">
                    <Text noOfLines={1}>{activity.detail}</Text>
                    <Text aria-hidden="true">·</Text>
                    <Text flexShrink={0}>{formatDate(activity.date, { day: 'numeric', month: 'short' })}</Text>
                  </HStack>
                </Box>
              </HStack>
              <Text flexShrink={0} fontSize="sm" fontWeight={700} color="var(--pb-ink)" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {formatCurrency(activity.amount)}
              </Text>
            </Flex>
          ))}
        </VStack>
      )}

      <SimpleGrid display={{ base: 'grid', sm: 'none' }} mt={3} columns={2} spacing={2}>
        <Button h="40px" size="sm" variant="outline" borderColor="var(--pb-hair)" onClick={onViewExpenses}>
          {t('household.expenses.open')}
        </Button>
        <Button h="40px" size="sm" variant="outline" borderColor="var(--pb-hair)" onClick={onViewPayments}>
          {t('household.settlements.open')}
        </Button>
      </SimpleGrid>
    </Surface>
  )
}

function SectionHeading({ eyebrow, title, detail, count }: {
  eyebrow: string
  title: string
  detail: string
  count: string
}) {
  return (
    <Flex minW={0} align="flex-start" justify="space-between" gap={3}>
      <Box minW={0}>
        <Text fontFamily="var(--pb-mono)" fontSize="9px" fontWeight={700} letterSpacing="0.12em" textTransform="uppercase" color="var(--pb-ink-faint)">
          {eyebrow}
        </Text>
        <Text mt={0.5} fontFamily="var(--pb-serif)" fontSize={{ base: 'lg', md: 'xl' }} fontWeight={500} lineHeight={1.1} color="var(--pb-ink)">
          {title}
        </Text>
        <Text mt={1} fontSize="xs" color="var(--pb-ink-soft)" noOfLines={2}>{detail}</Text>
      </Box>
      <Badge
        flexShrink={0} mt={1} px={2.5} py={1.5} borderRadius="full" bg="var(--pb-surface-2)"
        color="var(--pb-ink-soft)" border="1px solid var(--pb-hair)" textTransform="none" fontSize="2xs"
      >
        {count}
      </Badge>
    </Flex>
  )
}
