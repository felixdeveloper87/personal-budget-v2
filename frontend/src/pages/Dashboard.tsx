import { useEffect, useState, useCallback, useMemo } from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Flex,
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

  // Processa dados do períodoo
  const periodData = usePeriodData(
    transactions,
    monthSummary,
    selectedPeriod,
    selectedDate
  )

  // Converte valores numéricos do backend - memoized to prevent recreation
  const convertMonthlySummary = useCallback((summary: any): MonthlySummary => {
    if (!summary)
      return {
        year: 0,
        month: 0,
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        byCategory: [],
      }

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

  // Carrega dados iniciais
  useEffect(() => {
    if (!user?.token) return

    const loadData = async () => {
      try {
        const [transactionsData, summaryData] = await Promise.all([
          listTransactions(user.token),
          getMonthlySummary(selectedDate, user.token)
        ])
        setTransactions(transactionsData)
        setMonthSummary(convertMonthlySummary(summaryData))
      } catch (error) {
        setTransactions([])
        setMonthSummary(null)
      }
    }

    loadData()
  }, [selectedDate, user?.token, convertMonthlySummary])

  // Funções de atualização - memoized to prevent recreation
  const refreshData = useCallback(async () => {
    if (!user?.token) return
    
    try {
      const [transactionsData, summaryData] = await Promise.all([
        listTransactions(user.token),
        getMonthlySummary(selectedDate, user.token)
      ])
      setTransactions(transactionsData)
      setMonthSummary(convertMonthlySummary(summaryData))
    } catch (error) {
      setTransactions([])
      setMonthSummary(null)
    }
  }, [user?.token, selectedDate, convertMonthlySummary])

  return (
    <Container
      maxW={{
        base: "100%",
        md: "4xl",
        lg: "6xl",
        xl: "7xl",
        "2xl": "8xl",
        "3xl": "container.3xl", // novo breakpoint para telas >1800px
      }}
      py={{ base: 4, md: 6 }}
      px={{ base: 4, md: 6 }}
    >
      {/* Formulário de transações */}
      <TransactionForm
        transactions={transactions}
        onCreated={refreshData}
        onTransactionDeleted={refreshData}
      />

      {/* Time Period and Navigation */}
      <Box mt={6}>
        <PeriodNavigator
          selectedPeriod={selectedPeriod}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onPeriodChange={setSelectedPeriod}
          periodLabel={periodData.label}
        />
      </Box>

      {/* Financial Summary - Single Row */}
      <Box mt={6}>
        <SingleRowSummary periodData={periodData} />
      </Box>

      {/* Gráficos */}
      <Flex
        gap={{ base: 4, md: 6 }}
        mt={6}
        direction={{ base: 'column', lg: 'row' }}
        align="stretch"
      >
        <Box
          flex="1"
          p={{ base: 6, md: 8 }}
          rounded="2xl"
          borderWidth="1px"
          borderColor="gray.200"
          bg="white"
          shadow="lg"
          _dark={{
            bg: "#111111",
            borderColor: "gray.800",
          }}
        >
          <SummaryChart
            income={periodData.income}
            expense={periodData.expense}
            balance={periodData.balance}
            selectedPeriod={selectedPeriod}
          />
        </Box>

        <Box
          flex="1"
          rounded="2xl"
          borderWidth="1px"
          borderColor="gray.200"
          bg="white"
          shadow="lg"
          overflow="hidden"
          _dark={{
            bg: "#111111",
            borderColor: "gray.800",
          }}
        >
          <CategoryTabsChart
            transactions={periodData.transactions}
            selectedPeriod={selectedPeriod}
          />
        </Box>
      </Flex>

      {/* Lista de transações */}
      <Box 
        mt={6} 
        p={{ base: 6, md: 8 }} 
        rounded="2xl" 
        borderWidth="1px" 
        borderColor="gray.200"
        bg="white"
        shadow="lg"
        _dark={{
          bg: "#111111",
          borderColor: "gray.800",
        }}
      >
        <HStack justify="space-between" mb={6} wrap="wrap" gap={2}>
          <Heading size={{ base: 'md', md: 'lg' }} color="gray.700" _dark={{ color: "gray.200" }}>
            Transactions ({selectedPeriod})
          </Heading>
          <Text fontSize="sm" color="gray.500" _dark={{ color: "gray.400" }}>
            {periodData.transactions.length} transactions
          </Text>
        </HStack>
        <TransactionList
          transactions={periodData.transactions}
          onTransactionDeleted={refreshData}
        />
      </Box>
    </Container>
  )
}
