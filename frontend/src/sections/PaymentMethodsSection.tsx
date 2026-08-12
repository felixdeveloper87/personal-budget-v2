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
} from '@chakra-ui/react'
import { createPaymentMethod, deletePaymentMethod, listPaymentMethods, updatePaymentMethod } from '../api'
import { PaymentMethod, PaymentMethodRequest, PaymentMethodType } from '../types'
import { Check, ChevronDown, CreditCard, Pencil, Plus, Trash2, Wallet } from '../components/ui/icons'
import { BankCombobox, BankLogo, getBankMeta, SectionCard, SectionHeader } from '../components/ui'
import { ToastService } from '../services/toast'
import { useI18n } from '../i18n'

const TYPE_LABEL_KEYS: Record<PaymentMethodType, string> = {
  CASH: 'paymentMethods.type.CASH',
  DEBIT_CARD: 'paymentMethods.type.DEBIT_CARD',
  CREDIT_CARD: 'paymentMethods.type.CREDIT_CARD',
  BANK_TRANSFER: 'paymentMethods.type.BANK_TRANSFER',
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
  const { t } = useI18n()
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

  const borderColor = 'var(--pb-hair)'
  const mutedColor = 'var(--pb-ink-soft)'
  const emptyColor = 'var(--pb-ink-faint)'
  const methodBg = 'var(--pb-surface-2)'
  const methodHoverBg = 'var(--pb-surface)'
  const addLinkColor = 'var(--pb-forest-2)'
  const formBg = 'var(--pb-tint-green)'
  const formBorder = 'var(--pb-hair-2)'
  const editFormBg = 'var(--pb-surface-2)'
  const iconBoxBg = 'var(--pb-surface)'
  const formControlStyles = {
    '.chakra-form__label': { color: 'var(--pb-ink-soft)' },
    'input, select': {
      background: 'var(--pb-surface)',
      borderColor: 'var(--pb-hair)',
      color: 'var(--pb-ink)',
    },
    'input:hover, select:hover': { borderColor: 'var(--pb-hair-2)' },
    'input:focus-visible, select:focus-visible': {
      borderColor: 'var(--pb-forest-2)',
      boxShadow: '0 0 0 1px var(--pb-forest-2)',
    },
    '.chakra-switch__track[data-checked]': { background: 'var(--pb-forest-2)' },
  }

  const activeCards = useMemo(
    () => paymentMethods.filter((m) => m.active && m.type === 'CREDIT_CARD').length,
    [paymentMethods],
  )

  const load = async () => {
    setLoading(true)
    try {
      setPaymentMethods(await listPaymentMethods())
    } catch (err) {
      ToastService.apiError(err, { title: t('paymentMethods.loadFailed'), dedupeKey: 'pm-load-failed' })
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
      ToastService.success({ title: t('paymentMethods.added'), dedupeKey: 'pm-saved' })
    } catch (err) {
      ToastService.apiError(err, { title: t('paymentMethods.saveFailed'), dedupeKey: 'pm-save-failed' })
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
      ToastService.success({ title: t('paymentMethods.updated'), dedupeKey: 'pm-updated' })
    } catch (err) {
      ToastService.apiError(err, { title: t('paymentMethods.updateFailed'), dedupeKey: `pm-update-failed:${id}` })
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
      ToastService.apiError(err, { title: t('paymentMethods.deleteFailed'), dedupeKey: `pm-delete-failed:${id}` })
    }
  }

  return (
    <SectionCard staticOnHover>
      <Box p={{ base: 4, sm: 5, md: 6 }}>
        <VStack spacing={4} align="stretch">
          <SectionHeader
            icon={CreditCard}
            title={t('paymentMethods.title')}
            caption={`${t(
              paymentMethods.length === 1
                ? 'paymentMethods.methodCount'
                : 'paymentMethods.methodCountPlural',
              { count: paymentMethods.length },
            )} · ${t(
              activeCards === 1
                ? 'paymentMethods.activeCardCount'
                : 'paymentMethods.activeCardCountPlural',
              { count: activeCards },
            )}`}
            accent="green"
          />
          <Text fontSize="xs" color={mutedColor}>
            {t('paymentMethods.description')}
          </Text>

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
                  {loading ? t('common.loading') : t('paymentMethods.empty')}
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
                        <Text fontSize="sm" fontWeight={700} color="var(--pb-ink)" noOfLines={1}>{method.name}</Text>
                        <Text fontSize="xs" color={mutedColor} noOfLines={1}>
                          {t(TYPE_LABEL_KEYS[method.type])}
                          {method.issuer ? ` · ${method.issuer}` : ''}
                          {method.type === 'CREDIT_CARD'
                            ? ` · ${t('paymentMethods.cardSchedule', {
                                closingDay: method.statementClosingDay ?? '—',
                                paymentDay: method.paymentDay ?? '—',
                              })}`
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
                        bg={method.active ? 'var(--pb-tint-income)' : 'var(--pb-surface-3)'}
                        color={method.active ? 'var(--pb-income-2)' : 'var(--pb-ink-faint)'}
                        border="1px solid var(--pb-hair)"
                        textTransform="none"
                      >
                        {method.active ? t('paymentMethods.active') : t('paymentMethods.inactive')}
                      </Badge>
                      <IconButton
                        aria-label={t('common.edit')}
                        icon={<Icon as={isEditing ? Check : Pencil} boxSize={3.5} />}
                        size="xs"
                        variant="ghost"
                        color={isEditing ? 'var(--pb-forest-2)' : 'var(--pb-ink-soft)'}
                        _hover={{ bg: 'var(--pb-tint-green)', color: 'var(--pb-forest)' }}
                        onClick={() => isEditing ? saveEdit(method.id) : startEdit(method)}
                        isLoading={updating === method.id}
                      />
                      <IconButton
                        aria-label={t('common.remove')}
                        icon={<Icon as={Trash2} boxSize={3.5} />}
                        size="xs"
                        variant="ghost"
                        color="var(--pb-coral)"
                        _hover={{ bg: 'var(--pb-tint-coral)', color: 'var(--pb-coral-2)' }}
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
                      sx={formControlStyles}
                    >
                      <VStack spacing={3} align="stretch">
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                          <FormControl>
                            <FormLabel fontSize="xs">{t('paymentMethods.name')}</FormLabel>
                            <Input
                              size="sm"
                              value={editState.name}
                              onChange={(e) => patch({ name: e.target.value })}
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel fontSize="xs">{t('paymentMethods.issuer')}</FormLabel>
                            <BankCombobox
                              value={editState.issuer}
                              onChange={(v) => patch({ issuer: v })}
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel fontSize="xs">{t('paymentMethods.type')}</FormLabel>
                            <Select
                              size="sm"
                              value={editState.type}
                              onChange={(e) => patch({ type: e.target.value as PaymentMethodType })}
                            >
                              {Object.entries(TYPE_LABEL_KEYS).map(([v, key]) => (
                                <option key={v} value={v}>{t(key)}</option>
                              ))}
                            </Select>
                          </FormControl>
                          <FormControl display="flex" alignItems="end" justifyContent="space-between">
                            <FormLabel fontSize="xs" mb={2}>{t('paymentMethods.active')}</FormLabel>
                            <Switch
                              isChecked={editState.active}
                              onChange={(e) => patch({ active: e.target.checked })}
                            />
                          </FormControl>
                          {editState.type === 'CREDIT_CARD' && (
                            <>
                              <FormControl>
                                <FormLabel fontSize="xs">{t('paymentMethods.closingDay')}</FormLabel>
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
                                <FormLabel fontSize="xs">{t('paymentMethods.paymentDay')}</FormLabel>
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
                          <Button
                            size="sm"
                            variant="ghost"
                            color="var(--pb-ink-soft)"
                            _hover={{ bg: 'var(--pb-surface-3)', color: 'var(--pb-ink)' }}
                            onClick={cancelEdit}
                          >
                            {t('common.cancel')}
                          </Button>
                          <Button
                            size="sm"
                            bg="var(--pb-forest-2)"
                            color="var(--pb-on-accent)"
                            _hover={{ bg: 'var(--pb-forest)' }}
                            _active={{ bg: 'var(--pb-forest)' }}
                            leftIcon={<Icon as={Check} boxSize={3.5} />}
                            onClick={() => saveEdit(method.id)}
                            isLoading={updating === method.id}
                            isDisabled={!editState.name.trim()}
                          >
                            {t('paymentMethods.saveChanges')}
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
              {showAddForm ? t('common.cancel') : t('paymentMethods.addNew')}
            </Button>

            <Collapse in={showAddForm} animateOpacity>
              <Box
                mt={3}
                p={4}
                bg={formBg}
                border="1px solid"
                borderColor={formBorder}
                borderRadius="xl"
                sx={formControlStyles}
              >
                <VStack spacing={3} align="stretch">
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                    <FormControl>
                      <FormLabel fontSize="xs">{t('paymentMethods.name')}</FormLabel>
                      <Input size="sm" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('paymentMethods.namePlaceholder')} />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="xs">{t('paymentMethods.issuer')}</FormLabel>
                      <BankCombobox value={issuer} onChange={setIssuer} />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="xs">{t('paymentMethods.type')}</FormLabel>
                      <Select size="sm" value={type} onChange={(e) => setType(e.target.value as PaymentMethodType)}>
                        {Object.entries(TYPE_LABEL_KEYS).map(([v, key]) => (
                          <option key={v} value={v}>{t(key)}</option>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl display="flex" alignItems="end" justifyContent="space-between">
                      <FormLabel fontSize="xs" mb={2}>{t('paymentMethods.active')}</FormLabel>
                      <Switch isChecked={active} onChange={(e) => setActive(e.target.checked)} />
                    </FormControl>
                    {type === 'CREDIT_CARD' && (
                      <>
                        <FormControl>
                          <FormLabel fontSize="xs">{t('paymentMethods.closingDay')}</FormLabel>
                          <NumberInput size="sm" min={1} max={31} value={statementClosingDay} onChange={(_, v) => setStatementClosingDay(v || 1)}>
                            <NumberInputField />
                          </NumberInput>
                        </FormControl>
                        <FormControl>
                          <FormLabel fontSize="xs">{t('paymentMethods.paymentDay')}</FormLabel>
                          <NumberInput size="sm" min={1} max={31} value={paymentDay} onChange={(_, v) => setPaymentDay(v || 1)}>
                            <NumberInputField />
                          </NumberInput>
                        </FormControl>
                      </>
                    )}
                  </SimpleGrid>
                  <HStack justify="flex-end" spacing={2}>
                    <Button
                      size="sm"
                      variant="ghost"
                      color="var(--pb-ink-soft)"
                      _hover={{ bg: 'var(--pb-surface-3)', color: 'var(--pb-ink)' }}
                      onClick={resetAddForm}
                    >
                      {t('common.cancel')}
                    </Button>
                    <Button
                      size="sm"
                      bg="var(--pb-forest-2)"
                      color="var(--pb-on-accent)"
                      _hover={{ bg: 'var(--pb-forest)' }}
                      _active={{ bg: 'var(--pb-forest)' }}
                      leftIcon={<Icon as={Plus} boxSize={3.5} />}
                      onClick={saveAdd}
                      isLoading={saving}
                      isDisabled={!name.trim()}
                    >
                      {t('paymentMethods.saveMethod')}
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
