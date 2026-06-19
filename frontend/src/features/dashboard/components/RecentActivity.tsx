import { useMemo } from 'react'
import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import type { Transaction } from '../../../types'
import type { TransactionDateBasis } from '../../../utils/transactionDates'
import { getTransactionDate } from '../../../utils/transactionDates'
import type { AppPage } from '../../../components/layout/header/navigation.config'
import Panel from './Panel'
import { fmtCurrency } from './format'

interface RecentActivityProps {
  transactions: Transaction[]
  dateBasis: TransactionDateBasis
  onPageChange?: (page: AppPage) => void
  limit?: number
}

export default function RecentActivity({
  transactions,
  dateBasis,
  onPageChange,
  limit = 6,
}: RecentActivityProps) {
  const items = useMemo(() => {
    return [...transactions]
      .sort(
        (a, b) =>
          getTransactionDate(b, dateBasis).getTime() -
          getTransactionDate(a, dateBasis).getTime(),
      )
      .slice(0, limit)
  }, [transactions, dateBasis, limit])

  const clickable = !!onPageChange

  return (
    <Panel
      h="full"
      interactive={clickable}
      onClick={clickable ? () => onPageChange?.('transactions') : undefined}
    >
      <VStack align="stretch" spacing={4}>
        <Text
          fontFamily="var(--pb-mono)"
          fontSize="10.5px"
          letterSpacing="0.2em"
          textTransform="uppercase"
          color="var(--pb-ink-faint)"
        >
          Recent activity
        </Text>

        <VStack align="stretch" spacing={0} divider={<Box borderBottom="1px solid var(--pb-hair)" />}>
          {items.length === 0 ? (
            <Text fontFamily="var(--pb-serif)" fontSize="sm" color="var(--pb-ink-faint)" py={4}>
              No activity yet.
            </Text>
          ) : (
            items.map((t) => {
              const income = t.type === 'INCOME'
              const Icon = income ? ArrowUpRight : ArrowDownLeft
              const date = getTransactionDate(t, dateBasis)
              return (
                <HStack key={t.id ?? `${t.description}-${t.dateTime}`} justify="space-between" py={3} spacing={3}>
                  <HStack spacing={3} minW={0}>
                    <Box
                      w={7}
                      h={7}
                      borderRadius="10px"
                      bg={income ? 'var(--pb-tint-income)' : 'var(--pb-tint-coral)'}
                      border="1px solid var(--pb-hair)"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      flexShrink={0}
                    >
                      <Icon size={13} color={income ? 'var(--pb-income-2)' : 'var(--pb-coral)'} />
                    </Box>
                    <VStack align="stretch" spacing={0} minW={0}>
                      <Text fontFamily="var(--pb-serif)" fontSize="sm" color="var(--pb-ink)" noOfLines={1}>
                        {t.description || t.category}
                      </Text>
                      <Text fontFamily="var(--pb-mono)" fontSize="10px" color="var(--pb-ink-faint)" letterSpacing="0.06em" noOfLines={1}>
                        {t.category} · {date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </Text>
                    </VStack>
                  </HStack>
                  <Text
                    fontFamily="var(--pb-mono)"
                    fontSize="13px"
                    fontWeight={500}
                    color={income ? 'var(--pb-income-2)' : 'var(--pb-ink-soft)'}
                    flexShrink={0}
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {income ? '+' : '−'}
                    {fmtCurrency(t.amount)}
                  </Text>
                </HStack>
              )
            })
          )}
        </VStack>
      </VStack>
    </Panel>
  )
}
