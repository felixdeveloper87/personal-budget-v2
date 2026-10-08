import { Box, Button, Flex, Text, VStack } from '@chakra-ui/react'
import { ArrowsLeftRight } from '@phosphor-icons/react'
import { useI18n } from '../../../i18n'
import type { HouseholdDashboard, HouseholdSettlement, HouseholdSettlementStatus } from '../../../types'

/** Icon circle colours per status: the only status cue on the one-line rows. */
export const settlementStatusColors: Record<HouseholdSettlementStatus, { background: string; color: string }> = {
  CONFIRMED: { background: 'var(--pb-tint-income)', color: 'var(--pb-income)' },
  PENDING: { background: '#FBF1DC', color: '#8A5A00' },
  REJECTED: { background: 'var(--pb-tint-coral)', color: 'var(--pb-coral)' },
  CANCELLED: { background: 'var(--pb-surface-3)', color: 'var(--pb-ink-soft)' },
}

/** Rejected / cancelled transfers never moved money. */
export const settlementVoided = (status: HouseholdSettlementStatus) => status === 'REJECTED' || status === 'CANCELLED'

/** Status-coloured transfer icon, same size as the expense category icons. */
export function SettlementIcon({ status, size = 28 }: { status: HouseholdSettlementStatus; size?: number }) {
  const { t } = useI18n()
  const palette = settlementStatusColors[status]
  const label = t(`household.status.${status}`, undefined, status)
  return (
    <Flex
      w={`${size}px`} h={`${size}px`} flexShrink={0} align="center" justify="center" borderRadius="full"
      bg={palette.background} color={palette.color} title={label}
    >
      <ArrowsLeftRight size={Math.round(size * 0.52)} weight="bold" aria-hidden="true" />
    </Flex>
  )
}

export function HouseholdPayments({
  household,
  onViewPayments,
}: {
  household: HouseholdDashboard
  onViewPayments: () => void
}) {
  const { t } = useI18n()
  const recentPayments = [...household.settlements]
    .sort((a, b) => b.settlementDate.localeCompare(a.settlementDate) || b.id - a.id)
    .slice(0, 5)

  return (
    <Box id="household-payments" scrollMarginTop="90px">
      <Flex align="center" justify="space-between" gap={3} mb={3.5}>
        <Box minW={0}>
          <Text fontSize="xs" color="var(--pb-ink-soft)">
            {t('household.settlements.eyebrow')}
          </Text>
          <Text mt={1} fontFamily="var(--pb-serif)" fontSize={{ base: 'xl', md: '2xl' }} fontWeight={600} lineHeight={1.1} color="var(--pb-ink)">
            {t('household.settlements.title')}
          </Text>
        </Box>

        {recentPayments.length > 0 && (
          <Button
            h="40px" px={4} borderRadius="full" flexShrink={0}
            bg="var(--nu-brand-tint)" color="var(--nu-brand)" fontSize="sm" fontWeight={600}
            aria-label={t('household.settlements.openAria')} onClick={onViewPayments}
            _hover={{ bg: '#ead6fa' }}
          >
            {t('household.settlements.viewAll')}
          </Button>
        )}
      </Flex>

      {recentPayments.length > 0 ? (
        <VStack
          align="stretch" spacing={0} borderRadius="18px" bg="var(--pb-surface)" overflow="hidden"
          divider={<Box h="1px" bg="var(--pb-hair)" />}
        >
          {recentPayments.map((payment) => (
            <PaymentRow key={payment.id} payment={payment} />
          ))}
        </VStack>
      ) : (
        <Box p={5} border="1px solid var(--pb-hair)" borderRadius="18px" bg="var(--pb-surface)">
          <Text fontSize="sm" fontWeight={700} color="var(--pb-ink)">
            {t('household.settlements.emptyTitle')}
          </Text>
          <Text mt={1.5} fontSize="xs" lineHeight={1.5} color="var(--pb-ink-soft)">
            {t('household.settlements.emptyDescription')}
          </Text>
        </Box>
      )}
    </Box>
  )
}

/** One line: status icon, "from → to", date, amount. */
function PaymentRow({ payment }: { payment: HouseholdSettlement }) {
  const { formatCurrency, formatDate, t } = useI18n()
  const voided = settlementVoided(payment.status)

  return (
    <Flex
      align="center" gap={2.5} px={3} py={2}
      aria-label={`${t('household.record.paymentTitle', { from: payment.fromMemberName, to: payment.toMemberName })}. ${formatCurrency(payment.amount)}. ${t(`household.status.${payment.status}`, undefined, payment.status)}.`}
    >
      <SettlementIcon status={payment.status} />
      <Text flex={1} minW={0} fontSize="sm" fontWeight={600} color="var(--pb-ink)" noOfLines={1}>
        {payment.fromMemberName} → {payment.toMemberName}
      </Text>
      <Text flexShrink={0} fontSize="xs" color="var(--pb-ink-faint)">
        {formatDate(payment.settlementDate, { day: 'numeric', month: 'short' })}
      </Text>
      <Text
        flexShrink={0} minW="64px" textAlign="right" fontSize="sm" fontWeight={800}
        color={voided ? 'var(--pb-ink-faint)' : 'var(--pb-ink)'} textDecoration={voided ? 'line-through' : undefined}
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {formatCurrency(payment.amount)}
      </Text>
    </Flex>
  )
}
