import { 
  Box, 
  Text, 
  Badge, 
  IconButton, 
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Heading,
  VStack,
  HStack,
  Icon,
  Tooltip,
} from '@chakra-ui/react'
import { DeleteIcon } from '@chakra-ui/icons'
import { FiCreditCard } from 'react-icons/fi'
import { Transaction } from '../../types'
import { useMemo } from 'react'
import { formatTransactionDateTime } from '../../utils/dateTime'
import { DeleteTransactionDialog } from '../ui'
import { useDeleteTransaction } from '../../hooks/useDeleteTransaction'

interface TransactionListProps {
  transactions: Transaction[]
  onTransactionDeleted?: () => void
}

export default function TransactionList({ transactions, onTransactionDeleted }: TransactionListProps) {
  const { transactionToDelete, isOpen, openDeleteDialog, closeDeleteDialog } = useDeleteTransaction()

  // Memoize sorted transactions to prevent recalculation on every render
   const sortedTransactions = useMemo(() => 
    transactions
      .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()),
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
      <TableContainer>
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Date & Time</Th>
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
                  <VStack spacing={1} align="start">
                    <Text fontSize="sm" fontWeight="medium">
                      {formatTransactionDateTime(tx.dateTime).date}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {formatTransactionDateTime(tx.dateTime).time}
                    </Text>
                  </VStack>
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
                  <HStack spacing={2}>
                    <Text fontSize="sm" color="gray.600" noOfLines={1} maxW="200px">
                      {tx.description || '-'}
                    </Text>
                    {tx.isInstallment && (
                      <Tooltip label="Installment" hasArrow>
                        <span>
                          <Icon as={FiCreditCard} color="purple.500" fontSize="sm" />
                        </span>
                      </Tooltip>
                    )}
                  </HStack>
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
                      onClick={() => openDeleteDialog(tx)}
                    />
                  )}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      
      {/* Delete Transaction Dialog */}
      <DeleteTransactionDialog
        transaction={transactionToDelete}
        isOpen={isOpen}
        onClose={closeDeleteDialog}
        onDeleted={onTransactionDeleted || (() => {})}
      />
    </Box>
  )
}
