import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Box, Button, Checkbox, Flex, FormControl, FormErrorMessage, HStack, IconButton, Input, Text, VStack, usePrefersReducedMotion } from '@chakra-ui/react'
import { createHouseholdExpense, deleteHouseholdExpense, updateHouseholdExpense, uploadHouseholdExpenseAttachments } from '../../../api'
import { Check, Plus, ShoppingCart, Trash2, Users, X } from '../../../components/ui/icons'
import { PremiumModal } from '../../../components/ui'
import { useI18n } from '../../../i18n'
import { ToastService } from '../../../services/toast'
import type { HouseholdDashboard, HouseholdExpense, HouseholdExpenseRequest, HouseholdPageState } from '../../../types'
import { AttachmentPicker } from '../HouseholdAttachments'
import { today } from '../householdDates'
import { CATEGORIES, getHouseholdCategoryConfig } from './expenseConfig'

const DETAIL_CATEGORIES = new Set(['Groceries', 'Cleaning', 'Repairs', 'Garden', 'Other'])
const CATEGORY_TONES: Record<string, { background: string; color: string }> = {
  Groceries: { background: '#E5EDDC', color: '#526E43' },
  Electricity: { background: '#F2E9D5', color: '#8B7040' },
  Water: { background: '#E3ECED', color: '#507780' },
  Gas: { background: '#F0E3DA', color: '#916951' },
  Internet: { background: '#E3ECED', color: '#507780' },
  Cleaning: { background: '#F2E9D5', color: '#8B7040' },
  Rent: { background: '#E5EDDC', color: '#526E43' },
  'Council tax': { background: '#F2E9D5', color: '#8B7040' },
  Repairs: { background: '#F0E3DA', color: '#916951' },
  Garden: { background: '#E5EDDC', color: '#526E43' },
  Other: { background: '#E3ECED', color: '#507780' },
}

export function ExpenseModal({ isOpen, onClose, household, expense, onChanged }: {
  isOpen: boolean
  onClose: () => void
  household: HouseholdDashboard
  expense: HouseholdExpense | null
  onChanged: (page: HouseholdPageState) => void
}) {
  const { formatCurrency, formatNumber, t } = useI18n()
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<string>('Groceries')
  const [amount, setAmount] = useState('')
  const [expenseDate, setExpenseDate] = useState(today())
  const [participantIds, setParticipantIds] = useState<Set<number>>(new Set())
  const [files, setFiles] = useState<File[]>([])
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (!isOpen) return
    setDescription(expense?.description ?? '')
    setCategory(expense?.category ?? 'Groceries')
    setAmount(expense ? String(expense.amount) : '')
    setExpenseDate(expense?.expenseDate ?? today())
    setFiles([])
    setHasSubmitted(false)
    setParticipantIds(new Set(expense?.shares.map((share) => share.memberId) ?? household.members.map((member) => member.id)))
  }, [expense, household.members, isOpen])

  const categoryDefaults: Record<string, string> = {
    Electricity: t('household.expenseModal.quick.electricity.description'),
    Water: t('household.expenseModal.quick.water.description'),
    Gas: t('household.expenseModal.quick.gas.description'),
    Internet: t('household.expenseModal.quick.internet.description'),
    Rent: t('household.category.Rent'),
    'Council tax': t('household.category.Council tax'),
  }
  const numericAmount = Number(amount.replace(',', '.'))
  const amountIsValid = Number.isFinite(numericAmount) && numericAmount > 0
  const resolvedDescription = description.trim() || categoryDefaults[category] || ''
  const descriptionIsValid = resolvedDescription.length > 0
  const participantsAreValid = participantIds.size >= 2
  const canSubmit = amountIsValid && descriptionIsValid && participantsAreValid && Boolean(expenseDate)
  const preview = amountIsValid && participantIds.size > 0 ? numericAmount / participantIds.size : 0
  const payerMemberId = expense?.payerMemberId ?? household.currentMemberId
  const requiresDescription = Boolean(expense) || DETAIL_CATEGORIES.has(category)
  const mark = ({ GBP: '\u00A3', BRL: 'R$', USD: '$', EUR: '\u20AC' } as Record<string, string>)[household.currency] ?? household.currency

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setHasSubmitted(true)
    if (!amountIsValid) return ToastService.warning({ title: t('household.expenseModal.invalidAmount') })
    if (!descriptionIsValid) return ToastService.warning({ title: t('household.expenseModal.descriptionRequired') })
    if (!participantsAreValid) return ToastService.warning({ title: t('household.expenseModal.selectParticipants') })

    const request: HouseholdExpenseRequest = {
      description: resolvedDescription,
      category,
      amount: numericAmount,
      expenseDate,
      participantMemberIds: [...participantIds],
    }
    setSaving(true)
    let savedPage: HouseholdPageState | null = null
    try {
      let targetId = expense?.id
      if (expense) savedPage = await updateHouseholdExpense(household.id, expense.id, request)
      else {
        const created = await createHouseholdExpense(household.id, request)
        savedPage = created.page
        targetId = created.recordId
      }
      if (files.length > 0) {
        if (!targetId) throw new Error(t('household.expenseModal.uploadTargetError'))
        savedPage = await uploadHouseholdExpenseAttachments(household.id, targetId, files)
      }
      onChanged(savedPage)
      ToastService.success({ title: expense ? t('household.expenseModal.updatedToast') : t('household.expenseModal.addedToast') })
      onClose()
    } catch (error) {
      if (savedPage) {
        onChanged(savedPage)
        ToastService.apiError(error, { title: t('household.expenseModal.imagesFailed') })
        onClose()
      } else ToastService.apiError(error, { title: t('household.expenseModal.saveFailed') })
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!expense || !window.confirm(t('household.expenseModal.removeConfirm'))) return
    setDeleting(true)
    try {
      onChanged(await deleteHouseholdExpense(household.id, expense.id))
      ToastService.success({ title: t('household.expenseModal.removedToast') })
      onClose()
    } catch (error) {
      ToastService.apiError(error, { title: t('household.expenseModal.removeFailed') })
    } finally {
      setDeleting(false)
    }
  }

  const chooseCategory = (nextCategory: string) => {
    setCategory(nextCategory)
    setDescription(categoryDefaults[nextCategory] ?? '')
  }

  const footer = (
    <VStack w="full" align="stretch" spacing={2.5}>
      <Flex align="center" justify="space-between" gap={3}>
        <Text fontSize="xs" color="var(--pb-ink-soft)">{t('household.expenseModal.total')}</Text>
        <Text fontSize="17px" fontWeight={800} color="var(--pb-ink)" noOfLines={1} style={{ fontVariantNumeric: 'tabular-nums' }}>
          {formatCurrency(amountIsValid ? numericAmount : 0)}
        </Text>
      </Flex>
      <Button
        type="submit" form="household-expense-form" minH="54px" borderRadius="17px"
        bg="#42633D" color="white"
        leftIcon={expense ? <Check size={18} weight="bold" /> : <Plus size={18} weight="bold" />}
        isDisabled={!canSubmit} isLoading={saving} loadingText={t('household.common.saving')}
        fontSize="sm" fontWeight={800} _hover={{ bg: '#365534' }}
        _disabled={{ bg: '#9FAC96', color: 'white', opacity: 1, cursor: 'not-allowed' }}
      >
        {expense ? t('household.expenseModal.saveChanges') : t('household.expenseModal.addToHousehold')}
      </Button>
      {expense && (
        <Button minH="42px" variant="ghost" color="var(--pb-coral)" leftIcon={<Trash2 size={16} weight="bold" />}
          isLoading={deleting} onClick={() => void remove()} _hover={{ bg: 'var(--pb-tint-coral)' }}>
          {t('household.common.remove')}
        </Button>
      )}
    </VStack>
  )

  return (
    <PremiumModal
      isOpen={isOpen} onClose={saving ? () => undefined : onClose} size="full" closeOnOverlayClick={!saving} footer={footer}
      contentProps={{
        w: { base: '100%', md: 'min(640px, calc(100vw - 32px))' }, maxW: '640px',
        h: { base: '90dvh', md: '90vh' }, maxH: { base: '90dvh', md: '90vh' },
        mt: 'auto', mb: 0, mx: 'auto', borderRadius: '32px 32px 0 0', bg: '#F6F5EF',
      }}
      header={<ExpenseSheetHeader householdName={household.name} editing={Boolean(expense)} saving={saving} onClose={onClose} />}
    >
      <Box as="form" id="household-expense-form" onSubmit={submit} overflowY="auto" flex={1} minH={0}
        px={4} pt={3.5} pb={5.5} bg="#F6F5EF" sx={{ WebkitOverflowScrolling: 'touch' }}>
        <VStack align="stretch" spacing={3.5}>
          <Box p={4.5} borderRadius="24px" bg="#E8EFDF" border="1px solid #D8E2CE">
            <Text color="#52664B" fontSize="12px" fontWeight={600}>{t('household.expenseModal.totalAmount')}</Text>
            <Flex align="center" minH="68px" gap={2}>
              <Text flexShrink={0} color="#55764F" fontSize="28px" fontWeight={600}>{mark}</Text>
              <Input variant="unstyled" inputMode="decimal" value={amount}
                onChange={(event) => setAmount(event.target.value.replace(/[^0-9.,]/g, ''))}
                placeholder={t('household.expenseModal.amountPlaceholder')} minW={0} h="64px" color="#284D3C"
                fontSize={{ base: '38px', sm: '42px' }} fontWeight={800} letterSpacing="-1.5px"
                _placeholder={{ color: 'var(--pb-ink-faint)' }} />
              <SplitHint count={participantIds.size} compact={false} />
            </Flex>
            <SplitHint count={participantIds.size} compact />
            <Box pt={3.5} borderTop="1px solid #D2DDC8">
              <Text mb={2} color="var(--pb-ink-soft)" fontSize="12px" fontWeight={600}>{t('household.expenseModal.expenseDate')}</Text>
              <Input type="date" value={expenseDate} onChange={(event) => setExpenseDate(event.target.value)} h="50px"
                bg="#F6F9F0" border="1px solid #DCE3D5" borderRadius="14px" color="var(--pb-ink)" fontSize="13px" fontWeight={600}
                _focusVisible={{ borderColor: '#8FA87B', boxShadow: '0 0 0 2px rgba(143,168,123,.22)' }} />
            </Box>
            {hasSubmitted && !amountIsValid && <Text mt={2} color="var(--pb-coral)" fontSize="11px" fontWeight={600}>{t('household.expenseModal.invalidAmount')}</Text>}
          </Box>

          <FormCard>
            <SectionHeading title={t('household.expenseModal.aboutTitle')} hint={t('household.expenseModal.aboutHint')} />
            <Flex mt={3.5} gap={2} flexWrap="wrap">
              {CATEGORIES.map((item) => {
                const selected = category === item
                const CategoryIcon = getHouseholdCategoryConfig(item).icon
                const tone = CATEGORY_TONES[item] ?? CATEGORY_TONES.Other
                return (
                  <Button key={item} type="button" h="48px" minW={0} pl="7px" pr="15px" py={2} gap={1.75} borderRadius="16px"
                    border="1px solid" borderColor={selected ? '#8FA87B' : '#E4E8DC'} bg={selected ? '#E8F0DF' : '#FAFBF6'}
                    color={selected ? 'var(--pb-income)' : 'var(--pb-ink-soft)'} aria-pressed={selected} onClick={() => chooseCategory(item)}
                    transition={prefersReducedMotion ? 'none' : 'transform .16s ease, background .16s ease'}
                    _hover={{ bg: selected ? '#E2ECD8' : '#F3F6ED', transform: 'translateY(-1px)' }}>
                    <Flex w="28px" h="28px" align="center" justify="center" borderRadius="10px"
                      bg={selected ? '#638253' : tone.background} color={selected ? 'white' : tone.color}>
                      <CategoryIcon size={16} weight="duotone" aria-hidden="true" />
                    </Flex>
                    <Text fontSize="11px" fontWeight={selected ? 800 : 600}>{t(`household.category.${item}`, undefined, item)}</Text>
                    {selected && <Check size={10} weight="bold" aria-hidden="true" />}
                  </Button>
                )
              })}
            </Flex>
            {requiresDescription ? (
              <FormControl mt={4} isInvalid={hasSubmitted && !descriptionIsValid}>
                <Text as="label" display="block" mb={2} color="var(--pb-ink-soft)" fontSize="12px" fontWeight={600}>{t('household.expenseModal.whatWasIt')}</Text>
                <Input value={description} maxLength={255} onChange={(event) => setDescription(event.target.value)}
                  placeholder={t(`household.expenseModal.placeholder.${category}`, undefined, t('household.expenseModal.descriptionPlaceholder'))}
                  minH="50px" bg="#F8F9F3" border="1px solid #DCE3D5" borderRadius="14px"
                  _focusVisible={{ borderColor: '#8FA87B', boxShadow: '0 0 0 2px rgba(143,168,123,.22)' }} />
                <FormErrorMessage fontSize="11px">{t('household.expenseModal.descriptionRequired')}</FormErrorMessage>
              </FormControl>
            ) : (
              <HStack mt={4} px={3} py={2.75} borderRadius="13px" bg="#EFF3E8" spacing={2}>
                <Check size={15} weight="bold" color="#42633D" aria-hidden="true" />
                <Text color="var(--pb-ink-soft)" fontSize="12px" lineHeight="17px">{t('household.expenseModal.autoDescription', { description: resolvedDescription })}</Text>
              </HStack>
            )}
          </FormCard>

          <FormCard>
            <Flex align="center" justify="space-between" gap={2}>
              <SectionHeading title={t('household.expenseModal.whoSplits')} hint={t('household.expenseModal.whoSplitsHint')} />
              <Text px={2.25} py={1.5} borderRadius="10px" bg="#EDF2E5" color="var(--pb-income)" fontSize="11px" fontWeight={800}>
                {formatNumber(participantIds.size)}/{formatNumber(household.members.length)}
              </Text>
            </Flex>
            <FormControl mt={3.5} isInvalid={hasSubmitted && !participantsAreValid}>
              <VStack align="stretch" spacing={1.5}>
                {household.members.map((member) => {
                  const isPayer = member.id === payerMemberId
                  const selected = participantIds.has(member.id)
                  return (
                    <Flex as="label" key={member.id} minH="58px" px={2.5} py={2} align="center" border="1px solid"
                      borderColor={selected ? '#DAE5CE' : '#E8EBE1'} borderRadius="14px" bg={selected ? '#F0F5E9' : '#F8F8F3'} cursor={isPayer ? 'default' : 'pointer'}>
                      <Flex w="36px" h="36px" mr={2.5} flexShrink={0} align="center" justify="center" borderRadius="full"
                        bg={selected ? '#DCE8D1' : '#EAEDE4'} color={selected ? 'var(--pb-income)' : 'var(--pb-ink-faint)'} fontSize="13px" fontWeight={700}>
                        {member.name.trim().charAt(0).toUpperCase()}
                      </Flex>
                      <Text flex={1} minW={0} color="var(--pb-ink)" fontSize="13px" fontWeight={600} noOfLines={1}>
                        {isPayer ? `${t('household.common.you')} \u00B7 ${t('household.expenseModal.paid')}` : member.name}
                      </Text>
                      <Checkbox isChecked={selected} isDisabled={isPayer} onChange={(event) => {
                        setParticipantIds((current) => {
                          const next = new Set(current)
                          if (event.target.checked) next.add(member.id)
                          else next.delete(member.id)
                          return next
                        })
                      }} sx={{
                        '.chakra-checkbox__control': { w: '24px', h: '24px', borderRadius: '12px', borderWidth: '1.5px', borderColor: '#C9D5C0', bg: selected ? '#54754B' : 'transparent', color: 'white' },
                        '.chakra-checkbox__control[data-checked]': { bg: '#54754B', borderColor: '#54754B' },
                        '.chakra-checkbox__control[data-disabled]': { opacity: 1 },
                      }} />
                    </Flex>
                  )
                })}
              </VStack>
              <FormErrorMessage fontSize="11px" fontWeight={600}>{t('household.expenseModal.selectParticipants')}</FormErrorMessage>
            </FormControl>
            {participantsAreValid && amountIsValid && (
              <Box mt={3.5} p={3.5} borderRadius="16px" bg="#E6EFDB">
                <HStack spacing={1.75} color="#52664B"><Users size={17} aria-hidden="true" /><Text fontSize="11px">{t('household.expenseModal.approximatelyPerPerson')}</Text></HStack>
                <Text mt={1.5} color="var(--pb-income)" fontSize="25px" fontWeight={800} letterSpacing="-.5px">{formatCurrency(preview)}</Text>
                <Text mt={1} color="var(--pb-ink-soft)" fontSize="10px">{t('household.expenseModal.roundingHint')}</Text>
              </Box>
            )}
          </FormCard>

          <FormCard>
            <AttachmentPicker files={files} onChange={setFiles}
              existingCount={(expense?.attachments ?? []).filter((attachment) => attachment.status === 'AVAILABLE').length} />
          </FormCard>
        </VStack>
      </Box>
    </PremiumModal>
  )

  function SplitHint({ count, compact }: { count: number; compact: boolean }) {
    return (
      <HStack flexShrink={0} spacing={1} color="#52664B" display={{ base: compact ? 'flex' : 'none', sm: compact ? 'none' : 'flex' }} mb={compact ? 3 : 0}>
        <Users size={14} aria-hidden="true" />
        <Text fontSize="11px">{count >= 2 ? t('household.expenseModal.dividedBy', { count: formatNumber(count) }) : t('household.expenseModal.selectWhoSplits')}</Text>
      </HStack>
    )
  }
}

function ExpenseSheetHeader({ householdName, editing, saving, onClose }: { householdName: string; editing: boolean; saving: boolean; onClose: () => void }) {
  const { t } = useI18n()
  return (
    <Box position="relative" overflow="hidden" bg="#EDF2E5" borderBottom="1px solid #DFE7D6" px={5} pt={2.5} pb={5}>
      <Box aria-hidden="true" position="absolute" inset="0 0 0 auto" w="190px"
        bgImage="linear-gradient(90deg, #EDF2E5 0%, rgba(237,242,229,.76) 48%, rgba(237,242,229,.18) 100%), url('/household-landscape.svg')"
        bgSize="cover" bgPosition="center" pointerEvents="none" />
      <Box w="36px" h="5px" mx="auto" mb={4.5} borderRadius="full" bg="#C6D1C1" />
      <Flex position="relative" align="center" gap={3}>
        <Flex w="48px" h="48px" flexShrink={0} align="center" justify="center" borderRadius="17px" bg="#E3ECD9" border="1px solid #D4DFC9" color="#42633D">
          <ShoppingCart size={20} weight="duotone" aria-hidden="true" />
        </Flex>
        <Box minW={0} flex={1}>
          <Text color="#60735A" fontSize="10px" fontWeight={700} letterSpacing=".08em" noOfLines={1}>{householdName}</Text>
          <Text mt={0.5} color="var(--pb-ink)" fontSize="20px" fontWeight={800} letterSpacing="-.5px" lineHeight={1.15} noOfLines={1}>
            {t(editing ? 'household.expenseModal.editTitle' : 'household.expenseModal.addTitle')}
          </Text>
          <Text mt={1} color="var(--pb-ink-soft)" fontSize="11px">{t('household.expenseModal.headerHint')}</Text>
        </Box>
        <IconButton aria-label={t('household.common.close')} icon={<X size={18} weight="bold" />} onClick={onClose} isDisabled={saving}
          w="44px" minW="44px" h="44px" borderRadius="full" bg="#EAEDE4" color="var(--pb-ink)" _hover={{ bg: '#DEE4D8' }} />
      </Flex>
    </Box>
  )
}

function FormCard({ children }: { children: ReactNode }) {
  return <Box p={4} bg="#FFFEFA" border="1px solid #E2E6DB" borderRadius="22px">{children}</Box>
}

function SectionHeading({ title, hint }: { title: string; hint: string }) {
  return (
    <Box>
      <Text color="var(--pb-ink)" fontSize="15px" fontWeight={700} letterSpacing="-.2px">{title}</Text>
      <Text mt={1} color="var(--pb-ink-soft)" fontSize="11px" lineHeight="16px">{hint}</Text>
    </Box>
  )
}
