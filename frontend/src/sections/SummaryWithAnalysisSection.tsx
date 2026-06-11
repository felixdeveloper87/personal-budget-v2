import { PeriodData } from '../hooks/usePeriodData'
import { PeriodType } from '../types'
import type { TransactionDateBasis } from '../utils/transactionDates'
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
  /** Active date basis for the overview ("cash-flow" = payments, "activity" = behaviour). */
  dateBasis?: TransactionDateBasis
  /** When provided, the container renders the Behaviour | Payments toggle. */
  onDateBasisChange?: (basis: TransactionDateBasis) => void
  onViewTransactions?: () => void
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
  dateBasis,
  onDateBasisChange,
  onViewTransactions,
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
      dateBasis={dateBasis}
      onDateBasisChange={onDateBasisChange}
      onViewTransactions={onViewTransactions}
    />
  )
}
