import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Box,
  Badge,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Progress,
} from '@chakra-ui/react'
import { Transaction } from '../../types'
import { useMemo } from 'react'

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  transactions: Transaction[]
  type: 'INCOME' | 'EXPENSE'
  selectedPeriod: string
}

export default function CategoryModal({ isOpen, onClose, transactions, type, selectedPeriod }: CategoryModalProps) {
  const { filteredTransactions, sortedCategories } = useMemo(() => {
    const filteredTransactions = transactions.filter(t => t.type === type)

    const categoryTotals = filteredTransactions.reduce((acc, transaction) => {
      const category = transaction.category
      if (!acc[category]) {
        acc[category] = { total: 0, transactions: [] }
      }
      acc[category].total += transaction.amount
      acc[category].transactions.push(transaction)
      return acc
    }, {} as Record<string, { total: number; transactions: Transaction[] }>)

    const sortedCategories = Object.entries(categoryTotals)
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.total - a.total)

    return { filteredTransactions, sortedCategories }
  }, [transactions, type])

  const total = sortedCategories.reduce((sum, cat) => sum + cat.total, 0)

  const categoryColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
    '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA'
  ]

  const textColor = useColorModeValue('gray.800', 'gray.100')
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.400')
  const headerBg = useColorModeValue('gray.50', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{ base: "full", md: "xl" }} isCentered>
      <ModalOverlay />
      <ModalContent
        maxH={{ base: "100vh", md: "90vh" }}
        m={{ base: 0, md: 4 }}
        display="flex"
        flexDirection="column"
      >
        <ModalHeader flexShrink={0}>
          <HStack justify="space-between" align="center" wrap="wrap" gap={2}>
            <Text fontSize={{ base: "md", md: "lg" }}>
              {type === 'INCOME' ? 'Income' : 'Expenses'} by Category ({selectedPeriod})
            </Text>
            <Badge 
              colorScheme={type === 'INCOME' ? 'green' : 'red'} 
              fontSize="sm" 
              px={2} 
              py={1}
            >
              {sortedCategories.length} categories
            </Badge>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody pb={6} px={{ base: 4, md: 6 }} flex="1" overflowY="auto">
          {sortedCategories.length === 0 ? (
            <Box p={{ base: 4, md: 6 }} textAlign="center" color={secondaryTextColor}>
              <Text fontSize={{ base: "md", md: "lg" }} mb={2}>No {type.toLowerCase()} found</Text>
              <Text fontSize="sm">Add some {type.toLowerCase()} transactions to see the breakdown</Text>
            </Box>
          ) : (
            <VStack spacing={4} align="stretch">
              {/* Summary */}
              <HStack spacing={{ base: 2, md: 4 }} justify="space-around" p={{ base: 3, md: 4 }} bg={headerBg} borderRadius="md" wrap="wrap">
                <VStack spacing={1} minW="80px">
                  <Text fontSize="xs" color={secondaryTextColor}>Total {type}</Text>
                  <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold" color={type === 'INCOME' ? 'green.600' : 'red.600'}>
                    £{total.toFixed(2)}
                  </Text>
                </VStack>
                <VStack spacing={1} minW="80px">
                  <Text fontSize="xs" color={secondaryTextColor}>Categories</Text>
                  <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold" color={textColor}>
                    {sortedCategories.length}
                  </Text>
                </VStack>
                <VStack spacing={1} minW="80px">
                  <Text fontSize="xs" color={secondaryTextColor}>Transactions</Text>
                  <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold" color={textColor}>
                    {filteredTransactions.length}
                  </Text>
                </VStack>
              </HStack>

              {/* Breakdown */}
              <VStack spacing={3} align="stretch">
                {sortedCategories.map(({ category, total: categoryTotal, transactions: categoryTransactions }, index) => {
                  const percentage = total > 0 ? (categoryTotal / total) * 100 : 0
                  const color = categoryColors[index % categoryColors.length]

                  return (
                    <Box key={category} p={{ base: 3, md: 4 }} border="1px solid" borderColor={borderColor} borderRadius="lg">
                      <VStack spacing={3} align="stretch">
                        {/* Header */}
                        <HStack justify="space-between" align="center" wrap="wrap" gap={2}>
                          <HStack spacing={3} minW="0" flex="1">
                            <Box w={4} h={4} bg={color} borderRadius="sm" flexShrink={0} />
                            <Text fontSize={{ base: "md", md: "lg" }} fontWeight="semibold" color={textColor} isTruncated>
                              {category}
                            </Text>
                          </HStack>
                          <VStack spacing={0} align="end" flexShrink={0}>
                            <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold" color={textColor}>
                              £{categoryTotal.toFixed(2)}
                            </Text>
                            <Text fontSize="sm" color={secondaryTextColor}>
                              {percentage.toFixed(1)}% of total
                            </Text>
                          </VStack>
                        </HStack>

                        {/* Progress */}
                        <Progress
                          value={percentage}
                          colorScheme={type === 'INCOME' ? 'green' : 'red'}
                          size="lg"
                          borderRadius="md"
                          bg={useColorModeValue('gray.100', 'gray.700')}
                        />

                        {/* Transactions */}
                        <Box>
                          <Text fontSize="sm" fontWeight="medium" color={secondaryTextColor} mb={2}>
                            Transactions ({categoryTransactions.length})
                          </Text>
                          <Box overflowX="auto">
                            <Table size="sm" variant="simple" minW="300px">
                              <Thead>
                                <Tr>
                                  <Th fontSize="xs" color={secondaryTextColor} minW="60px">Date</Th>
                                  <Th fontSize="xs" color={secondaryTextColor} minW="120px">Description</Th>
                                  <Th fontSize="xs" color={secondaryTextColor} isNumeric minW="80px">Amount</Th>
                                </Tr>
                              </Thead>
                              <Tbody>
                                {categoryTransactions
                                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                  .slice(0, 5)
                                  .map((transaction) => (
                                    <Tr key={transaction.id}>
                                      <Td fontSize="xs" color={textColor}>
                                        {new Date(transaction.date).toLocaleDateString('en-US', { 
                                          month: 'short', 
                                          day: 'numeric' 
                                        })}
                                      </Td>
                                      <Td fontSize="xs" color={textColor} maxW="120px" isTruncated>
                                        {transaction.description || 'No description'}
                                      </Td>
                                      <Td fontSize="xs" fontWeight="semibold" color={textColor} isNumeric>
                                        £{transaction.amount.toFixed(2)}
                                      </Td>
                                    </Tr>
                                  ))}
                              </Tbody>
                            </Table>
                          </Box>
                          {categoryTransactions.length > 5 && (
                            <Text fontSize="xs" color={secondaryTextColor} mt={2} textAlign="center">
                              ... and {categoryTransactions.length - 5} more transactions
                            </Text>
                          )}
                        </Box>
                      </VStack>
                    </Box>
                  )
                })}
              </VStack>
            </VStack>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
