import { Box, Flex, HStack, Icon, Text, VStack, useColorModeValue } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { ArrowDownRight, ArrowUpRight, Wallet } from '../../components/ui/icons'
import { PREVIEW_DATA } from './landing.config'

/** Counts from 0 to `target` with ease-out cubic on mount. */
function useCountUp(target: number, duration = 1300, delay = 0): number {
  const [value, setValue] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => {
      let start: number | null = null
      const step = (ts: number) => {
        if (!start) start = ts
        const p = Math.min((ts - start) / duration, 1)
        setValue(Math.round((1 - Math.pow(1 - p, 3)) * target))
        if (p < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }, delay)
    return () => clearTimeout(t)
  }, [target, duration, delay])
  return value
}

function useCurrentMonthLabel(): string {
  return useMemo(
    () => new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    [],
  )
}

function useTimeOfDayGreeting(): string {
  return useMemo(() => {
    const h = new Date().getHours()
    if (h < 5) return 'Good night'
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  }, [])
}

export default function DashboardPreview() {
  const { totals, recent, bars } = PREVIEW_DATA
  const monthLabel = useCurrentMonthLabel()
  const greeting = useTimeOfDayGreeting()

  // Animated counters — staggered start
  const income   = useCountUp(totals.income,   1300, 150)
  const expenses = useCountUp(totals.expenses, 1300, 300)
  const balance  = useCountUp(totals.balance,  1300, 450)

  // Surfaces
  const surface       = useColorModeValue('rgba(255,255,255,0.92)', 'rgba(15,17,21,0.86)')
  const surfaceBorder = useColorModeValue('rgba(15,23,42,0.08)',    'rgba(255,255,255,0.08)')
  const innerSurface  = useColorModeValue('white',                  'rgba(255,255,255,0.04)')
  const innerBorder   = useColorModeValue('gray.100',               'whiteAlpha.200')
  const subText       = useColorModeValue('gray.500',               'gray.400')
  const text          = useColorModeValue('gray.900',               'whiteAlpha.900')

  // Semantic colors
  const incomeAccent  = useColorModeValue('green.500', 'green.300')
  const incomeBg      = useColorModeValue('green.50',  'rgba(34,197,94,0.10)')
  const expenseAccent = useColorModeValue('red.500',   'red.300')
  const expenseBg     = useColorModeValue('red.50',    'rgba(248,113,113,0.10)')
  const balanceAccent = useColorModeValue('blue.600',  'blue.300')
  const balanceBg     = useColorModeValue('blue.50',   'rgba(59,130,246,0.10)')

  // Chart bars
  const barFill = useColorModeValue(
    'linear-gradient(180deg,#3b82f6 0%,#6366f1 50%,#8b5cf6 100%)',
    'linear-gradient(180deg,#60a5fa 0%,#818cf8 50%,#a78bfa 100%)',
  )
  const barFillToday = useColorModeValue(
    'linear-gradient(180deg,#06b6d4 0%,#3b82f6 60%,#6366f1 100%)',
    'linear-gradient(180deg,#22d3ee 0%,#60a5fa 60%,#818cf8 100%)',
  )
  const barTrack      = useColorModeValue('gray.100', 'whiteAlpha.100')
  const barShadowToday = useColorModeValue(
    '0 4px 14px rgba(59,130,246,0.45)',
    '0 4px 14px rgba(96,165,250,0.38)',
  )

  // Card surface
  const chromeBg  = useColorModeValue(
    'linear-gradient(180deg,#f8fafc 0%,#ffffff 100%)',
    'linear-gradient(180deg,rgba(255,255,255,0.04) 0%,rgba(255,255,255,0.01) 100%)',
  )
  const cardBg     = useColorModeValue(
    'linear-gradient(135deg,#ffffff 0%,#f8fafc 100%)',
    'linear-gradient(135deg,rgba(25,27,34,0.65) 0%,rgba(12,13,17,0.78) 100%)',
  )
  const cardBorder  = useColorModeValue('rgba(0,0,0,0.05)', 'rgba(255,255,255,0.04)')
  const rowHoverBg  = useColorModeValue('gray.50', 'whiteAlpha.50')
  const tabActiveBg = useColorModeValue('white', 'whiteAlpha.100')
  const tabPillBg   = useColorModeValue('rgba(0,0,0,0.03)', 'rgba(255,255,255,0.03)')

  const cur = totals.currency
  const fmt = (n: number) =>
    `${cur}${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`

  const todayIdx = 3 // Thursday — highest bar

  return (
    <Box
      role="img"
      aria-label="Personal Budget dashboard preview"
      position="relative"
      w="full"
      maxW="640px"
      borderRadius="2xl"
      bg={surface}
      border="1px solid"
      borderColor={surfaceBorder}
      backdropFilter="saturate(180%) blur(24px)"
      boxShadow={useColorModeValue(
        '0 30px 60px -20px rgba(15,23,42,0.25),0 18px 40px -25px rgba(15,23,42,0.15)',
        '0 30px 60px -20px rgba(0,0,0,0.65),0 18px 40px -25px rgba(0,0,0,0.55)',
      )}
      overflow="hidden"
      sx={{
        '@keyframes growBar': {
          from: { transform: 'scaleY(0)' },
          to:   { transform: 'scaleY(1)' },
        },
        '@keyframes fadeInRow': {
          from: { opacity: 0, transform: 'translateX(-8px)' },
          to:   { opacity: 1, transform: 'translateX(0)' },
        },
        '@keyframes livePulse': {
          '0%,100%': { opacity: 1, transform: 'scale(1)' },
          '50%':     { opacity: 0.35, transform: 'scale(0.7)' },
        },
        '@media (prefers-reduced-motion: reduce)': {
          '.preview-bar': { animation: 'none !important', transform: 'scaleY(1) !important' },
          '.preview-row': { animation: 'none !important', opacity: '1 !important' },
        },
      }}
    >
      {/* Window chrome */}
      <HStack
        px={4} py={3}
        bg={chromeBg}
        borderBottom="1px solid"
        borderColor={surfaceBorder}
        spacing={2}
        position="relative"
        justify="center"
      >
        <HStack spacing={1.5} position="absolute" left={4}>
          <Box w={2.5} h={2.5} borderRadius="full" bg="#ff5f57" />
          <Box w={2.5} h={2.5} borderRadius="full" bg="#febc2e" />
          <Box w={2.5} h={2.5} borderRadius="full" bg="#28c840" />
        </HStack>
        <Box
          px={4} py={0.75}
          borderRadius="lg"
          bg={innerSurface}
          border="1px solid"
          borderColor={innerBorder}
          fontSize="2xs"
          color={subText}
          fontFamily="mono"
          w="260px"
          textAlign="center"
          letterSpacing="-0.2px"
        >
          personal-budget.app/dashboard
        </Box>
      </HStack>

      <VStack p={{ base: 4, md: 5 }} spacing={4} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <VStack spacing={0.5} align="flex-start">
            <Text fontSize="2xs" color={subText} fontWeight={700} letterSpacing="0.08em" textTransform="uppercase">
              {monthLabel}
            </Text>
            <HStack spacing={2} align="center">
              <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight={800} color={text} letterSpacing="-0.02em">
                {greeting}, friend
              </Text>
              {/* Live indicator */}
              <Box
                w={2} h={2}
                borderRadius="full"
                bg="green.400"
                flexShrink={0}
                sx={{ animation: 'livePulse 2.2s ease-in-out infinite' }}
              />
            </HStack>
          </VStack>

          <HStack
            spacing={0.5} p={0.5}
            borderRadius="full"
            bg={tabPillBg}
            border="1px solid"
            borderColor={innerBorder}
          >
            {(['Day', 'Week', 'Month', 'Year'] as const).map((p, i) => (
              <Box
                key={p}
                px={2.5} py={0.75}
                borderRadius="full"
                fontSize="2xs"
                fontWeight={700}
                cursor="pointer"
                bg={i === 2 ? tabActiveBg : 'transparent'}
                color={i === 2 ? text : subText}
                boxShadow={i === 2 ? 'sm' : 'none'}
                transition="all 0.2s ease"
              >
                {p}
              </Box>
            ))}
          </HStack>
        </HStack>

        {/* Balance pills — animated counters */}
        <HStack spacing={3} align="stretch">
          <BalancePill
            label="Income"
            value={`${cur}${income.toLocaleString()}`}
            delta="+12.4%"
            icon={ArrowUpRight}
            accent={incomeAccent}
            bg={incomeBg}
            text={text}
            subText={subText}
          />
          <BalancePill
            label="Expenses"
            value={`${cur}${expenses.toLocaleString()}`}
            delta="−4.2%"
            icon={ArrowDownRight}
            accent={expenseAccent}
            bg={expenseBg}
            text={text}
            subText={subText}
          />
          <BalancePill
            label="Balance"
            value={`${cur}${balance.toLocaleString()}`}
            delta="On track"
            icon={Wallet}
            accent={balanceAccent}
            bg={balanceBg}
            text={text}
            subText={subText}
          />
        </HStack>

        {/* Chart + Recent */}
        <HStack spacing={3} align="stretch">
          {/* Bar chart */}
          <Box
            flex={{ base: 'none', md: 1 }}
            display={{ base: 'none', md: 'block' }}
            p={4}
            borderRadius="xl"
            bg={cardBg}
            border="1px solid"
            borderColor={cardBorder}
            position="relative"
            overflow="hidden"
          >
            <HStack justify="space-between" mb={3}>
              <Text fontSize="2xs" color={subText} fontWeight={700} letterSpacing="0.08em" textTransform="uppercase">
                This week
              </Text>
              <Text fontSize="xs" color={text} fontWeight={700}>{fmt(523.4)}</Text>
            </HStack>

            <HStack spacing={2} align="flex-end" h="92px">
              {bars.map((b, i) => {
                const isToday = i === todayIdx
                return (
                  <VStack key={i} spacing={1} flex={1} align="center" h="full" justify="flex-end" position="relative">
                    <Box
                      className="preview-bar"
                      w="full"
                      h={`${Math.max(8, b.value * 100)}%`}
                      bg={isToday ? 'transparent' : barTrack}
                      borderRadius="md"
                      overflow="hidden"
                      position="relative"
                      transformOrigin="bottom"
                      boxShadow={isToday ? barShadowToday : 'none'}
                      sx={{ animation: `growBar 0.7s cubic-bezier(0.32,0.72,0,1) ${i * 0.07}s both` }}
                    >
                      <Box position="absolute" inset={0} background={isToday ? barFillToday : barFill} />
                    </Box>
                    <Text fontSize="2xs" color={isToday ? text : subText} fontWeight={isToday ? 800 : 700}>
                      {b.label}
                    </Text>
                  </VStack>
                )
              })}
            </HStack>
          </Box>

          {/* Recent transactions */}
          <VStack
            flex={1}
            p={4}
            spacing={2}
            align="stretch"
            borderRadius="xl"
            bg={cardBg}
            border="1px solid"
            borderColor={cardBorder}
            position="relative"
            overflow="hidden"
          >
            <Text
              px={1}
              fontSize="2xs"
              color={subText}
              fontWeight={700}
              letterSpacing="0.08em"
              textTransform="uppercase"
              mb={1}
            >
              Recent
            </Text>
            {recent.map((t, i) => {
              const isIncome = t.kind === 'income'
              const IconComponent = t.icon
              const accentColor = isIncome ? incomeAccent : expenseAccent
              const iconBg      = isIncome ? incomeBg      : expenseBg

              return (
                <HStack
                  key={t.id}
                  className="preview-row"
                  spacing={3}
                  px={1.5}
                  py={1}
                  borderRadius="lg"
                  transition="background 0.15s ease"
                  _hover={{ bg: rowHoverBg }}
                  sx={{ animation: `fadeInRow 0.45s ease ${0.35 + i * 0.09}s both` }}
                >
                  <Box
                    w={7} h={7}
                    borderRadius="full"
                    bg={iconBg}
                    color={accentColor}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink={0}
                    p={1.5}
                  >
                    <IconComponent size="100%" weight="duotone" />
                  </Box>
                  <Text flex={1} fontSize="xs" color={text} fontWeight={600} noOfLines={1}>
                    {t.label}
                  </Text>
                  <Text fontSize="xs" fontWeight={800} color={accentColor}>
                    {isIncome ? '+' : '−'}{fmt(t.amount)}
                  </Text>
                </HStack>
              )
            })}
          </VStack>
        </HStack>
      </VStack>
    </Box>
  )
}

/* -------------------------------------------------------------------------- */

interface BalancePillProps {
  label: string
  value: string
  delta: string
  icon: any
  accent: string
  bg: string
  text: string
  subText: string
}

function BalancePill({ label, value, delta, icon: IconComponent, accent, bg, text, subText }: BalancePillProps) {
  const cardBg    = useColorModeValue(
    'linear-gradient(135deg,#ffffff 0%,#f8fafc 100%)',
    'linear-gradient(135deg,rgba(25,27,34,0.65) 0%,rgba(12,13,17,0.78) 100%)',
  )
  const cardBorder = useColorModeValue('rgba(0,0,0,0.05)', 'rgba(255,255,255,0.04)')

  return (
    <VStack
      flex={1}
      align="flex-start"
      spacing={1.5}
      p={{ base: 3, md: 4 }}
      borderRadius="xl"
      bg={cardBg}
      border="1px solid"
      borderColor={cardBorder}
      position="relative"
      overflow="hidden"
      boxShadow="sm"
    >
      {/* Corner glow */}
      <Box
        position="absolute"
        top="-30px"
        left="-30px"
        w="95px"
        h="95px"
        borderRadius="full"
        bg={accent}
        opacity={useColorModeValue(0.04, 0.07)}
        filter="blur(20px)"
        pointerEvents="none"
      />

      <HStack spacing={1.5} align="center">
        <Flex
          w={{ base: 6, md: 7 }}
          h={{ base: 6, md: 7 }}
          align="center"
          justify="center"
          borderRadius="lg"
          bg={bg}
          color={accent}
          flexShrink={0}
          p={1}
        >
          <IconComponent size="100%" weight="duotone" />
        </Flex>
        <Text fontSize="2xs" color={subText} fontWeight={700} letterSpacing="0.08em" textTransform="uppercase">
          {label}
        </Text>
      </HStack>

      <VStack align="flex-start" spacing={0} w="full">
        <Text fontSize={{ base: 'md', md: 'xl' }} fontWeight={800} color={text} letterSpacing="-0.03em" lineHeight={1.1}>
          {value}
        </Text>
        <Text fontSize="2xs" color={accent} fontWeight={700} mt={0.5}>
          {delta}
        </Text>
      </VStack>

      {/* Bottom accent line */}
      <Box position="absolute" bottom={0} left={0} right={0} h="2px" bg={accent} opacity={0.35} />
    </VStack>
  )
}
