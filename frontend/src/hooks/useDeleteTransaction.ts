import { useState } from 'react'
import { useDisclosure } from '@chakra-ui/react'
import { Transaction } from '../types'

/**
 * 🗑️ useDeleteTransaction
 * Custom hook for managing transaction deletion with dialog
 * Returns dialog state and handlers for easy integration
 */
export function useDeleteTransaction() {
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const openDeleteDialog = (transaction: Transaction) => {
    setTransactionToDelete(transaction)
    onOpen()
  }

  const closeDeleteDialog = () => {
    setTransactionToDelete(null)
    onClose()
  }

  return {
    transactionToDelete,
    isOpen,
    openDeleteDialog,
    closeDeleteDialog,
  }
}
