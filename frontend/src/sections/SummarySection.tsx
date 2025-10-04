import DashboardSection from '../components/DashboardSection'
import SingleRowSummary from '../components/SingleRowSummary'
import { PeriodData } from '../hooks/usePeriodData'

interface SummarySectionProps {
  periodData: PeriodData
}

export default function SummarySection({ periodData }: SummarySectionProps) {
  return (
    <DashboardSection title="Summary">
      <SingleRowSummary periodData={periodData} />
    </DashboardSection>
  )
}
