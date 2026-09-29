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
  const useMobileDrawer = useBreakpointValue({ base: true, md: false }) ?? true

  const handleTransactionCreated = () => {
    onTransactionCreated()
    onClose()
  }

  const form = (
    <Box
      flex="1"
      minW={0}
      maxW="100%"
      bg={ed.bg}
      p={{ base: 3, sm: 5, md: 6 }}
      overflowY="auto"
      sx={{
        '& p, & button, & input, & label, & .chakra-text': {
          fontSize: '16px !important',
        },
        '& input[data-amount-input]': {
          fontSize: '22px !important',
        },
      }}
    >
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

  if (useMobileDrawer) return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      placement="bottom"
      size="full"
      blockScrollOnMount
    >
      <DrawerOverlay bg="var(--pb-overlay)" backdropFilter="blur(8px)" />
      <DrawerContent
        w="full"
        maxW="100vw"
        h="92dvh"
        maxH="92dvh"
        bg={ed.modal}
        borderTop="1px solid"
        borderColor={ed.lineStrong}
        borderRadius="22px 22px 0 0"
        boxShadow="0 -20px 50px -20px rgba(20, 35, 32, 0.35)"
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

  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', md: 'xl', lg: '4xl' }}
      header={<TransactionModalHeader type={type} onClose={onClose} />}
    >
      {form}
    </PremiumModal>
  )
}
