import { Box, VStack, Spinner, Text } from '@chakra-ui/react'
import AllTransactionsSection from '../sections/AllTransactionsSection'
import { useState, useEffect } from 'react'
import { hasActiveFilters } from '../utils/filters'
import { useAuth } from '../contexts/AuthContext'
import { useSearch } from '../contexts/SearchContext'
import { listTransactions, searchTransactions, listInstallmentPlans } from '../api'
import { Transaction, InstallmentPlan } from '../types'
import { mergeTransactionsWithFutureInstallments } from '../utils/installments'

export default function AllTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [installmentPlans, setInstallmentPlans] = useState<InstallmentPlan[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { filters } = useSearch()

  const loadData = async () => {
    if (!user?.token) return
    setLoading(true)
    try {
      let realTransactions: Transaction[] = []
      
      if (hasActiveFilters(filters)) {
        realTransactions = await searchTransactions(filters ?? {})
      } else {
        realTransactions = await listTransactions()
      }
      
      // Load installment plans to calculate future installments
      const plans = await listInstallmentPlans()
      setInstallmentPlans(plans)
      
      // Merge real transactions with future installments
      const allTransactions = mergeTransactionsWithFutureInstallments(realTransactions, plans)
      setTransactions(allTransactions)
    } catch (err) {
      console.error(err)
      setTransactions([])
      setInstallmentPlans([])
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
    <Box>
      <AllTransactionsSection
        transactions={transactions}
        hasFilters={hasActiveFilters(filters)}
        onRefresh={loadData}
      />
    </Box>
  )
}
