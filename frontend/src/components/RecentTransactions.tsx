import { Box, Text, VStack, HStack, Badge, Divider, useColorModeValue, IconButton, useToast } from '@chakra-ui/react'
import { DeleteIcon } from '@chakra-ui/icons'
import { Transaction } from '../types'
import { deleteTransaction } from '../api'
import { useAuth } from '../contexts/AuthContext'
import { useMemo, useCallback } from 'react'

interface RecentTransactionsProps {
  transactions: Transaction[]
  type: 'INCOME' | 'EXPENSE'
  limit?: number
  onTransactionDeleted?: () => void
}

export default function RecentTransactions({ transactions, type, limit = 5, onTransactionDeleted }: RecentTransactionsProps) {
  const bgColor = useColorModeValue('gray.50', '#1a1a1a')
  const borderColor = useColorModeValue('gray.200', 'gray.800')
  const { user } = useAuth()
  const toast = useToast()

  // Memoize filtered and sorted transactions to prevent recalculation on every render
  const filteredTransactions = useMemo(() => 
    transactions
      .filter(tx => tx.type === type)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit),
    [transactions, type, limit]
  )

  const handleDelete = useCallback(async (transactionId: number) => {
    if (!user?.token) return
    
    try {
      await deleteTransaction(transactionId, user.token)
      toast({ title: 'Transaction deleted', status: 'success' })
      onTransactionDeleted?.()
    } catch (error: any) {
      toast({ 
        title: 'Error deleting transaction', 
        description: error?.response?.data?.message || 'Failed to delete transaction',
        status: 'error' 
      })
    }
  }, [user?.token, toast, onTransactionDeleted])

  if (filteredTransactions.length === 0) {
    return (
      <Box p={4} bg={bgColor} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
        <Text fontSize="sm" color="gray.500" textAlign="center">
          No recent {type.toLowerCase()}s found
        </Text>
      </Box>
    )
  }

  return (
    <Box p={4} bg={bgColor} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
      <Text fontSize="sm" fontWeight="bold" mb={3} color="gray.700">
        Recent {type === 'INCOME' ? 'Income' : 'Expenses'}:
      </Text>
      <VStack spacing={3} align="stretch">
        {filteredTransactions.map((tx, index) => (
          <Box key={tx.id || index}>
            <HStack justify="space-between" fontSize="sm">
              <VStack align="start" spacing={1} flex="1">
                <Text fontWeight="semibold" color="gray.800">
                  {tx.category}
                </Text>
                {tx.description && (
                  <Text fontSize="xs" color="gray.600" noOfLines={1} maxW="200px">
                    {tx.description}
                  </Text>
                )}
                <Text fontSize="xs" color="gray.500">
                  {new Date(tx.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </Text>
              </VStack>
              <HStack spacing={2}>
                <Badge
                  colorScheme={type === 'INCOME' ? 'green' : 'red'}
                  variant="solid"
                  fontSize="xs"
                  px={2}
                  py={1}
                  borderRadius="md"
                >
                  £{tx.amount.toFixed(2)}
                </Badge>
                {tx.id && (
                  <IconButton
                    aria-label="Delete transaction"
                    icon={<DeleteIcon />}
                    size="xs"
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => handleDelete(tx.id!)}
                  />
                )}
              </HStack>
            </HStack>
            {index < filteredTransactions.length - 1 && <Divider mt={3} />}
          </Box>
        ))}
      </VStack>
    </Box>
  )
}
