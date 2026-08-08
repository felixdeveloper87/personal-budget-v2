import { useMemo } from 'react'
import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import MerchantLogo from '../../../components/ui/MerchantLogo'
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
  const { rows, merchantTotal, merchantCount, transactionCount } = useMemo(() => {
    const merchantTransactions = transactions.filter(isMerchantTransaction)
    const allMerchants = merchantStats(merchantTransactions)
    return {
      rows: allMerchants.slice(0, MAX_ROWS),
      merchantTotal: allMerchants.reduce((sum, merchant) => sum + merchant.total, 0),
      merchantCount: allMerchants.length,
      transactionCount: allMerchants.reduce((sum, merchant) => sum + merchant.count, 0),
    }
  }, [transactions])

  return (
    <Panel h="full">
      <VStack align="stretch" spacing={4} h="full">
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
            <VStack align="flex-end" spacing={0.5}>
              <Text fontFamily="var(--pb-mono)" fontSize="9px" letterSpacing="0.13em" textTransform="uppercase" color="var(--pb-ink-faint)">
                Tracked spend
              </Text>
              <Text fontFamily="var(--pb-serif)" fontSize="xl" fontWeight={500} lineHeight={1} color="var(--pb-ink)" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {fmtCurrency(merchantTotal)}
              </Text>
              <Text fontFamily="var(--pb-mono)" fontSize="8.5px" color="var(--pb-ink-faint)" textAlign="right">
                {merchantCount} merchant{merchantCount === 1 ? '' : 's'} · {transactionCount} transaction{transactionCount === 1 ? '' : 's'}
              </Text>
            </VStack>
          )}
        </HStack>

        {rows.length === 0 ? (
          <Text fontFamily="var(--pb-serif)" fontSize="sm" color="var(--pb-ink-faint)" py={6}>
            No merchants recorded for this month.
          </Text>
        ) : (
          <VStack align="stretch" spacing={0.75} flex={1}>
            {rows.map((merchant, index) => (
              <MerchantRow
                key={merchant.key}
                rank={index + 1}
                name={merchant.name}
                count={merchant.count}
                total={merchant.total}
                share={merchantTotal > 0 ? merchant.total / merchantTotal : 0}
                isLeading={index === 0}
              />
            ))}
          </VStack>
        )}
      </VStack>
    </Panel>
  )
}

interface MerchantRowProps {
  rank: number
  name: string
  count: number
  total: number
  /** 0-1, share of all variable merchant spending in the period. */
  share: number
  isLeading: boolean
}

function MerchantRow({ rank, name, count, total, share, isLeading }: MerchantRowProps) {
  const percentage = Math.round(share * 100)

  return (
    <Box
      px={{ base: 2.5, md: 3 }}
      py={isLeading ? 2.75 : 1.75}
      borderRadius="14px"
      bg={isLeading ? 'var(--pb-tint-green)' : 'transparent'}
      border="1px solid"
      borderColor={isLeading ? 'var(--pb-hair-2)' : 'transparent'}
    >
      <HStack align="flex-start" spacing={3}>
        <Box position="relative" w="36px" h="36px" flexShrink={0}>
          <MerchantLogo name={name} size={36} borderRadius="11px" />
          <Box
            position="absolute"
            right="-5px"
            bottom="-5px"
            minW="18px"
            h="18px"
            px="3px"
            display="grid"
            placeItems="center"
            borderRadius="full"
            bg={isLeading ? 'var(--pb-forest-2)' : 'var(--pb-surface)'}
            color={isLeading ? 'var(--pb-on-accent)' : 'var(--pb-ink-faint)'}
            border="1px solid"
            borderColor={isLeading ? 'var(--pb-forest-2)' : 'var(--pb-hair-2)'}
            boxShadow="0 1px 4px rgba(0,0,0,0.18)"
          >
            <Text fontFamily="var(--pb-mono)" fontSize="8px" fontWeight={700} lineHeight={1}>
              {rank}
            </Text>
          </Box>
        </Box>

        <Box minW={0} flex={1}>
          <HStack justify="space-between" align="flex-start" spacing={4}>
            <Box minW={0}>
              <Text
                fontFamily="var(--pb-serif)"
                fontSize={isLeading ? 'lg' : 'md'}
                fontWeight={500}
                lineHeight={1.15}
                color="var(--pb-ink)"
                noOfLines={1}
              >
                {name}
              </Text>
              <Text mt={1} fontFamily="var(--pb-mono)" fontSize="8.5px" color="var(--pb-ink-faint)">
                {count} transaction{count === 1 ? '' : 's'}
              </Text>
            </Box>

            <VStack align="flex-end" spacing={0.5} flexShrink={0}>
              <Text
                fontFamily="var(--pb-serif)"
                fontSize={isLeading ? 'lg' : 'md'}
                fontWeight={600}
                lineHeight={1.1}
                color="var(--pb-ink)"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {fmtCurrency(total)}
              </Text>
              <Text fontFamily="var(--pb-mono)" fontSize="8.5px" color={isLeading ? 'var(--pb-forest-2)' : 'var(--pb-ink-faint)'} style={{ fontVariantNumeric: 'tabular-nums' }}>
                {percentage}% of total
              </Text>
            </VStack>
          </HStack>

          <Box
            role="progressbar"
            aria-label={`${name}: ${percentage}% of tracked merchant spending`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percentage}
            mt={2}
            h={isLeading ? '5px' : '4px'}
            borderRadius="full"
            bg="var(--pb-surface-3)"
            overflow="hidden"
          >
            <Box
              h="full"
              w={`max(${percentage}%, 8px)`}
              borderRadius="full"
              bgGradient={isLeading
                ? 'linear(to-r, var(--pb-forest-2), var(--pb-line))'
                : 'linear(to-r, var(--pb-forest), var(--pb-forest-2))'}
              opacity={isLeading ? 1 : 0.78}
              transition="width 0.5s ease"
            />
          </Box>
        </Box>
      </HStack>
    </Box>
  )
}
