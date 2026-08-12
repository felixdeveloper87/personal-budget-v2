import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Box, Flex, HStack, Icon, IconButton, Text, VStack } from '@chakra-ui/react'
import { X, Clock, AlertCircle } from '../../../components/ui/icons'
import type { TxnVM } from '../transactions.types'
import { daysBetween, fmtLong } from '../transactions.utils'
import CategoryIcon from './CategoryIcon'
import SettlementTimeline from './SettlementTimeline'
import { useI18n } from '../../../i18n'

interface TransactionDrawerProps {
  txn: TxnVM | null
  onClose: () => void
}

function DetailRow({ k, v }: { k: string; v: string }) {
  return (
    <Flex justify="space-between" align="baseline" gap="1rem" py=".65rem" borderBottom="1px solid var(--pb-hair)">
      <Text
        fontFamily="var(--pb-mono)"
        fontSize="10.5px"
        letterSpacing="0.06em"
        textTransform="uppercase"
        color="var(--pb-ink-faint)"
        flexShrink={0}
      >
        {k}
      </Text>
      <Text fontFamily="var(--pb-serif)" fontSize=".98rem" color="var(--pb-ink)" textAlign="right">
        {v}
      </Text>
    </Flex>
  )
}

export default function TransactionDrawer({ txn, onClose }: TransactionDrawerProps) {
  const { t: translate, locale, formatCurrency, categoryLabel } = useI18n()
  const open = txn != null
  const [displayTxn, setDisplayTxn] = useState<TxnVM | null>(txn)
  const closeRef = useRef<HTMLButtonElement>(null)
  const lastFocused = useRef<Element | null>(null)

  // Keep the last transaction mounted while the close transition plays out.
  useEffect(() => {
    if (txn) setDisplayTxn(txn)
    else {
      const id = window.setTimeout(() => setDisplayTxn(null), 320)
      return () => window.clearTimeout(id)
    }
  }, [txn])

  // Escape to close + focus management.
  useEffect(() => {
    if (!open) return
    lastFocused.current = document.activeElement
    const t = window.setTimeout(() => closeRef.current?.focus(), 40)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(t)
      document.removeEventListener('keydown', onKey)
      if (lastFocused.current instanceof HTMLElement) lastFocused.current.focus()
    }
  }, [open, onClose])

  if (!displayTxn) return null

  const t = displayTxn
  const isIn = t.type === 'in'
  const days = daysBetween(t.purchaseDate, t.settlementDate)

  return createPortal(
    <Box
      position="fixed"
      inset={0}
      zIndex={1400}
      aria-hidden={!open}
      pointerEvents={open ? 'auto' : 'none'}
    >
      {/* Backdrop */}
      <Box
        position="absolute"
        inset={0}
        bg="rgba(23,37,28,.34)"
        backdropFilter="blur(2px)"
        opacity={open ? 1 : 0}
        transition="opacity 0.32s cubic-bezier(.2,.7,.2,1)"
        onClick={onClose}
      />

      {/* Panel */}
      <Box
        role="dialog"
        aria-modal={open ? 'true' : undefined}
        aria-label={translate('transactions.detailAria', { merchant: t.merchant })}
        position="absolute"
        bg="var(--pb-surface)"
        boxShadow="var(--pb-shadow-lift)"
        overflowY="auto"
        // Mobile: bottom sheet. ≥560px: right side panel.
        left={{ base: 0, sm: 'auto' }}
        right={0}
        bottom={0}
        top={{ base: 'auto', sm: 0 }}
        w={{ base: '100%', sm: 'min(440px, 92vw)' }}
        maxH={{ base: '88vh', sm: '100%' }}
        borderTopRadius={{ base: '22px', sm: 0 }}
        transform={{
          base: open ? 'translateY(0)' : 'translateY(101%)',
          sm: open ? 'translateX(0)' : 'translateX(101%)',
        }}
        transition="transform 0.32s cubic-bezier(.2,.7,.2,1)"
      >
        {/* Mobile handle */}
        <Flex justify="center" pt="0.6rem" display={{ base: 'flex', sm: 'none' }}>
          <Box w="40px" h="4px" borderRadius="999px" bg="var(--pb-hair-2)" />
        </Flex>

        {/* Header */}
        <Flex
          align="flex-start"
          gap=".75rem"
          px="clamp(1.1rem,4vw,1.5rem)"
          py="1.1rem"
          borderBottom="1px solid var(--pb-hair)"
        >
          <Box
            w="44px"
            h="44px"
            borderRadius="12px"
            display="grid"
            placeItems="center"
            bg={isIn ? 'var(--pb-tint-income)' : 'var(--pb-tint-coral)'}
            color={isIn ? 'var(--pb-income-2)' : 'var(--pb-coral)'}
            border="1px solid var(--pb-hair)"
            flexShrink={0}
          >
            <CategoryIcon iconKey={t.iconKey} boxSize="21px" />
          </Box>
          <Box flex={1} minW={0}>
            <Text fontFamily="var(--pb-serif)" fontSize="1.2rem" fontWeight={500} color="var(--pb-ink)" noOfLines={2}>
              {t.merchant}
            </Text>
            <Text fontFamily="var(--pb-mono)" fontSize="10.5px" color="var(--pb-ink-faint)" textTransform="uppercase" letterSpacing="0.06em">
              {categoryLabel(t.category)}
            </Text>
          </Box>
          <VStack spacing="0.4rem" align="flex-end">
            <IconButton
              ref={closeRef}
              aria-label={translate('transactions.closeDetail')}
              icon={<Icon as={X} boxSize="18px" />}
              size="sm"
              variant="ghost"
              borderRadius="999px"
              color="var(--pb-ink-soft)"
              _hover={{ bg: 'var(--pb-surface-2)' }}
              onClick={onClose}
            />
            <Text
              fontFamily="var(--pb-serif)"
              fontSize="1.5rem"
              fontWeight={500}
              color={isIn ? 'var(--pb-income-2)' : 'var(--pb-coral)'}
              style={{ fontVariantNumeric: 'tabular-nums' }}
              whiteSpace="nowrap"
            >
              {isIn ? '+' : '−'}
              {formatCurrency(t.amount, { minimumFractionDigits: 2 })}
            </Text>
          </VStack>
        </Flex>

        {/* Body */}
        <Box px="clamp(1.1rem,4vw,1.5rem)" py="1.1rem">
          {/* Two-clocks timeline */}
          <SettlementTimeline txn={t} />

          {/* Detail rows */}
          <Box mt="1.1rem" borderTop="1px solid var(--pb-hair)">
            <DetailRow k={translate('transactions.category')} v={categoryLabel(t.category)} />
            <DetailRow k={translate('transactions.account')} v={t.account === 'Unassigned' ? translate('transactions.unassigned') : t.account} />
            <DetailRow k={translate('transactions.boughtOn')} v={fmtLong(t.purchaseDate, locale)} />
            <DetailRow k={translate(isIn ? 'transactions.creditedOn' : 'transactions.debitsOn')} v={fmtLong(t.settlementDate, locale)} />
            <DetailRow k={translate('transactions.type')} v={translate(t.deferred ? 'transactions.deferredCard' : 'transactions.immediate')} />
          </Box>

          {/* Contextual note */}
          <HStack
            align="flex-start"
            spacing=".6rem"
            mt="1.1rem"
            px=".85rem"
            py=".75rem"
            borderRadius="14px"
            bg={t.deferred ? 'var(--pb-tint-gold)' : 'var(--pb-tint-green)'}
            color="var(--pb-ink-soft)"
          >
            <Icon
              as={t.deferred ? Clock : AlertCircle}
              boxSize="16px"
              mt="2px"
              color={t.deferred ? 'var(--pb-gold)' : 'var(--pb-forest-2)'}
              flexShrink={0}
            />
            <Text fontSize=".9rem" lineHeight="1.45">
              {t.deferred
                ? translate(days === 1 ? 'transactions.deferredNote' : 'transactions.deferredNotePlural', {
                    purchaseDate: fmtLong(t.purchaseDate, locale),
                    action: translate(isIn ? 'transactions.creditedTo' : 'transactions.debitedFrom'),
                    account: t.account === 'Unassigned' ? translate('transactions.unassigned') : t.account,
                    settlementDate: fmtLong(t.settlementDate, locale),
                    days,
                  })
                : translate(isIn ? 'transactions.immediateNoteIncome' : 'transactions.immediateNoteExpense')}
            </Text>
          </HStack>
        </Box>
      </Box>
    </Box>,
    document.body,
  )
}
