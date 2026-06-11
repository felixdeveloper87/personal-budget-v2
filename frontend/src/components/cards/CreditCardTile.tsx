import {
  Badge,
  Box,
  Flex,
  HStack,
  Icon,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import type { PaymentMethod } from '../../types'
import { BankLogo, getBankMeta } from '../ui'
import { ChevronRight, CreditCard } from '../ui/icons'

const moneyFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
})

export interface CreditCardTileProps {
  card: PaymentMethod
  /** Total of the current open statement, if any. */
  currentTotal: number
  statementCount: number
  onSelect: () => void
}

export default function CreditCardTile({
  card,
  currentTotal,
  statementCount,
  onSelect,
}: CreditCardTileProps) {
  const border = useColorModeValue('gray.200', 'whiteAlpha.200')
  const muted = useColorModeValue('gray.500', 'gray.400')
  const subtle = useColorModeValue('gray.50', 'whiteAlpha.50')
  const iconBoxBg = useColorModeValue('white', 'whiteAlpha.100')
  const hasMeta = Boolean(getBankMeta(card.issuer))

  return (
    <Box
      as="button"
      type="button"
      onClick={onSelect}
      textAlign="left"
      w="full"
      borderRadius="2xl"
      border="1px solid"
      borderColor={border}
      bg={subtle}
      p={5}
      transition="all 0.18s ease"
      _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg', borderColor: 'blue.300' }}
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
          <Icon as={ChevronRight} boxSize={5} color={muted} flexShrink={0} />
        </HStack>

        <HStack justify="space-between" align="end">
          <Box>
            <Text fontSize="2xs" color={muted} textTransform="uppercase" letterSpacing="0.05em" fontWeight={700}>
              Current statement
            </Text>
            <Text fontSize="xl" fontWeight={800} sx={{ fontVariantNumeric: 'tabular-nums' }}>
              {moneyFormatter.format(currentTotal)}
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
