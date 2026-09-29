import {
  Box,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  useBreakpointValue,
} from '@chakra-ui/react'
import TransactionForm from './TransactionForm/TransactionForm'
import { Transaction } from '../../types'
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
  const transactionDrawerPlacement = useBreakpointValue<'bottom' | 'right'>({
    base: 'bottom',
    sm: 'right',
  }) ?? 'right'

  const handleTransactionCreated = () => {
    onTransactionCreated()
    onClose()
  }

  const form = (
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
  )

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      placement={transactionDrawerPlacement}
      size="full"
      blockScrollOnMount
    >
      <DrawerOverlay bg="var(--pb-overlay)" backdropFilter="blur(8px)" />
      <DrawerContent
        w="full"
        maxW={{ base: '100vw', sm: '520px' }}
        h={{ base: '92dvh', sm: '100dvh' }}
        maxH={{ base: '92dvh', sm: '100dvh' }}
        bg={ed.modal}
        borderLeft={{ base: 'none', sm: '1px solid' }}
        borderTop={{ base: '1px solid', sm: 'none' }}
        borderColor={ed.lineStrong}
        borderRadius={{ base: '22px 22px 0 0', sm: '22px 0 0 22px' }}
        boxShadow="-20px 0 50px -20px rgba(20, 35, 32, 0.35)"
        overflow="hidden"
      >
        <TransactionModalHeader type={type} onClose={onClose} useMobileSafeArea={false} />
        <DrawerBody
          display="flex"
          flexDirection="column"
          minH={0}
          p={0}
          overflow="hidden"
          pb="env(safe-area-inset-bottom, 0px)"
        >
          {form}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
