import { Box, Text, VStack, HStack, Progress, Badge, Button, useDisclosure, useColorModeValue } from '@chakra-ui/react'
import { Transaction } from '../../types'
import CategoryModal from '../modal/CategoryModal'
import { useMemo, useCallback } from 'react'

interface ExpenseChartProps {
  transactions: Transaction[]
  selectedPeriod: string
}

export default function ExpenseChart({ transactions, selectedPeriod }: ExpenseChartProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const progressBg = useColorModeValue("gray.100", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.800")
  const textColor = useColorModeValue("gray.500", "gray.400")
  const labelColor = useColorModeValue("gray.700", "gray.300")
  
  // Memoize the close handler to prevent unnecessary re-renders
  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])
  
  // Memoize expensive calculations to prevent recalculation on every render
  const { expenseTransactions, sortedCategories, totalExpenses } = useMemo(() => {
    // Filter only expense transactions
    const expenseTransactions = transactions.filter(t => t.type === 'EXPENSE')
    
    // Group by category and calculate totals
    const categoryTotals = expenseTransactions.reduce((acc, transaction) => {
      const category = transaction.category
      if (!acc[category]) {
        acc[category] = 0
      }
      acc[category] += transaction.amount
      return acc
    }, {} as Record<string, number>)

    // Sort categories by amount (highest first)
    const sortedCategories = Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)

    const totalExpenses = sortedCategories.reduce((sum, cat) => sum + cat.amount, 0)
    
    return { expenseTransactions, sortedCategories, totalExpenses }
  }, [transactions])

  // Category colors
  const categoryColors = [
    'red.500', 'orange.500', 'yellow.500', 'green.500', 
    'teal.500', 'blue.500', 'purple.500', 'pink.500'
  ]

  if (sortedCategories.length === 0) {
    return (
      <Box p={6} textAlign="center" color="gray.500">
        <Text fontSize="lg" mb={2}>No expenses found</Text>
        <Text fontSize="sm">Add some expense transactions to see the breakdown</Text>
      </Box>
    )
  }

  return (
    <VStack spacing={4} align="stretch">
      <HStack justify="space-between" align="center" wrap="wrap" gap={2}>
        <Text fontSize="lg" fontWeight="semibold" color="gray.800">
          Expenses by Category
        </Text>
        <HStack spacing={2}>
          <Badge colorScheme="red" fontSize="sm" px={2} py={1}>
            {sortedCategories.length} categories
          </Badge>
          {sortedCategories.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              colorScheme="red"
              onClick={onOpen}
            >
              Show All
            </Button>
          )}
        </HStack>
      </HStack>

      <VStack spacing={3} align="stretch">
        {sortedCategories.slice(0, 5).map(({ category, amount }, index) => {
          const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
          const color = categoryColors[index % categoryColors.length]
          
          return (
            <Box key={category}>
              <HStack justify="space-between" mb={1}>
                <Text fontSize="sm" fontWeight="medium" color="gray.700">
                  {category}
                </Text>
                <HStack spacing={2}>
                  <Text fontSize="sm" color="gray.600">
                    {percentage.toFixed(1)}%
                  </Text>
                  <Text fontSize="sm" fontWeight="semibold" color="gray.800">
                    £{amount.toFixed(2)}
                  </Text>
                </HStack>
              </HStack>
              <Progress
                value={percentage}
                colorScheme={color.split('.')[0] as any}
                size="lg"
                borderRadius="md"
                bg={progressBg}
              />
            </Box>
          )
        })}
        
        {/* Show more indicator */}
        {sortedCategories.length > 5 && (
          <Box textAlign="center" py={2}>
            <Text fontSize="sm" color={textColor}>
              ... and {sortedCategories.length - 5} more categories
            </Text>
          </Box>
        )}
      </VStack>

      <Box pt={2} borderTop="1px solid" borderColor={borderColor}>
        <HStack justify="space-between">
          <Text fontSize="sm" fontWeight="semibold" color={labelColor}>
            Total Expenses
          </Text>
          <Text fontSize="lg" fontWeight="bold" color="red.600">
            £{totalExpenses.toFixed(2)}
          </Text>
        </HStack>
      </Box>

      {/* Category Modal */}
      <CategoryModal
        isOpen={isOpen}
        onClose={handleClose}
        transactions={transactions}
        type="EXPENSE"
        selectedPeriod={selectedPeriod}
      />
    </VStack>
  )
}
