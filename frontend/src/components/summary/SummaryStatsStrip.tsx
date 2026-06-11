import {
  Flex,
  HStack,
  Icon,
  SimpleGrid,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import {
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Wallet,
} from '../ui/icons'
import type { LucideIcon } from '../ui/icons'

interface Metric {
  id: string
  label: string
  value: string
  icon: LucideIcon
  accent: string
}

interface SummaryStatsStripProps {
  txCount: number
  income: number
  expense: number
  balance: number
  onCardClick: (id: string) => void
}

const currencyFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  maximumFractionDigits: 0,
})

function fmt(value: number) {
  return currencyFormatter.format(value)
}

/**
 * Compact KPI strip for the Home overview. One row of four on desktop,
 * a 2x2 grid on mobile — labels stay visible at every size. Each cell is
 * a CTA that navigates to the matching page.
 */
export default function SummaryStatsStrip({
  txCount,
  income,
  expense,
  balance,
  onCardClick,
}: SummaryStatsStripProps) {
  const borderColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const dividerColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const labelColor = useColorModeValue('gray.500', 'gray.400')
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.50')

  const txColor = useColorModeValue('blue.600', 'blue.300')
  const incomeColor = useColorModeValue('green.600', 'green.300')
  const expenseColor = useColorModeValue('red.500', 'red.300')
  const balancePositiveColor = useColorModeValue('blue.600', 'blue.300')
  const balanceNegativeColor = useColorModeValue('red.500', 'red.300')
  const balanceColor = balance >= 0 ? balancePositiveColor : balanceNegativeColor

  const metrics: Metric[] = [
    {
      id: 'income',
      label: 'Income',
      value: fmt(income),
      icon: ArrowUpRight,
      accent: incomeColor,
    },
    {
      id: 'expenses',
      label: 'Expenses',
      value: fmt(expense),
      icon: ArrowDownRight,
      accent: expenseColor,
    },
    {
      id: 'balance',
      label: 'Net',
      value: `${balance >= 0 ? '+' : ''}${fmt(balance)}`,
      icon: Wallet,
      accent: balanceColor,
    },
    {
      id: 'transactions',
      label: 'Transactions',
      value: `${txCount}`,
      icon: BarChart3,
      accent: txColor,
    },
  ]

  return (
    <SimpleGrid
      columns={{ base: 2, md: 4 }}
      spacing={0}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="xl"
      overflow="hidden"
    >
      {metrics.map((metric, index) => (
        <Flex
          key={metric.id}
          direction="column"
          gap={1}
          px={{ base: 3, md: 4 }}
          py={{ base: 2.5, md: 3 }}
          borderStyle="solid"
          borderColor={dividerColor}
          borderLeftWidth={{
            base: index % 2 === 1 ? '1px' : '0px',
            md: index > 0 ? '1px' : '0px',
          }}
          borderTopWidth={{ base: index >= 2 ? '1px' : '0px', md: '0px' }}
          cursor="pointer"
          role="button"
          tabIndex={0}
          onClick={() => onCardClick(metric.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onCardClick(metric.id)
            }
          }}
          _hover={{ bg: hoverBg }}
          _focusVisible={{
            outline: '2px solid',
            outlineColor: metric.accent,
            outlineOffset: '-2px',
          }}
          transition="background 0.15s ease"
          minW={0}
        >
          <HStack spacing={1.5} minW={0}>
            <Icon as={metric.icon} boxSize={3} color={metric.accent} weight="bold" flexShrink={0} />
            <Text
              fontSize="2xs"
              fontWeight={700}
              color={labelColor}
              textTransform="uppercase"
              letterSpacing="0.07em"
              noOfLines={1}
            >
              {metric.label}
            </Text>
          </HStack>
          <Text
            fontSize={{ base: 'md', md: 'lg' }}
            fontWeight={800}
            color={metric.accent}
            letterSpacing="-0.01em"
            noOfLines={1}
            sx={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {metric.value}
          </Text>
        </Flex>
      ))}
    </SimpleGrid>
  )
}
