import { useState } from 'react'
import { VStack, useDisclosure } from '@chakra-ui/react'
import { PeriodData } from '../../hooks/usePeriodData'
import { PeriodType } from '../../types'
import SummaryCardsGrid from './SummaryCardsGrid'
import SummaryCardModal from '../charts/modal/SummaryCardModal'
import SummaryHeader from './SummaryHeader'

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

const fallbackFormatLabel = (date: Date, period: PeriodType) => {
  if (period === 'month') {
    return date
      .toLocaleString('en-GB', { month: 'short', year: 'numeric' })
      .toUpperCase()
  }
  if (period === 'day') {
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }
  if (period === 'week') {
    const start = new Date(date)
    const day = start.getDay()
    const diff = start.getDate() - day + (day === 0 ? -6 : 1)
    start.setDate(diff)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    const fmt = (d: Date) =>
      d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })
    return `${fmt(start)} - ${fmt(end)}`
  }
  if (period === 'year') {
    return date.getFullYear().toString()
  }
  return 'Unknown Period'
}

const fallbackNavigatePeriod = (
  date: Date,
  period: PeriodType,
  direction: 'prev' | 'next',
): Date => {
  const next = new Date(date)
  const offset = direction === 'next' ? 1 : -1
  switch (period) {
    case 'day':
      next.setDate(date.getDate() + offset)
      break
    case 'week':
      next.setDate(date.getDate() + offset * 7)
      break
    case 'month':
      next.setMonth(date.getMonth() + offset)
      break
    case 'year':
      next.setFullYear(date.getFullYear() + offset)
      break
  }
  return next
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
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedCard, setSelectedCard] = useState<CardId | null>(null)

  const navigatePeriod =
    externalNavigatePeriod ??
    ((direction: 'prev' | 'next') =>
      onDateChange(fallbackNavigatePeriod(selectedDate, selectedPeriod, direction)))

  const goToToday = externalGoToToday ?? (() => onDateChange(new Date()))

  const formatLabel =
    externalFormatLabel ??
    (() => fallbackFormatLabel(selectedDate, selectedPeriod))

  const handleCardClick = (cardId: string) => {
    setSelectedCard(cardId as CardId)
    onOpen()
  }

  return (
    <>
      <VStack spacing={{ base: 3, md: 4 }} align="stretch" w="full">
        <SummaryHeader
          selectedPeriod={selectedPeriod}
          onPeriodChange={onPeriodChange}
          onNavigatePeriod={navigatePeriod}
          onGoToToday={goToToday}
          formatLabel={formatLabel}
        />

        <SummaryCardsGrid
          transactions={transactions}
          income={income}
          expense={expense}
          balance={balance}
          selectedPeriod={selectedPeriod}
          onCardClick={handleCardClick}
        />
      </VStack>

      <SummaryCardModal
        isOpen={isOpen}
        onClose={onClose}
        selectedCard={selectedCard}
        cardLabel={selectedCard || 'transactions'}
        transactions={transactions}
        selectedPeriod={label}
        currentBalance={balance}
        periodType={selectedPeriod}
        selectedDate={selectedDate}
      />
    </>
  )
}
