import { useEffect, useMemo, useState } from 'react'
import { Box, Button, FormControl, FormLabel, HStack, Input, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import { PremiumModal } from '../../components/ui'
import { useI18n } from '../../i18n'
import type { ManualWorkSessionRequest } from '../../types'
import { combineLocal, formatDuration, localDateKey, localTimeKey } from './businessTime'

/** What the form opens with: just a day (adding) or a whole period (editing). */
export interface WorkSessionDraft {
  workDate: string
  startedAt?: string
  endedAt?: string
  breakSeconds?: number
  note?: string | null
}

interface WorkSessionModalProps {
  isOpen: boolean
  /** Null opens a blank form for today. */
  draft: WorkSessionDraft | null
  isEdit: boolean
  onClose: () => void
  onSubmit: (request: ManualWorkSessionRequest) => Promise<void>
}

const fieldProps = {
  h: '48px',
  borderRadius: '14px',
  bg: 'var(--nu-surface)',
  border: '1px solid transparent',
  _focus: { borderColor: 'var(--nu-brand)', boxShadow: 'none', bg: 'var(--nu-page)' },
} as const

/** Add or fix a session by hand, for when the Start / End buttons were forgotten. */
export default function WorkSessionModal({ isOpen, draft, isEdit, onClose, onSubmit }: WorkSessionModalProps) {
  const { t } = useI18n()
  const [date, setDate] = useState('')
  const [start, setStart] = useState('09:00')
  const [end, setEnd] = useState('17:00')
  const [breakMinutes, setBreakMinutes] = useState('0')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setDate(draft?.workDate ?? localDateKey(new Date()))
    setStart(draft?.startedAt ? localTimeKey(new Date(draft.startedAt)) : '09:00')
    setEnd(draft?.endedAt ? localTimeKey(new Date(draft.endedAt)) : '17:00')
    setBreakMinutes(String(Math.round((draft?.breakSeconds ?? 0) / 60)))
    setNote(draft?.note ?? '')
  }, [isOpen, draft])

  // An end earlier than the start means the session ran past midnight.
  const overnight = end <= start
  const breakValue = Math.max(0, Number(breakMinutes) || 0)
  const spanSeconds = useMemo(() => {
    if (!date || !start || !end) return 0
    return (combineLocal(date, end, overnight ? 1 : 0).getTime() - combineLocal(date, start).getTime()) / 1000
  }, [date, start, end, overnight])
  const workedSeconds = spanSeconds - breakValue * 60
  const invalidBreak = spanSeconds > 0 && workedSeconds <= 0
  const canSave = Boolean(date && start && end) && spanSeconds > 0 && !invalidBreak && !saving

  const submit = async () => {
    if (!canSave) return
    setSaving(true)
    try {
      await onSubmit({
        workDate: date,
        startedAt: combineLocal(date, start).toISOString(),
        endedAt: combineLocal(date, end, overnight ? 1 : 0).toISOString(),
        breakMinutes: breakValue,
        note: note.trim() || null,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'xl', md: 'lg' }}
      contentProps={{ className: 'nu-dashboard', bg: 'var(--nu-page)' }}
    >
      <Box as="form" px={{ base: 5, md: 6 }} pt={{ base: 7, md: 6 }} pb={5} onSubmit={(event: React.FormEvent) => { event.preventDefault(); void submit() }}>
        <Text as="h2" fontSize="xl" fontWeight={650} color="var(--pb-ink)" mb={5}>
          {isEdit ? t('business.form.titleEdit') : t('business.form.titleNew')}
        </Text>
        <VStack spacing={4} align="stretch">
          <FormControl isRequired>
            <FormLabel fontSize="sm" color="var(--pb-ink-soft)">{t('business.form.date')}</FormLabel>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} {...fieldProps} />
          </FormControl>
          <SimpleGrid columns={2} spacing={3}>
            <FormControl isRequired>
              <FormLabel fontSize="sm" color="var(--pb-ink-soft)">{t('business.form.start')}</FormLabel>
              <Input type="time" value={start} onChange={(e) => setStart(e.target.value)} {...fieldProps} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontSize="sm" color="var(--pb-ink-soft)">{t('business.form.end')}</FormLabel>
              <Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} {...fieldProps} />
            </FormControl>
          </SimpleGrid>
          <FormControl isInvalid={invalidBreak}>
            <FormLabel fontSize="sm" color="var(--pb-ink-soft)">{t('business.form.breakMinutes')}</FormLabel>
            <Input type="number" inputMode="numeric" min={0} max={1440} value={breakMinutes} onChange={(e) => setBreakMinutes(e.target.value)} {...fieldProps} />
          </FormControl>
          <FormControl>
            <FormLabel fontSize="sm" color="var(--pb-ink-soft)">{t('business.form.note')}</FormLabel>
            <Input value={note} maxLength={255} placeholder={t('business.form.notePlaceholder')} onChange={(e) => setNote(e.target.value)} {...fieldProps} />
          </FormControl>

          <HStack justify="space-between" fontSize="sm" color={invalidBreak ? 'var(--pb-coral)' : 'var(--pb-ink-soft)'}>
            <Text>
              {invalidBreak
                ? t('business.form.invalidBreak')
                : `${t('business.stat.hours')}: ${formatDuration(Math.max(0, workedSeconds))}`}
            </Text>
            {overnight && !invalidBreak && <Text fontWeight={600}>{t('business.form.overnight')}</Text>}
          </HStack>
        </VStack>

        <HStack mt={6} spacing={3}>
          <Button flex={1} h="48px" borderRadius="full" variant="ghost" onClick={onClose}>
            {t('business.form.cancel')}
          </Button>
          <Button
            type="submit"
            flex={1}
            h="48px"
            borderRadius="full"
            bg="var(--nu-brand)"
            color="white"
            _hover={{ bg: 'var(--nu-brand-deep)' }}
            isDisabled={!canSave}
            isLoading={saving}
          >
            {t('business.form.save')}
          </Button>
        </HStack>
      </Box>
    </PremiumModal>
  )
}
