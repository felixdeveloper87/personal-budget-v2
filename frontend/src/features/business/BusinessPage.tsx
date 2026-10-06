import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Box, Flex, HStack, IconButton, SimpleGrid, Spinner, Text, VStack, useDisclosure } from '@chakra-ui/react'
import {
  BriefcaseIcon,
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
import NuHero, { NuHeroBadge } from '../dashboard/components/NuHero'
import { NuSection, NU_SHEET_PB, NU_SHEET_WRAP } from '../dashboard/components/nu'
import '../dashboard/theme/pb-tokens.css'
import WorkSessionModal from './WorkSessionModal'
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

const heroButton = {
  as: 'button',
  type: 'button',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 2,
  h: '48px',
  px: 6,
  borderRadius: 'full',
  fontSize: '15px',
  fontWeight: 650,
  transition: 'transform .12s ease, background .15s ease',
  _active: { transform: 'scale(0.97)' },
  _disabled: { opacity: 0.6, cursor: 'not-allowed' },
} as const

export default function BusinessPage() {
  const { t, formatCurrency, formatDate } = useI18n()
  const [period, setPeriod] = useState<Period>('week')
  const [active, setActive] = useState<WorkSession | null>(null)
  const [summary, setSummary] = useState<BusinessSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const fetchedAt = useRef(Date.now())
  const [editing, setEditing] = useState<WorkSession | null>(null)
  const [deleting, setDeleting] = useState<WorkSession | null>(null)
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

  const saveSession = async (request: ManualWorkSessionRequest) => {
    try {
      if (editing) await updateWorkSession(editing.id, request)
      else await createWorkSession(request)
      ToastService.success({ title: t('business.toast.saved') })
      sessionForm.onClose()
      setEditing(null)
      await load()
    } catch (error) {
      ToastService.apiError(error, { title: t('business.toast.failed') })
    }
  }

  const confirmDelete = async () => {
    if (!deleting) return
    try {
      await deleteWorkSession(deleting.id)
      ToastService.success({ title: t('business.toast.deleted') })
      setDeleting(null)
      await load()
    } catch (error) {
      ToastService.apiError(error, { title: t('business.toast.failed') })
    }
  }

  const openSession = (session: WorkSession | null) => {
    setEditing(session)
    sessionForm.onOpen()
  }

  const elapsed = active ? liveWorkedSeconds(active, fetchedAt.current, now) : 0
  // The open session's live seconds replace its snapshot in today's total.
  const liveExtra = active?.status === 'RUNNING' && active.workDate === todayKey ? elapsed - active.workedSeconds : 0
  const today = summary?.days.find((day) => day.date === todayKey)
  const todaySeconds = (today?.workedSeconds ?? 0) + liveExtra
  const todayEarned = today?.earned ?? 0
  const todayRate = todayEarned > 0 && todaySeconds > 0 ? todayEarned / (todaySeconds / 3600) : null

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
        title={t('nav.business.label')}
        action={<NuHeroBadge><BriefcaseIcon size={18} weight="bold" aria-hidden="true" /></NuHeroBadge>}
      >
        <VStack mt={{ base: 3, md: 4 }} align={{ base: 'stretch', md: 'flex-start' }} spacing={4}>
          <Box>
            <Text fontSize="sm" color="rgba(255,255,255,.78)">{statusLine}</Text>
            <Text
              mt={0.5}
              fontSize={{ base: '2.75rem', md: '3.25rem' }}
              fontWeight={700}
              letterSpacing="-0.02em"
              lineHeight={1.05}
              color="white"
              opacity={active?.status === 'PAUSED' ? 0.7 : 1}
              style={{ fontVariantNumeric: 'tabular-nums' }}
              aria-live="off"
            >
              {formatClock(elapsed)}
            </Text>
          </Box>

          <HStack spacing={3} flexWrap="wrap">
            {!active && (
              <Box {...heroButton} bg="white" color="#820ad1" onClick={start} disabled={busy || loading}>
                <PlayIcon size={18} weight="fill" aria-hidden="true" />{t('business.start')}
              </Box>
            )}
            {active?.status === 'RUNNING' && (
              <Box {...heroButton} bg="white" color="#820ad1" onClick={pause} disabled={busy}>
                <PauseIcon size={18} weight="fill" aria-hidden="true" />{t('business.pause')}
              </Box>
            )}
            {active?.status === 'PAUSED' && (
              <Box {...heroButton} bg="white" color="#820ad1" onClick={resume} disabled={busy}>
                <PlayIcon size={18} weight="fill" aria-hidden="true" />{t('business.resume')}
              </Box>
            )}
            {active && (
              <Box {...heroButton} bg="rgba(255,255,255,.16)" color="white" border="1px solid rgba(255,255,255,.35)" onClick={end} disabled={busy}>
                <StopIcon size={18} weight="fill" aria-hidden="true" />{t('business.end')}
              </Box>
            )}
            <Box {...heroButton} px={4} bg="transparent" color="white" onClick={() => openSession(null)} _hover={{ bg: 'rgba(255,255,255,.12)' }}>
              <PlusIcon size={16} weight="bold" aria-hidden="true" />{t('business.addManually')}
            </Box>
          </HStack>
        </VStack>
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
                    { label: t('business.stat.hours'), value: formatDuration(todaySeconds) },
                    { label: t('business.stat.earned'), value: formatCurrency(todayEarned) },
                    { label: t('business.stat.perHour'), value: rate(todayRate), highlight: true },
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
                      { label: t('business.stat.hours'), value: formatDuration(summary.totals.workedSeconds + liveExtra) },
                      { label: t('business.stat.earned'), value: formatCurrency(summary.totals.earned) },
                      { label: t('business.stat.perHour'), value: rate(summary.totals.hourlyRate), highlight: true },
                    ]}
                  />
                )}
                <VStack mt={5} spacing={0} align="stretch" divider={<Box h="1px" bg="var(--pb-hair)" />}>
                  {summary?.days.length ? summary.days.map((day) => (
                    <Flex key={day.date} py={3} align="center" gap={3}>
                      <Box flex={1} minW={0}>
                        <Text fontWeight={600} color="var(--pb-ink)" textTransform="capitalize">
                          {formatDate(dateFromKey(day.date), { weekday: 'short', day: 'numeric', month: 'short' })}
                        </Text>
                        <Text fontSize="sm" color="var(--pb-ink-soft)">
                          {formatDuration(day.workedSeconds + (day.date === todayKey ? liveExtra : 0))}
                          {' · '}
                          {formatCurrency(day.earned)}
                        </Text>
                      </Box>
                      <Text fontWeight={700} color={day.hourlyRate == null ? 'var(--pb-ink-faint)' : 'var(--nu-brand)'} style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {day.hourlyRate == null ? '—' : t('business.perHourValue', { amount: formatCurrency(day.hourlyRate) })}
                      </Text>
                    </Flex>
                  )) : (
                    <Text py={6} textAlign="center" fontSize="sm" color="var(--pb-ink-soft)">{t('business.days.empty')}</Text>
                  )}
                </VStack>
              </NuSection>

              <NuSection
                title={t('business.sessions')}
                subtitle={t('business.sessionsCaption')}
                action={
                  <IconButton
                    aria-label={t('business.addManually')}
                    icon={<PlusIcon size={18} weight="bold" />}
                    onClick={() => openSession(null)}
                    borderRadius="full"
                    bg="var(--nu-surface)"
                    color="var(--nu-brand)"
                  />
                }
              >
                <VStack spacing={0} align="stretch" divider={<Box h="1px" bg="var(--pb-hair)" />}>
                  {summary?.sessions.length ? summary.sessions.map((session) => (
                    <Flex key={session.id} py={3} align="center" gap={3}>
                      <Box flex={1} minW={0}>
                        <Text fontWeight={600} color="var(--pb-ink)">
                          {formatDate(dateFromKey(session.workDate), { day: 'numeric', month: 'short' })}
                          {' · '}
                          {time(session.startedAt)}
                          {' – '}
                          {session.endedAt ? time(session.endedAt) : t('business.session.running')}
                        </Text>
                        <Text fontSize="sm" color="var(--pb-ink-soft)" noOfLines={1}>
                          {formatDuration(session.id === active?.id ? elapsed : session.workedSeconds)}
                          {session.breakSeconds > 0 && ` · ${t('business.session.break', { duration: formatDuration(session.breakSeconds) })}`}
                          {session.note && ` · ${session.note}`}
                        </Text>
                      </Box>
                      {session.status === 'ENDED' && (
                        <HStack spacing={1}>
                          <IconButton
                            aria-label={t('business.session.edit')}
                            icon={<PencilSimpleIcon size={16} />}
                            size="sm" variant="ghost" borderRadius="full" color="var(--pb-ink-soft)"
                            onClick={() => openSession(session)}
                          />
                          <IconButton
                            aria-label={t('business.session.delete')}
                            icon={<TrashIcon size={16} />}
                            size="sm" variant="ghost" borderRadius="full" color="var(--pb-ink-soft)"
                            onClick={() => setDeleting(session)}
                          />
                        </HStack>
                      )}
                    </Flex>
                  )) : (
                    <Text py={6} textAlign="center" fontSize="sm" color="var(--pb-ink-soft)">{t('business.days.empty')}</Text>
                  )}
                </VStack>
              </NuSection>
            </>
          )}
        </Box>
      </Box>

      <WorkSessionModal
        isOpen={sessionForm.isOpen}
        session={editing}
        onClose={() => { sessionForm.onClose(); setEditing(null) }}
        onSubmit={saveSession}
      />
      <ConfirmDeleteDialog
        isOpen={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title={t('business.session.deleteTitle')}
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

function StatRow({ items }: { items: Array<{ label: string; value: string; highlight?: boolean }> }) {
  return (
    <SimpleGrid columns={3} spacing={3}>
      {items.map((item) => (
        <Box key={item.label} p={{ base: 3, md: 4 }} borderRadius="16px" bg={item.highlight ? 'var(--nu-brand)' : 'var(--nu-surface)'}>
          <Text fontSize="xs" color={item.highlight ? 'rgba(255,255,255,.8)' : 'var(--pb-ink-soft)'} noOfLines={1}>{item.label}</Text>
          <Text
            mt={1}
            fontSize={{ base: 'md', md: 'xl' }}
            fontWeight={700}
            color={item.highlight ? 'white' : 'var(--pb-ink)'}
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
