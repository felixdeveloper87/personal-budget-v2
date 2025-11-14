import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Box,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Progress,
  Button,
  Icon,
  Card,
  CardBody,
  Flex,
} from '@chakra-ui/react'
import { useMemo, useState } from 'react'
import { Transaction } from '../../../types' 
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons'
import { getResponsiveStyles, getTransactionModalHeaderStyles, getGradients, animations, getShimmerStyles, safeAreaStyles, safariStyles, getScrollbarStyles } from '../../ui'
import { useThemeColors } from '../../../hooks/useThemeColors'
import { X, TrendingUp, TrendingDown } from 'lucide-react'
  
  
  const CATEGORY_COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
    '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA'
  ]
  
interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  transactions: Transaction[]
  type: 'INCOME' | 'EXPENSE'
  selectedPeriod: string
  initialCategory?: string  // Nova prop para categoria inicial expandida
}
  
export default function CategoryModal({ isOpen, onClose, transactions, type, selectedPeriod, initialCategory }: CategoryModalProps) {
  const colors = useThemeColors()
  const responsiveStyles = getResponsiveStyles()
  const gradients = getGradients()
  const headerStyles = getTransactionModalHeaderStyles(useColorModeValue, type)
  
  // Modern post-it inspired colors
  const closeButtonBg = useColorModeValue(
    gradients.background,
    gradients.background
  )
  const closeButtonBorderColor = useColorModeValue('gray.200', 'gray.600')
  const closeButtonHoverBg = useColorModeValue('red.50', 'red.900')
  const closeButtonIconColor = useColorModeValue('gray.700', 'gray.200')
  const cardBg = useColorModeValue('white', 'gray.800')
  const progressBg = useColorModeValue('gray.100', 'gray.700')
  const tableHeaderBg = useColorModeValue('gray.50', 'gray.700')
  const tableRowBg = useColorModeValue('gray.25', 'gray.750')
  const tableRowHoverBg = useColorModeValue('gray.50', 'gray.600')
  const modalBg = useColorModeValue(
    gradients.background,
    gradients.background
  )
  const topBorderColor = useColorModeValue(
    type === 'INCOME' ? 'green.200' : 'red.200',
    type === 'INCOME' ? 'green.500' : 'red.500'
  )
  
    const filteredTransactions = useMemo(
      () => transactions.filter(t => t.type === type),
      [transactions, type]
    )
  
    const { sortedCategories, total } = useMemo(() => {
      const categoryTotals = filteredTransactions.reduce((acc, transaction) => {
        const category = transaction.category
        if (!acc[category]) acc[category] = { total: 0, transactions: [] }
        acc[category].total += transaction.amount
        acc[category].transactions.push(transaction)
        return acc
      }, {} as Record<string, { total: number; transactions: Transaction[] }>)
  
      Object.values(categoryTotals).forEach(cat =>
        cat.transactions.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
      )
  
      const sortedCategories = Object.entries(categoryTotals)
        .map(([category, data]) => ({ category, ...data }))
        .sort((a, b) => b.total - a.total)
  
      const total = sortedCategories.reduce((sum, cat) => sum + cat.total, 0)
      return { sortedCategories, total }
    }, [filteredTransactions])
  
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
    // Se houver categoria inicial, expandi-la automaticamente
    if (initialCategory) {
      return { [`${type}-${initialCategory}`]: true }
    }
    return {}
  })

  const toggleCategory = (category: string) => {
    const key = `${type}-${category}`
    setExpandedCategories(prev => ({ ...prev, [key]: !prev[key] }))
  }
  
  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size={responsiveStyles.modals.category.container.size}
        closeOnOverlayClick={false}
        isCentered={true}
        motionPreset="slideInBottom"
        scrollBehavior="inside"
        closeOnEsc={true}
        blockScrollOnMount={true}
      >
        <ModalOverlay
          bg="blackAlpha.600"
          backdropFilter="blur(12px)"
          css={{
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        />
      <ModalContent
        borderRadius={{ base: 'none', md: '3xl' }}
        m={{ base: 0, md: 4 }}
        display="flex"
        flexDirection="column"
        maxW={responsiveStyles.modals.category.container.maxW}
        {...responsiveStyles.modal}
        sx={{
          ...safeAreaStyles.container,
          ...safariStyles.modal,
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
        <Card
          bg="transparent"
          border="none"
          borderRadius="2xl"
          overflow="hidden"
          w="full"
          h="full"
          display="flex"
          flexDirection="column"
        >
          {/* Animated top bar */}
          <Box
            height="2px"
            sx={getShimmerStyles()}
          />
          
          <CardBody p={0} display="flex" flexDirection="column" h="full">
            <VStack spacing={0} align="stretch" h="full">
              {/* Header */}
              <Box {...headerStyles.container}>
                <Flex
                  direction="row"
                  align="center"
                  justify="space-between"
                  flexWrap="wrap"
                  pr={{ base: 4, sm: 6 }}
                  pt={{ base: 2, sm: 0 }}
                  gap={{ base: 2, sm: 3 }}
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
                      <Icon 
                        as={type === 'INCOME' ? TrendingUp : TrendingDown} 
                        boxSize={{ base: 4, sm: 5, md: 6 }} 
                        color="white" 
                      />
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
                        {type === 'INCOME' ? 'Income' : 'Expense'} Analysis
                      </Text>
                      <Text
                        color={headerStyles.subtitle.color}
                        fontWeight="600"
                        fontSize={{ base: 'xs', sm: 'sm' }}
                        noOfLines={1}
                      >
                        {selectedPeriod} • £{total.toLocaleString()}
                      </Text>
                    </VStack>
                  </HStack>

                  {/* Close Button */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onClose}
                    bg={headerStyles.closeButton.bg}
                    border="1px solid"
                    borderColor={headerStyles.closeButton.borderColor}
                    borderRadius="xl"
                    p={2}
                    _hover={headerStyles.closeButton._hover}
                    transition="all 0.2s ease"
                    flexShrink={0}
                  >
                    <Icon as={X} boxSize={4} color={headerStyles.closeButton.iconColor} />
                  </Button>
                </Flex>
              </Box>

              {/* Content */}
              <Box 
                p={{ base: 4, sm: 6, md: 8 }} 
                flex="1" 
                overflowY="auto"
                {...responsiveStyles.content}
                sx={{
                  ...safeAreaStyles.content,
                  ...safariStyles.scrollable,
                  ...getScrollbarStyles(useColorModeValue)
                }}
              >
  
          {sortedCategories.length === 0 ? (
            <Box p={responsiveStyles.modals.category.empty.padding} textAlign="center" color={colors.text.secondary}>
              <Text fontSize={responsiveStyles.modals.category.empty.titleFontSize} mb={2}>
                No {type.toLowerCase()} found
              </Text>
              <Text fontSize={responsiveStyles.modals.category.empty.descriptionFontSize}>
                Add some {type.toLowerCase()} transactions to see the breakdown
              </Text>
            </Box>
            ) : (
              <VStack spacing={4} align="stretch">
                {sortedCategories.map(({ category, total: categoryTotal, transactions: categoryTransactions }, index) => {
                  const percentage = total > 0 ? (categoryTotal / total) * 100 : 0
                  const color = CATEGORY_COLORS[index % CATEGORY_COLORS.length]
                  const key = `${type}-${category}`
                  const isExpanded = !!expandedCategories[key]
                  const visibleTransactions = isExpanded
                    ? categoryTransactions
                    : categoryTransactions.slice(0, 5)
  
                  return (
                  <Box
                    key={key}
                    p={responsiveStyles.modals.category.categoryCard.padding}
                    border="1px solid"
                    borderColor={colors.border}
                    borderRadius="2xl"
                    bg={cardBg}
                    shadow="sm"
                    _hover={{
                      shadow: 'md',
                      transform: 'translateY(-2px)',
                    }}
                    transition="all 0.2s ease"
                  >
                    <VStack spacing={responsiveStyles.modals.category.categoryCard.spacing} align="stretch">
                      <HStack justify="space-between" align="center" wrap="wrap" gap={2}>
                        <HStack spacing={responsiveStyles.modals.category.categoryHeader.spacing} minW="0" flex="1">
                          <Box w={responsiveStyles.modals.category.categoryHeader.indicatorSize} h={responsiveStyles.modals.category.categoryHeader.indicatorSize} bg={color} borderRadius="sm" flexShrink={0} />
                          <Text fontSize={responsiveStyles.modals.category.categoryHeader.titleFontSize} fontWeight="semibold" color={colors.text.primary} isTruncated>
                            {category}
                          </Text>
                        </HStack>
                        <VStack spacing={0} align="end" flexShrink={0}>
                          <Text fontSize={responsiveStyles.modals.category.categoryHeader.valueFontSize} fontWeight="bold" color={colors.text.primary}>
                            £{categoryTotal.toFixed(2)}
                          </Text>
                          <Text fontSize={responsiveStyles.modals.category.categoryHeader.percentageFontSize} color={colors.text.secondary}>
                            {percentage.toFixed(1)}% of total
                          </Text>
                        </VStack>
                      </HStack>
  
                      <Progress
                        value={percentage}
                        colorScheme={type === 'INCOME' ? 'green' : 'red'}
                        size={responsiveStyles.modals.category.progress.size}
                        borderRadius="md"
                        bg={progressBg}
                      />
  
                        <Box>
                          <Text fontSize="sm" fontWeight="medium" color={colors.text.secondary} mb={2}>
                            Transactions ({categoryTransactions.length})
                          </Text>
  
                          <Box 
                            overflowX="auto" 
                            borderRadius="lg"
                            border="1px solid"
                            borderColor={colors.border}
                          >
                            <Table size="sm" variant="simple" minW="300px">
                            <Thead bg={tableHeaderBg}>
                              <Tr>
                                <Th fontSize={responsiveStyles.modals.category.table.headerFontSize} color={colors.text.secondary} py={responsiveStyles.modals.category.table.padding}>Date</Th>
                                <Th fontSize={responsiveStyles.modals.category.table.headerFontSize} color={colors.text.secondary} py={responsiveStyles.modals.category.table.padding}>Description</Th>
                                <Th fontSize={responsiveStyles.modals.category.table.headerFontSize} color={colors.text.secondary} isNumeric py={responsiveStyles.modals.category.table.padding}>Amount</Th>
                              </Tr>
                            </Thead>
                              <Tbody>
                                {visibleTransactions.map((t, index) => (
                                  <Tr 
                                    key={t.id}
                                    bg={index % 2 === 0 ? 'transparent' : tableRowBg}
                                    _hover={{
                                      bg: tableRowHoverBg,
                                    }}
                                    transition="background-color 0.2s ease"
                                  >
                                  <Td fontSize={responsiveStyles.modals.category.table.cellFontSize} color={colors.text.primary} py={responsiveStyles.modals.category.table.padding}>
                                    {new Date(t.dateTime).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
                                  </Td>
                                  <Td fontSize={responsiveStyles.modals.category.table.cellFontSize} color={colors.text.primary} maxW="120px" isTruncated py={responsiveStyles.modals.category.table.padding}>
                                    {t.description || 'No description'}
                                  </Td>
                                  <Td fontSize={responsiveStyles.modals.category.table.cellFontSize} fontWeight="semibold" color={colors.text.primary} isNumeric py={responsiveStyles.modals.category.table.padding}>
                                    £{t.amount.toFixed(2)}
                                  </Td>
                                  </Tr>
                                ))}
                              </Tbody>
                            </Table>
                          </Box>
  
                        {categoryTransactions.length > 5 && (
                          <Button
                            onClick={() => toggleCategory(category)}
                            variant="outline"
                            size={responsiveStyles.modals.category.button.size}
                            mt={responsiveStyles.modals.category.button.marginTop}
                            w="full"
                            colorScheme={type === 'INCOME' ? 'green' : 'red'}
                            rightIcon={isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                            borderRadius="lg"
                            _hover={{
                              transform: 'translateY(-1px)',
                              shadow: 'md',
                            }}
                            _active={{
                              transform: 'translateY(0)',
                            }}
                            transition="all 0.2s ease"
                          >
                            {isExpanded ? 'Show less' : `Show ${categoryTransactions.length - 5} more`}
                          </Button>
                        )}
                        </Box>
                      </VStack>
                    </Box>
                  )
                })}
              </VStack>
            )}
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </ModalContent>
    </Modal>
    </>
  )
}
  