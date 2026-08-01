import { useMemo } from 'react'
import { Box, Flex, HStack, Text, useColorMode } from '@chakra-ui/react'

import { fmtCurrency } from '../../dashboard/components/format'
import type { TxnVM } from '../transactions.types'

type ActivityTone = 'income' | 'expense'
type ActivityDateKey = 'purchaseDate' | 'settlementDate'

export interface ChartDay {
  iso: string
  date: Date
}

interface ActivityIntensityStripProps {
  days: ChartDay[]
  txns: TxnVM[]
  selectedDay: string | null
  onSelectDay: (iso: string) => void
  periodLabel: string
  tone: ActivityTone
  dateKey: ActivityDateKey
  title: string
  caption: string
}

function dayLabel(day: ChartDay): string {
  return day.date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export default function ActivityIntensityStrip({
  days,
  txns,
  selectedDay,
  onSelectDay,
  periodLabel,
  tone,
  dateKey,
  title,
  caption,
}: ActivityIntensityStripProps) {
  const { colorMode } = useColorMode()
  const dark = colorMode === 'dark'
  const isIncome = tone === 'income'
  const transactionType = isIncome ? 'in' : 'out'
  const tint = isIncome ? 'var(--pb-tint-income)' : 'var(--pb-tint-coral)'
  const accent = isIncome ? 'var(--pb-income)' : 'var(--pb-coral)'

  const totals = useMemo(() => {
    const totalsByDay = new Map<string, number>()
    for (const transaction of txns) {
      if (transaction.type !== transactionType) continue
      const date = transaction[dateKey]
      totalsByDay.set(date, (totalsByDay.get(date) ?? 0) + transaction.amount)
    }
    return totalsByDay
  }, [dateKey, transactionType, txns])

  const summary = useMemo(() => {
    let total = 0
    let activeDays = 0
    let peak: { day: ChartDay | null; amount: number } = { day: null, amount: 0 }

    for (const day of days) {
      const amount = totals.get(day.iso) ?? 0
      total += amount
      if (amount > 0) activeDays += 1
      if (amount > peak.amount) peak = { day, amount }
    }

    return { total, activeDays, peak }
  }, [days, totals])

  const max = summary.peak.amount || 1
  const columns = Math.max(days.length, 7)

  const fillFor = (amount: number) => {
    if (amount === 0) return 'var(--pb-surface-2)'

    // Square-root intensity keeps quieter days visible when the period has
    // one much larger transaction.
    const intensity = 0.2 + Math.sqrt(amount / max) * 0.72
    if (isIncome) {
      return dark
        ? `rgba(98, 220, 162, ${intensity})`
        : `rgba(31, 138, 79, ${intensity})`
    }
    return dark
      ? `rgba(255, 154, 144, ${intensity})`
      : `rgba(184, 69, 47, ${intensity})`
  }

  return (
    <Box
      bg="var(--pb-surface)"
      border={`1px solid ${tint}`}
      borderRadius="20px"
      boxShadow="var(--pb-shadow)"
      p={{ base: 4, md: 5 }}
    >
      <Flex
        justify="space-between"
        align={{ base: 'flex-start', sm: 'center' }}
        gap={4}
        direction={{ base: 'column', sm: 'row' }}
      >
        <Box>
          <Text fontFamily="var(--pb-mono)" fontSize="10px" fontWeight={600} letterSpacing=".14em" textTransform="uppercase" color="var(--pb-ink)">
            {title}
          </Text>
          <Text mt={1} fontSize="sm" color="var(--pb-ink-soft)">
            {caption} in {periodLabel}
          </Text>
        </Box>
        <Box minW={{ base: 'full', sm: '142px' }} px={3.5} py={2.5} bg={tint} border={`1px solid ${tint}`} borderRadius="13px" textAlign={{ base: 'left', sm: 'right' }}>
          <Text fontFamily="var(--pb-serif)" fontSize="1.35rem" lineHeight={1} color={accent} style={{ fontVariantNumeric: 'tabular-nums' }}>
            {fmtCurrency(summary.total)}
          </Text>
          <Text mt={1} fontFamily="var(--pb-mono)" fontSize="9px" letterSpacing=".08em" textTransform="uppercase" color="var(--pb-ink-faint)">
            {summary.activeDays === 1 ? '1 active day' : `${summary.activeDays} active days`}
          </Text>
        </Box>
      </Flex>

      {summary.peak.day && (
        <HStack mt={4} spacing={2} w="fit-content" px={2.5} py={1.5} borderRadius="full" bg={tint}>
          <Box w="6px" h="6px" borderRadius="full" bg={accent} />
          <Text fontFamily="var(--pb-mono)" fontSize="9.5px" letterSpacing=".025em" color="var(--pb-ink-soft)">
            Highest day: <Text as="span" color={accent} fontWeight={600}>{fmtCurrency(summary.peak.amount)}</Text> on {dayLabel(summary.peak.day)}
          </Text>
        </HStack>
      )}

      <Box mt={5} overflowX="auto" pb={1} sx={{ scrollbarWidth: 'thin' }}>
        <Box
          display="grid"
          gridTemplateColumns={`repeat(${columns}, minmax(38px, 1fr))`}
          gap={{ base: 1.5, md: 2 }}
          minW={days.length > 42 ? `${days.length * 40}px` : undefined}
        >
          {days.map((day) => {
            const amount = totals.get(day.iso) ?? 0
            const selected = day.iso === selectedDay
            const active = amount > 0

            return (
              <Box
                key={day.iso}
                as="button"
                type="button"
                aria-label={`${dayLabel(day)}: ${fmtCurrency(amount)}. Select to view transactions.`}
                aria-pressed={selected}
                title={`${dayLabel(day)} · ${fmtCurrency(amount)}`}
                onClick={() => onSelectDay(day.iso)}
                minW="38px"
                p={1}
                borderRadius="10px"
                textAlign="center"
                bg={selected ? tint : 'transparent'}
                outline={selected ? `2px solid ${accent}` : '1px solid transparent'}
                outlineOffset="1px"
                transition="background .16s ease, transform .16s ease, outline-color .16s ease"
                _hover={{ bg: tint, transform: 'translateY(-2px)' }}
                _focusVisible={{ outline: `2px solid ${accent}`, outlineOffset: '2px' }}
              >
                <Text fontFamily="var(--pb-mono)" fontSize="8px" letterSpacing=".04em" textTransform="uppercase" color="var(--pb-ink-faint)">
                  {day.date.toLocaleDateString('en-GB', { weekday: 'narrow' })}
                </Text>
                <Text mt="1px" fontFamily="var(--pb-mono)" fontSize="10px" color={active ? 'var(--pb-ink)' : 'var(--pb-ink-faint)'}>
                  {day.date.getDate()}
                </Text>
                <Box mt={1.5} h={{ base: '29px', md: '34px' }} border="1px solid var(--pb-hair)" borderRadius="7px" bg={fillFor(amount)} boxShadow={active ? 'inset 0 1px 0 rgba(255,255,255,.16)' : 'none'} />
              </Box>
            )
          })}
        </Box>
      </Box>

      <Flex mt={4} pt={3} borderTop="1px solid var(--pb-hair)" align="center" gap={2} flexWrap="wrap">
        <Text fontFamily="var(--pb-mono)" fontSize="9px" letterSpacing=".06em" textTransform="uppercase" color="var(--pb-ink-faint)">Lower</Text>
        {[0.24, 0.42, 0.62, 0.9].map((intensity) => (
          <Box
            key={intensity}
            w="10px"
            h="10px"
            borderRadius="3px"
            bg={isIncome
              ? dark ? `rgba(98, 220, 162, ${intensity})` : `rgba(31, 138, 79, ${intensity})`
              : dark ? `rgba(255, 154, 144, ${intensity})` : `rgba(184, 69, 47, ${intensity})`}
          />
        ))}
        <Text fontFamily="var(--pb-mono)" fontSize="9px" letterSpacing=".06em" textTransform="uppercase" color="var(--pb-ink-faint)">Higher</Text>
        <Text ml={{ base: 0, sm: 'auto' }} fontFamily="var(--pb-mono)" fontSize="9px" letterSpacing=".05em" textTransform="uppercase" color="var(--pb-ink-faint)">
          Select a day for details
        </Text>
      </Flex>
    </Box>
  )
}
