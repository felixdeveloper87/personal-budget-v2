import { Flex } from '@chakra-ui/react'
import { useI18n } from '../../../i18n'

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}

/** Small lilac circle with the payer's initials ("LF"); hover/screen readers get "Paid by …". */
export function PayerInitials({ name }: { name: string }) {
  const { t } = useI18n()
  const label = t('household.expenses.paidBy', { name })
  return (
    <Flex
      as="span" role="img" aria-label={label} title={label}
      w="20px" h="20px" flexShrink={0} align="center" justify="center" borderRadius="full"
      bg="#f3e8fc" color="#820ad1" fontSize="9px" fontWeight={800} letterSpacing="-.02em"
    >
      {initials(name)}
    </Flex>
  )
}
