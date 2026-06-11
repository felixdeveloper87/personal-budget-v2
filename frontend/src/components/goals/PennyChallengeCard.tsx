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
  useColorModeValue,
} from '@chakra-ui/react'
import type { SavingsGoal } from '../../types'
import { getChallengeStatus } from '../../utils/pennyChallenge'
import { Sparkles, Trash2 } from '../ui/icons'

const money = (value: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value)

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
  const muted = useColorModeValue('gray.600', 'gray.400')
  const border = useColorModeValue('orange.200', 'whiteAlpha.200')
  const accentBg = useColorModeValue('orange.50', 'rgba(245,158,11,0.12)')
  const accentFg = useColorModeValue('orange.600', 'orange.300')

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
                  Day {status.todayDay}/{status.daysInYear} · {status.year}
                </Text>
              </Box>
            </HStack>
            <HStack spacing={1} flexShrink={0}>
              <Badge colorScheme={statusScheme} borderRadius="full" px={2} textTransform="none">
                {statusLabel}
              </Badge>
              <IconButton
                aria-label="Archive challenge"
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
                  {money(status.saved)}
                </Text>
                <Text as="span" color={muted}>
                  {' '}
                  / {money(status.total)}
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
              Today{' '}
              <Text as="span" fontWeight={700} color={accentFg}>
                {money(status.todayAmount)}
              </Text>
            </Text>
            <Text>
              Expected today{' '}
              <Text as="span" fontWeight={700} color="inherit">
                {money(status.expectedByToday)}
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
              {behind ? `Catch up ${money(status.catchUp)}` : 'Up to date'}
            </Button>
            <Button
              flex={1}
              size="sm"
              variant="outline"
              onClick={() => onContribute(goal, status.todayAmount)}
              isLoading={busy}
              isDisabled={status.finished || status.todayAmount <= 0}
            >
              Log today {money(status.todayAmount)}
            </Button>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  )
}
