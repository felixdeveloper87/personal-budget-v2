import { Box, Flex, HStack, Text } from '@chakra-ui/react'
import type { FinancialAccount } from '../../../types'
import { accountColor } from '../data/accountVisual'

interface ShareRibbonProps {
  accounts: FinancialAccount[]
  hidden: boolean
}

/** Stacked share bar + legend showing each account's portion of the positive total. */
export default function ShareRibbon({ accounts, hidden }: ShareRibbonProps) {
  const positiveTotal = accounts.reduce((s, a) => s + Math.max(0, a.currentBalance), 0) || 1
  const segments = accounts
    .map((a) => ({ account: a, share: (Math.max(0, a.currentBalance) / positiveTotal) * 100 }))
    .filter((s) => s.share > 0)

  return (
    <Box position="relative" zIndex={2} mt={{ base: 4, sm: 4.5 }} pt={3.5} borderTop="1px solid var(--pb-summary-line)">
      <Flex align="flex-end" justify="space-between" gap={3}>
        <Box>
          <Text
            fontFamily="var(--pb-mono)"
            fontSize="9px"
            fontWeight={600}
            letterSpacing="0.12em"
            textTransform="uppercase"
            color="var(--pb-summary-ink-faint)"
          >
            Balance allocation
          </Text>
          <Text mt={0.5} fontFamily="var(--pb-serif)" fontSize="xs" color="var(--pb-summary-ink-soft)">
            Share of positive balances by account
          </Text>
        </Box>
        {!hidden && segments.length > 0 && (
          <Text flexShrink={0} fontFamily="var(--pb-mono)" fontSize="8.5px" color="var(--pb-summary-ink-faint)">
            {segments.length} account{segments.length !== 1 ? 's' : ''}
          </Text>
        )}
      </Flex>

      {hidden ? (
        <Flex
          mt={3}
          minH="42px"
          align="center"
          justify="center"
          borderRadius="10px"
          border="1px dashed var(--pb-summary-line)"
          bg="var(--pb-summary-panel)"
        >
          <Text fontFamily="var(--pb-mono)" fontSize="9px" letterSpacing="0.05em" color="var(--pb-summary-ink-faint)">
            Show balances to view allocation
          </Text>
        </Flex>
      ) : segments.length === 0 ? (
        <Flex
          mt={3}
          minH="42px"
          align="center"
          justify="center"
          borderRadius="10px"
          border="1px dashed var(--pb-summary-line)"
          bg="var(--pb-summary-panel)"
        >
          <Text fontFamily="var(--pb-mono)" fontSize="9px" color="var(--pb-summary-ink-faint)">
            No positive balances to allocate
          </Text>
        </Flex>
      ) : (
        <>
          <Flex
            h="9px"
            mt={3}
            borderRadius="7px"
            overflow="hidden"
            border="1px solid var(--pb-summary-line)"
            bg="var(--pb-summary-panel)"
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
                borderLeft={i > 0 ? '1.5px solid var(--pb-summary-petrol)' : undefined}
                title={s.account.name}
                transition="width 0.6s cubic-bezier(.2,.7,.2,1)"
              />
            ))}
          </Flex>

          <Flex flexWrap="wrap" gap="0.45rem" mt="0.85rem">
            {segments.map((s) => (
              <HStack
                key={s.account.id}
                spacing="0.45rem"
                px={2.5}
                py={1.5}
                borderRadius="full"
                border="1px solid var(--pb-summary-line)"
                bg="var(--pb-summary-panel)"
                fontSize="0.88rem"
                color="var(--pb-summary-ink-soft)"
              >
                <Box w="10px" h="10px" borderRadius="3px" flexShrink={0} bg={accountColor(s.account)} />
                <Text as="b" fontWeight={500} color="var(--pb-summary-ink)">
                  {s.account.institution || s.account.name}
                </Text>
                <Text
                  className="num"
                  fontFamily="var(--pb-mono)"
                  fontSize="11px"
                  color="var(--pb-summary-ink-faint)"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {s.share.toFixed(1)}%
                </Text>
              </HStack>
            ))}
          </Flex>
        </>
      )}
    </Box>
  )
}
