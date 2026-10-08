import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Box, Flex, HStack, IconButton, SimpleGrid, Spinner, Text, VStack, useDisclosure } from '@chakra-ui/react'
import {
  BriefcaseIcon,
  CurrencyGbpIcon,
  PauseIcon,
  PencilSimpleIcon,
  PlayIcon,
  PlusIcon,
  StopIcon,
  TrashIcon,
} from '@phosphor-icons/react'
import {
  createWorkSession,
  deleteWorkSession,
  endWorkSession,
  getActiveWorkSession,
  getBusinessSummary,
  pauseWorkSession,
  resumeWorkSession,
  startWorkSession,
  updateWorkSession,
} from '../../api'
import type { BusinessSummary, ManualWorkSessionRequest, WorkSession } from '../../types'
import { ToastService } from '../../services/toast'
import { useI18n } from '../../i18n'
import { ConfirmDeleteDialog } from '../../components/ui'
import AddTransactionModal from '../../components/transactions/AddTransactionModal'
import NuHero, { NuHeroBadge, NuHeroGlow, NuHeroShortcut } from '../dashboard/components/NuHero'
import { NuSection, NU_SHEET_PB, NU_SHEET_WRAP } from '../dashboard/components/nu'
import '../dashboard/theme/pb-tokens.css'
import WorkSessionModal, { type WorkSessionDraft } from './WorkSessionModal'
import {
  dateFromKey,
  formatClock,
  formatDuration,
  liveWorkedSeconds,
  localDateKey,
  monthRange,
  weekRange,
} from './businessTime'

type Period = 'week' | 'month'

export default function BusinessPage() {
  const { t, formatCurrency, formatDate, categoryLabel } = useI18n()
  const [period, setPeriod] = useState<Period>('week')
  const [active, setActive] = useState<WorkSession | null>(null)
  const [summary, setSummary] = useState<BusinessSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const fetchedAt = useRef(Date.now())
  const [draft, setDraft] = useState<WorkSessionDraft | null>(null)
  /** Sessions being edited as one period (a day's finished sessions). Empty when adding. */
  const [editingIds, setEditingIds] = useState<number[]>([])
  const [deletingDay, setDeletingDay] = useState<string | null>(null)
  const sessionForm = useDisclosure()
  const earningsForm = useDisclosure()

  const range = useMemo(() => (period === 'week' ? weekRange(new Date()) : monthRange(new Date())), [period])
  const todayKey = localDateKey(new Date(now))

  const load = useCallback(async () => {
    try {
      const [nextActive, nextSummary] = await Promise.all([
        getActiveWorkSession(),
        getBusinessSummary(range.from, range.to),
      ])
      fetchedAt.current = Date.now()
      setActive(nextActive)
      setSummary(nextSummary)
    } catch (error) {
      ToastService.apiError(error, { title: t('business.toast.loadFailed'), dedupeKey: 'business-load-failed' })
    } finally {
      setLoading(false)
    }
  }, [range.from, range.to, t])

  useEffect(() => { void load() }, [load])

  // Tick every second while the timer runs.
  useEffect(() => {
    if (active?.status !== 'RUNNING') return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [active?.status])

  const run = async (action: () => Promise<WorkSession>, toast: (session: WorkSession) => string) => {
    setBusy(true)
    try {
      const session = await action()
      ToastService.success({ title: toast(session) })
      await load()
    } catch (error) {
      ToastService.apiError(error, { title: t('business.toast.failed') })
    } finally {
      setBusy(false)
    }
  }

  const start = () => run(() => startWorkSession(localDateKey(new Date())), () => t('business.toast.started'))
  const pause = () => active && run(() => pauseWorkSession(active.id), () => t('business.toast.paused'))
  const resume = () => active && run(() => resumeWorkSession(active.id), () => t('business.toast.resumed'))
  const end = () => active && run(
    () => endWorkSession(active.id),
    (session) => t('business.toast.ended', { duration: formatDuration(session.workedSeconds) }),
  )

  /** Finished sessions per day; the running one is managed by the timer, not here. */
  const endedByDay = useMemo(() => {
    const map = new Map<string, WorkSession[]>()
    for (const session of summary?.sessions ?? []) {
      if (session.status !== 'ENDED') continue
      map.set(session.workDate, [...(map.get(session.workDate) ?? []), session])
    }
    return map
  }, [summary])

  const openAdd = (workDate?: string) => {
    setDraft(workDate ? { workDate } : null)
    setEditingIds([])
    sessionForm.onOpen()
  }

  /**
   * A day is edited as one period: earliest start, latest end, and the gaps as
   * break. A day without hours yet opens the same form, ready to add them.
   */
  const openEditDay = (workDate: string) => {
    const sessions = endedByDay.get(workDate) ?? []
    if (sessions.length === 0) {
      openAdd(workDate)
      return
    }
    const startMs = Math.min(...sessions.map((s) => new Date(s.startedAt).getTime()))
    const endMs = Math.max(...sessions.map((s) => new Date(s.endedAt ?? s.startedAt).getTime()))
    const worked = sessions.reduce((sum, s) => sum + s.workedSeconds, 0)
    setDraft({
      workDate,
      startedAt: new Date(startMs).toISOString(),
      endedAt: new Date(endMs).toISOString(),
      breakSeconds: Math.max(0, (endMs - startMs) / 1000 - worked),
      note: sessions.find((s) => s.note)?.note ?? null,
    })
    setEditingIds(sessions.map((s) => s.id))
    sessionForm.onOpen()
  }

  const closeForm = () => {
    sessionForm.onClose()
    setDraft(null)
    setEditingIds([])
  }

  const saveSession = async (request: ManualWorkSessionRequest) => {
    try {
      if (editingIds.length > 0) {
        const [first, ...rest] = editingIds
        await updateWorkSession(first, request)
        await Promise.all(rest.map((id) => deleteWorkSession(id)))
      } else {
        await createWorkSession(request)
      }
      ToastService.success({ title: t('business.toast.saved') })
      closeForm()
      await load()
    } catch (error) {
      ToastService.apiError(error, { title: t('business.toast.failed') })
    }
  }

  const confirmDeleteDay = async () => {
    if (!deletingDay) return
    try {
      await Promise.all((endedByDay.get(deletingDay) ?? []).map((session) => deleteWorkSession(session.id)))
      ToastService.success({ title: t('business.toast.deleted') })
      setDeletingDay(null)
      await load()
    } catch (error) {
      ToastService.apiError(error, { title: t('business.toast.failed') })
    }
  }

  const elapsed = active ? liveWorkedSeconds(active, fetchedAt.current, now) : 0
  // The open session's live seconds replace its snapshot in today's total.
  const liveExtra = active?.status === 'RUNNING' && active.workDate === todayKey ? elapsed - active.workedSeconds : 0
  const today = summary?.days.find((day) => day.date === todayKey)
  const todaySeconds = (today?.workedSeconds ?? 0) + liveExtra
  const todayEarned = today?.earned ?? 0
  const todayCost = today?.cost ?? 0
  const todayProfit = todayEarned - todayCost
  // Live: today's hours keep growing while the timer runs.
  const todayProfitRate = todayEarned > 0 && todaySeconds > 0 ? todayProfit / (todaySeconds / 3600) : null

  const time = (iso: string) => formatDate(new Date(iso), { hour: '2-digit', minute: '2-digit' })
  const statusLine = !active
    ? t('business.status.idle')
    : active.status === 'PAUSED'
      ? t('business.status.paused', { time: time(active.pausedAt ?? active.startedAt) })
      : t('business.status.running', { time: time(active.startedAt) })

  const rate = (value: number | null) => (value == null ? '—' : formatCurrency(value))

  return (
    <Box>
      <NuHero
        compact
        decoration={<NuHeroGlow />}
        title={t('nav.business.label')}
        action={<NuHeroBadge><BriefcaseIcon size={18} weight="bold" aria-hidden="true" /></NuHeroBadge>}
      >
        <Box mt={{ base: 3, md: 4 }}>
          <Text fontSize="sm" color="rgba(255,255,255,.78)">{statusLine}</Text>
          <Text
            mt={0.5}
            fontSize={{ base: '2.6rem', md: '3.2rem' }}
            fontWeight={800}
            letterSpacing="-0.03em"
            lineHeight={1}
            color="white"
            opacity={active?.status === 'PAUSED' ? 0.7 : 1}
            style={{ fontVariantNumeric: 'tabular-nums' }}
            aria-live="off"
          >
            {formatClock(elapsed)}
          </Text>
        </Box>

        {/* Nubank-style shortcuts */}
        <HStack mt={{ base: 5, md: 6 }} spacing={{ base: 2, md: 3 }} align="flex-start">
          {!active && (
            <NuHeroShortcut primary label={t('business.start')} onClick={start} disabled={busy || loading}
              icon={<PlayIcon size={20} weight="fill" aria-hidden="true" />} />
          )}
          {active?.status === 'RUNNING' && (
            <NuHeroShortcut primary label={t('business.pause')} onClick={pause} disabled={busy}
              icon={<PauseIcon size={20} weight="fill" aria-hidden="true" />} />
          )}
          {active?.status === 'PAUSED' && (
            <NuHeroShortcut primary label={t('business.resume')} onClick={resume} disabled={busy}
              icon={<PlayIcon size={20} weight="fill" aria-hidden="true" />} />
          )}
          {active && (
            <NuHeroShortcut label={t('business.end')} onClick={end} disabled={busy}
              icon={<StopIcon size={20} weight="fill" aria-hidden="true" />} />
          )}
          <NuHeroShortcut label={t('business.shortcut.manual')} onClick={() => openAdd()}
            icon={<PlusIcon size={20} weight="bold" aria-hidden="true" />} />
          <NuHeroShortcut label={t('business.shortcut.earnings')} onClick={earningsForm.onOpen}
            icon={<CurrencyGbpIcon size={20} weight="bold" aria-hidden="true" />} />
        </HStack>
      </NuHero>

      <Box {...NU_SHEET_WRAP}>
        <Box className="nu-dashboard" pb={NU_SHEET_PB} bg="var(--nu-page)" borderTopRadius="24px" borderBottomRadius={{ base: 0, md: '24px' }} overflow="hidden">
          {loading ? (
            <HStack justify="center" py={16}>
              <Spinner color="var(--nu-brand, #820ad1)" thickness="3px" speed="0.8s" />
            </HStack>
          ) : (
            <>
              <NuSection title={t('business.today')} subtitle={t('business.todayCaption')}>
                <StatRow
                  items={[
                    { label: t('business.statShort.hours'), value: formatDuration(todaySeconds) },
                    { label: t('business.statShort.earned'), value: formatCurrency(todayEarned) },
                    { label: t('business.statShort.profit'), value: formatCurrency(todayProfit) },
                    { label: t('business.statShort.profitPerHour'), value: rate(todayProfitRate), highlight: true },
                  ]}
                />
                {todaySeconds > 0 && todayEarned === 0 && (
                  <Flex mt={4} p={4} gap={3} borderRadius="16px" bg="var(--nu-surface)" align={{ base: 'stretch', sm: 'center' }} direction={{ base: 'column', sm: 'row' }} justify="space-between">
                    <Text fontSize="sm" color="var(--pb-ink-soft)">{t('business.earningsHint')}</Text>
                    <Box
                      as="button" type="button" onClick={earningsForm.onOpen} flexShrink={0}
                      h="40px" px={5} borderRadius="full" bg="var(--nu-brand)" color="white" fontWeight={600} fontSize="sm"
                      _hover={{ bg: 'var(--nu-brand-deep)' }}
                    >
                      {t('business.addEarnings')}
                    </Box>
                  </Flex>
                )}
              </NuSection>

              <NuSection
                title={period === 'week' ? t('business.period.week') : t('business.period.month')}
                subtitle={t('business.periodCaption')}
                action={<PeriodSwitch value={period} onChange={setPeriod} week={t('business.period.week')} month={t('business.period.month')} />}
              >
                {summary && (
                  <StatRow
                    items={[
                      { label: t('business.statShort.hours'), value: formatDuration(summary.totals.workedSeconds + liveExtra) },
                      { label: t('business.statShort.earned'), value: formatCurrency(summary.totals.earned) },
                      { label: t('business.statShort.profit'), value: formatCurrency(summary.totals.profit) },
                      { label: t('business.statShort.profitPerHour'), value: rate(summary.totals.profitRate), highlight: true },
                    ]}
                  />
                )}
                {summary && (
                  <Text mt={2.5} fontSize="xs" lineHeight={1.5} color="var(--pb-ink-soft)">
                    {summary.costBasis.workingDays > 0
                      ? t('business.costLine', {
                        cost: formatCurrency(summary.costBasis.dailyCost),
                        total: formatCurrency(summary.costBasis.monthlySpend + summary.costBasis.monthlyMaintenance),
                        spend: formatCurrency(summary.costBasis.monthlySpend),
                        maintenance: formatCurrency(summary.costBasis.monthlyMaintenance),
                        months: `${formatDate(dateFromKey(summary.costBasis.windowFrom), { month: 'short' })}–${formatDate(dateFromKey(summary.costBasis.windowTo), { month: 'short' })}`,
                        days: summary.costBasis.monthlyWorkingDays,
                      })
                      : t('business.costLineEmpty', { category: categoryLabel(summary.costBasis.category) })}
                  </Text>
                )}
                <VStack
                  mt={4} spacing={0} align="stretch" borderRadius="18px" bg="var(--nu-surface)" overflow="hidden"
                  divider={<Box h="1px" bg="var(--pb-hair)" />}
                >
                  {summary?.days.length ? summary.days.map((day) => (
                    <Flex
                      key={day.date} pl={3} pr={1} py={1.5} align="center" gap={2.5}
                      title={day.cost > 0 ? t('business.day.profit', { amount: formatCurrency(day.profit) }) : undefined}
                    >
                      <Text w={{ base: '78px', md: '96px' }} flexShrink={0} fontSize="sm" fontWeight={700} color="var(--pb-ink)" textTransform="capitalize" noOfLines={1}>
                        {formatDate(dateFromKey(day.date), { weekday: 'short', day: 'numeric' })}
                      </Text>
                      <Text flex={1} minW={0} fontSize="xs" color="var(--pb-ink-soft)" noOfLines={1} style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {formatDuration(day.workedSeconds + (day.date === todayKey ? liveExtra : 0))}
                        {' · '}
                        {formatCurrency(day.earned)}
                      </Text>
                      <Text flexShrink={0} fontSize="sm" fontWeight={800} color={day.profitRate == null ? 'var(--pb-ink-faint)' : day.profitRate < 0 ? 'var(--pb-coral)' : 'var(--nu-brand)'} style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {day.profitRate == null ? '—' : t('business.perHourValue', { amount: formatCurrency(day.profitRate) })}
                      </Text>
                      <HStack spacing={0} flexShrink={0}>
                        {!endedByDay.has(day.date) && (
                          <IconButton
                            aria-label={t('business.day.add')}
                            icon={<PlusIcon size={16} weight="bold" />}
                            size="sm" minW="32px" w="32px" h="32px" variant="ghost" borderRadius="full" color="var(--nu-brand)"
                            onClick={() => openAdd(day.date)}
                          />
                        )}
                        <IconButton
                          aria-label={t('business.day.edit')}
                          icon={<PencilSimpleIcon size={16} />}
                          size="sm" minW="32px" w="32px" h="32px" variant="ghost" borderRadius="full" color="var(--pb-ink-soft)"
                          onClick={() => openEditDay(day.date)}
                        />
                        {endedByDay.has(day.date) && (
                          <IconButton
                            aria-label={t('business.day.delete')}
                            icon={<TrashIcon size={16} />}
                            size="sm" minW="32px" w="32px" h="32px" variant="ghost" borderRadius="full" color="var(--pb-ink-soft)"
                            onClick={() => setDeletingDay(day.date)}
                          />
                        )}
                      </HStack>
                    </Flex>
                  )) : (
                    <Text py={5} textAlign="center" fontSize="sm" color="var(--pb-ink-soft)">{t('business.days.empty')}</Text>
                  )}
                </VStack>
              </NuSection>

            </>
          )}
        </Box>
      </Box>

      <WorkSessionModal
        isOpen={sessionForm.isOpen}
        draft={draft}
        isEdit={editingIds.length > 0}
        onClose={closeForm}
        onSubmit={saveSession}
      />
      <ConfirmDeleteDialog
        isOpen={deletingDay !== null}
        onClose={() => setDeletingDay(null)}
        onConfirm={confirmDeleteDay}
        title={deletingDay
          ? t('business.day.deleteTitle', { date: formatDate(dateFromKey(deletingDay), { weekday: 'short', day: 'numeric', month: 'short' }) })
          : ''}
      />
      <AddTransactionModal
        isOpen={earningsForm.isOpen}
        onClose={earningsForm.onClose}
        type="INCOME"
        transactions={[]}
        onTransactionCreated={() => { earningsForm.onClose(); void load() }}
        onRefresh={() => void load()}
      />
    </Box>
  )
}

/** Four figures side by side in one rounded strip; the highlighted one in purple. */
function StatRow({ items }: { items: Array<{ label: string; value: string; highlight?: boolean }> }) {
  return (
    <SimpleGrid
      columns={items.length} borderRadius="18px" bg="var(--nu-surface)" overflow="hidden"
      sx={{ '& > div + div': { borderLeft: '1px solid var(--pb-hair)' } }}
    >
      {items.map((item) => (
        <Box key={item.label} px={{ base: 2.5, md: 4 }} py={{ base: 2.5, md: 3 }} minW={0}>
          <Text fontSize="11px" fontWeight={600} color="var(--pb-ink-soft)" noOfLines={1}>{item.label}</Text>
          <Text
            mt={0.5}
            fontSize={{ base: 'sm', md: 'lg' }}
            fontWeight={800}
            letterSpacing="-0.02em"
            color={item.highlight ? 'var(--nu-brand)' : 'var(--pb-ink)'}
            noOfLines={1}
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {item.value}
          </Text>
        </Box>
      ))}
    </SimpleGrid>
  )
}

function PeriodSwitch({ value, onChange, week, month }: { value: Period; onChange: (period: Period) => void; week: string; month: string }) {
  return (
    <HStack role="radiogroup" spacing={1} p={1} borderRadius="full" bg="var(--nu-surface)" flexShrink={0}>
      {(['week', 'month'] as const).map((option) => (
        <Box
          key={option}
          as="button"
          type="button"
          role="radio"
          aria-checked={value === option}
          onClick={() => onChange(option)}
          h="32px"
          px={3}
          borderRadius="full"
          fontSize="sm"
          fontWeight={600}
          bg={value === option ? 'var(--nu-brand)' : 'transparent'}
          color={value === option ? 'white' : 'var(--pb-ink-soft)'}
          transition="background .15s ease, color .15s ease"
        >
          {option === 'week' ? week : month}
        </Box>
      ))}
    </HStack>
  )
}
