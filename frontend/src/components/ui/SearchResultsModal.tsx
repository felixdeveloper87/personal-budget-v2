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
    Button,
    Spinner,
    Center,
  } from '@chakra-ui/react'
  import { useMemo, useState, useEffect } from 'react'
  import { Transaction } from '../../types'
  import { searchTransactions } from '../../api'
  import { useAuth } from '../../contexts/AuthContext'
  import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons'
  
  const CATEGORY_COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
    '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA'
  ]
  
  interface SearchResultsModalProps {
    isOpen: boolean
    onClose: () => void
    searchFilters: {
      text: string
      type: 'income' | 'expense' | null
      category: string
      startDate: string
      endDate: string
    }
  }
  
  export default function SearchResultsModal({ isOpen, onClose, searchFilters }: SearchResultsModalProps) {
    const { user } = useAuth()
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})
  
    const colors = {
      text: useColorModeValue('gray.800', 'gray.100'),
      secondary: useColorModeValue('gray.600', 'gray.400'),
      headerBg: useColorModeValue('gray.50', 'gray.700'),
      border: useColorModeValue('gray.200', 'gray.600'),
      modalHeaderBg: useColorModeValue('linear(to-r, blue.100, purple.100)', 'linear(to-r, gray.800, gray.700)'),
    }
  
    useEffect(() => {
      if (isOpen && user?.token) {
        setIsLoading(true)
        searchTransactions({
          ...searchFilters,
          type: searchFilters.type === null ? undefined : searchFilters.type
        }, user.token)
          .then(data => setTransactions(data))
          .catch(err => {
            console.error('Erro ao buscar transações:', err)
            setTransactions([])
          })
          .finally(() => setIsLoading(false))
      }
    }, [isOpen, searchFilters, user?.token])
  
    const { filteredResults, totalIncome, totalExpense, totalAmount, groupedByCategory } = useMemo(() => {
      let results = transactions.filter(t => {
        const matchesText = searchFilters.text ? t.description.toLowerCase().includes(searchFilters.text.toLowerCase()) : true
        const matchesType = searchFilters.type ? t.type.toLowerCase() === searchFilters.type : true
        const matchesCategory = searchFilters.category ? t.category.toLowerCase() === searchFilters.category.toLowerCase() : true
        const transactionDate = new Date(t.date)
        const matchesStartDate = searchFilters.startDate ? transactionDate >= new Date(searchFilters.startDate) : true
        const matchesEndDate = searchFilters.endDate ? transactionDate <= new Date(searchFilters.endDate) : true
  
        return matchesText && matchesType && matchesCategory && matchesStartDate && matchesEndDate
      })
  
      const incomeResults = results.filter(t => t.type === 'INCOME')
      const expenseResults = results.filter(t => t.type === 'EXPENSE')
  
      const totalIncome = incomeResults.reduce((sum, t) => sum + t.amount, 0)
      const totalExpense = expenseResults.reduce((sum, t) => sum + t.amount, 0)
      const totalAmount = totalIncome - totalExpense
  
      const grouped: Record<string, { total: number; transactions: Transaction[] }> = {}
      results.forEach(t => {
        if (!grouped[t.category]) grouped[t.category] = { total: 0, transactions: [] }
        grouped[t.category].total += t.amount
        grouped[t.category].transactions.push(t)
      })
  
      Object.values(grouped).forEach(cat =>
        cat.transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      )
  
      const groupedByCategory = Object.entries(grouped)
        .map(([category, data]) => ({ category, ...data }))
        .sort((a, b) => b.total - a.total)
  
      return { filteredResults: results, totalIncome, totalExpense, totalAmount, groupedByCategory }
    }, [transactions, searchFilters])
  
    const toggleCategory = (category: string) => {
      setExpandedCategories(prev => ({
        ...prev,
        [category]: !prev[category],
      }))
    }
  
    const getFilterDescription = () => {
      const parts = []
      if (searchFilters.text) parts.push(`"${searchFilters.text}"`)
      if (searchFilters.type) parts.push(searchFilters.type === 'income' ? 'Income' : 'Expense')
      if (searchFilters.category) parts.push(searchFilters.category)
      if (searchFilters.startDate && searchFilters.endDate) parts.push(`${searchFilters.startDate} to ${searchFilters.endDate}`)
      else if (searchFilters.startDate) parts.push(`from ${searchFilters.startDate}`)
      else if (searchFilters.endDate) parts.push(`until ${searchFilters.endDate}`)
      return parts.length > 0 ? `for ${parts.join(', ')}` : 'All Transactions'
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
          boxShadow="none"
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
              <HStack spacing={3} align="center">
                <Box
                  w={8}
                  h={8}
                  borderRadius="full"
                  bgGradient={
                    totalAmount >= 0
                      ? 'linear(to-r, green.400, green.500)'
                      : 'linear(to-r, red.400, pink.500)'
                  }
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  boxShadow="md"
                >
                  <Text fontSize="lg" color="white" fontWeight="bold">£</Text>
                </Box>
  
                <VStack spacing={0} align="start">
                  <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color={colors.text}>
                    Search Results
                  </Text>
                  <Text fontSize="sm" color={colors.secondary}>
                    {getFilterDescription()}
                  </Text>
                </VStack>
              </HStack>
  
              <HStack
                spacing={{ base: 2, md: 4 }}
                justify="space-around"
                wrap="wrap"
                p={{ base: 3, md: 4 }}
                bg={colors.headerBg}
                borderRadius="md"
              >
                <VStack spacing={1} minW="80px">
                  <Text fontSize="xs" color={colors.secondary}>Total Amount</Text>
                  <Text
                    fontSize={{ base: "md", md: "lg" }}
                    fontWeight="bold"
                    color={totalAmount >= 0 ? 'green.600' : 'red.600'}
                  >
                    £{totalAmount.toFixed(2)}
                  </Text>
                </VStack>
                <VStack spacing={1} minW="80px">
                  <Text fontSize="xs" color={colors.secondary}>Income</Text>
                  <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold" color="green.600">
                    £{totalIncome.toFixed(2)}
                  </Text>
                </VStack>
                <VStack spacing={1} minW="80px">
                  <Text fontSize="xs" color={colors.secondary}>Expenses</Text>
                  <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold" color="red.600">
                    £{totalExpense.toFixed(2)}
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
            _hover={{
              bg: useColorModeValue('gray.100', 'gray.700'),
              transform: 'none',
            }}
            transition="none"
          />
  
          <ModalBody pb={6} px={{ base: 4, md: 6 }} flex="1" overflowY="auto">
            {isLoading ? (
              <Center py={8}>
                <VStack spacing={4}>
                  <Spinner size="xl" color="blue.500" />
                  <Text color={colors.secondary}>Searching transactions...</Text>
                </VStack>
              </Center>
            ) : filteredResults.length === 0 ? (
              <Box p={{ base: 4, md: 6 }} textAlign="center" color={colors.secondary}>
                <Text fontSize={{ base: "md", md: "lg" }} mb={2}>
                  No transactions found for your search criteria.
                </Text>
                <Text fontSize="sm">Try adjusting your filters.</Text>
              </Box>
            ) : (
              <VStack spacing={4} align="stretch">
                {groupedByCategory.map(({ category, total: categoryTotal, transactions: categoryTransactions }, index) => {
                  const color = CATEGORY_COLORS[index % CATEGORY_COLORS.length]
                  const isExpanded = !!expandedCategories[category]
                  const visibleTransactions = isExpanded
                    ? categoryTransactions
                    : categoryTransactions.slice(0, 5)
  
                  return (
                    <Box
                      key={category}
                      p={{ base: 4, md: 5 }}
                      border="1px solid"
                      borderColor={colors.border}
                      borderRadius="xl"
                      bg="transparent"
                    >
                      <VStack spacing={3} align="stretch">
                        <HStack justify="space-between" align="center" wrap="wrap" gap={2}>
                          <HStack spacing={3} minW="0" flex="1">
                            <Box w={4} h={4} bg={color} borderRadius="sm" flexShrink={0} />
                            <Text fontSize={{ base: "md", md: "lg" }} fontWeight="semibold" color={colors.text} isTruncated>
                              {category}
                            </Text>
                          </HStack>
                          <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold" color={colors.text}>
                            £{categoryTotal.toFixed(2)}
                          </Text>
                        </HStack>
  
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
  
                        {categoryTransactions.length > 5 && (
                          <Button
                            onClick={() => toggleCategory(category)}
                            variant="ghost"
                            size="sm"
                            mt={2}
                            w="full"
                            colorScheme={categoryTotal >= 0 ? 'green' : 'red'}
                            rightIcon={isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                          >
                            {isExpanded
                              ? 'Show less'
                              : `Show ${categoryTransactions.length - 5} more`}
                          </Button>
                        )}
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
  