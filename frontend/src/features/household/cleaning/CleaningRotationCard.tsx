import { Box, Button, Flex, HStack, Icon, IconButton, Text, VStack, useDisclosure } from '@chakra-ui/react'
import { Gear, Repeat } from '../../../components/ui/icons'
import { useI18n } from '../../../i18n'
import type { HouseholdCleaningRotation, HouseholdMember } from '../../../types'
import { today } from '../householdDates'
import { CleaningDutiesModal } from './CleaningDutiesModal'
import { CLEANING_DUTIES, type DisplayedCleaningDuty } from './cleaningConfig'

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
  const progress = displayedDuties.length ? (completedDutyCount / displayedDuties.length) * 100 : 0
  const displayDate = (value: string) => formatDate(value, { day: 'numeric', month: 'short' })
  const initials = current?.assignedMemberName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()

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
            <Text
              fontFamily="var(--pb-mono)" fontSize="9px" fontWeight={800} letterSpacing="0.12em"
              textTransform="uppercase" color="var(--pb-income)"
            >
              {t('household.cleaning.eyebrow')}
            </Text>
            <Text mt={1} fontFamily="var(--pb-serif)" fontSize={{ base: 'xl', md: '2xl' }} fontWeight={600} lineHeight={1.1} color="var(--pb-ink)">
              {t('household.cleaning.title')}
            </Text>
          </Box>
          <HStack spacing={2} flexShrink={0}>
            {rotation.canManage && (
              <IconButton
                aria-label={rotation.configured ? t('household.common.manage') : t('household.common.setUp')}
                icon={<Icon as={Gear} boxSize={4.5} />}
                onClick={onManage}
                minW="44px" h="44px" borderRadius="13px"
                bg="var(--pb-surface-2)" color="var(--pb-ink-soft)" border="1px solid var(--pb-hair)"
                _hover={{ bg: 'var(--pb-surface-3)', color: 'var(--pb-ink)' }}
              />
            )}
            <Button
              minH="44px" px={{ base: 3, md: 4 }} borderRadius="13px"
              bg="var(--pb-tint-green)" color="var(--pb-forest-2)"
              aria-label={t('household.cleaning.openDutiesAria')} onClick={dutiesModal.onOpen}
              _hover={{ bg: 'var(--pb-surface-3)', transform: 'translateY(-1px)' }}
              _active={{ transform: 'translateY(0)' }}
            >
              {t('household.cleaning.openDuties')}
            </Button>
          </HStack>
        </Flex>

        <Box p={{ base: 4, md: 5 }} border="1px solid var(--pb-hair)" borderRadius="16px" bg="var(--pb-surface)" boxShadow="var(--pb-shadow)">
          {rotation.configured && rotation.active && current ? (
            <VStack align="stretch" spacing={3.5}>
              <Text fontSize="xs" color="var(--pb-ink-soft)">
                {displayDate(current.weekStart)} – {displayDate(current.weekEnd)}
              </Text>

              <HStack spacing={3} minW={0}>
                <Flex
                  w="42px" h="42px" flexShrink={0} align="center" justify="center" borderRadius="15px"
                  bg="#D8E5CC" color="var(--pb-income)" fontSize="sm" fontWeight={800}
                >
                  {initials}
                </Flex>
                <Box minW={0}>
                  <Text fontFamily="var(--pb-mono)" fontSize="8px" fontWeight={800} letterSpacing="0.08em" textTransform="uppercase" color="var(--pb-income)">
                    {currentIsUser ? t('household.cleaning.yourWeek') : t('household.cleaning.onDuty')}
                  </Text>
                  <Text mt={1} fontFamily="var(--pb-serif)" fontSize="lg" fontWeight={700} lineHeight={1} color="var(--pb-ink)" noOfLines={1}>
                    {current.assignedMemberName}
                  </Text>
                </Box>
              </HStack>

              <Box>
                <Text fontSize="xs" fontWeight={600} color="var(--pb-income)" aria-live="polite">
                  {t('household.cleaning.progress', {
                    completed: formatNumber(completedDutyCount),
                    total: formatNumber(displayedDuties.length),
                  })}
                </Text>
                <Box
                  mt={2} h="6px" overflow="hidden" borderRadius="full" bg="#DCE5D5"
                  role="progressbar" aria-label={t('household.cleaning.progress', {
                    completed: formatNumber(completedDutyCount),
                    total: formatNumber(displayedDuties.length),
                  })}
                  aria-valuemin={0} aria-valuemax={displayedDuties.length} aria-valuenow={completedDutyCount}
                >
                  <Box h="full" w={`${progress}%`} borderRadius="full" bg="#618258" transition="width 300ms ease" />
                </Box>
              </Box>

              {currentIsComplete && (
                <Text fontSize="xs" fontWeight={600} color="var(--pb-income)">{t('household.cleaning.allDone')}</Text>
              )}
            </VStack>
          ) : (
            <Box>
              <Text fontFamily="var(--pb-serif)" fontSize="md" fontWeight={700} color="var(--pb-ink)">{emptyTitle}</Text>
              <Text mt={1.5} fontSize="sm" lineHeight={1.55} color="var(--pb-ink-soft)">{emptyDescription}</Text>
            </Box>
          )}

          {rotation.configured && rotation.active && next && (
            <HStack mt={4} pt={3} spacing={2} borderTop="1px solid var(--pb-hair)" color="var(--pb-ink-soft)">
              <Icon as={Repeat} boxSize={4} flexShrink={0} />
              <Text fontSize="xs" noOfLines={1}>
                {t('household.cleaning.comingNext')}: <Text as="span" fontWeight={700} color="var(--pb-ink)">
                  {next.assignedMemberId === currentMemberId ? t('household.common.you') : next.assignedMemberName}
                </Text> · {displayDate(next.weekStart)}
              </Text>
            </HStack>
          )}
        </Box>
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
