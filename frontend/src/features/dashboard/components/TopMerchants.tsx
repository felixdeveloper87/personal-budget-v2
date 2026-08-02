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

function isCommitmentTransaction(transaction: Transaction): boolean {
  return Boolean(transaction.isInstallment)
    || transaction.installmentPlanId != null
    || Boolean(transaction.isRecurring)
    || transaction.recurringTransactionId != null
}

function isMerchantTransaction(transaction: Transaction): boolean {
  return transaction.type === 'EXPENSE'
    && !isCommitmentTransaction(transaction)
    && Boolean(transaction.description?.trim())
}

/** Where discretionary money went, grouped by the transaction description. */
export default function TopMerchants({ transactions }: TopMerchantsProps) {
  const { rows, merchantTotal } = useMemo(() => {
    const merchantTransactions = transactions.filter(isMerchantTransaction)
    const allMerchants = merchantStats(merchantTransactions)
    return {
      rows: allMerchants.slice(0, MAX_ROWS),
      merchantTotal: allMerchants.reduce((sum, merchant) => sum + merchant.total, 0),
    }
  }, [transactions])

  return (
    <Panel h="full">
      <VStack align="stretch" spacing={5} h="full">
        <HStack justify="space-between" align="flex-start">
          <Text
            fontFamily="var(--pb-mono)"
            fontSize="10.5px"
            letterSpacing="0.2em"
            textTransform="uppercase"
            color="var(--pb-ink-faint)"
          >
            Top merchants
          </Text>
          {rows.length > 0 && (
            <VStack align="flex-end" spacing={0}>
              <Text fontFamily="var(--pb-mono)" fontSize="9px" letterSpacing="0.13em" textTransform="uppercase" color="var(--pb-ink-faint)">
                Merchant spend
              </Text>
              <Text fontFamily="var(--pb-serif)" fontSize="lg" fontWeight={500} color="var(--pb-ink)" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {fmtCurrency(merchantTotal)}
              </Text>
            </VStack>
          )}
        </HStack>

        {rows.length === 0 ? (
          <Text fontFamily="var(--pb-serif)" fontSize="sm" color="var(--pb-ink-faint)" py={6}>
            No merchants recorded for this month.
          </Text>
        ) : (
          <VStack align="stretch" spacing={0} divider={<Box borderBottom="1px solid var(--pb-hair)" />} flex={1}>
            {rows.map((merchant) => (
              <MerchantRow
                key={merchant.key}
                name={merchant.name}
                count={merchant.count}
                total={merchant.total}
                share={merchantTotal > 0 ? merchant.total / merchantTotal : 0}
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
  /** 0-1, share of all variable merchant spending in the period. */
  share: number
}

function MerchantRow({ name, count, total, share }: MerchantRowProps) {
  const percentage = Math.round(share * 100)

  return (
    <Box py={2.5}>
      <HStack justify="space-between" align="baseline" spacing={3}>
        <HStack align="baseline" spacing={2} minW={0}>
          <Text fontFamily="var(--pb-serif)" fontSize="md" fontWeight={500} color="var(--pb-ink)" noOfLines={1}>
            {name}
          </Text>
          <Text fontFamily="var(--pb-mono)" fontSize="9.5px" color="var(--pb-ink-faint)" flexShrink={0}>
            {count}×
          </Text>
        </HStack>
        <HStack align="baseline" spacing={2} flexShrink={0}>
          <Text fontFamily="var(--pb-mono)" fontSize="9.5px" color="var(--pb-ink-faint)" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {percentage}%
          </Text>
          <Text fontFamily="var(--pb-serif)" fontSize="md" fontWeight={500} color="var(--pb-ink)" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {fmtCurrency(total)}
          </Text>
        </HStack>
      </HStack>
      <Box mt={2} h="4px" borderRadius="full" bg="var(--pb-surface-3)" overflow="hidden">
        <Box
          h="full"
          w={`${Math.max(percentage, 2)}%`}
          borderRadius="full"
          bgGradient="linear(to-r, var(--pb-forest), var(--pb-income-2))"
          transition="width 0.5s ease"
        />
      </Box>
    </Box>
  )
}
