import { useState } from 'react'
import { Box, Button, Flex, HStack, Icon, IconButton, Text } from '@chakra-ui/react'
import { ArrowsLeftRight } from '@phosphor-icons/react'
import { Bell, Broom, Calendar, ChevronLeft, ChevronRight, Gear, Plus, TrendingDown, TrendingUp, Users } from '../../components/ui/icons'
import type { HouseholdDashboard } from '../../types'
import { useI18n } from '../../i18n'
import NuHero from '../dashboard/components/NuHero'

interface HouseholdHeaderProps {
  household: HouseholdDashboard
  onAddExpense: () => void
  onManage: () => void
  onMembersOverview: () => void
  onNotifications: () => void
  onViewBalances: () => void
  onOpenCleaning: () => void
}

const monthKey = (date: Date) => date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0')

export default function HouseholdHeader({ household, onAddExpense, onManage, onMembersOverview, onNotifications, onViewBalances, onOpenCleaning }: HouseholdHeaderProps) {
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

  const shortcuts: Array<{ key: string; label: string; icon: typeof Plus; onClick: () => void; badge?: number }> = [
    { key: 'expense', label: t('household.header.shortcut.expense'), icon: Plus, onClick: onAddExpense },
    { key: 'transfer', label: t('household.header.shortcut.transfer'), icon: ArrowsLeftRight, onClick: onViewBalances },
    { key: 'tasks', label: t('household.header.shortcut.tasks'), icon: Broom, onClick: onOpenCleaning },
    { key: 'alerts', label: t('household.header.shortcut.alerts'), icon: Bell, onClick: onNotifications, badge: household.unreadNotificationCount },
    ...(household.currentMemberRole === 'OWNER'
      ? [{ key: 'settings', label: t('household.header.shortcut.settings'), icon: Gear, onClick: onManage }]
      : []),
  ]

  return (
    <NuHero
      decoration={<HeroGlow />}
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

        {/* One headline figure: your position. Month spending is the supporting line. */}
        <Box mt={{ base: 4, md: 5 }} maxW={{ md: '720px' }}>
          <Text fontSize="sm" fontWeight={600} color={positionColor}>{positionLabel}</Text>
          <Box mt={0.5} role="img" aria-label={money(Math.abs(net))}>
            <SplitMoney value={Math.abs(net)} currency={household.currency || 'GBP'} />
          </Box>
          <Flex mt={1.5} align="center" gap={1.5} wrap="wrap" fontSize="xs" color={soft} aria-live="polite" aria-atomic="true">
            <Text>{t('household.header.monthSpending')}</Text>
            <Text fontWeight={700} color="white" sx={{ fontVariantNumeric: 'tabular-nums' }}>{money(spending)}</Text>
            <Text aria-hidden="true">·</Text>
            {change === null ? (
              <Text>{t('household.header.noPreviousSpending')}</Text>
            ) : (
              <HStack spacing={1} aria-label={comparisonLabel} title={comparisonLabel}>
                {change !== 0 && (
                  <Icon as={change > 0 ? TrendingUp : TrendingDown} boxSize={3.5} color={change > 0 ? bad : good} aria-hidden="true" />
                )}
                <Text fontWeight={700} color={change > 0 ? bad : change < 0 ? good : soft}>{changeLabel}</Text>
                <Text>{t('household.header.vsPreviousMonth')}</Text>
              </HStack>
            )}
          </Flex>
        </Box>

        {/* Nubank-style shortcuts */}
        <HStack mt={{ base: 5, md: 6 }} spacing={{ base: 0, md: 3 }} justify={{ base: 'space-between', md: 'flex-start' }} align="flex-start">
          {shortcuts.map((shortcut) => {
            const primary = shortcut.key === 'expense'
            return (
              <Flex
                key={shortcut.key} as="button" type="button" onClick={shortcut.onClick}
                direction="column" align="center" gap={1.5} w={{ base: '64px', md: '72px' }} flexShrink={0}
                _focusVisible={{ outline: 'none', '& .shortcut-circle': { boxShadow: '0 0 0 3px rgba(255,255,255,0.55)' } }}
              >
                <Flex
                  className="shortcut-circle" position="relative" w="52px" h="52px" align="center" justify="center" borderRadius="full"
                  bg={primary ? 'white' : 'rgba(255,255,255,0.16)'}
                  color={primary ? 'var(--pb-hero)' : 'white'}
                  border={primary ? 'none' : '1px solid rgba(255,255,255,0.18)'}
                  transition="transform 120ms ease, background 160ms ease"
                  _hover={{ bg: primary ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.24)' }}
                  _active={{ transform: 'scale(0.94)' }}
                >
                  <Icon as={shortcut.icon} boxSize={5} weight="bold" aria-hidden="true" />
                  {shortcut.badge ? (
                    <Flex aria-hidden="true" position="absolute" top="-2px" right="-2px" minW="18px" h="18px" px={1} borderRadius="full" bg="#ff6b57" color="white" align="center" justify="center" fontSize="9px" fontWeight={700}>
                      {shortcut.badge > 99 ? '99+' : formatNumber(shortcut.badge)}
                    </Flex>
                  ) : null}
                </Flex>
                <Text fontSize="11px" fontWeight={700} color="white" noOfLines={1}>{shortcut.label}</Text>
              </Flex>
            )
          })}
        </HStack>
    </NuHero>
  )
}

/** Depth for the purple hero without line art: a diagonal deepening plus a soft glow behind the headline figure. */
function HeroGlow() {
  return (
    <Box
      aria-hidden="true" position="absolute" inset={0} zIndex={-1} pointerEvents="none"
      bg={[
        'radial-gradient(60% 70% at 18% 62%, rgba(214, 160, 255, 0.28) 0%, rgba(214, 160, 255, 0) 70%)',
        'radial-gradient(50% 60% at 100% 0%, rgba(255, 255, 255, 0.10) 0%, rgba(255, 255, 255, 0) 70%)',
        'linear-gradient(135deg, #8a12dc 0%, #820ad1 45%, #6c05b5 100%)',
      ].join(', ')}
    />
  )
}

/** "£29,67" with the symbol and the pence set smaller, banking-app style. */
function SplitMoney({ value, currency }: { value: number; currency: string }) {
  const { locale } = useI18n()
  const parts = new Intl.NumberFormat(locale, { style: 'currency', currency }).formatToParts(value)
  const small = { fontSize: { base: '1.1rem', md: '1.5rem' }, fontWeight: 700, opacity: 0.85 } as const
  return (
    <Text as="span" display="inline-flex" alignItems="baseline" lineHeight={1} letterSpacing="-0.03em" color="white" aria-hidden="true"
      sx={{ fontVariantNumeric: 'tabular-nums' }}>
      {parts.map((part, index) => {
        if (part.type === 'literal') return null
        if (part.type === 'currency') return <Text as="span" key={index} {...small} mr="2px">{part.value}</Text>
        if (part.type === 'decimal' || part.type === 'fraction') return <Text as="span" key={index} {...small}>{part.value}</Text>
        return <Text as="span" key={index} fontSize={{ base: '2.6rem', md: '3.2rem' }} fontWeight={800}>{part.value}</Text>
      })}
    </Text>
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
