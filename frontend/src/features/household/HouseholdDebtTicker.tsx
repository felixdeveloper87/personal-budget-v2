import { Box, Flex, Text } from '@chakra-ui/react'
import { Fragment } from 'react'
import { useI18n } from '../../i18n'
import type { HouseholdDebt } from '../../types'

const BRAND = '#820ad1'
/** Seconds each headline stays on the bar, so a longer list scrolls at the same speed. */
const SECONDS_PER_ITEM = 7

/** CNN-style headline bar: who owes whom, scrolling on a loop. Opens the balances. */
export function HouseholdDebtTicker({ debts, onOpen }: { debts: HouseholdDebt[]; onOpen: () => void }) {
  const { formatCurrency, t } = useI18n()
  const headlines = debts.map((debt) => (
    <Text as="span" whiteSpace="nowrap" fontSize="sm" color="white">
      <Text as="b" fontWeight={800}>{debt.fromMemberName}</Text>
      {' '}{t('household.ticker.owes')}{' '}
      <Text as="b" fontWeight={800} color="#ffd166">{formatCurrency(debt.amount)}</Text>
      {' '}{t('household.ticker.to')}{' '}
      <Text as="b" fontWeight={800}>{debt.toMemberName}</Text>
    </Text>
  ))
  const summary = debts.length
    ? debts.map((debt) => `${debt.fromMemberName} ${t('household.ticker.owes')} ${formatCurrency(debt.amount)} ${t('household.ticker.to')} ${debt.toMemberName}`).join('. ')
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
      as="button" type="button" onClick={onOpen} w="full" mt={3} h="40px" align="stretch" overflow="hidden"
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
              animation: `householdTicker ${Math.max(15, debts.length * SECONDS_PER_ITEM)}s linear infinite`,
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
