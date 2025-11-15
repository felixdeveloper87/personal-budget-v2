import { useState } from 'react'
import {
  Box,
  VStack,
  Card,
  CardBody,
  Divider,
  useDisclosure,
  useColorModeValue,
} from '@chakra-ui/react'
import { getResponsiveStyles } from '../ui'
import { PeriodData } from '../../hooks/usePeriodData'
import { PeriodType } from '../../types'
import { SummaryCardsGrid, CategoryAnalysisTabs } from './'
import SummaryCardModal from '../charts/modal/SummaryCardModal'
import SummaryHeader from './SummaryHeader'
import PeriodNavigator from './PeriodNavigator'
import CategoryAnalysisHeader from './CategoryAnalysisHeader'
import { usePeriodNavigation } from '../../hooks/usePeriodNavigation'

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

  // Modern banking app colors
  const cardBg = useColorModeValue('white', '#0a0a0a')
  const cardBgPattern = useColorModeValue(
    'data:image/svg+xml,%3Csvg width="60" height="60" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M10 5 L20 5 M50 10 L55 10 M5 40 L15 40 M30 20 L45 20" stroke="%23000" stroke-width="0.5" opacity="0.1" stroke-linecap="round"/%3E%3C/svg%3E',
    'data:image/svg+xml,%3Csvg width="60" height="60" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M10 5 L20 5 M50 10 L55 10 M5 40 L15 40 M30 20 L45 20" stroke="%23fff" stroke-width="0.5" opacity="0.1" stroke-linecap="round"/%3E%3C/svg%3E'
  )
  const cardBorderColor = useColorModeValue('gray.200', 'gray.800')

  const handleCardClick = (cardId: string) => {
    setSelectedCard(cardId as CardId)
    onOpen()
  }

  return (
    <>
      <Box
        w="full"
        px={{ base: 1, sm: 2, md: 3, lg: 4 }}
        sx={{
          paddingLeft: 'max(8px, env(safe-area-inset-left, 0px))',
          paddingRight: 'max(8px, env(safe-area-inset-right, 0px))',
        }}
      >
        <Card
          bg={cardBg}
          backgroundImage={cardBgPattern}
          backdropFilter="blur(10px)"
          border="1px solid"
          borderColor={cardBorderColor}
          borderRadius="2xl"
          shadow={useColorModeValue('0 1px 3px rgba(0,0,0,0.05)', '0 1px 3px rgba(0,0,0,0.2)')}
          overflow="hidden"
          position="relative"
          _hover={{
            shadow: useColorModeValue('0 4px 12px rgba(0,0,0,0.08)', '0 4px 12px rgba(0,0,0,0.3)')
          }}
          transition="all 0.2s ease"
        >
            <CardBody p={{ base: 4, sm: 5, md: 6, lg: 6 }}>
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
