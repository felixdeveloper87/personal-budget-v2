import { Box, VStack, Spinner, Text } from '@chakra-ui/react'
import { AllTransactionsCard, TransactionList, TransactionListGrouped } from '../components'
import { useState, useEffect } from 'react'
import { hasActiveFilters } from '../utils/filters'
import { useAuth } from '../contexts/AuthContext'
import { useSearch } from '../contexts/SearchContext'
import { listTransactions, searchTransactions } from '../api'
import { Transaction } from '../types'

export default function AllTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { filters } = useSearch()
  const [groupByMonth, setGroupByMonth] = useState(false)

  const loadData = async () => {
    if (!user?.token) return
    setLoading(true)
    try {
      if (hasActiveFilters(filters)) {
        const filtered = await searchTransactions(filters ?? {})
        setTransactions(filtered)
      } else {
        const transactionsData = await listTransactions()
        setTransactions(transactionsData)
      }
    } catch (err) {
      console.error(err)
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user?.token, filters])

  if (loading) {
    return (
      <Box px={{ base: 4, md: 8, lg: 12 }} py={{ base: 4, md: 8 }}>
        <VStack py={20}>
          <Spinner size="xl" />
          <Text>Loading transactions...</Text>
        </VStack>
      </Box>
    )
  }

  return (
    <Box px={{ base: 4, md: 8, lg: 12 }} py={{ base: 4, md: 8 }}>
      <VStack spacing={6} align="stretch">
        <AllTransactionsCard
          title="All Transactions"
          count={transactions.length}
          filtered={hasActiveFilters(filters)}
          groupByMonth={groupByMonth}
          onGroupByMonthChange={setGroupByMonth}
        >
          {groupByMonth ? (
            <TransactionListGrouped
              transactions={transactions}
              onTransactionDeleted={loadData}
            />
          ) : (
            <TransactionList
              transactions={transactions}
              onTransactionDeleted={loadData}
            />
          )}
        </AllTransactionsCard>
      </VStack>
    </Box>
  )
}
