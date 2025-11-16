import { Box, VStack, HStack, Badge, Card, CardBody, useColorModeValue, useBreakpointValue } from '@chakra-ui/react'
import { useDisclosure } from '@chakra-ui/react'
import { useCallback, useState, useMemo } from 'react'
import { getResponsiveStyles, animations } from '../../ui'
import CategoryModal from '../../charts/modal/CategoryModal'
import { useExpenseCategories } from '../../../hooks/useExpenseCategories'
import { CategoryExpenseChartProps } from './types'
import { EXPENSE_CATEGORY_COLORS } from './constants'
import { CategoryExpenseChartHeader } from './CategoryExpenseChartHeader'
import { CategoryExpenseItem } from './CategoryExpenseItem'
import { CategoryExpenseChartFooter } from './CategoryExpenseChartFooter'
import { CategoryExpenseChartEmptyState } from './CategoryExpenseChartEmptyState'

/**
 * CategoryExpenseChart Component
 * 
 * Displays expense breakdown by category with interactive visualization.
 * Follows senior React patterns:
 * - Custom hooks for business logic
 * - Component composition
 * - Memoization for performance
 * - TypeScript strict typing
 * - Separation of concerns
 */
export default function CategoryExpenseChart({ transactions, selectedPeriod }: CategoryExpenseChartProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined)
  const responsiveStyles = getResponsiveStyles()
  const isMobile = useBreakpointValue({ base: true, md: false })
  const titleText = useBreakpointValue({ base: 'Expenses', sm: 'Expense Analysis' })

  // Business logic extracted to custom hook
  const { sortedCategories, totalExpenses, isEmpty } = useExpenseCategories(transactions)

  // Theme values
  const cardBgPattern = useColorModeValue(
    'data:image/svg+xml,%3Csvg width="60" height="60" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M10 5 L20 5 M50 10 L55 10 M5 40 L15 40 M30 20 L45 20" stroke="%23000" stroke-width="0.5" opacity="0.25" stroke-linecap="round"/%3E%3C/svg%3E',
    'data:image/svg+xml,%3Csvg width="60" height="60" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M10 5 L20 5 M50 10 L55 10 M5 40 L15 40 M30 20 L45 20" stroke="%23fff" stroke-width="0.5" opacity="0.25" stroke-linecap="round"/%3E%3C/svg%3E'
  )
  const borderColor = useColorModeValue('gray.200', 'gray.900')

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

  // Use all categories instead of limiting
  const visibleCategories = useMemo(
    () => sortedCategories,
    [sortedCategories]
  )

  // Early return for empty state
  if (isEmpty) {
    return <CategoryExpenseChartEmptyState title={titleText || 'Expenses'} cardBgPattern={cardBgPattern} />
  }

  return (
    <>
      <Card
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
                <CategoryExpenseChartHeader
                  title={titleText || 'Expenses'}
                  subtitle={selectedPeriod}
                  totalExpenses={totalExpenses}
                  selectedPeriod={selectedPeriod}
                  onViewAllClick={handleViewAllClick}
                  isMobile={isMobile || false}
                />

                {/* Badges */}
                <HStack spacing={responsiveStyles.charts.badges.container.spacing} p={2}>
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

                {/* Category Items */}
                <VStack spacing={3} align="stretch">
                  {visibleCategories.map(({ category, amount }, index) => {
                    const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
                    const color = EXPENSE_CATEGORY_COLORS[index % EXPENSE_CATEGORY_COLORS.length]

                    return (
                      <CategoryExpenseItem
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
                <CategoryExpenseChartFooter totalExpenses={totalExpenses} />
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

