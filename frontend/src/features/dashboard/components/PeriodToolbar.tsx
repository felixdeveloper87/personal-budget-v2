import { Box, HStack, Text, IconButton, Button, Flex, Wrap, WrapItem } from '@chakra-ui/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { PeriodType } from '../../../types'
import type { TransactionDateBasis } from '../../../utils/transactionDates'
import Segmented from './Segmented'

interface PeriodToolbarProps {
  selectedPeriod: PeriodType
  selectedDate: Date
  formatLabel: () => string
  dateBasis: TransactionDateBasis
  isCurrent: boolean
  onPeriodChange: (p: PeriodType) => void
  onNavigate: (dir: 'prev' | 'next') => void
  onGoToToday: () => void
  onDateBasisChange: (b: TransactionDateBasis) => void
}

const PERIOD_OPTIONS: Array<{ value: PeriodType; label: string }> = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
]

const VIEW_OPTIONS: Array<{ value: TransactionDateBasis; label: string }> = [
  { value: 'activity', label: 'Behaviour' },
  { value: 'cash-flow', label: 'Payments' },
]

export default function PeriodToolbar({
  selectedPeriod,
  formatLabel,
  dateBasis,
  isCurrent,
  onPeriodChange,
  onNavigate,
  onGoToToday,
  onDateBasisChange,
}: PeriodToolbarProps) {
  return (
    <Wrap spacing={3} align="center">
      {/* Range selector */}
      <WrapItem>
        <Segmented
          options={PERIOD_OPTIONS}
          value={selectedPeriod}
          onChange={onPeriodChange}
          aria-label="Select period range"
        />
      </WrapItem>

      {/* Month navigation */}
      <WrapItem>
        <HStack spacing={1}>
          <IconButton
            aria-label="Previous period"
            icon={<ChevronLeft size={15} />}
            variant="ghost"
            size="sm"
            h="32px"
            w="32px"
            minW="32px"
            borderRadius="999px"
            color="var(--pb-ink-soft)"
            border="1px solid var(--pb-hair)"
            bg="var(--pb-surface)"
            _hover={{ bg: 'var(--pb-surface-2)', borderColor: 'var(--pb-hair-2)' }}
            onClick={() => onNavigate('prev')}
          />

          <HStack spacing={1}>
            <Text
              fontFamily="var(--pb-mono)"
              fontSize="12px"
              fontWeight={500}
              letterSpacing="0.1em"
              color="var(--pb-ink)"
              textTransform="uppercase"
              minW="90px"
              textAlign="center"
            >
              {formatLabel()}
            </Text>

            {!isCurrent && (
              <Button
                size="xs"
                h="24px"
                px={2}
                borderRadius="999px"
                fontFamily="var(--pb-mono)"
                fontSize="10px"
                letterSpacing="0.08em"
                textTransform="uppercase"
                bg="var(--pb-tint-green)"
                color="var(--pb-forest)"
                border="1px solid var(--pb-hair)"
                _hover={{ bg: 'rgba(45,106,79,0.16)' }}
                onClick={onGoToToday}
                fontWeight={500}
              >
                Today
              </Button>
            )}
          </HStack>

          <IconButton
            aria-label="Next period"
            icon={<ChevronRight size={15} />}
            variant="ghost"
            size="sm"
            h="32px"
            w="32px"
            minW="32px"
            borderRadius="999px"
            color="var(--pb-ink-soft)"
            border="1px solid var(--pb-hair)"
            bg="var(--pb-surface)"
            _hover={{ bg: 'var(--pb-surface-2)', borderColor: 'var(--pb-hair-2)' }}
            onClick={() => onNavigate('next')}
          />
        </HStack>
      </WrapItem>

      {/* View as */}
      <WrapItem ml={{ base: 0, md: 'auto' }}>
        <HStack spacing={2}>
          <Text
            fontFamily="var(--pb-mono)"
            fontSize="10px"
            letterSpacing="0.2em"
            textTransform="uppercase"
            color="var(--pb-ink-faint)"
          >
            View as
          </Text>
          <Segmented
            options={VIEW_OPTIONS}
            value={dateBasis}
            onChange={onDateBasisChange}
            size="sm"
            aria-label="Select view mode"
          />
        </HStack>
      </WrapItem>
    </Wrap>
  )
}
