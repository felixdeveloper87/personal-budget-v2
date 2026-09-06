import { useEffect, useState, type FormEvent } from 'react'
import { Badge, Box, Button, Divider, Flex, FormControl, FormErrorMessage, FormLabel, Grid, HStack, Icon, IconButton, Input, Switch, Text, VStack } from '@chakra-ui/react'
import { updateHouseholdCleaningRotation } from '../../../api'
import { useI18n } from '../../../i18n'
import { ToastService } from '../../../services/toast'
import type { HouseholdDashboard, HouseholdCleaningRotation, HouseholdPageState } from '../../../types'
import { Check, Calendar, CalendarCheck, ChevronDown, ChevronUp, Clock, Plus, Repeat, X } from '../../../components/ui/icons'
import { ModalHeader, PremiumModal } from '../../../components/ui'
import { currentMonday } from '../householdDates'
import { householdAvatarGradient } from '../householdAvatar'

export function CleaningRotationModal({
  isOpen,
  onClose,
  household,
  rotation,
  onChanged,
}: {
  isOpen: boolean
  onClose: () => void
  household: HouseholdDashboard
  rotation: HouseholdCleaningRotation
  onChanged: (page: HouseholdPageState) => void
}) {
  const { formatDate, formatNumber, t } = useI18n()
  const [startDate, setStartDate] = useState(currentMonday())
  const [active, setActive] = useState(true)
  const [participantIds, setParticipantIds] = useState<number[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setStartDate(rotation.startDate ?? currentMonday())
    setActive(rotation.configured ? rotation.active : true)
    setParticipantIds(
      rotation.configured
        ? rotation.participantMemberIds
        : household.members.map((member) => member.id),
    )
  }, [household.members, isOpen, rotation])

  const participants = participantIds.flatMap((memberId) => {
    const member = household.members.find((candidate) => candidate.id === memberId)
    return member ? [member] : []
  })
  const availableMembers = household.members.filter(
    (member) => !participantIds.includes(member.id),
  )
  const parsedStartDate = new Date(`${startDate}T12:00:00`)
  const startDateIsMonday = !Number.isNaN(parsedStartDate.getTime())
    && parsedStartDate.getDay() === 1
  const canSave = participantIds.length > 0 && startDateIsMonday
  const previewWeeks = canSave
    ? Array.from({ length: 3 }, (_, index) => {
      const weekStart = new Date(parsedStartDate)
      weekStart.setDate(parsedStartDate.getDate() + index * 7)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      const member = participants[index % participants.length]
      const shortDate = (date: Date) => formatDate(date, {
        day: 'numeric',
        month: 'short',
      })
      return {
        member,
        range: `${shortDate(weekStart)} – ${shortDate(weekEnd)}`,
      }
    })
    : []

  const moveParticipant = (index: number, distance: number) => {
    setParticipantIds((current) => {
      const destination = index + distance
      if (destination < 0 || destination >= current.length) return current
      const next = [...current]
        ;[next[index], next[destination]] = [next[destination], next[index]]
      return next
    })
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (participantIds.length === 0) {
      ToastService.warning({ title: t('household.cleaning.toast.selectMember') })
      return
    }
    if (!startDateIsMonday) {
      ToastService.warning({ title: t('household.cleaning.toast.startMonday') })
      return
    }

    setSaving(true)
    try {
      onChanged(await updateHouseholdCleaningRotation(household.id, {
        startDate,
        active,
        participantMemberIds: participantIds,
      }))
      ToastService.success({
        title: rotation.configured
          ? t('household.cleaning.toast.updated')
          : t('household.cleaning.toast.created'),
      })
      onClose()
    } catch (error) {
      ToastService.apiError(error, { title: t('household.cleaning.toast.failed') })
    } finally {
      setSaving(false)
    }
  }

  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', md: '2xl' }}
      header={
        <ModalHeader
          title={rotation.configured
            ? t('household.cleaning.modal.manageTitle')
            : t('household.cleaning.modal.setupTitle')}
          caption={t('household.cleaning.modal.caption')}
          onClose={onClose}
          rightSlot={
            <Badge
              bg={active ? 'var(--pb-tint-income)' : 'var(--pb-surface-3)'}
              color={active ? 'var(--pb-income)' : 'var(--pb-ink-soft)'}
              border="1px solid var(--pb-hair)"
              borderRadius="full"
              px={3}
              py={1}
            >
              {active
                ? t('household.cleaning.modal.active')
                : t('household.cleaning.modal.paused')}
            </Badge>
          }
        />
      }
      footer={
        <Flex justify="flex-end" gap={2} w="full">
          <Button
            type="button"
            flex={{ base: 1, sm: 'initial' }}
            h="44px"
            variant="ghost"
            color="var(--pb-ink-soft)"
            onClick={onClose}
          >
            {t('household.common.cancel')}
          </Button>
          <Button
            flex={{ base: 1.35, sm: 'initial' }}
            h="44px"
            type="submit"
            form="household-cleaning-form"
            leftIcon={<Icon as={Check} boxSize={4} weight="bold" />}
            bg="var(--pb-forest-2)"
            color="var(--pb-on-accent)"
            borderRadius="11px"
            isLoading={saving}
            loadingText={t('household.common.saving')}
            isDisabled={!canSave}
            _hover={{ bg: 'var(--pb-forest)' }}
          >
            {t('household.cleaning.modal.save')}
          </Button>
        </Flex>
      }
    >
      <Box
        as="form"
        id="household-cleaning-form"
        onSubmit={submit}
        px={{ base: 4, sm: 5, md: 6 }}
        py={{ base: 4, md: 5 }}
      >
        <VStack align="stretch" spacing={5}>
          <Flex
            align="center"
            justify="space-between"
            gap={4}
            p={{ base: 3.5, md: 4 }}
            borderRadius="14px"
            bg={active ? 'var(--pb-tint-income)' : 'var(--pb-surface-2)'}
            border="1px solid var(--pb-hair)"
          >
            <HStack spacing={3} minW={0}>
              <Flex
                w={10}
                h={10}
                flexShrink={0}
                align="center"
                justify="center"
                borderRadius="full"
                bg="var(--pb-surface)"
                color={active ? 'var(--pb-income)' : 'var(--pb-gold)'}
                border="1px solid var(--pb-hair)"
              >
                <Icon as={active ? Repeat : Clock} boxSize={4.5} weight="duotone" />
              </Flex>
              <Box minW={0}>
                <Text fontSize="sm" fontWeight={600} color="var(--pb-ink)">
                  {active
                    ? t('household.cleaning.modal.rotationActive')
                    : t('household.cleaning.modal.rotationPaused')}
                </Text>
                <Text mt={0.5} fontSize="xs" color="var(--pb-ink-soft)">
                  {active
                    ? t('household.cleaning.modal.activeDetail')
                    : t('household.cleaning.modal.pausedDetail')}
                </Text>
              </Box>
            </HStack>
            <Switch
              aria-label={t('household.cleaning.modal.toggleAria')}
              isChecked={active}
              onChange={(event) => setActive(event.target.checked)}
              colorScheme="green"
              size="lg"
              flexShrink={0}
            />
          </Flex>

          <Grid
            templateColumns={{ base: '1fr', md: 'minmax(0, 1.15fr) minmax(230px, 0.85fr)' }}
            gap={{ base: 5, md: 6 }}
            alignItems="start"
          >
            <VStack align="stretch" spacing={5} minW={0}>
              <Box>
                <HStack spacing={2.5} mb={3}>
                  <Flex
                    w={8}
                    h={8}
                    align="center"
                    justify="center"
                    borderRadius="10px"
                    bg="var(--pb-tint-green)"
                    color="var(--pb-forest-2)"
                  >
                    <Icon as={CalendarCheck} boxSize={4} weight="duotone" />
                  </Flex>
                  <Box>
                    <Text fontFamily="var(--pb-serif)" fontSize="lg" fontWeight={500} color="var(--pb-ink)">
                      {t('household.cleaning.modal.schedule')}
                    </Text>
                    <Text fontSize="xs" color="var(--pb-ink-soft)">
                      {t('household.cleaning.modal.scheduleDetail')}
                    </Text>
                  </Box>
                </HStack>

                <FormControl isRequired isInvalid={Boolean(startDate) && !startDateIsMonday}>
                  <FormLabel
                    fontFamily="var(--pb-mono)"
                    fontSize="9px"
                    letterSpacing="0.08em"
                    textTransform="uppercase"
                    color="var(--pb-ink-faint)"
                  >
                    {t('household.cleaning.modal.firstWeek')}
                  </FormLabel>
                  <Input
                    type="date"
                    min="2020-01-06"
                    step={7}
                    h="44px"
                    borderRadius="11px"
                    bg="var(--pb-surface-2)"
                    borderColor="var(--pb-hair)"
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                    _hover={{ borderColor: 'var(--pb-hair-2)' }}
                    _focusVisible={{ borderColor: 'var(--pb-forest-2)', boxShadow: '0 0 0 1px var(--pb-forest-2)' }}
                  />
                  <FormErrorMessage fontSize="xs">
                    {t('household.cleaning.modal.mondayError')}
                  </FormErrorMessage>
                  {startDateIsMonday && (
                    <Text mt={1.5} fontSize="xs" color="var(--pb-income)">
                      {t('household.cleaning.modal.mondaySelected')}
                    </Text>
                  )}
                </FormControl>
              </Box>

              <Divider borderColor="var(--pb-hair)" />

              <Box>
                <Flex justify="space-between" align="flex-end" gap={3} mb={3}>
                  <Box>
                    <Text fontFamily="var(--pb-serif)" fontSize="lg" fontWeight={500} color="var(--pb-ink)">
                      {t('household.cleaning.modal.order')}
                    </Text>
                    <Text mt={0.5} fontSize="xs" color="var(--pb-ink-soft)">
                      {t('household.cleaning.modal.orderDetail')}
                    </Text>
                  </Box>
                  <Badge
                    flexShrink={0}
                    bg="var(--pb-surface-2)"
                    color="var(--pb-ink-soft)"
                    border="1px solid var(--pb-hair)"
                    borderRadius="full"
                    px={2.5}
                    py={1}
                  >
                    {t('household.cleaning.modal.selected', {
                      count: formatNumber(participants.length),
                    })}
                  </Badge>
                </Flex>

                {participants.length === 0 ? (
                  <Box
                    p={4}
                    borderRadius="12px"
                    border="1px dashed var(--pb-coral)"
                    bg="var(--pb-tint-coral)"
                  >
                    <Text fontSize="sm" color="var(--pb-coral)">
                      {t('household.cleaning.modal.noMembers')}
                    </Text>
                  </Box>
                ) : (
                  <VStack align="stretch" spacing={2}>
                    {participants.map((member, index) => {
                      const memberIndex = household.members.findIndex(
                        (m) => m.id === member.id,
                      )
                      const gradient = householdAvatarGradient(memberIndex, member.id)

                      return (
                        <Flex
                          key={member.id}
                          direction={{ base: 'column', sm: 'row' }}
                          align={{ base: 'stretch', sm: 'center' }}
                          justify="space-between"
                          gap={2}
                          p={2.5}
                          borderRadius="12px"
                          bg="var(--pb-surface-2)"
                          border="1px solid var(--pb-hair)"
                        >
                          <HStack minW={0} spacing={2.5} flex={1}>
                            <Flex
                              w={7}
                              h={7}
                              flexShrink={0}
                              align="center"
                              justify="center"
                              borderRadius="full"
                              bgGradient={gradient}
                              color="white"
                              border="1px solid rgba(255, 255, 255, 0.24)"
                              boxShadow="0 1px 4px rgba(0, 0, 0, 0.14)"
                              fontFamily="var(--pb-mono)"
                              fontSize="9px"
                              fontWeight={800}
                            >
                              {formatNumber(index + 1)}
                            </Flex>
                            <Box minW={0}>
                              <Text fontSize="sm" fontWeight={600} color="var(--pb-ink)" noOfLines={1}>
                                {member.name}
                              </Text>
                              <Text fontSize="2xs" color="var(--pb-ink-faint)">
                                {t('household.cleaning.modal.cycleWeek', {
                                  week: formatNumber(index + 1),
                                })}
                              </Text>
                            </Box>
                          </HStack>
                          <HStack
                            spacing={1}
                          flexShrink={0}
                          justify="flex-end"
                          w={{ base: 'full', sm: 'auto' }}
                        >
                          <IconButton
                            type="button"
                            aria-label={t('household.cleaning.modal.moveEarlier', {
                              name: member.name,
                            })}
                            icon={<Icon as={ChevronUp} boxSize={4} />}
                            h="40px"
                            w="40px"
                            minW="40px"
                            borderRadius="10px"
                            variant="ghost"
                            color="var(--pb-ink-soft)"
                            isDisabled={index === 0}
                            onClick={() => moveParticipant(index, -1)}
                          />
                          <IconButton
                            type="button"
                            aria-label={t('household.cleaning.modal.moveLater', {
                              name: member.name,
                            })}
                            icon={<Icon as={ChevronDown} boxSize={4} />}
                            h="40px"
                            w="40px"
                            minW="40px"
                            borderRadius="10px"
                            variant="ghost"
                            color="var(--pb-ink-soft)"
                            isDisabled={index === participants.length - 1}
                            onClick={() => moveParticipant(index, 1)}
                          />
                          <IconButton
                            type="button"
                            aria-label={t('household.cleaning.modal.removeMember', {
                              name: member.name,
                            })}
                            icon={<Icon as={X} boxSize={4} />}
                            h="40px"
                            w="40px"
                            minW="40px"
                            borderRadius="10px"
                            variant="ghost"
                            color="var(--pb-coral)"
                            onClick={() => setParticipantIds((current) =>
                              current.filter((memberId) => memberId !== member.id))}
                          />
                        </HStack>
                      </Flex>
                    )
                  })}
                </VStack>
                )}

                {availableMembers.length > 0 && (
                  <Box mt={4}>
                    <Text
                      mb={2}
                      fontFamily="var(--pb-mono)"
                      fontSize="9px"
                      letterSpacing="0.08em"
                      textTransform="uppercase"
                      color="var(--pb-ink-faint)"
                    >
                      {t('household.cleaning.modal.addMember')}
                    </Text>
                    <Flex flexWrap="wrap" gap={2}>
                      {availableMembers.map((member) => (
                        <Button
                          key={member.id}
                          type="button"
                          h="40px"
                          px={3}
                          borderRadius="10px"
                          bg="var(--pb-surface-2)"
                          color="var(--pb-ink-soft)"
                          border="1px solid var(--pb-hair)"
                          leftIcon={<Icon as={Plus} boxSize={3.5} />}
                          onClick={() => setParticipantIds((current) => [...current, member.id])}
                          _hover={{ color: 'var(--pb-ink)', borderColor: 'var(--pb-hair-2)' }}
                        >
                          {member.name}
                        </Button>
                      ))}
                    </Flex>
                  </Box>
                )}
              </Box>
            </VStack>

            <Box
              position={{ base: 'static', md: 'sticky' }}
              top={{ md: 0 }}
              p={{ base: 3.5, md: 4 }}
              borderRadius="15px"
              bg="var(--pb-summary-petrol)"
              border="1px solid var(--pb-summary-line)"
              minW={0}
            >
              <HStack justify="space-between" spacing={3} mb={4}>
                <Box>
                  <Text
                    fontFamily="var(--pb-mono)"
                    fontSize="9px"
                    fontWeight={600}
                    letterSpacing="0.14em"
                    textTransform="uppercase"
                    color="var(--pb-summary-ink-faint)"
                  >
                    {t('household.cleaning.modal.preview')}
                  </Text>
                  <Text mt={0.5} fontSize="xs" color="var(--pb-summary-ink-soft)">
                    {t('household.cleaning.modal.firstThree')}
                  </Text>
                </Box>
                <Icon as={Repeat} boxSize={5} color="var(--pb-summary-income)" weight="duotone" />
              </HStack>

              {previewWeeks.length === 0 ? (
                <Box
                  py={6}
                  px={3}
                  textAlign="center"
                  borderRadius="12px"
                  bg="var(--pb-summary-panel)"
                  border="1px dashed var(--pb-summary-line)"
                >
                  <Icon as={Calendar} boxSize={6} color="var(--pb-summary-ink-faint)" />
                  <Text mt={2} fontSize="sm" color="var(--pb-summary-ink-soft)">
                    {t('household.cleaning.modal.previewEmpty')}
                  </Text>
                </Box>
              ) : (
                <VStack align="stretch" spacing={2}>
                  {previewWeeks.map((week, index) => {
                    const memberIndex = household.members.findIndex(
                      (m) => m.id === week.member.id,
                    )
                    const gradient = householdAvatarGradient(memberIndex, week.member.id)

                    return (
                      <Flex
                        key={`${week.member.id}-${index}`}
                        align="center"
                        gap={2.5}
                        p={2.5}
                        borderRadius="11px"
                        bg="var(--pb-summary-panel)"
                        border="1px solid var(--pb-summary-line)"
                      >
                        <Flex
                          w={7}
                          h={7}
                          flexShrink={0}
                          align="center"
                          justify="center"
                          borderRadius="full"
                          bgGradient={gradient}
                          color="white"
                          border="1px solid rgba(255, 255, 255, 0.24)"
                          boxShadow="0 1px 4px rgba(0, 0, 0, 0.14)"
                          fontFamily="var(--pb-mono)"
                          fontSize="9px"
                          fontWeight={800}
                        >
                          {formatNumber(index + 1)}
                        </Flex>
                        <Box minW={0} flex={1}>
                          <Text fontSize="sm" fontWeight={600} color="var(--pb-summary-ink)" noOfLines={1}>
                            {week.member.name}
                          </Text>
                          <Text fontSize="2xs" color="var(--pb-summary-ink-faint)">
                            {week.range}
                          </Text>
                        </Box>
                      </Flex>
                    )
                  })}
                </VStack>
              )}

              <Text
                mt={4}
                pt={3}
                borderTop="1px solid var(--pb-summary-line)"
                fontSize="xs"
                color="var(--pb-summary-ink-soft)"
                lineHeight={1.45}
              >
                {participants.length > 0
                  ? t('household.cleaning.modal.cycleDetail', {
                    count: formatNumber(participants.length),
                  })
                  : t('household.cleaning.modal.cycleEmpty')}
              </Text>
            </Box>
          </Grid>
        </VStack>
      </Box>
    </PremiumModal>
  )
}
