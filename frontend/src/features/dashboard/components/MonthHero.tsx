import { Avatar, Box, Button, Grid, HStack, Text, VStack } from '@chakra-ui/react'
import { ArrowDown, ArrowUp, ChartNoAxesColumnIncreasing, Plus, type LucideIcon } from 'lucide-react'
import { useI18n } from '../../../i18n'
import DashboardHeroArtwork from './DashboardHeroArtwork'
import Panel from './Panel'

interface MonthHeroProps {
  income: number
  expense: number
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
}

function MetricCard({ background, borderColor, icon: Icon, iconBackground, label, value, valueColor }: MetricCardProps) {
  return (
    <HStack
      minH={{ base: '70px', md: '92px' }} spacing={{ base: 2, md: 3 }} px={{ base: 2, md: 4 }} py={{ base: 2, md: 3 }}
      border="1px solid" borderColor={borderColor} borderRadius="18px" bg={background} backdropFilter="blur(8px)"
    >
      <Box
        display="grid" placeItems="center" flexShrink={0} w={{ base: '34px', md: '46px' }} h={{ base: '34px', md: '46px' }}
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
      </Box>
    </HStack>
  )
}

export default function MonthHero({ income, expense, date, userName, onAddIncome, onAddExpense }: MonthHeroProps) {
  const { t, formatCurrency, formatDate } = useI18n()
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
          <VStack align="stretch" spacing={2.5}>
            <MetricCard background="rgba(242,249,233,0.88)" borderColor="rgba(255,255,255,0.66)" icon={ArrowUp}
              iconBackground="#C9E6D4" label={t('dashboard.income')} value={formatCurrency(income)} valueColor="#2F7257" />
            <MetricCard background="rgba(255,239,229,0.9)" borderColor="rgba(255,255,255,0.66)" icon={ArrowDown}
              iconBackground="#F0D1CA" label={t('dashboard.expense')} value={formatCurrency(expense)} valueColor="#A45148" />
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

            <Grid templateColumns={{ base: '1fr', sm: '1fr 1fr' }} gap={{ base: 2, sm: 4 }}>
              <Box>
                <Text fontFamily="var(--pb-serif)" fontSize="xs" color="#52635E">{t('dashboard.spent')}</Text>
                <Text mt={1} fontFamily="var(--pb-serif)" fontSize={{ base: 'md', md: 'lg' }} fontWeight={700} color="#A45148">{formatCurrency(expense)}</Text>
              </Box>
              <Box
                borderTop={{ base: '1px solid rgba(36,56,60,0.14)', sm: 'none' }}
                borderLeft={{ base: 'none', sm: '1px solid rgba(36,56,60,0.14)' }}
                pt={{ base: 2, sm: 0 }}
                pl={{ base: 0, sm: 4 }}
              >
                <Text fontFamily="var(--pb-serif)" fontSize="xs" color="#52635E">{t('dashboard.dailyAverage')}</Text>
                <Text mt={1} fontFamily="var(--pb-serif)" fontSize={{ base: 'md', md: 'lg' }} fontWeight={700} color="#24383A">{formatCurrency(dailyAverage)}</Text>
                <Text mt={1} fontFamily="var(--pb-serif)" fontSize="10px" color="#52635E">
                  {t(elapsedDays === 1 ? 'dashboard.dayThisMonth' : 'dashboard.daysThisMonth', { count: elapsedDays })}
                </Text>
              </Box>
            </Grid>
          </VStack>
        </Grid>

        {(onAddIncome || onAddExpense) && (
          <Grid templateColumns="repeat(2, minmax(0, 1fr))" gap={{ base: 2, md: 3 }}>
            {onAddIncome && (
              <Button
                h={{ base: '48px', md: '54px' }} borderRadius="17px" bg="#285F45" color="white"
                leftIcon={<Plus size={19} strokeWidth={2.4} />} fontFamily="var(--pb-serif)" fontWeight={700}
                onClick={onAddIncome} _hover={{ bg: '#194C3F', transform: 'translateY(-1px)' }}
              >
                {t('dashboard.addIncome')}
              </Button>
            )}
            {onAddExpense && (
              <Button
                h={{ base: '48px', md: '54px' }} borderRadius="17px" bg="#D05F5B" color="white"
                leftIcon={<Plus size={19} strokeWidth={2.4} />} fontFamily="var(--pb-serif)" fontWeight={700}
                onClick={onAddExpense} _hover={{ bg: '#A45148', transform: 'translateY(-1px)' }}
              >
                {t('dashboard.addExpense')}
              </Button>
            )}
          </Grid>
        )}
      </VStack>
    </Panel>
  )
}
