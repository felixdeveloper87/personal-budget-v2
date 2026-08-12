import {
  Badge,
  Box,
  Card,
  CardBody,
  HStack,
  Icon,
  Text,
} from '@chakra-ui/react'
import type { SavingsGoal } from '../../types'
import { getChallengeStatus } from '../../utils/pennyChallenge'
import { ChevronDown, Sparkles } from '../ui/icons'
import { useI18n } from '../../i18n'

export interface PennyChallengeSummaryRowProps {
  goal: SavingsGoal
  /** Expand back to the full challenge card. */
  onExpand: () => void
}

/**
 * Single-line, collapsed view of a challenge: keeps the crucial figures visible
 * (saved, progress, status, day) without taking the full card's vertical space.
 */
export default function PennyChallengeSummaryRow({ goal, onExpand }: PennyChallengeSummaryRowProps) {
  const { t, formatCurrency } = useI18n()
  const muted = 'var(--pb-ink-soft)'
  const border = 'var(--pb-hair-2)'
  const accentBg = 'var(--pb-tint-gold)'
  const accentFg = 'var(--pb-gold)'
  const hoverBg = 'var(--pb-surface-2)'

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
      <CardBody
        as="button"
        type="button"
        onClick={onExpand}
        py={3}
        px={4}
        w="full"
        textAlign="left"
        transition="background 0.15s ease"
        _hover={{ bg: hoverBg }}
      >
        <HStack spacing={3} align="center">
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

          <Box minW={0} flex={1}>
            <Text fontWeight={700} fontSize="sm" noOfLines={1}>
              {goal.name}
            </Text>
            <Text fontSize="xs" color={muted} noOfLines={1}>
              {t('goals.challenge.summary', {
                saved: formatCurrency(status.saved),
                total: formatCurrency(status.total),
                day: status.todayDay,
                days: status.daysInYear,
                percentage: progress.toFixed(0),
              })}
            </Text>
          </Box>

          <Badge colorScheme={statusScheme} borderRadius="full" px={2} textTransform="none" flexShrink={0}>
            {statusLabel}
          </Badge>
          <Icon as={ChevronDown} boxSize={5} color={muted} flexShrink={0} />
        </HStack>
      </CardBody>
    </Card>
  )
}
