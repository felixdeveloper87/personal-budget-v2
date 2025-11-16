import { Box, VStack, HStack, Badge, Card, CardBody, useColorModeValue, useBreakpointValue } from '@chakra-ui/react'
import { useDisclosure } from '@chakra-ui/react'
import { useCallback, useState, useMemo } from 'react'
import { getResponsiveStyles, animations } from '../../ui'
import CategoryModal from '../../charts/modal/CategoryModal'
import { useIncomeCategories } from '../../../hooks/useIncomeCategories'
import { CategoryIncomeChartProps } from './types'
import { INCOME_CATEGORY_COLORS, MAX_VISIBLE_CATEGORIES } from './constants'
import { CategoryIncomeChartHeader } from './CategoryIncomeChartHeader'
import { CategoryIncomeItem } from './CategoryIncomeItem'
import { CategoryIncomeChartFooter } from './CategoryIncomeChartFooter'
import { CategoryIncomeChartEmptyState } from './CategoryIncomeChartEmptyState'
// import { CategoryIncomeChartShowMore } from './CategoryIncomeChartShowMore'

/**
 * CategoryIncomeChart Component
 * 
 * Displays income breakdown by category with interactive visualization.
 * Follows senior React patterns:
 * - Custom hooks for business logic
 * - Component composition
 * - Memoization for performance
 * - TypeScript strict typing
 * - Separation of concerns
 */
export default function CategoryIncomeChart({ transactions, selectedPeriod }: CategoryIncomeChartProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined)
  const responsiveStyles = getResponsiveStyles()
  const isMobile = useBreakpointValue({ base: true, md: false })
  const titleText = useBreakpointValue({ base: 'Incomes', sm: 'Income Analysis' })

  // Business logic extracted to custom hook
  const { sortedCategories, totalIncome, isEmpty } = useIncomeCategories(transactions)

  // Theme values
  const borderColor = useColorModeValue('gray.200', 'gray.900')
  const cardBg = useColorModeValue('gray.100', 'black')

  // Event handlers with useCallback for performance
  const handleClose = useCallback(() => {
    setSelectedCategory(undefined)
    onClose()
  }, [onClose])

  const handleCategoryClick = useCallback(
    (category: string) => {
      setSelectedCategory(category)
      onOpen()
    },
    [onOpen]
  )

  const handleViewAllClick = useCallback(() => {
    setSelectedCategory(undefined)
    onOpen()
  }, [onOpen])

  // Memoized visible categories
  const visibleCategories = useMemo(
    () => sortedCategories.slice(0, MAX_VISIBLE_CATEGORIES),
    [sortedCategories]
  )

  const hasMoreCategories = sortedCategories.length > MAX_VISIBLE_CATEGORIES
  const remainingCount = sortedCategories.length - MAX_VISIBLE_CATEGORIES

  // Early return for empty state
  if (isEmpty) {
    return <CategoryIncomeChartEmptyState title={titleText || 'Incomes'} cardBg={cardBg} />
  }

  return (
    <>
      <Card
        bg={cardBg}
        w="full"
        backdropFilter="blur(20px)"
        border="1px solid"
        borderColor={borderColor}
        borderRadius="2xl"
        shadow="2xl"
        overflow="hidden"
        sx={{
          animation: animations.slideIn,
          '@keyframes slideIn': {
            from: {
              opacity: 0,
              transform: 'translateY(20px) scale(0.95)',
            },
            to: {
              opacity: 1,
              transform: 'translateY(0) scale(1)',
            },
          },
        }}
      >
        <CardBody p={0} display="flex" flexDirection="column" h="full">
          <VStack spacing={0} align="stretch" h="full">
            <Box p={2}>
              <VStack spacing={4} align="stretch">
                {/* Header Component */}
                <CategoryIncomeChartHeader
                  title={titleText || 'Incomes'}
                  subtitle={selectedPeriod}
                  totalIncome={totalIncome}
                  selectedPeriod={selectedPeriod}
                  onViewAllClick={handleViewAllClick}
                  isMobile={isMobile || false}
                />

                {/* Badges */}
                <HStack spacing={responsiveStyles.charts.badges.container.spacing} p={2}>
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
                </HStack>

                {/* Category Items */}
                <VStack spacing={responsiveStyles.charts.progress.container.spacing} align="stretch">
                  {visibleCategories.map(({ category, amount }, index) => {
                    const percentage = totalIncome > 0 ? (amount / totalIncome) * 100 : 0
                    const color = INCOME_CATEGORY_COLORS[index % INCOME_CATEGORY_COLORS.length]

                    return (
                      <CategoryIncomeItem
                        key={category}
                        category={category}
                        amount={amount}
                        percentage={percentage}
                        color={color}
                        onClick={() => handleCategoryClick(category)}
                      />
                    )
                  })}
                </VStack>

                {/* Footer Component */}
                <CategoryIncomeChartFooter totalIncome={totalIncome} />
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

