import { Box, Flex, HStack, Text } from '@chakra-ui/react'
import type { FinancialAccount } from '../../../types'
import { accountColor } from '../data/accountVisual'

interface ShareRibbonProps {
  accounts: FinancialAccount[]
}

/** Stacked share bar + legend showing each account's portion of the positive total. */
export default function ShareRibbon({ accounts }: ShareRibbonProps) {
  const positiveTotal = accounts.reduce((s, a) => s + Math.max(0, a.currentBalance), 0) || 1
  const segments = accounts
    .map((a) => ({ account: a, share: (Math.max(0, a.currentBalance) / positiveTotal) * 100 }))
    .filter((s) => s.share > 0)

  return (
    <Box position="relative" zIndex={2}>
      <Flex
        h="13px"
        mt="1.2rem"
        borderRadius="7px"
        overflow="hidden"
        border="1px solid var(--pb-hair)"
        bg="var(--pb-surface-2)"
        boxShadow="inset 0 1px 2px rgba(15,23,42,.06)"
        role="img"
        aria-label="Share of total balance by account"
      >
        {segments.map((s, i) => (
          <Box
            key={s.account.id}
            h="100%"
            w={`${s.share}%`}
            bg={accountColor(s.account)}
            borderLeft={i > 0 ? '1.5px solid var(--pb-surface)' : undefined}
            title={s.account.name}
            transition="width 0.6s cubic-bezier(.2,.7,.2,1)"
          />
        ))}
      </Flex>

      <Flex flexWrap="wrap" gap="0.45rem 1.4rem" mt="0.85rem">
        {segments.map((s) => (
          <HStack key={s.account.id} spacing="0.45rem" fontSize="0.88rem" color="var(--pb-ink-soft)">
            <Box w="10px" h="10px" borderRadius="3px" flexShrink={0} bg={accountColor(s.account)} />
            <Text as="b" fontWeight={500} color="var(--pb-ink)">
              {s.account.institution || s.account.name}
            </Text>
            <Text
              className="num"
              fontFamily="var(--pb-mono)"
              fontSize="11px"
              color="var(--pb-ink-faint)"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {s.share.toFixed(1)}%
            </Text>
          </HStack>
        ))}
      </Flex>
    </Box>
  )
}
