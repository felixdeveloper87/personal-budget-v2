// Dashboard.tsx
import { useEffect, useState, useCallback } from 'react'
import {
  Box,
  Heading,
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  VStack,
  HStack,
} from '@chakra-ui/react'
import TransactionForm from '../components/TransactionForm'
import SingleRowSummary from '../components/SingleRowSummary'
import TransactionList from '../components/TransactionList'
import PeriodNavigator, { PeriodType } from '../components/PeriodNavigator'
import SummaryChart from '../components/SummaryChart'
import CategoryTabsChart from '../components/CategoryTabsChart'
import { getMonthlySummary, listTransactions } from '../api'
import { Transaction, MonthlySummary } from '../types'
import { useAuth } from '../contexts/AuthContext'
import { usePeriodData } from '../hooks/usePeriodData'

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [monthSummary, setMonthSummary] = useState<MonthlySummary | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('month')
  const { user } = useAuth()

  const periodData = usePeriodData(transactions, monthSummary, selectedPeriod, selectedDate)

  const convertMonthlySummary = useCallback((summary: any): MonthlySummary => {
    if (!summary)
      return { year: 0, month: 0, totalIncome: 0, totalExpense: 0, balance: 0, byCategory: [] }

    return {
      year: summary.year || 0,
      month: summary.month || 0,
      totalIncome: Number(summary.totalIncome) || 0,
      totalExpense: Number(summary.totalExpense) || 0,
      balance: Number(summary.balance) || 0,
      byCategory:
        summary.byCategory?.map((cat: any) => ({
          category: cat.category || '',
          income: Number(cat.income) || 0,
          expense: Number(cat.expense) || 0,
        })) || [],
    }
  }, [])

  const loadData = useCallback(async () => {
    if (!user?.token) return
    try {
      const [transactionsData, summaryData] = await Promise.all([
        listTransactions(user.token),
        getMonthlySummary(selectedDate, user.token),
      ])
      setTransactions(transactionsData)
      setMonthSummary(convertMonthlySummary(summaryData))
    } catch (error) {
      setTransactions([])
      setMonthSummary(null)
    }
  }, [user?.token, selectedDate, convertMonthlySummary])

  useEffect(() => {
    loadData()
  }, [loadData])

  return (
    <Box px={{ base: 4, md: 8, lg: 12 }} py={{ base: 4, md: 8 }}>
      <Accordion defaultIndex={[0, 1, 2, 3, 4]} allowMultiple>
        {/* Transaction Form */}
        <AccordionItem border="none">
          <h2>
            <AccordionButton px={4} py={3} borderRadius="xl" _expanded={{ bg: 'blue.500', color: 'white' }}>
              <Box flex="1" textAlign="left" fontWeight="semibold">
                Transaction Form
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={6}>
            <TransactionForm transactions={transactions} onCreated={loadData} onTransactionDeleted={loadData} />
          </AccordionPanel>
        </AccordionItem>

        {/* Period Navigator */}
        <AccordionItem border="none">
          <h2>
            <AccordionButton px={4} py={3} borderRadius="xl" _expanded={{ bg: 'blue.500', color: 'white' }}>
              <Box flex="1" textAlign="left" fontWeight="semibold">
                Period Navigator
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={6}>
            <PeriodNavigator
              selectedPeriod={selectedPeriod}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              onPeriodChange={setSelectedPeriod}
              periodLabel={periodData.label}
            />
          </AccordionPanel>
        </AccordionItem>

        {/* Summary */}
        <AccordionItem border="none">
          <h2>
            <AccordionButton px={4} py={3} borderRadius="xl" _expanded={{ bg: 'blue.500', color: 'white' }}>
              <Box flex="1" textAlign="left" fontWeight="semibold">
                Summary
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={6}>
            <SingleRowSummary periodData={periodData} />
          </AccordionPanel>
        </AccordionItem>

        {/* Charts */}
        <AccordionItem border="none">
          <h2>
            <AccordionButton px={4} py={3} borderRadius="xl" _expanded={{ bg: 'blue.500', color: 'white' }}>
              <Box flex="1" textAlign="left" fontWeight="semibold">
                Charts
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={6}>
            <VStack spacing={6}>
              <Box w="full" p={6} rounded="2xl" borderWidth="1px" shadow="lg" bg="white" _dark={{ bg: '#111111' }}>
                <SummaryChart
                  income={periodData.income}
                  expense={periodData.expense}
                  balance={periodData.balance}
                  selectedPeriod={selectedPeriod}
                />
              </Box>

              <Box w="full" rounded="2xl" borderWidth="1px" shadow="lg" bg="white" _dark={{ bg: '#111111' }}>
                <CategoryTabsChart transactions={periodData.transactions} selectedPeriod={selectedPeriod} />
              </Box>
            </VStack>
          </AccordionPanel>
        </AccordionItem>

        {/* Transactions List */}
        <AccordionItem border="none">
          <h2>
            <AccordionButton px={4} py={3} borderRadius="xl" _expanded={{ bg: 'blue.500', color: 'white' }}>
              <Box flex="1" textAlign="left" fontWeight="semibold">
                Transactions
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={6}>
            <Box p={4} rounded="2xl" borderWidth="1px" shadow="lg" bg="white" _dark={{ bg: '#111111' }}>
              <HStack justify="space-between" mb={6}>
                <Heading size="md">Transactions ({selectedPeriod})</Heading>
                <Text fontSize="sm" color="gray.500" _dark={{ color: 'gray.400' }}>
                  {periodData.transactions.length} transactions
                </Text>
              </HStack>
              <TransactionList transactions={periodData.transactions} onTransactionDeleted={loadData} />
            </Box>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  )
}
