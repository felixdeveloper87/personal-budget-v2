import { PeriodNavigator, PeriodType } from '../components'

interface PeriodNavigatorSectionProps {
  selectedPeriod: PeriodType
  selectedDate: Date
  onDateChange: (date: Date) => void
  onPeriodChange: (period: PeriodType) => void
  label: string
}

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
