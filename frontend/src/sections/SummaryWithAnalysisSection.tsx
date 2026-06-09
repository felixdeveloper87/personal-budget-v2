import { Box } from '@chakra-ui/react'
import { PeriodData } from '../hooks/usePeriodData'
import { PeriodType } from '../types'
import { SummaryContainer } from '../components/summary'

interface SummaryWithAnalysisSectionProps {
  periodData: PeriodData
  selectedPeriod: PeriodType
  selectedDate: Date
  onDateChange: (date: Date) => void
  onPeriodChange: (period: PeriodType) => void
  navigatePeriod: (direction: 'prev' | 'next') => void
  goToToday: () => void
  formatLabel: () => string
  onNavigateCategory?: (tab: 'expenses' | 'incomes') => void
}

export default function SummaryWithAnalysisSection({
  periodData,
  selectedPeriod,
  selectedDate,
  onDateChange,
  onPeriodChange,
  navigatePeriod,
  goToToday,
  formatLabel,
  onNavigateCategory,
}: SummaryWithAnalysisSectionProps) {
  return (
    <SummaryContainer
      periodData={periodData}
      selectedPeriod={selectedPeriod}
      selectedDate={selectedDate}
      onDateChange={onDateChange}
      onPeriodChange={onPeriodChange}
      navigatePeriod={navigatePeriod}
      goToToday={goToToday}
      formatLabel={formatLabel}
      onNavigateCategory={onNavigateCategory}
    />
  )
}
