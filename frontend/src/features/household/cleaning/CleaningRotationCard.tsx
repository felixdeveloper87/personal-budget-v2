import { Badge, Box, Button, Flex, Grid, HStack, Icon, Text, VStack, useDisclosure } from '@chakra-ui/react'
import { useI18n } from '../../../i18n'
import type { HouseholdCleaningRotation, HouseholdMember } from '../../../types'
import { CheckCircle2, Clock, Gear, List, Repeat, Sparkles } from '../../../components/ui/icons'
import { CLEANING_DUTIES, type DisplayedCleaningDuty } from './cleaningConfig'
import { CleaningDutiesModal } from './CleaningDutiesModal'
import { today } from '../householdDates'
import { householdAvatarGradient } from '../householdAvatar'

export function CleaningRotationCard({
  rotation,
  members,
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
  onToggleDuty: (
    assignmentId: number,
    dutyKey: string,
    completed: boolean,
  ) => void
}) {
  const { formatDate, formatNumber, t } = useI18n()
  const dutiesModal = useDisclosure()
  const current = rotation.currentWeek
  const firstUpcoming = rotation.upcomingWeeks[0]
  const currentIsUser = current?.assignedMemberId === currentMemberId
  const currentIsComplete = current?.status === 'COMPLETED'
  const displayedDuties: DisplayedCleaningDuty[] = current?.duties?.length
    ? current.duties.map((duty) => ({
      ...duty,
      timed: duty.key === 'rubbish_out',
    }))
    : CLEANING_DUTIES.map((duty) => ({
      ...duty,
      schedule: duty.schedule ?? null,
      completed: false,
      canToggle: false,
      completedAt: null,
    }))
  const completedDutyCount = displayedDuties.filter((duty) => duty.completed).length
  const displayDate = (value: string) => formatDate(value, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <>
      <Box
        overflow="hidden"
        bg="var(--pb-surface)"
        border="1px solid var(--pb-hair)"
        borderRadius={{ base: '20px', md: '24px' }}
        boxShadow="0 10px 40px -10px rgba(0,0,0,0.08)"
        transition="transform 0.2s, box-shadow 0.2s"
        _hover={{ transform: 'translateY(-2px)', boxShadow: '0 12px 48px -12px rgba(0,0,0,0.12)' }}
      >
        <Flex
          direction={{ base: 'column', sm: 'row' }}
          align={{ base: 'stretch', sm: 'center' }}
          justify="space-between"
          gap={2}
          px={{ base: 3.5, sm: 4, md: 5 }}
          py={{ base: 2.5, md: 3 }}
          borderBottom="1px solid var(--pb-hair)"
          bg="var(--pb-surface)"
        >
          <Box minW={0}>
            <Text
              fontFamily="var(--pb-mono)"
              fontSize="9px"
              fontWeight={600}
              letterSpacing="0.15em"
              textTransform="uppercase"
              color="var(--pb-ink-faint)"
            >
              {t('household.cleaning.eyebrow')}
            </Text>
            <Text
              mt={0.5}
              fontFamily="var(--pb-serif)"
              fontSize={{ base: 'lg', md: 'xl' }}
              fontWeight={500}
              lineHeight={1.1}
              color="var(--pb-ink)"
            >
              {t('household.cleaning.title')}
            </Text>
            <Text mt={0.5} color="var(--pb-ink-soft)" fontSize="xs" noOfLines={1}>
              {t('household.cleaning.description')}
            </Text>
          </Box>
          {rotation.canManage && (
            <Button
              alignSelf={{ base: 'flex-start', sm: 'center' }}
              leftIcon={<Icon as={Gear} boxSize={3.5} />}
              h="30px"
              px={3}
              borderRadius="full"
              bg="var(--pb-surface)"
              color="var(--pb-ink-soft)"
              border="1px solid var(--pb-hair)"
              fontFamily="var(--pb-mono)"
              fontSize="9px"
              fontWeight={700}
              letterSpacing="0.05em"
              textTransform="uppercase"
              onClick={onManage}
              _hover={{ bg: 'var(--pb-surface-2)', color: 'var(--pb-ink)' }}
              _active={{ bg: 'var(--pb-surface-3)' }}
            >
              {rotation.configured
                ? t('household.common.manage')
                : t('household.common.setUp')}
            </Button>
          )}
        </Flex>

        {!rotation.configured ? (
          <Flex
            direction={{ base: 'column', md: 'row' }}
            align={{ base: 'stretch', md: 'center' }}
            justify="space-between"
            gap={4}
            p={{ base: 4, md: 5 }}
            bg="var(--pb-surface-2)"
          >
            <Box maxW="620px">
              <Text
                fontFamily="var(--pb-serif)"
                fontSize={{ base: 'lg', md: 'xl' }}
                fontWeight={500}
                color="var(--pb-ink)"
              >
                {t('household.cleaning.createRhythm')}
              </Text>
              <Text mt={1} color="var(--pb-ink-soft)" fontSize="sm" lineHeight={1.5}>
                {rotation.canManage
                  ? t('household.cleaning.setupOwner')
                  : t('household.cleaning.setupMember')}
              </Text>
            </Box>
            <HStack spacing={2} flexWrap="wrap">
              {[
                'household.cleaning.step.members',
                'household.cleaning.step.monday',
                'household.cleaning.step.order',
              ].map((stepKey, index) => (
                <HStack
                  key={stepKey}
                  px={3}
                  py={2}
                  borderRadius="10px"
                  bg="var(--pb-surface)"
                  border="1px solid var(--pb-hair)"
                  spacing={2}
                >
                  <Text fontFamily="var(--pb-mono)" fontSize="8px" color="var(--pb-gold)">
                    {formatNumber(index + 1, { minimumIntegerDigits: 2, useGrouping: false })}
                  </Text>
                  <Text fontSize="xs" color="var(--pb-ink-soft)">{t(stepKey)}</Text>
                </HStack>
              ))}
            </HStack>
          </Flex>
        ) : !rotation.active ? (
          <Flex
            direction={{ base: 'column', sm: 'row' }}
            align={{ base: 'stretch', sm: 'center' }}
            gap={3}
            p={{ base: 4, md: 5 }}
            bg="var(--pb-surface-2)"
          >
            <Flex
              w={11}
              h={11}
              flexShrink={0}
              align="center"
              justify="center"
              borderRadius="full"
              bg="var(--pb-tint-gold)"
              color="var(--pb-gold)"
            >
              <Icon as={Clock} boxSize={5} weight="duotone" />
            </Flex>
            <Box minW={0}>
              <Text fontFamily="var(--pb-serif)" fontSize="lg" fontWeight={500} color="var(--pb-ink)">
                {t('household.cleaning.paused')}
              </Text>
              <Text mt={0.5} color="var(--pb-ink-soft)" fontSize="sm">
                {t(
                  rotation.participantMemberIds.length === 1
                    ? 'household.cleaning.pausedDetail.one'
                    : 'household.cleaning.pausedDetail.other',
                  { count: formatNumber(rotation.participantMemberIds.length) },
                )}
              </Text>
            </Box>
          </Flex>
        ) : (
          <Grid templateColumns={{ base: '1fr', lg: 'minmax(0, 1.15fr) minmax(320px, 0.85fr)' }}>
            <Box
              p={{ base: 3.5, md: 4.5 }}
              borderBottom={{ base: '1px solid', lg: 'none' }}
              borderRight={{ base: 'none', lg: '1px solid' }}
              borderColor="var(--pb-hair)"
              bg={currentIsUser ? 'var(--pb-tint-income)' : 'var(--pb-surface)'}
              boxShadow={currentIsUser
                ? 'inset 4px 0 0 var(--pb-forest-2)'
                : 'none'}
              aria-label={currentIsUser ? t('household.cleaning.yourWeekAria') : undefined}
            >
              {current ? (
                <VStack align="stretch" spacing={3}>
                  <Flex
                    direction={{ base: 'column', sm: 'row' }}
                    align={{ base: 'flex-start', sm: 'flex-start' }}
                    justify="space-between"
                    gap={{ base: 1.5, sm: 3 }}
                  >
                    <Box>
                      <HStack spacing={2} flexWrap="wrap">
                        <Text
                          fontFamily="var(--pb-mono)"
                          fontSize="9px"
                          fontWeight={600}
                          letterSpacing="0.15em"
                          textTransform="uppercase"
                          color="var(--pb-summary-ink-faint)"
                        >
                          {t('household.cleaning.onDuty')}
                        </Text>
                        {currentIsUser && (
                          <HStack
                            px={2}
                            py={1}
                            borderRadius="full"
                            bg="var(--pb-forest-2)"
                            color="var(--pb-on-accent)"
                            spacing={1}
                          >
                            <Icon as={Sparkles} boxSize={3} weight="fill" />
                            <Text
                              fontFamily="var(--pb-mono)"
                              fontSize="8px"
                              fontWeight={700}
                              letterSpacing="0.06em"
                              textTransform="uppercase"
                            >
                              {t('household.cleaning.yourWeek')}
                            </Text>
                          </HStack>
                        )}
                      </HStack>
                      <Text mt={0.5} fontSize="xs" color="var(--pb-summary-ink-soft)">
                        {displayDate(current.weekStart)} – {displayDate(current.weekEnd)}
                      </Text>
                    </Box>
                    <HStack
                      px={2.5}
                      py={1.5}
                      alignSelf={{ base: 'flex-start', sm: 'auto' }}
                      borderRadius="full"
                      bg={currentIsComplete ? 'var(--pb-tint-income)' : 'var(--pb-tint-gold)'}
                      color={currentIsComplete ? 'var(--pb-summary-income)' : 'var(--pb-summary-gold)'}
                      border="1px solid var(--pb-summary-line)"
                      spacing={1.5}
                    >
                      <Icon
                        as={currentIsComplete ? CheckCircle2 : Clock}
                        boxSize={3.5}
                        weight="duotone"
                      />
                      <Text fontFamily="var(--pb-mono)" fontSize="8px" fontWeight={700} textTransform="uppercase">
                        {currentIsComplete
                          ? t('household.cleaning.completed')
                          : t('household.cleaning.inProgress')}
                      </Text>
                    </HStack>
                  </Flex>

                  {(() => {
                    const currentMemberIndex = members?.findIndex(
                      (member) => member.id === current.assignedMemberId,
                    ) ?? -1
                    const currentMemberGradient = householdAvatarGradient(
                      currentMemberIndex,
                      current.assignedMemberId,
                    )
                    const currentInitial = (current.assignedMemberName || '?').charAt(0).toUpperCase()

                    return (
                      <HStack spacing={3} minW={0} align="center">
                        <Flex
                          aria-hidden="true"
                          w={{ base: '36px', md: '40px' }}
                          h={{ base: '36px', md: '40px' }}
                          flexShrink={0}
                          align="center"
                          justify="center"
                          borderRadius="12px"
                          bgGradient={currentMemberGradient}
                          color="white"
                          fontFamily="var(--pb-serif)"
                          fontWeight={700}
                          fontSize={{ base: 'md', md: 'lg' }}
                          border="1px solid rgba(255, 255, 255, 0.24)"
                          boxShadow="0 2px 8px rgba(0, 0, 0, 0.14)"
                        >
                          {currentInitial}
                        </Flex>
                        <Box minW={0} flex={1}>
                          <HStack spacing={2} flexWrap="wrap">
                            <Text
                              fontFamily="var(--pb-serif)"
                              fontSize={{ base: 'xl', md: '2xl' }}
                              fontWeight={500}
                              lineHeight={1}
                              letterSpacing="-0.03em"
                              color="var(--pb-summary-ink)"
                              noOfLines={1}
                            >
                              {currentIsUser ? t('household.cleaning.yourTurn') : current.assignedMemberName}
                            </Text>
                          </HStack>
                          <Text mt={0.5} color="var(--pb-summary-ink-soft)" fontSize="sm">
                            {currentIsUser
                              ? t('household.cleaning.yourTurnDetail')
                              : t('household.cleaning.memberTurnDetail', {
                                name: current.assignedMemberName,
                              })}
                          </Text>
                        </Box>
                      </HStack>
                    )
                  })()}

                  {currentIsComplete && (
                    <HStack
                      px={3.5}
                      py={3}
                      borderRadius="12px"
                      bg="var(--pb-tint-income)"
                      color="var(--pb-summary-income)"
                      border="1px solid var(--pb-summary-line)"
                      spacing={2.5}
                    >
                      <Icon as={CheckCircle2} boxSize={5} weight="fill" />
                      <Box>
                        <Text fontSize="sm" fontWeight={600}>{t('household.cleaning.allDone')}</Text>
                        <Text mt={0.5} fontSize="xs" color="var(--pb-summary-ink-soft)">
                          {t('household.cleaning.nextMonday')}
                        </Text>
                      </Box>
                    </HStack>
                  )}
                </VStack>
              ) : (
                <VStack align="stretch" spacing={3}>
                  <Text
                    color="var(--pb-summary-ink-faint)"
                    fontFamily="var(--pb-mono)"
                    fontSize="9px"
                    fontWeight={600}
                    letterSpacing="0.15em"
                    textTransform="uppercase"
                  >
                    {t('household.cleaning.scheduled')}
                  </Text>
                  <Text
                    fontFamily="var(--pb-serif)"
                    fontSize={{ base: 'xl', md: '2xl' }}
                    fontWeight={500}
                    color="var(--pb-summary-ink)"
                  >
                    {t('household.cleaning.starts', {
                      date: displayDate(firstUpcoming?.weekStart ?? rotation.startDate ?? today()),
                    })}
                  </Text>
                  <Text color="var(--pb-summary-ink-soft)" fontSize="sm">
                    {t('household.cleaning.startsDetail')}
                  </Text>
                </VStack>
              )}
            </Box>

            <Box p={{ base: 3, md: 4 }} bg="var(--pb-surface-2)">
              <HStack justify="space-between" mb={2.5} spacing={3}>
                <Box>
                  <Text
                    fontFamily="var(--pb-mono)"
                    color="var(--pb-ink-faint)"
                    fontSize="9px"
                    fontWeight={600}
                    letterSpacing="0.15em"
                    textTransform="uppercase"
                  >
                    {t('household.cleaning.comingNext')}
                  </Text>
                  <Text mt={0.5} color="var(--pb-ink-soft)" fontSize="xs" display={{ base: 'none', sm: 'block' }}>
                    {t('household.cleaning.nextThree')}
                  </Text>
                </Box>
                <Flex
                  w={8}
                  h={8}
                  flexShrink={0}
                  align="center"
                  justify="center"
                  borderRadius="full"
                  bg="var(--pb-surface)"
                  color="var(--pb-forest-2)"
                  border="1px solid var(--pb-hair)"
                >
                  <Icon as={Repeat} boxSize={4} weight="duotone" />
                </Flex>
              </HStack>
              {rotation.upcomingWeeks.length === 0 ? (
                <Box
                  px={3.5}
                  py={4}
                  borderRadius="12px"
                  border="1px dashed var(--pb-hair-2)"
                  bg="var(--pb-surface)"
                >
                  <Text color="var(--pb-ink-soft)" fontSize="sm">
                    {t('household.cleaning.noUpcoming')}
                  </Text>
                </Box>
              ) : (
                <Grid
                  templateColumns={{ base: 'repeat(3, minmax(0, 1fr))', lg: '1fr' }}
                  gap={2}
                >
                  {rotation.upcomingWeeks.map((assignment, index) => {
                    const memberIndex = members?.findIndex(
                      (member) => member.id === assignment.assignedMemberId,
                    ) ?? -1
                    const gradient = householdAvatarGradient(
                      memberIndex,
                      assignment.assignedMemberId,
                    )

                    return (
                      <Flex
                        key={assignment.id}
                        align="center"
                        justify="space-between"
                        gap={{ base: 1, lg: 3 }}
                        minW={0}
                        px={2.5}
                        py={{ base: 1.5, lg: 2.5 }}
                        borderRadius="12px"
                        bg="var(--pb-surface)"
                        border="1px solid var(--pb-hair)"
                      >
                        <HStack minW={0} spacing={2}>
                          <Flex
                            w={6}
                            h={6}
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
                            <Text fontSize="xs" fontWeight={600} color="var(--pb-ink)" noOfLines={1}>
                              {assignment.assignedMemberId === currentMemberId
                                ? t('household.common.you')
                                : assignment.assignedMemberName}
                            </Text>
                            <Text color="var(--pb-ink-faint)" fontSize="2xs">
                              {displayDate(assignment.weekStart)}
                            </Text>
                          </Box>
                        </HStack>
                        {assignment.assignedMemberId === currentMemberId && (
                          <Badge
                            flexShrink={0}
                            display={{ base: 'none', lg: 'inline-flex' }}
                            bg="var(--pb-tint-income)"
                            color="var(--pb-income)"
                            borderRadius="full"
                            px={2}
                            textTransform="none"
                          >
                            {t('household.cleaning.yourTurn')}
                          </Badge>
                        )}
                      </Flex>
                    )
                  })}
                </Grid>
              )}
            </Box>
          </Grid>
        )}

        <Box
          px={{ base: 3.5, md: 4.5 }}
          py={{ base: 3.5, md: 4.5 }}
          bg="var(--pb-surface-2)"
        >
          <Flex
            direction={{ base: 'column', sm: 'row' }}
            align={{ base: 'stretch', sm: 'center' }}
            justify="space-between"
            gap={{ base: 3, sm: 5 }}
          >
            <Box minW={0} flex={1}>
              <Text
                fontFamily="var(--pb-mono)"
                color="var(--pb-ink-soft)"
                fontSize="10px"
                fontWeight={700}
                letterSpacing="0.15em"
                textTransform="uppercase"
              >
                {t('household.cleaning.dutiesTitle')}
              </Text>
              <Text mt={0.5} color="var(--pb-ink-soft)" fontSize="sm" noOfLines={1}>
                {current
                  ? currentIsUser
                    ? t('household.cleaning.dutiesCurrentUser')
                    : t('household.cleaning.dutiesOther', { name: current.assignedMemberName })
                  : t('household.cleaning.dutiesGeneric')}
              </Text>
              <HStack mt={2} spacing={2} color="var(--pb-ink-soft)">
                <Icon as={CheckCircle2} boxSize={4} weight="duotone" />
                <Text fontFamily="var(--pb-mono)" fontSize="9px" fontWeight={700} textTransform="uppercase">
                  {current
                    ? t('household.cleaning.progress', {
                      completed: formatNumber(completedDutyCount),
                      total: formatNumber(displayedDuties.length),
                    })
                    : t(
                      displayedDuties.length === 1
                        ? 'household.cleaning.tasks.one'
                        : 'household.cleaning.tasks.other',
                      { count: formatNumber(displayedDuties.length) },
                    )}
                </Text>
              </HStack>
              <Box
                mt={1.5}
                h="6px"
                maxW={{ base: 'full', sm: '280px' }}
                overflow="hidden"
                borderRadius="full"
                bg="var(--pb-surface)"
                border="1px solid var(--pb-hair)"
                aria-hidden="true"
              >
                <Box
                  h="full"
                  w={`${displayedDuties.length
                    ? (completedDutyCount / displayedDuties.length) * 100
                    : 0}%`}
                  borderRadius="full"
                  bgGradient="linear(to-r, var(--pb-forest-2), var(--pb-forest))"
                  transition="width 400ms cubic-bezier(0.4, 0, 0.2, 1)"
                />
              </Box>
            </Box>
            <Button
              h="46px"
              w={{ base: 'full', sm: 'auto' }}
              flexShrink={0}
              px={5}
              borderRadius="13px"
              bg="var(--pb-forest-2)"
              color="var(--pb-on-accent)"
              fontSize="md"
              fontWeight={600}
              leftIcon={<Icon as={List} boxSize={5} weight="bold" />}
              aria-label={t('household.cleaning.openDutiesAria')}
              onClick={dutiesModal.onOpen}
              _hover={{ bg: 'var(--pb-forest)', transform: 'translateY(-1px)' }}
              _active={{ transform: 'translateY(0)' }}
              _focusVisible={{ boxShadow: '0 0 0 2px var(--pb-forest)' }}
              boxShadow="0 4px 12px rgba(0,0,0,0.15)"
            >
              {t('household.cleaning.openDuties')}
            </Button>
          </Flex>
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
