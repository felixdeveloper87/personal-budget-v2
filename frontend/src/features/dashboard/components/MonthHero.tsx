import { useMemo, useState } from 'react'
import { Avatar, Box, Grid, HStack, IconButton, Text, VStack } from '@chakra-ui/react'
import { ArrowDown, ArrowUp, CreditCard, Eye, EyeOff, House, Landmark, Target, type LucideIcon } from 'lucide-react'
import type { Transaction } from '../../../types'
import type { AppPage } from '../../../components/layout/header/navigation.config'
import { useI18n } from '../../../i18n'
import { getMonthToDateComparison, getVariableSpending } from '../heroMetrics'

interface MonthHeroProps {
  income: number
  expense: number
  previousExpense?: number | null
  transactions: Transaction[]
  date?: Date
  userName?: string
  onAddIncome?: () => void
  onAddExpense?: () => void
  onPageChange?: (page: AppPage) => void
}

const MASK = '••••'

/** Faint concentric rings anchored top-right: texture for the purple header. */
function HeaderArtwork() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 720 200" preserveAspectRatio="xMaxYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="nuHeaderBase" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6e08b3" />
          <stop offset="0.6" stopColor="#820ad1" />
          <stop offset="1" stopColor="#8f1bdc" />
        </linearGradient>
        <radialGradient id="nuHeaderGlow" cx="92%" cy="15%" r="55%">
          <stop offset="0" stopColor="#d9a8ff" stopOpacity="0.24" />
          <stop offset="1" stopColor="#d9a8ff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="720" height="200" fill="url(#nuHeaderBase)" />
      <rect width="720" height="200" fill="url(#nuHeaderGlow)" />
      <g fill="none" stroke="#fff">
        <circle cx="680" cy="40" r="70" strokeOpacity="0.08" />
        <circle cx="680" cy="40" r="115" strokeOpacity="0.06" />
        <circle cx="680" cy="40" r="160" strokeOpacity="0.045" />
        <circle cx="680" cy="40" r="205" strokeOpacity="0.03" />
      </g>
      <circle cx="560" cy="150" r="3" fill="#fff" opacity="0.25" />
    </svg>
  )
}

interface ShortcutProps {
  icon: LucideIcon
  label: string
  onClick: () => void
  tint?: string
}

function Shortcut({ icon: Icon, label, onClick, tint = 'var(--pb-ink)' }: ShortcutProps) {
  return (
    <VStack
      as="button"
      type="button"
      onClick={onClick}
      aria-label={label}
      spacing={2}
      w="76px"
      flexShrink={0}
      role="group"
    >
      <Box
        display="grid"
        placeItems="center"
        w="64px"
        h="64px"
        borderRadius="full"
        bg="var(--nu-surface)"
        color={tint}
        transition="background 0.15s ease, transform 0.15s ease"
        _groupHover={{ bg: 'var(--nu-surface-hover)' }}
        _groupActive={{ transform: 'scale(0.95)' }}
      >
        <Icon size={22} strokeWidth={2.2} />
      </Box>
      <Text fontSize="xs" fontWeight={500} color="var(--pb-ink)" textAlign="center" lineHeight={1.25} noOfLines={2}>
        {label}
      </Text>
    </VStack>
  )
}

interface MetricProps {
  label: string
  value: string
  change: { amount?: string; direction: -1 | 0 | 1; label: string } | null
  favourable: boolean
  caption: string
}

function Metric({ label, value, change, favourable, caption }: MetricProps) {
  return (
    <Box minW={0}>
      <Text fontSize="sm" color="var(--pb-ink-soft)">{label}</Text>
      <Text mt={1} fontSize={{ base: 'xl', md: '2xl' }} fontWeight={700} letterSpacing="-0.01em" color="var(--pb-ink)" noOfLines={1}
        sx={{ fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </Text>
      <Text mt={1} fontSize="xs" color="var(--pb-ink-soft)" noOfLines={1}>
        {change && change.direction !== 0 && change.amount ? (
          <Text as="span" fontWeight={600} color={favourable ? 'var(--nu-positive)' : 'var(--nu-negative)'}>
            {change.direction > 0 ? '↑ ' : '↓ '}{change.amount}
          </Text>
        ) : change?.label}
        {' '}{caption}
      </Text>
    </Box>
  )
}

export default function MonthHero({
  income,
  expense,
  previousExpense,
  transactions,
  date,
  userName,
  onAddIncome,
  onAddExpense,
  onPageChange,
}: MonthHeroProps) {
  const { t, formatCurrency, formatDate, formatNumber } = useI18n()
  const [hidden, setHidden] = useState(false)
  const currentDate = date ?? new Date()
  const net = income - expense
  const money = (value: number) => (hidden ? MASK : formatCurrency(value))
  const firstName = userName?.trim().split(/\s+/)[0] ?? ''
  const hour = new Date().getHours()
  const greeting = t(hour < 12 ? 'dashboard.goodMorning' : hour < 18 ? 'dashboard.goodAfternoon' : 'dashboard.goodEvening')
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()

  const incomeComparison = useMemo(
    () => getMonthToDateComparison(transactions, 'INCOME', currentDate),
    [transactions, currentDate],
  )
  const spending = useMemo(() => getVariableSpending(transactions, currentDate), [transactions, currentDate])

  const getChange = (value: number, previous: number | null | undefined) => {
    if (previous === null || previous === undefined) return null
    const difference = Math.round((value - previous) * 100) / 100
    if (difference === 0) return { direction: 0 as const, label: t('dashboard.noMonthlyChange') }
    const amount = previous === 0
      ? formatCurrency(Math.abs(difference))
      : `${formatNumber(Math.abs(difference / previous) * 100, { maximumFractionDigits: 1 })}%`
    return {
      amount,
      direction: (difference > 0 ? 1 : -1) as 1 | -1,
      label: t(difference > 0 ? 'dashboard.monthlyChangeHigher' : 'dashboard.monthlyChangeLower', { amount }),
    }
  }

  const incomeChange = getChange(incomeComparison.current, incomeComparison.previous)
  const paymentsChange = getChange(expense, previousExpense)
  const balanceCaption = income === 0 && expense === 0
    ? t('dashboard.balanceNoTransactions')
    : net > 0 ? t('dashboard.balanceAhead') : net < 0 ? t('dashboard.balanceBehind') : t('dashboard.balanceEven')

  return (
    <Box>
      {/* Purple header */}
      <Box position="relative" overflow="hidden" bg="var(--nu-brand)" color="white" px={{ base: 4, md: 6 }} pt={{ base: 5, md: 6 }} pb={{ base: 6, md: 7 }}>
        <Box position="absolute" inset={0} pointerEvents="none"><HeaderArtwork /></Box>
        <HStack position="relative" justify="space-between" align="center">
          <HStack spacing={3} minW={0}>
            {userName && (
              <Avatar name={userName} size="md" bg="rgba(255,255,255,0.18)" color="white" fontWeight={700} />
            )}
            <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight={700} letterSpacing="-0.01em" noOfLines={1}>
              {greeting}{firstName ? `, ${firstName}` : ''}
            </Text>
          </HStack>
          <IconButton
            aria-label={t(hidden ? 'dashboard.showValues' : 'dashboard.hideValues')}
            title={t(hidden ? 'dashboard.showValues' : 'dashboard.hideValues')}
            icon={hidden ? <EyeOff size={20} /> : <Eye size={20} />}
            onClick={() => setHidden((value) => !value)}
            variant="ghost"
            color="white"
            borderRadius="full"
            _hover={{ bg: 'rgba(255,255,255,0.16)' }}
            _active={{ bg: 'rgba(255,255,255,0.24)' }}
          />
        </HStack>
      </Box>

      {/* Net + shortcuts */}
      <Grid
        templateColumns={{ base: '1fr', lg: 'minmax(0, 1fr) auto' }}
        gap={{ base: 5, lg: 8 }}
        alignItems="center"
        px={{ base: 4, md: 6 }}
        py={{ base: 5, md: 6 }}
      >
        <Box minW={0}>
          <HStack justify="space-between" align="baseline" spacing={3}>
            <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight={600} color="var(--pb-ink)">{t('dashboard.netThisMonth')}</Text>
            <Text fontSize="sm" color="var(--pb-ink-soft)" sx={{ fontVariantNumeric: 'tabular-nums' }} textTransform="capitalize" noOfLines={1}>
              {formatDate(currentDate, { month: 'long' })} · {t('dashboard.dayOfMonth', { day: currentDate.getDate(), total: daysInMonth })}
            </Text>
          </HStack>
          <Text mt={2} fontSize={{ base: '3xl', md: '4xl' }} fontWeight={700} letterSpacing="-0.02em" lineHeight={1.1} color="var(--pb-ink)"
            sx={{ fontVariantNumeric: 'tabular-nums' }} aria-label={hidden ? t('dashboard.hiddenValue') : undefined}>
            {money(net)}
          </Text>
          <HStack mt={1.5} spacing={2}>
            <Box w="7px" h="7px" borderRadius="full" bg={net < 0 ? 'var(--nu-negative)' : 'var(--nu-positive)'} />
            <Text fontSize="sm" color="var(--pb-ink-soft)">{balanceCaption}</Text>
          </HStack>
        </Box>

        <HStack
          spacing={{ base: 2, md: 3 }}
          overflowX="auto"
          mx={{ base: -4, md: 0 }}
          px={{ base: 4, md: 0 }}
          sx={{ scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}
        >
          {onAddIncome && <Shortcut icon={ArrowUp} label={t('dashboard.addIncome')} onClick={onAddIncome} tint="var(--nu-positive)" />}
          {onAddExpense && <Shortcut icon={ArrowDown} label={t('dashboard.addExpense')} onClick={onAddExpense} tint="var(--nu-negative)" />}
          {onPageChange && (
            <>
              <Shortcut icon={CreditCard} label={t('dashboard.shortcutCards')} onClick={() => onPageChange('cards')} />
              <Shortcut icon={Landmark} label={t('dashboard.shortcutAccounts')} onClick={() => onPageChange('accounts')} />
              <Shortcut icon={House} label={t('dashboard.shortcutHousehold')} onClick={() => onPageChange('household')} />
              <Shortcut icon={Target} label={t('dashboard.shortcutPlanning')} onClick={() => onPageChange('planning')} />
            </>
          )}
        </HStack>
      </Grid>

      {/* Income · Payments · Everyday spending */}
      <Grid
        templateColumns={{ base: 'repeat(2, minmax(0, 1fr))', lg: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.4fr)' }}
        gap={{ base: 4, md: 6 }}
        borderTop="1px solid var(--pb-hair)"
        px={{ base: 4, md: 6 }}
        py={{ base: 5, md: 6 }}
        alignItems="stretch"
      >
        <Box pr={{ base: 2, md: 4 }} borderRight="1px solid var(--pb-hair)">
          <Metric
            label={t('dashboard.income')}
            value={money(income)}
            change={incomeChange}
            favourable={(incomeChange?.direction ?? 0) > 0}
            caption={t('dashboard.vsSameDayLastMonth')}
          />
        </Box>
        <Box pr={{ lg: 4 }} borderRight={{ lg: '1px solid var(--pb-hair)' }}>
          <Metric
            label={t('dashboard.payments')}
            value={money(expense)}
            change={paymentsChange}
            favourable={(paymentsChange?.direction ?? 0) < 0}
            caption={t('dashboard.vsPreviousMonth')}
          />
        </Box>

        <Box
          gridColumn={{ base: '1 / -1', lg: 'auto' }}
          bg="var(--nu-surface)"
          borderRadius="16px"
          p={4}
          role="group"
          aria-label={hidden ? `${t('dashboard.everydaySpending')}: ${t('dashboard.hiddenValue')}` : undefined}
        >
          <HStack justify="space-between" spacing={3}>
            <Text fontSize="sm" fontWeight={600} color="var(--pb-ink)">{t('dashboard.everydaySpending')}</Text>
            <Text fontSize="xs" fontWeight={700} color="var(--nu-brand)" bg="var(--nu-brand-tint)" px={2.5} py={1} borderRadius="full"
              whiteSpace="nowrap" sx={{ fontVariantNumeric: 'tabular-nums' }}>
              {money(spending.dailyAverage)}{' '}
              <Text as="span" fontWeight={500}>{t('dashboard.perDay')}</Text>
            </Text>
          </HStack>
          <Text mt={2} fontSize="2xl" fontWeight={700} letterSpacing="-0.01em" color="var(--pb-ink)" sx={{ fontVariantNumeric: 'tabular-nums' }}>
            {money(spending.spent)}
          </Text>
          <Box mt={3} h="6px" borderRadius="full" bg="var(--nu-track)" overflow="hidden">
            <Box h="full" w={`${spending.share * 100}%`} borderRadius="full" bg="var(--nu-brand)" transition="width 0.5s ease" />
          </Box>
          <HStack mt={2.5} justify="space-between" spacing={3}>
            <Text fontSize="xs" color="var(--pb-ink-soft)">{t('dashboard.monthEndAtPace')}</Text>
            <Text fontSize="sm" fontWeight={600} color="var(--pb-ink)" sx={{ fontVariantNumeric: 'tabular-nums' }}>
              {hidden ? MASK : spending.projection > 0 ? formatCurrency(spending.projection) : '—'}
            </Text>
          </HStack>
          <Text mt={1.5} fontSize="11px" color="var(--pb-ink-faint)">{t('dashboard.excludesCommitments')}</Text>
        </Box>
      </Grid>
    </Box>
  )
}
