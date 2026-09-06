import { Badge, Box, Button, Flex, HStack, Icon, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import { useState } from 'react'
import { useI18n } from '../../../i18n'
import type { HouseholdCleaningAssignment } from '../../../types'
import { Check, CheckCircle2, Clock, List } from '../../../components/ui/icons'
import { ModalHeader as AppModalHeader, PremiumModal } from '../../../components/ui'
import type { DisplayedCleaningDuty } from './cleaningConfig'

export function CleaningDutiesModal({
  isOpen,
  onClose,
  current,
  currentIsUser,
  duties,
  busyDutyKey,
  onToggleDuty,
}: {
  isOpen: boolean
  onClose: () => void
  current: HouseholdCleaningAssignment | null
  currentIsUser: boolean
  duties: DisplayedCleaningDuty[]
  busyDutyKey: string | null
  onToggleDuty: (
    assignmentId: number,
    dutyKey: string,
    completed: boolean,
  ) => void
}) {
  const { formatNumber, t } = useI18n()
  const completedDutyCount = duties.filter((duty) => duty.completed).length
  const progressLabel = current
    ? t('household.cleaning.progress', {
      completed: formatNumber(completedDutyCount),
      total: formatNumber(duties.length),
    })
    : t(
      duties.length === 1
        ? 'household.cleaning.tasks.one'
        : 'household.cleaning.tasks.other',
      { count: formatNumber(duties.length) },
    )
  const guidance = current
    ? currentIsUser
      ? t('household.cleaning.dutiesCurrentUser')
      : t('household.cleaning.dutiesOther', { name: current.assignedMemberName })
    : t('household.cleaning.dutiesGeneric')
  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', md: '2xl' }}
      header={
        <AppModalHeader
          icon={List}
          title={t('household.cleaning.dutiesModalTitle')}
          caption={t('household.cleaning.dutiesModalCaption')}
          onClose={onClose}
          accent="green"
          rightSlot={
            <Badge
              bg="var(--pb-tint-income)"
              color="var(--pb-income)"
              border="1px solid var(--pb-hair)"
              borderRadius="full"
              px={3}
              py={1}
              textTransform="none"
            >
              {progressLabel}
            </Badge>
          }
        />
      }
      footer={
        <Flex justify="flex-end" w="full">
          <Button
            h="44px"
            w={{ base: 'full', sm: 'auto' }}
            px={5}
            borderRadius="11px"
            bg="var(--pb-forest-2)"
            color="var(--pb-on-accent)"
            onClick={onClose}
            _hover={{ bg: 'var(--pb-forest)' }}
          >
            {t('household.common.done')}
          </Button>
        </Flex>
      }
    >
      <Box px={{ base: 4, sm: 5, md: 6 }} py={{ base: 4, md: 5 }}>
        <Box
          mb={6}
          p={{ base: 5, md: 6 }}
          borderRadius="24px"
          bgGradient="linear(to-br, var(--pb-forest-2), var(--pb-forest))"
          color="white"
          boxShadow="0 8px 32px -8px rgba(0,0,0,0.15)"
          aria-live="polite"
          aria-atomic="true"
        >
          <Flex
            direction={{ base: 'column', sm: 'row' }}
            align={{ base: 'stretch', sm: 'center' }}
            justify="space-between"
            gap={4}
          >
            <Box>
              <Text fontFamily="var(--pb-mono)" fontSize="10px" fontWeight={700} letterSpacing="0.1em" textTransform="uppercase" color="rgba(255,255,255,0.7)">
                {t('household.cleaning.dutiesTitle')}
              </Text>
              <Text mt={1} color="white" fontSize="md" fontWeight={500} lineHeight={1.4}>
                {guidance}
              </Text>
            </Box>
            <HStack flexShrink={0} spacing={2} px={3.5} py={2} bg="rgba(255,255,255,0.15)" borderRadius="full" backdropFilter="blur(10px)">
              <Icon as={CheckCircle2} boxSize={4} weight="fill" color="var(--pb-gold)" />
              <Text fontFamily="var(--pb-mono)" fontSize="10px" fontWeight={700} textTransform="uppercase">
                {progressLabel}
              </Text>
            </HStack>
          </Flex>
          <Box
            mt={5}
            h="6px"
            overflow="hidden"
            borderRadius="full"
            bg="rgba(0,0,0,0.2)"
            aria-hidden="true"
          >
            <Box
              h="full"
              w={`${duties.length ? (completedDutyCount / duties.length) * 100 : 0}%`}
              borderRadius="full"
              bg="var(--pb-gold)"
              transition="width 400ms cubic-bezier(0.4, 0, 0.2, 1)"
            />
          </Box>
        </Box>

        <VStack spacing={6} align="stretch">
          {duties.filter(d => !d.completed).length > 0 && (
            <Box>
              <Text mb={3} fontFamily="var(--pb-mono)" fontSize="10px" fontWeight={700} letterSpacing="0.1em" textTransform="uppercase" color="var(--pb-ink-faint)">
                {t('household.cleaning.inProgress')}
              </Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                {duties.filter(d => !d.completed).map((duty) => (
                  <CleaningDutyCard
                    key={duty.key}
                    duty={duty}
                    assignmentId={current?.id ?? null}
                    busyDutyKey={busyDutyKey}
                    onToggleDuty={onToggleDuty}
                  />
                ))}
              </SimpleGrid>
            </Box>
          )}

          {duties.filter(d => d.completed).length > 0 && (
            <Box>
              <Text mb={3} fontFamily="var(--pb-mono)" fontSize="10px" fontWeight={700} letterSpacing="0.1em" textTransform="uppercase" color="var(--pb-ink-faint)">
                {t('household.cleaning.completed')}
              </Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                {duties.filter(d => d.completed).map((duty) => (
                  <CleaningDutyCard
                    key={duty.key}
                    duty={duty}
                    assignmentId={current?.id ?? null}
                    busyDutyKey={busyDutyKey}
                    onToggleDuty={onToggleDuty}
                  />
                ))}
              </SimpleGrid>
            </Box>
          )}
        </VStack>
      </Box>
    </PremiumModal>
  )
}

function CleaningDutyCard({
  duty,
  assignmentId,
  busyDutyKey,
  onToggleDuty,
}: {
  duty: DisplayedCleaningDuty
  assignmentId: number | null
  busyDutyKey: string | null
  onToggleDuty: (assignmentId: number, dutyKey: string, completed: boolean) => void
}) {
  const { t } = useI18n()
  const [expanded, setExpanded] = useState(false)
  const label = t(`household.cleaning.duty.${duty.key}`, undefined, duty.label)
  const schedule = duty.key === 'rubbish_out'
    ? t('household.cleaning.rubbishSchedule')
    : duty.schedule
  const isBusy = busyDutyKey === duty.key
  const canToggle = assignmentId !== null && duty.canToggle
  const detailId = `household-cleaning-duty-${duty.key}`

  return (
    <Box
      h={expanded ? 'auto' : { base: '78px', md: '82px' }}
      overflow="hidden"
      borderRadius="16px"
      border="1px solid"
      borderColor={duty.completed ? 'transparent' : duty.timed ? 'var(--pb-gold)' : 'var(--pb-hair)'}
      bg={duty.completed ? 'var(--pb-surface-2)' : duty.timed ? 'var(--pb-tint-gold)' : 'var(--pb-surface)'}
      opacity={duty.completed ? 0.7 : 1}
      boxShadow="0 4px 12px rgba(0,0,0,0.03)"
      transition="height 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)"
      sx={{ interpolateSize: 'allow-keywords' }}
    >
      <Flex
        as="button"
        type="button"
        w="full"
        h={{ base: '78px', md: '82px' }}
        px={4}
        align="center"
        gap={3.5}
        textAlign="left"
        aria-expanded={expanded}
        aria-controls={detailId}
        onClick={() => setExpanded((value) => !value)}
        _focusVisible={{ boxShadow: 'inset 0 0 0 2px var(--pb-forest)', outline: 'none' }}
      >
        <Flex
          w={10}
          h={10}
          flexShrink={0}
          align="center"
          justify="center"
          borderRadius="full"
          border="2px solid"
          borderColor={duty.completed ? 'transparent' : 'var(--pb-hair-2)'}
          bg={duty.completed ? 'var(--pb-tint-income)' : 'transparent'}
          color="var(--pb-income)"
        >
          {duty.completed && <Icon as={Check} boxSize={5} weight="bold" />}
        </Flex>
        <Box minW={0} flex={1}>
          <Text
            color={duty.completed ? 'var(--pb-ink-soft)' : 'var(--pb-ink)'}
            fontSize="sm"
            fontWeight={600}
            lineHeight={1.25}
            textDecoration={duty.completed ? 'line-through' : undefined}
          >
            {label}
          </Text>
          <Text mt={0.5} color={duty.completed ? 'var(--pb-income)' : 'var(--pb-ink-faint)'} fontSize="2xs">
            {duty.completed ? t('household.cleaning.completed') : t('household.cleaning.tapForInstructions')}
          </Text>
        </Box>
        {!expanded && (
          <Flex
            aria-hidden="true"
            w={4}
            h={4}
            flexShrink={0}
            align="center"
            justify="center"
            border="1px solid var(--pb-hair-2)"
            borderRadius="full"
            color="var(--pb-ink-faint)"
            fontFamily="var(--pb-serif)"
            fontSize="10px"
            fontStyle="italic"
            sx={{ '&::before': { content: '"i"' } }}
          />
        )}
      </Flex>

      <Box
        id={detailId}
        px={4}
        pb={4}
        aria-hidden={!expanded}
        opacity={expanded ? 1 : 0}
        pointerEvents={expanded ? 'auto' : 'none'}
        transition={expanded ? 'opacity 0.18s ease 0.12s' : 'opacity 0.12s ease'}
      >
        <Text color="var(--pb-ink-soft)" fontSize="sm" lineHeight={1.5}>
          {t(`household.cleaning.instruction.${duty.key}`)}
        </Text>
        {schedule && (
          <HStack mt={2} spacing={1.5} color={duty.completed ? 'var(--pb-income)' : 'var(--pb-gold)'}>
            <Icon as={Clock} boxSize={3} weight="bold" />
            <Text fontFamily="var(--pb-mono)" fontSize="8px" fontWeight={700}>
              {schedule}
            </Text>
          </HStack>
        )}
        {canToggle && (
          <Button
            mt={4}
            size="sm"
            h="36px"
            borderRadius="9px"
            isLoading={isBusy}
            isDisabled={busyDutyKey !== null}
            colorScheme={duty.completed ? 'gray' : 'green'}
            onClick={() => onToggleDuty(assignmentId, duty.key, !duty.completed)}
          >
            {t(duty.completed ? 'household.cleaning.markNotDone' : 'household.cleaning.markDone', { duty: label })}
          </Button>
        )}
      </Box>
    </Box>
  )
}
