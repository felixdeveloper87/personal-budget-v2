import { Box, Text, VStack, HStack, Badge, Divider, useColorModeValue, IconButton } from '@chakra-ui/react'
import { DeleteIcon } from '@chakra-ui/icons'
import { Transaction } from '../../../types'
import { useMemo } from 'react'
import { formatTransactionDateTime } from '../../../utils/dateTime'
import { DeleteTransactionDialog } from '../../ui'
import { useDeleteTransaction } from '../../../hooks/useDeleteTransaction'
import { useThemeColors } from '../../../hooks/useThemeColors'
import { getResponsiveStyles } from '../../ui'

interface RecentTransactionsProps {
  transactions: Transaction[]
  type: 'INCOME' | 'EXPENSE'
  limit?: number
  onTransactionDeleted?: () => void
}

/**
 * 📊 RecentTransactions Component
 * - Displays recent transactions in the same style as other TransactionForm components
 * - Shows transaction details with delete functionality
 * - Uses consistent theming and responsive design
 */
export default function RecentTransactions({ transactions, type, limit = 5, onTransactionDeleted }: RecentTransactionsProps) {
  const colors = useThemeColors()
  const responsiveStyles = getResponsiveStyles()
  const { transactionToDelete, isOpen, openDeleteDialog, closeDeleteDialog } = useDeleteTransaction()

  const filteredTransactions = useMemo(
    () =>
      transactions
        .filter(tx => tx.type === type)
        .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
        .slice(0, limit),
    [transactions, type, limit]
  )

  if (filteredTransactions.length === 0) {
    return (
      <Box>
        <Text fontWeight="600" mb={3} color={colors.text.label} fontSize={{ base: 'sm', sm: 'md' }}>
          Recent {type === 'INCOME' ? 'Income' : 'Expenses'}
        </Text>
        <Box
          p={6}
          bg={colors.inputBg}
          borderRadius="2xl"
          border="2px solid"
          borderColor={colors.border}
          textAlign="center"
        >
          <Text fontSize="sm" color={colors.text.secondary}>
            No recent {type.toLowerCase()}s found
          </Text>
        </Box>
      </Box>
    )
  }

  return (
    <Box>
      <Text fontWeight="600" mb={3} color={colors.text.label} fontSize={{ base: 'sm', sm: 'md' }}>
        Recent {type === 'INCOME' ? 'Income' : 'Expenses'}
      </Text>
      
      <Box
        bg={colors.inputBg}
        borderRadius="2xl"
        border="2px solid"
        borderColor={colors.border}
        overflow="hidden"
        _hover={{
          borderColor: type === 'INCOME' ? 'green.400' : 'red.400',
          transform: 'translateY(-2px)',
          boxShadow: 'lg'
        }}
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      >
        {/* Decorative gradient background */}
        <Box
          position="relative"
          height="2px"
          bg={type === 'INCOME' 
            ? 'linear-gradient(90deg, #22c55e, #16a34a, #15803d)' 
            : 'linear-gradient(90deg, #ef4444, #dc2626, #b91c1c)'
          }
          opacity={0.8}
        />
        
        <VStack spacing={0} align="stretch" p={4}>
          {filteredTransactions.map((tx, index) => (
            <Box key={tx.id || index}>
              <HStack justify="space-between" fontSize="sm" py={2}>
                <VStack align="start" spacing={1} flex="1">
                  <Text fontWeight="semibold" color={colors.text.primary}>
                    {tx.category}
                  </Text>
                  {tx.description && (
                    <Text fontSize="xs" color={colors.text.secondary} noOfLines={1} maxW="200px">
                      {tx.description}
                    </Text>
                  )}
                  {/* Exibe data e horário */}
                  <VStack align="start" spacing={0}>
                    <Text fontSize="xs" color={colors.text.secondary}>
                      {formatTransactionDateTime(tx.dateTime).shortDate}
                    </Text>
                    <Text fontSize="xs" color={colors.text.secondary} opacity={0.7}>
                      {formatTransactionDateTime(tx.dateTime).time}
                    </Text>
                  </VStack>
                </VStack>

                <HStack spacing={2}>
                  <Badge
                    colorScheme={type === 'INCOME' ? 'green' : 'red'}
                    variant="solid"
                    fontSize="xs"
                    px={3}
                    py={1}
                    borderRadius="xl"
                    fontWeight="bold"
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
                      onClick={() => openDeleteDialog(tx)}
                      borderRadius="xl"
                      _hover={{
                        bg: 'red.50',
                        color: 'red.500'
                      }}
                    />
                  )}
                </HStack>
              </HStack>
              {index < filteredTransactions.length - 1 && (
                <Divider 
                  mt={2} 
                  borderColor={colors.border}
                  opacity={0.5}
                />
              )}
            </Box>
          ))}
        </VStack>
      </Box>
      
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
