import { Box, HStack, Icon, Text, VStack } from '@chakra-ui/react'
import { Sparkles, TrendingUp, Search } from '../../../components/ui/icons'
import type {
  HabitInsight,
  MomentumInsight,
  RhythmInsight,
  TxState,
} from '../transactions.types'
import { weekdayName } from '../transactions.utils'
import PatternCard from './PatternCard'
import { useI18n } from '../../../i18n'

interface PatternsAsideProps {
  state: TxState
  rhythm: RhythmInsight | null
  habit: HabitInsight | null
  momentum: MomentumInsight | null
  onToggleRhythm: () => void
  onToggleHabit: (category: string) => void
  onToggleMomentum: () => void
}

export default function PatternsAside({
  state,
  rhythm,
  habit,
  momentum,
  onToggleRhythm,
  onToggleHabit,
  onToggleMomentum,
}: PatternsAsideProps) {
  const { t, locale, formatCurrency, categoryLabel } = useI18n()
  const hasAny = rhythm || habit || momentum

  return (
    <Box
      position={{ base: 'static', lg: 'sticky' }}
      top={{ lg: '90px' }}
      alignSelf="start"
    >
      <HStack spacing=".5rem" mb=".9rem">
        <Icon as={Sparkles} boxSize="16px" color="var(--pb-gold)" />
        <Text
          fontFamily="var(--pb-mono)"
          fontSize="10.5px"
          letterSpacing="0.2em"
          textTransform="uppercase"
          color="var(--pb-ink-faint)"
        >
          {t('transactions.behaviouralPatterns')}
        </Text>
      </HStack>

      <VStack align="stretch" spacing=".7rem">
        {rhythm && (
          <PatternCard
            icon={TrendingUp}
            tileBg="var(--pb-tint-green)"
            tileColor="var(--pb-forest-2)"
            tag={t('transactions.spendingRhythm')}
            title={t('transactions.rhythmTitle', { weekday: weekdayName(rhythm.weekday, locale) })}
            value={t(rhythm.count === 1 ? 'transactions.rhythmValue' : 'transactions.rhythmValuePlural', {
              amount: formatCurrency(rhythm.total),
              count: rhythm.count,
            })}
            hint={t('transactions.rhythmHint')}
            active={state.hlRhythm}
            onToggle={onToggleRhythm}
          />
        )}

        {habit && (
          <PatternCard
            icon={Search}
            tileBg="var(--pb-tint-gold)"
            tileColor="var(--pb-gold)"
            tag={t('transactions.repeatedHabit')}
            title={t(habit.count === 1 ? 'transactions.habitTitle' : 'transactions.habitTitlePlural', {
              category: categoryLabel(habit.category),
              count: habit.count,
            })}
            value={t('transactions.habitValue', { amount: formatCurrency(habit.total) })}
            hint={t('transactions.habitHint')}
            active={state.habitActive}
            onToggle={() => onToggleHabit(habit.category)}
          />
        )}

        {momentum && (
          <PatternCard
            icon={TrendingUp}
            tileBg="var(--pb-tint-coral)"
            tileColor="var(--pb-coral)"
            tag={t('transactions.momentum')}
            title={t('transactions.momentumTitle', { category: categoryLabel(momentum.category) })}
            value={t('transactions.momentumValue', { amount: formatCurrency(momentum.diff) })}
            hint={t('transactions.momentumHint')}
            active={state.hlMomentum}
            onToggle={onToggleMomentum}
          />
        )}

        {!hasAny && (
          <Box
            bg="var(--pb-surface)"
            border="1px solid var(--pb-hair)"
            borderRadius="18px"
            p="1rem"
          >
            <Text fontFamily="var(--pb-serif)" fontStyle="italic" fontSize=".95rem" color="var(--pb-ink-faint)">
              {t('transactions.patternsEmpty')}
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  )
}
