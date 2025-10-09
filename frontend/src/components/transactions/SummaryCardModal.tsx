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


  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent bg={colors.cardBg}>
        <ModalHeader>
          {cardLabel} Details
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
          
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
