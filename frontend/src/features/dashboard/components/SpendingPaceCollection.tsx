import { useEffect, useMemo, useState } from 'react'
import { Box, Button, Flex, Grid, Text, VStack } from '@chakra-ui/react'
import { getAllExpenseCategoryLabels } from '../../../constants/transactionCategories'
import type { Transaction } from '../../../types'
import { getInstallmentPlanTitle } from '../../../utils/installments'
import { getTransactionDate, type TransactionDateBasis } from '../../../utils/transactionDates'
import HideSpendingPaceDialog from './HideSpendingPaceDialog'
import Panel from './Panel'
import RestoreSpendingPaceDialog from './RestoreSpendingPaceDialog'
import { useI18n } from '../../../i18n'
import SectionLabel from './SectionLabel'
import CashPace from './SpendingPace'

export type SpendingPaceDimension = 'category' | 'description'

interface SpendingPaceCollectionProps {
  transactions: Transaction[]
  selectedDate: Date
  dateBasis: TransactionDateBasis
  userId: number | null
  dimension: SpendingPaceDimension
}

interface PaceSeries {
  key: string
  name: string
  transactions: Transaction[]
  currentTotal: number
  previousTotal: number
}

const CONFIG = {
  category: {
    sectionTitleKey: 'dashboard.paceByCategory',
    storagePrefix: 'dashboard:hidden-category-paces',
    emptyMessageKey: 'dashboard.noExpenseCategories',
    allHiddenMessageKey: 'dashboard.allCategoryChartsHidden',
  },
  description: {
    sectionTitleKey: 'dashboard.paceByDescription',
    storagePrefix: 'dashboard:hidden-description-paces',
    emptyMessageKey: 'dashboard.noExpenseDescriptions',
    allHiddenMessageKey: 'dashboard.allDescriptionChartsHidden',
  },
} as const

const collapseWhitespace = (value: string): string => value.trim().replace(/\s+/g, ' ')

const groupKey = (name: string, dimension: SpendingPaceDimension): string => {
  const trimmed = name.trim().toLowerCase()
  return dimension === 'description' ? trimmed.replace(/\s+/g, ' ') : trimmed
}

const isMonth = (date: Date, year: number, month: number): boolean =>
  date.getFullYear() === year && date.getMonth() === month

function readHiddenGroups(storageKey: string | null): Set<string> {
  if (!storageKey) return new Set()
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) ?? '[]')
    return new Set(Array.isArray(stored) ? stored.filter((value): value is string => typeof value === 'string') : [])
  } catch {
    return new Set()
  }
}

function writeHiddenGroups(storageKey: string | null, groups: Set<string>) {
  if (!storageKey) return
  try {
    if (groups.size === 0) {
      localStorage.removeItem(storageKey)
    } else {
      localStorage.setItem(storageKey, JSON.stringify([...groups]))
    }
  } catch {
    // Keep the preference for this session when storage is unavailable.
  }
}

function transactionGroupName(
  transaction: Transaction,
  dimension: SpendingPaceDimension,
): string | null {
  if (dimension === 'category') {
    return collapseWhitespace(transaction.category) || 'Uncategorised'
  }

  const description = collapseWhitespace(getInstallmentPlanTitle(transaction.description ?? ''))
  return description || null
}

export default function SpendingPaceCollection({
  transactions,
  selectedDate,
  dateBasis,
  userId,
  dimension,
}: SpendingPaceCollectionProps) {
  const { t, categoryLabel } = useI18n()
  const config = CONFIG[dimension]
  const storageKey = userId === null ? null : `${config.storagePrefix}:${userId}`
  const [hiddenGroups, setHiddenGroups] = useState<Set<string>>(() => readHiddenGroups(storageKey))
  const [pendingGroup, setPendingGroup] = useState<PaceSeries | null>(null)
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false)

  useEffect(() => {
    setHiddenGroups(readHiddenGroups(storageKey))
  }, [storageKey])

  const groups = useMemo(() => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    const previousDate = new Date(year, month - 1, 1)
    const grouped = new Map<string, PaceSeries>()

    if (dimension === 'category') {
      for (const name of getAllExpenseCategoryLabels()) {
        const key = groupKey(name, dimension)
        grouped.set(key, {
          key,
          name,
          transactions: [],
          currentTotal: 0,
          previousTotal: 0,
        })
      }
    }

    for (const transaction of transactions) {
      if (transaction.type !== 'EXPENSE') continue

      const name = transactionGroupName(transaction, dimension)
      if (!name) continue

      const transactionDate = getTransactionDate(transaction, dateBasis)
      const isCurrent = isMonth(transactionDate, year, month)
      const isPrevious = isMonth(
        transactionDate,
        previousDate.getFullYear(),
        previousDate.getMonth(),
      )

      // Categories are persistent dashboard choices; descriptions stay scoped
      // to the two periods represented by their pace chart.
      if (dimension === 'description' && !isCurrent && !isPrevious) continue

      const key = groupKey(name, dimension)
      const existing = grouped.get(key)
      const group = existing ?? {
        key,
        name,
        transactions: [],
        currentTotal: 0,
        previousTotal: 0,
      }
      grouped.set(key, group)

      if (!isCurrent && !isPrevious) continue

      // Prefer the spelling used in the current month for the visible title.
      if (isCurrent) group.name = name
      group.transactions.push(transaction)
      if (isCurrent) group.currentTotal += transaction.amount
      if (isPrevious) group.previousTotal += transaction.amount
    }

    return [...grouped.values()].sort(
      (a, b) =>
        b.currentTotal - a.currentTotal
        || b.previousTotal - a.previousTotal
        || a.name.localeCompare(b.name),
    )
  }, [transactions, selectedDate, dateBasis, dimension])

  const visibleGroups = groups.filter((group) => !hiddenGroups.has(group.key))
  const hiddenGroupItems = groups.filter((group) => hiddenGroups.has(group.key))
  const hiddenCount = hiddenGroupItems.length

  const dismissGroup = (key: string) => {
    setHiddenGroups((current) => {
      const next = new Set(current)
      next.add(key)
      writeHiddenGroups(storageKey, next)
      return next
    })
  }

  const restoreGroups = (keys: string[]) => {
    setHiddenGroups((current) => {
      const next = new Set(current)
      for (const key of keys) next.delete(key)
      writeHiddenGroups(storageKey, next)
      return next
    })
    setRestoreDialogOpen(false)
  }

  const confirmDismiss = () => {
    if (!pendingGroup) return
    dismissGroup(pendingGroup.key)
    setPendingGroup(null)
  }

  return (
    <VStack align="stretch" spacing={{ base: 4, md: 5 }}>
      <Flex align="center" justify="space-between" gap={3}>
        <Box flex={1} minW={0}>
          <SectionLabel>{t(config.sectionTitleKey)}</SectionLabel>
        </Box>
        {hiddenCount > 0 && (
          <Button
            onClick={() => setRestoreDialogOpen(true)}
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
            {t('dashboard.showHidden', { count: hiddenCount })}
          </Button>
        )}
      </Flex>

      {groups.length === 0 || visibleGroups.length === 0 ? (
        <Panel>
          <Text fontFamily="var(--pb-serif)" fontSize="sm" color="var(--pb-ink-faint)" py={6} textAlign="center">
            {t(groups.length === 0 ? config.emptyMessageKey : config.allHiddenMessageKey)}
          </Text>
        </Panel>
      ) : (
        <Grid
          templateColumns={{ base: '1fr', md: 'repeat(2, minmax(0, 1fr))' }}
          gap={{ base: 4, md: 5 }}
          alignItems="stretch"
        >
          {visibleGroups.map((group) => (
            <CashPace
              key={group.key}
              transactions={group.transactions}
              selectedDate={selectedDate}
              dateBasis={dateBasis}
              kind="expense"
              title={dimension === 'category' ? categoryLabel(group.name) : group.name}
              includeCommitments
              onDismiss={() => setPendingGroup(group)}
            />
          ))}
        </Grid>
      )}

      <HideSpendingPaceDialog
        isOpen={pendingGroup !== null}
        itemName={pendingGroup ? (dimension === 'category' ? categoryLabel(pendingGroup.name) : pendingGroup.name) : null}
        onClose={() => setPendingGroup(null)}
        onConfirm={confirmDismiss}
      />
      <RestoreSpendingPaceDialog
        isOpen={restoreDialogOpen}
        items={hiddenGroupItems.map(({ key, name }) => ({
          key,
          name: dimension === 'category' ? categoryLabel(name) : name,
        }))}
        onClose={() => setRestoreDialogOpen(false)}
        onConfirm={restoreGroups}
      />
    </VStack>
  )
}
