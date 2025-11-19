import { useState } from 'react'
import {
  Box,
  VStack,
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
}

export default function SummaryContainer({
  periodData,
  selectedPeriod,
  selectedDate,
  onDateChange,
  onPeriodChange,
  navigatePeriod: externalNavigatePeriod,
  goToToday: externalGoToToday,
  formatLabel: externalFormatLabel,
}: SummaryContainerProps) {
  const { transactions, income, expense, balance, label } = periodData
  const responsiveStyles = getResponsiveStyles()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedCard, setSelectedCard] = useState<CardId | null>(null)

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

  const handleCardClick = (cardId: string) => {
    setSelectedCard(cardId as CardId)
    onOpen()
  }

  return (
    <>
      <Box
        w="full"
        h="full"
        px={{ base: 1, sm: 2, md: 3, lg: 4 }}
        sx={{
          paddingLeft: 'max(8px, env(safe-area-inset-left, 0px))',
          paddingRight: 'max(8px, env(safe-area-inset-right, 0px))',
        }}
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
            </VStack>
          </Box>
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
