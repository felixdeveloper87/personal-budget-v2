import { Badge, Box, Button, Flex, HStack, Icon, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import type { HouseholdDashboard } from '../../types'
import { ChevronRight, CheckCircle2, TrendingDown, TrendingUp, Wallet } from '../../components/ui/icons'
import { useI18n } from '../../i18n'
import { householdAvatarGradient } from './householdAvatar'
import { Surface } from './components/HouseholdPageComponents'

type ActivityItem =
  | { kind: 'expense'; id: number; date: string; amount: number; title: string; detail: string }
  | { kind: 'settlement'; id: number; date: string; amount: number; title: string; detail: string }

export function HouseholdOverview({
  household,
  onViewBalances,
  onViewMembers,
  onViewExpenses,
  onViewPayments,
}: {
  household: HouseholdDashboard
  onViewBalances: () => void
  onViewMembers: () => void
  onViewExpenses: () => void
  onViewPayments: () => void
}) {
  const { formatCurrency, formatDate, formatNumber, t } = useI18n()
  const currentId = household.currentMemberId
  const debts = [...household.debts].sort((a, b) => {
    const aPersonal = a.fromMemberId === currentId || a.toMemberId === currentId
    const bPersonal = b.fromMemberId === currentId || b.toMemberId === currentId
    return Number(bPersonal) - Number(aPersonal) || b.amount - a.amount
  })
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
    <VStack align="stretch" spacing={{ base: 3, md: 4 }}>
      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={{ base: 3, md: 4 }}>
        <Surface id="household-balances" scrollMarginTop="90px" p={{ base: 4, md: 5 }}>
          <SectionHeading
            eyebrow={t('household.balances.eyebrow')}
            title={t('household.balances.title')}
            detail={t('household.balances.description')}
            count={debts.length ? t('household.balances.open', {
              amount: formatCurrency(debts.reduce((sum, debt) => sum + debt.amount, 0)),
            }) : t('household.balances.allSettled')}
          />
          {debts.length === 0 ? (
            <Flex mt={4} gap={3} align="center" p={3.5} borderRadius="14px" bg="var(--pb-tint-income)" color="var(--pb-income)">
              <Icon as={CheckCircle2} boxSize={5} weight="duotone" />
              <Text fontSize="sm" fontWeight={600}>{t('household.balances.everyoneSettled')}</Text>
            </Flex>
          ) : (
            <VStack mt={3} align="stretch" spacing={0} divider={<Box borderTop="1px solid var(--pb-hair)" />}>
              {debts.slice(0, 4).map((debt) => {
                const youPay = debt.fromMemberId === currentId
                const youReceive = debt.toMemberId === currentId
                const color = youPay ? 'var(--pb-coral)' : youReceive ? 'var(--pb-income)' : 'var(--pb-ink)'
                const label = youPay
                  ? t('household.balances.youOweName', { name: debt.toMemberName })
                  : youReceive
                    ? t('household.balances.owesYou', { name: debt.fromMemberName })
                    : t('household.balances.memberOwes', { from: debt.fromMemberName, to: debt.toMemberName })
                return (
                  <Flex key={`${debt.fromMemberId}-${debt.toMemberId}`} py={3} align="center" justify="space-between" gap={3}>
                    <HStack minW={0} spacing={2.5}>
                      <Flex w={8} h={8} flexShrink={0} borderRadius="full" align="center" justify="center" bg={youPay ? 'var(--pb-tint-coral)' : youReceive ? 'var(--pb-tint-income)' : 'var(--pb-surface-2)'} color={color}>
                        <Icon as={youPay ? TrendingDown : youReceive ? TrendingUp : Wallet} boxSize={4} weight="duotone" />
                      </Flex>
                      <Text fontSize="sm" fontWeight={600} color="var(--pb-ink)" noOfLines={1}>{label}</Text>
                    </HStack>
                    <Text flexShrink={0} fontSize="sm" fontWeight={700} color={color} style={{ fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(debt.amount)}</Text>
                  </Flex>
                )
              })}
            </VStack>
          )}
          <Button mt={3} w="full" h="40px" rightIcon={<Icon as={ChevronRight} boxSize={4} />} variant="outline" borderColor="var(--pb-hair)" color="var(--pb-forest-2)" onClick={onViewBalances}>
            {t('household.balances.view')}
          </Button>
        </Surface>

        <Surface id="household-members" scrollMarginTop="90px" p={{ base: 4, md: 5 }}>
          <SectionHeading
            eyebrow={t('household.members.eyebrow')}
            title={t('household.members.title')}
            detail={t('household.members.description')}
            count={t(household.members.length === 1 ? 'household.members.count.one' : 'household.members.count.other', { count: formatNumber(household.members.length) })}
          />
          <VStack mt={3} align="stretch" spacing={0} divider={<Box borderTop="1px solid var(--pb-hair)" />}>
            {household.members.slice(0, 5).map((member, index) => {
              const positive = member.balance > 0
              const negative = member.balance < 0
              const balanceColor = positive ? 'var(--pb-income)' : negative ? 'var(--pb-coral)' : 'var(--pb-ink-faint)'
              return (
                <Flex key={member.id} py={2.5} align="center" justify="space-between" gap={3}>
                  <HStack minW={0} spacing={2.5}>
                    <Flex w={8} h={8} flexShrink={0} borderRadius="full" bgGradient={householdAvatarGradient(index, member.id)} color="white" align="center" justify="center" fontSize="xs" fontWeight={800}>
                      {member.name.trim().charAt(0).toUpperCase()}
                    </Flex>
                    <Box minW={0}>
                      <Text fontSize="sm" fontWeight={600} noOfLines={1} color="var(--pb-ink)">{member.id === currentId ? t('household.common.you') : member.name}</Text>
                      <HStack spacing={1.5} fontSize="2xs" color="var(--pb-ink-faint)" noOfLines={1}>
                        <Text noOfLines={1}>{t('household.members.paid')} {formatCurrency(member.totalPaid)}</Text>
                        <Text aria-hidden="true">·</Text>
                        <Text noOfLines={1}>{t('household.members.assignedShare')} {formatCurrency(member.totalShare)}</Text>
                      </HStack>
                    </Box>
                  </HStack>
                  <VStack align="flex-end" spacing={0} flexShrink={0}>
                    <Text fontSize="sm" fontWeight={700} color={balanceColor} style={{ fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(Math.abs(member.balance))}</Text>
                    <Text fontSize="2xs" color={balanceColor}>{positive ? t('household.members.toReceive') : negative ? t('household.members.toPay') : t('household.members.settled')}</Text>
                  </VStack>
                </Flex>
              )
            })}
          </VStack>
          {household.members.length > 5 && <Text mt={2} fontSize="xs" color="var(--pb-ink-faint)">+{formatNumber(household.members.length - 5)}</Text>}
          <Button mt={3} w="full" h="40px" rightIcon={<Icon as={ChevronRight} boxSize={4} />} variant="outline" borderColor="var(--pb-hair)" color="var(--pb-forest-2)" onClick={onViewMembers}>
            {t('household.members.open')}
          </Button>
        </Surface>
      </SimpleGrid>

      <Surface id="household-expenses" scrollMarginTop="90px" p={{ base: 4, md: 5 }}>
        <Flex align="center" justify="space-between" gap={3}>
          <SectionHeading
            eyebrow={t('household.expenses.eyebrow')}
            title={t('household.activity.title')}
            detail={t('household.activity.detail')}
            count={t(activities.length === 1 ? 'household.activity.count.one' : 'household.activity.count.other', { count: formatNumber(household.expenses.length + household.settlements.length) })}
          />
          <HStack display={{ base: 'none', sm: 'flex' }} flexShrink={0} spacing={2}>
            <Button size="sm" variant="outline" borderColor="var(--pb-hair)" onClick={onViewExpenses}>{t('household.expenses.open')}</Button>
            <Button size="sm" variant="outline" borderColor="var(--pb-hair)" onClick={onViewPayments}>{t('household.settlements.open')}</Button>
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
                  <Flex w={9} h={9} flexShrink={0} borderRadius="12px" align="center" justify="center" bg={activity.kind === 'expense' ? 'var(--pb-tint-green)' : 'var(--pb-tint-income)'} color={activity.kind === 'expense' ? 'var(--pb-forest-2)' : 'var(--pb-income)'}>
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
                <VStack flexShrink={0} align="flex-end" spacing={0}>
                  <Text fontSize="sm" fontWeight={700} color="var(--pb-ink)" style={{ fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(activity.amount)}</Text>
                </VStack>
              </Flex>
            ))}
          </VStack>
        )}
        <SimpleGrid display={{ base: 'grid', sm: 'none' }} mt={3} columns={2} spacing={2}>
          <Button h="40px" size="sm" variant="outline" borderColor="var(--pb-hair)" onClick={onViewExpenses}>{t('household.expenses.open')}</Button>
          <Button h="40px" size="sm" variant="outline" borderColor="var(--pb-hair)" onClick={onViewPayments}>{t('household.settlements.open')}</Button>
        </SimpleGrid>
      </Surface>
    </VStack>
  )
}

function SectionHeading({ eyebrow, title, detail, count }: { eyebrow: string; title: string; detail: string; count: string }) {
  return (
    <Flex minW={0} align="flex-start" justify="space-between" gap={3}>
      <Box minW={0}>
        <Text fontFamily="var(--pb-mono)" fontSize="9px" fontWeight={700} letterSpacing="0.12em" textTransform="uppercase" color="var(--pb-ink-faint)">{eyebrow}</Text>
        <Text mt={0.5} fontFamily="var(--pb-serif)" fontSize={{ base: 'lg', md: 'xl' }} fontWeight={500} lineHeight={1.1} color="var(--pb-ink)">{title}</Text>
        <Text mt={1} fontSize="xs" color="var(--pb-ink-soft)" noOfLines={2}>{detail}</Text>
      </Box>
      <Badge flexShrink={0} mt={1} px={2.5} py={1.5} borderRadius="full" bg="var(--pb-surface-2)" color="var(--pb-ink-soft)" border="1px solid var(--pb-hair)" textTransform="none" fontSize="2xs">{count}</Badge>
    </Flex>
  )
}
