import { TransactionList, TransactionListGrouped } from '../components'
import { Transaction } from '../types'
import { useState, useRef, useMemo } from 'react'
import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Text,
  VStack,
} from '@chakra-ui/react'
import { Calendar, Filter, List, ReceiptText } from '../components/ui/icons'
import {
  getTransactionDate,
  type TransactionDateBasis,
} from '../utils/transactionDates'
import { useI18n } from '../i18n'

interface AllTransactionsSectionProps {
  transactions: Transaction[]
  hasFilters: boolean
  onRefresh: () => void
}

export default function AllTransactionsSection({
  transactions,
  hasFilters,
  onRefresh,
}: AllTransactionsSectionProps) {
  const { t } = useI18n()
  const [groupByMonth, setGroupByMonth] = useState(true)
  // All-transactions is a management view — fixed to the purchase-date basis;
  // the Behaviour/Payments lens split lives on its own pages now.
  const dateBasis: TransactionDateBasis = 'activity'
  const groupedListRef = useRef<{ goToCurrentMonth: () => void } | null>(null)

  const hasCurrentMonth = useMemo(() => {
    const now = new Date()
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    return transactions.some(t => {
      const date = getTransactionDate(t, dateBasis)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      return monthKey === currentMonthKey
    })
  }, [transactions, dateBasis])

  /* ── Shared PB surface tokens ── */
  const surface = 'var(--pb-surface)'
  const border = 'var(--pb-hair)'
  const headerBg = 'linear-gradient(135deg, var(--pb-surface-2), var(--pb-surface))'
  const headerBorder = 'var(--pb-hair)'

  /* ── Text tokens ── */

  /* ── Accent tokens ── */

  /* ── Tab tokens ── */
  const tabTrackBg = 'var(--pb-surface-2)'
  const tabTrackBorder = 'var(--pb-hair)'
  const tabActiveText = 'var(--pb-forest-2)'
  const tabInactiveText = 'var(--pb-ink-soft)'
  const tabActiveBg = 'var(--pb-surface)'
  const tabActiveShadow = 'var(--pb-shadow)'

  /* ── Filter badge tokens ── */
  const filterBg = 'var(--pb-surface-3)'
  const filterBorder = 'var(--pb-hair)'
  const filterColor = 'var(--pb-ink-soft)'

  /* ── Count badge tokens ── */
  const countBg = 'var(--pb-tint-green)'
  const countColor = 'var(--pb-forest-2)'
  const countBorder = 'var(--pb-hair-2)'

  const cardShadow = 'var(--pb-shadow)'
  const tabHoverColor = 'var(--pb-ink)'

  return (
    <Box
      w="full"
      borderRadius="2xl"
      bg={surface}
      border="1px solid"
      borderColor={border}
      overflow="hidden"
      boxShadow={cardShadow}
    >
      {/* ─── Header ─── */}
      <Box
        bg={headerBg}
        borderBottom="1px solid"
        borderBottomColor={headerBorder}
        px={{ base: 4, md: 6 }}
        py={{ base: 4, md: 5 }}
      >
        {/* Subtle top accent bar */}
        <Flex
          direction={{ base: 'column', md: 'row' }}
          align={{ base: 'flex-start', md: 'center' }}
          justify="space-between"
          gap={{ base: 4, md: 0 }}
        >
          <HStack spacing={2} align="center">
            <Box
              px={2.5}
              py={1}
              borderRadius="full"
              bg={countBg}
              border="1px solid"
              borderColor={countBorder}
            >
              <Text fontSize="xs" fontWeight={800} color={countColor} lineHeight={1}>
                {t(transactions.length === 1 ? 'transactions.count' : 'transactions.countPlural', {
                  count: transactions.length,
                })}
              </Text>
            </Box>

            {hasFilters && (
              <HStack
                spacing={1.5}
                px={2.5}
                py={1}
                borderRadius="full"
                bg={filterBg}
                border="1px solid"
                borderColor={filterBorder}
              >
                <Icon as={Filter} boxSize={3} color={filterColor} weight="bold" />
                <Text fontSize="xs" fontWeight={700} color={filterColor} lineHeight={1}>
                  {t('transactions.filtered')}
                </Text>
              </HStack>
            )}
          </HStack>

          {/* Right: actions + view toggle */}
          <HStack spacing={{ base: 2, md: 3 }} align="center" flexWrap="wrap">
            {groupByMonth && hasCurrentMonth && (
              <Button
                size="sm"
                variant="link"
                color="var(--pb-forest-2)"
                onClick={() => groupedListRef.current?.goToCurrentMonth()}
                fontSize="xs"
                fontWeight="700"
                _hover={{ textDecoration: 'none', color: 'var(--pb-forest)' }}
                display={{ base: 'none', lg: 'inline-flex' }}
              >
                {t('transactions.jumpToCurrentMonth')}
              </Button>
            )}

            {/* View toggle — segmented control */}
            <HStack
              spacing={0.5}
              p={0.5}
              borderRadius="xl"
              bg={tabTrackBg}
              border="1px solid"
              borderColor={tabTrackBorder}
            >
              <ViewToggleButton
                icon={List}
                label={t('transactions.listView')}
                isActive={!groupByMonth}
                onClick={() => setGroupByMonth(false)}
                activeBg={tabActiveBg}
                activeShadow={tabActiveShadow}
                activeColor={tabActiveText}
                inactiveColor={tabInactiveText}
                hoverColor={tabHoverColor}
              />
              <ViewToggleButton
                icon={Calendar}
                label={t('transactions.groupedView')}
                isActive={groupByMonth}
                onClick={() => setGroupByMonth(true)}
                activeBg={tabActiveBg}
                activeShadow={tabActiveShadow}
                activeColor={tabActiveText}
                inactiveColor={tabInactiveText}
                hoverColor={tabHoverColor}
              />
            </HStack>
          </HStack>
        </Flex>
      </Box>

      {/* ─── Content ─── */}
      <Box px={{ base: 2, sm: 3, md: 4, lg: 5 }} py={{ base: 3, md: 4 }}>
        {transactions.length === 0 ? (
          <EmptyState />
        ) : groupByMonth ? (
          <TransactionListGrouped
            ref={groupedListRef}
            transactions={transactions}
            onTransactionDeleted={onRefresh}
            dateBasis={dateBasis}
          />
        ) : (
          <TransactionList
            transactions={transactions}
            onTransactionDeleted={onRefresh}
            dateBasis={dateBasis}
          />
        )}
      </Box>
    </Box>
  )
}

/* -------------------------------------------------------------------------- */
/* Sub-components                                                              */
/* -------------------------------------------------------------------------- */

interface ViewToggleButtonProps {
  icon: any
  label: string
  isActive: boolean
  onClick: () => void
  activeBg: string
  activeShadow: string
  activeColor: string
  inactiveColor: string
  hoverColor: string
}

function ViewToggleButton({
  icon: IconComponent,
  label,
  isActive,
  onClick,
  activeBg,
  activeShadow,
  activeColor,
  inactiveColor,
  hoverColor,
}: ViewToggleButtonProps) {
  return (
    <Box
      as="button"
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={onClick}
      display="flex"
      alignItems="center"
      gap={1.5}
      px={3}
      py={1.5}
      borderRadius="lg"
      bg={isActive ? activeBg : 'transparent'}
      color={isActive ? activeColor : inactiveColor}
      fontWeight={isActive ? 700 : 600}
      fontSize="sm"
      boxShadow={isActive ? activeShadow : 'none'}
      cursor="pointer"
      transition="all 0.2s ease"
      _hover={{
        color: isActive ? activeColor : hoverColor,
      }}
    >
      <Icon as={IconComponent} boxSize={4} weight={isActive ? 'duotone' : 'regular'} />
      <Text as="span" lineHeight={1} display={{ base: 'none', sm: 'inline' }}>
        {label}
      </Text>
    </Box>
  )
}

function EmptyState() {
  const { t } = useI18n()
  const textColor = 'var(--pb-ink-soft)'
  const iconColor = 'var(--pb-ink-faint)'

  return (
    <VStack spacing={3} py={16} align="center">
      <Flex
        w={14}
        h={14}
        align="center"
        justify="center"
        borderRadius="2xl"
        bg="var(--pb-surface-2)"
        border="1px solid var(--pb-hair)"
      >
        <Icon as={ReceiptText} boxSize={7} color={iconColor} weight="duotone" />
      </Flex>
      <VStack spacing={1}>
        <Text fontSize="md" fontWeight={700} color={textColor}>
          {t('transactions.emptyTitle')}
        </Text>
        <Text fontSize="sm" color={textColor} opacity={0.7} maxW="320px" textAlign="center">
          {t('transactions.emptyHistory')}
        </Text>
      </VStack>
    </VStack>
  )
}
