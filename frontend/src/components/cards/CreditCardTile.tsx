import { Badge, Box, Flex, HStack, Icon, IconButton, Text, VStack } from '@chakra-ui/react'

import type { PaymentMethod } from '../../types'
import { BankLogo, getBankMeta } from '../ui'
import { CreditCard, Pencil, Trash2 } from '../ui/icons'
import { useI18n } from '../../i18n'

export interface CreditCardTileProps {
  card: PaymentMethod
  currentTotal: number
  usedCredit?: number
  statementCount: number
  nextPaymentAmount?: number
  nextPaymentDate?: Date | null
  hideValues?: boolean
  onSelect: () => void
  onEdit?: () => void
  onDelete?: () => void
}

export default function CreditCardTile({
  card,
  currentTotal,
  usedCredit,
  statementCount,
  nextPaymentAmount = 0,
  nextPaymentDate = null,
  hideValues = false,
  onSelect,
  onEdit,
  onDelete,
}: CreditCardTileProps) {
  const { t, formatCurrency, formatDate } = useI18n()
  const limit = card.creditLimit ?? 0
  const used = usedCredit ?? currentTotal
  const hasLimit = limit > 0
  const usedPct = hasLimit ? Math.min(100, Math.max(0, (used / limit) * 100)) : 0
  const remaining = Math.max(0, limit - used)
  const utilisationColour = usedPct >= 90 ? 'var(--pb-coral-2)' : 'var(--nu-brand, #820ad1)'

  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect()
        }
      }}
      cursor="pointer"
      textAlign="left"
      w="full"
      overflow="hidden"
      borderRadius={0}
      border={0}
      borderBottom="1px solid var(--pb-hair)"
      bg="var(--pb-surface)"
      boxShadow="none"
      transition="background-color .16s ease"
      _hover={{ bg: 'rgba(130, 10, 209, .025)' }}
      _focusVisible={{ outline: 'none', boxShadow: 'inset 3px 0 0 var(--nu-brand, #820ad1)' }}
      _last={{ borderBottom: 0 }}
      opacity={card.active ? 1 : 0.7}
    >
      <VStack align="stretch" spacing={2.5} py={3.5} px={{ base: 0, md: 1 }}>
        <HStack justify="space-between" align="start">
          <HStack spacing={2.5} minW={0}>
            {getBankMeta(card.issuer) ? (
              <BankLogo issuer={card.issuer} size={36} borderRadius="full" />
            ) : (
              <Flex w="36px" h="36px" borderRadius="full" bg="var(--nu-brand-tint, #f3e8fc)" align="center" justify="center" flexShrink={0}>
                <Icon as={CreditCard} boxSize={4.5} color="var(--nu-brand, #820ad1)" weight="duotone" />
              </Flex>
            )}
            <Box minW={0}>
              <Text fontSize="sm" fontWeight={700} color="var(--pb-ink)" noOfLines={1}>{card.name}</Text>
              <Text fontSize="10px" color="var(--pb-ink-soft)" mt="1px" noOfLines={1}>{card.issuer || t('cards.creditCard')}</Text>
            </Box>
          </HStack>
          <HStack spacing={1} flexShrink={0}>
            {!card.active && <Badge color="var(--pb-ink-soft)" bg="var(--pb-surface-3)" borderRadius="999px" textTransform="uppercase" fontSize="9px" letterSpacing="0.08em">{t('cards.inactive')}</Badge>}
            {onEdit && <TileAction label={t('cards.action.editNamed', { name: card.name })} icon={Pencil} onClick={onEdit} />}
            {onDelete && <TileAction label={t('cards.action.deleteNamed', { name: card.name })} icon={Trash2} danger onClick={onDelete} />}
          </HStack>
        </HStack>

        <Flex justify="space-between" align="flex-end" gap={4}>
          <Box minW={0}>
            <Text fontSize="11px" color="var(--pb-ink-soft)">{t('cards.currentStatement')}</Text>
            <Text className="num" fontSize="1.5rem" fontWeight={700} lineHeight="1.1" letterSpacing="-0.025em" color="var(--pb-ink)" mt="2px" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {hideValues ? '••••••' : formatCurrency(currentTotal)}
            </Text>
          </Box>
          {nextPaymentDate && (
            <Box flexShrink={0} textAlign="right">
              <Text fontSize="10px" color="var(--pb-ink-soft)">{t('cards.dueDate', { date: formatDate(nextPaymentDate, { day: 'numeric', month: 'short' }) })}</Text>
              <Text mt="2px" fontSize="sm" fontWeight={600} color="var(--pb-ink)" style={{ fontVariantNumeric: 'tabular-nums' }}>{hideValues ? '••••••' : formatCurrency(nextPaymentAmount)}</Text>
            </Box>
          )}
        </Flex>

        {hasLimit && (
          <Box>
            <Flex justify="space-between" align="baseline" mb={1.5} gap={2}>
              <Text fontSize="11px" color="var(--pb-ink-soft)">{hideValues ? '••••' : t('cards.percentOfLimit', { percentage: Math.round(usedPct) })}</Text>
              <Text fontSize="xs" color="var(--pb-ink-soft)" textAlign="right" style={{ fontVariantNumeric: 'tabular-nums' }}>{hideValues ? '••••••' : t('cards.amountAvailable', { amount: formatCurrency(remaining) })}</Text>
            </Flex>
            <Box h="4px" w="full" bg="var(--pb-surface-3)" borderRadius="full" overflow="hidden"><Box h="full" w={`${usedPct}%`} bg={utilisationColour} borderRadius="full" transition="width .4s ease" /></Box>
          </Box>
        )}

        <Flex justify="space-between" align="center" gap={3} pt={2.5} borderTop="1px solid var(--pb-hair)">
          <Text minW={0} fontSize="10px" color="var(--pb-ink-soft)" noOfLines={1}>
            {t('cards.closesPays', { closingDay: card.statementClosingDay ?? '—', paymentDay: card.paymentDay ?? '—' })}
          </Text>
          <Text flexShrink={0} fontSize="10px" color="var(--pb-ink-faint)">
            {t(statementCount === 1 ? 'cards.statementCount.one' : 'cards.statementCount.other', { count: statementCount })}
          </Text>
        </Flex>
      </VStack>
    </Box>
  )
}

function TileAction({ label, icon, danger, onClick }: { label: string; icon: typeof Pencil; danger?: boolean; onClick: () => void }) {
  return <IconButton aria-label={label} icon={<Icon as={icon} boxSize={3.5} />} size="sm" variant="ghost" borderRadius="full" color={danger ? 'var(--pb-coral)' : 'var(--pb-ink-faint)'} _hover={{ bg: danger ? 'var(--pb-tint-coral)' : 'var(--nu-brand-tint, #f3e8fc)', color: danger ? 'var(--pb-coral)' : 'var(--nu-brand, #820ad1)' }} onClick={(event) => { event.stopPropagation(); onClick() }} />
}
