import { PeriodNavigator, PeriodType } from '../components'

interface PeriodNavigatorSectionProps {
  selectedPeriod: PeriodType
  selectedDate: Date
  onDateChange: (date: Date) => void
  onPeriodChange: (period: PeriodType) => void
  label: string
}

/**
 * 🗓️ PeriodNavigatorSection
 * - Wrapper section for the PeriodNavigator component
 * - Maintains consistent section structure with AddTransactionSection
 * - Handles period selection and navigation logic
 */
export default function PeriodNavigatorSection({
  selectedPeriod,
  selectedDate,
  onDateChange,
  onPeriodChange,
  label,
}: PeriodNavigatorSectionProps) {
  return (
    <PeriodNavigator
      selectedPeriod={selectedPeriod}
      selectedDate={selectedDate}
      onDateChange={onDateChange}
      onPeriodChange={onPeriodChange}
      periodLabel={label}
    />
  )
}
