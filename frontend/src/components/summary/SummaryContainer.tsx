import {
  Box,
  VStack,
  Card,
  CardBody,
  Divider,
} from '@chakra-ui/react'
import { useColorModeValue } from '@chakra-ui/react'
import { getResponsiveStyles, getGradients, animations, getShimmerStyles } from '../../utils/ui'
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
  const gradients = getGradients()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedCard, setSelectedCard] = useState<CardId | null>(null)

  const {
    activeTab,
    setActiveTab,
    navigatePeriod,
    goToToday,
    formatLabel,
  } = usePeriodNavigation(selectedPeriod, selectedDate, onDateChange, onPeriodChange)

  // Move useColorModeValue to top (always safe)
  const cardBg = useColorModeValue('linear-gradient(135deg, rgba(248, 250, 252, 0.9) 0%, rgba(241, 245, 249, 0.9) 50%, rgba(226, 232, 240, 0.9) 100%)', 'rgba(17, 17, 17, 0.9)')
  const cardBorderColor = useColorModeValue('rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)')

  const handleCardClick = (cardId: string) => {
    setSelectedCard(cardId as CardId)
    onOpen()
  }

  return (
    <>
      <Box
        w="full"
        px={responsiveStyles.addTransactionSection.container.padding}
        sx={{
          paddingLeft: responsiveStyles.addTransactionSection.container.safeArea.paddingLeft,
          paddingRight: responsiveStyles.addTransactionSection.container.safeArea.paddingRight,
        }}
      >
        <Box position="relative">
          {/* Decorative gradient background */}
          <Box
            position="absolute"
            top={responsiveStyles.installmentPlansSection.background.top}
            left={responsiveStyles.installmentPlansSection.background.left}
            right={responsiveStyles.installmentPlansSection.background.right}
            height={responsiveStyles.installmentPlansSection.background.height}
            background={gradients.decorative}
            borderRadius={responsiveStyles.installmentPlansSection.background.borderRadius}
            filter={responsiveStyles.installmentPlansSection.background.filter}
            opacity={responsiveStyles.installmentPlansSection.background.opacity}
            zIndex={0}
          />

          <Card
            position="relative"
            bg={cardBg}
            backdropFilter="blur(20px)"
            border="1px solid"
            borderColor={cardBorderColor}
            borderRadius={responsiveStyles.addTransactionSection.card.borderRadius}
            shadow="2xl"
            overflow="hidden"
            sx={{
              animation: animations.slideIn,
              '@keyframes slideIn': {
                from: { opacity: 0, transform: 'translateY(20px) scale(0.95)' },
                to: { opacity: 1, transform: 'translateY(0) scale(1)' },
              },
            }}
          >
            {/* Animated top border */}
            <Box
              height="4px"
              sx={getShimmerStyles()}
            />

            <CardBody p={responsiveStyles.addTransactionSection.card.padding}>
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
