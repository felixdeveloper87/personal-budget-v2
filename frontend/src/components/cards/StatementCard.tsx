import { Badge, Box, Collapse, Divider, Flex, HStack, Icon, Text, VStack } from '@chakra-ui/react'

import type { CardStatement, StatementStatus } from '../../utils/creditCardStatements'
import TransactionLedgerRow from '../transactions/TransactionLedgerRow'
import { CalendarCheck, ChevronDown, ChevronUp, Clock, Lock } from '../ui/icons'

const money = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' })
const date = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short' })
const month = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' })

const status: Record<StatementStatus, { label: string; colour: string; tint: string; icon: typeof Lock }> = {
  open: { label: 'Open', colour: 'var(--pb-forest-2)', tint: 'var(--pb-tint-green)', icon: Clock },
  closed: { label: 'Closed', colour: 'var(--pb-ink-soft)', tint: 'var(--pb-surface-3)', icon: Lock },
  upcoming: { label: 'Upcoming', colour: 'var(--pb-gold)', tint: 'var(--pb-tint-gold)', icon: CalendarCheck },
}

export interface StatementCardProps {
  statement: CardStatement
  isOpen: boolean
  hideValues?: boolean
  onToggle: () => void
}

export default function StatementCard({ statement, isOpen, hideValues = false, onToggle }: StatementCardProps) {
  const meta = status[statement.status]
  return (
    <Box borderRadius="18px" border="1px solid" borderColor={statement.status === 'open' ? 'var(--pb-hair-2)' : 'var(--pb-hair)'} bg="var(--pb-surface)" overflow="hidden" boxShadow={statement.status === 'open' ? 'var(--pb-shadow)' : undefined} transition="border-color .2s ease">
      <Box as="button" type="button" onClick={onToggle} w="full" textAlign="left" p={{ base: 4, md: 4.5 }} _hover={{ bg: 'var(--pb-surface-2)' }} transition="background .16s ease" aria-expanded={isOpen}>
        <Flex justify="space-between" align="start" gap={3}>
          <VStack align="start" spacing={2} minW={0}>
            <HStack spacing={2} flexWrap="wrap"><Text fontSize="md" fontWeight={600} color="var(--pb-ink)">{month.format(statement.closingDate)}</Text><Badge display="inline-flex" alignItems="center" gap={1} px={2} py="2px" borderRadius="999px" textTransform="uppercase" letterSpacing="0.08em" fontSize="9px" color={meta.colour} bg={meta.tint}><Icon as={meta.icon} boxSize={3} />{meta.label}</Badge></HStack>
            <HStack spacing={2} color="var(--pb-ink-soft)" fontSize="xs" flexWrap="wrap"><Text>{date.format(statement.periodStart)} – {date.format(statement.closingDate)}</Text><Text color="var(--pb-ink-faint)">•</Text><Text>Due {date.format(statement.paymentDate)}</Text><Text color="var(--pb-ink-faint)">•</Text><Text>{statement.transactions.length} transaction{statement.transactions.length !== 1 ? 's' : ''}</Text></HStack>
          </VStack>
          <HStack spacing={2} flexShrink={0}><Text className="num" fontSize="lg" fontWeight={600} color="var(--pb-ink)" style={{ fontVariantNumeric: 'tabular-nums' }}>{hideValues ? '••••••' : money.format(statement.total)}</Text><Icon as={isOpen ? ChevronUp : ChevronDown} boxSize={5} color="var(--pb-ink-faint)" /></HStack>
        </Flex>
      </Box>
      <Collapse in={isOpen} animateOpacity><Divider borderColor="var(--pb-hair)" /><VStack align="stretch" spacing={0}>{statement.transactions.map((transaction, index) => <TransactionLedgerRow key={transaction.id ?? `${statement.key}-${index}`} transaction={transaction} dateBasis="activity" withTopBorder={index > 0} hideAmount={hideValues} />)}</VStack></Collapse>
    </Box>
  )
}
