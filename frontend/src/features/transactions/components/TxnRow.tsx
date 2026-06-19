import { Box, Grid, GridItem, HStack, Icon, Text } from '@chakra-ui/react'
import type { TxnVM, TxView } from '../transactions.types'
import { fmtShort } from '../transactions.utils'
import { fmtCurrency } from '../../dashboard/components/format'
import CategoryIcon, { Clock } from './CategoryIcon'

interface TxnRowProps {
  txn: TxnVM
  view: TxView
  onOpen: (txn: TxnVM) => void
}

export default function TxnRow({ txn, view, onOpen }: TxnRowProps) {
  const isIn = txn.type === 'in'
  const amountColor = isIn ? 'var(--pb-income-2)' : 'var(--pb-coral)'
  const sign = isIn ? '+' : '−'

  const settle = (() => {
    if (txn.deferred) {
      const label =
        view === 'behaviour' ? `Pays ${fmtShort(txn.settlementDate)}` : `Bought ${fmtShort(txn.purchaseDate)}`
      return { label, gold: true }
    }
    return { label: 'Settled', gold: false }
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
          {txn.merchant}
        </Text>
        <Text
          fontFamily="var(--pb-mono)"
          fontSize="10.5px"
          color="var(--pb-ink-faint)"
          noOfLines={1}
        >
          {txn.category} · {fmtShort(txn.purchaseDate)} · {txn.account}
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
          {fmtCurrency(txn.amount, { minimumFractionDigits: 2 })}
        </Text>
        <HStack
          spacing="3px"
          justify="flex-end"
          mt="2px"
          color={settle.gold ? 'var(--pb-gold)' : 'var(--pb-ink-faint)'}
        >
          {settle.gold && <Icon as={Clock} boxSize="11px" />}
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
