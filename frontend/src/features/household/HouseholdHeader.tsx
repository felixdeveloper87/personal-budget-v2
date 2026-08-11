import { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Flex,
  Grid,
  HStack,
  Icon,
  Text,
  VStack,
} from '@chakra-ui/react'
import PeriodNavigator from '../../components/summary/PeriodNavigator'
import {
  CheckCircle2,
  Gear,
  Home,
  Plus,
  TrendingDown,
  TrendingUp,
  Wallet,
} from '../../components/ui/icons'
import type {
  HouseholdDashboard,
  HouseholdMonthSummary,
} from '../../types'

interface HouseholdHeaderProps {
  household: HouseholdDashboard
  onAddExpense: () => void
  onManage: () => void
}

const monthStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1)

const monthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

const parseMonth = (value: string) => {
  const match = /^(\d{4})-(\d{2})$/.exec(value)
  if (!match) return null
  const month = Number(match[2])
  if (month < 1 || month > 12) return null
  return new Date(Number(match[1]), month - 1, 1)
}

const money = (value: number, currency: string) =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value)

const monthLabel = (date: Date) =>
  date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

export default function HouseholdHeader({
  household,
  onAddExpense,
  onManage,
}: HouseholdHeaderProps) {
  const currentMonthKey = monthKey(new Date())
  const currentMonth = useMemo(
    () => parseMonth(currentMonthKey) ?? monthStart(new Date()),
    [currentMonthKey],
  )
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)

  const summaries = useMemo(() => {
    const byMonth = new Map<string, HouseholdMonthSummary>()

    for (const summary of household.monthSummaries ?? []) {
      if (parseMonth(summary.month)) byMonth.set(summary.month, summary)
    }

    if (!byMonth.has(currentMonthKey)) {
      byMonth.set(currentMonthKey, {
        month: currentMonthKey,
        spend: household.monthSpend,
        expenseCount: household.expenses.filter(
          (expense) => expense.expenseDate.slice(0, 7) === currentMonthKey,
        ).length,
      })
    }

    return byMonth
  }, [currentMonthKey, household.expenses, household.monthSpend, household.monthSummaries])

  const oldestMonthKey = useMemo(() => {
    const keys = [...summaries.keys()]
      .filter((key) => key <= currentMonthKey)
      .sort()
    return keys[0] ?? currentMonthKey
  }, [currentMonthKey, summaries])

  const selectedMonthKey = monthKey(selectedMonth)

  useEffect(() => {
    if (selectedMonthKey < oldestMonthKey || selectedMonthKey > currentMonthKey) {
      setSelectedMonth(currentMonth)
    }
  }, [currentMonth, currentMonthKey, oldestMonthKey, selectedMonthKey])

  const selectedSummary = summaries.get(selectedMonthKey) ?? {
    month: selectedMonthKey,
    spend: 0,
    expenseCount: 0,
  }

  const canNavigatePrevious = selectedMonthKey > oldestMonthKey
  const canNavigateNext = selectedMonthKey < currentMonthKey

  const navigateMonth = (direction: 'prev' | 'next') => {
    const candidate = new Date(
      selectedMonth.getFullYear(),
      selectedMonth.getMonth() + (direction === 'prev' ? -1 : 1),
      1,
    )
    const candidateKey = monthKey(candidate)
    if (candidateKey < oldestMonthKey || candidateKey > currentMonthKey) return
    setSelectedMonth(candidate)
  }

  const position = useMemo(() => {
    const owedToUser = household.debts.filter(
      (debt) => debt.toMemberId === household.currentMemberId,
    )
    const owedByUser = household.debts.filter(
      (debt) => debt.fromMemberId === household.currentMemberId,
    )
    const toReceive = owedToUser.reduce((sum, debt) => sum + debt.amount, 0)
    const toPay = owedByUser.reduce((sum, debt) => sum + debt.amount, 0)

    if (toReceive === 0 && toPay === 0) {
      return {
        title: 'All settled',
        value: money(0, household.currency),
        detail: 'Nothing to pay or collect.',
        icon: CheckCircle2,
        color: 'var(--pb-summary-income)',
        tint: 'var(--pb-tint-income)',
      }
    }

    if (toReceive > 0 && toPay === 0) {
      const detail = owedToUser.length === 1
        ? `${owedToUser[0].fromMemberName} owes you.`
        : `${owedToUser.length} people owe you.`
      return {
        title: "You're owed",
        value: money(toReceive, household.currency),
        detail,
        icon: TrendingUp,
        color: 'var(--pb-summary-income)',
        tint: 'var(--pb-tint-income)',
      }
    }

    if (toPay > 0 && toReceive === 0) {
      const detail = owedByUser.length === 1
        ? `You owe ${owedByUser[0].toMemberName}.`
        : `You owe ${owedByUser.length} people.`
      return {
        title: 'You owe',
        value: money(toPay, household.currency),
        detail,
        icon: TrendingDown,
        color: 'var(--pb-summary-coral)',
        tint: 'var(--pb-tint-coral)',
      }
    }

    const net = household.currentUserBalance
    const netDetail = Math.abs(net) < 0.005
      ? 'Even overall, with payments still outstanding.'
      : net > 0
        ? `Net ${money(net, household.currency)} to receive.`
        : `Net ${money(Math.abs(net), household.currency)} to pay.`
    return {
      title: 'Money moves both ways',
      value: `${money(toReceive, household.currency)} in · ${money(toPay, household.currency)} out`,
      detail: netDetail,
      icon: Wallet,
      color: 'var(--pb-summary-gold)',
      tint: 'var(--pb-tint-gold)',
    }
  }, [household.currency, household.currentMemberId, household.currentUserBalance, household.debts])

  const PositionIcon = position.icon
  const expenseCountCopy = selectedSummary.expenseCount === 0
    ? 'No shared expenses recorded'
    : `${selectedSummary.expenseCount} shared expense${selectedSummary.expenseCount === 1 ? '' : 's'}`

  return (
    <Box
      position="relative"
      overflow="hidden"
      bg="var(--pb-summary-petrol)"
      border="1px solid var(--pb-summary-line)"
      borderRadius={{ base: '18px', md: '22px' }}
      boxShadow="var(--pb-shadow)"
      p={{ base: 3.5, sm: 4, md: 5 }}
    >
      <Box
        position="absolute"
        inset={0}
        pointerEvents="none"
        borderRadius="inherit"
        boxShadow="inset 0 1px 0 rgba(255,255,255,0.14)"
      />

      <Flex
        position="relative"
        zIndex={1}
        direction={{ base: 'column', sm: 'row' }}
        align={{ base: 'stretch', sm: 'center' }}
        justify="space-between"
        gap={{ base: 3.5, sm: 4 }}
        pb={{ base: 3.5, md: 4 }}
        borderBottom="1px solid var(--pb-summary-line)"
      >
        <HStack spacing={3} minW={0} align="center">
          <Flex
            w={{ base: 10, md: 11 }}
            h={{ base: 10, md: 11 }}
            flexShrink={0}
            align="center"
            justify="center"
            borderRadius="13px"
            bg="var(--pb-summary-panel)"
            color="var(--pb-summary-income)"
            border="1px solid var(--pb-summary-line)"
          >
            <Icon as={Home} boxSize={5} weight="duotone" />
          </Flex>
          <Box minW={0}>
            <Text
              fontFamily="var(--pb-mono)"
              fontSize="9px"
              fontWeight={600}
              letterSpacing="0.17em"
              textTransform="uppercase"
              color="var(--pb-summary-ink-faint)"
              noOfLines={1}
            >
              {`Household · ${household.members.length} active member${household.members.length === 1 ? '' : 's'}`}
            </Text>
            <Text
              mt={0.5}
              fontFamily="var(--pb-serif)"
              fontSize={{ base: 'xl', md: '2xl' }}
              fontWeight={500}
              lineHeight={1.1}
              letterSpacing="-0.025em"
              color="var(--pb-summary-ink)"
              noOfLines={2}
            >
              {household.name}
            </Text>
          </Box>
        </HStack>

        <Flex gap={2} w={{ base: 'full', sm: 'auto' }} flexShrink={0}>
          {household.currentMemberRole === 'OWNER' && (
            <Button
              aria-label={`Manage ${household.name}`}
              leftIcon={<Icon as={Gear} boxSize={4} />}
              onClick={onManage}
              flex={{ base: 1, sm: 'initial' }}
              h="44px"
              px={3.5}
              borderRadius="11px"
              bg="var(--pb-summary-panel)"
              color="var(--pb-summary-ink-soft)"
              border="1px solid var(--pb-summary-line)"
              fontFamily="var(--pb-mono)"
              fontSize="9px"
              fontWeight={600}
              letterSpacing="0.06em"
              textTransform="uppercase"
              _hover={{ color: 'var(--pb-summary-ink)', borderColor: 'var(--pb-summary-ink-faint)' }}
              _focusVisible={{ boxShadow: '0 0 0 2px var(--pb-forest)', outline: 'none' }}
            >
              Manage
            </Button>
          )}
          <Button
            leftIcon={<Icon as={Plus} boxSize={4} />}
            onClick={onAddExpense}
            flex={{ base: household.currentMemberRole === 'OWNER' ? 1.35 : 1, sm: 'initial' }}
            h="44px"
            px={4}
            borderRadius="11px"
            bg="var(--pb-forest-2)"
            color="var(--pb-on-accent)"
            border="1px solid var(--pb-forest-2)"
            fontFamily="var(--pb-mono)"
            fontSize="9px"
            fontWeight={700}
            letterSpacing="0.06em"
            textTransform="uppercase"
            _hover={{ bg: 'var(--pb-forest)', borderColor: 'var(--pb-forest)', transform: 'translateY(-1px)' }}
            _active={{ transform: 'translateY(0)' }}
            _focusVisible={{ boxShadow: '0 0 0 2px var(--pb-forest)', outline: 'none' }}
          >
            Add expense
          </Button>
        </Flex>
      </Flex>

      <Box
        position="relative"
        zIndex={1}
        py={{ base: 3, md: 3.5 }}
        borderBottom="1px solid var(--pb-summary-line)"
      >
        <PeriodNavigator
          selectedPeriod="month"
          selectedDate={selectedMonth}
          onDateChange={(date) => {
            const candidate = monthStart(date)
            const candidateKey = monthKey(candidate)
            if (candidateKey < oldestMonthKey || candidateKey > currentMonthKey) return
            setSelectedMonth(candidate)
          }}
          onPeriodChange={() => undefined}
          onNavigatePeriod={navigateMonth}
          onGoToToday={() => setSelectedMonth(currentMonth)}
          formatLabel={() => monthLabel(selectedMonth).toUpperCase()}
          isEmbedded
          showPeriodSelector={false}
          canNavigatePrevious={canNavigatePrevious}
          canNavigateNext={canNavigateNext}
          isDateDisabled={(date) => {
            const candidateKey = monthKey(date)
            return candidateKey < oldestMonthKey || candidateKey > currentMonthKey
          }}
        />
      </Box>

      <Grid
        position="relative"
        zIndex={1}
        templateColumns={{ base: '1fr', md: 'minmax(0, 1.05fr) minmax(320px, 0.95fr)' }}
        gap={{ base: 3.5, md: 5 }}
        pt={{ base: 3.5, md: 4.5 }}
        alignItems="stretch"
      >
        <Flex
          minW={0}
          direction="column"
          justify="center"
          pr={{ md: 5 }}
          borderRight={{ base: 'none', md: '1px solid var(--pb-summary-line)' }}
          aria-live="polite"
          aria-atomic="true"
        >
          <Text
            fontFamily="var(--pb-mono)"
            fontSize="9px"
            letterSpacing="0.14em"
            textTransform="uppercase"
            color="var(--pb-summary-ink-faint)"
          >
            Household spent · {monthLabel(selectedMonth)}
          </Text>
          <Text
            mt={1.5}
            fontFamily="var(--pb-serif)"
            fontSize="clamp(2.15rem, 5vw, 3.45rem)"
            fontWeight={500}
            lineHeight={0.95}
            letterSpacing="-0.04em"
            color="var(--pb-summary-coral)"
            noOfLines={1}
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {money(selectedSummary.spend, household.currency)}
          </Text>
          <Text mt={2} fontSize="xs" color="var(--pb-summary-ink-soft)">
            {expenseCountCopy} in this month.
          </Text>
        </Flex>

        <Flex
          minW={0}
          minH={{ base: '132px', md: '148px' }}
          direction="column"
          justify="space-between"
          p={{ base: 3.5, md: 4 }}
          borderRadius="15px"
          bg="var(--pb-summary-panel)"
          border="1px solid var(--pb-summary-line)"
        >
          <HStack justify="space-between" align="flex-start" spacing={3}>
            <Box minW={0}>
              <Text
                fontFamily="var(--pb-mono)"
                fontSize="9px"
                letterSpacing="0.14em"
                textTransform="uppercase"
                color="var(--pb-summary-ink-faint)"
              >
                Your position · all time
              </Text>
              <Text mt={1.5} fontSize="sm" fontWeight={500} color={position.color}>
                {position.title}
              </Text>
            </Box>
            <Flex
              w={9}
              h={9}
              flexShrink={0}
              align="center"
              justify="center"
              borderRadius="full"
              bg={position.tint}
              color={position.color}
              border="1px solid var(--pb-summary-line)"
            >
              <PositionIcon size={19} weight="duotone" aria-hidden="true" />
            </Flex>
          </HStack>

          <VStack align="stretch" spacing={1} mt={3}>
            <Text
              fontFamily="var(--pb-serif)"
              fontSize={{ base: 'xl', sm: '2xl' }}
              fontWeight={500}
              lineHeight={1.05}
              color={position.color}
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {position.value}
            </Text>
            <Text fontSize="xs" color="var(--pb-summary-ink-soft)">
              {position.detail}
            </Text>
          </VStack>
        </Flex>
      </Grid>
    </Box>
  )
}
