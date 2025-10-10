import { VStack } from '@chakra-ui/react'
import { ChartCard, /* SummaryChart, */ PeriodType } from '../components'
import { Transaction } from '../types'
import CategoryAnalysisSection from './CategoryAnalysisSection'

interface ChartsSectionProps {
  income: number
  expense: number
  balance: number
  transactions: Transaction[]
  selectedPeriod: PeriodType
}

/**
 * 📊 ChartsSection - Wrapper para seções de gráficos
 * - Usa CategoryAnalysisSection com UI/UX completa
 * - Mantém consistência com outras sections
 */
export default function ChartsSection({
  income,
  expense,
  balance,
  transactions,
  selectedPeriod,
}: ChartsSectionProps) {
  return (
    <VStack spacing={6}>
      {/* <ChartCard>
        <SummaryChart
          income={income}
          expense={expense}
          balance={balance}
          selectedPeriod={selectedPeriod}
        />
      </ChartCard> */}
      <CategoryAnalysisSection
        transactions={transactions}
        selectedPeriod={selectedPeriod}
      />
    </VStack>
  )
}
