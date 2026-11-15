import { Box, Flex, Icon, Text } from '@chakra-ui/react'
import type { PaymentMethod } from '../../../types'
import { ChevronRight } from '../../../components/ui/icons'
import { useI18n } from '../../../i18n'
import CardAvatar from './CardAvatar'

interface CardRowProps {
  card: PaymentMethod
  currentTotal: number
  hideValues: boolean
  onSelect: () => void
}

/** One card in the list — mirrors AccountCard: avatar · name + meta · amount · chevron. */
export default function CardRow({ card, currentTotal, hideValues, onSelect }: CardRowProps) {
  const { t, formatCurrency } = useI18n()
  return (
    <Flex
      as="button"
      type="button"
      onClick={onSelect}
      align="center"
      gap={3}
      w="full"
      minH="76px"
      py={3}
      textAlign="left"
      bg="transparent"
      borderBottom="1px solid var(--pb-hair)"
      transition="background-color .15s ease"
      opacity={card.active ? 1 : 0.7}
      _last={{ borderBottom: 0 }}
      _hover={{ bg: 'rgba(130,10,209,.025)' }}
      _focusVisible={{ outline: 'none', boxShadow: 'inset 3px 0 0 var(--nu-brand, #820ad1)' }}
    >
      <CardAvatar card={card} size={42} />

      <Box minW={0} flex={1}>
        <Text fontSize="15px" fontWeight={650} color="var(--pb-ink)" noOfLines={1}>{card.name}</Text>
        <Text mt="2px" fontSize="11px" color="var(--pb-ink-soft)" noOfLines={1}>
          {card.issuer || t('cards.creditCard')}
          {' · '}
          {t('cards.closesPays', { closingDay: card.statementClosingDay ?? '—', paymentDay: card.paymentDay ?? '—' })}
          {!card.active && ` · ${t('cards.inactive')}`}
        </Text>
      </Box>

      <Box flexShrink={0} textAlign="right">
        <Text fontSize="15px" fontWeight={650} color="var(--pb-ink)" noOfLines={1} style={{ fontVariantNumeric: 'tabular-nums' }}>
          {hideValues ? '••••••' : formatCurrency(currentTotal)}
        </Text>
        <Text mt="2px" fontSize="10px" color="var(--pb-ink-faint)">{t('cards.currentStatement')}</Text>
      </Box>

      <Icon as={ChevronRight} boxSize="16px" color="var(--nu-brand, #820ad1)" flexShrink={0} />
    </Flex>
  )
}
