import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Box,
  Divider,
  Flex,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react'

import { Search, X } from '../ui/icons'
import { listTransactions } from '../../api'
import { ToastService } from '../../services/toast'
import type { Transaction } from '../../types'

import { PremiumModal } from '../ui'
import { useEd } from '../../editorial'

import '../../features/dashboard/theme/pb-tokens.css'
import { toViewModel, buildLedger, parseISO, FILTER_LABELS, type LedgerGroup } from '../../features/transactions/transactions.utils'
import { initialTxState, type TxFilter } from '../../features/transactions/transactions.types'
import { fmtCurrency } from '../../features/dashboard/components/format'
import TxnRow from '../../features/transactions/components/TxnRow'

interface SpotlightSearchProps {
  isOpen: boolean
  onClose: () => void
}

/** A spotlight never renders the full ledger — only the most recent matches. */
const RESULT_CAP = 50

const FILTERS: TxFilter[] = ['all', 'in', 'out', 'deferred']
const DOT_COLOR: Partial<Record<TxFilter, string>> = {
  in: 'var(--pb-income-2)',
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

/**
 * Spotlight search — a single editorial modal that searches across all
 * transactions and shows live results as you type, grouped by day with the same
 * ledger styling used on the Transactions page. Self-contained: it loads the
 * full transaction set once, then the text query and filter chips both run
 * client-side over it — so typing and chip toggles are instant.
 */
export default function SpotlightSearch({ isOpen, onClose }: SpotlightSearchProps) {
  const ed = useEd()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<TxFilter>('all')
  const [raw, setRaw] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const reqId = useRef(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const text = q.trim()
  const hasQuery = text.length > 0
  // Show results as soon as there is any criterion — typed text OR an active
  // filter chip. With everything loaded client-side the chips filter instantly.
  const hasCriteria = hasQuery || filter !== 'all'

  // Focus the field shortly after open (after the modal mount animation).
  useEffect(() => {
    if (!isOpen) return
    const t = window.setTimeout(() => inputRef.current?.focus(), 80)
    return () => window.clearTimeout(t)
  }, [isOpen])

  // Reset everything when the modal closes.
  useEffect(() => {
    if (!isOpen) {
      setQ('')
      setFilter('all')
      setRaw([])
      setLoading(false)
    }
  }, [isOpen])

  // Load the full transaction set once per open. Both the text query and the
  // filter chips then run client-side over this set (like the Transactions
  // page), so every keystroke and chip toggle is instant.
  useEffect(() => {
    if (!isOpen) return
    const id = ++reqId.current
    setLoading(true)
    ;(async () => {
      try {
        const data = await listTransactions()
        if (id === reqId.current) setRaw(data)
      } catch (err) {
        if (id === reqId.current) {
          setRaw([])
          ToastService.apiError(err, {
            title: 'Could not load transactions',
            dedupeKey: 'spotlight-search-failed',
          })
        }
      } finally {
        if (id === reqId.current) setLoading(false)
      }
    })()
  }, [isOpen])

  const vm = useMemo(() => toViewModel(raw), [raw])

  // Filter the whole set, but only render the most recent RESULT_CAP rows. A
  // spotlight never needs the full ledger, and rendering thousands of rows is
  // what makes "All" feel heavy — especially on mobile. Totals below still
  // reflect every match so the figures stay honest.
  const { groups, summary } = useMemo(() => {
    const all = buildLedger(vm, { ...initialTxState, q: text, filter })
    let count = 0
    let inTotal = 0
    let outTotal = 0
    for (const g of all) {
      count += g.rows.length
      inTotal += g.inTotal
      outTotal += g.outTotal
    }
    // Take the first RESULT_CAP rows in render order (newest day first).
    const capped: LedgerGroup[] = []
    let remaining = RESULT_CAP
    for (const g of all) {
      if (remaining <= 0) break
      if (g.rows.length <= remaining) {
        capped.push(g)
        remaining -= g.rows.length
      } else {
        capped.push({ ...g, rows: g.rows.slice(0, remaining) })
        remaining = 0
      }
    }
    const shown = Math.min(count, RESULT_CAP)
    return { groups: capped, summary: { count, shown, inTotal, outTotal } }
  }, [vm, text, filter])

  const surfaceBg = ed?.modal ?? 'var(--pb-paper)'

  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', sm: 'xl', md: '2xl' }}
      contentProps={{
        maxH: { base: 'calc(100dvh - 24px)', sm: '78dvh' },
        mx: { base: 3, sm: 0 },
        my: { base: 3, sm: 0 },
        borderRadius: { base: '18px', md: '18px' },
      }}
    >
      <Flex direction="column" h="full" minH={0} bg={surfaceBg}>
        {/* Search field + chips */}
        <Box
          px={{ base: 4, sm: 5 }}
          pt={{ base: 4, sm: 5 }}
          pb={3}
          borderBottom="1px solid var(--pb-hair)"
        >
          <InputGroup>
            <InputLeftElement pointerEvents="none" h="full">
              <Icon as={Search} boxSize="18px" color="var(--pb-forest-2)" />
            </InputLeftElement>
            <Input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search transactions…"
              fontFamily="var(--pb-serif)"
              fontSize="1.05rem"
              h="48px"
              pr="44px"
              bg="var(--pb-surface)"
              border="1px solid var(--pb-hair)"
              borderRadius="14px"
              color="var(--pb-ink)"
              _placeholder={{ color: 'var(--pb-ink-faint)' }}
              _hover={{ borderColor: 'var(--pb-hair-2)' }}
              _focus={{
                borderColor: 'var(--pb-hair-2)',
                boxShadow: 'var(--pb-shadow-lift)',
              }}
            />
            {q && (
              <InputRightElement h="full" pr="6px">
                <IconButton
                  aria-label="Clear search"
                  icon={<Icon as={X} boxSize="14px" />}
                  size="xs"
                  variant="ghost"
                  color="var(--pb-ink-faint)"
                  borderRadius="full"
                  onClick={() => {
                    setQ('')
                    inputRef.current?.focus()
                  }}
                  _hover={{ bg: 'var(--pb-surface-2)', color: 'var(--pb-ink)' }}
                />
              </InputRightElement>
            )}
          </InputGroup>

          <Flex
            gap=".45rem"
            flexWrap="wrap"
            mt={3}
            role="radiogroup"
            aria-label="Filter results"
          >
            {FILTERS.map((f) => (
              <Chip key={f} value={f} active={filter === f} onClick={() => setFilter(f)} />
            ))}
          </Flex>
        </Box>

        {/* Results */}
        <Box flex="1" minH={0} overflowY="auto" px={{ base: 4, sm: 5 }} py={4}>
          {!hasCriteria ? (
            <IdleHint />
          ) : loading && raw.length === 0 ? (
            <Flex direction="column" align="center" justify="center" py="3rem" gap="0.9rem">
              <Spinner size="md" color="var(--pb-forest-2)" thickness="2px" speed="0.7s" />
              <Text fontFamily="var(--pb-mono)" fontSize="10.5px" letterSpacing="0.08em" textTransform="uppercase" color="var(--pb-ink-faint)">
                Searching…
              </Text>
            </Flex>
          ) : (
            <>
              {summary.count > 0 && (
                <Flex
                  align="center"
                  justify="space-between"
                  gap=".5rem"
                  flexWrap="wrap"
                  mb="1rem"
                >
                  <Text
                    fontFamily="var(--pb-mono)"
                    fontSize="10px"
                    letterSpacing="0.08em"
                    textTransform="uppercase"
                    color="var(--pb-ink-faint)"
                  >
                    {summary.shown < summary.count
                      ? `Showing ${summary.shown} of ${summary.count}`
                      : `${summary.count} result${summary.count === 1 ? '' : 's'}`}
                  </Text>
                  <HStack spacing=".4rem">
                    {summary.inTotal > 0 && (
                      <SummaryPill kind="in" value={summary.inTotal} />
                    )}
                    {summary.outTotal > 0 && (
                      <SummaryPill kind="out" value={summary.outTotal} />
                    )}
                  </HStack>
                </Flex>
              )}
              <ResultsList groups={groups} />
            </>
          )}
        </Box>
      </Flex>
    </PremiumModal>
  )
}

/** "Tuesday 11 June 2024" — search spans years, so the year is always shown. */
function fmtDayHeader(iso: string): string {
  return parseISO(iso).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Results grouped by day, styled like the Transactions ledger but with a
 * year-aware day header (the search crosses years). Rows reuse the shared
 * TxnRow so the look stays identical.
 */
function ResultsList({ groups }: { groups: LedgerGroup[] }) {
  if (groups.length === 0) {
    return (
      <Box py="2.5rem" textAlign="center">
        <Text fontFamily="var(--pb-serif)" fontStyle="italic" color="var(--pb-ink-faint)">
          No transactions match your search.
        </Text>
      </Box>
    )
  }

  return (
    <Box>
      {groups.map((g, gi) => (
        <Box key={g.key} mt={gi === 0 ? 0 : '1.4rem'}>
          <Flex align="center" justify="space-between" gap=".5rem" mb=".4rem">
            <Text fontFamily="var(--pb-serif)" fontSize="1.05rem" fontWeight={500} color="var(--pb-ink)">
              {fmtDayHeader(g.key)}
            </Text>
            <Text
              fontFamily="var(--pb-mono)"
              fontSize="10px"
              letterSpacing="0.08em"
              textTransform="uppercase"
              color="var(--pb-ink-faint)"
            >
              {g.rows.length} transaction{g.rows.length === 1 ? '' : 's'}
            </Text>
          </Flex>
          <Divider borderColor="var(--pb-hair)" mb=".2rem" />
          {g.rows.map((t) => (
            <TxnRow key={t.id} txn={t} view="behaviour" onOpen={() => {}} />
          ))}
        </Box>
      ))}
    </Box>
  )
}

function SummaryPill({ kind, value }: { kind: 'in' | 'out'; value: number }) {
  const isIn = kind === 'in'
  return (
    <HStack
      spacing="0.3rem"
      px=".6rem"
      py="2px"
      borderRadius="999px"
      bg={isIn ? 'var(--pb-tint-income)' : 'var(--pb-tint-coral)'}
      color={isIn ? 'var(--pb-income)' : 'var(--pb-coral)'}
    >
      <Text as="span" fontSize="11px" lineHeight="1">
        {isIn ? '↗' : '↘'}
      </Text>
      <Text
        fontFamily="var(--pb-mono)"
        fontSize="11px"
        fontWeight={500}
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {fmtCurrency(value, { minimumFractionDigits: 2 })}
      </Text>
    </HStack>
  )
}

function IdleHint() {
  return (
    <VStack spacing="0.9rem" py="3rem" textAlign="center">
      <Box
        w="48px"
        h="48px"
        borderRadius="14px"
        display="grid"
        placeItems="center"
        bg="var(--pb-tint-green)"
        color="var(--pb-forest-2)"
        border="1px solid var(--pb-hair)"
      >
        <Icon as={Search} boxSize="22px" />
      </Box>
      <Box>
        <Text fontFamily="var(--pb-serif)" fontSize="1.1rem" fontWeight={500} color="var(--pb-ink)">
          Search your transactions
        </Text>
        <Text
          fontFamily="var(--pb-mono)"
          fontSize="10.5px"
          letterSpacing="0.04em"
          color="var(--pb-ink-faint)"
          mt="0.35rem"
        >
          Type a merchant or category to see matches across all time
        </Text>
      </Box>
    </VStack>
  )
}
