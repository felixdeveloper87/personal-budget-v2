import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import MerchantLogo from '../../../components/ui/MerchantLogo'
import type { Transaction } from '../../../types'
import { getTransactionDate } from '../../../utils/transactionDates'
import { merchantStats } from '../insights'
import Panel from './Panel'
import { useI18n } from '../../../i18n'

interface TopMerchantsProps {
  transactions: Transaction[]
  /** Full history used to build the monthly carousel. */
  historyTransactions?: Transaction[]
  selectedDate?: Date
}

const MAX_ROWS = 5
const MONTH_COUNT = 4

function isCommitmentTransaction(transaction: Transaction): boolean {
  return Boolean(transaction.isInstallment)
    || transaction.installmentPlanId != null
    || Boolean(transaction.isRecurring)
    || transaction.recurringTransactionId != null
}

function isMerchantTransaction(transaction: Transaction): boolean {
  return transaction.type === 'EXPENSE'
    && !isCommitmentTransaction(transaction)
    && Boolean(transaction.description?.trim())
}

function monthTransactions(transactions: Transaction[], date: Date): Transaction[] {
  const year = date.getFullYear()
  const month = date.getMonth()
  return transactions.filter((transaction) => {
    const transactionDate = getTransactionDate(transaction, 'activity')
    return transactionDate.getFullYear() === year && transactionDate.getMonth() === month
  })
}

/** Where discretionary money went, grouped by the transaction description. */
export default function TopMerchants({
  transactions,
  historyTransactions,
  selectedDate,
}: TopMerchantsProps) {
  const { t, formatDate } = useI18n()
  const carouselRef = useRef<HTMLDivElement>(null)
  const [activeMonth, setActiveMonth] = useState(0)

  const monthlySlides = useMemo(() => {
    if (!historyTransactions || !selectedDate) return []

    return Array.from({ length: MONTH_COUNT }, (_, index) => {
      const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - index, 1)
      return {
        key: `${date.getFullYear()}-${date.getMonth()}`,
        label: formatDate(date, { month: 'long', year: 'numeric' }),
        transactions: monthTransactions(historyTransactions, date),
      }
    })
  }, [formatDate, historyTransactions, selectedDate])

  const syncActiveMonth = useCallback(() => {
    const carousel = carouselRef.current
    if (!carousel) return
    const slides = carousel.querySelectorAll<HTMLElement>('[data-merchant-month]')
    if (slides.length === 0) return
    const step = slides.length > 1
      ? slides[1].offsetLeft - slides[0].offsetLeft
      : carousel.clientWidth
    if (step > 0) {
      setActiveMonth(Math.min(Math.max(Math.round(carousel.scrollLeft / step), 0), slides.length - 1))
    }
  }, [])

  const scrollToMonth = useCallback((index: number) => {
    const carousel = carouselRef.current
    const slide = carousel?.querySelectorAll<HTMLElement>('[data-merchant-month]')[index]
    if (!carousel || !slide) return
    carousel.scrollTo({ left: slide.offsetLeft, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel || monthlySlides.length === 0) return
    carousel.scrollTo({ left: 0 })
    setActiveMonth(0)

    const observer = typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver(syncActiveMonth)
    observer?.observe(carousel)
    return () => observer?.disconnect()
  }, [monthlySlides, syncActiveMonth])

  if (monthlySlides.length === 0) {
    return <MerchantPanel transactions={transactions} />
  }

  return (
    <VStack align="stretch" spacing={2.5}>
        <Box
          ref={carouselRef}
          role="region"
          aria-roledescription="carousel"
          aria-label={t('dashboard.topMerchants')}
          display="flex"
          gap={3}
          overflowX="auto"
          overflowY="hidden"
          onScroll={syncActiveMonth}
          scrollBehavior="smooth"
          sx={{
            WebkitOverflowScrolling: 'touch',
            overscrollBehaviorX: 'contain',
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {monthlySlides.map((month, index) => (
            <Box
              data-merchant-month
              key={month.key}
              role="group"
              aria-label={`${t('dashboard.topMerchants')}, ${index + 1} / ${monthlySlides.length}: ${month.label}`}
              flex="0 0 100%"
              minW={0}
              scrollSnapAlign="start"
              scrollSnapStop="always"
            >
              <MerchantPanel transactions={month.transactions} periodLabel={month.label} />
            </Box>
          ))}
        </Box>

        <HStack justify="center" spacing={2}>
          {monthlySlides.map((month, index) => (
            <Box
              as="button"
              key={month.key}
              type="button"
              aria-label={month.label}
              aria-current={index === activeMonth ? 'true' : undefined}
              onClick={() => scrollToMonth(index)}
              h="7px"
              w={index === activeMonth ? '22px' : '7px'}
              borderRadius="full"
              bg={index === activeMonth ? 'var(--pb-forest-2)' : 'var(--pb-hair-2)'}
              transition="width 0.2s ease, background 0.2s ease"
            />
          ))}
        </HStack>
    </VStack>
  )
}

interface MerchantPanelProps {
  transactions: Transaction[]
  periodLabel?: string
}

function MerchantPanel({ transactions, periodLabel }: MerchantPanelProps) {
  const { t, formatCurrency } = useI18n()
  const { rows, merchantTotal } = useMemo(() => {
    const merchantTransactions = transactions.filter(isMerchantTransaction)
    const allMerchants = merchantStats(merchantTransactions)
    return {
      rows: allMerchants.slice(0, MAX_ROWS),
      merchantTotal: allMerchants.reduce((sum, merchant) => sum + merchant.total, 0),
    }
  }, [transactions])

  return (
    <Panel h="full">
      <VStack align="stretch" spacing={4} h="full">
        <HStack justify="space-between" align="flex-start" spacing={3}>
          <VStack align="flex-start" spacing={0.5} minW={0}>
            <Text
              fontFamily="var(--pb-mono)"
              fontSize="10.5px"
              letterSpacing="0.2em"
              textTransform="uppercase"
              color="var(--pb-ink-faint)"
            >
              {t('dashboard.topMerchants')}
            </Text>
            {periodLabel && (
              <Text
                fontFamily="var(--pb-serif)"
                fontSize="sm"
                fontWeight={500}
                color="var(--pb-ink-soft)"
                textTransform="capitalize"
                noOfLines={1}
              >
                {periodLabel}
              </Text>
            )}
          </VStack>
          {rows.length > 0 && (
            <VStack align="flex-end" spacing={0.5}>
              <Text fontFamily="var(--pb-mono)" fontSize="9px" letterSpacing="0.13em" textTransform="uppercase" color="var(--pb-ink-faint)">
                {t('dashboard.trackedSpend')}
              </Text>
              <Text fontFamily="var(--pb-serif)" fontSize="xl" fontWeight={500} lineHeight={1} color="var(--pb-ink)" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {formatCurrency(merchantTotal)}
              </Text>
            </VStack>
          )}
        </HStack>

        {rows.length === 0 ? (
          <Text fontFamily="var(--pb-serif)" fontSize="sm" color="var(--pb-ink-faint)" py={6}>
            {t('dashboard.noMerchants')}
          </Text>
        ) : (
          <VStack align="stretch" spacing={0.75} flex={1}>
            {rows.map((merchant, index) => (
              <MerchantRow
                key={merchant.key}
                rank={index + 1}
                name={merchant.name}
                count={merchant.count}
                total={merchant.total}
                share={merchantTotal > 0 ? merchant.total / merchantTotal : 0}
              />
            ))}
          </VStack>
        )}
      </VStack>
    </Panel>
  )
}

interface MerchantRowProps {
  rank: number
  name: string
  count: number
  total: number
  /** 0-1, share of all variable merchant spending in the period. */
  share: number
}

function MerchantRow({ rank, name, count, total, share }: MerchantRowProps) {
  const { t, formatCurrency } = useI18n()
  const percentage = Math.round(share * 100)

  return (
    <Box
      px={{ base: 2.5, md: 3 }}
      py={1.75}
      borderRadius="14px"
      bg="transparent"
    >
      <HStack align="flex-start" spacing={3}>
        <Box position="relative" w="36px" h="36px" flexShrink={0}>
          <MerchantLogo name={name} size={36} borderRadius="11px" />
          <Box
            position="absolute"
            right="-5px"
            bottom="-5px"
            minW="18px"
            h="18px"
            px="3px"
            display="grid"
            placeItems="center"
            borderRadius="full"
            bg="var(--pb-surface)"
            color="var(--pb-ink-faint)"
            border="1px solid"
            borderColor="var(--pb-hair-2)"
            boxShadow="0 1px 4px rgba(0,0,0,0.18)"
          >
            <Text fontFamily="var(--pb-mono)" fontSize="8px" fontWeight={700} lineHeight={1}>
              {rank}
            </Text>
          </Box>
        </Box>

        <Box minW={0} flex={1}>
          <HStack justify="space-between" align="flex-start" spacing={4}>
            <Box minW={0}>
              <HStack align="baseline" spacing={2} minW={0}>
                <Text
                  fontFamily="var(--pb-serif)"
                  fontSize="md"
                  fontWeight={500}
                  lineHeight={1.15}
                  color="var(--pb-ink)"
                  noOfLines={1}
                >
                  {name}
                </Text>
                <Text
                  flexShrink={0}
                  fontFamily="var(--pb-mono)"
                  fontSize="8.5px"
                  color="var(--pb-ink-faint)"
                >
                  x{count}
                </Text>
              </HStack>
            </Box>

            <VStack align="flex-end" spacing={0.5} flexShrink={0}>
              <Text
                fontFamily="var(--pb-serif)"
                fontSize="md"
                fontWeight={600}
                lineHeight={1.1}
                color="var(--pb-ink)"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {formatCurrency(total)}
              </Text>
              <Text fontFamily="var(--pb-mono)" fontSize="8.5px" color="var(--pb-ink-faint)" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {t('dashboard.shareOfTotal', { percentage })}
              </Text>
            </VStack>
          </HStack>

          <Box
            role="progressbar"
            aria-label={t('dashboard.merchantShareAria', { name, percentage })}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percentage}
            mt={2}
            h="4px"
            borderRadius="full"
            bg="var(--pb-surface-3)"
            overflow="hidden"
          >
            <Box
              h="full"
              w={`max(${percentage}%, 8px)`}
              borderRadius="full"
              bgGradient="linear(to-r, var(--pb-forest), var(--pb-forest-2))"
              opacity={0.78}
              transition="width 0.5s ease"
            />
          </Box>
        </Box>
      </HStack>
    </Box>
  )
}
