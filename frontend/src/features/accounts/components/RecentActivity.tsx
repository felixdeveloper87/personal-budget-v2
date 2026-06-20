import { Box, Flex, HStack, Icon, Text } from '@chakra-ui/react'
import type { AccountActivityItem } from '../../../types'
import { ArrowDownRight, ArrowUpRight, Repeat } from '../../../components/ui/icons'
import { money } from '../../../components/accounts/accountMeta'

const fmtDate = (value: string) =>
  new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

const isIncoming = (item: AccountActivityItem) =>
  item.kind === 'INCOME' || item.kind === 'TRANSFER_IN'

interface RecentActivityProps {
  items: AccountActivityItem[]
  currency: string
  hideBalances: boolean
}

export default function RecentActivity({ items, currency, hideBalances }: RecentActivityProps) {
  if (items.length === 0) {
    return (
      <Text fontSize="sm" color="var(--pb-ink-soft)" py={3}>
        No recent transactions for this account.
      </Text>
    )
  }

  return (
    <Box>
      {items.map((item) => {
        const incoming = isIncoming(item)
        const transfer = item.kind === 'TRANSFER_IN' || item.kind === 'TRANSFER_OUT'
        const tone = incoming ? 'var(--pb-income)' : 'var(--pb-coral)'
        const tint = incoming ? 'var(--pb-tint-income)' : 'var(--pb-tint-coral)'
        return (
          <Flex
            key={`${item.kind}-${item.id}-${item.date}`}
            align="center"
            gap="0.75rem"
            py="0.7rem"
            borderBottom="1px solid var(--pb-hair)"
            _last={{ borderBottom: 'none' }}
          >
            <Flex
              flexShrink={0}
              w="36px"
              h="36px"
              align="center"
              justify="center"
              borderRadius="10px"
              color={tone}
              bg={tint}
              border="1px solid"
              borderColor={tone}
            >
              <Icon
                as={transfer ? Repeat : incoming ? ArrowDownRight : ArrowUpRight}
                boxSize="17px"
              />
            </Flex>

            <Box minW={0} flex={1}>
              <Text fontSize="1rem" fontWeight={500} color="var(--pb-ink)" noOfLines={1}>
                {item.description?.trim() || item.category || 'Account activity'}
              </Text>
              <Text
                fontFamily="var(--pb-mono)"
                fontSize="9.5px"
                letterSpacing="0.03em"
                color="var(--pb-ink-faint)"
                mt="0.18rem"
                noOfLines={1}
              >
                {fmtDate(item.date)}
                {item.category ? ` · ${item.category}` : ''}
                {item.paymentMethodName ? (
                  <Text as="span" color="var(--pb-ink-soft)"> · paid with {item.paymentMethodName}</Text>
                ) : null}
              </Text>
            </Box>

            <HStack
              spacing="0.4rem"
              flexShrink={0}
              align="baseline"
            >
              {item.status && item.status !== 'CLEARED' ? (
                <Text
                  fontFamily="var(--pb-mono)"
                  fontSize="8.5px"
                  letterSpacing="0.05em"
                  textTransform="uppercase"
                  color="var(--pb-gold)"
                  bg="var(--pb-tint-gold)"
                  border="1px solid var(--pb-hair)"
                  borderRadius="5px"
                  px="0.32rem"
                  py="0.06rem"
                >
                  {item.status.toLowerCase()}
                </Text>
              ) : null}
              <Text
                className="num"
                fontSize="1.02rem"
                fontWeight={500}
                color={tone}
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {hideBalances ? '••••••' : `${incoming ? '+' : '−'}${money(item.amount, currency)}`}
              </Text>
            </HStack>
          </Flex>
        )
      })}
    </Box>
  )
}
