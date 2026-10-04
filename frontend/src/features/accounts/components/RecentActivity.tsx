import { Box, Flex, Icon, Text } from '@chakra-ui/react'
import type { AccountActivityItem } from '../../../types'
import { ArrowDownRight, ArrowUpRight, Repeat } from '../../../components/ui/icons'
import { useI18n } from '../../../i18n'

const isIncoming = (item: AccountActivityItem) =>
  item.kind === 'INCOME' || item.kind === 'TRANSFER_IN'

interface AccountActivityRowProps {
  item: AccountActivityItem
  hideBalances: boolean
}

/** One account movement: tinted circle · description + meta · signed amount (+ status pill). */
export default function AccountActivityRow({ item, hideBalances }: AccountActivityRowProps) {
  const { t, formatCurrency, formatDate, categoryLabel } = useI18n()
  const incoming = isIncoming(item)
  const transfer = item.kind === 'TRANSFER_IN' || item.kind === 'TRANSFER_OUT'
  const paidByCreditCard = item.paymentMethodType === 'CREDIT_CARD' && Boolean(item.paymentMethodName)
  const title = paidByCreditCard
    ? t('accounts.activity.paidWithCard', { name: item.paymentMethodName ?? '' })
    : item.description?.trim() || (item.category ? categoryLabel(item.category) : t('accounts.activity.fallback'))
  const meta = [
    formatDate(item.date, { day: '2-digit', month: 'short', year: 'numeric' }),
    transfer ? t('accounts.detail.filter.TRANSFER') : item.category ? categoryLabel(item.category) : null,
    !paidByCreditCard && item.paymentMethodName ? item.paymentMethodName : null,
  ].filter(Boolean).join(' · ')

  return (
    <Flex align="center" gap={3} minH="68px" py={3} borderBottom="1px solid var(--pb-hair)" _last={{ borderBottom: 'none' }}>
      <Flex
        flexShrink={0}
        w="40px"
        h="40px"
        align="center"
        justify="center"
        borderRadius="full"
        color={incoming ? 'var(--nu-positive)' : 'var(--nu-negative)'}
        bg={incoming ? 'var(--nu-positive-tint)' : 'var(--nu-negative-tint)'}
      >
        <Icon as={transfer ? Repeat : incoming ? ArrowDownRight : ArrowUpRight} boxSize="16px" />
      </Flex>

      <Box minW={0} flex={1}>
        <Text fontSize="15px" fontWeight={600} color="var(--pb-ink)" noOfLines={1}>{title}</Text>
        <Text mt="2px" fontSize="xs" color="var(--pb-ink-soft)" noOfLines={1}>{meta}</Text>
      </Box>

      <Flex direction="column" align="flex-end" gap={1} flexShrink={0}>
        <Text
          fontSize="15px"
          fontWeight={700}
          color={incoming ? 'var(--nu-positive)' : 'var(--pb-ink)'}
          sx={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {hideBalances ? '••••••' : `${incoming ? '+' : '−'}${formatCurrency(Math.abs(item.amount))}`}
        </Text>
        {item.status && item.status !== 'CLEARED' ? (
          <Text px={2} py="1px" borderRadius="full" bg="var(--nu-surface)" color="var(--pb-ink-soft)" fontSize="10px" fontWeight={600}>
            {t(`status.${item.status}`, undefined, item.status.toLowerCase())}
          </Text>
        ) : null}
      </Flex>
    </Flex>
  )
}
