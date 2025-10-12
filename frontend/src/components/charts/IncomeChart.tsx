import { Box, Text, VStack, HStack, Progress, Badge, Button, useDisclosure, useColorModeValue, Icon, Flex, Heading } from '@chakra-ui/react'
import { Transaction } from '../../types'
import CategoryModal from '../modal/CategoryModal'
import { useMemo, useCallback } from 'react'
import { TrendingUp, BarChart3, Eye, Sparkles } from 'lucide-react'

interface IncomeChartProps {
  transactions: Transaction[]
  selectedPeriod: string
}

// 🎨 Animações personalizadas
const shimmer = 'shimmer 3s ease-in-out infinite'
const float = 'float 4s ease-in-out infinite'
const pulse = 'pulse 2s ease-in-out infinite'
const glow = 'glow 3s ease-in-out infinite'
const slideIn = 'slideIn 0.6s ease-out'

export default function IncomeChart({ transactions, selectedPeriod }: IncomeChartProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const progressBg = useColorModeValue('gray.100', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.800')
  const textColor = useColorModeValue('gray.500', 'gray.400')
  const labelColor = useColorModeValue('gray.700', 'gray.300')
  
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
      <Box 
        p={8} 
        textAlign="center" 
        color="gray.500"
        bg={useColorModeValue('rgba(255,255,255,0.8)', 'rgba(17,17,17,0.8)')}
        borderRadius="2xl"
        backdropFilter="blur(10px)"
        border="1px solid"
        borderColor={useColorModeValue('rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)')}
      >
        <Icon as={BarChart3} boxSize={12} mb={4} opacity={0.5} />
        <Heading size="md" mb={2} color={useColorModeValue('gray.600', 'gray.400')}>
          No income found
        </Heading>
        <Text fontSize="sm" opacity={0.8}>
          Add some income transactions to see the breakdown
        </Text>
      </Box>
    )
  }

  return (
    <>
    <Box
      position="relative"
      bg={useColorModeValue('rgba(255,255,255,0.9)', 'rgba(17,17,17,0.9)')}
      backdropFilter="blur(20px)"
      border="1px solid"
      borderColor={useColorModeValue('rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)')}
      borderRadius="2xl"
      p={6}
      boxShadow="xl"
      w="full"
      sx={{
        animation: slideIn,
        '@keyframes slideIn': {
          from: { opacity: 0, transform: 'translateY(20px) scale(0.95)' },
          to: { opacity: 1, transform: 'translateY(0) scale(1)' },
        }
      }}
    >
      {/* Background decorativo */}
      <Box
        position="absolute"
        top="-20px"
        left="-20px"
        right="-20px"
        height="100px"
        background={useColorModeValue(
          'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.1) 50%, rgba(5, 150, 105, 0.1) 100%)',
          'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(16, 185, 129, 0.2) 50%, rgba(5, 150, 105, 0.2) 100%)'
        )}
        borderRadius="2xl"
        filter="blur(20px)"
        opacity={0.6}
        zIndex={0}
      />

      <VStack spacing={6} align="stretch" position="relative" zIndex={1}>
        {/* Header compacto */}
        <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
          <HStack spacing={3} align="center">
            <Box
              p={2}
              borderRadius="xl"
              bg={useColorModeValue(
                'linear-gradient(135deg, #22c55e, #16a34a)',
                'linear-gradient(135deg, #4ade80, #22c55e)'
              )}
              boxShadow="md"
            >
              <Icon as={TrendingUp} boxSize={4} color="white" />
            </Box>
            <VStack align="start" spacing={0.5}>
              <Heading
                size="md"
                bg={useColorModeValue(
                  'linear-gradient(135deg, #1e293b, #475569)',
                  'linear-gradient(135deg, #f8fafc, #e2e8f0)'
                )}
                bgClip="text"
                fontWeight="700"
                letterSpacing="wide"
              >
                Income Analysis
              </Heading>
              <Text
                fontSize={{ base: 'xs', sm: 'sm' }}
                color={useColorModeValue('gray.500', 'gray.400')}
                fontWeight="400"
                opacity={0.8}
              >
                Detailed earnings breakdown by category
              </Text>
            </VStack>
          </HStack>
          
          <HStack spacing={3}>
            <Badge
              colorScheme="green"
              variant="solid"
              borderRadius="full"
              px={4}
              py={2}
              fontSize="sm"
              fontWeight="600"
              bg={useColorModeValue(
                'linear-gradient(135deg, #22c55e, #16a34a)',
                'linear-gradient(135deg, #4ade80, #22c55e)'
              )}
              boxShadow="md"
            >
              <HStack spacing={2}>
                <Icon as={BarChart3} boxSize={3} />
                <Text>{sortedCategories.length} categories</Text>
              </HStack>
            </Badge>
            
            {sortedCategories.length > 0 && (
              <Button
                size="md"
                variant="outline"
                colorScheme="green"
                onClick={onOpen}
                leftIcon={<Icon as={Eye} boxSize={4} />}
                borderRadius="xl"
                fontWeight="600"
                borderWidth="2px"
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: 'lg',
                }}
                transition="all 0.2s ease"
              >
                View All
              </Button>
            )}
          </HStack>
        </Flex>

        {/* Progress bars melhorados */}
        <VStack spacing={4} align="stretch">
          {sortedCategories.slice(0, 5).map(({ category, amount }, index) => {
            const percentage = totalIncome > 0 ? (amount / totalIncome) * 100 : 0
            const color = categoryColors[index % categoryColors.length]
            
            return (
              <Box 
                key={category}
                p={4}
                bg={useColorModeValue('rgba(255,255,255,0.5)', 'rgba(255,255,255,0.05)')}
                borderRadius="xl"
                border="1px solid"
                borderColor={useColorModeValue('rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)')}
                sx={{
                  animation: `${slideIn} ${index * 0.1}s ease-out`,
                  '@keyframes slideIn': {
                    from: { opacity: 0, transform: 'translateX(-20px)' },
                    to: { opacity: 1, transform: 'translateX(0)' },
                  }
                }}
              >
                <HStack justify="space-between" mb={3}>
                  <HStack spacing={3}>
                    <Box
                      w={3}
                      h={3}
                      borderRadius="full"
                      bg={color}
                      boxShadow="sm"
                    />
                    <Text 
                      fontSize="md" 
                      fontWeight="600" 
                      color={useColorModeValue("gray.700", "gray.200")}
                    >
                      {category}
                    </Text>
                  </HStack>
                  <HStack spacing={3}>
                    <Badge
                      colorScheme={color.split('.')[0] as any}
                      variant="subtle"
                      px={3}
                      py={1}
                      borderRadius="full"
                      fontSize="xs"
                      fontWeight="600"
                    >
                      {percentage.toFixed(1)}%
                    </Badge>
                    <Text 
                      fontSize="md" 
                      fontWeight="bold" 
                      color={useColorModeValue("gray.800", "white")}
                    >
                      £{amount.toFixed(2)}
                    </Text>
                  </HStack>
                </HStack>
                <Progress
                  value={percentage}
                  colorScheme={color.split('.')[0] as any}
                  size="lg"
                  borderRadius="full"
                  bg={useColorModeValue('gray.100', 'gray.700')}
                  sx={{
                    '& > div': {
                      background: `linear-gradient(90deg, ${color} 0%, ${color}CC 100%)`,
                      borderRadius: 'full',
                    }
                  }}
                />
              </Box>
            )
          })}
          
          {/* Show more indicator melhorado */}
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
                <Icon as={Sparkles} boxSize={4} color={useColorModeValue('gray.500', 'gray.400')} />
                <Text fontSize="sm" color={textColor} fontWeight="500">
                  ... and {sortedCategories.length - 5} more categories
                </Text>
              </HStack>
            </Box>
          )}
        </VStack>

        {/* Footer melhorado */}
        <Box 
          pt={4} 
          borderTop="2px solid" 
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          bg={useColorModeValue('rgba(34, 197, 94, 0.05)', 'rgba(34, 197, 94, 0.1)')}
          borderRadius="xl"
          p={4}
          mt={2}
        >
          <HStack justify="space-between" align="center">
            <HStack spacing={3}>
              <Icon as={TrendingUp} boxSize={5} color={useColorModeValue('green.500', 'green.400')} />
              <Text fontSize="lg" fontWeight="bold" color={labelColor}>
                Total Income
              </Text>
            </HStack>
            <Text 
              fontSize="2xl" 
              fontWeight="black" 
              bg={useColorModeValue(
                'linear-gradient(135deg, #22c55e, #16a34a)',
                'linear-gradient(135deg, #4ade80, #22c55e)'
              )}
              bgClip="text"
            >
              £{totalIncome.toFixed(2)}
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
      type="INCOME"
      selectedPeriod={selectedPeriod}
    />
  </>
  )
}
