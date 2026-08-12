import { Box, Grid, Text } from '@chakra-ui/react'
import type { TxnVM } from '../transactions.types'
import { daysBetween, fmtShort } from '../transactions.utils'
import { useI18n } from '../../../i18n'

function Node({
  label,
  date,
  color,
  align,
}: {
  label: string
  date: string
  color: string
  align: 'start' | 'end'
}) {
  const just = align === 'start' ? 'flex-start' : 'flex-end'
  return (
    <>
      <Text
        gridColumn={align === 'start' ? 1 : 3}
        gridRow={1}
        justifySelf={just}
        fontFamily="var(--pb-mono)"
        fontSize="9px"
        letterSpacing="0.18em"
        textTransform="uppercase"
        color="var(--pb-ink-faint)"
      >
        {label}
      </Text>
      <Box
        gridColumn={align === 'start' ? 1 : 3}
        gridRow={2}
        justifySelf={just}
        w="14px"
        h="14px"
        borderRadius="999px"
        bg={color}
        boxShadow={`0 0 0 1.5px ${color}`}
      />
      <Text
        gridColumn={align === 'start' ? 1 : 3}
        gridRow={3}
        justifySelf={just}
        fontFamily="var(--pb-serif)"
        fontSize=".98rem"
        fontWeight={500}
        color="var(--pb-ink)"
      >
        {date}
      </Text>
    </>
  )
}

export default function SettlementTimeline({ txn }: { txn: TxnVM }) {
  const { t, locale } = useI18n()
  const days = daysBetween(txn.purchaseDate, txn.settlementDate)
  const rightColor = txn.deferred ? 'var(--pb-gold)' : 'var(--pb-forest-2)'
  const rightLabel = t(txn.type === 'in' ? 'transactions.received' : 'transactions.pays')
  const gapLabel = txn.deferred
    ? t(days === 1 ? 'transactions.days' : 'transactions.daysPlural', { count: days })
    : t('transactions.sameDay')

  return (
    <Grid
      templateColumns="auto 1fr auto"
      templateRows="auto auto auto"
      columnGap=".9rem"
      rowGap=".4rem"
      alignItems="center"
      py=".4rem"
    >
      <Node label={t('transactions.bought')} date={fmtShort(txn.purchaseDate, locale)} color="var(--pb-forest-2)" align="start" />

      {/* Gap label */}
      <Text
        gridColumn={2}
        gridRow={1}
        justifySelf="center"
        alignSelf="flex-end"
        fontFamily="var(--pb-mono)"
        fontSize="9.5px"
        letterSpacing="0.08em"
        textTransform="uppercase"
        color={txn.deferred ? 'var(--pb-gold)' : 'var(--pb-ink-faint)'}
      >
        {gapLabel}
      </Text>

      {/* Connecting line */}
      <Box
        gridColumn={2}
        gridRow={2}
        alignSelf="center"
        w="full"
        h="0"
        borderTop={txn.deferred ? '1.5px dashed var(--pb-gold)' : '1.5px solid var(--pb-forest-2)'}
        opacity={txn.deferred ? 0.8 : 0.4}
      />

      <Node label={rightLabel} date={fmtShort(txn.settlementDate, locale)} color={rightColor} align="end" />
    </Grid>
  )
}
