import { SimpleGrid } from '@chakra-ui/react'
import ReportKpiCard from './ReportKpiCard'
import { useI18n } from '../../i18n'
import { useReportFormat } from './useReportFormat'
import type { ReportResponse } from '../../types'

export default function ReportKpiGrid({ report }: { report: ReportResponse }) {
  const { t } = useI18n()
  const { currency, count } = useReportFormat()
  return (
    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} className="avoid-break">
      <ReportKpiCard
        label={t('reports.income')}
        value={currency(report.totalIncome)}
        detail={count(report.incomeCount, 'record')}
        tone="income"
      />
      <ReportKpiCard
        label={t('reports.expenses')}
        value={currency(report.totalExpense)}
        detail={count(report.expenseCount, 'record')}
        tone="expense"
      />
      <ReportKpiCard
        label={t('reports.balance')}
        value={currency(report.balance)}
        detail={t(report.balance >= 0 ? 'reports.positiveNet' : 'reports.negativeNet')}
        tone={report.balance >= 0 ? 'positive' : 'negative'}
      />
      <ReportKpiCard
        label={t('reports.avgExpense')}
        value={currency(report.averageExpense)}
        detail={t('reports.perExpense')}
        tone="neutral"
      />
    </SimpleGrid>
  )
}
