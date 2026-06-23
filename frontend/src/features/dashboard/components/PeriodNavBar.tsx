import { Box, Flex, HStack, IconButton, Text } from '@chakra-ui/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { PeriodType } from '../../../types'
import Segmented from './Segmented'

interface PeriodNavBarProps {
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

const navBtnSx = {
  variant: 'ghost' as const,
  color: 'var(--pb-ink-soft)',
  border: '1px solid var(--pb-hair)',
  bg: 'var(--pb-surface)',
  borderRadius: '999px',
  _hover: { bg: 'var(--pb-surface-2)', borderColor: 'var(--pb-hair-2)' },
}

/**
 * Period range selector (day / week / month / year) + prev/next navigation,
 * shared by the Behaviour and Payments pages. No "view as" lens toggle — each
 * page is locked to a single lens.
 */
export default function PeriodNavBar({
  selectedPeriod,
  label,
  isCurrent,
  onPeriodChange,
  onNavigate,
  onGoToToday,
}: PeriodNavBarProps) {
  const navSize = { base: '30px', sm: '32px' }

  return (
    <Flex wrap="wrap" align="center" gap=".7rem" mb="clamp(1.2rem,2.6vw,1.7rem)">
      <Segmented
        options={PERIOD_OPTIONS}
        value={selectedPeriod}
        onChange={onPeriodChange}
        aria-label="Select period range"
      />

      <HStack spacing={1}>
        <IconButton
          aria-label="Previous period"
          icon={<ChevronLeft size={15} />}
          size="sm"
          h={navSize}
          w={navSize}
          minW={navSize}
          onClick={() => onNavigate('prev')}
          {...navBtnSx}
        />

        <HStack spacing={1.5} px={1}>
          <Text
            fontFamily="var(--pb-mono)"
            fontSize={{ base: '11px', sm: '12px' }}
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
              color="var(--pb-forest)"
              border="1px solid var(--pb-hair)"
              fontFamily="var(--pb-mono)"
              fontSize="9.5px"
              letterSpacing="0.1em"
              textTransform="uppercase"
              fontWeight={500}
              whiteSpace="nowrap"
            >
              Now
            </Box>
          ) : (
            <Box
              as="button"
              type="button"
              px={2}
              py="2px"
              borderRadius="999px"
              bg="transparent"
              color="var(--pb-ink-faint)"
              border="1px solid var(--pb-hair)"
              fontFamily="var(--pb-mono)"
              fontSize="9.5px"
              letterSpacing="0.1em"
              textTransform="uppercase"
              fontWeight={500}
              whiteSpace="nowrap"
              cursor="pointer"
              _hover={{ bg: 'var(--pb-surface)', color: 'var(--pb-ink)' }}
              onClick={onGoToToday}
            >
              Today
            </Box>
          )}
        </HStack>

        <IconButton
          aria-label="Next period"
          icon={<ChevronRight size={15} />}
          size="sm"
          h={navSize}
          w={navSize}
          minW={navSize}
          onClick={() => onNavigate('next')}
          {...navBtnSx}
        />
      </HStack>
    </Flex>
  )
}
