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
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size={{ base: "full", md: "xl" }} 
      isCentered
      closeOnOverlayClick={true}
      closeOnEsc={true}
      blockScrollOnMount={true}
    >
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
      <ModalContent
        maxH={{ base: "100vh", md: "90vh" }}
        m={{ base: 0, md: 4 }}
        display="flex"
        flexDirection="column"
        borderRadius={{ base: 0, md: "xl" }}
        boxShadow="2xl"
      >
        <ModalHeader 
          flexShrink={0} 
          position="relative" 
          pr={{ base: 12, md: 16 }}
          bgGradient={useColorModeValue(
            'linear(to-r, blue.50, purple.50)',
            'linear(to-r, gray.800, gray.700)'
          )}
          borderBottom="1px solid"
          borderColor={useColorModeValue('gray.200', 'gray.600')}
          py={{ base: 4, md: 6 }}
        >
          <VStack spacing={3} align="stretch" w="full">
            {/* Main Title */}
            <HStack justify="space-between" align="center" wrap="wrap" gap={2}>
              <HStack spacing={3} align="center">
                <Box
                  w={8}
                  h={8}
                  borderRadius="full"
                  bgGradient={type === 'INCOME' 
                    ? 'linear(to-r, green.400, green.500)'
                    : 'linear(to-r, red.400, pink.500)'
                  }
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  boxShadow="md"
                >
                  <Text 
                    fontSize="lg" 
                    color="white" 
                    fontWeight="bold"
                    textShadow="0 1px 2px rgba(0,0,0,0.3)"
                  >
                    £
                  </Text>
                </Box>
                <VStack spacing={0} align="start">
                  <Text 
                    fontSize={{ base: "lg", md: "xl" }} 
                    fontWeight="bold" 
                    color={useColorModeValue('gray.800', 'white')}
                    lineHeight="1.2"
                  >
                    {type === 'INCOME' ? 'Income' : 'Expenses'} by Category
                  </Text>
                  <Text 
                    fontSize="sm" 
                    color={useColorModeValue('gray.600', 'gray.400')}
                    fontWeight="500"
                  >
                    {selectedPeriod}
                  </Text>
                </VStack>
              </HStack>
              
            </HStack>

            {/* Quick Stats */}
            <HStack 
              spacing={{ base: 2, md: 4 }} 
              justify="space-around" 
              wrap="wrap"
              p={{ base: 3, md: 4 }} 
              bg={headerBg} 
              borderRadius="md"
            >
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
          </VStack>
        </ModalHeader>
        <ModalCloseButton 
          size="lg"
          position="absolute"
          top={{ base: 4, md: 6 }}
          right={{ base: 4, md: 6 }}
          zIndex={10}
          bg={useColorModeValue('white', 'gray.800')}
          borderRadius="full"
          boxShadow="md"
          _hover={{
            bg: useColorModeValue('gray.100', 'gray.700'),
            transform: 'scale(1.1)'
          }}
          transition="all 0.2s"
        />

        <ModalBody pb={6} px={{ base: 4, md: 6 }} flex="1" overflowY="auto">
          {sortedCategories.length === 0 ? (
            <Box p={{ base: 4, md: 6 }} textAlign="center" color={secondaryTextColor}>
              <Text fontSize={{ base: "md", md: "lg" }} mb={2}>No {type.toLowerCase()} found</Text>
              <Text fontSize="sm">Add some {type.toLowerCase()} transactions to see the breakdown</Text>
            </Box>
          ) : (
            <VStack spacing={4} align="stretch">
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
