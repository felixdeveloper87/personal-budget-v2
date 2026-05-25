import { useEffect, useMemo, useState } from 'react'
import {
  Badge,
  Box,
  Button,
  Collapse,
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
import { createPaymentMethod, deletePaymentMethod, listPaymentMethods, updatePaymentMethod } from '../api'
import { PaymentMethod, PaymentMethodRequest, PaymentMethodType } from '../types'
import { Check, ChevronDown, CreditCard, Pencil, Plus, Trash2, Wallet } from '../components/ui/icons'
import { BankLogo, getBankMeta, SectionCard, SectionHeader, UK_BANKS } from '../components/ui'
import { ToastService } from '../services/toast'

const TYPE_LABELS: Record<PaymentMethodType, string> = {
  CASH: 'Cash',
  DEBIT_CARD: 'Debit card',
  CREDIT_CARD: 'Credit card',
  BANK_TRANSFER: 'Bank transfer',
}

const TYPE_ICONS: Record<PaymentMethodType, typeof CreditCard> = {
  CREDIT_CARD: CreditCard,
  DEBIT_CARD: CreditCard,
  CASH: Wallet,
  BANK_TRANSFER: Wallet,
}

interface EditState {
  name: string
  issuer: string
  type: PaymentMethodType
  active: boolean
  statementClosingDay: number
  paymentDay: number
}

const DEFAULT_EDIT: EditState = {
  name: '',
  issuer: '',
  type: 'CREDIT_CARD',
  active: true,
  statementClosingDay: 3,
  paymentDay: 28,
}

export default function PaymentMethodsSection() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [updating, setUpdating] = useState<number | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editState, setEditState] = useState<EditState>(DEFAULT_EDIT)

  // Add-form state
  const [name, setName] = useState('')
  const [issuer, setIssuer] = useState('')
  const [type, setType] = useState<PaymentMethodType>('CREDIT_CARD')
  const [active, setActive] = useState(true)
  const [statementClosingDay, setStatementClosingDay] = useState(3)
  const [paymentDay, setPaymentDay] = useState(28)

  const borderColor = useColorModeValue('gray.100', 'whiteAlpha.100')
  const mutedColor = useColorModeValue('gray.500', 'gray.400')
  const emptyColor = useColorModeValue('gray.400', 'gray.600')
  const methodBg = useColorModeValue('gray.50', 'whiteAlpha.50')
  const methodHoverBg = useColorModeValue('white', 'whiteAlpha.100')
  const addLinkColor = useColorModeValue('blue.500', 'blue.300')
  const formBg = useColorModeValue('blue.50', 'rgba(37,99,235,0.06)')
  const formBorder = useColorModeValue('blue.100', 'rgba(37,99,235,0.2)')
  const editFormBg = useColorModeValue('gray.50', 'rgba(255,255,255,0.03)')
  const editFormBorder = useColorModeValue('gray.200', 'whiteAlpha.150')
  const iconBoxBg = useColorModeValue('white', 'whiteAlpha.100')

  const activeCards = useMemo(
    () => paymentMethods.filter((m) => m.active && m.type === 'CREDIT_CARD').length,
    [paymentMethods],
  )

  const load = async () => {
    setLoading(true)
    try {
      setPaymentMethods(await listPaymentMethods())
    } catch (err) {
      ToastService.apiError(err, { title: 'Could not load payment methods', dedupeKey: 'pm-load-failed' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const resetAddForm = () => {
    setName('')
    setIssuer('')
    setType('CREDIT_CARD')
    setActive(true)
    setStatementClosingDay(3)
    setPaymentDay(28)
    setShowAddForm(false)
  }

  const startEdit = (method: PaymentMethod) => {
    // Close add-form if open
    if (showAddForm) resetAddForm()
    setEditingId(method.id)
    setEditState({
      name: method.name,
      issuer: method.issuer ?? '',
      type: method.type,
      active: method.active,
      statementClosingDay: method.statementClosingDay ?? 3,
      paymentDay: method.paymentDay ?? 28,
    })
  }

  const cancelEdit = () => setEditingId(null)

  const patch = (partial: Partial<EditState>) =>
    setEditState((prev) => ({ ...prev, ...partial }))

  const saveAdd = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      await createPaymentMethod({
        name: name.trim(),
        issuer: issuer.trim() || null,
        type,
        active,
        statementClosingDay: type === 'CREDIT_CARD' ? statementClosingDay : null,
        paymentDay: type === 'CREDIT_CARD' ? paymentDay : null,
      })
      resetAddForm()
      await load()
      ToastService.success({ title: 'Payment method added', dedupeKey: 'pm-saved' })
    } catch (err) {
      ToastService.apiError(err, { title: 'Could not save payment method', dedupeKey: 'pm-save-failed' })
    } finally {
      setSaving(false)
    }
  }

  const saveEdit = async (id: number) => {
    if (!editState.name.trim()) return
    setUpdating(id)
    try {
      const request: PaymentMethodRequest = {
        name: editState.name.trim(),
        issuer: editState.issuer.trim() || null,
        type: editState.type,
        active: editState.active,
        statementClosingDay: editState.type === 'CREDIT_CARD' ? editState.statementClosingDay : null,
        paymentDay: editState.type === 'CREDIT_CARD' ? editState.paymentDay : null,
      }
      await updatePaymentMethod(id, request)
      setEditingId(null)
      await load()
      ToastService.success({ title: 'Payment method updated', dedupeKey: 'pm-updated' })
    } catch (err) {
      ToastService.apiError(err, { title: 'Could not update payment method', dedupeKey: `pm-update-failed:${id}` })
    } finally {
      setUpdating(null)
    }
  }

  const remove = async (id: number) => {
    try {
      await deletePaymentMethod(id)
      if (editingId === id) setEditingId(null)
      await load()
    } catch (err) {
      ToastService.apiError(err, { title: 'Could not delete payment method', dedupeKey: `pm-delete-failed:${id}` })
    }
  }

  return (
    <SectionCard staticOnHover>
      {/* Shared datalist for both add and edit issuer inputs */}
      <datalist id="uk-banks-list">
        {UK_BANKS.map((b) => <option key={b} value={b} />)}
      </datalist>

      <Box p={{ base: 4, sm: 5, md: 6 }}>
        <VStack spacing={4} align="stretch">
          <SectionHeader
            icon={CreditCard}
            title="Payment methods"
            caption={`${paymentMethods.length} method${paymentMethods.length !== 1 ? 's' : ''} · ${activeCards} active credit card${activeCards !== 1 ? 's' : ''}`}
            accent="blue"
          />

          {/* Methods list */}
          <VStack spacing={2} align="stretch">
            {paymentMethods.length === 0 && (
              <Box
                py={6}
                textAlign="center"
                border="1px dashed"
                borderColor={borderColor}
                borderRadius="xl"
              >
                <Icon as={CreditCard} boxSize={6} color={emptyColor} mb={2} display="block" mx="auto" />
                <Text fontSize="sm" color={mutedColor}>
                  {loading ? 'Loading...' : 'No payment methods yet.'}
                </Text>
              </Box>
            )}

            {paymentMethods.map((method) => {
              const isEditing = editingId === method.id
              return (
                <Box key={method.id}>
                  {/* Row */}
                  <HStack
                    justify="space-between"
                    p={3}
                    bg={isEditing ? methodHoverBg : methodBg}
                    border="1px solid"
                    borderColor={isEditing ? formBorder : borderColor}
                    borderBottomRadius={isEditing ? 'none' : 'xl'}
                    borderTopRadius="xl"
                    transition="all 0.15s ease"
                    _hover={{ bg: methodHoverBg }}
                  >
                    <HStack spacing={3} minW={0}>
                      {getBankMeta(method.issuer) ? (
                        <BankLogo issuer={method.issuer} size={30} borderRadius="8px" />
                      ) : (
                        <Box
                          p={1.5}
                          borderRadius="lg"
                          bg={iconBoxBg}
                          border="1px solid"
                          borderColor={borderColor}
                          flexShrink={0}
                        >
                          <Icon as={TYPE_ICONS[method.type]} boxSize={3.5} color={mutedColor} />
                        </Box>
                      )}
                      <Box minW={0}>
                        <Text fontSize="sm" fontWeight={700} noOfLines={1}>{method.name}</Text>
                        <Text fontSize="xs" color={mutedColor} noOfLines={1}>
                          {TYPE_LABELS[method.type]}
                          {method.issuer ? ` · ${method.issuer}` : ''}
                          {method.type === 'CREDIT_CARD'
                            ? ` · closes ${method.statementClosingDay}, pays ${method.paymentDay}`
                            : ''}
                        </Text>
                      </Box>
                    </HStack>

                    <HStack spacing={1} flexShrink={0}>
                      <Badge
                        fontSize="2xs"
                        fontWeight={700}
                        px={1.5}
                        py={0.5}
                        borderRadius="full"
                        colorScheme={method.active ? 'green' : 'gray'}
                        textTransform="none"
                      >
                        {method.active ? 'Active' : 'Inactive'}
                      </Badge>
                      <IconButton
                        aria-label="Edit"
                        icon={<Icon as={isEditing ? Check : Pencil} boxSize={3.5} />}
                        size="xs"
                        variant="ghost"
                        colorScheme={isEditing ? 'blue' : 'gray'}
                        onClick={() => isEditing ? saveEdit(method.id) : startEdit(method)}
                        isLoading={updating === method.id}
                      />
                      <IconButton
                        aria-label="Remove"
                        icon={<Icon as={Trash2} boxSize={3.5} />}
                        size="xs"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => remove(method.id)}
                      />
                    </HStack>
                  </HStack>

                  {/* Inline edit form */}
                  <Collapse in={isEditing} animateOpacity>
                    <Box
                      p={4}
                      bg={editFormBg}
                      border="1px solid"
                      borderTop="none"
                      borderColor={formBorder}
                      borderBottomRadius="xl"
                    >
                      <VStack spacing={3} align="stretch">
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                          <FormControl>
                            <FormLabel fontSize="xs">Name</FormLabel>
                            <Input
                              size="sm"
                              value={editState.name}
                              onChange={(e) => patch({ name: e.target.value })}
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel fontSize="xs">Issuer</FormLabel>
                            <Input
                              list="uk-banks-list"
                              size="sm"
                              value={editState.issuer}
                              onChange={(e) => patch({ issuer: e.target.value })}
                              placeholder="e.g. NatWest"
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel fontSize="xs">Type</FormLabel>
                            <Select
                              size="sm"
                              value={editState.type}
                              onChange={(e) => patch({ type: e.target.value as PaymentMethodType })}
                            >
                              {Object.entries(TYPE_LABELS).map(([v, l]) => (
                                <option key={v} value={v}>{l}</option>
                              ))}
                            </Select>
                          </FormControl>
                          <FormControl display="flex" alignItems="end" justifyContent="space-between">
                            <FormLabel fontSize="xs" mb={2}>Active</FormLabel>
                            <Switch
                              isChecked={editState.active}
                              onChange={(e) => patch({ active: e.target.checked })}
                            />
                          </FormControl>
                          {editState.type === 'CREDIT_CARD' && (
                            <>
                              <FormControl>
                                <FormLabel fontSize="xs">Closing day</FormLabel>
                                <NumberInput
                                  size="sm"
                                  min={1}
                                  max={31}
                                  value={editState.statementClosingDay}
                                  onChange={(_, v) => patch({ statementClosingDay: v || 1 })}
                                >
                                  <NumberInputField />
                                </NumberInput>
                              </FormControl>
                              <FormControl>
                                <FormLabel fontSize="xs">Payment day</FormLabel>
                                <NumberInput
                                  size="sm"
                                  min={1}
                                  max={31}
                                  value={editState.paymentDay}
                                  onChange={(_, v) => patch({ paymentDay: v || 1 })}
                                >
                                  <NumberInputField />
                                </NumberInput>
                              </FormControl>
                            </>
                          )}
                        </SimpleGrid>
                        <HStack justify="flex-end" spacing={2}>
                          <Button size="sm" variant="ghost" onClick={cancelEdit}>Cancel</Button>
                          <Button
                            size="sm"
                            colorScheme="blue"
                            leftIcon={<Icon as={Check} boxSize={3.5} />}
                            onClick={() => saveEdit(method.id)}
                            isLoading={updating === method.id}
                            isDisabled={!editState.name.trim()}
                          >
                            Save changes
                          </Button>
                        </HStack>
                      </VStack>
                    </Box>
                  </Collapse>
                </Box>
              )
            })}
          </VStack>

          {/* Add new */}
          <Box>
            <Button
              variant="ghost"
              size="sm"
              h="auto"
              py={1.5}
              px={2}
              color={addLinkColor}
              fontWeight={600}
              fontSize="sm"
              leftIcon={<Icon as={showAddForm ? ChevronDown : Plus} boxSize={3.5} />}
              onClick={() => {
                if (editingId !== null) cancelEdit()
                setShowAddForm((v) => !v)
              }}
              _hover={{ bg: 'transparent', opacity: 0.8 }}
            >
              {showAddForm ? 'Cancel' : 'Add new payment method'}
            </Button>

            <Collapse in={showAddForm} animateOpacity>
              <Box
                mt={3}
                p={4}
                bg={formBg}
                border="1px solid"
                borderColor={formBorder}
                borderRadius="xl"
              >
                <VStack spacing={3} align="stretch">
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                    <FormControl>
                      <FormLabel fontSize="xs">Name</FormLabel>
                      <Input size="sm" value={name} onChange={(e) => setName(e.target.value)} placeholder="NatWest Rewards" />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="xs">Issuer</FormLabel>
                      <Input list="uk-banks-list" size="sm" value={issuer} onChange={(e) => setIssuer(e.target.value)} placeholder="NatWest" />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="xs">Type</FormLabel>
                      <Select size="sm" value={type} onChange={(e) => setType(e.target.value as PaymentMethodType)}>
                        {Object.entries(TYPE_LABELS).map(([v, l]) => (
                          <option key={v} value={v}>{l}</option>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl display="flex" alignItems="end" justifyContent="space-between">
                      <FormLabel fontSize="xs" mb={2}>Active</FormLabel>
                      <Switch isChecked={active} onChange={(e) => setActive(e.target.checked)} />
                    </FormControl>
                    {type === 'CREDIT_CARD' && (
                      <>
                        <FormControl>
                          <FormLabel fontSize="xs">Closing day</FormLabel>
                          <NumberInput size="sm" min={1} max={31} value={statementClosingDay} onChange={(_, v) => setStatementClosingDay(v || 1)}>
                            <NumberInputField />
                          </NumberInput>
                        </FormControl>
                        <FormControl>
                          <FormLabel fontSize="xs">Payment day</FormLabel>
                          <NumberInput size="sm" min={1} max={31} value={paymentDay} onChange={(_, v) => setPaymentDay(v || 1)}>
                            <NumberInputField />
                          </NumberInput>
                        </FormControl>
                      </>
                    )}
                  </SimpleGrid>
                  <HStack justify="flex-end" spacing={2}>
                    <Button size="sm" variant="ghost" onClick={resetAddForm}>Cancel</Button>
                    <Button
                      size="sm"
                      colorScheme="blue"
                      leftIcon={<Icon as={Plus} boxSize={3.5} />}
                      onClick={saveAdd}
                      isLoading={saving}
                      isDisabled={!name.trim()}
                    >
                      Save method
                    </Button>
                  </HStack>
                </VStack>
              </Box>
            </Collapse>
          </Box>
        </VStack>
      </Box>
    </SectionCard>
  )
}
