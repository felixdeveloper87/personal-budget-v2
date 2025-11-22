import { Box, VStack, useColorModeValue } from '@chakra-ui/react'
import { getResponsiveStyles } from '../components/ui'
import { Transaction, PeriodType } from '../types'
import { CategoryAnalysisHeader, CategoryAnalysisTabs } from '../components/categories'

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
    const responsiveStyles = getResponsiveStyles()

    return (
        <Box
            w="full"
            h="full"
            px={{ base: 1, sm: 2, md: 3 }}
        >
            <Box
                h="full"
                bg={useColorModeValue('rgba(255, 255, 255, 0.6)', 'rgba(0, 0, 0, 0.4)')}
                backdropFilter="blur(20px)"
                border="1px solid"
                borderColor={useColorModeValue('whiteAlpha.400', 'whiteAlpha.100')}
                borderRadius="2xl"
                boxShadow={useColorModeValue(
                    '0 8px 32px rgba(31, 38, 135, 0.07)',
                    '0 8px 32px rgba(0, 0, 0, 0.3)'
                )}
                overflow="hidden"
                position="relative"
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                _hover={{
                    boxShadow: useColorModeValue(
                        '0 12px 40px rgba(31, 38, 135, 0.12)',
                        '0 12px 40px rgba(0, 0, 0, 0.5)'
                    ),
                    transform: 'translateY(-2px)'
                }}
            >
                {/* Decorative gradient blob */}
                <Box
                    position="absolute"
                    top="-50%"
                    right="-10%"
                    width="300px"
                    height="300px"
                    bg="radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)"
                    filter="blur(40px)"
                    zIndex={0}
                    pointerEvents="none"
                />

                <Box p={{ base: 5, sm: 6 }} position="relative" zIndex={1}>
                    <VStack spacing={responsiveStyles.addTransactionSection.card.spacing} align="stretch">
                        {/* Category Analysis Header */}
                        <CategoryAnalysisHeader
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                        />

                        {/* Category Analysis */}
                        <CategoryAnalysisTabs
                            transactions={transactions}
                            selectedPeriod={selectedPeriod}
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                        />
                    </VStack>
                </Box>
            </Box>
        </Box>
    )
}
