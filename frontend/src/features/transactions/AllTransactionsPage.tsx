import { Box, VStack, Spinner, Text } from '@chakra-ui/react'
import AllTransactionsSection from '../../sections/AllTransactionsSection'
import { useEffect, useMemo, type ReactNode } from 'react'
import { hasActiveFilters } from '../../utils/filters'
import { useSearch } from '../../contexts/SearchContext'
import { mergeTransactionsWithFutureInstallments } from '../../utils/installments'
import { ToastService } from '../../services/toast'
import { useI18n } from '../../i18n'
import { useInstallmentPlans, useTransactionPages } from '../../queries/hooks'
import { PAGE_BOTTOM_PADDING } from '../dashboard/components/nu'
import '../dashboard/theme/pb-tokens.css'

/**
 * Every transaction, loaded from the server a page at a time (newest first).
 * The global search filters are applied on the server, over the whole history.
 */
export default function AllTransactionsPage() {
  const { t } = useI18n()
  const { filters } = useSearch()
  const filtering = hasActiveFilters(filters)

  const pagesQuery = useTransactionPages(filtering ? filters : null)
  const plans = useInstallmentPlans().data

  useEffect(() => {
    if (pagesQuery.error) {
      ToastService.apiError(pagesQuery.error, {
        title: t('transactions.loadFailed'),
        dedupeKey: 'transactions-load-failed',
      })
    }
  }, [pagesQuery.error, t])

  const loaded = useMemo(
    () => pagesQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [pagesQuery.data],
  )
  // Installments not yet generated as rows are projected from their plans.
  const transactions = useMemo(
    () => mergeTransactionsWithFutureInstallments(loaded, plans ?? []),
    [loaded, plans],
  )
  const total = pagesQuery.data?.pages[0]?.totalElements ?? loaded.length

  const textColor = 'var(--pb-ink-soft)'

  const sheet = (children: ReactNode) => (
    <Box maxW="appContent" mx="auto" px={{ base: 0, md: 4, lg: 6 }} pt={{ base: 0, md: 5 }} pb={PAGE_BOTTOM_PADDING} minW={0}>
      <Box className="nu-dashboard" bg="var(--nu-page)" borderRadius={{ base: 0, md: '24px' }} overflow="hidden">
        {children}
      </Box>
    </Box>
  )

  if (pagesQuery.isPending && pagesQuery.fetchStatus !== 'idle') {
    return sheet(
      <VStack py={20} spacing={4}>
        <Spinner size="xl" color="var(--nu-brand, #820ad1)" thickness="3px" speed="0.8s" />
        <Text fontSize="sm" fontWeight={500} color={textColor}>
          {t('transactions.loading')}
        </Text>
      </VStack>,
    )
  }

  return sheet(
    <AllTransactionsSection
      transactions={transactions}
      totalCount={total}
      hasFilters={filtering}
      onRefresh={() => { void pagesQuery.refetch() }}
      hasMore={Boolean(pagesQuery.hasNextPage)}
      loadingMore={pagesQuery.isFetchingNextPage}
      onLoadMore={() => { void pagesQuery.fetchNextPage() }}
    />,
  )
}
