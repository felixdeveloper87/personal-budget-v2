import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { Box, Text } from '@chakra-ui/react'
import { parseISO } from '../../transactions/transactions.utils'
import type { TxnVM } from '../../transactions/transactions.types'
import { useI18n } from '../../../i18n'

interface UpcomingPaymentsProps {
  /** View-model of the FULL transaction list (not period-sliced). */
  allTxns: TxnVM[]
}

interface DayBucket {
  iso: string
  date: Date
  total: number
  count: number
  topMerchant: string
}

function todayIso(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Sums the scheduled outflow from today onwards (settlement date). */
export function useUpcomingBuckets(allTxns: TxnVM[]) {
  return useMemo(() => {
    const today = todayIso()
    const map = new Map<string, { total: number; count: number; merchants: Map<string, number> }>()
    for (const t of allTxns) {
      if (t.type !== 'out') continue
      if (t.settlementDate < today) continue
      const entry = map.get(t.settlementDate) ?? { total: 0, count: 0, merchants: new Map() }
      entry.total += t.amount
      entry.count += 1
      entry.merchants.set(t.merchant, (entry.merchants.get(t.merchant) ?? 0) + t.amount)
      map.set(t.settlementDate, entry)
    }
    const buckets: DayBucket[] = [...map.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(0, 24)
      .map(([iso, v]) => {
        const topMerchant = [...v.merchants.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? ''
        return { iso, date: parseISO(iso), total: v.total, count: v.count, topMerchant }
      })
    return { buckets, grandTotal: buckets.reduce((sum, b) => sum + b.total, 0) }
  }, [allTxns])
}

/** Swipeable day cards for what leaves next — Nubank style: flat grey cards,
    the next payment day highlighted in lilac. The section title lives outside. */
export default function UpcomingPayments({ allTxns }: UpcomingPaymentsProps) {
  const { t, formatCurrency, formatDate, formatNumber } = useI18n()
  const carouselRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef({ startX: 0, scrollLeft: 0 })
  const { buckets } = useUpcomingBuckets(allTxns)

  const startDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || event.button !== 0 || !carouselRef.current) return
    dragRef.current = { startX: event.clientX, scrollLeft: carouselRef.current.scrollLeft }
    setIsDragging(true)
    carouselRef.current.setPointerCapture(event.pointerId)
  }
  const moveDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDragging || event.pointerType !== 'mouse' || !carouselRef.current) return
    event.preventDefault()
    carouselRef.current.scrollLeft = dragRef.current.scrollLeft - (event.clientX - dragRef.current.startX)
  }
  const stopDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return
    if (carouselRef.current?.hasPointerCapture(event.pointerId)) carouselRef.current.releasePointerCapture(event.pointerId)
    setIsDragging(false)
  }

  if (buckets.length === 0) {
    return (
      <Box bg="var(--pb-surface)" borderRadius="16px" px={4} py={6} textAlign="center">
        <Text fontSize="sm" color="var(--pb-ink-soft)">{t('payments.upcoming.empty')}</Text>
      </Box>
    )
  }

  return (
    <Box
      ref={carouselRef}
      onPointerDown={startDrag}
      onPointerMove={moveDrag}
      onPointerUp={stopDrag}
      onPointerCancel={stopDrag}
      onLostPointerCapture={() => setIsDragging(false)}
      display="flex"
      gap={2.5}
      overflowX="auto"
      mx={{ base: -4, md: 0 }}
      px={{ base: 4, md: 0 }}
      pb={1}
      cursor={isDragging ? 'grabbing' : 'grab'}
      userSelect={isDragging ? 'none' : 'auto'}
      sx={{
        touchAction: 'pan-x pan-y',
        WebkitOverflowScrolling: 'touch',
        scrollSnapType: 'x mandatory',
        scrollPaddingInline: '16px',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
      }}
    >
      {buckets.map((bucket, index) => {
        const next = index === 0
        return (
          <Box
            key={bucket.iso}
            flex={{ base: '0 0 62%', sm: '0 0 calc(33.333% - 7px)', lg: '0 0 calc(25% - 8px)' }}
            px={3.5}
            py={3}
            borderRadius="16px"
            bg={next ? 'var(--nu-brand-tint, #f3e8fc)' : 'var(--pb-surface)'}
            sx={{ scrollSnapAlign: 'start' }}
          >
            <Text fontSize="xs" fontWeight={next ? 600 : 500} color={next ? 'var(--nu-brand, #820ad1)' : 'var(--pb-ink-soft)'} noOfLines={1}>
              {formatDate(bucket.date, { weekday: 'short', day: 'numeric', month: 'short' })}
            </Text>
            <Text mt={1} fontSize="lg" fontWeight={700} letterSpacing="-0.01em" color="var(--pb-ink)" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatCurrency(bucket.total)}
            </Text>
            <Text mt={0.5} fontSize="xs" color="var(--pb-ink-soft)" noOfLines={1}>
              {bucket.topMerchant}
              {bucket.count > 1
                ? ` ${t('payments.upcoming.more', { count: formatNumber(bucket.count - 1) })}`
                : ''}
            </Text>
          </Box>
        )
      })}
    </Box>
  )
}
