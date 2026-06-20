import { Badge, Box, Flex, HStack, Icon, IconButton, Text, VStack } from '@chakra-ui/react'

import type { PaymentMethod } from '../../types'
import { BankLogo, getBankMeta } from '../ui'
import { CreditCard, Pencil, Trash2 } from '../ui/icons'

const money = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' })
const date = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' })

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
  const limit = card.creditLimit ?? 0
  const used = usedCredit ?? currentTotal
  const hasLimit = limit > 0
  const usedPct = hasLimit ? Math.min(100, Math.max(0, (used / limit) * 100)) : 0
  const remaining = Math.max(0, limit - used)
  const utilisationColour = usedPct >= 90 ? 'var(--pb-coral-2)' : usedPct >= 70 ? 'var(--pb-gold-2)' : 'var(--pb-income-2)'

  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect()
        }
      }}
      cursor="pointer"
      textAlign="left"
      w="full"
      overflow="hidden"
      borderRadius="22px"
      border="1px solid var(--pb-hair)"
      bg="var(--pb-surface)"
      boxShadow="var(--pb-shadow)"
      transition="transform .2s ease, box-shadow .2s ease, border-color .2s ease"
      _hover={{ transform: 'translateY(-3px)', boxShadow: 'var(--pb-shadow-lift)', borderColor: 'var(--pb-hair-2)' }}
      _focusVisible={{ outline: 'none', boxShadow: '0 0 0 3px var(--pb-tint-green), var(--pb-shadow-lift)' }}
      opacity={card.active ? 1 : 0.7}
    >
      <Box h="4px" bg="linear-gradient(90deg, var(--pb-forest), var(--pb-line), var(--pb-gold-2))" />
      <VStack align="stretch" spacing={4} p={5}>
        <HStack justify="space-between" align="start">
          <HStack spacing={3} minW={0}>
            {getBankMeta(card.issuer) ? (
              <BankLogo issuer={card.issuer} size={42} borderRadius="13px" />
            ) : (
              <Flex w={10.5} h={10.5} borderRadius="13px" bg="var(--pb-surface-2)" border="1px solid var(--pb-hair)" align="center" justify="center" flexShrink={0}>
                <Icon as={CreditCard} boxSize={5} color="var(--pb-forest-2)" weight="duotone" />
              </Flex>
            )}
            <Box minW={0}>
              <Text fontSize="md" fontWeight={600} color="var(--pb-ink)" noOfLines={1}>{card.name}</Text>
              <Text fontFamily="var(--pb-mono)" fontSize="10px" letterSpacing="0.08em" textTransform="uppercase" color="var(--pb-ink-faint)" mt="1px" noOfLines={1}>{card.issuer || 'Credit card'}</Text>
            </Box>
          </HStack>
          <HStack spacing={1} flexShrink={0}>
            {!card.active && <Badge color="var(--pb-ink-soft)" bg="var(--pb-surface-3)" borderRadius="999px" textTransform="uppercase" fontSize="9px" letterSpacing="0.08em">Inactive</Badge>}
            {onEdit && <TileAction label={`Edit ${card.name}`} icon={Pencil} onClick={onEdit} />}
            {onDelete && <TileAction label={`Delete ${card.name}`} icon={Trash2} danger onClick={onDelete} />}
          </HStack>
        </HStack>

        <Box>
          <Text fontFamily="var(--pb-mono)" fontSize="10px" letterSpacing="0.16em" textTransform="uppercase" color="var(--pb-ink-faint)">Current statement</Text>
          <Text className="num" fontSize="2rem" fontWeight={500} lineHeight="1.1" letterSpacing="-0.025em" color="var(--pb-ink)" mt="0.35rem" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {hideValues ? '••••••' : money.format(currentTotal)}
          </Text>
        </Box>

        <Flex justify="space-between" align="center" pt={3} borderTop="1px solid var(--pb-hair)" gap={3}>
          <Box>
            <Text fontFamily="var(--pb-mono)" fontSize="9px" letterSpacing="0.13em" textTransform="uppercase" color="var(--pb-ink-faint)">Statement cycle</Text>
            <Text fontSize="xs" color="var(--pb-ink-soft)" mt="2px">Closes {card.statementClosingDay} · pays {card.paymentDay}</Text>
          </Box>
          <Text fontSize="xs" color="var(--pb-ink-soft)" textAlign="right">{statementCount} statement{statementCount !== 1 ? 's' : ''}</Text>
        </Flex>

        {nextPaymentDate && (
          <Flex justify="space-between" align="center" bg="var(--pb-surface-2)" borderRadius="12px" px={3} py={2.5}>
            <Box><Text fontFamily="var(--pb-mono)" fontSize="9px" letterSpacing="0.13em" textTransform="uppercase" color="var(--pb-ink-faint)">Next payment</Text><Text fontSize="xs" color="var(--pb-ink-soft)" mt="2px">Due {date.format(nextPaymentDate)}</Text></Box>
            <Text fontSize="md" fontWeight={600} color="var(--pb-ink)" style={{ fontVariantNumeric: 'tabular-nums' }}>{hideValues ? '••••••' : money.format(nextPaymentAmount)}</Text>
          </Flex>
        )}

        {hasLimit && (
          <Box>
            <Flex justify="space-between" align="baseline" mb={1.5} gap={2}>
              <Text fontFamily="var(--pb-mono)" fontSize="9px" letterSpacing="0.12em" textTransform="uppercase" color="var(--pb-ink-faint)">{hideValues ? '••••' : `${Math.round(usedPct)}% of limit`}</Text>
              <Text fontSize="xs" color="var(--pb-ink-soft)" textAlign="right" style={{ fontVariantNumeric: 'tabular-nums' }}>{hideValues ? '••••••' : `${money.format(remaining)} available`}</Text>
            </Flex>
            <Box h="6px" w="full" bg="var(--pb-surface-3)" borderRadius="full" overflow="hidden"><Box h="full" w={`${usedPct}%`} bg={utilisationColour} borderRadius="full" transition="width .4s ease" /></Box>
          </Box>
        )}

        {card.settlementAccountName && <Text fontSize="xs" color="var(--pb-ink-faint)" noOfLines={1}>Paid from {card.settlementAccountName}</Text>}
      </VStack>
    </Box>
  )
}

function TileAction({ label, icon, danger, onClick }: { label: string; icon: typeof Pencil; danger?: boolean; onClick: () => void }) {
  return <IconButton aria-label={label} icon={<Icon as={icon} boxSize={3.5} />} size="sm" variant="ghost" borderRadius="9px" color={danger ? 'var(--pb-coral)' : 'var(--pb-ink-faint)'} _hover={{ bg: danger ? 'var(--pb-tint-coral)' : 'var(--pb-surface-2)', color: danger ? 'var(--pb-coral)' : 'var(--pb-ink)' }} onClick={(event) => { event.stopPropagation(); onClick() }} />
}
