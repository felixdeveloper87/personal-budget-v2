import { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  HStack,
  Input,
  SimpleGrid,
  Text,
  VStack,
  Wrap,
  WrapItem,
  useColorModeValue,
} from '@chakra-ui/react'
import { Calendar, Check, Tag, TrendingDown, TrendingUp, X } from '../ui/icons'
import type { LucideIcon } from '../ui/icons'
import { SearchFiltersProps } from '../../types'
import {
  TRANSACTION_EXPENSE_OTHER_OPTIONS,
  TRANSACTION_EXPENSE_PRIMARY,
  TRANSACTION_INCOME_OTHER_OPTIONS,
  TRANSACTION_INCOME_PRIMARY,
} from '../../constants/transactionCategories'

interface QuickRange {
  id: string
  label: string
  start: string
  end: string
}

interface TypeOption {
  id: 'income' | 'expense'
  label: string
  caption: string
  icon: LucideIcon
}

const TYPE_OPTIONS: ReadonlyArray<TypeOption> = [
  { id: 'income', label: 'Income', caption: 'Money in', icon: TrendingUp },
  { id: 'expense', label: 'Expense', caption: 'Money out', icon: TrendingDown },
]

const fmtDate = (d: Date) => d.toISOString().split('T')[0]

function useQuickRanges(): ReadonlyArray<QuickRange> {
  return useMemo(() => {
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

    const last30Start = new Date(today)
    last30Start.setDate(today.getDate() - 30)

    const last3MonthsStart = new Date(today.getFullYear(), today.getMonth() - 2, 1)
    const startOfYear = new Date(today.getFullYear(), 0, 1)

    return [
      { id: 'thisMonth', label: 'This month', start: fmtDate(startOfMonth), end: fmtDate(endOfMonth) },
      { id: 'last30', label: 'Last 30 days', start: fmtDate(last30Start), end: fmtDate(today) },
      { id: 'last3', label: 'Last 3 months', start: fmtDate(last3MonthsStart), end: fmtDate(today) },
      { id: 'thisYear', label: 'This year', start: fmtDate(startOfYear), end: fmtDate(today) },
    ]
  }, [])
}

export default function SearchFilters({
  filters,
  onUpdateFilter,
  onTypeChange,
  availableCategories,
}: SearchFiltersProps) {
  void availableCategories

  const [othersOpen, setOthersOpen] = useState(false)

  const primaryCategories =
    filters.type === 'income' ? TRANSACTION_INCOME_PRIMARY : TRANSACTION_EXPENSE_PRIMARY
  const otherCategories =
    filters.type === 'income'
      ? TRANSACTION_INCOME_OTHER_OPTIONS
      : TRANSACTION_EXPENSE_OTHER_OPTIONS
  const otherCategorySet = useMemo(() => new Set<string>(otherCategories), [otherCategories])

  useEffect(() => {
    setOthersOpen(false)
  }, [filters.type])

  useEffect(() => {
    if (filters.category && otherCategorySet.has(filters.category)) {
      setOthersOpen(true)
    }
  }, [filters.category, otherCategorySet])

  // Generic tokens — resolved once at the top.
  const labelColor = useColorModeValue('gray.700', 'gray.300')
  const subLabelColor = useColorModeValue('gray.500', 'gray.500')

  const inputBg = useColorModeValue('gray.50', 'whiteAlpha.50')
  const inputBorder = useColorModeValue('gray.200', 'whiteAlpha.200')
  const inputColor = useColorModeValue('gray.900', 'gray.50')
  const focusBorder = useColorModeValue('#3b82f6', '#60a5fa')
  const focusGlow = useColorModeValue(
    'rgba(59, 130, 246, 0.18)',
    'rgba(96, 165, 250, 0.28)',
  )

  const idleChipBg = useColorModeValue('gray.50', 'whiteAlpha.50')
  const idleChipBorder = useColorModeValue('gray.200', 'whiteAlpha.200')
  const idleChipColor = useColorModeValue('gray.700', 'gray.300')
  const idleChipHoverBg = useColorModeValue('gray.100', 'whiteAlpha.100')

  const activeChipBg = useColorModeValue('blue.50', 'rgba(59,130,246,0.15)')
  const activeChipBorder = useColorModeValue('blue.300', 'rgba(96,165,250,0.45)')
  const activeChipColor = useColorModeValue('blue.700', 'blue.200')

  // ---------------------------------------------------------------------------
  // Type buttons — pre-resolved tokens for both states (idle / active).
  // We resolve these unconditionally to keep hook order stable.
  // ---------------------------------------------------------------------------
  const cardIdleBg = useColorModeValue('white', 'whiteAlpha.50')
  const cardIdleBorder = useColorModeValue('gray.200', 'whiteAlpha.200')
  const cardCaptionColor = useColorModeValue('gray.500', 'gray.500')

  // Income (active)
  const incomeFg = useColorModeValue('green.700', 'green.100')
  const incomeCaption = useColorModeValue('green.600', 'green.300')
  const incomeBgGradient = useColorModeValue(
    'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)',
    'linear-gradient(135deg, rgba(34,197,94,0.18) 0%, rgba(16,185,129,0.10) 100%)',
  )
  const incomeRing = useColorModeValue(
    '0 0 0 1px rgba(34,197,94,0.45) inset, 0 4px 14px -6px rgba(34,197,94,0.35)',
    '0 0 0 1px rgba(74,222,128,0.55) inset, 0 4px 16px -6px rgba(34,197,94,0.45)',
  )
  const incomeIconBg = useColorModeValue('white', 'rgba(0,0,0,0.25)')
  const incomeIconColor = useColorModeValue('green.500', 'green.300')
  // Income (idle hint)
  const incomeIdleIconBg = useColorModeValue('green.50', 'rgba(34,197,94,0.08)')
  const incomeIdleIconColor = useColorModeValue('green.500', 'green.300')

  // Expense (active)
  const expenseFg = useColorModeValue('red.700', 'red.100')
  const expenseCaption = useColorModeValue('red.600', 'red.300')
  const expenseBgGradient = useColorModeValue(
    'linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%)',
    'linear-gradient(135deg, rgba(239,68,68,0.18) 0%, rgba(244,63,94,0.10) 100%)',
  )
  const expenseRing = useColorModeValue(
    '0 0 0 1px rgba(239,68,68,0.45) inset, 0 4px 14px -6px rgba(239,68,68,0.35)',
    '0 0 0 1px rgba(248,113,113,0.55) inset, 0 4px 16px -6px rgba(239,68,68,0.45)',
  )
  const expenseIconBg = useColorModeValue('white', 'rgba(0,0,0,0.25)')
  const expenseIconColor = useColorModeValue('red.500', 'red.300')
  // Expense (idle hint)
  const expenseIdleIconBg = useColorModeValue('red.50', 'rgba(239,68,68,0.08)')
  const expenseIdleIconColor = useColorModeValue('red.500', 'red.300')

  const typeStyleFor = (id: 'income' | 'expense', isActive: boolean) => {
    if (id === 'income') {
      return {
        bg: isActive ? incomeBgGradient : cardIdleBg,
        boxShadow: isActive ? incomeRing : 'none',
        borderColor: isActive ? 'transparent' : cardIdleBorder,
        labelColor: isActive ? incomeFg : labelColor,
        captionColor: isActive ? incomeCaption : cardCaptionColor,
        iconBg: isActive ? incomeIconBg : incomeIdleIconBg,
        iconColor: isActive ? incomeIconColor : incomeIdleIconColor,
        checkColor: incomeIconColor,
      }
    }
    return {
      bg: isActive ? expenseBgGradient : cardIdleBg,
      boxShadow: isActive ? expenseRing : 'none',
      borderColor: isActive ? 'transparent' : cardIdleBorder,
      labelColor: isActive ? expenseFg : labelColor,
      captionColor: isActive ? expenseCaption : cardCaptionColor,
      iconBg: isActive ? expenseIconBg : expenseIdleIconBg,
      iconColor: isActive ? expenseIconColor : expenseIdleIconColor,
      checkColor: expenseIconColor,
    }
  }

  const quickRanges = useQuickRanges()

  const isQuickRangeActive = (r: QuickRange) =>
    filters.startDate === r.start && filters.endDate === r.end

  return (
    <VStack spacing={{ base: 5, sm: 6 }} align="stretch" minH="fit-content">
      {/* Type */}
      <Box>
        <Text
          fontSize="xs"
          fontWeight={600}
          color={labelColor}
          mb={2}
          textTransform="uppercase"
          letterSpacing="0.04em"
        >
          Type
        </Text>
        <SimpleGrid columns={2} spacing={3}>
          {TYPE_OPTIONS.map((opt) => {
            const isActive = filters.type === opt.id
            const tone = typeStyleFor(opt.id, isActive)
            const IconComponent = opt.icon
            return (
              <Button
                key={opt.id}
                variant="unstyled"
                flex={1}
                h={{ base: '52px', sm: '56px' }}
                px={{ base: 3, sm: 3.5 }}
                borderRadius="xl"
                border="1px solid"
                borderColor={tone.borderColor}
                bg={tone.bg}
                boxShadow={tone.boxShadow}
                onClick={() => onTypeChange(isActive ? null : opt.id)}
                aria-pressed={isActive}
                position="relative"
                textAlign="left"
                whiteSpace="normal"
                transition="background 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease, transform 0.12s ease"
                _hover={{
                  bg: isActive ? tone.bg : idleChipHoverBg,
                  transform: 'translateY(-1px)',
                }}
                _active={{ transform: 'translateY(0)' }}
                _focusVisible={{
                  boxShadow: `${tone.boxShadow}, 0 0 0 3px ${focusGlow}`,
                }}
              >
                <HStack spacing={{ base: 2, sm: 2.5 }} align="center" w="full">
                  <Box
                    w={{ base: 7, sm: 8 }}
                    h={{ base: 7, sm: 8 }}
                    borderRadius="lg"
                    bg={tone.iconBg}
                    color={tone.iconColor}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink={0}
                    transition="background-color 0.18s ease, color 0.18s ease"
                  >
                      <IconComponent size={16} weight="bold" />
                  </Box>
                  <VStack align="flex-start" spacing={0} minW={0} flex={1}>
                    <Text
                      fontSize="sm"
                      fontWeight={700}
                      color={tone.labelColor}
                      lineHeight="1.2"
                    >
                      {opt.label}
                    </Text>
                    <Text fontSize="xs" color={tone.captionColor} fontWeight={500}>
                      {opt.caption}
                    </Text>
                  </VStack>
                  {isActive && (
                    <Box
                      w={5}
                      h={5}
                      borderRadius="full"
                      bg={tone.checkColor}
                      color="white"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      flexShrink={0}
                    >
                      <Check size={12} weight="bold" />
                    </Box>
                  )}
                </HStack>
              </Button>
            )
          })}
        </SimpleGrid>
      </Box>

      {/* Category */}
      {filters.type && (
        <Box>
          <HStack mb={2} spacing={2}>
            <Tag size={14} weight="bold" color={subLabelColor} />
            <Text
              fontSize="xs"
              fontWeight={600}
              color={labelColor}
              textTransform="uppercase"
              letterSpacing="0.04em"
            >
              Category
            </Text>
            {filters.category && (
              <Button
                variant="link"
                size="xs"
                ml="auto"
                color={subLabelColor}
                fontWeight={500}
                onClick={() => onUpdateFilter('category', '')}
                rightIcon={<X size={12} weight="bold" />}
                _hover={{ color: activeChipColor, textDecoration: 'none' }}
              >
                Clear
              </Button>
            )}
          </HStack>
          <Wrap spacing={2}>
            {primaryCategories.map((cat) => {
              const isActive = filters.category === cat
              const isOthers = cat === 'Others'
              const isOthersActive =
                isOthers && (isActive || othersOpen || otherCategorySet.has(filters.category))
              return (
                <WrapItem key={cat}>
                  <Button
                    variant="unstyled"
                    h="28px"
                    px={3}
                    fontSize="xs"
                    fontWeight={600}
                    borderRadius="full"
                    border="1px solid"
                    color={isActive || isOthersActive ? activeChipColor : idleChipColor}
                    bg={isActive || isOthersActive ? activeChipBg : idleChipBg}
                    borderColor={isActive || isOthersActive ? activeChipBorder : idleChipBorder}
                    onClick={() => {
                      if (isOthers) {
                        setOthersOpen((prev) => !prev)
                        if (!filters.category || !otherCategorySet.has(filters.category)) {
                          onUpdateFilter('category', isActive ? '' : cat)
                        }
                        return
                      }
                      setOthersOpen(false)
                      onUpdateFilter('category', isActive ? '' : cat)
                    }}
                    aria-expanded={isOthers ? othersOpen : undefined}
                    aria-pressed={isActive || isOthersActive}
                    transition="background-color 0.12s ease, border-color 0.12s ease, color 0.12s ease"
                    _hover={{ bg: isActive || isOthersActive ? activeChipBg : idleChipHoverBg }}
                    _focusVisible={{ boxShadow: `0 0 0 3px ${focusGlow}` }}
                  >
                    {cat}
                  </Button>
                </WrapItem>
              )
            })}
          </Wrap>

          {othersOpen && (
            <Wrap spacing={2} mt={3}>
              {otherCategories.map((cat) => {
                const isActive = filters.category === cat
                return (
                  <WrapItem key={cat}>
                    <Button
                      variant="unstyled"
                      h="34px"
                      px={3.5}
                      fontSize="xs"
                      fontWeight={600}
                      borderRadius="full"
                      border="1px solid"
                      color={isActive ? activeChipColor : idleChipColor}
                      bg={isActive ? activeChipBg : idleChipBg}
                      borderColor={isActive ? activeChipBorder : idleChipBorder}
                      onClick={() => {
                        onUpdateFilter('category', isActive ? 'Others' : cat)
                      }}
                      aria-pressed={isActive}
                      transition="background-color 0.12s ease, border-color 0.12s ease, color 0.12s ease"
                      _hover={{ bg: isActive ? activeChipBg : idleChipHoverBg }}
                      _focusVisible={{ boxShadow: `0 0 0 3px ${focusGlow}` }}
                    >
                      {cat}
                    </Button>
                  </WrapItem>
                )
              })}
            </Wrap>
          )}
        </Box>
      )}

      {/* Date */}
      <Box>
        <HStack mb={2} spacing={2}>
          <Calendar size={14} weight="bold" color={subLabelColor} />
          <Text
            fontSize="xs"
            fontWeight={600}
            color={labelColor}
            textTransform="uppercase"
            letterSpacing="0.04em"
          >
            Date range
          </Text>
          {(filters.startDate || filters.endDate) && (
            <Button
              variant="link"
              size="xs"
              ml="auto"
              color={subLabelColor}
              fontWeight={500}
              onClick={() => {
                onUpdateFilter('startDate', '')
                onUpdateFilter('endDate', '')
              }}
              rightIcon={<X size={12} weight="bold" />}
              _hover={{ color: activeChipColor, textDecoration: 'none' }}
            >
              Clear
            </Button>
          )}
        </HStack>

        <Wrap spacing={2} mb={3}>
          {quickRanges.map((r) => {
            const isActive = isQuickRangeActive(r)
            return (
              <WrapItem key={r.id}>
                <Button
                  variant="unstyled"
                  h="34px"
                  px={3.5}
                  fontSize="xs"
                  fontWeight={600}
                  borderRadius="full"
                  border="1px solid"
                  color={isActive ? activeChipColor : idleChipColor}
                  bg={isActive ? activeChipBg : idleChipBg}
                  borderColor={isActive ? activeChipBorder : idleChipBorder}
                  onClick={() => {
                    if (isActive) {
                      onUpdateFilter('startDate', '')
                      onUpdateFilter('endDate', '')
                    } else {
                      onUpdateFilter('startDate', r.start)
                      onUpdateFilter('endDate', r.end)
                    }
                  }}
                  aria-pressed={isActive}
                  transition="background-color 0.12s ease, border-color 0.12s ease, color 0.12s ease"
                  _hover={{ bg: isActive ? activeChipBg : idleChipHoverBg }}
                  _focusVisible={{ boxShadow: `0 0 0 3px ${focusGlow}` }}
                >
                  {r.label}
                </Button>
              </WrapItem>
            )
          })}
        </Wrap>

        <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
          <Box flex={1}>
            <Text fontSize="2xs" color={subLabelColor} mb={1.5} fontWeight={500}>
              From
            </Text>
            <Input
              type="date"
              h="40px"
              fontSize="sm"
              bg={inputBg}
              border="1px solid"
              borderColor={inputBorder}
              color={inputColor}
              borderRadius="lg"
              value={filters.startDate}
              onChange={(e) => onUpdateFilter('startDate', e.target.value)}
              _hover={{ borderColor: focusBorder }}
              _focus={{ borderColor: focusBorder, boxShadow: `0 0 0 3px ${focusGlow}` }}
              transition="border-color 0.15s ease, box-shadow 0.15s ease"
            />
          </Box>
          <Box flex={1}>
            <Text fontSize="2xs" color={subLabelColor} mb={1.5} fontWeight={500}>
              To
            </Text>
            <Input
              type="date"
              h="40px"
              fontSize="sm"
              bg={inputBg}
              border="1px solid"
              borderColor={inputBorder}
              color={inputColor}
              borderRadius="lg"
              value={filters.endDate}
              onChange={(e) => onUpdateFilter('endDate', e.target.value)}
              _hover={{ borderColor: focusBorder }}
              _focus={{ borderColor: focusBorder, boxShadow: `0 0 0 3px ${focusGlow}` }}
              transition="border-color 0.15s ease, box-shadow 0.15s ease"
            />
          </Box>
        </SimpleGrid>
      </Box>
    </VStack>
  )
}
