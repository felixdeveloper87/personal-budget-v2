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
import { useIncomeCategories } from '../../../hooks/useIncomeCategories'
import { CategoryIncomeChartProps } from './types'
import { INCOME_CATEGORY_COLORS, MAX_VISIBLE_CATEGORIES } from './constants'
import { CategoryIncomeChartHeader } from './CategoryIncomeChartHeader'
import { CategoryIncomeItem } from './CategoryIncomeItem'
import { CategoryIncomeChartFooter } from './CategoryIncomeChartFooter'
import { CategoryIncomeChartEmptyState } from './CategoryIncomeChartEmptyState'

/**
 * CategoryIncomeChart Component
 * 
 * Displays income breakdown by category with interactive visualization.
 */
export default function CategoryIncomeChart({ transactions, selectedPeriod }: CategoryIncomeChartProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const responsiveStyles = getResponsiveStyles()
  const isMobile = useBreakpointValue({ base: true, md: false })
  const isDesktop = useBreakpointValue({ base: false, lg: true })
  const titleText = useBreakpointValue({ base: 'Incomes', sm: 'Income Analysis' })

  // Business logic extracted to custom hook
  const { sortedCategories, totalIncome, isEmpty } = useIncomeCategories(transactions)

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
      tx => tx.type === 'INCOME' && (tx.category || 'Uncategorized') === category
    )
  }, [transactions])

  // Memoized visible categories
  const visibleCategories = useMemo(
    () => sortedCategories.slice(0, MAX_VISIBLE_CATEGORIES),
    [sortedCategories]
  )

  // Map data for Recharts Pie Chart
  const pieData = useMemo(() => {
    return sortedCategories.map((item, index) => ({
      name: item.category,
      value: item.amount,
      color: INCOME_CATEGORY_COLORS[index % INCOME_CATEGORY_COLORS.length],
    }))
  }, [sortedCategories])

  const hasMoreCategories = sortedCategories.length > MAX_VISIBLE_CATEGORIES
  const remainingCount = sortedCategories.length - MAX_VISIBLE_CATEGORIES

  // Early return for empty state
  if (isEmpty) {
    return <CategoryIncomeChartEmptyState title={titleText || 'Incomes'} cardBg="transparent" />
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
            <CategoryIncomeChartHeader
              title={titleText || 'Incomes'}
              subtitle={selectedPeriod}
              totalIncome={totalIncome}
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
                      Total Income
                    </Text>
                    <Text
                      fontSize="lg"
                      fontWeight={800}
                      color={useColorModeValue('gray.900', 'whiteAlpha.900')}
                      letterSpacing="-0.02em"
                    >
                      £{totalIncome.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </Text>
                  </VStack>
                </Box>
              </Flex>

              {/* Progress List Container */}
              <VStack spacing={responsiveStyles.charts.progress.container.spacing} align="stretch" flex={{ base: 1, lg: 1.3 }}>
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
            </Flex>

            {/* Footer Component */}
            <CategoryIncomeChartFooter totalIncome={totalIncome} />
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
