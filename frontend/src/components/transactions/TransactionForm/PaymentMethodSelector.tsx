import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Icon,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { CreditCard, Wallet } from '../../ui/icons'
import { BankLogo, getBankMeta } from '../../ui'
import { PaymentMethod, PaymentMethodType } from '../../../types'

interface PaymentMethodSelectorProps {
  value: number | null
  onChange: (value: number | null) => void
  paymentMethods: PaymentMethod[]
  loading?: boolean
}

const TYPE_LABEL: Record<PaymentMethodType, string> = {
  CASH: 'Cash',
  DEBIT_CARD: 'Debit card',
  CREDIT_CARD: 'Credit card',
  BANK_TRANSFER: 'Bank transfer',
}

export default function PaymentMethodSelector({
  value,
  onChange,
  paymentMethods,
  loading = false,
}: PaymentMethodSelectorProps) {
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200')
  const captionColor = useColorModeValue('gray.500', 'gray.400')
  const cardBg = useColorModeValue('white', 'whiteAlpha.50')
  const selectedBg = useColorModeValue('blue.50', 'whiteAlpha.100')
  const nameColor = useColorModeValue('gray.800', 'gray.100')
  const iconBg = useColorModeValue('gray.100', 'whiteAlpha.100')
  const accent = useColorModeValue('#2563eb', '#60a5fa')

  const activeMethods = paymentMethods.filter((m) => m.active)
  const selected = activeMethods.find((m) => m.id === value)

  const chipProps = (isSelected: boolean) => ({
    as: 'button' as const,
    type: 'button' as const,
    textAlign: 'left' as const,
    flex: '0 0 auto',
    minW: '160px',
    maxW: '220px',
    borderRadius: 'xl',
    px: 3,
    py: 2.5,
    border: '2px solid',
    borderColor: isSelected ? accent : borderColor,
    bg: isSelected ? selectedBg : cardBg,
    boxShadow: isSelected ? `0 12px 30px -18px ${accent}` : 'none',
    transition: 'transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease',
    sx: { scrollSnapAlign: 'start' },
    _hover: { transform: 'translateY(-2px)', borderColor: accent },
    _focusVisible: { outline: '2px solid', outlineColor: accent, outlineOffset: '2px' },
  })

  return (
    <FormControl>
      <FormLabel fontSize="sm" fontWeight={700}>
        Payment method (how you paid)
      </FormLabel>

      {loading ? (
        <Box border="1px solid" borderColor={borderColor} borderRadius="lg" p={3}>
          <Text fontSize="sm" color={captionColor}>Loading payment methods…</Text>
        </Box>
      ) : (
        // Single horizontal line of real-icon method chips; scrolls (carousel)
        // when there are more than fit. A leading "None" clears the choice.
        <Flex
          direction="row"
          gap={2.5}
          overflowX="auto"
          pb={1}
          mx={-1}
          px={1}
          sx={{
            scrollSnapType: 'x proximity',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
            '::-webkit-scrollbar': { display: 'none' },
          }}
        >
          <Box {...chipProps(value === null)} onClick={() => onChange(null)}>
            <HStack spacing={2.5} align="center">
              <Box
                boxSize="34px"
                borderRadius="10px"
                bg={iconBg}
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
              >
                <Icon as={CreditCard} boxSize={4} />
              </Box>
              <VStack align="flex-start" spacing={0} minW={0}>
                <Text noOfLines={1} fontWeight={700} fontSize="sm" color={nameColor}>
                  Debit card
                </Text>
                <Text noOfLines={1} fontSize="xs" color={captionColor}>
                  Default
                </Text>
              </VStack>
            </HStack>
          </Box>

          {activeMethods.map((method) => {
            const isSelected = method.id === value
            const hasLogo = getBankMeta(method.issuer) !== null
            const FallbackIcon =
              method.type === 'CREDIT_CARD' || method.type === 'DEBIT_CARD' ? CreditCard : Wallet
            return (
              <Box key={method.id} {...chipProps(isSelected)} onClick={() => onChange(method.id)}>
                <HStack spacing={2.5} align="center">
                  {hasLogo ? (
                    <BankLogo issuer={method.issuer} size={34} borderRadius="10px" />
                  ) : (
                    <Box
                      boxSize="34px"
                      borderRadius="10px"
                      bg={iconBg}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      flexShrink={0}
                    >
                      <Icon as={FallbackIcon} boxSize={4} />
                    </Box>
                  )}
                  <VStack align="flex-start" spacing={0} minW={0}>
                    <Text noOfLines={1} fontWeight={700} fontSize="sm" color={nameColor}>
                      {method.name}
                    </Text>
                    <Text noOfLines={1} fontSize="xs" color={captionColor}>
                      {method.issuer || TYPE_LABEL[method.type]}
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            )
          })}
        </Flex>
      )}

      {selected?.type === 'CREDIT_CARD' && (
        <Text mt={2} fontSize="xs" color={captionColor}>
          Closes on day {selected.statementClosingDay} · paid on day {selected.paymentDay}
        </Text>
      )}
      {!selected && (
        <Text mt={2} fontSize="xs" color={captionColor}>
          Defaults to debit card. The balance account above is still required.
        </Text>
      )}
    </FormControl>
  )
}
