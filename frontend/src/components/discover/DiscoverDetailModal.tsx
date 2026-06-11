import type { ReactNode } from 'react'
import {
  Box,
  Button,
  HStack,
  Icon,
  SimpleGrid,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import {
  AlertTriangle,
  CalendarClock,
  Check,
  PieChart,
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

const moneyFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
})

function formatMoney(value: number) {
  return moneyFormatter.format(value)
}

function Surface({ children }: { children: ReactNode }) {
  const bg = useColorModeValue('gray.50', 'whiteAlpha.50')
  const border = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  return (
    <Box p={4} borderRadius="xl" border="1px solid" borderColor={border} bg={bg}>
      {children}
    </Box>
  )
}

function Metric({
  label,
  value,
  tone = 'neutral',
}: {
  label: string
  value: string
  tone?: 'neutral' | 'positive' | 'negative' | 'warning'
}) {
  const labelColor = useColorModeValue('gray.500', 'gray.400')
  const neutral = useColorModeValue('gray.900', 'gray.50')
  const positive = useColorModeValue('green.600', 'green.300')
  const negative = useColorModeValue('red.600', 'red.300')
  const warning = useColorModeValue('orange.600', 'orange.300')
  const valueColor = {
    neutral,
    positive,
    negative,
    warning,
  }[tone]

  return (
    <Surface>
      <Text fontSize="xs" color={labelColor} fontWeight={700} textTransform="uppercase">
        {label}
      </Text>
      <Text mt={1} fontSize="xl" fontWeight={800} color={valueColor}>
        {value}
      </Text>
    </Surface>
  )
}

function SavingsRateContent({ context }: { context: DiscoverInsightsContext }) {
  return (
    <VStack align="stretch" spacing={4} p={{ base: 4, md: 6 }}>
      <Metric
        label="Savings rate"
        value={`${context.savingsRate.toFixed(1)}%`}
        tone={context.savingsRate >= 20 ? 'positive' : context.savingsRate < 0 ? 'negative' : 'neutral'}
      />
      <SimpleGrid columns={2} spacing={3}>
        <Metric label="Income" value={formatMoney(context.totalIncome)} tone="positive" />
        <Metric label="Expenses" value={formatMoney(context.totalExpense)} tone="negative" />
      </SimpleGrid>
      <Surface>
        <Text fontSize="sm" lineHeight="1.6">
          {context.savingsRate >= 20
            ? 'You are retaining at least 20% of income this period.'
            : 'Reducing one recurring or discretionary expense can improve this rate next period.'}
        </Text>
      </Surface>
    </VStack>
  )
}

function SpendingAlertContent({ context }: { context: DiscoverInsightsContext }) {
  const muted = useColorModeValue('gray.500', 'gray.400')
  const negative = useColorModeValue('red.600', 'red.300')
  const expenses = getTopExpenses(context.transactions)

  return (
    <VStack align="stretch" spacing={4} p={{ base: 4, md: 6 }}>
      <Metric label="Gap to close" value={formatMoney(Math.abs(context.netBalance))} tone="negative" />
      <Surface>
        <VStack align="stretch" spacing={3}>
          {expenses.map((tx) => (
            <HStack key={tx.id ?? `${tx.description}-${tx.dateTime}`} justify="space-between">
              <VStack align="flex-start" spacing={0} minW={0}>
                <Text fontSize="sm" fontWeight={700} noOfLines={1}>
                  {tx.description || tx.category}
                </Text>
                <Text fontSize="xs" color={muted}>
                  {tx.category}
                </Text>
              </VStack>
              <Text fontSize="sm" fontWeight={700} color={negative}>
                {formatMoney(tx.amount)}
              </Text>
            </HStack>
          ))}
        </VStack>
      </Surface>
    </VStack>
  )
}

function CategoryBreakdownContent({ context }: { context: DiscoverInsightsContext }) {
  const muted = useColorModeValue('gray.500', 'gray.400')
  const rows = buildCategoryBreakdown(context.transactions)

  return (
    <VStack align="stretch" spacing={4} p={{ base: 4, md: 6 }}>
      <Metric
        label="Top category"
        value={rows[0]?.name ?? 'No expense data'}
        tone="negative"
      />
      <Surface>
        <VStack align="stretch" spacing={3}>
          {rows.slice(0, 6).map((row) => (
            <HStack key={row.name} justify="space-between">
              <Text fontSize="sm" fontWeight={700}>
                {row.name}
              </Text>
              <Text fontSize="sm" color={muted}>
                {formatMoney(row.total)} / {row.percentage.toFixed(0)}%
              </Text>
            </HStack>
          ))}
        </VStack>
      </Surface>
    </VStack>
  )
}

function GettingStartedContent({ context }: { context: DiscoverInsightsContext }) {
  const muted = useColorModeValue('gray.500', 'gray.400')
  const steps = [
    { label: 'Add an income transaction', done: context.transactions.some((tx) => tx.type === 'INCOME') },
    { label: 'Add three expenses', done: context.transactions.filter((tx) => tx.type === 'EXPENSE').length >= 3 },
    { label: 'Reach five transactions', done: context.totalTransactions >= 5 },
  ]

  return (
    <VStack align="stretch" spacing={4} p={{ base: 4, md: 6 }}>
      <Metric label="Transactions logged" value={`${context.totalTransactions}/5`} />
      <Surface>
        <VStack align="stretch" spacing={3}>
          {steps.map((step, index) => (
            <HStack key={step.label}>
              <Box
                w={6}
                h={6}
                borderRadius="full"
                bg={step.done ? 'green.500' : 'blackAlpha.100'}
                color={step.done ? 'white' : muted}
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontSize="xs"
                fontWeight={700}
              >
                {step.done ? <Icon as={Check} boxSize={3.5} /> : index + 1}
              </Box>
              <Text fontSize="sm" fontWeight={600}>
                {step.label}
              </Text>
            </HStack>
          ))}
        </VStack>
      </Surface>
    </VStack>
  )
}

function UpcomingPaymentsContent({ context }: { context: DiscoverInsightsContext }) {
  const muted = useColorModeValue('gray.500', 'gray.400')
  const warning = useColorModeValue('orange.600', 'orange.300')
  const payments = context.upcomingPayments ?? []
  const total = payments.reduce((sum, tx) => sum + tx.amount, 0)

  return (
    <VStack align="stretch" spacing={4} p={{ base: 4, md: 6 }}>
      <Metric label="Due in the next 7 days" value={formatMoney(total)} tone="warning" />
      <Surface>
        <VStack align="stretch" spacing={3}>
          {payments.map((tx) => (
            <HStack key={tx.id ?? `${tx.description}-${tx.paymentDate}`} justify="space-between">
              <VStack align="flex-start" spacing={0} minW={0}>
                <Text fontSize="sm" fontWeight={700} noOfLines={1}>
                  {tx.description || tx.category}
                </Text>
                <Text fontSize="xs" color={muted}>
                  {tx.category} / {competenceDate(tx).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </Text>
              </VStack>
              <Text fontSize="sm" fontWeight={700} color={warning}>
                {formatMoney(tx.amount)}
              </Text>
            </HStack>
          ))}
        </VStack>
      </Surface>
    </VStack>
  )
}

function PeriodComparisonContent({ context }: { context: DiscoverInsightsContext }) {
  const previous = context.previousPeriod
  const muted = useColorModeValue('gray.500', 'gray.400')
  const positive = useColorModeValue('green.600', 'green.300')
  const negative = useColorModeValue('red.600', 'red.300')
  const currentRows = buildCategoryBreakdown(context.transactions)
  const previousRows = new Map(
    buildCategoryBreakdown(previous?.transactions ?? []).map((row) => [row.name, row.total]),
  )
  const rows = currentRows
    .map((row) => ({
      ...row,
      previous: previousRows.get(row.name) ?? 0,
      change: row.total - (previousRows.get(row.name) ?? 0),
    }))
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
    .slice(0, 6)
  const expenseChange = previous && previous.expense > 0
    ? ((context.totalExpense - previous.expense) / previous.expense) * 100
    : 0

  return (
    <VStack align="stretch" spacing={4} p={{ base: 4, md: 6 }}>
      <SimpleGrid columns={2} spacing={3}>
        <Metric label="Current" value={formatMoney(context.totalExpense)} tone="negative" />
        <Metric label={previous?.label ?? 'Previous'} value={formatMoney(previous?.expense ?? 0)} />
      </SimpleGrid>
      <Surface>
        <Text mb={3} fontSize="sm" fontWeight={700}>
          Category changes
        </Text>
        <VStack align="stretch" spacing={3}>
          {rows.map((row) => (
            <HStack key={row.name} justify="space-between">
              <VStack align="flex-start" spacing={0}>
                <Text fontSize="sm" fontWeight={700}>
                  {row.name}
                </Text>
                <Text fontSize="xs" color={muted}>
                  {formatMoney(row.previous)} to {formatMoney(row.total)}
                </Text>
              </VStack>
              <Text
                fontSize="sm"
                fontWeight={700}
                color={row.change > 0 ? negative : row.change < 0 ? positive : muted}
              >
                {row.change >= 0 ? '+' : ''}{formatMoney(row.change)}
              </Text>
            </HStack>
          ))}
        </VStack>
      </Surface>
      <Text fontSize="sm" color={expenseChange > 0 ? negative : positive} fontWeight={700}>
        Spending is {Math.abs(expenseChange).toFixed(0)}% {expenseChange > 0 ? 'higher' : 'lower'} than {previous?.label ?? 'the previous period'}.
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
    accent: 'neutral',
  },
  'getting-started': {
    title: 'Build your picture',
    caption: 'Unlock personalised insights',
    icon: Wallet,
    accent: 'neutral',
  },
  'upcoming-payments': {
    title: 'Upcoming payments',
    caption: 'Due in the next 7 days',
    icon: CalendarClock,
    accent: 'neutral',
  },
  'mom-comparison': {
    title: 'Period comparison',
    caption: 'Current spending vs the previous period',
    icon: TrendingUp,
    accent: 'neutral',
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
    case 'spending-alert':
      return <SpendingAlertContent context={context} />
    case 'category-breakdown':
      return <CategoryBreakdownContent context={context} />
    case 'getting-started':
      return <GettingStartedContent context={context} />
    case 'upcoming-payments':
      return <UpcomingPaymentsContent context={context} />
    case 'mom-comparison':
      return <PeriodComparisonContent context={context} />
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
        <Button w="full" onClick={onClose} size="md" borderRadius="xl" colorScheme="gray">
          Got it
        </Button>
      }
    >
      <ModalBody modalId={modalId} context={context} />
    </PremiumModal>
  )
}
