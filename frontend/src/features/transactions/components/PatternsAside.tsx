import { Box, HStack, Icon, Text, VStack } from '@chakra-ui/react'
import { Sparkles, TrendingUp, Search } from '../../../components/ui/icons'
import type {
  HabitInsight,
  MomentumInsight,
  RhythmInsight,
  TxState,
} from '../transactions.types'
import { fmtCurrency } from '../../dashboard/components/format'
import { weekdayName } from '../transactions.utils'
import PatternCard from './PatternCard'

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
          Behavioral patterns
        </Text>
      </HStack>

      <VStack align="stretch" spacing=".7rem">
        {rhythm && (
          <PatternCard
            icon={TrendingUp}
            tileBg="var(--pb-tint-green)"
            tileColor="var(--pb-forest-2)"
            tag="Spending rhythm"
            title={`Most money leaves on ${weekdayName(rhythm.weekday)}`}
            value={`${fmtCurrency(rhythm.total)} across ${rhythm.count} expense${rhythm.count === 1 ? '' : 's'}`}
            hint="↑ Tap to highlight on the pulse"
            active={state.hlRhythm}
            onToggle={onToggleRhythm}
          />
        )}

        {habit && (
          <PatternCard
            icon={Search}
            tileBg="var(--pb-tint-gold)"
            tileColor="var(--pb-gold)"
            tag="Repeated habit"
            title={`${habit.category} appears ${habit.count} time${habit.count === 1 ? '' : 's'}`}
            value={`${fmtCurrency(habit.total)} total in this category`}
            hint="🔍 Tap to filter the ledger"
            active={state.habitActive}
            onToggle={() => onToggleHabit(habit.category)}
          />
        )}

        {momentum && (
          <PatternCard
            icon={TrendingUp}
            tileBg="var(--pb-tint-coral)"
            tileColor="var(--pb-coral)"
            tag="Momentum"
            title={`${momentum.category} accelerated`}
            value={`${fmtCurrency(momentum.diff)} more in the second half of the period`}
            hint="↑ Tap to mark the second half"
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
              Patterns appear once there are a few expenses in this period.
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  )
}
