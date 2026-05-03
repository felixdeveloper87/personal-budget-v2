import { Box, useColorModeValue } from '@chakra-ui/react'
import TransactionForm from './TransactionForm/TransactionForm'
import { Transaction } from '../../types'
import { PremiumModal } from '../ui'
import TransactionModalHeader from './TransactionModalHeader'

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
        <TransactionModalHeader type={type} onClose={onClose} />
      }
      contentProps={{ bg: surfaceBg }}
    >
      <Box flex="1" bg={bodyBg} p={{ base: 3, sm: 5, md: 6 }} overflowY="auto">
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
