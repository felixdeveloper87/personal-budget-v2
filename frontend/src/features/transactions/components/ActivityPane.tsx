import {
  Box,
  Flex,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
} from '@chakra-ui/react'
import { Search, Calendar, X } from '../../../components/ui/icons'
import Panel from '../../dashboard/components/Panel'
import type { TxFilter, TxnVM, TxState } from '../transactions.types'
import type { LedgerGroup } from '../transactions.utils'
import { FILTER_LABELS, fmtDayLong } from '../transactions.utils'
import Ledger from './Ledger'

interface ActivityPaneProps {
  state: TxState
  groups: LedgerGroup[]
  onSetQuery: (q: string) => void
  onSetFilter: (f: TxFilter) => void
  onClearDay: () => void
  onOpen: (txn: TxnVM) => void
  reduce: boolean
}

const FILTERS: TxFilter[] = ['all', 'in', 'out', 'deferred']
const DOT_COLOR: Partial<Record<TxFilter, string>> = {
  in: 'var(--pb-forest-2)',
  out: 'var(--pb-coral)',
  deferred: 'var(--pb-gold-2)',
}

function Chip({
  value,
  active,
  onClick,
}: {
  value: TxFilter
  active: boolean
  onClick: () => void
}) {
  const dot = DOT_COLOR[value]
  return (
    <HStack
      as="button"
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      spacing="0.35rem"
      px=".7rem"
      py=".34rem"
      borderRadius="999px"
      border="1px solid var(--pb-hair)"
      bg={active ? 'var(--pb-tint-green)' : 'var(--pb-surface)'}
      color={active ? 'var(--pb-forest)' : 'var(--pb-ink-soft)'}
      cursor="pointer"
      transition="all 0.15s ease"
      _hover={{ borderColor: 'var(--pb-hair-2)' }}
      _focusVisible={{ boxShadow: '0 0 0 2px var(--pb-forest)', outline: 'none' }}
    >
      {dot && <Box w="6px" h="6px" borderRadius="999px" bg={dot} />}
      <Text
        fontFamily="var(--pb-mono)"
        fontSize="10.5px"
        letterSpacing="0.06em"
        textTransform="uppercase"
        fontWeight={active ? 500 : 400}
      >
        {FILTER_LABELS[value]}
      </Text>
    </HStack>
  )
}

export default function ActivityPane({
  state,
  groups,
  onSetQuery,
  onSetFilter,
  onClearDay,
  onOpen,
  reduce,
}: ActivityPaneProps) {
  return (
    <Panel>
      {/* Search */}
      <InputGroup mb=".8rem">
        <InputLeftElement pointerEvents="none" h="full">
          <Icon as={Search} boxSize="16px" color="var(--pb-forest-2)" />
        </InputLeftElement>
        <Input
          value={state.q}
          onChange={(e) => onSetQuery(e.target.value)}
          placeholder="Search merchant or category…"
          fontFamily="var(--pb-serif)"
          fontSize=".95rem"
          bg="var(--pb-surface)"
          border="1px solid var(--pb-hair)"
          borderRadius="12px"
          color="var(--pb-ink)"
          _placeholder={{ color: 'var(--pb-ink-faint)' }}
          _hover={{ borderColor: 'var(--pb-hair-2)' }}
          _focus={{
            borderColor: 'var(--pb-hair-2)',
            boxShadow: 'var(--pb-shadow-lift)',
          }}
        />
      </InputGroup>

      {/* Filter chips */}
      <Flex
        gap=".45rem"
        flexWrap="wrap"
        role="radiogroup"
        aria-label="Filter transactions"
        mb=".9rem"
      >
        {FILTERS.map((f) => (
          <Chip key={f} value={f} active={state.filter === f} onClick={() => onSetFilter(f)} />
        ))}
      </Flex>

      {/* Day banner */}
      {state.selectedDay && (
        <Flex
          align="center"
          justify="space-between"
          gap=".5rem"
          mb=".9rem"
          px=".75rem"
          py=".5rem"
          borderRadius="12px"
          bg="var(--pb-tint-green)"
          border="1px solid var(--pb-hair-2)"
        >
          <HStack spacing=".5rem" minW={0}>
            <Icon as={Calendar} boxSize="15px" color="var(--pb-forest-2)" flexShrink={0} />
            <Text fontFamily="var(--pb-serif)" fontSize=".95rem" color="var(--pb-ink)" noOfLines={1}>
              Showing {fmtDayLong(state.selectedDay)}
            </Text>
          </HStack>
          <HStack
            as="button"
            type="button"
            onClick={onClearDay}
            spacing="0.25rem"
            px=".55rem"
            py=".25rem"
            borderRadius="999px"
            bg="var(--pb-surface)"
            border="1px solid var(--pb-hair)"
            color="var(--pb-ink-soft)"
            cursor="pointer"
            flexShrink={0}
            _hover={{ color: 'var(--pb-ink)', borderColor: 'var(--pb-hair-2)' }}
            _focusVisible={{ boxShadow: '0 0 0 2px var(--pb-forest)', outline: 'none' }}
          >
            <Text fontFamily="var(--pb-mono)" fontSize="9.5px" letterSpacing="0.06em" textTransform="uppercase">
              Clear
            </Text>
            <Icon as={X} boxSize="11px" />
          </HStack>
        </Flex>
      )}

      {/* Ledger */}
      <Ledger groups={groups} view={state.view} onOpen={onOpen} reduce={reduce} />
    </Panel>
  )
}
