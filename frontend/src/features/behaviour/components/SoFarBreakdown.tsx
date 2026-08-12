import { Box, Grid, HStack, Text, VStack } from '@chakra-ui/react'
import type { BreakdownItem } from '../insights'
import { useI18n } from '../../../i18n'

interface SoFarBreakdownProps {
  spend: BreakdownItem[]
  earnings: BreakdownItem[]
  showEarnings?: boolean
  /** e.g. "so far this month" or "in June 2026" (past periods). */
  scopeLabel: string
}

const MAX_ROWS = 6

/**
 * Two ledgers side by side: "you spent £X on <category>" and "you earned £X
 * from <source>" — the source read from the transaction description (Uber,
 * Deliveroo, …). Everything is already day-to-day-filtered upstream.
 */
export default function SoFarBreakdown({ spend, earnings, showEarnings = true, scopeLabel }: SoFarBreakdownProps) {
  const { t, categoryLabel } = useI18n()
  return (
    <Grid templateColumns={{ base: '1fr', md: showEarnings ? '1fr 1fr' : '1fr' }} gap="0.7rem" alignItems="stretch">
      <BreakdownPanel
        title={t('behaviour.breakdown.spent')}
        scopeLabel={scopeLabel}
        items={spend.map((item) => ({ ...item, name: categoryLabel(item.name) }))}
        accent="var(--pb-coral)"
        barGradient="linear-gradient(to right, var(--pb-coral), var(--pb-coral-2))"
        preposition={t('behaviour.breakdown.on')}
        emptyText={t('behaviour.breakdown.emptyExpenses')}
      />
      {showEarnings && (
        <BreakdownPanel
          title={t('behaviour.breakdown.earned')}
          scopeLabel={scopeLabel}
          items={earnings}
          accent="var(--pb-income)"
          barGradient="linear-gradient(to right, var(--pb-income), var(--pb-income-2))"
          preposition={t('behaviour.breakdown.from')}
          emptyText={t('behaviour.breakdown.emptyEarnings')}
        />
      )}
    </Grid>
  )
}

interface BreakdownPanelProps {
  title: string
  scopeLabel: string
  items: BreakdownItem[]
  accent: string
  barGradient: string
  preposition: string
  emptyText: string
}

function BreakdownPanel({
  title,
  scopeLabel,
  items,
  accent,
  barGradient,
  preposition,
  emptyText,
}: BreakdownPanelProps) {
  const { t, formatCurrency, formatNumber } = useI18n()
  // Top rows + a folded "everything else" so the panel never grows unbounded.
  let rows = items
  if (items.length > MAX_ROWS) {
    const head = items.slice(0, MAX_ROWS - 1)
    const rest = items.slice(MAX_ROWS - 1)
    rows = [
      ...head,
      {
        name: t('behaviour.breakdown.everythingElse', { count: formatNumber(rest.length) }),
        total: rest.reduce((s, r) => s + r.total, 0),
        count: rest.reduce((s, r) => s + r.count, 0),
      },
    ]
  }
  const max = rows[0]?.total ?? 0

  return (
    <Box
      bg="var(--pb-surface)"
      border="1px solid var(--pb-hair)"
      borderRadius="18px"
      boxShadow="var(--pb-shadow)"
      p="1.1rem"
      h="full"
    >
      <VStack align="stretch" spacing={3.5} h="full">
        <Text
          fontFamily="var(--pb-mono)"
          fontSize="10px"
          letterSpacing="0.18em"
          textTransform="uppercase"
          color="var(--pb-ink-faint)"
        >
          {title} · {scopeLabel}
        </Text>

        {rows.length === 0 ? (
          <Text fontFamily="var(--pb-serif)" fontStyle="italic" fontSize=".95rem" color="var(--pb-ink-faint)" py={2}>
            {emptyText}
          </Text>
        ) : (
          <VStack align="stretch" spacing={2.5}>
            {rows.map((item) => (
              <VStack key={item.name} align="stretch" spacing={1}>
                <HStack justify="space-between" align="baseline" spacing={3}>
                  <HStack align="baseline" spacing={2} minW={0}>
                    <Text fontFamily="var(--pb-serif)" fontSize=".95rem" color="var(--pb-ink)" noOfLines={1}>
                      <Text as="span" color="var(--pb-ink-faint)">
                        {preposition}{' '}
                      </Text>
                      {item.name}
                    </Text>
                    <Text fontFamily="var(--pb-mono)" fontSize="9.5px" color="var(--pb-ink-faint)" flexShrink={0}>
                      ×{item.count}
                    </Text>
                  </HStack>
                  <Text
                    fontFamily="var(--pb-serif)"
                    fontSize=".95rem"
                    fontWeight={500}
                    color={accent}
                    flexShrink={0}
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {formatCurrency(item.total)}
                  </Text>
                </HStack>
                <Box h="5px" borderRadius="3px" bg="var(--pb-surface-3)" overflow="hidden">
                  <Box
                    h="full"
                    w={`${max > 0 ? Math.max((item.total / max) * 100, 2) : 0}%`}
                    borderRadius="3px"
                    background={barGradient}
                    transition="width 0.5s ease"
                  />
                </Box>
              </VStack>
            ))}
          </VStack>
        )}
      </VStack>
    </Box>
  )
}
