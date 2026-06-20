import { Box, Flex, Text } from '@chakra-ui/react'
import Segmented from '../../dashboard/components/Segmented'
import type { ViewMode } from '../data/types'

const VIEW_OPTIONS: Array<{ value: ViewMode; label: string }> = [
  { value: 'behaviour', label: 'Behaviour' },
  { value: 'payments', label: 'Payments' },
]

const NOTE: Record<ViewMode, string> = {
  behaviour:
    'Behaviour view — by purchase date. Card purchases and installments count on the day you bought.',
  payments:
    'Payments view — by the day money leaves. Deferred card purchases jump to their settlement date.',
}

interface ViewBarProps {
  view: ViewMode
  onChange: (v: ViewMode) => void
}

/** Behaviour/Payments toggle and contextual explanation. */
export default function ViewBar({ view, onChange }: ViewBarProps) {
  const note = NOTE[view]

  return (
    <Box>
      <Flex
        align={{ base: 'flex-start', lg: 'center' }}
        direction={{ base: 'column', lg: 'row' }}
        gap={{ base: '.5rem', lg: '.75rem' }}
      >
        <Flex align="center" gap="0.7rem" flexShrink={0}>
          <Text as="span" fontStyle="italic" color="var(--pb-forest-2)">
            View as
          </Text>
          <Segmented
            options={VIEW_OPTIONS}
            value={view}
            onChange={onChange}
            aria-label="View mode"
          />
        </Flex>

        <Text
          color="var(--pb-ink-soft)"
          fontSize={{ base: '.82rem', sm: '.86rem' }}
          lineHeight="1.4"
          minW={0}
        >
          {note}
        </Text>
      </Flex>
    </Box>
  )
}
