import { 
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  Text,
  useColorModeValue
} from '@chakra-ui/react'
import { useThemeColors } from '../../hooks/useThemeColors'
import { TransactionsChart, IncomeChart, ExpensesChart, BalanceChart } from '../charts/modal'

interface SummaryCardModalProps {
  isOpen: boolean
  onClose: () => void
  selectedCard: string | null | undefined
  cardLabel?: string
  transactions?: any[]
  selectedPeriod?: string
  currentBalance?: number
}

export default function SummaryCardModal({ 
  isOpen, 
  onClose, 
  selectedCard, 
  cardLabel,
  transactions = [],
  selectedPeriod = 'Current Period',
  currentBalance = 0
}: SummaryCardModalProps) {
  const colors = useThemeColors()

  const getModalContent = () => {
    switch (selectedCard) {
      case 'transactions':
        return {
          title: 'Transaction Details',
          description: 'Complete list of all transactions for the selected period',
          content: [
            '• View all transactions chronologically',
            '• Filter by transaction type (Income/Expense)',
            '• Search and sort functionality',
            '• Export transaction data'
          ]
        }
      case 'income':
        return {
          title: 'Income Analysis',
          description: 'Detailed breakdown of all income sources',
          content: [
            '• Income by category breakdown',
            '• Income trends over time',
            '• Top income sources',
            '• Income vs previous periods comparison'
          ]
        }
      case 'expenses':
        return {
          title: 'Expense Analysis',
          description: 'Detailed breakdown of all expenses',
          content: [
            '• Expenses by category breakdown',
            '• Expense trends over time',
            '• Top spending categories',
            '• Budget vs actual spending'
          ]
        }
      case 'balance':
        return {
          title: 'Balance Overview',
          description: 'Financial balance analysis and insights',
          content: [
            '• Balance trends over time',
            '• Savings rate analysis',
            '• Financial health indicators',
            '• Future projections'
          ]
        }
      default:
        return {
          title: 'Card Details',
          description: 'Additional information about this metric',
          content: [
            '• Detailed breakdown coming soon',
            '• Interactive charts and graphs',
            '• Export and sharing options',
            '• Historical comparisons'
          ]
        }
    }
  }

  const modalContent = getModalContent()

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent bg={colors.cardBg}>
        <ModalHeader>
          {cardLabel || modalContent.title}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {selectedCard === 'transactions' && (
            <TransactionsChart 
              transactions={transactions} 
              selectedPeriod={selectedPeriod} 
            />
          )}
          
          {selectedCard === 'income' && (
            <IncomeChart 
              transactions={transactions} 
              selectedPeriod={selectedPeriod} 
            />
          )}
          
          {selectedCard === 'expenses' && (
            <ExpensesChart 
              transactions={transactions} 
              selectedPeriod={selectedPeriod} 
            />
          )}
          
          {selectedCard === 'balance' && (
            <BalanceChart 
              transactions={transactions} 
              selectedPeriod={selectedPeriod}
              currentBalance={currentBalance}
            />
          )}
          
          {!selectedCard && (
            <VStack spacing={4} align="stretch">
              <Text color={colors.text.secondary}>
                Select a card to view detailed analytics and charts.
              </Text>
            </VStack>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
