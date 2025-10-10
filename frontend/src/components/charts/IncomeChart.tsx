import { Box, Text, VStack, HStack, Progress, Badge, Button, useDisclosure, useColorModeValue } from '@chakra-ui/react'
import { Transaction } from '../../types'
import CategoryModal from '../modal/CategoryModal'
import { useMemo, useCallback } from 'react'

interface IncomeChartProps {
  transactions: Transaction[]
  selectedPeriod: string
}

export default function IncomeChart({ transactions, selectedPeriod }: IncomeChartProps) {
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
  const { incomeTransactions, sortedCategories, totalIncome } = useMemo(() => {
    // Filter only income transactions
    const incomeTransactions = transactions.filter(t => t.type === 'INCOME')
    
    // Group by category and calculate totals
    const categoryTotals = incomeTransactions.reduce((acc, transaction) => {
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

    const totalIncome = sortedCategories.reduce((sum, cat) => sum + cat.amount, 0)
    
    return { incomeTransactions, sortedCategories, totalIncome }
  }, [transactions])

  // Category colors
  const categoryColors = [
    'green.500', 'green.500', 'teal.500', 'cyan.500', 
    'blue.500', 'indigo.500', 'purple.500', 'violet.500'
  ]

  if (sortedCategories.length === 0) {
    return (
      <Box p={6} textAlign="center" color="gray.500">
        <Text fontSize="lg" mb={2}>No income found</Text>
        <Text fontSize="sm">Add some income transactions to see the breakdown</Text>
      </Box>
    )
  }

  return (
    <VStack spacing={4} align="stretch">
      <HStack justify="space-between" align="center" wrap="wrap" gap={2}>
        <Text fontSize="lg" fontWeight="semibold" color="gray.800">
          Income by Category
        </Text>
        <HStack spacing={2}>
          <Badge colorScheme="green" fontSize="sm" px={2} py={1}>
            {sortedCategories.length} categories
          </Badge>
          {sortedCategories.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              colorScheme="green"
              onClick={onOpen}
            >
              Show All
            </Button>
          )}
        </HStack>
      </HStack>

      <VStack spacing={3} align="stretch">
        {sortedCategories.slice(0, 5).map(({ category, amount }, index) => {
          const percentage = totalIncome > 0 ? (amount / totalIncome) * 100 : 0
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
            Total Income
          </Text>
          <Text fontSize="lg" fontWeight="bold" color="green.600">
            £{totalIncome.toFixed(2)}
          </Text>
        </HStack>
      </Box>

      {/* Category Modal */}
      <CategoryModal
        isOpen={isOpen}
        onClose={handleClose}
        transactions={transactions}
        type="INCOME"
        selectedPeriod={selectedPeriod}
      />
    </VStack>
  )
}
