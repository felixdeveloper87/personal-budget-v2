import { Box, VStack } from '@chakra-ui/react'
import { Transaction, PeriodType } from '../types'
import { CategoryAnalysisHeader, CategoryAnalysisTabs } from '../components/categories'
import { SectionCard } from '../components/ui'

interface CategoryAnalysisSectionProps {
    transactions: Transaction[]
    selectedPeriod: PeriodType
    activeTab: 'expenses' | 'incomes'
    setActiveTab: (tab: 'expenses' | 'incomes') => void
}

export default function CategoryAnalysisSection({
    transactions,
    selectedPeriod,
    activeTab,
    setActiveTab,
}: CategoryAnalysisSectionProps) {
    return (
        <SectionCard>
            <Box p={{ base: 4, sm: 5, md: 6 }}>
                <VStack spacing={5} align="stretch">
                    <CategoryAnalysisHeader
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                    />
                    <CategoryAnalysisTabs
                        transactions={transactions}
                        selectedPeriod={selectedPeriod}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                    />
                </VStack>
            </Box>
        </SectionCard>
    )
}
