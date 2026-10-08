import { Box, Button, Flex, HStack, Icon, IconButton, Text, useDisclosure, VStack } from '@chakra-ui/react'
import { Broom, Check, Gear } from '../../../components/ui/icons'
import { useI18n } from '../../../i18n'
import type { HouseholdCleaningRotation, HouseholdMember } from '../../../types'
import { today } from '../householdDates'
import { CleaningDutiesModal } from './CleaningDutiesModal'
import { CLEANING_DUTIES, type DisplayedCleaningDuty } from './cleaningConfig'

/** Light turquoise for the cleaning icons on the "next" rows. */
const TURQUOISE = '#14b8a6'
const TURQUOISE_TINT = '#d5f5f1'

export function CleaningRotationCard({
  rotation,
  members: _members,
  currentMemberId,
  busyDutyKey,
  onManage,
  onToggleDuty,
}: {
  rotation: HouseholdCleaningRotation
  members?: HouseholdMember[]
  currentMemberId: number
  busyDutyKey: string | null
  onManage: () => void
  onToggleDuty: (assignmentId: number, dutyKey: string, completed: boolean) => void
}) {
  const { formatDate, formatNumber, t } = useI18n()
  const dutiesModal = useDisclosure()
  const current = rotation.currentWeek
  const next = rotation.upcomingWeeks[0]
  const upcoming = rotation.upcomingWeeks.slice(0, 4).map((week) => ({
    weekStart: week.weekStart,
    name: week.assignedMemberId === currentMemberId ? t('household.common.you') : week.assignedMemberName,
  }))
  const currentIsUser = current?.assignedMemberId === currentMemberId
  const currentIsComplete = current?.status === 'COMPLETED'
  const displayedDuties: DisplayedCleaningDuty[] = current?.duties?.length
    ? current.duties.map((duty) => ({ ...duty, timed: duty.key === 'rubbish_out' }))
    : CLEANING_DUTIES.map((duty) => ({
      ...duty,
      schedule: duty.schedule ?? null,
      completed: false,
      canToggle: false,
      completedAt: null,
    }))
  const completedDutyCount = displayedDuties.filter((duty) => duty.completed).length
  const displayDate = (value: string) => formatDate(value, { day: 'numeric', month: 'short' })

  const emptyTitle = !rotation.configured
    ? t('household.cleaning.createRhythm')
    : !rotation.active
      ? t('household.cleaning.paused')
      : t('household.cleaning.scheduled')
  const emptyDescription = !rotation.configured
    ? rotation.canManage
      ? t('household.cleaning.setupOwner')
      : t('household.cleaning.setupMember')
    : !rotation.active
      ? t(
        rotation.participantMemberIds.length === 1
          ? 'household.cleaning.pausedDetail.one'
          : 'household.cleaning.pausedDetail.other',
        { count: formatNumber(rotation.participantMemberIds.length) },
      )
      : t('household.cleaning.starts', {
        date: displayDate(next?.weekStart ?? rotation.startDate ?? today()),
      })

  return (
    <>
      <Box>
        <Flex align="center" justify="space-between" gap={3} mb={3.5}>
          <Box minW={0}>
            <Text fontSize="xs" color="var(--pb-ink-soft)">
              {t('household.cleaning.eyebrow')}
            </Text>
            <Text mt={0.5} fontSize={{ base: 'xl', md: '2xl' }} fontWeight={700} letterSpacing="-0.01em" lineHeight={1.1} color="var(--pb-ink)">
              {t('household.cleaning.title')}
            </Text>
          </Box>
          <HStack spacing={2} flexShrink={0}>
            {rotation.canManage && (
              <IconButton
                aria-label={rotation.configured ? t('household.common.manage') : t('household.common.setUp')}
                icon={<Icon as={Gear} boxSize={5} />}
                onClick={onManage}
                w="40px" minW="40px" h="40px" borderRadius="full"
                bg="var(--pb-surface)" color="var(--pb-ink)"
                _hover={{ bg: 'var(--pb-surface-2)' }}
              />
            )}
            <Button
              h="40px" px={4} borderRadius="full"
              bg="var(--nu-brand-tint)" color="var(--nu-brand)" fontSize="sm" fontWeight={600}
              aria-label={t('household.cleaning.openDutiesAria')} onClick={dutiesModal.onOpen}
              _hover={{ bg: '#ead6fa' }}
            >
              {t('household.cleaning.openDuties')}
            </Button>
          </HStack>
        </Flex>

        {rotation.configured && rotation.active && current ? (
          <VStack
            align="stretch" spacing={0} borderRadius="18px" bg="var(--pb-surface)" overflow="hidden"
            divider={<Box h="1px" bg="var(--pb-hair)" />}
          >
            {/* This week: name, "This week", dates. */}
            <Box px={4} py={3}>
              <HStack spacing={2} minW={0}>
                <Text fontSize="lg" fontWeight={700} lineHeight={1.15} color="var(--pb-ink)" noOfLines={1} minW={0}>
                  {currentIsUser ? t('household.common.you') : current.assignedMemberName}
                </Text>
                <HStack
                  flexShrink={0} spacing={1} px={2} py={0.5} borderRadius="full" aria-live="polite"
                  bg={currentIsComplete ? 'var(--pb-tint-income)' : 'var(--nu-brand-tint)'}
                  color={currentIsComplete ? 'var(--pb-income)' : 'var(--nu-brand)'}
                >
                  {currentIsComplete && <Icon as={Check} boxSize={3} weight="bold" />}
                  <Text fontSize="xs" fontWeight={700}>
                    {t('household.cleaning.progress', {
                      completed: formatNumber(completedDutyCount),
                      total: formatNumber(displayedDuties.length),
                    })}
                  </Text>
                </HStack>
              </HStack>
              <Text mt={0.5} fontSize="xs" color="var(--pb-ink-soft)">
                {t('household.cleaning.thisWeek')}
                {' · '}
                {displayDate(current.weekStart)} – {displayDate(current.weekEnd)}
              </Text>
            </Box>
            {/* Next people, one line each, like the recent activity. */}
            {upcoming.map((week) => (
              <Flex key={week.weekStart} align="center" gap={2.5} px={3} py={2}>
                <Flex w="28px" h="28px" flexShrink={0} align="center" justify="center" borderRadius="full" bg={TURQUOISE_TINT} color={TURQUOISE}>
                  <Broom size={15} weight="duotone" aria-hidden="true" />
                </Flex>
                <Text flex={1} minW={0} fontSize="sm" fontWeight={600} color="var(--pb-ink)" noOfLines={1}>{week.name}</Text>
                <Text flexShrink={0} fontSize="xs" color="var(--pb-ink-faint)">{displayDate(week.weekStart)}</Text>
              </Flex>
            ))}
          </VStack>
        ) : (
          <Box p={4} borderRadius="18px" bg="var(--pb-surface)">
            <Text fontSize="md" fontWeight={700} color="var(--pb-ink)">{emptyTitle}</Text>
            <Text mt={1.5} fontSize="sm" lineHeight={1.55} color="var(--pb-ink-soft)">{emptyDescription}</Text>
          </Box>
        )}
      </Box>

      <CleaningDutiesModal
        isOpen={dutiesModal.isOpen}
        onClose={dutiesModal.onClose}
        current={current}
        currentIsUser={currentIsUser}
        duties={displayedDuties}
        busyDutyKey={busyDutyKey}
        onToggleDuty={onToggleDuty}
      />
    </>
  )
}
