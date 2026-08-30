import { Badge, Box, Button, Flex, HStack, Icon, SimpleGrid, Spinner, Text, VStack } from '@chakra-ui/react'
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
  const displayDutyLabel = (duty: { key: string; label: string }) =>
    t(`household.cleaning.duty.${duty.key}`, undefined, duty.label)
  const displayDutySchedule = (duty: { key: string; schedule?: string | null }) =>
    duty.key === 'rubbish_out'
      ? t('household.cleaning.rubbishSchedule')
      : duty.schedule

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
                {duties.filter(d => !d.completed).map((duty, index) => (
                  <Box
                    as={duty.canToggle && busyDutyKey === null ? 'button' : 'div'}
                    key={duty.key}
                    w="full"
                    textAlign="left"
                    onClick={() => {
                      if (!current || !duty.canToggle || busyDutyKey !== null) return
                      onToggleDuty(current.id, duty.key, true)
                    }}
                    minH={{ base: '72px', md: '76px' }}
                    display="flex"
                    alignItems="center"
                    gap={3.5}
                    px={4}
                    py={3}
                    borderRadius="16px"
                    border="1px solid"
                    borderColor={duty.timed ? 'var(--pb-gold)' : 'var(--pb-hair)'}
                    bg={duty.timed ? 'var(--pb-tint-gold)' : 'var(--pb-surface)'}
                    boxShadow="0 4px 12px rgba(0,0,0,0.03)"
                    transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                    _hover={duty.canToggle && busyDutyKey === null
                      ? { transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', borderColor: 'var(--pb-hair-2)' }
                      : undefined}
                    _focusVisible={{
                      boxShadow: '0 0 0 2px var(--pb-forest)',
                      outline: 'none',
                    }}
                  >
                    <Flex
                      w={10}
                      h={10}
                      flexShrink={0}
                      align="center"
                      justify="center"
                      borderRadius="full"
                      border="2px solid"
                      borderColor="var(--pb-hair-2)"
                      bg="transparent"
                      color="white"
                      transition="all 0.2s"
                    >
                      {busyDutyKey === duty.key ? (
                        <Spinner size="sm" thickness="2px" color="var(--pb-forest-2)" />
                      ) : (
                        <Icon
                          as={Check}
                          boxSize={5}
                          weight="bold"
                          opacity={0}
                          transform="scale(0.5)"
                          transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                        />
                      )}
                    </Flex>
                    <Box minW={0} flex={1}>
                      <Text color="var(--pb-ink)" fontSize="sm" fontWeight={600} lineHeight={1.25}>
                        {displayDutyLabel(duty)}
                      </Text>
                      {duty.schedule ? (
                        <HStack mt={1} spacing={1.5} color="var(--pb-gold)">
                          <Icon as={Clock} boxSize={3} weight="bold" />
                          <Text fontFamily="var(--pb-mono)" fontSize="8px" fontWeight={700}>
                            {displayDutySchedule(duty)}
                          </Text>
                        </HStack>
                      ) : (
                        <Text mt={0.5} color="var(--pb-ink-faint)" fontSize="2xs">
                          {t('household.cleaning.taskNumber', {
                            number: formatNumber(index + 1, {
                              minimumIntegerDigits: 2,
                              useGrouping: false,
                            }),
                          })}
                        </Text>
                      )}
                    </Box>
                  </Box>
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
                {duties.filter(d => d.completed).map((duty, index) => (
                  <Box
                    as={duty.canToggle && busyDutyKey === null ? 'button' : 'div'}
                    key={duty.key}
                    w="full"
                    textAlign="left"
                    onClick={() => {
                      if (!current || !duty.canToggle || busyDutyKey !== null) return
                      onToggleDuty(current.id, duty.key, false)
                    }}
                    minH={{ base: '72px', md: '76px' }}
                    display="flex"
                    alignItems="center"
                    gap={3.5}
                    px={4}
                    py={3}
                    borderRadius="16px"
                    border="1px solid transparent"
                    bg="var(--pb-surface-2)"
                    opacity={0.65}
                    transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                    _hover={duty.canToggle && busyDutyKey === null
                      ? { opacity: 1, transform: 'translateY(-2px)' }
                      : undefined}
                    _focusVisible={{
                      boxShadow: '0 0 0 2px var(--pb-forest)',
                      outline: 'none',
                    }}
                  >
                    <Flex
                      w={10}
                      h={10}
                      flexShrink={0}
                      align="center"
                      justify="center"
                      borderRadius="full"
                      border="2px solid transparent"
                      bg="var(--pb-tint-income)"
                      color="var(--pb-income)"
                    >
                      {busyDutyKey === duty.key ? (
                        <Spinner size="sm" thickness="2px" />
                      ) : (
                        <Icon as={Check} boxSize={5} weight="bold" />
                      )}
                    </Flex>
                    <Box minW={0} flex={1}>
                      <Text color="var(--pb-ink-soft)" fontSize="sm" fontWeight={600} lineHeight={1.25} textDecoration="line-through">
                        {displayDutyLabel(duty)}
                      </Text>
                      {duty.schedule ? (
                        <HStack mt={1} spacing={1.5} color="var(--pb-income)">
                          <Icon as={Clock} boxSize={3} weight="bold" />
                          <Text fontFamily="var(--pb-mono)" fontSize="8px" fontWeight={700}>
                            {displayDutySchedule(duty)}
                          </Text>
                        </HStack>
                      ) : (
                        <Text mt={0.5} color="var(--pb-income)" fontSize="2xs">
                          {t('household.cleaning.completed')}
                        </Text>
                      )}
                    </Box>
                  </Box>
                ))}
              </SimpleGrid>
            </Box>
          )}
        </VStack>
      </Box>
    </PremiumModal>
  )
}
