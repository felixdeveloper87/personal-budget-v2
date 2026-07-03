import { useMemo } from 'react'
import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import type { Transaction } from '../../../types'
import { merchantStats } from '../insights'
import Panel from './Panel'
import { fmtCurrency } from './format'

interface TopMerchantsProps {
  transactions: Transaction[]
}

const MAX_ROWS = 5

function isCommitmentTransaction(t: Transaction): boolean {
  return (
    Boolean(t.isInstallment) ||
    t.installmentPlanId != null ||
    Boolean(t.isRecurring) ||
    t.recurringTransactionId != null
  )
}

function isMerchantTransaction(t: Transaction): boolean {
  return (
    t.type === 'EXPENSE' &&
    !isCommitmentTransaction(t) &&
    Boolean(t.description?.trim())
  )
}

/**
 * Where money actually went: variable expenses grouped by description
 * ("merchant").
 */
export default function TopMerchants({ transactions }: TopMerchantsProps) {
  const { rows, maxTotal } = useMemo(() => {
    const merchantTransactions = transactions.filter(isMerchantTransaction)
    const current = merchantStats(merchantTransactions).slice(0, MAX_ROWS)

    return {
      rows: current,
      maxTotal: current[0]?.total ?? 0,
    }
  }, [transactions])

  return (
    <Panel h="full">
      <VStack align="stretch" spacing={4} h="full">
        <HStack justify="space-between">
          <Text
            fontFamily="var(--pb-mono)"
            fontSize="10.5px"
            letterSpacing="0.2em"
            textTransform="uppercase"
            color="var(--pb-ink-faint)"
          >
            Top merchants
          </Text>
        </HStack>

        {rows.length === 0 ? (
          <Text fontFamily="var(--pb-serif)" fontSize="sm" color="var(--pb-ink-faint)" py={6}>
            No merchants recorded for this month.
          </Text>
        ) : (
          <VStack align="stretch" spacing={3.5}>
            {rows.map((m) => (
              <MerchantRow
                key={m.key}
                name={m.name}
                count={m.count}
                total={m.total}
                share={maxTotal > 0 ? m.total / maxTotal : 0}
              />
            ))}
          </VStack>
        )}
      </VStack>
    </Panel>
  )
}

interface MerchantRowProps {
  name: string
  count: number
  total: number
  /** 0-1, relative to the biggest merchant in the list. */
  share: number
}

function MerchantRow({ name, count, total, share }: MerchantRowProps) {
  return (
    <VStack align="stretch" spacing={1.5}>
      <HStack justify="space-between" align="baseline" spacing={3}>
        <HStack align="baseline" spacing={2} minW={0}>
          <Text fontFamily="var(--pb-serif)" fontSize="sm" fontWeight={500} color="var(--pb-ink)" noOfLines={1}>
            {name}
          </Text>
          <Text fontFamily="var(--pb-mono)" fontSize="10px" color="var(--pb-ink-faint)" flexShrink={0}>
            x{count}
          </Text>
        </HStack>

        <HStack align="baseline" spacing={2} flexShrink={0}>
          <Text
            fontFamily="var(--pb-serif)"
            fontSize="sm"
            fontWeight={500}
            color="var(--pb-ink)"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {fmtCurrency(total)}
          </Text>
        </HStack>
      </HStack>

      <Box h="6px" borderRadius="4px" bg="var(--pb-surface-3)" overflow="hidden">
        <Box
          h="full"
          w={`${Math.max(share * 100, 2)}%`}
          borderRadius="4px"
          bgGradient="linear(to-r, var(--pb-forest), var(--pb-forest-2))"
          transition="width 0.5s ease"
        />
      </Box>
    </VStack>
  )
}
