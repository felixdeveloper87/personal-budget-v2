import {
  Box,
  VStack,
  HStack,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useColorModeValue,
  Icon,
  Collapse,
} from '@chakra-ui/react'
import { ChevronDown, ChevronUp, Calendar, Tag, DollarSign, TrendingUp, TrendingDown } from '../ui/icons'
import { memo, useMemo } from 'react'
import { formatDateBR } from '../../utils/dateTime'
import { CategoryResultCardProps } from '../../types'

const CategoryResultCard = memo(function CategoryResultCard({
  category,
  transactions,
  type,
  isExpanded,
  onToggle,
}: CategoryResultCardProps) {
  const bgColor = useColorModeValue('white', '#111111')
  const borderColor = useColorModeValue('gray.150', 'whiteAlpha.100')
  const headerBg = useColorModeValue('gray.50', 'whiteAlpha.50')
  const headerHoverBg = useColorModeValue('gray.100', 'whiteAlpha.100')
  const textColor = useColorModeValue('gray.700', 'gray.300')
  const subtleColor = useColorModeValue('gray.500', 'gray.500')
  const rowHoverBg = useColorModeValue('gray.50', 'whiteAlpha.50')
  const dividerColor = useColorModeValue('gray.100', 'whiteAlpha.80')
  const tableHeaderBg = useColorModeValue('gray.50', 'whiteAlpha.50')
  const altRowBg = useColorModeValue('gray.50', 'whiteAlpha.30')

  const incomeAccent = useColorModeValue('#16a34a', '#4ade80')
  const expenseAccent = useColorModeValue('#dc2626', '#f87171')
  const incomeAccentBg = useColorModeValue('green.50', 'rgba(34,197,94,0.08)')
  const expenseAccentBg = useColorModeValue('red.50', 'rgba(239,68,68,0.08)')
  const incomeBadgeBg = useColorModeValue('green.100', 'rgba(34,197,94,0.15)')
  const expenseBadgeBg = useColorModeValue('red.100', 'rgba(239,68,68,0.15)')
  const incomeBadgeColor = useColorModeValue('green.700', 'green.200')
  const expenseBadgeColor = useColorModeValue('red.700', 'red.200')

  const isIncome = type === 'INCOME'
  const accentColor = isIncome ? incomeAccent : expenseAccent
  const accentBg = isIncome ? incomeAccentBg : expenseAccentBg
  const badgeBg = isIncome ? incomeBadgeBg : expenseBadgeBg
  const badgeColor = isIncome ? incomeBadgeColor : expenseBadgeColor

  const categoryTotal = useMemo(
    () => transactions.reduce((sum, t) => sum + t.amount, 0),
    [transactions],
  )

  return (
    <Box
      bg={bgColor}
      borderRadius="xl"
      border="1px solid"
      borderColor={borderColor}
      overflow="hidden"
      position="relative"
      _before={{
        content: '""',
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        w: '3px',
        bg: accentColor,
        borderRadius: '3px 0 0 3px',
      }}
    >
      {/* Header — clickable */}
      <Box
        as="button"
        w="full"
        px={{ base: 3, md: 4 }}
        py={{ base: 3, md: 3.5 }}
        pl={{ base: 5, md: 6 }}
        bg={headerBg}
        onClick={onToggle}
        display="flex"
        alignItems="center"
        cursor="pointer"
        textAlign="left"
        transition="background-color 0.15s ease"
        _hover={{ bg: headerHoverBg }}
        _active={{ bg: headerHoverBg }}
      >
        <HStack spacing={{ base: 2.5, md: 3 }} flex={1} minW={0}>
          {/* Category icon */}
          <Box
            w={{ base: 8, md: 9 }}
            h={{ base: 8, md: 9 }}
            borderRadius="lg"
            bg={accentBg}
            color={accentColor}
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
          >
            <Icon as={Tag} boxSize={{ base: 3.5, md: 4 }} />
          </Box>

          {/* Category info */}
          <VStack align="start" spacing={0.5} flex={1} minW={0}>
            <HStack spacing={2} maxW="full">
              <Text
                fontSize={{ base: 'sm', md: 'md' }}
                fontWeight={700}
                color={textColor}
                noOfLines={1}
              >
                {category}
              </Text>
              <Badge
                px={2}
                py={0.5}
                borderRadius="full"
                bg={badgeBg}
                color={badgeColor}
                fontSize="2xs"
                fontWeight={700}
                textTransform="none"
                display="flex"
                alignItems="center"
                gap={1}
                flexShrink={0}
              >
                <Icon as={isIncome ? TrendingUp : TrendingDown} boxSize={2.5} />
                {isIncome ? 'Income' : 'Expense'}
              </Badge>
            </HStack>
            <Text fontSize={{ base: '2xs', md: 'xs' }} color={subtleColor}>
              {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
            </Text>
          </VStack>

          {/* Total + chevron */}
          <HStack spacing={{ base: 1.5, md: 2 }} flexShrink={0}>
            <Text
              fontSize={{ base: 'sm', md: 'md' }}
              fontWeight={800}
              color={accentColor}
              letterSpacing="-0.01em"
            >
              {isIncome ? '+' : ''}£{Math.abs(categoryTotal).toFixed(2)}
            </Text>
            <Icon
              as={isExpanded ? ChevronUp : ChevronDown}
              boxSize={{ base: 4, md: 4 }}
              color={subtleColor}
              transition="transform 0.2s ease"
            />
          </HStack>
        </HStack>
      </Box>

      {/* Transactions */}
      <Collapse in={isExpanded} animateOpacity>
        {/* Mobile: stacked rows */}
        <Box display={{ base: 'block', md: 'none' }}>
          {transactions.map((transaction, idx) => (
            <Box
              key={transaction.id}
              px={4}
              pl={5}
              py={2.5}
              borderTop="1px solid"
              borderColor={dividerColor}
              _hover={{ bg: rowHoverBg }}
              transition="background-color 0.12s ease"
              bg={idx % 2 === 0 ? 'transparent' : altRowBg}
            >
              <HStack justify="space-between" align="flex-start" spacing={2}>
                <Text
                  fontSize="sm"
                  fontWeight={500}
                  color={textColor}
                  flex={1}
                  noOfLines={2}
                  lineHeight="1.35"
                >
                  {transaction.description}
                </Text>
                <Text
                  fontSize="sm"
                  fontWeight={700}
                  color={accentColor}
                  flexShrink={0}
                  letterSpacing="-0.01em"
                >
                  {isIncome ? '+' : ''}£{Math.abs(transaction.amount).toFixed(2)}
                </Text>
              </HStack>
              <HStack spacing={1} mt={0.5}>
                <Icon as={Calendar} boxSize={2.5} color={subtleColor} />
                <Text fontSize="2xs" color={subtleColor}>
                  {formatDateBR((transaction as any).date || transaction.dateTime)}
                </Text>
              </HStack>
            </Box>
          ))}
        </Box>

        {/* Desktop: table */}
        <Box display={{ base: 'none', md: 'block' }}>
          <Table variant="simple" size="sm" w="full">
            <Thead bg={tableHeaderBg}>
              <Tr>
                <Th
                  color={subtleColor}
                  fontSize="2xs"
                  fontWeight={700}
                  textTransform="uppercase"
                  letterSpacing="0.06em"
                  py={2}
                  pl={6}
                  w="130px"
                >
                  <HStack spacing={1.5}>
                    <Icon as={Calendar} boxSize={3} />
                    <Text>Date</Text>
                  </HStack>
                </Th>
                <Th
                  color={subtleColor}
                  fontSize="2xs"
                  fontWeight={700}
                  textTransform="uppercase"
                  letterSpacing="0.06em"
                  py={2}
                >
                  Description
                </Th>
                <Th
                  color={subtleColor}
                  fontSize="2xs"
                  fontWeight={700}
                  textTransform="uppercase"
                  letterSpacing="0.06em"
                  isNumeric
                  py={2}
                  pr={5}
                  w="130px"
                >
                  <HStack spacing={1.5} justify="flex-end">
                    <Icon as={DollarSign} boxSize={3} />
                    <Text>Amount</Text>
                  </HStack>
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {transactions.map((transaction) => (
                <Tr
                  key={transaction.id}
                  _hover={{ bg: rowHoverBg }}
                  transition="background-color 0.12s ease"
                >
                  <Td
                    color={subtleColor}
                    fontSize="xs"
                    pl={6}
                    py={2.5}
                    borderColor={dividerColor}
                  >
                    {formatDateBR((transaction as any).date || transaction.dateTime)}
                  </Td>
                  <Td
                    color={textColor}
                    fontSize="sm"
                    py={2.5}
                    borderColor={dividerColor}
                  >
                    <Text isTruncated title={transaction.description}>
                      {transaction.description}
                    </Text>
                  </Td>
                  <Td isNumeric pr={5} py={2.5} borderColor={dividerColor}>
                    <Text
                      fontSize="sm"
                      fontWeight={700}
                      color={accentColor}
                      letterSpacing="-0.01em"
                    >
                      {isIncome ? '+' : ''}£{Math.abs(transaction.amount).toFixed(2)}
                    </Text>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Collapse>
    </Box>
  )
})

export default CategoryResultCard
