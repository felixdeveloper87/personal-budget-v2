import { Box, Text, VStack, HStack, Progress, Badge, Button, useDisclosure, useColorModeValue, Icon, Flex, Heading, useBreakpointValue } from '@chakra-ui/react'
import { Transaction } from '../../types'
import CategoryModal from './modal/CategoryModal'
import { useMemo, useCallback } from 'react'
import { TrendingUp, BarChart3, Eye, Sparkles } from 'lucide-react'
import { getResponsiveStyles, getGradients, animations } from '../../utils/ui'
import { useThemeColors } from '../../hooks/useThemeColors'

interface IncomeChartProps {
  transactions: Transaction[]
  selectedPeriod: string
}

export default function IncomeChart({ transactions, selectedPeriod }: IncomeChartProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const colors = useThemeColors()
  const responsiveStyles = getResponsiveStyles()
  const gradients = getGradients()
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
        position="relative"
        bg={useColorModeValue('rgba(255,255,255,0.95)', 'rgba(17,17,17,0.95)')}
        backdropFilter="blur(20px)"
        border="2px solid"
        borderColor={useColorModeValue('rgba(34, 197, 94, 0.3)', 'rgba(34, 197, 94, 0.2)')}
        borderRadius={responsiveStyles.charts.container.borderRadius}
        p={responsiveStyles.charts.container.padding}
        boxShadow="xl"
        w="full"
        sx={{
          animation: animations.slideIn,
          '@keyframes slideIn': {
            from: { opacity: 0, transform: 'translateY(20px) scale(0.95)' },
            to: { opacity: 1, transform: 'translateY(0) scale(1)' },
          }
        }}
      >
        <VStack spacing={4} align="center" py={responsiveStyles.charts.empty.padding}>
          <Box
            p={responsiveStyles.charts.empty.iconPadding}
            borderRadius="full"
            bg={useColorModeValue('green.50', 'green.900')}
            sx={{
              animation: animations.glow,
              '@keyframes glow': {
                '0%, 100%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.05)' },
              }
            }}
          >
            <Icon as={BarChart3} boxSize={responsiveStyles.charts.empty.iconSize} color={useColorModeValue('green.500', 'green.400')} />
          </Box>
          <Text fontSize={responsiveStyles.charts.empty.titleFontSize} fontWeight="600" color={colors.text.primary} textAlign="center">
            No income data available
          </Text>
          <Text fontSize={responsiveStyles.charts.empty.descriptionFontSize} color={colors.text.secondary} textAlign="center">
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
        bg={useColorModeValue('rgba(255,255,255,0.95)', 'rgba(17,17,17,0.95)')}
        backdropFilter="blur(20px)"
        border="2px solid"
        borderColor={useColorModeValue('rgba(34, 197, 94, 0.3)', 'rgba(34, 197, 94, 0.2)')}
        borderRadius={responsiveStyles.charts.container.borderRadius}
        p={responsiveStyles.charts.container.padding}
        boxShadow="xl"
        w="full"
        sx={{
          animation: animations.slideIn,
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

        <VStack spacing={responsiveStyles.charts.header.spacing} align="stretch" position="relative" zIndex={1}>
          {/* Header compacto */}
          <HStack spacing={responsiveStyles.charts.header.spacing} align="center">
            <Box
              p={responsiveStyles.charts.header.icon.padding}
              borderRadius="xl"
              bg={useColorModeValue(
                'linear-gradient(135deg, #22c55e, #16a34a)',
                'linear-gradient(135deg, #4ade80, #22c55e)'
              )}
              boxShadow="md"
            >
              <Icon as={TrendingUp} boxSize={responsiveStyles.charts.header.icon.size} color="white" />
            </Box>
            <VStack align="start" spacing={0.5}>
              <Heading
                size={responsiveStyles.charts.header.title.size}
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
                fontSize={responsiveStyles.charts.header.title.fontSize}
                color={colors.text.secondary}
                fontWeight="400"
                opacity={0.8}
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
                  sx={{
                    animation: `${animations.slideIn} ${index * 0.1}s ease-out`,
                    '@keyframes slideIn': {
                      from: { opacity: 0, transform: 'translateX(-20px)' },
                      to: { opacity: 1, transform: 'translateX(0)' },
                    }
                  }}
                >
                  <HStack justify="space-between" mb={responsiveStyles.charts.progress.item.spacing}>
                    <HStack spacing={responsiveStyles.charts.progress.item.spacing}>
                      <Box
                        w={responsiveStyles.charts.progress.indicator.size}
                        h={responsiveStyles.charts.progress.indicator.size}
                        borderRadius="full"
                        bg={color}
                        sx={{
                          animation: `${animations.shimmer} 4s ease-in-out infinite`,
                          '@keyframes shimmer': {
                            '0%, 100%': { opacity: 1 },
                            '50%': { opacity: 0.7 },
                          }
                        }}
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
                  
                  <Text fontSize={responsiveStyles.charts.progress.text.percentageFontSize} color={colors.text.secondary} mt={2}>
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