import { Box, Text, VStack, HStack, Progress, Badge, Button, useDisclosure, useColorModeValue, Icon, Flex, Heading } from '@chakra-ui/react'
import { Transaction } from '../../types'
import CategoryModal from '../modal/CategoryModal'
import { useMemo, useCallback } from 'react'
import { TrendingUp, BarChart3, Eye, Sparkles } from 'lucide-react'

interface IncomeChartProps {
  transactions: Transaction[]
  selectedPeriod: string
}

export default function IncomeChart({ transactions, selectedPeriod }: IncomeChartProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const textColor = useColorModeValue('gray.700', 'gray.200')
  const bgColor = useColorModeValue('white', 'gray.800')

  // Animações customizadas
  const slideIn = 'slideIn 0.6s ease-out'
  const float = 'float 3s ease-in-out infinite'
  const pulse = 'pulse 2s ease-in-out infinite'
  const glow = 'glow 2s ease-in-out infinite'

  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  // Cores para as categorias
  const categoryColors = [
    '#22c55e', '#16a34a', '#15803d', '#166534', '#14532d',
    '#84cc16', '#65a30d', '#4d7c0f', '#365314', '#1a2e05'
  ]

  const { sortedCategories, totalIncome } = useMemo(() => {
    const categoryTotals = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((acc, transaction) => {
        const category = transaction.category || 'Uncategorized'
        acc[category] = (acc[category] || 0) + transaction.amount
        return acc
      }, {} as Record<string, number>)

    const sorted = Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)

    const total = sorted.reduce((sum, { amount }) => sum + amount, 0)

    return { sortedCategories: sorted, totalIncome: total }
  }, [transactions])

  if (sortedCategories.length === 0) {
    return (
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
        <VStack spacing={4} align="center" py={8}>
          <Box
            p={4}
            borderRadius="full"
            bg={useColorModeValue('green.50', 'green.900')}
            sx={{
              animation: pulse,
              '@keyframes pulse': {
                '0%, 100%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.05)' },
              }
            }}
          >
            <Icon as={BarChart3} boxSize={8} color={useColorModeValue('green.500', 'green.400')} />
          </Box>
          <Text fontSize="lg" fontWeight="600" color={textColor} textAlign="center">
            No income data available
          </Text>
          <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')} textAlign="center">
            Add some income to see your earnings breakdown
          </Text>
        </VStack>
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
            'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.1) 50%, rgba(21, 128, 61, 0.1) 100%)',
            'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(22, 163, 74, 0.2) 50%, rgba(21, 128, 61, 0.2) 100%)'
          )}
          borderRadius="2xl"
          filter="blur(20px)"
          opacity={0.6}
          zIndex={0}
        />

        <VStack spacing={6} align="stretch" position="relative" zIndex={1}>
          {/* Header compacto */}
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
              px={3}
              py={1}
              fontSize="xs"
              fontWeight="600"
            >
              {sortedCategories.length} Categories
            </Badge>
            <Badge
              colorScheme="gray"
              variant="outline"
              borderRadius="full"
              px={3}
              py={1}
              fontSize="xs"
              fontWeight="500"
            >
              {selectedPeriod}
            </Badge>
            {sortedCategories.length > 5 && (
              <Button
                size="xs"
                variant="ghost"
                colorScheme="green"
                rightIcon={<Icon as={Eye} boxSize={3} />}
                onClick={onOpen}
                borderRadius="full"
                px={3}
                py={1}
                fontSize="xs"
                fontWeight="500"
                _hover={{
                  bg: useColorModeValue('green.50', 'green.900'),
                  transform: 'translateY(-1px)',
                }}
                transition="all 0.2s ease"
              >
                View All
              </Button>
            )}
          </HStack>

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
                        sx={{
                          animation: pulse,
                          '@keyframes pulse': {
                            '0%, 100%': { opacity: 1 },
                            '50%': { opacity: 0.7 },
                          }
                        }}
                      />
                      <Text fontSize="sm" fontWeight="600" color={textColor}>
                        {category}
                      </Text>
                    </HStack>
                    <Text fontSize="sm" fontWeight="700" color={textColor}>
                      £{amount.toFixed(2)}
                    </Text>
                  </HStack>
                  
                  <Progress
                    value={percentage}
                    size="lg"
                    borderRadius="full"
                    bg={useColorModeValue('gray.100', 'gray.700')}
                    sx={{
                      '& > div': {
                        background: `linear-gradient(90deg, ${color} 0%, ${color}CC 100%)`,
                        borderRadius: 'full',
                        boxShadow: `0 0 10px ${color}40`,
                      }
                    }}
                  />
                  
                  <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')} mt={2}>
                    {percentage.toFixed(1)}% of total income
                  </Text>
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
              <HStack spacing={2}>
                <Icon as={TrendingUp} boxSize={5} color={useColorModeValue('green.500', 'green.400')} />
                <Text fontSize="lg" fontWeight="700" color={textColor}>
                  Total Income
                </Text>
              </HStack>
              <Text
                fontSize="2xl"
                fontWeight="800"
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