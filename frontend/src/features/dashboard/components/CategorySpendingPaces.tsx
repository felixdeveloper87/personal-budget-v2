import { useEffect, useMemo, useState } from 'react'
import { Box, Button, Flex, Grid, Text, VStack } from '@chakra-ui/react'
import { getAllExpenseCategoryLabels } from '../../../constants/transactionCategories'
import type { Transaction } from '../../../types'
import { getTransactionDate, type TransactionDateBasis } from '../../../utils/transactionDates'
import CashPace from './SpendingPace'
import HideCategoryChartDialog from './HideCategoryChartDialog'
import Panel from './Panel'
import SectionLabel from './SectionLabel'

interface CategorySpendingPacesProps {
  transactions: Transaction[]
  selectedDate: Date
  dateBasis: TransactionDateBasis
  userId: number | null
}

interface CategorySeries {
  key: string
  name: string
  transactions: Transaction[]
  currentTotal: number
  previousTotal: number
}

const categoryKey = (category: string): string => category.trim().toLowerCase()

const isMonth = (date: Date, year: number, month: number): boolean =>
  date.getFullYear() === year && date.getMonth() === month

const HIDDEN_CATEGORY_PACES_KEY = 'dashboard:hidden-category-paces'

function readHiddenCategories(storageKey: string | null): Set<string> {
  if (!storageKey) return new Set()
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) ?? '[]')
    return new Set(Array.isArray(stored) ? stored.filter((value): value is string => typeof value === 'string') : [])
  } catch {
    return new Set()
  }
}

function writeHiddenCategories(storageKey: string | null, categories: Set<string>) {
  if (!storageKey) return
  try {
    if (categories.size === 0) {
      localStorage.removeItem(storageKey)
    } else {
      localStorage.setItem(storageKey, JSON.stringify([...categories]))
    }
  } catch {
    // Keep the preference for this session when storage is unavailable.
  }
}

/** One Spending Pace chart for every built-in or previously used expense category. */
export default function CategorySpendingPaces({
  transactions,
  selectedDate,
  dateBasis,
  userId,
}: CategorySpendingPacesProps) {
  const storageKey = userId === null ? null : `${HIDDEN_CATEGORY_PACES_KEY}:${userId}`
  const [hiddenCategories, setHiddenCategories] = useState<Set<string>>(
    () => readHiddenCategories(storageKey),
  )
  const [pendingCategory, setPendingCategory] = useState<CategorySeries | null>(null)

  useEffect(() => {
    setHiddenCategories(readHiddenCategories(storageKey))
  }, [storageKey])

  const categories = useMemo(() => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    const previousDate = new Date(year, month - 1, 1)
    const groups = new Map<string, CategorySeries>(
      getAllExpenseCategoryLabels().map((name) => [
        categoryKey(name),
        {
          key: categoryKey(name),
          name,
          transactions: [],
          currentTotal: 0,
          previousTotal: 0,
        },
      ]),
    )

    for (const transaction of transactions) {
      if (transaction.type !== 'EXPENSE') continue

      const name = transaction.category.trim() || 'Uncategorised'
      const key = categoryKey(name)
      const existing = groups.get(key)
      const group = existing ?? {
        key,
        name,
        transactions: [],
        currentTotal: 0,
        previousTotal: 0,
      }
      groups.set(key, group)

      const transactionDate = getTransactionDate(transaction, dateBasis)
      const isCurrent = isMonth(transactionDate, year, month)
      const isPrevious = isMonth(
        transactionDate,
        previousDate.getFullYear(),
        previousDate.getMonth(),
      )
      if (!isCurrent && !isPrevious) continue

      // Prefer the spelling used in the current month for the visible title.
      if (isCurrent) group.name = name
      group.transactions.push(transaction)
      if (isCurrent) group.currentTotal += transaction.amount
      if (isPrevious) group.previousTotal += transaction.amount
    }

    return [...groups.values()].sort(
      (a, b) =>
        b.currentTotal - a.currentTotal
        || b.previousTotal - a.previousTotal
        || a.name.localeCompare(b.name),
    )
  }, [transactions, selectedDate, dateBasis])

  const visibleCategories = categories.filter((category) => !hiddenCategories.has(category.key))
  const hiddenCount = categories.length - visibleCategories.length

  const dismissCategory = (key: string) => {
    setHiddenCategories((current) => {
      const next = new Set(current)
      next.add(key)
      writeHiddenCategories(storageKey, next)
      return next
    })
  }

  const restoreCategories = () => {
    const next = new Set<string>()
    setHiddenCategories(next)
    writeHiddenCategories(storageKey, next)
  }

  const confirmDismiss = () => {
    if (!pendingCategory) return
    dismissCategory(pendingCategory.key)
    setPendingCategory(null)
  }

  return (
    <VStack align="stretch" spacing={{ base: 4, md: 5 }}>
      <Flex align="center" justify="space-between" gap={3}>
        <Box flex={1} minW={0}>
          <SectionLabel>Spending pace by category</SectionLabel>
        </Box>
        {hiddenCount > 0 && (
          <Button
            onClick={restoreCategories}
            h="30px"
            px={3}
            flexShrink={0}
            borderRadius="full"
            border="1px solid var(--pb-hair)"
            bg="var(--pb-surface)"
            color="var(--pb-ink-soft)"
            fontFamily="var(--pb-mono)"
            fontSize="9px"
            fontWeight={600}
            letterSpacing="0.06em"
            textTransform="uppercase"
            _hover={{ color: 'var(--pb-ink)', bg: 'var(--pb-surface-2)', borderColor: 'var(--pb-hair-2)' }}
          >
            Show hidden ({hiddenCount})
          </Button>
        )}
      </Flex>

      {visibleCategories.length === 0 ? (
        <Panel>
          <Text fontFamily="var(--pb-serif)" fontSize="sm" color="var(--pb-ink-faint)" py={6} textAlign="center">
            All category charts are hidden. Use “Show hidden” to restore them.
          </Text>
        </Panel>
      ) : (
        <Grid
          templateColumns={{ base: '1fr', md: 'repeat(2, minmax(0, 1fr))' }}
          gap={{ base: 4, md: 5 }}
          alignItems="stretch"
        >
          {visibleCategories.map((category) => (
            <CashPace
              key={category.key}
              transactions={category.transactions}
              selectedDate={selectedDate}
              dateBasis={dateBasis}
              kind="expense"
              title={category.name}
              includeCommitments
              onDismiss={() => setPendingCategory(category)}
            />
          ))}
        </Grid>
      )}

      <HideCategoryChartDialog
        isOpen={pendingCategory !== null}
        category={pendingCategory?.name ?? null}
        onClose={() => setPendingCategory(null)}
        onConfirm={confirmDismiss}
      />
    </VStack>
  )
}
