import { Box, useColorModeValue } from '@chakra-ui/react'
import { Plus, Minus } from 'lucide-react'
import TransactionForm from './TransactionForm/TransactionForm'
import { Transaction } from '../../types'
import { ModalHeader, PremiumModal } from '../ui'

interface AddTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'INCOME' | 'EXPENSE'
  transactions: Transaction[]
  onTransactionCreated: () => void
  onRefresh: () => void
}

export default function AddTransactionModal({
  isOpen,
  onClose,
  type,
  transactions,
  onTransactionCreated,
  onRefresh,
}: AddTransactionModalProps) {
  const surfaceBg = useColorModeValue('#ffffff', '#0a0a0a')
  const bodyBg = useColorModeValue('gray.50', '#0a0a0a')

  const handleTransactionCreated = () => {
    onTransactionCreated()
    onClose()
  }

  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', sm: 'lg', md: 'xl', lg: '4xl' }}
      header={
        <ModalHeader
          icon={type === 'INCOME' ? Plus : Minus}
          title={type === 'INCOME' ? 'Add income' : 'Add expense'}
          caption={
            type === 'INCOME' ? 'Track money coming in' : 'Record your spending'
          }
          onClose={onClose}
          accent={type === 'INCOME' ? 'green' : 'red'}
        />
      }
      contentProps={{ bg: surfaceBg }}
    >
      <Box flex="1" bg={bodyBg} p={{ base: 4, sm: 5, md: 6 }} overflowY="auto">
        <TransactionForm
          transactions={transactions}
          onCreated={handleTransactionCreated}
          onTransactionDeleted={onRefresh}
          initialType={type}
          showRecentTransactions
          compact
        />
      </Box>
    </PremiumModal>
  )
}
