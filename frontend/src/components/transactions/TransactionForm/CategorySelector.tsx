import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Box,
  Flex,
  Text,
  Button,
  HStack,
  Icon,
  VStack,
  Wrap,
  WrapItem,
  Input,
} from '@chakra-ui/react'
import { useThemeColors } from '../../../hooks/useThemeColors'
import {
  TRANSACTION_EXPENSE_OTHER_OPTIONS,
  TRANSACTION_INCOME_OTHER_OPTIONS,
} from '../../../constants/transactionCategories'
import type { LucideIcon } from '../../ui/icons'
import {
  Briefcase,
  Laptop,
  TrendingUp,
  Home,
  FileText,
  ShoppingCart,
  Car,
  Heart,
  Zap,
  Tag,
  Sparkles,
  Building,
  Gift,
  Wallet,
  RotateCcw,
  PieChart,
  Percent,
  Coffee,
  ShoppingBag,
  CreditCard,
  Film,
  ShieldCheck,
  GraduationCap,
} from '../../ui/icons'

const incomeCategories: ReadonlyArray<{ name: string; icon: LucideIcon }> = [
  { name: 'Salary', icon: Briefcase },
  { name: 'Freelance', icon: Laptop },
  { name: 'Investments', icon: TrendingUp },
  { name: 'Rental', icon: Home },
  { name: 'Bonus', icon: Sparkles },
  { name: 'Others', icon: FileText },
]

const expenseCategories: ReadonlyArray<{ name: string; icon: LucideIcon }> = [
  { name: 'Groceries', icon: ShoppingCart },
  { name: 'Housing', icon: Home },
  { name: 'Utilities', icon: Zap },
  { name: 'Transport', icon: Car },
  { name: 'Health', icon: Heart },
  { name: 'Others', icon: FileText },
]

const INCOME_OTHER_ICONS = [
  Building,
  Gift,
  Wallet,
  RotateCcw,
  PieChart,
  Percent,
] as const

const EXPENSE_OTHER_ICONS = [
  Coffee,
  ShoppingBag,
  CreditCard,
  Film,
  ShieldCheck,
  GraduationCap,
] as const

const incomeOtherCategories = TRANSACTION_INCOME_OTHER_OPTIONS.map((name, i) => ({
  name,
  icon: INCOME_OTHER_ICONS[i],
}))

const expenseOtherCategories = TRANSACTION_EXPENSE_OTHER_OPTIONS.map((name, i) => ({
  name,
  icon: EXPENSE_OTHER_ICONS[i],
}))

function buildBuiltInNames(type: 'INCOME' | 'EXPENSE'): Set<string> {
  if (type === 'INCOME') {
    return new Set([
      ...incomeCategories.map((c) => c.name),
      ...TRANSACTION_INCOME_OTHER_OPTIONS,
    ])
  }
  return new Set([
    ...expenseCategories.map((c) => c.name),
    ...TRANSACTION_EXPENSE_OTHER_OPTIONS,
  ])
}

function isCustomCategory(type: 'INCOME' | 'EXPENSE', category: string): boolean {
  const t = category.trim()
  if (!t) return false
  return !buildBuiltInNames(type).has(t)
}

interface CategorySelectorProps {
  type: 'INCOME' | 'EXPENSE'
  category: string
  onChange: (c: string) => void
}

export default function CategorySelector({
  type,
  category,
  onChange,
}: CategorySelectorProps) {
  const colors = useThemeColors()
  const isIncome = type === 'INCOME'

  const primaryRow = isIncome ? incomeCategories : expenseCategories
  const otherRow = isIncome ? incomeOtherCategories : expenseOtherCategories

  const primaryNonOthers = useMemo(
    () => primaryRow.filter((c) => c.name !== 'Others').map((c) => c.name),
    [primaryRow]
  )

  const otherOptionNames = useMemo(
    () =>
      new Set<string>(otherRow.map((c) => c.name as string)),
    [otherRow]
  )

  const [othersOpen, setOthersOpen] = useState(false)
  const [customDraft, setCustomDraft] = useState('')

  useEffect(() => {
    setOthersOpen(false)
    setCustomDraft('')
  }, [type])

  useEffect(() => {
    if (primaryNonOthers.includes(category)) {
      setOthersOpen(false)
    }
  }, [category, primaryNonOthers])

  useEffect(() => {
    if (!othersOpen) return
    setCustomDraft(isCustomCategory(type, category) ? category.trim() : '')
  }, [othersOpen, category, type])

  const hasSelection = Boolean(category?.trim())

  const belongsToOthersBucket =
    category === 'Others' ||
    otherOptionNames.has(category) ||
    isCustomCategory(type, category)

  const othersChipVisualActive = belongsToOthersBucket || othersOpen

  const suppressPrimaryChipHighlight =
    category === 'Others' ||
    otherOptionNames.has(category) ||
    isCustomCategory(type, category)

  const applyCustomCategory = useCallback(() => {
    const next = customDraft.trim()
    if (!next) return
    onChange(next)
    setOthersOpen(false)
  }, [customDraft, onChange])

  const handleOthersChip = () => {
    setOthersOpen((prev) => {
      const opening = !prev
      if (opening) {
        const fromPrimaryBlank =
          primaryNonOthers.includes(category) || !category.trim()
        if (fromPrimaryBlank) {
          onChange('Others')
        }
      }
      return opening
    })
  }

  const focusRing = isIncome
    ? '0 0 0 2px rgba(74, 222, 128, 0.2)'
    : '0 0 0 2px rgba(248, 113, 113, 0.2)'
  const focusWithinShadow =
    type === 'INCOME' ? '0 0 0 3px #4ade8020' : '0 0 0 3px #f8717120'
  const accentBorder = isIncome ? 'green.400' : 'red.400'

  const kindWord = isIncome ? 'income' : 'expense'

  return (
    <VStack spacing={3} align="stretch">
      <Box>
        <Box
          borderRadius="2xl"
          bg={colors.inputBg}
          border="2px solid"
          borderColor={colors.border}
          _hover={{
            borderColor: accentBorder,
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
          }}
          _focusWithin={{
            borderColor: accentBorder,
            boxShadow: focusWithinShadow,
            transform: 'translateY(-2px)',
          }}
          transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        >
          <VStack align="stretch" spacing={0}>
            <VStack
              spacing={3}
              px={{ base: 3, sm: 4 }}
              py={{ base: 3, sm: 4 }}
              align="stretch"
            >
              <HStack
                justify="space-between"
                spacing={{ base: 2, sm: 3 }}
                align="center"
              >
                <HStack spacing={2.5} align="center" flexShrink={0}>
                  <Box
                    role="presentation"
                    w={{ base: 8, sm: 10 }}
                    h={{ base: 8, sm: 10 }}
                    borderRadius="xl"
                    bg={colors.bgSecondary}
                    color={accentBorder}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink={0}
                    aria-hidden
                  >
                    <Icon
                      as={Tag}
                      boxSize={{ base: 4, sm: 5 }}
                      sx={{ '& svg': { display: 'block' } }}
                    />
                  </Box>
                  <Text
                    fontSize={{ base: 'sm', sm: 'md' }}
                    fontWeight="600"
                    color={colors.text.secondary}
                    lineHeight="1.1"
                    whiteSpace="nowrap"
                    as="span"
                  >
                    <Box as="span" display={{ base: 'inline', sm: 'none' }}>
                      What?
                    </Box>
                    <Box as="span" display={{ base: 'none', sm: 'inline' }}>
                      What category?
                    </Box>
                  </Text>
                </HStack>

                <Flex flex="1" minW={0} justify="flex-end">
                  {hasSelection ? (
                    <HStack spacing={1} align="center" maxW="100%" lineHeight="1.15">
                      <Text
                        as="span"
                        fontSize={{ base: 'xs', sm: 'sm' }}
                        fontWeight="600"
                        color={colors.text.secondary}
                        whiteSpace="nowrap"
                        flexShrink={0}
                      >
                        Selected:
                      </Text>
                      <Text
                        as="span"
                        fontSize={{ base: 'sm', sm: 'md' }}
                        fontWeight="700"
                        color={colors.text.primary}
                        noOfLines={1}
                        minW={0}
                        overflow="hidden"
                        textOverflow="ellipsis"
                        textDecoration="underline"
                        textUnderlineOffset="3px"
                      >
                        {category}
                      </Text>
                    </HStack>
                  ) : (
                    <Text
                      fontSize={{ base: 'sm', sm: 'md' }}
                      fontWeight="600"
                      color={colors.text.secondary}
                      lineHeight="1.1"
                      noOfLines={1}
                      textAlign="right"
                      sx={{ opacity: 0.88 }}
                    >
                      Pick one
                    </Text>
                  )}
                </Flex>
              </HStack>

              <Wrap spacing={2} align="center">
                {primaryRow.map((cat) => {
                  if (cat.name === 'Others') {
                    return (
                      <WrapItem key={cat.name}>
                        <Button
                          variant="ghost"
                          aria-expanded={othersOpen}
                          aria-label={`More ${kindWord} categories`}
                          onClick={handleOthersChip}
                          leftIcon={
                            <Icon
                              as={cat.icon}
                              boxSize={3.5}
                              sx={{ '& svg': { display: 'block' } }}
                            />
                          }
                          iconSpacing={{ base: 1.5, sm: 2 }}
                          h={{ base: 7, sm: 8 }}
                          px={{ base: 2, sm: 3 }}
                          minW="unset"
                          borderRadius="full"
                          color={
                            othersChipVisualActive
                              ? colors.text.primary
                              : colors.text.secondary
                          }
                          bg={
                            othersChipVisualActive ? colors.bgSecondary : 'transparent'
                          }
                          fontSize={{ base: 'xs', sm: 'xs' }}
                          fontWeight={othersChipVisualActive ? 600 : 500}
                          opacity={othersChipVisualActive ? 1 : 0.78}
                          _hover={{
                            bg: colors.bgSecondary,
                            opacity: 1,
                          }}
                          _active={{ bg: colors.bgSecondary }}
                          _focusVisible={{ boxShadow: focusRing }}
                        >
                          {cat.name}
                        </Button>
                      </WrapItem>
                    )
                  }

                  const selectedPrimary =
                    category === cat.name && !suppressPrimaryChipHighlight

                  return (
                    <WrapItem key={cat.name}>
                      <Button
                        variant="ghost"
                        aria-label={`Select ${cat.name} ${kindWord} category`}
                        onClick={() => {
                          setOthersOpen(false)
                          onChange(cat.name)
                        }}
                        leftIcon={
                          <Icon
                            as={cat.icon}
                            boxSize={3.5}
                            sx={{ '& svg': { display: 'block' } }}
                          />
                        }
                        iconSpacing={{ base: 1.5, sm: 2 }}
                        h={{ base: 7, sm: 8 }}
                        px={{ base: 2, sm: 3 }}
                        minW="unset"
                        borderRadius="full"
                        color={
                          selectedPrimary ? colors.text.primary : colors.text.secondary
                        }
                        bg={
                          selectedPrimary ? colors.bgSecondary : 'transparent'
                        }
                        fontSize={{ base: 'xs', sm: 'xs' }}
                        fontWeight={selectedPrimary ? 600 : 500}
                        opacity={selectedPrimary ? 1 : 0.78}
                        _hover={{
                          bg: colors.bgSecondary,
                          opacity: 1,
                        }}
                        _active={{ bg: colors.bgSecondary }}
                        _focusVisible={{ boxShadow: focusRing }}
                      >
                        {cat.name}
                      </Button>
                    </WrapItem>
                  )
                })}
              </Wrap>

              {othersOpen && (
                <VStack
                  align="stretch"
                  spacing={3}
                  pt={2}
                  mt={1}
                  borderTopWidth="1px"
                  borderTopColor={colors.border}
                >
                  <Text
                    fontSize="xs"
                    fontWeight="600"
                    color={colors.text.secondary}
                    letterSpacing="0.02em"
                  >
                    Choose one more option or write your own
                  </Text>
                  <Wrap spacing={2} align="center">
                    {otherRow.map((cat) => {
                      const isSelected = category === cat.name
                      return (
                        <WrapItem key={cat.name}>
                          <Button
                            variant="ghost"
                            aria-label={`Select ${cat.name} ${kindWord} category`}
                            onClick={() => {
                              onChange(cat.name)
                              setOthersOpen(false)
                            }}
                            leftIcon={
                              <Icon
                                as={cat.icon}
                                boxSize={3.5}
                                sx={{ '& svg': { display: 'block' } }}
                              />
                            }
                            iconSpacing={{ base: 1.5, sm: 2 }}
                            h={{ base: 7, sm: 8 }}
                            px={{ base: 2, sm: 3 }}
                            minW="unset"
                            borderRadius="full"
                            color={
                              isSelected ? colors.text.primary : colors.text.secondary
                            }
                            bg={
                              isSelected ? colors.bgSecondary : 'transparent'
                            }
                            fontSize={{ base: 'xs', sm: 'xs' }}
                            fontWeight={isSelected ? 600 : 500}
                            opacity={isSelected ? 1 : 0.78}
                            _hover={{
                              bg: colors.bgSecondary,
                              opacity: 1,
                            }}
                            _active={{ bg: colors.bgSecondary }}
                            _focusVisible={{ boxShadow: focusRing }}
                          >
                            {cat.name}
                          </Button>
                        </WrapItem>
                      )
                    })}
                  </Wrap>

                  <VStack spacing={2} align="stretch">
                    <Text fontSize="2xs" color={colors.text.secondary}>
                      Custom category
                    </Text>
                    <HStack spacing={2} align="stretch">
                      <Input
                        value={customDraft}
                        size="sm"
                        borderRadius="lg"
                        borderColor={colors.border}
                        bg={colors.bgSecondary}
                        color={colors.text.primary}
                        placeholder="Anything you like…"
                        onChange={(e) => setCustomDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') applyCustomCategory()
                        }}
                        _placeholder={{ opacity: 0.55 }}
                      />
                      <Button
                        flexShrink={0}
                        size="sm"
                        borderRadius="lg"
                        colorScheme={isIncome ? 'green' : 'red'}
                        variant="solid"
                        isDisabled={!customDraft.trim()}
                        onClick={applyCustomCategory}
                      >
                        OK
                      </Button>
                    </HStack>
                  </VStack>
                </VStack>
              )}
            </VStack>
          </VStack>
        </Box>
      </Box>
    </VStack>
  )
}
