import {
  Avatar,
  Box,
  Button,
  Grid,
  HStack,
  Text,
  VStack,
  useColorMode,
} from '@chakra-ui/react'
import {
  ArrowDown,
  ArrowUp,
  ChartNoAxesColumnIncreasing,
  Plus,
  type LucideIcon,
} from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { useI18n } from '../../../i18n'
import { DARK_PALETTE, LIGHT_PALETTE } from '../../../palette'
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

function MetricCard({
  background,
  borderColor,
  icon: Icon,
  iconBackground,
  label,
  value,
  valueColor,
}: MetricCardProps) {
  return (
    <HStack
      minH={{ base: '72px', md: '88px' }}
      spacing={{ base: 2, md: 3 }}
      px={{ base: 2, md: 4 }}
      py={3}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="18px"
      bg={background}
    >
      <Box
        display="grid"
        placeItems="center"
        flexShrink={0}
        w={{ base: '34px', md: '46px' }}
        h={{ base: '34px', md: '46px' }}
        borderRadius={{ base: '11px', md: '15px' }}
        bg={iconBackground}
        color={valueColor}
      >
        <Icon size={20} strokeWidth={2.4} />
      </Box>
      <Box minW={0} flex={1}>
        <Text fontFamily="var(--pb-serif)" fontSize={{ base: 'xs', md: 'sm' }} color="var(--pb-ink-soft)" noOfLines={1}>
          {label}
        </Text>
        <Text
          mt={0.5}
          fontFamily="var(--pb-serif)"
          fontSize={{ base: 'clamp(0.85rem, 4vw, 1.1rem)', md: 'clamp(1.25rem, 2.2vw, 1.7rem)' }}
          fontWeight={600}
          lineHeight={1.05}
          color={valueColor}
          noOfLines={1}
          sx={{ fontVariantNumeric: 'tabular-nums lining-nums' }}
        >
          {value}
        </Text>
      </Box>
    </HStack>
  )
}

export default function MonthHero({
  income,
  expense,
  date,
  userName,
  onAddIncome,
  onAddExpense,
}: MonthHeroProps) {
  const { t, formatCurrency, formatDate } = useI18n()
  const { colorMode } = useColorMode()
  const palette = colorMode === 'dark' ? DARK_PALETTE : LIGHT_PALETTE
  const currentDate = date ?? new Date()
  const net = income - expense
  const totalFlow = income + expense
  const expenseShare = totalFlow > 0 ? Math.round((expense / totalFlow) * 100) : 0
  const firstName = userName?.trim().split(/\s+/)[0] ?? ''
  const hour = new Date().getHours()
  const greeting = t(
    hour < 12
      ? 'dashboard.goodMorning'
      : hour < 18
        ? 'dashboard.goodAfternoon'
        : 'dashboard.goodEvening',
  )
  const monthLabel = formatDate(currentDate, { month: 'long', year: 'numeric' })
  const pieData = totalFlow > 0
    ? [
        { name: t('dashboard.income'), value: income },
        { name: t('dashboard.expense'), value: expense },
      ]
    : [{ name: t('dashboard.noActivity'), value: 1 }]

  return (
    <Panel
      p={{ base: 4, md: 5, lg: 6 }}
      overflow="hidden"
      background="var(--pb-paper-3)"
      borderColor="var(--pb-hair-2)"
      boxShadow="var(--pb-shadow-lift)"
    >
      <VStack align="stretch" spacing={{ base: 4, md: 5 }}>
        {userName && (
          <HStack spacing={3}>
            <Avatar
              name={userName}
              size="md"
              bg="var(--pb-forest)"
              color="var(--pb-paper-3)"
              fontFamily="var(--pb-mono)"
              fontWeight={700}
            />
            <Box minW={0}>
              <Text fontFamily="var(--pb-serif)" fontSize="sm" color="var(--pb-ink-soft)">
                {greeting},
              </Text>
              <Text
                fontFamily="var(--pb-serif)"
                fontSize="xl"
                fontWeight={600}
                lineHeight={1.05}
                color="var(--pb-ink)"
                noOfLines={1}
              >
                {firstName}
              </Text>
            </Box>
          </HStack>
        )}

        <Box>
          <Text
            fontFamily="var(--pb-serif)"
            fontSize="clamp(2rem, 4.3vw, 3.35rem)"
            fontWeight={600}
            letterSpacing="-0.035em"
            lineHeight={1}
            color="var(--pb-ink)"
            textTransform="capitalize"
          >
            {monthLabel}
          </Text>
          <Text mt={1.5} fontFamily="var(--pb-serif)" fontSize={{ base: 'md', md: 'lg' }} color="var(--pb-ink-soft)">
            {t('dashboard.monthlyBudgetSnapshot')}
          </Text>
        </Box>

        <Grid
          templateColumns={{ base: 'minmax(0, 1.15fr) minmax(0, 0.85fr)', md: 'minmax(0, 1.05fr) minmax(260px, 0.95fr)' }}
          gap={3}
          alignItems="stretch"
        >
          <VStack align="stretch" spacing={2.5}>
            <MetricCard
              background="var(--pb-tint-income)"
              borderColor="rgba(59, 112, 91, 0.2)"
              icon={ArrowUp}
              iconBackground="rgba(59, 112, 91, 0.16)"
              label={t('dashboard.income')}
              value={formatCurrency(income)}
              valueColor="var(--pb-income-2)"
            />
            <MetricCard
              background="var(--pb-tint-coral)"
              borderColor="rgba(164, 81, 72, 0.2)"
              icon={ArrowDown}
              iconBackground="rgba(164, 81, 72, 0.15)"
              label={t('dashboard.expense')}
              value={formatCurrency(expense)}
              valueColor="var(--pb-coral-2)"
            />
            <MetricCard
              background="var(--pb-tint-gold)"
              borderColor="rgba(128, 104, 50, 0.22)"
              icon={ChartNoAxesColumnIncreasing}
              iconBackground="rgba(128, 104, 50, 0.16)"
              label={t('dashboard.netThisMonth')}
              value={formatCurrency(net)}
              valueColor={net < 0 ? 'var(--pb-coral-2)' : 'var(--pb-gold-2)'}
            />
          </VStack>

          <VStack
            align="stretch"
            justify="center"
            spacing={3}
            h="full"
            p={{ base: 2, md: 5 }}
            border="1px solid"
            borderColor="var(--pb-hair)"
            borderRadius="20px"
            bg="var(--pb-surface-2)"
          >
            <Box position="relative" h={{ base: '142px', md: '230px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius="58%"
                    outerRadius="82%"
                    startAngle={90}
                    endAngle={-270}
                    stroke={palette['paper-3']}
                    strokeWidth={3}
                    isAnimationActive
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={totalFlow > 0
                          ? index === 0 ? palette.income : palette.coral
                          : palette['surface-3']}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <VStack
                pointerEvents="none"
                position="absolute"
                inset={0}
                align="center"
                justify="center"
                spacing={0}
              >
                <Text fontFamily="var(--pb-serif)" fontSize="2xl" fontWeight={600} color="var(--pb-ink)">
                  {expenseShare}%
                </Text>
                <Text fontFamily="var(--pb-mono)" fontSize="9px" letterSpacing="0.12em" textTransform="uppercase" color="var(--pb-ink-faint)">
                  {t('dashboard.outflow')}
                </Text>
              </VStack>
            </Box>

            <VStack align="stretch" spacing={1.5}>
              {[
                { label: t('dashboard.income'), value: income, color: 'var(--pb-income-2)' },
                { label: t('dashboard.expense'), value: expense, color: 'var(--pb-coral-2)' },
              ].map((item) => (
                <HStack key={item.label} justify="space-between" spacing={3}>
                  <HStack spacing={2}>
                    <Box w="9px" h="9px" borderRadius="full" bg={item.color} />
                    <Text fontFamily="var(--pb-serif)" fontSize="sm" color="var(--pb-ink-soft)">
                      {item.label}
                    </Text>
                  </HStack>
                  <Text display={{ base: 'none', sm: 'block' }} fontFamily="var(--pb-serif)" fontSize="sm" fontWeight={600} color={item.color}>
                    {formatCurrency(item.value)}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </VStack>
        </Grid>

        {(onAddIncome || onAddExpense) && (
          <Grid templateColumns="repeat(2, minmax(0, 1fr))" gap={{ base: 2, md: 3 }}>
            {onAddIncome && (
              <Button
                h={{ base: '48px', md: '54px' }}
                borderRadius={{ base: '13px', md: '17px' }}
                bg="var(--pb-forest)"
                color="var(--pb-paper-3)"
                leftIcon={<Plus size={19} strokeWidth={2.4} />}
                fontFamily="var(--pb-serif)"
                fontSize={{ base: 'sm', md: 'md' }}
                px={{ base: 2, md: 4 }}
                fontWeight={600}
                onClick={onAddIncome}
                _hover={{ bg: 'var(--pb-forest-2)', transform: 'translateY(-1px)' }}
                _active={{ transform: 'translateY(0)' }}
              >
                {t('dashboard.addIncome')}
              </Button>
            )}
            {onAddExpense && (
              <Button
                h={{ base: '48px', md: '54px' }}
                borderRadius={{ base: '13px', md: '17px' }}
                bg="var(--pb-coral-2)"
                color="white"
                leftIcon={<Plus size={19} strokeWidth={2.4} />}
                fontFamily="var(--pb-serif)"
                fontSize={{ base: 'sm', md: 'md' }}
                px={{ base: 2, md: 4 }}
                fontWeight={600}
                onClick={onAddExpense}
                _hover={{ bg: 'var(--pb-coral)', transform: 'translateY(-1px)' }}
                _active={{ transform: 'translateY(0)' }}
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
