import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { Box, Button, Flex, HStack, Icon, Text, VisuallyHidden, VStack } from '@chakra-ui/react'
import { createHouseholdSettlement } from '../../../api'
import { useI18n } from '../../../i18n'
import { ToastService } from '../../../services/toast'
import type { HouseholdDashboard, HouseholdDebt, HouseholdPageState } from '../../../types'
import { Check } from '../../../components/ui/icons'
import { PremiumModal } from '../../../components/ui'
import NuModalHeader from '../../../components/ui/NuModalHeader'
import { today } from '../householdDates'

const BRAND = '#820ad1'
const HOLD_DURATION_MS = 3_000
const SUCCESS_FEEDBACK_MS = 900

type PaymentPhase = 'idle' | 'holding' | 'saving' | 'success'

export function BalancesOverviewModal({
  isOpen,
  onClose,
  household,
  onChanged,
}: {
  isOpen: boolean
  onClose: () => void
  household: HouseholdDashboard
  onChanged: (page: HouseholdPageState) => void
}) {
  const { formatCurrency, t } = useI18n()
  const outstandingTotal = household.debts.reduce(
    (total, debt) => total + debt.amount,
    0,
  )
  const hasOpenBalances = household.debts.length > 0
  const involvesYou = (debt: HouseholdDebt) =>
    debt.fromMemberId === household.currentMemberId || debt.toMemberId === household.currentMemberId
  // Your own balances first: they are the ones you can act on.
  const debts = [...household.debts].sort((a, b) => Number(involvesYou(b)) - Number(involvesYou(a)))

  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      contentProps={{
        className: 'nu-dashboard',
        w: { base: '100%', md: 'min(640px, calc(100vw - 32px))' }, maxW: '640px',
        h: 'auto', maxH: { base: '85dvh', md: '80vh' },
        mt: 'auto', mb: 0, mx: 'auto', borderRadius: '32px 32px 0 0', overflow: 'hidden', bg: 'var(--nu-page, #ffffff)',
      }}
      header={
        <NuModalHeader
          title={t('household.balances.title')}
          caption={hasOpenBalances
            ? t('household.balances.open', { amount: formatCurrency(outstandingTotal) })
            : t('household.balances.allSettled')}
          onClose={onClose}
        />
      }
    >
      <Box overflowY="auto" flex={1} minH={0} bg="var(--nu-page, #ffffff)" pb="env(safe-area-inset-bottom, 0px)"
        sx={{ WebkitOverflowScrolling: 'touch' }}>
        {!hasOpenBalances ? (
          <VStack py={12} px={6} spacing={3}>
            <Flex w="56px" h="56px" align="center" justify="center" borderRadius="full" bg="#f3e8fc" color={BRAND}>
              <Icon as={Check} boxSize={6} weight="bold" />
            </Flex>
            <Text fontSize="lg" fontWeight={800} letterSpacing="-.02em" color="var(--pb-ink)" textAlign="center">
              {t('household.balances.everyoneSettled')}
            </Text>
            <Text color="var(--pb-ink-soft)" fontSize="sm" textAlign="center">
              {t('household.balances.noDebts')}
            </Text>
          </VStack>
        ) : (
          <VStack align="stretch" spacing={0} divider={<Box h="1px" bg="var(--pb-hair)" />}>
            {debts.map((debt) => {
              const youPay = debt.fromMemberId === household.currentMemberId
              const youReceive = debt.toMemberId === household.currentMemberId
              const accent = youPay
                ? 'var(--pb-coral)'
                : youReceive
                  ? 'var(--pb-income)'
                  : 'var(--pb-ink)'

              return (
                <Box
                  key={`${debt.fromMemberId}-${debt.toMemberId}`}
                  px={{ base: 4, md: 6 }}
                  py={3.5}
                  bg={youPay || youReceive ? 'rgba(130, 10, 209, 0.04)' : undefined}
                >
                  <Flex align="center" gap={3}>
                    <Box minW={0} flex={1}>
                      <Text fontWeight={700} fontSize="md" color="var(--pb-ink)" noOfLines={1}>
                        {youPay
                          ? t('household.balances.youOweName', { name: debt.toMemberName })
                          : youReceive
                            ? t('household.balances.owesYou', { name: debt.fromMemberName })
                            : t('household.balances.memberOwes', { from: debt.fromMemberName, to: debt.toMemberName })}
                      </Text>
                      <Text mt={0.5} color="var(--pb-ink-soft)" fontSize="xs" noOfLines={1}>
                        {youPay
                          ? t('household.balances.payHint')
                          : youReceive
                            ? t('household.balances.receiveHint')
                            : t('household.balances.otherHint')}
                      </Text>
                    </Box>
                    <Text flexShrink={0} fontSize="lg" fontWeight={800} letterSpacing="-.02em" color={accent}
                      style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {formatCurrency(debt.amount)}
                    </Text>
                  </Flex>
                  {youPay && (
                    <Box mt={3}>
                      <HoldToPayButton householdId={household.id} debt={debt} onChanged={onChanged} />
                    </Box>
                  )}
                </Box>
              )
            })}
          </VStack>
        )}
      </Box>
    </PremiumModal>
  )
}

function HoldToPayButton({
  householdId,
  debt,
  onChanged,
}: {
  householdId: number
  debt: HouseholdDebt
  onChanged: (page: HouseholdPageState) => void
}) {
  const { formatCurrency, t } = useI18n()
  const [phase, setPhase] = useState<PaymentPhase>('idle')
  const phaseRef = useRef<PaymentPhase>('idle')
  const holdTimerRef = useRef<number | null>(null)
  const successTimerRef = useRef<number | null>(null)
  const successPageRef = useRef<HouseholdPageState | null>(null)
  const onChangedRef = useRef(onChanged)
  const mountedRef = useRef(true)
  onChangedRef.current = onChanged

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (holdTimerRef.current !== null) window.clearTimeout(holdTimerRef.current)
      if (successTimerRef.current !== null) window.clearTimeout(successTimerRef.current)
      if (successPageRef.current) {
        const completedPage = successPageRef.current
        successPageRef.current = null
        onChangedRef.current(completedPage)
      }
    }
  }, [])

  const changePhase = (nextPhase: PaymentPhase) => {
    phaseRef.current = nextPhase
    if (mountedRef.current) setPhase(nextPhase)
  }

  const clearHoldTimer = () => {
    if (holdTimerRef.current === null) return
    window.clearTimeout(holdTimerRef.current)
    holdTimerRef.current = null
  }

  const cancelHold = () => {
    if (phaseRef.current !== 'holding') return
    clearHoldTimer()
    changePhase('idle')
  }

  const confirmPayment = async () => {
    if (phaseRef.current !== 'holding') return
    clearHoldTimer()
    changePhase('saving')
    try {
      const created = await createHouseholdSettlement(householdId, {
        toMemberId: debt.toMemberId,
        amount: debt.amount,
        settlementDate: today(),
      })
      if (!mountedRef.current) {
        onChangedRef.current(created.page)
        return
      }
      successPageRef.current = created.page
      changePhase('success')
      successTimerRef.current = window.setTimeout(() => {
        successTimerRef.current = null
        const completedPage = successPageRef.current
        successPageRef.current = null
        if (completedPage) onChangedRef.current(completedPage)
      }, SUCCESS_FEEDBACK_MS)
    } catch (error) {
      changePhase('idle')
      ToastService.apiError(error, { title: t('household.balances.paymentFailed') })
    }
  }

  const beginHold = () => {
    if (phaseRef.current !== 'idle') return
    changePhase('holding')
    holdTimerRef.current = window.setTimeout(
      () => void confirmPayment(),
      HOLD_DURATION_MS,
    )
  }

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    beginHold()
  }

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (phaseRef.current !== 'holding') return
    const bounds = event.currentTarget.getBoundingClientRect()
    const inside = event.clientX >= bounds.left
      && event.clientX <= bounds.right
      && event.clientY >= bounds.top
      && event.clientY <= bounds.bottom
    if (inside) return
    cancelHold()
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const handlePointerEnd = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    cancelHold()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== ' ' && event.key !== 'Enter') return
    event.preventDefault()
    if (event.repeat) return
    beginHold()
  }

  const handleKeyUp = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== ' ' && event.key !== 'Enter') return
    event.preventDefault()
    cancelHold()
  }

  const label = phase === 'holding'
    ? t('household.balances.keepHolding')
    : phase === 'saving'
      ? t('household.balances.recordingPayment')
      : phase === 'success'
        ? t('household.balances.paymentDone')
        : t('household.balances.recordPayment')
  const accessibleLabel = phase === 'idle'
    ? t('household.balances.holdPaymentAria', {
      amount: formatCurrency(debt.amount),
      name: debt.toMemberName,
    })
    : label

  return (
    <>
      <Button
        h="48px"
        w="full"
        px={5}
        position="relative"
        overflow="hidden"
        borderRadius="full"
        bg={phase === 'success' ? 'var(--pb-income)' : BRAND}
        color="white"
        aria-label={accessibleLabel}
        aria-busy={phase === 'saving'}
        isDisabled={phase === 'saving' || phase === 'success'}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onLostPointerCapture={cancelHold}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onBlur={cancelHold}
        onClick={(event) => event.preventDefault()}
        onContextMenu={(event) => event.preventDefault()}
        sx={{
          touchAction: 'none',
          userSelect: 'none',
          WebkitTouchCallout: 'none',
        }}
        _hover={{
          bg: phase === 'success' ? 'var(--pb-income)' : '#6d08b0',
          transform: phase === 'idle' ? 'translateY(-1px)' : 'none',
        }}
        _disabled={{ opacity: 1, cursor: 'default' }}
      >
        <Box
          aria-hidden="true"
          position="absolute"
          inset={0}
          bg="whiteAlpha.300"
          transformOrigin="left center"
          transform={phase === 'idle' ? 'scaleX(0)' : 'scaleX(1)'}
          transition={phase === 'holding'
            ? `transform ${HOLD_DURATION_MS}ms linear`
            : phase === 'idle'
              ? 'none'
              : 'transform 120ms ease-out'}
          pointerEvents="none"
        />
        <HStack as="span" position="relative" zIndex={1} spacing={1.5}>
          {phase === 'success' && <Icon as={Check} boxSize={4.5} weight="bold" />}
          <Text as="span" fontSize="sm" fontWeight={700}>{label}</Text>
        </HStack>
      </Button>
      <VisuallyHidden aria-live="polite">
        {phase === 'success' ? label : ''}
      </VisuallyHidden>
    </>
  )
}
