import { useMemo } from 'react'
import { Box, Flex, HStack, Icon, Text, VStack } from '@chakra-ui/react'
import { CheckCircle2, ChevronRight, CreditCard } from '../ui/icons'
import { InstallmentPlan } from '../../types'
import { getInstallmentPlanTitle } from '../../utils/installments'

interface InstallmentPlanCardProps {
  plan: InstallmentPlan
  /** Open the detail drawer for this plan. */
  onOpen: (plan: InstallmentPlan) => void
  /**
   * Visual treatment:
   *  - `active`  → forest accent stripe + progress bar.
   *  - `past`    → muted accent + "Completed" badge.
   */
  variant?: 'active' | 'past'
}

const money = (value: number) => `£${value.toFixed(2)}`

/**
 * True when every installment in the plan has a date in the past — i.e. all
 * payments have been settled and the plan is closed.
 */
export function isInstallmentPlanCompleted(plan: InstallmentPlan): boolean {
  if (plan.transactions.length === 0) return false
  const now = Date.now()
  return plan.transactions.every((t) => new Date(t.date).getTime() < now)
}

/**
 * Compact single-line row for an installment plan. Clicking it opens the
 * detail drawer (mirrors the Transactions page list → drawer pattern).
 */
export default function InstallmentPlanCard({
  plan,
  onOpen,
  variant = 'active',
}: InstallmentPlanCardProps) {
  const isPast = variant === 'past'
  const firstTransaction = plan.transactions[0]
  const title = firstTransaction?.description
    ? getInstallmentPlanTitle(firstTransaction.description)
    : 'Installment plan'

  const caption = [
    firstTransaction?.category,
    plan.paymentMethodName ?? 'No card',
    plan.accountName ?? 'No account',
  ]
    .filter(Boolean)
    .join(' · ')

  const paidCount = useMemo(() => {
    const now = new Date()
    return plan.transactions.filter((t) => new Date(t.date) < now).length
  }, [plan.transactions])

  const progressPct = plan.totalInstallments > 0
    ? Math.min(100, Math.round((paidCount / plan.totalInstallments) * 100))
    : 0

  return (
    <Box
      as="button"
      type="button"
      onClick={() => onOpen(plan)}
      textAlign="left"
      w="full"
      position="relative"
      overflow="hidden"
      borderRadius="14px"
      bg="var(--pb-surface)"
      border="1px solid var(--pb-hair)"
      boxShadow="0 1px 2px rgba(15,23,42,.05)"
      transition="border-color .18s ease, box-shadow .18s ease"
      _hover={{ borderColor: 'var(--pb-hair-2)', boxShadow: 'var(--pb-shadow)' }}
      _focusVisible={{ outline: '2px solid var(--pb-forest-2)', outlineOffset: '2px' }}
    >
      {!isPast && <Box position="absolute" left={0} top={0} bottom={0} w="3px" bg="var(--pb-forest-2)" />}
      <Flex align="center" gap="0.85rem" pl={isPast ? '0.95rem' : '1.1rem'} pr="0.85rem" py="0.8rem">
        <Flex
          w="38px"
          h="38px"
          flexShrink={0}
          align="center"
          justify="center"
          borderRadius="11px"
          bg={isPast ? 'var(--pb-surface-2)' : 'var(--pb-tint-green)'}
          color={isPast ? 'var(--pb-ink-faint)' : 'var(--pb-forest-2)'}
          border="1px solid var(--pb-hair)"
        >
          <Icon as={CreditCard} boxSize={5} weight="duotone" />
        </Flex>

        <Box flex={1} minW={0}>
          <Text fontWeight={600} fontSize="sm" color="var(--pb-ink)" noOfLines={1} lineHeight="1.3">
            {title}
          </Text>
          <Text fontSize="xs" color="var(--pb-ink-soft)" noOfLines={1}>
            {caption}
          </Text>
        </Box>

        {/* Per-installment amount */}
        <VStack align="flex-end" spacing={0} flexShrink={0} display={{ base: 'none', sm: 'flex' }}>
          <Text fontFamily="var(--pb-mono)" fontSize="9px" letterSpacing="0.1em" textTransform="uppercase" color="var(--pb-ink-faint)">
            Per month
          </Text>
          <Text fontSize="md" fontWeight={600} color="var(--pb-ink)" lineHeight="1.1" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {money(plan.installmentValue)}
          </Text>
        </VStack>

        {/* Progress / status */}
        <Box w="118px" flexShrink={0} display={{ base: 'none', md: 'block' }}>
          {isPast ? (
            <HStack
              spacing={1}
              justify="center"
              px={2}
              py={1}
              borderRadius="999px"
              bg="var(--pb-tint-income)"
              color="var(--pb-income)"
            >
              <Icon as={CheckCircle2} boxSize={3} strokeWidth={2.5} />
              <Text fontSize="2xs" fontWeight={700} textTransform="uppercase" letterSpacing="0.04em">
                Completed
              </Text>
            </HStack>
          ) : (
            <>
              <Flex justify="space-between" align="baseline" mb="3px">
                <Text fontSize="2xs" color="var(--pb-ink-faint)">
                  {paidCount}/{plan.totalInstallments}
                </Text>
                <Text fontSize="2xs" fontWeight={700} color="var(--pb-forest-2)">
                  {progressPct}%
                </Text>
              </Flex>
              <Box h="5px" w="full" bg="var(--pb-surface-3)" borderRadius="full" overflow="hidden">
                <Box h="full" w={`${progressPct}%`} bg="var(--pb-forest-2)" borderRadius="full" transition="width 0.4s ease" />
              </Box>
            </>
          )}
        </Box>

        <Icon as={ChevronRight} boxSize={4} color="var(--pb-ink-faint)" flexShrink={0} />
      </Flex>
    </Box>
  )
}
