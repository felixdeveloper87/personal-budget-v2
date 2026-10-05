import { Box, Flex, Text } from '@chakra-ui/react'
import type { PeriodType, Transaction } from '../../../types'
import { useI18n } from '../../../i18n'

interface BalanceBreakEvenPanelProps {
  currentBalance: number
  selectedDate?: Date
  periodType?: PeriodType
  transactions?: Transaction[]
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function getPeriodRange(date: Date, periodType: PeriodType): { start: Date; end: Date } {
  switch (periodType) {
    case 'day':
      return { start: startOfDay(date), end: startOfDay(date) }
    case 'week': {
      const start = startOfDay(date)
      const day = start.getDay()
      start.setDate(start.getDate() + (day === 0 ? -6 : 1 - day))
      const end = new Date(start)
      end.setDate(start.getDate() + 6)
      return { start, end }
    }
    case 'year':
      return {
        start: new Date(date.getFullYear(), 0, 1),
        end: new Date(date.getFullYear(), 11, 31),
      }
    case 'month':
    default:
      return {
        start: new Date(date.getFullYear(), date.getMonth(), 1),
        end: new Date(date.getFullYear(), date.getMonth() + 1, 0),
      }
  }
}

function getEarningDays(date: Date, periodType: PeriodType): number {
  const today = startOfDay(new Date())
  const { start, end } = getPeriodRange(date, periodType)
  if (end < today) return 0

  const cursor = start > today ? startOfDay(start) : today
  let earningDays = 0
  while (cursor <= end) {
    if (cursor.getDay() !== 2) earningDays += 1
    cursor.setDate(cursor.getDate() + 1)
  }
  return earningDays
}

export default function BalanceBreakEvenPanel({
  currentBalance,
  selectedDate = new Date(),
  periodType = 'month',
}: BalanceBreakEvenPanelProps) {
  const { t, formatCurrency } = useI18n()
  const earningDays = getEarningDays(selectedDate, periodType)
  const gapToZero = Math.max(0, -currentBalance)
  const dailyTarget = earningDays > 0 ? gapToZero / earningDays : gapToZero
  const inRed = gapToZero > 0
  const bg = inRed
    ? 'linear-gradient(135deg, var(--nu-brand) 0%, var(--nu-brand-deep) 100%)'
    : 'linear-gradient(135deg, #1e8a5a 0%, #166b46 100%)'

  return (
    <Box position="relative" overflow="hidden" borderRadius="24px" p={{ base: 5, md: 6 }} color="white" bg={bg}>
      <Box aria-hidden position="absolute" top="-60px" right="-50px" w="200px" h="200px" borderRadius="full" border="28px solid rgba(255,255,255,.08)" />
      <Box aria-hidden position="absolute" bottom="-80px" right="60px" w="160px" h="160px" borderRadius="full" border="20px solid rgba(255,255,255,.06)" />
      <Box position="relative">
        <Text display="inline-block" px={3} py="3px" borderRadius="full" bg="rgba(255,255,255,.18)" fontSize="12px" fontWeight={600}>
          {t('charts.breakEven.target')}
        </Text>
        {inRed ? (
          <>
            <Flex mt={4} align="baseline" gap={2} wrap="wrap">
              <Text fontSize={{ base: '2.4rem', md: '3rem' }} fontWeight={700} letterSpacing="-0.03em" lineHeight={1} style={{ fontVariantNumeric: 'tabular-nums' }}>
                {formatCurrency(earningDays > 0 ? dailyTarget : gapToZero)}
              </Text>
              {earningDays > 0 && <Text fontSize="md" opacity={0.85}>{t('charts.breakEven.perDayShort')}</Text>}
            </Flex>
            <Text mt={2} fontSize="sm" opacity={0.85}>
              {t('charts.breakEven.headline', { amount: formatCurrency(gapToZero) })}
            </Text>
          </>
        ) : (
          <>
            <Text mt={4} fontSize={{ base: '1.8rem', md: '2.2rem' }} fontWeight={700} letterSpacing="-0.02em" lineHeight={1.1}>
              {t('charts.breakEven.reached')}
            </Text>
            <Text mt={2} fontSize="sm" opacity={0.85}>{t('charts.breakEven.reachedCaption')}</Text>
          </>
        )}
        <Flex mt={5} pt={4} borderTop="1px solid rgba(255,255,255,.2)" justify="space-between" align="center" gap={4}>
          <Text fontSize="sm" opacity={0.8}>{t('charts.breakEven.currentBalance')}</Text>
          <Text fontSize="md" fontWeight={700} style={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatCurrency(currentBalance)}
          </Text>
        </Flex>
      </Box>
    </Box>
  )
}
