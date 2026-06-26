import '../../styles/report-print.css'
import { useEffect, useState } from 'react'
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  SimpleGrid,
  Skeleton,
  VStack,
} from '@chakra-ui/react'
import { useReport } from '../../hooks/useReport'
import { useAuth } from '../../contexts/AuthContext'
import ReportHeader from '../../components/reports/ReportHeader'
import ReportKpiGrid from '../../components/reports/ReportKpiGrid'
import ReportInsights from '../../components/reports/ReportInsights'
import ReportCommitments from '../../components/reports/ReportCommitments'
import ReportCategoryList from '../../components/reports/ReportCategoryList'
import ReportPaymentMethodList from '../../components/reports/ReportPaymentMethodList'
import ReportMovementList from '../../components/reports/ReportMovementList'
import PrintActionBar from '../../components/reports/PrintActionBar'
import type { PeriodType, ReportResponse } from '../../types'

const VALID_PERIODS: PeriodType[] = ['day', 'week', 'month', 'year']

function readParams() {
  const search = new URLSearchParams(window.location.search)
  const rawPeriod = search.get('period')
  const period: PeriodType = VALID_PERIODS.includes(rawPeriod as PeriodType)
    ? (rawPeriod as PeriodType)
    : 'month'
  const rawDate = search.get('date') || search.get('referenceDate') || ''
  const date = rawDate ? new Date(`${rawDate}T00:00:00`) : new Date()
  const autoPrint = search.get('autoPrint') === 'true'
  return { period, date: Number.isNaN(date.getTime()) ? new Date() : date, autoPrint }
}

function ReportContent({ report, userName }: { report: ReportResponse; userName?: string }) {
  return (
    <VStack align="stretch" spacing={6}>
      <ReportHeader report={report} userName={userName} />
      <ReportKpiGrid report={report} />

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        <ReportInsights insights={report.insights} />
        <ReportCommitments report={report} />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        <ReportCategoryList title="Expense categories" items={report.expenseCategories} tone="expense" />
        <ReportCategoryList title="Income categories" items={report.incomeCategories} tone="income" />
      </SimpleGrid>

      <ReportPaymentMethodList items={report.paymentMethods} />
      <ReportMovementList report={report} />
    </VStack>
  )
}

function LoadingState() {
  return (
    <VStack align="stretch" spacing={6}>
      <Skeleton height="148px" borderRadius="2xl" />
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} height="112px" borderRadius="2xl" />
        ))}
      </SimpleGrid>
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        <Skeleton height="200px" borderRadius="2xl" />
        <Skeleton height="200px" borderRadius="2xl" />
      </SimpleGrid>
    </VStack>
  )
}

export default function ReportPrintPage() {
  const [params] = useState(readParams)
  const { report, isLoading, error } = useReport(params.period, params.date)
  const { user } = useAuth()

  useEffect(() => {
    if (params.autoPrint && report && !isLoading) {
      const timer = setTimeout(() => window.print(), 350)
      return () => clearTimeout(timer)
    }
  }, [params.autoPrint, report, isLoading])

  return (
    <Box className="report-print-root" py={{ base: 0, md: 6 }}>
      <PrintActionBar />
      <Box px={{ base: 3, md: 6 }} pt={{ base: 4, md: 6 }} pb={{ base: 8, md: 10 }}>
        <Box className="print-page" p={{ base: 5, md: 8 }}>
          {isLoading ? (
            <LoadingState />
          ) : error ? (
            <Alert status="error" borderRadius="xl" variant="subtle">
              <AlertIcon />
              <Box>
                <AlertTitle>Could not load report</AlertTitle>
                <AlertDescription fontSize="sm">
                  Make sure you are signed in and try again.
                </AlertDescription>
              </Box>
            </Alert>
          ) : report ? (
            <ReportContent report={report} userName={user?.name} />
          ) : (
            <Alert status="info" borderRadius="xl" variant="subtle">
              <AlertIcon />
              No report data available.
            </Alert>
          )}
        </Box>
      </Box>
    </Box>
  )
}
