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

import { Search, X, ChevronLeft, ChevronRight } from '../ui/icons'
import { listTransactions } from '../../api'
import { ToastService } from '../../services/toast'
import type { Transaction } from '../../types'

import { PremiumModal } from '../ui'
import { Guilloche, useEd } from '../../editorial'

import '../../features/dashboard/theme/pb-tokens.css'
import { toViewModel, buildLedger, parseISO, FILTER_LABELS, type LedgerGroup } from '../../features/transactions/transactions.utils'
import { initialTxState, type TxFilter } from '../../features/transactions/transactions.types'
import { fmtCurrency } from '../../features/dashboard/components/format'
import TxnRow from '../../features/transactions/components/TxnRow'

interface SpotlightSearchProps {
  isOpen: boolean
  onClose: () => void
}

/** Results per page — newest first, paged so we never render a huge ledger. */
const PAGE_SIZE = 50

/** Today as a local "YYYY-MM-DD" string (comparable to ledger day keys). */
function todayIso(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

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
  const [page, setPage] = useState(0)
  const [raw, setRaw] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const reqId = useRef(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const text = q.trim()
  // Show results as soon as there is a text query or an active transaction filter.
  const hasCriteria = text.length > 0 || filter !== 'all'

  // Focus the field shortly after open (after the modal mount animation).
  useEffect(() => {
    if (!isOpen) return
    const t = window.setTimeout(() => inputRef.current?.focus(), 80)
    return () => window.clearTimeout(t)
  }, [isOpen])

  // Reset everything when the modal closes.
  useEffect(() => {
    if (!isOpen) {
      reqId.current += 1
      setQ('')
      setFilter('all')
      setPage(0)
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

  // Same matching engine as Transactions, but laid out as one continuous
  // chronological timeline (oldest → newest → future). `todayPage` is the page
  // holding the first transaction dated today-or-later, so the spotlight opens
  // on "now" with the past on earlier pages and planned items on later ones.
  const { flat, count, inTotal, outTotal, todayPage } = useMemo(() => {
    const all = buildLedger(vm, { ...initialTxState, q: text, filter })

    let count = 0
    let inTotal = 0
    let outTotal = 0
    type Item = { row: LedgerGroup['rows'][number]; key: string; date: Date }
    const flat: Item[] = []
    // buildLedger returns groups newest-first; walk them in reverse for ascending
    // (chronological) order. Intra-day row order is left as-is.
    for (let i = all.length - 1; i >= 0; i--) {
      const g = all[i]
      count += g.rows.length
      inTotal += g.inTotal
      outTotal += g.outTotal
      for (const row of g.rows) flat.push({ row, key: g.key, date: g.date })
    }

    // Keys are "YYYY-MM-DD", so a lexicographic compare is chronological.
    const today = todayIso()
    let idx = flat.findIndex((it) => it.key >= today)
    if (idx < 0) idx = Math.max(0, flat.length - 1)
    const todayPage = Math.floor(idx / PAGE_SIZE)

    return { flat, count, inTotal, outTotal, todayPage }
  }, [vm, text, filter])

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)

  // Land on today's page whenever the result set changes (new search / filter /
  // freshly loaded data). Manual paging is preserved until criteria change.
  useEffect(() => {
    setPage(todayPage)
  }, [text, filter, todayPage])

  const { groups, summary } = useMemo(() => {
    const slice = flat.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE)
    const pageGroups: LedgerGroup[] = []
    for (const item of slice) {
      const last = pageGroups[pageGroups.length - 1]
      if (last && last.key === item.key) last.rows.push(item.row)
      else pageGroups.push({ key: item.key, date: item.date, rows: [item.row], inTotal: 0, outTotal: 0 })
    }
    const from = count === 0 ? 0 : safePage * PAGE_SIZE + 1
    const to = safePage * PAGE_SIZE + slice.length
    return { groups: pageGroups, summary: { count, from, to, inTotal, outTotal } }
  }, [flat, safePage, count, inTotal, outTotal])

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
      <Flex direction="column" h="full" minH={0} bg={surfaceBg} position="relative">
        {/* Guilloché watermark — the ledger's quiet engraving identity. */}
        <Box aria-hidden position="absolute" inset={0} overflow="hidden" pointerEvents="none" zIndex={0}>
          <Box position="absolute" top="-22%" right="-14%" w="380px" h="380px">
            <Guilloche n={26} rx={300} ry={120} opacity={0.16} />
          </Box>
          <Box position="absolute" bottom="-26%" right="-8%" w="300px" h="300px">
            <Guilloche n={22} rx={300} ry={120} opacity={0.12} />
          </Box>
        </Box>

        {/* Search field + chips */}
        <Box
          position="relative"
          zIndex={1}
          px={{ base: 4, sm: 5 }}
          pt={{ base: 4, sm: 5 }}
          pb={3}
          borderBottom="1px solid var(--pb-hair)"
        >
          <HStack spacing={{ base: 2, sm: 3 }} align="stretch">
            <InputGroup flex="1">
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

            <IconButton
              aria-label="Close search"
              icon={<Icon as={X} boxSize="18px" />}
              onClick={onClose}
              h="48px"
              w="48px"
              minW="48px"
              flexShrink={0}
              bg="var(--pb-surface)"
              border="1px solid var(--pb-hair)"
              borderRadius="14px"
              color="var(--pb-ink-soft)"
              _hover={{ borderColor: 'var(--pb-hair-2)', color: 'var(--pb-ink)', bg: 'var(--pb-surface-2)' }}
              _focusVisible={{ boxShadow: '0 0 0 2px var(--pb-forest)', outline: 'none' }}
            />
          </HStack>

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
        <Box position="relative" zIndex={1} flex="1" minH={0} overflowY="auto" px={{ base: 4, sm: 5 }} py={4}>
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
                    {summary.count > PAGE_SIZE
                      ? `Showing ${summary.from}–${summary.to} of ${summary.count}`
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
              {totalPages > 1 && (
                <Pager
                  page={safePage}
                  totalPages={totalPages}
                  onChange={setPage}
                />
              )}
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

/** Compact pager: ‹ prev · page numbers (with ellipsis) · next › */
function Pager({
  page,
  totalPages,
  onChange,
}: {
  page: number
  totalPages: number
  onChange: (p: number) => void
}) {
  // Window of page numbers around the current page, always including first/last.
  const pages: Array<number | '…'> = []
  const push = (n: number | '…') => pages.push(n)
  const window = 1
  let last = -1
  for (let i = 0; i < totalPages; i++) {
    const inWindow = i === 0 || i === totalPages - 1 || Math.abs(i - page) <= window
    if (inWindow) {
      if (last >= 0 && i - last > 1) push('…')
      push(i)
      last = i
    }
  }

  const arrowSx = {
    w: '30px',
    h: '30px',
    minW: '30px',
    borderRadius: '9px',
    border: '1px solid var(--pb-hair)',
    bg: 'var(--pb-surface)',
    color: 'var(--pb-ink-soft)',
    _hover: { borderColor: 'var(--pb-hair-2)', color: 'var(--pb-ink)' },
    _disabled: { opacity: 0.4, cursor: 'not-allowed', _hover: { borderColor: 'var(--pb-hair)' } },
  } as const

  return (
    <Flex align="center" justify="center" gap=".4rem" mt="1.4rem" flexWrap="wrap">
      <IconButton
        aria-label="Previous page"
        icon={<Icon as={ChevronLeft} boxSize="15px" />}
        onClick={() => onChange(page - 1)}
        isDisabled={page === 0}
        variant="unstyled"
        display="inline-flex"
        alignItems="center"
        justifyContent="center"
        {...arrowSx}
      />
      {pages.map((p, i) =>
        p === '…' ? (
          <Box key={`e${i}`} px="2px" color="var(--pb-ink-faint)" fontFamily="var(--pb-mono)" fontSize="11px">
            …
          </Box>
        ) : (
          <Box
            key={p}
            as="button"
            type="button"
            onClick={() => onChange(p)}
            aria-current={p === page ? 'page' : undefined}
            minW="30px"
            h="30px"
            px="8px"
            borderRadius="9px"
            border="1px solid"
            borderColor={p === page ? 'var(--pb-forest)' : 'var(--pb-hair)'}
            bg={p === page ? 'var(--pb-tint-green)' : 'var(--pb-surface)'}
            color={p === page ? 'var(--pb-forest)' : 'var(--pb-ink-soft)'}
            fontFamily="var(--pb-mono)"
            fontSize="11px"
            fontWeight={p === page ? 600 : 400}
            cursor="pointer"
            transition="all 0.15s ease"
            _hover={{ borderColor: 'var(--pb-hair-2)' }}
            _focusVisible={{ boxShadow: '0 0 0 2px var(--pb-forest)', outline: 'none' }}
          >
            {p + 1}
          </Box>
        ),
      )}
      <IconButton
        aria-label="Next page"
        icon={<Icon as={ChevronRight} boxSize="15px" />}
        onClick={() => onChange(page + 1)}
        isDisabled={page >= totalPages - 1}
        variant="unstyled"
        display="inline-flex"
        alignItems="center"
        justifyContent="center"
        {...arrowSx}
      />
    </Flex>
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
          Try a merchant, category, or month — e.g. “Lidl june”
        </Text>
      </Box>
    </VStack>
  )
}
