import { Box, Flex, Icon, Text } from '@chakra-ui/react'
import { type LucideIcon } from '../../../components/ui/icons'
import { gbp, hexA, shortDate } from '../data/format'
import type { CategoryTxn, Side } from '../data/types'

interface CategoryTxnRowProps {
  txn: CategoryTxn
  icon: LucideIcon
  color: string
  side: Side
}

/** A single sample transaction inside a category's expanded row. */
export default function CategoryTxnRow({ txn, icon, color, side }: CategoryTxnRowProps) {
  const sign = side === 'expense' ? '−' : '+'
  const amtColor = side === 'expense' ? 'var(--pb-coral)' : 'var(--pb-income)'

  return (
    <Flex
      align="center"
      gap={3}
      py={2.5}
      borderBottom="1px solid var(--pb-hair)"
      _last={{ borderBottom: 'none' }}
    >
      <Flex
        flexShrink={0}
        w="32px"
        h="32px"
        align="center"
        justify="center"
        borderRadius="9px"
        color={color}
        bg={hexA(color, 0.12)}
        border="1px solid"
        borderColor={hexA(color, 0.28)}
      >
        <Icon as={icon} boxSize="16px" weight="duotone" />
      </Flex>

      <Box minW={0} flex={1}>
        <Text fontSize="0.98rem" fontWeight={500} color="var(--pb-ink)" noOfLines={1}>
          {txn.merchant}
        </Text>
        <Text
          fontFamily="var(--pb-mono)"
          fontSize="9.5px"
          letterSpacing="0.04em"
          color="var(--pb-ink-faint)"
          mt="0.12rem"
          noOfLines={1}
        >
          {shortDate(txn.purchaseDate)} · {txn.account}
        </Text>
      </Box>

      <Box textAlign="right" flexShrink={0}>
        <Text
          className="num"
          fontSize="1rem"
          fontWeight={500}
          color={amtColor}
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {sign}
          {gbp(txn.amount, 2)}
        </Text>
        <Text
          mt="0.18rem"
          fontFamily="var(--pb-mono)"
          fontSize="8.5px"
          letterSpacing="0.05em"
          textTransform="uppercase"
          color="var(--pb-ink-faint)"
        >
          Paid {shortDate(txn.settlesDate)}
        </Text>
      </Box>
    </Flex>
  )
}
