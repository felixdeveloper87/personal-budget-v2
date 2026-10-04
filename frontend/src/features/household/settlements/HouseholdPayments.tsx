import { Badge, Box, Button, Flex, HStack, Icon, Text, VStack } from '@chakra-ui/react'
import { ArrowRight } from '../../../components/ui/icons'
import { useI18n } from '../../../i18n'
import type { HouseholdDashboard, HouseholdSettlement, HouseholdSettlementStatus } from '../../../types'

const statusColors: Record<HouseholdSettlementStatus, { background: string; color: string }> = {
  CONFIRMED: { background: 'var(--pb-tint-income)', color: 'var(--pb-income)' },
  PENDING: { background: '#FBF1DC', color: '#8A5A00' },
  REJECTED: { background: 'var(--pb-tint-coral)', color: 'var(--pb-coral)' },
  CANCELLED: { background: 'var(--pb-surface-3)', color: 'var(--pb-ink-soft)' },
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
          <Text
            fontSize="11px"
            fontWeight={600}
            color="var(--pb-income)"
          >
            {t('household.settlements.eyebrow')}
          </Text>
          <Text mt={1} fontFamily="var(--pb-serif)" fontSize={{ base: 'xl', md: '2xl' }} fontWeight={600} lineHeight={1.1} color="var(--pb-ink)">
            {t('household.settlements.title')}
          </Text>
        </Box>

        {recentPayments.length > 0 && (
          <Button
            minH="44px"
            px={{ base: 3, md: 4 }}
            borderRadius="13px"
            bg="var(--pb-tint-green)"
            color="var(--pb-forest-2)"
            aria-label={t('household.settlements.openAria')}
            onClick={onViewPayments}
            _hover={{ bg: 'var(--pb-surface-3)', transform: 'translateY(-1px)' }}
            _active={{ transform: 'translateY(0)' }}
          >
            {t('household.settlements.viewAll')}
          </Button>
        )}
      </Flex>

      {recentPayments.length > 0 ? (
        <HStack
          align="stretch"
          spacing={2}
          overflowX="auto"
          overscrollBehaviorX="contain"
          pb={0.5}
          sx={{
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {recentPayments.map((payment) => (
            <PaymentCard key={payment.id} payment={payment} />
          ))}
        </HStack>
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

function PaymentCard({ payment }: { payment: HouseholdSettlement }) {
  const { formatCurrency, formatDate, t } = useI18n()
  const palette = statusColors[payment.status]

  return (
    <VStack
      as="article"
      align="stretch"
      spacing={2}
      w="192px"
      minW="192px"
      p="11px"
      border="1px solid var(--pb-hair)"
      borderRadius="16px"
      bg="var(--pb-surface-2)"
      scrollSnapAlign="start"
      aria-label={`${t('household.record.paymentTitle', { from: payment.fromMemberName, to: payment.toMemberName })}. ${formatCurrency(payment.amount)}. ${t(`household.status.${payment.status}`, undefined, payment.status)}.`}
    >
      <HStack spacing={1.75} minW={0}>
        <Flex w="28px" h="28px" flexShrink={0} align="center" justify="center" borderRadius="10px" bg="var(--pb-tint-green)" color="var(--pb-income)">
          <Icon as={ArrowRight} boxSize="15px" weight="bold" />
        </Flex>
        <Box minW={0} flex={1}>
          <Text fontSize="11px" lineHeight="16px" color="var(--pb-ink-soft)" noOfLines={1}>
            {t('household.settlements.from')} <Text as="span" color="var(--pb-ink)" fontWeight={600}>{payment.fromMemberName}</Text>
          </Text>
          <Text fontSize="11px" lineHeight="16px" color="var(--pb-ink-soft)" noOfLines={1}>
            {t('household.settlements.to')} <Text as="span" color="var(--pb-ink)" fontWeight={600}>{payment.toMemberName}</Text>
          </Text>
        </Box>
      </HStack>

      <Flex align="center" justify="space-between" gap={1.5} minW={0}>
        <Text flex={1} minW={0} fontSize="17px" lineHeight={1.2} fontWeight={800} letterSpacing="-0.4px" color="var(--pb-ink)" noOfLines={1} style={{ fontVariantNumeric: 'tabular-nums' }}>
          {formatCurrency(payment.amount)}
        </Text>
        <Badge flexShrink={0} px={1.25} py={0.75} borderRadius="7px" bg={palette.background} color={palette.color} fontSize="9px" fontWeight={700} textTransform="none">
          {t(`household.status.${payment.status}`, undefined, payment.status)}
        </Badge>
      </Flex>

      <Text fontSize="10px" lineHeight="13px" color="var(--pb-ink-faint)">
        {formatDate(payment.settlementDate, { day: '2-digit', month: 'short', year: 'numeric' })}
      </Text>
    </VStack>
  )
}
