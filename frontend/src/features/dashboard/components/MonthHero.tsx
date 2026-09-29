import { Avatar, Box, Button, Grid, HStack, Text, VStack } from '@chakra-ui/react'
import { ArrowDown, ArrowDownRight, ArrowUp, ArrowUpRight, ChartNoAxesColumnIncreasing, Minus, Plus, type LucideIcon } from 'lucide-react'
import { useId } from 'react'
import { useI18n } from '../../../i18n'
import DashboardHeroArtwork from './DashboardHeroArtwork'
import Panel from './Panel'

interface MonthHeroProps {
  income: number
  expense: number
  previousIncome?: number | null
  previousExpense?: number | null
  date?: Date
  userName?: string
  onAddIncome?: () => void
  onAddExpense?: () => void
}

interface MetricCardProps {
  background: string
  borderColor: string
  icon: LucideIcon
  iconBackground: string
  label: string
  value: string
  valueColor: string
  comparison?: {
    caption: string
    direction: -1 | 0 | 1
    favourable: boolean
    label: string
  }
}

function MetricCard({ background, borderColor, comparison, icon: Icon, iconBackground, label, value, valueColor }: MetricCardProps) {
  const ComparisonIcon = comparison?.direction === 1
    ? ArrowUpRight
    : comparison?.direction === -1
      ? ArrowDownRight
      : Minus

  return (
    <HStack
      flex={1}
      minH={{ base: '62px', md: '82px' }} spacing={{ base: 1.5, md: 2.5 }} px={{ base: 1.5, md: 3 }} py={{ base: 1.5, md: 2 }}
      border="1px solid" borderColor={borderColor} borderRadius="18px" bg={background} backdropFilter="blur(8px)"
    >
      <Box
        display="grid" placeItems="center" flexShrink={0} w={{ base: '30px', md: '40px' }} h={{ base: '30px', md: '40px' }}
        borderRadius={{ base: '12px', md: '15px' }} bg={iconBackground} color={valueColor}
      >
        <Icon size={20} strokeWidth={2.4} />
      </Box>
      <Box minW={0} flex={1}>
        <Text fontFamily="var(--pb-serif)" fontSize={{ base: 'xs', md: 'sm' }} color="#52635E" noOfLines={1}>{label}</Text>
        <Text
          mt={0.5} fontFamily="var(--pb-serif)" fontSize={{ base: 'md', md: 'clamp(1.25rem, 2.2vw, 1.7rem)' }}
          fontWeight={700} lineHeight={1.05} color={valueColor} noOfLines={1}
          sx={{ fontVariantNumeric: 'tabular-nums lining-nums' }}
        >
          {value}
        </Text>
        {comparison && (
          <Box mt={{ base: 1, md: 1.5 }} minW={0}>
            <HStack spacing={1} color={comparison.direction === 0 ? '#52635E' : comparison.favourable ? '#2F7257' : '#A45148'}>
              <ComparisonIcon size={13} strokeWidth={2.4} aria-hidden="true" />
              <Text fontFamily="var(--pb-serif)" fontSize={{ base: '10px', md: 'xs' }} fontWeight={700} lineHeight={1.1} noOfLines={1}>
                {comparison.label}
              </Text>
            </HStack>
            <Text mt={0.5} fontFamily="var(--pb-serif)" fontSize={{ base: '9px', md: '10px' }} color="#52635E" lineHeight={1.1} noOfLines={1}>
              {comparison.caption}
            </Text>
          </Box>
        )}
      </Box>
    </HStack>
  )
}

function ActionButtonArtwork({ tone }: { tone: 'income' | 'expense' }) {
  const id = useId().replace(/:/g, '')
  const isIncome = tone === 'income'
  const skyId = `${id}-sky`
  const curveId = `${id}-curve`

  return (
    <svg
      aria-hidden="true"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 390 106"
      width="100%"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={skyId} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor={isIncome ? '#173D31' : '#6E302E'} />
          <stop offset="0.58" stopColor={isIncome ? '#285847' : '#91463E'} />
          <stop offset="1" stopColor={isIncome ? '#496D55' : '#B66E58'} />
        </linearGradient>
        <linearGradient id={curveId} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={isIncome ? '#D9C896' : '#F3C89E'} stopOpacity={isIncome ? 0.16 : 0.12} />
          <stop offset="1" stopColor={isIncome ? '#F2E6BE' : '#F8DFBE'} stopOpacity={isIncome ? 0.42 : 0.45} />
        </linearGradient>
      </defs>
      <rect fill={`url(#${skyId})`} height="106" width="390" />
      <circle cx={isIncome ? 326 : 330} cy={isIncome ? 18 : 16} fill={isIncome ? '#F1D98E' : '#F2C87F'} opacity={isIncome ? 0.82 : 0.88} r={isIncome ? 25 : 24} />
      <circle cx={isIncome ? 326 : 330} cy={isIncome ? 18 : 16} fill="none" opacity={isIncome ? 0.23 : 0.24} r={35} stroke={isIncome ? '#FFF5D6' : '#FFF0D5'} />
      <path
        d={isIncome ? 'M170 106 C220 62 276 62 390 82 L390 106 Z' : 'M150 106 C214 60 286 64 390 81 L390 106 Z'}
        fill={`url(#${curveId})`}
      />
      <path
        d={isIncome ? 'M220 106 C272 74 327 72 390 90 L390 106 Z' : 'M218 106 C274 77 333 76 390 91 L390 106 Z'}
        fill={isIncome ? '#102E27' : '#562825'}
        opacity={isIncome ? 0.48 : 0.5}
      />
      <path
        d={isIncome ? 'M286 106 C318 83 348 81 390 91' : 'M270 106 C310 82 352 82 390 93'}
        fill="none"
        opacity="0.2"
        stroke={isIncome ? '#FFF8E8' : '#FFF4E4'}
        strokeWidth="1"
      />
    </svg>
  )
}

export default function MonthHero({ income, expense, previousIncome, previousExpense, date, userName, onAddIncome, onAddExpense }: MonthHeroProps) {
  const { t, formatCurrency, formatDate, formatNumber } = useI18n()
  const currentDate = date ?? new Date()
  const net = income - expense
  const usage = income > 0 ? expense / income : null
  const spentShare = usage === null ? (expense > 0 ? 1 : 0) : Math.min(1, Math.max(0, usage))
  const remainingShare = income > 0 ? 1 - spentShare : 0
  const elapsedDays = Math.max(1, currentDate.getDate())
  const dailyAverage = expense / elapsedDays
  const firstName = userName?.trim().split(/\s+/)[0] ?? ''
  const hour = new Date().getHours()
  const greeting = t(hour < 12 ? 'dashboard.goodMorning' : hour < 18 ? 'dashboard.goodAfternoon' : 'dashboard.goodEvening')
  const monthLabel = formatDate(currentDate, { month: 'long', year: 'numeric' })
  const getComparison = (value: number, previousValue: number | null | undefined, kind: 'income' | 'expense') => {
    if (previousValue === null || previousValue === undefined) return undefined

    const difference = Math.round((value - previousValue) * 100) / 100
    const direction = difference === 0 ? 0 : difference > 0 ? 1 : -1
    const amount = previousValue === 0 && difference !== 0
      ? formatCurrency(Math.abs(difference))
      : `${formatNumber(previousValue === 0 ? 0 : Math.abs(difference / previousValue) * 100, { maximumFractionDigits: 1 })}%`

    return {
      caption: t('dashboard.vsPreviousMonth'),
      direction: direction as -1 | 0 | 1,
      favourable: direction !== 0 && (kind === 'income' ? direction > 0 : direction < 0),
      label: direction === 0
        ? t('dashboard.noMonthlyChange')
        : t(direction > 0 ? 'dashboard.monthlyChangeHigher' : 'dashboard.monthlyChangeLower', { amount }),
    }
  }

  const incomeComparison = getComparison(income, previousIncome, 'income')
  const expenseComparison = getComparison(expense, previousExpense, 'expense')

  return (
    <Panel
      p={0} overflow="hidden" position="relative" background="#E9D3B0"
      borderColor="rgba(126, 91, 48, 0.2)" boxShadow="var(--pb-shadow-lift)"
    >
      <Box position="absolute" inset={0} pointerEvents="none"><DashboardHeroArtwork /></Box>
      <Box position="absolute" inset={0} bg="rgba(255,247,230,0.08)" pointerEvents="none" />

      <VStack position="relative" zIndex={1} align="stretch" spacing={{ base: 4, md: 5 }} p={{ base: 4, md: 5, lg: 6 }}>
        {userName && (
          <HStack spacing={3}>
            <Avatar name={userName} size="md" bg="#285F45" color="white" fontFamily="var(--pb-mono)" fontWeight={700} />
            <Box minW={0}>
              <Text fontFamily="var(--pb-serif)" fontSize="sm" fontWeight={600} color="#52635E">{greeting},</Text>
              <Text fontFamily="var(--pb-serif)" fontSize="2xl" fontWeight={700} lineHeight={1.05} color="#24383A" noOfLines={1}>{firstName}</Text>
            </Box>
          </HStack>
        )}

        <Box>
          <Text
            fontFamily="var(--pb-serif)" fontSize="clamp(2rem, 4.3vw, 3.35rem)" fontWeight={700}
            letterSpacing="-0.035em" lineHeight={1} color="#24383A" textTransform="capitalize"
          >
            {monthLabel}
          </Text>
          <Text mt={1.5} fontFamily="var(--pb-serif)" fontSize={{ base: 'md', md: 'lg' }} color="#52635E">
            {t('dashboard.monthlyBudgetSnapshot')}
          </Text>
        </Box>

        <Grid
          templateColumns={{
            base: 'minmax(0, 1fr) minmax(0, 1fr)',
            md: 'minmax(0, 1fr) minmax(280px, 1fr)',
          }}
          gap={{ base: 2.5, md: 3 }}
          alignItems="stretch"
        >
          <VStack align="stretch" spacing={{ base: 1.5, md: 2 }} h="full">
            <MetricCard background="rgba(242,249,233,0.88)" borderColor="rgba(255,255,255,0.66)" icon={ArrowUp}
              iconBackground="#C9E6D4" label={t('dashboard.income')} value={formatCurrency(income)} valueColor="#2F7257"
              comparison={incomeComparison} />
            <MetricCard background="rgba(255,239,229,0.9)" borderColor="rgba(255,255,255,0.66)" icon={ArrowDown}
              iconBackground="#F0D1CA" label={t('dashboard.expense')} value={formatCurrency(expense)} valueColor="#A45148"
              comparison={expenseComparison} />
            <MetricCard background="rgba(250,240,211,0.9)" borderColor="rgba(255,255,255,0.66)" icon={ChartNoAxesColumnIncreasing}
              iconBackground="#E4DAB8" label={t('dashboard.netThisMonth')} value={formatCurrency(net)} valueColor={net < 0 ? '#A45148' : '#806832'} />
          </VStack>

          <VStack
            align="stretch" justify="center" spacing={{ base: 3, md: 4 }} h="full" p={{ base: 3, md: 5 }} border="1px solid"
            borderColor="rgba(255,255,255,0.68)" borderRadius="20px" bg="rgba(255,248,237,0.88)" backdropFilter="blur(10px)"
          >
            <Box>
              <Text fontFamily="var(--pb-serif)" fontSize={{ base: 'sm', md: 'md' }} fontWeight={700} color="#24383A">{t('dashboard.incomeUsed')}</Text>
              <Text
                mt={1} fontFamily="var(--pb-serif)" fontSize={{ base: '3xl', md: '4xl' }} fontWeight={800} noOfLines={1}
                color={usage !== null && usage > 1 ? '#A45148' : '#2F7257'}
              >
                {usage === null ? '—' : `${Math.round(usage * 100)}%`}
              </Text>
              <Text fontFamily="var(--pb-serif)" fontSize={{ base: 'xs', md: 'sm' }} color="#52635E">
                {usage === null ? t('dashboard.noIncomeYet') : t('dashboard.ofIncomeSpent')}
              </Text>
            </Box>

            <HStack
              spacing={0} h="11px" overflow="hidden" borderRadius="full" bg="#E4DCCF"
              role="img" aria-label={`${t('dashboard.incomeUsed')}: ${usage === null ? t('dashboard.noIncomeYet') : `${Math.round(usage * 100)}%`}`}
            >
              <Box h="full" w={`${spentShare * 100}%`} bg="#D05F5B" />
              <Box h="full" w={`${remainingShare * 100}%`} bg="#3E9870" />
            </HStack>

            <Box>
              <Text fontFamily="var(--pb-serif)" fontSize="xs" color="#52635E">{t('dashboard.dailyAverage')}</Text>
              <Text mt={1} fontFamily="var(--pb-serif)" fontSize={{ base: 'md', md: 'lg' }} fontWeight={700} color="#24383A">{formatCurrency(dailyAverage)}</Text>
              <Text mt={1} fontFamily="var(--pb-serif)" fontSize="10px" color="#52635E">
                {t(elapsedDays === 1 ? 'dashboard.dayThisMonth' : 'dashboard.daysThisMonth', { count: elapsedDays })}
              </Text>
            </Box>
          </VStack>
        </Grid>

        {(onAddIncome || onAddExpense) && (
          <Grid templateColumns="repeat(2, minmax(0, 1fr))" gap={{ base: 2, md: 3 }}>
            {onAddIncome && (
              <Button
                h={{ base: '48px', md: '54px' }} borderRadius="17px" bg="#285F45" color="white" overflow="hidden" position="relative"
                fontFamily="var(--pb-serif)" fontWeight={700} onClick={onAddIncome}
                _hover={{ filter: 'brightness(0.94)', transform: 'translateY(-1px)' }}
                _active={{ filter: 'brightness(0.88)', transform: 'translateY(0)' }}
              >
                <Box position="absolute" inset={0} pointerEvents="none"><ActionButtonArtwork tone="income" /></Box>
                <HStack position="relative" zIndex={1} spacing={2}>
                  <Plus aria-hidden="true" size={19} strokeWidth={2.4} />
                  <Text as="span" fontFamily="inherit" fontWeight="inherit">{t('dashboard.addIncome')}</Text>
                </HStack>
              </Button>
            )}
            {onAddExpense && (
              <Button
                h={{ base: '48px', md: '54px' }} borderRadius="17px" bg="#D05F5B" color="white" overflow="hidden" position="relative"
                fontFamily="var(--pb-serif)" fontWeight={700} onClick={onAddExpense}
                _hover={{ filter: 'brightness(0.94)', transform: 'translateY(-1px)' }}
                _active={{ filter: 'brightness(0.88)', transform: 'translateY(0)' }}
              >
                <Box position="absolute" inset={0} pointerEvents="none"><ActionButtonArtwork tone="expense" /></Box>
                <HStack position="relative" zIndex={1} spacing={2}>
                  <Plus aria-hidden="true" size={19} strokeWidth={2.4} />
                  <Text as="span" fontFamily="inherit" fontWeight="inherit">{t('dashboard.addExpense')}</Text>
                </HStack>
              </Button>
            )}
          </Grid>
        )}
      </VStack>
    </Panel>
  )
}
