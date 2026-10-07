import { Box, VStack, Spinner, Text } from '@chakra-ui/react'
import AllTransactionsSection from '../../sections/AllTransactionsSection'
import { useState, useEffect, type ReactNode } from 'react'
import { hasActiveFilters } from '../../utils/filters'
import { useAuth } from '../../contexts/AuthContext'
import { useSearch } from '../../contexts/SearchContext'
import { listTransactions, searchTransactions, listInstallmentPlans } from '../../api'
import { Transaction, InstallmentPlan } from '../../types'
import { mergeTransactionsWithFutureInstallments } from '../../utils/installments'
import { ToastService } from '../../services/toast'
import { useI18n } from '../../i18n'
import { PAGE_BOTTOM_PADDING } from '../dashboard/components/nu'
import '../dashboard/theme/pb-tokens.css'

export default function AllTransactionsPage() {
  const { t } = useI18n()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [installmentPlans, setInstallmentPlans] = useState<InstallmentPlan[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { filters } = useSearch()

  const textColor = 'var(--pb-ink-soft)'

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
        title: t('transactions.loadFailed'),
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

  const sheet = (children: ReactNode) => (
    <Box maxW="appContent" mx="auto" px={{ base: 0, md: 4, lg: 6 }} pt={{ base: 0, md: 5 }} pb={PAGE_BOTTOM_PADDING} minW={0}>
      <Box className="nu-dashboard" bg="var(--nu-page)" borderRadius={{ base: 0, md: '24px' }} overflow="hidden">
        {children}
      </Box>
    </Box>
  )

  if (loading) {
    return sheet(
      <VStack py={20} spacing={4}>
        <Spinner size="xl" color="var(--nu-brand, #820ad1)" thickness="3px" speed="0.8s" />
        <Text fontSize="sm" fontWeight={500} color={textColor}>
          {t('transactions.loading')}
        </Text>
      </VStack>,
    )
  }

  return sheet(
    <AllTransactionsSection
      transactions={transactions}
      hasFilters={hasActiveFilters(filters)}
      onRefresh={loadData}
    />,
  )
}
