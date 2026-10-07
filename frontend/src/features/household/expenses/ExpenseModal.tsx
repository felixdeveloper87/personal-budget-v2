import { useEffect, useState, type ElementType, type FormEvent, type ReactNode } from 'react'
import { Box, Button, Checkbox, Flex, FormControl, FormErrorMessage, HStack, Icon, IconButton, Input, SimpleGrid, Text, VStack, usePrefersReducedMotion } from '@chakra-ui/react'
import { createHouseholdExpense, deleteHouseholdExpense, updateHouseholdExpense, uploadHouseholdExpenseAttachments } from '../../../api'
import { Calculator, Calendar, Check, FileText, Plus, ShoppingCart, Tag, Trash2, Users, X } from '../../../components/ui/icons'
import { PremiumModal } from '../../../components/ui'
import { useThemeColors } from '../../../hooks/useThemeColors'
import { useI18n } from '../../../i18n'
import { ToastService } from '../../../services/toast'
import type { HouseholdDashboard, HouseholdExpense, HouseholdExpenseRequest, HouseholdPageState } from '../../../types'
import { AttachmentPicker } from '../HouseholdAttachments'
import { today } from '../householdDates'
import { CATEGORIES, getHouseholdCategoryConfig } from './expenseConfig'

const DETAIL_CATEGORIES = new Set(['Groceries', 'Cleaning', 'Repairs', 'Garden', 'Other'])
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
  const colors = useThemeColors()

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
  const visibleCategories = expense?.category === 'Rent'
    ? CATEGORIES
    : CATEGORIES.filter((item) => item !== 'Rent')
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
        bg="var(--pb-forest)" color="white"
        leftIcon={expense ? <Check size={18} weight="bold" /> : <Plus size={18} weight="bold" />}
        isDisabled={!canSubmit} isLoading={saving} loadingText={t('household.common.saving')}
        fontSize="sm" fontWeight={800} _hover={{ bg: '#6E08B3' }}
        _disabled={{ bg: '#C9A6E8', color: 'white', opacity: 1, cursor: 'not-allowed' }}
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
        className: 'nu-dashboard',
        w: { base: '100%', md: 'min(640px, calc(100vw - 32px))' }, maxW: '640px',
        h: { base: '80dvh', md: '80vh' }, maxH: { base: '80dvh', md: '80vh' },
        mt: 'auto', mb: 0, mx: 'auto', borderRadius: '32px 32px 0 0', bg: 'var(--nu-page, #ffffff)',
      }}
      header={<ExpenseSheetHeader householdName={household.name} editing={Boolean(expense)} saving={saving} onClose={onClose} />}
    >
      <Box as="form" id="household-expense-form" onSubmit={submit} overflowY="auto" flex={1} minH={0}
        bg="var(--nu-page, #ffffff)" p={{ base: 3, sm: 5, md: 6 }} sx={{ WebkitOverflowScrolling: 'touch' }}>
        <VStack align="stretch" spacing={3}>
          <FieldCard icon={Calculator} label={t('household.expenseModal.totalAmount')}
            right={
              <HStack spacing={1} justify="flex-end" whiteSpace="nowrap" px={2} py={1} borderRadius="10px" bg="#f3e8fc">
                <Text color="#820ad1" fontSize="lg" fontWeight={800}>{mark}</Text>
                <Input variant="unstyled" inputMode="decimal" value={amount}
                  onChange={(event) => setAmount(event.target.value.replace(/[^0-9.,]/g, ''))}
                  placeholder="0.00" aria-label={t('household.expenseModal.totalAmount')}
                  w={{ base: '68px', sm: '80px' }} minW={{ base: '68px', sm: '80px' }} flex="none" p={0}
                  color="#820ad1" fontSize="22px" fontWeight={800} lineHeight="1.1" textAlign="left"
                  sx={{ fontVariantNumeric: 'tabular-nums', _placeholder: { color: colors.text.secondary, opacity: 0.8 } }} />
              </HStack>
            }>
            <HStack spacing={1.5} color={colors.text.secondary}>
              <Users size={14} aria-hidden="true" />
              <Text fontSize="xs">{participantIds.size >= 2 ? t('household.expenseModal.dividedBy', { count: formatNumber(participantIds.size) }) : t('household.expenseModal.selectWhoSplits')}</Text>
            </HStack>
            {hasSubmitted && !amountIsValid && <Text color="red.400" fontSize="xs" fontWeight={600}>{t('household.expenseModal.invalidAmount')}</Text>}
          </FieldCard>

          <FieldCard icon={Calendar} label={t('household.expenseModal.expenseDate')}
            right={
              <Input type="date" value={expenseDate} onChange={(event) => setExpenseDate(event.target.value)} size="sm"
                w="auto" bg={colors.bgSecondary} border="none" borderRadius="lg" color={colors.text.primary} fontSize="sm" fontWeight={600}
                _focusVisible={{ boxShadow: '0 0 0 2px rgba(130,10,209,.2)' }} />
            } />

          <FieldCard icon={Tag} label={t('household.expenseModal.aboutTitle')}>
            <SimpleGrid columns={2} spacing={2}>
              {visibleCategories.map((item, index) => {
                const selected = category === item
                const CategoryIcon = getHouseholdCategoryConfig(item).icon
                const spanLast = visibleCategories.length % 2 === 1 && index === visibleCategories.length - 1
                return (
                  <Button key={item} type="button" variant="ghost" h={{ base: 10, sm: 11 }} px={3} minW={0}
                    gridColumn={spanLast ? 'span 2' : undefined} justifyContent="flex-start" borderRadius="xl"
                    leftIcon={<CategoryIcon size={16} weight="duotone" aria-hidden="true" />} iconSpacing={2}
                    border="1px solid" borderColor={selected ? '#820ad1' : colors.border}
                    bg={selected ? colors.bgSecondary : 'transparent'}
                    color={selected ? colors.text.primary : colors.text.secondary}
                    fontSize="xs" fontWeight={selected ? 600 : 500} aria-pressed={selected}
                    onClick={() => chooseCategory(item)}
                    transition={prefersReducedMotion ? 'none' : undefined}
                    _hover={{ bg: colors.bgSecondary }} _active={{ bg: colors.bgSecondary }}>
                    <Text as="span" flex={1} textAlign="left" noOfLines={1}>{t(`household.category.${item}`, undefined, item)}</Text>
                    {selected && <Check size={12} weight="bold" aria-hidden="true" />}
                  </Button>
                )
              })}
            </SimpleGrid>
          </FieldCard>

          {requiresDescription ? (
            <FieldCard icon={FileText} label={t('household.expenseModal.whatWasIt')}
              right={
                <FormControl isInvalid={hasSubmitted && !descriptionIsValid} flex={1} minW={0}>
                  <Input value={description} maxLength={255} onChange={(event) => setDescription(event.target.value)}
                    placeholder={t(`household.expenseModal.placeholder.${category}`, undefined, t('household.expenseModal.descriptionPlaceholder'))}
                    variant="unstyled" textAlign="right" color={colors.text.primary} fontSize={{ base: 'sm', sm: 'md' }} fontWeight={500}
                    _placeholder={{ color: colors.text.secondary, opacity: 0.75 }} />
                  <FormErrorMessage justifyContent="flex-end" fontSize="xs">{t('household.expenseModal.descriptionRequired')}</FormErrorMessage>
                </FormControl>
              } />
          ) : (
            <FieldCard icon={FileText} label={t('household.expenseModal.whatWasIt')}
              right={<Text fontSize="sm" fontWeight={500} color={colors.text.primary} noOfLines={1}>{resolvedDescription}</Text>} />
          )}

          <FieldCard icon={Users} label={t('household.expenseModal.whoSplits')}
            right={<Text fontSize="sm" fontWeight={700} color={colors.text.primary}>{formatNumber(participantIds.size)}/{formatNumber(household.members.length)}</Text>}>
            <FormControl isInvalid={hasSubmitted && !participantsAreValid}>
              <SimpleGrid columns={2} spacing={2}>
                {household.members.map((member, index) => {
                  const isPayer = member.id === payerMemberId
                  const selected = participantIds.has(member.id)
                  const spanLast = household.members.length % 2 === 1 && index === household.members.length - 1
                  return (
                    <Flex as="label" key={member.id} minH={{ base: 10, sm: 11 }} px={3} align="center" gap={2}
                      gridColumn={spanLast ? 'span 2' : undefined}
                      border="1px solid" borderColor={selected ? '#820ad1' : colors.border} borderRadius="xl"
                      bg={selected ? colors.bgSecondary : 'transparent'} cursor={isPayer ? 'default' : 'pointer'}>
                      <Text flex={1} minW={0} fontSize="xs" fontWeight={selected ? 600 : 500}
                        color={selected ? colors.text.primary : colors.text.secondary} noOfLines={1}>
                        {isPayer ? `${t('household.common.you')} \u00B7 ${t('household.expenseModal.paid')}` : member.name}
                      </Text>
                      <Checkbox isChecked={selected} isDisabled={isPayer} colorScheme="purple" onChange={(event) => {
                        setParticipantIds((current) => {
                          const next = new Set(current)
                          if (event.target.checked) next.add(member.id)
                          else next.delete(member.id)
                          return next
                        })
                      }} sx={{ '.chakra-checkbox__control[data-disabled]': { opacity: 1 } }} />
                    </Flex>
                  )
                })}
              </SimpleGrid>
              <FormErrorMessage fontSize="xs" fontWeight={600}>{t('household.expenseModal.selectParticipants')}</FormErrorMessage>
            </FormControl>
            {participantsAreValid && amountIsValid && (
              <Text fontSize="xs" color={colors.text.secondary}>
                {t('household.expenseModal.approximatelyPerPerson')}{' '}
                <Text as="span" fontSize="sm" fontWeight={800} color="#820ad1">{formatCurrency(preview)}</Text>
              </Text>
            )}
          </FieldCard>

          <AttachmentPicker files={files} onChange={setFiles}
            existingCount={(expense?.attachments ?? []).filter((attachment) => attachment.status === 'AVAILABLE').length} />
        </VStack>
      </Box>
    </PremiumModal>
  )
}

function ExpenseSheetHeader({ householdName, editing, saving, onClose }: { householdName: string; editing: boolean; saving: boolean; onClose: () => void }) {
  const { t } = useI18n()
  return (
    <Box position="relative" overflow="hidden" bg="var(--pb-tint-green)" borderBottom="1px solid var(--pb-hair)" px={5} pt={2.5} pb={5}>
      <Box aria-hidden="true" position="absolute" inset="0 0 0 auto" w="190px"
        bgImage="linear-gradient(90deg, #F3E8FC 0%, rgba(243,232,252,.76) 48%, rgba(243,232,252,.18) 100%), url('/household-landscape.svg?v=20261004-lilac')"
        bgSize="cover" bgPosition="center" pointerEvents="none" />
      <Box w="36px" h="5px" mx="auto" mb={4.5} borderRadius="full" bg="var(--pb-hair-2)" />
      <Flex position="relative" align="center" gap={3}>
        <Flex w="48px" h="48px" flexShrink={0} align="center" justify="center" borderRadius="17px" bg="var(--pb-tint-green)" border="1px solid var(--pb-hair-2)" color="var(--pb-forest)">
          <ShoppingCart size={20} weight="duotone" aria-hidden="true" />
        </Flex>
        <Box minW={0} flex={1}>
          <Text color="var(--pb-forest)" fontSize="10px" fontWeight={700} letterSpacing=".08em" noOfLines={1}>{householdName}</Text>
          <Text mt={0.5} color="var(--pb-ink)" fontSize="20px" fontWeight={800} letterSpacing="-.5px" lineHeight={1.15} noOfLines={1}>
            {t(editing ? 'household.expenseModal.editTitle' : 'household.expenseModal.addTitle')}
          </Text>
          <Text mt={1} color="var(--pb-ink-soft)" fontSize="11px">{t('household.expenseModal.headerHint')}</Text>
        </Box>
        <IconButton aria-label={t('household.common.close')} icon={<X size={18} weight="bold" />} onClick={onClose} isDisabled={saving}
          w="44px" minW="44px" h="44px" borderRadius="full" bg="var(--pb-hair)" color="var(--pb-ink)" _hover={{ bg: 'var(--pb-hair)' }} />
      </Flex>
    </Box>
  )
}

function FieldCard({ icon, label, right, children }: { icon: ElementType; label: string; right?: ReactNode; children?: ReactNode }) {
  const colors = useThemeColors()
  return (
    <Box borderRadius="2xl" bg={colors.inputBg} border="2px solid" borderColor={colors.border}
      _focusWithin={{ borderColor: '#820ad1', boxShadow: '0 0 0 3px #820ad120' }} transition="border-color 0.3s ease, box-shadow 0.3s ease">
      <VStack align="stretch" spacing={3} px={{ base: 3, sm: 4 }} py={{ base: 3, sm: 4 }}>
        <HStack justify="space-between" spacing={3} align="center">
          <HStack spacing={2.5} flexShrink={0}>
            <Box role="presentation" w={{ base: 8, sm: 10 }} h={{ base: 8, sm: 10 }} borderRadius="xl" bg={colors.bgSecondary} color="#820ad1"
              display="flex" alignItems="center" justifyContent="center" flexShrink={0} aria-hidden>
              <Icon as={icon} boxSize={{ base: 4, sm: 5 }} sx={{ '& svg': { display: 'block' } }} />
            </Box>
            <Text fontSize={{ base: 'sm', sm: 'md' }} fontWeight="600" color={colors.text.secondary} lineHeight="1.1" whiteSpace="nowrap">{label}</Text>
          </HStack>
          {right && <Flex flex={1} minW={0} justify="flex-end">{right}</Flex>}
        </HStack>
        {children}
      </VStack>
    </Box>
  )
}
