import { Box, Flex, HStack, Icon, Text, VStack } from '@chakra-ui/react'
import { ChevronRight, TrendingDown, TrendingUp } from '../ui/icons'
import { RecurringTransaction } from '../../types'
import '../../features/dashboard/theme/pb-tokens.css'

interface RecurringTransactionCardProps {
  recurringTransaction: RecurringTransaction
  /** Open the detail drawer for this rule. */
  onOpen: (item: RecurringTransaction) => void
}

const money = (value: number) => `£${value.toFixed(2)}`

/**
 * Compact single-line row for a fixed payment / income. Clicking it opens the
 * detail drawer (mirrors the Transactions page list → drawer pattern).
 */
export default function RecurringTransactionCard({
  recurringTransaction,
  onOpen,
}: RecurringTransactionCardProps) {
  const r = recurringTransaction
  const isIncome = r.type === 'INCOME'
  const isActive = r.active
  const typeIcon = isIncome ? TrendingUp : TrendingDown
  const amountColor = isIncome ? 'var(--pb-income-2)' : 'var(--pb-coral)'
  const accentTint = isIncome ? 'var(--pb-tint-income)' : 'var(--pb-tint-coral)'

  const caption = [
    r.category,
    r.accountName ?? 'No account',
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <Box
      as="button"
      type="button"
      onClick={() => onOpen(r)}
      textAlign="left"
      w="full"
      position="relative"
      overflow="hidden"
      borderRadius="14px"
      bg="var(--pb-surface)"
      border="1px solid var(--pb-hair)"
      boxShadow="0 1px 2px rgba(15,23,42,.05)"
      opacity={isActive ? 1 : 0.78}
      transition="border-color .18s ease, box-shadow .18s ease"
      _hover={{ borderColor: 'var(--pb-hair-2)', boxShadow: 'var(--pb-shadow)' }}
      _focusVisible={{ outline: '2px solid var(--pb-forest-2)', outlineOffset: '2px' }}
    >
      {isActive && <Box position="absolute" left={0} top={0} bottom={0} w="3px" bg="var(--pb-forest-2)" />}
      <Flex align="center" gap="0.85rem" pl={isActive ? '1.1rem' : '0.95rem'} pr="0.85rem" py="0.8rem">
        <Flex
          w="38px"
          h="38px"
          flexShrink={0}
          align="center"
          justify="center"
          borderRadius="11px"
          bg={isActive ? accentTint : 'var(--pb-surface-2)'}
          color={isActive ? amountColor : 'var(--pb-ink-faint)'}
          border="1px solid var(--pb-hair)"
        >
          <Icon as={typeIcon} boxSize={5} weight="duotone" />
        </Flex>

        <Box flex={1} minW={0}>
          <Text fontWeight={600} fontSize="sm" color="var(--pb-ink)" noOfLines={1} lineHeight="1.3">
            {r.description}
          </Text>
          <Text fontSize="xs" color="var(--pb-ink-soft)" noOfLines={1}>
            {caption}
          </Text>
        </Box>

        {/* Monthly amount */}
        <VStack align="flex-end" spacing={0} flexShrink={0} display={{ base: 'none', sm: 'flex' }}>
          <Text fontFamily="var(--pb-mono)" fontSize="9px" letterSpacing="0.1em" textTransform="uppercase" color="var(--pb-ink-faint)">
            Monthly
          </Text>
          <Text fontSize="md" fontWeight={600} color={amountColor} lineHeight="1.1" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {isIncome ? '+' : '−'}{money(r.amount)}
          </Text>
        </VStack>

        {/* Status / schedule */}
        <Box w="92px" flexShrink={0} display={{ base: 'none', md: 'flex' }} justifyContent="center">
          {isActive ? (
            <Text
              fontSize="2xs"
              fontWeight={600}
              px={2.5}
              py={1}
              borderRadius="999px"
              bg="var(--pb-surface-2)"
              color="var(--pb-ink-soft)"
              whiteSpace="nowrap"
            >
              Day {r.dayOfMonth}
            </Text>
          ) : (
            <HStack
              spacing={1}
              px={2.5}
              py={1}
              borderRadius="999px"
              bg="var(--pb-surface-2)"
              color="var(--pb-ink-faint)"
            >
              <Text fontSize="2xs" fontWeight={700} textTransform="uppercase" letterSpacing="0.04em">
                Cancelled
              </Text>
            </HStack>
          )}
        </Box>

        <Icon as={ChevronRight} boxSize={4} color="var(--pb-ink-faint)" flexShrink={0} />
      </Flex>
    </Box>
  )
}
