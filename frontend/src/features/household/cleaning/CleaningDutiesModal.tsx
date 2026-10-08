import { Box, Flex, HStack, Icon, Spinner, Text, VStack } from '@chakra-ui/react'
import { useState } from 'react'
import { useI18n } from '../../../i18n'
import type { HouseholdCleaningAssignment } from '../../../types'
import { Check, Clock } from '../../../components/ui/icons'
import { PremiumModal } from '../../../components/ui'
import NuModalHeader from '../../../components/ui/NuModalHeader'
import type { DisplayedCleaningDuty } from './cleaningConfig'

const BRAND = '#820ad1'
const ROW_HEIGHT = '56px'

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
  const pendingDuties = duties.filter((duty) => !duty.completed)
  const completedDuties = duties.filter((duty) => duty.completed)
  const renderDuties = (list: DisplayedCleaningDuty[]) => (
    <VStack align="stretch" spacing={0} divider={<Box h="1px" bg="var(--pb-hair)" />}>
      {list.map((duty) => (
        <CleaningDutyCard
          key={duty.key}
          duty={duty}
          assignmentId={current?.id ?? null}
          busyDutyKey={busyDutyKey}
          onToggleDuty={onToggleDuty}
        />
      ))}
    </VStack>
  )

  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      contentProps={{
        className: 'nu-dashboard',
        w: { base: '100%', md: 'min(640px, calc(100vw - 32px))' }, maxW: '640px',
        h: 'auto', maxH: { base: '85dvh', md: '80vh' },
        mt: 'auto', mb: 0, mx: 'auto', borderRadius: '32px 32px 0 0', overflow: 'hidden', bg: 'var(--nu-page, #ffffff)',
      }}
      header={
        <NuModalHeader
          title={t('household.cleaning.dutiesModalTitle')}
          caption={guidance}
          onClose={onClose}
        />
      }
    >
      <Box overflowY="auto" flex={1} minH={0} bg="var(--nu-page, #ffffff)" pb="env(safe-area-inset-bottom, 0px)"
        sx={{ WebkitOverflowScrolling: 'touch' }}>
        <Box px={{ base: 4, md: 6 }} py={3} borderBottom="1px solid var(--pb-hair)" aria-live="polite" aria-atomic="true">
          <Flex align="center" justify="space-between" mb={1.5}>
            <Text fontSize="xs" fontWeight={700} color="var(--pb-ink-soft)">{t('household.cleaning.dutiesTitle')}</Text>
            <Text fontSize="xs" fontWeight={800} color={BRAND}>{progressLabel}</Text>
          </Flex>
          <Box h="6px" overflow="hidden" borderRadius="full" bg="var(--pb-hair)" aria-hidden="true">
            <Box
              h="full"
              w={`${duties.length ? (completedDutyCount / duties.length) * 100 : 0}%`}
              borderRadius="full"
              bg={BRAND}
              transition="width 400ms cubic-bezier(0.4, 0, 0.2, 1)"
            />
          </Box>
        </Box>

        {pendingDuties.length > 0 && (
          <Box>
            <SectionLabel>{t('household.cleaning.inProgress')}</SectionLabel>
            {renderDuties(pendingDuties)}
          </Box>
        )}
        {completedDuties.length > 0 && (
          <Box>
            <SectionLabel>{t('household.cleaning.completed')}</SectionLabel>
            {renderDuties(completedDuties)}
          </Box>
        )}
      </Box>
    </PremiumModal>
  )
}

function SectionLabel({ children }: { children: string }) {
  return (
    <Text px={{ base: 4, md: 6 }} pt={3} pb={1} fontSize="11px" fontWeight={700} letterSpacing=".04em"
      textTransform="uppercase" color="var(--pb-ink-faint)">
      {children}
    </Text>
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
      h={expanded ? 'auto' : ROW_HEIGHT}
      overflow="hidden"
      bg={!duty.completed && duty.timed ? 'var(--pb-tint-gold)' : undefined}
      opacity={duty.completed ? 0.7 : 1}
      transition="height 0.35s cubic-bezier(0.4, 0, 0.2, 1)"
      sx={{ interpolateSize: 'allow-keywords' }}
    >
      <Flex w="full" h={ROW_HEIGHT} pl={{ base: 4, md: 6 }} align="center" gap={3}>
        {/* The circle is the checkbox: residents tick a duty off right here. */}
        <Flex
          as={canToggle ? 'button' : 'span'}
          {...(canToggle
            ? {
              type: 'button',
              role: 'checkbox',
              'aria-checked': duty.completed,
              'aria-busy': isBusy,
              'aria-label': t(duty.completed ? 'household.cleaning.markNotDone' : 'household.cleaning.markDone', { duty: label }),
              disabled: busyDutyKey !== null,
              onClick: () => onToggleDuty(assignmentId, duty.key, !duty.completed),
            }
            : { 'aria-hidden': true })}
          w={7}
          h={7}
          flexShrink={0}
          align="center"
          justify="center"
          borderRadius="full"
          border="2px solid"
          borderColor={duty.completed ? 'transparent' : canToggle ? 'var(--nu-brand)' : 'var(--pb-hair-2)'}
          bg={duty.completed ? 'var(--nu-brand)' : 'transparent'}
          color="white"
          cursor={canToggle ? 'pointer' : 'default'}
          transition="background 0.15s ease, border-color 0.15s ease, transform 0.1s ease"
          _hover={canToggle && !duty.completed ? { bg: 'var(--nu-brand-tint)' } : undefined}
          _active={canToggle ? { transform: 'scale(0.92)' } : undefined}
          _disabled={{ cursor: 'progress', opacity: isBusy ? 1 : 0.6 }}
          _focusVisible={{ outline: '2px solid var(--nu-brand)', outlineOffset: '2px' }}
        >
          {isBusy
            ? <Spinner size="xs" color={duty.completed ? 'white' : 'var(--nu-brand)'} />
            : duty.completed && <Icon as={Check} boxSize={4} weight="bold" />}
        </Flex>
        <Flex
          as="button"
          type="button"
          flex={1}
          minW={0}
          h="full"
          pr={{ base: 4, md: 6 }}
          align="center"
          gap={3}
          textAlign="left"
          aria-expanded={expanded}
          aria-controls={detailId}
          onClick={() => setExpanded((value) => !value)}
          _focusVisible={{ boxShadow: 'inset 0 0 0 2px var(--pb-forest)', outline: 'none' }}
        >
          <Box minW={0} flex={1}>
            <Text
              color={duty.completed ? 'var(--pb-ink-soft)' : 'var(--pb-ink)'}
              fontSize="sm"
              fontWeight={600}
              lineHeight={1.25}
              noOfLines={1}
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
      </Flex>

      <Box
        id={detailId}
        pl={{ base: 14, md: 16 }}
        pr={{ base: 4, md: 6 }}
        pb={3}
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
      </Box>
    </Box>
  )
}
