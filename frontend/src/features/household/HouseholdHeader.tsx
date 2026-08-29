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
  Bell,
  CheckCircle2,
  ChevronRight,
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
import { useI18n } from '../../i18n'
import { keyframes } from '@emotion/react'

const pulseAnim = keyframes`
  0%, 100% { opacity: 0.7; transform: translateX(0); }
  50% { opacity: 1; transform: translateX(2px); }
`

const AVATAR_GRADIENTS = [
  'linear(to-br, var(--pb-forest), var(--pb-forest-2))',
  'linear(to-br, var(--pb-coral), #E53E3E)',
  'linear(to-br, #3182CE, #2B6CB0)',
  'linear(to-br, #D69E2E, #DD6B20)',
  'linear(to-br, #805AD5, #553C9A)',
]

interface HouseholdHeaderProps {
  household: HouseholdDashboard
  onAddExpense: () => void
  onManage: () => void
  onMembersOverview: () => void
  onNotifications: () => void
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

export default function HouseholdHeader({
  household,
  onAddExpense,
  onManage,
  onMembersOverview,
  onNotifications,
}: HouseholdHeaderProps) {
  const { formatCurrency, formatDate, formatNumber, locale, t } = useI18n()
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

  // Allow unbounded past navigation

  const selectedMonthKey = monthKey(selectedMonth)



  const selectedSummary = summaries.get(selectedMonthKey) ?? {
    month: selectedMonthKey,
    spend: 0,
    expenseCount: 0,
  }

  const canNavigatePrevious = true
  const canNavigateNext = true

  const navigateMonth = (direction: 'prev' | 'next') => {
    const candidate = new Date(
      selectedMonth.getFullYear(),
      selectedMonth.getMonth() + (direction === 'prev' ? -1 : 1),
      1,
    )
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
        title: t('household.header.position.settled'),
        value: formatCurrency(0),
        detail: t('household.header.position.settledDetail'),
        icon: CheckCircle2,
        color: 'var(--pb-summary-income)',
        tint: 'var(--pb-tint-income)',
      }
    }

    if (toReceive > 0 && toPay === 0) {
      const detail = owedToUser.length === 1
        ? t('household.header.position.owedByOne', { name: owedToUser[0].fromMemberName })
        : t('household.header.position.owedByMany', { count: formatNumber(owedToUser.length) })
      return {
        title: t('household.header.position.owed'),
        value: formatCurrency(toReceive),
        detail,
        icon: TrendingUp,
        color: 'var(--pb-summary-income)',
        tint: 'var(--pb-tint-income)',
      }
    }

    if (toPay > 0 && toReceive === 0) {
      const detail = owedByUser.length === 1
        ? t('household.header.position.oweOne', { name: owedByUser[0].toMemberName })
        : t('household.header.position.oweMany', { count: formatNumber(owedByUser.length) })
      return {
        title: t('household.header.position.youOwe'),
        value: formatCurrency(toPay),
        detail,
        icon: TrendingDown,
        color: 'var(--pb-summary-coral)',
        tint: 'var(--pb-tint-coral)',
      }
    }

    const net = household.currentUserBalance
    const netDetail = Math.abs(net) < 0.005
      ? t('household.header.position.evenWithOutstanding')
      : net > 0
        ? t('household.header.position.netReceive', { amount: formatCurrency(net) })
        : t('household.header.position.netPay', { amount: formatCurrency(Math.abs(net)) })
    return {
      title: t('household.header.position.bothWays'),
      value: t('household.header.position.bothWaysValue', {
        incoming: formatCurrency(toReceive),
        outgoing: formatCurrency(toPay),
      }),
      detail: netDetail,
      icon: Wallet,
      color: 'var(--pb-summary-gold)',
      tint: 'var(--pb-tint-gold)',
    }
  }, [formatCurrency, formatNumber, household.currentMemberId, household.currentUserBalance, household.debts, t])

  const PositionIcon = position.icon
  const expenseCountCopy = selectedSummary.expenseCount === 0
    ? t('household.header.expenses.none')
    : t(
      selectedSummary.expenseCount === 1
        ? 'household.header.expenses.one'
        : 'household.header.expenses.other',
      { count: formatNumber(selectedSummary.expenseCount) },
    )
  const selectedMonthLabel = formatDate(selectedMonth, { month: 'long', year: 'numeric' })

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
        <Flex justify="space-between" align="center" w={{ base: 'full', sm: 'auto' }} minW={0} gap={2}>
          <HStack spacing={3} minW={0} align="center">
            <Flex
              w={{ base: 12, md: 14 }}
              h={{ base: 12, md: 14 }}
              flexShrink={0}
              align="center"
              justify="center"
              borderRadius={{ base: '16px', md: '18px' }}
              bgGradient="linear(to-br, var(--pb-forest), var(--pb-forest-2))"
              color="white"
              boxShadow="0 4px 10px rgba(0, 0, 0, 0.12), inset 0 2px 0 rgba(255, 255, 255, 0.15)"
              border="1px solid rgba(255, 255, 255, 0.1)"
            >
              <Icon as={Home} boxSize={{ base: 6, md: 7 }} weight="duotone" />
            </Flex>
            <Box minW={0}>
              <Text
                fontFamily="var(--pb-serif)"
                fontSize={{ base: 'xl', md: '2xl' }}
                fontWeight={500}
                lineHeight={1.1}
                letterSpacing="-0.025em"
                color="var(--pb-summary-ink)"
                noOfLines={1}
              >
                {household.name}
              </Text>
              <HStack 
                as="button"
                onClick={onMembersOverview}
                mt={1.5}
                spacing={-2}
                cursor="pointer"
                transition="all 0.2s"
                _hover={{ transform: 'scale(1.02)' }}
                _active={{ transform: 'scale(0.98)' }}
                align="center"
              >
                {household.members.slice(0, 5).map((member, i) => {
                  const initials = member.name
                    .split(' ')
                    .filter(Boolean)
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()

                  return (
                    <Flex
                      key={member.id}
                      w="28px"
                      h="28px"
                      borderRadius="full"
                      bgGradient={AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length]}
                      color="white"
                      border="2px solid var(--pb-summary-panel)"
                      boxShadow="0 2px 4px rgba(0,0,0,0.1)"
                      align="center"
                      justify="center"
                      fontSize="10px"
                      fontWeight={800}
                      fontFamily="var(--pb-mono)"
                      zIndex={10 - i}
                    >
                      {initials}
                    </Flex>
                  )
                })}
                {household.members.length > 5 && (
                  <Flex
                    w="28px"
                    h="28px"
                    borderRadius="full"
                    bg="var(--pb-summary-line)"
                    color="var(--pb-summary-ink-soft)"
                    border="2px solid var(--pb-summary-panel)"
                    boxShadow="0 2px 4px rgba(0,0,0,0.1)"
                    align="center"
                    justify="center"
                    fontSize="10px"
                    fontWeight={800}
                    fontFamily="var(--pb-mono)"
                    zIndex={0}
                  >
                    +{household.members.length - 5}
                  </Flex>
                )}
                <Flex
                  ml={2}
                  w="18px"
                  h="18px"
                  borderRadius="full"
                  bgGradient="linear(to-br, var(--pb-forest), var(--pb-forest-2))"
                  color="white"
                  align="center"
                  justify="center"
                  boxShadow="0 2px 6px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.2)"
                  animation={`${pulseAnim} 2s infinite ease-in-out`}
                >
                  <Icon as={ChevronRight} boxSize={2.5} weight="bold" />
                </Flex>
              </HStack>
            </Box>
          </HStack>

          {/* Mobile Buttons */}
          <HStack spacing={2} display={{ base: 'flex', sm: 'none' }} flexShrink={0}>
            <Flex
              as="button"
              aria-label={t('household.notifications.openAria', {
                count: formatNumber(household.unreadNotificationCount),
              })}
              onClick={onNotifications}
              position="relative"
              w="40px"
              h="40px"
              align="center"
              justify="center"
              borderRadius="11px"
              bg="var(--pb-summary-panel)"
              color="var(--pb-summary-ink-soft)"
              border="1px solid var(--pb-summary-line)"
              transition="all 0.2s"
              _hover={{ color: 'var(--pb-summary-ink)', borderColor: 'var(--pb-summary-ink-faint)' }}
              _focusVisible={{ boxShadow: '0 0 0 2px var(--pb-forest)', outline: 'none' }}
            >
              <Icon as={Bell} boxSize={5} weight="duotone" />
              {household.unreadNotificationCount > 0 && (
                <Flex
                  position="absolute"
                  top="-5px"
                  right="-5px"
                  minW="18px"
                  h="18px"
                  px={1}
                  align="center"
                  justify="center"
                  borderRadius="full"
                  bg="var(--pb-coral)"
                  color="white"
                  border="2px solid var(--pb-summary-petrol)"
                  fontFamily="var(--pb-mono)"
                  fontSize="7px"
                  fontWeight={800}
                  lineHeight={1}
                >
                  {household.unreadNotificationCount > 99
                    ? '99+'
                    : formatNumber(household.unreadNotificationCount)}
                </Flex>
              )}
            </Flex>
            {household.currentMemberRole === 'OWNER' && (
              <Flex
                as="button"
                aria-label={t('household.header.manageAria', { name: household.name })}
                onClick={onManage}
                w="40px"
                h="40px"
                align="center"
                justify="center"
                borderRadius="11px"
                bg="var(--pb-summary-panel)"
                color="var(--pb-summary-ink-soft)"
                border="1px solid var(--pb-summary-line)"
                transition="all 0.2s"
                _hover={{ color: 'var(--pb-summary-ink)', borderColor: 'var(--pb-summary-ink-faint)' }}
                _focusVisible={{ boxShadow: '0 0 0 2px var(--pb-forest)', outline: 'none' }}
              >
                <Icon as={Gear} boxSize={5} />
              </Flex>
            )}
          </HStack>
        </Flex>

        <Flex gap={2} w={{ base: 'full', sm: 'auto' }} flexShrink={0}>
          <Button
            display={{ base: 'none', sm: 'inline-flex' }}
            aria-label={t('household.notifications.openAria', {
              count: formatNumber(household.unreadNotificationCount),
            })}
            leftIcon={<Icon as={Bell} boxSize={4} weight="duotone" />}
            onClick={onNotifications}
            position="relative"
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
            <Text display={{ base: 'none', lg: 'inline' }}>
              {t('household.notifications.shortTitle')}
            </Text>
            {household.unreadNotificationCount > 0 && (
              <Flex
                position="absolute"
                top="-7px"
                right="-7px"
                minW="21px"
                h="21px"
                px={1.5}
                align="center"
                justify="center"
                borderRadius="full"
                bg="var(--pb-coral)"
                color="white"
                border="2px solid var(--pb-summary-petrol)"
                fontFamily="var(--pb-mono)"
                fontSize="8px"
                fontWeight={800}
                lineHeight={1}
              >
                {household.unreadNotificationCount > 99
                  ? '99+'
                  : formatNumber(household.unreadNotificationCount)}
              </Flex>
            )}
          </Button>
          {household.currentMemberRole === 'OWNER' && (
            <Button
              display={{ base: 'none', sm: 'inline-flex' }}
              aria-label={t('household.header.manageAria', { name: household.name })}
              leftIcon={<Icon as={Gear} boxSize={4} />}
              onClick={onManage}
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
              {t('household.header.manage')}
            </Button>
          )}
          <Button
            leftIcon={<Icon as={Plus} boxSize={4} />}
            onClick={onAddExpense}
            flex={{ base: 1, sm: 'initial' }}
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
            {t('household.header.addExpense')}
          </Button>
        </Flex>
      </Flex>

      <Grid
        position="relative"
        zIndex={1}
        templateColumns={{ base: '1fr', md: 'minmax(0, 1.05fr) minmax(320px, 0.95fr)' }}
        gap={{ base: 3.5, md: 5 }}
        pt={{ base: 4, md: 5 }}
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
            {t('household.header.spentTitle', { defaultValue: 'GASTOS DA CASA' })}
          </Text>
          <Flex
            mt={1.5}
            align="center"
            justify="space-between"
            wrap="wrap"
            gap={3}
          >
            <Text
              fontFamily="var(--pb-serif)"
              fontSize="clamp(2rem, 5vw, 3.45rem)"
              fontWeight={500}
              lineHeight={0.95}
              letterSpacing="-0.04em"
              color="var(--pb-summary-coral)"
              noOfLines={1}
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {formatCurrency(selectedSummary.spend)}
            </Text>

            <Box maxW="190px">
              <PeriodNavigator
                selectedPeriod="month"
                selectedDate={selectedMonth}
                onDateChange={(date) => {
                  const candidate = monthStart(date)
                  setSelectedMonth(candidate)
                }}
                onPeriodChange={() => undefined}
                onNavigatePeriod={navigateMonth}
                onGoToToday={() => setSelectedMonth(currentMonth)}
                formatLabel={() => formatDate(selectedMonth, { month: 'short', year: '2-digit' }).toLocaleUpperCase(locale)}
                isEmbedded
                showPeriodSelector={false}
                canNavigatePrevious={canNavigatePrevious}
                canNavigateNext={canNavigateNext}
                isDateDisabled={() => false}
              />
            </Box>
          </Flex>
          <Text mt={2} fontSize="xs" color="var(--pb-summary-ink-soft)">
            {expenseCountCopy}
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
                {t('household.header.positionEyebrow')}
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
