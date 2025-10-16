import { Box, Text, VStack, HStack, Progress, Badge, Button, useDisclosure, useColorModeValue, Icon, Flex, Heading, useBreakpointValue } from '@chakra-ui/react'
import { Transaction } from '../../types'
import CategoryModal from './modal/CategoryModal'
import { useMemo, useCallback } from 'react'
import { TrendingUp, BarChart3, Eye, Sparkles } from 'lucide-react'
import { getResponsiveStyles } from '../ui'
import { useThemeColors } from '../../hooks/useThemeColors'

interface IncomeChartProps {
  transactions: Transaction[]
  selectedPeriod: string
}

export default function IncomeChart({ transactions, selectedPeriod }: IncomeChartProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const colors = useThemeColors()
  const responsiveStyles = getResponsiveStyles()
  const isMobile = useBreakpointValue({ base: true, md: false })

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
          borderColor: useColorModeValue('green.200', 'green.500')
        }}
        transition="all 0.2s ease"
      >
        <VStack spacing={4} align="center" py={8}>
          <Box
            p={{ base: 2, sm: 2.5, md: 3 }}
            borderRadius="xl"
            bg={useColorModeValue('#dcfce7', '#1f2937')} // Verde post-it
            border="1px solid"
            borderColor={useColorModeValue('green.200', 'green.500')}
            boxShadow="sm"
            _hover={{
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              borderColor: useColorModeValue('green.300', 'green.400')
            }}
            transition="all 0.2s ease"
          >
            <Icon as={BarChart3} boxSize={{ base: 4, sm: 5, md: 6 }} color={useColorModeValue('green.600', 'green.300')} />
          </Box>
          <Text fontSize={{ base: 'md', sm: 'lg', md: 'xl' }} fontWeight="600" color={useColorModeValue('gray.800', 'gray.100')} textAlign="center" fontFamily="system-ui, -apple-system, sans-serif">
            No income data available
          </Text>
          <Text fontSize={{ base: 'sm', sm: 'md' }} color={useColorModeValue('gray.600', 'gray.300')} textAlign="center" fontFamily="system-ui, -apple-system, sans-serif">
            Add some income to see your earnings breakdown
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
          borderColor: useColorModeValue('green.200', 'green.500')
        }}
        transition="all 0.2s ease"
      >
        {/* Simple top border */}
        <Box
          height="3px"
          bg={useColorModeValue('green.200', 'green.500')}
          mb={4}
        />
        <VStack spacing={4} align="stretch">
          {/* Header compacto */}
          <HStack spacing={4} align="center">
            <Box
              p={{ base: 2, sm: 2.5, md: 3 }}
              borderRadius="xl"
              bg={useColorModeValue('#dcfce7', '#1f2937')} // Verde post-it
              border="1px solid"
              borderColor={useColorModeValue('green.200', 'green.500')}
              boxShadow="sm"
              _hover={{
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                borderColor: useColorModeValue('green.300', 'green.400')
              }}
              transition="all 0.2s ease"
            >
              <Icon as={TrendingUp} boxSize={{ base: 4, sm: 5, md: 6 }} color={useColorModeValue('green.600', 'green.300')} />
            </Box>
            <VStack align="start" spacing={0.5}>
              <Heading
                size={{ base: 'md', sm: 'lg', md: 'xl' }}
                color={useColorModeValue('gray.800', 'gray.100')}
                fontWeight="700"
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                Income Analysis
              </Heading>
              <Text
                fontSize={{ base: 'sm', sm: 'md' }}
                color={useColorModeValue('gray.600', 'gray.300')}
                fontWeight="500"
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                Detailed earnings breakdown by category
              </Text>
            </VStack>
          </HStack>
          
          <HStack spacing={responsiveStyles.charts.badges.container.spacing}>
            <Badge
              colorScheme="green"
              variant="solid"
              borderRadius="full"
              px={responsiveStyles.charts.badges.category.padding}
              py={responsiveStyles.charts.badges.category.padding}
              fontSize={responsiveStyles.charts.badges.category.fontSize}
              fontWeight="600"
            >
              {sortedCategories.length} Categories
            </Badge>
            <Badge
              colorScheme="gray"
              variant="subtle"
              borderRadius="md"
              px={responsiveStyles.charts.badges.period.padding}
              py={responsiveStyles.charts.badges.period.padding}
              fontSize={responsiveStyles.charts.badges.period.fontSize}
              fontWeight="400"
              opacity={0.7}
            >
              {selectedPeriod}
            </Badge>
            <Button
              size={responsiveStyles.charts.button.size}
              variant="solid"
              colorScheme="blue"
              rightIcon={!isMobile ? <Icon as={Eye} boxSize={responsiveStyles.charts.button.iconSize} /> : undefined}
              leftIcon={isMobile ? undefined : undefined}
              onClick={onOpen}
              borderRadius="lg"
              px={responsiveStyles.charts.button.padding}
              py={responsiveStyles.charts.button.padding}
              fontSize={responsiveStyles.charts.button.fontSize}
              fontWeight="600"
              bg={useColorModeValue(
                'linear-gradient(135deg, #60a5fa, #3b82f6)',
                'linear-gradient(135deg, #93c5fd, #60a5fa)'
              )}
              color="white"
              _hover={{
                bg: useColorModeValue(
                  'linear-gradient(135deg, #3b82f6, #2563eb)',
                  'linear-gradient(135deg, #60a5fa, #3b82f6)'
                ),
                transform: 'translateY(-2px)',
                boxShadow: 'lg',
              }}
              _active={{
                transform: 'translateY(0)',
              }}
              transition="all 0.2s ease"
              boxShadow="md"
            >
              {isMobile ? 'All' : `View Details (${sortedCategories.length})`}
            </Button>
          </HStack>

          {/* Progress bars melhorados */}
          <VStack spacing={responsiveStyles.charts.progress.container.spacing} align="stretch">
            {sortedCategories.slice(0, 5).map(({ category, amount }, index) => {
              const percentage = totalIncome > 0 ? (amount / totalIncome) * 100 : 0
              const color = categoryColors[index % categoryColors.length]
              
              return (
                <Box 
                  key={category}
                  p={responsiveStyles.charts.progress.item.padding}
                  bg={useColorModeValue('rgba(255,255,255,0.5)', 'rgba(255,255,255,0.05)')}
                  borderRadius="xl"
                  border="2px solid"
                  borderColor={useColorModeValue('rgba(34, 197, 94, 0.3)', 'rgba(34, 197, 94, 0.2)')}
                  _hover={{
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    borderColor: useColorModeValue('green.200', 'green.500')
                  }}
                  transition="all 0.2s ease"
                >
                  <HStack justify="space-between" mb={responsiveStyles.charts.progress.item.spacing}>
                    <HStack spacing={responsiveStyles.charts.progress.item.spacing}>
                      <Box
                        w={responsiveStyles.charts.progress.indicator.size}
                        h={responsiveStyles.charts.progress.indicator.size}
                        borderRadius="full"
                        bg={color}
                      />
                      <Text fontSize={responsiveStyles.charts.progress.text.fontSize} fontWeight="600" color={colors.text.primary}>
                        {category}
                      </Text>
                    </HStack>
                    <Text fontSize={responsiveStyles.charts.progress.text.valueFontSize} fontWeight="700" color={colors.text.primary}>
                      £{amount.toFixed(2)}
                    </Text>
                  </HStack>
                  
                  <Progress
                    value={percentage}
                    size={responsiveStyles.charts.progress.bar.size}
                    borderRadius="full"
                    bg={useColorModeValue('gray.100', 'gray.700')}
                    sx={{
                      height: responsiveStyles.charts.progress.bar.height,
                      '& > div': {
                        background: `linear-gradient(90deg, ${color} 0%, ${color}CC 100%)`,
                        borderRadius: 'full',
                        boxShadow: `0 0 10px ${color}40`,
                      }
                    }}
                  />
                  
                  <Text fontSize="xs" color={colors.text.secondary} mt={2}>
                    {percentage.toFixed(1)}% of total income
                  </Text>
                </Box>
              )
            })}

            {/* Show more indicator melhorado */}
            {sortedCategories.length > 5 && (
              <Box 
                textAlign="center" 
                py={responsiveStyles.charts.progress.container.padding}
                bg={useColorModeValue('rgba(255,255,255,0.3)', 'rgba(255,255,255,0.05)')}
                borderRadius="xl"
                border="1px dashed"
                borderColor={colors.border}
              >
                <HStack justify="center" spacing={2}>
                  <Icon as={Sparkles} boxSize={responsiveStyles.charts.button.iconSize} color={colors.text.secondary} />
                  <Text fontSize={responsiveStyles.charts.progress.text.fontSize} color={colors.text.primary} fontWeight="500">
                    ... and {sortedCategories.length - 5} more categories
                  </Text>
                </HStack>
              </Box>
            )}
          </VStack>

          {/* Footer melhorado */}
          <Box 
            pt={responsiveStyles.charts.footer.padding} 
            borderTop="2px solid" 
            borderColor={colors.border}
            bg={useColorModeValue('rgba(34, 197, 94, 0.05)', 'rgba(34, 197, 94, 0.1)')}
            borderRadius="xl"
            p={responsiveStyles.charts.footer.padding}
            mt={2}
          >
            <HStack justify="space-between" align="center">
              <HStack spacing={responsiveStyles.charts.footer.spacing}>
                <Icon as={TrendingUp} boxSize={responsiveStyles.charts.footer.iconSize} color={useColorModeValue('green.500', 'green.400')} />
                <Text fontSize={responsiveStyles.charts.footer.titleFontSize} fontWeight="700" color={colors.text.primary}>
                  Total Income
                </Text>
              </HStack>
              <Text
                fontSize={responsiveStyles.charts.footer.valueFontSize}
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