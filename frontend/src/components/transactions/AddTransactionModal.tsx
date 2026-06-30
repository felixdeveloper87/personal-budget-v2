import { Box } from '@chakra-ui/react'
import TransactionForm from './TransactionForm/TransactionForm'
import { Transaction } from '../../types'
import { PremiumModal } from '../ui'
import TransactionModalHeader from './TransactionModalHeader'
import { useEditorialPalette } from '../../editorial'

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
  const ed = useEditorialPalette()

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
        <TransactionModalHeader type={type} onClose={onClose} />
      }
    >
      <Box flex="1" minW={0} maxW="100%" bg={ed.bg} p={{ base: 3, sm: 5, md: 6 }} overflowY="auto">
        <TransactionForm
          transactions={transactions}
          onCreated={handleTransactionCreated}
          onTransactionDeleted={onRefresh}
          initialType={type}
          showRecentTransactions={false}
          compact
        />
      </Box>
    </PremiumModal>
  )
}
