import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { Badge, Box, Button, Flex, HStack, Icon, Stack, Text, VisuallyHidden, VStack } from '@chakra-ui/react'
import { createHouseholdSettlement } from '../../../api'
import { useI18n } from '../../../i18n'
import { ToastService } from '../../../services/toast'
import type { HouseholdDashboard, HouseholdDebt, HouseholdPageState } from '../../../types'
import { Check } from '../../../components/ui/icons'
import { ModalHeader, PremiumModal } from '../../../components/ui'
import { today } from '../householdDates'

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

  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', md: '2xl' }}
      header={
        <ModalHeader
          title={t('household.balances.title')}
          caption={t('household.balances.description')}
          onClose={onClose}
          rightSlot={
            <Badge
              bg={hasOpenBalances ? 'var(--pb-tint-coral)' : 'var(--pb-tint-income)'}
              color={hasOpenBalances ? 'var(--pb-coral)' : 'var(--pb-income)'}
              border="1px solid var(--pb-hair)"
              borderRadius="full"
              px={3}
              py={1}
              textTransform="none"
            >
              {hasOpenBalances
                ? t('household.balances.open', {
                  amount: formatCurrency(outstandingTotal),
                })
                : t('household.balances.allSettled')}
            </Badge>
          }
        />
      }
      footer={
        <Flex justify="flex-end" w="full">
          <Button
            h="44px"
            w={{ base: 'full', sm: 'auto' }}
            px={5}
            borderRadius="11px"
            bg="var(--pb-forest-2)"
            color="var(--pb-on-accent)"
            onClick={onClose}
            _hover={{ bg: 'var(--pb-forest)' }}
          >
            {t('household.common.close')}
          </Button>
        </Flex>
      }
    >
      <Box p={{ base: 3, sm: 4, md: 5 }} bg="var(--pb-surface-2)">
        {!hasOpenBalances ? (
          <VStack
            py={9}
            px={4}
            spacing={3}
            border="1px dashed var(--pb-hair-2)"
            borderRadius="14px"
            bg="var(--pb-surface)"
          >
            <Flex
              w={11}
              h={11}
              align="center"
              justify="center"
              borderRadius="full"
              bg="var(--pb-tint-income)"
              color="var(--pb-income)"
            >
              <Icon as={Check} boxSize={5} weight="bold" />
            </Flex>
            <Text
              fontFamily="var(--pb-serif)"
              fontSize="lg"
              fontWeight={500}
              textAlign="center"
            >
              {t('household.balances.everyoneSettled')}
            </Text>
            <Text color="var(--pb-ink-soft)" fontSize="sm" textAlign="center">
              {t('household.balances.noDebts')}
            </Text>
          </VStack>
        ) : (
          <VStack align="stretch" spacing={2.5}>
            {household.debts.map((debt) => {
              const youPay = debt.fromMemberId === household.currentMemberId
              const youReceive = debt.toMemberId === household.currentMemberId
              const accent = youPay
                ? 'var(--pb-coral)'
                : youReceive
                  ? 'var(--pb-income)'
                  : 'var(--pb-ink-soft)'
              const tint = youPay
                ? 'var(--pb-tint-coral)'
                : youReceive
                  ? 'var(--pb-tint-income)'
                  : 'var(--pb-surface)'

              return (
                <Stack
                  key={`${debt.fromMemberId}-${debt.toMemberId}`}
                  direction={{ base: 'column', sm: 'row' }}
                  align={{ base: 'stretch', sm: 'center' }}
                  justify="space-between"
                  gap={3}
                  p={{ base: 3.5, sm: 4 }}
                  borderRadius="14px"
                  border="1px solid var(--pb-hair)"
                  bg="var(--pb-surface)"
                >
                  <Box minW={0}>
                    <HStack spacing={2} flexWrap="wrap">
                      <Text fontWeight={700} color="var(--pb-ink)" noOfLines={1}>
                        {youPay
                          ? t('household.balances.youOweName', {
                            name: debt.toMemberName,
                          })
                          : youReceive
                            ? t('household.balances.owesYou', {
                              name: debt.fromMemberName,
                            })
                            : t('household.balances.memberOwes', {
                              from: debt.fromMemberName,
                              to: debt.toMemberName,
                            })}
                      </Text>
                      {(youPay || youReceive) && (
                        <Badge
                          borderRadius="full"
                          px={2}
                          bg={tint}
                          color={accent}
                          textTransform="none"
                        >
                          {youPay
                            ? t('household.balances.youPay')
                            : t('household.balances.youReceive')}
                        </Badge>
                      )}
                    </HStack>
                    <Text mt={0.5} color="var(--pb-ink-faint)" fontSize="xs">
                      {youPay
                        ? t('household.balances.payHint')
                        : youReceive
                          ? t('household.balances.receiveHint')
                          : t('household.balances.otherHint')}
                    </Text>
                  </Box>
                  <HStack
                    justify={{ base: 'space-between', sm: 'flex-end' }}
                    spacing={3}
                  >
                    <Text
                      fontFamily="var(--pb-serif)"
                      fontSize="xl"
                      fontWeight={500}
                      color={accent}
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                      {formatCurrency(debt.amount)}
                    </Text>
                    {youPay && (
                      <HoldToPayButton
                        householdId={household.id}
                        debt={debt}
                        onChanged={onChanged}
                      />
                    )}
                  </HStack>
                </Stack>
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
        h="38px"
        minW="132px"
        px={3.5}
        position="relative"
        overflow="hidden"
        borderRadius="10px"
        bg={phase === 'success' ? 'var(--pb-income)' : 'var(--pb-forest-2)'}
        color="var(--pb-on-accent)"
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
        touchAction="none"
        userSelect="none"
        sx={{ WebkitTouchCallout: 'none' }}
        _hover={{
          bg: phase === 'success' ? 'var(--pb-income)' : 'var(--pb-forest)',
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
