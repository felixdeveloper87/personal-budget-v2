import { Box, Flex, HStack, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import { useI18n } from '../../../i18n'
import type { HouseholdDashboard, HouseholdMember } from '../../../types'
import { CheckCircle2, ShoppingCart, TrendingDown, TrendingUp } from '../../../components/ui/icons'
import { PremiumModal } from '../../../components/ui'
import NuModalHeader from '../../../components/ui/NuModalHeader'

const BRAND = '#820ad1'

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
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
  const maxPurchases = Math.max(1, ...household.members.map((member) => member.purchaseCount))

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
              maxPurchases={maxPurchases}
            />
          ))}
        </VStack>
      </Box>
    </PremiumModal>
  )
}

function MemberRow({ member, isCurrent, maxPurchases }: { member: HouseholdMember; isCurrent: boolean; maxPurchases: number }) {
  const { formatCurrency, formatDate, formatNumber, t } = useI18n()
  const isReceiving = member.balance > 0.005
  const isPaying = member.balance < -0.005
  const accent = isReceiving ? 'var(--pb-income)' : isPaying ? 'var(--pb-coral)' : 'var(--pb-ink-faint)'
  const BalanceIcon = isReceiving ? TrendingUp : isPaying ? TrendingDown : CheckCircle2
  const balanceLabel = t(
    isReceiving ? 'household.members.toReceive' : isPaying ? 'household.members.toPay' : 'household.members.settled',
  )

  return (
    <Box px={{ base: 4, md: 6 }} py={4} bg={isCurrent ? 'rgba(130, 10, 209, 0.04)' : undefined}>
      <Flex align="center" gap={3}>
        <Flex
          w="44px" h="44px" flexShrink={0} align="center" justify="center" borderRadius="full"
          bg={isCurrent ? BRAND : '#f3e8fc'} color={isCurrent ? 'white' : BRAND}
          fontSize="sm" fontWeight={800} letterSpacing="-.02em"
        >
          {initials(member.name)}
        </Flex>
        <Box minW={0} flex={1}>
          <HStack spacing={1.5} minW={0}>
            <Text fontWeight={700} fontSize="md" color="var(--pb-ink)" noOfLines={1}>{member.name}</Text>
            {isCurrent && <Tag>{t('household.common.you')}</Tag>}
            {member.role === 'OWNER' && <Tag>{t('household.common.owner')}</Tag>}
          </HStack>
          <Text mt={0.5} fontSize="xs" color="var(--pb-ink-soft)" noOfLines={1}>
            {member.lastPurchaseDate
              ? t('household.members.lastPurchase', {
                date: formatDate(member.lastPurchaseDate, { day: 'numeric', month: 'short' }),
              })
              : t('household.members.noPurchases')}
          </Text>
        </Box>
        <Box textAlign="right" flexShrink={0}>
          <Text fontSize="lg" fontWeight={800} color={accent} letterSpacing="-.02em" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatCurrency(Math.abs(member.balance))}
          </Text>
          <HStack spacing={1} justify="flex-end" color={accent}>
            <BalanceIcon size={12} weight="bold" aria-hidden="true" />
            <Text fontSize="11px" fontWeight={700}>{balanceLabel}</Text>
          </HStack>
        </Box>
      </Flex>

      <Box mt={3} pl={{ base: 0, sm: '56px' }}>
        <Flex align="center" justify="space-between" mb={1.5}>
          <HStack spacing={1.5} color="var(--pb-ink-soft)">
            <ShoppingCart size={13} weight="duotone" aria-hidden="true" />
            <Text fontSize="xs" fontWeight={600}>{t('household.members.purchasesPosted')}</Text>
          </HStack>
          <Text fontSize="xs" fontWeight={800} color={BRAND}>{formatNumber(member.purchaseCount)}</Text>
        </Flex>
        <Box h="6px" borderRadius="full" bg="var(--pb-hair)" overflow="hidden">
          <Box h="full" borderRadius="full" bg={BRAND} w={`${(member.purchaseCount / maxPurchases) * 100}%`} transition="width .4s ease" />
        </Box>
        <SimpleGrid columns={3} spacing={2} mt={3}>
          <Stat label={t('household.members.paid')} value={formatCurrency(member.totalPaid)} />
          <Stat label={t('household.members.assignedShare')} value={formatCurrency(member.totalShare)} />
          <Stat label={t('household.members.thisMonth')} value={formatCurrency(member.monthPaid)} />
        </SimpleGrid>
      </Box>
    </Box>
  )
}

function Tag({ children }: { children: string }) {
  return (
    <Text as="span" flexShrink={0} px={1.5} borderRadius="full" bg="#f3e8fc" color={BRAND} fontSize="10px" fontWeight={800} letterSpacing=".04em" textTransform="uppercase">
      {children}
    </Text>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Box px={2.5} py={2} borderRadius="12px" bg="#f5f5f8">
      <Text fontSize="10px" fontWeight={600} color="var(--pb-ink-soft)" noOfLines={1}>{label}</Text>
      <Text mt={0.5} fontSize="sm" fontWeight={800} color="var(--pb-ink)" noOfLines={1} style={{ fontVariantNumeric: 'tabular-nums' }}>{value}</Text>
    </Box>
  )
}
