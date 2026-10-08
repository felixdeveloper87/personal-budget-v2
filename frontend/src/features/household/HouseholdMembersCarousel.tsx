import { Box, Flex, HStack, Text } from '@chakra-ui/react'
import { useI18n } from '../../i18n'
import type { HouseholdDashboard } from '../../types'
import { memberRank, PointsBadge } from './members/MembersOverviewModal'

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
      <Box minW={0}>
        <Text fontSize="xs" color="var(--pb-ink-soft)">
          {t('household.members.eyebrow')}
        </Text>
        <Text mt={1} fontFamily="var(--pb-serif)" fontSize={{ base: 'xl', md: '2xl' }} fontWeight={600} lineHeight={1.1} color="var(--pb-ink)">
          {t('household.members.title')}
        </Text>
      </Box>
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
              flex="0 0 220px" minW="220px" p={3.5}
              borderRadius="18px" bg="var(--pb-surface)"
              sx={{ scrollSnapAlign: 'start' }}
              aria-label={`${member.name}. ${status}: ${formatCurrency(Math.abs(member.balance))}`}
            >
              <Flex align="center" gap={2} minW={0}>
                <Flex
                  w="26px" h="26px" flexShrink={0} align="center" justify="center" borderRadius="full"
                  bg="#f3e8fc" color="#820ad1" fontSize="11px" fontWeight={800}
                >
                  {t('household.members.rank', { rank: formatNumber(memberRank(member, household.members)) })}
                </Flex>
                <Text fontSize="sm" fontWeight={700} color="var(--pb-ink)" noOfLines={1} minW={0}>{member.name}</Text>
              </Flex>

              <Box mt={3} color={accent}>
                <Text fontSize="11px" fontWeight={700}>{status}</Text>
                <Text fontSize="xl" fontWeight={800} letterSpacing="-.02em" lineHeight={1.15} style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {formatCurrency(Math.abs(member.balance))}
                </Text>
              </Box>

              <Flex mt={3} pt={2.5} borderTop="1px solid var(--pb-hair)" align="center" justify="space-between" gap={2}>
                <Text fontSize="2xs" color="var(--pb-ink-soft)" noOfLines={1} minW={0}>
                  {t('household.members.monthSpentShort', { amount: formatCurrency(member.monthPaid) })}
                </Text>
                <PointsBadge member={member} fontSize="2xs" variant="pill" />
              </Flex>
            </Box>
          )
        })}
      </HStack>

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
