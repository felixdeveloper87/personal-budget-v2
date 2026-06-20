import { Box, Flex, Icon, IconButton, Text } from '@chakra-ui/react'
import type { FinancialAccount } from '../../../types'
import { Eye, EyeOff } from '../../../components/ui/icons'
import { money } from '../../../components/accounts/accountMeta'
import ShareRibbon from './ShareRibbon'

interface TotalHeroProps {
  accounts: FinancialAccount[]
  totalBalance: number
  hideBalances: boolean
  onToggleHide: () => void
}

export default function TotalHero({ accounts, totalBalance, hideBalances, onToggleHide }: TotalHeroProps) {
  const negative = totalBalance < 0
  return (
    <Box
      position="relative"
      overflow="hidden"
      bg="linear-gradient(168deg, var(--pb-surface), var(--pb-surface-2))"
      border="1px solid var(--pb-hair)"
      borderRadius="22px"
      boxShadow="0 1px 2px rgba(15,23,42,.05), 0 10px 28px rgba(15,23,42,.06)"
      p="clamp(1.2rem, 3vw, 1.7rem)"
    >
      <Box position="absolute" inset={0} borderRadius="inherit" pointerEvents="none" boxShadow="inset 0 1px 0 rgba(255,255,255,.6)" />

      {/* Guilloché accent bleeding off the right edge */}
      <Box
        as="svg"
        viewBox="0 0 200 200"
        aria-hidden
        position="absolute"
        right="-40px"
        top="50%"
        transform="translateY(-50%)"
        w="230px"
        h="230px"
        opacity={0.07}
        pointerEvents="none"
      >
        <g fill="none" stroke="var(--pb-forest-2)" strokeWidth={0.6}>
          <circle cx="100" cy="100" r="92" />
          <circle cx="100" cy="100" r="74" />
          <circle cx="100" cy="100" r="56" />
        </g>
      </Box>

      <Flex position="relative" zIndex={2} align="flex-start" justify="space-between" gap="1rem">
        <Box>
          <Text
            fontFamily="var(--pb-mono)"
            fontSize="10.5px"
            letterSpacing="0.2em"
            textTransform="uppercase"
            color="var(--pb-ink-faint)"
          >
            Total balance
          </Text>
          <Text
            className="num"
            fontSize="clamp(2.3rem, 7vw, 3.2rem)"
            fontWeight={500}
            lineHeight="1"
            letterSpacing="-0.02em"
            my="0.4rem"
            color={!hideBalances && negative ? 'var(--pb-coral)' : 'var(--pb-ink)'}
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {hideBalances ? '••••••' : money(totalBalance)}
          </Text>
          <Text color="var(--pb-ink-soft)" fontSize="0.95rem">
            Across all active accounts
          </Text>
        </Box>

        <IconButton
          aria-label={hideBalances ? 'Show balances' : 'Hide balances'}
          title={hideBalances ? 'Show balances' : 'Hide balances'}
          icon={<Icon as={hideBalances ? EyeOff : Eye} boxSize={5} />}
          onClick={onToggleHide}
          flexShrink={0}
          variant="ghost"
          borderRadius="11px"
          color="var(--pb-ink-soft)"
          bg="var(--pb-surface)"
          border="1px solid var(--pb-hair)"
          _hover={{ color: 'var(--pb-forest-2)', borderColor: 'var(--pb-hair-2)' }}
        />
      </Flex>

      {accounts.length > 0 && <ShareRibbon accounts={accounts} />}
    </Box>
  )
}
