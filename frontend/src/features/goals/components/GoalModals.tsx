import { useEffect, useState } from 'react'
import { Box, Button, FormControl, FormLabel, HStack, Input, NumberInput, NumberInputField, Text, VStack } from '@chakra-ui/react'
import { ModalHeader, PremiumModal } from '../../../components/ui'
import { useI18n } from '../../../i18n'
import type { SavingsGoal, SavingsGoalRequest } from '../../../types'
import { DEFAULT_GOAL_COLOR, GOAL_COLORS } from './GoalCard'

const fieldProps = {
  h: '48px',
  borderRadius: '14px',
  bg: 'var(--nu-surface)',
  border: '2px solid transparent',
  _hover: { bg: 'var(--nu-surface-hover)' },
  _focusVisible: { bg: 'var(--nu-page)', borderColor: 'var(--nu-brand)', boxShadow: 'none' },
} as const

const primaryBtn = {
  h: '48px', borderRadius: 'full', bg: 'var(--nu-brand)', color: 'white', fontWeight: 600,
  _hover: { bg: 'var(--nu-brand-deep)' }, _disabled: { opacity: 0.4, cursor: 'not-allowed', _hover: { bg: 'var(--nu-brand)' } },
} as const

const modalContent = { className: 'nu-dashboard', maxH: { base: 'calc(100dvh - 24px)', sm: '78dvh' } }

/** Create (goal == null) or edit a savings goal. */
export function GoalFormModal({
  isOpen, goal, onClose, onSubmit,
}: {
  isOpen: boolean
  goal: SavingsGoal | null
  onClose: () => void
  onSubmit: (request: SavingsGoalRequest) => Promise<void>
}) {
  const { t } = useI18n()
  const [name, setName] = useState('')
  const [target, setTarget] = useState(0)
  const [current, setCurrent] = useState(0)
  const [date, setDate] = useState('')
  const [color, setColor] = useState(DEFAULT_GOAL_COLOR)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setName(goal?.name ?? '')
    setTarget(goal?.targetAmount ?? 0)
    setCurrent(goal?.currentAmount ?? 0)
    setDate(goal?.targetDate ?? '')
    setColor(goal?.color || DEFAULT_GOAL_COLOR)
    setBusy(false)
  }, [isOpen, goal])

  const valid = name.trim().length > 0 && target > 0

  const submit = async () => {
    if (!valid || busy) return
    setBusy(true)
    try {
      await onSubmit({ name: name.trim(), targetAmount: target, currentAmount: current, targetDate: date || null, color })
    } finally {
      setBusy(false)
    }
  }

  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', sm: 'md' }}
      contentProps={modalContent}
      header={<ModalHeader title={t(goal ? 'goals.form.editTitle' : 'goals.form.newTitle')} caption={t('goals.form.caption')} onClose={onClose} />}
    >
      <VStack spacing={4} align="stretch" p={5} bg="var(--nu-page)">
        <FormControl>
          <FormLabel fontSize="13px" color="var(--pb-ink-soft)">{t('goals.form.name')}</FormLabel>
          <Input {...fieldProps} value={name} maxLength={80} onChange={(e) => setName(e.target.value)} placeholder={t('goals.form.namePlaceholder')} />
        </FormControl>
        <HStack spacing={3} align="flex-start">
          <FormControl>
            <FormLabel fontSize="13px" color="var(--pb-ink-soft)">{t('goals.target')}</FormLabel>
            <NumberInput min={0} precision={2} value={target || ''} onChange={(_, v) => setTarget(v || 0)}>
              <NumberInputField {...fieldProps} placeholder="0,00" />
            </NumberInput>
          </FormControl>
          <FormControl>
            <FormLabel fontSize="13px" color="var(--pb-ink-soft)">{t('goals.form.alreadySaved')}</FormLabel>
            <NumberInput min={0} precision={2} value={current || ''} onChange={(_, v) => setCurrent(v || 0)}>
              <NumberInputField {...fieldProps} placeholder="0,00" />
            </NumberInput>
          </FormControl>
        </HStack>
        <FormControl>
          <FormLabel fontSize="13px" color="var(--pb-ink-soft)">{t('goals.form.date')}</FormLabel>
          <Input {...fieldProps} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </FormControl>
        <Box>
          <Text fontSize="13px" color="var(--pb-ink-soft)" mb={2}>{t('goals.form.color')}</Text>
          <HStack spacing={3} role="radiogroup" aria-label={t('goals.form.color')}>
            {GOAL_COLORS.map((c) => (
              <Box
                key={c} as="button" type="button" role="radio" aria-checked={color === c} aria-label={c}
                onClick={() => setColor(c)} w="32px" h="32px" borderRadius="full" bg={c}
                boxShadow={color === c ? `0 0 0 2px var(--nu-page), 0 0 0 4px ${c}` : 'none'}
              />
            ))}
          </HStack>
        </Box>
        <Button {...primaryBtn} mt={2} isDisabled={!valid} isLoading={busy} onClick={submit}>
          {t(goal ? 'goals.form.saveChanges' : 'goals.form.create')}
        </Button>
      </VStack>
    </PremiumModal>
  )
}

/** Add to / withdraw from a goal. */
export function ContributeModal({
  goal, onClose, onSubmit,
}: {
  goal: SavingsGoal | null
  onClose: () => void
  onSubmit: (amount: number) => Promise<void>
}) {
  const { t, formatCurrency } = useI18n()
  const [mode, setMode] = useState<'in' | 'out'>('in')
  const [amount, setAmount] = useState(0)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setMode('in')
    setAmount(0)
    setBusy(false)
  }, [goal])

  const submit = async () => {
    if (amount <= 0 || busy) return
    setBusy(true)
    try {
      await onSubmit(mode === 'in' ? amount : -amount)
    } finally {
      setBusy(false)
    }
  }

  return (
    <PremiumModal
      isOpen={goal != null}
      onClose={onClose}
      size={{ base: 'full', sm: 'md' }}
      contentProps={modalContent}
      header={goal && <ModalHeader title={goal.name} caption={`${t('goals.saved')} ${formatCurrency(goal.currentAmount)} · ${t('goals.remaining', { amount: formatCurrency(goal.remainingAmount) })}`} onClose={onClose} />}
    >
      <VStack spacing={4} align="stretch" p={5} bg="var(--nu-page)">
        <HStack spacing={2} p="4px" bg="var(--nu-surface)" borderRadius="full" role="radiogroup">
          {(['in', 'out'] as const).map((m) => (
            <Box
              key={m} as="button" type="button" role="radio" aria-checked={mode === m} onClick={() => setMode(m)}
              flex={1} h="38px" borderRadius="full" fontSize="14px" fontWeight={600}
              bg={mode === m ? 'var(--nu-brand)' : 'transparent'} color={mode === m ? 'white' : 'var(--pb-ink-soft)'}
            >
              {t(m === 'in' ? 'goals.save' : 'goals.withdraw')}
            </Box>
          ))}
        </HStack>
        <NumberInput min={0} precision={2} value={amount || ''} onChange={(_, v) => setAmount(v || 0)}>
          <NumberInputField {...fieldProps} h="56px" fontSize="22px" fontWeight={700} textAlign="center" placeholder="0,00" autoFocus />
        </NumberInput>
        <Button {...primaryBtn} isDisabled={amount <= 0} isLoading={busy} onClick={submit}>
          {t('goals.apply')}
        </Button>
      </VStack>
    </PremiumModal>
  )
}
