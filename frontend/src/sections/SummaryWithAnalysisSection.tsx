import { Box } from '@chakra-ui/react'
import { PeriodData } from '../hooks/usePeriodData'
import { PeriodType, Transaction } from '../types'
import { SummaryContainer } from '../components/summary'

interface SummaryWithAnalysisSectionProps {
  periodData: PeriodData
  allTransactions: Transaction[]
  selectedPeriod: PeriodType
  selectedDate: Date
  onDateChange: (date: Date) => void
  onPeriodChange: (period: PeriodType) => void
  navigatePeriod: (direction: 'prev' | 'next') => void
  goToToday: () => void
  formatLabel: () => string
}

export default function SummaryWithAnalysisSection({
  periodData,
  allTransactions,
  selectedPeriod,
  selectedDate,
  onDateChange,
  onPeriodChange,
  navigatePeriod,
  goToToday,
  formatLabel,
}: SummaryWithAnalysisSectionProps) {
  return (
    <SummaryContainer
      periodData={periodData}
      allTransactions={allTransactions}
      selectedPeriod={selectedPeriod}
      selectedDate={selectedDate}
      onDateChange={onDateChange}
      onPeriodChange={onPeriodChange}
      navigatePeriod={navigatePeriod}
      goToToday={goToToday}
      formatLabel={formatLabel}
    />
  )
}
