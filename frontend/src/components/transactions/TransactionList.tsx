import { 
  Box, 
  Text, 
  Badge, 
  IconButton, 
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Heading,
} from '@chakra-ui/react'
import { DeleteIcon } from '@chakra-ui/icons'
import { Transaction } from '../../types'
import { deleteTransaction } from '../../api'
import { useAuth } from '../../contexts/AuthContext'
import { useMemo, useCallback } from 'react'

interface TransactionListProps {
  transactions: Transaction[]
  onTransactionDeleted?: () => void
}

export default function TransactionList({ transactions, onTransactionDeleted }: TransactionListProps) {
  const { user } = useAuth()
  const toast = useToast()

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

  // Memoize sorted transactions to prevent recalculation on every render
  const sortedTransactions = useMemo(() => 
    transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [transactions]
  )

  if (sortedTransactions.length === 0) {
    return (
      <Box p={6} textAlign="center">
        <Text color="gray.500">No transactions found</Text>
      </Box>
    )
  }

  return (
    <Box>
      <Heading size="md" mb={4}>
        All Transactions
      </Heading>
      <TableContainer>
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Date</Th>
              <Th>Type</Th>
              <Th>Category</Th>
              <Th>Description</Th>
              <Th isNumeric>Amount</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {sortedTransactions.map((tx) => (
              <Tr key={tx.id}>
                <Td>
                  <Text fontSize="sm">
                    {new Date(tx.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </Text>
                </Td>
                <Td>
                  <Badge
                    colorScheme={tx.type === 'INCOME' ? 'green' : 'red'}
                    variant="subtle"
                    fontSize="xs"
                  >
                    {tx.type}
                  </Badge>
                </Td>
                <Td>
                  <Text fontSize="sm" fontWeight="medium">
                    {tx.category}
                  </Text>
                </Td>
                <Td>
                  <Text fontSize="sm" color="gray.600" noOfLines={1} maxW="200px">
                    {tx.description || '-'}
                  </Text>
                </Td>
                <Td isNumeric>
                  <Text 
                    fontSize="sm" 
                    fontWeight="semibold"
                    color={tx.type === 'INCOME' ? 'green.600' : 'red.600'}
                  >
                    £{tx.amount.toFixed(2)}
                  </Text>
                </Td>
                <Td>
                  {tx.id && (
                    <IconButton
                      aria-label="Delete transaction"
                      icon={<DeleteIcon />}
                      size="sm"
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => handleDelete(tx.id!)}
                    />
                  )}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  )
}
