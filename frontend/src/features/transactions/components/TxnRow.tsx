import { Box, Grid, GridItem, HStack, Icon, Text } from '@chakra-ui/react'
import type { TxnVM, TxView } from '../transactions.types'
import { fmtShort } from '../transactions.utils'
import CategoryIcon, { Clock } from './CategoryIcon'
import { Check, CreditCard, ChevronRight } from '../../../components/ui/icons'
import { useI18n } from '../../../i18n'

interface TxnRowProps {
  txn: TxnVM
  view: TxView
  onOpen: (txn: TxnVM) => void
}

export default function TxnRow({ txn, view, onOpen }: TxnRowProps) {
  const { t, locale, formatCurrency, categoryLabel } = useI18n()
  const isIn = txn.type === 'in'
  const amountColor = isIn ? 'var(--pb-income-2)' : 'var(--pb-coral)'
  const sign = isIn ? '+' : '−'

  if (txn.statement) return <StatementRow txn={txn} onOpen={onOpen} />

  const settle = (() => {
    if (txn.deferred) {
      const label =
        view === 'behaviour'
          ? t('transactions.paysDate', { date: fmtShort(txn.settlementDate, locale) })
          : t('transactions.boughtDate', { date: fmtShort(txn.purchaseDate, locale) })
      return { label, gold: true }
    }
    return { label: t('transactions.settled'), gold: false }
  })()

  return (
    <Grid
      as="button"
      type="button"
      onClick={() => onOpen(txn)}
      templateColumns="40px 1fr auto"
      gap=".8rem"
      alignItems="center"
      w="full"
      textAlign="left"
      py=".7rem"
      px=".25rem"
      borderRadius="12px"
      bg="transparent"
      border="none"
      cursor="pointer"
      transition="background 0.15s ease"
      _hover={{ bg: 'var(--pb-surface-2)' }}
      _focusVisible={{ boxShadow: '0 0 0 2px var(--pb-forest)', outline: 'none' }}
    >
      {/* Icon */}
      <GridItem position="relative">
        <Box
          w="40px"
          h="40px"
          borderRadius="11px"
          display="grid"
          placeItems="center"
          bg={isIn ? 'var(--pb-tint-income)' : 'var(--pb-tint-coral)'}
          color={isIn ? 'var(--pb-income-2)' : 'var(--pb-coral)'}
          border="1px solid var(--pb-hair)"
        >
          <CategoryIcon iconKey={txn.iconKey} boxSize="19px" />
        </Box>
        {txn.deferred && (
          <Box
            position="absolute"
            top="-2px"
            right="-2px"
            w="6px"
            h="6px"
            borderRadius="999px"
            bg="var(--pb-gold-2)"
            border="1px solid var(--pb-surface)"
          />
        )}
      </GridItem>

      {/* Body */}
      <GridItem minW={0}>
        <Text
          fontFamily="var(--pb-serif)"
          fontSize="1.05rem"
          fontWeight={500}
          color="var(--pb-ink)"
          noOfLines={1}
        >
          {txn.merchant === txn.category ? categoryLabel(txn.merchant) : txn.merchant}
        </Text>
        <Text
          fontFamily="var(--pb-mono)"
          fontSize="10.5px"
          color="var(--pb-ink-faint)"
          noOfLines={1}
        >
          {categoryLabel(txn.category)} · {fmtShort(txn.purchaseDate, locale)} · {txn.account === 'Unassigned' ? t('transactions.unassigned') : txn.account}
        </Text>
      </GridItem>

      {/* Amount + settle chip */}
      <GridItem textAlign="right">
        <Text
          fontFamily="var(--pb-serif)"
          fontSize="1.12rem"
          fontWeight={500}
          color={amountColor}
          style={{ fontVariantNumeric: 'tabular-nums' }}
          whiteSpace="nowrap"
        >
          {sign}
          {formatCurrency(txn.amount, { minimumFractionDigits: 2 })}
        </Text>
        <HStack
          spacing="3px"
          justify="flex-end"
          mt="2px"
          color={settle.gold ? 'var(--pb-gold)' : 'var(--pb-ink-faint)'}
        >
          <Icon as={settle.gold ? Clock : Check} boxSize="11px" />
          <Text
            fontFamily="var(--pb-mono)"
            fontSize="9.5px"
            letterSpacing="0.06em"
            textTransform="uppercase"
            whiteSpace="nowrap"
          >
            {settle.label}
          </Text>
        </HStack>
      </GridItem>
    </Grid>
  )
}

/**
 * A folded credit-card statement (fatura) line on the Payments page: the card's
 * charges due that day shown as one invoice total. The per-charge detail lives
 * on the Cards page, so the row reads as a link there rather than a drawer.
 */
function StatementRow({ txn, onOpen }: { txn: TxnVM; onOpen: (txn: TxnVM) => void }) {
  const { t, locale, formatCurrency } = useI18n()
  const count = txn.statement?.count ?? 0
  return (
    <Grid
      as="button"
      type="button"
      onClick={() => onOpen(txn)}
      templateColumns="40px 1fr auto"
      gap=".8rem"
      alignItems="center"
      w="full"
      textAlign="left"
      py=".7rem"
      px=".25rem"
      borderRadius="12px"
      bg="transparent"
      border="none"
      cursor="pointer"
      transition="background 0.15s ease"
      _hover={{ bg: 'var(--pb-surface-2)' }}
      _focusVisible={{ boxShadow: '0 0 0 2px var(--pb-forest)', outline: 'none' }}
    >
      <GridItem>
        <Box
          w="40px"
          h="40px"
          borderRadius="11px"
          display="grid"
          placeItems="center"
          bg="var(--pb-tint-coral)"
          color="var(--pb-coral)"
          border="1px solid var(--pb-hair)"
        >
          <Icon as={CreditCard} boxSize="19px" />
        </Box>
      </GridItem>

      <GridItem minW={0}>
        <Text
          fontFamily="var(--pb-serif)"
          fontSize="1.05rem"
          fontWeight={500}
          color="var(--pb-ink)"
          noOfLines={1}
        >
          {t('transactions.cardStatementTitle', { name: txn.merchant })}
        </Text>
        <Text
          fontFamily="var(--pb-mono)"
          fontSize="10.5px"
          color="var(--pb-ink-faint)"
          noOfLines={1}
        >
          {t(count === 1 ? 'transactions.cardChargesDue' : 'transactions.cardChargesDuePlural', {
            count,
            date: fmtShort(txn.settlementDate, locale),
          })}
        </Text>
      </GridItem>

      <GridItem textAlign="right">
        <Text
          fontFamily="var(--pb-serif)"
          fontSize="1.12rem"
          fontWeight={500}
          color="var(--pb-coral)"
          style={{ fontVariantNumeric: 'tabular-nums' }}
          whiteSpace="nowrap"
        >
          −{formatCurrency(txn.amount, { minimumFractionDigits: 2 })}
        </Text>
        <HStack spacing="2px" justify="flex-end" mt="2px" color="var(--pb-forest-2)">
          <Text
            fontFamily="var(--pb-mono)"
            fontSize="9.5px"
            letterSpacing="0.06em"
            textTransform="uppercase"
            whiteSpace="nowrap"
          >
            {t('transactions.viewOnCards')}
          </Text>
          <Icon as={ChevronRight} boxSize="11px" />
        </HStack>
      </GridItem>
    </Grid>
  )
}
