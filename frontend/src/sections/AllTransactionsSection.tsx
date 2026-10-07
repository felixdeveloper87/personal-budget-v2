import { TransactionList, TransactionListGrouped } from '../components'
import { Transaction } from '../types'
import { useState, useRef, useMemo } from 'react'
import {
  Box,
  Button,
  Flex,
  Icon,
  Text,
  VStack,
} from '@chakra-ui/react'
import { ReceiptText } from '../components/ui/icons'
import Segmented from '../features/dashboard/components/Segmented'
import { NuStatStrip } from '../features/commitments/components/nuCommitments'
import {
  getTransactionDate,
  type TransactionDateBasis,
} from '../utils/transactionDates'
import { useI18n } from '../i18n'

interface AllTransactionsSectionProps {
  transactions: Transaction[]
  hasFilters: boolean
  onRefresh: () => void
}

export default function AllTransactionsSection({
  transactions,
  hasFilters,
  onRefresh,
}: AllTransactionsSectionProps) {
  const { t } = useI18n()
  const [groupByMonth, setGroupByMonth] = useState(true)
  // All-transactions is a management view — fixed to the purchase-date basis;
  // the Behaviour/Payments lens split lives on its own pages now.
  const dateBasis: TransactionDateBasis = 'activity'
  const groupedListRef = useRef<{ goToCurrentMonth: () => void } | null>(null)

  const hasCurrentMonth = useMemo(() => {
    const now = new Date()
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    return transactions.some(t => {
      const date = getTransactionDate(t, dateBasis)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      return monthKey === currentMonthKey
    })
  }, [transactions, dateBasis])

  const viewOptions: Array<{ value: 'grouped' | 'list'; label: string }> = [
    { value: 'grouped', label: t('transactions.groupedView') },
    { value: 'list', label: t('transactions.listView') },
  ]

  return (
    <Box w="full" minW={0}>
      <Box px={{ base: 4, md: 6 }} pt={{ base: 5, md: 6 }} pb={{ base: 4, md: 5 }}>
        <NuStatStrip
          stats={[
            {
              label: t('nav.all-transactions.label'),
              value: t(transactions.length === 1 ? 'transactions.count' : 'transactions.countPlural', { count: transactions.length }),
            },
            ...(hasFilters ? [{ label: t('transactions.filtered'), value: '✓' }] : []),
          ]}
        />
        <Flex mt={4} align="center" justify="space-between" gap={3} flexWrap="wrap">
          <Segmented options={viewOptions} value={groupByMonth ? 'grouped' : 'list'} onChange={(v) => setGroupByMonth(v === 'grouped')} mobileFullWidth aria-label={t('transactions.groupedView')} />
          {groupByMonth && hasCurrentMonth && (
            <Button
              size="sm"
              variant="link"
              color="var(--nu-brand, #820ad1)"
              onClick={() => groupedListRef.current?.goToCurrentMonth()}
              fontSize="xs"
              fontWeight="700"
              _hover={{ textDecoration: 'none' }}
              display={{ base: 'none', lg: 'inline-flex' }}
            >
              {t('transactions.jumpToCurrentMonth')}
            </Button>
          )}
        </Flex>
      </Box>

      <Box borderTop="1px solid var(--pb-hair)" px={{ base: 2, sm: 3, md: 4, lg: 5 }} py={{ base: 3, md: 4 }}>
        {transactions.length === 0 ? (
          <EmptyState />
        ) : groupByMonth ? (
          <TransactionListGrouped
            ref={groupedListRef}
            transactions={transactions}
            onTransactionDeleted={onRefresh}
            dateBasis={dateBasis}
          />
        ) : (
          <TransactionList
            transactions={transactions}
            onTransactionDeleted={onRefresh}
            dateBasis={dateBasis}
          />
        )}
      </Box>
    </Box>
  )
}

/* -------------------------------------------------------------------------- */
/* Sub-components                                                              */
/* -------------------------------------------------------------------------- */

function EmptyState() {
  const { t } = useI18n()
  const textColor = 'var(--pb-ink-soft)'
  const iconColor = 'var(--pb-ink-faint)'

  return (
    <VStack spacing={3} py={16} align="center">
      <Flex
        w={14}
        h={14}
        align="center"
        justify="center"
        borderRadius="2xl"
        bg="var(--pb-surface-2)"
        border="1px solid var(--pb-hair)"
      >
        <Icon as={ReceiptText} boxSize={7} color={iconColor} weight="duotone" />
      </Flex>
      <VStack spacing={1}>
        <Text fontSize="md" fontWeight={700} color={textColor}>
          {t('transactions.emptyTitle')}
        </Text>
        <Text fontSize="sm" color={textColor} opacity={0.7} maxW="320px" textAlign="center">
          {t('transactions.emptyHistory')}
        </Text>
      </VStack>
    </VStack>
  )
}
