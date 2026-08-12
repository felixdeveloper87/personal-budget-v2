import { useEffect, useState } from 'react'
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Divider,
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
  Text,
  VStack,
} from '@chakra-ui/react'
import { createAccount, updateAccount } from '../../api'
import type { AccountType, FinancialAccount } from '../../types'
import { BankCombobox, BankLogo, ModalHeader, PremiumModal, getBankMeta } from '../ui'
import { Pencil, Plus, Wallet } from '../ui/icons'
import { ToastService } from '../../services/toast'
import { useI18n } from '../../i18n'
import { ACCOUNT_HELP, ACCOUNT_LABELS, CREATABLE_ACCOUNT_TYPES, accountName } from './accountMeta'

export interface AccountFormModalProps {
  isOpen: boolean
  onClose: () => void
  /** Account being edited, or `null`/`undefined` to create a new one. */
  account?: FinancialAccount | null
  onSaved: () => void
}

export default function AccountFormModal({ isOpen, onClose, account, onSaved }: AccountFormModalProps) {
  const { t } = useI18n()
  const isEditing = Boolean(account)

  const [institution, setInstitution] = useState('')
  const [type, setType] = useState<AccountType>('CURRENT')
  const [openingBalance, setOpeningBalance] = useState('0')
  const [overdraftLimit, setOverdraftLimit] = useState(0)
  const [saving, setSaving] = useState(false)

  const muted = 'var(--pb-ink-soft)'
  const softBg = 'var(--pb-surface-2)'
  const blueSoftBg = 'var(--pb-tint-green)'
  const fieldBg = 'var(--pb-surface)'

  // Sync the form whenever the modal opens (or the target account changes).
  useEffect(() => {
    if (!isOpen) return
    if (account) {
      setInstitution(account.institution ?? '')
      setType(account.type)
      setOpeningBalance(String(account.currentBalance))
      setOverdraftLimit(account.overdraftLimit)
    } else {
      setInstitution('')
      setType('CURRENT')
      setOpeningBalance('0')
      setOverdraftLimit(0)
    }
  }, [isOpen, account])

  const generatedAccountName = accountName(institution, type)

  const save = async () => {
    if (!generatedAccountName) return
    const parsedOpeningBalance = Number(openingBalance)
    if (openingBalance.trim() === '' || openingBalance === '-' || !Number.isFinite(parsedOpeningBalance)) {
      ToastService.error({
        title: t('accounts.form.invalidBalance.title'),
        description: t('accounts.form.invalidBalance.description'),
        dedupeKey: 'invalid-account-balance',
      })
      return
    }
    setSaving(true)
    try {
      const request = {
        name: generatedAccountName,
        institution: institution.trim() || null,
        type,
        currency: 'GBP',
        openingBalance: parsedOpeningBalance,
        overdraftLimit: type === 'CURRENT' ? overdraftLimit : 0,
        active: true,
      }
      if (account) {
        await updateAccount(account.id, request)
      } else {
        await createAccount(request)
      }
      ToastService.success({
        title: isEditing ? t('accounts.toast.updated') : t('accounts.toast.created'),
        dedupeKey: isEditing ? 'account-updated' : 'account-created',
      })
      onSaved()
      onClose()
    } catch (err) {
      ToastService.apiError(err, {
        title: isEditing ? t('accounts.toast.updateFailed') : t('accounts.toast.createFailed'),
        dedupeKey: isEditing ? 'account-update-failed' : 'account-create-failed',
      })
    } finally {
      setSaving(false)
    }
  }

  // Editing a legacy credit account keeps that type available in the selector.
  const typeOptions =
    type === 'CREDIT_CARD'
      ? [...CREATABLE_ACCOUNT_TYPES, 'CREDIT_CARD' as AccountType]
      : CREATABLE_ACCOUNT_TYPES

  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', md: 'xl' }}
      header={
        <ModalHeader
          icon={isEditing ? Pencil : Plus}
          title={isEditing ? t('accounts.form.editTitle') : t('accounts.form.addTitle')}
          caption={
            isEditing
              ? account?.name
              : t('accounts.form.caption')
          }
          onClose={onClose}
          accent="blue"
        />
      }
      footer={
        <HStack justify="flex-end" spacing={2}>
          <Button variant="ghost" onClick={onClose}>
            {t('accounts.form.cancel')}
          </Button>
          <Button
            colorScheme="blue"
            leftIcon={<Icon as={isEditing ? Pencil : Plus} boxSize={4} />}
            onClick={save}
            isLoading={saving}
            isDisabled={!generatedAccountName}
          >
            {isEditing ? t('accounts.form.saveChanges') : t('accounts.form.create')}
          </Button>
        </HStack>
      }
    >
      <Box p={{ base: 4, md: 6 }}>
        <VStack align="stretch" spacing={5}>
          <Alert status="info" variant="left-accent" borderRadius="xl" bg={blueSoftBg} alignItems="flex-start">
            <AlertIcon mt={0.5} />
            <Box>
              <AlertTitle fontSize="sm">{t('accounts.form.balanceOnly.title')}</AlertTitle>
              <AlertDescription fontSize="sm" color={muted}>
                {t('accounts.form.balanceOnly.description')}
              </AlertDescription>
            </Box>
          </Alert>

          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
            <FormControl isRequired={type !== 'CASH'}>
              <FormLabel>{t('accounts.form.institution')}</FormLabel>
              <HStack>
                {getBankMeta(institution) && <BankLogo issuer={institution} size={34} borderRadius="9px" />}
                <Box flex={1}>
                  <BankCombobox
                    value={institution}
                    onChange={setInstitution}
                    size="md"
                    placeholder={t('accounts.form.selectInstitution')}
                  />
                </Box>
              </HStack>
              <FormHelperText>
                {type === 'CASH'
                  ? t('accounts.form.institutionHelp.cash')
                  : t('accounts.form.institutionHelp.default')}
              </FormHelperText>
            </FormControl>
            <FormControl>
              <FormLabel>{t('accounts.form.type')}</FormLabel>
              <Select
                bg={fieldBg}
                value={type}
                onChange={(event) => {
                  const nextType = event.target.value as AccountType
                  setType(nextType)
                  if (nextType !== 'CURRENT') setOverdraftLimit(0)
                }}
              >
                {typeOptions.map((value) => (
                  <option key={value} value={value}>
                    {t(`accounts.type.${value}`, undefined, ACCOUNT_LABELS[value])}
                  </option>
                ))}
              </Select>
              <FormHelperText>
                {t(`accounts.typeHelp.${type}`, undefined, ACCOUNT_HELP[type])}
              </FormHelperText>
            </FormControl>
            <FormControl gridColumn={{ sm: '1 / -1' }}>
              <FormLabel>{t('accounts.form.name')}</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={Wallet} color={muted} boxSize={4} />
                </InputLeftElement>
                <Input
                  bg={softBg}
                  value={generatedAccountName}
                  placeholder={t('accounts.form.selectInstitution')}
                  isReadOnly
                  fontWeight={700}
                />
              </InputGroup>
              <FormHelperText>{t('accounts.form.nameHelp')}</FormHelperText>
            </FormControl>
            <FormControl>
              <FormLabel>{t('accounts.form.currentBalance')}</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none" color={muted} fontWeight={700}>
                  £
                </InputLeftElement>
                <Input
                  bg={fieldBg}
                  type="text"
                  inputMode="decimal"
                  value={openingBalance}
                  onChange={(event) => {
                    const value = event.target.value.replace(',', '.')
                    if (/^-?\d*(\.\d{0,2})?$/.test(value)) {
                      setOpeningBalance(value)
                    }
                  }}
                  placeholder="-250.00"
                />
              </InputGroup>
              <FormHelperText>
                {isEditing
                  ? t('accounts.form.balanceHelp.edit')
                  : t('accounts.form.balanceHelp.create')}
              </FormHelperText>
            </FormControl>
            {type === 'CURRENT' && (
              <FormControl>
                <FormLabel>{t('accounts.form.overdraftLimit')}</FormLabel>
                <NumberInput
                  min={0}
                  precision={2}
                  value={overdraftLimit}
                  onChange={(_, value) => setOverdraftLimit(Number.isNaN(value) ? 0 : value)}
                >
                  <NumberInputField bg={fieldBg} pl={8} />
                </NumberInput>
                <FormHelperText>{t('accounts.form.overdraftHelp')}</FormHelperText>
              </FormControl>
            )}
          </SimpleGrid>

          <Divider />
        </VStack>
      </Box>
    </PremiumModal>
  )
}
