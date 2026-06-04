import { SimpleGrid } from '@chakra-ui/react'
import ReportKpiCard from './ReportKpiCard'
import { formatCurrency, pluralize } from './format'
import type { ReportResponse } from '../../types'

export default function ReportKpiGrid({ report }: { report: ReportResponse }) {
  return (
    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} className="avoid-break">
      <ReportKpiCard
        label="Income"
        value={formatCurrency(report.totalIncome)}
        detail={pluralize(report.incomeCount, 'record')}
        tone="income"
      />
      <ReportKpiCard
        label="Expenses"
        value={formatCurrency(report.totalExpense)}
        detail={pluralize(report.expenseCount, 'record')}
        tone="expense"
      />
      <ReportKpiCard
        label="Balance"
        value={formatCurrency(report.balance)}
        detail={report.balance >= 0 ? 'Positive net' : 'Negative net'}
        tone={report.balance >= 0 ? 'positive' : 'negative'}
      />
      <ReportKpiCard
        label="Avg expense"
        value={formatCurrency(report.averageExpense)}
        detail="Per expense"
        tone="neutral"
      />
    </SimpleGrid>
  )
}
