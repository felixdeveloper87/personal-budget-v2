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
  /** Credit-card id → name. Charges to these cards fold into one fatura row. */
  cardNames?: Map<number, string>
  onPageChange?: (page: AppPage) => void
  limit?: number
}

interface UpcomingItem {
  key: string
  date: Date
  total: number
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
  cardNames,
  onPageChange,
  limit = 6,
}: UpcomingPaymentsProps) {
  const { items, total } = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    const future = transactions.filter(
      (t) => t.type === 'EXPENSE' && settlementDate(t) >= now,
    )

    // Only fold actual credit-card charges into a statement; everything else
    // (loan installments, rent, …) stays its own line — even when it shares a
    // due date with a card. Charges of one card on one due date = one fatura.
    const list: UpcomingItem[] = []
    const byStatement = new Map<string, Transaction[]>()

    for (const t of future) {
      const isCardCharge =
        t.paymentMethodId != null && !!cardNames?.has(t.paymentMethodId)
      if (isCardCharge) {
        const k = `${t.paymentMethodId}|${isoOf(settlementDate(t))}`
        const bucket = byStatement.get(k)
        if (bucket) bucket.push(t)
        else byStatement.set(k, [t])
      } else {
        list.push({
          key: t.id != null ? `tx-${t.id}` : `tx-${isoOf(settlementDate(t))}-${t.description}`,
          date: settlementDate(t),
          total: t.amount,
          title: t.description || t.category,
          subtitle: t.category,
        })
      }
    }

    for (const [k, txs] of byStatement) {
      const cardId = Number(k.split('|')[0])
      list.push({
        key: `stmt-${k}`,
        date: settlementDate(txs[0]),
        total: txs.reduce((s, t) => s + t.amount, 0),
        title: cardNames?.get(cardId) ?? 'Credit card',
        subtitle: 'Credit card statement',
      })
    }

    // Nearest due first; bigger amount breaks ties on the same day.
    list.sort((a, b) => a.date.getTime() - b.date.getTime() || b.total - a.total)

    const sum = future.reduce((s, t) => s + t.amount, 0)
    return { items: list.slice(0, limit), total: sum }
  }, [transactions, cardNames, limit])

  const clickable = !!onPageChange

  return (
    <Panel
      h="full"
      interactive={clickable}
      onClick={clickable ? () => onPageChange?.('payments') : undefined}
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
          {items.length === 0 ? (
            <HStack spacing={3} py={4} color="var(--pb-ink-faint)">
              <CalendarClock size={16} />
              <Text fontFamily="var(--pb-serif)" fontSize="sm">
                Nothing scheduled ahead.
              </Text>
            </HStack>
          ) : (
            items.map((item) => (
              <HStack key={item.key} justify="space-between" py={3} spacing={3}>
                <HStack spacing={3} minW={0}>
                  <Box
                    w={9}
                    flexShrink={0}
                    textAlign="center"
                    borderRight="1px solid var(--pb-hair)"
                    pr={2}
                  >
                    <Text fontFamily="var(--pb-mono)" fontSize="9px" letterSpacing="0.1em" color="var(--pb-ink-faint)" textTransform="uppercase">
                      {item.date.toLocaleDateString('en-GB', { month: 'short' })}
                    </Text>
                    <Text fontFamily="var(--pb-serif)" fontSize="md" fontWeight={500} color="var(--pb-ink)" lineHeight={1}>
                      {item.date.getDate()}
                    </Text>
                  </Box>
                  <VStack align="stretch" spacing={0} minW={0}>
                    <Text fontFamily="var(--pb-serif)" fontSize="sm" color="var(--pb-ink)" noOfLines={1}>
                      {item.title}
                    </Text>
                    <Text fontFamily="var(--pb-mono)" fontSize="10px" color="var(--pb-ink-faint)" letterSpacing="0.06em" noOfLines={1}>
                      {item.subtitle}
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
                  {fmtCurrency(item.total, { minimumFractionDigits: 2 })}
                </Text>
              </HStack>
            ))
          )}
        </VStack>
      </VStack>
    </Panel>
  )
}
