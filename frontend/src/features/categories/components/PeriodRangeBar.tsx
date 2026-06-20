import { Box, Button, HStack, IconButton, Text, Wrap, WrapItem } from '@chakra-ui/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { PeriodType } from '../../../types'
import Segmented from '../../dashboard/components/Segmented'

interface PeriodRangeBarProps {
  selectedPeriod: PeriodType
  label: string
  isCurrent: boolean
  onPeriodChange: (p: PeriodType) => void
  onNavigate: (dir: 'prev' | 'next') => void
  onGoToToday: () => void
}

const PERIOD_OPTIONS: Array<{ value: PeriodType; label: string }> = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
]

const navBtn = {
  variant: 'ghost' as const,
  size: 'sm' as const,
  h: '32px',
  w: '32px',
  minW: '32px',
  borderRadius: '999px',
  color: 'var(--pb-ink-soft)',
  border: '1px solid var(--pb-hair)',
  bg: 'var(--pb-surface)',
  _hover: { bg: 'var(--pb-surface-2)', borderColor: 'var(--pb-hair-2)' },
}

/** Range selector (Day/Week/Month/Year) + month navigation. */
export default function PeriodRangeBar({
  selectedPeriod,
  label,
  isCurrent,
  onPeriodChange,
  onNavigate,
  onGoToToday,
}: PeriodRangeBarProps) {
  return (
    <Wrap spacing={3} align="center">
      <WrapItem>
        <Segmented
          options={PERIOD_OPTIONS}
          value={selectedPeriod}
          onChange={onPeriodChange}
          aria-label="Select period range"
        />
      </WrapItem>

      <WrapItem>
        <HStack spacing={1}>
          <IconButton
            aria-label="Previous period"
            icon={<ChevronLeft size={15} />}
            onClick={() => onNavigate('prev')}
            {...navBtn}
          />

          <HStack spacing={1.5} px={1}>
            <Text
              fontFamily="var(--pb-mono)"
              fontSize="12px"
              fontWeight={500}
              letterSpacing="0.1em"
              color="var(--pb-ink)"
              textTransform="uppercase"
              textAlign="center"
              whiteSpace="nowrap"
            >
              {label}
            </Text>

            {isCurrent ? (
              <Box
                as="span"
                px={2}
                py="2px"
                borderRadius="999px"
                bg="var(--pb-tint-green)"
                color="var(--pb-forest-2)"
                border="1px solid var(--pb-hair)"
                fontFamily="var(--pb-mono)"
                fontSize="9.5px"
                letterSpacing="0.1em"
                textTransform="uppercase"
                fontWeight={500}
                whiteSpace="nowrap"
              >
                This month
              </Box>
            ) : (
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
                color="var(--pb-forest-2)"
                border="1px solid var(--pb-hair)"
                fontWeight={500}
                _hover={{ bg: 'var(--pb-surface-2)' }}
                onClick={onGoToToday}
              >
                Today
              </Button>
            )}
          </HStack>

          <IconButton
            aria-label="Next period"
            icon={<ChevronRight size={15} />}
            onClick={() => onNavigate('next')}
            {...navBtn}
          />
        </HStack>
      </WrapItem>
    </Wrap>
  )
}
