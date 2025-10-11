import React, { useState } from 'react'
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  useToast,
  useDisclosure,
} from '@chakra-ui/react'
import { useThemeColors } from '../../hooks/useThemeColors'
import { deleteTransaction } from '../../api'
import { Transaction } from '../../types'

interface DeleteTransactionDialogProps {
  transaction: Transaction | null
  isOpen: boolean
  onClose: () => void
  onDeleted: () => void
}

/**
 * 🗑️ DeleteTransactionDialog
 * Centralized component for deleting transactions with confirmation dialog
 * Handles API call, loading states, and success/error feedback
 */
export default function DeleteTransactionDialog({
  transaction,
  isOpen,
  onClose,
  onDeleted,
}: DeleteTransactionDialogProps) {
  const colors = useThemeColors()
  const toast = useToast()
  const [isDeleting, setIsDeleting] = useState(false)
  const cancelRef = React.useRef<HTMLButtonElement>(null)

  const handleDelete = async () => {
    if (!transaction?.id) return

    setIsDeleting(true)
    try {
      await deleteTransaction(transaction.id)
      
      toast({
        title: 'Transaction deleted',
        description: `${transaction.description || 'Transaction'} has been removed`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
      
      onDeleted()
      onClose()
    } catch (err: any) {
      toast({
        title: 'Error deleting transaction',
        description: err?.message || 'Please try again',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (!transaction) return null

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      isCentered
    >
      <AlertDialogOverlay>
        <AlertDialogContent
          bg={colors.cardBg}
          borderColor={colors.border}
          borderRadius="xl"
          maxW="400px"
        >
          <AlertDialogHeader fontSize="lg" fontWeight="bold" color={colors.text.primary}>
            Delete Transaction
          </AlertDialogHeader>

          <AlertDialogBody>
            <p style={{ color: colors.text.secondary, marginBottom: '12px' }}>
              Are you sure you want to delete this transaction?
            </p>
            <div style={{ 
              padding: '12px', 
              backgroundColor: colors.bgSecondary, 
              borderRadius: '8px',
              border: `1px solid ${colors.border}`
            }}>
              <p style={{ fontWeight: 'bold', color: colors.text.primary, marginBottom: '4px' }}>
                {transaction.description || 'No description'}
              </p>
              <p style={{ fontSize: '14px', color: colors.text.secondary }}>
                {transaction.type === 'INCOME' ? 'Income' : 'Expense'} • {transaction.category}
              </p>
              <p style={{ fontSize: '16px', fontWeight: 'bold', color: colors.accent, marginTop: '4px' }}>
                £{transaction.amount.toFixed(2)}
              </p>
            </div>
            <p style={{ color: colors.text.secondary, fontSize: '14px', marginTop: '12px' }}>
              This action cannot be undone.
            </p>
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button
              ref={cancelRef}
              onClick={onClose}
              variant="outline"
              borderColor={colors.border}
              color={colors.text.secondary}
              _hover={{ bg: colors.bgSecondary }}
            >
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={handleDelete}
              ml={3}
              isLoading={isDeleting}
              loadingText="Deleting..."
              bg="red.500"
              _hover={{ bg: 'red.600' }}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  )
}
