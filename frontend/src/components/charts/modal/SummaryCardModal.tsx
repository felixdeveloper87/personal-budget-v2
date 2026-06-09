import {
  Badge,
  Box,
  useColorModeValue,
} from '@chakra-ui/react'
import { DollarSign } from '../../ui/icons'
import BalanceBreakEvenPanel from './BalanceBreakEvenPanel'
import { SummaryCardType } from '../../../constants/summaryColors'
import { ModalHeader, PremiumModal } from '../../ui'
import { ChartHeaderStats } from './components'
import type { ChartHeaderStatsVariant } from './components'
import type { PeriodType, Transaction } from '../../../types'

interface SummaryCardModalProps {
  isOpen: boolean
  onClose: () => void
  /**
   * Kept for caller compatibility. The modal is now only ever opened for the
   * Balance card — Transactions/Income/Expenses navigate to their own pages.
   */
  selectedCard?: SummaryCardType | null
  cardLabel?: string
  transactions?: Transaction[]
  selectedPeriod?: string
  currentBalance?: number
  /** Drives the compact period bucket bar chart (today / week / month / year). */
  periodType?: PeriodType
  selectedDate?: Date
}

export default function SummaryCardModal({
  isOpen,
  onClose,
  transactions = [],
  selectedPeriod = 'Current Period',
  currentBalance = 0,
  periodType,
  selectedDate,
}: SummaryCardModalProps) {
  const surfaceBg = useColorModeValue('#ffffff', '#0a0a0a')
  const bodyBg = useColorModeValue('gray.50', '#0a0a0a')

  const statsVariant: ChartHeaderStatsVariant = 'balance'

  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', sm: 'lg', md: 'xl', lg: '4xl' }}
      header={
        <ModalHeader
          icon={DollarSign}
          title="Balance"
          caption="Net balance over time"
          onClose={onClose}
          accent="violet"
          rightSlot={
            <Badge
              colorScheme="purple"
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
        <Box mb={{ base: 4, sm: 5 }}>
          <ChartHeaderStats
            transactions={transactions}
            variant={statsVariant}
            currentBalance={currentBalance}
          />
        </Box>

        <BalanceBreakEvenPanel
          currentBalance={currentBalance}
          selectedDate={selectedDate}
          periodType={periodType}
          transactions={transactions}
        />
      </Box>
    </PremiumModal>
  )
}
