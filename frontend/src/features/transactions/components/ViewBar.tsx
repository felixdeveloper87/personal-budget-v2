import { Box, Flex, HStack, Icon, Text } from '@chakra-ui/react'
import { Clock, AlertCircle } from '../../../components/ui/icons'
import Segmented from '../../dashboard/components/Segmented'
import type { TxView } from '../transactions.types'

interface ViewBarProps {
  view: TxView
  onChange: (v: TxView) => void
}

const NOTE: Record<
  TxView,
  { icon: typeof Clock; primary: string; more: string }
> = {
  behaviour: {
    icon: AlertCircle,
    primary: 'Behaviour view — by purchase date.',
    more: ' Card purchases and installments count on the day you bought.',
  },
  payments: {
    icon: Clock,
    primary: 'Payments view — by the day money leaves.',
    more: ' Deferred card purchases jump to their settlement date.',
  },
}

export default function ViewBar({ view, onChange }: ViewBarProps) {
  const note = NOTE[view]
  return (
    <Box mb="clamp(1rem,2.4vw,1.4rem)">
      {/* Toggle row */}
      <Flex align="center" gap=".7rem" mb=".8rem" flexWrap="wrap">
        <Text as="span" fontStyle="italic" color="var(--pb-forest-2)">
          View as
        </Text>
        <Segmented
          options={[
            { value: 'behaviour', label: 'Behaviour' },
            { value: 'payments', label: 'Payments' },
          ]}
          value={view}
          onChange={onChange}
          aria-label="View transactions by behaviour or payments"
        />
      </Flex>

      {/* View note */}
      <HStack
        align="flex-start"
        spacing="0.55rem"
        bg="var(--pb-tint-green)"
        border="1px solid var(--pb-hair)"
        borderRadius="14px"
        px={{ base: '.65rem', sm: '.85rem' }}
        py={{ base: '.5rem', sm: '.6rem' }}
        color="var(--pb-ink-soft)"
      >
        <Icon as={note.icon} boxSize="16px" mt="2px" color="var(--pb-forest-2)" flexShrink={0} />
        <Text fontSize={{ base: '.86rem', sm: '.95rem' }} lineHeight="1.4">
          <Text as="span" color="var(--pb-forest-2)" fontWeight={500}>
            {note.primary}
          </Text>
          <Text as="span" display={{ base: 'none', sm: 'inline' }}>
            {note.more}
          </Text>
        </Text>
      </HStack>
    </Box>
  )
}
