import {
  Badge,
  Box,
  Collapse,
  Divider,
  HStack,
  Icon,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import type { CardStatement, StatementStatus } from '../../utils/creditCardStatements'
import TransactionLedgerRow from '../transactions/TransactionLedgerRow'
import { CalendarCheck, ChevronDown, ChevronUp, Clock, Lock } from '../ui/icons'

const moneyFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
})

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
})

const monthFormatter = new Intl.DateTimeFormat('en-GB', {
  month: 'long',
  year: 'numeric',
})

const STATUS_META: Record<
  StatementStatus,
  { label: string; colorScheme: string; icon: typeof Lock }
> = {
  open: { label: 'Open', colorScheme: 'blue', icon: Clock },
  closed: { label: 'Closed', colorScheme: 'gray', icon: Lock },
  upcoming: { label: 'Upcoming', colorScheme: 'purple', icon: CalendarCheck },
}

export interface StatementCardProps {
  statement: CardStatement
  isOpen: boolean
  hideValues?: boolean
  onToggle: () => void
}

export default function StatementCard({
  statement,
  isOpen,
  hideValues = false,
  onToggle,
}: StatementCardProps) {
  const border = useColorModeValue('gray.200', 'whiteAlpha.200')
  const muted = useColorModeValue('gray.500', 'gray.400')
  const headerBg = useColorModeValue('gray.50', 'whiteAlpha.50')
  const accent = statement.status === 'open'

  const meta = STATUS_META[statement.status]

  return (
    <Box
      borderRadius="xl"
      border="1px solid"
      borderColor={accent ? 'blue.300' : border}
      overflow="hidden"
      boxShadow={accent ? 'sm' : undefined}
    >
      <Box
        as="button"
        type="button"
        onClick={onToggle}
        w="full"
        textAlign="left"
        bg={headerBg}
        p={{ base: 3.5, md: 4 }}
        aria-expanded={isOpen}
      >
        <VStack align="stretch" spacing={3}>
          <HStack justify="space-between" align="start">
            <HStack spacing={2} minW={0}>
              <Text fontWeight={800} fontSize="md" noOfLines={1}>
                {monthFormatter.format(statement.closingDate)}
              </Text>
              <Badge
                colorScheme={meta.colorScheme}
                borderRadius="full"
                textTransform="none"
                display="flex"
                alignItems="center"
                gap={1}
                px={2}
              >
                <Icon as={meta.icon} boxSize={2.5} />
                {meta.label}
              </Badge>
            </HStack>
            <HStack spacing={2} flexShrink={0}>
              <Text fontSize="lg" fontWeight={800} sx={{ fontVariantNumeric: 'tabular-nums' }}>
                {hideValues ? '••••••' : moneyFormatter.format(statement.total)}
              </Text>
              <Icon as={isOpen ? ChevronUp : ChevronDown} boxSize={5} color={muted} />
            </HStack>
          </HStack>

          <HStack spacing={4} fontSize="xs" color={muted} flexWrap="wrap">
            <Text>
              {dateFormatter.format(statement.periodStart)} – {dateFormatter.format(statement.closingDate)}
            </Text>
            <Text>·</Text>
            <Text>
              Due {dateFormatter.format(statement.paymentDate)}
            </Text>
            <Text>·</Text>
            <Text>
              {statement.transactions.length} transaction
              {statement.transactions.length !== 1 ? 's' : ''}
            </Text>
          </HStack>
        </VStack>
      </Box>

      <Collapse in={isOpen} animateOpacity>
        <Divider borderColor={border} />
        <VStack align="stretch" spacing={0}>
          {statement.transactions.map((tx, index) => (
            <TransactionLedgerRow
              key={tx.id ?? `${statement.key}-${index}`}
              transaction={tx}
              dateBasis="activity"
              withTopBorder={index > 0}
              hideAmount={hideValues}
            />
          ))}
        </VStack>
      </Collapse>
    </Box>
  )
}
