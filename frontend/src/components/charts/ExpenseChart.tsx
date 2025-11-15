import { Box, Text, VStack, HStack, Progress, Badge, Button, useDisclosure, useColorModeValue, Icon, Flex, Heading, useBreakpointValue, Card, CardBody } from '@chakra-ui/react'
import { Transaction } from '../../types'
import CategoryModal from './modal/CategoryModal'
import { useMemo, useCallback, useState } from 'react'
import { TrendingDown, BarChart3, Eye, Sparkles } from 'lucide-react'
import { getResponsiveStyles, getTransactionModalHeaderStyles, getGradients, animations } from '../ui'

interface ExpenseChartProps {
  transactions: Transaction[]
  selectedPeriod: string
}

export default function ExpenseChart({ transactions, selectedPeriod }: ExpenseChartProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined)
  const responsiveStyles = getResponsiveStyles()
  const gradients = getGradients()
  const headerStyles = getTransactionModalHeaderStyles(useColorModeValue, 'EXPENSE')
  const isMobile = useBreakpointValue({ base: true, md: false })
  
  // Pre-compute all useColorModeValue calls

  const cardBgPattern = useColorModeValue(
    'data:image/svg+xml,%3Csvg width="60" height="60" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M10 5 L20 5 M50 10 L55 10 M5 40 L15 40 M30 20 L45 20" stroke="%23000" stroke-width="0.5" opacity="0.25" stroke-linecap="round"/%3E%3C/svg%3E',
    'data:image/svg+xml,%3Csvg width="60" height="60" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M10 5 L20 5 M50 10 L55 10 M5 40 L15 40 M30 20 L45 20" stroke="%23fff" stroke-width="0.5" opacity="0.25" stroke-linecap="round"/%3E%3C/svg%3E'
  )
  const borderColor = useColorModeValue('gray.200', 'gray.900')
  const boxHoverBg = useColorModeValue('white', '#0a0a0a')
  const textColor = useColorModeValue('gray.800', 'gray.100')
  const textColorSecondary = useColorModeValue('gray.600', 'gray.300')
  const buttonHoverBg = useColorModeValue('red.50', 'red.900')
  const footerBg = useColorModeValue('rgba(239, 68, 68, 0.05)', 'rgba(239, 68, 68, 0.1)')
  const footerBorderColor = useColorModeValue('gray.200', 'gray.600')
  const redColor = useColorModeValue('red.600', 'red.300')
  const redIcon = useColorModeValue('red.500', 'red.400')
  const progressBg = useColorModeValue('gray.100', 'gray.700')
  const titleText = useBreakpointValue({ base: 'Expenses', sm: 'Expense Analysis' })

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
      <Card
        // bg={cardBg}
        backgroundImage={cardBgPattern}
        backdropFilter="blur(20px)"
        // border="1px solid"
        borderColor={borderColor}
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
        {/* Animated top bar */}
        {/* <Box
          height="2px"
          sx={getShimmerStyles()}
        /> */}
        
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
                      {titleText}
                    </Text>
                    <Text
                      color={headerStyles.subtitle.color}
                      fontWeight="600"
                      fontSize={{ base: 'xs', sm: 'sm' }}
                      noOfLines={1}
                    >
                      No expense data available
                    </Text>
                  </VStack>
                </HStack>
              </Flex>
            </Box>

            {/* Content */}
            <Box p={{ base: 4, sm: 6, md: 8 }} textAlign="center">
              <Text fontSize={{ base: 'sm', sm: 'md' }} color={headerStyles.subtitle.color}>
                Add some expenses to see your spending breakdown
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
        // bg={cardBg}
        backgroundImage={cardBgPattern}
        backdropFilter="blur(20px)"
        border="1px solid"
        borderColor={borderColor}
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
                    <Icon as={TrendingDown} boxSize={{ base: 4, sm: 5, md: 6 }} color="white" />
                  </Box>
                  <VStack
                    align="start"
                    spacing={0}
                    flex="1"
                    minW={0}
                  >
                    <Text
                      color={headerStyles.title.color}
                      fontWeight="500"
                      fontSize={{ base: 'md', sm: 'xl', md: '2xl' }}
                      lineHeight="shorter"
                      noOfLines={1}
                    >
                      {titleText}
                    </Text>
                    <Text
                      color={headerStyles.subtitle.color}
                      fontWeight="600"
                      fontSize={responsiveStyles.charts.progress.text.valueFontSize}
                      noOfLines={1}
                    >
                      {selectedPeriod} • £{totalExpenses.toLocaleString()}
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
                    bg: buttonHoverBg,
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
              colorScheme="red"
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
          </HStack>

          {/* Progress bars modernizadods */}
          <VStack spacing={3} align="stretch">
            {sortedCategories.slice(0, 5).map(({ category, amount }, index) => {
              const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
              const color = categoryColors[index % categoryColors.length]
              
              return (
                <Box 
                  key={category}
                  p={4}
                  bg={boxHoverBg}
                  borderRadius="xl"
                  cursor="pointer"
                  onClick={() => handleCategoryClick(category)}
                  _hover={{
                    bg: `${color}20`,
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
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
                      <HStack spacing={2} align="center">
                        <Text fontSize="sm" fontWeight="600" color={textColor} fontFamily="system-ui, -apple-system, sans-serif">
                          {category}
                        </Text>
                        <Text fontSize={{ base: "2xs", sm: "xs" }} fontWeight="500" color={textColorSecondary} fontFamily="system-ui, -apple-system, sans-serif">
                          {percentage.toFixed(1)}%
                        </Text>
                      </HStack>
                    </HStack>
                    <Text fontSize="sm" fontWeight="700" color={textColor} fontFamily="system-ui, -apple-system, sans-serif">
                      £{amount.toFixed(2)}
                    </Text>
                  </HStack>
                  
                  <Progress
                    value={percentage}
                    size="sm"
                    borderRadius="full"
                    bg={progressBg}
                    sx={{
                      '& > div': {
                        background: color,
                        borderRadius: 'full',
                      }
                    }}
                  />
                  
                </Box>
              )
            })}

            {/* Show more indicator modernizado */}
            {sortedCategories.length > 5 && (
              <Box 
                textAlign="center" 
                py={4}
                bg={gradients.background}
                borderRadius="xl"
                border="1px dashed"
                borderColor={footerBorderColor}
              >
                <HStack justify="center" spacing={2}>
                  <Icon as={Sparkles} boxSize={3} color={textColorSecondary} />
                  <Text fontSize="sm" color={textColorSecondary} fontWeight="500" fontFamily="system-ui, -apple-system, sans-serif">
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
            borderColor={footerBorderColor}
            bg={footerBg}
            borderRadius="xl"
            p={4}
            mt={2}
          >
            <HStack justify="space-between" align="center">
              <HStack spacing={3}>
                <Icon as={TrendingDown} boxSize={4} color={redIcon} />
                <Text fontSize="md" fontWeight="700" color={textColor} fontFamily="system-ui, -apple-system, sans-serif">
                  Total Expenses
                </Text>
              </HStack>
              <Text
                fontSize={{ base: 'xs', sm: 'md', md: 'lg' }}
                fontWeight="800"
                color={redColor}
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                £{totalExpenses.toFixed(2)}
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
        type="EXPENSE"
        selectedPeriod={selectedPeriod}
        initialCategory={selectedCategory}
      />
    </>
  )
}