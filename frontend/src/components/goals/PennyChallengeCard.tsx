import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  HStack,
  Heading,
  Icon,
  IconButton,
  Progress,
  Text,
  VStack,
} from '@chakra-ui/react'
import type { SavingsGoal } from '../../types'
import { getChallengeStatus } from '../../utils/pennyChallenge'
import { Sparkles, Trash2 } from '../ui/icons'
import { useI18n } from '../../i18n'

export interface PennyChallengeCardProps {
  goal: SavingsGoal
  /** Contribute `amount` to the goal (positive = save more). */
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
  const muted = 'var(--pb-ink-soft)'
  const border = 'var(--pb-hair-2)'
  const accentBg = 'var(--pb-tint-gold)'
  const accentFg = 'var(--pb-gold)'

  const status = getChallengeStatus(goal)
  const progress = status.total > 0 ? (status.saved / status.total) * 100 : 0

  const behind = status.catchUp > 0.0049
  const ahead = status.catchUp < -0.0049
  const statusLabel = status.finished
    ? t('goals.challenge.status.finished')
    : behind
      ? t('goals.challenge.status.behind', { amount: formatCurrency(status.catchUp) })
      : ahead
        ? t('goals.challenge.status.ahead', { amount: formatCurrency(-status.catchUp) })
        : t('goals.challenge.status.upToDate')
  const statusScheme = behind ? 'red' : ahead ? 'purple' : 'green'

  return (
    <Card border="1px solid" borderColor={border} boxShadow="sm">
      <CardBody p={4}>
        <VStack align="stretch" spacing={3}>
          {/* Header */}
          <HStack justify="space-between" align="center">
            <HStack spacing={2.5} minW={0}>
              <Box
                w={9}
                h={9}
                borderRadius="lg"
                bg={accentBg}
                color={accentFg}
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
              >
                <Icon as={Sparkles} boxSize={4} weight="duotone" />
              </Box>
              <Box minW={0}>
                <Heading size="xs" noOfLines={1}>
                  {goal.name}
                </Heading>
                <Text fontSize="2xs" color={muted}>
                  {t('goals.challenge.dayProgress', { day: status.todayDay, days: status.daysInYear, year: status.year })}
                </Text>
              </Box>
            </HStack>
            <HStack spacing={1} flexShrink={0}>
              <Badge colorScheme={statusScheme} borderRadius="full" px={2} textTransform="none">
                {statusLabel}
              </Badge>
              <IconButton
                aria-label={t('goals.challenge.archive')}
                icon={<Icon as={Trash2} boxSize={3.5} />}
                size="xs"
                variant="ghost"
                colorScheme="red"
                onClick={() => onArchive(goal)}
              />
            </HStack>
          </HStack>

          {/* Progress */}
          <Box>
            <HStack justify="space-between" mb={1}>
              <Text fontSize="xs">
                <Text as="span" fontWeight={800}>
                  {formatCurrency(status.saved)}
                </Text>
                <Text as="span" color={muted}>
                  {' '}
                  / {formatCurrency(status.total)}
                </Text>
              </Text>
              <Text fontSize="xs" color={muted}>
                {progress.toFixed(0)}%
              </Text>
            </HStack>
            <Progress
              value={Math.min(100, progress)}
              colorScheme={status.finished || progress >= 100 ? 'green' : 'orange'}
              borderRadius="full"
              size="sm"
            />
          </Box>

          {/* Key figures */}
          <HStack justify="space-between" fontSize="xs" color={muted}>
            <Text>
              {t('goals.challenge.today')}{' '}
              <Text as="span" fontWeight={700} color={accentFg}>
                {formatCurrency(status.todayAmount)}
              </Text>
            </Text>
            <Text>
              {t('goals.challenge.expectedToday')}{' '}
              <Text as="span" fontWeight={700} color="inherit">
                {formatCurrency(status.expectedByToday)}
              </Text>
            </Text>
          </HStack>

          {/* Actions */}
          <HStack spacing={2}>
            <Button
              flex={1}
              size="sm"
              colorScheme="orange"
              onClick={() => onContribute(goal, status.catchUp)}
              isLoading={busy}
              isDisabled={!behind}
            >
              {behind
                ? t('goals.challenge.catchUp', { amount: formatCurrency(status.catchUp) })
                : t('goals.challenge.status.upToDate')}
            </Button>
            <Button
              flex={1}
              size="sm"
              variant="outline"
              onClick={() => onContribute(goal, status.todayAmount)}
              isLoading={busy}
              isDisabled={status.finished || status.todayAmount <= 0}
            >
              {t('goals.challenge.logToday', { amount: formatCurrency(status.todayAmount) })}
            </Button>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  )
}
