import { Box, HStack, Icon, Text, VStack, useColorModeValue } from '@chakra-ui/react'
import { useMemo } from 'react'
import { ArrowDownRight, ArrowUpRight, Wallet } from '../../components/ui/icons'
import { PREVIEW_DATA } from './landing.config'

/** Returns "April 2026"-style label for the user's current month/year. */
function useCurrentMonthLabel(): string {
  return useMemo(
    () => new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    [],
  )
}

/** Returns a context-aware greeting based on the user's current local hour. */
function useTimeOfDayGreeting(): string {
  return useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 5) return 'Good night'
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }, [])
}

/**
 * DashboardPreview
 * A CSS-only, no-dependency mockup of the product UI.
 * - Three balance pills (Income / Expenses / Balance)
 * - A 7-bar weekly chart with animated reveal
 * - A short list of recent transactions
 * Used inside the Hero on lg+ screens, and as a standalone visual on smaller ones.
 */
export default function DashboardPreview() {
  const { totals, recent, bars } = PREVIEW_DATA
  const monthLabel = useCurrentMonthLabel()
  const greeting = useTimeOfDayGreeting()

  // Surfaces
  const surface = useColorModeValue('rgba(255,255,255,0.92)', 'rgba(15,17,21,0.86)')
  const surfaceBorder = useColorModeValue('rgba(15,23,42,0.08)', 'rgba(255,255,255,0.08)')
  const innerSurface = useColorModeValue('white', 'rgba(255,255,255,0.04)')
  const innerBorder = useColorModeValue('gray.100', 'whiteAlpha.200')
  const subText = useColorModeValue('gray.500', 'gray.400')
  const text = useColorModeValue('gray.900', 'whiteAlpha.900')

  // Brand colors
  const incomeAccent = useColorModeValue('green.500', 'green.300')
  const incomeBg = useColorModeValue('green.50', 'rgba(34,197,94,0.10)')
  const expenseAccent = useColorModeValue('red.500', 'red.300')
  const expenseBg = useColorModeValue('red.50', 'rgba(248,113,113,0.10)')
  const balanceAccent = useColorModeValue('blue.600', 'blue.300')
  const balanceBg = useColorModeValue('blue.50', 'rgba(59,130,246,0.10)')

  const barFill = useColorModeValue(
    'linear-gradient(180deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)',
    'linear-gradient(180deg, #60a5fa 0%, #818cf8 50%, #a78bfa 100%)',
  )
  const barTrack = useColorModeValue('gray.100', 'whiteAlpha.100')

  // Window chrome
  const chromeBg = useColorModeValue(
    'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
    'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
  )

  const fmt = (n: number) => `${totals.currency}${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`

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
      backdropFilter="saturate(180%) blur(18px)"
      boxShadow={useColorModeValue(
        '0 30px 60px -20px rgba(15, 23, 42, 0.25), 0 18px 40px -25px rgba(15, 23, 42, 0.15)',
        '0 30px 60px -20px rgba(0, 0, 0, 0.6), 0 18px 40px -25px rgba(0, 0, 0, 0.5)',
      )}
      overflow="hidden"
      sx={{
        '@keyframes growBar': {
          from: { transform: 'scaleY(0)' },
          to: { transform: 'scaleY(1)' },
        },
        '@media (prefers-reduced-motion: reduce)': {
          '.preview-bar': { animation: 'none !important', transform: 'scaleY(1) !important' },
        },
      }}
    >
      {/* macOS-style window chrome */}
      <HStack px={4} py={3} bg={chromeBg} borderBottom="1px solid" borderColor={surfaceBorder} spacing={2}>
        <Box w={3} h={3} borderRadius="full" bg="#ff5f57" />
        <Box w={3} h={3} borderRadius="full" bg="#febc2e" />
        <Box w={3} h={3} borderRadius="full" bg="#28c840" />
        <Box flex={1} />
        <Box
          px={3}
          py={1}
          borderRadius="md"
          bg={innerSurface}
          border="1px solid"
          borderColor={innerBorder}
          fontSize="2xs"
          color={subText}
          fontFamily="mono"
        >
          personal-budget.app/dashboard
        </Box>
      </HStack>

      <VStack p={{ base: 4, md: 5 }} spacing={4} align="stretch">
        {/* Header row */}
        <HStack justify="space-between" align="flex-start">
          <VStack spacing={0} align="flex-start">
            <Text fontSize="xs" color={subText} fontWeight={600} letterSpacing="0.08em" textTransform="uppercase">
              {monthLabel}
            </Text>
            <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight={800} color={text} letterSpacing="-0.02em">
              {greeting}, friend
            </Text>
          </VStack>
          <HStack
            spacing={1}
            px={2}
            py={1}
            borderRadius="full"
            bg={innerSurface}
            border="1px solid"
            borderColor={innerBorder}
          >
            {(['Day', 'Week', 'Month', 'Year'] as const).map((p, i) => (
              <Box
                key={p}
                px={2}
                py={0.5}
                borderRadius="full"
                fontSize="2xs"
                fontWeight={700}
                bg={i === 2 ? balanceBg : 'transparent'}
                color={i === 2 ? balanceAccent : subText}
              >
                {p}
              </Box>
            ))}
          </HStack>
        </HStack>

        {/* Three pills */}
        <HStack spacing={3} align="stretch">
          <BalancePill
            label="Income"
            value={fmt(totals.income)}
            delta="+12.4%"
            icon={ArrowUpRight}
            accent={incomeAccent}
            bg={incomeBg}
            innerSurface={innerSurface}
            innerBorder={innerBorder}
            text={text}
            subText={subText}
          />
          <BalancePill
            label="Expenses"
            value={fmt(totals.expenses)}
            delta="−4.2%"
            icon={ArrowDownRight}
            accent={expenseAccent}
            bg={expenseBg}
            innerSurface={innerSurface}
            innerBorder={innerBorder}
            text={text}
            subText={subText}
          />
          <BalancePill
            label="Balance"
            value={fmt(totals.balance)}
            delta="On track"
            icon={Wallet}
            accent={balanceAccent}
            bg={balanceBg}
            innerSurface={innerSurface}
            innerBorder={innerBorder}
            text={text}
            subText={subText}
            highlight
          />
        </HStack>

        {/* Mini chart + recent list */}
        <HStack spacing={3} align="stretch">
          {/* Chart */}
          <Box
            flex={{ base: 'none', md: 1 }}
            display={{ base: 'none', md: 'block' }}
            p={4}
            borderRadius="xl"
            bg={innerSurface}
            border="1px solid"
            borderColor={innerBorder}
          >
            <HStack justify="space-between" mb={3}>
              <Text fontSize="xs" color={subText} fontWeight={700} letterSpacing="0.08em" textTransform="uppercase">
                This week
              </Text>
              <Text fontSize="xs" color={text} fontWeight={700}>
                {fmt(523.4)}
              </Text>
            </HStack>
            <HStack spacing={2} align="flex-end" h="92px">
              {bars.map((b, i) => (
                <VStack key={i} spacing={1} flex={1} align="center" h="full" justify="flex-end">
                  <Box
                    className="preview-bar"
                    w="full"
                    h={`${Math.max(8, b.value * 100)}%`}
                    bg={barTrack}
                    borderRadius="md"
                    overflow="hidden"
                    position="relative"
                    transformOrigin="bottom"
                    sx={{
                      animation: `growBar 0.7s cubic-bezier(0.32, 0.72, 0, 1) ${i * 0.07}s both`,
                    }}
                  >
                    <Box position="absolute" inset={0} background={barFill} />
                  </Box>
                  <Text fontSize="2xs" color={subText} fontWeight={700}>
                    {b.label}
                  </Text>
                </VStack>
              ))}
            </HStack>
          </Box>

          {/* Recent transactions */}
          <VStack
            flex={1}
            p={3}
            spacing={1.5}
            align="stretch"
            borderRadius="xl"
            bg={innerSurface}
            border="1px solid"
            borderColor={innerBorder}
          >
            <Text
              px={1}
              fontSize="xs"
              color={subText}
              fontWeight={700}
              letterSpacing="0.08em"
              textTransform="uppercase"
            >
              Recent
            </Text>
            {recent.map((t) => {
              const isIncome = t.kind === 'income'
              return (
                <HStack
                  key={t.id}
                  spacing={3}
                  px={2}
                  py={1.5}
                  borderRadius="lg"
                  _hover={{ bg: useColorModeValue('gray.50', 'whiteAlpha.50') }}
                  transition="background 0.2s ease"
                >
                  <Box
                    p={1.5}
                    borderRadius="md"
                    bg={isIncome ? incomeBg : expenseBg}
                    color={isIncome ? incomeAccent : expenseAccent}
                  >
                    <Icon as={t.icon} boxSize={3.5} weight="duotone" />
                  </Box>
                  <Text flex={1} fontSize="xs" color={text} fontWeight={600} noOfLines={1}>
                    {t.label}
                  </Text>
                  <Text
                    fontSize="xs"
                    fontWeight={800}
                    color={isIncome ? incomeAccent : expenseAccent}
                  >
                    {isIncome ? '+' : '−'}
                    {fmt(t.amount)}
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
  innerSurface: string
  innerBorder: string
  text: string
  subText: string
  highlight?: boolean
}

function BalancePill({
  label,
  value,
  delta,
  icon,
  accent,
  bg,
  innerSurface,
  innerBorder,
  text,
  subText,
  highlight,
}: BalancePillProps) {
  return (
    <VStack
      flex={1}
      align="flex-start"
      spacing={1}
      p={3}
      borderRadius="xl"
      bg={highlight ? bg : innerSurface}
      border="1px solid"
      borderColor={highlight ? 'transparent' : innerBorder}
      position="relative"
      overflow="hidden"
    >
      <HStack spacing={1.5}>
        <Box p={1} borderRadius="md" bg={bg} color={accent}>
          <Icon as={icon} boxSize={3.5} weight="duotone" />
        </Box>
        <Text fontSize="2xs" color={subText} fontWeight={700} letterSpacing="0.08em" textTransform="uppercase">
          {label}
        </Text>
      </HStack>
      <Text fontSize={{ base: 'md', md: 'xl' }} fontWeight={800} color={text} letterSpacing="-0.02em" lineHeight={1}>
        {value}
      </Text>
      <Text fontSize="2xs" color={accent} fontWeight={700}>
        {delta}
      </Text>
    </VStack>
  )
}
