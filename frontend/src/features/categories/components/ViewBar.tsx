import { Box, Flex, HStack, Icon, Text } from '@chakra-ui/react'
import { AlertCircle } from '../../../components/ui/icons'
import Segmented from '../../dashboard/components/Segmented'
import type { ViewMode } from '../data/types'

const VIEW_OPTIONS: Array<{ value: ViewMode; label: string }> = [
  { value: 'behaviour', label: 'Behaviour' },
  { value: 'payments', label: 'Payments' },
]

const NOTE: Record<ViewMode, { lead: string; more: string }> = {
  behaviour: {
    lead: 'Behaviour view — by purchase date.',
    more: ' Categories total when you actually spent or earned.',
  },
  payments: {
    lead: 'Payments view — by settlement date.',
    more: ' Only what actually cleared your account this period.',
  },
}

interface ViewBarProps {
  view: ViewMode
  onChange: (v: ViewMode) => void
}

/** Behaviour/Payments toggle + green info note — the "two clocks" control. */
export default function ViewBar({ view, onChange }: ViewBarProps) {
  const note = NOTE[view]
  return (
    <Box>
      <Flex align="center" gap="0.7rem" mb="0.8rem" flexWrap="wrap">
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

      <HStack
        align="flex-start"
        spacing="0.5rem"
        bg="var(--pb-tint-green)"
        border="1px solid var(--pb-hair)"
        borderRadius="14px"
        px={{ base: '0.65rem', sm: '0.85rem' }}
        py={{ base: '0.5rem', sm: '0.7rem' }}
        color="var(--pb-ink-soft)"
      >
        <Icon as={AlertCircle} boxSize="17px" mt="0.12em" color="var(--pb-forest-2)" flexShrink={0} />
        <Text fontSize={{ base: '0.86rem', sm: '0.92rem' }} lineHeight="1.5">
          <Text as="span" color="var(--pb-ink)" fontWeight={500}>
            {note.lead}
          </Text>
          <Text as="span" display={{ base: 'none', sm: 'inline' }}>
            {note.more}
          </Text>
        </Text>
      </HStack>
    </Box>
  )
}
