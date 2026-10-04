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
  const balanceColor = currentBalance < 0 ? 'var(--pb-coral)' : 'var(--pb-income)'

  return (
    <Box borderTop="1px solid var(--pb-hair)" borderBottom="1px solid var(--pb-hair)">
      <BreakEvenRow
        label={t('charts.breakEven.currentBalance')}
        value={formatCurrency(currentBalance)}
        valueColor={balanceColor}
      />
      <BreakEvenRow
        label={t('charts.breakEven.target')}
        value={formatCurrency(gapToZero)}
        valueColor={gapToZero > 0 ? 'var(--nu-brand, #820ad1)' : 'var(--pb-income)'}
        detail={gapToZero > 0 && earningDays > 0
          ? `${formatCurrency(dailyTarget)} ${t('charts.breakEven.perDayShort')}`
          : undefined}
      />
    </Box>
  )
}

function BreakEvenRow({
  label,
  value,
  valueColor,
  detail,
}: {
  label: string
  value: string
  valueColor: string
  detail?: string
}) {
  return (
    <Flex
      minH="52px"
      py={3}
      align="center"
      justify="space-between"
      gap={4}
      borderBottom="1px solid var(--pb-hair)"
      _last={{ borderBottom: 0 }}
    >
      <Text fontSize="sm" color="var(--pb-ink-soft)">{label}</Text>
      <Flex align="baseline" justify="flex-end" gap={2} minW={0} textAlign="right">
        <Text fontSize="md" fontWeight={700} color={valueColor} style={{ fontVariantNumeric: 'tabular-nums' }}>
          {value}
        </Text>
        {detail && (
          <Text fontSize="10px" color="var(--pb-ink-soft)" whiteSpace="nowrap">
            {detail}
          </Text>
        )}
      </Flex>
    </Flex>
  )
}
