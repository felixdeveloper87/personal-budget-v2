import { 
  VStack, 
  Text, 
  useColorModeValue,
  Box,
  HStack,
  Icon,
  Badge
} from '@chakra-ui/react'
import { Search } from 'lucide-react'
import { memo, useMemo, useState, useCallback } from 'react'
import CategoryResultCard from './CategoryResultCard'
import { Transaction } from '../../types'
import { CategoryResultsListProps } from '../../types'

const CategoryResultsList = memo(function CategoryResultsList({
  transactions,
  searchFilters
}: CategoryResultsListProps) {
  const textColor = useColorModeValue('gray.600', 'gray.400')
  const emptyStateColor = useColorModeValue('gray.500', 'gray.500')

  // State for expanded categories
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  // Memoized grouped transactions
  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: Transaction[] } = {}
    
    transactions.forEach(transaction => {
      const key = `${transaction.type}-${transaction.category}`
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(transaction)
    })

    // Sort categories by total amount (descending)
    return Object.entries(groups).sort(([, a], [, b]) => {
      const totalA = a.reduce((sum, t) => sum + t.amount, 0)
      const totalB = b.reduce((sum, t) => sum + t.amount, 0)
      return totalB - totalA
    })
  }, [transactions])

  // Memoized filtered transactions count
  const filteredCount = useMemo(() => {
    return transactions.length
  }, [transactions])

  // Toggle category expansion
  const toggleCategory = useCallback((categoryKey: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryKey)) {
        newSet.delete(categoryKey)
      } else {
        newSet.add(categoryKey)
      }
      return newSet
    })
  }, [])

  // Expand all categories
  const expandAll = useCallback(() => {
    setExpandedCategories(new Set(groupedTransactions.map(([key]) => key)))
  }, [groupedTransactions])

  // Collapse all categories
  const collapseAll = useCallback(() => {
    setExpandedCategories(new Set())
  }, [])

  // Check if all categories are expanded
  const allExpanded = groupedTransactions.length > 0 && 
    groupedTransactions.every(([key]) => expandedCategories.has(key))

  if (filteredCount === 0) {
    return (
      <Box textAlign="center" py={12}>
        <Icon as={Search} boxSize={16} color={emptyStateColor} mb={4} />
        <Text fontSize="lg" fontWeight="600" color={textColor} mb={2}>
          No transactions found
        </Text>
        <Text fontSize="sm" color={emptyStateColor}>
          Try adjusting your search criteria
        </Text>
      </Box>
    )
  }

  return (
    <VStack spacing={4} align="stretch" w="full">
      {/* Results Header */}
      <Box w="full">
        <HStack justify="space-between" align="center" mb={4}>
          <HStack spacing={3}>
            <Text fontSize="lg" fontWeight="bold" color={textColor}>
              Results by Category
            </Text>
            <Badge 
              colorScheme="blue" 
              variant="subtle" 
              px={3} 
              py={1} 
              borderRadius="full"
            >
              {groupedTransactions.length} categor{groupedTransactions.length !== 1 ? 'ies' : 'y'}
            </Badge>
          </HStack>
          
          {groupedTransactions.length > 1 && (
            <HStack spacing={2}>
              <Text fontSize="sm" color={textColor}>
                {allExpanded ? 'All expanded' : `${expandedCategories.size}/${groupedTransactions.length} expanded`}
              </Text>
              <Box>
                {allExpanded ? (
                  <Badge 
                    colorScheme="red" 
                    variant="outline" 
                    cursor="pointer"
                    onClick={collapseAll}
                    _hover={{ bg: useColorModeValue('red.50', 'red.900') }}
                    px={2}
                    py={1}
                    borderRadius="md"
                  >
                    Collapse All
                  </Badge>
                ) : (
                  <Badge 
                    colorScheme="green" 
                    variant="outline" 
                    cursor="pointer"
                    onClick={expandAll}
                    _hover={{ bg: useColorModeValue('green.50', 'green.900') }}
                    px={2}
                    py={1}
                    borderRadius="md"
                  >
                    Expand All
                  </Badge>
                )}
              </Box>
            </HStack>
          )}
        </HStack>
      </Box>

      {/* Category Cards */}
      {groupedTransactions.map(([categoryKey, categoryTransactions]) => {
        const [type, category] = categoryKey.split('-', 2)
        const isExpanded = expandedCategories.has(categoryKey)
        
        return (
          <CategoryResultCard
            key={categoryKey}
            category={category}
            transactions={categoryTransactions}
            type={type as 'INCOME' | 'EXPENSE'}
            isExpanded={isExpanded}
            onToggle={() => toggleCategory(categoryKey)}
          />
        )
      })}
    </VStack>
  )
})

export default CategoryResultsList
