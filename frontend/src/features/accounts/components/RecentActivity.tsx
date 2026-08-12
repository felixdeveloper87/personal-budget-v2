import { Box, Flex, HStack, Icon, Text } from '@chakra-ui/react'
import type { AccountActivityItem } from '../../../types'
import { ArrowDownRight, ArrowUpRight, Repeat } from '../../../components/ui/icons'
import { useI18n } from '../../../i18n'

const isIncoming = (item: AccountActivityItem) =>
  item.kind === 'INCOME' || item.kind === 'TRANSFER_IN'

interface RecentActivityProps {
  items: AccountActivityItem[]
  hideBalances: boolean
}

export default function RecentActivity({ items, hideBalances }: RecentActivityProps) {
  const { t, formatCurrency, formatDate, categoryLabel } = useI18n()

  if (items.length === 0) {
    return (
      <Text fontSize="sm" color="var(--pb-ink-soft)" py={3}>
        {t('accounts.activity.empty')}
      </Text>
    )
  }

  return (
    <Box>
      {items.map((item) => {
        const incoming = isIncoming(item)
        const transfer = item.kind === 'TRANSFER_IN' || item.kind === 'TRANSFER_OUT'
        const paidByCreditCard = item.paymentMethodType === 'CREDIT_CARD' && Boolean(item.paymentMethodName)
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
              w="30px"
              h="30px"
              align="center"
              justify="center"
              borderRadius="9px"
              color={tone}
              bg={tint}
              border="1px solid"
              borderColor={tone}
            >
              <Icon
                as={transfer ? Repeat : incoming ? ArrowDownRight : ArrowUpRight}
                boxSize="13px"
              />
            </Flex>

            <Box minW={0} flex={1}>
              <Text
                fontFamily="var(--pb-serif)"
                fontSize="0.94rem"
                color="var(--pb-ink)"
                noOfLines={1}
              >
                {paidByCreditCard ? (
                  <Text as="span" fontWeight={500}>
                    {t('accounts.activity.paidWithCard', { name: item.paymentMethodName ?? '' })}
                  </Text>
                ) : (
                  <>
                    <Text as="span" fontWeight={500}>
                      {item.description?.trim() || (item.category ? categoryLabel(item.category) : t('accounts.activity.fallback'))}
                    </Text>
                    {' · '}
                    {formatDate(item.date, { day: '2-digit', month: 'short', year: 'numeric' })}
                    {item.category ? ` · ${categoryLabel(item.category)}` : ''}
                    {item.paymentMethodName ? (
                      <Text as="span" color="var(--pb-ink-soft)">
                        {' · '}{t('accounts.activity.paidWith', { name: item.paymentMethodName })}
                      </Text>
                    ) : null}
                  </>
                )}
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
                  {t(`status.${item.status}`, undefined, item.status.toLowerCase())}
                </Text>
              ) : null}
              <Text
                className="num"
                fontSize="1.02rem"
                fontWeight={500}
                color={tone}
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {hideBalances ? '••••••' : `${incoming ? '+' : '−'}${formatCurrency(Math.abs(item.amount))}`}
              </Text>
            </HStack>
          </Flex>
        )
      })}
    </Box>
  )
}
