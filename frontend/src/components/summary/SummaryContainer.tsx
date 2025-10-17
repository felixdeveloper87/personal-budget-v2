import {
  Box,
  VStack,
  Card,
  CardBody,
  Divider,
} from '@chakra-ui/react'
import { useColorModeValue } from '@chakra-ui/react'
import { getResponsiveStyles } from '../ui'
import { PeriodData } from '../../hooks/usePeriodData'
import { PeriodType } from '../../types'
import { SummaryCardsGrid, CategoryAnalysisTabs } from './'
import SummaryCardModal from '../transactions/SummaryCardModal'
import SummaryHeader from './SummaryHeader'
import PeriodNavigator from './PeriodNavigator'
import CategoryAnalysisHeader from './CategoryAnalysisHeader'
import { usePeriodNavigation } from '../../hooks/usePeriodNavigation'
import { useDisclosure } from '@chakra-ui/react'
import { useState } from 'react'

type CardId = 'transactions' | 'income' | 'expenses' | 'balance'

interface SummaryContainerProps {
  periodData: PeriodData
  selectedPeriod: PeriodType
  selectedDate: Date
  onDateChange: (date: Date) => void
  onPeriodChange: (period: PeriodType) => void
}

export default function SummaryContainer({
  periodData,
  selectedPeriod,
  selectedDate,
  onDateChange,
  onPeriodChange,
}: SummaryContainerProps) {
  const { transactions, income, expense, balance, label } = periodData
  const responsiveStyles = getResponsiveStyles()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedCard, setSelectedCard] = useState<CardId | null>(null)

  const {
    activeTab,
    setActiveTab,
    navigatePeriod,
    goToToday,
    formatLabel,
  } = usePeriodNavigation(selectedPeriod, selectedDate, onDateChange, onPeriodChange)

  // Modern post-it inspired colors
  const cardBg = useColorModeValue(
    'rgba(255, 255, 255, 0.9)',
    'rgba(255, 255, 255, 0.05)'
  )
  const cardBorderColor = useColorModeValue('gray.200', 'gray.600')

  const handleCardClick = (cardId: string) => {
    setSelectedCard(cardId as CardId)
    onOpen()
  }

  return (
    <>
      <Box
        w="full"
        px={{ base: 2, sm: 3, md: 4, lg: 6 }}
        sx={{
          paddingLeft: 'max(8px, env(safe-area-inset-left, 0px))',
          paddingRight: 'max(8px, env(safe-area-inset-right, 0px))',
        }}
      >
        <Card
          bg={cardBg}
          backdropFilter="blur(10px)"
          border="1px solid"
          borderColor={cardBorderColor}
          borderRadius="2xl"
          shadow="sm"
          overflow="hidden"
          _hover={{
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
            borderColor: useColorModeValue('blue.200', 'blue.500')
          }}
          transition="all 0.2s ease"
        >
          {/* Simple top border */}
          <Box
            height="2px"
            bg={useColorModeValue('blue.200', 'blue.500')}
          />

            <CardBody p={{ base: 3, sm: 4, md: 5, lg: 6 }}>
              <VStack spacing={responsiveStyles.addTransactionSection.card.spacing} align="stretch">
                {/* Header */}
                <SummaryHeader onGoToToday={goToToday} />

                {/* Period Selector */}
                <PeriodNavigator
                  selectedPeriod={selectedPeriod}
                  onPeriodChange={onPeriodChange}
                  onNavigatePeriod={navigatePeriod}
                  onGoToToday={goToToday}
                  formatLabel={formatLabel}
                />

                {/* Summary Grid */}
                <SummaryCardsGrid
                  transactions={transactions}
                  income={income}
                  expense={expense}
                  balance={balance}
                  onCardClick={handleCardClick}
                />

                <Divider />

                {/* Category Analysis Header */}
                <CategoryAnalysisHeader
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                />

                {/* Category Analysis */}
                <CategoryAnalysisTabs
                  transactions={transactions}
                  selectedPeriod={selectedPeriod}
                  showHeader={false}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
              </VStack>
            </CardBody>
          </Card>
      </Box>

      {/* Modal */}
      <SummaryCardModal
        isOpen={isOpen}
        onClose={onClose}
        selectedCard={selectedCard}
        cardLabel={selectedCard || 'transactions'}
        transactions={transactions}
        selectedPeriod={label}
        currentBalance={balance}
      />
    </>
  )
}
