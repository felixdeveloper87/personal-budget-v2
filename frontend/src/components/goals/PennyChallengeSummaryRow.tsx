import { Badge, Box, Flex, HStack, Icon, Text } from '@chakra-ui/react'
import type { SavingsGoal } from '../../types'
import { getChallengeStatus } from '../../utils/pennyChallenge'
import { ChevronDown, Sparkles } from '../ui/icons'
import { useI18n } from '../../i18n'

export interface PennyChallengeSummaryRowProps {
  goal: SavingsGoal
  onExpand: () => void
}

export default function PennyChallengeSummaryRow({ goal, onExpand }: PennyChallengeSummaryRowProps) {
  const { t, formatCurrency } = useI18n()
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

  return (
    <Flex
      as="button"
      type="button"
      onClick={onExpand}
      py={3.5}
      px={0}
      w="full"
      textAlign="left"
      align="center"
      gap={3}
      borderTop="1px solid var(--pb-hair)"
      borderBottom="1px solid var(--pb-hair)"
      transition="background .15s ease"
      _hover={{ bg: 'var(--pb-surface-2)' }}
    >
      <Box w="34px" h="34px" borderRadius="full" bg="var(--nu-brand-tint, #f3e8fc)" color="var(--nu-brand, #820ad1)" display="grid" placeItems="center" flexShrink={0}>
        <Icon as={Sparkles} boxSize={4} weight="duotone" />
      </Box>
      <Box minW={0} flex={1}>
        <Text fontWeight={650} fontSize="sm" color="var(--pb-ink)" noOfLines={1}>{goal.name}</Text>
        <Text mt="2px" fontSize="11px" color="var(--pb-ink-soft)" noOfLines={1}>
          {t('goals.challenge.summary', {
            saved: formatCurrency(status.saved),
            total: formatCurrency(status.total),
            day: status.todayDay,
            days: status.daysInYear,
            percentage: progress.toFixed(0),
          })}
        </Text>
      </Box>
      <HStack spacing={2} flexShrink={0}>
        <Badge borderRadius="full" px={2} py={0.5} textTransform="none" fontSize="10px" bg={behind ? 'var(--pb-tint-coral)' : 'var(--nu-brand-tint, #f3e8fc)'} color={behind ? 'var(--pb-coral)' : 'var(--nu-brand, #820ad1)'}>
          {statusLabel}
        </Badge>
        <Icon as={ChevronDown} boxSize={4} color="var(--pb-ink-soft)" />
      </HStack>
    </Flex>
  )
}
