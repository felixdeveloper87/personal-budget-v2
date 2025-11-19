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

  // Use all categories instead of limiting
  const visibleCategories = useMemo(
    () => sortedCategories,
    [sortedCategories]
  )

  // Early return for empty state
  if (isEmpty) {
    return <CategoryExpenseChartEmptyState title={titleText || 'Expenses'} cardBg={cardBg} />
  }

  return (
    <>
      <Card
        bg={cardBg}
        ml={{ base: 2, sm: 5 }}
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

