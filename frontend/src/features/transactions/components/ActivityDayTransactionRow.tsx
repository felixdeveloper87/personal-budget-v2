import { Box, Flex, HStack, Text } from '@chakra-ui/react'

import type { TxnVM } from '../transactions.types'
import { useI18n } from '../../../i18n'
import MerchantLogo from '../../../components/ui/MerchantLogo'

type ActivityDayTransactionRowProps = {
  transaction: TxnVM
  tone: 'income' | 'expense'
  appearance?: 'editorial' | 'nu'
}

export default function ActivityDayTransactionRow({
  transaction,
  tone,
  appearance = 'editorial',
}: ActivityDayTransactionRowProps) {
  const { formatCurrency, formatDate, categoryLabel } = useI18n()
  const isIncome = tone === 'income'
  const tint = isIncome ? 'var(--pb-tint-income)' : 'var(--pb-tint-coral)'
  const accent = isIncome ? 'var(--pb-income)' : 'var(--pb-coral)'
  const initial = transaction.category.trim().slice(0, 1).toUpperCase() || '•'

  if (appearance === 'nu') {
    return (
      <Flex
        justify="space-between"
        align="center"
        gap={3}
        minH="70px"
        py={3}
        borderBottom="1px solid var(--pb-hair)"
        bg="var(--nu-page)"
        transition="background-color .14s ease"
        _hover={{ bg: 'var(--nu-surface)' }}
        _last={{ borderBottom: 0 }}
      >
        <HStack spacing={3} minW={0}>
          <MerchantLogo
            category={transaction.category}
            domain={transaction.merchantDomain}
            name={transaction.merchant}
            size={42}
            borderRadius="50%"
          />
          <Box minW={0}>
            <Text color="var(--pb-ink)" fontSize="15px" fontWeight={600} lineHeight={1.2} noOfLines={1}>
              {transaction.merchant}
            </Text>
            <Text mt="3px" color="var(--pb-ink-soft)" fontSize="12px" lineHeight={1.2} noOfLines={1}>
              {categoryLabel(transaction.category)} · {formatDate(transaction.purchaseDate, { day: '2-digit', month: 'short' })}
            </Text>
          </Box>
        </HStack>
        <Text
          color="var(--pb-ink)"
          flexShrink={0}
          fontSize="15px"
          fontWeight={700}
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          −{formatCurrency(transaction.amount)}
        </Text>
      </Flex>
    )
  }

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
            {categoryLabel(transaction.category)}
          </Text>
        </Box>
      </HStack>
      <Text fontFamily="var(--pb-mono)" fontSize=".95rem" fontWeight={600} color={accent} flexShrink={0} style={{ fontVariantNumeric: 'tabular-nums' }}>
        {formatCurrency(transaction.amount)}
      </Text>
    </Flex>
  )
}
