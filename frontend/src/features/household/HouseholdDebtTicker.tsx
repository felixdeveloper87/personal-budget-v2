import { Box, Flex, Text } from '@chakra-ui/react'
import { Fragment } from 'react'
import { useI18n } from '../../i18n'
import type { HouseholdDebt, HouseholdMember } from '../../types'

const BRAND = '#820ad1'
/** Seconds each headline stays on the bar, so a longer list scrolls at the same speed. */
const SECONDS_PER_ITEM = 5

/**
 * CNN-style headline bar, one headline per member: "Priscila owes Vinicius,
 * Vagner and Leandro" or "Leandro doesn't owe anyone". Scrolls on a loop; opens the balances.
 */
export function HouseholdDebtTicker({ members, debts, onOpen }: {
  members: HouseholdMember[]
  debts: HouseholdDebt[]
  onOpen: () => void
}) {
  const { t } = useI18n()
  // "A, B and C" (no Intl.ListFormat in this TS lib).
  const list = (names: string[]) => names.length < 2
    ? names.join('')
    : `${names.slice(0, -1).join(', ')} ${t('household.ticker.and')} ${names[names.length - 1]}`
  const items = members.map((member) => {
    const creditors = debts.filter((debt) => debt.fromMemberId === member.id).map((debt) => debt.toMemberName)
    return { name: member.name, creditors: creditors.length ? list(creditors) : null }
  })
  const headlines = items.map(({ name, creditors }) => (
    <Text as="span" whiteSpace="nowrap" fontSize="sm" color="white">
      <Text as="b" fontWeight={800}>{name}</Text>
      {' '}
      {creditors ? (
        <>
          {t('household.ticker.owesTo')}{' '}
          <Text as="b" fontWeight={800} color="#ffd166">{creditors}</Text>
        </>
      ) : (
        <Text as="span" color="rgba(255,255,255,.75)">{t('household.ticker.owesNobody')}</Text>
      )}
    </Text>
  ))
  const summary = debts.length
    ? items.map(({ name, creditors }) => creditors
      ? `${name} ${t('household.ticker.owesTo')} ${creditors}`
      : `${name} ${t('household.ticker.owesNobody')}`).join('. ')
    : t('household.ticker.allSettled')

  // The track holds the headlines twice and slides by half its width, so the loop is seamless.
  const track = (copy: number) => (
    <Flex align="center" flexShrink={0} aria-hidden={copy > 0 ? true : undefined}>
      {headlines.map((headline, index) => (
        <Fragment key={`${copy}-${index}`}>
          {headline}
          <Box as="span" mx={4} w="6px" h="6px" borderRadius="full" bg="rgba(255,255,255,.45)" flexShrink={0} />
        </Fragment>
      ))}
    </Flex>
  )

  return (
    <Flex
      as="button" type="button" onClick={onOpen} w="full" h="40px" align="stretch" overflow="hidden"
      borderRadius="12px" bg="#1f1f24" textAlign="left" aria-label={`${t('household.ticker.label')}: ${summary}`}
      _focusVisible={{ outline: `2px solid ${BRAND}`, outlineOffset: '2px' }}
      sx={{
        '@keyframes householdTicker': { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        '@keyframes householdTickerDot': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.25 } },
        '&:hover .household-ticker-track': { animationPlayState: 'paused' },
      }}
    >
      <Flex align="center" gap={1.5} px={3} flexShrink={0} bg={BRAND} position="relative" zIndex={1}
        boxShadow="8px 0 12px -6px rgba(0,0,0,.6)">
        <Box w="7px" h="7px" borderRadius="full" bg="#ff4d4d" sx={{ animation: 'householdTickerDot 1.4s ease-in-out infinite' }} />
        <Text fontSize="11px" fontWeight={800} letterSpacing=".08em" color="white" textTransform="uppercase">
          {t('household.ticker.label')}
        </Text>
      </Flex>
      <Flex flex={1} minW={0} align="center" overflow="hidden">
        {debts.length === 0 ? (
          <Text px={4} fontSize="sm" color="white" noOfLines={1}>{t('household.ticker.allSettled')}</Text>
        ) : (
          <Flex
            className="household-ticker-track" pl={4} w="max-content"
            sx={{
              animation: `householdTicker ${Math.max(10, items.length * SECONDS_PER_ITEM)}s linear infinite`,
              '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
            }}
          >
            {track(0)}
            {track(1)}
          </Flex>
        )}
      </Flex>
    </Flex>
  )
}
