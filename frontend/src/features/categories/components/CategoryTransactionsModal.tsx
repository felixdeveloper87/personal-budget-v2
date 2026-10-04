import { Box, Flex, Text } from '@chakra-ui/react'
import { ModalHeader, PremiumModal } from '../../../components/ui'
import type { ComputedCategory, Side } from '../data/types'
import CategoryTxnRow from './CategoryTxnRow'
import { useI18n } from '../../../i18n'

interface CategoryTransactionsModalProps {
  /** The category to show in full. `null` keeps the modal mounted but closed. */
  cat: ComputedCategory | null
  side: Side
  periodLabel: string
  onClose: () => void
}

/** Full transaction list for one category — reached from the "+N more" line
 * on its category detail card. `cat.sample` already holds every matching
 * transaction for the period (see `aggregateSide`), so this needs no fetch. */
export default function CategoryTransactionsModal({
  cat,
  side,
  periodLabel,
  onClose,
}: CategoryTransactionsModalProps) {
  const { t, formatCurrency, categoryLabel } = useI18n()
  const sign = side === 'expense' ? '−' : '+'
  const amtColor = side === 'expense' ? 'var(--pb-ink)' : 'var(--pb-income)'

  return (
    <PremiumModal
      isOpen={cat != null}
      onClose={onClose}
      size={{ base: 'full', sm: 'md', md: 'md' }}
      contentProps={{ className: 'nu-dashboard', maxH: { base: 'calc(100dvh - 24px)', sm: '78dvh' } }}
      header={
        cat && (
          <ModalHeader
            title={cat.name === 'Uncategorised' ? t('categories.uncategorised') : categoryLabel(cat.name)}
            caption={t(cat.shownCount === 1 ? 'categories.modalCaption' : 'categories.modalCaptionPlural', {
              count: cat.shownCount,
              period: periodLabel,
            })}
            onClose={onClose}
          />
        )
      }
    >
      {cat && (
        <Box flex="1" minH={0} overflowY="auto" px={{ base: 4, sm: 6 }} py={4}>
          <Flex align="baseline" justify="space-between" mb={3}>
            <Text fontSize="sm" color="var(--pb-ink-soft)">
              {t('categories.total')}
            </Text>
            <Text
              fontWeight={700}
              fontSize="xl"
              letterSpacing="-0.02em"
              color={amtColor}
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {sign}
              {formatCurrency(cat.amount)}
            </Text>
          </Flex>
          <Box bg="var(--pb-surface)" borderRadius="14px" px={3.5}>
            {cat.sample.map((txn) => (
              <CategoryTxnRow key={txn.id} txn={txn} icon={cat.icon} side={side} />
            ))}
          </Box>
        </Box>
      )}
    </PremiumModal>
  )
}
