import { useMemo } from 'react'
import { Box, Flex, Icon, IconButton, Text, VStack } from '@chakra-ui/react'
import { useI18n } from '../../../i18n'
import type { HouseholdDashboard, HouseholdSettlement } from '../../../types'
import { Mail, ReceiptText, Upload } from '../../../components/ui/icons'
import { PremiumModal } from '../../../components/ui'
import NuModalHeader from '../../../components/ui/NuModalHeader'
import { PayerInitials } from '../expenses/PayerInitials'
import { SettlementIcon, settlementStatusColors, settlementVoided } from './HouseholdPayments'

const BRAND = '#820ad1'

export function PaymentsOverviewModal({
  isOpen,
  onClose,
  household,
  onOpenAttachments,
}: {
  isOpen: boolean
  onClose: () => void
  household: HouseholdDashboard
  onOpenAttachments: (settlementId: number) => void
}) {
  const { formatCurrency, formatDate, formatNumber, t } = useI18n()

  const settlementsByMonth = useMemo(() => {
    const grouped = new Map<string, HouseholdSettlement[]>()
    for (const settlement of household.settlements) {
      const month = settlement.settlementDate.slice(0, 7)
      if (!grouped.has(month)) grouped.set(month, [])
      grouped.get(month)!.push(settlement)
    }
    return Array.from(grouped.entries()).sort((a, b) => b[0].localeCompare(a[0]))
  }, [household.settlements])

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
          title={t('household.settlements.title')}
          caption={t(
            household.settlements.length === 1 ? 'household.settlements.count.one' : 'household.settlements.count.other',
            { count: formatNumber(household.settlements.length) },
          )}
          onClose={onClose}
        />
      }
    >
      <Box overflowY="auto" flex={1} minH={0} bg="var(--nu-page, #ffffff)" pb="env(safe-area-inset-bottom, 0px)"
        sx={{ WebkitOverflowScrolling: 'touch' }}>
        {household.settlements.length === 0 ? (
          <VStack py={12} px={6} spacing={3} textAlign="center">
            <Flex w="56px" h="56px" align="center" justify="center" borderRadius="full" bg="#f3e8fc" color={BRAND}>
              <Icon as={Mail} boxSize={6} weight="duotone" />
            </Flex>
            <Text fontSize="lg" fontWeight={800} letterSpacing="-.02em" color="var(--pb-ink)">
              {t('household.settlements.emptyTitle')}
            </Text>
            <Text color="var(--pb-ink-soft)" fontSize="sm">
              {t('household.settlements.emptyDescription')}
            </Text>
          </VStack>
        ) : (
          settlementsByMonth.map(([monthKey, settlements]) => {
            const [year, month] = monthKey.split('-')
            const monthDate = new Date(Number(year), Number(month) - 1, 1)
            const monthLabel = formatDate(monthDate, { month: 'long', year: 'numeric' })
            // Rejected / cancelled transfers never moved money, so they stay out of the month total.
            const monthTotal = settlements
              .filter((settlement) => !settlementVoided(settlement.status))
              .reduce((total, settlement) => total + settlement.amount, 0)

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
                  {settlements.map((settlement) => (
                    <SettlementRow key={settlement.id} settlement={settlement} onOpenAttachments={onOpenAttachments} />
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

/**
 * Two lines, like the expenses:
 *   [icon] Vagner → Leandro        [proof]  £ amount
 *          (VB) 3 Oct · Pending
 */
function SettlementRow({ settlement, onOpenAttachments }: {
  settlement: HouseholdSettlement
  onOpenAttachments: (settlementId: number) => void
}) {
  const { formatCurrency, formatDate, formatNumber, t } = useI18n()
  const attachmentCount = (settlement.attachments ?? []).length
  const canOpenProof = attachmentCount > 0 || settlement.canAttach
  const voided = settlementVoided(settlement.status)
  const palette = settlementStatusColors[settlement.status]

  return (
    <Box px={{ base: 4, md: 6 }} py={2.5}>
      <Flex align="center" gap={3}>
        <SettlementIcon status={settlement.status} size={36} />
        <Box minW={0} flex={1}>
          <Flex align="center" gap={1.5}>
            <Text flex={1} minW={0} fontSize="sm" fontWeight={700} color="var(--pb-ink)" noOfLines={1}
              title={t('household.record.paymentTitle', { from: settlement.fromMemberName, to: settlement.toMemberName })}>
              {settlement.fromMemberName} → {settlement.toMemberName}
            </Text>
            {canOpenProof && (
              <IconButton
                aria-label={t('household.settlements.proofAria', { name: settlement.fromMemberName })}
                title={t('household.settlements.proof', { count: formatNumber(attachmentCount) })}
                icon={<Icon as={attachmentCount > 0 ? ReceiptText : Upload} boxSize={4} weight={attachmentCount > 0 ? 'fill' : 'bold'} />}
                size="xs" w="28px" minW="28px" h="28px" borderRadius="full" variant="ghost"
                color={attachmentCount > 0 ? BRAND : 'var(--pb-ink-faint)'}
                _hover={{ bg: '#f3e8fc', color: BRAND }}
                onClick={() => onOpenAttachments(settlement.id)}
              />
            )}
            <Text
              flexShrink={0} ml={1} fontSize="md" fontWeight={800} letterSpacing="-.02em"
              color={voided ? 'var(--pb-ink-faint)' : 'var(--pb-ink)'} textDecoration={voided ? 'line-through' : undefined}
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {formatCurrency(settlement.amount)}
            </Text>
          </Flex>
          <Flex mt={0.5} align="center" gap={2}>
            <PayerInitials name={settlement.fromMemberName} />
            <Text fontSize="xs" color="var(--pb-ink-soft)" noOfLines={1}>
              {formatDate(settlement.settlementDate, { day: 'numeric', month: 'short' })}
              {' · '}
              <Text as="span" fontWeight={700} color={palette.color}>
                {t(`household.status.${settlement.status}`, undefined, settlement.status)}
              </Text>
            </Text>
          </Flex>
        </Box>
      </Flex>
    </Box>
  )
}
