import { useMemo } from 'react'
import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import { CalendarClock } from 'lucide-react'
import type { Transaction } from '../../../types'
import type { AppPage } from '../../../components/layout/header/navigation.config'
import Panel from './Panel'
import { fmtCurrency } from './format'

interface UpcomingPaymentsProps {
  transactions: Transaction[]
  onPageChange?: (page: AppPage) => void
  limit?: number
}

function paymentDateOf(t: Transaction): Date {
  const src = t.paymentDate ?? t.dateTime
  return src.length === 10 ? new Date(`${src}T00:00:00`) : new Date(src)
}

export default function UpcomingPayments({
  transactions,
  onPageChange,
  limit = 6,
}: UpcomingPaymentsProps) {
  const { items, total } = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const future = transactions
      .filter((t) => t.type === 'EXPENSE' && paymentDateOf(t) >= now)
      .sort((a, b) => paymentDateOf(a).getTime() - paymentDateOf(b).getTime())
    const sum = future.reduce((s, t) => s + t.amount, 0)
    return { items: future.slice(0, limit), total: sum }
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
              {fmtCurrency(total)}
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
            items.map((t) => {
              const d = paymentDateOf(t)
              return (
                <HStack key={t.id ?? `${t.description}-${t.paymentDate}`} justify="space-between" py={3} spacing={3}>
                  <HStack spacing={3} minW={0}>
                    <Box
                      w={9}
                      flexShrink={0}
                      textAlign="center"
                      borderRight="1px solid var(--pb-hair)"
                      pr={2}
                    >
                      <Text fontFamily="var(--pb-mono)" fontSize="9px" letterSpacing="0.1em" color="var(--pb-ink-faint)" textTransform="uppercase">
                        {d.toLocaleDateString('en-GB', { month: 'short' })}
                      </Text>
                      <Text fontFamily="var(--pb-serif)" fontSize="md" fontWeight={500} color="var(--pb-ink)" lineHeight={1}>
                        {d.getDate()}
                      </Text>
                    </Box>
                    <VStack align="stretch" spacing={0} minW={0}>
                      <Text fontFamily="var(--pb-serif)" fontSize="sm" color="var(--pb-ink)" noOfLines={1}>
                        {t.description || t.category}
                      </Text>
                      <Text fontFamily="var(--pb-mono)" fontSize="10px" color="var(--pb-ink-faint)" letterSpacing="0.06em" noOfLines={1}>
                        {t.category}
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
                    {fmtCurrency(t.amount)}
                  </Text>
                </HStack>
              )
            })
          )}
        </VStack>
      </VStack>
    </Panel>
  )
}
