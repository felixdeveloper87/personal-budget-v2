import { Box, Flex, HStack, Popover, PopoverArrow, PopoverBody, PopoverContent, PopoverTrigger, Portal, Text, VStack } from '@chakra-ui/react'
import { Info } from '@phosphor-icons/react'
import { useI18n } from '../../../i18n'
import type { HouseholdDashboard, HouseholdMember } from '../../../types'
import { PremiumModal } from '../../../components/ui'
import NuModalHeader from '../../../components/ui/NuModalHeader'

const BRAND = '#820ad1'

/** Points: £1 spent = 1 point. */
export function memberPoints(member: HouseholdMember) {
  return Math.round(member.totalPaid)
}

/** Ranking position by points; ties share a position (1, 1, 3). */
export function memberRank(member: HouseholdMember, members: HouseholdMember[]) {
  return 1 + members.filter((other) => memberPoints(other) > memberPoints(member)).length
}

export function MembersOverviewModal({
  isOpen,
  onClose,
  household,
}: {
  isOpen: boolean
  onClose: () => void
  household: HouseholdDashboard
}) {
  const { formatNumber, t } = useI18n()
  const totalPurchases = household.members.reduce((sum, member) => sum + member.purchaseCount, 0)

  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      contentProps={{
        className: 'nu-dashboard',
        w: { base: '100%', md: 'min(640px, calc(100vw - 32px))' }, maxW: '640px',
        h: { base: '85dvh', md: '80vh' }, maxH: { base: '85dvh', md: '80vh' },
        mt: 'auto', mb: 0, mx: 'auto', borderRadius: '32px 32px 0 0', overflow: 'hidden', bg: 'var(--nu-page, #ffffff)',
      }}
      header={
        <NuModalHeader
          title={t('household.members.title')}
          caption={t('household.members.sheetCaption', {
            members: t(
              household.members.length === 1 ? 'household.members.count.one' : 'household.members.count.other',
              { count: formatNumber(household.members.length) },
            ),
            purchases: t(
              totalPurchases === 1 ? 'household.members.purchases.one' : 'household.members.purchases.other',
              { count: formatNumber(totalPurchases) },
            ),
          })}
          onClose={onClose}
        />
      }
    >
      <Box overflowY="auto" flex={1} minH={0} bg="var(--nu-page, #ffffff)" sx={{ WebkitOverflowScrolling: 'touch' }}>
        <VStack align="stretch" spacing={0} divider={<Box h="1px" bg="var(--pb-hair)" />}>
          {household.members.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              isCurrent={member.id === household.currentMemberId}
              rank={memberRank(member, household.members)}
            />
          ))}
        </VStack>
      </Box>
    </PremiumModal>
  )
}

function MemberRow({ member, isCurrent, rank }: { member: HouseholdMember; isCurrent: boolean; rank: number }) {
  const { formatCurrency, formatNumber, t } = useI18n()
  const isReceiving = member.balance > 0.005
  const isPaying = member.balance < -0.005
  const accent = isReceiving ? 'var(--pb-income)' : isPaying ? 'var(--pb-coral)' : 'var(--pb-ink-faint)'
  const balanceLabel = t(
    isReceiving ? 'household.members.toReceive' : isPaying ? 'household.members.toPay' : 'household.members.settled',
  )

  return (
    <Flex px={{ base: 4, md: 6 }} py={3} align="center" gap={3} bg={isCurrent ? 'rgba(130, 10, 209, 0.04)' : undefined}>
      <Box minW={0} flex={1}>
        <HStack spacing={1.5} minW={0}>
          <Text fontWeight={700} fontSize="md" color="var(--pb-ink)" noOfLines={1}>{member.name}</Text>
          <PointsBadge member={member} />
          <Text flexShrink={0} fontWeight={700} fontSize="xs" color="var(--pb-ink-soft)">
            {t('household.members.rank', { rank: formatNumber(rank) })}
          </Text>
          {isCurrent && <Tag>{t('household.common.you')}</Tag>}
        </HStack>
        <Text mt={0.5} fontSize="xs" color="var(--pb-ink-soft)" noOfLines={1}>
          {t('household.members.monthSpent', { amount: formatCurrency(member.monthPaid) })}
        </Text>
      </Box>
      <Box flexShrink={0} textAlign="right" color={accent}>
        <Text fontSize="lg" fontWeight={800} letterSpacing="-.02em" lineHeight={1.2} style={{ fontVariantNumeric: 'tabular-nums' }}>
          {formatCurrency(Math.abs(member.balance))}
        </Text>
        <Text fontSize="11px" fontWeight={700}>{balanceLabel}</Text>
      </Box>
    </Flex>
  )
}

/** "(243 ⓘ)" — tapping it explains the points are the total spent and drive the ranking. */
export function PointsBadge({ member, fontSize = 'md' }: { member: HouseholdMember; fontSize?: string }) {
  const { formatCurrency, formatNumber, t } = useI18n()
  const points = memberPoints(member)
  return (
    <Popover placement="bottom-start" isLazy>
      <PopoverTrigger>
        <Box
          as="button" type="button" flexShrink={0} display="inline-flex" alignItems="center" gap={0.5}
          fontWeight={800} fontSize={fontSize} color={BRAND} style={{ fontVariantNumeric: 'tabular-nums' }}
          aria-label={t('household.members.pointsInfoAria')}
        >
          ({formatNumber(points)}
          <Info size={13} weight="bold" aria-hidden="true" />)
        </Box>
      </PopoverTrigger>
      <Portal>
        <PopoverContent w="260px" borderRadius="16px" borderColor="var(--pb-hair)" boxShadow="0 12px 32px -12px rgba(0,0,0,.25)">
          <PopoverArrow />
          <PopoverBody px={4} py={3}>
            <Text fontSize="sm" color="var(--pb-ink)">
              {t('household.members.pointsInfo', { name: member.name, amount: formatCurrency(member.totalPaid), points: formatNumber(points) })}
            </Text>
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  )
}

function Tag({ children }: { children: string }) {
  return (
    <Text as="span" flexShrink={0} px={1.5} borderRadius="full" bg="#f3e8fc" color={BRAND} fontSize="10px" fontWeight={800} letterSpacing=".04em" textTransform="uppercase">
      {children}
    </Text>
  )
}
