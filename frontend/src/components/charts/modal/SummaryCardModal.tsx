import { useMemo } from 'react'
import {
  AnimatePresence,
} from 'framer-motion'
import {
  Badge,
  Box,
  useColorModeValue,
} from '@chakra-ui/react'
import { BarChart3, DollarSign, TrendingDown, TrendingUp } from '../../ui/icons'
import TransactionsChart from './TransactionsChart'
import IncomeChart from './IncomeChart'
import ExpensesChart from './ExpensesChart'
import BalanceChart from './BalanceChart'
import { SummaryCardType } from '../../../constants/summaryColors'
import { ModalHeader, ModalHeaderAccent, PremiumModal } from '../../ui'
import { ChartHeaderStats, ChartLoadingState } from './components'
import type { ChartHeaderStatsVariant } from './components'
import type { PeriodType } from '../../../types'

interface SummaryCardModalProps {
  isOpen: boolean
  onClose: () => void
  selectedCard: SummaryCardType | null | undefined
  cardLabel?: string
  transactions?: any[]
  selectedPeriod?: string
  currentBalance?: number
  /**
   * When provided, the inner charts also render the compact period bucket
   * bar chart at the top (today / this week / this month / this year).
   */
  periodType?: PeriodType
  selectedDate?: Date
}

const ICON_MAP = {
  transactions: BarChart3,
  income: TrendingUp,
  expenses: TrendingDown,
  balance: DollarSign,
} as const

const TITLE_MAP: Record<SummaryCardType, { title: string; caption: string }> = {
  transactions: { title: 'Transactions', caption: 'Daily activity & totals' },
  income: { title: 'Income', caption: 'Inflows by category' },
  expenses: { title: 'Expenses', caption: 'Outflows by category' },
  balance: { title: 'Balance', caption: 'Net balance over time' },
}

const ACCENT_MAP: Record<SummaryCardType, ModalHeaderAccent> = {
  transactions: 'blue',
  income: 'green',
  expenses: 'red',
  balance: 'violet',
}

const BADGE_SCHEME: Record<SummaryCardType, string> = {
  transactions: 'blue',
  income: 'green',
  expenses: 'red',
  balance: 'purple',
}

export default function SummaryCardModal({
  isOpen,
  onClose,
  selectedCard,
  transactions = [],
  selectedPeriod = 'Current Period',
  currentBalance = 0,
  periodType,
  selectedDate,
}: SummaryCardModalProps) {
  const surfaceBg = useColorModeValue('#ffffff', '#0a0a0a')
  const bodyBg = useColorModeValue('gray.50', '#0a0a0a')

  const card: SummaryCardType = selectedCard ?? 'transactions'

  const { icon, title, caption, accent, badgeScheme } = useMemo(
    () => ({
      icon: ICON_MAP[card],
      title: TITLE_MAP[card].title,
      caption: TITLE_MAP[card].caption,
      accent: ACCENT_MAP[card],
      badgeScheme: BADGE_SCHEME[card],
    }),
    [card],
  )

  const statsVariant: ChartHeaderStatsVariant = card

  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', sm: 'lg', md: 'xl', lg: '4xl' }}
      header={
        <ModalHeader
          icon={icon}
          title={title}
          caption={caption}
          onClose={onClose}
          accent={accent}
          rightSlot={
            <Badge
              colorScheme={badgeScheme}
              variant="subtle"
              px={3}
              py={1}
              borderRadius="full"
              fontSize="xs"
              fontWeight={600}
              textTransform="none"
              letterSpacing="0"
            >
              {selectedPeriod}
            </Badge>
          }
        />
      }
      contentProps={{ bg: surfaceBg }}
    >
      <Box flex="1" bg={bodyBg} p={{ base: 4, sm: 5, md: 6 }} overflowY="auto">
        {!transactions.length ? (
          <ChartLoadingState message="Loading chart data..." />
        ) : (
          <>
            <Box mb={{ base: 4, sm: 5 }}>
              <ChartHeaderStats
                transactions={transactions}
                variant={statsVariant}
                currentBalance={currentBalance}
              />
            </Box>

            <AnimatePresence mode="wait">
              <Box key="chart">
                {selectedCard === 'transactions' && (
                  <TransactionsChart
                    transactions={transactions}
                    selectedPeriod={selectedPeriod}
                    periodType={periodType}
                    selectedDate={selectedDate}
                  />
                )}
                {selectedCard === 'income' && (
                  <IncomeChart
                    transactions={transactions}
                    selectedPeriod={selectedPeriod}
                    periodType={periodType}
                    selectedDate={selectedDate}
                  />
                )}
                {selectedCard === 'expenses' && (
                  <ExpensesChart
                    transactions={transactions}
                    selectedPeriod={selectedPeriod}
                    periodType={periodType}
                    selectedDate={selectedDate}
                  />
                )}
                {selectedCard === 'balance' && (
                  <BalanceChart
                    transactions={transactions}
                    selectedPeriod={selectedPeriod}
                    currentBalance={currentBalance}
                  />
                )}
              </Box>
            </AnimatePresence>

          </>
        )}
      </Box>
    </PremiumModal>
  )
}
