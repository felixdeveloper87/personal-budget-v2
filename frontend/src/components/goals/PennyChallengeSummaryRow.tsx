import {
  Badge,
  Box,
  Card,
  CardBody,
  HStack,
  Icon,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import type { SavingsGoal } from '../../types'
import { getChallengeStatus } from '../../utils/pennyChallenge'
import { ChevronDown, Sparkles } from '../ui/icons'

const money = (value: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value)

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
  const muted = useColorModeValue('gray.600', 'gray.400')
  const border = useColorModeValue('orange.200', 'whiteAlpha.200')
  const accentBg = useColorModeValue('orange.50', 'rgba(245,158,11,0.12)')
  const accentFg = useColorModeValue('orange.600', 'orange.300')
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.50')

  const status = getChallengeStatus(goal)
  const progress = status.total > 0 ? (status.saved / status.total) * 100 : 0

  const behind = status.catchUp > 0.0049
  const ahead = status.catchUp < -0.0049
  const statusLabel = status.finished
    ? 'Finished'
    : behind
      ? `Behind ${money(status.catchUp)}`
      : ahead
        ? `Ahead ${money(-status.catchUp)}`
        : 'Up to date'
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
              {money(status.saved)} of {money(status.total)} · Day {status.todayDay}/{status.daysInYear} ·{' '}
              {progress.toFixed(0)}%
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
