import { Box, Flex, Icon, Text } from '@chakra-ui/react'
import { type LucideIcon } from '../../../components/ui/icons'
import type { CategoryTxn, Side } from '../data/types'
import { useI18n } from '../../../i18n'

interface CategoryTxnRowProps {
  txn: CategoryTxn
  icon: LucideIcon
  /** Kept for callers; rows use the brand tint so the list reads as one. */
  color?: string
  side: Side
}

/** One transaction in a category list — Nubank row: tinted icon circle,
    bold name, quiet meta line and the amount on the right. */
export default function CategoryTxnRow({ txn, icon, side }: CategoryTxnRowProps) {
  const { t, formatCurrency, formatDate, categoryLabel } = useI18n()
  const sign = side === 'expense' ? '−' : '+'
  const amtColor = side === 'expense' ? 'var(--pb-ink)' : 'var(--pb-income)'
  const settlesLater = txn.settlesDate && txn.settlesDate !== txn.purchaseDate

  return (
    <Flex
      align="center"
      gap={3}
      py={3}
      borderBottom="1px solid var(--pb-hair)"
      _last={{ borderBottom: 'none' }}
    >
      <Flex
        flexShrink={0}
        w="40px"
        h="40px"
        align="center"
        justify="center"
        borderRadius="full"
        color="var(--nu-brand, #820ad1)"
        bg="var(--nu-brand-tint, #f3e8fc)"
      >
        <Icon as={icon} boxSize="18px" weight="bold" />
      </Flex>

      <Box minW={0} flex={1}>
        <Text fontSize="sm" fontWeight={600} color="var(--pb-ink)" noOfLines={1}>
          {txn.merchantIsCategory
            ? txn.merchant === 'Uncategorised' ? t('categories.uncategorised') : categoryLabel(txn.merchant)
            : txn.merchant}
        </Text>
        <Text fontSize="xs" color="var(--pb-ink-soft)" mt="0.1rem" noOfLines={1}>
          {formatDate(txn.purchaseDate, { day: 'numeric', month: 'short' })} · {txn.account}
        </Text>
      </Box>

      <Box textAlign="right" flexShrink={0}>
        <Text fontSize="sm" fontWeight={700} color={amtColor} style={{ fontVariantNumeric: 'tabular-nums' }}>
          {sign}
          {formatCurrency(txn.amount)}
        </Text>
        {settlesLater && (
          <Text mt="0.1rem" fontSize="2xs" color="var(--pb-ink-faint)">
            {t('categories.paidDate', {
              date: formatDate(txn.settlesDate, { day: 'numeric', month: 'short' }),
            })}
          </Text>
        )}
      </Box>
    </Flex>
  )
}
