import { Box, Flex, HStack, Text } from '@chakra-ui/react'

import { fmtCurrency } from '../../dashboard/components/format'
import type { TxnVM } from '../transactions.types'

type ActivityDayTransactionRowProps = {
  transaction: TxnVM
  tone: 'income' | 'expense'
}

export default function ActivityDayTransactionRow({
  transaction,
  tone,
}: ActivityDayTransactionRowProps) {
  const isIncome = tone === 'income'
  const tint = isIncome ? 'var(--pb-tint-income)' : 'var(--pb-tint-coral)'
  const accent = isIncome ? 'var(--pb-income)' : 'var(--pb-coral)'
  const initial = transaction.category.trim().slice(0, 1).toUpperCase() || '•'

  return (
    <Flex
      justify="space-between"
      align="center"
      gap={4}
      p=".85rem .9rem"
      border="1px solid var(--pb-hair)"
      borderRadius="13px"
      bg="var(--pb-surface-2)"
      transition="border-color .16s ease, transform .16s ease"
      _hover={{ borderColor: tint, transform: 'translateY(-1px)' }}
    >
      <HStack spacing={3} minW={0}>
        <Flex
          w="31px"
          h="31px"
          flexShrink={0}
          align="center"
          justify="center"
          borderRadius="full"
          bg={tint}
          color={accent}
          fontFamily="var(--pb-mono)"
          fontSize="11px"
          fontWeight={600}
        >
          {initial}
        </Flex>
        <Box minW={0}>
          <Text fontFamily="var(--pb-serif)" color="var(--pb-ink)" noOfLines={1}>
            {transaction.merchant}
          </Text>
          <Text mt="1px" fontFamily="var(--pb-mono)" fontSize="9px" letterSpacing="0.06em" textTransform="uppercase" color="var(--pb-ink-faint)" noOfLines={1}>
            {transaction.category}
          </Text>
        </Box>
      </HStack>
      <Text fontFamily="var(--pb-mono)" fontSize=".95rem" fontWeight={600} color={accent} flexShrink={0} style={{ fontVariantNumeric: 'tabular-nums' }}>
        {fmtCurrency(transaction.amount)}
      </Text>
    </Flex>
  )
}
