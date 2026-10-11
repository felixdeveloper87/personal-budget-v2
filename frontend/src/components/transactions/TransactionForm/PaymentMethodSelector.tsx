import {
  Box,
  FormControl,
  FormLabel,
  Icon,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { CreditCard, Wallet } from '../../ui/icons'
import { BankLogo, getBankMeta } from '../../ui'
import PagedGrid, { tileStyle } from './PagedGrid'
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
  const iconBg = useColorModeValue('gray.100', 'whiteAlpha.100')

  const activeMethods = paymentMethods.filter((m) => m.active)
  const selected = activeMethods.find((m) => m.id === value)

  // `null` = the default debit card, offered as the first tile.
  const options: Array<PaymentMethod | null> = [null, ...activeMethods]

  const methodIcon = (method: PaymentMethod | null) => {
    if (method && getBankMeta(method.issuer) !== null) {
      return <BankLogo issuer={method.issuer} size={32} borderRadius="10px" />
    }
    const FallbackIcon =
      !method || method.type === 'CREDIT_CARD' || method.type === 'DEBIT_CARD' ? CreditCard : Wallet
    return (
      <Box
        boxSize="32px"
        borderRadius="10px"
        bg={iconBg}
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexShrink={0}
      >
        <Icon as={FallbackIcon} boxSize={4} />
      </Box>
    )
  }

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
        <PagedGrid
          items={options}
          getKey={(method) => (method ? String(method.id) : 'default')}
          initialIndex={options.findIndex((method) => (method?.id ?? null) === value)}
          label={t('form.paymentMethod')}
          renderItem={(method) => {
            const isSelected = (method?.id ?? null) === value
            return (
              <Box
                as="button"
                type="button"
                aria-pressed={isSelected}
                onClick={() => onChange(method?.id ?? null)}
                {...tileStyle(isSelected)}
              >
                {methodIcon(method)}
                <VStack align="flex-start" spacing={0} minW={0} ml={2}>
                  <Text noOfLines={2} lineHeight="1.15" fontWeight={800} fontSize="sm" wordBreak="break-word">
                    {method ? method.name : t('form.debitCard')}
                  </Text>
                  <Text noOfLines={1} fontSize="xs" fontWeight={600} color={captionColor}>
                    {method ? method.issuer || t(TYPE_LABEL_KEY[method.type]) : t('form.default')}
                  </Text>
                </VStack>
              </Box>
            )
          }}
        />
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
