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
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
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
      // Toggle expand/collapse instead of opening modal
      setExpandedCategory(prev => prev === category ? null : category)
    },
    []
  )

  const handleViewAllClick = useCallback(() => {
    setSelectedCategory(undefined)
    setExpandedCategory(null)
    onOpen()
  }, [onOpen])

  // Get transactions for a specific category
  const getCategoryTransactions = useCallback((category: string) => {
    return transactions.filter(
      tx => tx.type === 'INCOME' && (tx.category || 'Uncategorized') === category
    )
  }, [transactions])

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
            <Box p={{ base: 4, sm: 6 }}>
              <VStack spacing={6} align="stretch">
                {/* Header Component */}
                <CategoryIncomeChartHeader
                  title={titleText || 'Incomes'}
                  subtitle={selectedPeriod}
                  totalIncome={totalIncome}
                  selectedPeriod={selectedPeriod}
                  onViewAllClick={handleViewAllClick}
                  isMobile={isMobile || false}
                />

                {/* Category Items */}
                <VStack spacing={responsiveStyles.charts.progress.container.spacing} align="stretch">
                  {visibleCategories.map(({ category, amount }, index) => {
                    const percentage = totalIncome > 0 ? (amount / totalIncome) * 100 : 0
                    const color = INCOME_CATEGORY_COLORS[index % INCOME_CATEGORY_COLORS.length]
                    const isExpanded = expandedCategory === category
                    const categoryTransactions = getCategoryTransactions(category)

                    return (
                      <CategoryIncomeItem
                        key={category}
                        category={category}
                        amount={amount}
                        percentage={percentage}
                        color={color}
                        onClick={() => handleCategoryClick(category)}
                        isExpanded={isExpanded}
                        transactions={categoryTransactions}
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

