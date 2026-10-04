import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  IconButton,
  Progress,
  Text,
} from '@chakra-ui/react'
import type { SavingsGoal } from '../../types'
import { getChallengeStatus } from '../../utils/pennyChallenge'
import { Sparkles, Trash2 } from '../ui/icons'
import { useI18n } from '../../i18n'

export interface PennyChallengeCardProps {
  goal: SavingsGoal
  onContribute: (goal: SavingsGoal, amount: number) => void | Promise<void>
  onArchive: (goal: SavingsGoal) => void | Promise<void>
  busy?: boolean
}

export default function PennyChallengeCard({
  goal,
  onContribute,
  onArchive,
  busy = false,
}: PennyChallengeCardProps) {
  const { t, formatCurrency } = useI18n()
  const status = getChallengeStatus(goal)
  const progress = status.total > 0 ? (status.saved / status.total) * 100 : 0
  const behind = status.catchUp > 0.0049
  const ahead = status.catchUp < -0.0049
  const finished = status.finished || progress >= 100
  const statusLabel = status.finished
    ? t('goals.challenge.status.finished')
    : behind
      ? t('goals.challenge.status.behind', { amount: formatCurrency(status.catchUp) })
      : ahead
        ? t('goals.challenge.status.ahead', { amount: formatCurrency(-status.catchUp) })
        : t('goals.challenge.status.upToDate')

  return (
    <Box py={4} borderTop="1px solid var(--pb-hair)" borderBottom="1px solid var(--pb-hair)">
      <Flex align="flex-start" justify="space-between" gap={3}>
        <HStack spacing={3} minW={0}>
          <Box
            w="36px"
            h="36px"
            borderRadius="full"
            bg="var(--nu-brand-tint, #f3e8fc)"
            color="var(--nu-brand, #820ad1)"
            display="grid"
            placeItems="center"
            flexShrink={0}
          >
            <Icon as={Sparkles} boxSize={4} weight="duotone" />
          </Box>
          <Box minW={0}>
            <Text fontSize="15px" fontWeight={650} color="var(--pb-ink)" noOfLines={1}>{goal.name}</Text>
            <Text mt="2px" fontSize="11px" color="var(--pb-ink-soft)">
              {t('goals.challenge.dayProgress', { day: status.todayDay, days: status.daysInYear, year: status.year })}
            </Text>
          </Box>
        </HStack>
        <HStack spacing={1} flexShrink={0}>
          <Badge
            borderRadius="full"
            px={2}
            py={0.5}
            textTransform="none"
            fontSize="10px"
            bg={behind ? 'var(--pb-tint-coral)' : 'var(--nu-brand-tint, #f3e8fc)'}
            color={behind ? 'var(--pb-coral)' : 'var(--nu-brand, #820ad1)'}
          >
            {statusLabel}
          </Badge>
          <IconButton
            aria-label={t('goals.challenge.archive')}
            icon={<Icon as={Trash2} boxSize={3.5} />}
            size="xs"
            variant="ghost"
            borderRadius="full"
            color="var(--pb-ink-faint)"
            onClick={() => onArchive(goal)}
            _hover={{ bg: 'var(--pb-tint-coral)', color: 'var(--pb-coral)' }}
          />
        </HStack>
      </Flex>

      <Flex mt={4} align="flex-end" justify="space-between" gap={4}>
        <Box>
          <Text fontSize="10px" color="var(--pb-ink-soft)">{t('goals.saved')}</Text>
          <Text mt="1px" fontSize="xl" fontWeight={700} color="var(--pb-ink)" letterSpacing="-.015em" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatCurrency(status.saved)}
          </Text>
        </Box>
        <Text pb="2px" fontSize="11px" color="var(--pb-ink-soft)" textAlign="right">
          {formatCurrency(status.total)} · {progress.toFixed(0)}%
        </Text>
      </Flex>
      <Progress mt={2.5} value={Math.min(100, progress)} colorScheme={finished ? 'green' : 'purple'} borderRadius="full" size="xs" bg="var(--pb-surface-3)" />

      <Flex mt={3} justify="space-between" gap={4} wrap="wrap">
        <Text fontSize="11px" color="var(--pb-ink-soft)">
          {t('goals.challenge.today')}{' '}
          <Text as="span" fontWeight={700} color="var(--pb-ink)">{formatCurrency(status.todayAmount)}</Text>
        </Text>
        <Text fontSize="11px" color="var(--pb-ink-soft)" textAlign="right">
          {t('goals.challenge.expectedToday')}{' '}
          <Text as="span" fontWeight={700} color="var(--pb-ink)">{formatCurrency(status.expectedByToday)}</Text>
        </Text>
      </Flex>

      <Flex mt={4} gap={2} direction={{ base: 'column', sm: 'row' }}>
        <Button
          flex={1}
          h="38px"
          borderRadius="full"
          bg="var(--nu-brand, #820ad1)"
          color="white"
          onClick={() => onContribute(goal, status.catchUp)}
          isLoading={busy}
          isDisabled={!behind}
          _hover={{ bg: '#6f00b8' }}
        >
          {behind
            ? t('goals.challenge.catchUp', { amount: formatCurrency(status.catchUp) })
            : t('goals.challenge.status.upToDate')}
        </Button>
        <Button
          flex={1}
          h="38px"
          borderRadius="full"
          variant="outline"
          borderColor="var(--pb-hair-2)"
          color="var(--nu-brand, #820ad1)"
          onClick={() => onContribute(goal, status.todayAmount)}
          isLoading={busy}
          isDisabled={status.finished || status.todayAmount <= 0}
          _hover={{ bg: 'var(--nu-brand-tint, #f3e8fc)' }}
        >
          {t('goals.challenge.logToday', { amount: formatCurrency(status.todayAmount) })}
        </Button>
      </Flex>
    </Box>
  )
}
