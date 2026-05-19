import {
  Box,
  VStack,
  HStack,
  Badge,
  Card,
  CardBody,
  useColorModeValue,
  useBreakpointValue,
  Flex,
  Text,
} from '@chakra-ui/react'
import { useDisclosure } from '@chakra-ui/react'
import { useCallback, useState, useMemo } from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
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
 */
export default function CategoryExpenseChart({ transactions, selectedPeriod }: CategoryExpenseChartProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const responsiveStyles = getResponsiveStyles()
  const isMobile = useBreakpointValue({ base: true, md: false })
  const isDesktop = useBreakpointValue({ base: false, lg: true })
  const titleText = useBreakpointValue({ base: 'Expenses', sm: 'Expense Analysis' })

  // Business logic extracted to custom hook
  const { sortedCategories, totalExpenses, isEmpty } = useExpenseCategories(transactions)

  // Event handlers with useCallback for performance
  const handleClose = useCallback(() => {
    setSelectedCategory(undefined)
    onClose()
  }, [onClose])

  const handleCategoryClick = useCallback(
    (category: string) => {
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
      tx => tx.type === 'EXPENSE' && (tx.category || 'Uncategorized') === category
    )
  }, [transactions])

  const visibleCategories = useMemo(
    () => sortedCategories,
    [sortedCategories]
  )

  // Map data for Recharts Pie Chart
  const pieData = useMemo(() => {
    return sortedCategories.map((item, index) => ({
      name: item.category,
      value: item.amount,
      color: EXPENSE_CATEGORY_COLORS[index % EXPENSE_CATEGORY_COLORS.length],
    }))
  }, [sortedCategories])

  // Early return for empty state
  if (isEmpty) {
    return <CategoryExpenseChartEmptyState title={titleText || 'Expenses'} cardBg="transparent" />
  }

  return (
    <>
      <Card
        bg="transparent"
        border="none"
        shadow="none"
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
          <VStack spacing={6} align="stretch" h="full">
            {/* Header Component */}
            <CategoryExpenseChartHeader
              title={titleText || 'Expenses'}
              subtitle={selectedPeriod}
              totalExpenses={totalExpenses}
              selectedPeriod={selectedPeriod}
              onViewAllClick={handleViewAllClick}
              isMobile={isMobile || false}
            />

            {/* Split layout: Donut Chart on Left/Top, Progress Bars on Right/Bottom */}
            <Flex direction={{ base: 'column', lg: 'row' }} gap={{ base: 6, lg: 8 }} align="stretch">
              {/* Donut Chart Container */}
              <Flex
                flex={{ base: 'none', lg: 1 }}
                direction="column"
                align="center"
                justify="center"
                minH="260px"
                bgImage={useColorModeValue('url("/hero_bg_premium_light.webp")', 'url("/hero_bg_premium.webp")')}
                bgPosition="center"
                bgSize="cover"
                borderRadius="2xl"
                border="1px solid"
                borderColor={useColorModeValue('rgba(0, 0, 0, 0.08)', 'rgba(255, 255, 255, 0.08)')}
                p={4}
                position="relative"
                overflow="hidden"
                _before={{
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bg: useColorModeValue('rgba(255, 255, 255, 0.75)', 'rgba(10, 10, 12, 0.75)'),
                  zIndex: 0,
                }}
              >
                <Box w="full" h="220px" position="relative" zIndex={1}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={85}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Absolute Centered Total Label */}
                  <VStack
                    position="absolute"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                    spacing={0}
                    pointerEvents="none"
                    zIndex={2}
                  >
                    <Text
                      fontSize="3xs"
                      fontWeight={700}
                      color="gray.400"
                      textTransform="uppercase"
                      letterSpacing="0.08em"
                    >
                      Total Spent
                    </Text>
                    <Text
                      fontSize="lg"
                      fontWeight={800}
                      color={useColorModeValue('gray.900', 'whiteAlpha.900')}
                      letterSpacing="-0.02em"
                    >
                      £{totalExpenses.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </Text>
                  </VStack>
                </Box>
              </Flex>

              {/* Progress List Container */}
              <VStack spacing={3} align="stretch" flex={{ base: 1, lg: 1.3 }}>
                {visibleCategories.map(({ category, amount }, index) => {
                  const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
                  const color = EXPENSE_CATEGORY_COLORS[index % EXPENSE_CATEGORY_COLORS.length]
                  const isExpanded = expandedCategory === category
                  const categoryTransactions = getCategoryTransactions(category)

                  return (
                    <CategoryExpenseItem
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
            </Flex>

            {/* Footer Component */}
            <CategoryExpenseChartFooter totalExpenses={totalExpenses} />
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
