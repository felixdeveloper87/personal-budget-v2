import { VStack } from '@chakra-ui/react'
import DashboardSection from './DashboardSection'
import { ChartCard, SummaryChart, CategoryTabsChart, PeriodType } from '../components'
import { Transaction } from '../types'

interface ChartsSectionProps {
  income: number
  expense: number
  balance: number
  transactions: Transaction[]
  selectedPeriod: PeriodType
}

export default function ChartsSection({
  income,
  expense,
  balance,
  transactions,
  selectedPeriod,
}: ChartsSectionProps) {
  return (
    <DashboardSection title="Charts">
      <VStack spacing={6}>
        <ChartCard>
          <SummaryChart
            income={income}
            expense={expense}
            balance={balance}
            selectedPeriod={selectedPeriod}
          />
        </ChartCard>
        <ChartCard>
          <CategoryTabsChart
            transactions={transactions}
            selectedPeriod={selectedPeriod}
          />
        </ChartCard>
      </VStack>
    </DashboardSection>
  )
}
