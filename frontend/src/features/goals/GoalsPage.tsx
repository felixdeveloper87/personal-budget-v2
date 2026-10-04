import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  IconButton,
  NumberInput,
  NumberInputField,
  Progress,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react'
import { Target } from 'lucide-react'

import {
  archiveSavingsGoal,
  contributeToSavingsGoal,
  createSavingsGoal,
  listSavingsGoals,
} from '../../api'
import type { SavingsGoal } from '../../types'
import { ToastService } from '../../services/toast'
import { useI18n } from '../../i18n'
import { useDashboardData } from '../../hooks/useDashboardData'
import { usePeriodData } from '../../hooks/usePeriodData'
import BalanceBreakEvenPanel from '../../components/charts/modal/BalanceBreakEvenPanel'
import PennyChallengeCard from '../../components/goals/PennyChallengeCard'
import PennyChallengeSummaryRow from '../../components/goals/PennyChallengeSummaryRow'
import StartChallengeDialog from '../../components/goals/StartChallengeDialog'
import { ChevronDown, ChevronUp, Sparkles, Trash2 } from '../../components/ui/icons'
import NuHero, { NuHeroBadge } from '../dashboard/components/NuHero'
import { NuSection } from '../dashboard/components/nu'
import '../dashboard/theme/pb-tokens.css'
import {
  CHALLENGE_NAME_PREFIX,
  challengeYearTotal,
  expectedCumulativeToday,
  isPennyChallengeGoal,
} from '../../utils/pennyChallenge'

const CHALLENGE_COLLAPSED_KEY = 'goals:challenge-collapsed'

export default function GoalsPage() {
  const { t, formatCurrency } = useI18n()
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [contributions, setContributions] = useState<Record<number, number>>({})
  const [challengeBusyId, setChallengeBusyId] = useState<number | null>(null)
  const [startingChallenge, setStartingChallenge] = useState(false)
  const [confirmStartOpen, setConfirmStartOpen] = useState(false)
  const [challengeCollapsed, setChallengeCollapsed] = useState(() => {
    try {
      return localStorage.getItem(CHALLENGE_COLLAPSED_KEY) === 'true'
    } catch {
      return false
    }
  })

  const currentMonth = useMemo(() => new Date(), [])
  const {
    transactions: balanceTransactions,
    monthSummary,
    loading: balanceLoading,
  } = useDashboardData(currentMonth, 'month')
  const periodData = usePeriodData(
    balanceTransactions,
    monthSummary,
    'month',
    currentMonth,
    'cash-flow',
  )

  const load = useCallback(async () => {
    try {
      setGoals(await listSavingsGoals())
    } catch (err) {
      ToastService.apiError(err, { title: t('goals.toast.loadFailed'), dedupeKey: 'goals-load-failed' })
    }
  }, [t])

  useEffect(() => { void load() }, [load])

  const contribute = async (goal: SavingsGoal) => {
    const amount = contributions[goal.id] ?? 0
    if (amount === 0) return
    try {
      await contributeToSavingsGoal(goal.id, amount)
      setContributions((current) => ({ ...current, [goal.id]: 0 }))
      await load()
      ToastService.success({ title: amount > 0 ? t('goals.toast.contributionAdded') : t('goals.toast.withdrawalRecorded'), dedupeKey: `goal-contribution:${goal.id}` })
    } catch (err) {
      ToastService.apiError(err, { title: t('goals.toast.updateFailed'), dedupeKey: `goal-contribution-failed:${goal.id}` })
    }
  }

  const archive = async (goal: SavingsGoal) => {
    try {
      await archiveSavingsGoal(goal.id)
      await load()
    } catch (err) {
      ToastService.apiError(err, { title: t('goals.toast.archiveFailed'), dedupeKey: `goal-archive-failed:${goal.id}` })
    }
  }

  const activeGoals = useMemo(() => goals.filter((goal) => !goal.archived), [goals])
  const challengeGoals = useMemo(() => activeGoals.filter(isPennyChallengeGoal), [activeGoals])
  const normalGoals = useMemo(
    () => activeGoals.filter((goal) => !isPennyChallengeGoal(goal)),
    [activeGoals],
  )

  const totals = useMemo(() => {
    const saved = activeGoals.reduce((sum, goal) => sum + goal.currentAmount, 0)
    const target = activeGoals.reduce((sum, goal) => sum + goal.targetAmount, 0)
    return {
      saved,
      target,
      remaining: Math.max(0, target - saved),
      progress: target > 0 ? Math.min(100, Math.max(0, saved / target * 100)) : 0,
    }
  }, [activeGoals])

  const toggleChallengeCollapsed = () => {
    setChallengeCollapsed((current) => {
      const next = !current
      try {
        localStorage.setItem(CHALLENGE_COLLAPSED_KEY, String(next))
      } catch {
        // Keep the preference for this session when storage is unavailable.
      }
      return next
    })
  }

  const applyChallengeContribution = async (goal: SavingsGoal, amount: number) => {
    const rounded = Math.round(amount * 100) / 100
    if (rounded === 0) return
    setChallengeBusyId(goal.id)
    try {
      await contributeToSavingsGoal(goal.id, rounded)
      await load()
      ToastService.success({ title: t('goals.challenge.toast.updated'), dedupeKey: `challenge-contribution:${goal.id}` })
    } catch (err) {
      ToastService.apiError(err, {
        title: t('goals.challenge.toast.updateFailed'),
        dedupeKey: `challenge-contribution-failed:${goal.id}`,
      })
    } finally {
      setChallengeBusyId(null)
    }
  }

  const startChallenge = async () => {
    const today = new Date()
    const year = today.getFullYear()
    setStartingChallenge(true)
    try {
      await createSavingsGoal({
        name: `${CHALLENGE_NAME_PREFIX} ${year}`,
        targetAmount: challengeYearTotal(year),
        currentAmount: expectedCumulativeToday(year, today),
        targetDate: `${year}-12-31`,
        color: '#820ad1',
      })
      await load()
      setConfirmStartOpen(false)
      ToastService.success({ title: t('goals.challenge.toast.started'), dedupeKey: 'challenge-started' })
    } catch (err) {
      ToastService.apiError(err, { title: t('goals.challenge.toast.startFailed'), dedupeKey: 'challenge-start-failed' })
    } finally {
      setStartingChallenge(false)
    }
  }

  return (
    <Box>
      <NuHero
        title={t('nav.goals.label')}
        action={<NuHeroBadge><Target size={18} strokeWidth={2.4} aria-hidden="true" /></NuHeroBadge>}
      >
        <Flex mt={{ base: 3, md: 4 }} direction={{ base: 'column', md: 'row' }} align={{ base: 'stretch', md: 'flex-end' }} justify="space-between" gap={{ base: 4, md: 10 }}>
          <Box minW={0} flex={1}>
            <Text fontSize="sm" color="rgba(255,255,255,.78)">{t('goals.saved')}</Text>
            <Text mt={0.5} fontSize={{ base: '2rem', md: '2.5rem' }} fontWeight={700} letterSpacing="-0.025em" lineHeight={1.1} color="white" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatCurrency(totals.saved)}
            </Text>
            <Text mt={1} fontSize="sm" color="rgba(255,255,255,.72)">
              {t('goals.target')} {formatCurrency(totals.target)}
              {' · '}
              {t('goals.remaining', { amount: formatCurrency(totals.remaining) })}
            </Text>
            <Box mt={3} maxW="380px" h="4px" borderRadius="full" bg="rgba(255,255,255,.2)" overflow="hidden">
              <Box h="full" w={`${totals.progress}%`} borderRadius="full" bg="white" transition="width .35s ease" />
            </Box>
          </Box>
          <Box minW={{ md: '210px' }} borderTop={{ base: '1px solid rgba(255,255,255,.18)', md: 0 }} pt={{ base: 3, md: 0 }}>
            <Text fontSize="11px" color="rgba(255,255,255,.7)">{t('goals.section.active')}</Text>
            <Text mt={1} fontSize="lg" fontWeight={650} color="white">
              {t(activeGoals.length === 1 ? 'goals.hero.active.one' : 'goals.hero.active.other', { count: activeGoals.length })}
            </Text>
            <Text mt={0.5} fontSize="10px" color="rgba(255,255,255,.62)">{Math.round(totals.progress)}%</Text>
          </Box>
        </Flex>
      </NuHero>

      <Box maxW="appContent" mx="auto" px={{ base: 0, md: 4, lg: 6 }} mt="-24px" pb={{ base: 0, md: 7 }} position="relative">
        <Box className="nu-dashboard" bg="var(--nu-page)" borderTopRadius="24px" borderBottomRadius={{ base: 0, md: '24px' }} overflow="hidden">
          <NuSection title={t('goals.section.active')} subtitle={t('goals.section.activeCaption')}>
            {normalGoals.length > 0 ? (
              <Box borderTop="1px solid var(--pb-hair)" borderBottom="1px solid var(--pb-hair)">
                {normalGoals.map((goal) => (
                  <SavingsGoalRow
                    key={goal.id}
                    goal={goal}
                    contribution={contributions[goal.id] ?? 0}
                    onContributionChange={(value) => setContributions((current) => ({ ...current, [goal.id]: value }))}
                    onContribute={() => contribute(goal)}
                    onArchive={() => archive(goal)}
                  />
                ))}
              </Box>
            ) : (
              <Box py={5} borderTop="1px solid var(--pb-hair)">
                <Text fontSize="sm" color="var(--pb-ink-soft)">{t('goals.empty.description')}</Text>
              </Box>
            )}
          </NuSection>

          <NuSection title={t('goals.challenge.sectionTitle')} subtitle={t('goals.challenge.description', {
            first: formatCurrency(0.01),
            second: formatCurrency(0.02),
            total: formatCurrency(challengeYearTotal(new Date().getFullYear())),
          })} action={challengeGoals.length === 0 ? (
            <Button
              size="sm"
              borderRadius="full"
              bg="var(--nu-brand-tint, #f3e8fc)"
              color="var(--nu-brand, #820ad1)"
              leftIcon={<Sparkles size={15} weight="duotone" />}
              onClick={() => setConfirmStartOpen(true)}
              _hover={{ bg: '#ead6fa' }}
            >
              {t('goals.challenge.start')}
            </Button>
          ) : (
            <Button
              size="xs"
              variant="ghost"
              borderRadius="full"
              color="var(--nu-brand, #820ad1)"
              rightIcon={<Icon as={challengeCollapsed ? ChevronDown : ChevronUp} boxSize={4} />}
              onClick={toggleChallengeCollapsed}
            >
              {challengeCollapsed ? t('goals.challenge.expand') : t('goals.challenge.collapse')}
            </Button>
          )}>
            {challengeGoals.length === 0 ? (
              <Box py={4} borderTop="1px solid var(--pb-hair)">
                <Text fontSize="sm" color="var(--pb-ink-soft)">{t('goals.empty.challenge')}</Text>
              </Box>
            ) : challengeCollapsed ? (
              <VStack align="stretch" spacing={0}>
                {challengeGoals.map((goal) => (
                  <PennyChallengeSummaryRow key={goal.id} goal={goal} onExpand={toggleChallengeCollapsed} />
                ))}
              </VStack>
            ) : (
              <VStack align="stretch" spacing={3}>
                {challengeGoals.map((goal) => (
                  <PennyChallengeCard
                    key={goal.id}
                    goal={goal}
                    busy={challengeBusyId === goal.id}
                    onContribute={applyChallengeContribution}
                    onArchive={archive}
                  />
                ))}
              </VStack>
            )}
          </NuSection>

          <NuSection title={t('goals.section.monthly')} subtitle={t('goals.section.monthlyCaption')}>
            {balanceLoading ? (
              <HStack justify="center" py={10}>
                <Spinner color="var(--nu-brand, #820ad1)" thickness="3px" speed="0.8s" />
              </HStack>
            ) : (
              <BalanceBreakEvenPanel
                currentBalance={periodData.balance}
                selectedDate={currentMonth}
                periodType="month"
                transactions={periodData.transactions}
              />
            )}
          </NuSection>
        </Box>
      </Box>

      <StartChallengeDialog
        isOpen={confirmStartOpen}
        onClose={() => setConfirmStartOpen(false)}
        onConfirm={startChallenge}
        isLoading={startingChallenge}
      />
    </Box>
  )
}

function SavingsGoalRow({
  goal,
  contribution,
  onContributionChange,
  onContribute,
  onArchive,
}: {
  goal: SavingsGoal
  contribution: number
  onContributionChange: (value: number) => void
  onContribute: () => void
  onArchive: () => void
}) {
  const { t, formatCurrency, formatDate } = useI18n()
  const completed = goal.progressPercentage >= 100

  return (
    <Box py={4} borderBottom="1px solid var(--pb-hair)" _last={{ borderBottom: 0 }}>
      <Flex align="flex-start" gap={3}>
        <Box mt="7px" w="8px" h="8px" flexShrink={0} borderRadius="full" bg={completed ? 'var(--pb-income)' : goal.color || 'var(--nu-brand, #820ad1)'} />
        <Box minW={0} flex={1}>
          <Flex justify="space-between" align="flex-start" gap={3}>
            <Box minW={0}>
              <Text fontSize="15px" fontWeight={650} color="var(--pb-ink)" noOfLines={1}>{goal.name}</Text>
              <Text mt="2px" fontSize="11px" color="var(--pb-ink-soft)">
                {t('goals.remaining', { amount: formatCurrency(goal.remainingAmount) })}
                {goal.targetDate ? ` · ${t('goals.targetDate', { date: formatDate(goal.targetDate) })}` : ''}
              </Text>
            </Box>
            <HStack spacing={1.5} flexShrink={0}>
              <Text fontSize="13px" fontWeight={700} color={completed ? 'var(--pb-income)' : 'var(--nu-brand, #820ad1)'}>{goal.progressPercentage.toFixed(0)}%</Text>
              <IconButton
                aria-label={t('goals.archive')}
                icon={<Icon as={Trash2} boxSize={3.5} />}
                size="xs"
                variant="ghost"
                borderRadius="full"
                color="var(--pb-ink-faint)"
                onClick={onArchive}
                _hover={{ bg: 'var(--pb-tint-coral)', color: 'var(--pb-coral)' }}
              />
            </HStack>
          </Flex>

          <Progress mt={3} value={Math.min(100, goal.progressPercentage)} colorScheme={completed ? 'green' : 'purple'} borderRadius="full" size="xs" bg="var(--pb-surface-3)" />

          <Flex mt={2.5} justify="space-between" gap={4}>
            <Text fontSize="11px" color="var(--pb-ink-soft)">
              {t('goals.saved')} <Text as="span" fontWeight={650} color="var(--pb-ink)">{formatCurrency(goal.currentAmount)}</Text>
            </Text>
            <Text fontSize="11px" color="var(--pb-ink-soft)" textAlign="right">
              {t('goals.target')} <Text as="span" fontWeight={650} color="var(--pb-ink)">{formatCurrency(goal.targetAmount)}</Text>
            </Text>
          </Flex>

          <HStack mt={3} spacing={2}>
            <NumberInput
              flex={1}
              maxW={{ base: 'none', md: '220px' }}
              precision={2}
              value={contribution}
              onChange={(_, value) => onContributionChange(value || 0)}
            >
              <NumberInputField h="38px" borderRadius="12px" borderColor="var(--pb-hair)" placeholder={t('goals.contributionPlaceholder')} _focusVisible={{ borderColor: 'var(--nu-brand, #820ad1)', boxShadow: '0 0 0 1px var(--nu-brand, #820ad1)' }} />
            </NumberInput>
            <Button h="38px" px={4} borderRadius="full" bg="var(--nu-brand, #820ad1)" color="white" isDisabled={contribution === 0} onClick={onContribute} _hover={{ bg: '#6f00b8' }}>
              {t('goals.apply')}
            </Button>
          </HStack>
        </Box>
      </Flex>
    </Box>
  )
}
