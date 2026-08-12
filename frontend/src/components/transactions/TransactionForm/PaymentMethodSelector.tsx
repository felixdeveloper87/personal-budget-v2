import {
  Box,
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
import ChipCarousel from './ChipCarousel'
import { PaymentMethod, PaymentMethodType } from '../../../types'
import { useI18n } from '../../../i18n'

interface PaymentMethodSelectorProps {
  value: number | null
  onChange: (value: number | null) => void
  paymentMethods: PaymentMethod[]
  loading?: boolean
}

const TYPE_LABEL_KEY: Record<PaymentMethodType, string> = {
  CASH: 'form.cash',
  DEBIT_CARD: 'form.debitCard',
  CREDIT_CARD: 'form.creditCard',
  BANK_TRANSFER: 'form.bankTransfer',
}

export default function PaymentMethodSelector({
  value,
  onChange,
  paymentMethods,
  loading = false,
}: PaymentMethodSelectorProps) {
  const { t } = useI18n()
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
    role: 'group',
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
    transition: 'border-color 0.18s ease, box-shadow 0.18s ease',
    sx: { scrollSnapAlign: 'start' },
    _hover: { borderColor: accent },
    _focusVisible: { outline: '2px solid', outlineColor: accent, outlineOffset: '2px' },
  })

  return (
    <FormControl minW={0}>
      <FormLabel fontSize="sm" fontWeight={700}>
        {t('form.paymentMethod')}
      </FormLabel>

      {loading ? (
        <Box border="1px solid" borderColor={borderColor} borderRadius="lg" p={3}>
          <Text fontSize="sm" color={captionColor}>{t('form.loadingPaymentMethods')}</Text>
        </Box>
      ) : (
        // Single horizontal line of real-icon method chips; scrolls (carousel)
        // when there are more than fit, with chevrons on wider screens.
        <ChipCarousel>
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
                <Text
                  noOfLines={1}
                  fontWeight={700}
                  fontSize="sm"
                  color={nameColor}
                  _groupHover={{ textDecoration: 'underline' }}
                >
                  {t('form.debitCard')}
                </Text>
                <Text noOfLines={1} fontSize="xs" color={captionColor}>
                  {t('form.default')}
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
                    <Text
                      noOfLines={1}
                      fontWeight={700}
                      fontSize="sm"
                      color={nameColor}
                      _groupHover={{ textDecoration: 'underline' }}
                    >
                      {method.name}
                    </Text>
                    <Text noOfLines={1} fontSize="xs" color={captionColor}>
                      {method.issuer || t(TYPE_LABEL_KEY[method.type])}
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            )
          })}
        </ChipCarousel>
      )}

      {selected?.type === 'CREDIT_CARD' && (
        <Text mt={2} fontSize="xs" color={captionColor}>
          {t('form.cardDates', {
            closing: selected.statementClosingDay ?? '—',
            payment: selected.paymentDay ?? '—',
          })}
        </Text>
      )}
      {!selected && (
        <Text mt={2} fontSize="xs" color={captionColor}>
          {t('form.paymentMethodHelp')}
        </Text>
      )}
    </FormControl>
  )
}
