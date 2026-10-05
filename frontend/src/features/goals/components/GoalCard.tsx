import { Box, Flex, HStack, Icon, IconButton, Text } from '@chakra-ui/react'
import { Check, Pencil, Trash2 } from '../../../components/ui/icons'
import { useI18n } from '../../../i18n'
import type { SavingsGoal } from '../../../types'

export const GOAL_COLORS = ['#820ad1', '#1e8a5a', '#2563eb', '#d97706', '#c2412d', '#0e9aa7']
export const DEFAULT_GOAL_COLOR = GOAL_COLORS[0]

/** Whole months from now until the target date (at least 1), or null without a date. */
function monthsUntil(targetDate?: string | null): number | null {
  if (!targetDate) return null
  const days = (new Date(`${targetDate}T00:00:00`).getTime() - Date.now()) / 86_400_000
  return days <= 0 ? 0 : Math.max(1, Math.ceil(days / 30))
}

function ProgressRing({ pct, color, done }: { pct: number; color: string; done: boolean }) {
  const r = 34
  const c = 2 * Math.PI * r
  return (
    <Box position="relative" w="84px" h="84px" flexShrink={0}>
      <svg width="84" height="84" viewBox="0 0 84 84" aria-hidden="true">
        <circle cx="42" cy="42" r={r} fill="none" stroke="var(--nu-track)" strokeWidth="8" />
        <circle
          cx="42" cy="42" r={r} fill="none" stroke={done ? 'var(--nu-positive)' : color} strokeWidth="8"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(100, pct) / 100)}
          transform="rotate(-90 42 42)" style={{ transition: 'stroke-dashoffset .4s ease' }}
        />
      </svg>
      <Flex position="absolute" inset={0} align="center" justify="center">
        {done
          ? <Icon as={Check} boxSize={6} color="var(--nu-positive)" />
          : <Text fontSize="17px" fontWeight={700} color="var(--pb-ink)">{Math.round(pct)}%</Text>}
      </Flex>
    </Box>
  )
}

interface GoalCardProps {
  goal: SavingsGoal
  onSave: () => void
  onEdit: () => void
  onArchive: () => void
}

export default function GoalCard({ goal, onSave, onEdit, onArchive }: GoalCardProps) {
  const { t, formatCurrency, formatDate } = useI18n()
  const done = goal.progressPercentage >= 100
  const months = monthsUntil(goal.targetDate)
  const color = goal.color || DEFAULT_GOAL_COLOR

  let badge: { text: string; bg: string; fg: string } | null = null
  if (done) badge = { text: t('goals.badge.done'), bg: 'var(--nu-positive-tint)', fg: 'var(--nu-positive)' }
  else if (months === 0) badge = { text: t('goals.badge.overdue'), bg: 'var(--nu-negative-tint)', fg: 'var(--nu-negative)' }
  else if (months != null) {
    badge = {
      text: t('goals.badge.pace', { months, amount: formatCurrency(goal.remainingAmount / months) }),
      bg: 'var(--nu-brand-tint)', fg: 'var(--nu-brand)',
    }
  }

  return (
    <Flex direction="column" p={4} borderRadius="20px" bg="var(--nu-surface)" gap={4}>
      <Flex gap={4} align="center">
        <ProgressRing pct={goal.progressPercentage} color={color} done={done} />
        <Box minW={0} flex={1}>
          <Flex align="center" gap={2}>
            <Box w="8px" h="8px" borderRadius="full" bg={color} flexShrink={0} />
            <Text fontSize="16px" fontWeight={700} color="var(--pb-ink)" noOfLines={1}>{goal.name}</Text>
          </Flex>
          <Text mt={1} fontSize="20px" fontWeight={700} letterSpacing="-0.02em" color="var(--pb-ink)" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatCurrency(goal.currentAmount)}
          </Text>
          <Text fontSize="12px" color="var(--pb-ink-soft)">
            {t('goals.target')} {formatCurrency(goal.targetAmount)}
            {goal.targetDate ? ` · ${formatDate(goal.targetDate)}` : ''}
          </Text>
        </Box>
      </Flex>

      {badge && (
        <Text alignSelf="flex-start" px={3} py="3px" borderRadius="full" fontSize="12px" fontWeight={600} bg={badge.bg} color={badge.fg}>
          {badge.text}
        </Text>
      )}

      <HStack justify="space-between">
        <Box
          as="button" type="button" onClick={onSave}
          px={5} h="38px" borderRadius="full" bg="var(--nu-brand)" color="white" fontSize="14px" fontWeight={600}
          _hover={{ bg: 'var(--nu-brand-deep)' }} _focusVisible={{ boxShadow: '0 0 0 2px var(--nu-brand-tint), 0 0 0 4px var(--nu-brand)', outline: 'none' }}
        >
          {t('goals.save')}
        </Box>
        <HStack spacing={1}>
          <IconButton aria-label={t('goals.edit')} icon={<Icon as={Pencil} boxSize={4} />} size="sm" variant="ghost" borderRadius="full" color="var(--pb-ink-soft)" onClick={onEdit} _hover={{ bg: 'var(--nu-surface-hover)' }} />
          <IconButton aria-label={t('goals.archive')} icon={<Icon as={Trash2} boxSize={4} />} size="sm" variant="ghost" borderRadius="full" color="var(--pb-ink-faint)" onClick={onArchive} _hover={{ bg: 'var(--nu-negative-tint)', color: 'var(--nu-negative)' }} />
        </HStack>
      </HStack>
    </Flex>
  )
}
