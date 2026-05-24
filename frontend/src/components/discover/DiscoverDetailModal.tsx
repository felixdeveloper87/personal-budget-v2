import {
  Box,
  Button,
  HStack,
  Progress,
  SimpleGrid,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import {
  AlertTriangle,
  BarChart3,
  Layers,
  Lightbulb,
  PieChart,
  Shield,
  TrendingUp,
  Wallet,
} from '../ui/icons'
import { ModalHeader, PremiumModal } from '../ui'
import type { ModalHeaderAccent } from '../ui/ModalHeader'
import type { DiscoverInsightsContext, DiscoverModalId } from './types'
import {
  buildCategoryBreakdown,
  competenceDate,
  getTopExpenses,
} from './utils'

interface DiscoverDetailModalProps {
  modalId: DiscoverModalId | null
  isOpen: boolean
  onClose: () => void
  context: DiscoverInsightsContext
}

function formatMoney(value: number) {
  const prefix = value < 0 ? '-£' : '£'
  return `${prefix}${Math.abs(value).toFixed(2)}`
}

function StatRow({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: string
}) {
  const labelColor = useColorModeValue('gray.500', 'gray.400')
  const valueColor = useColorModeValue('gray.900', 'gray.50')

  return (
    <HStack justify="space-between" w="full">
      <Text fontSize="sm" color={labelColor}>
        {label}
      </Text>
      <Text fontSize="sm" fontWeight={700} color={accent ?? valueColor}>
        {value}
      </Text>
    </HStack>
  )
}

function SplitBar({
  label,
  actual,
  target,
  color,
}: {
  label: string
  actual: number
  target: number
  color: string
}) {
  const muted = useColorModeValue('gray.500', 'gray.400')
  const track = useColorModeValue('gray.100', 'whiteAlpha.100')

  return (
    <VStack align="stretch" spacing={1.5} w="full">
      <HStack justify="space-between">
        <Text fontSize="sm" fontWeight={600}>
          {label}
        </Text>
        <Text fontSize="xs" color={muted}>
          You: {actual.toFixed(0)}% · Target: {target}%
        </Text>
      </HStack>
      <Box position="relative" h="8px" borderRadius="full" bg={track} overflow="hidden">
        <Box
          position="absolute"
          top={0}
          left={0}
          h="full"
          w={`${Math.min(actual, 100)}%`}
          bg={color}
          borderRadius="full"
          transition="width 0.4s ease"
        />
        <Box
          position="absolute"
          top="-2px"
          left={`${target}%`}
          w="2px"
          h="12px"
          bg={muted}
          transform="translateX(-50%)"
          borderRadius="full"
          opacity={0.7}
        />
      </Box>
    </VStack>
  )
}

function SavingsRateContent({ context }: { context: DiscoverInsightsContext }) {
  const bodyColor = useColorModeValue('gray.600', 'gray.300')
  const positive = useColorModeValue('green.500', 'green.300')
  const negative = useColorModeValue('red.500', 'red.300')
  const rateColor = context.savingsRate >= 0 ? positive : negative

  const tip =
    context.savingsRate >= 30
      ? 'Excellent — many experts suggest aiming for 20%+. You are ahead of the curve.'
      : context.savingsRate >= 20
        ? 'Solid progress. Keeping this rate consistently builds long-term wealth.'
        : context.savingsRate >= 0
          ? 'Try trimming one discretionary category this month to move toward 20%.'
          : 'Focus on reducing non-essential spending until income exceeds expenses again.'

  return (
    <VStack align="stretch" spacing={5} p={{ base: 4, md: 6 }}>
      <Text fontSize="sm" color={bodyColor} lineHeight="1.6">
        Your savings rate shows how much of your income remains after expenses in this period.
      </Text>

      <Box
        p={4}
        borderRadius="xl"
        border="1px solid"
        borderColor={useColorModeValue('blackAlpha.100', 'whiteAlpha.100')}
      >
        <VStack align="stretch" spacing={3}>
          <StatRow label="Income" value={formatMoney(context.totalIncome)} />
          <StatRow label="Expenses" value={formatMoney(context.totalExpense)} />
          <StatRow
            label="Net balance"
            value={formatMoney(context.netBalance)}
            accent={context.netBalance >= 0 ? positive : negative}
          />
          <StatRow
            label="Savings rate"
            value={`${context.savingsRate.toFixed(1)}%`}
            accent={rateColor}
          />
        </VStack>
      </Box>

      <Text fontSize="sm" color={bodyColor} lineHeight="1.6">
        {tip}
      </Text>
    </VStack>
  )
}

function BudgetSplitContent({ context }: { context: DiscoverInsightsContext }) {
  const bodyColor = useColorModeValue('gray.600', 'gray.300')
  const savingsActual = context.totalIncome > 0
    ? Math.max(0, ((context.totalIncome - context.totalExpense) / context.totalIncome) * 100)
    : 0
  const spendingActual = context.totalIncome > 0
    ? Math.min(100, (context.totalExpense / context.totalIncome) * 100)
    : 0

  return (
    <VStack align="stretch" spacing={5} p={{ base: 4, md: 6 }}>
      <Text fontSize="sm" color={bodyColor} lineHeight="1.6">
        The 50/30/20 rule splits take-home pay into needs (50%), wants (30%) and savings (20%).
        Below is how your current period compares — savings vs spending.
      </Text>

      <VStack align="stretch" spacing={4}>
        <SplitBar label="Spending" actual={spendingActual} target={80} color="#8b5cf6" />
        <SplitBar label="Savings" actual={savingsActual} target={20} color="#22c55e" />
      </VStack>

      <Text fontSize="sm" color={bodyColor} lineHeight="1.6">
        {context.totalIncome > 0
          ? `You are directing ${savingsActual.toFixed(0)}% toward savings this period. Small shifts in recurring expenses often move the needle fastest.`
          : 'Add income transactions to see how your split compares to the 50/30/20 framework.'}
      </Text>
    </VStack>
  )
}

function EmergencyFundContent({ context }: { context: DiscoverInsightsContext }) {
  const bodyColor = useColorModeValue('gray.600', 'gray.300')
  const monthlyEstimate = context.averageExpensePerDay * 30
  const monthsCovered = monthlyEstimate > 0 ? context.netBalance / monthlyEstimate : 0
  const targetMonths = 6
  const progress = Math.min(100, Math.max(0, (monthsCovered / targetMonths) * 100))

  return (
    <VStack align="stretch" spacing={5} p={{ base: 4, md: 6 }}>
      <Text fontSize="sm" color={bodyColor} lineHeight="1.6">
        An emergency fund covers unexpected costs — job changes, repairs, medical bills — without
        going into debt. A common target is 3–6 months of essential expenses.
      </Text>

      <Box
        p={4}
        borderRadius="xl"
        border="1px solid"
        borderColor={useColorModeValue('blackAlpha.100', 'whiteAlpha.100')}
      >
        <VStack align="stretch" spacing={3}>
          <StatRow
            label="Estimated monthly expenses"
            value={formatMoney(monthlyEstimate)}
          />
          <StatRow
            label="Current balance (this period)"
            value={formatMoney(context.netBalance)}
          />
          <StatRow
            label="Months covered"
            value={monthlyEstimate > 0 ? `${Math.max(0, monthsCovered).toFixed(1)} months` : '—'}
          />
          <StatRow label="Target" value={`${targetMonths} months`} />
        </VStack>
      </Box>

      <VStack align="stretch" spacing={2}>
        <HStack justify="space-between">
          <Text fontSize="sm" fontWeight={600}>
            Progress toward 6-month buffer
          </Text>
          <Text fontSize="xs" color={bodyColor}>
            {progress.toFixed(0)}%
          </Text>
        </HStack>
        <Progress
          value={progress}
          size="sm"
          borderRadius="full"
          colorScheme={progress >= 100 ? 'green' : 'orange'}
        />
      </VStack>

      <Text fontSize="sm" color={bodyColor} lineHeight="1.6">
        {monthsCovered >= targetMonths
          ? 'You may already have a healthy buffer. Keep it in an easy-to-access account separate from daily spending.'
          : 'Start small — even one month of coverage reduces stress. Automate a fixed transfer each payday.'}
      </Text>
    </VStack>
  )
}

function CompoundInterestContent({ context }: { context: DiscoverInsightsContext }) {
  const bodyColor = useColorModeValue('gray.600', 'gray.300')
  const highlight = useColorModeValue('blue.600', 'blue.300')

  const monthlySaving = context.totalIncome > 0
    ? Math.max(50, (context.totalIncome - context.totalExpense) / 12)
    : 100
  const annualRate = 0.05
  const years = [5, 10, 20]

  const projections = years.map((year) => {
    const months = year * 12
    const monthlyRate = annualRate / 12
    const futureValue =
      monthlyRate === 0
        ? monthlySaving * months
        : monthlySaving * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
    return { year, futureValue }
  })

  return (
    <VStack align="stretch" spacing={5} p={{ base: 4, md: 6 }}>
      <Text fontSize="sm" color={bodyColor} lineHeight="1.6">
        Compound interest means you earn returns on your returns. Consistency matters more than
        timing the market — even modest monthly amounts grow significantly over time.
      </Text>

      <Box
        p={4}
        borderRadius="xl"
        border="1px solid"
        borderColor={useColorModeValue('blackAlpha.100', 'whiteAlpha.100')}
      >
        <Text fontSize="sm" color={bodyColor} mb={3}>
          If you saved{' '}
          <Text as="span" fontWeight={700} color={highlight}>
            {formatMoney(monthlySaving)}
          </Text>{' '}
          per month at 5% annual return:
        </Text>

        <SimpleGrid columns={3} spacing={3}>
          {projections.map(({ year, futureValue }) => (
            <VStack
              key={year}
              spacing={0.5}
              p={3}
              borderRadius="lg"
              bg={useColorModeValue('gray.50', 'whiteAlpha.50')}
            >
              <Text fontSize="2xs" color={bodyColor} fontWeight={600}>
                {year} yrs
              </Text>
              <Text fontSize="sm" fontWeight={700}>
                {formatMoney(futureValue)}
              </Text>
            </VStack>
          ))}
        </SimpleGrid>
      </Box>

      <Text fontSize="sm" color={bodyColor} lineHeight="1.6">
        {context.totalIncome > 0
          ? 'Projection uses your current savings pace as a starting point. Increase the monthly amount as your income grows.'
          : 'Add transactions to personalise the monthly amount, or start with any figure you can sustain.'}
      </Text>
    </VStack>
  )
}

function SpendingAlertContent({ context }: { context: DiscoverInsightsContext }) {
  const bodyColor = useColorModeValue('gray.600', 'gray.300')
  const negative = useColorModeValue('red.500', 'red.300')
  const borderColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const rowBg = useColorModeValue('gray.50', 'whiteAlpha.50')
  const overspend = Math.abs(context.netBalance)
  const topExpenses = getTopExpenses(context.transactions)

  return (
    <VStack align="stretch" spacing={5} p={{ base: 4, md: 6 }}>
      <Text fontSize="sm" color={bodyColor} lineHeight="1.6">
        Your expenses are higher than your income this period. Here is a quick snapshot to help
        you spot where the gap comes from.
      </Text>

      <Box p={4} borderRadius="xl" border="1px solid" borderColor={borderColor}>
        <VStack align="stretch" spacing={3}>
          <StatRow label="Income" value={formatMoney(context.totalIncome)} />
          <StatRow label="Expenses" value={formatMoney(context.totalExpense)} />
          <StatRow
            label="Gap to close"
            value={formatMoney(overspend)}
            accent={negative}
          />
        </VStack>
      </Box>

      {topExpenses.length > 0 && (
        <VStack align="stretch" spacing={2}>
          <Text fontSize="sm" fontWeight={600}>
            Largest expenses this period
          </Text>
          {topExpenses.map((tx) => (
            <HStack
              key={tx.id ?? `${tx.description}-${tx.dateTime}`}
              justify="space-between"
              p={3}
              borderRadius="lg"
              bg={rowBg}
            >
              <VStack align="flex-start" spacing={0} minW={0} flex={1}>
                <Text fontSize="sm" fontWeight={600} noOfLines={1}>
                  {tx.description || tx.category}
                </Text>
                <Text fontSize="xs" color={bodyColor} noOfLines={1}>
                  {tx.category} ·{' '}
                  {competenceDate(tx).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </Text>
              </VStack>
              <Text fontSize="sm" fontWeight={700} color={negative} flexShrink={0}>
                {formatMoney(tx.amount)}
              </Text>
            </HStack>
          ))}
        </VStack>
      )}

      <Text fontSize="sm" color={bodyColor} lineHeight="1.6">
        Start by reviewing recurring bills and discretionary categories above. Pausing one
        non-essential expense often closes a small gap quickly.
      </Text>
    </VStack>
  )
}

function CategoryBreakdownContent({ context }: { context: DiscoverInsightsContext }) {
  const bodyColor = useColorModeValue('gray.600', 'gray.300')
  const borderColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const rowBg = useColorModeValue('gray.50', 'whiteAlpha.50')
  const highlight = useColorModeValue('purple.600', 'purple.300')
  const barColor = useColorModeValue('purple.300', 'purple.400')
  const breakdown = buildCategoryBreakdown(context.transactions)
  const top = breakdown[0]

  return (
    <VStack align="stretch" spacing={5} p={{ base: 4, md: 6 }}>
      <Text fontSize="sm" color={bodyColor} lineHeight="1.6">
        {top
          ? `${top.name} leads your spending with ${formatMoney(top.total)} (${top.percentage.toFixed(0)}% of expenses).`
          : 'Add expense transactions to see how your spending splits across categories.'}
      </Text>

      {breakdown.length > 0 && (
        <Box p={4} borderRadius="xl" border="1px solid" borderColor={borderColor}>
          <VStack align="stretch" spacing={3}>
            {breakdown.slice(0, 6).map((row, index) => (
              <VStack key={row.name} align="stretch" spacing={1.5}>
                <HStack justify="space-between">
                  <Text
                    fontSize="sm"
                    fontWeight={index === 0 ? 700 : 600}
                    color={index === 0 ? highlight : undefined}
                  >
                    {row.name}
                  </Text>
                  <Text fontSize="xs" color={bodyColor}>
                    {row.count} tx · {row.percentage.toFixed(0)}%
                  </Text>
                </HStack>
                <Box
                  h="6px"
                  borderRadius="full"
                  bg={rowBg}
                  overflow="hidden"
                >
                  <Box
                    h="full"
                    w={`${row.percentage}%`}
                    bg={index === 0 ? highlight : barColor}
                    borderRadius="full"
                  />
                </Box>
                <Text fontSize="xs" color={bodyColor} alignSelf="flex-end">
                  {formatMoney(row.total)}
                </Text>
              </VStack>
            ))}
          </VStack>
        </Box>
      )}

      <Text fontSize="sm" color={bodyColor} lineHeight="1.6">
        Categories that keep showing up at the top are usually the best place to look for savings
        — even a 10% trim can free up meaningful room in your budget.
      </Text>
    </VStack>
  )
}

function GettingStartedContent({ context }: { context: DiscoverInsightsContext }) {
  const bodyColor = useColorModeValue('gray.600', 'gray.300')
  const borderColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const stepBg = useColorModeValue('gray.50', 'whiteAlpha.50')
  const incomeCount = context.transactions.filter((tx) => tx.type === 'INCOME').length
  const expenseCount = context.transactions.filter((tx) => tx.type === 'EXPENSE').length

  const steps = [
    {
      title: 'Log your income',
      detail: 'Salary, freelance payments, refunds — anything that adds to your balance.',
      done: incomeCount > 0,
    },
    {
      title: 'Track daily expenses',
      detail: 'Groceries, transport, subscriptions. A week of entries is enough to see patterns.',
      done: expenseCount >= 3,
    },
    {
      title: 'Review your snapshot',
      detail: 'Once you have a handful of entries, tips here become personalised to your habits.',
      done: context.totalTransactions >= 5,
    },
  ]

  return (
    <VStack align="stretch" spacing={5} p={{ base: 4, md: 6 }}>
      <Text fontSize="sm" color={bodyColor} lineHeight="1.6">
        You have {context.totalTransactions} transaction
        {context.totalTransactions === 1 ? '' : 's'} so far. A few more entries unlock richer
        insights across this section.
      </Text>

      <Box p={4} borderRadius="xl" border="1px solid" borderColor={borderColor}>
        <VStack align="stretch" spacing={3}>
          {steps.map((step, index) => (
            <HStack
              key={step.title}
              align="flex-start"
              spacing={3}
              p={3}
              borderRadius="lg"
              bg={stepBg}
            >
              <Box
                w={6}
                h={6}
                borderRadius="full"
                bg={step.done ? 'green.500' : 'blackAlpha.100'}
                color={step.done ? 'white' : bodyColor}
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontSize="xs"
                fontWeight={700}
                flexShrink={0}
              >
                {step.done ? '✓' : index + 1}
              </Box>
              <VStack align="flex-start" spacing={0.5}>
                <Text fontSize="sm" fontWeight={600}>
                  {step.title}
                </Text>
                <Text fontSize="xs" color={bodyColor} lineHeight="1.5">
                  {step.detail}
                </Text>
              </VStack>
            </HStack>
          ))}
        </VStack>
      </Box>

      <Text fontSize="sm" color={bodyColor} lineHeight="1.6">
        Use the Add transaction panel above to get started — income and expenses can be logged in
        under a minute each.
      </Text>
    </VStack>
  )
}

function CategoryGuideContent({ context }: { context: DiscoverInsightsContext }) {
  const bodyColor = useColorModeValue('gray.600', 'gray.300')
  const borderColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const rowBg = useColorModeValue('gray.50', 'whiteAlpha.50')
  const breakdown = buildCategoryBreakdown(context.transactions)

  return (
    <VStack align="stretch" spacing={5} p={{ base: 4, md: 6 }}>
      <Text fontSize="sm" color={bodyColor} lineHeight="1.6">
        Categories turn a list of transactions into a clear picture of where money goes. Group
        similar expenses together and patterns become obvious within a week.
      </Text>

      <Box p={4} borderRadius="xl" border="1px solid" borderColor={borderColor}>
        <Text fontSize="sm" fontWeight={600} mb={3}>
          Good categories to start with
        </Text>
        <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={2}>
          {['Housing', 'Food', 'Transport', 'Subscriptions', 'Health', 'Fun'].map((name) => (
            <HStack key={name} p={2.5} borderRadius="lg" bg={rowBg}>
              <Text fontSize="sm">{name}</Text>
            </HStack>
          ))}
        </SimpleGrid>
      </Box>

      {breakdown.length > 0 ? (
        <VStack align="stretch" spacing={2}>
          <Text fontSize="sm" fontWeight={600}>
            Your categories so far
          </Text>
          {breakdown.slice(0, 5).map((row) => (
            <HStack key={row.name} justify="space-between" p={3} borderRadius="lg" bg={rowBg}>
              <Text fontSize="sm" fontWeight={600}>
                {row.name}
              </Text>
              <Text fontSize="xs" color={bodyColor}>
                {row.count} tx · {formatMoney(row.total)}
              </Text>
            </HStack>
          ))}
        </VStack>
      ) : (
        <Text fontSize="sm" color={bodyColor} lineHeight="1.6">
          As you add expenses, your categories will appear here automatically — no extra setup
          required.
        </Text>
      )}

      <Text fontSize="sm" color={bodyColor} lineHeight="1.6">
        Keep names short and consistent. &quot;Food&quot; and &quot;Groceries&quot; as separate
        labels split the same habit — pick one and stick with it.
      </Text>
    </VStack>
  )
}

const MODAL_META: Record<
  DiscoverModalId,
  { title: string; caption: string; icon: typeof TrendingUp; accent: ModalHeaderAccent }
> = {
  'savings-rate': {
    title: 'Your savings rate',
    caption: 'Income vs expenses this period',
    icon: TrendingUp,
    accent: 'green',
  },
  'budget-split': {
    title: 'Budget split',
    caption: 'Compare your habits to 50/30/20',
    icon: Layers,
    accent: 'violet',
  },
  'emergency-fund': {
    title: 'Safety buffer',
    caption: 'Emergency fund coverage',
    icon: Shield,
    accent: 'blue',
  },
  'compound-interest': {
    title: 'The magic of time',
    caption: 'Compound growth simulation',
    icon: BarChart3,
    accent: 'blue',
  },
  'spending-alert': {
    title: 'Spending exceeds income',
    caption: 'Where the gap comes from',
    icon: AlertTriangle,
    accent: 'red',
  },
  'category-breakdown': {
    title: 'Category breakdown',
    caption: 'Where your money goes',
    icon: PieChart,
    accent: 'violet',
  },
  'getting-started': {
    title: 'Build your picture',
    caption: 'Three quick steps to richer insights',
    icon: Wallet,
    accent: 'blue',
  },
  'category-guide': {
    title: 'Organise by category',
    caption: 'Turn transactions into clarity',
    icon: Lightbulb,
    accent: 'violet',
  },
}

function ModalBody({
  modalId,
  context,
}: {
  modalId: DiscoverModalId
  context: DiscoverInsightsContext
}) {
  switch (modalId) {
    case 'savings-rate':
      return <SavingsRateContent context={context} />
    case 'budget-split':
      return <BudgetSplitContent context={context} />
    case 'emergency-fund':
      return <EmergencyFundContent context={context} />
    case 'compound-interest':
      return <CompoundInterestContent context={context} />
    case 'spending-alert':
      return <SpendingAlertContent context={context} />
    case 'category-breakdown':
      return <CategoryBreakdownContent context={context} />
    case 'getting-started':
      return <GettingStartedContent context={context} />
    case 'category-guide':
      return <CategoryGuideContent context={context} />
  }
}

export default function DiscoverDetailModal({
  modalId,
  isOpen,
  onClose,
  context,
}: DiscoverDetailModalProps) {
  if (!modalId) return null

  const meta = MODAL_META[modalId]

  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', md: 'lg' }}
      header={
        <ModalHeader
          icon={meta.icon}
          title={meta.title}
          caption={meta.caption}
          onClose={onClose}
          accent={meta.accent}
        />
      }
      footer={
        <Button w="full" onClick={onClose} size="md" borderRadius="xl">
          Got it
        </Button>
      }
    >
      <ModalBody modalId={modalId} context={context} />
    </PremiumModal>
  )
}
