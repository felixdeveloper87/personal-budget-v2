import { useMemo, useState } from 'react'
import {
  Box,
  Button,
  HStack,
  Progress,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react'
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons'
import { TrendingDown, TrendingUp } from '../../ui/icons'
import { Transaction } from '../../../types'
import { useThemeColors } from '../../../hooks/useThemeColors'
import { ModalHeader, PremiumModal } from '../../ui'
import { processCategoriesWithTransactions } from './utils'
import { CATEGORY_COLORS } from './constants/categoryColors'

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  transactions: Transaction[]
  type: 'INCOME' | 'EXPENSE'
  selectedPeriod: string
  initialCategory?: string
}

export default function CategoryModal({
  isOpen,
  onClose,
  transactions,
  type,
  selectedPeriod,
  initialCategory,
}: CategoryModalProps) {
  const colors = useThemeColors()

  const surfaceBg = useColorModeValue('#ffffff', '#0a0a0a')
  const bodyBg = useColorModeValue('gray.50', '#0a0a0a')
  const cardBg = useColorModeValue('#ffffff', 'whiteAlpha.50')
  const cardBorder = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const progressBg = useColorModeValue('gray.100', 'whiteAlpha.100')
  const tableHeaderBg = useColorModeValue('gray.50', 'whiteAlpha.50')
  const tableRowAlt = useColorModeValue('gray.50', 'whiteAlpha.50')
  const tableRowHover = useColorModeValue('gray.100', 'whiteAlpha.100')

  const isIncome = type === 'INCOME'

  const filteredTransactions = useMemo(
    () => transactions.filter((t) => t.type === type),
    [transactions, type],
  )

  const { sortedCategories, total } = useMemo(
    () => processCategoriesWithTransactions(filteredTransactions),
    [filteredTransactions],
  )

  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(
    () => (initialCategory ? { [`${type}-${initialCategory}`]: true } : {}),
  )

  const toggleCategory = (category: string) => {
    const key = `${type}-${category}`
    setExpandedCategories((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const caption = useMemo(
    () => `${selectedPeriod} • £${total.toLocaleString()}`,
    [selectedPeriod, total],
  )

  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', sm: 'lg', md: 'xl', lg: '4xl' }}
      header={
        <ModalHeader
          icon={isIncome ? TrendingUp : TrendingDown}
          title={isIncome ? 'Income breakdown' : 'Expense breakdown'}
          caption={caption}
          onClose={onClose}
          accent={isIncome ? 'green' : 'red'}
        />
      }
      contentProps={{ bg: surfaceBg }}
    >
      <Box flex="1" bg={bodyBg} p={{ base: 4, sm: 6, md: 8 }} overflowY="auto">
        {sortedCategories.length === 0 ? (
          <VStack spacing={2} py={16} textAlign="center" color={colors.text.secondary}>
            <Text fontSize="md" fontWeight={600}>
              No {type.toLowerCase()} found
            </Text>
            <Text fontSize="sm">
              Add some {type.toLowerCase()} transactions to see the breakdown.
            </Text>
          </VStack>
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
                  p={{ base: 4, md: 5 }}
                  border="1px solid"
                  borderColor={cardBorder}
                  borderRadius="xl"
                  bg={cardBg}
                >
                  <VStack spacing={4} align="stretch">
                    <HStack justify="space-between" align="center" wrap="wrap" gap={2}>
                      <HStack spacing={3} minW="0" flex="1">
                        <Box
                          w={3}
                          h={3}
                          bg={color}
                          borderRadius="sm"
                          flexShrink={0}
                        />
                        <Text fontSize="md" fontWeight={700} color={colors.text.primary} isTruncated>
                          {category}
                        </Text>
                      </HStack>
                      <VStack spacing={0} align="end" flexShrink={0}>
                        <Text fontSize="md" fontWeight={700} color={colors.text.primary}>
                          £{categoryTotal.toFixed(2)}
                        </Text>
                        <Text fontSize="xs" color={colors.text.secondary}>
                          {percentage.toFixed(1)}% of total
                        </Text>
                      </VStack>
                    </HStack>

                    <Progress
                      value={percentage}
                      colorScheme={isIncome ? 'green' : 'red'}
                      size="sm"
                      borderRadius="md"
                      bg={progressBg}
                    />

                    <Box>
                      <Text fontSize="xs" fontWeight={600} color={colors.text.secondary} mb={2} textTransform="uppercase" letterSpacing="0.04em">
                        Transactions ({categoryTransactions.length})
                      </Text>

                      <Box
                        overflowX="auto"
                        borderRadius="lg"
                        border="1px solid"
                        borderColor={cardBorder}
                      >
                        <Table size="sm" variant="simple" minW="320px">
                          <Thead bg={tableHeaderBg}>
                            <Tr>
                              <Th fontSize="xs" color={colors.text.secondary}>Date</Th>
                              <Th fontSize="xs" color={colors.text.secondary}>Description</Th>
                              <Th fontSize="xs" color={colors.text.secondary} isNumeric>Amount</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {visibleTransactions.map((t, idx) => (
                              <Tr
                                key={t.id}
                                bg={idx % 2 === 0 ? 'transparent' : tableRowAlt}
                                _hover={{ bg: tableRowHover }}
                                transition="background-color 0.15s ease"
                              >
                                <Td fontSize="xs" color={colors.text.primary}>
                                  {new Date(t.dateTime).toLocaleDateString('en-GB', {
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </Td>
                                <Td fontSize="xs" color={colors.text.primary} maxW="160px" isTruncated>
                                  {t.description || 'No description'}
                                </Td>
                                <Td fontSize="xs" fontWeight={600} color={colors.text.primary} isNumeric>
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
                          variant="ghost"
                          size="sm"
                          mt={3}
                          w="full"
                          colorScheme={isIncome ? 'green' : 'red'}
                          rightIcon={isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                          fontWeight={600}
                          fontSize="xs"
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
    </PremiumModal>
  )
}
