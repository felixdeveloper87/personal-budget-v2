import { Box, Text, VStack, HStack, Progress, Badge, Button, useDisclosure, useColorModeValue, Icon, Flex, Heading, useBreakpointValue, Card, CardBody } from '@chakra-ui/react'
import { Transaction } from '../../types'
import CategoryModal from './modal/CategoryModal'
import { useMemo, useCallback, useState } from 'react'
import { TrendingUp, BarChart3, Eye, Sparkles } from 'lucide-react'
import { getResponsiveStyles, getTransactionModalHeaderStyles, getGradients, animations, getShimmerStyles } from '../ui'
import { useThemeColors } from '../../hooks/useThemeColors'

interface IncomeChartProps {
  transactions: Transaction[]
  selectedPeriod: string
}

export default function IncomeChart({ transactions, selectedPeriod }: IncomeChartProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined)
  const colors = useThemeColors()
  const responsiveStyles = getResponsiveStyles()
  const gradients = getGradients()
  const headerStyles = getTransactionModalHeaderStyles(useColorModeValue, 'INCOME')
  const isMobile = useBreakpointValue({ base: true, md: false })

  const handleClose = useCallback(() => {
    setSelectedCategory(undefined)
    onClose()
  }, [onClose])

  const handleCategoryClick = useCallback((category: string) => {
    setSelectedCategory(category)
    onOpen()
  }, [onOpen])

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
      <Card
        bg={useColorModeValue('white', '#0a0a0a')}
        backgroundImage={useColorModeValue(
          'data:image/svg+xml,%3Csvg width="60" height="60" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M10 5 L20 5 M50 10 L55 10 M5 40 L15 40 M30 20 L45 20" stroke="%23000" stroke-width="0.5" opacity="0.25" stroke-linecap="round"/%3E%3C/svg%3E',
          'data:image/svg+xml,%3Csvg width="60" height="60" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M10 5 L20 5 M50 10 L55 10 M5 40 L15 40 M30 20 L45 20" stroke="%23fff" stroke-width="0.5" opacity="0.25" stroke-linecap="round"/%3E%3C/svg%3E'
        )}
        backdropFilter="blur(20px)"
        border="1px solid"
        borderColor={useColorModeValue('gray.200', 'gray.900')}
        borderRadius="2xl"
        shadow="2xl"
        overflow="hidden"
        w="full"
        sx={{
          animation: animations.slideIn,
          '@keyframes slideIn': {
            from: { 
              opacity: 0, 
              transform: 'translateY(20px) scale(0.95)' 
            },
            to: { 
              opacity: 1, 
              transform: 'translateY(0) scale(1)' 
            }
          }
        }}
      >        
        <CardBody p={0} display="flex" flexDirection="column" h="full">
          <VStack spacing={0} align="stretch" h="full">
            {/* Header */}
            <Box {...headerStyles.container}>
              <Flex
                direction="row"
                align="center"
                justify="flex-start"
                flexWrap="wrap"
                pr={{ base: 1, sm: 2 }}
                pt={{ base: 0.5, sm: 0 }}
                gap={{ base: 1.5, sm: 2 }}
              >
                {/* Logo + Text */}
                <HStack
                  spacing={{ base: 2, sm: 3 }}
                  align="center"
                  flex="1"
                  minW={0}
                >
                  <Box
                    p={{ base: 2, sm: 3 }}
                    borderRadius="2xl"
                    bg={headerStyles.iconContainer.bg}
                    boxShadow="lg"
                    flexShrink={0}
                  >
                    <Icon as={BarChart3} boxSize={{ base: 4, sm: 5, md: 6 }} color="white" />
                  </Box>
                  <VStack
                    align="start"
                    spacing={0}
                    flex="1"
                    minW={0}
                  >
                    <Text
                      color={headerStyles.title.color}
                      fontWeight="800"
                      fontSize={{ base: 'md', sm: 'xl', md: '2xl' }}
                      lineHeight="shorter"
                      noOfLines={1}
                    >
                      {useBreakpointValue({ base: 'Incomes', sm: 'Income Analysis' })}
                    </Text>
                    <Text
                      color={headerStyles.subtitle.color}
                      fontWeight="600"
                      fontSize={{ base: 'xs', sm: 'sm' }}
                      noOfLines={1}
                    >
                      No income data available
                    </Text>
                  </VStack>
                </HStack>
              </Flex>
            </Box>

            {/* Content */}
            <Box p={{ base: 4, sm: 6, md: 8 }} textAlign="center">
              <Text fontSize={{ base: 'sm', sm: 'md' }} color={headerStyles.subtitle.color}>
                Add some income to see your earnings breakdown
              </Text>
            </Box>
          </VStack>
        </CardBody>
      </Card>
    )
  }

  return (
    <>
      <Card
        w="full"
        bg={useColorModeValue('white', '#0a0a0a')}
        backgroundImage={useColorModeValue(
          'data:image/svg+xml,%3Csvg width="60" height="60" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M10 5 L20 5 M50 10 L55 10 M5 40 L15 40 M30 20 L45 20" stroke="%23000" stroke-width="0.5" opacity="0.25" stroke-linecap="round"/%3E%3C/svg%3E',
          'data:image/svg+xml,%3Csvg width="60" height="60" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M10 5 L20 5 M50 10 L55 10 M5 40 L15 40 M30 20 L45 20" stroke="%23fff" stroke-width="0.5" opacity="0.25" stroke-linecap="round"/%3E%3C/svg%3E'
        )}
        backdropFilter="blur(20px)"
        border="1px solid"
        borderColor={useColorModeValue('gray.200', 'gray.900')}
        borderRadius="2xl"
        shadow="2xl"
        overflow="hidden"
        sx={{
          animation: animations.slideIn,
          '@keyframes slideIn': {
            from: { 
              opacity: 0, 
              transform: 'translateY(20px) scale(0.95)' 
            },
            to: { 
              opacity: 1, 
              transform: 'translateY(0) scale(1)' 
            }
          }
        }}
      >
        {/* Animated top bar */}
        <Box
          height="2px"
          sx={getShimmerStyles()}
        />
        
        <CardBody p={0} display="flex" flexDirection="column" h="full">
          <VStack spacing={0} align="stretch" h="full">
            {/* Content */}
            <Box p={{ base: 4, sm: 6, md: 8 }}>
              <VStack spacing={4} align="stretch">
            {/* Header */}
            <Box {...headerStyles.container}>
              <Flex
                direction="row"
                align="center"
                justify="center"
                flexWrap="wrap"
                pr={{ base: 1, sm: 2 }}
                pt={{ base: 0.5, sm: 0 }}
                gap={{ base: 1.5, sm: 2 }}
              >
                {/* Logo + Text */}
                <HStack
                  spacing={{ base: 2, sm: 3 }}
                  align="center"
                  flex="1"
                  minW={0}
                >
                  <Box
                    p={{ base: 2, sm: 3 }}
                    borderRadius="2xl"
                    bg={headerStyles.iconContainer.bg}
                    boxShadow="lg"
                    flexShrink={0}
                  >
                    <Icon as={TrendingUp} boxSize={{ base: 4, sm: 5, md: 6 }} color="white" />
                  </Box>
                  <VStack
                    align="start"
                    spacing={0}
                    flex="1"
                    minW={0}
                  >
                    <Text
                      color={headerStyles.title.color}
                      fontWeight="800"
                      fontSize={{ base: 'md', sm: 'xl', md: '2xl' }}
                      lineHeight="shorter"
                      noOfLines={1}
                    >
                      {useBreakpointValue({ base: 'Incomes', sm: 'Income Analysis' })}
                    </Text>
                    <Text
                      color={headerStyles.subtitle.color}
                      fontWeight="600"
                      fontSize={responsiveStyles.charts.progress.text.valueFontSize}
                      noOfLines={1}
                    >
                      {selectedPeriod} • £{totalIncome.toLocaleString()}
                    </Text>
                  </VStack>
                </HStack>

                {/* View Button */}
                <Button
                  size={{ base: 'sm', sm: 'md' }}
                  variant="ghost"
                  color={headerStyles.title.color}
                  onClick={onOpen}
                  rightIcon={<Icon as={Eye} boxSize={4} color={headerStyles.title.color} />}
                  _hover={{
                    bg: useColorModeValue('green.50', 'green.900'),
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                  transition="all 0.2s ease"
                  flexShrink={0}
                >
                  {isMobile ? 'View All' : 'View All Details'}
                </Button>
              </Flex>
            </Box>
          
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
                  bg={useColorModeValue('white', '#0a0a0a')}
                  borderRadius="xl"
                  cursor="pointer"
                  onClick={() => handleCategoryClick(category)}
                  _hover={{
                    bg: useColorModeValue(
                      `${color}20`,
                      `${color}30`
                    ),
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
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
                      <HStack spacing={2} align="center">
                        <Text fontSize={responsiveStyles.charts.progress.text.fontSize} fontWeight="600" color={colors.text.primary}>
                          {category}
                        </Text>
                        <Text fontSize={{ base: "xs", sm: "sm" }} fontWeight="500" color={colors.text.secondary}>
                          {percentage.toFixed(1)}%
                        </Text>
                      </HStack>
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
                  
                </Box>
              )
            })}

            {/* Show more indicator melhorado */}
            {sortedCategories.length > 5 && (
              <Box 
                textAlign="center" 
                py={responsiveStyles.charts.progress.container.padding}
                bg={useColorModeValue(gradients.background, gradients.background)}
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
                fontSize={{ base: 'xs', sm: 'md', md: 'lg' }}
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
          </VStack>
        </CardBody>
      </Card>

      {/* Category Modal */}
      <CategoryModal
        isOpen={isOpen}
        onClose={handleClose}
        transactions={transactions}
        type="INCOME"
        selectedPeriod={selectedPeriod}
        initialCategory={selectedCategory}
      />
    </>
  )
}