import { useMemo } from 'react'
import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import { CalendarClock } from 'lucide-react'
import type { Transaction } from '../../../types'
import type { AppPage } from '../../../components/layout/header/navigation.config'
import { getTransactionDate } from '../../../utils/transactionDates'
import Panel from './Panel'
import { fmtCurrency } from './format'

interface UpcomingPaymentsProps {
  transactions: Transaction[]
  onPageChange?: (page: AppPage) => void
  limit?: number
}

interface UpcomingGroup {
  key: string
  date: Date
  total: number
  count: number
  title: string
  subtitle: string
}

/** Cash-flow (settlement) date — the day money actually leaves the account. */
function settlementDate(t: Transaction): Date {
  return getTransactionDate(t, 'cash-flow')
}

function isoOf(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`
}

export default function UpcomingPayments({
  transactions,
  onPageChange,
  limit = 6,
}: UpcomingPaymentsProps) {
  const { groups, total } = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    const future = transactions.filter(
      (t) => t.type === 'EXPENSE' && settlementDate(t) >= now,
    )

    // Bucket by settlement date so a credit-card statement (whose charges all
    // share one due date) collapses into a single invoice line — mirroring the
    // Payments page, which shows the whole fatura instead of each charge.
    const byDate = new Map<string, Transaction[]>()
    for (const t of future) {
      const iso = isoOf(settlementDate(t))
      const bucket = byDate.get(iso)
      if (bucket) bucket.push(t)
      else byDate.set(iso, [t])
    }

    const grouped: UpcomingGroup[] = [...byDate.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([iso, txs]) => {
        const groupTotal = txs.reduce((s, t) => s + t.amount, 0)
        let title: string
        let subtitle: string
        if (txs.length === 1) {
          title = txs[0].description || txs[0].category
          subtitle = txs[0].category
        } else {
          const cards = new Set(
            txs.map((t) => t.paymentMethodName).filter((n): n is string => !!n),
          )
          if (cards.size === 1) {
            // One payment method due on one date → a single statement/invoice.
            title = [...cards][0]
            subtitle = `${txs.length} transactions`
          } else {
            const catTotals = new Map<string, number>()
            for (const t of txs) {
              catTotals.set(t.category, (catTotals.get(t.category) ?? 0) + t.amount)
            }
            title = [...catTotals.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Payments'
            subtitle = `${txs.length} payments`
          }
        }
        return {
          key: iso,
          date: settlementDate(txs[0]),
          total: groupTotal,
          count: txs.length,
          title,
          subtitle,
        }
      })

    const sum = future.reduce((s, t) => s + t.amount, 0)
    return { groups: grouped.slice(0, limit), total: sum }
  }, [transactions, limit])

  const clickable = !!onPageChange

  return (
    <Panel
      h="full"
      interactive={clickable}
      onClick={clickable ? () => onPageChange?.('all-transactions') : undefined}
    >
      <VStack align="stretch" spacing={4}>
        <HStack justify="space-between">
          <Text
            fontFamily="var(--pb-mono)"
            fontSize="10.5px"
            letterSpacing="0.2em"
            textTransform="uppercase"
            color="var(--pb-ink-faint)"
          >
            Upcoming payments
          </Text>
          {total > 0 && (
            <Text
              fontFamily="var(--pb-mono)"
              fontSize="11px"
              color="var(--pb-ink-soft)"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {fmtCurrency(total, { minimumFractionDigits: 2 })}
            </Text>
          )}
        </HStack>

        <VStack align="stretch" spacing={0} divider={<Box borderBottom="1px solid var(--pb-hair)" />}>
          {groups.length === 0 ? (
            <HStack spacing={3} py={4} color="var(--pb-ink-faint)">
              <CalendarClock size={16} />
              <Text fontFamily="var(--pb-serif)" fontSize="sm">
                Nothing scheduled ahead.
              </Text>
            </HStack>
          ) : (
            groups.map((g) => (
              <HStack key={g.key} justify="space-between" py={3} spacing={3}>
                <HStack spacing={3} minW={0}>
                  <Box
                    w={9}
                    flexShrink={0}
                    textAlign="center"
                    borderRight="1px solid var(--pb-hair)"
                    pr={2}
                  >
                    <Text fontFamily="var(--pb-mono)" fontSize="9px" letterSpacing="0.1em" color="var(--pb-ink-faint)" textTransform="uppercase">
                      {g.date.toLocaleDateString('en-GB', { month: 'short' })}
                    </Text>
                    <Text fontFamily="var(--pb-serif)" fontSize="md" fontWeight={500} color="var(--pb-ink)" lineHeight={1}>
                      {g.date.getDate()}
                    </Text>
                  </Box>
                  <VStack align="stretch" spacing={0} minW={0}>
                    <Text fontFamily="var(--pb-serif)" fontSize="sm" color="var(--pb-ink)" noOfLines={1}>
                      {g.title}
                    </Text>
                    <Text fontFamily="var(--pb-mono)" fontSize="10px" color="var(--pb-ink-faint)" letterSpacing="0.06em" noOfLines={1}>
                      {g.subtitle}
                    </Text>
                  </VStack>
                </HStack>
                <Text
                  fontFamily="var(--pb-mono)"
                  fontSize="13px"
                  fontWeight={500}
                  color="var(--pb-coral)"
                  flexShrink={0}
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {fmtCurrency(g.total, { minimumFractionDigits: 2 })}
                </Text>
              </HStack>
            ))
          )}
        </VStack>
      </VStack>
    </Panel>
  )
}
