import { Box, Text, VStack, HStack, Progress, Badge, Button, useDisclosure, useColorModeValue, Icon, Flex, Heading, useBreakpointValue } from '@chakra-ui/react'
import { Transaction } from '../../types'
import CategoryModal from './modal/CategoryModal'
import { useMemo, useCallback } from 'react'
import { TrendingDown, BarChart3, Eye, Sparkles } from 'lucide-react'
import { getResponsiveStyles } from '../ui'
import { useThemeColors } from '../../hooks/useThemeColors'

interface ExpenseChartProps {
  transactions: Transaction[]
  selectedPeriod: string
}

export default function ExpenseChart({ transactions, selectedPeriod }: ExpenseChartProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const colors = useThemeColors()
  const responsiveStyles = getResponsiveStyles()
  const isMobile = useBreakpointValue({ base: true, md: false })

  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  // Cores para as categorias
  const categoryColors = [
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', 
    '#8b5cf6', '#ec4899', '#84cc16', '#f59e0b', '#ef4444'
  ]

  const { sortedCategories, totalExpenses } = useMemo(() => {
    const categoryTotals = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((acc, transaction) => {
        const category = transaction.category || 'Uncategorized'
        acc[category] = (acc[category] || 0) + transaction.amount
        return acc
      }, {} as Record<string, number>)

    const sorted = Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)

    const total = sorted.reduce((sum, { amount }) => sum + amount, 0)

    return { sortedCategories: sorted, totalExpenses: total }
  }, [transactions])

  if (sortedCategories.length === 0) {
    return (
      <Box
        bg={useColorModeValue(
          'rgba(255, 255, 255, 0.9)',
          'rgba(255, 255, 255, 0.05)'
        )}
        backdropFilter="blur(10px)"
        border="1px solid"
        borderColor={useColorModeValue('gray.200', 'gray.600')}
        borderRadius="2xl"
        p={{ base: 3, sm: 4, md: 5, lg: 6 }}
        boxShadow="sm"
        w="full"
        _hover={{
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
          borderColor: useColorModeValue('red.200', 'red.500')
        }}
        transition="all 0.2s ease"
      >
        <VStack spacing={4} align="center" py={8}>
          <Box
            p={{ base: 2, sm: 2.5, md: 3 }}
            borderRadius="xl"
            bg={useColorModeValue('#fecaca', '#2d1b1b')} // Rosa post-it
            border="1px solid"
            borderColor={useColorModeValue('red.200', 'red.500')}
            boxShadow="sm"
            _hover={{
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              borderColor: useColorModeValue('red.300', 'red.400')
            }}
            transition="all 0.2s ease"
          >
            <Icon as={BarChart3} boxSize={{ base: 4, sm: 5, md: 6 }} color={useColorModeValue('red.600', 'red.300')} />
          </Box>
          <Text fontSize={{ base: 'md', sm: 'lg', md: 'xl' }} fontWeight="600" color={useColorModeValue('gray.800', 'gray.100')} textAlign="center" fontFamily="system-ui, -apple-system, sans-serif">
            No expense data available
          </Text>
          <Text fontSize={{ base: 'sm', sm: 'md' }} color={useColorModeValue('gray.600', 'gray.300')} textAlign="center" fontFamily="system-ui, -apple-system, sans-serif">
            Add some expenses to see your spending breakdown
          </Text>
        </VStack>
      </Box>
    )
  }

  return (
    <>
      <Box
        bg={useColorModeValue(
          'rgba(255, 255, 255, 0.9)',
          'rgba(255, 255, 255, 0.05)'
        )}
        backdropFilter="blur(10px)"
        border="1px solid"
        borderColor={useColorModeValue('gray.200', 'gray.600')}
        borderRadius="2xl"
        p={{ base: 3, sm: 4, md: 5, lg: 6 }}
        boxShadow="sm"
        w="full"
        _hover={{
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
          borderColor: useColorModeValue('red.200', 'red.500')
        }}
        transition="all 0.2s ease"
      >
        {/* Simple top border */}
        <Box
          height="3px"
          bg={useColorModeValue('red.200', 'red.500')}
          mb={4}
        />

        <VStack spacing={4} align="stretch">
          {/* Header compacto */}
          <HStack spacing={4} align="center">
            <Box
              p={{ base: 2, sm: 2.5, md: 3 }}
              borderRadius="xl"
              bg={useColorModeValue('#fecaca', '#2d1b1b')} // Rosa post-it
              border="1px solid"
              borderColor={useColorModeValue('red.200', 'red.500')}
              boxShadow="sm"
              _hover={{
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                borderColor: useColorModeValue('red.300', 'red.400')
              }}
              transition="all 0.2s ease"
            >
              <Icon as={TrendingDown} boxSize={{ base: 4, sm: 5, md: 6 }} color={useColorModeValue('red.600', 'red.300')} />
            </Box>
            <VStack align="start" spacing={0.5}>
              <Heading
                size={{ base: 'md', sm: 'lg', md: 'xl' }}
                color={useColorModeValue('gray.800', 'gray.100')}
                fontWeight="700"
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                Expense Analysis
              </Heading>
              <Text
                fontSize={{ base: 'sm', sm: 'md' }}
                color={useColorModeValue('gray.600', 'gray.300')}
                fontWeight="500"
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                Detailed spending breakdown by category
              </Text>
            </VStack>
          </HStack>
          
          <HStack spacing={3} justify="space-between" align="center">
            <HStack spacing={2}>
              <Badge
                borderRadius="xl"
                px={3}
                py={1}
                fontSize="sm"
                fontWeight="500"
                bg={useColorModeValue('#fecaca', '#2d1b1b')} // Rosa post-it
                color={useColorModeValue('red.600', 'red.300')}
                border="1px solid"
                borderColor={useColorModeValue('red.200', 'red.500')}
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                {sortedCategories.length} Categories
              </Badge>
              <Badge
                borderRadius="xl"
                px={3}
                py={1}
                fontSize="sm"
                fontWeight="500"
                bg={useColorModeValue('rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.05)')}
                color={useColorModeValue('gray.600', 'gray.300')}
                border="1px solid"
                borderColor={useColorModeValue('gray.200', 'gray.600')}
                fontFamily="system-ui, -apple-system, sans-serif"
                backdropFilter="blur(10px)"
              >
                {selectedPeriod}
              </Badge>
            </HStack>
            <Button
              size="sm"
              rightIcon={!isMobile ? <Icon as={Eye} boxSize={3} /> : undefined}
              onClick={onOpen}
              borderRadius="xl"
              px={4}
              py={2}
              fontSize="sm"
              fontWeight="500"
              bg={useColorModeValue('#dbeafe', '#1e293b')} // Azul post-it
              color={useColorModeValue('blue.600', 'blue.300')}
              border="1px solid"
              borderColor={useColorModeValue('blue.200', 'blue.500')}
              fontFamily="system-ui, -apple-system, sans-serif"
              backdropFilter="blur(10px)"
              _hover={{
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                borderColor: useColorModeValue('blue.300', 'blue.400'),
                bg: useColorModeValue('blue.50', 'blue.900')
              }}
              _active={{
                transform: 'translateY(0)',
              }}
              transition="all 0.2s ease"
            >
              {isMobile ? 'All' : `View Details (${sortedCategories.length})`}
            </Button>
          </HStack>

          {/* Progress bars modernizados */}
          <VStack spacing={3} align="stretch">
            {sortedCategories.slice(0, 5).map(({ category, amount }, index) => {
              const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
              const color = categoryColors[index % categoryColors.length]
              
              return (
                <Box 
                  key={category}
                  p={4}
                  bg={useColorModeValue('rgba(255,255,255,0.5)', 'rgba(255,255,255,0.05)')}
                  borderRadius="xl"
                  border="1px solid"
                  borderColor={useColorModeValue('gray.200', 'gray.600')}
                  _hover={{
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    borderColor: useColorModeValue('red.200', 'red.500')
                  }}
                  transition="all 0.2s ease"
                >
                  <HStack justify="space-between" mb={3}>
                    <HStack spacing={3}>
                      <Box
                        w={3}
                        h={3}
                        borderRadius="full"
                        bg={color}
                      />
                      <Text fontSize="sm" fontWeight="600" color={useColorModeValue('gray.800', 'gray.100')} fontFamily="system-ui, -apple-system, sans-serif">
                        {category}
                      </Text>
                    </HStack>
                    <Text fontSize="sm" fontWeight="700" color={useColorModeValue('gray.800', 'gray.100')} fontFamily="system-ui, -apple-system, sans-serif">
                      £{amount.toFixed(2)}
                    </Text>
                  </HStack>
                  
                  <Progress
                    value={percentage}
                    size="sm"
                    borderRadius="full"
                    bg={useColorModeValue('gray.100', 'gray.700')}
                    sx={{
                      '& > div': {
                        background: color,
                        borderRadius: 'full',
                      }
                    }}
                  />
                  
                  <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.300')} mt={2} fontFamily="system-ui, -apple-system, sans-serif">
                    {percentage.toFixed(1)}% of total expenses
                  </Text>
                </Box>
              )
            })}

            {/* Show more indicator modernizado */}
            {sortedCategories.length > 5 && (
              <Box 
                textAlign="center" 
                py={4}
                bg={useColorModeValue('rgba(255,255,255,0.3)', 'rgba(255,255,255,0.05)')}
                borderRadius="xl"
                border="1px dashed"
                borderColor={useColorModeValue('gray.300', 'gray.600')}
              >
                <HStack justify="center" spacing={2}>
                  <Icon as={Sparkles} boxSize={3} color={useColorModeValue('gray.500', 'gray.400')} />
                  <Text fontSize="sm" color={useColorModeValue('gray.700', 'gray.300')} fontWeight="500" fontFamily="system-ui, -apple-system, sans-serif">
                    ... and {sortedCategories.length - 5} more categories
                  </Text>
                </HStack>
              </Box>
            )}
          </VStack>

          {/* Footer modernizado */}
          <Box 
            pt={4} 
            borderTop="1px solid" 
            borderColor={useColorModeValue('gray.200', 'gray.600')}
            bg={useColorModeValue('rgba(239, 68, 68, 0.05)', 'rgba(239, 68, 68, 0.1)')}
            borderRadius="xl"
            p={4}
            mt={2}
          >
            <HStack justify="space-between" align="center">
              <HStack spacing={3}>
                <Icon as={TrendingDown} boxSize={4} color={useColorModeValue('red.500', 'red.400')} />
                <Text fontSize="md" fontWeight="700" color={useColorModeValue('gray.800', 'gray.100')} fontFamily="system-ui, -apple-system, sans-serif">
                  Total Expenses
                </Text>
              </HStack>
              <Text
                fontSize="lg"
                fontWeight="800"
                color={useColorModeValue('red.600', 'red.300')}
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                £{totalExpenses.toFixed(2)}
              </Text>
            </HStack>
          </Box>
        </VStack>
      </Box>

      {/* Category Modal */}
      <CategoryModal
        isOpen={isOpen}
        onClose={handleClose}
        transactions={transactions}
        type="EXPENSE"
        selectedPeriod={selectedPeriod}
      />
    </>
  )
}