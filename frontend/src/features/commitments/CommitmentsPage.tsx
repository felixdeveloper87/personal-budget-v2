import { useCallback, useEffect, useMemo, useState } from 'react'
import { Box, Flex, Text } from '@chakra-ui/react'
import { useReducedMotion } from 'framer-motion'
import { Repeat } from 'lucide-react'

import { listInstallmentPlans, listRecurringTransactions } from '../../api'
import type { InstallmentPlan, RecurringTransaction } from '../../types'
import type { AppPage } from '../../components/layout/header/navigation.config'
import { useAuth } from '../../contexts/AuthContext'
import { useI18n } from '../../i18n'

import '../dashboard/theme/pb-tokens.css'
import { containerV, MotionBox, riseV } from '../dashboard/components/motion'
import Segmented from '../dashboard/components/Segmented'
import NuHero, { NuHeroBadge } from '../dashboard/components/NuHero'

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
  const { t } = useI18n()
  const reduce = useReducedMotion() ?? false
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
    <Box minH="100vh">
      {/* Purple page header — same pattern as Payments and Earnings. */}
      <NuHero
        title={t('nav.commitments.label')}
        action={<NuHeroBadge><Repeat size={18} strokeWidth={2.4} aria-hidden="true" /></NuHeroBadge>}
      >
        <SummaryHero summary={summary} tab={tab} onTabChange={setTab} />
      </NuHero>

      {/* White sheet with rounded top tucked over the purple header. */}
      <Box maxW="appContent" mx="auto" px={{ base: 0, md: 4, lg: 6 }} mt="-24px" pb={{ base: 0, md: 7 }} position="relative">
        <MotionBox
          className="nu-dashboard"
          variants={containerV}
          initial={reduce ? false : 'hidden'}
          animate="show"
          bg="var(--nu-page)"
          borderTopRadius="24px"
          borderBottomRadius={{ base: 0, md: '24px' }}
          overflow="hidden"
          boxShadow={{ base: 'none', md: '0 1px 2px rgba(31,31,36,0.04), 0 18px 48px -24px rgba(31,31,36,0.18)' }}
        >
          <MotionBox variants={riseV}>
            {tab === 'fixed' ? (
              <FixedPaymentsPage embedded onPageChange={onPageChange} onDataChange={loadSummary} />
            ) : (
              <InstallmentsPage embedded onPageChange={onPageChange} onDataChange={loadSummary} />
            )}
          </MotionBox>
        </MotionBox>
      </Box>
    </Box>
  )
}

interface SummaryShape {
  fixedMonthly: number
  installmentsMonthly: number
  total: number
}

function SummaryHero({
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
  return (
    <Flex mt={{ base: 3, md: 4 }} direction={{ base: 'column', md: 'row' }} align={{ base: 'stretch', md: 'flex-end' }} justify="space-between" gap={{ base: 4, md: 8 }}>
      <Box minW={0}>
        <Text fontSize="sm" color="rgba(255,255,255,0.82)">{t('commitments.monthly')}</Text>
        <Text fontSize={{ base: '2rem', md: '2.5rem' }} fontWeight={700} letterSpacing="-0.02em" lineHeight={1.1} color="white" noOfLines={1}
          sx={{ fontVariantNumeric: 'tabular-nums' }}>
          {formatCurrency(summary.total)}
        </Text>
        <Text mt={1} fontSize="sm" color="rgba(255,255,255,0.82)" sx={{ fontVariantNumeric: 'tabular-nums' }}>
          {t('commitments.fixedPayments')}{' '}
          <Text as="span" color="white" fontWeight={600}>{formatCurrency(summary.fixedMonthly)}</Text>
          {' · '}
          {t('commitments.instalments')}{' '}
          <Text as="span" color="white" fontWeight={600}>{formatCurrency(summary.installmentsMonthly)}</Text>
        </Text>
      </Box>
      <Box flexShrink={0}>
        <Segmented
          tone="summary"
          options={tabOptions}
          value={tab}
          onChange={onTabChange}
          mobileFullWidth
          aria-label={t('commitments.view')}
        />
      </Box>
    </Flex>
  )
}
