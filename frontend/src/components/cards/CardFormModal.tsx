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
          title: 'Could not load accounts',
          dedupeKey: 'card-form-accounts-load-failed',
        })
      })
  }, [isOpen])

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
        title: isEditing ? 'Card updated' : 'Card added',
        dedupeKey: isEditing ? `card-updated:${card?.id}` : 'card-added',
      })
      onSaved()
      onClose()
    } catch (err) {
      ToastService.apiError(err, {
        title: isEditing ? 'Could not update card' : 'Could not save card',
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
          title={isEditing ? 'Edit card' : 'Add credit card'}
          caption={isEditing ? card?.name : 'Store statement closing and payment dates'}
          onClose={onClose}
          accent="blue"
        />
      }
      footer={
        <HStack justify="flex-end" spacing={2}>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            leftIcon={<Icon as={isEditing ? Check : Plus} boxSize={4} />}
            onClick={save}
            isLoading={saving}
            isDisabled={!state.name.trim()}
          >
            {isEditing ? 'Save changes' : 'Add card'}
          </Button>
        </HStack>
      }
    >
      <Box p={{ base: 4, md: 6 }}>
        <VStack align="stretch" spacing={4}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl isRequired>
              <FormLabel fontSize="sm">Card name</FormLabel>
              <Input
                value={state.name}
                onChange={(e) => patch({ name: e.target.value })}
                placeholder="NatWest Rewards"
                autoFocus
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">Issuer</FormLabel>
              <BankCombobox value={state.issuer} onChange={(v) => patch({ issuer: v })} />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">Statement closing day</FormLabel>
              <NumberInput
                min={1}
                max={31}
                value={state.statementClosingDay}
                onChange={(_, v) => patch({ statementClosingDay: v || 1 })}
              >
                <NumberInputField />
              </NumberInput>
              <FormHelperText>Day the statement closes (1–31).</FormHelperText>
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">Payment day</FormLabel>
              <NumberInput
                min={1}
                max={31}
                value={state.paymentDay}
                onChange={(_, v) => patch({ paymentDay: v || 1 })}
              >
                <NumberInputField />
              </NumberInput>
              <FormHelperText>Day the balance is due (1–31).</FormHelperText>
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">Credit limit</FormLabel>
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
              <FormHelperText>Optional. Used to show how much of the card is in use.</FormHelperText>
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">Settlement account</FormLabel>
              <Select
                value={state.settlementAccountId ?? ''}
                onChange={(e) => patch({ settlementAccountId: e.target.value ? Number(e.target.value) : null })}
                placeholder="No account linked"
              >
                {accounts.filter((account) => account.active).map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </Select>
              <FormHelperText>Pick any of your current accounts — e.g. a Tesco card paid from your NatWest account.</FormHelperText>
            </FormControl>
          </SimpleGrid>

          <FormControl display="flex" alignItems="center" justifyContent="space-between">
            <FormLabel fontSize="sm" mb={0}>
              Active
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
