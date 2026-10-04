import { useState } from 'react'
import { Box, Button, Flex, Grid, HStack, Icon, IconButton, Text } from '@chakra-ui/react'
import { Bell, Calendar, ChevronLeft, ChevronRight, Gear, Plus, TrendingDown, TrendingUp, Users } from '../../components/ui/icons'
import type { HouseholdDashboard } from '../../types'
import { useI18n } from '../../i18n'
import NuHero from '../dashboard/components/NuHero'

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

  // Light-on-purple tones: soft mint = good, soft rose = bad.
  const good = '#9ff0c8'
  const bad = '#ffc2b8'
  const soft = 'rgba(255,255,255,0.8)'
  const positionColor = net < 0 ? bad : net > 0 ? good : soft
  const glass = {
    bg: 'rgba(255,255,255,0.14)',
    border: '1px solid rgba(255,255,255,0.22)',
    color: 'white',
    _hover: { bg: 'rgba(255,255,255,0.24)' },
  } as const

  function navigateMonth(offset: number) {
    const candidate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + offset, 1)
    if (monthKey(candidate) <= currentMonthKey) setSelectedMonth(candidate)
  }

  return (
    <NuHero
      decoration={<HouseLineArt />}
      title={(
          <Box minW={0}>
            <HStack spacing={1.5}>
              <Text fontSize="sm" color={soft}>{t('household.header.ourHome')}</Text>
              <Button
                aria-label={memberLabel}
                title={memberLabel}
                onClick={onMembersOverview}
                leftIcon={<Icon as={Users} boxSize={3} aria-hidden="true" />}
                minW={0}
                h="24px"
                px={2}
                borderRadius="full"
                fontSize="xs"
                {...glass}
              >
                {formatNumber(household.members.length)}
              </Button>
            </HStack>
            <Text as="h1" title={household.name} noOfLines={1} fontSize={{ base: 'xl', md: '2xl' }} fontWeight={700} letterSpacing="-0.01em" mt={1}>
              {household.name}
            </Text>
          </Box>
      )}
      action={(
          <HStack spacing={1} p={1} borderRadius="full" flexShrink={0} {...glass} _hover={undefined}>
            <IconButton aria-label={t('period.previous')} icon={<Icon as={ChevronLeft} boxSize={3.5} />} onClick={() => navigateMonth(-1)} minW="30px" h="30px" borderRadius="full" bg="transparent" color="white" _hover={{ bg: 'rgba(255,255,255,0.18)' }} />
            <Icon as={Calendar} boxSize={3.5} aria-hidden="true" />
            <Text aria-live="polite" aria-atomic="true" fontSize="sm" fontWeight={600} textAlign="center" minW="76px" px={1} textTransform="capitalize">
              {formatDate(selectedMonth, { month: 'short', year: 'numeric' })}
            </Text>
            <IconButton aria-label={t('period.next')} icon={<Icon as={ChevronRight} boxSize={3.5} />} onClick={() => navigateMonth(1)} isDisabled={selectedMonthKey >= currentMonthKey} minW="30px" h="30px" borderRadius="full" bg="transparent" color="white" _hover={{ bg: 'rgba(255,255,255,0.18)' }} />
          </HStack>
      )}
    >

        {/* Month spending · your position */}
        <Grid mt={{ base: 4, md: 5 }} templateColumns={{ base: 'minmax(0, 1fr) minmax(0, 1fr)', md: 'minmax(0, 1.2fr) minmax(0, 1fr)' }} gap={{ base: 4, md: 8 }} maxW={{ md: '720px' }}>
          <Box minW={0} aria-live="polite" aria-atomic="true">
            <Text fontSize="sm" color={soft}>{t('household.header.monthSpending')}</Text>
            <Flex align="center" gap={2} mt={0.5} wrap="wrap">
              <Text fontSize={{ base: '1.6rem', md: '2.4rem' }} fontWeight={700} letterSpacing="-0.02em" lineHeight={1.1} overflowWrap="anywhere" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                {money(spending)}
              </Text>
              <Box
                aria-label={comparisonLabel}
                title={comparisonLabel}
                borderRadius="full"
                px={2}
                py={0.5}
                bg="rgba(255,255,255,0.16)"
                color={change !== null && change > 0 ? bad : change !== null && change < 0 ? good : soft}
                fontSize="xs"
                fontWeight={700}
              >
                {changeLabel}
              </Box>
            </Flex>
            <Text mt={1} fontSize="xs" color={soft}>{t(change === null ? 'household.header.noPreviousSpending' : 'household.header.vsPreviousMonth')}</Text>
          </Box>
          <Box minW={0}>
            <Text fontSize="sm" fontWeight={600} color={positionColor}>{positionLabel}</Text>
            {net !== 0 ? (
              <Flex align="center" gap={1} mt={0.5}>
                <Text color={positionColor} fontSize={{ base: '1.6rem', md: '2.4rem' }} fontWeight={700} lineHeight={1.1} overflowWrap="anywhere" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                  {money(Math.abs(net))}
                </Text>
                <Icon as={net > 0 ? TrendingUp : TrendingDown} boxSize={4} color={positionColor} flexShrink={0} aria-hidden="true" />
              </Flex>
            ) : null}
            <Text mt={1} fontSize="xs" color={soft}>{t(net === 0 && hasOutstanding ? 'household.header.position.evenWithOutstanding' : 'household.header.netBalance')}</Text>
          </Box>
        </Grid>

        {/* Actions */}
        <Flex mt={{ base: 4, md: 5 }} gap={2} align="center" maxW={{ md: '720px' }}>
          <Button
            onClick={onAddExpense}
            leftIcon={<Icon as={Plus} boxSize={4} />}
            flex={{ base: 1, md: 'initial' }}
            px={6}
            h="44px"
            borderRadius="full"
            bg="white"
            color="var(--pb-hero)"
            fontSize="sm"
            fontWeight={700}
            _hover={{ bg: 'rgba(255,255,255,0.9)' }}
          >
            {t('household.header.addExpense')}
          </Button>
          <Box position="relative" ml={{ md: 1 }}>
            <IconButton aria-label={t('household.notifications.openAria', { count: formatNumber(household.unreadNotificationCount) })} onClick={onNotifications} icon={<Icon as={Bell} boxSize={5} />} w="44px" h="44px" borderRadius="full" {...glass} />
            {household.unreadNotificationCount > 0 ? <Flex aria-hidden="true" pointerEvents="none" position="absolute" top="-3px" right="-3px" minW="18px" h="18px" px={1} borderRadius="full" bg="#ff6b57" color="white" align="center" justify="center" fontSize="9px" fontWeight={700}>{household.unreadNotificationCount > 99 ? '99+' : formatNumber(household.unreadNotificationCount)}</Flex> : null}
          </Box>
          {household.currentMemberRole === 'OWNER' ? <IconButton aria-label={t('household.header.manageAria', { name: household.name })} onClick={onManage} icon={<Icon as={Gear} boxSize={5} />} w="44px" h="44px" borderRadius="full" {...glass} /> : null}
        </Flex>
    </NuHero>
  )
}

/** Faint white line drawing of a little street of houses, anchored bottom-right of the purple header. */
export function HouseLineArt() {
  return (
    <Box aria-hidden="true" position="absolute" right={0} bottom={0} w={{ base: '78%', md: '52%' }} maxW="680px" h="100%" pointerEvents="none" zIndex={-1}>
      <svg width="100%" height="100%" viewBox="0 0 600 260" preserveAspectRatio="xMaxYMax meet" fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round">
        {/* soft glow behind the main house */}
        <defs>
          <radialGradient id="hhGlow" cx="62%" cy="58%" r="45%">
            <stop offset="0" stopColor="#d9a8ff" stopOpacity="0.22" />
            <stop offset="1" stopColor="#d9a8ff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="600" height="260" fill="url(#hhGlow)" stroke="none" />

        {/* small house, left */}
        <g strokeOpacity="0.14" strokeWidth="2">
          <path d="M150 236V178l46-36 46 36v58" />
          <path d="M140 186l56-44 56 44" />
          <rect x="182" y="200" width="28" height="36" rx="2" />
          <rect x="160" y="184" width="16" height="14" rx="1" />
        </g>

        {/* main house, centre */}
        <g strokeOpacity="0.24" strokeWidth="2.4">
          <path d="M290 236V150l84-66 84 66v86" />
          <path d="M272 162l102-80 102 80" />
          <path d="M424 112V70h22v59" />
          <rect x="350" y="180" width="48" height="56" rx="3" />
          <circle cx="388" cy="210" r="2.4" fill="#fff" fillOpacity="0.3" stroke="none" />
          <rect x="308" y="164" width="30" height="28" rx="2" />
          <path d="M323 164v28M308 178h30" />
          <rect x="410" y="164" width="30" height="28" rx="2" />
          <path d="M425 164v28M410 178h30" />
          <path d="M360 128h28v22h-28z" />
        </g>
        {/* chimney smoke */}
        <g strokeOpacity="0.16" strokeWidth="2">
          <path d="M435 60c-10-8 8-14-2-24" />
          <path d="M447 50c-8-7 7-12-1-20" />
        </g>

        {/* tall house, right */}
        <g strokeOpacity="0.12" strokeWidth="2">
          <path d="M498 236V132l42-30 42 30v104" />
          <path d="M490 138l50-36 50 36" />
          <rect x="520" y="150" width="18" height="18" rx="1" />
          <rect x="548" y="150" width="18" height="18" rx="1" />
          <rect x="530" y="200" width="22" height="36" rx="2" />
        </g>

        {/* ground line + little tree */}
        <path d="M110 237h490" strokeOpacity="0.18" strokeWidth="2" />
        <g strokeOpacity="0.14" strokeWidth="2">
          <circle cx="262" cy="196" r="16" />
          <path d="M262 212v24" />
        </g>
        {/* stars */}
        <g fill="#fff" stroke="none">
          <circle cx="236" cy="70" r="2" fillOpacity="0.3" />
          <circle cx="520" cy="58" r="1.6" fillOpacity="0.25" />
          <circle cx="300" cy="40" r="1.4" fillOpacity="0.2" />
        </g>
      </svg>
    </Box>
  )
}
