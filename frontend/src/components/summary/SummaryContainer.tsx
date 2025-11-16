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
import { SummaryCardsGrid } from './'
import SummaryCardModal from '../charts/modal/SummaryCardModal'
import SummaryHeader from './SummaryHeader'
import PeriodNavigator from './PeriodNavigator'
import { CategoryAnalysisHeader, CategoryAnalysisTabs } from '../categories'

type CardId = 'transactions' | 'income' | 'expenses' | 'balance'

interface SummaryContainerProps {
  periodData: PeriodData
  selectedPeriod: PeriodType
  selectedDate: Date
  onDateChange: (date: Date) => void
  onPeriodChange: (period: PeriodType) => void
  navigatePeriod?: (direction: 'prev' | 'next') => void
  goToToday?: () => void
  formatLabel?: () => string
  activeTab?: 'expenses' | 'incomes'
  setActiveTab?: (tab: 'expenses' | 'incomes') => void
}

export default function ummaryContainer({
  periodData,
  selectedPeriod,
  selectedDate,
  onDateChange,
  onPeriodChange,
  navigatePeriod: externalNavigatePeriod,
  goToToday: externalGoToToday,
  formatLabel: externalFormatLabel,
  activeTab: externalActiveTab,
  setActiveTab: externalSetActiveTab,
}: SummaryContainerProps) {
  const { transactions, income, expense, balance, label } = periodData
  const responsiveStyles = getResponsiveStyles()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedCard, setSelectedCard] = useState<CardId | null>(null)

  // Use internal state if not provided via props
  const [internalActiveTab, setInternalActiveTab] = useState<'expenses' | 'incomes'>('expenses')
  const activeTab = externalActiveTab ?? internalActiveTab
  const setActiveTab = externalSetActiveTab ?? setInternalActiveTab
  
  // Navigation functions - use provided ones or create local ones
  const navigatePeriod = externalNavigatePeriod ?? ((direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate)
    const offset = direction === 'next' ? 1 : -1

    switch (selectedPeriod) {
      case 'day':
        newDate.setDate(selectedDate.getDate() + offset)
        break
      case 'week':
        newDate.setDate(selectedDate.getDate() + offset * 7)
        break
      case 'month':
        newDate.setMonth(selectedDate.getMonth() + offset)
        break
      case 'year':
        newDate.setFullYear(selectedDate.getFullYear() + offset)
        break
    }

    onDateChange(newDate)
  })

  const goToToday = externalGoToToday ?? (() => onDateChange(new Date()))

  const formatLabel = externalFormatLabel ?? (() => {
    if (selectedPeriod === 'month') {
      return selectedDate.toLocaleString('en-GB', {
        month: 'short',
        year: 'numeric',
      }).toUpperCase()
    }
    if (selectedPeriod === 'day') {
      return selectedDate.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    }
    if (selectedPeriod === 'week') {
      const start = new Date(selectedDate)
      const day = start.getDay()
      const diff = start.getDate() - day + (day === 0 ? -6 : 1)
      start.setDate(diff)
      const end = new Date(start)
      end.setDate(start.getDate() + 6)
      const fmt = (d: Date) =>
        d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })
      return `${fmt(start)} - ${fmt(end)}`
    }
    if (selectedPeriod === 'year') {
      return selectedDate.getFullYear().toString()
    }
    return 'Unknown Period'
  })

  // Modern banking app colors
  const cardBg = useColorModeValue('gray.100', 'black')
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
