import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { Box, Flex, HStack, Icon, Text } from '@chakra-ui/react'
import { CalendarClock } from '../../../components/ui/icons'
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

export default function UpcomingPayments({ allTxns }: UpcomingPaymentsProps) {
  const { t, formatCurrency, formatDate, formatNumber } = useI18n()
  const carouselRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef({ startX: 0, scrollLeft: 0 })

  const buckets = useMemo<DayBucket[]>(() => {
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
    return [...map.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(0, 24)
      .map(([iso, v]) => {
        const topMerchant = [...v.merchants.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? ''
        return { iso, date: parseISO(iso), total: v.total, count: v.count, topMerchant }
      })
  }, [allTxns])

  const grandTotal = useMemo(() => buckets.reduce((sum, b) => sum + b.total, 0), [buckets])

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

  return (
    <Box p={{ base: 2.5, md: 3 }} borderRadius="14px" bg="var(--pb-surface)" border="1px solid var(--pb-hair)" boxShadow="var(--pb-shadow)">
      <Flex justify="space-between" align="center" gap={3} mb={2.5}>
        <HStack spacing={2.5} align="baseline" minW={0}>
          <Icon as={CalendarClock} boxSize="15px" color="var(--pb-forest-2)" />
          <Text fontFamily="var(--pb-mono)" fontSize="8.5px" letterSpacing="0.16em" textTransform="uppercase" color="var(--pb-forest-2)" whiteSpace="nowrap">
            {t('payments.upcoming.eyebrow')}
          </Text>
          <Text fontSize="sm" fontWeight={600} color="var(--pb-ink)" noOfLines={1}>
            {t('payments.upcoming.title')}
          </Text>
        </HStack>
        {grandTotal > 0 && (
          <Text className="num" fontSize="sm" fontWeight={600} color="var(--pb-ink)" whiteSpace="nowrap" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatCurrency(grandTotal)}
          </Text>
        )}
      </Flex>

      {buckets.length === 0 ? (
        <Box py={6} textAlign="center">
          <Text fontFamily="var(--pb-serif)" fontStyle="italic" fontSize=".95rem" color="var(--pb-ink-faint)">
            {t('payments.upcoming.empty')}
          </Text>
        </Box>
      ) : (
        <Box
          ref={carouselRef}
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={stopDrag}
          onPointerCancel={stopDrag}
          onLostPointerCapture={() => setIsDragging(false)}
          display="flex"
          gap={2}
          overflowX="auto"
          pb={1}
          cursor={isDragging ? 'grabbing' : 'grab'}
          userSelect={isDragging ? 'none' : 'auto'}
          sx={{ touchAction: 'pan-x pan-y', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}
        >
          {buckets.map((bucket, index) => (
            <Box
              key={bucket.iso}
              flex={{ base: '0 0 60%', sm: '0 0 calc(33.333% - 6px)', lg: '0 0 calc(25% - 6px)' }}
              px={2.5}
              py={2}
              borderRadius="11px"
              bg={index === 0 ? 'var(--pb-tint-green)' : 'var(--pb-surface-2)'}
              border="1px solid"
              borderColor={index === 0 ? 'var(--pb-hair-2)' : 'var(--pb-hair)'}
            >
              <Flex justify="space-between" align="baseline" gap={2}>
                <Text fontFamily="var(--pb-mono)" fontSize="8px" letterSpacing="0.1em" textTransform="uppercase" color="var(--pb-ink-faint)" noOfLines={1}>
                  {formatDate(bucket.date, { weekday: 'short', day: 'numeric', month: 'short' })}
                </Text>
                <Text className="num" fontSize="sm" fontWeight={600} color="var(--pb-ink)" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {formatCurrency(bucket.total)}
                </Text>
              </Flex>
              <Text mt={1} fontSize="xs" color="var(--pb-ink-soft)" noOfLines={1}>
                {bucket.topMerchant}
                {bucket.count > 1
                  ? ` ${t('payments.upcoming.more', { count: formatNumber(bucket.count - 1) })}`
                  : ''}
              </Text>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}
