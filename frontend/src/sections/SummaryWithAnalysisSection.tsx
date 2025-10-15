import { PeriodData } from '../hooks/usePeriodData'
import { PeriodType } from '../types'
import { SummaryContainer } from '../components/summary'

interface SummaryWithAnalysisSectionProps {
  periodData: PeriodData
  selectedPeriod: PeriodType
  selectedDate: Date
  onDateChange: (date: Date) => void
  onPeriodChange: (period: PeriodType) => void
}

export default function SummaryWithAnalysisSection({
  periodData,
  selectedPeriod,
  selectedDate,
  onDateChange,
  onPeriodChange,
}: SummaryWithAnalysisSectionProps) {
  return (
    <SummaryContainer
      periodData={periodData}
      selectedPeriod={selectedPeriod}
      selectedDate={selectedDate}
      onDateChange={onDateChange}
      onPeriodChange={onPeriodChange}
    />
  )
}
