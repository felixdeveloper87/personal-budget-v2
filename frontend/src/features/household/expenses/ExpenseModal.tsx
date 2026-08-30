import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Badge, Box, Button, Checkbox, Flex, FormControl, FormErrorMessage, FormLabel, HStack, Icon, Input, InputGroup, InputLeftElement, Select, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import { createHouseholdExpense, deleteHouseholdExpense, updateHouseholdExpense, uploadHouseholdExpenseAttachments } from '../../../api'
import { useI18n } from '../../../i18n'
import { ToastService } from '../../../services/toast'
import type { HouseholdDashboard, HouseholdExpense, HouseholdExpenseRequest, HouseholdPageState } from '../../../types'
import { Check, ReceiptText, Trash2, Zap } from '../../../components/ui/icons'
import { ModalHeader as AppModalHeader, PremiumModal } from '../../../components/ui'
import { AttachmentPicker } from '../HouseholdAttachments'
import { CATEGORIES, HOUSEHOLD_EXPENSE_PRESETS, type HouseholdExpensePreset } from './expenseConfig'
import { today } from '../householdDates'

export function ExpenseModal({
  isOpen,
  onClose,
  household,
  expense,
  onChanged,
}: {
  isOpen: boolean
  onClose: () => void
  household: HouseholdDashboard
  expense: HouseholdExpense | null
  onChanged: (page: HouseholdPageState) => void
}) {
  const { formatCurrency, formatNumber, t } = useI18n()
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<string>('Other')
  const [amount, setAmount] = useState('')
  const [expenseDate, setExpenseDate] = useState(today())
  const [participantIds, setParticipantIds] = useState<Set<number>>(new Set())
  const [files, setFiles] = useState<File[]>([])
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const amountInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isOpen) return
    setDescription(expense?.description ?? '')
    setCategory(expense?.category ?? 'Other')
    setAmount(expense ? String(expense.amount) : '')
    setExpenseDate(expense?.expenseDate ?? today())
    setFiles([])
    setHasSubmitted(false)
    setParticipantIds(new Set(
      expense?.shares.map((share) => share.memberId)
      ?? household.members.map((member) => member.id),
    ))
  }, [expense, household.members, isOpen])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setHasSubmitted(true)
    const numericAmount = Number(amount)
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      ToastService.warning({ title: t('household.expenseModal.invalidAmount') })
      return
    }
    if (participantIds.size < 2) {
      ToastService.warning({ title: t('household.expenseModal.selectParticipants') })
      return
    }
    const request: HouseholdExpenseRequest = {
      description: description.trim(),
      category,
      amount: numericAmount,
      expenseDate,
      participantMemberIds: [...participantIds],
    }
    setSaving(true)
    let savedPage: HouseholdPageState | null = null
    try {
      let targetId = expense?.id
      if (expense) {
        savedPage = await updateHouseholdExpense(household.id, expense.id, request)
      } else {
        const created = await createHouseholdExpense(household.id, request)
        savedPage = created.page
        targetId = created.recordId
      }
      if (files.length > 0) {
        if (!targetId) {
          throw new Error(t('household.expenseModal.uploadTargetError'))
        }
        savedPage = await uploadHouseholdExpenseAttachments(
          household.id,
          targetId,
          files,
        )
      }
      onChanged(savedPage)
      ToastService.success({
        title: expense
          ? t('household.expenseModal.updatedToast')
          : t('household.expenseModal.addedToast'),
      })
      onClose()
    } catch (error) {
      if (savedPage) {
        onChanged(savedPage)
        ToastService.apiError(error, {
          title: t('household.expenseModal.imagesFailed'),
        })
        onClose()
      } else {
        ToastService.apiError(error, { title: t('household.expenseModal.saveFailed') })
      }
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

  const preview = Number(amount) > 0 && participantIds.size > 0
    ? Number(amount) / participantIds.size
    : 0
  const amountIsValid = Number.isFinite(Number(amount)) && Number(amount) > 0
  const payerMemberId = expense?.payerMemberId ?? household.currentMemberId
  const payer = household.members.find((member) => member.id === payerMemberId)
  const currencyMark = household.currency === 'GBP' ? 'Â£' : household.currency
  const categoryOptions = CATEGORIES.includes(category as typeof CATEGORIES[number])
    ? CATEGORIES
    : [category, ...CATEGORIES]

  const applyPreset = (preset: HouseholdExpensePreset) => {
    setDescription(t(`household.expenseModal.quick.${preset.key}.description`))
    setCategory(preset.category)
    amountInputRef.current?.focus()
  }

  const selectEveryone = () => {
    setParticipantIds(new Set(household.members.map((member) => member.id)))
  }

  const footer = (
    <Flex
      w="full"
      direction={{ base: 'column-reverse', sm: 'row' }}
      align={{ base: 'stretch', sm: 'center' }}
      justify={expense ? 'space-between' : 'flex-end'}
      gap={2}
    >
      <Box>
        {expense && (
          <Button
            h="44px"
            color="var(--pb-coral)"
            bg="transparent"
            leftIcon={<Icon as={Trash2} boxSize={4} weight="bold" />}
            isLoading={deleting}
            onClick={() => void remove()}
            w={{ base: 'full', sm: 'auto' }}
            _hover={{ bg: 'var(--pb-tint-coral)' }}
          >
            {t('household.common.remove')}
          </Button>
        )}
      </Box>
      <HStack w={{ base: 'full', sm: 'auto' }} spacing={2}>
        <Button
          h="44px"
          flex={{ base: 1, sm: 'initial' }}
          variant="ghost"
          color="var(--pb-ink-soft)"
          onClick={onClose}
        >
          {t('household.common.cancel')}
        </Button>
        <Button
          h="44px"
          flex={{ base: 1.35, sm: 'initial' }}
          type="submit"
          form="household-expense-form"
          leftIcon={<Icon as={Check} boxSize={4} weight="bold" />}
          bg="var(--pb-forest-2)"
          color="var(--pb-on-accent)"
          borderRadius="11px"
          isLoading={saving}
          loadingText={t('household.common.saving')}
          _hover={{ bg: 'var(--pb-forest)' }}
        >
          {expense
            ? t('household.expenseModal.saveChanges')
            : t('household.expenseModal.addExpense')}
        </Button>
      </HStack>
    </Flex>
  )

  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', md: '3xl' }}
      header={
        <AppModalHeader
          icon={ReceiptText}
          title={expense
            ? t('household.expenseModal.editTitle')
            : t('household.expenseModal.addTitle')}
          caption={t('household.expenseModal.caption')}
          onClose={onClose}
          accent="red"
          rightSlot={
            <Badge
              bg="var(--pb-tint-green)"
              color="var(--pb-forest-2)"
              border="1px solid var(--pb-hair)"
              borderRadius="full"
              px={3}
              py={1}
              textTransform="none"
            >
              {payer?.name ?? t('household.common.you')}
            </Badge>
          }
        />
      }
      footer={footer}
    >
      <Box
        as="form"
        id="household-expense-form"
        onSubmit={submit}
        p={{ base: 3, sm: 6, md: 8 }}
        bg="var(--pb-surface-2)"
        sx={{
          '.chakra-form__label': {
            color: 'var(--pb-ink-soft)',
            fontSize: 'xs',
            fontWeight: 700,
            mb: 1.5,
          },
          'input, select': {
            background: 'var(--pb-surface)',
            borderColor: 'var(--pb-hair)',
            color: 'var(--pb-ink)',
            borderRadius: '12px',
          },
          'input:hover, select:hover': { borderColor: 'var(--pb-hair-2)' },
          'input:focus-visible, select:focus-visible': {
            borderColor: 'var(--pb-forest-2)',
            boxShadow: '0 0 0 2px var(--pb-tint-green)',
          },
        }}
      >
        <VStack align="stretch" spacing={{ base: 4, sm: 6 }}>
          {/* Main Amount Input (Hero) */}
          <Box
            pt={expense ? 2 : 4}
            pb={{ base: 4, sm: 8 }}
            textAlign="center"
            position="relative"
            bg="linear-gradient(180deg, var(--pb-surface-2) 0%, transparent 100%)"
            borderRadius="24px"
          >
            <Text
              textTransform="uppercase"
              letterSpacing="widest"
              fontSize="xs"
              fontWeight={800}
              color="var(--pb-ink-faint)"
              mb={3}
            >
              {t('household.expenseModal.amount')}
            </Text>
            <Flex justify="center" align="center">
              <InputGroup size="lg" maxW="360px" mx="auto">
                <InputLeftElement
                  pointerEvents="none"
                  color="var(--pb-ink-soft)"
                  fontSize={{ base: '3xl', sm: '4xl' }}
                  fontWeight={700}
                  w="60px"
                  h="full"
                  justifyContent="center"
                  pt={1}
                >
                  {currencyMark}
                </InputLeftElement>
                <Input
                  ref={amountInputRef}
                  variant="unstyled"
                  type="number"
                  min="0.01"
                  step="0.01"
                  inputMode="decimal"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="0.00"
                  fontSize={{ base: '4xl', sm: '5xl', md: '7xl' }}
                  fontWeight={800}
                  color="var(--pb-ink)"
                  h={{ base: '64px', sm: '80px', md: '100px' }}
                  pl="60px"
                  textAlign="center"
                  letterSpacing="-0.02em"
                  _placeholder={{ color: 'var(--pb-hair-2)' }}
                  bg="transparent"
                  _hover={{ borderColor: 'transparent' }}
                  _focusVisible={{ boxShadow: 'none' }}
                />
              </InputGroup>
            </Flex>
            {hasSubmitted && !amountIsValid && (
              <Text color="var(--pb-coral)" fontSize="sm" fontWeight={600} mt={2}>
                {t('household.expenseModal.invalidAmount')}
              </Text>
            )}
          </Box>

          {!expense && (
            <Box>
              <HStack align="center" spacing={2} mb={3}>
                <Icon as={Zap} boxSize={4} weight="fill" color="var(--pb-gold-2)" />
                <Text fontSize="sm" fontWeight={750} color="var(--pb-ink)">
                  {t('household.expenseModal.quickTitle')}
                </Text>
              </HStack>
              <HStack
                spacing={3}
                mx={-1}
                px={1}
                pb={2}
                overflowX="auto"
                align="stretch"
                scrollSnapType="x proximity"
                aria-label={t('household.expenseModal.quickTitle')}
                sx={{
                  /* Elegant thin scrollbar */
                  '&::-webkit-scrollbar': {
                    height: '6px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'transparent',
                    my: 2,
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: 'var(--pb-hair-2)',
                    borderRadius: '8px',
                  },
                  '&::-webkit-scrollbar-thumb:hover': {
                    background: 'var(--pb-ink-faint)',
                  },
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'var(--pb-hair-2) transparent',
                }}
              >
                {HOUSEHOLD_EXPENSE_PRESETS.map((preset) => {
                  const presetDescription = t(
                    `household.expenseModal.quick.${preset.key}.description`,
                  )
                  const selected = category === preset.category
                    && description === presetDescription
                  return (
                    <Box
                      as="button"
                      type="button"
                      key={preset.key}
                      flex="0 0 auto"
                      w={{ base: '105px', sm: '130px' }}
                      p={{ base: 2.5, sm: 3 }}
                      display="flex"
                      flexDirection="column"
                      alignItems="flex-start"
                      gap={{ base: 2, sm: 2.5 }}
                      textAlign="left"
                      borderRadius="16px"
                      border="1.5px solid"
                      borderColor={selected ? preset.color : 'var(--pb-hair)'}
                      bg={selected ? preset.tint : 'var(--pb-surface)'}
                      boxShadow={selected ? `0 4px 14px ${preset.tint}` : '0 2px 6px rgba(0,0,0,0.03)'}
                      color={selected ? preset.color : 'var(--pb-ink)'}
                      aria-pressed={selected}
                      scrollSnapAlign="start"
                      onClick={() => applyPreset(preset)}
                      transition="all .2s ease"
                      _hover={{
                        transform: 'translateY(-2px)',
                        borderColor: preset.color,
                        boxShadow: `0 6px 16px ${preset.tint}`,
                      }}
                    >
                      <Flex
                        w={8}
                        h={8}
                        align="center"
                        justify="center"
                        borderRadius="10px"
                        bgGradient={selected ? preset.gradient : undefined}
                        bg={selected ? undefined : preset.tint}
                        color={selected ? 'white' : preset.color}
                        boxShadow={selected ? `0 2px 8px ${preset.tint}` : 'none'}
                        transition="all .2s ease"
                      >
                        <Icon as={preset.icon} boxSize={4} weight={selected ? 'fill' : 'duotone'} />
                      </Flex>
                      <Text
                        fontSize="xs"
                        fontWeight={750}
                        lineHeight={1.2}
                        color={selected ? preset.color : 'var(--pb-ink)'}
                      >
                        {t(`household.expenseModal.quick.${preset.key}.label`)}
                      </Text>
                    </Box>
                  )
                })}
              </HStack>
            </Box>
          )}

          <Box
            p={{ base: 3, sm: 4, md: 5 }}
            bg="var(--pb-surface)"
            borderRadius="20px"
            boxShadow="0 2px 8px rgba(0,0,0,0.03)"
          >
            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
              <FormControl isRequired>
                <FormLabel>{t('household.expenseModal.date')}</FormLabel>
                <Input
                  h="52px"
                  type="date"
                  value={expenseDate}
                  onChange={(event) => setExpenseDate(event.target.value)}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>{t('household.expenseModal.category')}</FormLabel>
                <Select
                  h="52px"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                >
                  {categoryOptions.map((item) => (
                    <option key={item} value={item}>
                      {t(`household.category.${item}`, undefined, item)}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl
                isRequired
                isInvalid={hasSubmitted && description.trim().length === 0}
                gridColumn={{ sm: '1 / -1' }}
              >
                <FormLabel>{t('household.expenseModal.description')}</FormLabel>
                <Input
                  h="52px"
                  value={description}
                  maxLength={255}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder={t('household.expenseModal.descriptionPlaceholder')}
                />
                <FormErrorMessage fontSize="xs">
                  {t('household.expenseModal.descriptionRequired')}
                </FormErrorMessage>
              </FormControl>
            </SimpleGrid>
          </Box>

          <Box
            p={{ base: 3, sm: 4, md: 5 }}
            bg="var(--pb-surface)"
            borderRadius="20px"
            boxShadow="0 2px 8px rgba(0,0,0,0.03)"
          >
            <Flex align="flex-start" justify="space-between" gap={3} mb={5}>
              <Box>
                <Text fontWeight={800} fontSize="sm" color="var(--pb-ink)" lineHeight={1.2}>
                  {t('household.expenseModal.splitBetween')}
                </Text>
                <Text mt={1} fontSize="xs" color="var(--pb-ink-soft)">
                  {t('household.expenseModal.splitDescription')}
                </Text>
              </Box>
              {participantIds.size < household.members.length && (
                <Button
                  size="sm"
                  variant="ghost"
                  color="var(--pb-forest-2)"
                  onClick={selectEveryone}
                  flexShrink={0}
                  borderRadius="full"
                  bg="var(--pb-tint-green)"
                  _hover={{ bg: 'var(--pb-tint-green-hover, #d5ece4)' }}
                  display={{ base: 'none', sm: 'flex' }}
                >
                  {t('household.expenseModal.selectEveryone')}
                </Button>
              )}
            </Flex>

            {participantIds.size < household.members.length && (
              <Button
                size="xs"
                variant="ghost"
                color="var(--pb-forest-2)"
                onClick={selectEveryone}
                w="full"
                mb={4}
                borderRadius="full"
                bg="var(--pb-tint-green)"
                _hover={{ bg: 'var(--pb-tint-green-hover, #d5ece4)' }}
                display={{ base: 'flex', sm: 'none' }}
              >
                {t('household.expenseModal.selectEveryone')}
              </Button>
            )}

            <FormControl isInvalid={hasSubmitted && participantIds.size < 2}>
              <VStack spacing={3} align="stretch">
                {household.members.map((member) => {
                  const isPayer = member.id === payerMemberId
                  const isSelected = participantIds.has(member.id)
                  return (
                    <Flex
                      as="label"
                      key={member.id}
                      minH={{ base: '56px', sm: '60px' }}
                      px={{ base: 3, sm: 4 }}
                      py={{ base: 2.5, sm: 3 }}
                      align="center"
                      gap={{ base: 3, sm: 4 }}
                      borderRadius="16px"
                      border="2px solid"
                      borderColor={isSelected ? 'var(--pb-forest-2)' : 'transparent'}
                      bg={isSelected ? 'var(--pb-tint-green)' : 'var(--pb-surface-2)'}
                      cursor={isPayer ? 'default' : 'pointer'}
                      transition="all .2s ease"
                      _hover={{
                        transform: isPayer ? 'none' : 'scale(1.01)',
                      }}
                    >
                      <Checkbox
                        size="lg"
                        isChecked={isSelected}
                        isDisabled={isPayer}
                        colorScheme="green"
                        onChange={(event) => {
                          setParticipantIds((current) => {
                            const next = new Set(current)
                            if (event.target.checked) next.add(member.id)
                            else next.delete(member.id)
                            return next
                          })
                        }}
                        sx={{
                          '.chakra-checkbox__control': {
                            borderRadius: 'full',
                            borderWidth: '2px',
                          }
                        }}
                      />
                      <Box minW={0} flex={1}>
                        <Text color="var(--pb-ink)" fontSize="md" fontWeight={750} noOfLines={1}>
                          {member.name}
                        </Text>
                        {isPayer && (
                          <Text color="var(--pb-forest-2)" fontSize="xs" fontWeight={600} mt={0.5}>
                            {t('household.expenseModal.payerHint')}
                          </Text>
                        )}
                      </Box>
                      {isPayer && (
                        <Badge
                          bg="var(--pb-forest-2)"
                          color="var(--pb-on-accent)"
                          borderRadius="full"
                          px={3}
                          py={1}
                          textTransform="uppercase"
                          fontSize="2xs"
                          fontWeight={800}
                          letterSpacing="wider"
                        >
                          {t('household.expenseModal.payer')}
                        </Badge>
                      )}
                    </Flex>
                  )
                })}
              </VStack>
              <FormErrorMessage fontSize="sm" mt={3} fontWeight={600}>
                {t('household.expenseModal.selectParticipants')}
              </FormErrorMessage>

              <Box
                mt={{ base: 4, sm: 5 }}
                p={{ base: 3, sm: 4 }}
                borderRadius="16px"
                bg="linear-gradient(135deg, var(--pb-forest-2) 0%, var(--pb-forest) 100%)"
                color="var(--pb-on-accent)"
                boxShadow="0 4px 14px rgba(38, 115, 90, 0.25)"
              >
                <Flex align="center" justify="space-between" flexWrap="wrap" gap={2}>
                  <Text fontSize="sm" fontWeight={600} opacity={0.9}>
                    {t(
                      participantIds.size === 1
                        ? 'household.expenseModal.participants.one'
                        : 'household.expenseModal.participants.other',
                      { count: formatNumber(participantIds.size) },
                    )}
                  </Text>
                  <Text fontSize="xl" fontWeight={800}>
                    {t('household.expenseModal.perPerson', {
                      amount: formatCurrency(preview),
                    })}
                  </Text>
                </Flex>
                <Text mt={2} fontSize="2xs" opacity={0.7} lineHeight={1.4} textAlign="right">
                  {t('household.expenseModal.roundingHint')}
                </Text>
              </Box>
            </FormControl>
          </Box>

          <Box
            p={{ base: 3, sm: 4, md: 5 }}
            bg="var(--pb-surface)"
            borderRadius="20px"
            boxShadow="0 2px 8px rgba(0,0,0,0.03)"
          >
            <AttachmentPicker
              files={files}
              onChange={setFiles}
              existingCount={(expense?.attachments ?? []).filter(
                (attachment) => attachment.status === 'AVAILABLE',
              ).length}
            />
          </Box>
        </VStack>
      </Box>
    </PremiumModal>
  )
}
