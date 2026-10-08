import { Box, Button, Flex, HStack, Icon, Text } from '@chakra-ui/react'
import { ChevronRight } from '../../components/ui/icons'
import { useI18n } from '../../i18n'
import type { HouseholdDashboard } from '../../types'
import { memberRank, PointsBadge } from './members/MembersOverviewModal'
import { HouseholdDebtTicker } from './HouseholdDebtTicker'

export function HouseholdMembersCarousel({ household, onViewBalances }: {
  household: HouseholdDashboard
  onViewBalances: () => void
}) {
  const { formatCurrency, formatNumber, t } = useI18n()
  const debtsYouOwe = household.debts.filter((debt) => debt.fromMemberId === household.currentMemberId)
  const totalYouOwe = debtsYouOwe.reduce((total, debt) => total + debt.amount, 0)
  const alertTitle = t(debtsYouOwe.length === 1 ? 'household.paymentAlert.title.one' : 'household.paymentAlert.title.other')
  const alertDetail = debtsYouOwe.length === 1
    ? t('household.paymentAlert.detail.one', { amount: formatCurrency(debtsYouOwe[0].amount), name: debtsYouOwe[0].toMemberName })
    : t('household.paymentAlert.detail.other', { amount: formatCurrency(totalYouOwe), count: formatNumber(debtsYouOwe.length) })

  return (
    <Box id="household-members" scrollMarginTop="90px">
      <Flex align="center" justify="space-between" gap={3}>
        <Box minW={0}>
          <Text fontSize="xs" color="var(--pb-ink-soft)">
            {t('household.members.eyebrow')}
          </Text>
          <Text mt={1} fontFamily="var(--pb-serif)" fontSize={{ base: 'xl', md: '2xl' }} fontWeight={600} lineHeight={1.1} color="var(--pb-ink)">
            {t('household.members.title')}
          </Text>
        </Box>
        <Button
          flexShrink={0} minH="44px" px={{ base: 3, md: 4 }} borderRadius="13px"
          bg="var(--pb-tint-green)" color="var(--pb-forest-2)" rightIcon={<Icon as={ChevronRight} boxSize={4} />}
          aria-label={t('household.balances.openAria')} onClick={onViewBalances}
          _hover={{ bg: 'var(--pb-surface-3)', transform: 'translateY(-1px)' }} _active={{ transform: 'translateY(0)' }}
        >
          {t('household.balances.title')}
        </Button>
      </Flex>
      <Text mt={1.5} fontSize="xs" color="var(--pb-ink-soft)">{t('household.members.description')}</Text>

      <HStack
        mt={3.5} pb={1.5} spacing={2.5} align="stretch" overflowX="auto" overflowY="hidden"
        role="list" aria-label={t('household.members.title')}
        sx={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', '&::-webkit-scrollbar': { display: 'none' } }}
      >
        {household.members.map((member) => {
          const receiving = member.balance > 0.005
          const paying = member.balance < -0.005
          const accent = receiving ? 'var(--pb-income)' : paying ? 'var(--pb-coral)' : 'var(--pb-ink-soft)'
          const status = receiving
            ? t('household.members.toReceive')
            : paying ? t('household.members.toPay') : t('household.members.settled')

          return (
            <Box
              key={member.id} role="listitem"
              flex="0 0 200px" minW="200px" px={3} py={2.5}
              borderRadius="14px" bg="var(--pb-surface)"
              sx={{ scrollSnapAlign: 'start' }}
              aria-label={`${member.name}. ${status}: ${formatCurrency(Math.abs(member.balance))}`}
            >
              <HStack spacing={1} minW={0}>
                <Text fontSize="sm" fontWeight={700} color="var(--pb-ink)" noOfLines={1} minW={0}>{member.name}</Text>
                <PointsBadge member={member} fontSize="sm" />
                <Text flexShrink={0} fontSize="2xs" fontWeight={700} color="var(--pb-ink-soft)">
                  {t('household.members.rank', { rank: formatNumber(memberRank(member, household.members)) })}
                </Text>
                {member.id === household.currentMemberId && (
                  <Text flexShrink={0} fontSize="2xs" fontWeight={700} color="var(--pb-forest)">{t('household.common.you')}</Text>
                )}
              </HStack>
              <HStack mt={1} spacing={1.5} align="baseline" color={accent}>
                <Text fontSize="md" fontWeight={700} lineHeight={1.2} style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {formatCurrency(Math.abs(member.balance))}
                </Text>
                <Text fontSize="2xs" fontWeight={700}>{status}</Text>
              </HStack>
              <Text mt={0.5} fontSize="2xs" color="var(--pb-ink-soft)" noOfLines={1}>
                {t('household.members.monthSpent', { amount: formatCurrency(member.monthPaid) })}
              </Text>
            </Box>
          )
        })}
      </HStack>

      <HouseholdDebtTicker debts={household.debts} onOpen={onViewBalances} />

      {debtsYouOwe.length > 0 && (
        /* Same pending-payment alert as the mobile app: whole card opens the balances. */
        <Flex
          as="button"
          type="button"
          w="full"
          mt={3}
          minH="68px"
          p={3.5}
          align="center"
          gap={2.5}
          textAlign="left"
          borderRadius="16px"
          bg="var(--pb-tint-coral)"
          aria-label={`${alertTitle}. ${alertDetail} ${t('household.paymentAlert.action')}`}
          onClick={onViewBalances}
          transition="opacity 0.15s ease, transform 0.15s ease"
          _hover={{ opacity: 0.9 }}
          _active={{ transform: 'scale(0.99)' }}
          _focusVisible={{ outline: '2px solid var(--pb-coral)', outlineOffset: '2px' }}
        >
          <Flex w="34px" h="34px" flexShrink={0} align="center" justify="center" borderRadius="full" bg="white" color="var(--pb-coral)" fontSize="md" fontWeight={800}>
            !
          </Flex>
          <Box flex={1} minW={0}>
            <Text fontSize="sm" fontWeight={600} color="var(--pb-ink)">{alertTitle}</Text>
            <Text mt={0.5} fontSize="xs" lineHeight={1.4} color="var(--pb-ink-soft)" noOfLines={2}>{alertDetail}</Text>
          </Box>
          <Text flexShrink={0} fontSize="xs" fontWeight={700} color="var(--pb-coral)">{t('household.paymentAlert.action')}</Text>
        </Flex>
      )}
    </Box>
  )
}
