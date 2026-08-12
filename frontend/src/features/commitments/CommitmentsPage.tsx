import { useCallback, useEffect, useMemo, useState } from 'react'
import { Box, Flex, HStack, Text, VStack, useBreakpointValue, type BoxProps } from '@chakra-ui/react'

import { listInstallmentPlans, listRecurringTransactions } from '../../api'
import type { InstallmentPlan, RecurringTransaction } from '../../types'
import type { AppPage } from '../../components/layout/header/navigation.config'
import { useAuth } from '../../contexts/AuthContext'
import { useI18n } from '../../i18n'

import '../dashboard/theme/pb-tokens.css'
import { containerV, MotionBox, riseV } from '../dashboard/components/motion'
import Segmented from '../dashboard/components/Segmented'

import FixedPaymentsPage from '../../pages/FixedPaymentsPage'
import InstallmentsPage, { currentMonthInstallmentTotal } from '../../pages/InstallmentsPage'

export type CommitmentsTab = 'fixed' | 'installments'

interface CommitmentsPageProps {
  onPageChange?: (page: AppPage) => void
  /** Which tab to open on first render (used by legacy deep links). */
  initialTab?: CommitmentsTab
}

export default function CommitmentsPage({ onPageChange, initialTab = 'fixed' }: CommitmentsPageProps) {
  const { user } = useAuth()
  const [tab, setTab] = useState<CommitmentsTab>(initialTab)

  // Follow the deep link when it changes (e.g. arriving from the dashboard).
  useEffect(() => {
    setTab(initialTab)
  }, [initialTab])

  // Shared summary across both tabs — the total monthly commitment. Each tab
  // owns its own list/CRUD; it pings onDataChange so this stays in sync.
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([])
  const [plans, setPlans] = useState<InstallmentPlan[]>([])

  const loadSummary = useCallback(() => {
    if (!user?.token) return
    void listRecurringTransactions().then(setRecurring).catch(() => {})
    void listInstallmentPlans().then(setPlans).catch(() => {})
  }, [user?.token])

  useEffect(() => {
    loadSummary()
  }, [loadSummary])

  const summary = useMemo(() => {
    const fixedMonthly = recurring
      .filter((r) => r.active && r.type === 'EXPENSE')
      .reduce((sum, r) => sum + r.amount, 0)
    const installmentsMonthly = currentMonthInstallmentTotal(plans)
    return {
      fixedMonthly,
      installmentsMonthly,
      total: fixedMonthly + installmentsMonthly,
    }
  }, [recurring, plans])

  return (
    <Box minH="100vh" maxW="appContent" mx="auto" px={{ base: 2, md: 4, lg: 6 }} py={{ base: 4, md: 7 }}>
      <MotionBox variants={containerV} initial="hidden" animate="show">
        <VStack align="stretch" spacing={{ base: 4, md: 6 }}>

          <MotionBox variants={riseV}>
            <SummaryBar summary={summary} tab={tab} onTabChange={setTab} />
          </MotionBox>

          <MotionBox variants={riseV}>
            {tab === 'fixed' ? (
              <FixedPaymentsPage embedded onPageChange={onPageChange} onDataChange={loadSummary} />
            ) : (
              <InstallmentsPage embedded onPageChange={onPageChange} onDataChange={loadSummary} />
            )}
          </MotionBox>

        </VStack>
      </MotionBox>
    </Box>
  )
}

interface SummaryShape {
  fixedMonthly: number
  installmentsMonthly: number
  total: number
}

function SummaryBar({
  summary,
  tab,
  onTabChange,
}: {
  summary: SummaryShape
  tab: CommitmentsTab
  onTabChange: (tab: CommitmentsTab) => void
}) {
  const { t, formatCurrency } = useI18n()
  const tabOptions: Array<{ value: CommitmentsTab; label: string }> = [
    { value: 'fixed', label: t('commitments.fixedPayments') },
    { value: 'installments', label: t('commitments.instalments') },
  ]
  // Full-width segmented control on phones so the two options are easy to tap.
  const fullWidthToggle = useBreakpointValue({ base: true, md: false }) ?? false
  return (
    <Box
      borderRadius="16px"
      bg="var(--pb-surface)"
      border="1px solid var(--pb-hair)"
      boxShadow="var(--pb-shadow)"
      px={{ base: 4, md: 5 }}
      py={{ base: 4, md: 4 }}
    >
      <Flex
        direction={{ base: 'column', md: 'row' }}
        justify="space-between"
        align={{ base: 'stretch', md: 'center' }}
        gap={{ base: 4, md: 3 }}
      >
        <Box>
          <Text
            fontFamily="var(--pb-mono)"
            fontSize="9px"
            letterSpacing="0.16em"
            textTransform="uppercase"
            color="var(--pb-ink-faint)"
          >
            {t('commitments.monthly')}
          </Text>
          <Text
            fontFamily="var(--pb-serif)"
            fontSize={{ base: '1.9rem', md: '2rem' }}
            fontWeight={500}
            lineHeight="1.1"
            color="var(--pb-ink)"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {formatCurrency(summary.total, { minimumFractionDigits: 2 })}
          </Text>
        </Box>

        <Segmented
          options={tabOptions}
          value={tab}
          onChange={onTabChange}
          fullWidth={fullWidthToggle}
          aria-label={t('commitments.view')}
        />

        <HStack
          spacing={{ base: 0, md: 7 }}
          justify={{ base: 'space-between', md: 'flex-start' }}
          w={{ base: 'full', md: 'auto' }}
        >
          <Stat label={t('commitments.fixedPayments')} value={formatCurrency(summary.fixedMonthly, { minimumFractionDigits: 2 })} />
          <Stat label={t('commitments.instalments')} value={formatCurrency(summary.installmentsMonthly, { minimumFractionDigits: 2 })} align={{ base: 'right', md: 'left' }} />
        </HStack>
      </Flex>
    </Box>
  )
}

function Stat({ label, value, align }: { label: string; value: string; align?: BoxProps['textAlign'] }) {
  return (
    <Box textAlign={align}>
      <Text
        fontFamily="var(--pb-mono)"
        fontSize="9px"
        letterSpacing="0.12em"
        textTransform="uppercase"
        color="var(--pb-ink-faint)"
      >
        {label}
      </Text>
      <Text
        fontFamily="var(--pb-mono)"
        fontSize="md"
        fontWeight={500}
        color="var(--pb-ink-soft)"
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {value}
      </Text>
    </Box>
  )
}
