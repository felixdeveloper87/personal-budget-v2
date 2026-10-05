import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Box,
  Flex,
  HStack,
  Icon,
  SimpleGrid,
  Spinner,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import { Target } from 'lucide-react'

import {
  archiveSavingsGoal,
  contributeToSavingsGoal,
  createSavingsGoal,
  listSavingsGoals,
  updateSavingsGoal,
} from '../../api'
import type { SavingsGoal, SavingsGoalRequest } from '../../types'
import { ToastService } from '../../services/toast'
import { useI18n } from '../../i18n'
import { useDashboardData } from '../../hooks/useDashboardData'
import { usePeriodData } from '../../hooks/usePeriodData'
import BalanceBreakEvenPanel from '../../components/charts/modal/BalanceBreakEvenPanel'
import { Plus } from '../../components/ui/icons'
import GoalCard from './components/GoalCard'
import { ContributeModal, GoalFormModal } from './components/GoalModals'
import NuHero, { NuHeroBadge } from '../dashboard/components/NuHero'
import { NuSection, NU_SHEET_PB, NU_SHEET_WRAP } from '../dashboard/components/nu'
import '../dashboard/theme/pb-tokens.css'

export default function GoalsPage() {
  const { t, formatCurrency } = useI18n()
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const form = useDisclosure()
  const [editing, setEditing] = useState<SavingsGoal | null>(null)
  const [contributing, setContributing] = useState<SavingsGoal | null>(null)

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

  const contribute = async (amount: number) => {
    if (!contributing || amount === 0) return
    const goal = contributing
    try {
      await contributeToSavingsGoal(goal.id, amount)
      setContributing(null)
      await load()
      ToastService.success({ title: amount > 0 ? t('goals.toast.contributionAdded') : t('goals.toast.withdrawalRecorded'), dedupeKey: `goal-contribution:${goal.id}` })
    } catch (err) {
      ToastService.apiError(err, { title: t('goals.toast.updateFailed'), dedupeKey: `goal-contribution-failed:${goal.id}` })
    }
  }

  const openForm = (goal: SavingsGoal | null) => {
    setEditing(goal)
    form.onOpen()
  }

  const submitForm = async (request: SavingsGoalRequest) => {
    try {
      if (editing) await updateSavingsGoal(editing.id, request)
      else await createSavingsGoal(request)
      form.onClose()
      await load()
      ToastService.success({ title: t(editing ? 'goals.toast.updated' : 'goals.toast.created'), dedupeKey: 'goal-saved' })
    } catch (err) {
      ToastService.apiError(err, { title: t('goals.toast.saveFailed'), dedupeKey: 'goal-save-failed' })
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
  const openGoals = useMemo(() => activeGoals.filter((goal) => goal.progressPercentage < 100), [activeGoals])
  const doneGoals = useMemo(() => activeGoals.filter((goal) => goal.progressPercentage >= 100), [activeGoals])

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

  return (
    <Box>
      <NuHero
        title={t('nav.goals.label')}
        action={
          <HStack spacing={2}>
            <Box
              as="button" type="button" onClick={() => openForm(null)}
              display="inline-flex" alignItems="center" gap={1.5} h="36px" px={4} borderRadius="full"
              bg="white" color="var(--nu-brand)" fontSize="14px" fontWeight={650}
              _hover={{ bg: 'rgba(255,255,255,.9)' }}
            >
              <Icon as={Plus} boxSize={4} />{t('goals.new')}
            </Box>
            <NuHeroBadge><Target size={18} strokeWidth={2.4} aria-hidden="true" /></NuHeroBadge>
          </HStack>
        }
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

      <Box {...NU_SHEET_WRAP}>
        <Box className="nu-dashboard" pb={NU_SHEET_PB} bg="var(--nu-page)" borderTopRadius="24px" borderBottomRadius={{ base: 0, md: '24px' }} overflow="hidden">
          <NuSection title={t('goals.section.active')} subtitle={t('goals.section.activeCaption')}>
            {openGoals.length > 0 ? (
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {openGoals.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} onSave={() => setContributing(goal)} onEdit={() => openForm(goal)} onArchive={() => archive(goal)} />
                ))}
              </SimpleGrid>
            ) : doneGoals.length === 0 ? (
              <Flex direction="column" align="center" gap={3} py={8} borderRadius="20px" bg="var(--nu-surface)">
                <Icon as={Target} boxSize={8} color="var(--nu-brand)" />
                <Text fontWeight={700} color="var(--pb-ink)">{t('goals.empty.title')}</Text>
                <Text fontSize="sm" color="var(--pb-ink-soft)">{t('goals.empty.description')}</Text>
                <Box as="button" type="button" onClick={() => openForm(null)} h="40px" px={5} borderRadius="full" bg="var(--nu-brand)" color="white" fontWeight={600} _hover={{ bg: 'var(--nu-brand-deep)' }}>
                  {t('goals.empty.cta')}
                </Box>
              </Flex>
            ) : null}
          </NuSection>

          {doneGoals.length > 0 && (
            <NuSection title={t('goals.completed')} subtitle={t('goals.completedCaption')}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {doneGoals.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} onSave={() => setContributing(goal)} onEdit={() => openForm(goal)} onArchive={() => archive(goal)} />
                ))}
              </SimpleGrid>
            </NuSection>
          )}

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

      <GoalFormModal isOpen={form.isOpen} goal={editing} onClose={form.onClose} onSubmit={submitForm} />
      <ContributeModal goal={contributing} onClose={() => setContributing(null)} onSubmit={contribute} />
    </Box>
  )
}
