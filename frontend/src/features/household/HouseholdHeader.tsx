import { useState } from 'react'
import { Box, Button, Flex, Grid, HStack, Icon, IconButton, Text, useColorModeValue } from '@chakra-ui/react'
import { Bell, Calendar, ChevronLeft, ChevronRight, Gear, Plus, TrendingDown, TrendingUp, Users } from '../../components/ui/icons'
import type { HouseholdDashboard } from '../../types'
import { useI18n } from '../../i18n'

interface HouseholdHeaderProps {
  household: HouseholdDashboard
  onAddExpense: () => void
  onManage: () => void
  onMembersOverview: () => void
  onNotifications: () => void
}

const monthKey = (date: Date) => date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0')

export default function HouseholdHeader({ household, onAddExpense, onManage, onMembersOverview, onNotifications }: HouseholdHeaderProps) {
  const { formatDate, formatNumber, t } = useI18n()
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const currentMonthKey = monthKey(new Date())
  const selectedMonthKey = monthKey(selectedMonth)
  const previousMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1)
  const spending = household.monthSummaries?.find((item) => item.month === selectedMonthKey)?.spend
    ?? (selectedMonthKey === currentMonthKey ? household.monthSpend : 0)
  const previousSpending = household.monthSummaries?.find((item) => item.month === monthKey(previousMonth))?.spend ?? 0
  const change = previousSpending === 0
    ? spending === 0 ? 0 : null
    : Math.round((spending - previousSpending) * 100) / previousSpending
  const magnitude = Math.abs(change ?? 0)
  const changeLabel = change === null ? '—'
    : (change > 0 ? '+' : change < 0 ? '−' : '')
      + (magnitude > 0 && magnitude < 0.1 ? '<' + formatNumber(0.1) : formatNumber(magnitude, { maximumFractionDigits: 1 })) + '%'
  const money = (value: number) => formatNumber(value, { style: 'currency', currency: household.currency || 'GBP' })
  const net = household.currentUserBalance
  const hasOutstanding = household.debts.some((debt) => debt.fromMemberId === household.currentMemberId || debt.toMemberId === household.currentMemberId)
  const positionLabel = net > 0 ? t('household.header.position.owed') : net < 0 ? t('household.header.position.youOwe') : t(hasOutstanding ? 'household.header.balanced' : 'household.header.position.settled')
  const memberLabel = t(household.members.length === 1 ? 'household.header.activeMembers.one' : 'household.header.activeMembers.other', { count: formatNumber(household.members.length) })
  const comparisonLabel = change === null
    ? t('household.header.noPreviousSpending')
    : t('household.header.changeAria', { change: changeLabel, month: formatDate(previousMonth, { month: 'long', year: 'numeric' }) })

  const panel = useColorModeValue('rgba(228,237,222,0.94)', 'rgba(30,51,43,0.96)')
  const ink = useColorModeValue('#284D3C', '#E3EDDA')
  const muted = useColorModeValue('#526653', '#B8CCB5')
  const income = useColorModeValue('#326548', '#A9D29C')
  const expense = useColorModeValue('#A44735', '#F1B6A6')
  const neutralTint = useColorModeValue('rgba(75,108,76,0.10)', 'rgba(185,211,171,0.12)')
  const increaseTint = useColorModeValue('#F4DFD5', '#593F35')
  const decreaseTint = useColorModeValue('#D2E5CE', '#345239')
  const buttonBg = useColorModeValue('#FBFAF4', '#324A3D')
  const buttonHover = useColorModeValue('#E6EEE7', '#405D4B')
  const positionColor = net < 0 ? expense : net > 0 ? income : muted

  function navigateMonth(offset: number) {
    const candidate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + offset, 1)
    if (monthKey(candidate) <= currentMonthKey) setSelectedMonth(candidate)
  }

  return (
    <Flex
      as="section"
      aria-label={household.name}
      position="relative"
      overflow="hidden"
      isolation="isolate"
      borderRadius="27px"
      bg="#194C3F"
      minH={{ base: 'clamp(430px, 130vw, 520px)', md: '460px' }}
      direction="column"
      justify="space-between"
      gap={16}
      p={{ base: '15px', md: 6 }}
      boxShadow="var(--pb-shadow)"
    >
      <Box aria-hidden="true" position="absolute" inset={0} zIndex={-1} bgImage="url('/household-landscape.svg')" bgSize="cover" bgPosition="center" pointerEvents="none" />

      <Flex align="center" justify="space-between" wrap="wrap" gap={3} px={{ base: 1, md: 0 }} pt={1}>
        <Box flex={1} minW="120px">
          <HStack spacing={1.5}>
            <Text color="whiteAlpha.900" fontSize="12px" fontWeight={500} textShadow="0 1px 5px rgba(15,48,38,0.4)">{t('household.header.ourHome')}</Text>
            <Button
              aria-label={memberLabel}
              title={memberLabel}
              onClick={onMembersOverview}
              leftIcon={<Icon as={Users} boxSize={3} aria-hidden="true" />}
              minW={0}
              h="24px"
              px={1.5}
              borderRadius="10px"
              bg="rgba(255,255,255,0.78)"
              color="#24383C"
              fontSize="10px"
              _hover={{ bg: 'white' }}
            >
              {formatNumber(household.members.length)}
            </Button>
          </HStack>
          <Text as="h1" color="white" fontSize={{ base: '20px', md: '30px' }} fontWeight={800} letterSpacing="-0.4px" lineHeight={1.2} mt={1} overflowWrap="anywhere" textShadow="0 2px 8px rgba(15,48,38,0.45)">
            {household.name}
          </Text>
        </Box>
        <HStack spacing={1} p={1} borderRadius="15px" bg="rgba(255,255,255,0.86)" border="1px solid rgba(255,255,255,0.75)" color="#52656A" flexShrink={0}>
          <IconButton aria-label={t('period.previous')} icon={<Icon as={ChevronLeft} boxSize={3.5} />} onClick={() => navigateMonth(-1)} minW="28px" h="32px" borderRadius="9px" bg="rgba(220,232,232,0.8)" color="inherit" _hover={{ bg: '#D0DFD8' }} />
          <Icon as={Calendar} boxSize={3.5} aria-hidden="true" />
          <Text aria-live="polite" aria-atomic="true" fontSize={{ base: '10px', md: '12px' }} fontWeight={600} textAlign="center" minW="72px" px={1}>{formatDate(selectedMonth, { month: 'short', year: 'numeric' })}</Text>
          <IconButton aria-label={t('period.next')} icon={<Icon as={ChevronRight} boxSize={3.5} />} onClick={() => navigateMonth(1)} isDisabled={selectedMonthKey >= currentMonthKey} minW="28px" h="32px" borderRadius="9px" bg="rgba(220,232,232,0.8)" color="inherit" _hover={{ bg: '#D0DFD8' }} />
        </HStack>
      </Flex>

      <Box bg={panel} border="1px solid rgba(255,255,255,0.45)" borderRadius="23px" p={{ base: 3.5, md: 5 }} backdropFilter="blur(12px)">
        <Grid templateColumns="minmax(0, 1.3fr) minmax(0, 1fr)" gap={{ base: 3, md: 8 }} alignItems="center">
          <Box minW={0} aria-live="polite" aria-atomic="true">
            <Text fontSize={{ base: '12px', md: '14px' }} color={muted}>{t('household.header.monthSpending')}</Text>
            <Flex align="center" gap={2} mt={1} wrap="wrap">
              <Text color={ink} fontSize={{ base: 'clamp(1rem, 5.1vw, 1.4rem)', md: '32px' }} fontWeight={800} letterSpacing="-0.35px" lineHeight={1.2} overflowWrap="anywhere" style={{ fontVariantNumeric: 'tabular-nums' }}>{money(spending)}</Text>
              <Box aria-label={comparisonLabel} title={comparisonLabel} borderRadius="9px" px={1.5} py={1} bg={change !== null && change > 0 ? increaseTint : change !== null && change < 0 ? decreaseTint : neutralTint} color={change !== null && change > 0 ? expense : change !== null && change < 0 ? income : muted} fontSize={{ base: '10px', md: '12px' }} fontWeight={800}>
                {changeLabel}
              </Box>
            </Flex>
            <Text mt={1} fontSize={{ base: '9px', md: '11px' }} color={muted}>{t(change === null ? 'household.header.noPreviousSpending' : 'household.header.vsPreviousMonth')}</Text>
          </Box>
          <Box minW={0}>
            <Text color={positionColor} fontSize={{ base: '11px', md: '13px' }} fontWeight={600}>{positionLabel}</Text>
            {net !== 0 ? (
              <Flex align="center" gap={1} mt={1}>
                <Text color={positionColor} fontSize={{ base: 'clamp(1rem, 5.1vw, 1.4rem)', md: '30px' }} fontWeight={800} lineHeight={1.2} overflowWrap="anywhere" style={{ fontVariantNumeric: 'tabular-nums' }}>{money(Math.abs(net))}</Text>
                <Icon as={net > 0 ? TrendingUp : TrendingDown} boxSize={3.5} color={positionColor} flexShrink={0} aria-hidden="true" />
              </Flex>
            ) : null}
            <Text mt={1} fontSize={{ base: '9px', md: '11px' }} color={muted}>{t(net === 0 && hasOutstanding ? 'household.header.position.evenWithOutstanding' : 'household.header.netBalance')}</Text>
          </Box>
        </Grid>
        <Flex mt={4} gap={2}>
          <Button onClick={onAddExpense} leftIcon={<Icon as={Plus} boxSize={4} />} flex={1} minW={0} h="44px" borderRadius="17px" bg={buttonBg} color={ink} fontSize="13px" fontWeight={700} _hover={{ bg: buttonHover }}>
            {t('household.header.addExpense')}
          </Button>
          <Box position="relative">
            <IconButton aria-label={t('household.notifications.openAria', { count: formatNumber(household.unreadNotificationCount) })} onClick={onNotifications} icon={<Icon as={Bell} boxSize={5} />} w="44px" h="44px" borderRadius="15px" bg={buttonBg} color={ink} _hover={{ bg: buttonHover }} />
            {household.unreadNotificationCount > 0 ? <Flex aria-hidden="true" pointerEvents="none" position="absolute" top="-5px" right="-4px" minW="18px" h="18px" px={1} borderRadius="full" bg="#A44735" color="white" align="center" justify="center" fontSize="9px" fontWeight={700}>{household.unreadNotificationCount > 99 ? '99+' : formatNumber(household.unreadNotificationCount)}</Flex> : null}
          </Box>
          {household.currentMemberRole === 'OWNER' ? <IconButton aria-label={t('household.header.manageAria', { name: household.name })} onClick={onManage} icon={<Icon as={Gear} boxSize={5} />} w="44px" h="44px" borderRadius="15px" bg={buttonBg} color={ink} _hover={{ bg: buttonHover }} /> : null}
        </Flex>
      </Box>
    </Flex>
  )
}
