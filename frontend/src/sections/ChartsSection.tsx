import DashboardSection from '../components/DashboardSection'
import { VStack } from '@chakra-ui/react'
import { ChartCard } from '../components/cards'
import SummaryChart from '../components/SummaryChart'
import CategoryTabsChart from '../components/CategoryTabsChart'
import { Transaction } from '../types'
import { PeriodType } from '../components/PeriodNavigator'

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
