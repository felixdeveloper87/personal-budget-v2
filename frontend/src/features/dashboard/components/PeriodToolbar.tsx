import { Box, HStack, Text, IconButton, Flex } from '@chakra-ui/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PeriodToolbarProps {
  formatLabel: () => string
  isCurrent: boolean
  onNavigate: (dir: 'prev' | 'next') => void
  onGoToToday: () => void
}

const navBtnSx = {
  variant: 'ghost' as const,
  color: 'var(--pb-ink-soft)',
  border: '1px solid var(--pb-hair)',
  bg: 'var(--pb-surface)',
  borderRadius: '999px',
  _hover: { bg: 'var(--pb-surface-2)', borderColor: 'var(--pb-hair-2)' },
}

/**
 * The Home overview is anchored to the month — it only steps between months
 * (no day/week/year range, no Behaviour/Payments lens toggle). Those live on the
 * dedicated Behaviour and Payments pages.
 */
export default function PeriodToolbar({
  formatLabel,
  isCurrent,
  onNavigate,
  onGoToToday,
}: PeriodToolbarProps) {
  return (
    <Flex wrap="wrap" align="center" gap=".7rem">
      <HStack spacing={1}>
        <IconButton
          aria-label="Previous month"
          icon={<ChevronLeft size={15} />}
          size="sm"
          h="32px"
          w="32px"
          minW="32px"
          onClick={() => onNavigate('prev')}
          {...navBtnSx}
        />

        <HStack spacing={1.5} px={1}>
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
              This month
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
          aria-label="Next month"
          icon={<ChevronRight size={15} />}
          size="sm"
          h="32px"
          w="32px"
          minW="32px"
          onClick={() => onNavigate('next')}
          {...navBtnSx}
        />
      </HStack>
    </Flex>
  )
}
