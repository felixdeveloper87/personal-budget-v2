import { Box, VStack, Spinner, Text, useColorModeValue } from '@chakra-ui/react'
import AllTransactionsSection from '../../sections/AllTransactionsSection'
import { useState, useEffect } from 'react'
import { hasActiveFilters } from '../../utils/filters'
import { useAuth } from '../../contexts/AuthContext'
import { useSearch } from '../../contexts/SearchContext'
import { listTransactions, searchTransactions, listInstallmentPlans } from '../../api'
import { Transaction, InstallmentPlan } from '../../types'
import { mergeTransactionsWithFutureInstallments } from '../../utils/installments'
import { ToastService } from '../../services/toast'
import { PageHeader } from '../../components/ui'
import { ReceiptText } from '../../components/ui/icons'

export default function AllTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [installmentPlans, setInstallmentPlans] = useState<InstallmentPlan[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { filters } = useSearch()

  const spinnerColor = useColorModeValue('blue.500', 'blue.300')
  const textColor = useColorModeValue('gray.500', 'gray.400')

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
      ToastService.apiError(err, {
        title: 'Could not load transactions',
        dedupeKey: 'transactions-load-failed',
      })
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
      <Box
        px={{ base: 2, md: 4, lg: 6 }}
        py={{ base: 4, md: 7 }}
        maxW="appContent"
        mx="auto"
      >
        <VStack align="stretch" spacing={{ base: 4, md: 5 }}>
          <PageHeader
            icon={ReceiptText}
            title="All transactions"
            subtitle="Search, review and manage your complete transaction history."
          />
          <VStack py={20} spacing={4}>
            <Spinner
              size="xl"
              color={spinnerColor}
              thickness="3px"
              speed="0.8s"
            />
            <Text fontSize="sm" fontWeight={500} color={textColor}>
              Loading transactions...
            </Text>
          </VStack>
        </VStack>
      </Box>
    )
  }

  return (
    <Box
      px={{ base: 2, md: 4, lg: 6 }}
      py={{ base: 4, md: 7 }}
      maxW="appContent"
      mx="auto"
      minW={0}
    >
      <VStack align="stretch" spacing={{ base: 4, md: 5 }}>
        <PageHeader
          icon={ReceiptText}
          title="All transactions"
          subtitle="Search, review and manage your complete transaction history."
        />
        <AllTransactionsSection
          transactions={transactions}
          hasFilters={hasActiveFilters(filters)}
          onRefresh={loadData}
        />
      </VStack>
    </Box>
  )
}
