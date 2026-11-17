import { Flex, Icon } from '@chakra-ui/react'
import type { PaymentMethod } from '../../../types'
import { BankLogo, getBankMeta } from '../../../components/ui'
import { CreditCard } from '../../../components/ui/icons'

/** Issuer logo when recognised, otherwise a tinted card glyph — same footprint as AccountAvatar. */
export default function CardAvatar({ card, size = 44 }: { card: PaymentMethod; size?: number }) {
  if (getBankMeta(card.issuer)) {
    return <BankLogo issuer={card.issuer} size={size} borderRadius="12px" />
  }
  return (
    <Flex
      flexShrink={0}
      w={`${size}px`}
      h={`${size}px`}
      align="center"
      justify="center"
      borderRadius="12px"
      bg="var(--nu-brand-tint)"
      color="var(--nu-brand)"
    >
      <Icon as={CreditCard} boxSize={`${Math.round(size * 0.45)}px`} />
    </Flex>
  )
}
