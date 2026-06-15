import {
  Badge,
  Box,
  Flex,
  HStack,
  Icon,
  IconButton,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { useEd } from '../../editorial'
import type { PaymentMethod } from '../../types'
import { BankLogo, getBankMeta } from '../ui'
import { CreditCard, Pencil, Trash2 } from '../ui/icons'

const moneyFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
})

export interface CreditCardTileProps {
  card: PaymentMethod
  /** Total of the current open statement, if any. */
  currentTotal: number
  statementCount: number
  hideValues?: boolean
  onSelect: () => void
  onEdit?: () => void
  onDelete?: () => void
}

export default function CreditCardTile({
  card,
  currentTotal,
  statementCount,
  hideValues = false,
  onSelect,
  onEdit,
  onDelete,
}: CreditCardTileProps) {
  const ed = useEd()
  const border = useColorModeValue('gray.200', 'whiteAlpha.200')
  const muted = useColorModeValue('gray.500', 'gray.400')
  const subtleBase = useColorModeValue('gray.50', 'whiteAlpha.50')
  // Card translúcido padrão (ed.panel) nos dois modos — consistente com a plataforma.
  const subtle = ed ? ed.panel : subtleBase
  const iconBoxBg = useColorModeValue('white', 'whiteAlpha.100')
  const hasMeta = Boolean(getBankMeta(card.issuer))

  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
      cursor="pointer"
      textAlign="left"
      w="full"
      borderRadius="2xl"
      border="1px solid"
      borderColor={border}
      bg={subtle}
      p={5}
      transition="all 0.18s ease"
      _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg', borderColor: 'blue.300' }}
      _focusVisible={{ outline: 'none', boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.35)' }}
      opacity={card.active ? 1 : 0.6}
    >
      <VStack align="stretch" spacing={4}>
        <HStack justify="space-between" align="start">
          <HStack spacing={3} minW={0}>
            {hasMeta ? (
              <BankLogo issuer={card.issuer} size={40} borderRadius="12px" />
            ) : (
              <Flex
                w={10}
                h={10}
                borderRadius="xl"
                bg={iconBoxBg}
                border="1px solid"
                borderColor={border}
                align="center"
                justify="center"
                flexShrink={0}
              >
                <Icon as={CreditCard} boxSize={5} color={muted} />
              </Flex>
            )}
            <Box minW={0}>
              <Text fontWeight={800} fontSize="md" noOfLines={1}>
                {card.name}
              </Text>
              <Text fontSize="xs" color={muted} noOfLines={1}>
                {card.issuer || 'Credit card'}
              </Text>
            </Box>
          </HStack>
          {(onEdit || onDelete) && (
            <HStack spacing={1} flexShrink={0}>
              {onEdit && (
                <IconButton
                  aria-label={`Edit ${card.name}`}
                  icon={<Icon as={Pencil} boxSize={3.5} />}
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit()
                  }}
                />
              )}
              {onDelete && (
                <IconButton
                  aria-label={`Delete ${card.name}`}
                  icon={<Icon as={Trash2} boxSize={3.5} />}
                  size="sm"
                  variant="ghost"
                  colorScheme="red"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete()
                  }}
                />
              )}
            </HStack>
          )}
        </HStack>

        <HStack justify="space-between" align="end">
          <Box>
            <Text fontSize="2xs" color={muted} textTransform="uppercase" letterSpacing="0.05em" fontWeight={700}>
              Current statement
            </Text>
            <Text fontSize="xl" fontWeight={800} sx={{ fontVariantNumeric: 'tabular-nums' }}>
              {hideValues ? '••••••' : moneyFormatter.format(currentTotal)}
            </Text>
          </Box>
          <VStack align="end" spacing={1}>
            {!card.active && (
              <Badge colorScheme="gray" borderRadius="full" textTransform="none">
                Inactive
              </Badge>
            )}
            <Text fontSize="2xs" color={muted}>
              closes {card.statementClosingDay} · pays {card.paymentDay}
            </Text>
            <Text fontSize="2xs" color={muted}>
              {statementCount} statement{statementCount !== 1 ? 's' : ''}
            </Text>
          </VStack>
        </HStack>
      </VStack>
    </Box>
  )
}
