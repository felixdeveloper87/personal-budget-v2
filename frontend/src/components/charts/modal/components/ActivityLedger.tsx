import { useMemo, useState } from 'react'
import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import type { Transaction } from '../../../../types'
import {
  getTransactionDate,
  getCounterpartDateHint,
  type TransactionDateBasis,
} from '../../../../utils/transactionDates'
import { formatDateBR } from '../../../../utils/dateTime'
import { formatTransactionAccount } from '../../../../utils/transactionAccount'
import {
  ArrowDownRight,
  ArrowUpRight,
  Briefcase,
  Car,
  ChevronDown,
  Clock,
  Coffee,
  CreditCard,
  Film,
  Gift,
  GraduationCap,
  Heart,
  Home,
  Laptop,
  ReceiptText,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Wallet,
  Zap,
} from '../../../ui/icons'
import type { LucideIcon } from '../../../ui/icons'

/* -------------------------------------------------------------------------- */
/* Category visuals                                                            */
/* -------------------------------------------------------------------------- */

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  salary: Briefcase,
  freelance: Laptop,
  investments: TrendingUp,
  rental: Home,
  bonus: Sparkles,
  gifts: Gift,
  groceries: ShoppingCart,
  rent: Home,
  housing: Home,
  utilities: Zap,
  transport: Car,
  health: Heart,
  'dining out': Coffee,
  shopping: ShoppingBag,
  subscriptions: CreditCard,
  entertainment: Film,
  insurance: ShieldCheck,
  education: GraduationCap,
}

function categoryIcon(category?: string): LucideIcon {
  return CATEGORY_ICONS[category?.trim().toLowerCase() ?? ''] ?? Wallet
}

/**
 * Tile tints mirror the bar chart above the ledger: green means money in,
 * red means money out. The category itself is conveyed by the icon shape —
 * never by color, so direction stays unambiguous.
 */
const INCOME_TINT = '#10b981'
const EXPENSE_TINT = '#ef4444'

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

const moneyFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
})

function formatMoney(value: number): string {
  return moneyFormatter.format(value)
}

interface DayGroup {
  key: string
  date: Date
  items: Transaction[]
  net: number
}

const INITIAL_VISIBLE_ROWS = 8

/* -------------------------------------------------------------------------- */
/* Component                                                                   */
/* -------------------------------------------------------------------------- */

export interface ActivityLedgerProps {
  /** Transactions of the selected bucket, already sorted (newest first). */
  transactions: Transaction[]
  /** Headline for the selected bucket (e.g. "June 8", "Monday"). */
  title: string
  income: number
  expense: number
  /** Whether a bucket is currently selected on the bar chart. */
  hasSelection: boolean
  dateBasis?: TransactionDateBasis
}

/**
 * Receipt-style ledger for the transactions behind the selected chart bar.
 *
 *  - Header: bucket headline + in / out chips.
 *  - Rows grouped by calendar day (headers only when the bucket spans more
 *    than one day, e.g. a whole month in the year view).
 *  - Each row: category-tinted icon tile, description + badges, meta line,
 *    signed amount and schedule hint.
 *  - Long lists collapse to the first rows with a "Show all" control —
 *    remount with a `key` per bucket to reset.
 */
export default function ActivityLedger({
  transactions,
  title,
  income,
  expense,
  hasSelection,
  dateBasis = 'activity',
}: ActivityLedgerProps) {
  const [expanded, setExpanded] = useState(false)

  const groups = useMemo<DayGroup[]>(() => {
    const map = new Map<string, DayGroup>()
    for (const transaction of transactions) {
      const date = getTransactionDate(transaction, dateBasis)
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
      let group = map.get(key)
      if (!group) {
        group = { key, date, items: [], net: 0 }
        map.set(key, group)
      }
      group.items.push(transaction)
      group.net +=
        transaction.type === 'INCOME' ? transaction.amount : -transaction.amount
    }
    return [...map.values()]
  }, [transactions, dateBasis])

  const showDayHeaders = groups.length > 1
  const totalRows = transactions.length
  const visibleLimit = expanded ? totalRows : INITIAL_VISIBLE_ROWS
  const hiddenCount = Math.max(0, totalRows - visibleLimit)

  // ── Theme tokens ──────────────────────────────────────────────────────
  const surfaceBg = useColorModeValue('#ffffff', '#0d0d0d')
  const surfaceBorder = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const headerBg = useColorModeValue('gray.50', 'whiteAlpha.50')
  const titleColor = useColorModeValue('gray.900', 'gray.50')
  const mutedColor = useColorModeValue('gray.500', 'gray.400')
  const textColor = useColorModeValue('gray.800', 'gray.100')
  const rowBorder = useColorModeValue('blackAlpha.50', 'whiteAlpha.50')
  const rowHoverBg = useColorModeValue('gray.50', 'whiteAlpha.50')
  const dayHeaderBg = useColorModeValue('gray.50', 'whiteAlpha.50')
  const dayHeaderColor = useColorModeValue('gray.500', 'gray.400')
  const incomeChipBg = useColorModeValue('green.50', 'rgba(16,185,129,0.12)')
  const incomeChipColor = useColorModeValue('green.600', 'green.300')
  const expenseChipBg = useColorModeValue('red.50', 'rgba(239,68,68,0.12)')
  const expenseChipColor = useColorModeValue('red.500', 'red.300')
  const incomeAmount = useColorModeValue('green.600', 'green.300')
  const netPositive = useColorModeValue('green.600', 'green.300')
  const netNegative = useColorModeValue('red.500', 'red.300')
  const scheduledColor = useColorModeValue('orange.500', 'orange.300')
  const accountColor = useColorModeValue('gray.400', 'gray.500')
  const tileAlpha = useColorModeValue('1A', '2E')
  const emptyIconBg = useColorModeValue('gray.100', 'whiteAlpha.100')
  const showAllColor = useColorModeValue('blue.600', 'blue.300')
  const showAllHoverBg = useColorModeValue('blue.50', 'whiteAlpha.100')

  // ── Empty state ───────────────────────────────────────────────────────
  if (transactions.length === 0) {
    return (
      <Box
        bg={surfaceBg}
        border="1px dashed"
        borderColor={surfaceBorder}
        borderRadius="2xl"
        py={10}
        px={6}
        textAlign="center"
      >
        <Flex
          w="44px"
          h="44px"
          borderRadius="full"
          bg={emptyIconBg}
          align="center"
          justify="center"
          mx="auto"
          mb={3}
        >
          <Icon as={ReceiptText} boxSize={5} color={mutedColor} />
        </Flex>
        <Text fontSize="sm" fontWeight={700} color={titleColor}>
          {hasSelection ? `No transactions in ${title}` : 'Click a bar to see its transactions'}
        </Text>
        <Text mt={1} fontSize="xs" color={mutedColor}>
          {hasSelection
            ? 'Choose another bar to inspect the activity for that slot.'
            : 'Hover still shows totals; click opens the exact entries behind that bar.'}
        </Text>
      </Box>
    )
  }

  let renderedRows = 0

  return (
    <Box
      bg={surfaceBg}
      border="1px solid"
      borderColor={surfaceBorder}
      borderRadius="2xl"
      overflow="hidden"
    >
      {/* ── Header ───────────────────────────────────────────────────── */}
      <Flex
        px={{ base: 4, sm: 5 }}
        py={{ base: 3.5, sm: 4 }}
        bg={headerBg}
        borderBottom="1px solid"
        borderColor={surfaceBorder}
        align="center"
        justify="space-between"
        gap={3}
        wrap="wrap"
      >
        <Box minW={0}>
          <Text
            fontSize="2xs"
            fontWeight={800}
            color={mutedColor}
            textTransform="uppercase"
            letterSpacing="0.08em"
          >
            Activity
          </Text>
          <Text fontSize="md" fontWeight={800} color={titleColor} noOfLines={1}>
            {title}
          </Text>
          <Text fontSize="xs" color={mutedColor}>
            {totalRows} transaction{totalRows === 1 ? '' : 's'}
          </Text>
        </Box>

        <HStack spacing={2} flexShrink={0}>
          {income > 0 && (
            <HStack
              spacing={1}
              px={2.5}
              py={1}
              borderRadius="full"
              bg={incomeChipBg}
              color={incomeChipColor}
            >
              <Icon as={ArrowUpRight} boxSize={3} weight="bold" />
              <Text fontSize="xs" fontWeight={700} sx={{ fontVariantNumeric: 'tabular-nums' }}>
                {formatMoney(income)}
              </Text>
            </HStack>
          )}
          {expense > 0 && (
            <HStack
              spacing={1}
              px={2.5}
              py={1}
              borderRadius="full"
              bg={expenseChipBg}
              color={expenseChipColor}
            >
              <Icon as={ArrowDownRight} boxSize={3} weight="bold" />
              <Text fontSize="xs" fontWeight={700} sx={{ fontVariantNumeric: 'tabular-nums' }}>
                {formatMoney(expense)}
              </Text>
            </HStack>
          )}
        </HStack>
      </Flex>

      {/* ── Rows grouped by day ──────────────────────────────────────── */}
      {groups.map((group) => {
        if (renderedRows >= visibleLimit) return null

        const dayLabel = group.date
          .toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
          .toUpperCase()

        return (
          <Box key={group.key}>
            {showDayHeaders && (
              <HStack
                px={{ base: 4, sm: 5 }}
                py={1.5}
                bg={dayHeaderBg}
                borderBottom="1px solid"
                borderColor={rowBorder}
                justify="space-between"
              >
                <Text
                  fontSize="2xs"
                  fontWeight={800}
                  color={dayHeaderColor}
                  letterSpacing="0.08em"
                >
                  {dayLabel}
                </Text>
                <Text
                  fontSize="2xs"
                  fontWeight={700}
                  color={group.net >= 0 ? netPositive : netNegative}
                  sx={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {group.net >= 0 ? '+' : '-'}
                  {formatMoney(Math.abs(group.net))}
                </Text>
              </HStack>
            )}

            {group.items.map((transaction, indexInGroup) => {
              if (renderedRows >= visibleLimit) return null
              renderedRows += 1

              const isIncome = transaction.type === 'INCOME'
              const CategoryIcon = categoryIcon(transaction.category)
              const tint = isIncome ? INCOME_TINT : EXPENSE_TINT
              const accountLabel = formatTransactionAccount(transaction)
              const isScheduled =
                transaction.isFutureInstallment ||
                transaction.status === 'PLANNED' ||
                transaction.status === 'PENDING'
              const showRowDate = !showDayHeaders
              const dateHint = getCounterpartDateHint(transaction, dateBasis)

              return (
                <HStack
                  key={transaction.id ?? `${transaction.description}-${indexInGroup}`}
                  role="group"
                  position="relative"
                  spacing={3}
                  px={{ base: 3, sm: 4 }}
                  py={{ base: 3, sm: 3.5 }}
                  borderTop={indexInGroup > 0 ? '1px solid' : undefined}
                  borderColor={rowBorder}
                  _hover={{ bg: rowHoverBg }}
                  transition="background 0.15s ease"
                  align="center"
                >
                  {/* Hover accent bar */}
                  <Box
                    position="absolute"
                    left={0}
                    top="18%"
                    bottom="18%"
                    w="3px"
                    borderRightRadius="full"
                    bg={isIncome ? 'green.400' : 'red.400'}
                    opacity={0}
                    _groupHover={{ opacity: 1 }}
                    transition="opacity 0.15s ease"
                  />

                  {/* Category tile */}
                  <Flex
                    w={10}
                    h={10}
                    borderRadius="xl"
                    align="center"
                    justify="center"
                    bg={`${tint}${tileAlpha}`}
                    color={tint}
                    flexShrink={0}
                    transition="transform 0.15s ease"
                    _groupHover={{ transform: 'scale(1.06)' }}
                  >
                    <CategoryIcon size={18} weight="duotone" aria-hidden />
                  </Flex>

                  {/* Description + meta */}
                  <VStack spacing={0.5} align="stretch" flex="1" minW={0}>
                    <HStack spacing={1.5} minW={0}>
                      <Text fontSize="sm" fontWeight={700} color={textColor} noOfLines={1}>
                        {transaction.description || transaction.category || 'Transaction'}
                      </Text>
                      {transaction.isInstallment && (
                        <Badge
                          colorScheme="purple"
                          variant="subtle"
                          fontSize="9px"
                          borderRadius="md"
                          flexShrink={0}
                        >
                          {transaction.installmentNumber
                            ? `Inst. ${transaction.installmentNumber}`
                            : 'Installment'}
                        </Badge>
                      )}
                      {transaction.isRecurring && (
                        <Badge
                          colorScheme="blue"
                          variant="subtle"
                          fontSize="9px"
                          borderRadius="md"
                          flexShrink={0}
                        >
                          Recurring
                        </Badge>
                      )}
                    </HStack>

                    <HStack spacing={1.5} color={mutedColor} fontSize="xs" minW={0}>
                      <Text noOfLines={1}>{transaction.category || 'Uncategorized'}</Text>
                      {showRowDate && (
                        <>
                          <Text opacity={0.45}>·</Text>
                          <Text flexShrink={0}>
                            {getTransactionDate(transaction, dateBasis).toLocaleDateString(
                              'en-GB',
                              { day: '2-digit', month: 'short' },
                            )}
                          </Text>
                        </>
                      )}
                      {transaction.paymentMethodName && (
                        <>
                          <Text opacity={0.45}>·</Text>
                          <Text noOfLines={1}>{transaction.paymentMethodName}</Text>
                        </>
                      )}
                    </HStack>

                    {accountLabel && (
                      <Text
                        fontSize="2xs"
                        color={accountColor}
                        noOfLines={1}
                        display={{ base: 'none', sm: 'block' }}
                      >
                        {accountLabel}
                      </Text>
                    )}
                  </VStack>

                  {/* Amount + schedule hint */}
                  <VStack spacing={0.5} align="flex-end" flexShrink={0}>
                    <Text
                      color={isIncome ? incomeAmount : textColor}
                      fontSize="sm"
                      fontWeight={800}
                      whiteSpace="nowrap"
                      letterSpacing="-0.01em"
                      sx={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                      {isIncome ? '+' : '-'}
                      {formatMoney(transaction.amount)}
                    </Text>
                    {isScheduled ? (
                      <HStack spacing={1} color={scheduledColor}>
                        <Icon as={Clock} boxSize={2.5} />
                        <Text fontSize="2xs" fontWeight={600}>
                          Scheduled
                        </Text>
                      </HStack>
                    ) : dateHint ? (
                      <Text fontSize="2xs" color={mutedColor}>
                        {dateHint.prefix} {formatDateBR(dateHint.date)}
                      </Text>
                    ) : null}
                  </VStack>
                </HStack>
              )
            })}
          </Box>
        )
      })}

      {/* ── Show all ─────────────────────────────────────────────────── */}
      {hiddenCount > 0 && (
        <Button
          w="full"
          variant="ghost"
          size="sm"
          h="42px"
          borderRadius="none"
          borderTop="1px solid"
          borderColor={rowBorder}
          color={showAllColor}
          fontWeight={700}
          fontSize="xs"
          rightIcon={<Icon as={ChevronDown} boxSize={3.5} />}
          _hover={{ bg: showAllHoverBg }}
          onClick={() => setExpanded(true)}
        >
          Show all {totalRows} transactions
        </Button>
      )}
    </Box>
  )
}
