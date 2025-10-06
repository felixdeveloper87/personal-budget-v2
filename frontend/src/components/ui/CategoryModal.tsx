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
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Progress,
  Button,
  Collapse,
} from '@chakra-ui/react'
import { useMemo, useState } from 'react'
import { Transaction } from '../../types'
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons'

// 🎨 Fixed color palette (outside component for performance)
const CATEGORY_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA'
]

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  transactions: Transaction[]
  type: 'INCOME' | 'EXPENSE'
  selectedPeriod: string
}

export default function CategoryModal({ isOpen, onClose, transactions, type, selectedPeriod }: CategoryModalProps) {
  // Theme colors
  const colors = {
    text: useColorModeValue('gray.800', 'gray.100'),
    secondary: useColorModeValue('gray.600', 'gray.400'),
    headerBg: useColorModeValue('gray.50', 'gray.700'),
    border: useColorModeValue('gray.200', 'gray.600'),
    modalHeaderBg: useColorModeValue('linear(to-r, blue.50, purple.50)', 'linear(to-r, gray.800, gray.700)'),
  }

  const filteredTransactions = useMemo(
    () => transactions.filter(t => t.type === type),
    [transactions, type]
  )

  const { sortedCategories, total } = useMemo(() => {
    const categoryTotals = filteredTransactions.reduce((acc, transaction) => {
      const category = transaction.category
      if (!acc[category]) acc[category] = { total: 0, transactions: [] }
      acc[category].total += transaction.amount
      acc[category].transactions.push(transaction)
      return acc
    }, {} as Record<string, { total: number; transactions: Transaction[] }>)

    // Sort transactions within each category
    Object.values(categoryTotals).forEach(cat =>
      cat.transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    )

    const sortedCategories = Object.entries(categoryTotals)
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.total - a.total)

    const total = sortedCategories.reduce((sum, cat) => sum + cat.total, 0)
    return { sortedCategories, total }
  }, [filteredTransactions])

  // Track expanded categories (to show full list)
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }))
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: "full", md: "xl" }}
      isCentered
      closeOnOverlayClick
      closeOnEsc
      blockScrollOnMount
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
          bgGradient={colors.modalHeaderBg}
          borderBottom="1px solid"
          borderColor={colors.border}
          py={{ base: 4, md: 6 }}
        >
          <VStack spacing={3} align="stretch" w="full">
            {/* 🔹 Main title */}
            <HStack justify="space-between" align="center" wrap="wrap" gap={2}>
              <HStack spacing={3} align="center">
                <Box
                  w={8}
                  h={8}
                  borderRadius="full"
                  bgGradient={
                    type === 'INCOME'
                      ? 'linear(to-r, green.400, green.500)'
                      : 'linear(to-r, red.400, pink.500)'
                  }
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  boxShadow={type === 'INCOME'
                    ? '0 0 8px rgba(72,187,120,0.6)'
                    : '0 0 8px rgba(245,101,101,0.6)'
                  }
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
                    color={colors.text}
                    lineHeight="1.2"
                  >
                    {type === 'INCOME' ? 'Income' : 'Expenses'} by Category
                  </Text>
                  <Text fontSize="sm" color={colors.secondary} fontWeight="500">
                    {selectedPeriod}
                  </Text>
                </VStack>
              </HStack>
            </HStack>

            {/* 🔸 Quick stats */}
            <HStack
              spacing={{ base: 2, md: 4 }}
              justify="space-around"
              wrap="wrap"
              p={{ base: 3, md: 4 }}
              bg={colors.headerBg}
              borderRadius="md"
            >
              <VStack spacing={1} minW="80px">
                <Text fontSize="xs" color={colors.secondary}>Total {type}</Text>
                <Text
                  fontSize={{ base: "md", md: "lg" }}
                  fontWeight="bold"
                  color={type === 'INCOME' ? 'green.600' : 'red.600'}
                >
                  £{total.toFixed(2)}
                </Text>
              </VStack>
              <VStack spacing={1} minW="80px">
                <Text fontSize="xs" color={colors.secondary}>Categories</Text>
                <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold" color={colors.text}>
                  {sortedCategories.length}
                </Text>
              </VStack>
              <VStack spacing={1} minW="80px">
                <Text fontSize="xs" color={colors.secondary}>Transactions</Text>
                <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold" color={colors.text}>
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
            transform: 'scale(1.1)',
          }}
          transition="all 0.2s"
        />

        <ModalBody pb={6} px={{ base: 4, md: 6 }} flex="1" overflowY="auto">
          {sortedCategories.length === 0 ? (
            <Box p={{ base: 4, md: 6 }} textAlign="center" color={colors.secondary}>
              <Text fontSize={{ base: "md", md: "lg" }} mb={2}>
                No {type.toLowerCase()} found
              </Text>
              <Text fontSize="sm">
                Add some {type.toLowerCase()} transactions to see the breakdown
              </Text>
            </Box>
          ) : (
            <VStack spacing={4} align="stretch">
              {sortedCategories.map(({ category, total: categoryTotal, transactions: categoryTransactions }, index) => {
                const percentage = total > 0 ? (categoryTotal / total) * 100 : 0
                const color = CATEGORY_COLORS[index % CATEGORY_COLORS.length]
                const isExpanded = expandedCategories[category]

                const visibleTransactions = isExpanded
                  ? categoryTransactions
                  : categoryTransactions.slice(0, 5)

                return (
                  <Box key={category} p={{ base: 3, md: 4 }} border="1px solid" borderColor={colors.border} borderRadius="lg">
                    <VStack spacing={3} align="stretch">
                      <HStack justify="space-between" align="center" wrap="wrap" gap={2}>
                        <HStack spacing={3} minW="0" flex="1">
                          <Box w={4} h={4} bg={color} borderRadius="sm" flexShrink={0} />
                          <Text fontSize={{ base: "md", md: "lg" }} fontWeight="semibold" color={colors.text} isTruncated>
                            {category}
                          </Text>
                        </HStack>
                        <VStack spacing={0} align="end" flexShrink={0}>
                          <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold" color={colors.text}>
                            £{categoryTotal.toFixed(2)}
                          </Text>
                          <Text fontSize="sm" color={colors.secondary}>
                            {percentage.toFixed(1)}% of total
                          </Text>
                        </VStack>
                      </HStack>

                      <Progress
                        value={percentage}
                        colorScheme={type === 'INCOME' ? 'green' : 'red'}
                        size="lg"
                        borderRadius="md"
                        bg={useColorModeValue('gray.100', 'gray.700')}
                      />

                      <Box>
                        <Text fontSize="sm" fontWeight="medium" color={colors.secondary} mb={2}>
                          Transactions ({categoryTransactions.length})
                        </Text>

                        <Collapse in={isExpanded} animateOpacity startingHeight={170}>
                          <Box overflowX="auto">
                            <Table size="sm" variant="simple" minW="300px">
                              <Thead>
                                <Tr>
                                  <Th fontSize="xs" color={colors.secondary}>Date</Th>
                                  <Th fontSize="xs" color={colors.secondary}>Description</Th>
                                  <Th fontSize="xs" color={colors.secondary} isNumeric>Amount</Th>
                                </Tr>
                              </Thead>
                              <Tbody>
                                {visibleTransactions.map((t) => (
                                  <Tr key={t.id}>
                                    <Td fontSize="xs" color={colors.text}>
                                      {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </Td>
                                    <Td fontSize="xs" color={colors.text} maxW="120px" isTruncated>
                                      {t.description || 'No description'}
                                    </Td>
                                    <Td fontSize="xs" fontWeight="semibold" color={colors.text} isNumeric>
                                      £{t.amount.toFixed(2)}
                                    </Td>
                                  </Tr>
                                ))}
                              </Tbody>
                            </Table>
                          </Box>
                        </Collapse>

                        {categoryTransactions.length > 5 && (
                          <Button
                            onClick={() => toggleCategory(category)}
                            variant="ghost"
                            size="sm"
                            mt={2}
                            w="full"
                            colorScheme={type === 'INCOME' ? 'green' : 'red'}
                            rightIcon={isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                          >
                            {isExpanded ? 'Show less' : `Show ${categoryTransactions.length - 5} more`}
                          </Button>
                        )}
                      </Box>
                    </VStack>
                  </Box>
                )
              })}
            </VStack>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
