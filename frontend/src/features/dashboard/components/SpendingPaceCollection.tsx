import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Box, Button, Flex, HStack, IconButton, Text, VStack } from '@chakra-ui/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
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

const MAX_VISIBLE_DOTS = 7

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

const isPaceExpense = (transaction: Transaction): boolean =>
  !transaction.isInstallment
  && transaction.installmentPlanId == null
  && !transaction.isRecurring
  && transaction.recurringTransactionId == null

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
  const carouselRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [visibleCardCount, setVisibleCardCount] = useState(1)
  const [canScrollPrevious, setCanScrollPrevious] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  useEffect(() => {
    setHiddenGroups(readHiddenGroups(storageKey))
  }, [storageKey])

  const groups = useMemo(() => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    const previousDate = new Date(year, month - 1, 1)
    const grouped = new Map<string, PaceSeries>()

    for (const transaction of transactions) {
      if (transaction.type !== 'EXPENSE' || !isPaceExpense(transaction)) continue

      const name = transactionGroupName(transaction, dimension)
      if (!name) continue

      const transactionDate = getTransactionDate(transaction, dateBasis)
      const isCurrent = isMonth(transactionDate, year, month)
      const isPrevious = isMonth(
        transactionDate,
        previousDate.getFullYear(),
        previousDate.getMonth(),
      )

      if (!isCurrent && !isPrevious) continue

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

  const carouselStep = useCallback((): number => {
    const carousel = carouselRef.current
    if (!carousel) return 0
    const cards = carousel.querySelectorAll<HTMLElement>('[data-pace-carousel-card]')
    if (cards.length > 1) return cards[1].offsetLeft - cards[0].offsetLeft
    return cards[0]?.getBoundingClientRect().width ?? carousel.clientWidth
  }, [])

  const syncCarouselPosition = useCallback(() => {
    const carousel = carouselRef.current
    if (!carousel) return
    const step = carouselStep()
    const nextVisibleCardCount = step > 0
      ? Math.max(1, Math.round(carousel.clientWidth / step))
      : 1
    const lastPosition = Math.max(visibleGroups.length - nextVisibleCardCount, 0)
    const nextIndex = step > 0 ? Math.round(carousel.scrollLeft / step) : 0
    setVisibleCardCount(nextVisibleCardCount)
    setActiveIndex(Math.min(Math.max(nextIndex, 0), lastPosition))
    setCanScrollPrevious(carousel.scrollLeft > 2)
    setCanScrollNext(carousel.scrollLeft + carousel.clientWidth < carousel.scrollWidth - 2)
  }, [carouselStep, visibleGroups.length])

  const scrollCarousel = useCallback((direction: -1 | 1) => {
    const carousel = carouselRef.current
    if (!carousel) return
    carousel.scrollBy({ left: direction * carouselStep(), behavior: 'smooth' })
  }, [carouselStep])

  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel) return

    const maxScrollLeft = Math.max(carousel.scrollWidth - carousel.clientWidth, 0)
    if (carousel.scrollLeft > maxScrollLeft) carousel.scrollTo({ left: maxScrollLeft })

    const frame = window.requestAnimationFrame(syncCarouselPosition)
    const observer = typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver(syncCarouselPosition)
    observer?.observe(carousel)

    return () => {
      window.cancelAnimationFrame(frame)
      observer?.disconnect()
    }
  }, [syncCarouselPosition, visibleGroups.length])

  const pageCount = Math.max(visibleGroups.length - visibleCardCount + 1, 1)

  const visibleDotIndexes = useMemo(() => {
    if (pageCount <= MAX_VISIBLE_DOTS) {
      return Array.from({ length: pageCount }, (_, index) => index)
    }
    const halfWindow = Math.floor(MAX_VISIBLE_DOTS / 2)
    const start = Math.min(
      Math.max(activeIndex - halfWindow, 0),
      pageCount - MAX_VISIBLE_DOTS,
    )
    return Array.from({ length: MAX_VISIBLE_DOTS }, (_, index) => start + index)
  }, [activeIndex, pageCount])

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
      <Flex
        align={{ base: 'stretch', sm: 'center' }}
        direction={{ base: 'column', sm: 'row' }}
        justify="space-between"
        gap={3}
      >
        <Box flex={1} minW={0}>
          <SectionLabel>{t(config.sectionTitleKey)}</SectionLabel>
        </Box>
        <HStack spacing={2} flexShrink={0} justify={{ base: 'flex-end', sm: 'initial' }}>
          {hiddenCount > 0 && (
            <Button
              onClick={() => setRestoreDialogOpen(true)}
              h="30px"
              px={3}
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
          {visibleGroups.length > 0 && (
            <>
              <IconButton
                aria-label={`${t('common.previous')}: ${t(config.sectionTitleKey)}`}
                icon={<ChevronLeft size={16} />}
                onClick={() => scrollCarousel(-1)}
                isDisabled={!canScrollPrevious}
                size="sm"
                variant="outline"
                borderRadius="full"
                borderColor="var(--pb-hair)"
                color="var(--pb-ink-soft)"
                bg="var(--pb-surface)"
                _hover={{ bg: 'var(--pb-surface-2)', color: 'var(--pb-ink)' }}
              />
              <Text
                minW="42px"
                textAlign="center"
                fontFamily="var(--pb-mono)"
                fontSize="10px"
                color="var(--pb-ink-faint)"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {activeIndex + 1} / {pageCount}
              </Text>
              <IconButton
                aria-label={`${t('common.next')}: ${t(config.sectionTitleKey)}`}
                icon={<ChevronRight size={16} />}
                onClick={() => scrollCarousel(1)}
                isDisabled={!canScrollNext}
                size="sm"
                variant="outline"
                borderRadius="full"
                borderColor="var(--pb-hair)"
                color="var(--pb-ink-soft)"
                bg="var(--pb-surface)"
                _hover={{ bg: 'var(--pb-surface-2)', color: 'var(--pb-ink)' }}
              />
            </>
          )}
        </HStack>
      </Flex>

      {groups.length === 0 || visibleGroups.length === 0 ? (
        <Panel>
          <Text fontFamily="var(--pb-serif)" fontSize="sm" color="var(--pb-ink-faint)" py={6} textAlign="center">
            {t(groups.length === 0 ? config.emptyMessageKey : config.allHiddenMessageKey)}
          </Text>
        </Panel>
      ) : (
        <Box
          ref={carouselRef}
          aria-label={t(config.sectionTitleKey)}
          role="region"
          display="flex"
          gap={{ base: 4, md: 5 }}
          overflowX="auto"
          overflowY="hidden"
          onScroll={syncCarouselPosition}
          pb={2}
          px="1px"
          scrollBehavior="smooth"
          sx={{
            WebkitOverflowScrolling: 'touch',
            overscrollBehaviorX: 'contain',
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {visibleGroups.map((group) => (
            <Box
              data-pace-carousel-card
              key={group.key}
              flex={{ base: '0 0 calc(100% - 16px)', md: '0 0 calc(50% - 10px)' }}
              minW={0}
              scrollSnapAlign="start"
            >
              <CashPace
                transactions={group.transactions}
                selectedDate={selectedDate}
                dateBasis={dateBasis}
                kind="expense"
                title={dimension === 'category' ? categoryLabel(group.name) : group.name}
                onDismiss={() => setPendingGroup(group)}
              />
            </Box>
          ))}
        </Box>
      )}

      {pageCount > 1 && (
        <HStack spacing={1.5} justify="center" aria-hidden="true">
          {visibleDotIndexes.map((index) => (
            <Box
              key={`pace-page-${index}`}
              h="5px"
              w={index === activeIndex ? '18px' : '5px'}
              borderRadius="full"
              bg={index === activeIndex ? 'var(--pb-coral)' : 'var(--pb-hair-2)'}
              transition="width 0.2s ease, background 0.2s ease"
            />
          ))}
        </HStack>
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
