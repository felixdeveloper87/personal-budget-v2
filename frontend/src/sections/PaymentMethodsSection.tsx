import { useEffect, useMemo, useState } from 'react'
import {
  Badge,
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Icon,
  IconButton,
  Input,
  NumberInput,
  NumberInputField,
  Select,
  SimpleGrid,
  Switch,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { createPaymentMethod, deletePaymentMethod, listPaymentMethods } from '../api'
import { PaymentMethod, PaymentMethodRequest, PaymentMethodType } from '../types'
import { CreditCard, Plus, Trash2, Wallet } from '../components/ui/icons'
import { SectionCard, SectionHeader } from '../components/ui'
import { ToastService } from '../services/toast'

const TYPE_LABELS: Record<PaymentMethodType, string> = {
  CASH: 'Cash',
  DEBIT_CARD: 'Debit card',
  CREDIT_CARD: 'Credit card',
  BANK_TRANSFER: 'Bank transfer',
}

export default function PaymentMethodsSection() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [issuer, setIssuer] = useState('')
  const [type, setType] = useState<PaymentMethodType>('CREDIT_CARD')
  const [active, setActive] = useState(true)
  const [statementClosingDay, setStatementClosingDay] = useState(3)
  const [paymentDay, setPaymentDay] = useState(28)

  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200')
  const mutedColor = useColorModeValue('gray.500', 'gray.400')

  const activeCards = useMemo(
    () => paymentMethods.filter((method) => method.active && method.type === 'CREDIT_CARD').length,
    [paymentMethods]
  )

  const loadPaymentMethods = async () => {
    setLoading(true)
    try {
      setPaymentMethods(await listPaymentMethods())
    } catch (err) {
      ToastService.apiError(err, {
        title: 'Could not load payment methods',
        dedupeKey: 'payment-methods-section-load-failed',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPaymentMethods()
  }, [])

  const savePaymentMethod = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      const request: PaymentMethodRequest = {
        name: name.trim(),
        issuer: issuer.trim() || null,
        type,
        active,
        statementClosingDay: type === 'CREDIT_CARD' ? statementClosingDay : null,
        paymentDay: type === 'CREDIT_CARD' ? paymentDay : null,
      }
      await createPaymentMethod(request)
      setName('')
      setIssuer('')
      setType('CREDIT_CARD')
      setActive(true)
      setStatementClosingDay(3)
      setPaymentDay(28)
      await loadPaymentMethods()
      ToastService.success({
        title: 'Payment method saved',
        dedupeKey: 'payment-method-saved',
      })
    } catch (err) {
      ToastService.apiError(err, {
        title: 'Could not save payment method',
        dedupeKey: 'payment-method-save-failed',
      })
    } finally {
      setSaving(false)
    }
  }

  const removePaymentMethod = async (id: number) => {
    try {
      await deletePaymentMethod(id)
      await loadPaymentMethods()
    } catch (err) {
      ToastService.apiError(err, {
        title: 'Could not delete payment method',
        dedupeKey: `payment-method-delete-failed:${id}`,
      })
    }
  }

  return (
    <SectionCard staticOnHover>
      <Box p={{ base: 4, sm: 5, md: 6 }}>
        <VStack spacing={4} align="stretch">
          <SectionHeader
            icon={CreditCard}
            title="Payment methods"
            caption={`${paymentMethods.length} methods, ${activeCards} active credit cards`}
            accent="blue"
          />

          <VStack spacing={3} align="stretch">
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
              <FormControl>
                <FormLabel fontSize="xs">Name</FormLabel>
                <Input size="sm" value={name} onChange={(event) => setName(event.target.value)} placeholder="NatWest Rewards" />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="xs">Issuer</FormLabel>
                <Input size="sm" value={issuer} onChange={(event) => setIssuer(event.target.value)} placeholder="NatWest" />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="xs">Type</FormLabel>
                <Select size="sm" value={type} onChange={(event) => setType(event.target.value as PaymentMethodType)}>
                  {Object.entries(TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl display="flex" alignItems="end" justifyContent="space-between">
                <FormLabel fontSize="xs" mb={2}>Active</FormLabel>
                <Switch isChecked={active} onChange={(event) => setActive(event.target.checked)} />
              </FormControl>
              {type === 'CREDIT_CARD' && (
                <>
                  <FormControl>
                    <FormLabel fontSize="xs">Closing day</FormLabel>
                    <NumberInput size="sm" min={1} max={31} value={statementClosingDay} onChange={(_, value) => setStatementClosingDay(value || 1)}>
                      <NumberInputField />
                    </NumberInput>
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="xs">Payment day</FormLabel>
                    <NumberInput size="sm" min={1} max={31} value={paymentDay} onChange={(_, value) => setPaymentDay(value || 1)}>
                      <NumberInputField />
                    </NumberInput>
                  </FormControl>
                </>
              )}
            </SimpleGrid>
            <Button
              size="sm"
              leftIcon={<Icon as={Plus} boxSize={4} />}
              onClick={savePaymentMethod}
              isLoading={saving}
              isDisabled={!name.trim()}
              colorScheme="blue"
            >
              Add method
            </Button>
          </VStack>

          <VStack spacing={2} align="stretch">
            {paymentMethods.length === 0 && (
              <Text fontSize="sm" color={mutedColor}>
                {loading ? 'Loading payment methods...' : 'No payment methods yet.'}
              </Text>
            )}
            {paymentMethods.map((method) => (
              <HStack
                key={method.id}
                justify="space-between"
                p={3}
                border="1px solid"
                borderColor={borderColor}
                borderRadius="lg"
              >
                <HStack spacing={3} minW={0}>
                  <Icon as={method.type === 'CREDIT_CARD' ? CreditCard : Wallet} boxSize={4} />
                  <Box minW={0}>
                    <Text fontSize="sm" fontWeight={700} noOfLines={1}>{method.name}</Text>
                    <Text fontSize="xs" color={mutedColor} noOfLines={1}>
                      {TYPE_LABELS[method.type]}{method.issuer ? ` - ${method.issuer}` : ''}
                      {method.type === 'CREDIT_CARD' ? ` - closes ${method.statementClosingDay}, pays ${method.paymentDay}` : ''}
                    </Text>
                  </Box>
                </HStack>
                <HStack spacing={2}>
                  <Badge colorScheme={method.active ? 'green' : 'gray'}>{method.active ? 'Active' : 'Inactive'}</Badge>
                  <IconButton
                    aria-label="Delete payment method"
                    icon={<Icon as={Trash2} boxSize={4} />}
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    onClick={() => removePaymentMethod(method.id)}
                  />
                </HStack>
              </HStack>
            ))}
          </VStack>
        </VStack>
      </Box>
    </SectionCard>
  )
}
