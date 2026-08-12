import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  NumberInput,
  NumberInputField,
  Select,
  SimpleGrid,
  Switch,
  VStack,
} from '@chakra-ui/react'
import { createPaymentMethod, listAccounts, updatePaymentMethod } from '../../api'
import type { FinancialAccount, PaymentMethod, PaymentMethodRequest } from '../../types'
import { BankCombobox, ModalHeader, PremiumModal } from '../ui'
import { Check, CreditCard, Plus } from '../ui/icons'
import { ToastService } from '../../services/toast'
import { useI18n } from '../../i18n'

export interface CardFormModalProps {
  isOpen: boolean
  onClose: () => void
  /** Card being edited, or `null`/`undefined` to create a new one. */
  card?: PaymentMethod | null
  onSaved: () => void
}

interface FormState {
  name: string
  issuer: string
  active: boolean
  statementClosingDay: number
  paymentDay: number
  creditLimit: string
  settlementAccountId: number | null
}

const DEFAULT_STATE: FormState = {
  name: '',
  issuer: '',
  active: true,
  statementClosingDay: 3,
  paymentDay: 28,
  creditLimit: '',
  settlementAccountId: null,
}

export default function CardFormModal({ isOpen, onClose, card, onSaved }: CardFormModalProps) {
  const { t } = useI18n()
  const isEditing = Boolean(card)
  const [state, setState] = useState<FormState>(DEFAULT_STATE)
  const [saving, setSaving] = useState(false)
  const [accounts, setAccounts] = useState<FinancialAccount[]>([])

  // Sync the form whenever the modal opens (or the target card changes).
  useEffect(() => {
    if (!isOpen) return
    setState(
      card
        ? {
            name: card.name,
            issuer: card.issuer ?? '',
            active: card.active,
            statementClosingDay: card.statementClosingDay ?? 3,
            paymentDay: card.paymentDay ?? 28,
            creditLimit: card.creditLimit != null ? String(card.creditLimit) : '',
            settlementAccountId: card.settlementAccountId ?? null,
          }
        : DEFAULT_STATE,
    )
  }, [isOpen, card])

  // Load balance accounts so the card can point at its settlement account.
  useEffect(() => {
    if (!isOpen) return
    listAccounts()
      .then(setAccounts)
      .catch((err) => {
        ToastService.apiError(err, {
          title: t('cards.toast.accountsLoadFailed'),
          dedupeKey: 'card-form-accounts-load-failed',
        })
      })
  }, [isOpen, t])

  const patch = (partial: Partial<FormState>) => setState((prev) => ({ ...prev, ...partial }))

  const save = async () => {
    if (!state.name.trim()) return
    setSaving(true)
    try {
      const parsedLimit = state.creditLimit.trim() === '' ? null : Number(state.creditLimit)
      const request: PaymentMethodRequest = {
        name: state.name.trim(),
        issuer: state.issuer.trim() || null,
        type: 'CREDIT_CARD',
        active: state.active,
        statementClosingDay: state.statementClosingDay,
        paymentDay: state.paymentDay,
        creditLimit: parsedLimit != null && !Number.isNaN(parsedLimit) ? parsedLimit : null,
        settlementAccountId: state.settlementAccountId,
      }
      if (card) {
        await updatePaymentMethod(card.id, request)
      } else {
        await createPaymentMethod(request)
      }
      ToastService.success({
        title: isEditing ? t('cards.toast.updated') : t('cards.toast.added'),
        dedupeKey: isEditing ? `card-updated:${card?.id}` : 'card-added',
      })
      onSaved()
      onClose()
    } catch (err) {
      ToastService.apiError(err, {
        title: isEditing ? t('cards.toast.updateFailed') : t('cards.toast.saveFailed'),
        dedupeKey: 'card-save-failed',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', md: 'lg' }}
      header={
        <ModalHeader
          icon={CreditCard}
          title={isEditing ? t('cards.form.editTitle') : t('cards.form.addTitle')}
          caption={isEditing ? card?.name : t('cards.form.caption')}
          onClose={onClose}
          accent="blue"
        />
      }
      footer={
        <HStack justify="flex-end" spacing={2}>
          <Button variant="ghost" onClick={onClose}>
            {t('cards.form.cancel')}
          </Button>
          <Button
            colorScheme="blue"
            leftIcon={<Icon as={isEditing ? Check : Plus} boxSize={4} />}
            onClick={save}
            isLoading={saving}
            isDisabled={!state.name.trim()}
          >
            {isEditing ? t('cards.form.saveChanges') : t('cards.form.add')}
          </Button>
        </HStack>
      }
    >
      <Box p={{ base: 4, md: 6 }}>
        <VStack align="stretch" spacing={4}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl isRequired>
              <FormLabel fontSize="sm">{t('cards.form.name')}</FormLabel>
              <Input
                value={state.name}
                onChange={(e) => patch({ name: e.target.value })}
                placeholder={t('cards.form.namePlaceholder')}
                autoFocus
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">{t('cards.form.issuer')}</FormLabel>
              <BankCombobox
                value={state.issuer}
                onChange={(v) => patch({ issuer: v })}
                placeholder={t('cards.form.issuerPlaceholder')}
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">{t('cards.form.closingDay')}</FormLabel>
              <NumberInput
                min={1}
                max={31}
                value={state.statementClosingDay}
                onChange={(_, v) => patch({ statementClosingDay: v || 1 })}
              >
                <NumberInputField />
              </NumberInput>
              <FormHelperText>{t('cards.form.closingDayHelp')}</FormHelperText>
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">{t('cards.form.paymentDay')}</FormLabel>
              <NumberInput
                min={1}
                max={31}
                value={state.paymentDay}
                onChange={(_, v) => patch({ paymentDay: v || 1 })}
              >
                <NumberInputField />
              </NumberInput>
              <FormHelperText>{t('cards.form.paymentDayHelp')}</FormHelperText>
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">{t('cards.form.creditLimit')}</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none" color="var(--pb-ink-faint)">
                  £
                </InputLeftElement>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  inputMode="decimal"
                  pl={8}
                  value={state.creditLimit}
                  onChange={(e) => patch({ creditLimit: e.target.value })}
                  placeholder="5000"
                />
              </InputGroup>
              <FormHelperText>{t('cards.form.creditLimitHelp')}</FormHelperText>
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">{t('cards.form.settlementAccount')}</FormLabel>
              <Select
                value={state.settlementAccountId ?? ''}
                onChange={(e) => patch({ settlementAccountId: e.target.value ? Number(e.target.value) : null })}
                placeholder={t('cards.form.noAccountLinked')}
              >
                {accounts.filter((account) => account.active).map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </Select>
              <FormHelperText>{t('cards.form.settlementHelp')}</FormHelperText>
            </FormControl>
          </SimpleGrid>

          <FormControl display="flex" alignItems="center" justifyContent="space-between">
            <FormLabel fontSize="sm" mb={0}>
              {t('cards.form.active')}
            </FormLabel>
            <Switch
              isChecked={state.active}
              onChange={(e) => patch({ active: e.target.checked })}
              colorScheme="blue"
            />
          </FormControl>
        </VStack>
      </Box>
    </PremiumModal>
  )
}
